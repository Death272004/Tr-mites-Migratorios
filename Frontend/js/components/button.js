/**
 * Button — componente de botón con variantes.
 * Uso: button({ variant: "primary", text: "Aceptar", type: "button", onClick: fn })
 */

import { el } from "./layout.js";

export function button({ variant = "ghost", text = "", type = "button", disabled = false, onClick } = {}) {
  const cls = variant === "primary" ? "btn btn--primary" : variant === "secondary" ? "btn" : variant === "danger" ? "btn btn--danger" : "btn";
  const btn = el("button", cls, text);
  btn.type = type;
  btn.disabled = disabled;
  if (onClick) btn.addEventListener("click", onClick);
  return btn;
}
