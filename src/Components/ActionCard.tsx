import clsx from "clsx";
import type { SvgIconComponent } from "@mui/icons-material";

const BORDER_MAP = {
  "gray-300": "border-gray-300",
  "indigo-300": "border-indigo-300",
  "purple-300": "border-purple-300",
  "emerald-300": "border-emerald-300",
} as const;

type BorderColor = keyof typeof BORDER_MAP;

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: SvgIconComponent;
  borderColor?: BorderColor;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ActionCard({
  title,
  subtitle,
  icon: Icon,
  borderColor = "gray-300",
  onClick,
  disabled = false,
}: ActionCardProps) {
  const containerClass = clsx(
    "flex items-center gap-4 p-4 rounded-lg border bg-white transition-all",
    "w-full sm:w-72 md:w-80",
    "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    BORDER_MAP[borderColor] // <-- safe, no dynamic class strings
  );

  return (
    <button
      type="button"
      className={containerClass}
      onClick={disabled ? undefined : onClick}
      aria-label={title}
      disabled={disabled}
    >
      <div className="text-purple-600 bg-purple-100 p-4 rounded-full">
        <Icon fontSize="medium" aria-hidden />
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </button>
  );
}
