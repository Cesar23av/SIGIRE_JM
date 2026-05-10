from django.db import models
from django.conf import settings
from students.models import Estudiante
from academic.models import Paralelo, Gestion

#Clase para el manejo de inscripciones, requisitos y entrega de documentos

#CLASE INSCRIPCION
class Inscripcion(models.Model):

    ESTADO_DOCUMENTAL_CHOICES = [
        ("completa", "Completa"),
        ("pendiente", "Pendiente"),
        ("vencida", "Vencida"),
    ]

    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE
    )

    paralelo = models.ForeignKey(
        Paralelo,
        on_delete=models.CASCADE
    )

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    gestion = models.ForeignKey(
        Gestion,
        on_delete=models.CASCADE
    )

    fecha_registro = models.DateField(auto_now_add=True)

    estado = models.BooleanField(default=True)

    estado_documental = models.CharField(
        max_length=20,
        choices=ESTADO_DOCUMENTAL_CHOICES,
        default="pendiente"
    )

    fecha_limite_documentos = models.DateField(
        null=True,
        blank=True
    )

    rude = models.CharField(max_length=100)

    observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.estudiante} - {self.gestion}"
    
#CLASE REQUISITO
class Requisito(models.Model):

    nombre_documento = models.CharField(max_length=100)

    obligatorio = models.BooleanField(default=True)

    estado = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre_documento

#CLASE ENTREGA DE DOCUMENTOS
class EntregaDocumento(models.Model):

    inscripcion = models.ForeignKey(
        Inscripcion,
        on_delete=models.CASCADE
    )

    requisito = models.ForeignKey(
        Requisito,
        on_delete=models.CASCADE
    )

    estado = models.BooleanField(default=False)

    fecha_entrega = models.DateField(
        null=True,
        blank=True
    )

    observacion = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.inscripcion} - {self.requisito}"

