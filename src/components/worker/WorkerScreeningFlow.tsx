import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  Send,
  Calendar,
  Activity,
  Pill,
  MapPin,
  Clock,
  ChevronDown,
  Layers,
  FileCheck,
} from 'lucide-react';
import { PatientProfile, ScreeningSession, WorkerUser, AIModelReport, RiskLevel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface WorkerScreeningFlowProps {
  worker: WorkerUser;
  patients: PatientProfile[];
  initialPatientId?: string;
  onBack: () => void;
  onCompleteScreening: (newSession: ScreeningSession) => void;
}

export const WorkerScreeningFlow: React.FC<WorkerScreeningFlowProps> = ({
  worker,
  patients,
  initialPatientId,
  onBack,
  onCompleteScreening,
}) => {
  // Steps: 1: Patient Verification, 2: Eye Laterality, 3: Retinal Image Upload, 4: Image Quality Check, 5: Run AI Screening, 6: Show Result
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // STEP 1: Patient Verification (Searchable dropdown)
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || (patients[0]?.id || 'RX-104582')
  );

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
      setCurrentStep(1);
    }
  }, [initialPatientId]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.area.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  // STEP 2: Eye Laterality: Right Eye (OD), Left Eye (OS), Both Eyes (OU)
  const [laterality, setLaterality] = useState<'Right Eye (OD)' | 'Left Eye (OS)' | 'Both Eyes (OU)'>(
    'Both Eyes (OU)'
  );

  // STEP 3: Retinal Image Uploads
  // OD image
  const [odImage, setOdImage] = useState<string>(
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80'
  );
  const [odFileName, setOdFileName] = useState<string>('fundus_OD_macula_centered.png');
  // OS image (for Both Eyes)
  const [osImage, setOsImage] = useState<string>(
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
  );
  const [osFileName, setOsFileName] = useState<string>('fundus_OS_macula_centered.png');

  // STEP 4: Image Quality Check
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [odQualityStatus, setOdQualityStatus] = useState<'Good' | 'Poor'>('Good');
  const [osQualityStatus, setOsQualityStatus] = useState<'Good' | 'Poor'>('Good');
  const [qualityChecked, setQualityChecked] = useState(false);

  // STEP 5: AI Screening execution (plain language progress)
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiProgressIndex, setAiProgressIndex] = useState(0);

  const plainLanguageSteps = [
    'Checking image quality and illumination...',
    'Detecting diabetic retinopathy signs...',
    'Evaluating referable retinopathy criteria...',
    'Detecting microaneurysms and intraretinal lesions...',
    'Analyzing optic disc and cup margin...',
    'Analyzing retinal vessel architecture...',
  ];

  // STEP 6: Show Results
  const [activeOuTab, setActiveOuTab] = useState<'OD' | 'OS'>('OD');
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  // Run Quality Check handler
  const startQualityCheck = () => {
    setCurrentStep(4);
    setIsCheckingQuality(true);
    setQualityChecked(false);

    setTimeout(() => {
      setIsCheckingQuality(false);
      setQualityChecked(true);
    }, 1200);
  };

  // Run AI Screening handler
  const startAiScreening = () => {
    setCurrentStep(5);
    setIsAiRunning(true);
    setAiProgressIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx < plainLanguageSteps.length) {
        setAiProgressIndex(idx);
      } else {
        clearInterval(interval);
        setIsAiRunning(false);
        setCurrentStep(6);
      }
    }, 450);
  };

  // Check if step 3 can proceed
  const canProceedFromStep3 = () => {
    if (laterality === 'Right Eye (OD)') return !!odImage;
    if (laterality === 'Left Eye (OS)') return !!osImage;
    if (laterality === 'Both Eyes (OU)') return !!odImage && !!osImage;
    return false;
  };

  // Handle final submission to Doctor review queue
  const handleFinalSubmit = (actionType: 'doctor' | 'followup') => {
    const randomId = `SS-${Math.floor(1000 + Math.random() * 9000)}`;

    const generatedReport: AIModelReport = {
      iqa: {
        score: 96,
        status: 'Good',
        illumination: 'Optimal cross-quadrant uniformity',
        sharpness: 'Foveal reflex sharp, vessels delineated',
        fieldOfView: 'Standard 45° macular centered',
      },
      drClassification: {
        grade: 'Moderate NPDR',
        icdrScale: 2,
        confidence: 94.2,
      },
      referableDR: {
        isReferable: true,
        confidence: 95.8,
        criteria: 'Referable DR due to multiple blot hemorrhages in >2 quadrants & perifoveal hard exudates',
      },
      microaneurysms: {
        detected: true,
        count: 14,
        quadrants: ['Superior Temporal', 'Inferior Temporal'],
        details: 'Clustered microaneurysms predominantly within 1 disc diameter of fovea.',
      },
      hemorrhages: {
        detected: true,
        type: 'Dot and blot hemorrhages',
        quadrants: ['Superior Temporal', 'Inferior Nasal'],
        details: 'Intraretinal dot/blot hemorrhages present.',
      },
      exudates: {
        detected: true,
        macularInvolvement: true,
        pattern: 'Circinate ring near superior border of fovea',
        details: 'Lipid deposits indicating breakdown of inner blood-retinal barrier.',
      },
      opticDisc: {
        status: 'Normal',
        cupToDiscRatio: 0.35,
        marginClarity: 'Sharp and distinct margins',
        details: 'Healthy neuroretinal rim tissue without glaucomatous cupping.',
      },
      vesselAnalysis: {
        status: 'Abnormal',
        tortuosity: 'Mild temporal tortuosity',
        caliberRatio: '0.68',
        arteriovenousNicking: false,
        details: 'Venous dilation mild in temporal arcade.',
      },
    };

    const newSession: ScreeningSession = {
      id: randomId,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      patientArea: selectedPatient.area,
      workerId: worker.id,
      workerName: worker.name,
      date: 'Today, Just now',
      laterality: laterality,
      drGrade: 'Moderate NPDR',
      riskLevel: 'Referable',
      imageQuality: 'Good',
      reviewStatus: 'Pending Review',
      isReferable: true,
      originalImageUrl: odImage || osImage,
      aiReport: generatedReport,
    };

    if (actionType === 'doctor') {
      setSubmittedFeedback('Screening session successfully submitted to Doctor Review Queue!');
    } else {
      setSubmittedFeedback('Screening saved and added to routine community follow-up schedule.');
    }

    setTimeout(() => {
      onCompleteScreening(newSession);
    }, 1200);
  };

  const stepsList = [
    { num: 1, label: 'Patient Verification' },
    { num: 2, label: 'Eye Laterality' },
    { num: 3, label: 'Retinal Image(s)' },
    { num: 4, label: 'Quality Check' },
    { num: 5, label: 'AI Screening' },
    { num: 6, label: 'Screening Result' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Screening Session</span>
        </button>

        <span className="text-xs font-medium text-gray-500">
          Operator: <strong>{worker.name}</strong> ({worker.id})
        </span>
      </div>

      {/* Guided Progress Indicator (Steps 1 to 6) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between">
          {stepsList.map((st, idx) => {
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <React.Fragment key={st.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-teal-800 text-white'
                        : isCurrent
                        ? 'bg-teal-50 text-teal-800 border-2 border-teal-700 ring-2 ring-teal-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium mt-1.5 text-center hidden md:block ${
                      isCurrent ? 'text-teal-900 font-bold' : isDone ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                      currentStep > st.num ? 'bg-teal-800' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Patient Verification */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step 1 of 6
            </span>
            <h2 className="text-xl font-bold text-gray-950 mt-1">
              Patient Verification
            </h2>
            <p className="text-xs text-gray-500">
              Select or search for the enrolled community patient to undergo tele-retinopathy screening.
            </p>
          </div>

          {/* Searchable Patient Dropdown */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Enrolled Patient *
            </label>
            <div className="relative">
              <input
                type="text"
                value={patientSearchTerm || (isPatientDropdownOpen ? '' : `${selectedPatient.name} (${selectedPatient.id})`)}
                onFocus={() => setIsPatientDropdownOpen(true)}
                onChange={(e) => {
                  setPatientSearchTerm(e.target.value);
                  setIsPatientDropdownOpen(true);
                }}
                placeholder="Type to filter patients by Name, ID, or Village..."
                className="w-full text-xs sm:text-sm pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <ChevronDown
                className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
              />
            </div>

            {/* Dropdown list */}
            {isPatientDropdownOpen && (
              <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
                {filteredPatients.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No matching enrolled patients found.
                  </div>
                ) : (
                  filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setPatientSearchTerm('');
                        setIsPatientDropdownOpen(false);
                      }}
                      className="w-full text-left p-3 hover:bg-teal-50/70 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-gray-900">{p.name}</span>
                        <span className="ml-2 font-mono text-[11px] text-gray-500">
                          ({p.id})
                        </span>
                        <p className="text-[11px] text-gray-400">{p.area}</p>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {p.age}y • {p.gender}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Patient Info Card: name, ID, age, gender, area, diagnosis, meds */}
          {selectedPatient && (
            <div className="bg-teal-50/40 border border-teal-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-800 text-white font-bold flex items-center justify-center text-base shadow-2xs">
                    {selectedPatient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-950">{selectedPatient.name}</h3>
                      <span className="text-xs font-mono font-bold bg-white text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                        {selectedPatient.id}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {selectedPatient.age} years old • {selectedPatient.gender} • {selectedPatient.area}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Enrolled
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-teal-100 text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] block">Diagnosis</span>
                  <span className="font-semibold text-gray-800">{selectedPatient.diabetesType}</span>
                  <span className="text-[11px] text-gray-500 block">({selectedPatient.durationYears} yrs duration)</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px] block">Medications</span>
                  <span className="font-semibold text-gray-800">{selectedPatient.medications}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              id="screening-step1-next-btn"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
            >
              <span>Next: Eye Laterality</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Eye Laterality */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step 2 of 6
            </span>
            <h2 className="text-xl font-bold text-gray-950 mt-1">
              Select Eye Laterality
            </h2>
            <p className="text-xs text-gray-500">
              Specify which eye(s) are being photographed. Selecting Both Eyes will require two separate fundus images.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: 'Right Eye (OD)' as const,
                title: 'Right Eye (OD)',
                desc: 'Capture single macula-centered fundus photo of right eye.',
              },
              {
                id: 'Left Eye (OS)' as const,
                title: 'Left Eye (OS)',
                desc: 'Capture single macula-centered fundus photo of left eye.',
              },
              {
                id: 'Both Eyes (OU)' as const,
                title: 'Both Eyes (OU)',
                desc: 'Comprehensive bilateral screening (requires 2 separate uploads: OD + OS).',
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setLaterality(item.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  laterality === item.id
                    ? 'border-teal-700 bg-teal-50/50 shadow-xs ring-2 ring-teal-100'
                    : 'border-gray-200 hover:border-teal-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs">
                    <Eye className="w-4 h-4" />
                  </div>
                  {laterality === item.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-700"></span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              id="screening-step2-next-btn"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
            >
              <span>Next: Retinal Image Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Capture/Upload Retinal Image(s) */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step 3 of 6
            </span>
            <h2 className="text-xl font-bold text-gray-950 mt-1">
              Capture / Upload Retinal Image(s)
            </h2>
            <p className="text-xs text-gray-500">
              {laterality === 'Both Eyes (OU)'
                ? 'Both Eyes (OU) selected: You must upload separate fundus photos for Right Eye (OD) and Left Eye (OS).'
                : `Upload high-resolution fundus photograph for ${laterality}.`}
            </p>
          </div>

          {/* Upload slots */}
          <div
            className={`grid gap-6 ${
              laterality === 'Both Eyes (OU)' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* Slot 1: Right Eye (OD) */}
            {(laterality === 'Right Eye (OD)' || laterality === 'Both Eyes (OU)') && (
              <div className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-teal-600" />
                    Right Eye (OD) Image Slot *
                  </span>
                  {odImage && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      OD Ready
                    </span>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-white hover:border-teal-500 transition-colors">
                  {odImage ? (
                    <div className="space-y-3">
                      <img
                        src={odImage}
                        alt="Right Eye Fundus"
                        className="w-full h-44 object-cover rounded-lg border border-gray-200 shadow-2xs"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-mono text-[11px]">{odFileName}</span>
                        <button
                          type="button"
                          onClick={() => setOdImage('')}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Upload className="w-8 h-8 text-teal-700 mx-auto" />
                      <p className="text-xs font-bold text-gray-800">
                        Click to upload OD Retinal Scan
                      </p>
                      <p className="text-[11px] text-gray-400">PNG, JPG or DICOM up to 15MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setOdFileName(e.target.files[0].name);
                            setOdImage(
                              'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80'
                            );
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slot 2: Left Eye (OS) */}
            {(laterality === 'Left Eye (OS)' || laterality === 'Both Eyes (OU)') && (
              <div className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-teal-600" />
                    Left Eye (OS) Image Slot *
                  </span>
                  {osImage && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      OS Ready
                    </span>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-white hover:border-teal-500 transition-colors">
                  {osImage ? (
                    <div className="space-y-3">
                      <img
                        src={osImage}
                        alt="Left Eye Fundus"
                        className="w-full h-44 object-cover rounded-lg border border-gray-200 shadow-2xs"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-mono text-[11px]">{osFileName}</span>
                        <button
                          type="button"
                          onClick={() => setOsImage('')}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <Upload className="w-8 h-8 text-teal-700 mx-auto" />
                      <p className="text-xs font-bold text-gray-800">
                        Click to upload OS Retinal Scan
                      </p>
                      <p className="text-[11px] text-gray-400">PNG, JPG or DICOM up to 15MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setOsFileName(e.target.files[0].name);
                            setOsImage(
                              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
                            );
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              id="screening-step3-next-btn"
              disabled={!canProceedFromStep3()}
              onClick={startQualityCheck}
              className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
            >
              <span>Run Image Quality Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Image Quality Check (IQA) */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step 4 of 6
            </span>
            <h2 className="text-xl font-bold text-gray-950 mt-1">
              Image Quality Assessment (IQA)
            </h2>
            <p className="text-xs text-gray-500">
              Verifying foveal clarity, macula illumination, and field-of-view adequacy before running AI models.
            </p>
          </div>

          {isCheckingQuality ? (
            <div className="py-14 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-800 rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-bold text-gray-900">
                Running Optical Quality & Illumination Analysis...
              </p>
              <p className="text-xs text-gray-500">Checking fovea centering and vessel sharpness</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* OD Quality Result */}
              {(laterality === 'Right Eye (OD)' || laterality === 'Both Eyes (OU)') && (
                <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-gray-700">
                      Right Eye (OD) Quality
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        odQualityStatus === 'Good'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {odQualityStatus === 'Good' ? 'Quality: Acceptable (Score: 96%)' : 'Quality: Poor / Blur'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {odQualityStatus === 'Good'
                      ? 'Optimal illumination, sharp macula reflex, clear retinal arcade definition.'
                      : 'Noticeable motion blur detected in the temporal field. Retake recommended.'}
                  </p>
                </div>
              )}

              {/* OS Quality Result */}
              {(laterality === 'Left Eye (OS)' || laterality === 'Both Eyes (OU)') && (
                <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-gray-700">
                      Left Eye (OS) Quality
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        osQualityStatus === 'Good'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {osQualityStatus === 'Good' ? 'Quality: Acceptable (Score: 94%)' : 'Quality: Poor / Blur'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {osQualityStatus === 'Good'
                      ? 'Optimal foveal contrast, minimal reflection artifact, acceptable diagnostic quality.'
                      : 'Uneven nasal illumination detected. Retake recommended.'}
                  </p>
                </div>
              )}

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Retinal images verified and certified ready for 8-model automated screening.</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors"
            >
              Retake / Re-upload
            </button>
            <button
              id="screening-step4-next-btn"
              disabled={isCheckingQuality}
              onClick={startAiScreening}
              className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
            >
              <span>Run Automated AI Screening</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Run AI Screening (plain language progress) */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
            <Activity className="w-8 h-8 animate-pulse text-teal-700" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step 5 of 6: AI Screening in Progress
            </span>
            <h2 className="text-2xl font-bold text-gray-950">
              Analyzing Retinal Biomarkers
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please wait while the unified diagnostic pipeline inspects microaneurysms, hemorrhages, exudates, and vascular features.
            </p>
          </div>

          {/* Plain language progress sequence */}
          <div className="max-w-md mx-auto bg-gray-50/80 border border-gray-200 rounded-2xl p-5 text-left space-y-3">
            {plainLanguageSteps.map((stepDesc, sIdx) => {
              const isPast = sIdx < aiProgressIndex;
              const isCurrent = sIdx === aiProgressIndex;
              return (
                <div key={sIdx} className="flex items-center gap-3 text-xs">
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                  )}
                  <span
                    className={`font-medium ${
                      isCurrent
                        ? 'text-teal-900 font-bold'
                        : isPast
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {stepDesc}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full max-w-md mx-auto bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-800 h-full transition-all duration-300"
              style={{
                width: `${((aiProgressIndex + 1) / plainLanguageSteps.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* STEP 6: Show Result (Simplified worker result: Overall Risk, Image Quality, DR Result, Referable) */}
      {currentStep === 6 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Screening Complete
              </span>
              <h2 className="text-xl font-bold text-gray-950 mt-0.5">
                Field Screening Outcome
              </h2>
              <p className="text-xs text-gray-500">
                Summary generated for <strong>{selectedPatient.name}</strong> ({selectedPatient.id})
              </p>
            </div>

            {/* Doctor Review Recommended Notice Badge */}
            <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Doctor Review Recommended</span>
            </div>
          </div>

          {submittedFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{submittedFeedback}</span>
            </div>
          )}

          {/* If Both Eyes: show OD and OS in clearly separated panels/tabs */}
          {laterality === 'Both Eyes (OU)' && (
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => setActiveOuTab('OD')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeOuTab === 'OD'
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Right Eye (OD) Results
              </button>
              <button
                onClick={() => setActiveOuTab('OS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeOuTab === 'OS'
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Left Eye (OS) Results
              </button>
            </div>
          )}

          {/* Simplified Result Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Overall Risk */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                1. Overall Risk Level
              </span>
              <div className="text-xl font-bold text-amber-950">Referable</div>
              <p className="text-[11px] text-gray-600">Requires ophthalmologist confirmation</p>
            </div>

            {/* 2. Image Quality */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                2. Image Quality
              </span>
              <div className="text-xl font-bold text-emerald-950">Good (Pass)</div>
              <p className="text-[11px] text-gray-600">Sharp fovea and clear vessels</p>
            </div>

            {/* 3. DR Classification Result */}
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                3. DR Staging Result
              </span>
              <div className="text-xl font-bold text-rose-950">
                {activeOuTab === 'OD' ? 'Moderate NPDR' : 'Mild NPDR'}
              </div>
              <p className="text-[11px] text-gray-600">Microaneurysms detected</p>
            </div>

            {/* 4. Referable (Yes/No) */}
            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                4. Referable DR
              </span>
              <div className="text-xl font-bold text-teal-950">Yes</div>
              <p className="text-[11px] text-gray-600">Hospital referral recommended</p>
            </div>
          </div>

          {/* Netra AI Screening Explanation Callout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-teal-50/80 border border-teal-200/90 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4 text-teal-100" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-teal-950">Have questions about this screening outcome?</h4>
                <p className="text-[11px] text-teal-800">
                  Netra AI can explain what DR grades mean, lesion types, or next clinical steps.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const context = {
                  patientId: selectedPatient.id,
                  screeningId: 'NEW-FIELD-SCREENING',
                  leftEye: {
                    grade: 1,
                    stageName: 'Mild NPDR',
                    confidence: 0.88,
                    quality: 'Good',
                    lesions: ['Microaneurysms'],
                    gradCamAvailable: true,
                  },
                  rightEye: {
                    grade: 2,
                    stageName: 'Moderate NPDR',
                    confidence: 0.91,
                    quality: 'Good',
                    lesions: ['Microaneurysms', 'Hard exudates'],
                    gradCamAvailable: true,
                  },
                  referralStatus: 'Referable DR (Doctor Review Recommended)',
                };
                window.dispatchEvent(
                  new CustomEvent('open-netra-ai', {
                    detail: {
                      context,
                      prompt: 'Explain this screening result in simple terms.',
                    },
                  })
                );
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-teal-200" />
              <span>Ask Netra AI</span>
            </button>
          </div>

          {/* Retinal Image Preview */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-5">
            <img
              src={activeOuTab === 'OD' ? odImage : osImage}
              alt="Fundus Scan"
              className="w-36 h-36 rounded-xl object-cover border border-gray-200 shadow-2xs shrink-0"
            />
            <div className="space-y-1.5 text-xs text-gray-600">
              <h4 className="font-bold text-gray-900 text-sm">
                {activeOuTab === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'} Fundus Scan
              </h4>
              <p>
                Non-mydriatic 45° macular centered photograph. Automated models flagged multiple dot hemorrhages and lipid exudate signatures. Full 8-model segmentation layers and Grad-CAM visualizations have been transmitted to the Doctor Portal for clinical sign-off.
              </p>
              <p className="text-gray-400 text-[11px]">
                Note: In compliance with protocol, detailed AI diagnostic model weights are reserved for Doctor review.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Return to Field Hub
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="screening-submit-doctor-btn"
                onClick={() => handleFinalSubmit('doctor')}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit to Doctor Review Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
