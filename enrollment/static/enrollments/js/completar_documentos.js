/* =========================================================
   COMPLETAR_DOCUMENTOS.JS - REGULARIZACIÓN DOCUMENTAL
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initDocumentsForm();
  initDocumentsProgress();
  initDocumentAnimations();
});


function initDocumentsForm() {
  const form = document.getElementById("documentsForm");
  const saveButton = document.getElementById("btnSaveDocuments");

  if (!form || !saveButton) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const requiredCompleted = areRequiredDocumentsCompleted();

    if (!requiredCompleted) {
      showRequiredDocumentsAlert();
      return;
    }

    confirmSaveDocuments(form, saveButton);
  });
}


function initDocumentsProgress() {
  const checklist = document.getElementById("documentsChecklist");
  const counter = document.getElementById("documentsCounter");
  const progress = document.getElementById("documentsProgress");
  const statusCard = document.getElementById("documentsStatusCard");
  const saveButton = document.getElementById("btnSaveDocuments");

  if (!checklist || !counter || !progress || !saveButton) return;

  const checks = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));

  function updateProgress() {
    const total = checks.length;
    const checked = checks.filter((check) => check.checked).length;

    const requiredChecks = checks.filter((check) => check.dataset.required === "true");
    const requiredChecked = requiredChecks.filter((check) => check.checked).length;

    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

    counter.textContent = checked;
    progress.style.width = `${percent}%`;

    const requiredCompleted =
      requiredChecks.length > 0 && requiredChecked === requiredChecks.length;

    saveButton.disabled = !requiredCompleted;

    updateStatusCard(
      statusCard,
      checked,
      total,
      requiredChecked,
      requiredChecks.length
    );
  }

  checks.forEach((check) => {
    check.addEventListener("change", updateProgress);
  });

  updateProgress();
}


function areRequiredDocumentsCompleted() {
  const checklist = document.getElementById("documentsChecklist");

  if (!checklist) return false;

  const requiredChecks = Array.from(
    checklist.querySelectorAll('input[type="checkbox"][data-required="true"]')
  );

  if (requiredChecks.length === 0) return false;

  return requiredChecks.every((check) => check.checked);
}


function updateStatusCard(statusCard, checked, total, requiredChecked, requiredTotal) {
  if (!statusCard) return;

  const icon = statusCard.querySelector("i");
  const title = statusCard.querySelector("strong");
  const text = statusCard.querySelector("span");

  statusCard.classList.remove("status-ready", "status-warning", "status-error");

  if (total === 0) {
    statusCard.classList.add("status-warning");

    if (icon) icon.className = "fa-solid fa-circle-info";
    if (title) title.textContent = "Sin documentos registrados";
    if (text) text.textContent = "No hay documentos asociados a esta inscripción.";

    return;
  }

  if (requiredTotal > 0 && requiredChecked === requiredTotal) {
    statusCard.classList.add("status-ready");

    if (icon) icon.className = "fa-solid fa-circle-check";
    if (title) title.textContent = "Documentación obligatoria completa";
    if (text) text.textContent = "Ya puede guardar la regularización documental.";

    return;
  }

  if (checked > 0) {
    statusCard.classList.add("status-warning");

    if (icon) icon.className = "fa-solid fa-clock";
    if (title) title.textContent = "Faltan documentos obligatorios";
    if (text) text.textContent = "Marque todos los documentos obligatorios para habilitar el guardado.";

    return;
  }

  statusCard.classList.add("status-error");

  if (icon) icon.className = "fa-solid fa-circle-exclamation";
  if (title) title.textContent = "Documentación pendiente";
  if (text) text.textContent = "Debe marcar todos los documentos obligatorios para guardar.";
}


function showRequiredDocumentsAlert() {
  if (typeof Swal === "undefined") {
    alert("Debe marcar todos los documentos obligatorios antes de guardar.");
    return;
  }

  Swal.fire({
    title: "Documentos obligatorios pendientes",
    text: "Para guardar, primero debe marcar todos los documentos obligatorios como entregados.",
    icon: "warning",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#c62828",
  });
}


function confirmSaveDocuments(form, saveButton) {
  if (typeof Swal === "undefined") {
    const accepted = window.confirm("¿Guardar documentos entregados?");

    if (accepted) {
      submitDocumentsForm(form, saveButton);
    }

    return;
  }

  Swal.fire({
    title: "¿Guardar documentos?",
    text: "Se actualizará el estado documental de esta inscripción como completa.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#c62828",
    cancelButtonColor: "#64748b",
    confirmButtonText: '<i class="fa-solid fa-floppy-disk"></i> Sí, guardar',
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed) {
      submitDocumentsForm(form, saveButton);
    }
  });
}


function submitDocumentsForm(form, saveButton) {
  saveButton.classList.add("loading");
  saveButton.disabled = true;
  form.submit();
}


function initDocumentAnimations() {
  const items = document.querySelectorAll(".documents-section, .requirements-card");

  items.forEach((item, index) => {
    item.style.animationDelay = `${Math.min(index * 45, 250)}ms`;
    item.classList.add("document-fade-in");
  });
}