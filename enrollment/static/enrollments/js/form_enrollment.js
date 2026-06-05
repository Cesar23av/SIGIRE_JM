/* =========================================================
   FORM_ENROLLMENT.JS - FORMULARIO DE INSCRIPCIÓN
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initEnrollmentTypeQuestion();
  initEnrollmentForm();
  initRudeMode();
  initDocumentsProgress();
});


/* =========================================================
   1. PREGUNTA INICIAL DE TIPO DE INSCRIPCIÓN
   ========================================================= */

function initEnrollmentTypeQuestion() {
  if (typeof configInscripcion === "undefined") return;
  if (!configInscripcion.mostrarPregunta) return;

  if (typeof Swal === "undefined") {
    const option = window.confirm(
      "Aceptar: estudiante nuevo. Cancelar: estudiante registrado sin inscripción previa."
    );

    window.location.href = option
      ? configInscripcion.urlEstudianteNuevo
      : configInscripcion.urlEstudianteRegistradoSinInscripcion;

    return;
  }

  Swal.fire({
    title: "Tipo de inscripción",
    html: `
      <div class="inscription-type-content">
        <p>Seleccione el escenario del estudiante para continuar con el flujo correcto.</p>

        <div class="inscription-type-grid">
          <div>
            <strong>Estudiante nuevo</strong>
            <span>No existe aún en el sistema.</span>
          </div>

          <div>
            <strong>Registrado sin inscripción previa</strong>
            <span>Existe como estudiante, pero todavía no fue inscrito.</span>
          </div>

          <div>
            <strong>Con inscripción previa</strong>
            <span>Ya cuenta con historial académico anterior.</span>
          </div>
        </div>
      </div>
    `,
    icon: "question",
    showConfirmButton: true,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-user-plus"></i> Estudiante nuevo',
    denyButtonText: '<i class="fa-solid fa-user-check"></i> Registrado sin previa',
    cancelButtonText: '<i class="fa-solid fa-clock-rotate-left"></i> Con inscripción previa',
    confirmButtonColor: "#10b981",
    denyButtonColor: "#2563eb",
    cancelButtonColor: "#c62828",
    allowOutsideClick: false,
    allowEscapeKey: false,
    reverseButtons: false,
    customClass: {
      popup: "swal-inscripcion-popup",
      actions: "swal-inscripcion-actions",
      confirmButton: "swal-btn-nuevo",
      denyButton: "swal-btn-registrado",
      cancelButton: "swal-btn-previo",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = configInscripcion.urlEstudianteNuevo;
    } else if (result.isDenied) {
      window.location.href = configInscripcion.urlEstudianteRegistradoSinInscripcion;
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      window.location.href = configInscripcion.urlEstudianteConInscripcionPrevia;
    }
  });
}


/* =========================================================
   2. FORMULARIO
   ========================================================= */

function initEnrollmentForm() {
  const form = document.getElementById("enrollForm");
  const btnSubmit = document.getElementById("btnConfirmEnroll");

  if (!form || !btnSubmit) return;

  updateFormState(form);

  form.addEventListener("input", function () {
    updateFormState(form);
  });

  form.addEventListener("change", function () {
    updateFormState(form);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateEnrollmentForm(form, true)) {
      showValidationAlert();
      focusFirstInvalid(form);
      return;
    }

    confirmEnrollment(form, btnSubmit);
  });
}

function validateEnrollmentForm(form, showFeedback = false) {
  const paralelo = document.getElementById("id_paralelo");
  const tipoRude = document.getElementById("tipoRude");
  const rude = document.getElementById("id_rude");

  let isValid = true;

  if (paralelo && !paralelo.value) {
    setFieldState(paralelo, false, "Seleccione un curso o paralelo.", showFeedback);
    isValid = false;
  } else if (paralelo) {
    setFieldState(paralelo, true, "Curso seleccionado.", showFeedback);
  }

  if (tipoRude && tipoRude.value === "manual") {
    if (!rude || !rude.value.trim()) {
      setFieldState(rude, false, "Ingrese el RUDE existente.", showFeedback);
      isValid = false;
    } else if (rude.value.trim().length < 6) {
      setFieldState(rude, false, "Ingrese un RUDE válido.", showFeedback);
      isValid = false;
    } else {
      setFieldState(rude, true, "RUDE válido.", showFeedback);
    }
  } else if (rude && !rude.readOnly) {
    clearFieldState(rude);
  }

  updateStatusCard(isValid);

  return isValid;
}

function updateFormState(form) {
  const isValid = validateEnrollmentForm(form, false);
  const btnSubmit = document.getElementById("btnConfirmEnroll");

  if (btnSubmit) {
    btnSubmit.disabled = !isValid;
  }
}

function updateStatusCard(isValid) {
  const statusCard = document.getElementById("enrollFormStatus");
  const title = statusCard ? statusCard.querySelector("strong") : null;
  const text = statusCard ? statusCard.querySelector("span") : null;
  const icon = statusCard ? statusCard.querySelector("i") : null;

  if (!statusCard) return;

  statusCard.classList.remove("status-ready", "status-error", "status-warning");

  if (!isValid) {
    statusCard.classList.add("status-error");

    if (icon) icon.className = "fa-solid fa-circle-exclamation";
    if (title) title.textContent = "Formulario incompleto";
    if (text) text.textContent = "Seleccione curso/paralelo y complete los campos requeridos.";

    return;
  }

  statusCard.classList.add("status-ready");

  if (icon) icon.className = "fa-solid fa-circle-check";
  if (title) title.textContent = "Formulario listo";
  if (text) text.textContent = "La inscripción puede ser confirmada.";
}


/* =========================================================
   3. RUDE
   ========================================================= */

function initRudeMode() {
  const tipoRude = document.getElementById("tipoRude");
  const rudeInput = document.getElementById("id_rude");
  const rudeHelp = document.getElementById("rudeHelp");

  if (!tipoRude || !rudeInput) return;

  syncRudeMode();

  tipoRude.addEventListener("change", function () {
    syncRudeMode();
    validateEnrollmentForm(document.getElementById("enrollForm"), true);
  });

  rudeInput.addEventListener("input", function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
  });

  function syncRudeMode() {
    if (tipoRude.value === "manual") {
      rudeInput.disabled = false;
      rudeInput.classList.remove("rude-hidden");
      rudeInput.placeholder = "Ingrese RUDE existente";
      rudeInput.focus();

      if (rudeHelp) {
        rudeHelp.textContent = "Ingrese el RUDE que el estudiante ya tenía en otra unidad educativa.";
      }

      return;
    }

    rudeInput.value = "";
    rudeInput.disabled = true;
    rudeInput.classList.add("rude-hidden");

    if (rudeHelp) {
      rudeHelp.textContent = "El sistema generará el RUDE automáticamente al confirmar la inscripción.";
    }

    clearFieldState(rudeInput);
  }
}


/* =========================================================
   4. DOCUMENTOS
   ========================================================= */

function initDocumentsProgress() {
  const checklist = document.getElementById("requirementsChecklist");
  const counter = document.getElementById("docsCounter");
  const progress = document.getElementById("docsProgress");

  if (!checklist || !counter || !progress) return;

  const checks = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));

  function updateProgress() {
    const total = checks.length;
    const checked = checks.filter((check) => check.checked).length;
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

    counter.textContent = checked;
    progress.style.width = `${percent}%`;
  }

  checks.forEach((check) => {
    check.addEventListener("change", updateProgress);
  });

  updateProgress();
}


/* =========================================================
   5. ESTADO VISUAL DE CAMPOS
   ========================================================= */

function setFieldState(control, isValid, message, showFeedback = false) {
  const group = control.closest(".form-group");

  if (!group) return;

  const feedback = group.querySelector(".field-feedback");

  control.classList.remove("input-valid", "input-invalid");

  if (feedback) {
    feedback.classList.remove("show", "feedback-valid", "feedback-invalid");
    feedback.innerHTML = "";
  }

  if (isValid) {
    control.classList.add("input-valid");

    if (feedback && showFeedback) {
      feedback.classList.add("show", "feedback-valid");
      feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    }

    return;
  }

  control.classList.add("input-invalid");

  if (feedback && showFeedback) {
    feedback.classList.add("show", "feedback-invalid");
    feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
  }
}

function clearFieldState(control) {
  const group = control.closest(".form-group");

  if (!group) return;

  const feedback = group.querySelector(".field-feedback");

  control.classList.remove("input-valid", "input-invalid");

  if (feedback) {
    feedback.classList.remove("show", "feedback-valid", "feedback-invalid");
    feedback.innerHTML = "";
  }
}


/* =========================================================
   6. ALERTAS
   ========================================================= */

function confirmEnrollment(form, btnSubmit) {
  if (typeof Swal === "undefined") {
    const accepted = confirm("¿Confirmar inscripción académica?");

    if (accepted) {
      submitEnrollment(form, btnSubmit);
    }

    return;
  }

  Swal.fire({
    title: "¿Confirmar inscripción?",
    text: "Se registrará la inscripción académica del estudiante en la gestión actual.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#c62828",
    cancelButtonColor: "#64748b",
    confirmButtonText: '<i class="fa-solid fa-file-import"></i> Sí, confirmar',
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed) {
      submitEnrollment(form, btnSubmit);
    }
  });
}

function submitEnrollment(form, btnSubmit) {
  btnSubmit.classList.add("loading");
  btnSubmit.disabled = true;
  form.submit();
}

function showValidationAlert() {
  if (typeof Swal === "undefined") {
    alert("Complete correctamente los campos requeridos.");
    return;
  }

  Swal.fire({
    title: "Formulario incompleto",
    text: "Complete correctamente los campos requeridos antes de confirmar la inscripción.",
    icon: "warning",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#c62828",
  });
}

function focusFirstInvalid(form) {
  const invalid = form.querySelector(".input-invalid");

  if (!invalid) return;

  invalid.focus();
  invalid.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}