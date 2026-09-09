import React, { useState } from 'react';
import { Eye, Layers, ZoomIn, ZoomOut, RotateCcw, Info, Sliders } from 'lucide-react';
import { DRGrade, ImageQuality } from '../../types';

export type VisualizationTab =
  | 'Original'
  | 'DR Explanation'
  | 'Microaneurysm'
  | 'Hemorrhage'
  | 'Exudate'
  | 'Optic Disc'
  | 'Vessels';

interface RetinalVisualizerProps {
  patientId: string;
  patientName: string;
  laterality: string;
  drGrade: DRGrade;
  quality: ImageQuality;
  hasExudates?: boolean;
  hasHemorrhages?: boolean;
  hasMicroaneurysms?: boolean;
}

export const RetinalVisualizer: React.FC<RetinalVisualizerProps> = ({
  patientId,
  patientName,
  laterality,
  drGrade,
  quality,
  hasExudates = true,
  hasHemorrhages = true,
  hasMicroaneurysms = true,
}) => {
  const [activeTab, setActiveTab] = useState<VisualizationTab>('Original');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [showAnatomicalLabels, setShowAnatomicalLabels] = useState<boolean>(true);

  const tabs: { id: VisualizationTab; label: string; count?: number | string }[] = [
    { id: 'Original', label: 'Original' },
    { id: 'DR Explanation', label: 'DR Explanation (Grad-CAM)' },
    { id: 'Microaneurysm', label: 'Microaneurysms', count: hasMicroaneurysms ? '24' : '0' },
    { id: 'Hemorrhage', label: 'Hemorrhages', count: hasHemorrhages ? '18' : '0' },
    { id: 'Exudate', label: 'Exudates', count: hasExudates ? 'Ring' : '0' },
    { id: 'Optic Disc', label: 'Optic Disc' },
    { id: 'Vessels', label: 'Vessels' },
  ];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      {/* Visualizer Header & Tabs Bar */}
      <div className="border-b border-gray-200 bg-gray-50/50 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <h3 className="text-sm font-bold text-gray-900">
              Retinal Fundus Examination: {laterality}
            </h3>
            <span className="text-xs text-gray-500 font-mono">({patientId})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
              <Eye className="w-3 h-3 text-teal-600" />
              <span>Original preserved unaltered</span>
            </span>
          </div>
        </div>

        {/* Visualization Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`visualizer-tab-${tab.id.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-teal-800 text-teal-100' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Canvas / Viewer Frame */}
      <div className="relative bg-black flex items-center justify-center min-h-[460px] sm:min-h-[520px] overflow-hidden select-none">
        {/* Subtle grid background to simulate clinical calibration screen */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Viewport content */}
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Anatomical Fundus Simulation Base */}
          <svg
            className="w-[420px] h-[420px] sm:w-[480px] sm:h-[480px] rounded-full shadow-2xl border-4 border-amber-950/40"
            viewBox="0 0 500 500"
          >
            <defs>
              {/* Fundus Orange-Red Gradient */}
              <radialGradient id="fundusGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d9532f" />
                <stop offset="65%" stopColor="#a83216" />
                <stop offset="90%" stopColor="#661a07" />
                <stop offset="100%" stopColor="#2c0800" />
              </radialGradient>

              {/* Optic Disc Gradient */}
              <radialGradient id="opticDiscGrad" cx="45%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#fff8e7" />
                <stop offset="50%" stopColor="#f7d499" />
                <stop offset="85%" stopColor="#e3984d" />
                <stop offset="100%" stopColor="#b35b1b" />
              </radialGradient>

              {/* Macula Depressional Gradient */}
              <radialGradient id="maculaGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3d0e02" />
                <stop offset="40%" stopColor="#571705" />
                <stop offset="85%" stopColor="#872b12" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Grad-CAM Heatmap Radial */}
              <radialGradient id="gradCamHotspot1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 0, 0, 0.85)" />
                <stop offset="35%" stopColor="rgba(255, 120, 0, 0.7)" />
                <stop offset="70%" stopColor="rgba(255, 240, 0, 0.45)" />
                <stop offset="95%" stopColor="rgba(0, 200, 255, 0.15)" />
                <stop offset="100%" stopColor="rgba(0, 0, 255, 0)" />
              </radialGradient>

              <radialGradient id="gradCamHotspot2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 50, 50, 0.8)" />
                <stop offset="45%" stopColor="rgba(255, 170, 0, 0.5)" />
                <stop offset="85%" stopColor="rgba(255, 230, 0, 0.2)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </radialGradient>
            </defs>

            {/* Base Retinal Surface */}
            <circle cx="250" cy="250" r="240" fill="url(#fundusGlow)" />

            {/* Macular Center / Fovea */}
            <circle cx="270" cy="255" r="45" fill="url(#maculaGrad)" opacity="0.9" />
            <circle cx="270" cy="255" r="3" fill="#200400" />

            {/* Anatomical Retinal Vessels (Base Layer) */}
            <g strokeLinecap="round" opacity={activeTab === 'Vessels' ? 0.35 : 0.85}>
              {/* Superior Temporal Artery & Vein Arcade */}
              <path
                d="M 175 240 C 180 180, 220 125, 290 120 C 340 115, 380 145, 410 170"
                stroke="#500701"
                strokeWidth="6"
                fill="none"
              />
              <path
                d="M 175 238 C 182 178, 222 122, 292 118 C 342 114, 382 143, 412 168"
                stroke="#a62111"
                strokeWidth="3.5"
                fill="none"
              />

              {/* Inferior Temporal Artery & Vein Arcade */}
              <path
                d="M 175 260 C 185 320, 235 370, 310 375 C 365 378, 395 350, 425 320"
                stroke="#500701"
                strokeWidth="6.5"
                fill="none"
              />
              <path
                d="M 175 262 C 186 318, 236 368, 311 373 C 366 376, 396 348, 426 318"
                stroke="#a62111"
                strokeWidth="3.8"
                fill="none"
              />

              {/* Nasal Vessels */}
              <path
                d="M 165 245 C 130 220, 100 200, 70 190"
                stroke="#500701"
                strokeWidth="5"
                fill="none"
              />
              <path
                d="M 165 255 C 120 270, 95 300, 65 320"
                stroke="#500701"
                strokeWidth="4.5"
                fill="none"
              />

              {/* Fine Perifoveal Micro-capillaries */}
              <path
                d="M 235 180 Q 255 210, 260 230"
                stroke="#911d0e"
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M 330 190 Q 305 220, 285 240"
                stroke="#911d0e"
                strokeWidth="1.8"
                fill="none"
              />
              <path
                d="M 245 320 Q 260 290, 265 270"
                stroke="#911d0e"
                strokeWidth="1.8"
                fill="none"
              />
            </g>

            {/* Optic Disc (Base Anatomical) */}
            <ellipse
              cx="170"
              cy="250"
              rx="32"
              ry="36"
              fill="url(#opticDiscGrad)"
              stroke="#8a3a00"
              strokeWidth="1.5"
            />
            {/* Physiologic Cup */}
            <ellipse
              cx="168"
              cy="250"
              rx="12"
              ry="14"
              fill="#fff9ed"
              opacity="0.9"
            />

            {/* ========================================================
                DERIVED VISUALIZATION OVERLAYS (Shown conditionally)
               ======================================================== */}

            {/* 1. DR Explanation: Grad-CAM Saliency Map */}
            {activeTab === 'DR Explanation' && (
              <g opacity={overlayOpacity} className="animate-in fade-in">
                {/* Hotspot 1: Macula lesion cluster */}
                <circle cx="280" cy="245" r="95" fill="url(#gradCamHotspot1)" />
                {/* Hotspot 2: Superior Temporal Arcade */}
                <circle cx="340" cy="160" r="70" fill="url(#gradCamHotspot2)" />
                {/* Hotspot 3: Inferior blot hemorrhages */}
                <circle cx="290" cy="340" r="60" fill="url(#gradCamHotspot2)" />

                {/* Saliency Contours */}
                <circle
                  cx="280"
                  cy="245"
                  r="60"
                  stroke="#ffff00"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                  fill="none"
                  opacity="0.8"
                />
                <circle
                  cx="280"
                  cy="245"
                  r="35"
                  stroke="#ff0000"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                  fill="none"
                  opacity="0.9"
                />
              </g>
            )}

            {/* 2. Microaneurysm Overlay */}
            {activeTab === 'Microaneurysm' && (
              <g opacity={overlayOpacity} className="animate-in zoom-in-95">
                {[
                  { cx: 245, cy: 230, r: 4 },
                  { cx: 255, cy: 220, r: 3.5 },
                  { cx: 285, cy: 225, r: 4.2 },
                  { cx: 295, cy: 235, r: 3.8 },
                  { cx: 265, cy: 275, r: 4 },
                  { cx: 280, cy: 285, r: 3.5 },
                  { cx: 310, cy: 250, r: 4.5 },
                  { cx: 325, cy: 230, r: 3.5 },
                  { cx: 235, cy: 260, r: 3.8 },
                  { cx: 330, cy: 195, r: 4.2 },
                  { cx: 350, cy: 175, r: 4 },
                  { cx: 260, cy: 185, r: 3.5 },
                  { cx: 275, cy: 320, r: 4 },
                  { cx: 300, cy: 335, r: 3.8 },
                ].map((m, idx) => (
                  <g key={idx}>
                    {/* Ring highlight */}
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r={m.r + 7}
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      fill="rgba(239, 68, 68, 0.2)"
                    />
                    {/* Lesion Dot */}
                    <circle cx={m.cx} cy={m.cy} r={m.r} fill="#dc2626" />
                  </g>
                ))}
              </g>
            )}

            {/* 3. Hemorrhage Overlay */}
            {activeTab === 'Hemorrhage' && (
              <g opacity={overlayOpacity} className="animate-in zoom-in-95">
                {/* Deep Blot Hemorrhages */}
                <ellipse
                  cx="320"
                  cy="200"
                  rx="14"
                  ry="9"
                  fill="#7f1d1d"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="360"
                  cy="170"
                  rx="18"
                  ry="12"
                  fill="#7f1d1d"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="285"
                  cy="330"
                  rx="16"
                  ry="10"
                  fill="#7f1d1d"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="220"
                  cy="310"
                  rx="12"
                  ry="8"
                  fill="#7f1d1d"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />

                {/* Flame-shaped Superficially Streaked Hemorrhages */}
                <path
                  d="M 340 140 Q 370 150, 390 145 Q 365 135, 340 140"
                  fill="#991b1b"
                  stroke="#f87171"
                  strokeWidth="1"
                />
                <path
                  d="M 300 350 Q 330 365, 350 360 Q 320 348, 300 350"
                  fill="#991b1b"
                  stroke="#f87171"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* 4. Exudate Overlay */}
            {activeTab === 'Exudate' && (
              <g opacity={overlayOpacity} className="animate-in zoom-in-95">
                {/* Hard Exudates (Lipid Circinate Ring) */}
                {[
                  { cx: 300, cy: 220, rx: 6, ry: 4 },
                  { cx: 315, cy: 228, rx: 8, ry: 5 },
                  { cx: 322, cy: 242, rx: 7, ry: 6 },
                  { cx: 318, cy: 260, rx: 9, ry: 5 },
                  { cx: 305, cy: 275, rx: 7, ry: 4 },
                  { cx: 290, cy: 282, rx: 8, ry: 5 },
                  { cx: 245, cy: 220, rx: 5, ry: 4 },
                  { cx: 238, cy: 235, rx: 6, ry: 4 },
                  { cx: 340, cy: 240, rx: 5, ry: 4 },
                ].map((e, idx) => (
                  <g key={idx}>
                    <ellipse
                      cx={e.cx}
                      cy={e.cy}
                      rx={e.rx + 3}
                      ry={e.ry + 3}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                    />
                    <ellipse
                      cx={e.cx}
                      cy={e.cy}
                      rx={e.rx}
                      ry={e.ry}
                      fill="#fef08a"
                      stroke="#d97706"
                      strokeWidth="0.8"
                    />
                  </g>
                ))}

                {/* Circinate Envelope Guideline */}
                <ellipse
                  cx="285"
                  cy="255"
                  rx="55"
                  ry="42"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.75"
                />
              </g>
            )}

            {/* 5. Optic Disc Segmentation */}
            {activeTab === 'Optic Disc' && (
              <g opacity={overlayOpacity} className="animate-in zoom-in-95">
                {/* Disc Margin (Outer Ring) */}
                <ellipse
                  cx="170"
                  cy="250"
                  rx="34"
                  ry="38"
                  fill="rgba(59, 130, 246, 0.15)"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
                {/* Cup Margin (Inner Ring) */}
                <ellipse
                  cx="168"
                  cy="250"
                  rx="13"
                  ry="15"
                  fill="rgba(239, 68, 68, 0.2)"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                {/* Horizontal & Vertical Crosshairs for Cup-to-Disc calculation */}
                <line x1="136" y1="250" x2="204" y2="250" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="170" y1="212" x2="170" y2="288" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="155" y1="250" x2="181" y2="250" stroke="#ef4444" strokeWidth="1.5" />
                <line x1="168" y1="235" x2="168" y2="265" stroke="#ef4444" strokeWidth="1.5" />
              </g>
            )}

            {/* 6. Vessel Segmentation & Caliber Network */}
            {activeTab === 'Vessels' && (
              <g opacity={overlayOpacity} className="animate-in zoom-in-95">
                {/* Enhanced Artery Tracking (Red Cyan highlight) */}
                <path
                  d="M 175 238 C 182 178, 222 122, 292 118 C 342 114, 382 143, 412 168"
                  stroke="#ef4444"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Enhanced Vein Tracking (Blue Cyan highlight) */}
                <path
                  d="M 175 240 C 180 180, 220 125, 290 120 C 340 115, 380 145, 410 170"
                  stroke="#3b82f6"
                  strokeWidth="5"
                  fill="none"
                />

                <path
                  d="M 175 260 C 185 320, 235 370, 310 375 C 365 378, 395 350, 425 320"
                  stroke="#3b82f6"
                  strokeWidth="5"
                  fill="none"
                />
                <path
                  d="M 175 262 C 186 318, 236 368, 311 373 C 366 376, 396 348, 426 318"
                  stroke="#ef4444"
                  strokeWidth="4"
                  fill="none"
                />

                {/* Arteriovenous Nicking Site Marker */}
                <circle cx="342" cy="148" r="10" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="3,2" />
              </g>
            )}
          </svg>

          {/* Anatomical Annotations / Tooltips */}
          {showAnatomicalLabels && activeTab === 'Original' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[48%] left-[30%] text-[10px] text-amber-200 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                Optic Disc
              </div>
              <div className="absolute top-[52%] right-[40%] text-[10px] text-amber-200 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                Fovea / Macula
              </div>
            </div>
          )}
        </div>

        {/* Floating Controls Overlay (Zoom, Opacity, Info) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-xl p-1.5 border border-white/10 text-white shadow-lg">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1.5 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-1"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Overlay Opacity Slider (When activeTab is not Original) */}
          {activeTab !== 'Original' && (
            <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-white shadow-lg">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-medium">Overlay:</span>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-20 accent-teal-500 cursor-pointer h-1.5"
              />
              <span className="text-[11px] font-mono w-8">{Math.round(overlayOpacity * 100)}%</span>
            </div>
          )}

          {/* Status Chip */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-white text-xs flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Quality: {quality}</span>
          </div>
        </div>
      </div>

      {/* Tab Context Legend & Clinical Explanations */}
      <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-700 shrink-0" />
          {activeTab === 'Original' && (
            <span>Raw untouched 45° fundus image. Preserved permanently for medico-legal record integrity.</span>
          )}
          {activeTab === 'DR Explanation' && (
            <span>Grad-CAM model saliency map: Highlights retinal regions contributing highest activation to DR classification.</span>
          )}
          {activeTab === 'Microaneurysm' && (
            <span>Detected 24 focal capillary wall outpouchings (25-40μm diameter) concentrated in the temporal vascular arcade.</span>
          )}
          {activeTab === 'Hemorrhage' && (
            <span>18 intraretinal flame and deep blot hemorrhages detected across 4 quadrants meeting ICDR severe criteria.</span>
          )}
          {activeTab === 'Exudate' && (
            <span>Lipid circinate ring identified within 500μm of macular avascular zone (high macular edema risk).</span>
          )}
          {activeTab === 'Optic Disc' && (
            <span>Optic disc segmentation: Cup-to-Disc Ratio calculated at 0.35 (vertical). Neuroretinal rim healthy pink.</span>
          )}
          {activeTab === 'Vessels' && (
            <span>Arteriolar narrowing detected (AV ratio 0.52). Arteriovenous nicking site highlighted at superior branch.</span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 font-medium">
          {activeTab === 'Vessels' && (
            <>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Artery
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Vein
              </span>
            </>
          )}
          {activeTab === 'Optic Disc' && (
            <>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Disc Margin
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Cup Margin
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
