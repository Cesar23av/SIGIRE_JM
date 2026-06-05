/* =========================================================
   DETAIL_ENROLLMENT.JS - DETALLE DE INSCRIPCIÓN
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initDocumentProgress();
  initPrintButton();
  initDetailAnimations();
});


function initDocumentProgress() {
  const list = document.getElementById("documentsList");
  const counter = document.getElementById("documentsDeliveredCounter");
  const fill = document.getElementById("documentsProgressFill");

  if (!list || !counter || !fill) return;

  const documents = Array.from(list.querySelectorAll(".document-item"));
  const total = documents.length;
  const delivered = documents.filter((item) => item.dataset.delivered === "true").length;
  const percent = total > 0 ? Math.round((delivered / total) * 100) : 0;

  counter.textContent = delivered;
  fill.style.width = `${percent}%`;
}


function initPrintButton() {
  const printButton = document.getElementById("btnPrintEnrollment");

  if (!printButton) return;

  printButton.addEventListener("click", function () {
    printButton.classList.add("clicked");

    setTimeout(function () {
      printButton.classList.remove("clicked");
    }, 450);
  });
}


function initDetailAnimations() {
  const items = document.querySelectorAll(".detail-animate");

  items.forEach((item, index) => {
    item.style.animationDelay = `${Math.min(index * 45, 300)}ms`;
    item.classList.add("detail-fade-in");
  });
}