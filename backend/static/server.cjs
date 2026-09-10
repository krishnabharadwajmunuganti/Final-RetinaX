var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai2 = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/mockData.ts
var INITIAL_DOCTOR = {
  id: "DOC-9041",
  name: "Dr. Alistair Vance, MD",
  role: "Doctor",
  email: "a.vance@eyeinstitute.org",
  phone: "+1 (555) 438-9210",
  hospital: "St. Jude Eye Institute & Vitreoretinal Center",
  specialization: "Vitreoretinal Specialist & Ophthalmologist",
  regNumber: "MD-OPH-78921",
  avatarInitials: "AV",
  stats: {
    reviewed: 148,
    referred: 32,
    totalSessions: 194
  }
};
var INITIAL_WORKER = {
  id: "WRK-3082",
  name: "Maya Chen, CHW",
  role: "Healthcare Worker",
  email: "m.chen@fieldhealth.org",
  phone: "+1 (555) 283-7741",
  area: "East Valley PHC Sector 4",
  organization: "District Rural Tele-Ophthalmology Program",
  avatarInitials: "MC",
  stats: {
    patientsRegistered: 86,
    sessionsCompleted: 112
  }
};
var INITIAL_PATIENTS = [
  {
    id: "RX-104582",
    name: "Eleanor Vance",
    role: "Patient",
    age: 62,
    gender: "Female",
    phone: "+1 (555) 912-3482",
    area: "East Valley, Sector 4",
    address: "742 Evergreen Terrace, East Valley",
    emergencyContact: {
      name: "Thomas Vance",
      relationship: "Spouse",
      phone: "+1 (555) 912-3485"
    },
    lastScreeningDate: "Today, 08:30 AM",
    totalScreenings: 4,
    overallStatus: "High Risk"
  },
  {
    id: "RX-104583",
    name: "Marcus Brody",
    role: "Patient",
    age: 58,
    gender: "Male",
    phone: "+1 (555) 349-1180",
    area: "Riverside Rural Unit",
    address: "12 Riverbank Way, Riverside",
    emergencyContact: {
      name: "Sarah Brody",
      relationship: "Daughter",
      phone: "+1 (555) 349-1184"
    },
    lastScreeningDate: "Yesterday, 03:15 PM",
    totalScreenings: 3,
    overallStatus: "Referable"
  },
  {
    id: "RX-104584",
    name: "Sunita Patel",
    role: "Patient",
    age: 49,
    gender: "Female",
    phone: "+1 (555) 772-9903",
    area: "Greenfield Clinic",
    address: "45 Lotus Court, Greenfield",
    emergencyContact: {
      name: "Raj Patel",
      relationship: "Brother",
      phone: "+1 (555) 772-9901"
    },
    lastScreeningDate: "Sep 06, 2026",
    totalScreenings: 2,
    overallStatus: "Needs Review"
  },
  {
    id: "RX-104585",
    name: "David Miller",
    role: "Patient",
    age: 54,
    gender: "Male",
    phone: "+1 (555) 881-2234",
    area: "Oakridge Community Health",
    address: "88 Timberland Rd, Oakridge",
    emergencyContact: {
      name: "Claire Miller",
      relationship: "Spouse",
      phone: "+1 (555) 881-2239"
    },
    lastScreeningDate: "Sep 05, 2026",
    totalScreenings: 5,
    overallStatus: "Low Risk"
  },
  {
    id: "RX-104586",
    name: "Amina Yusuf",
    role: "Patient",
    age: 67,
    gender: "Female",
    phone: "+1 (555) 604-3319",
    area: "East Valley, Sector 2",
    address: "109 Cedar Avenue, East Valley",
    emergencyContact: {
      name: "Tariq Yusuf",
      relationship: "Son",
      phone: "+1 (555) 604-3320"
    },
    lastScreeningDate: "Sep 04, 2026",
    totalScreenings: 1,
    overallStatus: "Referable"
  },
  {
    id: "RX-104587",
    name: "Robert Chen",
    role: "Patient",
    age: 43,
    gender: "Male",
    phone: "+1 (555) 412-8877",
    area: "Metro Outreach Post",
    address: "320 High St, Metro Center",
    emergencyContact: {
      name: "Lily Chen",
      relationship: "Sister",
      phone: "+1 (555) 412-8878"
    },
    lastScreeningDate: "Sep 02, 2026",
    totalScreenings: 2,
    overallStatus: "Low Risk"
  }
];
var INITIAL_SESSIONS = [
  {
    id: "SESS-2026-0891",
    patientId: "RX-104582",
    patientName: "Eleanor Vance",
    patientAge: 62,
    patientGender: "Female",
    patientArea: "East Valley, Sector 4",
    date: "Today, 08:30 AM",
    laterality: "Right Eye (OD)",
    riskLevel: "High Risk",
    imageQuality: "Good",
    drGrade: "Severe NPDR",
    isReferable: true,
    reviewStatus: "Pending Review",
    workerId: "WRK-3082",
    workerName: "Maya Chen",
    originalImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    aiReport: {
      iqa: {
        status: "Good",
        score: 94,
        sharpness: "High (0.88 Laplacian score)",
        illumination: "Uniformly calibrated across 45\xB0 field",
        fieldOfView: "Full macula and optic disc centered"
      },
      drClassification: {
        grade: "Severe NPDR",
        confidence: 96.4,
        icdrScale: 3
      },
      referableDR: {
        isReferable: true,
        confidence: 98.2,
        criteria: "Multiple blot hemorrhages in 4 quadrants, prominent venous beading, hard exudate rings."
      },
      microaneurysms: {
        detected: true,
        count: 24,
        quadrants: ["Superior-Temporal", "Inferior-Temporal", "Nasal"],
        details: "Clusters observed in perifoveal capillary bed, diameter 25-40 microns."
      },
      hemorrhages: {
        detected: true,
        type: "Flame-shaped & deep dot-blot hemorrhages",
        quadrants: ["All 4 quadrants (meets 4:2:1 ICDR criteria)"],
        details: "Intense microvascular breakdown in mid-periphery."
      },
      exudates: {
        detected: true,
        pattern: "Hard lipid circinate ring entering within 500 microns of foveal center",
        macularInvolvement: true,
        details: "Significant macular edema hazard; lipid deposition rings prominent."
      },
      opticDisc: {
        status: "Normal",
        cupToDiscRatio: 0.35,
        marginClarity: "Sharp neural rim margins, no neovascularization at disc (NVD)",
        details: "Disc appears healthy with normal physiologic pallor."
      },
      vesselAnalysis: {
        status: "Abnormal",
        arteriovenousNicking: true,
        tortuosity: "Marked venous beading and dilatation",
        caliberRatio: "AV ratio 0.52 (Arteriolar narrowing with venous engorgement)",
        details: "Generalized microvascular sclerosis and early intraretinal microvascular abnormalities (IRMA)."
      }
    }
  },
  {
    id: "SESS-2026-0888",
    patientId: "RX-104583",
    patientName: "Marcus Brody",
    patientAge: 58,
    patientGender: "Male",
    patientArea: "Riverside Rural Unit",
    date: "Yesterday, 03:15 PM",
    laterality: "Left Eye (OS)",
    riskLevel: "Referable",
    imageQuality: "Good",
    drGrade: "Moderate NPDR",
    isReferable: true,
    reviewStatus: "Pending Review",
    workerId: "WRK-3082",
    workerName: "Maya Chen",
    originalImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    aiReport: {
      iqa: {
        status: "Good",
        score: 91,
        sharpness: "Good focus on posterior pole",
        illumination: "Balanced non-mydriatic exposure",
        fieldOfView: "45 degree field well centered"
      },
      drClassification: {
        grade: "Moderate NPDR",
        confidence: 93.1,
        icdrScale: 2
      },
      referableDR: {
        isReferable: true,
        confidence: 94.7,
        criteria: "More than mild microaneurysms and hard exudates close to macula."
      },
      microaneurysms: {
        detected: true,
        count: 11,
        quadrants: ["Inferior-Temporal", "Superior-Temporal"],
        details: "Punctate microaneurysms near macular avascular zone edge."
      },
      hemorrhages: {
        detected: true,
        type: "Isolated dot-blot intraretinal lesions",
        quadrants: ["Inferior-Temporal"],
        details: "Four distinct dot-blot hemorrhages without subhyaloid extension."
      },
      exudates: {
        detected: true,
        pattern: "Small clusters of hard exudates",
        macularInvolvement: false,
        details: "Hard exudates located > 1 disc diameter from foveola."
      },
      opticDisc: {
        status: "Normal",
        cupToDiscRatio: 0.32,
        marginClarity: "Crisp disc margins, normal neuroretinal rim",
        details: "No swelling or neovascularization."
      },
      vesselAnalysis: {
        status: "Normal",
        arteriovenousNicking: false,
        tortuosity: "Mild venular tortuosity",
        caliberRatio: "AV ratio 0.65 (within normal limits)",
        details: "Stable vascular architecture."
      }
    }
  },
  {
    id: "SESS-2026-0882",
    patientId: "RX-104584",
    patientName: "Sunita Patel",
    patientAge: 49,
    patientGender: "Female",
    patientArea: "Greenfield Clinic",
    date: "Sep 06, 2026",
    laterality: "Both Eyes (OU)",
    riskLevel: "Needs Review",
    imageQuality: "Acceptable",
    drGrade: "Mild NPDR",
    isReferable: false,
    reviewStatus: "Pending Review",
    workerId: "WRK-3082",
    workerName: "Maya Chen",
    originalImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    aiReport: {
      iqa: {
        status: "Acceptable",
        score: 74,
        sharpness: "Slight motion blur on superior nasal quadrant",
        illumination: "Mild glare on inferotemporal perimeter",
        fieldOfView: "Slightly off-center macula"
      },
      drClassification: {
        grade: "Mild NPDR",
        confidence: 81.2,
        icdrScale: 1
      },
      referableDR: {
        isReferable: false,
        confidence: 82,
        criteria: "Sparse microaneurysms only, no exudates near fovea."
      },
      microaneurysms: {
        detected: true,
        count: 3,
        quadrants: ["Temporal"],
        details: "Isolated faint microaneurysms."
      },
      hemorrhages: {
        detected: false,
        type: "None detected",
        quadrants: [],
        details: "No overt retinal hemorrhages observed."
      },
      exudates: {
        detected: false,
        pattern: "None detected",
        macularInvolvement: false,
        details: "No hard or soft exudates."
      },
      opticDisc: {
        status: "Suspect",
        cupToDiscRatio: 0.55,
        marginClarity: "Superior margin slightly blurred by media haze",
        details: "Borderline cupping warrants doctor clinical review."
      },
      vesselAnalysis: {
        status: "Normal",
        arteriovenousNicking: false,
        tortuosity: "Normal",
        caliberRatio: "AV ratio 0.67",
        details: "Normal vascular branches."
      }
    }
  },
  {
    id: "SESS-2026-0879",
    patientId: "RX-104585",
    patientName: "David Miller",
    patientAge: 54,
    patientGender: "Male",
    patientArea: "Oakridge Community Health",
    date: "Sep 05, 2026",
    laterality: "Right Eye (OD)",
    riskLevel: "Low Risk",
    imageQuality: "Good",
    drGrade: "No DR",
    isReferable: false,
    reviewStatus: "Reviewed",
    workerId: "WRK-3082",
    workerName: "Maya Chen",
    originalImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    doctorAssessment: {
      doctorId: "DOC-9041",
      doctorName: "Dr. Alistair Vance, MD",
      decision: "No immediate referral",
      notes: "No signs of diabetic retinopathy. Retinal architecture is healthy. Recommend routine 12-month community screening.",
      submittedAt: "Sep 05, 2026 at 04:20 PM"
    },
    aiReport: {
      iqa: {
        status: "Good",
        score: 98,
        sharpness: "Excellent high-definition capture",
        illumination: "Optimal contrast and field illumination",
        fieldOfView: "Full standard ETDRS field 1 & 2"
      },
      drClassification: {
        grade: "No DR",
        confidence: 99.4,
        icdrScale: 0
      },
      referableDR: {
        isReferable: false,
        confidence: 99.8,
        criteria: "Clear fundus, zero referable lesion signatures."
      },
      microaneurysms: {
        detected: false,
        count: 0,
        quadrants: [],
        details: "Zero microaneurysms detected across entire field."
      },
      hemorrhages: {
        detected: false,
        type: "None",
        quadrants: [],
        details: "Zero hemorrhages detected."
      },
      exudates: {
        detected: false,
        pattern: "None",
        macularInvolvement: false,
        details: "Zero exudates or lipid formations."
      },
      opticDisc: {
        status: "Normal",
        cupToDiscRatio: 0.28,
        marginClarity: "Sharp distinct margins, healthy pink neuroretinal rim",
        details: "Completely unremarkable physiologic disc."
      },
      vesselAnalysis: {
        status: "Normal",
        arteriovenousNicking: false,
        tortuosity: "Normal arborization",
        caliberRatio: "AV ratio 0.68",
        details: "Healthy patent retinal vascular tree."
      }
    }
  },
  {
    id: "SESS-2026-0870",
    patientId: "RX-104586",
    patientName: "Amina Yusuf",
    patientAge: 67,
    patientGender: "Female",
    patientArea: "East Valley, Sector 2",
    date: "Sep 04, 2026",
    laterality: "Both Eyes (OU)",
    riskLevel: "Referable",
    imageQuality: "Good",
    drGrade: "Moderate NPDR",
    isReferable: true,
    reviewStatus: "Referred",
    workerId: "WRK-3082",
    workerName: "Maya Chen",
    originalImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    doctorAssessment: {
      doctorId: "DOC-9041",
      doctorName: "Dr. Alistair Vance, MD",
      decision: "Refer to hospital",
      notes: "Clinically significant macular edema (CSME) suspected. Prompt OCT scan and evaluation by vitreoretinal specialist needed.",
      hospitalName: "St. Jude Eye Institute",
      submittedAt: "Sep 04, 2026 at 11:45 AM"
    },
    aiReport: {
      iqa: {
        status: "Good",
        score: 92,
        sharpness: "Good focus",
        illumination: "Standard",
        fieldOfView: "Standard 45 degree"
      },
      drClassification: {
        grade: "Moderate NPDR",
        confidence: 94,
        icdrScale: 2
      },
      referableDR: {
        isReferable: true,
        confidence: 95.5,
        criteria: "Moderate NPDR with perifoveal exudate cluster."
      },
      microaneurysms: {
        detected: true,
        count: 14,
        quadrants: ["Superior-Temporal", "Macular"],
        details: "Microaneurysms clustered along the temporal arcade."
      },
      hemorrhages: {
        detected: true,
        type: "Dot-blot hemorrhages",
        quadrants: ["Temporal"],
        details: "Dot hemorrhages in the parafoveal region."
      },
      exudates: {
        detected: true,
        pattern: "Hard exudates near fovea",
        macularInvolvement: true,
        details: "Exudates threatening macular center; urgent OCT indicated."
      },
      opticDisc: {
        status: "Normal",
        cupToDiscRatio: 0.3,
        marginClarity: "Clear",
        details: "Normal appearance."
      },
      vesselAnalysis: {
        status: "Normal",
        arteriovenousNicking: false,
        tortuosity: "Mild",
        caliberRatio: "AV ratio 0.62",
        details: "Moderate venular engorgement."
      }
    }
  },
  {
    id: "SESS-2026-0865",
    patientId: "RX-104587",
    patientName: "Robert Chen",
    patientAge: 43,
    patientGender: "Male",
    patientArea: "Metro Outreach Post",
    date: "Sep 02, 2026",
    laterality: "Left Eye (OS)",
    riskLevel: "Low Risk",
    imageQuality: "Good",
    drGrade: "No DR",
    isReferable: false,
    reviewStatus: "Reviewed",
    workerId: "WRK-3082",
    workerName: "Maya Chen",
    originalImageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    doctorAssessment: {
      doctorId: "DOC-9041",
      doctorName: "Dr. Alistair Vance, MD",
      decision: "No immediate referral",
      notes: "Clear bilateral fundus. Blood sugar well managed. Repeat screening in 1 year.",
      submittedAt: "Sep 02, 2026 at 02:00 PM"
    },
    aiReport: {
      iqa: {
        status: "Good",
        score: 97,
        sharpness: "Sharp",
        illumination: "Even",
        fieldOfView: "Optimal"
      },
      drClassification: {
        grade: "No DR",
        confidence: 99.1,
        icdrScale: 0
      },
      referableDR: {
        isReferable: false,
        confidence: 99.5,
        criteria: "Negative for DR."
      },
      microaneurysms: {
        detected: false,
        count: 0,
        quadrants: [],
        details: "None"
      },
      hemorrhages: {
        detected: false,
        type: "None",
        quadrants: [],
        details: "None"
      },
      exudates: {
        detected: false,
        pattern: "None",
        macularInvolvement: false,
        details: "None"
      },
      opticDisc: {
        status: "Normal",
        cupToDiscRatio: 0.3,
        marginClarity: "Clear",
        details: "Normal physiologic disc."
      },
      vesselAnalysis: {
        status: "Normal",
        arteriovenousNicking: false,
        tortuosity: "Normal",
        caliberRatio: "AV ratio 0.66",
        details: "Healthy vessels."
      }
    }
  }
];
var initialDoctor = INITIAL_DOCTOR;
var initialWorker = INITIAL_WORKER;
var initialPatients = INITIAL_PATIENTS.map((p) => ({
  ...p,
  diabetesType: p.id === "RX-104582" ? "Type 2" : p.id === "RX-104583" ? "Type 1" : "Type 2",
  durationYears: p.id === "RX-104582" ? 12 : p.id === "RX-104583" ? 8 : 5,
  medications: p.id === "RX-104582" ? "Metformin 1000mg BID, Glimepiride 2mg" : "Insulin Glargine 20u qhs, Lispro tid",
  notes: "Regular checkup at PHC post. Fasting blood sugar 142 mg/dL."
}));
var initialScreenings = INITIAL_SESSIONS;
var initialReferrals = [
  {
    id: "REF-2026-0041",
    patientId: "RX-104586",
    patientName: "Amina Yusuf",
    doctorName: "Dr. Alistair Vance, MD",
    doctorId: "DOC-9041",
    dateIssued: "Sep 04, 2026",
    targetAppointmentDate: "Sep 18, 2026",
    hospitalName: "St. Jude Eye Institute \u2014 Retina OPD",
    reason: "CSME suspected. OCT scan scheduled. Patient transport arranged by Community Post.",
    urgency: "Standard",
    status: "Visit Completed",
    timeline: [
      { status: "Referral Issued", date: "Sep 04, 2026", note: "Referral slip sent to East Valley PHC and patient emergency contact." },
      { status: "Appointment Booked", date: "Sep 05, 2026", note: "Called patient daughter; explained importance of clinic visit. Confirmed appointment." },
      { status: "Visit Completed", date: "Sep 07, 2026", note: "Patient checked in at Retina OPD. OCT scan completed." }
    ]
  },
  {
    id: "REF-2026-0042",
    patientId: "RX-104582",
    patientName: "Eleanor Vance",
    doctorName: "Dr. Alistair Vance, MD",
    doctorId: "DOC-9041",
    dateIssued: "Today, 08:45 AM",
    targetAppointmentDate: "Within 72 Hours",
    hospitalName: "St. Jude Eye Institute Vitreoretinal Unit",
    reason: "Severe NPDR with 4-quadrant hemorrhages and macular edema hazard.",
    urgency: "Urgent",
    status: "Referral Issued",
    timeline: [
      { status: "Referral Issued", date: "Today", note: "Doctor referral issued by Dr. Alistair Vance." }
    ]
  }
];

// server/dataStore.ts
var INITIAL_NOTIFICATIONS = [
  {
    id: "notif-doc-1",
    title: "High Priority Screening Uploaded",
    message: "Severe NPDR suspected for Eleanor Vance (RX-104582) at East Valley Health Unit.",
    timestamp: "Today, 10:14 AM",
    isRead: false,
    type: "high_risk",
    roleTarget: "Doctor",
    patientId: "RX-104582",
    sessionId: "SESS-2026-0891"
  },
  {
    id: "notif-doc-2",
    title: "New Screening to Review",
    message: "Moderate NPDR with exudates detected for Marcus Brody (RX-104583) awaiting clinical grading.",
    timestamp: "Today, 09:30 AM",
    isRead: false,
    type: "review_needed",
    roleTarget: "Doctor",
    patientId: "RX-104583",
    sessionId: "SESS-2026-0888"
  },
  {
    id: "notif-doc-3",
    title: "Pending Optical Assessment",
    message: "Sunita Patel (RX-104584) bilateral session ready for review and referral sign-off.",
    timestamp: "Yesterday, 04:15 PM",
    isRead: true,
    type: "review_needed",
    roleTarget: "Doctor",
    patientId: "RX-104584",
    sessionId: "SESS-2026-0879"
  },
  {
    id: "notif-wrk-1",
    title: "Hospital Referral Needed",
    message: "Dr. Alistair Vance issued referral for Eleanor Vance (RX-104582) to St. Jude Eye Institute Vitreoretinal Unit.",
    timestamp: "Today, 11:20 AM",
    isRead: false,
    type: "referral_update",
    roleTarget: "Healthcare Worker",
    patientId: "RX-104582",
    referralId: "REF-2026-0042"
  },
  {
    id: "notif-wrk-2",
    title: "Assessment Completed",
    message: "Specialist grading confirmed for David Miller (RX-104585) - Annual checkup scheduled.",
    timestamp: "Today, 09:45 AM",
    isRead: false,
    type: "assessment_done",
    roleTarget: "Healthcare Worker",
    patientId: "RX-104585",
    sessionId: "SESS-2026-0870"
  },
  {
    id: "notif-wrk-3",
    title: "Follow-up Screening Due",
    message: "Amina Yusuf (RX-104586) is due for post-OCT appointment check at health post.",
    timestamp: "Yesterday, 02:00 PM",
    isRead: true,
    type: "followup",
    roleTarget: "Healthcare Worker",
    patientId: "RX-104586"
  },
  {
    id: "notif-pat-1",
    title: "Screening Report Available",
    message: "Your tele-retinopathy report reviewed by Dr. Alistair Vance is available in your records.",
    timestamp: "Today, 10:14 AM",
    isRead: false,
    type: "assessment_done",
    roleTarget: "Patient",
    patientId: "RX-104582",
    sessionId: "SESS-2026-0891"
  },
  {
    id: "notif-pat-2",
    title: "Specialist Referral Documentation",
    message: "Referral documentation issued for St. Jude Eye Institute Vitreoretinal Unit. Review directions in portal.",
    timestamp: "Today, 09:30 AM",
    isRead: false,
    type: "referral_update",
    roleTarget: "Patient",
    patientId: "RX-104582",
    referralId: "REF-2026-0042"
  },
  {
    id: "notif-pat-3",
    title: "Annual Follow-up Reminder",
    message: "Next routine dilated fundus examination recommended in 12 months.",
    timestamp: "Yesterday, 04:15 PM",
    isRead: true,
    type: "followup",
    roleTarget: "Patient",
    patientId: "RX-104585"
  }
];
var doctorState = { ...initialDoctor };
var workerState = { ...initialWorker };
var patientsState = [...initialPatients];
var sessionsState = [...initialScreenings];
var referralsState = [...initialReferrals];
var notificationsState = [...INITIAL_NOTIFICATIONS];
var dataStore = {
  getBootstrap() {
    return {
      doctor: doctorState,
      worker: workerState,
      patients: patientsState,
      sessions: sessionsState,
      referrals: referralsState,
      notifications: notificationsState
    };
  },
  // Patients
  getPatients() {
    return patientsState;
  },
  getPatientById(id) {
    return patientsState.find((p) => p.id === id);
  },
  createPatient(newPatient) {
    patientsState = [newPatient, ...patientsState];
    workerState = {
      ...workerState,
      stats: {
        ...workerState.stats,
        patientsRegistered: workerState.stats.patientsRegistered + 1
      }
    };
    return newPatient;
  },
  updatePatient(id, updates) {
    patientsState = patientsState.map(
      (p) => p.id === id ? { ...p, ...updates } : p
    );
    return patientsState.find((p) => p.id === id);
  },
  // Screening Sessions
  getSessions() {
    return sessionsState;
  },
  getSessionById(id) {
    return sessionsState.find((s) => s.id === id);
  },
  createSession(newSession) {
    sessionsState = [newSession, ...sessionsState];
    const targetPatient = patientsState.find((p) => p.id === newSession.patientId);
    if (targetPatient) {
      patientsState = patientsState.map(
        (p) => p.id === newSession.patientId ? {
          ...p,
          lastScreeningDate: newSession.date,
          totalScreenings: (p.totalScreenings || 0) + 1,
          overallStatus: newSession.riskLevel
        } : p
      );
    }
    workerState = {
      ...workerState,
      stats: {
        ...workerState.stats,
        sessionsCompleted: workerState.stats.sessionsCompleted + 1
      }
    };
    doctorState = {
      ...doctorState,
      stats: {
        ...doctorState.stats,
        totalSessions: doctorState.stats.totalSessions + 1
      }
    };
    if (newSession.riskLevel === "High Risk") {
      const docNotif = {
        id: `notif-doc-${Date.now()}`,
        title: "URGENT: High Risk Screening Uploaded",
        message: `${newSession.drGrade} detected for ${newSession.patientName} (${newSession.patientId}) at ${newSession.patientArea}. Immediate review advised.`,
        timestamp: "Just now",
        isRead: false,
        type: "high_risk",
        roleTarget: "Doctor",
        patientId: newSession.patientId,
        sessionId: newSession.id
      };
      notificationsState = [docNotif, ...notificationsState];
    } else {
      const docNotif = {
        id: `notif-doc-${Date.now()}`,
        title: "New Screening Session in Queue",
        message: `New scan for ${newSession.patientName} (${newSession.patientId}) submitted from field. Ready for specialist grading.`,
        timestamp: "Just now",
        isRead: false,
        type: "review_needed",
        roleTarget: "Doctor",
        patientId: newSession.patientId,
        sessionId: newSession.id
      };
      notificationsState = [docNotif, ...notificationsState];
    }
    return newSession;
  },
  submitDoctorAssessment(sessionId, data) {
    const targetSession = sessionsState.find((s) => s.id === sessionId);
    if (!targetSession) return null;
    sessionsState = sessionsState.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          reviewStatus: "Reviewed",
          doctorAssessment: {
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            decision: data.decision,
            notes: data.notes,
            hospitalName: data.hospitalName,
            followUpDate: data.followUpDate,
            submittedAt: "Today, Just now"
          }
        };
      }
      return s;
    });
    const isReferred = data.decision === "Refer to hospital" || data.decision === "Urgent referral";
    doctorState = {
      ...doctorState,
      stats: {
        ...doctorState.stats,
        reviewed: doctorState.stats.reviewed + 1,
        referred: isReferred ? doctorState.stats.referred + 1 : doctorState.stats.referred
      }
    };
    let generatedReferral = null;
    if (isReferred) {
      generatedReferral = {
        id: `REF-${Math.floor(1e3 + Math.random() * 9e3)}`,
        patientId: targetSession.patientId,
        patientName: targetSession.patientName,
        doctorName: data.doctorName,
        doctorId: data.doctorId,
        dateIssued: "Today, Just now",
        targetAppointmentDate: data.followUpDate || "Within 2 Weeks",
        hospitalName: data.hospitalName || "District Eye Hospital & Vitreoretinal Unit",
        reason: data.notes.slice(0, 100) + "...",
        urgency: data.decision === "Urgent referral" ? "Urgent" : "Routine",
        status: "Referral Issued",
        timeline: [
          {
            status: "Referral Issued",
            date: "Today",
            note: `Referral issued by ${data.doctorName}. Priority: ${data.decision}.`
          }
        ]
      };
      referralsState = [generatedReferral, ...referralsState];
      const wrkNotif = {
        id: `notif-wrk-${Date.now()}`,
        title: "New Hospital Referral to Coordinate",
        message: `${data.doctorName} referred ${targetSession.patientName} (${targetSession.patientId}) to ${data.hospitalName || "Eye Hospital"}.`,
        timestamp: "Just now",
        isRead: false,
        type: "referral_update",
        roleTarget: "Healthcare Worker",
        patientId: targetSession.patientId,
        referralId: generatedReferral.id
      };
      notificationsState = [wrkNotif, ...notificationsState];
      const patNotif = {
        id: `notif-pat-${Date.now()}`,
        title: "Hospital Referral Recommendation",
        message: `Doctor recommended specialist consultation at ${data.hospitalName || "Specialist Eye Hospital"}. Check your portal for visit guidelines.`,
        timestamp: "Just now",
        isRead: false,
        type: "referral_update",
        roleTarget: "Patient",
        patientId: targetSession.patientId,
        referralId: generatedReferral.id
      };
      notificationsState = [patNotif, ...notificationsState];
    } else {
      const patNotif = {
        id: `notif-pat-${Date.now()}`,
        title: "Doctor Assessment Completed",
        message: `Your retinal screening results have been reviewed and signed by ${data.doctorName}.`,
        timestamp: "Just now",
        isRead: false,
        type: "assessment_done",
        roleTarget: "Patient",
        patientId: targetSession.patientId,
        sessionId: targetSession.id
      };
      notificationsState = [patNotif, ...notificationsState];
    }
    return {
      session: sessionsState.find((s) => s.id === sessionId),
      referral: generatedReferral
    };
  },
  // Referrals
  getReferrals() {
    return referralsState;
  },
  createReferral(newReferral) {
    referralsState = [newReferral, ...referralsState];
    return newReferral;
  },
  updateReferral(id, updates) {
    referralsState = referralsState.map((ref) => {
      if (ref.id === id) {
        const newStatus = updates.status || ref.status;
        const newTimeline = updates.note ? [
          ...ref.timeline,
          {
            status: newStatus,
            date: "Today",
            note: updates.note
          }
        ] : ref.timeline;
        return {
          ...ref,
          status: newStatus,
          timeline: newTimeline
        };
      }
      return ref;
    });
    return referralsState.find((r) => r.id === id);
  },
  // Notifications
  getNotifications() {
    return notificationsState;
  },
  markAllNotificationsRead(roleTarget) {
    notificationsState = notificationsState.map((n) => {
      if (!roleTarget || n.roleTarget === roleTarget || n.roleTarget === "All") {
        return { ...n, isRead: true };
      }
      return n;
    });
    return notificationsState;
  },
  toggleNotification(id) {
    notificationsState = notificationsState.map(
      (n) => n.id === id ? { ...n, isRead: !n.isRead } : n
    );
    return notificationsState.find((n) => n.id === id);
  },
  createNotification(newNotif) {
    notificationsState = [newNotif, ...notificationsState];
    return newNotif;
  },
  // Doctor & Worker Profiles
  getDoctor() {
    return doctorState;
  },
  updateDoctor(updates) {
    doctorState = { ...doctorState, ...updates };
    return doctorState;
  },
  getWorker() {
    return workerState;
  },
  updateWorker(updates) {
    workerState = { ...workerState, ...updates };
    return workerState;
  }
};

// server/services/netraGeminiService.ts
var import_genai = require("@google/genai");

// server/prompts/netraSystemPrompt.ts
var NETRA_SYSTEM_PROMPT = `You are Netra AI, an intelligent conversational AI assistant embedded in a diabetic retinopathy screening and tele-ophthalmology web application.

PURPOSE & ROLE:
- Subtitle: "Your AI assistant for retinal screening".
- You help Health Workers, Doctors, and Administrators/Patients understand:
  \u2022 Diabetic Retinopathy (DR) biology, progression, and prevention.
  \u2022 DR grading scales (Grade 0 to Grade 4).
  \u2022 Retinal microvascular lesions (microaneurysms, hemorrhages, hard exudates, cotton-wool spots, neovascularization).
  \u2022 Fundus image quality parameters (sharpness, illumination, blur, artifacts, field of view).
  \u2022 AI screening model outputs, confidence metrics, and fused multi-model predictions.
  \u2022 Grad-CAM explainability heatmaps (what they represent and their limitations).
  \u2022 Bilateral comparison between Left Eye (OS) and Right Eye (OD).
  \u2022 Screening reports, referral workflows, and tele-ophthalmology routing.
- You are an EXPLANATION AND WORKFLOW ASSISTANT, NOT A DIAGNOSTIC DOCTOR.

ABSOLUTE MEDICAL SAFETY & ANTI-HALLUCINATION RULES:
1. NEVER provide a definitive medical diagnosis. Do not say "You have diabetic retinopathy" or "This confirms disease".
2. Always distinguish AI screening results from final clinical diagnoses. Use language such as:
   \u2022 "The AI screening model estimated..."
   \u2022 "The screening result indicates..."
   \u2022 "The model detected findings consistent with..."
   \u2022 "These findings must be reviewed and confirmed by a qualified ophthalmologist."
3. NEVER invent or hallucinate screening data.
   \u2022 If screening context (grade, confidence, lesions, Grad-CAM, etc.) is provided, reference ONLY what is given.
   \u2022 If lesion information or confidence is NOT provided in the screening context, explicitly state: "The current screening data does not provide lesion information for that eye." or "Confidence data is not specified in the current context."
   \u2022 NEVER make up lesion locations, percentages, or patient history.
4. DO NOT recommend starting, stopping, or altering medications or insulin dosages.
5. If emergency symptoms are mentioned (sudden vision loss, dark curtain falling over vision, flashes of light, severe eye pain), immediately urge emergency ophthalmology / emergency room care.
6. If asked "Do I definitely have diabetic retinopathy?", answer:
   "I can explain the AI screening result, but I cannot provide a definitive medical diagnosis. The screening result should be reviewed by a qualified eye-care professional."

ROLE-AWARE ADAPTATION:
- HEALTH_WORKER:
  \u2022 Use clear, accessible, and practical language.
  \u2022 Focus on fundus imaging capture techniques, how to improve image quality, why retakes are needed, lesion basics, what the DR grades mean practically, and how the patient referral & transit process works.
- DOCTOR:
  \u2022 Provide clinically rigorous, precise explanations.
  \u2022 Discuss ICDR / ETDRS grading criteria, microvascular pathophysiology, bilateral asymmetry, model confidence intervals, Grad-CAM attention distribution, and screening sensitivity/specificity boundaries.
- ADMIN / GENERAL:
  \u2022 Focus on application features, role workflows, data models, model versions, audit readiness, and screening protocol guidelines without exposing unauthorized patient details.

CORE RETINAL CONCEPTS REFERENCE:
- DR Grades (International Clinical Diabetic Retinopathy Scale):
  \u2022 Grade 0 (No DR): No diabetic retinal microvascular abnormalities.
  \u2022 Grade 1 (Mild NPDR): Microaneurysms only.
  \u2022 Grade 2 (Moderate NPDR): More than just microaneurysms, but less than severe NPDR (e.g. moderate dot/blot hemorrhages, hard exudates).
  \u2022 Grade 3 (Severe NPDR): 4-2-1 rule: severe hemorrhages in 4 quadrants, venous beading in 2+ quadrants, or prominent IRMA in 1+ quadrant; no proliferative signs.
  \u2022 Grade 4 (PDR - Proliferative Diabetic Retinopathy): Neovascularization (NVD/NVE) or vitreous/preretinal hemorrhage.
- Macular Edema (DME): Retinal thickening or hard exudates threatening or involving the center of the macula (fovea); major cause of central vision loss.
- Common Lesions:
  \u2022 Microaneurysm: Tiny outpouching of a weakened retinal capillary wall; appears as a minute, sharp red dot. Often the earliest visible sign.
  \u2022 Dot/Blot Hemorrhage: Deeper retinal capillary rupture leaking blood into the inner nuclear / outer plexiform layer; appears as round, dark red lesions.
  \u2022 Hard Exudate: Yellow, waxy lipid and lipoprotein deposit resulting from chronic serum leakage from abnormal capillaries.
  \u2022 Cotton-Wool Spot: Fluffy white-gray patch caused by ischemic axoplasmic flow interruption in the nerve fiber layer.
- Grad-CAM:
  \u2022 "Gradient-weighted Class Activation Mapping (Grad-CAM) is an AI explainability technique that produces a visual heatmap highlighting the retinal regions that most strongly influenced the neural network's grading decision. It helps clinicians inspect where the model focused, but it is an explainability tool, not a pixel-perfect anatomical segmentation or lesion map."
- Image Quality:
  \u2022 An image may be marked poor quality/ungradable due to blur/defocus, low illumination (too dark), flash glare (too bright), cataract or corneal opacity, small pupil, or blinking. A repeat capture after pupil adjustment or non-mydriatic camera refocusing is recommended.

TONE & STYLE:
- Professional, objective, calm, and helpful.
- Support markdown formatting (bold terms, bullet points, clean numbered lists).
- Keep explanations structured, easy to read, and free of unnecessary fluff.`;

// server/services/netraGeminiService.ts
var aiClient = null;
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({ apiKey });
  }
  return aiClient;
}
function formatScreeningContextBlock(ctx) {
  if (!ctx || !ctx.patientId && !ctx.leftEye && !ctx.rightEye) {
    return "";
  }
  const lines = ["[AUTHORIZED SCREENING CONTEXT]"];
  if (ctx.patientId) lines.push(`\u2022 Patient ID: ${ctx.patientId}`);
  if (ctx.screeningId) lines.push(`\u2022 Screening Session ID: ${ctx.screeningId}`);
  if (ctx.leftEye) {
    const le = ctx.leftEye;
    const parts = [];
    if (le.grade !== void 0) parts.push(`DR Grade: ${le.grade}${le.stageName ? ` (${le.stageName})` : ""}`);
    if (le.confidence !== void 0) parts.push(`Confidence: ${Math.round(le.confidence > 1 ? le.confidence : le.confidence * 100)}%`);
    if (le.quality) parts.push(`Quality: ${le.quality}`);
    if (le.lesions && le.lesions.length > 0) {
      parts.push(`Detected Lesions: ${le.lesions.join(", ")}`);
    } else {
      parts.push(`Detected Lesions: None reported in context`);
    }
    parts.push(`Grad-CAM: ${le.gradCamAvailable ? "Available" : "Not available"}`);
    lines.push(`\u2022 Left Eye (OS): ${parts.join(" | ")}`);
  } else {
    lines.push(`\u2022 Left Eye (OS): No data provided in current context.`);
  }
  if (ctx.rightEye) {
    const re = ctx.rightEye;
    const parts = [];
    if (re.grade !== void 0) parts.push(`DR Grade: ${re.grade}${re.stageName ? ` (${re.stageName})` : ""}`);
    if (re.confidence !== void 0) parts.push(`Confidence: ${Math.round(re.confidence > 1 ? re.confidence : re.confidence * 100)}%`);
    if (re.quality) parts.push(`Quality: ${re.quality}`);
    if (re.lesions && re.lesions.length > 0) {
      parts.push(`Detected Lesions: ${re.lesions.join(", ")}`);
    } else {
      parts.push(`Detected Lesions: None reported in context`);
    }
    parts.push(`Grad-CAM: ${re.gradCamAvailable ? "Available" : "Not available"}`);
    lines.push(`\u2022 Right Eye (OD): ${parts.join(" | ")}`);
  } else {
    lines.push(`\u2022 Right Eye (OD): No data provided in current context.`);
  }
  if (ctx.referralStatus) lines.push(`\u2022 Referral Status: ${ctx.referralStatus}`);
  if (ctx.doctorReviewStatus) lines.push(`\u2022 Doctor Review Status: ${ctx.doctorReviewStatus}`);
  if (ctx.summary) lines.push(`\u2022 Clinical Note: ${ctx.summary}`);
  lines.push("[END OF SCREENING CONTEXT - Do not assume or fabricate any clinical data outside these points]");
  return lines.join("\n");
}
async function handleNetraChat(req) {
  const { message, userRole = "HEALTH_WORKER", screeningContext, conversationHistory = [] } = req;
  if (!message || !message.trim()) {
    return {
      reply: "Please enter a question.",
      error: true
    };
  }
  const client = getAiClient();
  if (client) {
    try {
      const contents = [];
      if (Array.isArray(conversationHistory)) {
        const recentHistory = conversationHistory.slice(-8);
        for (const item of recentHistory) {
          if (item && item.text) {
            contents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.text }]
            });
          }
        }
      }
      const contextSegment = formatScreeningContextBlock(screeningContext);
      let promptText = `[User Role: ${userRole}]
`;
      if (contextSegment) {
        promptText += `${contextSegment}

`;
      }
      promptText += `User Question:
${message.trim()}`;
      contents.push({
        role: "user",
        parts: [{ text: promptText }]
      });
      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: NETRA_SYSTEM_PROMPT,
          temperature: 0.35,
          maxOutputTokens: 950
        }
      });
      if (response.text) {
        return {
          reply: response.text,
          isDemoMode: false
        };
      }
    } catch (geminiError) {
      console.error("Netra AI Gemini generation failed:", geminiError?.message || geminiError);
      return {
        reply: `Netra AI error: ${geminiError?.message || String(geminiError)}`,
        error: true
      };
    }
  }
  const demoReply = generateDemoModeResponse(message, userRole, screeningContext);
  return {
    reply: `*[Demo Mode - Gemini API key not configured in environment]*

${demoReply}`,
    isDemoMode: true
  };
}
function generateDemoModeResponse(message, role, ctx) {
  const q = message.toLowerCase();
  if (ctx && (q.includes("report") || q.includes("explain this") || q.includes("my result") || q.includes("screening result"))) {
    let output = `### Screening Context Explanation

`;
    if (ctx.patientId) output += `\u2022 **Patient ID:** ${ctx.patientId}
`;
    if (ctx.leftEye) {
      output += `\u2022 **Left Eye (OS):** DR Grade ${ctx.leftEye.grade ?? "Unspecified"} (${ctx.leftEye.stageName ?? "Staged"}), Image Quality: ${ctx.leftEye.quality ?? "Evaluated"}`;
      if (ctx.leftEye.confidence) output += `, Confidence: ${Math.round(ctx.leftEye.confidence > 1 ? ctx.leftEye.confidence : ctx.leftEye.confidence * 100)}%`;
      output += `
`;
      if (ctx.leftEye.lesions && ctx.leftEye.lesions.length > 0) {
        output += `  - *Detected Lesions:* ${ctx.leftEye.lesions.join(", ")}
`;
      } else {
        output += `  - *Lesions:* No lesion data provided in current context.
`;
      }
    }
    if (ctx.rightEye) {
      output += `\u2022 **Right Eye (OD):** DR Grade ${ctx.rightEye.grade ?? "Unspecified"} (${ctx.rightEye.stageName ?? "Staged"}), Image Quality: ${ctx.rightEye.quality ?? "Evaluated"}`;
      if (ctx.rightEye.confidence) output += `, Confidence: ${Math.round(ctx.rightEye.confidence > 1 ? ctx.rightEye.confidence : ctx.rightEye.confidence * 100)}%`;
      output += `
`;
      if (ctx.rightEye.lesions && ctx.rightEye.lesions.length > 0) {
        output += `  - *Detected Lesions:* ${ctx.rightEye.lesions.join(", ")}
`;
      } else {
        output += `  - *Lesions:* No lesion data provided in current context.
`;
      }
    }
    if (ctx.referralStatus) {
      output += `\u2022 **Referral Status:** ${ctx.referralStatus}
`;
    }
    output += `
*The AI screening model estimated these preliminary outputs to assist clinical review. A certified ophthalmologist will make the final diagnostic assessment.*`;
    return output;
  }
  if (ctx && (q.includes("left") && q.includes("right") || q.includes("worse") || q.includes("higher grade") || q.includes("difference between left and right"))) {
    if (ctx.leftEye && ctx.rightEye && ctx.leftEye.grade !== void 0 && ctx.rightEye.grade !== void 0) {
      const lg = Number(ctx.leftEye.grade);
      const rg = Number(ctx.rightEye.grade);
      if (lg > rg) {
        return `Based on the provided screening context, the **left eye** has the higher screening grade (Grade ${ctx.leftEye.grade}) compared to the **right eye** (Grade ${ctx.rightEye.grade}).

This bilateral asymmetry indicates more visible microvascular changes detected in the left retina. This finding should be verified during clinical examination by an ophthalmologist.`;
      } else if (rg > lg) {
        return `Based on the provided screening context, the **right eye** has the higher screening grade (Grade ${ctx.rightEye.grade}) compared to the **left eye** (Grade ${ctx.leftEye.grade}).

This bilateral asymmetry indicates more visible microvascular changes detected in the right retina. This finding should be verified during clinical examination by an ophthalmologist.`;
      } else {
        return `Both the left and right eyes were graded at **Grade ${ctx.leftEye.grade}** in this screening session. Bilateral symmetry indicates similar microvascular findings across both retinas.`;
      }
    }
    return `The current screening context does not contain bilateral grading data for both eyes to compare.`;
  }
  if (q.includes("grade 0") || q.includes("no dr")) {
    return `**Grade 0 (No Diabetic Retinopathy)**:

\u2022 **Meaning:** No visible diabetic retinal lesions (no microaneurysms, hemorrhages, or exudates) are present on fundus imaging.
\u2022 **Action:** In accordance with clinical guidelines (ADA/AAO), standard annual rescreening is recommended for diabetic patients with healthy retinas.`;
  }
  if (q.includes("grade 1") || q.includes("mild")) {
    return `**Grade 1 (Mild Non-Proliferative Diabetic Retinopathy - NPDR)**:

\u2022 **Hallmark:** Microaneurysms only. Microaneurysms are tiny outpouchings of weakened capillary walls that appear as miniature red dots.
\u2022 **Significance:** This is the earliest clinically detectable sign of diabetic vascular damage. Vision is typically unaffected at this stage.
\u2022 **Recommendation:** Tight glycemic and blood pressure management, with routine follow-up screening (typically every 6 to 12 months, as directed by the eye care professional).`;
  }
  if (q.includes("grade 2") || q.includes("moderate")) {
    return `**Grade 2 (Moderate NPDR)**:

\u2022 **Hallmark:** More than just microaneurysms, but less than severe NPDR. You may see scattered dot/blot hemorrhages, hard lipid exudates, and occasional cotton-wool spots.
\u2022 **Significance:** Capillary walls have weakened enough to leak both blood and lipid-rich fluid into the retinal tissue.
\u2022 **Workflow:** Requires closer clinical monitoring by an eye specialist to evaluate whether macular edema is developing.`;
  }
  if (q.includes("grade 3") || q.includes("severe")) {
    return `**Grade 3 (Severe NPDR)**:

\u2022 **Hallmark:** Follows the international "4-2-1 rule": severe intraretinal hemorrhages in all 4 quadrants, significant venous beading in 2+ quadrants, or prominent microvascular abnormalities (IRMA) in 1+ quadrant, with no proliferative vessel growth.
\u2022 **Significance:** Indicates extensive retinal ischemia (lack of oxygen). High risk of progressing to proliferative retinopathy.
\u2022 **Workflow:** Prompt referral to a vitreoretinal specialist for timely intervention.`;
  }
  if (q.includes("grade 4") || q.includes("proliferative") || q.includes("pdr")) {
    return `**Grade 4 (Proliferative Diabetic Retinopathy - PDR)**:

\u2022 **Hallmark:** Pathologic neovascularization (abnormal fragile new blood vessels growing on the disc or elsewhere on the retina) or preretinal/vitreous hemorrhage.
\u2022 **Significance:** These fragile vessels can bleed spontaneously, leading to severe vision loss or tractional retinal detachment.
\u2022 **Workflow:** Urgent referral to an ophthalmologist for treatments such as anti-VEGF therapy, panretinal photocoagulation (laser), or vitreoretinal surgery.`;
  }
  if (q.includes("microaneurysm")) {
    return `**What is a Microaneurysm?**

\u2022 A microaneurysm is a tiny, localized ballooning or outpouching of a weakened retinal capillary wall.
\u2022 **Appearance on Fundus:** They appear as sharp, tiny red dots, typically 15\u201350 micrometers in diameter.
\u2022 **Significance:** They are the earliest hallmark visible in diabetic retinopathy. They indicate localized vascular basement membrane breakdown caused by chronic hyperglycemia.`;
  }
  if (q.includes("hemorrhage") || q.includes("dot") || q.includes("blot")) {
    return `**Retinal Hemorrhages in DR**:

\u2022 **Dot/Blot Hemorrhages:** Occur when weakened microcapillaries rupture in the deeper layers of the retina (inner nuclear and outer plexiform layers). Because they are compressed between deep retinal cells, they look like round, dark red dots or blots.
\u2022 **Flame Hemorrhages:** Occur in the superficial nerve fiber layer, where blood spreads along the horizontal nerve fiber orientation, producing a feathery flame shape.
\u2022 **Difference from Microaneurysms:** Microaneurysms are intact dilated vessel pouches, whereas hemorrhages represent extravasated blood from broken vessels.`;
  }
  if (q.includes("exudate")) {
    return `**Hard vs. Soft Exudates**:

\u2022 **Hard Exudates:** Waxy, yellowish deposits with well-defined borders composed of lipids and lipoproteins. They precipitate when fluid leaks out from abnormally permeable capillaries.
\u2022 **Soft Exudates (Cotton-Wool Spots):** Whitish-gray fluffy patches caused by focal ischemia that stops axoplasmic transport in retinal nerve fibers. They are not true exudates, but rather mini-infarctions of the retinal nerve fiber layer.`;
  }
  if (q.includes("grad-cam") || q.includes("grad cam") || q.includes("explainability")) {
    return `**What is Grad-CAM?**

\u2022 **Definition:** Gradient-weighted Class Activation Mapping (Grad-CAM) is an artificial intelligence explainability technique.
\u2022 **How it Works:** It analyzes the gradients flowing into the final convolutional layers of the neural network to produce a visual coarse heatmap.
\u2022 **Colors:** Red and yellow zones indicate areas of the retinal image that contributed most heavily to the model's grading decision, while blue zones had minimal influence.
\u2022 **Important Limitation:** Grad-CAM is an attentional guide, **not** an exact anatomical map or lesion boundary. It shows where the AI looked, but the clinician must still inspect the underlying image for clinical pathology.`;
  }
  if (q.includes("quality") || q.includes("ungradable") || q.includes("poor quality") || q.includes("retake") || q.includes("blur")) {
    return `**Fundus Image Quality & Ungradable Captures**:

\u2022 **Common Causes of Poor Quality:**
  1. **Blur / Defocus:** Camera distance incorrect or patient moving during flash.
  2. **Low Illumination (Too Dark):** Small pupil (undilated) or low illumination setting.
  3. **Overexposure / Glare (Too Bright):** Flash reflection off the cornea or lens.
  4. **Media Opacities:** Cataracts or vitreous floaters obscuring retinal visibility.
  5. **Blinking or Eyelash Shadowing:** Patient blinked or upper lid was not retracted.

\u2022 **What to do if Ungradable:**
  1. Dim room lighting for 3\u20135 minutes to allow natural pupil expansion.
  2. Instruct patient to fixate steadily on the internal target light.
  3. Ensure camera lens is clean and reposition before re-capturing.
  4. If pupils remain too constricted (<3mm), notify the attending clinician regarding mydriatic drops if authorized.`;
  }
  if (q.includes("do i have") || q.includes("definitely") || q.includes("diagnose me") || q.includes("prescribe")) {
    return `I can explain the AI screening results and retinal imaging concepts, but I **cannot provide a definitive medical diagnosis or prescribe medications**.

AI screening models are decision-support tools designed to identify potential microvascular risk. Final clinical diagnosis and treatment plans must always be conducted by a licensed eye care professional (optometrist or ophthalmologist).`;
  }
  return `### Hello! I am Netra AI
*Your AI assistant for retinal screening*

I can assist you with:
\u2022 **DR Grades 0\u20134:** Explaining mild, moderate, severe NPDR, and proliferative DR.
\u2022 **Retinal Lesions:** Microaneurysms, dot/blot hemorrhages, hard exudates, and cotton-wool spots.
\u2022 **AI Screening Results & Grad-CAM:** Understanding how the model reached its prediction.
\u2022 **Bilateral Comparison:** Reviewing differences between left and right eye findings.
\u2022 **Image Quality:** Assessing sharpness, illumination, and guidance for retakes.
\u2022 **Tele-Ophthalmology Workflows:** Referral routing and clinical report interpretation.

Please feel free to ask any question or click "Explain with Netra AI" on any screening report!`;
}

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "RetinaX Tele-Ophthalmology API", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/bootstrap", (req, res) => {
  res.json(dataStore.getBootstrap());
});
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
app.post(["/api/assistant/chat", "/chatbot/ask", "/api/chatbot/ask"], async (req, res) => {
  try {
    const { message, userRole, screeningContext, conversationHistory, context, history } = req.body;
    const response = await handleNetraChat({
      message,
      userRole: userRole || req.body.role,
      screeningContext: screeningContext || context,
      conversationHistory: conversationHistory || history
    });
    if (response.error && response.reply === "Please enter a question.") {
      res.status(400).json(response);
      return;
    }
    res.json(response);
  } catch (err) {
    console.error("Netra AI endpoint error:", err);
    res.status(500).json({
      reply: `Netra AI Server Error: ${err?.message || String(err)}`,
      error: true,
      stack: err?.stack
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
      conversationHistory: history
    });
    res.json(response);
  } catch (err) {
    console.error("Assistant legacy endpoint error:", err);
    res.status(500).json({
      reply: "Netra AI is temporarily unavailable. Please try again.",
      error: true
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RetinaX Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
