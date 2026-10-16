import React, { useState, useEffect } from 'react';
import { supportTicketsAPI } from '../../services/api.ts';
import { Modal } from '../../components/Modal.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  HelpCircle,
  Plus,
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export const StudentSupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Ticket Modal State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Fee Issue');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Active Ticket Details Modal State
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await supportTicketsAPI.getAll();
      setTickets(res.data);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!subject.trim() || !message.trim()) {
      setFormError('Subject and message are required.');
      return;
    }

    try {
      setCreating(true);
      await supportTicketsAPI.create({
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });
      setIsNewTicketOpen(false);
      setSubject('');
      setMessage('');
      loadTickets();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setCreating(false);
    }
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
      console.error('Error adding reply:', err);
    } finally {
      setReplying(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    if (window.confirm('Mark this support ticket as Closed?')) {
      try {
        const res = await supportTicketsAPI.updateStatus(activeTicket._id, 'Closed');
        setActiveTicket(res.data);
        loadTickets();
      } catch (err) {
        console.error('Error closing ticket:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Student Support Desk</h2>
          <p className="text-xs text-slate-500 font-medium">
            Submit official inquiries to academy administrators and instructors.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsNewTicketOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-xs text-slate-800 bg-slate-50/50">
          My Submitted Tickets
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No support tickets</p>
            <p className="text-xs text-slate-400 mt-1">Need help with fees or attendance? Create a ticket!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Conversation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{t.ticketId}</td>
                    <td className="py-3 px-4 max-w-xs truncate font-semibold text-slate-900">
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
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveTicket(t);
                          setReplyText('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        View ({t.replies?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        title="Create Student Support Ticket"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Attendance correction request for March 2nd"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Fee Issue">Fee Issue</option>
                <option value="Attendance Issue">Attendance Issue</option>
                <option value="Course Query">Course Query</option>
                <option value="Teacher Query">Teacher Query</option>
                <option value="Quiz Issue">Quiz Issue</option>
                <option value="Technical Problem">Technical Problem</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Description *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide full details of your issue so staff can help you promptly..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewTicketOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs disabled:opacity-50"
            >
              {creating ? 'Submitting Ticket...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Conversation View Modal */}
      <Modal
        isOpen={!!activeTicket}
        onClose={() => setActiveTicket(null)}
        title={activeTicket ? `${activeTicket.ticketId}: ${activeTicket.subject}` : 'Ticket'}
        maxWidth="lg"
      >
        {activeTicket && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold text-slate-800">{activeTicket.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={activeTicket.status} />
                {activeTicket.status !== 'Closed' && (
                  <button
                    onClick={handleCloseTicket}
                    className="text-xs text-slate-500 hover:text-slate-900 underline font-semibold"
                  >
                    Mark Closed
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto p-1">
              {/* Student initial issue */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-900">You (Student)</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(activeTicket.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{activeTicket.message}</p>
              </div>

              {/* Replies */}
              {activeTicket.replies?.map((r: any, idx: number) => {
                const isStudent = r.senderRole === 'student';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      isStudent
                        ? 'bg-blue-50/70 border-blue-100 text-slate-800'
                        : 'bg-purple-50/70 border-purple-100 text-purple-950 ml-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
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

            {/* Reply Form */}
            {activeTicket.status !== 'Closed' ? (
              <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Reply to Staff:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                This ticket is marked as Closed.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
