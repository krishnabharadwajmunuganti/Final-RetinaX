import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { dataStore } from "./server/dataStore";
import { handleNetraChat } from "./server/services/netraGeminiService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "RetinaX Tele-Ophthalmology API", timestamp: new Date().toISOString() });
});

// Bootstrap initial data for frontend initialization
app.get("/api/bootstrap", (req, res) => {
  res.json(dataStore.getBootstrap());
});

// Patients API
app.get("/api/patients", (req, res) => {
  res.json(dataStore.getPatients());
});

app.get("/api/patients/:id", (req, res) => {
  const patient = dataStore.getPatientById(req.params.id);
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

app.post("/api/patients", (req, res) => {
  const newPatient = req.body;
  if (!newPatient || !newPatient.name) {
    res.status(400).json({ error: "Patient name is required" });
    return;
  }
  const created = dataStore.createPatient(newPatient);
  res.status(201).json(created);
});

app.put("/api/patients/:id", (req, res) => {
  const updated = dataStore.updatePatient(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

// Screening Sessions API
app.get("/api/sessions", (req, res) => {
  res.json(dataStore.getSessions());
});

app.get("/api/sessions/:id", (req, res) => {
  const session = dataStore.getSessionById(req.params.id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(session);
});

app.post("/api/sessions", (req, res) => {
  const newSession = req.body;
  if (!newSession || !newSession.patientId) {
    res.status(400).json({ error: "Session patientId is required" });
    return;
  }
  const created = dataStore.createSession(newSession);
  res.status(201).json(created);
});

app.put("/api/sessions/:id/assessment", (req, res) => {
  const result = dataStore.submitDoctorAssessment(req.params.id, req.body);
  if (!result) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(result);
});

// Referrals API
app.get("/api/referrals", (req, res) => {
  res.json(dataStore.getReferrals());
});

app.post("/api/referrals", (req, res) => {
  const created = dataStore.createReferral(req.body);
  res.status(201).json(created);
});

app.put("/api/referrals/:id", (req, res) => {
  const updated = dataStore.updateReferral(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Referral not found" });
    return;
  }
  res.json(updated);
});

// Notifications API
app.get("/api/notifications", (req, res) => {
  res.json(dataStore.getNotifications());
});

app.post("/api/notifications/mark-all-read", (req, res) => {
  const { roleTarget } = req.body || {};
  const updated = dataStore.markAllNotificationsRead(roleTarget);
  res.json(updated);
});

app.post("/api/notifications/:id/toggle", (req, res) => {
  const updated = dataStore.toggleNotification(req.params.id);
  if (!updated) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(updated);
});

// Doctor & Worker Profiles API
app.get("/api/doctor", (req, res) => {
  res.json(dataStore.getDoctor());
});

app.put("/api/doctor", (req, res) => {
  res.json(dataStore.updateDoctor(req.body));
});

app.get("/api/worker", (req, res) => {
  res.json(dataStore.getWorker());
});

app.put("/api/worker", (req, res) => {
  res.json(dataStore.updateWorker(req.body));
});

// Netra AI Assistant endpoints (POST /api/assistant/chat, POST /chatbot/ask, and POST /api/assistant)
app.post(["/api/assistant/chat", "/chatbot/ask", "/api/chatbot/ask"], async (req, res) => {
  try {
    const { message, userRole, screeningContext, conversationHistory, context, history } = req.body;
    const response = await handleNetraChat({
      message,
      userRole: userRole || req.body.role,
      screeningContext: screeningContext || context,
      conversationHistory: conversationHistory || history,
    });
    if (response.error && response.reply === "Please enter a question.") {
      res.status(400).json(response);
      return;
    }
    res.json(response);
  } catch (err: any) {
    console.error("Netra AI endpoint error:", err);
    res.status(500).json({
      reply: `Netra AI Server Error: ${err?.message || String(err)}`,
      error: true,
      stack: err?.stack,
    });
  }
});

app.post("/api/assistant", async (req, res) => {
  try {
    const { message, history, role, screeningContext } = req.body;
    const response = await handleNetraChat({
      message,
      userRole: role,
      screeningContext,
      conversationHistory: history,
    });
    res.json(response);
  } catch (err: any) {
    console.error("Assistant legacy endpoint error:", err);
    res.status(500).json({
      reply: "Netra AI is temporarily unavailable. Please try again.",
      error: true,
    });
  }
});

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RetinaX Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
