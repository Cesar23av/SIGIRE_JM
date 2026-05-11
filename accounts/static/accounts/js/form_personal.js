/* =========================================================
   FORM_PERSONAL.JS - VALIDACIÓN LIMPIA DE PERSONAL
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-personal");
  const btnSubmit = document.getElementById("btn-submit");

  if (!form || !btnSubmit) return;

  const firstNameInput = document.querySelector('input[name="first_name"]');
  const lastNameInput = document.querySelector('input[name="last_name"]');
  const ciInput = document.querySelector('input[name="cedula_identidad"]');
  const complementoInput = document.querySelector('input[name="complemento"]');
  const celularInput = document.querySelector('input[name="celular"]');
  const emailInput = document.querySelector('input[name="email"]');

  const isEditMode = form.dataset.editMode === "true";

  const touchedFields = new Set();

  let snapshot = {};
  const initialData = new FormData(form);

  for (const [key, value] of initialData.entries()) {
    snapshot[key] = value;
  }

  initInputs();
  updateSubmitState(false);
  initSubmitConfirmation();

  /* =========================================================
     1. EVENTOS DE CAMPOS
     ========================================================= */

  function initInputs() {
    bindTextInput(firstNameInput, normalizeName, validateFirstName);
    bindTextInput(lastNameInput, normalizeName, validateLastName);
    bindTextInput(ciInput, normalizeCI, validateCI);
    bindTextInput(complementoInput, normalizeComplement, validateComplemento);
    bindTextInput(celularInput, normalizeCelular, validateCelular);
    bindTextInput(emailInput, normalizeEmail, validateEmail);

    form.addEventListener("change", function () {
      updateSubmitState(false);
    });
  }

  function bindTextInput(input, normalizer, validator) {
    if (!input) return;

    input.addEventListener("input", function () {
      touchedFields.add(input.name);

      input.value = normalizer(input.value);

      validator(true);
      updateSubmitState(false);
    });

    input.addEventListener("blur", function () {
      touchedFields.add(input.name);

      if (input === firstNameInput || input === lastNameInput) {
        input.value = cleanSpaces(input.value);
      }

      validator(true);
      updateSubmitState(false);
    });
  }

  /* =========================================================
     2. NORMALIZADORES
     ========================================================= */

  function normalizeName(value) {
    return value
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
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
    return value.replace(/[^0-9]/g, "").slice(0, 10);
  }

  function normalizeCelular(value) {
    return value.replace(/[^0-9]/g, "").slice(0, 8);
  }

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }

  function normalizeComplement(value) {
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 2);

    if (cleaned.length === 1) {
      return cleaned.replace(/[^A-Z]/g, "");
    }

    if (cleaned.length === 2) {
      const first = cleaned.charAt(0).replace(/[^A-Z]/g, "");
      const second = cleaned.charAt(1).replace(/[^0-9]/g, "");
      return first + second;
    }

    return cleaned;
  }

  /* =========================================================
     3. VALIDACIONES
     ========================================================= */

  function validateFirstName(showFeedback = false) {
    if (!firstNameInput) return true;

    const value = cleanSpaces(firstNameInput.value);

    if (!value) {
      setFieldState(firstNameInput, false, "Los nombres son obligatorios.", showFeedback);
      return false;
    }

    if (value.length < 2) {
      setFieldState(firstNameInput, false, "Ingrese un nombre válido.", showFeedback);
      return false;
    }

    setFieldState(firstNameInput, true, "", showFeedback);
    return true;
  }

  function validateLastName(showFeedback = false) {
    if (!lastNameInput) return true;

    const value = cleanSpaces(lastNameInput.value);

    if (!value) {
      setFieldState(lastNameInput, false, "Los apellidos son obligatorios.", showFeedback);
      return false;
    }

    if (value.length < 2) {
      setFieldState(lastNameInput, false, "Ingrese apellidos válidos.", showFeedback);
      return false;
    }

    setFieldState(lastNameInput, true, "", showFeedback);
    return true;
  }

  function validateCI(showFeedback = false) {
    if (!ciInput || ciInput.disabled || ciInput.readOnly) return true;

    const value = ciInput.value.trim();

    if (!value) {
      setFieldState(ciInput, false, "La cédula de identidad es obligatoria.", showFeedback);
      return false;
    }

    if (!/^\d{5,10}$/.test(value)) {
      setFieldState(ciInput, false, "La CI debe tener entre 5 y 10 dígitos.", showFeedback);
      return false;
    }

    setFieldState(ciInput, true, "", showFeedback);
    return true;
  }

  function validateComplemento(showFeedback = false) {
    if (!complementoInput) return true;

    const value = complementoInput.value.trim();

    if (!value) {
      clearFieldState(complementoInput);
      return true;
    }

    if (!/^[A-Z][0-9]$/.test(value)) {
      setFieldState(complementoInput, false, "Formato válido: A1.", showFeedback);
      return false;
    }

    setFieldState(complementoInput, true, "", showFeedback);
    return true;
  }

  function validateCelular(showFeedback = false) {
    if (!celularInput) return true;

    const value = celularInput.value.trim();

    if (!value) {
      setFieldState(celularInput, false, "El celular es obligatorio.", showFeedback);
      return false;
    }

    if (!/^[67]\d{7}$/.test(value)) {
      setFieldState(celularInput, false, "Debe empezar con 6 o 7 y tener 8 dígitos.", showFeedback);
      return false;
    }

    setFieldState(celularInput, true, "", showFeedback);
    return true;
  }

  function validateEmail(showFeedback = false) {
    if (!emailInput) return true;

    const value = emailInput.value.trim();

    if (!value) {
      setFieldState(emailInput, false, "El correo electrónico es obligatorio.", showFeedback);
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(value)) {
      setFieldState(emailInput, false, "Correo inválido. Ej: usuario@correo.com", showFeedback);
      return false;
    }

    setFieldState(emailInput, true, "", showFeedback);
    return true;
  }

  /* =========================================================
     4. ESTADO VISUAL
     ========================================================= */

  function setFieldState(input, isValid, message, showFeedback = false) {
    const group = input.closest(".form-group");
    if (!group) return;

    let feedback = group.querySelector(".js-field-feedback");

    if (!feedback) {
      feedback = document.createElement("span");
      feedback.classList.add("js-field-feedback");
      group.appendChild(feedback);
    }

    input.classList.remove("input-valid", "input-invalid");
    feedback.classList.remove("show", "feedback-invalid");

    if (isValid) {
      input.classList.add("input-valid");
      feedback.innerHTML = "";
      return;
    }

    input.classList.add("input-invalid");

    if (!showFeedback) {
      feedback.innerHTML = "";
      return;
    }

    feedback.classList.add("show", "feedback-invalid");
    feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
  }

  function clearFieldState(input) {
    const group = input.closest(".form-group");
    if (!group) return;

    const feedback = group.querySelector(".js-field-feedback");

    input.classList.remove("input-valid", "input-invalid");

    if (feedback) {
      feedback.classList.remove("show", "feedback-invalid");
      feedback.innerHTML = "";
    }
  }

  /* =========================================================
     5. VALIDACIÓN GENERAL
     ========================================================= */

  function validateForm(showFeedback = false) {
    const validations = [
      validateFirstName(showFeedback),
      validateLastName(showFeedback),
      validateCI(showFeedback),
      validateComplemento(showFeedback),
      validateCelular(showFeedback),
      validateEmail(showFeedback),
    ];

    return validations.every(Boolean);
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

  function updateSubmitState(showFeedback = false) {
    const formIsValid = validateForm(showFeedback);

    if (isEditMode) {
      btnSubmit.disabled = !(formIsValid && hasChanges());
    } else {
      btnSubmit.disabled = !formIsValid;
    }
  }

  /* =========================================================
     6. CONFIRMACIÓN AL ENVIAR
     ========================================================= */

  function initSubmitConfirmation() {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm(true)) {
        updateSubmitState(true);
        showValidationAlert();
        return;
      }

      const title = isEditMode ? "¿Guardar cambios?" : "¿Confirmar registro?";
      const text = isEditMode
        ? "Se actualizarán los datos de este administrativo en el sistema."
        : "Se creará el usuario y se le enviarán sus credenciales por correo electrónico.";

      const confirmText = isEditMode
        ? '<i class="fa-solid fa-floppy-disk"></i> Sí, guardar cambios'
        : '<i class="fa-solid fa-envelope-circle-check"></i> Sí, registrar y enviar';

      if (typeof Swal === "undefined") {
        const accepted = window.confirm(`${title}\n\n${text}`);
        if (accepted) submitForm();
        return;
      }

      Swal.fire({
        title: title,
        text: text,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#64748b",
        confirmButtonText: confirmText,
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          submitForm();
        }
      });
    });
  }

  function showValidationAlert() {
    if (typeof Swal === "undefined") {
      alert("Revise los campos marcados antes de continuar.");
      return;
    }

    Swal.fire({
      title: "Formulario incompleto",
      text: "Revise los campos marcados antes de registrar o guardar cambios.",
      icon: "warning",
      confirmButtonColor: "#c62828",
      confirmButtonText: "Entendido",
    });
  }

  function submitForm() {
    btnSubmit.innerHTML = isEditMode
      ? '<i class="fa-solid fa-circle-notch fa-spin"></i> Guardando cambios...'
      : '<i class="fa-solid fa-circle-notch fa-spin"></i> Procesando y enviando correo...';

    btnSubmit.classList.add("loading");
    btnSubmit.disabled = true;

    form.submit();
  }
});