/* =========================================================
   PRINT_ENROLLMENT.JS - FORMULARIO IMPRIMIBLE
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initPrintPage();
  initPrintButton();
});


function initPrintPage() {
  const printPage = document.getElementById("printPage");

  if (!printPage) return;

  printPage.classList.add("print-page-ready");
}


function initPrintButton() {
  const printButton = document.getElementById("btnPrintEnrollment");

  if (!printButton) return;

  printButton.addEventListener("click", function () {
    preparePrint(printButton);
  });

  window.addEventListener("afterprint", function () {
    resetPrintButton(printButton);
  });
}


function preparePrint(printButton) {
  printButton.classList.add("loading");
  printButton.disabled = true;

  setTimeout(function () {
    window.print();

    setTimeout(function () {
      resetPrintButton(printButton);
    }, 700);
  }, 250);
}


function resetPrintButton(printButton) {
  printButton.classList.remove("loading");
  printButton.disabled = false;
}