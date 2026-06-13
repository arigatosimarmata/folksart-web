import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, ClipboardCheck, User, Terminal, LogOut, 
  HelpCircle, RefreshCw, Layers, Database, UserCheck, AlertTriangle, Key,
  TrendingUp, TrendingDown, Clock, Lock, Unlock, Download, ChevronDown, ChevronUp,
  Settings2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, BarChart, Bar, XAxis, Cell } from 'recharts';
import { AnimatePresence, motion } from 'motion/react';
import { IAMUser, AuditLog } from './types/iam';
import { INITIAL_USERS, INITIAL_AUDIT_LOGS } from './data/mockData';

// Subcomponents imports
import Gateway from './components/Gateway';
import AdminConsole from './components/AdminConsole';
import KYCHub from './components/KYCHub';
import UserProfile from './components/UserProfile';
import DeveloperConsole from './components/DeveloperConsole';

const ROLE_AVERAGES: Record<string, number> = {
  'Administrator': 120,    // 2 minutes
  'Security Officer': 90,  // 1.5 minutes
  'End User': 300,         // 5 minutes
  'Operator': 150,         // 2.5 minutes
  'Anonymous': 45,         // 45 seconds
};

const TAB_NAMES: Record<string, string> = {
  admin: 'Corporate Pool',
  kyc: 'KYC Compliance Hub',
  user: 'Security Context',
  developer: 'Developer Sandbox',
  gateway: 'Auth Gateway'
};

export default function App() {
  // System State
  const [users, setUsers] = useState<IAMUser[]>(() => {
    const local = localStorage.getItem('folksart_users');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length >= 60) {
          return parsed;
        }
      } catch (e) {
        // Fallback to initial
      }
    }
    localStorage.setItem('folksart_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  });

  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    role: true,
    department: true,
    status: true,
    kyc: true,
    risk: true,
  });
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const local = localStorage.getItem('folksart_audit');
    return local ? JSON.parse(local) : INITIAL_AUDIT_LOGS;
  });

  // Default logged in user for immediate experience
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    username: string;
    email: string;
    role: string;
  } | null>(() => {
    const local = localStorage.getItem('folksart_auth');
    if (local) return JSON.parse(local);
    // Standard starting user: Clara Oswald (Admin)
    return {
      name: 'Clara Oswald',
      username: 'coswald',
      email: 'clara.oswald@folksart.io',
      role: 'Administrator'
    };
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return currentUser ? 'admin' : 'gateway';
  });

  const [selectedUserForInspection, setSelectedUserForInspection] = useState<IAMUser | null>(null);

  // Session tracking and login timestamps for simulated personas
  const [sessionDurations, setSessionDurations] = useState<Record<string, number>>(() => {
    const local = localStorage.getItem('folksart_persona_durations');
    return local ? JSON.parse(local) : {
      coswald: 145,
      mvance: 62,
      erostova: 320,
      anonymous: 0
    };
  });

  const [previousSessionDurations, setPreviousSessionDurations] = useState<Record<string, number>>(() => {
    const local = localStorage.getItem('folksart_previous_durations');
    return local ? JSON.parse(local) : {
      coswald: 180,
      mvance: 45,
      erostova: 210,
      anonymous: 15
    };
  });

  const [sessionHistory, setSessionHistory] = useState<Record<string, number[]>>(() => {
    const local = localStorage.getItem('folksart_session_history');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return {
      coswald: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
      mvance: [17, 22, 27, 32, 37, 42, 47, 52, 57, 62],
      erostova: [275, 280, 285, 290, 295, 300, 305, 310, 315, 320],
      anonymous: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
  });

  const [tabDurations, setTabDurations] = useState<Record<string, Record<string, number>>>(() => {
    const local = localStorage.getItem('folksart_persona_tab_durations');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return {
      coswald: { admin: 90, kyc: 25, user: 15, developer: 15 },
      mvance: { admin: 30, kyc: 20, user: 12, developer: 0 },
      erostova: { admin: 0, kyc: 120, user: 150, developer: 50 },
      anonymous: { gateway: 0, developer: 0 }
    };
  });

  const [lastLogins, setLastLogins] = useState<Record<string, string>>(() => {
    const local = localStorage.getItem('folksart_persona_logins');
    return local ? JSON.parse(local) : {
      coswald: '2026-06-03 18:30:12',
      mvance: '2026-06-03 16:15:30',
      erostova: '2026-06-03 19:40:00',
      anonymous: 'None'
    };
  });

  const [chartView, setChartView] = useState<'growth' | 'allocation'>('growth');

  const [isPersonaLocked, setIsPersonaLocked] = useState<boolean>(() => {
    return localStorage.getItem('folksart_persona_locked') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('folksart_persona_locked', isPersonaLocked ? 'true' : 'false');
  }, [isPersonaLocked]);

  const [isSummaryCardCollapsed, setIsSummaryCardCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('folksart_summary_card_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('folksart_summary_card_collapsed', isSummaryCardCollapsed ? 'true' : 'false');
  }, [isSummaryCardCollapsed]);

  const [avatarError, setAvatarError] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setAvatarError(false);
    setIsProfileMenuOpen(false);
  }, [currentUser]);

  // Sync state to LocalStorage for persistence across loads
  useEffect(() => {
    localStorage.setItem('folksart_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('folksart_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('folksart_auth', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('folksart_auth');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('folksart_persona_durations', JSON.stringify(sessionDurations));
  }, [sessionDurations]);

  useEffect(() => {
    localStorage.setItem('folksart_persona_tab_durations', JSON.stringify(tabDurations));
  }, [tabDurations]);

  useEffect(() => {
    localStorage.setItem('folksart_persona_logins', JSON.stringify(lastLogins));
  }, [lastLogins]);

  useEffect(() => {
    localStorage.setItem('folksart_previous_durations', JSON.stringify(previousSessionDurations));
  }, [previousSessionDurations]);

  useEffect(() => {
    localStorage.setItem('folksart_session_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Real-time ticking for the active session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const activeKey = currentUser ? currentUser.username : 'anonymous';
      
      setSessionDurations(prev => {
        const nextDur = (prev[activeKey] || 0) + 1;
        
        // Also update the session history
        setSessionHistory(histPrev => {
          const arr = histPrev[activeKey] ? [...histPrev[activeKey]] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          // Update the last element to the current duration (nextDur)
          arr[arr.length - 1] = nextDur;
          
          // Every 10 seconds, shift the history left and append a copy of the final duration
          // This creates a beautiful dynamic "rolling" movement of the sparkline chart
          if (nextDur % 10 === 0 && nextDur > 0) {
            arr.shift();
            arr.push(nextDur);
          }
          
          return {
            ...histPrev,
            [activeKey]: arr
          };
        });

        return {
          ...prev,
          [activeKey]: nextDur
        };
      });

      setTabDurations(prev => {
        const userTabs = prev[activeKey] || {};
        return {
          ...prev,
          [activeKey]: {
            ...userTabs,
            [activeTab]: (userTabs[activeTab] || 0) + 1
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser, activeTab]);

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Threshold tracking for the active persona vs role threshold average
  const activeRole = currentUser ? currentUser.role : 'Anonymous';
  const averageForRole = ROLE_AVERAGES[activeRole] || 120;
  const currentDuration = sessionDurations[currentUser ? currentUser.username : 'anonymous'] || 0;
  const isLongerThanAverage = currentDuration > averageForRole;
  const isApproachingTimeout = currentDuration > (averageForRole * 0.8);

  const activeKeyForHistory = currentUser ? currentUser.username : 'anonymous';
  const historyPoints = sessionHistory[activeKeyForHistory] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const sparklineData = historyPoints.map((val, idx) => ({
    index: idx,
    duration: val,
    formatted: formatDuration(val)
  }));

  const barChartData = Object.entries(TAB_NAMES).map(([key, label]) => {
    const activeKey = currentUser ? currentUser.username : 'anonymous';
    const userTabs = tabDurations[activeKey] || {};
    const secs = userTabs[key] || 0;
    return {
      name: label,
      duration: secs,
      shortName: key === 'admin' ? 'Corp' : key === 'kyc' ? 'KYC' : key === 'user' ? 'Sec' : key === 'developer' ? 'Dev' : 'Gate',
      fillColor: key === 'admin' ? '#3B82F6' :
                 key === 'kyc' ? '#8B5CF6' :
                 key === 'user' ? '#10B981' :
                 key === 'developer' ? '#6366F1' :
                 '#F59E0B'
    };
  });

  const previousDuration = previousSessionDurations[currentUser ? currentUser.username : 'anonymous'] || 0;
  const sessionDiff = currentDuration - previousDuration;

  const formatDiff = (diffInSeconds: number): string => {
    const abs = Math.abs(diffInSeconds);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const timeStr = m > 0 ? `${m}m ${s < 10 ? '0' : ''}${s}s` : `${s}s`;
    return `${diffInSeconds > 0 ? '+' : '-'}${timeStr}`;
  };

  // Command to append to live audit trailing stream
  const addAuditLog = (action: string, targetName: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newLog: AuditLog = {
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? currentUser.name : 'Unauthenticated Gateway',
      action,
      target: targetName,
      ipAddress: '192.168.1.134',
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'a':
            if (currentUser && (currentUser.role === 'Administrator' || currentUser.role === 'Security Officer')) {
              setActiveTab('admin');
              addAuditLog('NAVIGATION_SHORTCUT', 'Switched to Enrolled Corporate Pool (Alt+A)', 'info');
            }
            break;
          case 'k':
            if (currentUser) {
              setActiveTab('kyc');
              addAuditLog('NAVIGATION_SHORTCUT', 'Switched to KYC Verification Hub (Alt+K)', 'info');
            }
            break;
          case 'u':
            if (currentUser) {
              setActiveTab('user');
              addAuditLog('NAVIGATION_SHORTCUT', 'Switched to Identity Security Context (Alt+U)', 'info');
            }
            break;
          case 'd':
            setActiveTab('developer');
            addAuditLog('NAVIGATION_SHORTCUT', 'Switched to Developer Playground (Alt+D)', 'info');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, addAuditLog]);

  // Helper action for updating an user parameters
  const handleUpdateUser = (updatedUser: IAMUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    // Sync active profile if edited user is same
    if (currentUser && updatedUser.username === currentUser.username) {
      setCurrentUser({
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      });
    }
  };

  const handleAddUser = (newUser: IAMUser) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleResetSession = () => {
    const activeKey = currentUser ? currentUser.username : 'anonymous';
    setSessionDurations(prev => ({
      ...prev,
      [activeKey]: 0
    }));
    setTabDurations(prev => ({
      ...prev,
      [activeKey]: {}
    }));
    setSessionHistory(prev => ({
      ...prev,
      [activeKey]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }));
    addAuditLog('SIMULATOR_SESSION_RESET', currentUser ? currentUser.name : 'Anonymous Visitor', 'info');
  };

  const handleLogout = () => {
    const oldKey = currentUser ? currentUser.username : 'anonymous';
    const oldSecs = sessionDurations[oldKey] || 0;
    
    // Save current active session of the old user as previous
    setPreviousSessionDurations(prev => ({
      ...prev,
      [oldKey]: oldSecs
    }));
    
    // Reset durations
    setSessionDurations(prev => ({
      ...prev,
      [oldKey]: 0,
      anonymous: 0
    }));

    // Reset histories
    setSessionHistory(prev => ({
      ...prev,
      [oldKey]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      anonymous: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }));

    addAuditLog('ACCESS_LOGOUT', currentUser?.name || 'Session', 'info');
    setCurrentUser(null);
    setActiveTab('gateway');
  };

  const handleLoginSuccess = (user: { name: string; username: string; email: string; role: string }) => {
    // Before logging in, save anonymous duration
    const anonSecs = sessionDurations['anonymous'] || 0;
    setPreviousSessionDurations(prev => ({
      ...prev,
      anonymous: anonSecs
    }));

    // Reset durations
    setSessionDurations(prev => ({
      ...prev,
      anonymous: 0,
      [user.username]: 0
    }));

    // Reset histories
    setSessionHistory(prev => ({
      ...prev,
      anonymous: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [user.username]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }));

    setCurrentUser(user);
    addAuditLog('ACCESS_MUTUAL_AUTH_GRANTED', user.name, 'info');
    
    // Update login timestamp
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLastLogins(prev => ({
      ...prev,
      [user.username]: nowStr
    }));
    
    // Select default screen depending on role
    if (user.role === 'Administrator' || user.role === 'Security Officer') {
      setActiveTab('admin');
    } else {
      setActiveTab('user');
    }
  };

  // Switch simulation identities directly
  const triggerSimulatePersona = (persona: 'admin' | 'officer' | 'user' | 'anonymous') => {
    if (isPersonaLocked) {
      addAuditLog('SIMULATOR_SWITCH_BLOCKED', `Blocked attempt to switch identity to ${persona} - context is currently locked`, 'warning');
      return;
    }

    if (persona === 'anonymous') {
      handleLogout();
      return;
    }

    const oldKey = currentUser ? currentUser.username : 'anonymous';
    const oldSecs = sessionDurations[oldKey] || 0;
    
    // Save current active session of the old user as previous
    setPreviousSessionDurations(prev => ({
      ...prev,
      [oldKey]: oldSecs
    }));

    let fakeUser = {
      name: 'Clara Oswald',
      username: 'coswald',
      email: 'clara.oswald@folksart.io',
      role: 'Administrator'
    };

    if (persona === 'officer') {
      fakeUser = {
        name: 'Marcus Vance',
        username: 'mvance',
        email: 'marcus.vance@folksart.io',
        role: 'Security Officer'
      };
    } else if (persona === 'user') {
      fakeUser = {
        name: 'Elena Rostova',
        username: 'erostova',
        email: 'elena.rostova@gmail.com',
        role: 'End User'
      };
    }

    // Reset old session and initialize new persona session to 0
    setSessionDurations(prev => ({
      ...prev,
      [oldKey]: 0,
      [fakeUser.username]: 0
    }));

    // Reset histories for old and new personas
    setSessionHistory(prev => ({
      ...prev,
      [oldKey]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [fakeUser.username]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }));

    setCurrentUser(fakeUser);
    addAuditLog('SIMULATOR_PERSONA_OVERRIDE', fakeUser.name, 'info');
    
    // Update login timestamp when persona is simulated/switched
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLastLogins(prev => ({
      ...prev,
      [fakeUser.username]: nowStr
    }));
    
    if (persona === 'user') {
      setActiveTab('user');
    } else {
      setActiveTab('admin');
    }
  };

  const handleInspectUserDevConsole = (user: IAMUser) => {
    setSelectedUserForInspection(user);
    setActiveTab('developer');
  };

  const resetAllDemoData = () => {
    if (confirm('Re-initialize Folksart database states to default mock records?')) {
      localStorage.removeItem('folksart_users');
      localStorage.removeItem('folksart_audit');
      localStorage.removeItem('folksart_auth');
      localStorage.removeItem('folksart_persona_durations');
      localStorage.removeItem('folksart_persona_tab_durations');
      localStorage.removeItem('folksart_persona_logins');
      localStorage.removeItem('folksart_previous_durations');
      localStorage.removeItem('folksart_session_history');
      localStorage.removeItem('folksart_persona_locked');
      setIsPersonaLocked(false);
      setUsers(INITIAL_USERS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setSessionDurations({
        coswald: 145,
        mvance: 62,
        erostova: 320,
        anonymous: 0
      });
      setPreviousSessionDurations({
        coswald: 180,
        mvance: 45,
        erostova: 210,
        anonymous: 15
      });
      setSessionHistory({
        coswald: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145],
        mvance: [17, 22, 27, 32, 37, 42, 47, 52, 57, 62],
        erostova: [275, 280, 285, 290, 295, 300, 305, 310, 315, 320],
        anonymous: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      });
      setTabDurations({
        coswald: { admin: 90, kyc: 25, user: 15, developer: 15 },
        mvance: { admin: 30, kyc: 20, user: 12, developer: 0 },
        erostova: { admin: 0, kyc: 120, user: 150, developer: 50 },
        anonymous: { gateway: 0, developer: 0 }
      });
      setLastLogins({
        coswald: '2026-06-03 18:30:12',
        mvance: '2026-06-03 16:15:30',
        erostova: '2026-06-03 19:40:00',
        anonymous: 'None'
      });
      setCurrentUser({
        name: 'Clara Oswald',
        username: 'coswald',
        email: 'clara.oswald@folksart.io',
        role: 'Administrator'
      });
      setActiveTab('admin');
    }
  };

  const handleCaptureState = () => {
    try {
      const activeUsername = currentUser ? currentUser.username : 'anonymous';
      const payloadObj = {
        meta: {
          app: "Folksart IAM Audit Suite",
          exportedAt: new Date().toISOString(),
          activePersona: currentUser ? currentUser : {
            name: 'Anonymous Visitor',
            username: 'anonymous',
            email: 'anonymous@folksart.io',
            role: 'Anonymous'
          },
          isPersonaSelectionLocked: isPersonaLocked,
        },
        metrics: {
          sessionDurations,
          previousSessionDurations,
          sessionHistory,
          tabDurations,
          tabAllocationRatio: tabDurations[activeUsername] || {},
          lastLogins,
        },
        auditLogs: auditLogs
      };

      const jsonStr = JSON.stringify(payloadObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `folksart-iam-audit-${activeUsername}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addAuditLog('AUDIT_STATE_CAPTURED', `Exported session audit metrics for ${currentUser?.name || 'Anonymous Visitor'}`, 'info');
    } catch (error) {
      console.error("Failed to capture state JSON:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900" id="folksart-applet">
      
      {/* Dynamic Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] flex border border-blue-100">
            <Shield className="h-5 w-5" id="nav-shield-logo" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-gray-900">Folksart</span>
              <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">IAM</span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Humane Identity Architecture</p>
          </div>
        </div>

        {/* Global Directory Indicators */}
        <div className="hidden md:flex items-center gap-5 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5 text-gray-400" />
            Active Pool: <strong className="text-gray-700">Centralized Org</strong>
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-gray-400" />
            Integrates: <strong className="text-gray-700">Opaque Access Bearer</strong>
          </span>
        </div>

        {/* Active credentials overview */}
        <div className="flex items-center gap-3 relative">
          {currentUser ? (
            <div className="flex items-center gap-3 relative">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-950">{currentUser.name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider leading-none mt-0.5">{currentUser.role}</p>
              </div>
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-8.5 w-8.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100 font-bold text-sm tracking-wider flex items-center justify-center uppercase select-all cursor-pointer transition-all hover:bg-blue-100 hover:border-blue-200 active:scale-95 hover:shadow-xs outline-hidden shrink-0 select-none"
                title="Click to view services and profile menu"
              >
                {currentUser.name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                title="De-authorize and Exit Profile"
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors border border-gray-100"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Profile Menu Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    {/* Transparent Click-outside Backdrop */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent cursor-default" 
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-11 z-50 w-64 bg-white border border-gray-200/85 rounded-xl shadow-lg p-3.5 space-y-3.5 text-left"
                      id="profile-dropdown-menu"
                    >
                      {/* Section 1: User Profile Context */}
                      <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
                        <div className="h-9 w-9 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100 font-extrabold text-sm tracking-wider flex items-center justify-center uppercase select-none">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-gray-900 truncate leading-tight">{currentUser.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold truncate leading-tight mt-0.5">{currentUser.email}</p>
                          <span className="inline-flex mt-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase bg-blue-50 text-[#2563EB] border border-blue-100">
                            {currentUser.role}
                          </span>
                        </div>
                      </div>

                      {/* Section 2: Expandable Service List */}
                      <div>
                        <span className="block text-[8px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                          Role-Based Services & Navigation
                        </span>
                        <div className="space-y-1">
                          {/* Corporate Pool Service */}
                          {(currentUser.role === 'Administrator' || currentUser.role === 'Security Officer') && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('admin');
                                setIsProfileMenuOpen(false);
                              }}
                              className={`w-full text-left text-[11px] font-bold py-1.5 px-2 rounded-md border flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'admin'
                                  ? 'bg-blue-50/70 border-blue-100 text-[#2563EB]'
                                  : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              <span className="truncate">Enrolled Corporate Pool</span>
                            </button>
                          )}

                          {/* KYC Compliance Hub */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('kyc');
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full text-left text-[11px] font-bold py-1.5 px-2 rounded-md border flex items-center gap-2 transition-all cursor-pointer ${
                              activeTab === 'kyc'
                                ? 'bg-blue-50/70 border-blue-100 text-[#2563EB]'
                                : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="truncate">KYC Compliance Hub</span>
                          </button>

                          {/* Self Profile Settings */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('user');
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full text-left text-[11px] font-bold py-1.5 px-2 rounded-md border flex items-center gap-2 transition-all cursor-pointer ${
                              activeTab === 'user'
                                ? 'bg-blue-50/70 border-blue-100 text-[#2563EB]'
                                : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <User className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="truncate">Personal Profile Console</span>
                          </button>
                        </div>
                      </div>

                      {/* Section 3: Run-Time Audit Analytics */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1">
                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Context Diagnostics
                        </span>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-500 font-medium">Active-Time</span>
                          <span className="font-mono font-bold text-gray-800">{formatDuration(currentDuration)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-500 font-medium">Gateway Lock</span>
                          <span className={`font-bold flex items-center gap-0.5 ${isPersonaLocked ? 'text-blue-600 font-extrabold' : 'text-gray-400 font-medium'}`}>
                            {isPersonaLocked ? <Lock className="h-2 w-2 text-blue-500" /> : <Unlock className="h-2 w-2 text-slate-400" />}
                            {isPersonaLocked ? 'LOCKED' : 'UNLOCKED'}
                          </span>
                        </div>
                      </div>

                      {/* Section 4: System Action */}
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left text-[11px] font-extrabold p-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 hover:text-red-700 flex items-center justify-between transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <LogOut className="h-3.5 w-3.5 shrink-0" />
                            <span>Sign Out Profile</span>
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
              ● Unauthenticated Session
            </span>
          )}
        </div>
      </header>

      {/* Main Core View Area with Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* --- LEFT SIDE NAVIGATION FRAME --- */}
        <aside className="w-full md:w-[270px] bg-white border-b md:border-b-0 md:border-r border-gray-100 p-5 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Menu Navigation</span>
              <nav className="space-y-1" id="side-navigation">
                {/* 1. Admin Control Panel (Depends on Auth block) */}
                {currentUser && (currentUser.role === 'Administrator' || currentUser.role === 'Security Officer') && (
                  <div className="relative">
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`relative w-full flex items-center justify-between text-xs font-bold py-2.5 px-3 rounded-lg border transition-all ${
                        activeTab === 'admin' 
                          ? 'bg-blue-50/50 border-blue-100 text-[#2563EB]' 
                          : 'border-transparent text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {activeTab === 'admin' && (
                        <motion.div
                          layoutId="side-nav-indicator"
                          className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#2563EB] rounded-r-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="flex items-center gap-2.5">
                        <Users className="h-4 w-4 shrink-0" />
                        <span className="flex items-baseline gap-1.5">
                          Enrolled Corporate Pool
                          <span className="text-[8px] opacity-40 font-mono tracking-tighter">Alt+A</span>
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5 relative z-10">
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 font-semibold">{users.length}</span>
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsColumnSettingsOpen(!isColumnSettingsOpen);
                          }}
                          id="admin-column-settings-toggle"
                          className={`p-1 rounded hover:bg-blue-100 transition-colors cursor-pointer ${isColumnSettingsOpen ? 'text-[#2563EB] bg-blue-100' : 'text-gray-400'}`}
                          title="Table column visibility"
                        >
                          <Settings2 className="h-3 w-3" />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isColumnSettingsOpen && (
                        <motion.div
                          initial={{ opacity: 0, x: -10, scale: 0.95 }}
                          animate={{ opacity: 1, x: 10, scale: 1 }}
                          exit={{ opacity: 0, x: -10, scale: 0.95 }}
                          className="absolute left-full top-0 ml-2 z-[60] w-44 bg-white border border-gray-100 shadow-2xl rounded-xl p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Column Layout</h5>
                            <button onClick={() => setIsColumnSettingsOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                              <RefreshCw className="h-2.5 w-2.5" onClick={() => setVisibleColumns({
                                email: true, role: true, department: true, status: true, kyc: true, risk: true
                              })} />
                            </button>
                          </div>
                          <div className="space-y-1">
                            {Object.entries(visibleColumns).map(([key, val]) => (
                               <label key={key} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer transition-colors group">
                                 <input 
                                   type="checkbox" 
                                   checked={val} 
                                   onChange={() => setVisibleColumns(prev => ({...prev, [key]: !prev[key] as any}))}
                                   className="rounded border-gray-300 text-[#2563EB] focus:ring-blue-500 h-3 w-3 transition-all cursor-pointer"
                                 />
                                 <span className="text-[10px] font-bold text-gray-600 group-hover:text-gray-900 capitalize select-none">{key}</span>
                               </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 2. KYC Compliance Terminal */}
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('kyc')}
                    className={`relative w-full flex items-center gap-2.5 text-xs font-bold py-2.5 px-3 rounded-lg border transition-all ${
                      activeTab === 'kyc' 
                        ? 'bg-blue-50/50 border-blue-100 text-[#2563EB]' 
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'kyc' && (
                      <motion.div
                        layoutId="side-nav-indicator"
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#2563EB] rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <ClipboardCheck className="h-4 w-4 shrink-0" />
                    <span className="flex items-baseline gap-1.5">
                      KYC Verification Hub
                      <span className="text-[8px] opacity-40 font-mono tracking-tighter">Alt+K</span>
                    </span>
                  </button>
                )}

                {/* 3. Self profile properties settings */}
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('user')}
                    className={`relative w-full flex items-center gap-2.5 text-xs font-bold py-2.5 px-3 rounded-lg border transition-all ${
                      activeTab === 'user' 
                        ? 'bg-blue-50/50 border-blue-100 text-[#2563EB]' 
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'user' && (
                      <motion.div
                        layoutId="side-nav-indicator"
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#2563EB] rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <User className="h-4 w-4 shrink-0" />
                    <span className="flex items-baseline gap-1.5">
                      Identity Security Context
                      <span className="text-[8px] opacity-40 font-mono tracking-tighter">Alt+U</span>
                    </span>
                  </button>
                )}

                {/* 4. Integration Sandbox Playground */}
                <button
                  onClick={() => setActiveTab('developer')}
                  className={`relative w-full flex items-center justify-between text-xs font-bold py-2.5 px-3 rounded-lg border transition-all ${
                    activeTab === 'developer' 
                      ? 'bg-blue-50/50 border-blue-100 text-[#2563EB]' 
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {activeTab === 'developer' && (
                    <motion.div
                      layoutId="side-nav-indicator"
                      className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#2563EB] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="flex items-center gap-2.5">
                    <Terminal className="h-4 w-4 shrink-0" />
                    <span className="flex items-baseline gap-1.5">
                      Developer Playground
                      <span className="text-[8px] opacity-40 font-mono tracking-tighter">Alt+D</span>
                    </span>
                  </span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Live</span>
                </button>

                {/* 5. Access Gateway screen */}
                {!currentUser && (
                  <button
                    onClick={() => setActiveTab('gateway')}
                    className={`w-full flex items-center gap-2.5 text-xs font-bold py-2.5 px-3 rounded-lg border transition-all ${
                      activeTab === 'gateway' 
                        ? 'bg-blue-50/50 border-blue-100 text-[#2563EB]' 
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Key className="h-4 w-4 shrink-0" />
                    Authentication Gateway
                  </button>
                )}
              </nav>
            </div>

            {/* --- INSTANT EVALUATION CONTROLLER --- */}
            <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-3" id="simulation-box">
              <div>
                <span className="block text-[9px] font-extrabold text-blue-900 uppercase tracking-widest">Simulator Controller</span>
                <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Quickly hot-patch identities to evaluate separate access clearances immediately.</p>
              </div>

              {/* Active simulated persona statistics summary header */}
              <div 
                className={`bg-white border rounded-lg p-2.5 space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 ${
                  isApproachingTimeout 
                    ? 'border-amber-300 ring-4 ring-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)] bg-amber-50/10' 
                    : isPersonaLocked
                    ? 'border-blue-400 ring-4 ring-blue-500/5 bg-slate-50/30'
                    : 'border-gray-100'
                }`} 
                id="simulation-summary-card"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div 
                    className="flex items-start gap-2 min-w-0 flex-1 select-none transition-all duration-150"
                  >
                    {/* Persona Progress Ring Icon */}
                    <div className="relative flex items-center justify-center h-8 w-8 shrink-0 select-none" title={`Session Utilization: ${Math.round(Math.min(100, (currentDuration / averageForRole) * 100))}%`}>
                      <svg className="absolute -rotate-90 w-8 h-8" viewBox="0 0 32 32">
                        <circle
                          cx="16"
                          cy="16"
                          r="13.5"
                          fill="transparent"
                          stroke="#F1F5F9"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="13.5"
                          fill="transparent"
                          stroke={isLongerThanAverage ? '#EF4444' : isApproachingTimeout ? '#F59E0B' : '#3B82F6'}
                          strokeWidth="2.5"
                          strokeDasharray={2 * Math.PI * 13.5}
                          strokeDashoffset={(2 * Math.PI * 13.5) - (Math.min(100, (currentDuration / averageForRole) * 100) / 100) * (2 * Math.PI * 13.5)}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="relative h-5.5 w-5.5 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 border border-slate-200/50 shadow-inner">
                        {currentUser && currentUser.avatar && !avatarError ? (
                          <img 
                            src={currentUser.avatar} 
                            alt={currentUser.name} 
                            className="h-full w-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <svg viewBox="0 0 32 32" className="h-full w-full text-slate-400 bg-slate-100 flex items-center justify-center" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" fill="#F1F5F9" />
                            <path d="M16 18c-4.97 0-9 4.03-9 9 0 .55.45 1 1 1h16c.55 0 1-.45 1-1 0-4.97-4.03-9-9-9z" fill="#94A3B8" />
                            <circle cx="16" cy="11" r="5" fill="#64748B" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="block text-[8px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <span>Active Persona</span>
                      </span>
                      <p className="text-[11px] font-bold text-gray-900 tracking-tight truncate flex items-center gap-1">
                        <span>{currentUser ? currentUser.name : 'Anonymous Visitor'}</span>
                        <span className="text-[9px] text-gray-400 font-normal">
                          {isSummaryCardCollapsed ? '(click to expand)' : ''}
                        </span>
                      </p>
                      
                      {/* Stack for Role and Security Control */}
                      <div className="flex flex-col gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Role Badge (e.g., Security Officer, Administrator) */}
                        <div>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase border leading-none inline-block ${
                            isApproachingTimeout
                              ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                              : currentUser?.role === 'Administrator' ? 'bg-blue-50 text-[#2563EB] border-[#DBEAFE]' :
                                currentUser?.role === 'Security Officer' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                currentUser?.role === 'End User' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {currentUser ? currentUser.role : 'Anonymous'}
                          </span>
                        </div>

                        {/* Interactive Lock Controls (Button and Status Span side-by-side below Role) */}
                        <div className="flex items-center gap-1.5">
                          {/* Lock Toggle Button */}
                          <button
                            type="button"
                            id="toggle-persona-lock-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextVal = !isPersonaLocked;
                              setIsPersonaLocked(nextVal);
                              addAuditLog(
                                nextVal ? 'SIMULATOR_PERSONA_LOCKED' : 'SIMULATOR_PERSONA_UNLOCKED',
                                currentUser ? currentUser.name : 'Anonymous Visitor',
                                nextVal ? 'warning' : 'info'
                              );
                            }}
                            className={`h-5 w-5 rounded border transition-all cursor-pointer flex items-center justify-center shrink-0 p-0 ${
                              isPersonaLocked
                                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                            title={isPersonaLocked ? "Unlock Persona Selection" : "Lock Persona Selection"}
                          >
                            {isPersonaLocked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
                          </button>

                          {/* Lock Status Span */}
                          <span className={`h-5 text-[8px] font-extrabold px-2 py-0 rounded tracking-wide uppercase border flex items-center justify-center leading-none shrink-0 ${
                            isPersonaLocked
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {isPersonaLocked ? 'Locked' : 'Unlocked'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 shrink-0 pt-0.5">
                    {/* Action Buttons Hub (Only contains simple, clean buttons now to prevent layout overflow) */}
                    <div className="flex items-center gap-1">
                      {/* Collapsible Accordion Toggle Button */}
                      <button
                        type="button"
                        id="toggle-summary-collapse-btn"
                        onClick={() => setIsSummaryCardCollapsed(!isSummaryCardCollapsed)}
                        className={`p-1 rounded border transition-all cursor-pointer flex items-center justify-center ${
                          isSummaryCardCollapsed
                            ? 'bg-blue-50/55 border-blue-100 text-blue-600 hover:bg-blue-100'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isSummaryCardCollapsed ? "Expand detailed statistics" : "Collapse detailed statistics"}
                      >
                        {isSummaryCardCollapsed ? <ChevronDown className="h-2.5 w-2.5 animate-bounce-slow" /> : <ChevronUp className="h-2.5 w-2.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Accordion Container */}
                <AnimatePresence initial={false}>
                  {!isSummaryCardCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden space-y-2 pt-2 border-t border-gray-100"
                    >
                      {isApproachingTimeout && (
                        <div className="bg-amber-50/90 border border-amber-200/60 rounded-md p-1.5 text-amber-900 text-[10px] space-y-0.5 shadow-3xs animate-pulse">
                          <div className="flex items-center gap-1 font-extrabold text-[9px] text-amber-800">
                            <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                            <span>SESSION TIMEOUT WARNING</span>
                          </div>
                          <p className="text-[8.5px] text-amber-700 leading-tight">
                            Run-time has reached over 80% of the role average limit ({formatDuration(averageForRole)}). Real-time authentication gateway may expire.
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="min-w-0">
                          <span className="block text-[8px] text-gray-400 font-extrabold uppercase tracking-wider leading-none">Last Login</span>
                          <span className="font-mono text-gray-600 font-semibold block mt-1 truncate" title={currentUser ? lastLogins[currentUser.username] || 'Never' : 'N/A'}>
                            {currentUser ? lastLogins[currentUser.username] || 'Never' : 'N/A'}
                          </span>
                        </div>
                        <div className="relative group cursor-help">
                          <span className="block text-[8px] text-gray-400 font-extrabold uppercase tracking-wider leading-none">Session Run-Time</span>
                          <span className="font-mono text-blue-600 font-extrabold block mt-1 flex items-center gap-1.5 flex-wrap">
                            <span>{formatDuration(currentDuration)}</span>
                            <AnimatePresence mode="wait">
                              {isLongerThanAverage ? (
                                <motion.span 
                                  key="longer"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="inline-flex items-center text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1 py-0.5 text-[8px] font-extrabold gap-0.5 shadow-sm" 
                                  title={`Above ${activeRole} avg of ${formatDuration(averageForRole)}`}
                                >
                                  <TrendingUp className="h-2.5 w-2.5" />
                                  <span>Longer</span>
                                </motion.span>
                              ) : (
                                <motion.span 
                                  key="normal"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="inline-flex items-center text-gray-500 bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-[8px] font-bold gap-0.5" 
                                  title={`Within ${activeRole} avg of ${formatDuration(averageForRole)}`}
                                >
                                  <TrendingDown className="h-2.5 w-2.5" />
                                  <span>Normal</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>

                          {/* Detailed hover tab breakdown tooltip */}
                          <div className="absolute z-50 w-64 p-3.5 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 bottom-full right-0 mb-2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-full md:ml-3 md:mb-0">
                            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 mb-2.5">
                              <Clock className="h-3.5 w-3.5 text-blue-400" />
                              <span className="text-[10px] font-extrabold tracking-tight text-white uppercase">Tab Time Allocation</span>
                            </div>
                            <div className="space-y-2.5">
                              {Object.entries(TAB_NAMES).map(([key, label]) => {
                                const activeKey = currentUser ? currentUser.username : 'anonymous';
                                const userTabs = tabDurations[activeKey] || {};
                                const secs = userTabs[key] || 0;
                                
                                // Only render active screen tab or tabs with elapsed focus time
                                if (secs === 0 && key !== activeTab) return null;
                                
                                const percentage = currentDuration > 0 ? Math.round((secs / currentDuration) * 100) : 0;
                                const isCurrentlyActive = key === activeTab;
                                
                                const barColor = 
                                  key === 'admin' ? 'bg-blue-500' :
                                  key === 'kyc' ? 'bg-purple-500' :
                                  key === 'user' ? 'bg-emerald-500' :
                                  key === 'developer' ? 'bg-indigo-500' :
                                  'bg-amber-500';

                                return (
                                  <div key={key} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] leading-tight font-medium text-slate-300">
                                      <span className="flex items-center gap-1 truncate font-semibold">
                                        {isCurrentlyActive && (
                                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                        )}
                                        <span className={isCurrentlyActive ? 'text-white font-bold' : 'text-slate-300'}>{label}</span>
                                      </span>
                                      <span className={`font-mono text-[9px] shrink-0 font-semibold ${isCurrentlyActive ? 'text-blue-300' : 'text-slate-400'}`}>
                                        {formatDuration(secs)} ({percentage}%)
                                      </span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${barColor} rounded-full transition-all duration-300`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-800 text-[8px] text-slate-400 flex items-center justify-between font-extrabold uppercase tracking-wider">
                              <span>Total Tracked</span>
                              <span className="font-mono text-blue-400">{formatDuration(currentDuration)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Session Analytics Chart (Sparkline vs. Tab Allocation Toggle) */}
                      <div className="py-2 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <span className="block text-[8px] text-gray-400 font-extrabold uppercase tracking-wider leading-none">
                            {chartView === 'growth' ? '10-Min Session Growth' : 'Focus Allocation'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[8px]">
                            <span className="font-mono text-blue-600 font-extrabold leading-none shrink-0">
                              {chartView === 'growth' 
                                ? (sparklineData[0]?.duration ? `+${Math.round(((currentDuration - sparklineData[0].duration) / Math.max(1, sparklineData[0].duration)) * 100)}%` : 'Active')
                                : 'Tab Ratio'
                              }
                            </span>
                            <button
                              type="button"
                              id="toggle-chart-view-btn"
                              onClick={() => setChartView(prev => prev === 'growth' ? 'allocation' : 'growth')}
                              className="text-blue-700 hover:text-blue-800 font-extrabold uppercase bg-blue-50/80 hover:bg-blue-100 px-1 py-0.5 rounded transition-all duration-150 cursor-pointer inline-flex items-center gap-0.5 border border-blue-100/50"
                              title={chartView === 'growth' ? "Switch to Tab Allocation Bar Chart" : "Switch to Growth Sparkline Line Chart"}
                            >
                              {chartView === 'growth' ? 'Tab Focus' : 'Growth'}
                            </button>
                          </div>
                        </div>
                        <div className="h-9 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            {chartView === 'growth' ? (
                              <LineChart data={sparklineData}>
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const dataPoint = payload[0].payload;
                                      return (
                                        <div className="bg-slate-900 border border-slate-800 text-[8px] text-slate-100 rounded px-1.5 py-0.5 shadow-sm font-mono leading-none">
                                          {dataPoint.formatted}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                  cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '2 2' }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="duration" 
                                  stroke="#2563EB" 
                                  strokeWidth={1.5} 
                                  dot={false}
                                  activeDot={{ r: 2.5, stroke: '#2563EB', strokeWidth: 1, fill: '#FFFFFF' }}
                                />
                              </LineChart>
                            ) : (
                              <BarChart data={barChartData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                                <XAxis 
                                  dataKey="shortName" 
                                  tick={{ fontSize: 6, fill: '#64748B', fontWeight: 600 }} 
                                  axisLine={false} 
                                  tickLine={false} 
                                  interval={0} 
                                />
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const dataPoint = payload[0].payload;
                                      return (
                                        <div className="bg-slate-950 border border-slate-800 text-[8px] text-slate-100 rounded px-1.5 py-0.5 shadow-sm font-mono leading-none">
                                          {dataPoint.name}: {formatDuration(dataPoint.duration)}
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="duration" radius={[1, 1, 0, 0]}>
                                  {barChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fillColor} />
                                  ))}
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Previous Session Comparison Footer */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] gap-2">
                        <div className="min-w-0">
                          <span className="block text-[8px] text-gray-400 font-extrabold uppercase tracking-wider leading-none">Previous Session</span>
                          <span className="font-mono text-gray-500 font-semibold block mt-1">
                            {formatDuration(previousDuration)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-[8px] text-gray-400 font-extrabold uppercase tracking-wider leading-none">vs. Last Session</span>
                          <span className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1 border leading-tight ${
                            sessionDiff > 0 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : sessionDiff < 0 
                              ? 'bg-amber-50 text-amber-700 border-amber-100' 
                              : 'bg-gray-50 text-gray-500 border-gray-100'
                          }`} title={`Current is ${formatDiff(sessionDiff)} compared to last session`}>
                            <span>{sessionDiff > 0 ? `▲` : sessionDiff < 0 ? `▼` : '•'}</span>
                            <span>{sessionDiff === 0 ? 'No change' : formatDiff(sessionDiff)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Reset & Capture Session Buttons */}
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={handleCaptureState}
                          id="capture-session-state-btn"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-[#2563EB] text-[9px] font-extrabold tracking-tight transition-all duration-150 cursor-pointer shadow-3xs"
                          title="Capture current session metrics and export JSON for external audit review"
                        >
                          <Download className="h-2.5 w-2.5" />
                          <span>Capture State</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetSession}
                          id="reset-session-btn"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 text-[9px] font-bold tracking-tight transition-all duration-150 cursor-pointer shadow-3xs"
                          title="Reset active simulation timer and focus breakdown to zero"
                        >
                          <RefreshCw className="h-2.5 w-2.5" />
                          <span>Reset Session</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  disabled={isPersonaLocked}
                  onClick={() => triggerSimulatePersona('admin')}
                  className={`w-full text-left text-[11px] font-semibold p-1.5 rounded border flex items-center justify-between transition-all ${
                    isPersonaLocked
                      ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                      : currentUser?.role === 'Administrator' 
                      ? 'bg-white border-blue-400 text-blue-800 shadow-xs font-bold' 
                      : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                  title={isPersonaLocked ? "Persona selection is locked" : "Switch to Clara Oswald"}
                >
                  <span>Clara Oswald (Admin)</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isPersonaLocked ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-blue-700'}`}>Lvl 4</span>
                </button>

                <button
                  type="button"
                  disabled={isPersonaLocked}
                  onClick={() => triggerSimulatePersona('officer')}
                  className={`w-full text-left text-[11px] font-semibold p-1.5 rounded border flex items-center justify-between transition-all ${
                    isPersonaLocked
                      ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                      : currentUser?.role === 'Security Officer' 
                      ? 'bg-white border-purple-400 text-purple-800 shadow-xs font-bold' 
                      : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                  title={isPersonaLocked ? "Persona selection is locked" : "Switch to Marcus Vance"}
                >
                  <span>Marcus Vance (Officer)</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isPersonaLocked ? 'bg-slate-200 text-slate-400' : 'bg-purple-100 text-purple-700'}`}>Lvl 3</span>
                </button>

                <button
                  type="button"
                  disabled={isPersonaLocked}
                  onClick={() => triggerSimulatePersona('user')}
                  className={`w-full text-left text-[11px] font-semibold p-1.5 rounded border flex items-center justify-between transition-all ${
                    isPersonaLocked
                      ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                      : currentUser?.role === 'End User' 
                      ? 'bg-white border-emerald-400 text-emerald-800 shadow-xs font-bold' 
                      : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                  title={isPersonaLocked ? "Persona selection is locked" : "Switch to Elena Rostova"}
                >
                  <span>Elena Rostova (User)</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isPersonaLocked ? 'bg-slate-200 text-slate-400' : 'bg-emerald-100 text-emerald-700'}`}>Lvl 1</span>
                </button>

                <button
                  type="button"
                  disabled={isPersonaLocked}
                  onClick={() => triggerSimulatePersona('anonymous')}
                  className={`w-full text-left text-[11px] font-semibold p-1.5 rounded border flex items-center justify-between transition-all ${
                    isPersonaLocked
                      ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                      : !currentUser 
                      ? 'bg-white border-amber-400 text-amber-800 shadow-xs font-bold' 
                      : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                  title={isPersonaLocked ? "Persona selection is locked" : "Switch to Anonymous Visitor"}
                >
                  <span>Anonymous Visitor</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${isPersonaLocked ? 'bg-slate-200 text-slate-400' : 'bg-amber-100 text-amber-700'}`}>Lvl 0</span>
                </button>
              </div>
            </div>
          </div>

          {/* Database Reset Action */}
          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Storage Operations</span>
            <button
              onClick={resetAllDemoData}
              className="text-[10px] text-gray-400 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
              title="Reset Simulated State"
            >
              <RefreshCw className="h-3 w-3" /> Re-index DB
            </button>
          </div>
        </aside>

        {/* --- MOUNTED WORKSPACE SCREEN --- */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto" id="mount-workspace">
          
          {/* A. Gateway Auth block */}
          {activeTab === 'gateway' && !currentUser && (
            <Gateway onLoginSuccess={handleLoginSuccess} />
          )}

          {/* B. Admin Identity pool management */}
          {activeTab === 'admin' && currentUser && (currentUser.role === 'Administrator' || currentUser.role === 'Security Officer') && (
            <AdminConsole 
              users={users}
              onUpdateUser={handleUpdateUser}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              addAuditLog={addAuditLog}
              auditLogs={auditLogs}
              onSelectUserForInspection={handleInspectUserDevConsole}
              visibleColumns={visibleColumns}
            />
          )}

          {/* C. KYC Compliance Terminal */}
          {activeTab === 'kyc' && currentUser && (
            <KYCHub 
              currentUser={currentUser}
              addAuditLog={addAuditLog}
            />
          )}

          {/* D. Self User Profile Security Context */}
          {activeTab === 'user' && currentUser && (
            <UserProfile 
              currentUser={currentUser}
              addAuditLog={addAuditLog}
              onLogout={handleLogout}
            />
          )}

          {/* E. Developer Integration sandbox */}
          {activeTab === 'developer' && (
            <DeveloperConsole 
              selectedUser={selectedUserForInspection}
              currentUser={currentUser || { name: 'Anonymous Visitor', username: 'anon', email: 'anonymous@folksart.io', role: 'End User' }}
            />
          )}

          {/* Fallback protection boundary */}
          {currentUser && activeTab === 'gateway' && (
            <div className="text-center py-12 bg-white rounded-xl border p-8 max-w-md mx-auto space-y-4">
              <UserCheck className="h-10 w-10 text-emerald-600 mx-auto" />
              <div>
                <h4 className="font-bold text-gray-900">Credentials Active</h4>
                <p className="text-xs text-gray-500 mt-1">You have already authenticated your Folksart access clearance.</p>
              </div>
              <button
                onClick={() => {
                  if (currentUser.role === 'Administrator' || currentUser.role === 'Security Officer') {
                    setActiveTab('admin');
                  } else {
                    setActiveTab('user');
                  }
                }}
                className="bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white px-4 py-2 rounded-lg"
              >
                Go to Cleared Dashboard
              </button>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
