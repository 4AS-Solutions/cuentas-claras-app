import { clsx } from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className
}: Props) {

  return (
    <div
      className={clsx(
        "max-w-5xl mx-auto px-6 py-8",
        className
      )}
    >
      {children}
    </div>
  );
}