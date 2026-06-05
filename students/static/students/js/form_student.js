/* =========================================================
   FORM_STUDENT.JS - REGISTRO Y EDICIÓN DE ESTUDIANTE
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initStudentForm();
  initBirthDatePicker();
  initTutorQuestion();
});


function initStudentForm() {
  const studentForm = document.getElementById("studentForm");
  const btnSave = document.getElementById("btnSaveStudent");

  if (!studentForm || !btnSave) return;

  const snapshot = getFormSnapshot(studentForm);
  studentForm.dataset.snapshot = JSON.stringify(snapshot);

  initInputEvents(studentForm);
  updateSubmitState(studentForm, btnSave);

  studentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const isValid = validateForm(studentForm, true);

    if (!isValid) {
      showValidationAlert();
      focusFirstInvalid(studentForm);
      updateSubmitState(studentForm, btnSave);
      return;
    }

    if (isEditMode() && !hasChanges(studentForm)) {
      showNoChangesAlert();
      return;
    }

    confirmSubmit(studentForm, btnSave);
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
      updateSubmitState(form, document.getElementById("btnSaveStudent"));
    });

    control.addEventListener("change", function () {
      validateControl(control, true);
      updateSubmitState(form, document.getElementById("btnSaveStudent"));
    });

    control.addEventListener("blur", function () {
      trimField(control);
      validateControl(control, true);
      updateSubmitState(form, document.getElementById("btnSaveStudent"));
    });
  });
}

function normalizeField(control) {
  if (control.disabled || control.readOnly) return;

  const name = control.name;

  if (["nombres", "apellido_paterno", "apellido_materno"].includes(name)) {
    const cursor = control.selectionStart;
    control.value = toTitleCase(
      control.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    );
    safeCursor(control, cursor);
  }

  if (["avenida", "zona"].includes(name)) {
    control.value = toTitleCase(
      control.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.#°º-]/g, "")
    );
  }

  if (name === "num_puerta") {
    control.value = control.value.replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 12);
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

  if (name === "correo_electronico") {
    control.value = control.value.trim().toLowerCase();
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
    // Algunos inputs no permiten selección manual. No afecta el flujo.
  }
}


/* =========================================================
   2. VALIDACIÓN
   ========================================================= */
function calculateAge(birthDateValue) {
  const birthDate = new Date(birthDateValue);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const currentMonth = today.getMonth();
  const birthMonth = birthDate.getMonth();

  const currentDay = today.getDate();
  const birthDay = birthDate.getDate();

  const hasNotHadBirthdayThisYear =
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay);

  if (hasNotHadBirthdayThisYear) {
    age--;
  }

  return age;
}

function validateForm(form, showFeedback = false) {
  const controls = Array.from(form.querySelectorAll("input, select")).filter(
    (control) =>
      control.name &&
      control.type !== "hidden" &&
      !control.disabled
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

  if (["nombres", "apellido_paterno", "apellido_materno"].includes(name) && value.length < 2) {
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

  if (name === "fecha_nacimiento") {
  if (!isValidBirthDate(value)) {
    setFieldState(control, false, "Ingrese una fecha válida.", showFeedback);
    return false;
  }

  const age = calculateAge(value);

  if (age < 6) {
    setFieldState(
      control,
      false,
      "El estudiante debe tener 6 años cumplidos para poder inscribirse.",
      showFeedback
    );
    return false;
  }
}

  if (["avenida", "zona"].includes(name) && value.length < 2) {
    setFieldState(control, false, "Ingrese una dirección válida.", showFeedback);
    return false;
  }

  if (name === "correo_electronico" && value && !isValidEmail(value)) {
    setFieldState(control, false, "Correo inválido. Ej: usuario@correo.com", showFeedback);
    return false;
  }

  setFieldState(control, true, "Campo válido.", showFeedback);
  return true;
}

function isValidBirthDate(value) {
  if (!value) return false;

  const selectedDate = new Date(value);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate <= today;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function setFieldState(control, isValid, message, showFeedback = false) {
  const fieldContainer =
    control.closest(".form-group") ||
    control.closest(".ci-field") ||
    control.closest(".address-field");

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
    control.closest(".ci-field") ||
    control.closest(".address-field");

  if (!fieldContainer) return;

  const feedback = fieldContainer.querySelector(".field-feedback");

  control.classList.remove("input-valid", "input-invalid");

  if (feedback) {
    feedback.classList.remove("show", "feedback-valid", "feedback-invalid");
    feedback.innerHTML = "";
  }
}


/* =========================================================
   3. ESTADO DEL BOTÓN Y FORMULARIO
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

function updateSubmitState(form, btnSave) {
  if (!btnSave) return;

  const isValid = validateForm(form, false);

  if (isEditMode()) {
    btnSave.disabled = !(isValid && hasChanges(form));
  } else {
    btnSave.disabled = !isValid;
  }
}

function updateStatusCard(form, isValid) {
  const statusCard = document.getElementById("studentFormStatus");
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

  if (isEditMode() && !hasChanges(form)) {
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

function isEditMode() {
  return typeof configEstudiante !== "undefined" && Boolean(configEstudiante.esEdicion);
}


/* =========================================================
   4. ENVÍO Y ALERTAS
   ========================================================= */

function confirmSubmit(form, btnSave) {
  const editMode = isEditMode();

  if (typeof Swal === "undefined") {
    const accepted = confirm(editMode ? "¿Guardar cambios?" : "¿Registrar estudiante?");

    if (accepted) {
      submitForm(form, btnSave);
    }

    return;
  }

  Swal.fire({
    title: editMode ? "¿Guardar cambios?" : "¿Registrar estudiante?",
    text: editMode
      ? "Se actualizarán los datos permitidos del estudiante."
      : "Se registrará el estudiante en el sistema.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#c62828",
    cancelButtonColor: "#64748b",
    confirmButtonText: editMode
      ? '<i class="fa-solid fa-floppy-disk"></i> Guardar cambios'
      : '<i class="fa-solid fa-user-plus"></i> Registrar',
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      submitForm(form, btnSave);
    }
  });
}

function submitForm(form, btnSave) {
  btnSave.classList.add("loading");
  btnSave.disabled = true;
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


/* =========================================================
   5. CALENDARIO
   ========================================================= */

function initBirthDatePicker() {
  if (typeof flatpickr === "undefined") return;

    flatpickr("input[name='fecha_nacimiento']", {
    locale: "es",
    dateFormat: "Y-m-d",
    maxDate: getMaxAllowedBirthDate(),
    disableMobile: true,
    allowInput: true,
    });
}

function getMaxAllowedBirthDate() {
  const today = new Date();

  const maxDate = new Date(
    today.getFullYear() - 6,
    today.getMonth(),
    today.getDate()
  );

  return maxDate;
}


/* =========================================================
   6. PREGUNTA SOBRE TUTOR
   ========================================================= */

function initTutorQuestion() {
  if (
    typeof configEstudiante === "undefined" ||
    !configEstudiante.mostrarPregunta ||
    configEstudiante.esEdicion
  ) {
    return;
  }

  if (typeof Swal === "undefined") {
    const hasTutor = confirm("¿Ya registró al tutor?");

    window.location.href = hasTutor
      ? configEstudiante.urlListaTutores
      : configEstudiante.urlRegistrarTutor;

    return;
  }

  Swal.fire({
    title: "¿Ya registró al tutor?",
    text: "Para registrar un estudiante, primero debe existir un tutor en el sistema.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#c62828",
    cancelButtonColor: "#2563eb",
    confirmButtonText: "Sí, seleccionar tutor",
    cancelButtonText: "No, registrar tutor",
    allowOutsideClick: false,
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = configEstudiante.urlListaTutores;
    } else {
      window.location.href = configEstudiante.urlRegistrarTutor;
    }
  });
}