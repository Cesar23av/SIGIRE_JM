import os
import requests


def enviar_correo_brevo(destinatario_email, destinatario_nombre, asunto, mensaje):
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("BREVO_SENDER_EMAIL", "secretaria.uejm@gmail.com")
    sender_name = os.getenv("BREVO_SENDER_NAME", "UE Jesús María")

    if not api_key:
        raise ValueError("Falta BREVO_API_KEY en variables de entorno")

    url = "https://api.brevo.com/v3/smtp/email"

    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email,
        },
        "to": [
            {
                "email": destinatario_email,
                "name": destinatario_nombre or destinatario_email,
            }
        ],
        "subject": asunto,
        "textContent": mensaje,
    }

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    response = requests.post(url, json=payload, headers=headers, timeout=20)

    if response.status_code not in (200, 201, 202):
        raise Exception(f"Error Brevo {response.status_code}: {response.text}")

    return response.json()