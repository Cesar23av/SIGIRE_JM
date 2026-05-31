/* =========================================================
   LOGIN.JS - INICIO DE SESIÓN
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initPasswordToggle();
  initLoginSubmit();
  initLoginErrors();
  initInputFeedback();
});


/* =========================================================
   1. MOSTRAR / OCULTAR CONTRASEÑA
   ========================================================= */

function initPasswordToggle() {
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("id_password");

  if (!togglePassword || !passwordField) return;

  togglePassword.addEventListener("click", function () {
    const icon = togglePassword.querySelector("i");
    const isPassword = passwordField.type === "password";

    passwordField.type = isPassword ? "text" : "password";

    togglePassword.setAttribute("aria-pressed", String(isPassword));
    togglePassword.setAttribute(
      "aria-label",
      isPassword ? "Ocultar contraseña" : "Mostrar contraseña"
    );

    if (icon) {
      icon.className = isPassword ? "bi bi-eye" : "bi bi-eye-slash";
    }
  });
}


/* =========================================================
   2. ENVÍO DEL FORMULARIO
   ========================================================= */

function initLoginSubmit() {
  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.getElementById("btnLogin");
  const usernameInput = document.getElementById("id_username");
  const passwordInput = document.getElementById("id_password");

  if (!loginForm || !submitBtn) return;

  loginForm.addEventListener("submit", function (event) {
    const usernameValue = usernameInput ? usernameInput.value.trim() : "";
    const passwordValue = passwordInput ? passwordInput.value.trim() : "";

    if (!usernameValue || !passwordValue) {
      event.preventDefault();

      markRequired(usernameInput, usernameValue);
      markRequired(passwordInput, passwordValue);

      const firstEmpty = !usernameValue ? usernameInput : passwordInput;

      if (firstEmpty) {
        firstEmpty.focus();
      }

      return;
    }

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
  });
}

function markRequired(input, value) {
  if (!input) return;

  const wrapper = input.closest(".input-wrapper");

  if (!value) {
    input.classList.add("input-invalid");

    if (wrapper) {
      wrapper.classList.add("input-wrapper-invalid");
    }
  }
}


/* =========================================================
   3. ERRORES DE LOGIN
   ========================================================= */

function initLoginErrors() {
  const loginError = document.querySelector(".login-error");

  if (!loginError) return;

  loginError.classList.add("show-error");

  const usernameInput = document.getElementById("id_username");

  if (usernameInput) {
    usernameInput.focus();
    usernameInput.select();
  }
}


/* =========================================================
   4. FEEDBACK DE INPUTS
   ========================================================= */

function initInputFeedback() {
  const inputs = document.querySelectorAll("#id_username, #id_password");

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      const wrapper = input.closest(".input-wrapper");

      input.classList.remove("input-invalid");

      if (wrapper) {
        wrapper.classList.remove("input-wrapper-invalid");
      }
    });
  });
}