import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Mail,
  Phone,
  Ticket,
  AlertCircle
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/helpers';

export default function CreateTaskModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, createTask } = useTasks();
  const { users } = useAuth();
  const titleInputRef = useRef(null);

  const [channelType, setChannelType] = useState('whatsapp');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Client Request',
    priority: 'MEDIUM',
    status: 'NEW',
    requesterName: '',
    requesterContact: '',
    assigneeId: '',
    dueDate: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCreateModalOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isCreateModalOpen]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a title for this request');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      let finalContact = formData.requesterContact;
      if (finalContact && !finalContact.toLowerCase().includes(channelType)) {
        finalContact = `${channelType.toUpperCase()} - ${finalContact}`;
      } else if (!finalContact && channelType !== 'portal') {
        finalContact = `${channelType.toUpperCase()} Direct`;
      }

      await createTask({
        ...formData,
        requesterContact: finalContact
      });

      setFormData({
        title: '',
        description: '',
        category: 'Client Request',
        priority: 'MEDIUM',
        status: 'NEW',
        requesterName: '',
        requesterContact: '',
        assigneeId: '',
        dueDate: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const setQuickDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setFormData((prev) => ({
      ...prev,
      dueDate: d.toISOString().split('T')[0]
    }));
  };

  return (
    <div
      id="quick-intake-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={() => setIsCreateModalOpen(false)}
    >
      <div
        id="quick-intake-modal"
        className="w-full max-w-lg bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit();
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/50">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              New Client Request
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Quickly record a request from WhatsApp, email, or direct contact
            </p>
          </div>

          <button
            id="btn-close-intake-modal"
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Request Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              id="intake-title-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Broken AC in conference room 3"
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
              required
            />
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Source Channel
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
                { id: 'email', label: 'Email', icon: Mail, color: 'text-sky-700 bg-sky-50 border-sky-300' },
                { id: 'phone', label: 'Phone', icon: Phone, color: 'text-purple-700 bg-purple-50 border-purple-300' },
                { id: 'portal', label: 'Direct', icon: Ticket, color: 'text-stone-700 bg-stone-100 border-stone-300' }
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = channelType === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannelType(ch.id)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? `${ch.color} font-semibold shadow-sm ring-1 ring-stone-400`
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requester Contact Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">
                Client / Requester Name
              </label>
              <input
                type="text"
                id="intake-requester-name"
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="e.g. Dr. Aris Thorne"
                className="w-full px-2.5 py-1.5 rounded-md border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">
                Contact Details (Number/Email)
              </label>
              <input
                type="text"
                id="intake-requester-contact"
                value={formData.requesterContact}
                onChange={(e) => setFormData({ ...formData, requesterContact: e.target.value })}
                placeholder="+1 555-0192"
                className="w-full px-2.5 py-1.5 rounded-md border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                id="intake-category-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white focus:outline-none focus:border-stone-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
              <select
                id="intake-priority-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white focus:outline-none focus:border-stone-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent 🔥</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Assignee</label>
              <select
                id="intake-assignee-select"
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white focus:outline-none focus:border-stone-500"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Due Date</label>
              <input
                type="date"
                id="intake-due-date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white focus:outline-none focus:border-stone-500"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(7)}
                  className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium"
                >
                  Next Week
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description / Specifics
            </label>
            <textarea
              id="intake-description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter client instructions, model numbers, or notes..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-stone-200 rounded font-mono text-[10px]">Ctrl+Enter</kbd> to save
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-task"
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181b] hover:bg-black text-white text-xs font-medium shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : 'Create Request'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
