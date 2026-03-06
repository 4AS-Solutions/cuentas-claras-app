import { clsx } from "clsx";
import { SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export default function Select({
  label,
  className,
  children,
  ...props
}: Props) {

  return (
    <div>

      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <select
        className={clsx(
          "mt-2 w-full border rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald",
          className
        )}
        {...props}
      >
        {children}
      </select>

    </div>
  );
}