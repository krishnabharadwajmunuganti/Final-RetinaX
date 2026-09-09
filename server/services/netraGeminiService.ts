import { GoogleGenAI } from "@google/genai";
import { NETRA_SYSTEM_PROMPT } from "../prompts/netraSystemPrompt";

export interface EyeContext {
  grade?: number | string;
  stageName?: string;
  confidence?: number;
  quality?: string;
  lesions?: string[];
  gradCamAvailable?: boolean;
}

export interface ScreeningContext {
  patientId?: string;
  screeningId?: string;
  leftEye?: EyeContext;
  rightEye?: EyeContext;
  referralStatus?: string;
  doctorReviewStatus?: string;
  summary?: string;
}

export interface ChatHistoryItem {
  role: "user" | "model" | "assistant";
  text: string;
}

export interface NetraChatRequest {
  message: string;
  userRole?: string;
  screeningContext?: ScreeningContext;
  conversationHistory?: ChatHistoryItem[];
}

export interface NetraChatResponse {
  reply: string;
  isDemoMode?: boolean;
  error?: boolean;
}

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Format screening context into a clean, safe, anti-hallucination prompt segment.
 */
function formatScreeningContextBlock(ctx?: ScreeningContext): string {
  if (!ctx || (!ctx.patientId && !ctx.leftEye && !ctx.rightEye)) {
    return "";
  }

  const lines: string[] = ["[AUTHORIZED SCREENING CONTEXT]"];
  if (ctx.patientId) lines.push(`• Patient ID: ${ctx.patientId}`);
  if (ctx.screeningId) lines.push(`• Screening Session ID: ${ctx.screeningId}`);

  if (ctx.leftEye) {
    const le = ctx.leftEye;
    const parts: string[] = [];
    if (le.grade !== undefined) parts.push(`DR Grade: ${le.grade}${le.stageName ? ` (${le.stageName})` : ""}`);
    if (le.confidence !== undefined) parts.push(`Confidence: ${Math.round(le.confidence > 1 ? le.confidence : le.confidence * 100)}%`);
    if (le.quality) parts.push(`Quality: ${le.quality}`);
    if (le.lesions && le.lesions.length > 0) {
      parts.push(`Detected Lesions: ${le.lesions.join(", ")}`);
    } else {
      parts.push(`Detected Lesions: None reported in context`);
    }
    parts.push(`Grad-CAM: ${le.gradCamAvailable ? "Available" : "Not available"}`);
    lines.push(`• Left Eye (OS): ${parts.join(" | ")}`);
  } else {
    lines.push(`• Left Eye (OS): No data provided in current context.`);
  }

  if (ctx.rightEye) {
    const re = ctx.rightEye;
    const parts: string[] = [];
    if (re.grade !== undefined) parts.push(`DR Grade: ${re.grade}${re.stageName ? ` (${re.stageName})` : ""}`);
    if (re.confidence !== undefined) parts.push(`Confidence: ${Math.round(re.confidence > 1 ? re.confidence : re.confidence * 100)}%`);
    if (re.quality) parts.push(`Quality: ${re.quality}`);
    if (re.lesions && re.lesions.length > 0) {
      parts.push(`Detected Lesions: ${re.lesions.join(", ")}`);
    } else {
      parts.push(`Detected Lesions: None reported in context`);
    }
    parts.push(`Grad-CAM: ${re.gradCamAvailable ? "Available" : "Not available"}`);
    lines.push(`• Right Eye (OD): ${parts.join(" | ")}`);
  } else {
    lines.push(`• Right Eye (OD): No data provided in current context.`);
  }

  if (ctx.referralStatus) lines.push(`• Referral Status: ${ctx.referralStatus}`);
  if (ctx.doctorReviewStatus) lines.push(`• Doctor Review Status: ${ctx.doctorReviewStatus}`);
  if (ctx.summary) lines.push(`• Clinical Note: ${ctx.summary}`);

  lines.push("[END OF SCREENING CONTEXT - Do not assume or fabricate any clinical data outside these points]");
  return lines.join("\n");
}

/**
 * Handle Netra AI conversational query
 */
export async function handleNetraChat(req: NetraChatRequest): Promise<NetraChatResponse> {
  const { message, userRole = "HEALTH_WORKER", screeningContext, conversationHistory = [] } = req;

  if (!message || !message.trim()) {
    return {
      reply: "Please enter a question.",
      error: true,
    };
  }

  const client = getAiClient();

  // If Gemini API client is available, call Gemini 3.8 Flash model
  if (client) {
    try {
      const contents: any[] = [];

      // Add recent history for conversational memory
      if (Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-8);
        for (const item of recentHistory) {
          if (item && item.text) {
            contents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Format current message with role and screening context
      const contextSegment = formatScreeningContextBlock(screeningContext);
      let promptText = `[User Role: ${userRole}]\n`;
      if (contextSegment) {
        promptText += `${contextSegment}\n\n`;
      }
      promptText += `User Question:\n${message.trim()}`;

      contents.push({
        role: "user",
        parts: [{ text: promptText }],
      });

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: NETRA_SYSTEM_PROMPT,
          temperature: 0.35,
          maxOutputTokens: 950,
        },
      });

      if (response.text) {
        return {
          reply: response.text,
          isDemoMode: false,
        };
      }
    } catch (geminiError: any) {
      console.error("Netra AI Gemini generation failed:", geminiError?.message || geminiError);
      return {
        reply: `Netra AI error: ${geminiError?.message || String(geminiError)}`,
        error: true,
      };
    }
  }

  // Demo Mode when GEMINI_API_KEY is not configured
  const demoReply = generateDemoModeResponse(message, userRole, screeningContext);
  return {
    reply: `*[Demo Mode - Gemini API key not configured in environment]*\n\n${demoReply}`,
    isDemoMode: true,
  };
}

/**
 * High-fidelity, factual demo fallback when Gemini API key is not configured.
 * Strictly adheres to non-hallucination and screening context rules.
 */
function generateDemoModeResponse(message: string, role: string, ctx?: ScreeningContext): string {
  const q = message.toLowerCase();

  // Context-specific questions
  if (ctx && (q.includes("report") || q.includes("explain this") || q.includes("my result") || q.includes("screening result"))) {
    let output = `### Screening Context Explanation\n\n`;
    if (ctx.patientId) output += `• **Patient ID:** ${ctx.patientId}\n`;
    if (ctx.leftEye) {
      output += `• **Left Eye (OS):** DR Grade ${ctx.leftEye.grade ?? "Unspecified"} (${ctx.leftEye.stageName ?? "Staged"}), Image Quality: ${ctx.leftEye.quality ?? "Evaluated"}`;
      if (ctx.leftEye.confidence) output += `, Confidence: ${Math.round(ctx.leftEye.confidence > 1 ? ctx.leftEye.confidence : ctx.leftEye.confidence * 100)}%`;
      output += `\n`;
      if (ctx.leftEye.lesions && ctx.leftEye.lesions.length > 0) {
        output += `  - *Detected Lesions:* ${ctx.leftEye.lesions.join(", ")}\n`;
      } else {
        output += `  - *Lesions:* No lesion data provided in current context.\n`;
      }
    }
    if (ctx.rightEye) {
      output += `• **Right Eye (OD):** DR Grade ${ctx.rightEye.grade ?? "Unspecified"} (${ctx.rightEye.stageName ?? "Staged"}), Image Quality: ${ctx.rightEye.quality ?? "Evaluated"}`;
      if (ctx.rightEye.confidence) output += `, Confidence: ${Math.round(ctx.rightEye.confidence > 1 ? ctx.rightEye.confidence : ctx.rightEye.confidence * 100)}%`;
      output += `\n`;
      if (ctx.rightEye.lesions && ctx.rightEye.lesions.length > 0) {
        output += `  - *Detected Lesions:* ${ctx.rightEye.lesions.join(", ")}\n`;
      } else {
        output += `  - *Lesions:* No lesion data provided in current context.\n`;
      }
    }
    if (ctx.referralStatus) {
      output += `• **Referral Status:** ${ctx.referralStatus}\n`;
    }
    output += `\n*The AI screening model estimated these preliminary outputs to assist clinical review. A certified ophthalmologist will make the final diagnostic assessment.*`;
    return output;
  }

  // Left vs Right Eye comparison
  if (ctx && (q.includes("left") && q.includes("right") || q.includes("worse") || q.includes("higher grade") || q.includes("difference between left and right"))) {
    if (ctx.leftEye && ctx.rightEye && ctx.leftEye.grade !== undefined && ctx.rightEye.grade !== undefined) {
      const lg = Number(ctx.leftEye.grade);
      const rg = Number(ctx.rightEye.grade);
      if (lg > rg) {
        return `Based on the provided screening context, the **left eye** has the higher screening grade (Grade ${ctx.leftEye.grade}) compared to the **right eye** (Grade ${ctx.rightEye.grade}).\n\nThis bilateral asymmetry indicates more visible microvascular changes detected in the left retina. This finding should be verified during clinical examination by an ophthalmologist.`;
      } else if (rg > lg) {
        return `Based on the provided screening context, the **right eye** has the higher screening grade (Grade ${ctx.rightEye.grade}) compared to the **left eye** (Grade ${ctx.leftEye.grade}).\n\nThis bilateral asymmetry indicates more visible microvascular changes detected in the right retina. This finding should be verified during clinical examination by an ophthalmologist.`;
      } else {
        return `Both the left and right eyes were graded at **Grade ${ctx.leftEye.grade}** in this screening session. Bilateral symmetry indicates similar microvascular findings across both retinas.`;
      }
    }
    return `The current screening context does not contain bilateral grading data for both eyes to compare.`;
  }

  // Grade 0 to 4
  if (q.includes("grade 0") || q.includes("no dr")) {
    return `**Grade 0 (No Diabetic Retinopathy)**:\n\n• **Meaning:** No visible diabetic retinal lesions (no microaneurysms, hemorrhages, or exudates) are present on fundus imaging.\n• **Action:** In accordance with clinical guidelines (ADA/AAO), standard annual rescreening is recommended for diabetic patients with healthy retinas.`;
  }
  if (q.includes("grade 1") || q.includes("mild")) {
    return `**Grade 1 (Mild Non-Proliferative Diabetic Retinopathy - NPDR)**:\n\n• **Hallmark:** Microaneurysms only. Microaneurysms are tiny outpouchings of weakened capillary walls that appear as miniature red dots.\n• **Significance:** This is the earliest clinically detectable sign of diabetic vascular damage. Vision is typically unaffected at this stage.\n• **Recommendation:** Tight glycemic and blood pressure management, with routine follow-up screening (typically every 6 to 12 months, as directed by the eye care professional).`;
  }
  if (q.includes("grade 2") || q.includes("moderate")) {
    return `**Grade 2 (Moderate NPDR)**:\n\n• **Hallmark:** More than just microaneurysms, but less than severe NPDR. You may see scattered dot/blot hemorrhages, hard lipid exudates, and occasional cotton-wool spots.\n• **Significance:** Capillary walls have weakened enough to leak both blood and lipid-rich fluid into the retinal tissue.\n• **Workflow:** Requires closer clinical monitoring by an eye specialist to evaluate whether macular edema is developing.`;
  }
  if (q.includes("grade 3") || q.includes("severe")) {
    return `**Grade 3 (Severe NPDR)**:\n\n• **Hallmark:** Follows the international "4-2-1 rule": severe intraretinal hemorrhages in all 4 quadrants, significant venous beading in 2+ quadrants, or prominent microvascular abnormalities (IRMA) in 1+ quadrant, with no proliferative vessel growth.\n• **Significance:** Indicates extensive retinal ischemia (lack of oxygen). High risk of progressing to proliferative retinopathy.\n• **Workflow:** Prompt referral to a vitreoretinal specialist for timely intervention.`;
  }
  if (q.includes("grade 4") || q.includes("proliferative") || q.includes("pdr")) {
    return `**Grade 4 (Proliferative Diabetic Retinopathy - PDR)**:\n\n• **Hallmark:** Pathologic neovascularization (abnormal fragile new blood vessels growing on the disc or elsewhere on the retina) or preretinal/vitreous hemorrhage.\n• **Significance:** These fragile vessels can bleed spontaneously, leading to severe vision loss or tractional retinal detachment.\n• **Workflow:** Urgent referral to an ophthalmologist for treatments such as anti-VEGF therapy, panretinal photocoagulation (laser), or vitreoretinal surgery.`;
  }

  // Lesion questions
  if (q.includes("microaneurysm")) {
    return `**What is a Microaneurysm?**\n\n• A microaneurysm is a tiny, localized ballooning or outpouching of a weakened retinal capillary wall.\n• **Appearance on Fundus:** They appear as sharp, tiny red dots, typically 15–50 micrometers in diameter.\n• **Significance:** They are the earliest hallmark visible in diabetic retinopathy. They indicate localized vascular basement membrane breakdown caused by chronic hyperglycemia.`;
  }
  if (q.includes("hemorrhage") || q.includes("dot") || q.includes("blot")) {
    return `**Retinal Hemorrhages in DR**:\n\n• **Dot/Blot Hemorrhages:** Occur when weakened microcapillaries rupture in the deeper layers of the retina (inner nuclear and outer plexiform layers). Because they are compressed between deep retinal cells, they look like round, dark red dots or blots.\n• **Flame Hemorrhages:** Occur in the superficial nerve fiber layer, where blood spreads along the horizontal nerve fiber orientation, producing a feathery flame shape.\n• **Difference from Microaneurysms:** Microaneurysms are intact dilated vessel pouches, whereas hemorrhages represent extravasated blood from broken vessels.`;
  }
  if (q.includes("exudate")) {
    return `**Hard vs. Soft Exudates**:\n\n• **Hard Exudates:** Waxy, yellowish deposits with well-defined borders composed of lipids and lipoproteins. They precipitate when fluid leaks out from abnormally permeable capillaries.\n• **Soft Exudates (Cotton-Wool Spots):** Whitish-gray fluffy patches caused by focal ischemia that stops axoplasmic transport in retinal nerve fibers. They are not true exudates, but rather mini-infarctions of the retinal nerve fiber layer.`;
  }

  // Grad-CAM questions
  if (q.includes("grad-cam") || q.includes("grad cam") || q.includes("explainability")) {
    return `**What is Grad-CAM?**\n\n• **Definition:** Gradient-weighted Class Activation Mapping (Grad-CAM) is an artificial intelligence explainability technique.\n• **How it Works:** It analyzes the gradients flowing into the final convolutional layers of the neural network to produce a visual coarse heatmap.\n• **Colors:** Red and yellow zones indicate areas of the retinal image that contributed most heavily to the model's grading decision, while blue zones had minimal influence.\n• **Important Limitation:** Grad-CAM is an attentional guide, **not** an exact anatomical map or lesion boundary. It shows where the AI looked, but the clinician must still inspect the underlying image for clinical pathology.`;
  }

  // Image Quality / Ungradable
  if (q.includes("quality") || q.includes("ungradable") || q.includes("poor quality") || q.includes("retake") || q.includes("blur")) {
    return `**Fundus Image Quality & Ungradable Captures**:\n\n• **Common Causes of Poor Quality:**\n  1. **Blur / Defocus:** Camera distance incorrect or patient moving during flash.\n  2. **Low Illumination (Too Dark):** Small pupil (undilated) or low illumination setting.\n  3. **Overexposure / Glare (Too Bright):** Flash reflection off the cornea or lens.\n  4. **Media Opacities:** Cataracts or vitreous floaters obscuring retinal visibility.\n  5. **Blinking or Eyelash Shadowing:** Patient blinked or upper lid was not retracted.\n\n• **What to do if Ungradable:**\n  1. Dim room lighting for 3–5 minutes to allow natural pupil expansion.\n  2. Instruct patient to fixate steadily on the internal target light.\n  3. Ensure camera lens is clean and reposition before re-capturing.\n  4. If pupils remain too constricted (<3mm), notify the attending clinician regarding mydriatic drops if authorized.`;
  }

  // Diagnosis distinction
  if (q.includes("do i have") || q.includes("definitely") || q.includes("diagnose me") || q.includes("prescribe")) {
    return `I can explain the AI screening results and retinal imaging concepts, but I **cannot provide a definitive medical diagnosis or prescribe medications**.\n\nAI screening models are decision-support tools designed to identify potential microvascular risk. Final clinical diagnosis and treatment plans must always be conducted by a licensed eye care professional (optometrist or ophthalmologist).`;
  }

  // Default helpful overview
  return `### Hello! I am Netra AI\n*Your AI assistant for retinal screening*\n\nI can assist you with:\n• **DR Grades 0–4:** Explaining mild, moderate, severe NPDR, and proliferative DR.\n• **Retinal Lesions:** Microaneurysms, dot/blot hemorrhages, hard exudates, and cotton-wool spots.\n• **AI Screening Results & Grad-CAM:** Understanding how the model reached its prediction.\n• **Bilateral Comparison:** Reviewing differences between left and right eye findings.\n• **Image Quality:** Assessing sharpness, illumination, and guidance for retakes.\n• **Tele-Ophthalmology Workflows:** Referral routing and clinical report interpretation.\n\nPlease feel free to ask any question or click "Explain with Netra AI" on any screening report!`;
}
