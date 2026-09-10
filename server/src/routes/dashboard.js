import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [allTasks, users, recentActivities] = await Promise.all([
      prisma.task.findMany({
        include: {
          assignee: {
            select: { id: true, name: true, avatar: true }
          }
        }
      }),
      prisma.user.findMany({
        select: { id: true, name: true, avatar: true, role: true }
      }),
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: { select: { id: true, name: true, avatar: true } },
          task: { select: { id: true, title: true } }
        }
      })
    ]);

    const byStatus = { NEW: 0, IN_PROGRESS: 0, BLOCKED: 0, DONE: 0 };
    const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };

    let totalOpen = 0;
    let overdueCount = 0;
    let staleCount = 0;
    let doneThisWeek = 0;
    const bottlenecks = [];

    // Map for member workload
    const memberWorkloadMap = {};
    users.forEach((u) => {
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

    allTasks.forEach((task) => {
      // By Status
      if (byStatus[task.status] !== undefined) {
        byStatus[task.status]++;
      }

      // By Priority
      if (byPriority[task.priority] !== undefined) {
        byPriority[task.priority]++;
      }

      const isOpen = task.status !== 'DONE';
      const isOverdue = isOpen && task.dueDate && new Date(task.dueDate) < now;
      const isStale = isOpen && new Date(task.updatedAt) < threeDaysAgo;

      if (isOpen) {
        totalOpen++;
      }

      if (isOverdue) {
        overdueCount++;
      }

      if (isStale) {
        staleCount++;
      }

      if (task.status === 'DONE' && new Date(task.updatedAt) >= sevenDaysAgo) {
        doneThisWeek++;
      }

      // Track bottlenecks (Blocked or Stale)
      if (task.status === 'BLOCKED' || (isOpen && isStale)) {
        const daysInactive = Math.floor((now - new Date(task.updatedAt)) / (1000 * 60 * 60 * 24));
        bottlenecks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee?.name || 'Unassigned',
          daysInactive: Math.max(daysInactive, 0),
          isOverdue: !!isOverdue
        });
      }

      // Workload
      if (task.assigneeId && memberWorkloadMap[task.assigneeId]) {
        memberWorkloadMap[task.assigneeId].totalAssigned++;
        if (isOpen) {
          memberWorkloadMap[task.assigneeId].openTasks++;
        }
        if (isOverdue) {
          memberWorkloadMap[task.assigneeId].overdueTasks++;
        }
      }
    });

    res.json({
      summary: {
        totalOpen,
        overdueCount,
        staleCount,
        doneThisWeek,
        totalTasks: allTasks.length
      },
      byStatus,
      byPriority,
      workloadByMember: Object.values(memberWorkloadMap),
      bottlenecks: bottlenecks.sort((a, b) => b.daysInactive - a.daysInactive),
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
