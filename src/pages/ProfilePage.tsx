import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { User as UserIcon, Mail, Phone, Shield, BookOpen, Layers, Calendar, MapPin, CreditCard, GraduationCap } from 'lucide-react';

interface Field {
  label: string;
  value?: string | number;
  icon: React.ReactNode;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI
      .me()
      .then((res) => setDetails(res.data))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const account = details?.user || user;
  const student = details?.student;
  const teacher = details?.teacher;
  const icon = (C: React.ElementType) => <C className="w-4 h-4" />;

  const accountFields: Field[] = [
    { label: 'Full Name', value: account.name, icon: icon(UserIcon) },
    { label: 'Email', value: account.email, icon: icon(Mail) },
    { label: 'Phone', value: account.phone || student?.phone || teacher?.phone, icon: icon(Phone) },
    { label: 'Role', value: account.role, icon: icon(Shield) },
  ];

  let roleTitle = '';
  let roleFields: Field[] = [];
  if (student) {
    roleTitle = 'Academic Details';
    roleFields = [
      { label: 'Course', value: student.course, icon: icon(BookOpen) },
      { label: 'Batch', value: student.batch, icon: icon(Layers) },
      { label: 'Admission Date', value: student.admissionDate, icon: icon(Calendar) },
      { label: 'Gender', value: student.gender, icon: icon(UserIcon) },
      { label: 'Address', value: student.address, icon: icon(MapPin) },
      { label: 'Total Fee', value: `Rs. ${Number(student.totalFee || 0).toLocaleString()}`, icon: icon(CreditCard) },
      { label: 'Paid Fee', value: `Rs. ${Number(student.paidFee || 0).toLocaleString()}`, icon: icon(CreditCard) },
      { label: 'Remaining Fee', value: `Rs. ${Number(student.remainingFee || 0).toLocaleString()}`, icon: icon(CreditCard) },
    ];
  } else if (teacher) {
    roleTitle = 'Faculty Details';
    roleFields = [
      { label: 'Subject', value: teacher.subject, icon: icon(GraduationCap) },
      { label: 'Joining Date', value: teacher.joiningDate, icon: icon(Calendar) },
    ];
  }

  const renderFields = (fields: Field[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="mt-0.5 text-indigo-600">{f.icon}</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.label}</p>
            <p className="text-xs font-semibold text-slate-800 break-words">{f.value || '—'}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center text-2xl font-bold">
          {account.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{account.name}</h2>
          <p className="text-xs text-slate-500">{account.email}</p>
          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
            {account.role}
          </span>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Account Information</h3>
        {renderFields(accountFields)}
      </div>

      {roleFields.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">{roleTitle}</h3>
          {renderFields(roleFields)}
        </div>
      )}
    </div>
  );
};
