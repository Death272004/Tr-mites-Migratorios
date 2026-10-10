/**
 * table.js — tabla reutilizable. Script clásico: expone `tm.ui.table`.
 */
(function (global) {
  "use strict";

  const { el } = global.tm.layout;

  function table({ headers = [], rows = [], emptyText = "No hay datos para mostrar" } = {}) {
    const wrapper = el("div", "table-wrapper");
    const tbl = el("table", "table");
    if (headers.length) {
      const thead = el("thead");
      const trh = el("tr");
      for (const h of headers) {
        const th = el("th", null, h.label);
        if (h.width) th.style.width = h.width;
        if (h.align) th.style.textAlign = h.align;
        trh.appendChild(th);
      }
      thead.appendChild(trh);
      tbl.appendChild(thead);
    }
    const tbody = el("tbody");
    if (rows.length === 0) {
      const tr = el("tr");
      const td = el("td");
      td.colSpan = headers.length || 1;
      td.textContent = emptyText;
      td.style.textAlign = "center";
      td.style.color = "var(--color-text-muted)";
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      for (const row of rows) {
        const tr = el("tr");
        for (const cell of row) {
          const td = el("td", null, cell.text ?? "");
          if (cell.align) td.style.textAlign = cell.align;
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
    }
    tbl.appendChild(tbody);
    wrapper.appendChild(tbl);
    return wrapper;
  }

  global.tm.ui.table = table;
})(window);