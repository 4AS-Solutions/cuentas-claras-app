import { ReactNode } from "react";
import AppHeader from "@/components/layout/AppHeader";


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
      <main className="min-h-screen bg-background">

      <AppHeader />

      <div className="max-w-4xl mx-auto p-6">
        {children}
      </div>

    </main>
  );
}