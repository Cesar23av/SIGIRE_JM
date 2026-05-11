import random
import string
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .email_api import enviar_correo_brevo
from django.utils.crypto import get_random_string
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .forms import RegistroPersonalForm
from .models import User
from .decorators import only_director, only_administrative
from django.contrib.auth.views import PasswordChangeView
from django.urls import reverse_lazy
from .forms import CustomPasswordChangeForm
from django.db.models import Sum
from students.models import Estudiante
from enrollment.models import Inscripcion
from academic.models import Gestion, Paralelo


# 1. Vista Pública
def home(request):
    return render(request, 'registration/home.html') 

# 4. Listado de Personal (RF1 - Solo Director)
@login_required
@only_director
def list_personal(request):

    mostrar_inactivos = request.GET.get('inactivos') == 'true'
    query_busqueda = request.GET.get('q', '').strip() 
    rol_filtro = request.GET.get('rol', '') 

    if mostrar_inactivos:
        personal = User.objects.filter(is_active=False)
    else:
        personal = User.objects.filter(is_active=True)
    
    if query_busqueda:
        personal = personal.filter(
            Q(cedula_identidad__icontains=query_busqueda) |
            Q(first_name__icontains=query_busqueda) |
            Q(last_name__icontains=query_busqueda) |
            Q(celular__icontains=query_busqueda)
        )

    if rol_filtro:
        personal = personal.filter(rol=rol_filtro)
    
    return render(request, 'registration/list_personal.html', {
        'personal': personal,
        'mostrar_inactivos': mostrar_inactivos,
        'query_busqueda': query_busqueda, 
        'rol_filtro': rol_filtro,
    })

# 5. Registro de Personal (RF1 - Solo Director)
@login_required
@only_director
def registrar_personal(request):
    if request.method == 'POST':
        form = RegistroPersonalForm(request.POST)
        if form.is_valid():
            nuevo_usuario = form.save(commit=False)

            nombre_raw = nuevo_usuario.first_name.split()[0] if nuevo_usuario.first_name else "User"
            nombre = nombre_raw.capitalize()

            apellidos = nuevo_usuario.last_name.split() if nuevo_usuario.last_name else ["X"]
            iniciales = "".join([a[0].upper() for a in apellidos])

            def generar_propuesta():
                digitos = "".join(random.choices(string.digits, k=3))
                return f"{nombre}{iniciales}{digitos}"

            username_final = generar_propuesta()

            while User.objects.filter(username=username_final).exists():
                username_final = generar_propuesta()

            nuevo_usuario.username = username_final

            password_temporal = get_random_string(length=10)
            nuevo_usuario.set_password(password_temporal)

            asunto = 'Bienvenido al Sistema - UE Jesús María'
            mensaje = (
                f"Hola {nuevo_usuario.first_name},\n\n"
                f"Tu cuenta administrativa ha sido creada.\n"
                f"Usuario: {username_final}\n"
                f"Contraseña temporal: {password_temporal}\n\n"
                f"Por seguridad, cambia tu contraseña al ingresar por primera vez."
            )

            try:
                enviar_correo_brevo(
                    destinatario_email=nuevo_usuario.email,
                    destinatario_nombre=nuevo_usuario.first_name,
                    asunto=asunto,
                    mensaje=mensaje,
                )

                nuevo_usuario.save()

                messages.success(
                    request,
                    f"Personal registrado. Credenciales enviadas a {nuevo_usuario.email}"
                )

                return redirect('list_personal')

            except Exception as e:
                print(f"DEBUG: Error al enviar correo: {e}")
                messages.error(
                    request,
                    f"No se registró el usuario porque no se pudo enviar el correo: {e}"
                )

    else:
        form = RegistroPersonalForm()

    return render(request, 'registration/form_personal.html', {'form': form})


@login_required
@only_director
def editar_personal(request, pk):
    usuario = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        
        form = RegistroPersonalForm(request.POST, instance=usuario)
        if form.is_valid():
            form.save()
            messages.success(request, f"Datos de {usuario.get_full_name()} actualizados.")
            return redirect('list_personal')
    else:
        form = RegistroPersonalForm(instance=usuario)
    return render(request, 'registration/form_personal.html', {
        'form': form, 
        'edit_mode': True,
        'usuario': usuario
    })

@login_required
@only_director
def eliminar_personal(request, pk):
    usuario = get_object_or_404(User, pk=pk)
    # Evitar que el director se borre a sí mismo
    if usuario == request.user:
        messages.error(request, "No puedes eliminar tu propia cuenta.")
    else:
        # Borrado lógico: lo desactivamos en lugar de borrarlo de la BD
        usuario.is_active = False
        usuario.save()
        messages.warning(request, f"El usuario {usuario.username} ha sido desactivado.")
    
    return redirect('list_personal')

class UserPasswordChangeView(PasswordChangeView):
    form_class = CustomPasswordChangeForm
    template_name = 'registration/change_password.html'
    success_url = reverse_lazy('dashboard')

    def form_valid(self, form):
        messages.success(self.request, "¡Tu contraseña ha sido actualizada con éxito!")
        return super().form_valid(form)
    
@login_required
@only_director
def reactivar_personal(request, pk):
    usuario = get_object_or_404(User, pk=pk)

    password_temporal = get_random_string(length=10)

    asunto = 'Reactivación de Cuenta - UE Jesús María'
    mensaje = (
        f"Hola {usuario.first_name},\n\n"
        f"Tu cuenta administrativa ha sido reactivada en el sistema.\n"
        f"Usuario: {usuario.username}\n"
        f"Nueva contraseña temporal: {password_temporal}\n\n"
        f"Por seguridad, te pedimos que cambies tu contraseña inmediatamente al ingresar."
    )

    try:
        enviar_correo_brevo(
            destinatario_email=usuario.email,
            destinatario_nombre=usuario.first_name,
            asunto=asunto,
            mensaje=mensaje,
        )

        usuario.is_active = True
        usuario.set_password(password_temporal)
        usuario.save()

        messages.success(
            request,
            f"El usuario {usuario.username} ha sido reactivado. Se enviaron las nuevas credenciales a {usuario.email}."
        )

    except Exception as e:
        print(f"DEBUG: Error al enviar correo de reactivación por Brevo: {e}")
        messages.error(
            request,
            f"No se reactivó el usuario porque no se pudo enviar el correo: {e}"
        )

    return redirect('list_personal')

@login_required
@only_director
def eliminar_personal_fisico(request, pk):
    usuario = get_object_or_404(User, pk=pk)
    
    if usuario == request.user:
        messages.error(request, "Error crítico: No puedes eliminar tu propia cuenta.")
        return redirect('/personal/?inactivos=true')
        
    nombre = usuario.username

    usuario.delete() 
    
    messages.success(request, f"¡Completado! El usuario '{nombre}' ha sido eliminado definitivamente de la base de datos.")
    
    return redirect('/personal/?inactivos=true')

@login_required
@only_administrative
def dashboard(request):
    gestion_activa = Gestion.objects.filter(estado=True).first()

    total_estudiantes = Estudiante.objects.filter(
        estado=True
    ).count()

    inscripciones_activas = 0
    cupos_disponibles = 0

    if gestion_activa:
        inscripciones_activas = Inscripcion.objects.filter(
            gestion=gestion_activa,
            estado=True
        ).count()

        paralelos = Paralelo.objects.filter(
            estado=True
        )

        for paralelo in paralelos:
            inscritos = Inscripcion.objects.filter(
                paralelo=paralelo,
                gestion=gestion_activa,
                estado=True
            ).count()

            cupos_disponibles += max(paralelo.cupo_max - inscritos, 0)

    context = {
        'total_estudiantes': total_estudiantes,
        'inscripciones_activas': inscripciones_activas,
        'cupos_disponibles': cupos_disponibles,
        'gestion_activa': gestion_activa,
    }

    return render(request, 'registration/dashboard.html', context)

@login_required
@only_administrative
def reportes(request):
    return render(request, 'registration/reportes.html')