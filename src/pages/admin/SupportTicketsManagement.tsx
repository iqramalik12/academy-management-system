import React, { useState, useEffect } from 'react';
import { supportTicketsAPI } from '../../services/api.ts';
import { Modal } from '../../components/Modal.tsx';
import { Badge } from '../../components/Badge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';

export const SupportTicketsManagement: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Ticket Modal
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await supportTicketsAPI.getAll({
        status: statusFilter,
        search,
      });
      setTickets(res.data);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTickets();
  };

  const openTicket = (t: any) => {
    setActiveTicket(t);
    setReplyText('');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    try {
      setReplying(true);
      const res = await supportTicketsAPI.reply(activeTicket._id, replyText);
      setActiveTicket(res.data);
      setReplyText('');
      loadTickets();
    } catch (err) {
      console.error('Error replying:', err);
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeTicket) return;
    try {
      const res = await supportTicketsAPI.updateStatus(activeTicket._id, newStatus);
      setActiveTicket(res.data);
      loadTickets();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Student Support Tickets</h2>
          <p className="text-xs text-slate-500 font-medium">
            Review student inquiries, reply to active tickets, and manage case statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket ID or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60 bg-white"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading support cases...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No support tickets found</p>
            <p className="text-xs text-slate-400 mt-1">All student inquiries are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{t.ticketId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{t.student.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{t.student.email}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-800 font-semibold">
                      {t.subject}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={t.priority} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openTicket(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        Open Case ({t.replies?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Conversation Modal */}
      <Modal
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
        title={activeTicket ? `${activeTicket.ticketId}: ${activeTicket.subject}` : 'Support Ticket'}
        maxWidth="xl"
      >
        {activeTicket && (
          <div className="space-y-4 text-xs">
            {/* Ticket Header Details */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Submitted by
                </span>
                <span className="font-bold text-slate-800">
                  {activeTicket.student.name} ({activeTicket.student.email})
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Category: {activeTicket.category} | Priority: {activeTicket.priority}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                <select
                  value={activeTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto p-1">
              {/* Initial Student Message */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-blue-900">{activeTicket.student.name} (Student)</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(activeTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{activeTicket.message}</p>
              </div>

              {/* Replies */}
              {activeTicket.replies?.map((r: any, idx: number) => {
                const isAdminOrStaff = r.senderRole !== 'student';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      isAdminOrStaff
                        ? 'bg-purple-50/60 border-purple-100 text-purple-950 ml-4'
                        : 'bg-blue-50/70 border-blue-100 text-slate-800 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold">
                        {r.sender} ({r.senderRole.toUpperCase()})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{r.message}</p>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Post Reply as Staff:
              </label>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the student..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={replying || !replyText.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-700 disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
