import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Key, Search, Filter, Plus, 
  Eye, Edit2, RotateCw, Ban, UserX, CheckCircle, AlertTriangle, 
  Building, Phone, Mail, User, Shield, ArrowUpRight, ArrowDownLeft,
  Maximize2, Minimize2, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { IAMUser, IAMRole, IAMStatus, KYCStatus, AuditLog } from '../types/iam';
import { generateOpaqueToken } from '../data/mockData';

interface AdminConsoleProps {
  users: IAMUser[];
  onUpdateUser: (updatedUser: IAMUser) => void;
  onAddUser: (newUser: IAMUser) => void;
  onDeleteUser: (userId: string) => void;
  addAuditLog: (action: string, targetName: string, severity?: 'info' | 'warning' | 'critical') => void;
  auditLogs: AuditLog[];
  onSelectUserForInspection: (user: IAMUser) => void;
}

export default function AdminConsole({ 
  users, 
  onUpdateUser, 
  onAddUser, 
  onDeleteUser, 
  addAuditLog,
  auditLogs,
  onSelectUserForInspection
}: AdminConsoleProps) {
  
  // Filtering & Search state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [kycFilter, setKycFilter] = useState<string>('All');
  const [isFullscreenFocus, setIsFullscreenFocus] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, kycFilter, itemsPerPage]);

  // Modal / Sidebar forms state
  const [selectedUser, setSelectedUser] = useState<IAMUser | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<IAMUser | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<IAMRole>('End User');
  const [newStatus, setNewStatus] = useState<IAMStatus>('Active');
  const [newKyc, setNewKyc] = useState<KYCStatus>('Not Started');
  const [newDept, setNewDept] = useState('');

  // Editing User Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<IAMRole>('End User');
  const [editStatus, setEditStatus] = useState<IAMStatus>('Active');
  const [editKyc, setEditKyc] = useState<KYCStatus>('Not Started');
  const [editDept, setEditDept] = useState('');

  // Handle open add modal
  const openAddModal = () => {
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('End User');
    setNewStatus('Active');
    setNewKyc('Not Started');
    setNewDept('General Public');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newUsername) return;

    const newUser: IAMUser = {
      id: `usr_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      name: newName,
      username: newUsername.toLowerCase().trim(),
      email: newEmail.trim(),
      phone: newPhone || '+1 (555) 000-0000',
      avatar: `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1494790108377-be9c29b29330'][Math.floor(Math.random() * 4)]}?w=120&auto=format&fit=crop&q=80`,
      role: newRole,
      status: newStatus,
      kycStatus: newKyc,
      mfaEnabled: false,
      mfaMethods: [],
      ssoProvider: null,
      department: newDept,
      createdAt: new Date().toISOString(),
      lastActive: 'Never',
      riskScore: Math.floor(Math.random() * 25),
      opaqueToken: generateOpaqueToken(newUsername)
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    addAuditLog('USER_PROVISIONED', `${newUser.name} (${newUser.role})`, 'info');
  };

  // Handle open edit drawer
  const openEditDrawer = (user: IAMUser) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditKyc(user.kycStatus);
    setEditDept(user.department);
    setIsEditDrawerOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const severity = editStatus === 'Banned' ? 'critical' : (editStatus === 'Deactivated' ? 'warning' : 'info');

    const updated: IAMUser = {
      ...selectedUser,
      name: editName,
      phone: editPhone,
      role: editRole,
      status: editStatus,
      kycStatus: editKyc,
      department: editDept,
      // If banned, risk score spikes
      riskScore: editStatus === 'Banned' ? Math.max(selectedUser.riskScore, 95) : selectedUser.riskScore
    };

    onUpdateUser(updated);
    setIsEditDrawerOpen(false);
    setSelectedUser(null);
    addAuditLog('USER_RECORD_RECONCILED', `${updated.name} (Status: ${updated.status})`, severity);
  };

  // Direct operations
  const triggerRotateToken = (user: IAMUser) => {
    const updated: IAMUser = {
      ...user,
      opaqueToken: generateOpaqueToken(user.username)
    };
    onUpdateUser(updated);
    addAuditLog('OPAQUE_TOKEN_ROTATED', `${user.name} (${user.username})`, 'info');
  };

  const triggerBanUser = (user: IAMUser) => {
    const updated: IAMUser = {
      ...user,
      status: 'Banned',
      riskScore: 98
    };
    onUpdateUser(updated);
    addAuditLog('USER_BANNED', `${user.name} - Identity Pool Restriction`, 'critical');
  };

  const triggerToggleDeactivate = (user: IAMUser) => {
    const isDeactivating = user.status !== 'Deactivated';
    const updated: IAMUser = {
      ...user,
      status: isDeactivating ? 'Deactivated' : 'Active'
    };
    onUpdateUser(updated);
    addAuditLog(
      isDeactivating ? 'USER_DEACTIVATED' : 'USER_RE_ACTIVATED', 
      user.name, 
      isDeactivating ? 'warning' : 'info'
    );
  };

  // Filtered User list
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    const matchesKyc = kycFilter === 'All' || user.kycStatus === kycFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesKyc;
  });

  const totalFilteredCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const emptyRowsCount = itemsPerPage - paginatedUsers.length;

  // Calculate statistics
  const totalIdentities = users.length;
  const activeIdentities = users.filter(u => u.status === 'Active').length;
  const kycVerifiedCount = users.filter(u => u.kycStatus === 'Verified').length;
  const averageRisk = Math.round(users.reduce((acc, curr) => acc + curr.riskScore, 0) / totalIdentities);

  // CSV Export Logic
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) return;
    
    const headers = ['ID', 'Name', 'Username', 'Email', 'Phone', 'Role', 'Status', 'KYC Status', 'Department', 'Risk Score', 'Created At'];
    const csvRows = filteredUsers.map(user => [
      user.id,
      `"${user.name}"`,
      user.username,
      user.email,
      user.phone,
      user.role,
      user.status,
      user.kycStatus,
      `"${user.department}"`,
      user.riskScore,
      user.createdAt
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `iam_identities_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('DATA_EXPORT_INITIATED', `Batch Identifier: ${filteredUsers.length} records`, 'info');
  };

  return (
    <div className="space-y-6" id="admin-console-view">
      
      {/* 1. Statistics Cards Area */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" id="stats-dashboard">
        {/* Total Users */}
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100/80">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
            <Users className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identities Enrolled</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalIdentities}</h3>
            <span className="text-[10px] text-gray-400 font-medium">Enterprise Directory</span>
          </div>
        </div>

        {/* Active Access */}
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100/80">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <UserCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Credentials</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{activeIdentities}</h3>
            <span className="text-[10px] text-emerald-600 font-bold">{Math.round((activeIdentities/totalIdentities)*100)}% Clearance rate</span>
          </div>
        </div>

        {/* KYC Verified */}
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100/80">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <CheckCircle className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Verified Pool</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{kycVerifiedCount}</h3>
            <span className="text-[10px] text-gray-400 font-medium">Verified Legal Status</span>
          </div>
        </div>

        {/* System Risk Score */}
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100/80">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <ShieldAlert className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mean Pool Risk</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{averageRisk}%</h3>
            <span className="text-[10px] text-[red] font-bold">Low Concern Threshold</span>
          </div>
        </div>
      </div>

      {/* 2. Control Filters Bar */}
      <div className="rounded-xl bg-white p-4 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100 flex flex-col gap-4" id="filters-control-bar">
        {/* Row 1: Primary Search Input (Full Width for reachability) */}
        <div className="relative w-full">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-gray-400" />
          <input
            type="text"
            placeholder="Search matching identities by name, tag, phone, department..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all duration-200 shadow-3xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Row 2: Secondary Filters and Action Buttons (Aligned on one row) */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          {/* Left: Metadata Filters */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-2 text-[11px] font-bold text-gray-600 bg-gray-100 border-none rounded-lg focus:outline-none cursor-pointer hover:bg-gray-200 transition-colors"
                title="Filter by corporate role"
              >
                <option value="All">All Roles</option>
                <option value="Administrator">Administrator</option>
                <option value="Operator">Operator</option>
                <option value="Security Officer">Security Officer</option>
                <option value="End User">End User</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-[11px] font-bold text-gray-600 bg-gray-100 border-none rounded-lg focus:outline-none cursor-pointer hover:bg-gray-200 transition-colors"
              title="Filter by account status"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Deactivated">Deactivated</option>
              <option value="Banned">Banned</option>
            </select>

            {/* KYC Filter */}
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="px-2.5 py-2 text-[11px] font-bold text-gray-600 bg-gray-100 border-none rounded-lg focus:outline-none cursor-pointer hover:bg-gray-200 transition-colors"
              title="Filter by KYC verification status"
            >
              <option value="All">All KYC Levels</option>
              <option value="Verified">Verified</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Not Started">Not Started</option>
              <option value="Action Required">Action Required</option>
            </select>
          </div>

          {/* Right: Administrative Actions */}
          <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
            {/* Focus Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreenFocus(true)}
              id="btn-focus-console"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-100 hover:border-teal-200 text-teal-700 text-[11px] font-bold tracking-tight transition-all duration-150 cursor-pointer shadow-3xs"
              title="Switch to full-screen focused console"
            >
              <Maximize2 className="h-3.5 w-3.5 text-teal-600" />
              <span>Focus View</span>
            </button>

            {/* provisioning button */}
            <button
              onClick={openAddModal}
              id="btn-provision-identity"
              className="flex items-center gap-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 py-2 px-4 text-[11px] font-bold text-white transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Provision Identity</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Core Database Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="identities-table">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Subject Principal</th>
                <th className="py-3 px-4">Corporate Role</th>
                <th className="py-3 px-4">Governance Department</th>
                <th className="py-3 px-4">Identity Status</th>
                <th className="py-3 px-4">KYC Compliance</th>
                <th className="py-3 px-4 text-center">Threat Vector</th>
                <th className="py-3 px-4 text-right">Administrative Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {paginatedUsers.length > 0 ? (
                <>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* User profile identifier block */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100" 
                        />
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1">
                            {user.name}
                            {user.mfaEnabled && (
                              <Key className="h-3.5 w-3.5 text-blue-500" title="MFA Protection Enabled" />
                            )}
                          </div>
                          <div className="text-gray-400 font-medium text-[11px]">
                            {user.username} <span className="mx-1">•</span> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Corporate Role */}
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200/50">
                        <Shield className="h-2.5 w-2.5 text-gray-500" />
                        {user.role}
                      </span>
                    </td>

                    {/* Corporate Department */}
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      {user.department}
                    </td>

                    {/* Identity Status badge */}
                    <td className="py-3.5 px-4">
                      {user.status === 'Active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {user.status}
                        </span>
                      )}
                      {user.status === 'Deactivated' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                          Offline/Suspended
                        </span>
                      )}
                      {user.status === 'Banned' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          Banned Pool
                        </span>
                      )}
                    </td>

                    {/* KYC compliance status */}
                    <td className="py-3.5 px-4">
                      {user.kycStatus === 'Verified' && (
                        <span className="text-[11px] font-bold text-teal-600 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Full Cleared
                        </span>
                      )}
                      {user.kycStatus === 'Pending Review' && (
                        <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Pending Audit
                        </span>
                      )}
                      {user.kycStatus === 'Not Started' && (
                        <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                          Uninitiated
                        </span>
                      )}
                      {user.kycStatus === 'Action Required' && (
                        <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" /> Re-upload Req.
                        </span>
                      )}
                    </td>

                    {/* Risk indicator bar */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-[10px] font-bold ${user.riskScore > 75 ? 'text-red-600' : (user.riskScore > 40 ? 'text-amber-500' : 'text-emerald-600')}`}>
                          {user.riskScore}% Risk
                        </span>
                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${user.riskScore > 75 ? 'bg-red-500' : (user.riskScore > 40 ? 'bg-amber-400' : 'bg-emerald-500')}`}
                            style={{ width: `${user.riskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Interactive operations */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => { setDetailUser(user); }}
                          title="Inspect Telemetry Details"
                          className="p-1 text-gray-400 hover:text-[#2563EB] hover:bg-gray-100 rounded transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onSelectUserForInspection(user)}
                          title="Inspect in Dynamic Developer Console"
                          className="p-1 text-gray-400 hover:text-[#2563EB] hover:bg-gray-100 rounded transition-all"
                        >
                          <Key className="h-4 w-4 text-purple-400" />
                        </button>
                        <button
                          onClick={() => openEditDrawer(user)}
                          title="Edit Identity Parameters"
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => triggerRotateToken(user)}
                          title="Rotate Opaque Token Immediately"
                          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>
                        {user.status !== 'Banned' ? (
                          <button
                            onClick={() => triggerBanUser(user)}
                            title="Ban and Block Identity"
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerToggleDeactivate(user)}
                            title="Restore identity to Active"
                            className="p-1 text-red-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => triggerToggleDeactivate(user)}
                          title={user.status === 'Deactivated' ? 'Activate Session' : 'Deactivate / Suspended Access'}
                          className={`p-1 rounded transition-all ${user.status === 'Deactivated' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {emptyRowsCount > 0 && (
                  Array.from({ length: emptyRowsCount }).map((_, index) => (
                    <tr key={`empty-${index}`} className="opacity-35 select-none pointer-events-none hover:bg-transparent">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gray-100/50 border border-dashed border-gray-200"></div>
                          <div>
                            <div className="h-3 w-24 bg-gray-100 rounded"></div>
                            <div className="h-2 w-32 bg-gray-50 rounded mt-1.5"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-5 w-16 bg-gray-150/50 rounded-full"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-20 bg-gray-100 rounded"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-5 w-14 bg-gray-100/50 rounded-full"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3.5 w-10 bg-gray-100/55 rounded mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-4 w-12 bg-gray-100/40 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                )}
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-medium">
                    No active enrolled identities match the current filter selection criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Dynamic Pagination & Entries Indicator Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500">Show entries:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              id="select-items-per-page"
              className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-[11px] text-gray-400 font-semibold ml-2 flex items-center">
              Showing <span className="font-bold text-gray-700 mx-1">{totalFilteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-gray-700 mx-1">{Math.min(currentPage * itemsPerPage, totalFilteredCount)}</span> of <span className="font-bold text-gray-700 mx-1">{totalFilteredCount}</span> entries
              
              {totalFilteredCount > 0 && (
                <button 
                  onClick={handleExportCSV}
                  id="btn-export-csv"
                  className="ml-4 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-[10px] font-bold text-gray-500 hover:text-[#2563EB] transition-all cursor-pointer shadow-3xs"
                  title="Download current filtered results as CSV"
                >
                  <FileText className="h-3 w-3" />
                  <span>Export to CSV</span>
                </button>
              )}
            </span>
          </div>

          {totalFilteredCount > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                id="btn-page-prev"
                className="p-1 px-2.5 rounded bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 disabled:opacity-40 disabled:hover:bg-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-3 w-3" />
                <span>Back</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  id={`btn-page-num-${page}`}
                  className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-extrabold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                id="btn-page-next"
                className="p-1 px-2.5 rounded bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 disabled:opacity-40 disabled:hover:bg-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Real-time Audit Logs Stream Preview */}
      <div className="rounded-xl bg-white p-5 shadow-[0px_4px_20px_rgba(17,24,39,0.05)] border border-gray-100">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3.5 flex items-center justify-between">
          <span>Active Governance Audit Stream</span>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 capitalize font-sans normal-case bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Security Listener
          </span>
        </h4>
        <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-2">
          {auditLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-50 bg-gray-50/50 text-[11px] text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  log.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {log.action}
                </span>
                <span className="font-semibold text-gray-800">{log.actor}</span>
                <span className="text-gray-400">acted on</span>
                <span className="font-bold text-gray-900">{log.target}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-[10px]">
                <span>IP: {log.ipAddress}</span>
                <span>•</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADD USER INITIAL MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-[#2563EB]" /> Provision Corporate Subject
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Display Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clara Oswald"
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Corporate Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. coswald"
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Principal Email</label>
                  <input
                    type="email"
                    required
                    placeholder="clara@organization.com"
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Emergency Mobile No.</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 555-5555"
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Initial Clearance Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as IAMRole)}
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white font-medium"
                  >
                    <option value="End User">End User (Subject)</option>
                    <option value="Operator">Operator (Staff)</option>
                    <option value="Security Officer">Security Officer (Inspector)</option>
                    <option value="Administrator">Administrator (Authority)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Corporate Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. General Operations"
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">KYC Status</label>
                  <select
                    value={newKyc}
                    onChange={(e) => setNewKyc(e.target.value as KYCStatus)}
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white font-medium"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Verified">Verified</option>
                    <option value="Action Required">Action Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Initial Access Pool Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IAMStatus)}
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Finalize Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER SLIDEOUT DRAWER --- */}
      {isEditDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between border-l border-gray-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-[#2563EB]" /> Reconcile Subject Parameters
                </h3>
                <button 
                  onClick={() => setIsEditDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="h-10 w-10 rounded-full" />
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{selectedUser.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Original Principal: {selectedUser.username}</p>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Display Identity Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Clearance Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as IAMRole)}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-white font-medium"
                  >
                    <option value="End User">End User</option>
                    <option value="Operator">Operator</option>
                    <option value="Security Officer">Security Officer</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Department</label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Verified Mobile No.</label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Compliance Status</label>
                    <select
                      value={editKyc}
                      onChange={(e) => setEditKyc(e.target.value as KYCStatus)}
                      className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-white font-medium"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Verified">Verified</option>
                      <option value="Action Required">Action Required</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Access Pool Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as IAMStatus)}
                      className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-white font-medium"
                    >
                      <option value="Active">Active</option>
                      <option value="Deactivated">Deactivated</option>
                      <option value="Banned">Banned</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-5">
                  <button
                    type="button"
                    onClick={() => setIsEditDrawerOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg"
                  >
                    Commit Overrides
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- TELEMETRY READ-ONLY DETAIL MODAL --- */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3.5">
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-widest flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-[#2563EB]" /> Identity Telemetry Dossier
              </h3>
              <button 
                onClick={() => setDetailUser(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3.5 pb-2">
              <img src={detailUser.avatar} alt={detailUser.name} className="h-14 w-14 rounded-full border-2 border-gray-100" />
              <div>
                <h4 className="text-base font-bold text-gray-900">{detailUser.name}</h4>
                <p className="text-xs text-gray-400 font-semibold">{detailUser.username} <span className="mx-1">•</span> Principal ID: {detailUser.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Corporate Details</p>
                <div className="space-y-1 text-gray-700">
                  <p className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-gray-400 shrink-0" /> <span className="font-bold">Dept:</span> {detailUser.department}</p>
                  <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" /> <span className="font-bold">Email:</span> {detailUser.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" /> <span className="font-bold">Phone:</span> {detailUser.phone}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Security Context</p>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-bold text-gray-500">MFA Status:</span> {detailUser.mfaEnabled ? '✔️ Enabled - Secure' : '❌ Unsecured'}</p>
                  <p><span className="font-bold text-gray-500">MFA Methods:</span> {detailUser.mfaMethods.join(', ') || 'None'}</p>
                  <p><span className="font-bold text-gray-500">SSO Sovereign:</span> {detailUser.ssoProvider || 'None'}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-100 text-xs">
              <p className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Active Opaque Access Token (SHA-256 Metadata)</span>
                <span className="font-mono text-xs">{detailUser.status}</span>
              </p>
              <div className="font-mono text-[10px] text-blue-800 bg-white/80 p-2 rounded border border-blue-100 select-all break-all select-all font-semibold">
                Authorization: Bearer {detailUser.opaqueToken}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg"
              >
                Clear Review View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN FOCUS MODE DIALOG --- */}
      {isFullscreenFocus && (
        <div className="fixed inset-0 z-40 bg-gray-950/45 backdrop-blur-md p-4 sm:p-6 md:p-8 flex items-center justify-center overflow-hidden" id="fullscreen-focus-overlay">
          <div className="w-full h-full max-w-7xl bg-[#F9FAFB] rounded-2xl shadow-2xl border border-gray-200/60 flex flex-col overflow-hidden">
            
            {/* Merged Header */}
            <div className="bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between shrink-0 shadow-3xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-widest leading-none flex items-center gap-2">
                    <span>Directory Governance Focus Pool</span>
                    <span className="text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-100 rounded px-1.5 py-0.5 animate-pulse uppercase">Active Focus Mode</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">Focused Fullscreen Directory Console • {filteredUsers.length} of {users.length} enrolled subjects listed</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenFocus(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-205 text-slate-700 text-[11px] font-extrabold tracking-tight transition-all duration-150 cursor-pointer shadow-3xs"
                title="Exit focused fullscreen directory mode"
              >
                <Minimize2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Exit Focus Mode</span>
              </button>
            </div>

            {/* Merged Body (Combined Controls and Table) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              
              {/* 2. Fullscreen Control Filters Bar inline */}
              <div className="rounded-xl bg-white p-4 shadow-[0px_4px_20px_rgba(17,24,39,0.02)] border border-gray-150 flex flex-col lg:flex-row gap-4 justify-between items-center shrink-0">
                {/* Search Input */}
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search matching identities by name, tag, phone, department..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Filter Selection Grid */}
                <div className="flex flex-wrap gap-2.5 items-center w-full lg:w-auto lg:justify-end">
                  {/* Role Filter */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-gray-400" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 border-none rounded-lg focus:outline-none"
                    >
                      <option value="All">All Roles</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Operator">Operator</option>
                      <option value="Security Officer">Security Officer</option>
                      <option value="End User">End User</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 border-none rounded-lg focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                    <option value="Banned">Banned</option>
                  </select>

                  {/* KYC Filter */}
                  <select
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 border-none rounded-lg focus:outline-none"
                  >
                    <option value="All">All KYC Levels</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Action Required">Action Required</option>
                  </select>

                  {/* Provisioning Button inside Fullscreen View */}
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 py-1.5 px-3 text-[11px] font-bold text-white transition-all shadow-sm shrink-0 ml-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Provision Identity
                  </button>
                </div>
              </div>

              {/* 3. Fullscreen Core Database Table */}
              <div className="overflow-hidden rounded-xl bg-white shadow-[0px_4px_20px_rgba(17,24,39,0.03)] border border-gray-150 flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-105 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Subject Principal</th>
                        <th className="py-3 px-4">Corporate Role</th>
                        <th className="py-3 px-4">Governance Department</th>
                        <th className="py-3 px-4">Identity Status</th>
                        <th className="py-3 px-4">KYC Compliance</th>
                        <th className="py-3 px-4 text-center">Threat Vector</th>
                        <th className="py-3 px-4 text-right">Administrative Execution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                      {paginatedUsers.length > 0 ? (
                        <>
                        {paginatedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                            {/* User profile identifier block */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={user.avatar} 
                                  alt={user.name} 
                                  className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100" 
                                />
                                <div>
                                  <div className="font-bold text-gray-900 flex items-center gap-1">
                                    {user.name}
                                    {user.mfaEnabled && (
                                      <Key className="h-3.5 w-3.5 text-blue-500" title="MFA Protection Enabled" />
                                    )}
                                  </div>
                                  <div className="text-gray-400 font-medium text-[11px]">
                                    {user.username} <span className="mx-1">•</span> {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Corporate Role */}
                            <td className="py-3.5 px-4 font-semibold text-gray-750">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200/50">
                                <Shield className="h-2.5 w-2.5 text-gray-500" />
                                {user.role}
                              </span>
                            </td>

                            {/* Corporate Department */}
                            <td className="py-3.5 px-4 text-gray-500 font-medium whitespace-nowrap">
                              {user.department}
                            </td>

                            {/* Identity Status badge */}
                            <td className="py-3.5 px-4">
                              {user.status === 'Active' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  {user.status}
                                </span>
                              )}
                              {user.status === 'Deactivated' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                                  Offline/Suspended
                                </span>
                              )}
                              {user.status === 'Banned' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                  Banned Pool
                                </span>
                              )}
                            </td>

                            {/* KYC compliance status */}
                            <td className="py-3.5 px-4">
                              {user.kycStatus === 'Verified' && (
                                <span className="text-[11px] font-bold text-teal-600 flex items-center gap-1">
                                  <CheckCircle className="h-3.5 w-3.5" /> Full Cleared
                                </span>
                              )}
                              {user.kycStatus === 'Pending Review' && (
                                <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5" /> Pending Audit
                                </span>
                              )}
                              {user.kycStatus === 'Not Started' && (
                                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                                  Uninitiated
                                </span>
                              )}
                              {user.kycStatus === 'Action Required' && (
                                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5" /> Re-upload Req.
                                </span>
                              )}
                            </td>

                            {/* Risk indicator bar */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="inline-flex flex-col items-center">
                                <span className={`text-[10px] font-bold ${user.riskScore > 75 ? 'text-red-600' : (user.riskScore > 40 ? 'text-amber-500' : 'text-emerald-600')}`}>
                                  {user.riskScore}% Risk
                                </span>
                                <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={`h-full ${user.riskScore > 75 ? 'bg-red-500' : (user.riskScore > 40 ? 'bg-amber-400' : 'bg-emerald-500')}`}
                                    style={{ width: `${user.riskScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            {/* Interactive operations */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => { setDetailUser(user); }}
                                  title="Inspect Telemetry Details"
                                  className="p-1 text-gray-400 hover:text-[#2563EB] hover:bg-gray-100 rounded transition-all cursor-pointer"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onSelectUserForInspection(user)}
                                  title="Inspect in Dynamic Developer Console"
                                  className="p-1 text-gray-400 hover:text-[#2563EB] hover:bg-gray-100 rounded transition-all cursor-pointer"
                                >
                                  <Key className="h-4 w-4 text-purple-400" />
                                </button>
                                <button
                                  onClick={() => openEditDrawer(user)}
                                  title="Edit Identity Parameters"
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded transition-all cursor-pointer"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => triggerRotateToken(user)}
                                  title="Rotate Opaque Token Immediately"
                                  className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer"
                                >
                                  <RotateCw className="h-4 w-4" />
                                </button>
                                {user.status !== 'Banned' ? (
                                  <button
                                    onClick={() => triggerBanUser(user)}
                                    title="Ban and Block Identity"
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => triggerToggleDeactivate(user)}
                                    title="Restore identity to Active"
                                    className="p-1 text-red-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all cursor-pointer"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => triggerToggleDeactivate(user)}
                                  title={user.status === 'Deactivated' ? 'Activate Session' : 'Deactivate / Suspended Access'}
                                  className={`p-1 rounded transition-all cursor-pointer ${user.status === 'Deactivated' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {emptyRowsCount > 0 && (
                          Array.from({ length: emptyRowsCount }).map((_, index) => (
                            <tr key={`empty-fullscreen-${index}`} className="opacity-35 select-none pointer-events-none hover:bg-transparent">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-gray-100/50 border border-dashed border-gray-200"></div>
                                  <div>
                                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                                    <div className="h-2 w-32 bg-gray-50 rounded mt-1.5"></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="h-5 w-16 bg-gray-150/50 rounded-full"></div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="h-3 w-20 bg-gray-100 rounded"></div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="h-5 w-14 bg-gray-100/50 rounded-full"></div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="h-3 w-16 bg-gray-100 rounded"></div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="h-3.5 w-10 bg-gray-100/55 rounded mx-auto"></div>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="h-4 w-12 bg-gray-100/40 rounded ml-auto"></div>
                              </td>
                            </tr>
                          ))
                        )}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400 font-medium">
                            No active enrolled identities match the current filter selection criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic Fullscreen Pagination & Entries Indicator Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500">Show entries:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      id="select-items-per-page-fullscreen"
                      className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-[11px] text-gray-400 font-semibold ml-2">
                      Showing <span className="font-bold text-gray-700">{totalFilteredCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-bold text-gray-700">{Math.min(currentPage * itemsPerPage, totalFilteredCount)}</span> of <span className="font-bold text-gray-700">{totalFilteredCount}</span> entries
                    </span>
                  </div>

                  {totalFilteredCount > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        id="btn-page-prev-fullscreen"
                        className="p-1 px-2.5 rounded bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 disabled:opacity-40 disabled:hover:bg-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        <span>Back</span>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          id={`btn-page-num-fullscreen-${page}`}
                          className={`w-7 h-7 flex items-center justify-center rounded text-[11px] font-extrabold transition-all cursor-pointer ${
                            currentPage === page
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        id="btn-page-next-fullscreen"
                        className="p-1 px-2.5 rounded bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 disabled:opacity-40 disabled:hover:bg-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
