import { clsx } from "clsx";
import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({
  label,
  className,
  ...props
}: Props) {

  return (
    <div>

      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        className={clsx(
          "mt-2 w-full border rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-emerald",
          className
        )}
        {...props}
      />

    </div>
  );
}