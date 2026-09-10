import os
import sys
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

import cv2
import numpy as np
from fastapi.testclient import TestClient
from backend.main import app
from backend.ai_model.inference import run_dr_inference, WEIGHTS_DIR
from backend.config.settings import settings

print("=" * 60)
print("1. VERIFYING 5 ONNX WEIGHTS IN /backend/ai_model/weights/:")
expected_models = [
    "RETINAX_IQA_FINAL.onnx",
    "RETINAX_OPTIC_DISC_MATLAB.onnx",
    "RETINAX_VESSEL_MATLAB.onnx",
    "best_exudate_model_FINAL.onnx",
    "RETINAX_DR_FINAL.onnx",
]
for model_name in expected_models:
    p = WEIGHTS_DIR / model_name
    assert p.exists(), f"Missing model: {model_name}"
    print(f"  [OK] {model_name:32} ({p.stat().st_size:,} bytes)")

print("\n" + "=" * 60)
print("2. VERIFYING GEMINI_API_KEY CONFIGURATION:")
print(f"  settings.GEMINI_API_KEY value: {'[Configured]' if settings.GEMINI_API_KEY else '[Empty/Awaiting from user]'}")
# Verify it's not hardcoded in settings.py or chatbot.py
with open(ROOT / "backend" / "config" / "settings.py", "r") as f:
    settings_code = f.read()
    assert 'os.getenv("GEMINI_API_KEY"' in settings_code, "GEMINI_API_KEY must be loaded via os.getenv"
with open(ROOT / "backend" / "routes" / "chatbot.py", "r") as f:
    chatbot_code = f.read()
    assert "AIzaSy" not in chatbot_code, "No hardcoded API keys allowed"
print("  [OK] GEMINI_API_KEY is read strictly from environment (.env), never hardcoded.")

print("\n" + "=" * 60)
print("3. TESTING PIPELINE ON ACCEPTED IMAGE (good_fundus.jpg):")
good_img_path = r"C:\Users\Dell\.gemini\antigravity-ide\brain\f5425807-affa-41d8-97a4-d273d0160d95\scratch\good_fundus.jpg"
res_good = run_dr_inference(good_img_path)

print(f"  IQA Status: {res_good['iqa']['status']} (Score: {res_good['iqa']['score']}%)")
print(f"  DR Grade: {res_good['drClassification']['grade']} (Confidence: {res_good['drClassification']['confidence']})")
print(f"  Referable DR: {res_good['referableDR']['isReferable']} ({res_good['referableDR']['criteria']})")
print(f"  Optic Disc: {res_good['opticDisc']['status']} (C/D: {res_good['opticDisc']['cupToDiscRatio']})")
print(f"  Vessels: {res_good['vesselAnalysis']['status']} (Density: {res_good['vesselAnalysis']['vesselDensity']}%)")
print(f"  Exudates: Detected={res_good['exudates']['detected']} (Pixels: {res_good['exudates']['pixelCount']})")
print(f"  Microaneurysms: Status={res_good['microaneurysms']['status']} (Detected={res_good['microaneurysms']['detected']})")
print(f"  Hemorrhages: Status={res_good['hemorrhages']['status']} (Detected={res_good['hemorrhages']['detected']})")
print(f"  Neovascularization: Status={res_good['neovascularization']['status']} (Detected={res_good['neovascularization']['detected']})")
print(f"  Grad-CAM: Status={res_good['gradCam']['status']} (Available={res_good['gradCam']['available']})")

assert res_good['microaneurysms']['status'] == "not_yet_implemented"
assert res_good['microaneurysms']['detected'] is None
assert res_good['hemorrhages']['status'] == "not_yet_implemented"
assert res_good['hemorrhages']['detected'] is None
assert res_good['neovascularization']['status'] == "not_yet_implemented"
assert res_good['neovascularization']['detected'] is None
assert res_good['gradCam']['status'] == "not_yet_implemented"
assert res_good['gradCam']['available'] is False
print("  [OK] All 5 models ran and unprovided models strictly flagged as not_yet_implemented.")

print("\n" + "=" * 60)
print("4. TESTING PIPELINE ON REJECTED IMAGE (bad_fundus.jpg):")
bad_img_path = r"C:\Users\Dell\.gemini\antigravity-ide\brain\f5425807-affa-41d8-97a4-d273d0160d95\scratch\bad_fundus.jpg"
res_bad = run_dr_inference(bad_img_path)

print(f"  Status: {res_bad.get('status')}")
print(f"  IQA Acceptable: {res_bad['iqa']['isAcceptable']}")
print(f"  Feedback: {res_bad['iqa']['feedback']}")
assert res_bad.get('status') == "rejected_poor_quality"
assert res_bad['iqa']['isAcceptable'] is False
assert "Recapture required" in res_bad['iqa']['feedback']
print("  [OK] IQA triage rejected ungradeable image with recapture instructions.")

print("\n" + "=" * 60)
print("5. TESTING FASTAPI ENDPOINTS WITH TESTCLIENT:")
client = TestClient(app)

# Test health check
health = client.get("/api/health")
assert health.status_code == 200
print(f"  [OK] /api/health returned 200: {len(health.json()['ai_pipeline']['live_models'])} live models")

# Test chatbot ask
chatbot = client.post("/chatbot/ask", json={
    "message": "What is the difference between Mild NPDR and Severe NPDR?",
    "user_role": "PATIENT"
})
assert chatbot.status_code == 200
print(f"  [OK] POST /chatbot/ask returned 200. Reply prefix: {chatbot.json()['reply'][:80]}...")

print("\n" + "=" * 60)
print("ALL E2E BACKEND TESTS PASSED SUCCESSFULLY!")
