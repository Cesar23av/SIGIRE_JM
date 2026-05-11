/* =========================================================
   CHANGE_PASSWORD.JS - SEGURIDAD DE CONTRASEÑA
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initPasswordVisibility();
  initPasswordStrength();
  initSubmitLoading();
});


/* =========================================================
   1. MOSTRAR / OCULTAR CONTRASEÑAS
   ========================================================= */

function initPasswordVisibility() {
  const toggleButtons = document.querySelectorAll(".password-visibility-toggle");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      const icon = this.querySelector("i");

      if (!input || !icon) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";

      icon.classList.toggle("fa-eye", isPassword);
      icon.classList.toggle("fa-eye-slash", !isPassword);
    });
  });
}


/* =========================================================
   2. MEDIDOR DE SEGURIDAD
   Evalúa la nueva contraseña en tiempo real.
   ========================================================= */

function initPasswordStrength() {
  const password1 = document.getElementById("id_new_password1");
  const password2 = document.getElementById("id_new_password2");
  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");
  const matchMessage = document.getElementById("passwordMatchMessage");
  const submitButton = document.getElementById("btnUpdatePassword");

  if (!password1 || !strengthFill || !strengthText) return;

  function updateState() {
    const value = password1.value;
    const confirmation = password2 ? password2.value : "";

    const result = evaluatePassword(value);

    updateStrengthBar(result, strengthFill, strengthText);
    updateRules(result.rules);

    const passwordsMatch = password2 ? value && confirmation && value === confirmation : true;
    updateMatchMessage(value, confirmation, passwordsMatch, matchMessage);

    if (submitButton) {
      const canSubmit = result.score >= 5 && passwordsMatch;
      submitButton.disabled = !canSubmit;
      submitButton.classList.toggle("disabled", !canSubmit);
    }
  }

  password1.addEventListener("input", updateState);

  if (password2) {
    password2.addEventListener("input", updateState);
  }

  updateState();
}


/* =========================================================
   3. EVALUACIÓN DE CONTRASEÑA
   ========================================================= */

function evaluatePassword(password) {
  const commonPasswords = [
    "password",
    "contraseña",
    "123456",
    "12345678",
    "123456789",
    "admin",
    "admin123",
    "qwerty",
    "jesusmaria",
    "colegio",
    "sistema",
    "usuario"
  ];

  const lowerPassword = password.toLowerCase();

  const rules = {
    length: password.length >= 10,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    lowercase: /[a-záéíóúñ]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password),
    common: password.length > 0 && !commonPasswords.some((word) => lowerPassword.includes(word))
  };

  let score = Object.values(rules).filter(Boolean).length;

  if (password.length >= 14) {
    score += 1;
  }

  return {
    score: Math.min(score, 6),
    rules
  };
}


/* =========================================================
   4. ACTUALIZAR BARRA DE SEGURIDAD
   ========================================================= */

function updateStrengthBar(result, strengthFill, strengthText) {
  const score = result.score;

  strengthFill.className = "strength-fill";

  if (score <= 1) {
    strengthFill.style.width = "16%";
    strengthFill.classList.add("very-weak");
    strengthText.textContent = "Muy débil";
  } else if (score <= 2) {
    strengthFill.style.width = "33%";
    strengthFill.classList.add("weak");
    strengthText.textContent = "Débil";
  } else if (score <= 4) {
    strengthFill.style.width = "66%";
    strengthFill.classList.add("medium");
    strengthText.textContent = "Media";
  } else if (score === 5) {
    strengthFill.style.width = "85%";
    strengthFill.classList.add("strong");
    strengthText.textContent = "Fuerte";
  } else {
    strengthFill.style.width = "100%";
    strengthFill.classList.add("very-strong");
    strengthText.textContent = "Muy fuerte";
  }
}


/* =========================================================
   5. ACTUALIZAR CHECKLIST
   ========================================================= */

function updateRules(rules) {
  Object.entries(rules).forEach(([rule, isValid]) => {
    const item = document.querySelector(`[data-rule="${rule}"]`);

    if (!item) return;

    const icon = item.querySelector("i");

    item.classList.toggle("valid", isValid);

    if (icon) {
      icon.className = isValid
        ? "fa-solid fa-check-circle"
        : "fa-solid fa-circle";
    }
  });
}


/* =========================================================
   6. VALIDAR CONFIRMACIÓN
   ========================================================= */

function updateMatchMessage(password, confirmation, passwordsMatch, matchMessage) {
  if (!matchMessage) return;

  if (!confirmation) {
    matchMessage.textContent = "";
    matchMessage.className = "password-match-message";
    return;
  }

  if (passwordsMatch) {
    matchMessage.textContent = "Las contraseñas coinciden.";
    matchMessage.className = "password-match-message valid";
  } else {
    matchMessage.textContent = "Las contraseñas no coinciden.";
    matchMessage.className = "password-match-message invalid";
  }
}


/* =========================================================
   7. LOADING AL ENVIAR
   ========================================================= */

function initSubmitLoading() {
  const form = document.getElementById("changePasswordForm");
  const button = document.getElementById("btnUpdatePassword");

  if (!form || !button) return;

  form.addEventListener("submit", function () {
    button.classList.add("loading");
    button.disabled = true;
  });
}