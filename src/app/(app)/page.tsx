"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  List,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { supabase } from "@/shared/supabase/client";

type Tx = {
  id: string;
  kind: "expense" | "income";
  amount: number;
  currency: "USD" | "MXN";
  occurred_at: string;
  note: string | null;
  categories?: { name: string }[];
};

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
];

function money(v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function DashboardPage() {

  const router = useRouter();

  const [recent, setRecent] = useState<Tx[]>([]);
  const [categoryChart, setCategoryChart] = useState<any[]>([]);
  const [monthlyChart, setMonthlyChart] = useState<any[]>([]);
  const [insight, setInsight] = useState("");

  const [kpis, setKpis] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const valid = await checkSession();
    if (!valid) return;

    const onboardingNeeded = await checkOnboarding();
    if (onboardingNeeded) return;

    loadData();
  }

  async function checkSession() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/auth/login");
      return false;
    }

    return true;
  }

  async function checkOnboarding() {

    const { data } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (!data || data.length === 0) {
      router.push("/onboarding");
      return true;
    }

    return false;
  }

  async function loadData() {

    const { data } = await supabase
      .from("transactions")
      .select(`
        *,
        categories(name)
      `)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false });

    if (!data) return;

    const tx = data as Tx[];

    setRecent(tx.slice(0, 5));

    let income = 0;
    let expense = 0;

    const categoryMap: Record<string, number> = {};
    const monthMap: Record<string, number> = {};

    tx.forEach((t) => {

      const amt = Number(t.amount);

      if (t.kind === "income") income += amt;
      else expense += amt;

      if (t.kind === "expense") {

        const rawCat = (t as any).categories;

        const cat =
          Array.isArray(rawCat)
            ? rawCat[0]?.name
            : rawCat?.name;

        const catName = cat ?? "Sin categoría";

        categoryMap[catName] =
          (categoryMap[catName] ?? 0) + amt;

        const month = new Date(t.occurred_at)
          .toLocaleString("default", { month: "short" });

        monthMap[month] =
          (monthMap[month] ?? 0) + amt;

      }

    });

    setKpis({
      income,
      expense,
      balance: income - expense,
    });

    const categoryData =
      Object.entries(categoryMap)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a, b) => b.value - a.value);

    setCategoryChart(categoryData);

    const monthData =
      Object.entries(monthMap).map(([name, value]) => ({
        name,
        value,
      }));

    setMonthlyChart(monthData);

    if (categoryData.length > 0) {

      const biggest = categoryData[0];

      setInsight(
        `Este mes gastaste más en ${biggest.name} ($${money(biggest.value)})`
      );

    }

  }

  return (

    <main className="min-h-screen bg-background">

      <PageContainer>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Dashboard
            </h1>

            <p className="mt-1 text-slate-500">
              Resumen de tu actividad financiera
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

        {/* KPIs */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">

          {/* INGRESOS */}
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Ingresos
                </p>

                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  ${money(kpis.income)}
                </p>
              </div>

              <TrendingUp className="text-emerald-500" />

            </div>

          </Card>


          {/* GASTOS */}
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Gastos
                </p>

                <p className="text-3xl font-bold text-blue-600 mt-1">
                  ${money(kpis.expense)}
                </p>
              </div>

              <TrendingDown className="text-blue-500" />

            </div>

          </Card>


          {/* BALANCE */}
          <Card className="border-l-4 border-l-slate-400 hover:shadow-md transition">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Balance
                </p>

                <p
                  className={`text-3xl font-bold mt-1 ${
                    kpis.balance >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  ${money(kpis.balance)}
                </p>
              </div>

              <Wallet className="text-slate-500" />

            </div>

          </Card>

        </div>

        {/* INSIGHT */}
        {insight && (

          <Card className="mb-8 bg-emerald-50 text-emerald-700">
            {insight}
          </Card>

        )}

        {/* CHARTS */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <Card>
            <h2 className="font-semibold text-lg mb-5">
              Gastos por categoría
            </h2>

            {categoryChart.length === 0 ? (
              <p className="text-sm opacity-60">
                Aún no hay datos
              </p>
            ) : (
              <>
                <div className="w-full h-[280px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryChart}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                      >
                        {categoryChart.map((_, index) => (
                          <Cell
                            key={index}
                            fill={
                              COLORS[index % COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-1">
                  {categoryChart.map((c, i) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            background:
                              COLORS[i % COLORS.length],
                          }}
                        />
                        {c.name}
                      </span>

                      <span className="font-medium">
                        ${money(c.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-lg mb-5">
              Gastos por mes
            </h2>

            {monthlyChart.length === 0 ? (
              <p className="text-sm opacity-60">
                Aún no hay datos
              </p>
            ) : (
              <div className="w-full h-[280px]">
                <ResponsiveContainer>
                  <BarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

        </div>

        {/* RECENT */}
        <Card>

          <div className="flex items-center justify-between mb-5">

            <h2 className="font-semibold text-lg">
              Movimientos recientes
            </h2>

            <Button
              icon={<List size={18} />}
              variant="secondary"
              onClick={() =>
                router.push("/transactions")
              }
            >
              Historial
            </Button>

          </div>

          {recent.length === 0 ? (

            <p className="text-sm text-gray-500">
              Aún no tienes movimientos registrados.
            </p>

          ) : (

            <div className="divide-y">

              {recent.map((tx) => (

                <div
                  key={tx.id}
                  className="py-4 flex items-center justify-between"
                >

                  <div>

                    <p className="font-medium">
                      {tx.note || "Movimiento"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        tx.occurred_at
                      ).toLocaleDateString()}
                    </p>

                  </div>

                  <p
                    className={`font-semibold text-lg ${
                      tx.kind === "expense"
                        ? "text-blue-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {tx.kind === "expense" ? "-" : "+"}$
                    {money(tx.amount)}
                  </p>

                </div>

              ))}

            </div>

          )}

        </Card>

      </PageContainer>

    </main>

  );

}