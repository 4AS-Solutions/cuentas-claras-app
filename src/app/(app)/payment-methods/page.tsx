"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/supabase/client";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import {
  GripVertical,
  Plus,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRightLeft,
  X,
} from "lucide-react";

type Method = {
  id: string;
  name: string;
  is_card: boolean;
  sort_order?: number;
};

const SUGGESTED = [
  { name: "Cash", is_card: false },
  { name: "Debit Card", is_card: true },
  { name: "Credit Card", is_card: true },
  { name: "Transfer", is_card: false },
  { name: "Apple Pay", is_card: false },
];

function getIcon(name: string, is_card: boolean) {

  const key = name.toLowerCase();

  if (key.includes("cash")) return Banknote;
  if (key.includes("apple") || key.includes("google")) return Smartphone;
  if (key.includes("transfer")) return ArrowRightLeft;

  if (is_card) return CreditCard;

  return Banknote;
}

export default function PaymentMethodsPage() {

  const [methods, setMethods] = useState<Method[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("other");

  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    loadMethods();
  }, []);

  async function loadMethods() {

    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!data || data.length === 0) {

      const temp = SUGGESTED.map((m, i) => ({
        id: `temp-${i}`,
        name: m.name,
        is_card: m.is_card,
      }));

      setMethods(temp);
      return;
    }

    setMethods(data as Method[]);
  }

  const cards = useMemo(
    () => methods.filter((m) => m.is_card),
    [methods]
  );

  const others = useMemo(
    () => methods.filter((m) => !m.is_card),
    [methods]
  );

  async function addMethod() {

    const trimmed = newName.trim();
    if (!trimmed) return;

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;

    if (!userId) return;

    const isCard = newType === "card";

    const { data } = await supabase
      .from("payment_methods")
      .insert({
        user_id: userId,
        name: trimmed,
        is_card: isCard,
        is_active: true,
        sort_order: methods.length,
      })
      .select()
      .single();

    if (data) {
      setMethods([...methods, data]);
    }

    setNewName("");
  }

  async function deleteMethod(id: string) {

    if (id.startsWith("temp")) {
      setMethods(methods.filter((m) => m.id !== id));
      return;
    }

    await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id);

    setMethods(methods.filter((m) => m.id !== id));
  }

  async function persistOrder(list: Method[]) {

    for (const [index, m] of list.entries()) {

      if (m.id.startsWith("temp")) continue;

      await supabase
        .from("payment_methods")
        .update({ sort_order: index })
        .eq("id", m.id);
    }
  }

  function onDragStart(id: string) {
    setDraggedId(id);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function onDrop(targetId: string) {

    if (!draggedId || draggedId === targetId) return;

    const dragged = methods.find((m) => m.id === draggedId);
    const target = methods.find((m) => m.id === targetId);

    if (!dragged || !target) return;

    if (dragged.is_card !== target.is_card) return;

    const same = methods.filter((m) => m.is_card === dragged.is_card);
    const other = methods.filter((m) => m.is_card !== dragged.is_card);

    const from = same.findIndex((m) => m.id === draggedId);
    const to = same.findIndex((m) => m.id === targetId);

    const reordered = [...same];
    const [move] = reordered.splice(from, 1);
    reordered.splice(to, 0, move);

    const merged = dragged.is_card
      ? [...other.filter((m) => !m.is_card), ...reordered]
      : [...reordered, ...other.filter((m) => m.is_card)];

    setMethods(merged);
    persistOrder(merged);
  }

  function renderRow(m: Method) {

    const Icon = getIcon(m.name, m.is_card);

    return (
      <div
        key={m.id}
        draggable
        onDragStart={() => onDragStart(m.id)}
        onDragOver={onDragOver}
        onDrop={() => onDrop(m.id)}
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
          m.is_card
            ? "bg-indigo-50 border-indigo-100"
            : "bg-slate-50 border-slate-200"
        }`}
      >

        <GripVertical size={18} className="text-slate-400 cursor-grab"/>

        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white">
          <Icon size={18}/>
        </div>

        <div className="flex-1 font-medium">
          {m.name}
        </div>

        <button
          onClick={() => deleteMethod(m.id)}
          className="text-slate-400 hover:text-red-500"
        >
          <X size={18}/>
        </button>

      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">

      <PageContainer>

        <div className="max-w-3xl mx-auto space-y-6">

          <div>

            <h1 className="text-3xl font-bold">
              Métodos de pago
            </h1>

            <p className="text-slate-500">
              Administra cómo pagas tus movimientos.
            </p>

          </div>

          <Card className="space-y-4">

            <div className="flex flex-col gap-3 md:flex-row">

              <div className="flex-1">
                <Input
                  placeholder="Nuevo método"
                  value={newName}
                  onChange={(e)=>setNewName(e.target.value)}
                />
              </div>

              <div className="md:w-[180px]">
                <Select
                  value={newType}
                  onChange={(e)=>setNewType(e.target.value)}
                >
                  <option value="other">Otro</option>
                  <option value="card">Tarjeta</option>
                </Select>
              </div>

              <div className="md:w-auto">

                <button
                  onClick={addMethod}
                  className="
                  w-full md:w-auto
                  inline-flex items-center justify-center gap-2
                  h-[46px] px-5
                  rounded-xl
                  text-sm font-medium text-white
                  bg-gradient-to-r from-emerald-500 to-blue-500
                  hover:opacity-90
                  transition
                  "
                >
                  <Plus size={16}/>
                  Agregar
                </button>

              </div>

            </div>

            <p className="text-xs text-slate-500">
              Arrastra para reordenar tus métodos de pago.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">

            <Card className="space-y-3">

              <h2 className="font-semibold">
                Otros métodos
              </h2>

              {others.map(renderRow)}

            </Card>

            <Card className="space-y-3">

              <h2 className="font-semibold">
                Tarjetas
              </h2>

              {cards.map(renderRow)}

            </Card>

          </div>

        </div>

      </PageContainer>

    </main>
  );
}