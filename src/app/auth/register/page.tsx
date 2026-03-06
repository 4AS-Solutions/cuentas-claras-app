"use client";

import { useState } from "react";
import { supabase } from "@/shared/supabase/client";
import { useRouter } from "next/navigation";

import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import Logo from "@/assets/logos/logo_horizontal_light_short.png";

import Image from "next/image";
import Link from "next/link";
import AuthBackground from "@/components/ui/AuthBackground";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function register(e: React.FormEvent) {
    e.preventDefault();

    if (!terms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    setError("");

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options:{
            data:{
              name,
              phone,
              timezone,
              accepted_terms:true
            }
          }
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        display_name: name,
        phone: phone || null,
        accepted_terms: true,
        accepted_terms_at: new Date().toISOString(),
      });
    }

    // Si el proyecto no requiere confirmación de email,
    // normalmente habrá sesión y podemos entrar directo.
    if (data.session) {
      router.push("/");
      return;
    }

    // Si tienes confirmación por email activada:
    router.push("/auth/login");
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <AuthBackground />

      <AuthCard>
        <div className="flex justify-center mb-6">
          <Image
            src={Logo}
            alt="Cuentas Claras"
            width={260}
            height={90}
            className="rounded-lg"
          />
        </div>

        <div className="text-center mb-8">
          <p className="text-sm mt-2 opacity-70">Controla tus gastos con claridad</p>
          <h1 className="text-center text-xl font-semibold mb-6 mt-2">Crear cuenta</h1>
        </div>

        <form onSubmit={register} className="space-y-4">
          <Input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            placeholder="Teléfono (opcional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            Acepto los términos y condiciones
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {error}
          </p>
        )}

        <p className="text-sm text-center mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-brand-emerald font-medium hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </main>
  );
}