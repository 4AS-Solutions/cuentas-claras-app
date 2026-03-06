"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/supabase/client";

import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import {
  GripVertical,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  Film,
  Car,
  Receipt,
  Wallet,
  Tag,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  Sparkles,
  CirclePlus,
} from "lucide-react";

type CategoryKind = "expense" | "income";

type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
};

const SUGGESTED: Array<{ name: string; kind: CategoryKind }> = [
  { name: "Compras", kind: "expense" },
  { name: "Comidas", kind: "expense" },
  { name: "Entretenimiento", kind: "expense" },
  { name: "Transporte", kind: "expense" },
  { name: "Servicios", kind: "expense" },
  { name: "Ingresos", kind: "income" },
  { name: "Otro", kind: "expense" },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function getCategoryMeta(name: string, kind: CategoryKind) {
  const key = normalize(name);

  if (key.includes("compra")) {
    return {
      icon: ShoppingBag,
      iconWrap:
        "bg-blue-50 text-blue-600",
    };
  }

  if (
    key.includes("comida") ||
    key.includes("restaurant") ||
    key.includes("restaurante") ||
    key.includes("caf") ||
    key.includes("super")
  ) {
    return {
      icon: UtensilsCrossed,
      iconWrap:
        "bg-blue-50 text-blue-600",
    };
  }

  if (
    key.includes("entretenimiento") ||
    key.includes("ocio") ||
    key.includes("cine") ||
    key.includes("stream")
  ) {
    return {
      icon: Film,
      iconWrap:
        "bg-blue-50 text-blue-600",
    };
  }

  if (
    key.includes("transporte") ||
    key.includes("gasolina") ||
    key.includes("uber") ||
    key.includes("taxi")
  ) {
    return {
      icon: Car,
      iconWrap:
        "bg-blue-50 text-blue-600",
    };
  }

  if (
    key.includes("servicio") ||
    key.includes("luz") ||
    key.includes("agua") ||
    key.includes("internet") ||
    key.includes("telefono")
  ) {
    return {
      icon: Receipt,
      iconWrap:
        "bg-blue-50 text-blue-600",
    };
  }

  if (
    key.includes("ingreso") ||
    key.includes("salario") ||
    key.includes("sueldo") ||
    key.includes("nomina")
  ) {
    return {
      icon: Wallet,
      iconWrap:
        "bg-emerald-50 text-emerald-600",
    };
  }

  return {
    icon: kind === "income" ? Wallet : Tag,
    iconWrap:
      kind === "income"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-blue-50 text-blue-600",
  };
}

function sortByKind(items: Category[]) {
  const expenses = items.filter((c) => c.kind === "expense");
  const incomes = items.filter((c) => c.kind === "income");

  return [...expenses, ...incomes];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSuggestions, setSavingSuggestions] = useState(false);
  const [adding, setAdding] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [newKind, setNewKind] = useState<CategoryKind>("expense");

  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

    if (error) {
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      const temp = SUGGESTED.map((c, index) => ({
        id: `temp-${index}`,
        name: c.name,
        kind: c.kind,
      }));

      setCategories(sortByKind(temp));
      setLoading(false);
      return;
    }

    setCategories(sortByKind(data as Category[]));
    setLoading(false);
  }

  const hasSuggestions = useMemo(
    () => categories.some((c) => c.id.startsWith("temp-")),
    [categories]
  );

  const expenses = useMemo(
    () => categories.filter((c) => c.kind === "expense"),
    [categories]
  );

  const incomes = useMemo(
    () => categories.filter((c) => c.kind === "income"),
    [categories]
  );

  function categoryExists(name: string, kind: CategoryKind) {
    const normalized = normalize(name);

    return categories.some(
      (c) => normalize(c.name) === normalized && c.kind === kind
    );
  }

  function removeCategory(cat: Category) {
    if (cat.id.startsWith("temp-")) {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      return;
    }

    void deletePersistedCategory(cat.id);
  }

  async function deletePersistedCategory(id: string) {
    const previous = categories;
    setCategories((prev) => prev.filter((c) => c.id !== id));

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      setCategories(previous);
    }
  }

  async function addCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categoryExists(trimmed, newKind)) {
      setNewCategory("");
      return;
    }

    setAdding(true);

    const isTempMode = hasSuggestions;

    if (isTempMode) {
      const item: Category = {
        id: `temp-new-${Date.now()}`,
        name: trimmed,
        kind: newKind,
      };

      setCategories((prev) => sortByKind([...prev, item]));
      setNewCategory("");
      setNewKind("expense");
      setAdding(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      setAdding(false);
      return;
    }

    const maxOrder =
      Math.max(
        ...categories
          .filter((c) => c.kind === newKind)
          .map((c: any) => c.sort_order ?? 0),
        0
      ) + 1;

    const { data, error } = await supabase.from("categories").insert({
        user_id: userId,
        name: trimmed,
        kind: newKind,
        is_active: true,
        sort_order: maxOrder,
      })
      .select("id, name, kind")
      .single();

    if (!error && data) {
      setCategories((prev) => sortByKind([...prev, data as Category]));
      setNewCategory("");
      setNewKind("expense");
    }

    setAdding(false);
  }

  async function saveSuggestions() {
    const tempItems = categories.filter((c) => c.id.startsWith("temp-"));
    if (tempItems.length === 0) return;

    setSavingSuggestions(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      setSavingSuggestions(false);
      return;
    }

    const payload = tempItems.map((c) => ({
      user_id: userId,
      name: c.name,
      kind: c.kind,
      is_active: true,
    }));

    const { error } = await supabase.from("categories").insert(payload);

    if (!error) {
      await loadCategories();
    }

    setSavingSuggestions(false);
  }

  async function persistOrder(list: Category[]) {

    for (const [index, cat] of list.entries()) {

      if (cat.id.startsWith("temp")) continue;

      const { error } = await supabase
        .from("categories")
        .update({ sort_order: index })
        .eq("id", cat.id);

      if (error) {
        console.error("Error updating sort:", error);
      }
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

    const dragged = categories.find((c) => c.id === draggedId);
    const target = categories.find((c) => c.id === targetId);

    if (!dragged || !target) return;
    if (dragged.kind !== target.kind) return;

    const sameKindItems = categories.filter((c) => c.kind === dragged.kind);
    const otherKindItems = categories.filter((c) => c.kind !== dragged.kind);

    const fromIndex = sameKindItems.findIndex((c) => c.id === draggedId);
    const toIndex = sameKindItems.findIndex((c) => c.id === targetId);

    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...sameKindItems];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const merged =
      dragged.kind === "expense"
        ? [...reordered, ...otherKindItems.filter((c) => c.kind === "income")]
        : [...otherKindItems.filter((c) => c.kind === "expense"), ...reordered];

    setCategories(merged);
    setDraggedId(null);
    persistOrder(merged);
  }

  function renderCategoryRow(cat: Category) {
    const meta = getCategoryMeta(cat.name, cat.kind);
    const Icon = meta.icon;

    const isExpense = cat.kind === "expense";

    return (
      <div
        key={cat.id}
        draggable
        onDragStart={() => onDragStart(cat.id)}
        onDragOver={onDragOver}
        onDrop={() => onDrop(cat.id)}
        className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
          isExpense
            ? "border-blue-100 bg-blue-50/50"
            : "border-emerald-100 bg-emerald-50/50"
        }`}
      >
        <div className="cursor-grab text-slate-400 transition group-hover:text-slate-600 active:cursor-grabbing">
          <GripVertical size={18} />
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.iconWrap}`}>
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-800">
            {cat.name}
          </p>

          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                isExpense
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isExpense ? (
                <ArrowDownCircle size={14} />
              ) : (
                <ArrowUpCircle size={14} />
              )}
              {isExpense ? "Gasto" : "Ingreso"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => removeCategory(cat)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-red-500"
          aria-label={`Eliminar ${cat.name}`}
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <PageContainer>
          <div className="py-10 text-sm text-slate-500">
            Cargando categorías...
          </div>
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <PageContainer>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Categorías
              </h1>
              <p className="mt-1 text-slate-500">
                Organiza tus movimientos con categorías claras y personalizadas.
              </p>
            </div>

            {hasSuggestions && (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <Sparkles size={16} />
                Sugerencias listas para personalizar
              </div>
            )}
          </div>

          <Card className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Nueva categoría"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>

              <div className="md:w-[180px]">
                <Select
                  value={newKind}
                  onChange={(e) => setNewKind(e.target.value as CategoryKind)}
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </Select>
              </div>

              <div className="md:w-auto">
                <button
                type="button"
                onClick={addCategory}
                disabled={adding}
                className="
                  inline-flex items-center justify-center gap-2
                  h-[46px] px-5
                  rounded-xl
                  text-sm font-medium text-white
                  bg-gradient-to-r from-emerald-500 to-blue-500
                  hover:opacity-90
                  transition
                  disabled:opacity-50
                "
              >
                <Plus size={16} />
                {adding ? "Agregando..." : "Agregar"}
              </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Arrastra para reordenar dentro de cada grupo. Primero se muestran gastos y después ingresos.
            </p>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <ArrowDownCircle size={18} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Gastos
                  </h2>
                  <p className="text-sm text-slate-500">
                    Categorías para tus salidas de dinero
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                    No tienes categorías de gasto todavía.
                  </div>
                ) : (
                  expenses.map(renderCategoryRow)
                )}
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <ArrowUpCircle size={18} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Ingresos
                  </h2>
                  <p className="text-sm text-slate-500">
                    Categorías para entradas de dinero
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {incomes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                    No tienes categorías de ingreso todavía.
                  </div>
                ) : (
                  incomes.map(renderCategoryRow)
                )}
              </div>
            </Card>
          </div>

          {hasSuggestions && (
            <Card className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Guardar categorías sugeridas
                  </h3>
                  <p className="text-sm text-slate-500">
                    Personaliza la lista y guarda solo las que realmente vas a usar.
                  </p>
                </div>

                <Button
                  onClick={saveSuggestions}
                  disabled={savingSuggestions}
                >
                  {savingSuggestions ? "Guardando..." : "Guardar categorías"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </PageContainer>
    </main>
  );
}