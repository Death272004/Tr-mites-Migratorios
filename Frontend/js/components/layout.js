/**
 * layout.js — componentes del armazón: usuario de sesión, menú por rol
 * y encabezado de página. Construye el DOM sin innerHTML con datos.
 * Script clásico: expone `window.tm.layout`.
 */
(function (global) {
  "use strict";

  const { ROLE_LABELS, ROLE_CONTEXT } = global.tm.roles;
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

  function profileIcon(className) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", className || "app-profile-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "12"); circle.setAttribute("cy", "8"); circle.setAttribute("r", "3.2");
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "currentColor");
    circle.setAttribute("stroke-width", "1.8");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M4.8 20c.8-3.5 3.2-5.4 7.2-5.4s6.4 1.9 7.2 5.4");
    path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(circle); svg.appendChild(path);
    return svg;
  }

  function renderHeaderUser(container, { user, role, authenticated, onNavigate, onLogout }) {
    clear(container);

    container.className = "app-contextbar";
    const contextTrigger = el("button", "app-context-trigger");
    contextTrigger.type = "button";
    contextTrigger.setAttribute("aria-expanded", "false");
    contextTrigger.setAttribute("aria-haspopup", "true");
    contextTrigger.appendChild(profileIcon("app-profile-icon"));
    contextTrigger.appendChild(el("span", "app-context-trigger__label", "Sesión"));
    contextTrigger.appendChild(el("span", "app-context-trigger__chevron"));

    const contextMenu = el("div", "app-context-menu");
    contextMenu.hidden = true;
    contextMenu.setAttribute("role", "menu");
    container.appendChild(contextTrigger);
    container.appendChild(contextMenu);

    const identity = el("div", "app-context-menu__identity");
    identity.appendChild(profileIcon("app-context-menu__profile-icon"));
    const identityText = el("div", "app-context-menu__identity-text");
    identityText.appendChild(el("span", "app-header__user-name", user?.nombre ?? "No autenticado"));
    identityText.appendChild(el("span", "app-header__badge", ROLE_LABELS[role] ?? role));
    identity.appendChild(identityText);
    contextMenu.appendChild(identity);

    const goTo = (route, text) => {
      const link = el("a", "app-context-menu__link", text);
      link.href = global.tm.router.toPath(route);
      link.setAttribute("role", "menuitem");
      link.addEventListener("click", () => onNavigate?.(route));
      return link;
    };
    if (authenticated) contextMenu.appendChild(goTo("#/perfil", "Mi perfil"));
    contextMenu.appendChild(goTo("#/cuenta/configuracion", "Configuración"));

    if (authenticated) {
      const logout = el("button", "app-header__logout", "Salir");
      logout.type = "button";
      logout.addEventListener("click", () => onLogout?.());
      contextMenu.appendChild(logout);
    }

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

    const closeButton = el("button", "app-nav__close", "Cerrar menú");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Cerrar menú");
    closeButton.appendChild(el("span", "app-nav__close-icon", "×"));
    closeButton.addEventListener("click", () => {
      container.classList.remove("is-open");
      const toggle = document.getElementById("nav-toggle");
      toggle?.setAttribute("aria-expanded", "false");
      closeMenus();
    });
    container.appendChild(closeButton);

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
        link.href = global.tm.router.toPath(item.route);
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
