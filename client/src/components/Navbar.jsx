import React, { useState } from 'react';
import {
  Plus,
  Bell,
  ChevronDown,
  UserCheck,
  LayoutGrid,
  Table,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { users, activeUser, switchUser } = useAuth();
  const { view, setView, setIsCreateModalOpen, unreadCount } = useTasks();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navTabs = [
    { id: 'board', label: 'The Board', icon: LayoutGrid },
    { id: 'table', label: 'Table View', icon: Table },
    { id: 'my-work', label: 'My Work', icon: CheckCircle2 },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
  ];

  return (
    <header className="pt-6 pb-2">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top utility row: Sub-navigation & Persona switcher */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-6">
          {/* Subtle View Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navTabs.map((tab) => {
              const isActive = view === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setView(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right side utilities: notifications & user switch */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications-bell"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-md hover:bg-stone-200/60 text-stone-500 hover:text-stone-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Demo Person Switcher */}
            <div className="relative">
              <button
                id="btn-user-switcher"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs transition-colors shadow-sm"
              >
                <img
                  src={activeUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'}
                  alt={activeUser?.name || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-stone-300"
                />
                <span className="font-medium text-stone-800">{activeUser?.name || 'Team Member'}</span>
                <span className="text-[10px] text-stone-400 font-mono">({activeUser?.role})</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showUserMenu && (
                <div
                  id="user-switcher-dropdown"
                  className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in duration-100"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    Switch User
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {users.map((u) => {
                      const isSelected = activeUser?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          id={`switch-user-${u.id}`}
                          onClick={() => {
                            switchUser(u);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-stone-100 text-stone-900 font-semibold'
                              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-6 h-6 rounded-full object-cover border border-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{u.name}</p>
                            <p className="text-[10px] text-stone-400">{u.role}</p>
                          </div>
                          {isSelected && <UserCheck className="w-3.5 h-3.5 text-stone-900 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The Exact Header from User Screenshot */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline flex-wrap">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
              The Board
            </h1>
            <span className="text-sm sm:text-base text-stone-500 font-sans font-normal ml-3.5">
              one place for every client request
            </span>
          </div>

          <button
            id="btn-quick-intake"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#18181b] hover:bg-black text-white rounded-lg text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <span>+ New request</span>
          </button>
        </div>
      </div>
    </header>
  );
}
