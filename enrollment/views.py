from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def registrar_inscripcion_view(request):
    context = {
        'gestion_actual': '2026',
        'estudiante': {
            'nombres': 'Ronaldo Antonio',
            'apellido_paterno': 'Mamani',
            'apellido_materno': 'Cruz',
            'cedula_identidad': '27382332 PT'
        }
    }
    return render(request, 'Inscriptions/form_enrollment.html', context)

@login_required
def list_inscripciones(request):
    return render(request, 'Inscriptions/list_of_subscribers.html')