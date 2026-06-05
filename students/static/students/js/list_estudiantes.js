/* =========================================================
   LIST_ESTUDIANTES.JS - LISTADO DE ESTUDIANTES
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initInactiveToggle();
  initSearchForm();
  initRegisteredPrompt();
  initStudentActions();
  initRowAnimations();
});


/* =========================================================
   1. TOGGLE ACTIVOS / INACTIVOS
   ========================================================= */

function initInactiveToggle() {
  const searchForm = document.getElementById("searchForm");
  const toggleInactivos = document.getElementById("toggleInactivos");
  const hiddenInactivos = document.getElementById("hiddenInactivos");

  if (!toggleInactivos || !hiddenInactivos || !searchForm) return;

  toggleInactivos.addEventListener("change", function () {
    hiddenInactivos.value = this.checked ? "on" : "";

    const pageInput = searchForm.querySelector('input[name="page"]');

    if (pageInput) {
      pageInput.remove();
    }

    searchForm.submit();
  });
}


/* =========================================================
   2. BUSCADOR
   ========================================================= */

function initSearchForm() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const btnClearInput = document.getElementById("btnClearInput");

  if (!searchForm) return;

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      this.value = this.value.replace(/\s+/g, " ");
    });

    searchInput.addEventListener("blur", function () {
      this.value = this.value.trim();
    });
  }

  if (btnClearInput && searchInput) {
    btnClearInput.addEventListener("click", function () {
      searchInput.value = "";
      searchInput.focus();
    });
  }

  searchForm.addEventListener("submit", function (event) {
    if (!searchInput) return;

    searchInput.value = searchInput.value.trim();

    const pageInput = searchForm.querySelector('input[name="page"]');

    if (pageInput) {
      pageInput.remove();
    }
  });
}


/* =========================================================
   3. PROMPT DESPUÉS DE REGISTRAR
   ========================================================= */

function initRegisteredPrompt() {
  const urlParams = new URLSearchParams(window.location.search);
  const registradoId = urlParams.get("registrado_id");
  const nombreEst = urlParams.get("nombre_est");

  if (!registradoId || !nombreEst) return;

  if (typeof Swal === "undefined") {
    const accepted = window.confirm(
      `Registro exitoso. ¿Deseas realizar la inscripción académica de ${nombreEst}?`
    );

    if (accepted) {
      window.location.href = `/inscripciones/registrar/?estudiante_id=${registradoId}&tipo_inscripcion=sin_previa`;
    } else {
      cleanCurrentUrl();
    }

    return;
  }

  Swal.fire({
    title: "¡Registro exitoso!",
    text: `¿Deseas realizar la inscripción académica de ${nombreEst} ahora mismo?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#1e293b",
    cancelButtonColor: "#64748b",
    confirmButtonText: '<i class="fa-solid fa-file-signature"></i> Sí, inscribir ahora',
    cancelButtonText: "No, solo listar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `/inscripciones/registrar/?estudiante_id=${registradoId}&tipo_inscripcion=sin_previa`;
      return;
    }

    cleanCurrentUrl();
  });
}

function cleanCurrentUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}


/* =========================================================
   4. ACCIONES SOBRE ESTUDIANTES
   ========================================================= */

function initStudentActions() {
  document.body.addEventListener("click", function (event) {
    const deactivateBtn = event.target.closest(".sweet-deactivate");
    const reactivateBtn = event.target.closest(".sweet-reactivate");
    const deleteDbBtn = event.target.closest(".sweet-delete-db");

    if (deactivateBtn) {
      event.preventDefault();
      confirmDeactivate(deactivateBtn);
      return;
    }

    if (reactivateBtn) {
      event.preventDefault();
      confirmReactivate(reactivateBtn);
      return;
    }

    if (deleteDbBtn) {
      event.preventDefault();
      confirmDeleteDb(deleteDbBtn);
    }
  });
}

function confirmDeactivate(button) {
  const url = button.getAttribute("href");
  const nombre = button.getAttribute("data-nombre") || "este estudiante";

  showConfirmDialog({
    title: "¿Desactivar estudiante?",
    text: `${nombre} pasará a la lista de estudiantes inactivos.`,
    icon: "warning",
    confirmColor: "#f59e0b",
    confirmText: '<i class="fa-solid fa-user-slash"></i> Sí, desactivar',
    onConfirm: function () {
      window.location.href = url;
    },
  });
}

function confirmReactivate(button) {
  const url = button.getAttribute("href");
  const nombre = button.getAttribute("data-nombre") || "este estudiante";

  showConfirmDialog({
    title: "¿Reactivar estudiante?",
    text: `${nombre} volverá a la lista de estudiantes activos.`,
    icon: "question",
    confirmColor: "#16a34a",
    confirmText: '<i class="fa-solid fa-user-check"></i> Sí, reactivar',
    onConfirm: function () {
      window.location.href = url;
    },
  });
}

function confirmDeleteDb(button) {
  const url = button.getAttribute("href");
  const nombre = button.getAttribute("data-nombre") || "este estudiante";

  if (typeof Swal === "undefined") {
    const accepted = window.confirm(
      `¿Borrar definitivamente?\n\n${nombre} será eliminado de la base de datos.`
    );

    if (accepted) {
      window.location.href = url;
    }

    return;
  }

  Swal.fire({
    title: "¿Borrar definitivamente?",
    html: `
      <p><strong>${escapeHtml(nombre)}</strong> será eliminado de la base de datos.</p>
      <div class="swal-warning-box">
        Esta acción debe usarse solo cuando no exista historial académico asociado.
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

function showConfirmDialog({ title, text, icon, confirmColor, confirmText, onConfirm }) {
  if (typeof Swal === "undefined") {
    const accepted = window.confirm(`${title}\n\n${text}`);

    if (accepted && typeof onConfirm === "function") {
      onConfirm();
    }

    return;
  }

  Swal.fire({
    title: title,
    text: text,
    icon: icon || "warning",
    showCancelButton: true,
    confirmButtonColor: confirmColor || "#c62828",
    cancelButtonColor: "#64748b",
    confirmButtonText: confirmText || "Sí, continuar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === "function") {
      onConfirm();
    }
  });
}


/* =========================================================
   5. DIRECCIÓN
   ========================================================= */

function verDireccion(nombreEstudiante, direccionFisica) {
  const direccionBusqueda = encodeURIComponent(`${direccionFisica}, Oruro, Bolivia`);

  if (typeof Swal === "undefined") {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${direccionBusqueda}`,
      "_blank"
    );
    return;
  }

  Swal.fire({
    title: "Dirección del estudiante",
    html: `
      <div class="address-modal-content">
        <div class="address-modal-icon">
          <i class="fa-solid fa-map-location-dot"></i>
        </div>

        <p>Domicilio de <strong>${escapeHtml(nombreEstudiante)}</strong></p>

        <div class="address-box">
          ${escapeHtml(direccionFisica)}
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=${direccionBusqueda}"
          target="_blank"
          class="maps-link"
        >
          <i class="fa-solid fa-location-arrow"></i>
          Buscar en Google Maps
        </a>
      </div>
    `,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#1e293b",
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
   6. ANIMACIÓN
   ========================================================= */

function initRowAnimations() {
  const rows = document.querySelectorAll(".student-row");

  rows.forEach((row, index) => {
    row.style.animationDelay = `${Math.min(index * 35, 250)}ms`;
    row.classList.add("row-animate");
  });
}

window.verDireccion = verDireccion;