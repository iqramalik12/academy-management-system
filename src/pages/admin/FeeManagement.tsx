import React, { useState, useEffect } from 'react';
import { feesAPI, studentsAPI } from '../../services/api.ts';
import { Modal } from '../../components/Modal.tsx';
import { Badge } from '../../components/Badge.tsx';
import { Search, Plus, CreditCard, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'Easypaisa' | 'JazzCash'>('Bank');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fRes, sRes] = await Promise.all([
        feesAPI.getAll({ search }),
        studentsAPI.getAll(),
      ]);
      setFees(fRes.data);
      setStudents(sRes.data);
      if (sRes.data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(sRes.data[0]._id);
        setPaymentAmount(Math.min(200, sRes.data[0].remainingFee));
      }
    } catch (err) {
      console.error('Error loading fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openAddPaymentModal = () => {
    // Find first student with remaining fee > 0 if possible
    const owingStudent = students.find((s) => s.remainingFee > 0) || students[0];
    if (owingStudent) {
      setSelectedStudentId(owingStudent._id);
      setPaymentAmount(owingStudent.remainingFee > 0 ? Math.min(200, owingStudent.remainingFee) : 0);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Bank');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleStudentChange = (sId: string) => {
    setSelectedStudentId(sId);
    const st = students.find((s) => s._id === sId);
    if (st) {
      setPaymentAmount(st.remainingFee > 0 ? Math.min(200, st.remainingFee) : 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const st = students.find((s) => s._id === selectedStudentId);
    if (!st) {
      setFormError('Please select a student.');
      return;
    }

    if (paymentAmount <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }

    if (paymentAmount > st.remainingFee) {
      setFormError(
        `Payment ($${paymentAmount}) cannot exceed remaining balance of $${st.remainingFee}.`
      );
      return;
    }

    try {
      await feesAPI.addPayment({
        studentId: selectedStudentId,
        paymentAmount: Number(paymentAmount),
        paymentMethod,
        paymentDate,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Payment submission failed.');
    }
  };

  const activeStudent = students.find((s) => s._id === selectedStudentId);

  const totalCollected = fees.reduce((sum, f) => sum + (f.paymentAmount || 0), 0);
  const totalPending = students.reduce((sum, s) => sum + (s.remainingFee || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Fee Management</h2>
          <p className="text-xs text-slate-500 font-medium">
            Record payments, enforce validation, and reconcile tuition invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60 bg-white"
            />
          </form>
          <button
            onClick={openAddPaymentModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Tuition Collected
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">
              ${totalCollected.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Verified via cash & banking</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Outstanding Receivables
            </span>
            <span className="text-2xl font-extrabold text-amber-600">
              ${totalPending.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Pending across active cohorts</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Payment Receipts History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-xs text-slate-800 bg-slate-50/50">
          Payment Transactions Ledger
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading payment ledger...</div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No payment records yet</p>
            <p className="text-xs text-slate-400 mt-1">Record a payment transaction above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Student Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{fee.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{fee.studentEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 text-sm">
                      +${fee.paymentAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {fee.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{fee.paymentDate}</td>
                    <td className="py-3 px-4">
                      <div className="text-[11px]">
                        Total: <span className="font-semibold">${fee.totalFee}</span> | Paid:{' '}
                        <span className="font-semibold text-emerald-600">${fee.paidFee}</span> | Due:{' '}
                        <span className="font-semibold text-amber-600">${fee.remainingFee}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Student Tuition Payment"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentName} — Due: ${s.remainingFee} (Total: ${s.totalFee})
                </option>
              ))}
            </select>
          </div>

          {activeStudent && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Course:</span>
                <span className="font-bold text-slate-800">{activeStudent.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Tuition:</span>
                <span className="font-bold text-slate-800">${activeStudent.totalFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="font-bold text-emerald-600">${activeStudent.paidFee}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-indigo-200">
                <span className="font-bold text-indigo-900">Current Remaining Balance:</span>
                <span className="font-extrabold text-amber-700 text-sm">
                  ${activeStudent.remainingFee}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
              <input
                type="number"
                min="1"
                max={activeStudent?.remainingFee || 9999}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Cannot exceed ${activeStudent?.remainingFee || 0}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="JazzCash">JazzCash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!activeStudent || activeStudent.remainingFee === 0}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
