import { clsx } from "clsx";
import { TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export default function Textarea({
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

      <textarea
        className={clsx(
          "mt-2 w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-emerald",
          className
        )}
        {...props}
      />

    </div>
  );
}