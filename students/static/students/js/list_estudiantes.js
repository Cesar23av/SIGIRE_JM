document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('searchForm');
    const toggleInactivos = document.getElementById('toggleInactivos');
    const hiddenInactivos = document.getElementById('hiddenInactivos');

    /*
     * IMPORTANTE:
     * Ya no se envía el formulario mientras se escribe ni al cambiar género.
     * Ahora la búsqueda se ejecuta solo con el botón "Filtrar" del HTML.
     */

    if (toggleInactivos && hiddenInactivos && searchForm) {
        toggleInactivos.addEventListener('change', function () {
            hiddenInactivos.value = this.checked ? 'on' : '';
            searchForm.submit();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const registradoId = urlParams.get('registrado_id');
    const nombreEst = urlParams.get('nombre_est');

    if (registradoId && nombreEst) {
        Swal.fire({
            title: '¡Registro Exitoso!',
            text: `¿Deseas realizar la inscripción académica de ${nombreEst} ahora mismo?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e293b',
            cancelButtonColor: '#64748b',
            confirmButtonText: '<i class="fa-solid fa-file-signature"></i> Sí, inscribir ahora',
            cancelButtonText: 'No, solo listar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/inscripciones/registrar/?estudiante_id=${registradoId}&tipo_inscripcion=sin_previa`;
            } else {
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
            }
        });
    }

    const deactivateBtns = document.querySelectorAll('.sweet-deactivate, .alerta-eliminar');
    deactivateBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            const url = this.getAttribute('href');
            const nombre = this.getAttribute('data-nombre') || 'este estudiante';

            Swal.fire({
                title: '¿Desactivar estudiante?',
                text: `${nombre} pasará a la lista de inactivos.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Sí, desactivar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = url;
                }
            });
        });
    });

    const deleteDbBtns = document.querySelectorAll('.sweet-delete-db');
    deleteDbBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            const url = this.getAttribute('href');
            const nombre = this.getAttribute('data-nombre') || 'este estudiante';
            const inscrito = this.getAttribute('data-inscrito') === 'true';
            const tieneHermanos = this.getAttribute('data-hermanos') === 'true';

            if (inscrito || tieneHermanos) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acción denegada',
                    text: `No se puede eliminar a ${nombre} por integridad de datos.`,
                    confirmButtonColor: '#1e293b'
                });
                return;
            }

            Swal.fire({
                title: '¿Borrar definitivamente?',
                text: `${nombre} será eliminado de la base de datos.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#c62828',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = url;
                }
            });
        });
    });
});

function verDireccion(nombreEstudiante, direccionFisica) {
    const direccionBusqueda = encodeURIComponent(direccionFisica + ", Oruro, Bolivia");

    Swal.fire({
        title: '<i class="fa-solid fa-map-location-dot" style="color: #16a34a; font-size: 2rem; display: block;"></i> Dirección',
        html: `
            <div style="text-align: center;">
                <p>Domicilio de <strong>${nombreEstudiante}</strong>:</p>

                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <strong>${direccionFisica}</strong>
                </div>

                <a href="https://www.google.com/maps/search/?api=1&query=${direccionBusqueda}"
                   target="_blank"
                   style="display: inline-flex; gap: 8px; align-items: center; background: #f0fdf4; color: #16a34a; padding: 10px 14px; border-radius: 8px; text-decoration: none; font-weight: bold; border: 1px solid #bbf7d0;">
                    <i class="fa-solid fa-location-arrow"></i>
                    Buscar en Google Maps
                </a>
            </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#1e293b'
    });
}