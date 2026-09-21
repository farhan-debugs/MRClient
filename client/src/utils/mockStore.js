// In-browser mock store for standalone / GitHub Pages demo mode
// Automatically used when the Express backend is unavailable.

const INITIAL_USERS = [
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@business.com',
    role: 'MANAGER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex@business.com',
    role: 'MEMBER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_maya',
    name: 'Maya Chen',
    email: 'maya@business.com',
    role: 'MEMBER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_liam',
    name: 'Liam Patel',
    email: 'liam@business.com',
    role: 'MEMBER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

function getInitialTasks() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
  const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'task_1',
      title: 'Emergency Server HVAC Unit Failure - North Data Closet',
      description: 'The secondary cooling system in Server Room B is throwing Error Code E-44. Ambient temp reached 84°F. Emergency vendor dispatched.',
      category: 'Maintenance',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      requesterName: 'Marcus Vance (Facilities)',
      requesterContact: '+1 (555) 234-8901 / WhatsApp',
      assigneeId: 'user_alex',
      creatorId: 'user_sarah',
      dueDate: yesterday, // Overdue
      createdAt: threeDaysAgo,
      updatedAt: yesterday,
      comments: [
        {
          id: 'comm_1',
          authorId: 'user_alex',
          content: 'Vendor technician arrived at 9am. Replacing coolant valve. Will test temperature curve in 2 hours.',
          createdAt: yesterday
        }
      ],
      activities: [
        {
          id: 'act_1',
          actorId: 'user_sarah',
          details: 'Intake request logged via emergency WhatsApp call',
          timestamp: threeDaysAgo
        },
        {
          id: 'act_2',
          actorId: 'user_sarah',
          details: 'Assigned to Alex Rivera with URGENT priority',
          timestamp: threeDaysAgo
        },
        {
          id: 'act_3',
          actorId: 'user_alex',
          details: 'Moved from NEW to IN_PROGRESS',
          timestamp: yesterday
        }
      ]
    },
    {
      id: 'task_2',
      title: 'POS Terminal Touchscreen Replacements (Waiting for Vendor)',
      description: '3 point-of-sale registers need new digitizer screens. Units are unboxed, awaiting warranty authorization token from hardware distributor.',
      category: 'Hardware',
      priority: 'HIGH',
      status: 'BLOCKED',
      requesterName: 'Rachel Green (Store 104)',
      requesterContact: 'rachel.g@retailclient.com',
      assigneeId: 'user_liam',
      creatorId: 'user_sarah',
      dueDate: tomorrow,
      createdAt: fiveDaysAgo,
      updatedAt: fourDaysAgo, // Stale > 3 days
      comments: [
        {
          id: 'comm_2',
          authorId: 'user_liam',
          content: 'Chased distributor rep on WhatsApp twice. No answer yet. Escalating to account director.',
          createdAt: fourDaysAgo
        }
      ],
      activities: [
        {
          id: 'act_4',
          actorId: 'user_sarah',
          details: 'Logged from email ticket request',
          timestamp: fiveDaysAgo
        },
        {
          id: 'act_5',
          actorId: 'user_liam',
          details: 'Changed status to BLOCKED: Vendor RMA approval pending',
          timestamp: fourDaysAgo
        }
      ]
    },
    {
      id: 'task_3',
      title: 'New Client Onboarding: Westside Medical Group Network Audit',
      description: 'Deliver initial network topology mapping, firewall scan, and password policy review for Westside Medical 4 satellite clinics.',
      category: 'Client Request',
      priority: 'MEDIUM',
      status: 'NEW',
      requesterName: 'Dr. Aris Thorne',
      requesterContact: 'admin@westsidemed.org / 555-443-1212',
      assigneeId: 'user_maya',
      creatorId: 'user_sarah',
      dueDate: nextWeek,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      comments: [],
      activities: [
        {
          id: 'act_6',
          actorId: 'user_sarah',
          details: 'New client inquiry captured via intake modal',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'task_4',
      title: 'Automated Offsite Database Backups Configuration',
      description: 'Implement nightly encrypted snapshots to Cloud Storage with retention policy of 90 days and weekly recovery drill verification.',
      category: 'Operations',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      requesterName: 'Sarah Jenkins (Internal)',
      requesterContact: 'sarah@business.com',
      assigneeId: 'user_alex',
      creatorId: 'user_sarah',
      dueDate: inThreeDays,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      comments: [],
      activities: [
        {
          id: 'act_7',
          actorId: 'user_sarah',
          details: 'Task created for Q3 infrastructure reliability',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'act_8',
          actorId: 'user_alex',
          details: 'Moved to IN_PROGRESS. Script writing started.',
          timestamp: yesterday
        }
      ]
    },
    {
      id: 'task_5',
      title: 'Client Portal SSL Certificate Renewal & DNS Propagation',
      description: 'Renewed wildcard SSL certificate *.clientservice.io. Verified all webhook endpoints and subdomains are responding on HTTPS.',
      category: 'Maintenance',
      priority: 'MEDIUM',
      status: 'DONE',
      requesterName: 'DevOps Alerts',
      requesterContact: 'alerts@clientservice.io',
      assigneeId: 'user_maya',
      creatorId: 'user_sarah',
      dueDate: yesterday,
      createdAt: threeDaysAgo,
      updatedAt: yesterday,
      comments: [],
      activities: [
        {
          id: 'act_9',
          actorId: 'user_sarah',
          details: 'Created from automated cert expiration reminder',
          timestamp: threeDaysAgo
        },
        {
          id: 'act_10',
          actorId: 'user_maya',
          details: 'Marked DONE. Cert tested on Chrome, Safari, and curl.',
          timestamp: yesterday
        }
      ]
    }
  ];
}

const STORAGE_KEYS = {
  USERS: 'mrclient_demo_users',
  TASKS: 'mrclient_demo_tasks',
  NOTIFICATIONS: 'mrclient_demo_notifications'
};

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

class MockStore {
  constructor() {
    this.users = loadStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.tasks = loadStored(STORAGE_KEYS.TASKS, getInitialTasks());
    this.notifications = loadStored(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_1',
        userId: 'user_alex',
        taskId: 'task_1',
        title: 'Overdue Warning',
        message: 'Task "Emergency Server HVAC Unit Failure" is past due.',
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif_2',
        userId: 'user_liam',
        taskId: 'task_2',
        title: 'Task Stagnant Alert',
        message: 'Task "POS Terminal Touchscreen Replacements" has been BLOCKED for 4 days.',
        isRead: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif_3',
        userId: 'user_maya',
        taskId: 'task_3',
        title: 'New Assignment',
        message: 'You have been assigned to "Westside Medical Group Network Audit".',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]);
  }

  save() {
    saveStored(STORAGE_KEYS.USERS, this.users);
    saveStored(STORAGE_KEYS.TASKS, this.tasks);
    saveStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  getActiveUserId() {
    return localStorage.getItem('activeUserId') || 'user_sarah';
  }

  getUser(id) {
    return this.users.find((u) => u.id === id) || null;
  }

  formatTask(task) {
    const assignee = this.getUser(task.assigneeId);
    const creator = this.getUser(task.creatorId);

    const commentsWithAuthor = (task.comments || []).map((c) => ({
      ...c,
      author: this.getUser(c.authorId) || { name: 'Unknown', avatar: '' }
    }));

    const activitiesWithActor = (task.activities || []).map((a) => ({
      ...a,
      actor: this.getUser(a.actorId) || { name: 'System', avatar: '' }
    }));

    return {
      ...task,
      assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email, avatar: assignee.avatar, role: assignee.role } : null,
      creator: creator ? { id: creator.id, name: creator.name, email: creator.email, avatar: creator.avatar } : null,
      comments: commentsWithAuthor,
      activities: activitiesWithActor,
      _count: {
        comments: task.comments?.length || 0,
        activities: task.activities?.length || 0
      }
    };
  }

  // Users
  getUsers() {
    return this.users;
  }

  getMe() {
    const activeId = this.getActiveUserId();
    return this.getUser(activeId) || this.users[0];
  }

  // Tasks
  getTasks(params = {}) {
    let result = [...this.tasks];
    const now = new Date();

    if (params.status && params.status !== 'ALL') {
      result = result.filter((t) => t.status === params.status);
    }
    if (params.priority && params.priority !== 'ALL') {
      result = result.filter((t) => t.priority === params.priority);
    }
    if (params.category && params.category !== 'ALL') {
      result = result.filter((t) => t.category === params.category);
    }
    if (params.assigneeId && params.assigneeId !== 'ALL') {
      if (params.assigneeId === 'UNASSIGNED') {
        result = result.filter((t) => !t.assigneeId);
      } else {
        result = result.filter((t) => t.assigneeId === params.assigneeId);
      }
    }
    if (params.myWork === 'true') {
      const activeId = this.getActiveUserId();
      result = result.filter((t) => t.assigneeId === activeId);
    }
    if (params.overdue === 'true') {
      result = result.filter((t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now);
    }
    if (params.stale === 'true') {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      result = result.filter((t) => t.status !== 'DONE' && new Date(t.updatedAt) < threeDaysAgo);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter((t) =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.requesterName && t.requesterName.toLowerCase().includes(q)) ||
        (t.requesterContact && t.requesterContact.toLowerCase().includes(q))
      );
    }

    return result.map((t) => this.formatTask(t));
  }

  getTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    return this.formatTask(task);
  }

  createTask(data) {
    const activeUserId = this.getActiveUserId();
    const now = new Date().toISOString();
    const newTask = {
      id: 'task_' + Date.now(),
      title: data.title,
      description: data.description || '',
      category: data.category || 'Client Request',
      priority: data.priority || 'MEDIUM',
      status: data.status || 'NEW',
      requesterName: data.requesterName || 'Direct Request',
      requesterContact: data.requesterContact || '',
      assigneeId: data.assigneeId || null,
      creatorId: activeUserId,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      createdAt: now,
      updatedAt: now,
      comments: [],
      activities: [
        {
          id: 'act_' + Date.now(),
          actorId: activeUserId,
          details: 'Created task via quick intake',
          timestamp: now
        }
      ]
    };

    this.tasks.unshift(newTask);
    this.save();
    return this.formatTask(newTask);
  }

  updateTask(id, data) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');

    const activeUserId = this.getActiveUserId();
    const current = this.tasks[index];
    const now = new Date().toISOString();

    const activityDetails = [];
    if (data.status && data.status !== current.status) {
      activityDetails.push(`Changed status to ${data.status}`);
    }
    if (data.assigneeId !== undefined && data.assigneeId !== current.assigneeId) {
      const newAssignee = this.getUser(data.assigneeId);
      activityDetails.push(`Assigned to ${newAssignee ? newAssignee.name : 'Unassigned'}`);
    }
    if (data.priority && data.priority !== current.priority) {
      activityDetails.push(`Updated priority to ${data.priority}`);
    }
    if (data.description && data.description !== current.description) {
      activityDetails.push('Updated description/notes');
    }

    const newActivities = [...(current.activities || [])];
    activityDetails.forEach((det, idx) => {
      newActivities.unshift({
        id: 'act_' + Date.now() + '_' + idx,
        actorId: activeUserId,
        details: det,
        timestamp: now
      });
    });

    const updated = {
      ...current,
      ...data,
      activities: newActivities,
      updatedAt: now
    };

    this.tasks[index] = updated;
    this.save();
    return this.formatTask(updated);
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.save();
    return { success: true };
  }

  addComment(taskId, content) {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error('Task not found');

    const activeUserId = this.getActiveUserId();
    const now = new Date().toISOString();

    const newComment = {
      id: 'comm_' + Date.now(),
      authorId: activeUserId,
      content,
      createdAt: now
    };

    if (!this.tasks[index].comments) {
      this.tasks[index].comments = [];
    }
    this.tasks[index].comments.push(newComment);
    this.tasks[index].updatedAt = now;

    this.save();
    return {
      ...newComment,
      author: this.getUser(activeUserId)
    };
  }

  // Dashboard Stats
  getDashboardStats() {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const byStatus = { NEW: 0, IN_PROGRESS: 0, BLOCKED: 0, DONE: 0 };
    const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };

    let totalOpen = 0;
    let overdueCount = 0;
    let staleCount = 0;
    let doneThisWeek = 0;
    const bottlenecks = [];

    const memberWorkloadMap = {};
    this.users.forEach((u) => {
      memberWorkloadMap[u.id] = {
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        role: u.role,
        totalAssigned: 0,
        openTasks: 0,
        overdueTasks: 0
      };
    });

    this.tasks.forEach((task) => {
      if (byStatus[task.status] !== undefined) byStatus[task.status]++;
      if (byPriority[task.priority] !== undefined) byPriority[task.priority]++;

      const isOpen = task.status !== 'DONE';
      const isOverdue = isOpen && task.dueDate && new Date(task.dueDate) < now;
      const isStale = isOpen && new Date(task.updatedAt) < threeDaysAgo;

      if (isOpen) totalOpen++;
      if (isOverdue) overdueCount++;
      if (isStale) staleCount++;
      if (task.status === 'DONE' && new Date(task.updatedAt) >= sevenDaysAgo) doneThisWeek++;

      if (task.status === 'BLOCKED' || (isOpen && isStale)) {
        const daysInactive = Math.floor((now - new Date(task.updatedAt)) / (1000 * 60 * 60 * 24));
        bottlenecks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          assignee: this.getUser(task.assigneeId)?.name || 'Unassigned',
          daysInactive: Math.max(daysInactive, 0),
          isOverdue: !!isOverdue
        });
      }

      if (task.assigneeId && memberWorkloadMap[task.assigneeId]) {
        memberWorkloadMap[task.assigneeId].totalAssigned++;
        if (isOpen) memberWorkloadMap[task.assigneeId].openTasks++;
        if (isOverdue) memberWorkloadMap[task.assigneeId].overdueTasks++;
      }
    });

    const recentActivities = [];
    this.tasks.forEach((t) => {
      (t.activities || []).forEach((act) => {
        recentActivities.push({
          id: act.id,
          timestamp: act.timestamp,
          details: act.details,
          actor: this.getUser(act.actorId) || { name: 'System', avatar: '' },
          task: { id: t.id, title: t.title }
        });
      });
    });
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      summary: {
        totalOpen,
        overdueCount,
        staleCount,
        doneThisWeek,
        totalTasks: this.tasks.length
      },
      byStatus,
      byPriority,
      workloadByMember: Object.values(memberWorkloadMap),
      bottlenecks: bottlenecks.sort((a, b) => b.daysInactive - a.daysInactive),
      recentActivities: recentActivities.slice(0, 8)
    };
  }

  // Notifications
  getNotifications() {
    const activeUserId = this.getActiveUserId();
    const userNotifs = this.notifications.filter((n) => n.userId === activeUserId);
    const unreadCount = userNotifs.filter((n) => !n.isRead).length;
    return { notifications: userNotifs, unreadCount };
  }

  markNotificationRead(id) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
    return notif || { id, isRead: true };
  }

  markAllNotificationsRead() {
    const activeUserId = this.getActiveUserId();
    this.notifications.forEach((n) => {
      if (n.userId === activeUserId) n.isRead = true;
    });
    this.save();
    return { success: true };
  }
}

export const mockStore = new MockStore();
