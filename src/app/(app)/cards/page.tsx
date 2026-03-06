"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/supabase/client";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import FinanceCard from "@/components/cards/FinanceCard";

import {
  PlusCircle,
  CreditCard,
  X,
} from "lucide-react";

type CardType = {
  id: string;
  name: string;
  brand: string;
  last4: string | null;
  color: string | null;
};

export default function CardsPage() {

  const [cards, setCards] = useState<CardType[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("credit");
  const [last4, setLast4] = useState("");
  const [color, setColor] = useState("#1e3a8a");

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    const { data } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_active", true)
      .order("created_at");

    if (data) setCards(data);

  }

  async function createCard(e: React.FormEvent) {

    e.preventDefault();

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    const { error } = await supabase.from("cards").insert({
      user_id: user?.id,
      name,
      brand,
      last4: last4 || null,
      color,
      is_active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setShowForm(false);
    setName("");
    setLast4("");

    loadCards();

  }

  return (

    <main className="min-h-screen bg-background">

      <PageContainer>

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Mis tarjetas
            </h1>

            <p className="mt-1 text-slate-500">
              Administra tus tarjetas para registrar pagos
            </p>

          </div>

          <Button
            icon={<PlusCircle size={18} />}
            onClick={() => setShowForm(true)}
          >
            Nueva tarjeta
          </Button>

        </div>

        {/* EMPTY STATE */}

        {cards.length === 0 && (

          <Card className="text-center py-10 space-y-3">

            <CreditCard
              size={32}
              className="mx-auto text-slate-400"
            />

            <p className="font-medium text-slate-700">
              Aún no tienes tarjetas registradas
            </p>

            <p className="text-sm text-slate-500">
              Agrega tu primera tarjeta para registrar pagos más rápido
            </p>

            <div className="pt-2">

              <Button
                icon={<PlusCircle size={18} />}
                onClick={() => setShowForm(true)}
              >
                Agregar tarjeta
              </Button>

            </div>

          </Card>

        )}

        {/* GRID */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {cards.map((card) => (

            <FinanceCard
              key={card.id}
              name={card.name}
              brand={card.brand}
              last4={card.last4}
              color={card.color}
            />

          ))}

        </div>

      </PageContainer>

      {/* MODAL */}

      {showForm && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <Card className="w-full max-w-md relative">

            {/* CLOSE BUTTON */}

            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20}/>
            </button>

            <form
              onSubmit={createCard}
              className="space-y-5"
            >

              <div className="flex items-center gap-2 mb-2">

                <CreditCard
                  size={18}
                  className="text-slate-500"
                />

                <h2 className="text-lg font-semibold">
                  Nueva tarjeta
                </h2>

              </div>

              <Input
                label="Banco"
                placeholder="Ej: BBVA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Select
                label="Tipo de tarjeta"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="credit">
                  Crédito
                </option>

                <option value="debit">
                  Débito
                </option>
              </Select>

              <Input
                label="Últimos 4 dígitos (opcional)"
                maxLength={4}
                inputMode="numeric"
                value={last4}
                onChange={(e) =>
                  setLast4(
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />

              <div>

                <label className="text-sm font-medium">
                  Color de tarjeta
                </label>

                <input
                  type="color"
                  className="w-full h-10 mt-2 rounded-lg border"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />

              </div>

              <div className="flex gap-3 pt-2">

                <Button
                  type="submit"
                  className="flex-1"
                >
                  Guardar
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>

              </div>

            </form>

          </Card>

        </div>

      )}

    </main>

  );

}