import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { isTaskOverdue, isTaskStale } from '../utils/helpers';
import TaskCard from './TaskCard';

export default function KanbanBoard() {
  const {
    tasks,
    updateTaskStatus,
    filters,
    setFilters
  } = useTasks();
  const { users } = useAuth();
  const [activeDropCol, setActiveDropCol] = useState(null);

  // 3-Column pipeline exactly matching the reference design
  const columns = [
    { key: 'NEW', label: 'To do' },
    { key: 'IN_PROGRESS', label: 'In progress' },
    { key: 'DONE', label: 'Done' }
  ];

  // Calculate live metric counts
  const openCount = tasks.filter((t) => t.status !== 'DONE').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'DONE' && isTaskOverdue(t)
  ).length;
  const needFollowUpCount = tasks.filter(
    (t) => t.status !== 'DONE' && (t.status === 'BLOCKED' || isTaskStale(t))
  ).length;
  const doneThisWeekCount = tasks.filter((t) => {
    if (t.status !== 'DONE') return false;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(t.updatedAt) >= sevenDaysAgo;
  }).length;

  // Handle Drag & Drop
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setActiveDropCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
    }
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    if (activeDropCol !== col) {
      setActiveDropCol(col);
    }
  };

  const handleDragLeave = () => {
    setActiveDropCol(null);
  };

  // Filter tasks based on "Needs follow-up only" toggle
  const displayedTasks = tasks.filter((t) => {
    if (filters.stale && t.status !== 'BLOCKED' && !isTaskStale(t) && !isTaskOverdue(t)) {
      return false;
    }
    return true;
  });

  // Helper to get tasks for each of the 3 columns
  const getTasksForColumn = (colKey) => {
    if (colKey === 'NEW') {
      return displayedTasks.filter((t) => t.status === 'NEW');
    }
    if (colKey === 'IN_PROGRESS') {
      return displayedTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'BLOCKED');
    }
    if (colKey === 'DONE') {
      return displayedTasks.filter((t) => t.status === 'DONE');
    }
    return [];
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 4 Summary Metric Cards (Exact match to screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Open Requests */}
        <div
          onClick={() => setFilters((p) => ({ ...p, status: 'ALL', stale: false, overdue: false }))}
          className="bg-white border border-stone-200/90 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer hover:border-stone-300 transition-colors"
        >
          <div className="text-3xl font-bold font-sans text-stone-900 leading-none">
            {openCount}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-2 font-normal">
            open requests
          </div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setFilters((p) => ({ ...p, overdue: !p.overdue }))}
          className={`bg-white border rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer transition-colors ${
            filters.overdue ? 'border-rose-400 ring-1 ring-rose-300' : 'border-stone-200/90 hover:border-stone-300'
          }`}
        >
          <div className="text-3xl font-bold font-sans text-[#991b1b] leading-none">
            {overdueCount}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-2 font-normal">
            overdue
          </div>
        </div>

        {/* Need Follow-up */}
        <div
          onClick={() => setFilters((p) => ({ ...p, stale: !p.stale }))}
          className={`bg-white border rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer transition-colors ${
            filters.stale ? 'border-amber-400 ring-1 ring-amber-300' : 'border-stone-200/90 hover:border-stone-300'
          }`}
        >
          <div className="text-3xl font-bold font-sans text-[#92400e] leading-none">
            {needFollowUpCount}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-2 font-normal">
            need follow-up
          </div>
        </div>

        {/* Done This Week */}
        <div
          onClick={() => setFilters((p) => ({ ...p, status: 'DONE', stale: false, overdue: false }))}
          className="bg-white border border-stone-200/90 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer hover:border-stone-300 transition-colors"
        >
          <div className="text-3xl font-bold font-sans text-stone-900 leading-none">
            {doneThisWeekCount}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-2 font-normal">
            done this week
          </div>
        </div>
      </div>

      {/* Search and Filters Bar (Exact match to screenshot) */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Search input */}
        <div className="flex-1 min-w-[260px]">
          <input
            type="text"
            id="search-input"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Search title or requester..."
            className="w-full bg-white border border-stone-200 rounded-lg px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          />
        </div>

        {/* Owner Dropdown */}
        <select
          id="select-owner"
          value={filters.assigneeId}
          onChange={(e) => setFilters((p) => ({ ...p, assigneeId: e.target.value }))}
          className="bg-white border border-stone-200 rounded-lg px-3.5 py-2 text-sm text-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none cursor-pointer"
        >
          <option value="ALL">All owners</option>
          <option value="UNASSIGNED">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Priority Dropdown */}
        <select
          id="select-priority"
          value={filters.priority}
          onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
          className="bg-white border border-stone-200 rounded-lg px-3.5 py-2 text-sm text-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none cursor-pointer"
        >
          <option value="ALL">All priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Needs follow-up only pill button */}
        <button
          type="button"
          id="pill-needs-follow-up"
          onClick={() => setFilters((p) => ({ ...p, stale: !p.stale }))}
          className={`rounded-full px-4 py-2 text-xs font-medium border transition-all ${
            filters.stale
              ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
          }`}
        >
          Needs follow-up only
        </button>
      </div>

      {/* 3 Columns Grid: To do, In progress, Done */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-2">
        {columns.map((col) => {
          const colTasks = getTasksForColumn(col.key);
          const isDropTarget = activeDropCol === col.key;

          return (
            <div
              key={col.key}
              id={`kanban-column-${col.key.toLowerCase()}`}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`flex flex-col min-h-[500px] rounded-xl p-1 transition-colors ${
                isDropTarget ? 'bg-stone-200/40 ring-2 ring-stone-400' : ''
              }`}
            >
              {/* Column Header matching screenshot */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h2 className="font-serif font-bold text-xl text-stone-900 tracking-tight">
                  {col.label}
                </h2>
                <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs text-stone-400 font-sans shadow-sm">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Tasks */}
              <div className="space-y-3.5 flex-1">
                {colTasks.length === 0 ? (
                  <div className="text-stone-400 italic text-sm py-4 select-none">
                    Nothing here.
                  </div>
                ) : (
                  colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
