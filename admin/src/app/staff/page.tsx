'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCog,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  KeyRound,
  Edit2,
  Trash2,
  Lock,
  Mail,
  User,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { adminApi, StaffUser, CreateStaffUserPayload, UpdateStaffUserPayload, AdminUser } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TablePageSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const MODULE_PERMISSIONS = [
  { key: 'products', label: 'Products', description: 'Catalog & apparel items' },
  { key: 'categories', label: 'Categories', description: 'Product taxonomy & classifications' },
  { key: 'collections', label: 'Collections', description: 'Curated editorial drops & showcases' },
  { key: 'offers', label: 'Offers', description: 'Promotional countdowns & campaign markdowns' },
  { key: 'orders', label: 'Orders', description: 'Order processing & tracking' },
  { key: 'customers', label: 'Customers', description: 'Patron database & addresses' },
  { key: 'inventory', label: 'Inventory', description: 'Warehouse stock levels' },
  { key: 'coupons', label: 'Coupons', description: 'Promotional discount keys' },
  { key: 'reviews', label: 'Reviews', description: 'Customer reviews & responses' },
  { key: 'reports', label: 'Reports', description: 'Live sales, order & customer analytics' },
  { key: 'settings', label: 'Settings', description: 'Store configuration & defaults' },
  { key: 'staff', label: 'Staff & Roles', description: 'User & permission administration' },
];

function StaffContent() {
  const { toast } = useToast();
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [resettingPwStaff, setResettingPwStaff] = useState<StaffUser | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffUser | null>(null);

  // Add Form state
  const [addForm, setAddForm] = useState<CreateStaffUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'MANAGER',
    permissions: ['products', 'orders', 'inventory'],
    mustChangePassword: true,
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Edit Form state
  const [editForm, setEditForm] = useState<UpdateStaffUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'MANAGER',
    permissions: [],
    isActive: true,
    mustChangePassword: false,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Admin Reset Password form state
  const [newAdminResetPw, setNewAdminResetPw] = useState('');
  const [isSubmittingResetPw, setIsSubmittingResetPw] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  useEffect(() => {
    setCurrentUser(adminApi.auth.getUser());
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await adminApi.users.getAll();
      if (res.success && res.data) {
        setStaffList(res.data);
      } else {
        setLoadError(res.error || 'Unable to retrieve staff members');
      }
    } catch (err: any) {
      setLoadError(err?.message || 'Network error retrieving staff');
    } finally {
      setIsLoading(false);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Metrics
  const metrics = useMemo(() => {
    const total = staffList.length;
    const superAdmins = staffList.filter((s) => s.role === 'SUPER_ADMIN').length;
    const managers = staffList.filter((s) => s.role === 'MANAGER' || s.role === 'ADMIN').length;
    const active = staffList.filter((s) => s.isActive).length;
    return { total, superAdmins, managers, active };
  }, [staffList]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    if (!searchFilter.trim()) return staffList;
    const q = searchFilter.toLowerCase();
    return staffList.filter(
      (s) =>
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.role?.toLowerCase().includes(q),
    );
  }, [staffList, searchFilter]);

  // Open Edit Modal with selected user data
  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setEditForm({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      role: staff.role,
      permissions: staff.permissions || [],
      isActive: staff.isActive,
      mustChangePassword: staff.mustChangePassword,
    });
  };

  // Submit Add Staff
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await adminApi.users.create(addForm);
      if (res.success && res.data) {
        toast.success(
          `Staff member "${res.data.email}" created successfully and credentials email dispatched.`,
          'STAFF ONBOARDED',
        );
        setShowAddModal(false);
        setAddForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'MANAGER',
          permissions: ['products', 'orders', 'inventory'],
          mustChangePassword: true,
        });
        loadStaff();
      } else {
        toast.error(res.error || 'Failed to create staff member');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error creating staff member');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Submit Edit Staff
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setIsSubmittingEdit(true);
    try {
      const res = await adminApi.users.update(editingStaff.id, editForm);
      if (res.success && res.data) {
        toast.success(`Staff member "${res.data.firstName}" updated successfully`);
        setEditingStaff(null);
        loadStaff();
      } else {
        toast.error(res.error || 'Failed to update staff member');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error updating staff member');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Submit Super Admin Password Reset for Staff
  const handleAdminResetPwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingPwStaff) return;
    if (newAdminResetPw.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsSubmittingResetPw(true);
    try {
      const res = await adminApi.users.update(resettingPwStaff.id, {
        password: newAdminResetPw,
        mustChangePassword: true,
      });
      if (res.success) {
        toast.success(`Password reset for ${resettingPwStaff.email}. They will be prompted to change it.`);
        setResettingPwStaff(null);
        setNewAdminResetPw('');
        loadStaff();
      } else {
        toast.error(res.error || 'Failed to reset password');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error resetting password');
    } finally {
      setIsSubmittingResetPw(false);
    }
  };

  // Delete Staff
  const handleDeleteConfirm = async () => {
    if (!deletingStaff) return;
    setIsSubmittingDelete(true);
    try {
      const res = await adminApi.users.delete(deletingStaff.id);
      if (res.success) {
        toast.success(`Staff member ${deletingStaff.email} removed`);
        setDeletingStaff(null);
        loadStaff();
      } else {
        toast.error(res.error || 'Failed to delete staff member');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting staff member');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  if (isLoading) {
    return (
      <TablePageSkeleton
        title="Staff & Role Governance"
        showAddButton={true}
        rowCount={6}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#717975] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
            ATELIER ACCESS & STAFF GOVERNANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">
            Staff & Role Management
          </h1>
          <p className="text-xs text-[#69726d] mt-1 max-w-2xl">
            Create administrative accounts, set initial passwords, and delegate customized module permissions.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
          >
            <UserPlus className="w-4 h-4 text-[#c79a45]" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#deddd3] p-4 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#717975]">Total Accounts</p>
          <p className="text-2xl font-serif font-bold text-[#1b1c18] mt-1">{metrics.total}</p>
          <p className="text-[11px] text-[#69726d] mt-0.5">Atelier staff & admins</p>
        </div>
        <div className="bg-white border border-[#deddd3] p-4 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#717975]">Super Admins</p>
          <p className="text-2xl font-serif font-bold text-[#c79a45] mt-1">{metrics.superAdmins}</p>
          <p className="text-[11px] text-[#69726d] mt-0.5">Full unrestricted clearance</p>
        </div>
        <div className="bg-white border border-[#deddd3] p-4 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#717975]">Staff Managers</p>
          <p className="text-2xl font-serif font-bold text-[#073a2d] mt-1">{metrics.managers}</p>
          <p className="text-[11px] text-[#69726d] mt-0.5">Delegated module access</p>
        </div>
        <div className="bg-white border border-[#deddd3] p-4 shadow-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#717975]">Active Status</p>
          <p className="text-2xl font-serif font-bold text-[#2e6930] mt-1">{metrics.active}</p>
          <p className="text-[11px] text-[#69726d] mt-0.5">Currently enabled</p>
        </div>
      </div>

      {/* Search and Table toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#deddd3] p-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search staff by name, email, or role..."
            className="w-full h-9 pl-9 pr-3 text-xs border border-[#deddd3] bg-[#fbf9f2] focus:bg-white focus:border-[#073a2d] outline-none transition-colors"
          />
        </div>
        <span className="text-[11px] text-[#717975] self-center sm:self-auto font-medium">
          Showing {filteredStaff.length} of {staffList.length} members
        </span>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-[#717975] space-y-2">
            <UserCog className="w-8 h-8 mx-auto text-[#deddd3]" />
            <p className="text-sm font-medium">No staff members found</p>
            <p className="text-xs">Adjust your search query or add a new team member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#fbf9f2] border-b border-[#deddd3] text-[#404945] uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Clearance Role</th>
                  <th className="py-3 px-4">Module Permissions</th>
                  <th className="py-3 px-4">Password Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee7]">
                {filteredStaff.map((staff) => {
                  const isPrimaryAdmin = staff.email === 'admin@ronginlibas.com';
                  const isSelf = currentUser?.email === staff.email;

                  return (
                    <tr key={staff.id} className="hover:bg-[#fbf9f2]/70 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#073a2d] text-[#fbf9f2] font-bold text-xs flex items-center justify-center shrink-0 border border-[#c79a45]/40">
                            {staff.firstName?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1b1c18] truncate flex items-center gap-1.5">
                              <span>{staff.firstName} {staff.lastName}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-[#eae8e1] text-[#073a2d] px-1.5 py-0.2 rounded-xs uppercase font-bold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#69726d] truncate">{staff.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {staff.role === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c79a45]/15 text-[#8c6722] border border-[#c79a45]/30">
                            <Sparkles className="w-3 h-3" />
                            Super Admin
                          </span>
                        ) : staff.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#073a2d]/10 text-[#073a2d] border border-[#073a2d]/20">
                            <ShieldCheck className="w-3 h-3" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                            <User className="w-3 h-3" />
                            Staff Manager
                          </span>
                        )}
                      </td>

                      {/* Module Permissions */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {staff.role === 'SUPER_ADMIN' ? (
                          <span className="text-[11px] font-semibold text-[#8c6722]">
                            All Atelier Modules (Unrestricted)
                          </span>
                        ) : staff.permissions && staff.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {staff.permissions.map((perm) => (
                              <span
                                key={perm}
                                className="text-[9.5px] uppercase font-semibold px-1.5 py-0.5 bg-[#f0eee7] text-[#404945] rounded-xs"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#ba1a1a] italic">No modules granted</span>
                        )}
                      </td>

                      {/* Password Status */}
                      <td className="py-3.5 px-4">
                        {staff.mustChangePassword ? (
                          <span className="text-[11px] text-[#b45309] font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Default (Change Pending)
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#15803d] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Private Password Set
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        {staff.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#dcfce7] text-[#166534]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#f3f4f6] text-[#4b5563]">
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => handleOpenEdit(staff)}
                              title="Edit Role & Permissions"
                              className="p-1.5 text-[#404945] hover:text-[#073a2d] hover:bg-[#f0eee7] rounded-xs transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setResettingPwStaff(staff);
                                setNewAdminResetPw('');
                              }}
                              title="Reset Password"
                              className="p-1.5 text-[#404945] hover:text-[#c79a45] hover:bg-[#f0eee7] rounded-xs transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            {!isPrimaryAdmin && !isSelf && (
                              <button
                                onClick={() => setDeletingStaff(staff)}
                                title="Delete Staff Member"
                                className="p-1.5 text-[#404945] hover:text-[#ba1a1a] hover:bg-[#fee2e2] rounded-xs transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#717975] italic">View only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL 1: ADD STAFF MEMBER ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#deddd3] max-w-xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#deddd3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#073a2d]/10 flex items-center justify-center text-[#073a2d]">
                  <UserPlus className="w-4 h-4 text-[#073a2d]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1b1c18]">Add Staff Member</h3>
                  <p className="text-[11px] text-[#69726d]">Create account credentials and assign module clearances</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#717975] hover:text-[#1b1c18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="bg-[#f7faf8] border border-[#d4e7df] p-3 text-xs text-[#073a2d] flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-[11px] uppercase tracking-wider text-[#073a2d]">
                    Automated Credentials Dispatch
                  </strong>
                  <span>
                    Upon account creation, an email will be automatically sent from the no-reply address with their Full Name, Staff ID, Login Email, Clearance Role, Initial Password, and instructions to change their password on first login.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    placeholder="e.g. Farhan"
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs outline-none focus:border-[#073a2d]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    placeholder="e.g. Hasan"
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs outline-none focus:border-[#073a2d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="staff@ronginlibas.com"
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs outline-none focus:border-[#073a2d]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs outline-none focus:border-[#073a2d]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                  Clearance Role
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value as StaffUser['role'];
                    setAddForm({
                      ...addForm,
                      role: newRole,
                      permissions: newRole === 'SUPER_ADMIN' ? MODULE_PERMISSIONS.map((m) => m.key) : addForm.permissions,
                    });
                  }}
                  className="w-full h-10 px-3 border border-[#deddd3] text-xs bg-white outline-none focus:border-[#073a2d]"
                >
                  <option value="MANAGER">Staff Manager (Custom Module Access)</option>
                  <option value="ADMIN">Administrator (Custom Module Access)</option>
                  <option value="SUPER_ADMIN">Super Admin (Unrestricted Atelier Access)</option>
                </select>
              </div>

              {/* Module Permissions Checkbox Matrix */}
              {addForm.role !== 'SUPER_ADMIN' && (
                <div className="space-y-2 pt-1 border-t border-[#deddd3]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#073a2d] uppercase tracking-wider block">
                      Assigned Module Permissions
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, permissions: MODULE_PERMISSIONS.map((m) => m.key) })}
                        className="text-[10px] text-[#073a2d] font-semibold underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-[#deddd3]">|</span>
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, permissions: [] })}
                        className="text-[10px] text-[#717975] font-semibold underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#fbf9f2] p-3 border border-[#deddd3]">
                    {MODULE_PERMISSIONS.map((perm) => {
                      const isChecked = addForm.permissions?.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className="flex items-start gap-2 p-1.5 hover:bg-white transition-colors cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const nextPerms = e.target.checked
                                ? [...(addForm.permissions || []), perm.key]
                                : (addForm.permissions || []).filter((p) => p !== perm.key);
                              setAddForm({ ...addForm, permissions: nextPerms });
                            }}
                            className="mt-0.5 accent-[#073a2d]"
                          />
                          <div>
                            <p className="font-semibold text-[#1b1c18] text-[11px]">{perm.label}</p>
                            <p className="text-[10px] text-[#69726d]">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-xs text-[#404945] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addForm.mustChangePassword}
                  onChange={(e) => setAddForm({ ...addForm, mustChangePassword: e.target.checked })}
                  className="accent-[#073a2d]"
                />
                <span>Require staff to update to their private password on first login</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#deddd3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#deddd3] text-xs text-[#404945] hover:bg-[#f0eee7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingAdd ? 'Creating...' : 'Create Staff User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT STAFF MEMBER ================= */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#deddd3] max-w-xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#deddd3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#073a2d]/10 flex items-center justify-center text-[#073a2d]">
                  <Edit2 className="w-4 h-4 text-[#073a2d]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1b1c18]">Edit Staff Clearance</h3>
                  <p className="text-[11px] text-[#69726d]">{editingStaff.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-[#717975] hover:text-[#1b1c18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs outline-none focus:border-[#073a2d]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs outline-none focus:border-[#073a2d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    Role
                  </label>
                  <select
                    disabled={editingStaff.email === 'admin@ronginlibas.com'}
                    value={editForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value as StaffUser['role'];
                      setEditForm({
                        ...editForm,
                        role: newRole,
                        permissions: newRole === 'SUPER_ADMIN' ? MODULE_PERMISSIONS.map((m) => m.key) : editForm.permissions,
                      });
                    }}
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs bg-white outline-none focus:border-[#073a2d] disabled:bg-[#f0eee7]"
                  >
                    <option value="MANAGER">Staff Manager (Custom Module Access)</option>
                    <option value="ADMIN">Administrator (Custom Module Access)</option>
                    <option value="SUPER_ADMIN">Super Admin (Unrestricted Atelier Access)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                    Account Status
                  </label>
                  <select
                    disabled={editingStaff.email === 'admin@ronginlibas.com'}
                    value={editForm.isActive ? 'active' : 'suspended'}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                    className="w-full h-10 px-3 border border-[#deddd3] text-xs bg-white outline-none focus:border-[#073a2d] disabled:bg-[#f0eee7]"
                  >
                    <option value="active">Active (Permitted)</option>
                    <option value="suspended">Suspended (Access Revoked)</option>
                  </select>
                </div>
              </div>

              {/* Module Permissions Checkbox Matrix */}
              {editForm.role !== 'SUPER_ADMIN' && (
                <div className="space-y-2 pt-1 border-t border-[#deddd3]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#073a2d] uppercase tracking-wider block">
                      Assigned Module Permissions
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, permissions: MODULE_PERMISSIONS.map((m) => m.key) })}
                        className="text-[10px] text-[#073a2d] font-semibold underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-[#deddd3]">|</span>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, permissions: [] })}
                        className="text-[10px] text-[#717975] font-semibold underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#fbf9f2] p-3 border border-[#deddd3]">
                    {MODULE_PERMISSIONS.map((perm) => {
                      const isChecked = editForm.permissions?.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className="flex items-start gap-2 p-1.5 hover:bg-white transition-colors cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const nextPerms = e.target.checked
                                ? [...(editForm.permissions || []), perm.key]
                                : (editForm.permissions || []).filter((p) => p !== perm.key);
                              setEditForm({ ...editForm, permissions: nextPerms });
                            }}
                            className="mt-0.5 accent-[#073a2d]"
                          />
                          <div>
                            <p className="font-semibold text-[#1b1c18] text-[11px]">{perm.label}</p>
                            <p className="text-[10px] text-[#69726d]">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#deddd3]">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 border border-[#deddd3] text-xs text-[#404945] hover:bg-[#f0eee7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: SUPER ADMIN RESET PASSWORD ================= */}
      {resettingPwStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#deddd3] max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#deddd3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#c79a45]/20 flex items-center justify-center text-[#8c6722]">
                  <KeyRound className="w-4 h-4 text-[#8c6722]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1b1c18]">Reset Password</h3>
                  <p className="text-[11px] text-[#69726d]">For {resettingPwStaff.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResettingPwStaff(null)}
                className="text-[#717975] hover:text-[#1b1c18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminResetPwSubmit} className="space-y-4 pt-4">
              <p className="text-xs text-[#404945] leading-relaxed">
                As Super Admin, you can assign a new initial password. The staff member will be required to update it to their private password upon logging in.
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#404945] uppercase tracking-wider block">
                  New Password (min 6 characters)
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newAdminResetPw}
                  onChange={(e) => setNewAdminResetPw(e.target.value)}
                  placeholder="Enter temporary password"
                  className="w-full h-10 px-3 border border-[#deddd3] text-xs outline-none focus:border-[#073a2d]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#deddd3]">
                <button
                  type="button"
                  onClick={() => setResettingPwStaff(null)}
                  className="px-4 py-2 border border-[#deddd3] text-xs text-[#404945] hover:bg-[#f0eee7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResetPw}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingResetPw && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingResetPw ? 'Resetting...' : 'Set New Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DELETE CONFIRMATION ================= */}
      {deletingStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#deddd3] max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1b1c18]">Delete Staff Account</h3>
                <p className="text-xs text-[#69726d]">{deletingStaff.email}</p>
              </div>
            </div>

            <p className="text-xs text-[#404945] mb-6">
              Are you sure you want to remove <span className="font-semibold text-[#1b1c18]">{deletingStaff.firstName} {deletingStaff.lastName}</span>? They will no longer be able to log in to the admin panel.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs text-[#404945] hover:bg-[#f0eee7] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmittingDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ba1a1a] hover:bg-[#991b1b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmittingDelete ? 'Deleting...' : 'Delete Member'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffPage() {
  return (
    <PermissionGuard permission="staff" moduleName="Staff & Roles">
      <StaffContent />
    </PermissionGuard>
  );
}
