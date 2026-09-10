import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  Users,
  AlertOctagon,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { formatRelativeTime } from '../utils/helpers';

export default function DashboardView() {
  const { dashboardStats, fetchDashboardStats, openTaskDetail, setView, setFilters } = useTasks();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400 text-xs">
        Loading insights...
      </div>
    );
  }

  const { summary, byStatus, workloadByMember, bottlenecks, recentActivities } = dashboardStats;

  const filterAndJump = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value
    }));
    setView('board');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => filterAndJump('status', 'ALL')}
          className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-stone-300"
        >
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 leading-none">
            {summary.totalOpen}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-1.5">open requests</div>
        </div>

        <div
          onClick={() => filterAndJump('overdue', true)}
          className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-stone-300"
        >
          <div className="text-2xl sm:text-3xl font-bold text-[#991b1b] leading-none">
            {summary.overdueCount}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-1.5">overdue</div>
        </div>

        <div
          onClick={() => filterAndJump('stale', true)}
          className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-stone-300"
        >
          <div className="text-2xl sm:text-3xl font-bold text-[#92400e] leading-none">
            {summary.staleCount}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-1.5">need follow-up</div>
        </div>

        <div
          onClick={() => filterAndJump('status', 'DONE')}
          className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-stone-300"
        >
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 leading-none">
            {summary.doneThisWeek}
          </div>
          <div className="text-xs text-stone-500 lowercase mt-1.5">done this week</div>
        </div>
      </div>

      {/* Grid: Workload and Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900">Team Workload</h3>
            <span className="text-xs text-stone-400">{workloadByMember.length} Members</span>
          </div>

          <div className="space-y-3">
            {workloadByMember.map((m) => (
              <div
                key={m.userId}
                onClick={() => filterAndJump('assigneeId', m.userId)}
                className="p-3 rounded-lg border border-stone-100 hover:border-stone-200 transition-colors cursor-pointer flex items-center justify-between bg-stone-50/50"
              >
                <div className="flex items-center gap-2.5">
                  <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border border-stone-200" />
                  <div>
                    <p className="text-xs font-semibold text-stone-900">{m.name}</p>
                    <p className="text-[10px] text-stone-400 uppercase">{m.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.overdueTasks > 0 && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {m.overdueTasks} overdue
                    </span>
                  )}
                  <span className="text-xs font-bold text-stone-900">{m.openTasks} active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stagnant Bottlenecks */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900">Needs Follow-Up / Stalled</h3>
            <span className="text-xs text-stone-400">{bottlenecks.length} Items</span>
          </div>

          <div className="space-y-3">
            {bottlenecks.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-6 text-center">No stalled requests.</p>
            ) : (
              bottlenecks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openTaskDetail(item.id)}
                  className="p-3 rounded-lg border border-stone-100 hover:border-stone-200 transition-colors cursor-pointer flex items-center justify-between bg-stone-50/50"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-stone-400">Owner: {item.assignee}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    {item.daysInactive}d inactive
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-2.5">
          Recent Activity
        </h3>
        <div className="divide-y divide-stone-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-2.5 flex items-start gap-3">
              <img
                src={act.actor?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-stone-200 shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-700">
                  <span className="font-semibold text-stone-900">{act.actor?.name || 'System'}: </span>
                  {act.details}
                  {act.task && (
                    <span
                      onClick={() => openTaskDetail(act.task.id)}
                      className="ml-1 text-stone-900 hover:underline cursor-pointer font-medium"
                    >
                      on "{act.task.title}"
                    </span>
                  )}
                </p>
                <span className="text-[10px] text-stone-400 font-mono">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
