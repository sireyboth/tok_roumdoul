import type { Lang, Names } from "./types";

export function pick(names: Names | null | undefined, lang: Lang): string {
  if (!names) return "";
  return (lang === "km" ? names.km || names.en : names.en || names.km) ?? "";
}

const text = {
  table: { km: "តុ", en: "Table" },
  add: { km: "បន្ថែម", en: "Add" },
  addToOrder: { km: "បន្ថែមទៅការកុម្ម៉ង់", en: "Add to order" },
  soldOut: { km: "អស់ហើយ", en: "Sold out" },
  required: { km: "ត្រូវជ្រើសរើស", en: "Required" },
  optional: { km: "ស្រេចចិត្ត", en: "Optional" },
  pickUpTo: { km: "ជ្រើសបានដល់", en: "Pick up to" },
  note: { km: "កំណត់ចំណាំ (ឧ. មិនដាក់ខ្ទឹម)", en: "Note (e.g. no onion)" },
  viewOrder: { km: "មើលការកុម្ម៉ង់", en: "View order" },
  yourOrder: { km: "ការកុម្ម៉ង់របស់អ្នក", en: "Your order" },
  subtotal: { km: "សរុបរង", en: "Subtotal" },
  vat: { km: "អាករ", en: "VAT" },
  service: { km: "សេវា", en: "Service charge" },
  total: { km: "សរុប", en: "Total" },
  send: { km: "ផ្ញើការកុម្ម៉ង់", en: "Send order" },
  sendSoon: {
    km: "ការកុម្ម៉ង់តាម QR នឹងបើកឆាប់ៗនេះ។ សូមហៅបុគ្គលិកដើម្បីកុម្ម៉ង់។",
    en: "QR ordering opens soon. Please ask a staff member to take your order.",
  },
  empty: { km: "មិនទាន់មានអ្វីនៅឡើយ", en: "Nothing added yet" },
  close: { km: "បិទ", en: "Close" },
} satisfies Record<string, Record<Lang, string>>;

export function t(key: keyof typeof text, lang: Lang): string {
  return text[key][lang];
}
