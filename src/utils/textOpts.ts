export type DiffResult =
  | { kind: "insert"; pos: number; text: string }
  | { kind: "delete"; pos: number; len: number }
  | { kind: "noop" };

export function diffStrings(oldStr: string, newStr: string): DiffResult {
  if (oldStr === newStr) return { kind: "noop" };

  let start = 0;
  while (start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start]) {
    start++;
  }

  let endOld = oldStr.length - 1;
  let endNew = newStr.length - 1;
  while (endOld >= start && endNew >= start && oldStr[endOld] === newStr[endNew]) {
    endOld--;
    endNew--;
  }

  const removed = endOld - start + 1;         // chars removed from old
  const inserted = endNew - start + 1;        // chars inserted in new

  if (inserted > 0 && removed === 0) {
    // pure insert
    return { kind: "insert", pos: start, text: newStr.slice(start, start + inserted) };
  }
  if (removed > 0 && inserted === 0) {
    // pure delete
    return { kind: "delete", pos: start, len: removed };
  }

  // Replace = delete then insert (send as two ops, simplest)
  // You can optimize to one delete+insert pair handled by caller.
  return { kind: "noop" };
}

export function applyServerInsert(s: string, pos: number, text: string) {
  return s.slice(0, pos) + text + s.slice(pos);
}
export function applyServerDelete(s: string, pos: number, len: number) {
  return s.slice(0, pos) + s.slice(pos + len);
}

// Keep caret stable during remote ops
export function transformCaret(caret: number, op: { type: "insert" | "delete"; pos: number; text?: string; len?: number }) {
  if (op.type === "insert") {
    const L = (op.text || "").length;
    if (op.pos <= caret) return caret + L;
    return caret;
  } else {
    const L = op.len || 0;
    if (op.pos < caret) return Math.max(op.pos, caret - L);
    return caret;
  }
}
