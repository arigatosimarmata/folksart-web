import React, { useState } from 'react';
import { 
  CheckCircle, AlertCircle, HelpCircle, Loader2, Upload, FileText, 
  ShieldCheck, ArrowRight, ClipboardCheck, Info, UserCheck, RefreshCw 
} from 'lucide-react';
import { KYCDocument } from '../types/iam';

interface KYCHubProps {
  currentUser: { name: string; username: string; email: string; role: string };
  addAuditLog: (action: string, targetName: string, severity?: 'info' | 'warning' | 'critical') => void;
}

export default function KYCHub({ currentUser, addAuditLog }: KYCHubProps) {
  // KYC Multi-step
  const steps = [
    { title: 'Governance Consent', desc: 'Sovereign privacy terms signature' },
    { title: 'Document Verification', desc: 'Secure upload of physical credentials' },
    { title: 'Cognitive Selfie Matching', desc: 'Biometric posture & video analysis' },
    { title: 'Compliance Decision', desc: 'Decentralized IAM audit approval' }
  ];

  const [activeStep, setActiveStep] = useState(1); // Starting at Document step (index 1)
  const [docType, setDocType] = useState<'Passport' | 'Driver License' | 'National ID'>('Passport');
  const [document, setDocument] = useState<KYCDocument>({
    type: null,
    fileName: null,
    fileSize: null,
    uploadDate: null,
    status: 'Idle'
  });

  const [consentAccepted, setConsentAccepted] = useState(true);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'scanning' | 'passed' | 'failed'>('idle');

  // Interactive mock checklist items updated during uploads & verification clicks
  const [checks, setChecks] = useState([
    { id: 'edges', label: 'Four corners of physical card or paper are fully captured', status: 'pending' },
    { id: 'glare', label: 'No laser glare, window reflection, or camera shadow details', status: 'pending' },
    { id: 'details', label: 'Spelled legal name matched perfectly with identity credentials', status: 'pending' },
    { id: 'expiry', label: 'Validity exceeds 180 continuous operating calendar days', status: 'pending' },
    { id: 'resolution', label: 'Document resolution conforms to at least 300 DPI high clarity metrics', status: 'pending' }
  ]);

  // Handle mock file selection
  const simulateFileUpload = (fileName: string, size: string) => {
    setDocument({
      type: docType,
      fileName,
      fileSize: size,
      uploadDate: new Date().toLocaleDateString(),
      status: 'Processing',
      validationMessage: 'Running edge contrast tests and deep OCR inspection'
    });

    // Stagger checks update during OCR simulation
    setTimeout(() => {
      setChecks(prev => prev.map((item, idx) => {
        if (idx < 2) return { ...item, status: 'passed' };
        return item;
      }));
    }, 1500);

    setTimeout(() => {
      setDocument(prev => ({
        ...prev,
        status: 'Approved',
        validationMessage: 'Opaque neural matching confirmed document authenticity.'
      }));

      setChecks(prev => prev.map(item => ({ ...item, status: 'passed' })));
      addAuditLog('KYC_DOCUMENT_OCR_PASSED', `${currentUser.name} - ${docType}`, 'info');
      
      // Auto advance to Biometrics step
      setTimeout(() => {
        setActiveStep(2);
      }, 1000);

    }, 3000);
  };

  // Simulate active biometric verification scan
  const startBiometricScan = () => {
    setBiometricStatus('scanning');
    setTimeout(() => {
      setBiometricStatus('passed');
      addAuditLog('BIOMETRIC_BIOPHOTO_VERIFIED', currentUser.name, 'info');
      
      // Auto advance to decision step
      setTimeout(() => {
        setActiveStep(3);
      }, 1500);

    }, 2500);
  };

  const resetFlow = () => {
    setActiveStep(0);
    setConsentAccepted(false);
    setBiometricStatus('idle');
    setDocument({
      type: null,
      fileName: null,
      fileSize: null,
      uploadDate: null,
      status: 'Idle'
    });
    setChecks([
      { id: 'edges', label: 'Four corners of physical card or paper are fully captured', status: 'pending' },
      { id: 'glare', label: 'No laser glare, window reflection, or camera shadow details', status: 'pending' },
      { id: 'details', label: 'Spelled legal name matched perfectly with identity credentials', status: 'pending' },
      { id: 'expiry', label: 'Validity exceeds 180 continuous operating calendar days', status: 'pending' },
      { id: 'resolution', label: 'Document resolution conforms to at least 300 DPI high clarity metrics', status: 'pending' }
    ]);
  };

  return (
    <div className="space-y-6" id="kyc-hub-view">
      
      {/* 1. Header & Context */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)]">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#2563EB]" /> KYC Compliance Verification Terminal
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
          Folksart identity networks require cryptographic and physical legal documentation matches to enable high-clearance actions. Review or execute identity proof parameters below.
        </p>
      </div>

      {/* 2. Horizontal Progress Flow bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)]" id="kyc-progress-tracker">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            
            return (
              <div key={idx} className="flex-1 flex gap-3.5 items-start">
                <div className="relative flex items-center justify-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                    isCompleted ? 'bg-emerald-50 border-emerald-500 text-emerald-700' :
                    isActive ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] ring-2 ring-blue-500/20' :
                    'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4.5 w-4.5 text-emerald-600" /> : idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute left-8 top-4 w-[120%] h-0.5 bg-gray-100 -z-0">
                      <div className={`h-full bg-emerald-500 transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-none ${isActive ? 'text-[#2563EB]' : 'text-gray-900'}`}>{step.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal max-w-[150px]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Dashboard Double Column Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Sidebar checks lists */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)]">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2.5">
              <ClipboardCheck className="h-4 w-4 text-[#2563EB]" /> OCR Compliance Checkpoints
            </h4>

            <div className="space-y-3" id="ocr-checklist">
              {checks.map((check) => (
                <div 
                  key={check.id} 
                  className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors ${
                    check.status === 'passed' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-gray-50/40 border-gray-100 text-gray-600'
                  }`}
                >
                  <div className="mt-0.5">
                    {check.status === 'passed' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-normal">{check.label}</p>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                      {check.status === 'passed' ? 'Matched with high integrity confidence score' : 'Awaiting digital photo file submission'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secure validation notice */}
          <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl flex gap-3">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-700 leading-normal">
              <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">Physical Verification Notice</span>
              All uploads reside solely within server-contained RAM structures during decryption processing, compliant with local sovereign governance standards of ISO/IEC 27001.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Workspaces */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-xl border border-gray-100 h-full shadow-[0px_4px_20px_rgba(17,24,39,0.05)] flex flex-col justify-between">
            
            {/* --- AREA 1: CONSENT (STEP 0) --- */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Step 1: Sovereignty & Privacy Agreement</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Before capturing digital identifier telemetry, Folksart requires legal consensus regarding zero-knowledge storage, biopolitical integrity parameters, and automatic cookie decay logic.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border text-[11px] text-gray-500 space-y-2 h-[200px] overflow-y-auto">
                  <p className="font-bold text-gray-800">1. Decentralized Custody of Legal Identity</p>
                  <p>Subject agrees that identity references, image matrices, and birth names are indexed under local secure cryptographic schemes. Real-time keys are not indexed on internet-exposed relational structures database layers.</p>
                  <p className="font-bold text-gray-800">2. Transitory Memory Processing</p>
                  <p>All physical uploaded drivers licenses, passports, and utility bills are evaluated instantaneously. Pixel sets are purged within thirty seconds, leaving behind only verification hashes.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-consent" 
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="h-4 w-4 rounded text-[#2563EB] border-gray-300"
                  />
                  <label htmlFor="chk-consent" className="text-xs font-semibold text-gray-700">
                    I agree to Folksart Humane Storage Consensus standards.
                  </label>
                </div>

                <button
                  type="button"
                  disabled={!consentAccepted}
                  onClick={() => setActiveStep(1)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white py-2 px-4 shadow-sm disabled:opacity-50 transition-all"
                >
                  Verify Consent and Proceed <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* --- AREA 2: UPLOAD DOCUMENTS (STEP 1) --- */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Step 2: Legal Credential Verification</h4>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    {['Passport', 'Driver License', 'National ID'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDocType(type as any)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                          docType === type ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated file drop region */}
                <div className="border border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-blue-400 rounded-xl p-8 text-center transition-colors relative group">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] group-hover:scale-110 transition-transform">
                      {document.status === 'Processing' ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6" />
                      )}
                    </div>
                    {document.status === 'Idle' ? (
                      <>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            Select verification document asset to upload
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            PDF, JPEG, or High Contrast Camera Raw images (Max 8MB)
                          </p>
                        </div>
                        <div className="flex justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => simulateFileUpload(`org_id_passport_${currentUser.username}.jpg`, '2.4 MB')}
                            className="bg-white hover:bg-gray-100 border text-[10px] font-bold px-3 py-1.5 rounded-lg text-gray-700 shadow-xs flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3 text-blue-500" />
                            Mock Scan - Passport
                          </button>
                          <button
                            type="button"
                            onClick={() => simulateFileUpload(`us_driver_license_valid.png`, '1.8 MB')}
                            className="bg-white hover:bg-gray-100 border text-[10px] font-bold px-3 py-1.5 rounded-lg text-gray-700 shadow-xs flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3 text-emerald-500" />
                            Mock Scan - License
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-800">{document.fileName}</p>
                        <div className="flex justify-center items-center gap-2 text-[10px] text-gray-400">
                          <span>Size: {document.fileSize}</span>
                          <span>•</span>
                          <span>Status: <strong className={document.status === 'Approved' ? 'text-emerald-600' : 'text-blue-500 animate-pulse'}>{document.status}</strong></span>
                        </div>
                        {document.validationMessage && (
                          <p className="text-[10px] font-semibold text-gray-500 italic bg-gray-100/50 p-2 rounded-md">
                            {document.validationMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* "Avoid Errors" Tooltips Accordion */}
                <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3.5 space-y-1.5">
                  <h5 className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Mandatory OCR Capture Parameters
                  </h5>
                  <ul className="text-[10px] text-yellow-700 space-y-1 pl-4 list-disc">
                    <li><strong>Hold Flat:</strong> Reflections on glossy ID laminate completely blind OCR scanners.</li>
                    <li><strong>Name Alignment:</strong> Verification will automatically flag if the middle initials differ from corporate email directory profiles.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* --- AREA 3: BIOMETRIC SELFIE (STEP 2) --- */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Step 3: Cryptographic Liveness & Selfie Matching</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Now, ensure webcam or biometric focus allows real-time evaluation. This confirms that the person holding the scanned document is the real physical principal.
                </p>

                <div className="bg-gray-950 rounded-xl aspect-video relative flex items-center justify-center border-4 border-gray-800 overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none"></div>
                  
                  {biometricStatus === 'idle' && (
                    <div className="text-center p-4">
                      <div className="h-10 w-10 text-gray-400 mx-auto mb-2 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center">
                        📷
                      </div>
                      <p className="text-xs font-bold text-gray-300">Biometric Sensor Camera Awaiting Trigger</p>
                      <button
                        type="button"
                        onClick={startBiometricScan}
                        className="mt-3.5 bg-[#2563EB] hover:bg-blue-700 text-[10px] font-bold text-white px-4 py-1.5 rounded-lg shadow-sm"
                      >
                        Initiate Liveness Scan
                      </button>
                    </div>
                  )}

                  {biometricStatus === 'scanning' && (
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#2563EB] tracking-widest uppercase animate-pulse">Scanning facial landmarks...</p>
                      <p className="text-[10px] text-gray-400 mt-1">Conform your face perfectly inside target boundaries</p>
                    </div>
                  )}

                  {biometricStatus === 'passed' && (
                    <div className="text-center p-4 bg-emerald-950/80 absolute inset-0 flex flex-col justify-center items-center">
                      <UserCheck className="h-10 w-10 text-emerald-400 mb-2" />
                      <p className="text-sm font-bold text-emerald-400">Cognitive Face Validation Cleared</p>
                      <p className="text-[11px] text-emerald-300">Confidence Match Score: 99.4%</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Verification Method: Dynamic Neural Frame Matching</span>
                  {biometricStatus === 'passed' && (
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Advance to Outcome
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* --- AREA 4: FINAL DECISION REVIEW (STEP 3) --- */}
            {activeStep === 3 && (
              <div className="space-y-5 text-center py-6">
                <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-8 w-8" />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Compliance Verification Achieved</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Folksart compliance algorithms have resolved all critical checks. Your corporate profile corresponding to <span className="font-semibold text-gray-800">{currentUser.name}</span> has matching validated logs.
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 max-w-sm mx-auto text-xs space-y-1.5 text-left text-gray-600">
                  <p className="flex justify-between"><span>Authority Verdict:</span> <strong className="text-emerald-600">VERIFIED STATUS</strong></p>
                  <p className="flex justify-between"><span>Matched Identifier:</span> <span>{currentUser.email}</span></p>
                  <p className="flex justify-between"><span>Cryptographic Audit Proof:</span> <span className="font-mono text-[10px]">fka_proof_37yvA18</span></p>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="inline-flex items-center gap-1.5 hover:underline text-xs text-gray-400 hover:text-gray-600 font-medium"
                  >
                    <RefreshCw className="h-3 w-3" /> Reset compliance workflow
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
