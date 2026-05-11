from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    
    class Roles(models.TextChoices):
        DIRECTOR = "director", "Director(a)"
        SECRETARIA = "secretaria", "Secretaría"

    DEPARTAMENTOS_CHOICES = [
        ('LP', 'La Paz'), ('OR', 'Oruro'), ('PT', 'Potosí'),
        ('CB', 'Cochabamba'), ('SC', 'Santa Cruz'), ('BN', 'Beni'),
        ('PA', 'Pando'), ('TJ', 'Tarija'), ('CH', 'Chuquisaca'),
    ]
   
    cedula_identidad = models.CharField(max_length=20, unique=True, primary_key=True)
    complemento = models.CharField(max_length=2, blank=True, null=True)
    expedido = models.CharField(
        max_length=2, 
        choices=DEPARTAMENTOS_CHOICES, 
        blank=True, 
        null=True
    )
    
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'cedula_identidad']

    celular = models.CharField(max_length=20)
    rol = models.CharField(
        max_length=15,
        choices=Roles.choices,
        default=Roles.SECRETARIA
    )

    def __str__(self):
        
        nombre_completo = f"{self.first_name} {self.last_name}".strip()
        return nombre_completo if nombre_completo else self.username

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        
class LoginAttempt(models.Model):
    username = models.CharField(max_length=150, unique=True)
    failed_attempts = models.PositiveIntegerField(default=0)
    lock_until = models.DateTimeField(null=True, blank=True)
    disabled_by_attempts = models.BooleanField(default=False)
    last_attempt = models.DateTimeField(auto_now=True)

    def is_locked(self):
        return self.lock_until and timezone.now() < self.lock_until

    def remaining_lock_seconds(self):
        if self.lock_until and timezone.now() < self.lock_until:
            return int((self.lock_until - timezone.now()).total_seconds())
        return 0

    def register_failed_attempt(self):
        self.failed_attempts += 1

        if self.failed_attempts >= 12:
            self.disabled_by_attempts = True

        elif self.failed_attempts >= 9:
            self.lock_until = timezone.now() + timedelta(minutes=15)

        elif self.failed_attempts >= 6:
            self.lock_until = timezone.now() + timedelta(minutes=5)

        elif self.failed_attempts >= 3:
            self.lock_until = timezone.now() + timedelta(minutes=1)

        self.save()

    def reset_attempts(self):
        self.failed_attempts = 0
        self.lock_until = None
        self.disabled_by_attempts = False
        self.save()

    def __str__(self):
        return f"{self.username} - intentos fallidos: {self.failed_attempts}"