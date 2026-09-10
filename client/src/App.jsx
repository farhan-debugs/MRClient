import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import KanbanBoard from './components/KanbanBoard';
import TableView from './components/TableView';
import MyWorkView from './components/MyWorkView';
import DashboardView from './components/DashboardView';
import CreateTaskModal from './components/CreateTaskModal';
import TaskModal from './components/TaskModal';
import { useTasks } from './context/TaskContext';

export default function App() {
  const { view, setIsCreateModalOpen, isCreateModalOpen, selectedTaskId } = useTasks();

  // Global Keyboard shortcut: Press 'N' to open Quick Intake
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key.toLowerCase() === 'n' &&
        !isCreateModalOpen &&
        !selectedTaskId &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, selectedTaskId, setIsCreateModalOpen]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-900 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <Navbar />

      {/* Main Workspace matching screenshot width */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col">
        {view === 'board' && <KanbanBoard />}
        {view === 'table' && <TableView />}
        {view === 'my-work' && <MyWorkView />}
        {view === 'dashboard' && <DashboardView />}
      </main>

      {/* Global Modals */}
      <CreateTaskModal />
      <TaskModal />
    </div>
  );
}
