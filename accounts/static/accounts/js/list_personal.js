/* =========================================================
   LIST_PERSONAL.JS - LISTADO DE PERSONAL MEJORADO
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initInactiveToggle();
  initSearchForm();
  initClearSearchInput();
  initTableAnimation();
});


/* =========================================================
   1. TOGGLE ACTIVOS / INACTIVOS
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

    params.delete("page");

    window.location.href = params.toString()
      ? `${url.pathname}?${params.toString()}`
      : url.pathname;
  });
}


/* =========================================================
   2. FORMULARIO DE BÚSQUEDA
   ========================================================= */

function initSearchForm() {
  const searchForm = document.querySelector(".search-form");
  const searchInput = document.getElementById("search-q");
  const rolSelect = document.getElementById("search-rol");

  if (!searchForm) return;

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      this.value = normalizeSearchText(this.value);
      toggleClearButton();
    });

    searchInput.addEventListener("blur", function () {
      this.value = this.value.trim();
      toggleClearButton();
    });
  }

  if (rolSelect) {
    rolSelect.addEventListener("change", function () {
      searchForm.requestSubmit();
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


/* =========================================================
   3. LIMPIAR INPUT DE BÚSQUEDA
   ========================================================= */

function initClearSearchInput() {
  const clearButton = document.getElementById("btnClearSearchInput");
  const searchInput = document.getElementById("search-q");

  if (!clearButton || !searchInput) return;

  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    searchInput.focus();
    toggleClearButton();
  });

  toggleClearButton();
}

function toggleClearButton() {
  const clearButton = document.getElementById("btnClearSearchInput");
  const searchInput = document.getElementById("search-q");

  if (!clearButton || !searchInput) return;

  clearButton.classList.toggle("show", searchInput.value.trim().length > 0);
}


/* =========================================================
   4. ANIMACIÓN DE FILAS
   ========================================================= */

function initTableAnimation() {
  const rows = document.querySelectorAll(".personal-row");

  rows.forEach((row, index) => {
    row.style.animationDelay = `${index * 45}ms`;
    row.classList.add("row-animate");
  });
}


/* =========================================================
   5. UTILIDADES
   ========================================================= */

function normalizeSearchText(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "");
}