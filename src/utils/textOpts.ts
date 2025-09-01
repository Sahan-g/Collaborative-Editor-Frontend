export function getOperations(oldStr: string, newStr: string, version: number) {
    if (oldStr === newStr) {
        return [];
    }

    const ops: any[] = [];

    let start = 0;
    while (start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start]) {
        start++;
    }

    let oldEnd = oldStr.length;
    let newEnd = newStr.length;
    while (oldEnd > start && newEnd > start && oldStr[oldEnd - 1] === newStr[newEnd - 1]) {
        oldEnd--;
        newEnd--;
    }

    if (oldEnd > start) {
        ops.push({
            type: 'delete',
            pos: start,
            len: oldEnd - start,
            version: version,
        });
    }

    if (newEnd > start) {
        ops.push({
            type: 'insert',
            pos: start,
            text: newStr.substring(start, newEnd),
            version: version,
        });
    }

    return ops;
}