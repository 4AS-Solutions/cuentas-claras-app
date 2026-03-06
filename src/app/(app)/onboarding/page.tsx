"use client";

import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      <PageContainer>

        <div className="max-w-xl mx-auto space-y-6">

          <Card>

            <h1 className="text-2xl font-semibold mb-2">
              Bienvenido a Cuentas Claras
            </h1>

            <p className="text-gray-500">
              Antes de comenzar vamos a configurar tu cuenta.
            </p>

          </Card>

          <Card className="space-y-4">

            <Button
              className="w-full"
              onClick={() => router.push("/categories")}
            >
              Crear categorías
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => router.push("/payment-methods")}
            >
              Crear métodos de pago
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Saltar por ahora
            </Button>

          </Card>

        </div>

      </PageContainer>
    </main>
  );
}