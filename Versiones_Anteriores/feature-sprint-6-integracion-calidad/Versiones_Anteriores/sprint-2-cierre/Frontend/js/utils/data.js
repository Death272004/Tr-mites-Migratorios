/**
 * data.js — catálogos demo compartidos (países, provincias, bancos).
 * Ficticios; sustituibles por catálogos reales en Sprint 2.
 * Script clásico: expone `window.tm.data`.
 */
(function (global) {
  "use strict";

  var PAISES = [
    { value: "PA", label: "Panamá" },
    { value: "US", label: "Estados Unidos" },
    { value: "CO", label: "Colombia" },
    { value: "VE", label: "Venezuela" },
    { value: "CR", label: "Costa Rica" },
    { value: "NI", label: "Nicaragua" },
    { value: "CU", label: "Cuba" },
    { value: "DO", label: "República Dominicana" },
    { value: "ES", label: "España" },
    { value: "IT", label: "Italia" },
    { value: "CN", label: "China" },
    { value: "OTRO", label: "Otro" },
  ];

  var PROVINCIAS = ["Panamá", "Panamá Oeste", "Colón", "Chiriquí", "Veraguas", "Herrera", "Los Santos", "Coclé", "Bocas del Toro", "Darién"];

  var BANCOS = ["Banco Nacional de Panamá", "Caja de Ahorros", "Banco General", "Banistmo", "Banco de Occidente", "BAC Credomatic", "Otro"];

  function opciones(lista, placeholder) {
    var opts = placeholder ? [{ value: "", label: placeholder }] : [];
    for (var i = 0; i < lista.length; i++) opts.push(lista[i]);
    return opts;
  }

  global.tm.data = {
    PAISES: PAISES,
    PROVINCIAS: PROVINCIAS,
    BANCOS: BANCOS,
    paisOptions: function (ph) { return opciones(PAISES, ph); },
    provinciaOptions: function (ph) { return opciones(PROVINCIAS.map(function (p) { return { value: p, label: p }; }), ph); },
    bancoOptions: function (ph) { return opciones(BANCOS.map(function (b) { return { value: b, label: b }; }), ph); },
  };
})(window);