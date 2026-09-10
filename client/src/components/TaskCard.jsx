import React from 'react';
import {
  Clock,
  AlertTriangle,
  MessageSquare,
  Calendar,
  MessageCircle,
  Mail,
  Phone,
  Ticket
} from 'lucide-react';
import {
  PRIORITY_CONFIG,
  getChannelMeta,
  isTaskOverdue,
  isTaskStale,
  formatDueDate
} from '../utils/helpers';
import { useTasks } from '../context/TaskContext';

export default function TaskCard({ task, onDragStart }) {
  const { openTaskDetail } = useTasks();

  const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const overdue = isTaskOverdue(task);
  const stale = isTaskStale(task) || task.status === 'BLOCKED';
  const channelMeta = getChannelMeta(task.requesterContact || task.requesterName);

  const ChannelIcon = () => {
    if (!channelMeta) return null;
    if (channelMeta.type === 'whatsapp') return <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (channelMeta.type === 'email') return <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
    if (channelMeta.type === 'phone') return <Phone className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
    return <Ticket className="w-3.5 h-3.5 text-stone-400 shrink-0" />;
  };

  return (
    <div
      id={`task-card-${task.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        if (onDragStart) onDragStart(task);
      }}
      onClick={() => openTaskDetail(task.id)}
      className="bg-white border border-stone-200/90 hover:border-stone-300 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all cursor-pointer flex flex-col gap-3 group"
    >
      {/* Top Tag Row: Priority, Category, Overdue, Follow-up */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority Pill */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${priorityMeta.bg} ${priorityMeta.text} ${priorityMeta.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
            {priorityMeta.label}
          </span>

          {/* Category Pill */}
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200/80">
            {task.category || 'General'}
          </span>
        </div>

        {/* Overdue / Follow-up alert tags */}
        <div className="flex items-center gap-1.5">
          {overdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Overdue
            </span>
          )}
          {stale && !overdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              Follow-up
            </span>
          )}
        </div>
      </div>

      {/* Task Title */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed font-sans">
            {task.description}
          </p>
        )}
      </div>

      {/* Requester & Channel Strip */}
      {task.requesterName && (
        <div className="flex items-center justify-between gap-2 bg-stone-50/80 px-2.5 py-1.5 rounded-lg border border-stone-200/60 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <ChannelIcon />
            <span className="text-stone-400 text-[11px]">From:</span>
            <span className="text-stone-700 font-medium truncate">{task.requesterName}</span>
          </div>

          {channelMeta && (
            <span className="text-[10px] font-medium text-stone-500 shrink-0 font-sans">
              {channelMeta.label}
            </span>
          )}
        </div>
      )}

      {/* Card Footer: Assignee on Left, Date & Comments on Right */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
        {/* Assignee */}
        <div className="flex items-center gap-1.5 min-w-0">
          {task.assignee ? (
            <div className="flex items-center gap-1.5 truncate">
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-5 h-5 rounded-full object-cover border border-stone-200 shrink-0"
              />
              <span className="text-stone-700 font-medium truncate">
                {task.assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-stone-400 italic text-[11px]">Unassigned</span>
          )}
        </div>

        {/* Due Date & Comments Counter */}
        <div className="flex items-center gap-3 shrink-0 text-stone-400">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 font-sans ${
                overdue ? 'text-rose-700 font-semibold' : 'text-stone-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDueDate(task.dueDate)}</span>
            </span>
          )}

          {task._count?.comments > 0 && (
            <span className="flex items-center gap-1 text-stone-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task._count.comments}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
