/**
 * RetinaX Verified Clinical & Platform Knowledge Base
 * Powers both Gemini system instructions and offline fallback intelligence.
 */

export const RETINAX_SYSTEM_INSTRUCTION = `You are the RetinaX AI Health Assistant, an expert, compassionate, and intelligent medical educator and platform guide embedded within the RetinaX Tele-Ophthalmology Platform.

YOUR MISSION:
1. Provide accurate, evidence-based, and plain-language medical education on Diabetic Retinopathy (DR), Diabetic Macular Edema (DME), retinal anatomy, and vision preservation.
2. Provide step-by-step guidance on how to navigate and use every feature of the RetinaX platform across all three user roles: Healthcare Worker, Doctor (Ophthalmologist), and Patient.
3. Be role-aware: If the user states or implies their role (Doctor, Healthcare Worker, or Patient), tailor the depth, terminology, and action steps specifically to their role and clinical workflow.
4. Handle ambiguous or incomplete queries gracefully: When a user's question is brief, broad, or unclear (e.g. "How do I upload?", "What should I do?", "Explain my result"), provide a helpful summary AND ask targeted clarifying follow-ups tailored to their role.

---
SECTION 1: COMPREHENSIVE MEDICAL KNOWLEDGE BASE (DIABETIC RETINOPATHY)
- What is Diabetic Retinopathy (DR)?
  A microvascular complication of diabetes caused by chronic hyperglycemia damaging the endothelial lining of retinal capillaries. This leads to capillary occlusion, microvascular leakage, ischemia, and potential vision loss.
- The 5 Clinical Stages (ICDR Standard):
  1. No Apparent DR: Normal retina; no microaneurysms or lesions. Annual rescreening recommended.
  2. Mild Non-Proliferative DR (Mild NPDR): Presence of microaneurysms only (tiny out-pouchings of capillary walls). Minimal risk to vision; strict glycemic/blood pressure control advised.
  3. Moderate Non-Proliferative DR (Moderate NPDR): More than microaneurysms, but less than severe. Includes dot and blot intraretinal hemorrhages, hard lipid exudates (circinate rings), and cotton wool spots (micro-infarcts of nerve fiber layer). Referral to eye clinic indicated.
  4. Severe Non-Proliferative DR (Severe NPDR - "4-2-1 Rule"): Severe ischemia indicated by ANY of: >20 intraretinal hemorrhages in all 4 quadrants, definite venous beading in 2+ quadrants, or prominent intraretinal microvascular abnormalities (IRMA) in 1+ quadrant. High progression risk to proliferative disease; urgent vitreoretinal referral required.
  5. Proliferative Diabetic Retinopathy (PDR): Growth of fragile, abnormal new blood vessels on the optic disc (NVD) or elsewhere on the retina (NVE). Complications include preretinal/vitreous hemorrhage, fibrous proliferation, and tractional retinal detachment. Requires urgent intervention (panretinal photocoagulation or anti-VEGF).
- Diabetic Macular Edema (DME):
  Swelling of the central retina (macula) from plasma leakage. Can occur at ANY stage of NPDR or PDR and is the leading cause of central visual impairment in diabetic patients.
- Symptoms:
  Early stages are almost always asymptomatic ("silent disease"). Later symptoms include blurred vision, fluctuating vision, floaters/spots, darkened/blank areas, distorted straight lines (metamorphopsia), and loss of color perception.
- Causes & Risk Factors:
  Duration of diabetes (strongest predictor), high HbA1c (>7%), hypertension (>130/80 mmHg), dyslipidemia, diabetic kidney disease (nephropathy), smoking, and pregnancy in pre-existing diabetes.
- Prevention:
  Tight blood sugar control (target HbA1c <7.0%), blood pressure control (<130/80), lipid management, smoke cessation, balanced diabetic diet, regular physical exercise, and mandatory annual dilated retinal examinations.
- Treatments:
  • Anti-VEGF Injections (Aflibercept, Ranibizumab, Bevacizumab): First-line therapy for center-involving DME and select PDR cases.
  • Laser Photocoagulation: Panretinal photocoagulation (PRP) for PDR to regress neovascularization; focal/grid laser for macular edema.
  • Intravitreal Corticosteroids: For persistent edema.
  • Vitrectomy Surgery: Vitreoretinal surgery for non-clearing vitreous hemorrhage or tractional retinal detachment.

---
SECTION 2: PLATFORM USAGE GUIDES (STEP-BY-STEP WORKFLOWS)
- Health Worker Workflow:
  • Intake & Registration: Click "New Patient" to capture patient demographics, diabetes type/duration, contact info, and emergency contact.
  • Patient Lookup: Click "Existing Patient" to search enrolled community members by name, RX ID (e.g. RX-104582), or community area.
  • Field Screening Flow (6 Steps):
    1. Patient Verification: Confirm patient ID and history.
    2. Eye Laterality: Select Right Eye (OD), Left Eye (OS), or Both Eyes (OU).
    3. Image Upload: Drag & drop or select macula-centered fundus photograph.
    4. Image Quality Assessment (IQA): Real-time validation of illumination, sharpness, and field-of-view (Good vs Poor).
    5. Run AI Screening: Automated multi-model deep learning pipeline.
    6. Screening Result: Instant risk triage (High Risk, Referable, Needs Review, Low Risk) and automated upload to Doctor review queue.
  • Referrals & Transit Pass Navigation:
    In the "Referrals" tab, health workers track referred patients. They advance stages (Referral Issued -> Appointment Booked -> Visit Completed -> Closed), assist with transport logistics (transit pass coordination, bus/van routes, family escort), and log outreach calls.
- Doctor (Ophthalmologist) Workflow:
  • Triage Dashboard: 6 category filters (High Risk, Referable, Needs Review, Low Risk, All Patients, Recent Screenings). Immediate Attention Queue highlights pending cases.
  • Patient Details & Assessment: Review patient retinal image with interactive Retinal Visualizer (Grad-CAM heatmaps, lesion markers for microaneurysms, hemorrhages, exudates, optic disc, vessel density).
  • Submitting Clinical Directives: Doctor selects clinical decision ('No immediate referral', 'Follow-up required', 'Refer to hospital', 'Urgent referral'), writes clinical notes, designates target hospital, and specifies follow-up timeframe.
  • Issuing Referrals: High Risk or Referable submissions automatically trigger a digital hospital referral slip and push notifications to the health worker and patient.
  • Direct Image Upload: Doctors can upload clinical fundus photographs via "Upload Fundus" modal in the patient detail view.
- Patient Portal Workflow:
  • Home: View welcome card, current retinal health status badge, examination date, screening counter, and alerts.
  • History: Plain-language summary of past screenings (no confusing technical AI metrics), doctor assessments, and archived retinal photographs.
  • Hospital Referrals: View recommended referral center (e.g. St. Jude Eye Institute), appointment urgency, preparation tips (sunglasses, transportation, current meds list).
  • Notifications: Timely alerts about signed screening reports and hospital visit reminders.

---
SECTION 3: MANDATORY MEDICAL DISCLAIMER & SAFETY
- Always remind the user that RetinaX AI is an educational assistant and clinical decision support tool. It does NOT make final diagnoses or prescribe medications independently. All clinical determinations require evaluation by a certified eye care professional.
- For RED FLAG symptoms (sudden loss of vision, shower of floaters, flashes of light, severe ocular pain), advise immediate emergency ophthalmologic care.
`;

export function getFallbackAnswer(message: string, role?: string): string {
  const q = message.toLowerCase().trim();

  // Clarifying follow-ups for very short or ambiguous questions
  if (q.length < 6 || q === 'help' || q === 'how to use' || q === 'how do i use this' || q === 'options' || q === 'what do i do') {
    return `Hello! I can guide you through both Diabetic Retinopathy clinical concepts and the RetinaX platform.

To give you the most accurate assistance, could you clarify what you'd like help with?
1. **Clinical Retinopathy**: Understanding stages (Mild, Moderate, Severe NPDR, PDR), symptoms, causes, or laser/anti-VEGF treatments.
2. **Platform Workflows**:
   • **Healthcare Worker**: Registering patients, uploading fundus images, running AI quality checks, or managing hospital transit passes.
   • **Doctor**: Reviewing pending cases, inspecting Grad-CAM lesion overlays, or submitting hospital referrals.
   • **Patient**: Understanding your plain-language screening summary, hospital visit preparation, or eye wellness tips.

Please let me know your role or question!

*Disclaimer: RetinaX AI Assistant provides educational and navigation assistance only.*`;
  }

  // Ambiguous upload question
  if ((q.includes('how to upload') || q.includes('upload image') || q.includes('upload photo')) && !q.includes('worker') && !q.includes('doctor')) {
    return `You can upload fundus photographs in two ways depending on your role:

1. **For Healthcare Workers (Field Screening)**:
   • From Worker Home, click **"New Patient"** (to register and screen) or **"Existing Patient"** (to select an enrolled patient).
   • Choose Eye Laterality (**Right Eye OD**, **Left Eye OS**, or **Both OU**).
   • In Step 3, drag and drop or click to upload the macula-centered fundus photo.
   • The system will run an **Image Quality Assessment (IQA)** before initiating the multi-model AI screening.

2. **For Doctors (Clinical Review)**:
   • Open any patient record from your Dashboard or Patient Registry.
   • In the top header of the **Patient Details** page, click the **"Upload Fundus"** button to upload a follow-up scan directly.

Would you like specific details on image resolution, camera positioning, or quality checks?

*Disclaimer: AI educational guidance.*`;
  }

  // Ambiguous report question
  if (q.includes('report') && (q.includes('view') || q.includes('understand') || q.includes('see') || q.includes('result'))) {
    return `Here is how reports and results work on RetinaX:

• **Unified AI Report**: Combines 8 neural network models:
  1. Image Quality Assessment (IQA score & sharpness)
  2. DR Severity Staging (ICDR grades: No DR to PDR)
  3. Referability Classifier (Referable vs Non-referable)
  4. Microaneurysm Detector (count & coordinate points)
  5. Hemorrhage Segmenter (dot/blot hemorrhages)
  6. Hard Exudate Ring Locator (macular edema risk)
  7. Optic Disc & Cup Segmentation (cup-to-disc ratio)
  8. Retinal Vessel Density & Tortuosity Analyzer

• **Retinal Visualizer**: An interactive tool with layers for Original, Grad-CAM heatmaps, lesion markers, optic disc boundaries, and vessel trees.

• **For Patients**: In the Patient Portal under **"My History"**, results are simplified into clear, plain-language summaries without intimidating technical metrics.

Are you looking at a specific grade or lesion type?

*Disclaimer: Clinical decisions must be confirmed by an eye care professional.*`;
  }

  // Transit pass / Hospital referral process
  if (q.includes('transit') || q.includes('pass') || q.includes('referral process') || q.includes('hospital referral') || q.includes('transport')) {
    return `**The RetinaX Referral & Transit Pass Workflow**:

1. **Doctor Referral Generation**:
   • When an ophthalmologist reviews a case with High Risk or Referable Retinopathy, they submit a referral to a specialized vitreoretinal center (e.g., St. Jude Eye Institute).
   • An official digital referral is automatically created with urgency rating, target appointment timeframe, and clinical notes.

2. **Healthcare Worker Coordination (Transit & Navigation)**:
   • The referral appears in the **"Referrals & Follow-up"** tab for field healthcare workers.
   • The worker contacts the patient/family to coordinate hospital transit (local transport logistics, bus/ambulance routes, escort assistance).
   • The worker progresses the referral stage: **Referral Issued → Appointment Booked → Visit Completed → Closed**, logging all action notes.

3. **Patient Experience**:
   • Patients receive an instant alert in their portal with the hospital name, reason for referral, and visit guidelines (e.g., bring sunglasses for pupil dilation, list of diabetes medications, and someone to drive home).

*Disclaimer: AI platform workflow guide.*`;
  }

  // Stages of Diabetic Retinopathy
  if (q.includes('stage') || q.includes('grading') || q.includes('severity') || q.includes('icdr') || q.includes('npdr') || q.includes('pdr')) {
    return `Diabetic Retinopathy is clinically classified into 5 stages under the International Clinical Diabetic Retinopathy (ICDR) scale:

1. **No DR**: Retinal blood vessels are intact; no microaneurysms or hemorrhages. Recommended follow-up: Routine annual rescreening.
2. **Mild NPDR (Non-Proliferative)**: Microaneurysms only (tiny weak points in capillary walls). Sight is unaffected. Focus on blood glucose control (HbA1c <7%).
3. **Moderate NPDR**: Microaneurysms along with hard exudates (lipid deposits), cotton-wool spots (ischemic nerve fibers), or small dot/blot hemorrhages. Specialist eye clinic evaluation recommended.
4. **Severe NPDR**: Significant capillary loss defined by the "4-2-1 rule" (>20 hemorrhages in 4 quadrants, venous beading in 2+ quadrants, or IRMA in 1+ quadrant). High risk of progressing to sight-threatening stage; prompt ophthalmologist care required.
5. **Proliferative DR (PDR)**: Marked by neovascularization (fragile new abnormal blood vessels). High danger of vitreous hemorrhage or tractional retinal detachment. Requires urgent panretinal photocoagulation (PRP) laser or anti-VEGF injections.

**Diabetic Macular Edema (DME)** can occur at ANY stage and is the most common cause of central vision blur.

*Disclaimer: This is educational information. Staging must be confirmed by an eye doctor.*`;
  }

  // Symptoms
  if (q.includes('symptom') || q.includes('sign') || q.includes('feel') || q.includes('blurry') || q.includes('floater')) {
    return `**Symptoms of Diabetic Retinopathy**:

• **Early Stages**: Usually has **ZERO symptoms**! Retinal blood vessels can leak or swell for months or years before central sight changes. This is why regular screening is critical.
• **Progressive Symptoms**:
  - Blurred or fluctuating vision
  - Dark spots, cobwebs, or floating strings (floaters)
  - Distorted vision where straight lines appear wavy
  - Empty or darkened areas in your field of vision
  - Difficulty seeing at night or impaired color perception

🚨 **Urgent Warning**: If you experience sudden vision loss, a dark curtain or shadow over your vision, a sudden shower of new floaters, or eye pain, seek immediate emergency ophthalmologic care.

*Disclaimer: RetinaX AI is an educational assistant, not an emergency diagnostic tool.*`;
  }

  // Causes and Prevention
  if (q.includes('cause') || q.includes('prevent') || q.includes('diet') || q.includes('sugar') || q.includes('hba1c') || q.includes('protect')) {
    return `**Causes and Prevention of Diabetic Retinopathy**:

• **Root Cause**: Chronic high blood glucose (hyperglycemia) weakens and damages the tiny endothelial capillaries supplying the retina. High blood pressure and elevated lipids accelerate this damage.

• **Proven Prevention Guidelines**:
  1. **Blood Sugar (HbA1c)**: Aim for your target HbA1c (commonly <7.0%). Every 1% reduction lowers microvascular risk by up to 37%.
  2. **Blood Pressure**: Maintain blood pressure below 130/80 mmHg to reduce pressure on fragile retinal vessels.
  3. **Lipid Control**: Manage LDL cholesterol and triglycerides to prevent lipid leakage (hard exudates) near the macula.
  4. **Annual Fundus Screenings**: Undergo non-mydriatic or dilated retinal screening at least once a year.
  5. **Lifestyle**: Quit smoking (smoking constricts blood vessels), exercise regularly, and stay hydrated.

*Disclaimer: Consult your physician before changing medication or diet.*`;
  }

  // Treatment options
  if (q.includes('treat') || q.includes('cure') || q.includes('laser') || q.includes('injection') || q.includes('surgery') || q.includes('anti-vegf')) {
    return `**Clinical Treatments for Diabetic Retinopathy & Macular Edema**:

1. **Anti-VEGF Injections** (e.g., Aflibercept, Ranibizumab, Bevacizumab):
   • Injected into the vitreous cavity under local numbing drops.
   • Blocks Vascular Endothelial Growth Factor (VEGF), stopping vessel leakage and shrinking abnormal new vessels. First-line treatment for Diabetic Macular Edema (DME).

2. **Laser Photocoagulation**:
   • **Panretinal Photocoagulation (PRP)**: Applied across the peripheral retina in Proliferative DR (PDR) to reduce oxygen demand and cause abnormal vessels to regress.
   • **Focal/Grid Laser**: Seals leaking microaneurysms near the macula.

3. **Intravitreal Corticosteroids** (e.g., Dexamethasone implants):
   • Used for persistent macular edema when anti-VEGF therapy is insufficient.

4. **Vitrectomy Surgery**:
   • Micro-surgical removal of blood and vitreous gel for dense vitreous hemorrhages or repair of tractional retinal detachment.

*Disclaimer: Clinical treatments must be evaluated and prescribed by a licensed vitreoretinal specialist.*`;
  }

  // Notifications and Alerts
  if (q.includes('notification') || q.includes('alert') || q.includes('bell') || q.includes('unread')) {
    return `**Notifications on RetinaX**:

• Notifications are categorized and delivered based on user role:
  - **High Risk / Urgent Alerts**: Highlighted in red/rose for suspected Severe NPDR or PDR requiring immediate review.
  - **Review Needed**: Highlighted in indigo for new screening sessions submitted from field units.
  - **Referral Updates**: Highlighted in amber when a doctor issues a hospital referral or when a health worker updates appointment tracking.
  - **Assessment Complete**: Highlighted in emerald when specialist grading has been signed off.
  - **Follow-up Reminders**: Periodic reminders for annual or 6-month diabetic eye checks.

• **Actions**: You can filter by **All**, **Unread**, or **High Priority**, mark alerts as read/unread, or click any notification to navigate directly to the relevant patient record.

*Disclaimer: AI platform workflow guide.*`;
  }

  // Image Quality & Photography Tips
  if (q.includes('quality') || q.includes('iqa') || q.includes('blurry photo') || q.includes('camera') || q.includes('pupil')) {
    return `**Fundus Image Quality & Acquisition Tips**:

• **Automated IQA Checks**:
  RetinaX evaluates:
  1. Illumination & Exposure (avoiding underexposure or bright flash artifacts)
  2. Sharpness & Focus (clear visualization of tiny 20-30 micron microaneurysms)
  3. Field of View (45-degree macula-centered or disc-centered view)

• **How to improve image quality in the field**:
  - Keep the patient in a dimly lit room for 3-5 minutes prior to capture to allow physiological pupil dilation.
  - Ensure the patient's chin and forehead rest firmly against the camera bar.
  - Instruct the patient to look directly at the green fixation target light inside the lens.
  - If media opacities (e.g. dense cataracts) prevent clear capture, mark the image for dilated clinical examination.

*Disclaimer: AI technical screening guidance.*`;
  }

  // Doctor specific
  if (role === 'Doctor' || q.includes('doctor') || q.includes('ophthalmologist') || q.includes('queue')) {
    return `**RetinaX Doctor & Specialist Tools**:

• **Triage Dashboard**: Filter patients across 6 clinical categories (High Risk, Referable, Needs Review, Low Risk, All Patients, Recent Screenings).
• **Immediate Attention Queue**: Prioritizes unassessed scans with suspected referable disease or poor optical quality.
• **Retinal Visualizer**: Inspect multi-layer Grad-CAM heatmaps, microaneurysm bounding boxes, hard exudate rings, optic cup/disc segmentation, and vessel caliber analysis.
• **Assessment Submission**: Sign off on clinical diagnosis ('No immediate referral', 'Follow-up required', 'Refer to hospital', 'Urgent referral'), prescribe follow-up timeframes, and designate receiving hospitals.
• **Clinic Upload**: Add clinic-acquired scans via the "Upload Fundus" option in the patient header.

How can I assist you with clinical evaluation or platform operations?

*Disclaimer: RetinaX is a clinical decision support tool. Final clinical judgment rests with the licensed ophthalmologist.*`;
  }

  // Healthcare Worker specific
  if (role === 'Healthcare Worker' || q.includes('health worker') || q.includes('chw') || q.includes('field worker')) {
    return `**RetinaX Healthcare Worker Field Tools**:

• **Field Screening Intake**:
  - Register new community members via **"New Patient"** with diabetic history, address, and emergency contact.
  - Search enrolled records via **"Existing Patient"** to launch follow-up screenings.
• **6-Step Screening Flow**:
  - Verification → Eye Laterality (OD/OS/OU) → Fundus Photo Upload → Automated Image Quality Check (IQA) → AI Model Execution → Instant Triage Result.
• **Referral Tracking & Hospital Transit**:
  - Monitor doctor-referred patients in the **"Referrals"** tab.
  - Coordinate patient transportation, book specialist visits, and log family counseling calls.
  - Advance referral milestones (**Referral Issued → Appointment Booked → Visit Completed → Closed**).

Would you like tips on operating the camera or coordinating patient transit passes?

*Disclaimer: AI field health assistant.*`;
  }

  // Patient specific
  if (role === 'Patient' || q.includes('patient') || q.includes('my eye') || q.includes('my result')) {
    return `**RetinaX Patient Portal Guide**:

• **Your Eye Status**: The home tab displays your overall retinal health classification in simple, understandable terms (Low Risk, Needs Review, Referable, or High Risk).
• **Screening History**: View all completed eye photos, simple summaries of doctor notes, and when your next screening is due.
• **Hospital Visits**: If your eye doctor recommended a hospital visit, your portal displays the clinic name, directions, and visit preparation instructions (bring sunglasses, current medications, and a companion).
• **Notifications**: Get notified as soon as a doctor finishes reviewing your scan.

Do you have questions about your diabetes eye health, what the eye photo showed, or how to prepare for your appointment?

*Disclaimer: RetinaX AI provides educational information and does not replace medical advice from your doctor.*`;
  }

  // General default fallback
  return `Diabetic Retinopathy (DR) occurs when high blood glucose damages delicate blood vessels in the retina. Regular digital screening detects early microvascular changes—like microaneurysms and hard exudates—years before noticeable vision loss occurs.

The RetinaX platform supports:
• **Field Healthcare Workers**: Patient intake, automated image quality checks, and hospital transit coordination.
• **Doctors & Eye Specialists**: 8-model AI reports, interactive Grad-CAM lesion maps, and clinical referral directives.
• **Patients**: Clear, plain-language summaries, appointment reminders, and eye care education.

Could you let me know your role or the specific question you have about diabetic eye disease or the platform?

*Important Clinical Notice: RetinaX AI Assistant is for educational and navigation guidance only. Always consult a certified eye care provider for medical diagnosis and treatment.*`;
}
