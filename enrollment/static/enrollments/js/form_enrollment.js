document.addEventListener("DOMContentLoaded", function () {
    if (typeof configInscripcion === "undefined") {
        return;
    }

    if (!configInscripcion.mostrarPregunta) {
        return;
    }

    Swal.fire({
        title: "Tipo de inscripción",
        text: "Seleccione el escenario del estudiante para continuar con el proceso correcto.",
        icon: "question",

        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: true,

        confirmButtonText: "Estudiante nuevo",
        denyButtonText: "Registrado sin inscripción previa",
        cancelButtonText: "Ya tiene inscripción previa",

        confirmButtonColor: "#10b981",
        denyButtonColor: "#2563eb",
        cancelButtonColor: "#c62828",

        allowOutsideClick: false,
        allowEscapeKey: false,

        customClass: {
            popup: "swal-inscripcion-popup",
            actions: "swal-inscripcion-actions",
            confirmButton: "swal-btn-nuevo",
            denyButton: "swal-btn-registrado",
            cancelButton: "swal-btn-previo"
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = configInscripcion.urlEstudianteNuevo;
        } else if (result.isDenied) {
            window.location.href = configInscripcion.urlEstudianteRegistradoSinInscripcion;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = configInscripcion.urlEstudianteConInscripcionPrevia;
        }
    });
});