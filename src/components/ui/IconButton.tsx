import { clsx } from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

export default function IconButton({
  icon,
  className,
  ...props
}: Props) {

  return (
    <button
      className={clsx(
        "p-3 rounded-xl flex items-center justify-center hover:bg-gray-100 transition",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}