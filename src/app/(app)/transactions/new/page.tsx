"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/supabase/client";
import { useRouter } from "next/navigation";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

type Category = { id: string; name: string };
type PaymentMethod = { id: string; name: string; is_card: boolean };
type CardType = { id: string; name: string; brand: string };

export default function NewTransactionPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [kind, setKind] = useState<"expense" | "income">("expense");

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "MXN">("USD");

  const [occurredAt, setOccurredAt] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });

  const [note, setNote] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [cardId, setCardId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m.id === paymentMethodId) ?? null,
    [methods, paymentMethodId]
  );

  const cardType =
    selectedMethod?.name.toLowerCase().includes("credit")
      ? "credit"
      : selectedMethod?.name.toLowerCase().includes("debit")
      ? "debit"
      : null;

  const filteredCards = useMemo(() => {
    if (!cardType) return cards;
    return cards.filter((c) => c.brand === cardType);
  }, [cards, cardType]);

  useEffect(() => {
    async function load() {

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const user = data.session.user;

      const [catsRes, methodsRes, cardsRes] = await Promise.all([

        supabase
          .from("categories")
          .select("id,name")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("payment_methods")
          .select("id,name,is_card")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("cards")
          .select("id,name,brand")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("name"),

      ]);

      if (catsRes.data) setCategories(catsRes.data);
      if (methodsRes.data) setMethods(methodsRes.data);
      if (cardsRes.data) setCards(cardsRes.data);

    }

    load();
  }, [router]);

  async function onSave(e: React.FormEvent) {

    e.preventDefault();

    if (!amount) {
      alert("Ingresa el monto");
      return;
    }

    if (!categoryId) {
      alert("Selecciona una categoría");
      return;
    }

    if (!paymentMethodId) {
      alert("Selecciona un método de pago");
      return;
    }

    const amt = Number(amount);

    if (!Number.isFinite(amt) || amt <= 0) {
      alert("Monto inválido");
      return;
    }

    setLoading(true);

    const card_id = selectedMethod?.is_card ? cardId || null : null;

    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    const { error } = await supabase.from("transactions").insert({
      user_id: user?.id,
      kind,
      amount: amt,
      currency,
      occurred_at: new Date(occurredAt).toISOString(),
      note: note || null,
      category_id: categoryId,
      payment_method_id: paymentMethodId,
      card_id,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/transactions");

  }

  return (

    <main className="min-h-screen bg-background">

      <PageContainer>

        {/* HEADER */}

        <div className="mb-6">

          <h1 className="text-2xl font-semibold">
            Nuevo movimiento
          </h1>

          <p className="text-sm text-gray-500">
            Registra un ingreso o gasto
          </p>

        </div>

        {/* FORM */}

        <Card className="max-w-xl space-y-6">

          <form onSubmit={onSave} className="space-y-6">

            {/* TYPE */}

            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100">

              <button
                type="button"
                className={`rounded-xl p-3 font-semibold transition ${
                  kind === "expense"
                    ? "bg-white shadow text-blue-700"
                    : "text-slate-500"
                }`}
                onClick={() => setKind("expense")}
              >
                Gasto
              </button>

              <button
                type="button"
                className={`rounded-xl p-3 font-semibold transition ${
                  kind === "income"
                    ? "bg-white shadow text-emerald-700"
                    : "text-slate-500"
                }`}
                onClick={() => setKind("income")}
              >
                Ingreso
              </button>

            </div>

            {/* AMOUNT */}

            <div className="grid grid-cols-3 gap-2">

              <Input
                className="col-span-2"
                label="Monto *"
                placeholder="0.00"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <Select
                label="Moneda"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
              >
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
              </Select>

            </div>

            {/* DATE */}

            <Input
              label="Fecha *"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />

            {/* CATEGORY */}

            <Select
              label="Categoría *"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >

              <option value="">Selecciona una categoría</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}

            </Select>

            {/* PAYMENT METHOD */}

            <Select
              label="Método de pago *"
              value={paymentMethodId}
              onChange={(e) => {
                setPaymentMethodId(e.target.value);
                setCardId("");
              }}
              required
            >

              <option value="">Selecciona método</option>

              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}

            </Select>

            {/* CARD */}

            {selectedMethod?.is_card && (

              <Select
                label="Tarjeta"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
              >

                <option value="">Selecciona tarjeta</option>

                {filteredCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}

              </Select>

            )}

            {/* NOTE */}

            <Textarea
              label="Nota (opcional)"
              rows={3}
              placeholder="Ej. Starbucks, Uber..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {/* ACTIONS */}

            <div className="flex gap-3">

              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>

            </div>

            <p className="text-xs text-gray-400">
              Tip: puedes editar el movimiento después si necesitas.
            </p>

          </form>

        </Card>

      </PageContainer>

    </main>

  );

}