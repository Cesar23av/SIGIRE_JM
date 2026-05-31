/* =========================================================
   DASHBOARD.JS - PANEL DE CONTROL MEJORADO
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initDashboard();
});


function initDashboard() {
  animateDashboardItems();
  animateCounters();
  animateProgressBars();
  highlightNoGestion();
}


/* =========================================================
   1. ANIMACIÓN DE ENTRADA
   ========================================================= */

function animateDashboardItems() {
  const items = document.querySelectorAll(".dashboard-animate");

  items.forEach((item, index) => {
    item.style.transitionDelay = `${index * 90}ms`;
    item.classList.add("visible");
  });
}


/* =========================================================
   2. ANIMACIÓN DE CONTADORES
   ========================================================= */

function animateCounters() {
  const counters = document.querySelectorAll(".counter-number");

  counters.forEach((counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 1000;
    const startTime = performance.now();

    function easeOutCubic(progress) {
      return 1 - Math.pow(1 - progress, 3);
    }

    function updateCounter(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = Math.floor(easedProgress * target);
      counter.textContent = currentValue.toLocaleString("es-BO");

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString("es-BO");
      }
    }

    requestAnimationFrame(updateCounter);
  });
}


/* =========================================================
   3. BARRAS DE PROGRESO
   ========================================================= */

function animateProgressBars() {
  const bars = document.querySelectorAll(".stat-progress-fill");

  bars.forEach((bar, index) => {
    const progress = Number(bar.dataset.progress || 0);
    const safeProgress = Math.max(0, Math.min(progress, 100));

    setTimeout(() => {
      bar.style.width = `${safeProgress}%`;
    }, 350 + index * 150);
  });
}


/* =========================================================
   4. ALERTA VISUAL SI NO HAY GESTIÓN ACTIVA
   ========================================================= */

function highlightNoGestion() {
  const noGestionBadge = document.getElementById("noGestionBadge");

  if (!noGestionBadge) return;

  noGestionBadge.classList.add("pulse-warning");

  if (typeof Swal !== "undefined") {
    setTimeout(() => {
      Swal.fire({
        title: "Sin gestión activa",
        text: "Para operar correctamente con inscripciones, primero habilita una gestión académica.",
        icon: "warning",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#c62828",
      });
    }, 650);
  }
}