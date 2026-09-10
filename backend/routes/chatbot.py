"""
RetinaX Netra AI Conversational Assistant Endpoint
===================================================
Endpoint: POST /chatbot/ask

Non-diagnostic AI assistant for patients, healthcare workers, and doctors.
Answers questions about:
  - Diabetic retinopathy biology, ICDR grading (0-4), prevention
  - Lesion interpretations (microaneurysms, hemorrhages, exudates, vessels)
  - Fundus image quality and recapture techniques
  - RetinaX tele-screening workflow and referrals

Strictly adheres to clinical safety constraints:
  - NEVER provides a definitive medical diagnosis.
  - Distinguishes AI screening results from final clinical diagnoses.
  - Does NOT alter medication or insulin regimens.
  - LLM API key (GEMINI_API_KEY) is loaded solely from .env / settings.
"""

import os
import httpx
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status

from backend.config.settings import settings

router = APIRouter(tags=["NetraAI Chatbot"])

NETRA_SYSTEM_PROMPT = """You are Netra AI, an intelligent conversational assistant embedded in the RetinaX diabetic retinopathy tele-screening platform.

PURPOSE & ROLE:
- Subtitle: "Your AI assistant for retinal screening & clinical workflows".
- You help Health Workers, Doctors, Patients, and Administrators understand:
  • Diabetic Retinopathy (DR) pathophysiology, staging, and prevention.
  • The International Clinical Diabetic Retinopathy (ICDR) scale (Grade 0: No DR, Grade 1: Mild NPDR, Grade 2: Moderate NPDR, Grade 3: Severe NPDR, Grade 4: Proliferative DR).
  • Retinal lesions: microaneurysms, dot-blot hemorrhages, hard lipid exudates, cotton-wool spots, neovascularization.
  • Fundus image quality parameters: sharpness, illumination, focus, pupil dilation, and non-mydriatic camera alignment.
  • Multi-model AI outputs, confidence metrics, and segmentation overlays.
  • Tele-ophthalmology referral protocols and doctor review stages.
- You are an EXPLANATION AND WORKFLOW ASSISTANT, NOT A DIAGNOSTIC DOCTOR.

ABSOLUTE MEDICAL SAFETY & ANTI-HALLUCINATION RULES:
1. NEVER provide a definitive medical diagnosis. Never say "You have diabetic retinopathy" or "This confirms disease".
2. Always distinguish AI screening results from final clinical diagnoses. Use formulations such as:
   • "The AI screening model estimated..."
   • "The screening scan shows features consistent with..."
   • "These findings must be reviewed and confirmed by a qualified ophthalmologist."
3. If asked "Do I definitely have diabetic retinopathy?", answer:
   "I can explain the AI screening result, but I cannot provide a definitive medical diagnosis. All screening results require clinical confirmation by an eye care specialist."
4. DO NOT recommend starting, stopping, or altering medications or insulin dosages.
5. If acute emergency symptoms are reported (sudden loss of vision, curtain falling over visual field, flashes of light, severe ocular pain), urge immediate emergency ophthalmology / emergency room care.
6. When referencing model availability:
   • Live models: Image Quality Assessment (IQA), Optic Disc Localization, Vessel Tree Segmentation, Hard Exudate Segmentation, and DR Severity Grading (0-4).
   • In-development models (Coming Soon): Microaneurysm detection, Hemorrhage classification, Neovascularization detection, and Grad-CAM backprop heatmap visualization.

ROLE-AWARE ADAPTATION:
- PATIENT: Use calm, compassionate, plain-language terms. Explain what screening results mean practically and why regular eye checks protect vision.
- HEALTH_WORKER: Focus on fundus imaging capture techniques, camera focus, pupil alignment, retake instructions, and patient transit/referral workflows.
- DOCTOR: Provide clinically precise details using standard ICDR criteria, microvascular pathophysiology, lesion distribution, and referral urgency.
"""


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'model', or 'assistant'")
    text: str


class ChatbotAskRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or query")
    user_role: Optional[str] = Field("PATIENT", description="User role: PATIENT, HEALTH_WORKER, DOCTOR, ADMIN")
    screening_context: Optional[Dict[str, Any]] = Field(None, description="Optional current screening context")
    conversation_history: Optional[List[ChatMessage]] = Field(default=[], description="Recent conversation turns")


class ChatbotAskResponse(BaseModel):
    reply: str
    is_demo_mode: bool = False
    error: bool = False


def format_context_block(context: Optional[Dict[str, Any]]) -> str:
    """Formats screening context into a clean text block for the LLM."""
    if not context:
        return ""

    lines = ["\n[CURRENT AUTHORIZED SCREENING CONTEXT]"]
    if "patientId" in context or "patient_id" in context:
        lines.append(f"• Patient ID: {context.get('patientId') or context.get('patient_id')}")
    if "grade" in context or "drGrade" in context:
        lines.append(f"• AI DR Grade: {context.get('grade') or context.get('drGrade')}")
    if "severity" in context:
        lines.append(f"• Disease Severity: {context.get('severity')}")
    if "confidence" in context:
        lines.append(f"• Confidence: {context.get('confidence')}%")
    if "isReferable" in context:
        lines.append(f"• Referable DR Flag: {'Yes' if context.get('isReferable') else 'No'}")
    if "iqa" in context and isinstance(context["iqa"], dict):
        lines.append(f"• Image Quality: {context['iqa'].get('status')} (Score: {context['iqa'].get('score', 'N/A')})")
    if "exudates" in context and isinstance(context["exudates"], dict):
        lines.append(f"• Hard Exudates: {'Detected' if context['exudates'].get('detected') else 'None'}")
    lines.append("[END CONTEXT]\n")
    return "\n".join(lines)


@router.post("/chatbot/ask", response_model=ChatbotAskResponse)
@router.post("/api/chatbot/ask", response_model=ChatbotAskResponse)
async def chatbot_ask(req: ChatbotAskRequest):
    """
    Answers questions about Diabetic Retinopathy, screening results, and platform workflows.
    Powered by Gemini LLM using GEMINI_API_KEY from environment.
    """
    message = req.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question message cannot be empty.",
        )

    # Check for GEMINI_API_KEY in environment
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    if not api_key:
        # Graceful guidance when API key has not yet been set in .env
        return ChatbotAskResponse(
            reply=(
                "**Welcome to Netra AI!**\n\n"
                "The Netra AI chatbot endpoint is ready. To connect to the live Gemini LLM, please add your `GEMINI_API_KEY` to the `.env` file.\n\n"
                "*Clinical Note:* RetinaX provides non-diagnostic screening assistance. Our 5 live ONNX models (IQA, Optic Disc, Vessel Tree, Exudate Segmentation, and DR Grading) are currently active."
            ),
            is_demo_mode=True,
            error=False,
        )

    # Build prompt with system instructions, user role, and context
    role_instruction = f"\nUSER ROLE: {req.user_role.upper() if req.user_role else 'PATIENT'}. Tailor terminology appropriately."
    context_str = format_context_block(req.screening_context)
    full_system = f"{NETRA_SYSTEM_PROMPT}\n{role_instruction}\n{context_str}"

    # Build contents payload for Gemini REST API
    contents = []
    # Include history turns
    if req.conversation_history:
        for turn in req.conversation_history[-6:]:
            gemini_role = "model" if turn.role in ["model", "assistant"] else "user"
            contents.append({
                "role": gemini_role,
                "parts": [{"text": turn.text}],
            })

    # Add current user message
    contents.append({
        "role": "user",
        "parts": [{"text": message}],
    })

    payload = {
        "systemInstruction": {
            "parts": [{"text": full_system}],
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800,
        },
    }

    # Call Gemini REST API
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                gemini_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )

        if resp.status_code != 200:
            err_body = resp.text
            return ChatbotAskResponse(
                reply=f"Netra AI temporarily encountered an upstream LLM issue (HTTP {resp.status_code}). Please verify your GEMINI_API_KEY in .env.",
                error=True,
            )

        data = resp.json()
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            reply_text = "".join(p.get("text", "") for p in parts).strip()
            return ChatbotAskResponse(
                reply=reply_text or "No response generated.",
                is_demo_mode=False,
                error=False,
            )
        else:
            return ChatbotAskResponse(
                reply="Netra AI did not generate a response. Please try rephrasing your question.",
                error=False,
            )

    except httpx.TimeoutException:
        return ChatbotAskResponse(
            reply="Netra AI query timed out. Please try again.",
            error=True,
        )
    except Exception as e:
        return ChatbotAskResponse(
            reply=f"Netra AI error: {str(e)}",
            error=True,
        )
