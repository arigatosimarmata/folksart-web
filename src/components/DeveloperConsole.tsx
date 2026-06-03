import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, Info, Cpu, Cloud, Code, Loader2 } from 'lucide-react';
import { IAMUser } from '../types/iam';

interface DeveloperConsoleProps {
  selectedUser: IAMUser | null;
  currentUser: { name: string; username: string; email: string; role: string };
}

export default function DeveloperConsole({ selectedUser, currentUser }: DeveloperConsoleProps) {
  // Use either selectedUser (from admin table click) or fallback to simulated logged in user details
  const activeUser = selectedUser || {
    id: 'usr_demo_active',
    name: currentUser.name,
    username: currentUser.username,
    email: currentUser.email,
    opaqueToken: 'fol_at_3m9K2gH9u8PqX1vW9z7Y4t6C8b2N5m1K9j8H7g6F5d4S3a2',
    role: currentUser.role,
    department: 'Corporate Governance',
    kycStatus: 'Verified',
    status: 'Active'
  };

  const [copied, setCopied] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const triggerMockApiTest = () => {
    setTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setTesting(false);
      setTestResult(JSON.stringify({
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Folksart-Trace-ID': `flk_tr_${Math.random().toString(36).substr(2, 9)}`,
          'Cache-Control': 'no-store'
        },
        payload: {
          authenticated: true,
          principal: {
            uid: activeUser.id,
            name: activeUser.name,
            username: activeUser.username,
            email: activeUser.email,
            role: activeUser.role,
            permissions: activeUser.role === 'Administrator' 
              ? ['iam:read', 'iam:write', 'iam:delete', 'kyc:audit']
              : ['iam:read_profile']
          },
          session: {
            auth_factor: 'mfa_totp',
            token_ttl_seconds: 3599
          }
        }
      }, null, 2));
    }, 1200);
  };

  const cUrlCommand = `curl -X GET "/api/v1/identities/me" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer ${activeUser.opaqueToken}"`;

  const databaseOrQuery = `// Folksart Multi-Identifier Server-side Resolution
// Maps dynamic login credential with an inline OR logical fallback query
import { MongoClient } from 'mongodb';

export async function resolvePrincipal(identifier: string) {
  const query = {
    $or: [
      { username: identifier.toLowerCase().trim() },
      { email: identifier.toLowerCase().trim() },
      { phone: identifier.trim() }
    ]
  };
  
  return await db.collection('identities').findOne(query);
}`;

  return (
    <div className="space-y-6 animate-fade-in" id="developer-tools-view">
      
      {/* Overview Block */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)]">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <Terminal className="h-5 w-5 text-purple-600" /> Decentralized Integration playground
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-3xl leading-relaxed">
          Access telemetry mapping specs, verify secure HTTP authorization headers using token strategies, and check real-time server query fallback architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: cURL Testing Client & Opaque Token details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2.5">
                <Code className="h-4 w-4 text-purple-500" /> Active Token Telemetry Context
              </h4>

              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl text-xs space-y-2 text-gray-700">
                <p><span className="font-bold text-purple-800">Target Identity:</span> <span className="font-semibold text-gray-950">{activeUser.name} ({activeUser.username})</span></p>
                <p><span className="font-bold text-purple-800">Identity Directory ID:</span> <span className="font-mono text-[11px] text-gray-600">{activeUser.id}</span></p>
                <div className="pt-1">
                  <span className="font-bold text-purple-800 block mb-1">Opaque Access Bearer Token:</span>
                  <div className="font-mono text-[10px] bg-white p-2.5 rounded border border-purple-100 flex justify-between items-center break-all select-all">
                    <span>{activeUser.opaqueToken}</span>
                    <button 
                      onClick={() => copyToClipboard(activeUser.opaqueToken, 'token')}
                      className="text-purple-600 hover:text-purple-800 ml-2 h-6 w-6 flex items-center justify-center rounded hover:bg-purple-100/50"
                    >
                      {copied === 'token' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* cURL Display */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">cURL HTTP Header Schema</span>
                <div className="relative bg-gray-900 rounded-xl p-4 text-[11px] text-gray-100 font-mono overflow-x-auto">
                  <pre>{cUrlCommand}</pre>
                  <button 
                    onClick={() => copyToClipboard(cUrlCommand, 'curl')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 rounded bg-gray-800 hover:bg-gray-700"
                  >
                    {copied === 'curl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t">
              <button
                type="button"
                onClick={triggerMockApiTest}
                disabled={testing}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-75"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Executing remote verification challenge...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Send Live HTTP Authentication Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Database Query Mapping & Logs Console */}
        <div className="lg:col-span-6 space-y-6">
          {/* OR query resolution */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)]">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2.5">
              <Cpu className="h-4 w-4 text-purple-500" /> Server-side Multi-Identifier Resolution Query
            </h4>

            <p className="text-xs text-gray-500 leading-relaxed mb-3.5">
              When a candidate enters their credentials, the server runs a matching <span className="font-mono font-bold text-gray-800">$or</span> filter mapped to three system dimensions: username, email, and phone.
            </p>

            <div className="relative bg-slate-900/95 rounded-xl p-4 text-[10.5px] text-gray-200 font-mono overflow-x-auto">
              <pre>{databaseOrQuery}</pre>
              <button 
                onClick={() => copyToClipboard(databaseOrQuery, 'db')}
                className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 rounded bg-slate-800"
              >
                {copied === 'db' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Simulated API Output Shell */}
          {testResult && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] animate-slide-in">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> HTTP RESPONSE RECEIVED
              </span>
              <div className="bg-slate-950 rounded-lg p-3 text-[10px] text-emerald-400 font-mono overflow-y-auto max-h-[220px]">
                <pre>{testResult}</pre>
              </div>
            </div>
          )}

          {/* Secure validation notice */}
          {!testResult && (
            <div className="bg-purple-50/30 border border-purple-100 p-5 rounded-xl flex gap-3 text-xs leading-normal text-purple-950">
              <Cloud className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[9.5px] mb-1">Developer Notice</span>
                The platform prepares opaque token cookies configured with <code className="bg-white/80 px-1 py-0.5 rounded border">HttpOnly; Secure; SameSite=Strict</code> constraints protecting access tokens from external browser script access models.
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
