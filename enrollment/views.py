from datetime import timedelta

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db import transaction

from .models import Inscripcion, Requisito, EntregaDocumento
from students.models import Estudiante
from academic.models import Gestion, Paralelo

def obtener_siguiente_paralelo(paralelo_actual):
    nivel_actual = paralelo_actual.grado.nivel.nombre.lower()
    grado_actual = paralelo_actual.grado.nombre.lower()
    letra_actual = paralelo_actual.letra

    secuencia = [
        ("primaria", "primero"),
        ("primaria", "segundo"),
        ("primaria", "tercero"),
        ("primaria", "cuarto"),
        ("primaria", "quinto"),
        ("primaria", "sexto"),
        ("secundaria", "primero"),
        ("secundaria", "segundo"),
        ("secundaria", "tercero"),
        ("secundaria", "cuarto"),
        ("secundaria", "quinto"),
        ("secundaria", "sexto"),
    ]

    posicion_actual = None

    for index, (nivel, grado) in enumerate(secuencia):
        if nivel in nivel_actual and grado in grado_actual:
            posicion_actual = index
            break

    if posicion_actual is None:
        return None

    if posicion_actual + 1 >= len(secuencia):
        return None

    siguiente_nivel, siguiente_grado = secuencia[posicion_actual + 1]

    siguiente_paralelo = Paralelo.objects.filter(
        estado=True,
        letra=letra_actual,
        grado__nombre__icontains=siguiente_grado,
        grado__nivel__nombre__icontains=siguiente_nivel,
    ).first()

    if siguiente_paralelo:
        return siguiente_paralelo

    return Paralelo.objects.filter(
        estado=True,
        grado__nombre__icontains=siguiente_grado,
        grado__nivel__nombre__icontains=siguiente_nivel,
    ).first()
    
@login_required
def registrar_inscripcion_view(request):
    if request.method == "POST":
        estudiante_id = request.POST.get("estudiante_id")
        paralelo_id = request.POST.get("paralelo")
        rude = request.POST.get("rude")
        observacion = request.POST.get("observacion", "")
        requisitos_entregados = request.POST.getlist("requisitos")

        estudiante = get_object_or_404(
            Estudiante,
            cedula_identidad=estudiante_id
        )

        paralelo = get_object_or_404(
            Paralelo,
            pk=paralelo_id
        )

        gestion_actual = Gestion.objects.filter(
            estado=True
        ).order_by("-anio").first()

        if not gestion_actual:
            messages.error(request, "No existe una gestión activa para realizar inscripciones.")
            return redirect("estructura_academica")

        ya_inscrito = Inscripcion.objects.filter(
            estudiante=estudiante,
            gestion=gestion_actual
        ).exists()

        if ya_inscrito:
            messages.error(
                request,
                f"El estudiante {estudiante.nombres} ya tiene una inscripción en la gestión {gestion_actual.anio}."
            )
            return redirect("list_estudiantes")

        requisitos = Requisito.objects.filter(estado=True).order_by("id")

        with transaction.atomic():
            inscripcion = Inscripcion.objects.create(
                estudiante=estudiante,
                paralelo=paralelo,
                usuario=request.user,
                gestion=gestion_actual,
                estado=True,
                rude=rude,
                observacion=observacion,
            )

            for requisito in requisitos:
                entregado = str(requisito.id) in requisitos_entregados

                EntregaDocumento.objects.create(
                    inscripcion=inscripcion,
                    requisito=requisito,
                    estado=entregado,
                    fecha_entrega=timezone.now().date() if entregado else None,
                )

            faltan_documentos = EntregaDocumento.objects.filter(
                inscripcion=inscripcion,
                requisito__obligatorio=True,
                estado=False
            ).exists()

            if faltan_documentos:
                inscripcion.estado_documental = "pendiente"
                inscripcion.fecha_limite_documentos = timezone.now().date() + timedelta(days=30)
                mensaje = (
                    f"Inscripción registrada como pendiente. "
                    f"El tutor tiene plazo hasta {inscripcion.fecha_limite_documentos} para completar documentos."
                )
            else:
                inscripcion.estado_documental = "completa"
                inscripcion.fecha_limite_documentos = None
                mensaje = "Inscripción registrada correctamente con documentación completa."

            inscripcion.save()

        messages.success(request, mensaje)
        return redirect("list_inscripciones")

    estudiante_id = request.GET.get("estudiante_id")
    tipo_inscripcion = request.GET.get("tipo_inscripcion", "")

    estudiante = None
    ultima_inscripcion = None
    paralelo_anterior = None
    paralelo_sugerido = None
    mensaje_sugerencia = None

    gestion_actual = Gestion.objects.filter(estado=True).order_by("-anio").first()

    if not gestion_actual:
        messages.error(request, "No existe una gestión activa para realizar inscripciones.")
        return redirect("estructura_academica")

    gestion_pasada = (
        Gestion.objects
        .filter(anio__lt=gestion_actual.anio)
        .order_by("-anio")
        .first()
    )

    if estudiante_id:
        estudiante = get_object_or_404(
            Estudiante,
            cedula_identidad=estudiante_id
        )

        if gestion_pasada:
            ultima_inscripcion = (
                Inscripcion.objects
                .filter(estudiante=estudiante, gestion=gestion_pasada)
                .select_related(
                    "gestion",
                    "paralelo",
                    "paralelo__grado",
                    "paralelo__grado__nivel"
                )
                .first()
            )

        if ultima_inscripcion:
            paralelo_anterior = ultima_inscripcion.paralelo
            paralelo_siguiente = obtener_siguiente_paralelo(paralelo_anterior)

            if paralelo_siguiente:
                paralelo_sugerido = paralelo_siguiente
                mensaje_sugerencia = (
                    f"Gestión pasada: {paralelo_anterior.grado.nombre} de "
                    f"{paralelo_anterior.grado.nivel.nombre} {paralelo_anterior.letra}. "
                    f"Sugerido para {gestion_actual.anio}: "
                    f"{paralelo_sugerido.grado.nombre} de "
                    f"{paralelo_sugerido.grado.nivel.nombre} {paralelo_sugerido.letra}."
                )
            else:
                paralelo_sugerido = paralelo_anterior
                mensaje_sugerencia = (
                    f"Gestión pasada: {paralelo_anterior.grado.nombre} de "
                    f"{paralelo_anterior.grado.nivel.nombre} {paralelo_anterior.letra}. "
                    f"No existe curso superior; si repite, reinscribir en el mismo curso."
                )

    paralelos = (
        Paralelo.objects
        .filter(estado=True)
        .select_related("grado", "grado__nivel")
        .order_by("grado__nivel__nombre", "grado__nombre", "letra")
    )

    requisitos = Requisito.objects.filter(estado=True).order_by("id")

    context = {
        "gestion_actual": gestion_actual,
        "gestion_pasada": gestion_pasada,
        "estudiante": estudiante,
        "tipo_inscripcion": tipo_inscripcion,
        "ultima_inscripcion": ultima_inscripcion,
        "paralelo_anterior": paralelo_anterior,
        "paralelo_sugerido": paralelo_sugerido,
        "mensaje_sugerencia": mensaje_sugerencia,
        "paralelos": paralelos,
        "requisitos": requisitos,
    }

    return render(request, "Inscriptions/form_enrollment.html", context)

@login_required
def list_inscripciones(request):
    return render(request, 'Inscriptions/list_of_subscribers.html')

@require_POST
def crear_requisito(request):
    nombre = request.POST.get('nombre_documento')
    obligatorio = request.POST.get('obligatorio') == 'on'
    
    if nombre:
        Requisito.objects.create(
            nombre_documento=nombre,
            obligatorio=obligatorio
        )
        messages.success(request, f"Requisito '{nombre}' registrado correctamente.")
    else:
        messages.error(request, "El nombre del documento no puede estar vacío.")
        
    return redirect('estructura_academica')

def eliminar_requisito(request, pk):
    requisito = get_object_or_404(Requisito, pk=pk)
    nombre = requisito.nombre_documento
    
    existe_en_entregas = EntregaDocumento.objects.filter(requisito=requisito).exists()
    
    if existe_en_entregas:
        requisito.estado = False
        requisito.save()
        messages.warning(request, f"El requisito '{nombre}' se ha desactivado (no se eliminó físicamente por integridad de datos).")
    else:
        requisito.delete()
        messages.success(request, f"Requisito '{nombre}' eliminado físicamente con éxito.")
        
    return redirect('estructura_academica')

def editar_requisito(request, pk):
    requisito = get_object_or_404(Requisito, pk=pk)

    if request.method == "POST":
        nuevo_nombre = request.POST.get('nombre_documento', '').strip()
        obligatorio = request.POST.get('obligatorio') == 'on'

        if not nuevo_nombre:
            messages.error(request, "El nombre del documento no puede estar vacío.")
            return redirect('estructura_academica')

        if requisito.nombre_documento == nuevo_nombre and requisito.obligatorio == obligatorio:
            messages.info(request, "No se detectaron cambios en el requisito.")
            return redirect('estructura_academica')

        requisito.nombre_documento = nuevo_nombre
        requisito.obligatorio = obligatorio
        requisito.save()

        messages.success(request, "Requisito actualizado correctamente.")
        return redirect('estructura_academica')

    return render(request, 'Inscriptions/edit_requirement.html', {'requisito': requisito})