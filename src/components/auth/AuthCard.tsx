import { ReactNode } from "react";

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md backdrop-blur-xl bg-white/80 border border-white/40 rounded-2xl shadow-2xl p-8 animate-fadeIn">
      {children}
    </div>
  );
}