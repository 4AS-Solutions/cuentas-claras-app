"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import {
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Wallet,
} from "lucide-react";

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

function groupByDate(items: Tx[]) {
  const groups: Record<string, Tx[]> = {};

  items.forEach((tx) => {
    const date = new Date(tx.occurred_at);

    const label = date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (!groups[label]) groups[label] = [];

    groups[label].push(tx);
  });

  return Object.entries(groups);
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
        .limit(200);

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

  const grouped = groupByDate(items);

  return (
    <main className="min-h-screen bg-background">
      <PageContainer>

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Movimientos
            </h1>

            <p className="mt-1 text-slate-500">
              Historial de ingresos y gastos
            </p>

            {!loading && (
              <p className="text-xs text-slate-400 mt-1">
                {items.length} movimientos registrados
              </p>
            )}
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
            <p className="opacity-70">Cargando movimientos...</p>
          </Card>

        ) : items.length === 0 ? (

          <Card className="text-center py-10 space-y-4">

            <p className="text-slate-600 font-medium">
              Aún no tienes movimientos
            </p>

            <p className="text-sm text-slate-400">
              Empieza registrando tu primer ingreso o gasto
            </p>

            <Button
              icon={<PlusCircle size={18} />}
              onClick={() => router.push("/transactions/new")}
            >
              Registrar el primero
            </Button>

          </Card>

        ) : (

          <Card className="p-0 overflow-hidden">

            <div className="divide-y">

              {grouped.map(([date, txs]) => (

                <div key={date}>

                  {/* DATE HEADER */}

                  <div className="px-5 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                    {date}
                  </div>

                  {txs.map((tx) => {

                    const category =
                      Array.isArray(tx.categories)
                        ? tx.categories[0]?.name
                        : tx.categories?.name;

                    const Icon =
                      tx.kind === "expense"
                        ? ArrowDownCircle
                        : ArrowUpCircle;

                    return (

                      <div
                        key={tx.id}
                        onClick={() =>
                          router.push(`/transactions/${tx.id}`)
                        }
                        className={`p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition border-l-4 ${
                          tx.kind === "expense"
                            ? "border-blue-400"
                            : "border-emerald-400"
                        }`}
                      >

                        {/* LEFT */}

                        <div className="flex items-start gap-3 min-w-0">

                          <div
                            className={`mt-1 ${
                              tx.kind === "expense"
                                ? "text-blue-500"
                                : "text-emerald-500"
                            }`}
                          >
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0">

                            <p className="font-medium truncate">
                              {tx.note ?? "Movimiento"}
                            </p>

                            {category && (
                              <p className="text-xs text-slate-500">
                                {category}
                              </p>
                            )}

                            {/* payment */}

                            {tx.cards ? (
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <CreditCard size={12} />
                                {tx.cards.name}
                                {tx.cards.last4 &&
                                  ` •••• ${tx.cards.last4}`}
                              </p>
                            ) : tx.payment_methods ? (
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <Wallet size={12} />
                                {tx.payment_methods.name}
                              </p>
                            ) : null}

                          </div>

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
                            ${money(tx.amount)} {tx.currency}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {tx.kind === "expense"
                              ? "Salida"
                              : "Entrada"}
                          </p>

                        </div>

                      </div>

                    );

                  })}

                </div>

              ))}

            </div>

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