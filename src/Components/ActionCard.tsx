import clsx from "clsx";
import type { SvgIconComponent } from "@mui/icons-material";

type Variant = "default" | "gradient";

const BORDER_MAP = {
  "gray-300": "border-gray-300",
  "indigo-300": "border-indigo-300",
  "purple-300": "border-purple-300",
  "emerald-300": "border-emerald-300",
  "none": "border-transparent",
} as const;

type BorderColor = keyof typeof BORDER_MAP;

export interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: SvgIconComponent;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;

  /** Visual style of the card */
  variant?: Variant;

  /** Only relevant for variant="default" */
  borderColor?: BorderColor;

  /** Optional overrides */
  titleClassName?: string;
  subtitleClassName?: string;
  iconWrapperClassName?: string;
}

export default function ActionCard({
  title,
  subtitle,
  icon: Icon,
  onClick,
  disabled = false,
  className,
  variant = "default",
  borderColor = "gray-300",
  titleClassName,
  subtitleClassName,
  iconWrapperClassName,
}: ActionCardProps) {
  const base = clsx(
    "w-full h-full min-h-[84px]",
    "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  );

  const variantClasses =
    variant === "gradient"
      ? clsx(
          "bg-gradient-to-br from-purple-500 to-cyan-500",
          "border-transparent text-white shadow-lg hover:shadow-xl"
        )
      : clsx(
          "bg-white",
          BORDER_MAP[borderColor],
          "text-slate-900 hover:shadow-md"
        );

  const containerClass = clsx(base, variantClasses, className);

  const iconWrapClass = clsx(
    "p-4 rounded-full",
    variant === "gradient"
      ? "bg-white/20 text-white"
      : "bg-purple-100 text-purple-600",
    iconWrapperClassName
  );

  const titleClass = clsx(
    "font-semibold",
    variant === "gradient" ? "text-white" : "text-slate-900",
    titleClassName
  );

  const subtitleClass = clsx(
    "text-sm",
    variant === "gradient" ? "text-white/80" : "text-slate-500",
    subtitleClassName
  );

  return (
    <button
      type="button"
      className={containerClass}
      onClick={disabled ? undefined : onClick}
      aria-label={title}
      disabled={disabled}
    >
      <div className={iconWrapClass}>
        <Icon fontSize="medium" aria-hidden />
      </div>
      <div className="text-left">
        <h3 className={titleClass}>{title}</h3>
        <p className={subtitleClass}>{subtitle}</p>
      </div>
    </button>
  );
}
