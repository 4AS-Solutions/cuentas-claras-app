"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import { PlusCircle } from "lucide-react";

type Tx = {
  id: string;
  kind: "expense" | "income";
  amount: number;
  currency: "USD" | "MXN";
  occurred_at: string;
  note: string | null;
  categories?: { name: string }[] | { name: string } | null;
  payment_methods?: { name: string } | null;
  cards?: { name: string; last4: string | null } | null;
};

function money(v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function TransactionsPage() {
  const router = useRouter();

  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          kind,
          amount,
          currency,
          occurred_at,
          note,
          categories(name),
          payment_methods(name),
          cards(name,last4)
        `)
        .is("deleted_at", null)
        .order("occurred_at", { ascending: false })
        .limit(100);

      if (error) {
        alert(error.message);
        return;
      }

      const rows = (data ?? []).map((row: any): Tx => ({
        id: row.id,
        kind: row.kind,
        amount: Number(row.amount),
        currency: row.currency,
        occurred_at: row.occurred_at,
        note: row.note,
        categories: row.categories ?? [],
        payment_methods: row.payment_methods ?? null,
        cards: row.cards ?? null,
      }));

      setItems(rows);
      setLoading(false);
    }

    load();
  }, [router]);

  return (
    <main className="min-h-screen bg-background">
      <PageContainer>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-2xl font-semibold">
              Movimientos
            </h1>

            <p className="text-sm text-gray-500">
              Historial de ingresos y gastos
            </p>
          </div>

          <Button
            icon={<PlusCircle size={18} />}
            mobileIconOnly
            onClick={() => router.push("/transactions/new")}
          >
          Nuevo movimiento
          </Button>

        </div>

        {/* STATES */}
        {loading ? (

          <Card>
            <p className="opacity-70">Cargando...</p>
          </Card>

        ) : items.length === 0 ? (

          <Card>

            <p className="opacity-70">
              Aún no hay movimientos.
            </p>

            <Button
              icon={<PlusCircle size={18} />}
              mobileIconOnly
              onClick={() => router.push("/transactions/new")}
            >
            Registrar el primero
            </Button>

          </Card>

        ) : (

          <Card className="p-0 overflow-hidden">

            <ul className="divide-y">

              {items.map((tx) => {

                const category =
                  Array.isArray(tx.categories)
                    ? tx.categories[0]?.name
                    : tx.categories?.name;

                return (

                  <li
                    key={tx.id}
                    className="p-5 hover:bg-slate-50 transition"
                  >

                    <div className="flex items-start justify-between gap-4">

                      {/* LEFT */}
                      <div className="min-w-0">

                        <div className="flex items-center gap-2 mb-1">

                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              tx.kind === "expense"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {tx.kind === "expense"
                              ? "Gasto"
                              : "Ingreso"}
                          </span>

                          <p className="font-medium truncate">
                            {tx.note ?? "Movimiento"}
                          </p>

                        </div>

                        {category && (
                          <p className="text-xs text-slate-500">
                            {category}
                          </p>
                        )}

                        {/* payment */}
                        {tx.cards ? (
                          <p className="text-xs text-slate-500 mt-1">
                            {tx.cards.name}
                            {tx.cards.last4 &&
                              ` •••• ${tx.cards.last4}`}
                          </p>
                        ) : tx.payment_methods ? (
                          <p className="text-xs text-slate-500 mt-1">
                            {tx.payment_methods.name}
                          </p>
                        ) : null}

                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(
                            tx.occurred_at
                          ).toLocaleString()}
                        </p>

                      </div>

                      {/* RIGHT */}
                      <div className="text-right shrink-0">

                        <p
                          className={`text-lg font-semibold ${
                            tx.kind === "expense"
                              ? "text-blue-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {tx.kind === "expense"
                            ? "-"
                            : "+"}
                          {tx.currency} {money(tx.amount)}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {tx.kind === "expense"
                            ? "Salida"
                            : "Entrada"}
                        </p>

                      </div>

                    </div>

                  </li>

                );
              })}

            </ul>

          </Card>

        )}

        {/* FOOTER */}
        <div className="mt-8">

          <Link
            className="text-sm text-gray-500 hover:underline"
            href="/"
          >
            Volver al dashboard
          </Link>

        </div>

      </PageContainer>
    </main>
  );
}