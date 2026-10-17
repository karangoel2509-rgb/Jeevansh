from fastapi import APIRouter, Request, Query
from fastapi.responses import PlainTextResponse

router = APIRouter(prefix="/api/webhook", tags=["webhook"])

@router.get("/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(alias="hub.mode", default=None),
    hub_challenge: str = Query(alias="hub.challenge", default=None),
    hub_verify_token: str = Query(alias="hub.verify_token", default=None),
):
    # Meta webhook verification
    if hub_mode == "subscribe" and hub_verify_token == "jeevansh_secret":
        return PlainTextResponse(content=hub_challenge)
    return PlainTextResponse(content="Verification failed", status_code=403)

@router.post("/whatsapp")
async def receive_webhook(request: Request):
    data = await request.json()
    # TODO: Parse Twilio/Meta payload here
    # If reply is "YES", extract donor_phone and request_id, then call:
    # await accept_request(donor_id, request_id, channel="whatsapp")
    print("📩 Webhook received:", data)
    return {"status": "ok"}