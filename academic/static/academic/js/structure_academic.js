/* =========================================================
   STRUCTURE_ACADEMIC.JS - ESTRUCTURA ACADÉMICA MEJORADA
   Sistema de Inscripciones - UE Jesús María
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initDependentGrades();
  initConfirmActions();
  initModalParalelo();
  initRequirementForm();
  initRequirementInputValidation();
  initRowAnimations();
});


/* =========================================================
   1. SELECT DEPENDIENTE: NIVEL -> GRADO
   ========================================================= */

function initDependentGrades() {
  const selectNivelList = document.querySelectorAll('select[name="nivel"]');

  selectNivelList.forEach((selectNivel) => {
    const formContainer = selectNivel.closest("form") || document;
    const selectGrado = formContainer.querySelector('select[name="grado"]');

    if (!selectGrado || typeof gradosPorNivel === "undefined") return;

    setupGradeSelect(selectNivel, selectGrado);

    selectNivel.addEventListener("change", function () {
      setupGradeSelect(selectNivel, selectGrado);
    });
  });
}

function setupGradeSelect(selectNivel, selectGrado) {
  const nivelId = selectNivel.value;
  const defaultOption = '<option value="">Seleccione un grado</option>';

  selectGrado.innerHTML = defaultOption;

  if (!nivelId || !gradosPorNivel[nivelId]) {
    selectGrado.disabled = true;
    selectGrado.classList.add("select-disabled");
    return;
  }

  gradosPorNivel[nivelId].forEach((grado) => {
    const option = document.createElement("option");
    option.value = grado.id;
    option.textContent = grado.nombre;
    selectGrado.appendChild(option);
  });

  selectGrado.disabled = false;
  selectGrado.classList.remove("select-disabled");
}


/* =========================================================
   2. CONFIRMACIONES GENERALES
   ========================================================= */

function initConfirmActions() {
  document.body.addEventListener("click", function (event) {
    const btnEliminar = event.target.closest(".alerta-eliminar");

    if (!btnEliminar) return;

    event.preventDefault();

    const url = btnEliminar.getAttribute("href");
    const nombre = btnEliminar.getAttribute("data-nombre") || "este elemento";
    const extra = btnEliminar.getAttribute("data-extra") || "";

    if (!url || url === "#") return;

    confirmarAccion(url, nombre, extra);
  });
}

function confirmarAccion(url, nombre, extra) {
  if (typeof Swal === "undefined") {
    const accepted = confirm(`¿Está seguro de procesar ${nombre}?`);

    if (accepted) {
      window.location.href = url;
    }

    return;
  }

  Swal.fire({
    title: "¿Confirmar acción?",
    text: extra || `Estás a punto de procesar ${nombre}. Esta acción puede modificar la estructura académica.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#c62828",
    cancelButtonColor: "#64748b",
    confirmButtonText: '<i class="fa-solid fa-check"></i> Sí, continuar',
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = url;
    }
  });
}


/* =========================================================
   3. SELECTOR CREACIÓN NIVEL / GRADO
   ========================================================= */

function abrirSelectorCreacion(urlBase) {
  if (typeof Swal === "undefined") {
    const crearNivel = confirm("Aceptar para crear Nivel. Cancelar para crear Grado.");

    window.location.href = crearNivel
      ? `${urlBase}?tipo=nivel`
      : `${urlBase}?tipo=grado`;

    return;
  }

  Swal.fire({
    title: "Nuevo registro académico",
    text: "Selecciona qué elemento deseas crear.",
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-layer-group"></i> Crear Nivel',
    confirmButtonColor: "#2563eb",
    denyButtonText: '<i class="fa-solid fa-graduation-cap"></i> Crear Grado',
    denyButtonColor: "#f59e0b",
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#64748b",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `${urlBase}?tipo=nivel`;
    } else if (result.isDenied) {
      window.location.href = `${urlBase}?tipo=grado`;
    }
  });
}


/* =========================================================
   4. MODAL PARALELO
   ========================================================= */

function initModalParalelo() {
  const modal = document.getElementById("modalParalelo");

  if (!modal) return;

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      cerrarModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      cerrarModal();
    }
  });
}

function abrirModal() {
  const modal = document.getElementById("modalParalelo");

  if (!modal) return;

  const selectNivel = modal.querySelector('select[name="nivel"]');
  const selectGrado = modal.querySelector('select[name="grado"]');

  if (selectNivel) {
    selectNivel.value = "";
  }

  if (selectGrado) {
    selectGrado.innerHTML = '<option value="">Seleccione un grado</option>';
    selectGrado.disabled = true;
    selectGrado.classList.add("select-disabled");
  }

  modal.classList.add("open");

  setTimeout(() => {
    modal.classList.add("active");
  }, 10);
}

function cerrarModal() {
  const modal = document.getElementById("modalParalelo");

  if (!modal) return;

  modal.classList.remove("active");

  setTimeout(() => {
    modal.classList.remove("open");
  }, 220);
}


/* =========================================================
   5. FORMULARIO DE REQUISITOS
   ========================================================= */

let requisitoOriginal = {
  nombre: "",
  obligatorio: true,
};

function initRequirementForm() {
  const form = document.getElementById("formRequisito");
  const inputNombre = document.getElementById("inputNombreReq");
  const inputObligatorio = document.getElementById("inputObligatorioReq");
  const btnUpdate = document.getElementById("btnUpdateReq");

  if (!form || !inputNombre || !inputObligatorio || !btnUpdate) return;

  form.dataset.createUrl = form.getAttribute("action");

  inputNombre.addEventListener("input", verificarCambiosRequisito);
  inputObligatorio.addEventListener("change", verificarCambiosRequisito);
}

function initRequirementInputValidation() {
  const form = document.getElementById("formRequisito");
  const inputNombre = document.getElementById("inputNombreReq");

  if (!form || !inputNombre) return;

  inputNombre.addEventListener("input", function () {
    this.value = this.value.replace(/\s+/g, " ");
    clearRequirementError();
  });

  inputNombre.addEventListener("blur", function () {
    this.value = this.value.trim();
  });

  form.addEventListener("submit", function (event) {
    if (!inputNombre.value.trim()) {
      event.preventDefault();
      showRequirementError("Ingrese el nombre del documento requerido.");
      inputNombre.focus();
    }
  });
}

function cargarEdicion(id, nombre, obligatorio) {
  const form = document.getElementById("formRequisito");
  const inputNombre = document.getElementById("inputNombreReq");
  const inputObligatorio = document.getElementById("inputObligatorioReq");
  const btnAdd = document.getElementById("btnAddReq");
  const btnUpdate = document.getElementById("btnUpdateReq");
  const btnCancel = document.getElementById("btnCancelReq");
  const formTitle = document.getElementById("requirementFormTitle");
  const formHint = document.getElementById("requirementFormHint");

  if (!form || !inputNombre || !inputObligatorio) return;

  form.action = `/requisitos/editar/${id}/`;

  inputNombre.value = nombre;
  inputObligatorio.checked = obligatorio === "true";

  requisitoOriginal = {
    nombre: nombre.trim(),
    obligatorio: obligatorio === "true",
  };

  btnAdd.classList.add("hidden");
  btnUpdate.classList.remove("hidden");
  btnCancel.classList.remove("hidden");
  btnUpdate.disabled = true;

  if (formTitle) {
    formTitle.textContent = "Editando requisito";
  }

  if (formHint) {
    formHint.textContent = "Modifica el nombre o el estado obligatorio y guarda los cambios.";
  }

  inputNombre.focus();
  inputNombre.select();

  verificarCambiosRequisito();
}

function verificarCambiosRequisito() {
  const inputNombre = document.getElementById("inputNombreReq");
  const inputObligatorio = document.getElementById("inputObligatorioReq");
  const btnUpdate = document.getElementById("btnUpdateReq");

  if (!inputNombre || !inputObligatorio || !btnUpdate) return;

  const nombreActual = inputNombre.value.trim();
  const obligatorioActual = inputObligatorio.checked;

  const cambioNombre = nombreActual !== requisitoOriginal.nombre;
  const cambioObligatorio = obligatorioActual !== requisitoOriginal.obligatorio;
  const hayCambios = cambioNombre || cambioObligatorio;

  btnUpdate.disabled = !hayCambios || !nombreActual;
}

function cancelarEdicion() {
  const form = document.getElementById("formRequisito");
  const inputNombre = document.getElementById("inputNombreReq");
  const inputObligatorio = document.getElementById("inputObligatorioReq");
  const btnAdd = document.getElementById("btnAddReq");
  const btnUpdate = document.getElementById("btnUpdateReq");
  const btnCancel = document.getElementById("btnCancelReq");
  const formTitle = document.getElementById("requirementFormTitle");
  const formHint = document.getElementById("requirementFormHint");

  if (!form || !inputNombre || !inputObligatorio) return;

  form.action = form.dataset.createUrl || "/requisitos/crear/";

  inputNombre.value = "";
  inputObligatorio.checked = true;

  requisitoOriginal = {
    nombre: "",
    obligatorio: true,
  };

  btnAdd.classList.remove("hidden");
  btnUpdate.classList.add("hidden");
  btnCancel.classList.add("hidden");
  btnUpdate.disabled = false;

  if (formTitle) {
    formTitle.textContent = "Nuevo requisito";
  }

  if (formHint) {
    formHint.textContent = "Define la documentación que será solicitada durante la inscripción.";
  }

  clearRequirementError();
}

function showRequirementError(message) {
  const errorBox = document.getElementById("requirementError");

  if (!errorBox) return;

  errorBox.textContent = message;
  errorBox.classList.add("show");
}

function clearRequirementError() {
  const errorBox = document.getElementById("requirementError");

  if (!errorBox) return;

  errorBox.textContent = "";
  errorBox.classList.remove("show");
}


/* =========================================================
   6. ANIMACIONES
   ========================================================= */

function initRowAnimations() {
  const items = document.querySelectorAll(".academic-card, .list-item, .nivel-group, .tabla-academica tbody tr");

  items.forEach((item, index) => {
    item.style.animationDelay = `${Math.min(index * 45, 260)}ms`;
    item.classList.add("academic-fade-in");
  });
}


/* =========================================================
   7. EXPONER FUNCIONES USADAS POR HTML
   ========================================================= */

window.abrirSelectorCreacion = abrirSelectorCreacion;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cargarEdicion = cargarEdicion;
window.cancelarEdicion = cancelarEdicion;