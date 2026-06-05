import re
from datetime import date

from django import forms
from .models import Tutor, Estudiante


OPCIONES_EXPEDIDO = [
    ("LP", "La Paz"),
    ("OR", "Oruro"),
    ("PT", "Potosí"),
    ("CB", "Cochabamba"),
    ("SC", "Santa Cruz"),
    ("BN", "Beni"),
    ("PA", "Pando"),
    ("TJ", "Tarija"),
    ("CH", "Chuquisaca"),
]


def calcular_edad(fecha_nacimiento):
    hoy = date.today()
    edad = hoy.year - fecha_nacimiento.year

    if (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day):
        edad -= 1

    return edad


def validar_complemento_ci(ci_comp):
    if ci_comp and not re.match(r"^[A-Z][0-9]$", ci_comp):
        raise forms.ValidationError(
            "El complemento debe tener formato letra + número. Ej: A1."
        )


class TutorForm(forms.ModelForm):
    ci_nro = forms.CharField(max_length=10, label="Número de CI")
    ci_comp = forms.CharField(max_length=2, required=False, label="Complemento")
    ci_exp = forms.ChoiceField(choices=OPCIONES_EXPEDIDO, label="Expedido")

    class Meta:
        model = Tutor
        fields = ["nombres", "apellidos", "ocupacion", "celular"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance and self.instance.pk:
            self.fields["ci_nro"].disabled = True
            self.fields["ci_comp"].disabled = True
            self.fields["ci_exp"].disabled = True

    def clean_ci_nro(self):
        ci_nro = self.cleaned_data.get("ci_nro")

        if self.instance and self.instance.pk:
            return ci_nro

        if not ci_nro:
            raise forms.ValidationError("El número de CI es obligatorio.")

        if not ci_nro.isdigit():
            raise forms.ValidationError("El número de CI solo debe contener números.")

        if len(ci_nro) < 5 or len(ci_nro) > 10:
            raise forms.ValidationError("El número de CI debe tener entre 5 y 10 dígitos.")

        return ci_nro

    def clean_ci_comp(self):
        ci_comp = self.cleaned_data.get("ci_comp", "")

        if ci_comp:
            ci_comp = ci_comp.upper().strip()
            validar_complemento_ci(ci_comp)

        return ci_comp

    def clean(self):
        cleaned_data = super().clean()

        if self.instance and self.instance.pk:
            return cleaned_data

        ci_nro = cleaned_data.get("ci_nro")
        ci_comp = cleaned_data.get("ci_comp")
        ci_exp = cleaned_data.get("ci_exp")

        if ci_nro and ci_exp:
            cedula = f"{ci_nro}-{ci_comp}-{ci_exp}" if ci_comp else f"{ci_nro}-{ci_exp}"

            if Tutor.objects.filter(cedula_identidad=cedula).exists():
                raise forms.ValidationError("Este CI ya está registrado en el sistema.")

            cleaned_data["cedula_identidad"] = cedula

        return cleaned_data

    def save(self, commit=True):
        tutor = super().save(commit=False)

        if not (self.instance and self.instance.pk):
            tutor.cedula_identidad = self.cleaned_data.get("cedula_identidad")

        if commit:
            tutor.save()

        return tutor


class EstudianteForm(forms.ModelForm):
    ci_nro = forms.CharField(max_length=10, label="Número de CI")
    ci_comp = forms.CharField(max_length=2, required=False, label="Complemento")
    ci_exp = forms.ChoiceField(choices=OPCIONES_EXPEDIDO, label="Expedido")

    zona = forms.CharField(max_length=100)
    avenida = forms.CharField(max_length=100)
    num_puerta = forms.CharField(max_length=10, required=False)

    class Meta:
        model = Estudiante
        fields = [
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "fecha_nacimiento",
            "genero",
            "correo_electronico",
            "estado",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.es_edicion = False

        if self.instance and self.instance.pk:
            self.es_edicion = True
            self.fields["ci_nro"].disabled = True
            self.fields["ci_comp"].disabled = True
            self.fields["ci_exp"].disabled = True

    def clean_ci_nro(self):
        ci_nro = self.cleaned_data.get("ci_nro")

        if not self.es_edicion:
            if not ci_nro:
                raise forms.ValidationError("El número de CI es obligatorio.")

            if not ci_nro.isdigit():
                raise forms.ValidationError("El número de CI solo debe contener números.")

            if len(ci_nro) < 5 or len(ci_nro) > 10:
                raise forms.ValidationError("El número de CI debe tener entre 5 y 10 dígitos.")

        return ci_nro

    def clean_ci_comp(self):
        ci_comp = self.cleaned_data.get("ci_comp", "")

        if ci_comp:
            ci_comp = ci_comp.upper().strip()
            validar_complemento_ci(ci_comp)

        return ci_comp

    def clean_fecha_nacimiento(self):
        fecha_nacimiento = self.cleaned_data.get("fecha_nacimiento")

        if not fecha_nacimiento:
            raise forms.ValidationError("La fecha de nacimiento es obligatoria.")

        if fecha_nacimiento > date.today():
            raise forms.ValidationError("La fecha de nacimiento no puede ser futura.")

        if calcular_edad(fecha_nacimiento) < 6:
            raise forms.ValidationError(
                "El estudiante debe tener 6 años cumplidos para poder inscribirse."
            )

        return fecha_nacimiento

    def clean(self):
        cleaned_data = super().clean()

        if not self.es_edicion:
            ci_nro = cleaned_data.get("ci_nro")
            ci_comp = cleaned_data.get("ci_comp")
            ci_exp = cleaned_data.get("ci_exp")

            if ci_nro and ci_exp:
                cedula = f"{ci_nro}-{ci_comp}-{ci_exp}" if ci_comp else f"{ci_nro}-{ci_exp}"

                if Estudiante.objects.filter(cedula_identidad=cedula).exists():
                    raise forms.ValidationError("El CI de este estudiante ya está registrado.")

                cleaned_data["cedula_identidad"] = cedula

        return cleaned_data

    def save(self, commit=True):
        estudiante = super().save(commit=False)

        if not self.es_edicion:
            estudiante.cedula_identidad = self.cleaned_data.get("cedula_identidad")

        zona = self.cleaned_data.get("zona", "").strip()
        avenida = self.cleaned_data.get("avenida", "").strip()
        numero_puerta = self.cleaned_data.get("num_puerta", "").strip()

        estudiante.direccion = f"{zona}, {avenida}, N° {numero_puerta}"

        if commit:
            estudiante.save()

        return estudiante


class EditarEstudianteForm(forms.ModelForm):
    fecha_nacimiento = forms.DateField(
        widget=forms.DateInput(
            attrs={
                "type": "date",
                "class": "student-input",
            },
            format="%Y-%m-%d",
        ),
        input_formats=["%Y-%m-%d"],
    )

    zona = forms.CharField(max_length=100)
    avenida = forms.CharField(max_length=100)
    num_puerta = forms.CharField(max_length=30, required=False)

    class Meta:
        model = Estudiante
        fields = [
            "nombres",
            "apellido_paterno",
            "apellido_materno",
            "fecha_nacimiento",
            "genero",
            "correo_electronico",
        ]

    def clean_fecha_nacimiento(self):
        fecha_nacimiento = self.cleaned_data.get("fecha_nacimiento")

        if not fecha_nacimiento:
            raise forms.ValidationError("La fecha de nacimiento es obligatoria.")

        if fecha_nacimiento > date.today():
            raise forms.ValidationError("La fecha de nacimiento no puede ser futura.")

        if calcular_edad(fecha_nacimiento) < 6:
            raise forms.ValidationError(
                "El estudiante debe tener 6 años cumplidos para poder inscribirse."
            )

        return fecha_nacimiento

    def save(self, commit=True):
        estudiante = super().save(commit=False)

        zona = self.cleaned_data.get("zona", "").strip()
        avenida = self.cleaned_data.get("avenida", "").strip()
        numero_puerta = self.cleaned_data.get("num_puerta", "").strip()

        estudiante.direccion = f"{zona}, {avenida}, N° {numero_puerta}"

        if commit:
            estudiante.save()

        return estudiante