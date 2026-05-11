/* =========================================================
   BASE_ADMIN.JS - INTERACCIONES DEL PANEL ADMINISTRATIVO
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initSubmenus();
  initConfirmActions();
  initLogoutButton();
});


/* =========================================================
   1. SUBMENÚS DEL SIDEBAR
   Abre/cierra Estudiantes, Inscripciones, etc.
   ========================================================= */

function initSubmenus() {
  const toggleButtons = document.querySelectorAll("[data-submenu-target]");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      const submenuId = this.dataset.submenuTarget;
      const submenu = document.getElementById(submenuId);
      const icon = this.querySelector(".chevron-icon");

      if (!submenu) return;

      const isOpen = submenu.classList.contains("open");

      closeOtherSubmenus(submenuId);

      submenu.classList.toggle("open", !isOpen);
      this.setAttribute("aria-expanded", String(!isOpen));

      if (icon) {
        icon.classList.toggle("rotate", !isOpen);
      }
    });
  });
}

function closeOtherSubmenus(activeSubmenuId) {
  const allSubmenus = document.querySelectorAll(".sub-menu.open");

  allSubmenus.forEach((submenu) => {
    if (submenu.id !== activeSubmenuId) {
      submenu.classList.remove("open");

      const relatedButton = document.querySelector(
        `[data-submenu-target="${submenu.id}"]`
      );

      if (relatedButton) {
        relatedButton.setAttribute("aria-expanded", "false");

        const relatedIcon = relatedButton.querySelector(".chevron-icon");

        if (relatedIcon) {
          relatedIcon.classList.remove("rotate");
        }
      }
    }
  });
}


/* =========================================================
   2. CONFIRMACIONES GENERALES
   Para eliminar, desactivar, reactivar o acciones delicadas.
   Usa enlaces con clase .alerta-eliminar.
   ========================================================= */

function initConfirmActions() {
  document.body.addEventListener("click", function (event) {
    const actionButton = event.target.closest(".alerta-eliminar");

    if (!actionButton) return;

    event.preventDefault();

    const actionUrl = actionButton.getAttribute("href");
    const itemName = actionButton.getAttribute("data-nombre") || "este registro";
    const extraText = actionButton.getAttribute("data-extra") || "";

    if (!actionUrl || actionUrl === "#") return;

    const message = extraText
      ? extraText
      : `Estás a punto de procesar ${itemName}. Esta acción puede afectar el estado del registro.`;

    showConfirmDialog({
      title: "¿Confirmar acción?",
      text: message,
      icon: "warning",
      confirmText: '<i class="fa-solid fa-check"></i> Sí, proceder',
      confirmColor: "#ef4444",
      onConfirm: function () {
        window.location.href = actionUrl;
      },
    });
  });
}


/* =========================================================
   3. CONFIRMACIÓN DE CIERRE DE SESIÓN
   Evita salidas accidentales.
   ========================================================= */

function initLogoutButton() {
  const logoutForm = document.querySelector(".logout-form");

  if (!logoutForm) return;

  logoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (typeof Swal === "undefined") {
      alert("SweetAlert no está cargando. Revisa el script CDN.");
      return;
    }

    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual en el sistema.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#c62828",
      cancelButtonColor: "#64748b",
      confirmButtonText: '<i class="fa-solid fa-right-from-bracket"></i> Sí, salir',
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logoutForm.submit();
      }
    });
  });
}


/* =========================================================
   4. SWEETALERT CON FALLBACK
   Si SweetAlert no carga, usa confirm() tradicional.
   ========================================================= */

function showConfirmDialog({ title, text, icon, confirmText, confirmColor, onConfirm }) {
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
    confirmButtonColor: confirmColor || "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: confirmText || "Sí, proceder",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === "function") {
      onConfirm();
    }
  });
}


/* =========================================================
   5. COMPATIBILIDAD TEMPORAL
   Permite que templates antiguos con onclick sigan funcionando.
   Cuando ya actualices todo el HTML, puedes borrar esta función.
   ========================================================= */

function toggleSubMenu(event, submenuId) {
  if (event) event.preventDefault();

  const submenu = document.getElementById(submenuId);
  const button = event ? event.currentTarget : null;
  const icon = button ? button.querySelector(".chevron-icon") : null;

  if (!submenu) return;

  const isOpen = submenu.classList.contains("open");

  closeOtherSubmenus(submenuId);

  submenu.classList.toggle("open", !isOpen);

  if (button) {
    button.setAttribute("aria-expanded", String(!isOpen));
  }

  if (icon) {
    icon.classList.toggle("rotate", !isOpen);
  }
}