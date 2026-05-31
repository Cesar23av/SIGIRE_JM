/* =========================================================
   CHANGE_PASSWORD.JS - SEGURIDAD DE CONTRASEÑA MEJORADA
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

      icon.className = isPassword
        ? "fa-solid fa-eye"
        : "fa-solid fa-eye-slash";

      button.setAttribute(
        "aria-label",
        isPassword ? "Ocultar contraseña" : "Mostrar contraseña"
      );
    });
  });
}


/* =========================================================
   2. MEDIDOR DE SEGURIDAD
   ========================================================= */

function initPasswordStrength() {
  const password1 = document.getElementById("id_new_password1");
  const password2 = document.getElementById("id_new_password2");

  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");
  const matchMessage = document.getElementById("passwordMatchMessage");
  const submitButton = document.getElementById("btnUpdatePassword");

  const statusCard = document.getElementById("passwordStatusCard");
  const statusTitle = document.getElementById("passwordStatusTitle");
  const statusText = document.getElementById("passwordStatusText");

  if (!password1 || !strengthFill || !strengthText) return;

  function updateState() {
    const password = password1.value.trim();
    const confirmation = password2 ? password2.value.trim() : "";

    const result = evaluatePassword(password);
    const passwordsMatch = password2
      ? password.length > 0 && confirmation.length > 0 && password === confirmation
      : true;

    updateStrengthBar(result, strengthFill, strengthText);
    updateRules(result.rules);
    updateMatchMessage(password, confirmation, passwordsMatch, matchMessage);
    updateStatusCard(result, password, confirmation, passwordsMatch, statusCard, statusTitle, statusText);
    updateSubmitButton(result, passwordsMatch, submitButton);
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
    "usuario",
    "director",
    "secretaria"
  ];

  const lowerPassword = password.toLowerCase();

  const rules = {
    length: password.length >= 10,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    lowercase: /[a-záéíóúñ]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password),
    common:
      password.length > 0 &&
      !commonPasswords.some((word) => lowerPassword.includes(word)),
  };

  let score = Object.values(rules).filter(Boolean).length;

  if (password.length >= 14) {
    score += 1;
  }

  if (hasRepeatedPattern(password)) {
    score -= 1;
  }

  return {
    score: Math.max(0, Math.min(score, 6)),
    percentage: Math.round((Math.max(0, Math.min(score, 6)) / 6) * 100),
    rules,
  };
}

function hasRepeatedPattern(password) {
  if (!password) return false;

  return /(.)\1{2,}/.test(password) || /1234|abcd|qwer/i.test(password);
}


/* =========================================================
   4. ACTUALIZAR BARRA DE SEGURIDAD
   ========================================================= */

function updateStrengthBar(result, strengthFill, strengthText) {
  const score = result.score;

  strengthFill.className = "strength-fill";
  strengthFill.style.width = `${result.percentage}%`;

  if (score === 0) {
    strengthFill.style.width = "0%";
    strengthText.textContent = "0%";
    return;
  }

  if (score <= 1) {
    strengthFill.classList.add("very-weak");
    strengthText.textContent = `${result.percentage}% - Muy débil`;
  } else if (score <= 2) {
    strengthFill.classList.add("weak");
    strengthText.textContent = `${result.percentage}% - Débil`;
  } else if (score <= 4) {
    strengthFill.classList.add("medium");
    strengthText.textContent = `${result.percentage}% - Media`;
  } else if (score === 5) {
    strengthFill.classList.add("strong");
    strengthText.textContent = `${result.percentage}% - Fuerte`;
  } else {
    strengthFill.classList.add("very-strong");
    strengthText.textContent = `${result.percentage}% - Muy fuerte`;
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
    item.classList.toggle("invalid", !isValid);

    if (icon) {
      icon.className = isValid
        ? "fa-solid fa-circle-check"
        : "fa-regular fa-circle";
    }
  });
}


/* =========================================================
   6. VALIDAR CONFIRMACIÓN
   ========================================================= */

function updateMatchMessage(password, confirmation, passwordsMatch, matchMessage) {
  if (!matchMessage) return;

  if (!confirmation) {
    matchMessage.innerHTML = "";
    matchMessage.className = "password-match-message";
    return;
  }

  if (passwordsMatch) {
    matchMessage.innerHTML =
      '<i class="fa-solid fa-circle-check"></i> Las contraseñas coinciden.';
    matchMessage.className = "password-match-message valid";
  } else {
    matchMessage.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Las contraseñas no coinciden.';
    matchMessage.className = "password-match-message invalid";
  }
}


/* =========================================================
   7. ESTADO GENERAL
   ========================================================= */

function updateStatusCard(
  result,
  password,
  confirmation,
  passwordsMatch,
  statusCard,
  statusTitle,
  statusText
) {
  if (!statusCard || !statusTitle || !statusText) return;

  statusCard.classList.remove(
    "status-empty",
    "status-danger",
    "status-warning",
    "status-success"
  );

  if (!password) {
    statusCard.classList.add("status-empty");
    statusTitle.textContent = "Contraseña pendiente";
    statusText.textContent = "Ingresa una nueva contraseña para evaluar su seguridad.";
    return;
  }

  if (result.score < 3) {
    statusCard.classList.add("status-danger");
    statusTitle.textContent = "Contraseña débil";
    statusText.textContent = "Aumenta la longitud y combina letras, números y símbolos.";
    return;
  }

  if (result.score < 5) {
    statusCard.classList.add("status-warning");
    statusTitle.textContent = "Contraseña aceptable";
    statusText.textContent = "Todavía puedes fortalecerla para proteger mejor la cuenta.";
    return;
  }

  if (!confirmation) {
    statusCard.classList.add("status-warning");
    statusTitle.textContent = "Confirma la contraseña";
    statusText.textContent = "La contraseña es segura, pero falta repetirla.";
    return;
  }

  if (!passwordsMatch) {
    statusCard.classList.add("status-danger");
    statusTitle.textContent = "Las contraseñas no coinciden";
    statusText.textContent = "Revisa ambos campos antes de continuar.";
    return;
  }

  statusCard.classList.add("status-success");
  statusTitle.textContent = "Contraseña lista";
  statusText.textContent = "La contraseña cumple los criterios de seguridad.";
}


/* =========================================================
   8. BOTÓN DE ENVÍO
   ========================================================= */

function updateSubmitButton(result, passwordsMatch, submitButton) {
  if (!submitButton) return;

  const canSubmit = result.score >= 5 && passwordsMatch;

  submitButton.disabled = !canSubmit;
  submitButton.classList.toggle("disabled", !canSubmit);
}


/* =========================================================
   9. LOADING AL ENVIAR
   ========================================================= */

function initSubmitLoading() {
  const form = document.getElementById("changePasswordForm");
  const button = document.getElementById("btnUpdatePassword");

  if (!form || !button) return;

  form.addEventListener("submit", function (event) {
    if (button.disabled) {
      event.preventDefault();
      return;
    }

    button.classList.add("loading");
    button.disabled = true;
  });
}