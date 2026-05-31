/* =========================================================
   BASE_ADMIN.JS - INTERACCIONES DEL PANEL ADMINISTRATIVO
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initSidebarMobile();
  initSubmenus();
  initConfirmActions();
  initLogoutButton();
  initActiveNavigation();
});


/* =========================================================
   1. SIDEBAR RESPONSIVE
   ========================================================= */

function initSidebarMobile() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const menuToggle = document.getElementById("menuToggle");
  const sidebarClose = document.getElementById("sidebarClose");

  if (!sidebar || !overlay || !menuToggle) return;

  function openSidebar() {
    sidebar.classList.add("show");
    overlay.classList.add("show");
    document.body.classList.add("sidebar-open");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    sidebar.classList.remove("show");
    overlay.classList.remove("show");
    document.body.classList.remove("sidebar-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", openSidebar);
  overlay.addEventListener("click", closeSidebar);

  if (sidebarClose) {
    sidebarClose.addEventListener("click", closeSidebar);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });

  document.querySelectorAll(".sidebar a:not(.toggle-btn)").forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 980) {
        closeSidebar();
      }
    });
  });
}


/* =========================================================
   2. SUBMENÚS DEL SIDEBAR
   ========================================================= */

function initSubmenus() {
  const toggleButtons = document.querySelectorAll("[data-submenu-target]");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      const submenuId = button.dataset.submenuTarget;
      const submenu = document.getElementById(submenuId);
      const icon = button.querySelector(".chevron-icon");

      if (!submenu) return;

      const isOpen = submenu.classList.contains("open");

      closeOtherSubmenus(submenuId);

      submenu.classList.toggle("open", !isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));

      if (icon) {
        icon.classList.toggle("rotate", !isOpen);
      }
    });
  });
}

function closeOtherSubmenus(activeSubmenuId) {
  const allSubmenus = document.querySelectorAll(".sub-menu.open");

  allSubmenus.forEach((submenu) => {
    if (submenu.id === activeSubmenuId) return;

    submenu.classList.remove("open");

    const relatedButton = document.querySelector(
      `[data-submenu-target="${submenu.id}"]`
    );

    if (!relatedButton) return;

    relatedButton.setAttribute("aria-expanded", "false");

    const relatedIcon = relatedButton.querySelector(".chevron-icon");

    if (relatedIcon) {
      relatedIcon.classList.remove("rotate");
    }
  });
}


/* =========================================================
   3. CONFIRMACIONES GENERALES
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
      confirmColor: "#dc2626",
      onConfirm: function () {
        window.location.href = actionUrl;
      },
    });
  });
}


/* =========================================================
   4. CONFIRMACIÓN DE CIERRE DE SESIÓN
   ========================================================= */

function initLogoutButton() {
  const logoutForm = document.querySelector(".logout-form");

  if (!logoutForm) return;

  logoutForm.addEventListener("submit", function (event) {
    event.preventDefault();

    showConfirmDialog({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual en el sistema.",
      icon: "question",
      confirmText:
        '<i class="fa-solid fa-right-from-bracket"></i> Sí, salir',
      confirmColor: "#c62828",
      focusCancel: true,
      onConfirm: function () {
        logoutForm.submit();
      },
    });
  });
}


/* =========================================================
   5. RESALTAR NAVEGACIÓN ACTIVA
   ========================================================= */

function initActiveNavigation() {
  const activeItem =
    document.querySelector(".nav-item.active") ||
    document.querySelector(".nav-item.active-sub");

  if (!activeItem) return;

  activeItem.scrollIntoView({
    block: "nearest",
    behavior: "smooth",
  });
}


/* =========================================================
   6. SWEETALERT CON FALLBACK
   ========================================================= */

function showConfirmDialog({
  title,
  text,
  icon,
  confirmText,
  confirmColor,
  focusCancel,
  onConfirm,
}) {
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
    focusCancel: Boolean(focusCancel),
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === "function") {
      onConfirm();
    }
  });
}


/* =========================================================
   7. COMPATIBILIDAD TEMPORAL
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