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

  function renderHeaderUser(container, { user, role, scenario, onRoleChange, onScenarioChange, onLogout, onAutofill }) {
    clear(container);

    container.className = "app-contextbar";
    const contextTrigger = el("button", "app-context-trigger", "Sesión");
    contextTrigger.type = "button";
    contextTrigger.setAttribute("aria-expanded", "false");
    contextTrigger.setAttribute("aria-haspopup", "true");
    contextTrigger.appendChild(el("span", "app-context-trigger__chevron"));

    const contextMenu = el("div", "app-context-menu");
    contextMenu.hidden = true;
    contextMenu.setAttribute("role", "menu");
    container.appendChild(contextTrigger);
    container.appendChild(contextMenu);

    contextMenu.appendChild(el("span", "app-header__user-name", user?.nombre ?? "No autenticado"));
    contextMenu.appendChild(el("span", "app-header__badge", ROLE_LABELS[role] ?? role));

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
    contextMenu.appendChild(roleWrap);

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
    contextMenu.appendChild(scenarioWrap);

    // Botón de autorrellenado (solo demo): completa los campos de la pantalla
    // actual para agilizar las pruebas. No envía ni persiste datos.
    if (onAutofill) {
      const autofill = el("button", "app-header__autofill", "Autorrellenar");
      autofill.type = "button";
      autofill.title = "Completa los campos de esta pantalla con datos de prueba";
      autofill.addEventListener("click", () => {
        const res = onAutofill();
        const n = res && res.count ? res.count : 0;
        autofill.textContent = n ? `Rellenado (${n})` : "Sin campos";
        setTimeout(() => { autofill.textContent = "Autorrellenar"; }, 1400);
      });
      contextMenu.appendChild(autofill);
    }

    const logout = el("button", "app-header__logout", "Salir");
    logout.type = "button";
    logout.addEventListener("click", () => onLogout?.());
    contextMenu.appendChild(logout);

    const closeContext = () => {
      contextMenu.hidden = true;
      contextTrigger.setAttribute("aria-expanded", "false");
      container.classList.remove("is-open");
    };
    contextTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = contextTrigger.getAttribute("aria-expanded") === "true";
      closeContext();
      if (!open) {
        contextMenu.hidden = false;
        contextTrigger.setAttribute("aria-expanded", "true");
        container.classList.add("is-open");
      }
    });
    if (container._outsideContextHandler) {
      document.removeEventListener("click", container._outsideContextHandler);
      document.removeEventListener("keydown", container._escapeContextHandler);
    }
    container._outsideContextHandler = (event) => {
      if (!container.contains(event.target)) closeContext();
    };
    container._escapeContextHandler = (event) => {
      if (event.key === "Escape") closeContext();
    };
    document.addEventListener("click", container._outsideContextHandler);
    document.addEventListener("keydown", container._escapeContextHandler);
  }

  function renderNav(container, { role, currentRoute }) {
    clear(container);

    const groups = [];
    const closeMenus = () => {
      groups.forEach(({ trigger, menu, groupEl }) => {
        trigger.setAttribute("aria-expanded", "false");
        menu.hidden = true;
        groupEl.classList.remove("is-open");
      });
    };

    for (const group of getNavForRole(role)) {
      const groupEl = el("div", "app-nav__group");
      const trigger = el("button", "app-nav__group-trigger");
      trigger.type = "button";
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-haspopup", "true");
      trigger.appendChild(el("span", null, group.title));
      trigger.appendChild(el("span", "app-nav__chevron"));

      const menu = el("ul", "app-nav__dropdown");
      menu.hidden = true;
      menu.setAttribute("role", "menu");
      let hasCurrent = false;
      for (const item of group.items) {
        const li = el("li");
        li.setAttribute("role", "none");
        const link = el("a", "app-nav__link", item.label);
        link.href = item.route;
        link.setAttribute("role", "menuitem");
        if (item.route === currentRoute) {
          link.setAttribute("aria-current", "page");
          hasCurrent = true;
        }
        li.appendChild(link);
        menu.appendChild(li);
      }
      if (hasCurrent) groupEl.classList.add("is-current");
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = trigger.getAttribute("aria-expanded") === "true";
        closeMenus();
        if (!open) {
          trigger.setAttribute("aria-expanded", "true");
          menu.hidden = false;
          groupEl.classList.add("is-open");
        }
      });
      groupEl.appendChild(trigger);
      groupEl.appendChild(menu);
      container.appendChild(groupEl);
      groups.push({ trigger, menu, groupEl });
    }

    if (container._linkMenuHandler) {
      container.removeEventListener("click", container._linkMenuHandler);
    }
    container._linkMenuHandler = (event) => {
      if (event.target.closest("a")) closeMenus();
    };
    container.addEventListener("click", container._linkMenuHandler);

    if (container._outsideMenuHandler) {
      document.removeEventListener("click", container._outsideMenuHandler);
      document.removeEventListener("keydown", container._escapeMenuHandler);
    }
    container._outsideMenuHandler = (event) => {
      if (!container.contains(event.target)) closeMenus();
    };
    container._escapeMenuHandler = (event) => {
      if (event.key === "Escape") closeMenus();
    };
    document.addEventListener("click", container._outsideMenuHandler);
    document.addEventListener("keydown", container._escapeMenuHandler);
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
