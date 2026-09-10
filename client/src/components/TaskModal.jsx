import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Clock,
  MessageSquare,
  History,
  Trash2,
  Send,
  AlertTriangle,
  Phone,
  FileText
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  CATEGORIES,
  getChannelMeta,
  formatDueDate,
  formatRelativeTime
} from '../utils/helpers';

export default function TaskModal() {
  const {
    selectedTaskId,
    selectedTask,
    loadingSelectedTask,
    closeTaskDetail,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addComment
  } = useTasks();
  const { users } = useAuth();

  const [activeTab, setActiveTab] = useState('comments');
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  if (!selectedTaskId) return null;

  const handleStatusClick = async (newStatus) => {
    if (selectedTask?.status === newStatus) return;
    await updateTaskStatus(selectedTask.id, newStatus);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setPostingComment(true);
      await addComment(selectedTask.id, commentText);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateTask(selectedTask.id, { description: notesDraft });
      setIsEditingNotes(false);
    } catch (err) {
      console.error(err);
    }
  };

  const channelMeta = selectedTask
    ? getChannelMeta(selectedTask.requesterContact || selectedTask.requesterName)
    : null;

  return (
    <div
      id="task-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={closeTaskDetail}
    >
      <div
        id="task-detail-modal"
        className="w-full max-w-4xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/50">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-700 uppercase tracking-wider">
              {selectedTask?.category || 'General'}
            </span>
            <span>&bull;</span>
            <span>Created {formatRelativeTime(selectedTask?.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-delete-task"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  deleteTask(selectedTaskId);
                }
              }}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="btn-close-task-detail"
              onClick={closeTaskDetail}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loadingSelectedTask || !selectedTask ? (
          <div className="p-16 text-center text-stone-400 text-sm">Loading task details...</div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Left Column */}
            <div className="flex-1 p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-stone-200 space-y-5">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 leading-snug">
                {selectedTask.title}
              </h2>

              {/* Status Stepper */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'NEW', label: 'To do' },
                    { key: 'IN_PROGRESS', label: 'In progress' },
                    { key: 'BLOCKED', label: 'Blocked' },
                    { key: 'DONE', label: 'Done' }
                  ].map((st) => {
                    const isCurrent = selectedTask.status === st.key;
                    return (
                      <button
                        key={st.key}
                        id={`btn-status-${st.key.toLowerCase()}`}
                        onClick={() => handleStatusClick(st.key)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                          isCurrent
                            ? 'bg-stone-900 border-stone-900 text-white font-semibold shadow-sm'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-stone-50/70 border border-stone-200">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    id="task-detail-priority-select"
                    value={selectedTask.priority}
                    onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent 🔥</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Assignee
                  </label>
                  <select
                    id="task-detail-assignee-select"
                    value={selectedTask.assigneeId || ''}
                    onChange={(e) => updateTask(selectedTask.id, { assigneeId: e.target.value || null })}
                    className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-500"
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
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="task-detail-due-date"
                    value={selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''}
                    onChange={(e) =>
                      updateTask(selectedTask.id, { dueDate: e.target.value || null })
                    }
                    className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1 text-xs text-stone-800 focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    id="task-detail-category-select"
                    value={selectedTask.category}
                    onChange={(e) => updateTask(selectedTask.id, { category: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-md px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requester Box */}
              <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Requester / Origin
                </div>
                <div className="text-xs text-stone-800 flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{selectedTask.requesterName || 'Internal'}</span>
                  {selectedTask.requesterContact && (
                    <span className="text-stone-500 font-mono text-[11px]">({selectedTask.requesterContact})</span>
                  )}
                </div>
              </div>

              {/* Description & Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Notes & Description
                  </span>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => {
                        setNotesDraft(selectedTask.description || '');
                        setIsEditingNotes(true);
                      }}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium hover:underline"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs text-stone-500 hover:text-stone-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="text-xs text-stone-900 font-semibold hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingNotes ? (
                  <div className="p-3.5 rounded-xl bg-stone-50/50 border border-stone-200 text-xs text-stone-700 leading-relaxed min-h-[70px] whitespace-pre-wrap font-sans">
                    {selectedTask.description || (
                      <span className="text-stone-400 italic">No notes provided for this request.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-400 text-xs text-stone-900 focus:outline-none resize-none leading-relaxed"
                  />
                )}
              </div>
            </div>

            {/* Right Column: Comments & Audit Trail */}
            <div className="w-full lg:w-96 flex flex-col bg-stone-50/30">
              {/* Tabs */}
              <div className="flex border-b border-stone-200 bg-stone-50">
                <button
                  id="tab-btn-comments"
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'comments'
                      ? 'border-stone-900 text-stone-900 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Comments ({selectedTask.comments?.length || 0})
                </button>

                <button
                  id="tab-btn-activity"
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-stone-900 text-stone-900 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Audit Trail ({selectedTask.activities?.length || 0})
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeTab === 'comments' ? (
                  <div className="space-y-2.5">
                    {selectedTask.comments?.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-8 italic">
                        No comments yet. Post an update below.
                      </p>
                    ) : (
                      selectedTask.comments?.map((c) => (
                        <div key={c.id} className="p-3 rounded-lg bg-white border border-stone-200 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-stone-800">
                              {c.author.name}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {formatRelativeTime(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="border-l border-stone-200 ml-2 pl-3.5 space-y-3.5 py-1">
                    {selectedTask.activities?.map((act) => (
                      <div key={act.id} className="relative">
                        <span className="absolute -left-[18px] top-1.5 w-2 h-2 rounded-full bg-stone-400" />
                        <div>
                          <p className="text-xs text-stone-700">
                            <span className="font-semibold text-stone-900">
                              {act.actor?.name || 'System'}:{' '}
                            </span>
                            {act.details}
                          </p>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {formatRelativeTime(act.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment Input */}
              {activeTab === 'comments' && (
                <form
                  onSubmit={handleCommentSubmit}
                  className="p-3 border-t border-stone-200 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    id="comment-input-field"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-1.5 rounded-md border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500"
                  />
                  <button
                    id="btn-post-comment"
                    type="submit"
                    disabled={postingComment || !commentText.trim()}
                    className="px-3 py-1.5 rounded-md bg-stone-900 hover:bg-black text-white text-xs font-medium disabled:opacity-40 transition-colors"
                  >
                    Post
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
