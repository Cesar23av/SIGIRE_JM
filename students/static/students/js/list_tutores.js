/* =========================================================
   LIST_TUTORES.JS - LISTADO DE TUTORES
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initSearchForm();
  initNewTutorPrompt();
  initDeleteConfirmations();
  initRowAnimations();
});


/* =========================================================
   1. BUSCADOR
   ========================================================= */

function initSearchForm() {
  const form = document.getElementById("searchTutorForm");
  const input = document.getElementById("searchTutorInput");
  const clearInput = document.getElementById("btnClearTutorInput");

  if (!form) return;

  if (input) {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/\s+/g, " ");
    });

    input.addEventListener("blur", function () {
      this.value = this.value.trim();
    });
  }

  if (clearInput && input) {
    clearInput.addEventListener("click", function () {
      input.value = "";
      input.focus();
    });
  }

  form.addEventListener("submit", function () {
    if (input) {
      input.value = input.value.trim();
    }
  });
}


/* =========================================================
   2. PROMPT DESPUÉS DE REGISTRAR TUTOR
   ========================================================= */

function initNewTutorPrompt() {
  const urlParams = new URLSearchParams(window.location.search);
  const nuevoTutorId = urlParams.get("nuevo_tutor_id");

  if (!nuevoTutorId) return;

  if (typeof Swal === "undefined") {
    const accepted = window.confirm(
      "Tutor guardado. ¿Desea registrar ahora al estudiante asociado a este tutor?"
    );

    if (accepted) {
      window.location.href = `/crear-estudiante/?tutor_id=${nuevoTutorId}`;
    } else {
      cleanCurrentUrl();
    }

    return;
  }

  Swal.fire({
    title: "¡Tutor guardado!",
    text: "¿Desea registrar ahora al estudiante asociado a este tutor?",
    icon: "success",
    showCancelButton: true,
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#64748b",
    confirmButtonText: '<i class="fa-solid fa-user-plus"></i> Sí, registrar estudiante',
    cancelButtonText: "No, después",
    allowOutsideClick: false,
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `/crear-estudiante/?tutor_id=${nuevoTutorId}`;
      return;
    }

    cleanCurrentUrl();
  });
}

function cleanCurrentUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}


/* =========================================================
   3. CONFIRMACIÓN DE ELIMINACIÓN
   ========================================================= */

function initDeleteConfirmations() {
  document.body.addEventListener("click", function (event) {
    const deleteBtn = event.target.closest(".alerta-eliminar");

    if (!deleteBtn) return;

    event.preventDefault();

    const url = deleteBtn.getAttribute("href");
    const nombre = deleteBtn.getAttribute("data-nombre") || "este tutor";
    const extra = deleteBtn.getAttribute("data-extra") || "Esta acción no se puede deshacer.";

    confirmDeleteTutor(url, nombre, extra);
  });
}

function confirmDeleteTutor(url, nombre, extra) {
  if (!url) return;

  if (typeof Swal === "undefined") {
    const accepted = window.confirm(
      `¿Eliminar tutor?\n\n${nombre} será eliminado del sistema.`
    );

    if (accepted) {
      window.location.href = url;
    }

    return;
  }

  Swal.fire({
    title: "¿Eliminar tutor?",
    html: `
      <p><strong>${escapeHtml(nombre)}</strong> será eliminado del sistema.</p>
      <div class="swal-warning-box">
        ${escapeHtml(extra)}
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#c62828",
    cancelButtonColor: "#64748b",
    confirmButtonText: '<i class="fa-solid fa-trash-can"></i> Sí, eliminar',
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = url;
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   4. ANIMACIÓN DE FILAS
   ========================================================= */

function initRowAnimations() {
  const rows = document.querySelectorAll(".tutor-row");

  rows.forEach((row, index) => {
    row.style.animationDelay = `${Math.min(index * 35, 250)}ms`;
    row.classList.add("row-animate");
  });
}