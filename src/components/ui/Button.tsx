import { clsx } from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  mobileIconOnly?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  mobileIconOnly = false,
  children,
  className,
  ...props
}: Props) {

  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none";

  const variants = {
    primary: "bg-brand-gradient text-white hover:opacity-90 shadow",
    secondary: "bg-white border hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-5 py-3 text-lg"
  };

  return (
    <button
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        mobileIconOnly && icon && "px-3 sm:px-4",
        className
      )}
      {...props}
    >

      {icon}

      {mobileIconOnly && icon ? (
        <span className="hidden sm:inline">
          {children}
        </span>
      ) : (
        children
      )}

    </button>
  );
}