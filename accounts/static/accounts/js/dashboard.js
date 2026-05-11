/* =========================================================
   DASHBOARD.JS - PANEL DE CONTROL
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  animateCounters();
  animateDashboardCards();
  highlightNoGestion();
});


/* =========================================================
   1. ANIMACIÓN DE CONTADORES
   Hace que los números suban desde 0 hasta su valor real.
   ========================================================= */

function animateCounters() {
  const counters = document.querySelectorAll(".counter-number");

  counters.forEach((counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 900;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const currentValue = Math.floor(progress * target);
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
   2. ENTRADA SUAVE DE TARJETAS
   Da sensación de carga ordenada del dashboard.
   ========================================================= */

function animateDashboardCards() {
  const items = document.querySelectorAll(".dashboard-animate");

  items.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("visible");
    }, index * 120);
  });
}


/* =========================================================
   3. ALERTA VISUAL SI NO HAY GESTIÓN ACTIVA
   Refuerza el estado crítico del sistema.
   ========================================================= */

function highlightNoGestion() {
  const noGestionBadge = document.getElementById("noGestionBadge");

  if (!noGestionBadge) return;

  noGestionBadge.classList.add("pulse-warning");
}