/* =========================================================
   FORM_PERSONAL.JS - VALIDACIÓN MEJORADA DE PERSONAL
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-personal");
  const btnSubmit = document.getElementById("btn-submit");

  if (!form || !btnSubmit) return;

  const fields = {
    firstName: document.querySelector('input[name="first_name"]'),
    lastName: document.querySelector('input[name="last_name"]'),
    ci: document.querySelector('input[name="cedula_identidad"]'),
    complemento: document.querySelector('input[name="complemento"]'),
    celular: document.querySelector('input[name="celular"]'),
    email: document.querySelector('input[name="email"]'),
  };

  const statusCard = document.getElementById("form-status-card");
  const statusTitle = document.getElementById("form-status-title");
  const statusText = document.getElementById("form-status-text");
  const progressBar = document.getElementById("form-progress-bar");

  const isEditMode = form.dataset.editMode === "true";
  const touchedFields = new Set();
  const snapshot = getFormSnapshot();

  const validators = [
    {
      input: fields.firstName,
      normalizer: normalizeName,
      validator: validateFirstName,
    },
    {
      input: fields.lastName,
      normalizer: normalizeName,
      validator: validateLastName,
    },
    {
      input: fields.ci,
      normalizer: normalizeCI,
      validator: validateCI,
    },
    {
      input: fields.complemento,
      normalizer: normalizeComplement,
      validator: validateComplemento,
    },
    {
      input: fields.celular,
      normalizer: normalizeCelular,
      validator: validateCelular,
    },
    {
      input: fields.email,
      normalizer: normalizeEmail,
      validator: validateEmail,
    },
  ];

  initInputs();
  initSubmitConfirmation();
  refreshUI(false);

  /* =========================================================
     1. INICIALIZACIÓN
     ========================================================= */

  function initInputs() {
    validators.forEach(({ input, normalizer, validator }) => {
      bindInput(input, normalizer, validator);
    });

    form.addEventListener("change", function () {
      refreshUI(false);
    });
  }

  function bindInput(input, normalizer, validator) {
    if (!input) return;

    input.addEventListener("input", function () {
      touchedFields.add(input.name);

      const cursorPosition = input.selectionStart;
      input.value = normalizer(input.value);

      try {
        input.setSelectionRange(cursorPosition, cursorPosition);
      } catch (error) {
        // Algunos campos no permiten manipular cursor. No afecta la validación.
      }

      validator(true);
      refreshUI(false);
    });

    input.addEventListener("blur", function () {
      touchedFields.add(input.name);

      if (input === fields.firstName || input === fields.lastName) {
        input.value = cleanSpaces(input.value);
      }

      validator(true);
      refreshUI(false);
    });
  }

  function getFormSnapshot() {
    const data = {};
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  /* =========================================================
     2. NORMALIZADORES
     ========================================================= */

  function normalizeName(value) {
    return value
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      .replace(/\s{2,}/g, " ")
      .split(" ")
      .map((word) => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function cleanSpaces(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function normalizeCI(value) {
    return value.replace(/\D/g, "").slice(0, 10);
  }

  function normalizeCelular(value) {
    return value.replace(/\D/g, "").slice(0, 8);
  }

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }

  function normalizeComplement(value) {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 2);

    if (cleaned.length === 0) return "";

    if (cleaned.length === 1) {
      return cleaned.replace(/[^A-Z]/g, "");
    }

    const first = cleaned.charAt(0).replace(/[^A-Z]/g, "");
    const second = cleaned.charAt(1).replace(/[^0-9]/g, "");

    return first + second;
  }

  /* =========================================================
     3. VALIDACIONES
     ========================================================= */

  function validateFirstName(showFeedback = false) {
    const input = fields.firstName;
    if (!input) return true;

    const value = cleanSpaces(input.value);

    if (!value) {
      return setInvalid(input, "Los nombres son obligatorios.", showFeedback);
    }

    if (value.length < 2) {
      return setInvalid(input, "Ingrese un nombre válido.", showFeedback);
    }

    return setValid(input, "Nombre válido.");
  }

  function validateLastName(showFeedback = false) {
    const input = fields.lastName;
    if (!input) return true;

    const value = cleanSpaces(input.value);

    if (!value) {
      return setInvalid(input, "Los apellidos son obligatorios.", showFeedback);
    }

    if (value.length < 2) {
      return setInvalid(input, "Ingrese apellidos válidos.", showFeedback);
    }

    return setValid(input, "Apellido válido.");
  }

  function validateCI(showFeedback = false) {
    const input = fields.ci;
    if (!input || input.disabled || input.readOnly) return true;

    const value = input.value.trim();

    if (!value) {
      return setInvalid(input, "La cédula de identidad es obligatoria.", showFeedback);
    }

    if (!/^\d{5,10}$/.test(value)) {
      return setInvalid(input, "La CI debe tener entre 5 y 10 dígitos.", showFeedback);
    }

    return setValid(input, "CI válida.");
  }

  function validateComplemento(showFeedback = false) {
    const input = fields.complemento;
    if (!input) return true;

    const value = input.value.trim();

    if (!value) {
      clearFieldState(input);
      return true;
    }

    if (!/^[A-Z][0-9]$/.test(value)) {
      return setInvalid(input, "Formato válido: A1.", showFeedback);
    }

    return setValid(input, "Complemento válido.");
  }

  function validateCelular(showFeedback = false) {
    const input = fields.celular;
    if (!input) return true;

    const value = input.value.trim();

    if (!value) {
      return setInvalid(input, "El celular es obligatorio.", showFeedback);
    }

    if (!/^[67]\d{7}$/.test(value)) {
      return setInvalid(input, "Debe empezar con 6 o 7 y tener 8 dígitos.", showFeedback);
    }

    return setValid(input, "Celular válido.");
  }

  function validateEmail(showFeedback = false) {
    const input = fields.email;
    if (!input) return true;

    const value = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!value) {
      return setInvalid(input, "El correo electrónico es obligatorio.", showFeedback);
    }

    if (!emailPattern.test(value)) {
      return setInvalid(input, "Correo inválido. Ej: usuario@correo.com", showFeedback);
    }

    return setValid(input, "Correo válido.");
  }

  /* =========================================================
     4. ESTADO VISUAL DE CAMPOS
     ========================================================= */

  function setValid(input, message = "") {
    const group = input.closest(".form-group");
    if (!group) return true;

    const feedback = getOrCreateFeedback(group);

    input.classList.remove("input-invalid");
    input.classList.add("input-valid");

    feedback.className = "js-field-feedback feedback-valid show";
    feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;

    return true;
  }

  function setInvalid(input, message, showFeedback = false) {
    const group = input.closest(".form-group");
    if (!group) return false;

    const feedback = getOrCreateFeedback(group);

    input.classList.remove("input-valid");
    input.classList.add("input-invalid");

    if (!showFeedback && !touchedFields.has(input.name)) {
      feedback.className = "js-field-feedback";
      feedback.innerHTML = "";
      return false;
    }

    feedback.className = "js-field-feedback feedback-invalid show";
    feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

    return false;
  }

  function clearFieldState(input) {
    const group = input.closest(".form-group");
    if (!group) return;

    const feedback = group.querySelector(".js-field-feedback");

    input.classList.remove("input-valid", "input-invalid");

    if (feedback) {
      feedback.className = "js-field-feedback";
      feedback.innerHTML = "";
    }
  }

  function getOrCreateFeedback(group) {
    let feedback = group.querySelector(".js-field-feedback");

    if (!feedback) {
      feedback = document.createElement("span");
      feedback.classList.add("js-field-feedback");
      group.appendChild(feedback);
    }

    return feedback;
  }

  /* =========================================================
     5. VALIDACIÓN GENERAL
     ========================================================= */

  function validateForm(showFeedback = false) {
    return validators.every(({ validator }) => validator(showFeedback));
  }

  function getValidCount() {
    let count = 0;

    validators.forEach(({ input, validator }) => {
      if (!input) return;

      const isOptionalEmpty =
        input === fields.complemento && input.value.trim() === "";

      if (isOptionalEmpty || validator(false)) {
        count++;
      }
    });

    return count;
  }

  function hasChanges() {
    const currentData = new FormData(form);

    for (const [key, value] of currentData.entries()) {
      if (snapshot[key] !== value) {
        return true;
      }
    }

    return false;
  }

  function refreshUI(showFeedback = false) {
    const formIsValid = validateForm(showFeedback);
    const changed = hasChanges();

    if (isEditMode) {
      btnSubmit.disabled = !(formIsValid && changed);
    } else {
      btnSubmit.disabled = !formIsValid;
    }

    updateStatusCard(formIsValid, changed);
  }

  function updateStatusCard(formIsValid, changed) {
    if (!statusCard || !statusTitle || !statusText || !progressBar) return;

    const totalFields = validators.filter(({ input }) => input).length;
    const validCount = getValidCount();
    const progress = Math.round((validCount / totalFields) * 100);

    progressBar.style.width = `${progress}%`;

    statusCard.classList.remove(
      "status-pending",
      "status-success",
      "status-warning"
    );

    if (formIsValid && (!isEditMode || changed)) {
      statusCard.classList.add("status-success");
      statusTitle.textContent = "Formulario listo";
      statusText.textContent = isEditMode
        ? "Los datos son válidos y existen cambios para guardar."
        : "Los datos son válidos. Ya puedes finalizar el registro.";
      return;
    }

    if (isEditMode && formIsValid && !changed) {
      statusCard.classList.add("status-warning");
      statusTitle.textContent = "Sin cambios detectados";
      statusText.textContent = "Modifica al menos un dato para habilitar el guardado.";
      return;
    }

    statusCard.classList.add("status-pending");
    statusTitle.textContent = "Formulario pendiente";
    statusText.textContent = `Campos validados: ${validCount} de ${totalFields}.`;
  }

  /* =========================================================
     6. CONFIRMACIÓN AL ENVIAR
     ========================================================= */

  function initSubmitConfirmation() {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm(true)) {
        refreshUI(true);
        showValidationAlert();
        focusFirstInvalidField();
        return;
      }

      if (isEditMode && !hasChanges()) {
        showNoChangesAlert();
        return;
      }

      showConfirmAlert();
    });
  }

  function showConfirmAlert() {
    const title = isEditMode ? "¿Guardar cambios?" : "¿Confirmar registro?";

    const text = isEditMode
      ? "Se actualizarán los datos del personal administrativo seleccionado."
      : "Se creará el usuario administrativo y se enviarán sus credenciales por correo electrónico.";

    const confirmText = isEditMode
      ? '<i class="fa-solid fa-floppy-disk"></i> Guardar cambios'
      : '<i class="fa-solid fa-envelope-circle-check"></i> Registrar y enviar';

    if (typeof Swal === "undefined") {
      const accepted = window.confirm(`${title}\n\n${text}`);
      if (accepted) submitForm();
      return;
    }

    Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        submitForm();
      }
    });
  }

  function showValidationAlert() {
    if (typeof Swal === "undefined") {
      alert("Revise los campos marcados antes de continuar.");
      return;
    }

    Swal.fire({
      title: "Formulario incompleto",
      text: "Revisa los campos marcados antes de continuar.",
      icon: "warning",
      confirmButtonColor: "#c62828",
      confirmButtonText: "Entendido",
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
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Entendido",
    });
  }

  function focusFirstInvalidField() {
    const invalidInput = form.querySelector(".input-invalid");

    if (invalidInput) {
      invalidInput.focus();
      invalidInput.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  function submitForm() {
    btnSubmit.innerHTML = isEditMode
      ? '<i class="fa-solid fa-circle-notch fa-spin"></i> Guardando cambios...'
      : '<i class="fa-solid fa-circle-notch fa-spin"></i> Registrando y enviando...';

    btnSubmit.classList.add("loading");
    btnSubmit.disabled = true;

    form.submit();
  }
});