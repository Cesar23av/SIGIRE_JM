from django.core.exceptions import ValidationError
import re


class StrongPasswordValidator:
    def validate(self, password, user=None):
        if not re.search(r"[A-ZÁÉÍÓÚÑ]", password):
            raise ValidationError(
                "La contraseña debe contener al menos una letra mayúscula.",
                code="password_no_uppercase",
            )

        if not re.search(r"[a-záéíóúñ]", password):
            raise ValidationError(
                "La contraseña debe contener al menos una letra minúscula.",
                code="password_no_lowercase",
            )

        if not re.search(r"\d", password):
            raise ValidationError(
                "La contraseña debe contener al menos un número.",
                code="password_no_number",
            )

        if not re.search(r"[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]", password):
            raise ValidationError(
                "La contraseña debe contener al menos un símbolo.",
                code="password_no_symbol",
            )

    def get_help_text(self):
        return (
            "Tu contraseña debe incluir al menos una mayúscula, una minúscula, "
            "un número y un símbolo."
        )