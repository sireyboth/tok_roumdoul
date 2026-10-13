"use client";

/* eslint-disable @next/next/no-img-element -- menu photos come from the restaurant's own storage */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CartLine, Lang, MenuItem, TableMenu } from "@/lib/types";
import { formatMoney, percentOf, toRiel } from "@/lib/money";
import { pick, t } from "@/lib/i18n";
import ItemSheet from "./item-sheet";
import CartSheet from "./cart-sheet";

function isSoldOut(item: MenuItem, now: number): boolean {
  return item.sold_out_until !== null && new Date(item.sold_out_until).getTime() > now;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode: the cart just won't survive a reload */
  }
}

export default function MenuApp({ menu, token }: { menu: TableMenu; token: string }) {
  const { company } = menu;
  const [lang, setLang] = useState<Lang>("km");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(menu.categories[0]?.id ?? null);
  const [now, setNow] = useState(() => Date.now());
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const cartKey = `tok-cart-${token}-${menu.menu_version.split(".")[0]}`;

  // Restore language and cart after the first render (server HTML has no access to storage).
  // Reading storage during render would make server and client HTML differ, so it happens once here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(readStorage<Lang>("tok-lang", "km"));
    setCart(readStorage<CartLine[]>(cartKey, []));
  }, [cartKey]);

  useEffect(() => writeStorage(cartKey, cart), [cart, cartKey]);
  useEffect(() => writeStorage("tok-lang", lang), [lang]);

  // Sold-out times expire on their own; re-check every minute.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const count = cart.reduce((n, line) => n + line.quantity, 0);
  const subtotal = cart.reduce((n, line) => n + line.unitPrice * line.quantity, 0);

  const totals = useMemo(() => {
    const service = percentOf(subtotal, company.service_charge_bp);
    const vat = company.prices_include_vat ? 0 : percentOf(subtotal + service, company.vat_bp);
    return { service, vat, total: subtotal + service + vat };
  }, [subtotal, company]);

  function addLine(line: CartLine) {
    setCart((current) => {
      const existing = current.find((l) => l.key === line.key);
      if (existing) {
        return current.map((l) => (l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l));
      }
      return [...current, line];
    });
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) =>
      current
        .map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function jumpTo(categoryId: number) {
    setActiveCategory(categoryId);
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const money = (minor: number) => formatMoney(minor, company.currency);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col bg-[var(--surface)] pb-28">
      <header className="flex items-center gap-3 px-4 pt-5 pb-3">
        {company.logo_url ? (
          <img src={company.logo_url} alt="" className="size-11 rounded-full object-cover" />
        ) : (
          <div className="grid size-11 place-items-center rounded-full bg-[var(--brand)] text-lg font-semibold text-white">
            {company.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{company.name}</h1>
          <p className="text-sm text-[var(--muted)]">
            {menu.branch.name} · {t("table", lang)} {menu.table.name}
            {menu.table.area ? ` · ${menu.table.area}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === "km" ? "en" : "km")}
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-medium"
          aria-label="Change language"
        >
          {lang === "km" ? "EN" : "ខ្មែរ"}
        </button>
      </header>

      <nav className="sticky top-0 z-10 -mx-0 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none]">
          {menu.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => jumpTo(category.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--chip)] text-[var(--fg)]"
              }`}
            >
              {pick(category.name, lang)}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex flex-col gap-6 px-4 pt-4">
        {menu.categories.map((category) => (
          <section
            key={category.id}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className="scroll-mt-16"
          >
            <h2 className="mb-2 text-base font-semibold">{pick(category.name, lang)}</h2>
            <ul className="flex flex-col divide-y divide-[var(--line)]">
              {category.items.map((item) => {
                const soldOut = isSoldOut(item, now);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => setOpenItem(item)}
                      className="flex w-full items-center gap-3 py-3 text-left disabled:opacity-50"
                    >
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="size-20 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="size-20 shrink-0 rounded-lg bg-[var(--chip)]" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{pick(item.name, lang)}</p>
                        <p className="text-sm text-[var(--muted)]">{pick(item.name, lang === "km" ? "en" : "km")}</p>
                        <p className="mt-1 font-semibold tabular-nums">{money(item.price)}</p>
                      </div>
                      {soldOut ? (
                        <span className="rounded-full bg-[var(--danger-bg)] px-2.5 py-1 text-xs font-medium text-[var(--danger)]">
                          {t("soldOut", lang)}
                        </span>
                      ) : (
                        <span className="grid size-9 place-items-center rounded-full bg-[var(--brand)] text-xl leading-none text-white" aria-label={t("add", lang)}>
                          +
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-xl items-center justify-between rounded-xl bg-[var(--brand)] px-5 py-3.5 text-white shadow-lg"
          >
            <span className="flex items-center gap-2 font-medium">
              <span className="grid size-6 place-items-center rounded-full bg-white/20 text-sm">{count}</span>
              {t("viewOrder", lang)}
            </span>
            <span className="font-semibold tabular-nums">{money(totals.total)}</span>
          </button>
        </div>
      )}

      {openItem && (
        <ItemSheet
          item={openItem}
          lang={lang}
          currency={company.currency}
          onClose={() => setOpenItem(null)}
          onAdd={(line) => {
            addLine(line);
            setOpenItem(null);
          }}
        />
      )}

      {cartOpen && (
        <CartSheet
          lines={cart}
          lang={lang}
          currency={company.currency}
          subtotal={subtotal}
          service={totals.service}
          vat={totals.vat}
          total={totals.total}
          riel={company.currency === "USD" ? toRiel(totals.total, company.khr_per_usd) : null}
          onChangeQuantity={changeQuantity}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}
