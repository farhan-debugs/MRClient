import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  Calendar,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  Filter
} from 'lucide-react';
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  CATEGORIES,
  getChannelMeta,
  isTaskOverdue,
  isTaskStale,
  formatDueDate,
  formatRelativeTime
} from '../utils/helpers';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

export default function TableView() {
  const { tasks, openTaskDetail, updateTaskStatus, deleteTask, filters, setFilters } = useTasks();
  const { users } = useAuth();
  const [sortField, setSortField] = useState('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const sortedTasks = useMemo(() => {
    const list = [...tasks];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'priority') {
        const order = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        valA = order[a.priority] || 0;
        valB = order[b.priority] || 0;
      } else if (sortField === 'dueDate') {
        valA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
        valB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
      } else if (sortField === 'updatedAt') {
        valA = new Date(a.updatedAt).getTime();
        valB = new Date(b.updatedAt).getTime();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [tasks, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500 font-medium mr-1">Filter:</span>

          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1 text-xs text-stone-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">To do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
            className="bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1 text-xs text-stone-800"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
            className="bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1 text-xs text-stone-800"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-stone-400">
          Showing <span className="text-stone-900 font-semibold">{sortedTasks.length}</span> requests
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <th
                onClick={() => toggleSort('title')}
                className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Title</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th
                onClick={() => toggleSort('priority')}
                className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Requester</th>
              <th
                onClick={() => toggleSort('dueDate')}
                className="py-3 px-4 cursor-pointer hover:text-stone-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-400 text-xs italic">
                  Nothing here.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                const statusMeta = STATUS_CONFIG[task.status] || STATUS_CONFIG.NEW;
                const overdue = isTaskOverdue(task);

                return (
                  <tr
                    key={task.id}
                    onClick={() => openTaskDetail(task.id)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-stone-900 truncate">{task.title}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{task.category}</div>
                    </td>

                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className={`text-[11px] font-medium rounded-md px-2 py-0.5 border cursor-pointer ${statusMeta.badgeBg} ${statusMeta.badgeText} ${statusMeta.badgeBorder}`}
                      >
                        <option value="NEW">To do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityMeta.bg} ${priorityMeta.text} ${priorityMeta.border}`}>
                        {priorityMeta.label}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full object-cover border border-stone-200"
                          />
                          <span className="text-stone-700">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-stone-800 font-medium">{task.requesterName || '-'}</span>
                    </td>

                    <td className="py-3 px-4">
                      {task.dueDate ? (
                        <span className={`font-mono text-[11px] ${overdue ? 'text-rose-700 font-semibold' : 'text-stone-500'}`}>
                          {formatDueDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openTaskDetail(task.id)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                          title="Open Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${task.title}"?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
