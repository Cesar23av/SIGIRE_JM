/* =========================================================
   FORM_TUTOR.JS - REGISTRO Y EDICIÓN DE TUTOR
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initTutorForm();
});


function initTutorForm() {
  const form = document.getElementById("formTutor");
  const btnGuardar = document.getElementById("btnGuardar");

  if (!form || !btnGuardar) return;

  const snapshot = getFormSnapshot(form);
  form.dataset.snapshot = JSON.stringify(snapshot);

  initInputEvents(form);
  updateSubmitState(form, btnGuardar);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const isValid = validateForm(form, true);

    if (!isValid) {
      showValidationAlert();
      focusFirstInvalid(form);
      updateSubmitState(form, btnGuardar);
      return;
    }

    if (isEditMode(form) && !hasChanges(form)) {
      showNoChangesAlert();
      return;
    }

    confirmSubmit(form, btnGuardar);
  });
}


/* =========================================================
   1. EVENTOS Y NORMALIZACIÓN
   ========================================================= */

function initInputEvents(form) {
  const controls = form.querySelectorAll("input, select");

  controls.forEach((control) => {
    control.addEventListener("input", function () {
      normalizeField(control);
      validateControl(control, true);
      updateSubmitState(form, document.getElementById("btnGuardar"));
    });

    control.addEventListener("change", function () {
      validateControl(control, true);
      updateSubmitState(form, document.getElementById("btnGuardar"));
    });

    control.addEventListener("blur", function () {
      trimField(control);
      validateControl(control, true);
      updateSubmitState(form, document.getElementById("btnGuardar"));
    });
  });
}

function normalizeField(control) {
  if (control.disabled || control.readOnly) return;

  const name = control.name;

  if (["nombres", "apellidos", "ocupacion"].includes(name)) {
    const cursor = control.selectionStart;

    control.value = toTitleCase(
      control.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    );

    safeCursor(control, cursor);
  }

  if (name === "ci_nro") {
    control.value = control.value.replace(/[^0-9]/g, "").slice(0, 10);
  }

  if (name === "ci_comp") {
    let value = control.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 2);

    if (value.length === 1) {
      value = value.replace(/[^A-Z]/g, "");
    }

    if (value.length === 2) {
      const first = value.charAt(0).replace(/[^A-Z]/g, "");
      const second = value.charAt(1).replace(/[^0-9]/g, "");
      value = first + second;
    }

    control.value = value;
  }

  if (name === "celular") {
    control.value = control.value.replace(/[^0-9]/g, "").slice(0, 8);
  }
}

function trimField(control) {
  if (control.tagName === "INPUT") {
    control.value = control.value.replace(/\s+/g, " ").trim();
  }
}

function toTitleCase(value) {
  return value
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function safeCursor(control, cursor) {
  try {
    control.setSelectionRange(cursor, cursor);
  } catch {
    // Algunos inputs no permiten selección manual.
  }
}


/* =========================================================
   2. VALIDACIÓN
   ========================================================= */

function validateForm(form, showFeedback = false) {
  const controls = Array.from(form.querySelectorAll("input, select")).filter(
    (control) =>
      control.name &&
      control.type !== "hidden" &&
      !control.disabled &&
      !control.readOnly
  );

  let isValid = true;

  controls.forEach((control) => {
    const validControl = validateControl(control, showFeedback);

    if (!validControl) {
      isValid = false;
    }
  });

  updateStatusCard(form, isValid);

  return isValid;
}

function validateControl(control, showFeedback = false) {
  if (control.disabled || control.readOnly) {
    clearFieldState(control);
    return true;
  }

  const value = control.value.trim();
  const name = control.name;
  const required = control.hasAttribute("required");

  if (required && !value) {
    const message = control.tagName === "SELECT"
      ? "Seleccione una opción válida."
      : "Este campo es obligatorio.";

    setFieldState(control, false, message, showFeedback);
    return false;
  }

  if (!value && !required) {
    clearFieldState(control);
    return true;
  }

  if (["nombres", "apellidos", "ocupacion"].includes(name) && value.length < 2) {
    setFieldState(control, false, "Ingrese un dato válido.", showFeedback);
    return false;
  }

  if (name === "ci_nro" && !/^\d{5,10}$/.test(value)) {
    setFieldState(control, false, "La CI debe tener entre 5 y 10 dígitos.", showFeedback);
    return false;
  }

  if (name === "ci_comp" && value && !/^[A-Z][0-9]$/.test(value)) {
    setFieldState(
      control,
      false,
      "Formato válido: letra + número. Ej: A1.",
      showFeedback
    );
    return false;
  }

  if (name === "celular" && !/^[67]\d{7}$/.test(value)) {
    setFieldState(
      control,
      false,
      "Debe tener 8 dígitos y empezar con 6 o 7.",
      showFeedback
    );
    return false;
  }

  setFieldState(control, true, "Campo válido.", showFeedback);
  return true;
}

function setFieldState(control, isValid, message, showFeedback = false) {
  const fieldContainer =
    control.closest(".form-group") ||
    control.closest(".ci-field");

  if (!fieldContainer) return;

  const feedback = fieldContainer.querySelector(".field-feedback");

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
  const fieldContainer =
    control.closest(".form-group") ||
    control.closest(".ci-field");

  if (!fieldContainer) return;

  const feedback = fieldContainer.querySelector(".field-feedback");

  control.classList.remove("input-valid", "input-invalid");

  if (feedback) {
    feedback.classList.remove("show", "feedback-valid", "feedback-invalid");
    feedback.innerHTML = "";
  }
}


/* =========================================================
   3. ESTADO GENERAL
   ========================================================= */

function getFormSnapshot(form) {
  const data = new FormData(form);
  const snapshot = {};

  for (const [key, value] of data.entries()) {
    if (key !== "csrfmiddlewaretoken") {
      snapshot[key] = value.toString().trim();
    }
  }

  return snapshot;
}

function hasChanges(form) {
  const original = JSON.parse(form.dataset.snapshot || "{}");
  const current = getFormSnapshot(form);

  return Object.keys(original).some((key) => original[key] !== current[key]);
}

function updateSubmitState(form, btnGuardar) {
  if (!btnGuardar) return;

  const isValid = validateForm(form, false);

  if (isEditMode(form)) {
    btnGuardar.disabled = !(isValid && hasChanges(form));
  } else {
    btnGuardar.disabled = !isValid;
  }
}

function updateStatusCard(form, isValid) {
  const statusCard = document.getElementById("tutorFormStatus");
  const title = statusCard ? statusCard.querySelector("strong") : null;
  const text = statusCard ? statusCard.querySelector("span") : null;
  const icon = statusCard ? statusCard.querySelector("i") : null;

  if (!statusCard) return;

  statusCard.classList.remove("status-ready", "status-warning", "status-error");

  if (!isValid) {
    statusCard.classList.add("status-error");

    if (icon) icon.className = "fa-solid fa-circle-exclamation";
    if (title) title.textContent = "Formulario incompleto";
    if (text) text.textContent = "Completa correctamente los campos obligatorios.";

    return;
  }

  if (isEditMode(form) && !hasChanges(form)) {
    statusCard.classList.add("status-warning");

    if (icon) icon.className = "fa-solid fa-clock";
    if (title) title.textContent = "Sin cambios detectados";
    if (text) text.textContent = "Modifica al menos un dato para habilitar el guardado.";

    return;
  }

  statusCard.classList.add("status-ready");

  if (icon) icon.className = "fa-solid fa-circle-check";
  if (title) title.textContent = "Formulario listo";
  if (text) text.textContent = "Los datos están completos y pueden guardarse.";
}

function isEditMode(form) {
  return form.getAttribute("data-edit-mode") === "true";
}


/* =========================================================
   4. ENVÍO Y ALERTAS
   ========================================================= */

function confirmSubmit(form, btnGuardar) {
  const editMode = isEditMode(form);

  if (typeof Swal === "undefined") {
    const accepted = confirm(editMode ? "¿Guardar cambios?" : "¿Guardar tutor?");

    if (accepted) {
      submitForm(form, btnGuardar);
    }

    return;
  }

  Swal.fire({
    title: editMode ? "¿Guardar cambios?" : "¿Guardar tutor?",
    text: editMode
      ? "Se actualizarán los datos permitidos del tutor."
      : "Se registrará el tutor o apoderado en el sistema.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#c62828",
    cancelButtonColor: "#64748b",
    confirmButtonText: editMode
      ? '<i class="fa-solid fa-floppy-disk"></i> Guardar cambios'
      : '<i class="fa-solid fa-user-plus"></i> Guardar tutor',
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed) {
      submitForm(form, btnGuardar);
    }
  });
}

function submitForm(form, btnGuardar) {
  btnGuardar.classList.add("loading");
  btnGuardar.disabled = true;
  form.submit();
}

function showValidationAlert() {
  if (typeof Swal === "undefined") {
    alert("Completa correctamente los campos requeridos.");
    return;
  }

  Swal.fire({
    title: "Formulario incompleto",
    text: "Completa correctamente los campos requeridos antes de continuar.",
    icon: "warning",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#c62828",
  });
}

function showNoChangesAlert() {
  if (typeof Swal === "undefined") {
    alert("No se detectaron cambios para guardar.");
    return;
  }

  Swal.fire({
    title: "Sin cambios",
    text: "Modifica al menos un dato antes de guardar.",
    icon: "info",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#2563eb",
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