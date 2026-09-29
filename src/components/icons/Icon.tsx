import { ICONS, iconClassName, type IconName, type IconShape, type IconSize } from "./icons.ts";

interface IconProps {
  readonly name: IconName;
  readonly size?: IconSize;
  readonly className?: string;
}

export function Icon({ name, size = "md", className }: IconProps) {
  const shape: IconShape = ICONS[name];
  return (
    <svg
      className={iconClassName(name, size, className)}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      {shape.circles?.map((circle) => (
        <circle
          key={`${String(circle.cx)}-${String(circle.cy)}`}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
        />
      ))}
      {shape.paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
