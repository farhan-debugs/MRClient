import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Check,
  Calendar
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  PRIORITY_CONFIG,
  isTaskOverdue,
  formatDueDate
} from '../utils/helpers';

export default function MyWorkView() {
  const { tasks, openTaskDetail, updateTaskStatus } = useTasks();
  const { activeUser } = useAuth();

  const myTasks = tasks.filter((t) => t.assigneeId === activeUser?.id);
  const overdueTasks = myTasks.filter((t) => t.status !== 'DONE' && isTaskOverdue(t));
  const inProgressTasks = myTasks.filter((t) => t.status === 'IN_PROGRESS' && !isTaskOverdue(t));
  const newTasks = myTasks.filter((t) => (t.status === 'NEW' || t.status === 'BLOCKED') && !isTaskOverdue(t));
  const completedTasks = myTasks.filter((t) => t.status === 'DONE');

  const Section = ({ title, items, emptyText }) => (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
        <h3 className="font-serif font-bold text-base text-stone-900">{title}</h3>
        <span className="text-xs text-stone-400 font-sans border border-stone-200 rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-stone-400 italic text-xs py-4">{emptyText}</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((task) => {
            const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
            const overdue = isTaskOverdue(task);

            return (
              <div
                key={task.id}
                onClick={() => openTaskDetail(task.id)}
                className="p-3 rounded-lg border border-stone-200 hover:border-stone-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
                    <h4 className="text-xs font-semibold text-stone-900 truncate">
                      {task.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                    <span>{task.category}</span>
                    {task.requesterName && <span>&bull; From: {task.requesterName}</span>}
                    {task.dueDate && (
                      <span className={`font-mono ${overdue ? 'text-rose-700 font-semibold' : ''}`}>
                        &bull; Due: {formatDueDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {task.status !== 'DONE' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'DONE')}
                      className="px-2.5 py-1 text-xs font-medium bg-stone-900 hover:bg-black text-white rounded-md transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img
            src={activeUser?.avatar}
            alt={activeUser?.name}
            className="w-12 h-12 rounded-full object-cover border border-stone-200"
          />
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-900">{activeUser?.name}</h2>
            <p className="text-xs text-stone-500">
              Assigned queue &bull; {myTasks.length} tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-center">
          <div className="px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="text-lg font-bold text-stone-900">{myTasks.filter((t) => t.status !== 'DONE').length}</span>
            <p className="text-[10px] text-stone-400 uppercase font-semibold">Active</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="text-lg font-bold text-rose-800">{overdueTasks.length}</span>
            <p className="text-[10px] text-stone-400 uppercase font-semibold">Overdue</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section title="Overdue Attention" items={overdueTasks} emptyText="No overdue requests." />
        <Section title="In Progress" items={inProgressTasks} emptyText="No tasks currently in progress." />
        <Section title="To Do" items={newTasks} emptyText="No queued items." />
        <Section title="Completed" items={completedTasks} emptyText="No completed items yet." />
      </div>
    </div>
  );
}
