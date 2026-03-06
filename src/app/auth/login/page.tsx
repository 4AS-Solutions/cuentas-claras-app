"use client";

import { useState } from "react";
import { supabase } from "@/shared/supabase/client";
import { useRouter } from "next/navigation";

import AuthCard from "@/components/auth/AuthCard";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import Image from "next/image";
import Link from "next/link";
import AuthBackground from "@/components/ui/AuthBackground";
import Logo from "@/assets/logos/logo_horizontal_light_short.png";

export default function LoginPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  async function login(e:React.FormEvent){

    e.preventDefault();
    setLoading(true);
    setError("");

    const {error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if(error){
      setError(error.message);
      return;
    }

    router.push("/");

  }

  return (

    <main className="relative min-h-screen flex items-center justify-center p-6">

      <AuthBackground/>

      <AuthCard>

        {/* logo */}

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
          <p className="text-sm mt-2 opacity-70"> Controla tus gastos con claridad </p> 
          <h1 className="text-center text-xl font-semibold mb-6 mt-2"> Iniciar Sesión </h1> 
        </div>

        <form onSubmit={login} className="space-y-4">

          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {error}
          </p>
        )}

        <p className="text-sm text-center mt-6">

          ¿No tienes cuenta?{" "}

          <Link
            href="/auth/register"
            className="text-brand-emerald font-medium hover:underline"
          >
            Crear cuenta
          </Link>

        </p>

      </AuthCard>

    </main>
  );
}