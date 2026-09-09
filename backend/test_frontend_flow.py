"""
Test suite validating all endpoints and data flows connected by the frontend using standard urllib
"""
import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://localhost:8000"

def api_call(endpoint, method="GET", data=None, token=None, content_type="application/json"):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = None
    if data is not None:
        if isinstance(data, (dict, list)):
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body = data
            headers["Content-Type"] = content_type

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return resp.status, json.loads(raw.decode("utf-8")) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            err_json = json.loads(raw.decode("utf-8"))
        except Exception:
            err_json = {"detail": raw.decode("utf-8")}
        return e.code, err_json

def test_full_frontend_flow():
    print("\n=================== STARTING FRONTEND API FLOW TEST ===================")
    
    # 1. Login with Doctor Email and ID
    print("\n--- 1. Testing Doctor Login ---")
    st, res = api_call("/auth/login", method="POST", data={"email": "doctor@retinax.org", "password": "DoctorPass123!"})
    assert st == 200, f"Doctor email login failed: {res}"
    doc_token = res["access_token"]
    print("Doctor Email Login: SUCCESS")

    st, res = api_call("/auth/login", method="POST", data={"email": "DOC-9041", "password": "DoctorPass123!"})
    assert st == 200, f"Doctor ID login failed: {res}"
    print("Doctor ID Login: SUCCESS")

    st, res = api_call("/auth/me", token=doc_token)
    assert st == 200
    doc_user = res["user"]
    assert doc_user["role"] == "doctor"
    print("Doctor Profile Me: SUCCESS")

    # 2. Worker Login & Profile
    print("\n--- 2. Testing Worker Login ---")
    st, res = api_call("/auth/login", method="POST", data={"email": "worker@retinax.org", "password": "WorkerPass123!"})
    assert st == 200
    wrk_token = res["access_token"]
    print("Worker Email Login: SUCCESS")

    st, res = api_call("/auth/login", method="POST", data={"email": "WRK-3082", "password": "WorkerPass123!"})
    assert st == 200
    print("Worker ID Login: SUCCESS")

    # 3. Patient Login & Profile
    print("\n--- 3. Testing Patient Login ---")
    st, res = api_call("/auth/login", method="POST", data={"email": "patient@retinax.org", "password": "PatientPass123!"})
    assert st == 200
    pat_token = res["access_token"]
    print("Patient Email Login: SUCCESS")

    st, res = api_call("/auth/login", method="POST", data={"email": "RX-104582", "password": "PatientPass123!"})
    assert st == 200
    print("Patient ID Login: SUCCESS")

    # 4. Worker Registers a New Patient
    print("\n--- 4. Testing Patient Registration by Worker ---")
    test_patient_id = f"RX-TEST-{int(time.time())}"
    st, res = api_call("/auth/register", method="POST", data={
        "name": "Devi Raman",
        "email": f"{test_patient_id.lower()}@retinax.org",
        "password": "PatientPass123!",
        "role": "patient",
        "phone": "+91 98765 43210",
        "hospital_or_area": "District Clinic 4",
        "custom_id": test_patient_id
    })
    assert st == 201, f"Register failed: {res}"
    print(f"Registered new patient {test_patient_id}: SUCCESS")

    # 5. Fetch Patients List
    print("\n--- 5. Testing Fetch Patients List ---")
    st, patients_list = api_call("/auth/patients", token=wrk_token)
    assert st == 200
    assert any(p["id"] == test_patient_id for p in patients_list)
    print(f"Fetched {len(patients_list)} patients: SUCCESS")

    # 6. Upload Screening Image & Run AI Stub
    print("\n--- 6. Testing Retinal Image Upload & AI Inference STUB ---")
    # Build multipart/form-data manually
    boundary = "----WebKitFormBoundaryRetinaXTest7MA4YWxkTrZu0gW"
    # Valid 1x1 PNG bytes
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
    
    parts = []
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"patient_id\"\r\n\r\n{test_patient_id}".encode("utf-8"))
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"laterality\"\r\n\r\nRight Eye (OD)".encode("utf-8"))
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"retina_scan.png\"\r\nContent-Type: image/png\r\n\r\n".encode("utf-8") + png_bytes)
    parts.append(f"--{boundary}--\r\n".encode("utf-8"))
    multipart_body = b"\r\n".join(parts)

    st, report_data = api_call(
        "/reports/upload",
        method="POST",
        data=multipart_body,
        token=wrk_token,
        content_type=f"multipart/form-data; boundary={boundary}"
    )
    assert st == 201, f"Upload failed: {report_data}"
    report_id = report_data["id"]
    assert "ai_diagnosis" in report_data
    assert "drClassification" in report_data["ai_diagnosis"]
    print(f"Uploaded Report ID {report_id}, AI DR Grade: {report_data['ai_diagnosis']['drClassification']['grade']}: SUCCESS")

    # 7. Doctor Review & Status Update
    print("\n--- 7. Testing Doctor Review & Assessment Submission ---")
    st, updated_report = api_call(
        f"/reports/{report_id}/status",
        method="PUT",
        data={"status": "reviewed", "doctor_notes": "Clinical review confirmed severe NPDR. Urgent hospital referral indicated."},
        token=doc_token
    )
    assert st == 200, f"Doctor review failed: {updated_report}"
    assert updated_report["status"] == "reviewed"
    print("Doctor Assessment Signed & Submitted: SUCCESS")

    # 8. Doctor Issues Transit Pass
    print("\n--- 8. Testing Doctor Issuing Transit Pass ---")
    st, transit_pass = api_call(
        "/transit-pass/refer",
        method="POST",
        data={
            "patient_id": test_patient_id,
            "report_id": report_id,
            "referral_reason": "High risk NPDR with macular threat.",
            "target_hospital": "St. Jude Eye Institute Vitreoretinal Unit",
            "urgency": "Urgent"
        },
        token=doc_token
    )
    assert st == 201, f"Transit pass failed: {transit_pass}"
    print(f"Transit Pass Generated ({transit_pass['id']}): SUCCESS")

    # 9. Patient Portal Access (Own Data Only)
    print("\n--- 9. Testing Patient Portal Access & Privacy Isolation ---")
    st, pat_login = api_call("/auth/login", method="POST", data={"email": test_patient_id, "password": "PatientPass123!"})
    assert st == 200
    new_pat_token = pat_login["access_token"]

    # Patient can view own transit pass
    st, my_tps = api_call(f"/transit-pass/{test_patient_id}", token=new_pat_token)
    assert st == 200
    assert len(my_tps) > 0
    print("Patient viewing own transit pass: SUCCESS")

    # Patient CANNOT view other patient's transit pass (e.g. RX-104582)
    st, forbidden_tp = api_call("/transit-pass/RX-104582", token=new_pat_token)
    assert st == 403, f"Expected 403, got {st}"
    print("Patient blocked from accessing other patient's transit pass: SUCCESS (403 Forbidden)")

    # 10. Notifications
    print("\n--- 10. Testing Notifications ---")
    st, notifs = api_call(f"/notifications/{doc_user['id']}", token=doc_token)
    assert st == 200
    print(f"Doctor Notifications count: {len(notifs)}: SUCCESS")
    if len(notifs) > 0:
        st, read_res = api_call(f"/notifications/{notifs[0]['id']}/read", method="PUT", token=doc_token)
        assert st == 200
        print("Mark notification as read: SUCCESS")

    print("\n=================== ALL FRONTEND FLOW TESTS PASSED! ===================\n")

if __name__ == "__main__":
    test_full_frontend_flow()
