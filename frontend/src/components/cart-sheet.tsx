"use client";

import type { CartLine, Lang } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { pick, t } from "@/lib/i18n";
import Sheet from "./sheet";

export default function CartSheet({
  lines,
  lang,
  currency,
  subtotal,
  service,
  vat,
  total,
  riel,
  onChangeQuantity,
  onClose,
}: {
  lines: CartLine[];
  lang: Lang;
  currency: "USD" | "KHR";
  subtotal: number;
  service: number;
  vat: number;
  total: number;
  riel: number | null;
  onChangeQuantity: (key: string, delta: number) => void;
  onClose: () => void;
}) {
  const money = (minor: number) => formatMoney(minor, currency);

  return (
    <Sheet onClose={onClose} label={t("yourOrder", lang)}>
      <h2 className="text-xl font-semibold">{t("yourOrder", lang)}</h2>

      {lines.length === 0 ? (
        <p className="py-8 text-center text-[var(--muted)]">{t("empty", lang)}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--line)]">
          {lines.map((line) => (
            <li key={line.key} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{pick(line.name, lang)}</p>
                {line.optionNames.length > 0 && (
                  <p className="text-sm text-[var(--muted)]">{line.optionNames.map((n) => pick(n, lang)).join(", ")}</p>
                )}
                {line.note && <p className="text-sm italic text-[var(--muted)]">“{line.note}”</p>}
                <p className="mt-1 text-sm font-semibold tabular-nums">{money(line.unitPrice * line.quantity)}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[var(--line)] px-1">
                <button type="button" className="size-8" onClick={() => onChangeQuantity(line.key, -1)} aria-label="Less">
                  −
                </button>
                <span className="w-4 text-center tabular-nums">{line.quantity}</span>
                <button type="button" className="size-8" onClick={() => onChangeQuantity(line.key, 1)} aria-label="More">
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dl className="flex flex-col gap-1.5 border-t border-[var(--line)] pt-3 text-sm tabular-nums">
        <div className="flex justify-between">
          <dt>{t("subtotal", lang)}</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        {service > 0 && (
          <div className="flex justify-between">
            <dt>{t("service", lang)}</dt>
            <dd>{money(service)}</dd>
          </div>
        )}
        {vat > 0 && (
          <div className="flex justify-between">
            <dt>{t("vat", lang)}</dt>
            <dd>{money(vat)}</dd>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold">
          <dt>{t("total", lang)}</dt>
          <dd>
            {money(total)}
            {riel !== null && <span className="ml-2 font-normal text-[var(--muted)]">≈ {riel.toLocaleString("en-US")}៛</span>}
          </dd>
        </div>
      </dl>

      {/* Step 1 connects this to POST /api/public/tables/{token}/orders */}
      <p className="rounded-lg bg-[var(--chip)] p-3 text-sm">{t("sendSoon", lang)}</p>
      <button type="button" disabled className="rounded-xl bg-[var(--brand)] px-4 py-3 font-medium text-white opacity-40">
        {t("send", lang)}
      </button>
    </Sheet>
  );
}
