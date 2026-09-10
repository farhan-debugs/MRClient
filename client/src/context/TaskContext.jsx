import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { activeUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('board'); // 'board' | 'table' | 'my-work' | 'dashboard'
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    assigneeId: 'ALL',
    overdue: false,
    stale: false
  });

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loadingSelectedTask, setLoadingSelectedTask] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (view === 'my-work' && activeUser) {
        params.assigneeId = activeUser.id;
      }
      const data = await api.getTasks(params);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, view, activeUser]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!activeUser) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [activeUser]);

  useEffect(() => {
    fetchTasks();
    if (view === 'dashboard') {
      fetchDashboardStats();
    }
    fetchNotifications();
  }, [fetchTasks, view, fetchDashboardStats, fetchNotifications]);

  // Load single task for detail drawer
  const openTaskDetail = async (id) => {
    setSelectedTaskId(id);
    try {
      setLoadingSelectedTask(true);
      const task = await api.getTask(id);
      setSelectedTask(task);
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoadingSelectedTask(false);
    }
  };

  const closeTaskDetail = () => {
    setSelectedTaskId(null);
    setSelectedTask(null);
  };

  // Quick Status Update
  const updateTaskStatus = async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
    );

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await api.updateTask(taskId, { status: newStatus });
      // Re-fetch to synchronize activity log & notifications
      fetchNotifications();
      if (view === 'dashboard') fetchDashboardStats();
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchTasks(); // rollback
    }
  };

  // Generic Task Update
  const updateTask = async (taskId, updates) => {
    try {
      const updated = await api.updateTask(taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask && selectedTask.id === taskId) {
        // Re-load fresh task with full audit log
        const fresh = await api.getTask(taskId);
        setSelectedTask(fresh);
      }
      fetchNotifications();
      if (view === 'dashboard') fetchDashboardStats();
      return updated;
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  };

  // Create Task
  const createTask = async (taskData) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      setIsCreateModalOpen(false);
      fetchNotifications();
      if (view === 'dashboard') fetchDashboardStats();
      return newTask;
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  };

  // Delete Task
  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTaskId === taskId) {
        closeTaskDetail();
      }
      if (view === 'dashboard') fetchDashboardStats();
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  };

  // Add Comment
  const addComment = async (taskId, content) => {
    try {
      const comment = await api.addComment(taskId, content);
      if (selectedTask && selectedTask.id === taskId) {
        const fresh = await api.getTask(taskId);
        setSelectedTask(fresh);
      }
      fetchNotifications();
      return comment;
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        view,
        setView,
        filters,
        setFilters,
        selectedTaskId,
        selectedTask,
        loadingSelectedTask,
        openTaskDetail,
        closeTaskDetail,
        isCreateModalOpen,
        setIsCreateModalOpen,
        updateTaskStatus,
        updateTask,
        createTask,
        deleteTask,
        addComment,
        dashboardStats,
        fetchDashboardStats,
        notifications,
        unreadCount,
        fetchNotifications,
        refreshTasks: fetchTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
