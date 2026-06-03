import React, { useState } from 'react';
import { 
  User, Key, Shield, Smartphone, Laptop, MapPin, Trash2, 
  Settings, CheckCircle2, AlertTriangle, Eye, RefreshCw 
} from 'lucide-react';
import { INITIAL_SESSIONS } from '../data/mockData';
import { ActiveSession } from '../types/iam';

interface UserProfileProps {
  currentUser: { name: string; username: string; email: string; role: string };
  addAuditLog: (action: string, targetName: string, severity?: 'info' | 'warning' | 'critical') => void;
  onLogout: () => void;
}

export default function UserProfile({ currentUser, addAuditLog, onLogout }: UserProfileProps) {
  
  // Real dynamic state for testing changes
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  
  const [mfaMethods, setMfaMethods] = useState<string[]>([
    'Time-Based Authenticator (TOTP)'
  ]);

  const [ssoProviders, setSsoProviders] = useState({
    google: true,
    apple: false,
    github: false
  });

  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdatePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('USER_PERSONAL_INFO_UPDATED', name, 'info');
    triggerToast('Personal profile parameters updated successfully.');
  };

  const toggleMfaMethod = (methodName: string) => {
    setMfaMethods(prev => {
      const exists = prev.includes(methodName);
      let updated;
      if (exists) {
        updated = prev.filter(m => m !== methodName);
        addAuditLog('MFA_METHOD_DEACTIVATED', `${currentUser.name} - ${methodName}`, 'warning');
        triggerToast(`Disabled: ${methodName}`);
      } else {
        updated = [...prev, methodName];
        addAuditLog('MFA_METHOD_ENABLED', `${currentUser.name} - ${methodName}`, 'info');
        triggerToast(`Security Activated: ${methodName}`);
      }
      return updated;
    });
  };

  const toggleSsoProvider = (provider: 'google' | 'apple' | 'github') => {
    setSsoProviders(prev => {
      const original = prev[provider];
      const updated = { ...prev, [provider]: !original };
      addAuditLog(
        original ? 'SSO_IDENTITY_DISCONNECTED' : 'SSO_IDENTITY_FEDERATED', 
        `${currentUser.name} (${provider.toUpperCase()})`, 
        original ? 'warning' : 'info'
      );
      triggerToast(original ? `Severed link to ${provider}` : `Federated with ${provider} credential provider`);
      return updated;
    });
  };

  const revokeSessionState = (id: string, deviceName: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    addAuditLog('OAUTH_SESSION_REVOKED', `${currentUser.name} (${deviceName})`, 'warning');
    triggerToast(`Revoked credentials for active hardware device: ${deviceName}`);
  };

  const handleDeleteIdentity = () => {
    const doubleCheck = confirm(`CRITICAL WARNING: This administrative action is permanent. Deleting your centralized identity "${name}" will instantly revoke all access tokens, block SSO federations, and trigger audit alert workflows. Proceed?`);
    if (doubleCheck) {
      addAuditLog('IDENTITY_COMPLETELY_PURGED', name, 'critical');
      alert(`Identity matching ${currentUser.username} has been decoupled from the database state. You are being redirect to login.`);
      onLogout();
    }
  };

  return (
    <div className="space-y-6" id="user-profile-view">
      
      {/* Dynamic Action Toasts */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xl flex items-center gap-2 border border-gray-800 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Header Overview Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-lg border border-blue-100 uppercase">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-widest">{currentUser.name} Portal</h3>
            <p className="text-xs text-gray-400 font-medium">{currentUser.email} <span className="mx-1">•</span> <span className="font-semibold text-blue-600">{currentUser.role} Cleared</span></p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Identity Sync Secured
        </span>
      </div>

      {/* 2. Grid for Modular Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Personal Info Parameters */}
        <div className="lg:col-span-5 h-full">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] h-full flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2.5">
                <User className="h-4 w-4 text-[#2563EB]" /> Personal Identification Info
              </h4>

              <form onSubmit={handleUpdatePersonalInfo} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Official Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#2563EB] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Primary Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#2563EB] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Emergency Mobile No.</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#2563EB] font-sans"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white px-4 py-2.5 rounded-lg shadow-sm transition-all"
                  >
                    Update Identity Profile
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-gray-50 p-4 border rounded-xl mt-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Assigned Context Authorities</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="text-[9px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200">ID: {currentUser.username}</span>
                <span className="text-[9px] font-bold bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200">Role: {currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dynamic Security Context Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)]">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2.5">
              <Shield className="h-4 w-4 text-[#2563EB]" /> Security MFA & SSO Context
            </h4>

            {/* MFA Options Toggle Section */}
            <div className="space-y-3.5 mb-6">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Multi-Factor Authenticator Options</h5>
              
              <div className="space-y-2.5">
                {/* 1. TOTP Authenticator App */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/20">
                  <div className="flex gap-3">
                    <Smartphone className="h-4.5 w-4.5 text-[#2563EB] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Authenticator App Authentication (TOTP)</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Use Google Authenticator, Authy, or Folksart key providers.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMfaMethod('Time-Based Authenticator (TOTP)')}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                      mfaMethods.includes('Time-Based Authenticator (TOTP)') 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {mfaMethods.includes('Time-Based Authenticator (TOTP)') ? 'Enabled' : 'Activate'}
                  </button>
                </div>

                {/* 2. SMS Identity Verification */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/20">
                  <div className="flex gap-3">
                    <Smartphone className="h-4.5 w-4.5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Interactive SMS Identity verification</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">We will text standard OTP codes to {phone}.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMfaMethod('SMS Identity verification')}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                      mfaMethods.includes('SMS Identity verification') 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {mfaMethods.includes('SMS Identity verification') ? 'Enabled' : 'Activate'}
                  </button>
                </div>

                {/* 3. Hardware Key WebAuthn */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/20">
                  <div className="flex gap-3">
                    <Key className="h-4.5 w-4.5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">WebAuthn Hardware Security Key</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Biometrics or physical YubiKey protection standards.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMfaMethod('WebAuthn Hardware Security Key')}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                      mfaMethods.includes('WebAuthn Hardware Security Key') 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {mfaMethods.includes('WebAuthn Hardware Security Key') ? 'Enabled' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>

            {/* SSO Federated Identities List */}
            <div className="space-y-3.5 mb-2">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Humane SSO Federation Settings</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Google Provider Info */}
                <div className="border border-gray-100 p-3.5 bg-gray-50/50 rounded-xl relative overflow-hidden flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-gray-800">Google SSO</span>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${ssoProviders.google ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSsoProvider('google')}
                    className={`text-[9px] font-bold py-1.5 px-2 bg-white border rounded transition-colors text-center w-full ${ssoProviders.google ? 'text-red-600 border-red-100 hover:bg-red-50' : 'text-[#2563EB]'}`}
                  >
                    {ssoProviders.google ? 'Sever Link' : 'Federate Link'}
                  </button>
                </div>

                {/* Apple Provider Info */}
                <div className="border border-gray-100 p-3.5 bg-gray-50/50 rounded-xl relative overflow-hidden flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-gray-800">Apple SSO</span>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${ssoProviders.apple ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSsoProvider('apple')}
                    className={`text-[9px] font-bold py-1.5 px-2 bg-white border rounded transition-colors text-center w-full ${ssoProviders.apple ? 'text-red-600 border-red-100 hover:bg-red-50' : 'text-[#2563EB]'}`}
                  >
                    {ssoProviders.apple ? 'Sever Link' : 'Federate Link'}
                  </button>
                </div>

                {/* GitHub Provider Info */}
                <div className="border border-gray-100 p-3.5 bg-gray-50/50 rounded-xl relative overflow-hidden flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-gray-800">GitHub Developer</span>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${ssoProviders.github ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSsoProvider('github')}
                    className={`text-[9px] font-bold py-1.5 px-2 bg-white border rounded transition-colors text-center w-full ${ssoProviders.github ? 'text-red-600 border-red-100 hover:bg-red-50' : 'text-[#2563EB]'}`}
                  >
                    {ssoProviders.github ? 'Sever Link' : 'Federate Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Active hardware devices logins list */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)]">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2.5">
              <Laptop className="h-4 w-4 text-[#2563EB]" /> Live Authentication Sessions
            </h4>

            <div className="space-y-3">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-gray-50/50 text-xs"
                >
                  <div className="flex gap-3">
                    {session.device.includes('iPhone') || session.device.includes('Pixel') ? (
                      <Smartphone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    ) : (
                      <Laptop className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{session.device}</span>
                        {session.isCurrent && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                        <span>IP: {session.ip}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {session.location}</span>
                        <span>•</span>
                        <span>Active: {session.lastActive}</span>
                      </p>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      type="button"
                      onClick={() => revokeSessionState(session.id, session.device)}
                      className="text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-100 py-1 px-2 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Accountability Lifecycle & Destructive Action Section */}
          <div className="bg-red-50/30 border border-red-100 p-6 rounded-xl shadow-[0px_4px_20px_rgba(220,38,38,0.02)] space-y-3">
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-red-100 pb-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-600" /> Account Lifecycle Security
            </h4>
            
            <p className="text-xs text-red-700 leading-relaxed max-w-xl">
              Permanently purge Folksart database records associated with this enterprise principal. Action is irreversible and immediately logged inside decentralized audits.
            </p>

            <button
              type="button"
              id="btn-delete-identity"
              onClick={handleDeleteIdentity}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#DC2626] hover:bg-red-700 text-xs font-bold text-white py-2 px-4 shadow-sm transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Delete Identity Credentials
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
