import os
from xml.sax.saxutils import escape

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.rest import Client

load_dotenv(dotenv_path="../.env")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")
OPERATOR_TO_NUMBER = os.getenv("OPERATOR_TO_NUMBER")

if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, OPERATOR_TO_NUMBER]):
    raise RuntimeError(
        "Missing required env vars. "
        "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, OPERATOR_TO_NUMBER in .env"
    )

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

app = FastAPI(title="GridShield Voice Dispatch")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class CallRequest(BaseModel):
    message: str


@app.post("/call")
async def make_call(req: CallRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message must not be empty")

    safe_message = escape(req.message)
    twiml = f"<Response><Say>{safe_message}</Say></Response>"

    try:
        call = client.calls.create(
            twiml=twiml,
            to=OPERATOR_TO_NUMBER,
            from_=TWILIO_FROM_NUMBER,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Twilio error: {exc}")

    return {
        "ok": True,
        "call_sid": call.sid,
        "to": OPERATOR_TO_NUMBER,
        "from": TWILIO_FROM_NUMBER,
        "message": req.message,
    }
