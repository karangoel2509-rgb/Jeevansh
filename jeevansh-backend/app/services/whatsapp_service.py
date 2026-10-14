from twilio.rest import Client
from app.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_donor_alert(donor_phone: str, blood_type: str, hospital: str, distance: float):
    """Send a WhatsApp alert to a matched donor."""
    
    # Ensure the phone number is in the correct format
    if not donor_phone.startswith("whatsapp:"):
        to_number = f"whatsapp:{donor_phone}"
    else:
        to_number = donor_phone

    message_body = (
        f"🩸 *EMERGENCY BLOOD REQUEST*\n\n"
        f"Patient needs: *{blood_type}*\n"
        f"Hospital: {hospital or 'Nearby Hospital'}\n"
        f"Distance: ~{distance} km away\n\n"
        f"Reply *YES* to accept or *NO* to decline.\n"
        f"Your response could save a life. ❤️"
    )

    try:
        message = client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=message_body,
            to=to_number
        )
        print(f"✅ WhatsApp sent to {donor_phone}: {message.sid}")
        return True
    except Exception as e:
        print(f"❌ Failed to send WhatsApp to {donor_phone}: {e}")
        return False