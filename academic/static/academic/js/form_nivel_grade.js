/* =========================================================
   FORM_NIVEL_GRADE.JS - VALIDACIÓN NIVEL / GRADO
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initAcademicForms();
});

function initAcademicForms() {
  const forms = document.querySelectorAll(".academic-form");

  forms.forEach((form) => {
    const controls = form.querySelectorAll("input, select");
    const btnSubmit = form.querySelector('button[type="submit"]');

    if (!btnSubmit) return;

    controls.forEach((control) => {
      control.classList.add("form-control-academic");

      control.addEventListener("input", function () {
        if (control.tagName === "INPUT") {
          control.value = normalizeText(control.value);
        }

        validateForm(form, true);
        updateSubmitState(form);
      });

      control.addEventListener("change", function () {
        validateForm(form, true);
        updateSubmitState(form);
      });

      control.addEventListener("blur", function () {
        if (control.tagName === "INPUT") {
          control.value = cleanSpaces(control.value);
        }

        validateForm(form, true);
        updateSubmitState(form);
      });
    });

    const snapshot = getSnapshot(form);
    form.dataset.snapshot = JSON.stringify(snapshot);

    updateSubmitState(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const isValid = validateForm(form, true);
      const isEdit = btnSubmit.classList.contains("btn-edit");

      if (!isValid) {
        showValidationAlert();
        focusFirstInvalid(form);
        updateSubmitState(form);
        return;
      }

      if (isEdit && !hasChanges(form)) {
        showNoChangesAlert();
        return;
      }

      showConfirmSubmit(form, btnSubmit, isEdit);
    });
  });
}

/* =========================================================
   1. NORMALIZACIÓN
   ========================================================= */

function normalizeText(value) {
  return value
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.°º-]/g, "")
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

/* =========================================================
   2. VALIDACIÓN
   ========================================================= */

function validateForm(form, showFeedback = false) {
  const controls = Array.from(form.querySelectorAll("input, select")).filter(
    (control) =>
      control.name &&
      control.type !== "hidden" &&
      control.name !== "csrfmiddlewaretoken"
  );

  let isValid = true;

  controls.forEach((control) => {
    const validControl = validateControl(control, showFeedback);

    if (!validControl) {
      isValid = false;
    }
  });

  return isValid;
}

function validateControl(control, showFeedback = false) {
  const value = control.value.trim();

  if (!value) {
    const message =
      control.tagName === "SELECT"
        ? "Seleccione una opción válida."
        : "Este campo es obligatorio.";

    setFieldState(control, false, message, showFeedback);
    return false;
  }

  if (control.tagName === "INPUT" && value.length < 3) {
    setFieldState(control, false, "Ingrese un nombre válido.", showFeedback);
    return false;
  }

  setFieldState(control, true, "Campo válido.", showFeedback);
  return true;
}

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

/* =========================================================
   3. CAMBIOS EN EDICIÓN
   ========================================================= */

function getSnapshot(form) {
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
  const current = getSnapshot(form);

  return Object.keys(original).some((key) => original[key] !== current[key]);
}

function updateSubmitState(form) {
  const btnSubmit = form.querySelector('button[type="submit"]');
  if (!btnSubmit) return;

  const isEdit = btnSubmit.classList.contains("btn-edit");
  const isValid = validateForm(form, false);

  if (isEdit) {
    btnSubmit.disabled = !(isValid && hasChanges(form));
  } else {
    btnSubmit.disabled = !isValid;
  }
}

/* =========================================================
   4. ALERTAS
   ========================================================= */

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

function showConfirmSubmit(form, btnSubmit, isEdit) {
  if (typeof Swal === "undefined") {
    const accepted = confirm(
      isEdit ? "¿Guardar cambios?" : "¿Confirmar registro?"
    );

    if (accepted) {
      submitForm(form, btnSubmit);
    }

    return;
  }

  Swal.fire({
    title: isEdit ? "¿Guardar cambios?" : "¿Confirmar registro?",
    text: isEdit
      ? "Se actualizará la información académica seleccionada."
      : "Se creará este nuevo elemento académico.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#64748b",
    confirmButtonText: isEdit
      ? '<i class="fa-solid fa-floppy-disk"></i> Guardar cambios'
      : '<i class="fa-solid fa-check-double"></i> Confirmar registro',
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      submitForm(form, btnSubmit);
    }
  });
}

function submitForm(form, btnSubmit) {
  btnSubmit.innerHTML =
    '<i class="fa-solid fa-circle-notch fa-spin"></i> Procesando...';
  btnSubmit.disabled = true;
  form.submit();
}

function focusFirstInvalid(form) {
  const invalid = form.querySelector(".input-invalid");

  if (invalid) {
    invalid.focus();
    invalid.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}