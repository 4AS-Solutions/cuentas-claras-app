import { clsx } from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-sm border border-gray-100 p-6",
        className
      )}
    >
      {children}
    </div>
  );
}