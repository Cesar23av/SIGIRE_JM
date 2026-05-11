/* =========================================================
   LIST_PERSONAL.JS - LISTADO DE PERSONAL
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initInactiveToggle();
  initSearchForm();
});


/* =========================================================
   1. TOGGLE ACTIVOS / INACTIVOS
   Cambia la vista sin perder filtros innecesariamente.
   ========================================================= */

function initInactiveToggle() {
  const toggleInactivos = document.getElementById("toggleInactivos");

  if (!toggleInactivos) return;

  toggleInactivos.addEventListener("change", function () {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (this.checked) {
      params.set("inactivos", "true");
    } else {
      params.delete("inactivos");
    }

    /*
      Conservamos filtros existentes:
      - q
      - rol

      Pero eliminamos página si después agregas paginación,
      porque al cambiar vista conviene volver al inicio.
    */
    params.delete("page");

    window.location.href = `${url.pathname}?${params.toString()}`;
  });
}


/* =========================================================
   2. FORMULARIO DE BÚSQUEDA
   Normaliza búsqueda y evita envíos vacíos sucios.
   ========================================================= */

function initSearchForm() {
  const searchForm = document.querySelector(".search-form");
  const searchInput = document.getElementById("search-q");
  const rolSelect = document.getElementById("search-rol");

  if (!searchForm) return;

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      this.value = this.value.replace(/\s+/g, " ");
    });

    searchInput.addEventListener("blur", function () {
      this.value = this.value.trim();
    });
  }

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    const queryValue = searchInput ? searchInput.value.trim() : "";
    const rolValue = rolSelect ? rolSelect.value : "";

    const currentParams = new URLSearchParams(window.location.search);

    if (currentParams.get("inactivos") === "true") {
      params.set("inactivos", "true");
    }

    if (queryValue) {
      params.set("q", queryValue);
    }

    if (rolValue) {
      params.set("rol", rolValue);
    }

    const queryString = params.toString();

    window.location.href = queryString
      ? `${url.pathname}?${queryString}`
      : url.pathname;
  });
}