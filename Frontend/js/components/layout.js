/**
 * layout.js — componentes del armazón: usuario de sesión, menú por rol
 * y encabezado de página. Construye el DOM sin innerHTML con datos.
 * Script clásico: expone `window.tm.layout`.
 */
(function (global) {
  "use strict";

  const { ROLE_LABELS, ROLE_CONTEXT, ROLES } = global.tm.roles;
  const { getNavForRole, findNavItem } = global.tm.nav;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  const SCENARIOS = [
    { value: "exito", label: "Éxito" },
    { value: "carga", label: "Cargando" },
    { value: "vacio", label: "Sin datos" },
    { value: "error", label: "Error" }
  ];

  function renderHeaderUser(container, { user, role, scenario, onRoleChange, onScenarioChange, onLogout }) {
    clear(container);

    container.appendChild(el("span", "app-header__user-name", user?.nombre ?? "No autenticado"));
    container.appendChild(el("span", "app-header__badge", ROLE_LABELS[role] ?? role));

    const roleWrap = el("label", "app-header__role");
    roleWrap.appendChild(el("span", null, "Rol (demo)"));
    const select = el("select", "app-header__role-select");
    select.setAttribute("aria-label", "Selector de rol para demostración");
    for (const value of Object.values(ROLES)) {
      const option = el("option", null, ROLE_LABELS[value]);
      option.value = value;
      if (value === role) option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener("change", (event) => onRoleChange?.(event.target.value));
    roleWrap.appendChild(select);
    container.appendChild(roleWrap);

    // Selector de escenarios (X-Scenario) — HU-09 / TASK-09.4.
    const scenarioWrap = el("label", "app-header__role");
    scenarioWrap.appendChild(el("span", null, "Escenario (demo)"));
    const scenarioSelect = el("select", "app-header__scenario-select");
    scenarioSelect.setAttribute("aria-label", "Selector de escenario de demostración");
    for (const item of SCENARIOS) {
      const option = el("option", null, item.label);
      option.value = item.value;
      if (item.value === scenario) option.selected = true;
      scenarioSelect.appendChild(option);
    }
    scenarioSelect.addEventListener("change", (event) => onScenarioChange?.(event.target.value));
    scenarioWrap.appendChild(scenarioSelect);
    container.appendChild(scenarioWrap);

    const logout = el("button", "app-header__logout", "Salir");
    logout.type = "button";
    logout.addEventListener("click", () => onLogout?.());
    container.appendChild(logout);
  }

  function renderNav(container, { role, currentRoute }) {
    clear(container);

    for (const group of getNavForRole(role)) {
      const groupEl = el("div", "app-nav__group");
      groupEl.appendChild(el("p", "app-nav__group-title", group.title));

      const list = el("ul", "app-nav__list");
      for (const item of group.items) {
        const li = el("li");
        const link = el("a", "app-nav__link", item.label);
        link.href = item.route;
        if (item.route === currentRoute) link.setAttribute("aria-current", "page");
        li.appendChild(link);
        list.appendChild(li);
      }
      groupEl.appendChild(list);
      container.appendChild(groupEl);
    }
  }

  function pageHeader(title, subtitle) {
    const header = el("div", "app-page-header");
    header.appendChild(el("h1", "app-page-header__title", title));
    if (subtitle) header.appendChild(el("p", "app-page-header__subtitle", subtitle));
    return header;
  }

  function renderView(container, { route, role }) {
    clear(container);

    const inner = el("div", "app-content__inner");
    const item = findNavItem(role, route);
    const title = item?.label ?? "Vista en construcción";

    inner.appendChild(pageHeader(title, `Rol activo: ${ROLE_LABELS[role]} · ${ROLE_CONTEXT[role]}`));

    const note = el(
      "p",
      "app-placeholder",
      `Pantalla pendiente de implementación. Ruta: ${route}`
    );
    inner.appendChild(note);

    container.appendChild(inner);
  }

  global.tm.layout = { el, clear, renderHeaderUser, renderNav, pageHeader, renderView };
})(window);