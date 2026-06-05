/* =========================================================
   LIST_OF_SUBSCRIBERS.JS - LISTA DE INSCRITOS
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initSubscribersFilter();
  initPrintActions();
  initRowAnimations();
});


/* =========================================================
   1. FILTROS
   ========================================================= */

function initSubscribersFilter() {
  const form = document.getElementById("subscribersFilterForm");
  const searchInput = document.getElementById("subscriberSearchInput");
  const clearInput = document.getElementById("btnClearSubscriberInput");

  if (!form) return;

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      this.value = this.value.replace(/\s+/g, " ");
    });

    searchInput.addEventListener("blur", function () {
      this.value = this.value.trim();
    });
  }

  if (clearInput && searchInput) {
    clearInput.addEventListener("click", function () {
      searchInput.value = "";
      searchInput.focus();
    });
  }

  form.addEventListener("submit", function () {
    if (searchInput) {
      searchInput.value = searchInput.value.trim();
    }
  });
}


/* =========================================================
   2. ACCIÓN DE IMPRESIÓN
   ========================================================= */

function initPrintActions() {
  const printButtons = document.querySelectorAll(".js-print-enrollment");

  printButtons.forEach((button) => {
    button.addEventListener("click", function () {
      button.classList.add("clicked");

      setTimeout(function () {
        button.classList.remove("clicked");
      }, 450);
    });
  });
}


/* =========================================================
   3. ANIMACIÓN DE FILAS
   ========================================================= */

function initRowAnimations() {
  const rows = document.querySelectorAll(".subscriber-row");

  rows.forEach((row, index) => {
    row.style.animationDelay = `${Math.min(index * 35, 250)}ms`;
    row.classList.add("row-animate");
  });
}