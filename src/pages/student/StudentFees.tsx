import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { studentsAPI, feesAPI } from '../../services/api.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { Badge } from '../../components/Badge.tsx';
import { CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';

export const StudentFees: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sRes = await studentsAPI.getAll({ search: user?.email });
      const current = sRes.data.find(
        (s: any) => s.email.toLowerCase() === user?.email.toLowerCase()
      ) || sRes.data[0];

      setStudent(current);
      if (current) {
        const fRes = await feesAPI.getAll({ studentId: current._id });
        setFees(fRes.data);
      }
    } catch (err) {
      console.error('Error loading fees data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isCleared = (student?.remainingFee || 0) === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Tuition & Fee Status</h2>
        <p className="text-xs text-slate-500 font-medium">
          Detailed tuition invoice, paid amounts, payment methods, and transaction receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Program Fee"
          value={`$${student?.totalFee || 0}`}
          subtitle={`Course: ${student?.course}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Paid"
          value={`$${student?.paidFee || 0}`}
          subtitle="Cleared installments"
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${student?.remainingFee || 0}`}
          subtitle={isCleared ? 'Tuition fully cleared!' : 'Pending payment'}
          icon={<CreditCard className="w-5 h-5" />}
          color={isCleared ? 'emerald' : 'amber'}
        />
      </div>

      {/* Payment Receipts History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-xs text-slate-800 bg-slate-50/50">
          Payment Receipts Ledger
        </div>

        {fees.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No payments have been logged yet for this account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Receipt Date</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Account Balance After Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{fee.paymentDate}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {fee.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 text-sm">
                      +${fee.paymentAmount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-slate-700">${fee.remainingFee}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
