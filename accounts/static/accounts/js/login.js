document.addEventListener("DOMContentLoaded", function () {
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("id_password");

  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.getElementById("btnLogin");

  if (togglePassword && passwordField) {
    togglePassword.addEventListener("click", function () {
      const icon = this.querySelector("i");
      const isPassword = passwordField.type === "password";

      passwordField.type = isPassword ? "text" : "password";

      if (icon) {
        icon.classList.toggle("bi-eye", isPassword);
        icon.classList.toggle("bi-eye-slash", !isPassword);
      }
    });
  }

  if (loginForm && submitBtn) {
    loginForm.addEventListener("submit", function () {
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
    });
  }

  const loginError = document.querySelector(".login-error");

  if (loginError) {
    loginError.classList.add("show-error");

    const usernameInput = document.getElementById("id_username");

    if (usernameInput) {
      usernameInput.focus();
    }
  }
});