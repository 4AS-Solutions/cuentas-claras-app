"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/shared/supabase/client";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logos/logo_horizontal_light_short.png";

import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user.email || null);
    }
    loadUser();
  }, []);


  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const nav = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Movimientos",
      href: "/transactions",
      icon: Receipt,
    },
    {
      name: "Tarjetas",
      href: "/cards",
      icon: CreditCard,
    },
  ];

  return (
    <>
      {/* HEADER */}
      <header className="bg-brand-gradient text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={Logo}
                alt="Cuentas Claras"
                width={160}
                height={40}
                priority
                className="rounded-lg"
              />
            </Link>

            {/* DESKTOP MENU */}
            <nav className="hidden md:flex items-center gap-6">

              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition
                    ${
                      active
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}

              <button
                onClick={logout}
                className="ml-4 flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition"
              >
                <LogOut size={18} />
                Salir
              </button>

            </nav>

            {/* MOBILE MENU BUTTON */}
            <button
              className="md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={26} />
            </button>

          </div>
        </div>
      </header>

      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40
        ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-brand-gradient text-white shadow-2xl z-50 transform transition-transform duration-500 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >

        {/* OVERLAY FOR CONTRAST */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        <div className="relative h-full flex flex-col">

          {/* HEADER */}
          <div className="flex items-center justify-between p-5 border-b border-white/20">
            <p className="font-semibold text-white">
              Navegación
            </p>

            <button onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-white/20 flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-medium text-white">
                Usuario
              </p>

              <p className="text-xs text-white/70 truncate max-w-[160px]">
                {userEmail}
              </p>
            </div>

          </div>

          {/* NAVIGATION */}
          <nav className="flex flex-col gap-2 p-4 flex-1">

            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                  ${
                    active
                      ? "bg-white/25 text-white shadow-lg"
                      : "bg-white/5 text-white/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <Icon
                    size={20}
                    className={active ? "" : "opacity-80"}
                  />
                  {item.name}
                </Link>
              );
            })}

            {/* LOGOUT */}
            <button
              onClick={logout}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white mt-auto border-t border-white/20 pt-4"
            >
              <LogOut size={20} />
              Salir
            </button>

          </nav>

        </div>

      </aside>
    </>
  );
}