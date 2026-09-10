import { Router } from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { createNotification, logActivity } from '../services/notificationService.js';

const router = Router();

// GET /api/tasks (with filters & search)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, assigneeId, priority, category, search, overdue, stale, myWork } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (assigneeId && assigneeId !== 'ALL') {
      where.assigneeId = assigneeId === 'UNASSIGNED' ? null : assigneeId;
    }

    if (myWork === 'true') {
      where.assigneeId = req.user.id;
    }

    const now = new Date();

    if (overdue === 'true') {
      where.dueDate = { lt: now };
      where.status = { not: 'DONE' };
    }

    if (stale === 'true') {
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      where.updatedAt = { lt: threeDaysAgo };
      where.status = { not: 'DONE' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { requesterName: { contains: search } },
        { requesterContact: { contains: search } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, role: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        _count: {
          select: { comments: true, activities: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, role: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        activities: {
          include: {
            actor: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks (Fast 30-sec intake)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'General',
      priority = 'MEDIUM',
      status = 'NEW',
      requesterName,
      requesterContact,
      assigneeId,
      dueDate
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category,
        priority,
        status,
        requesterName: requesterName?.trim() || null,
        requesterContact: requesterContact?.trim() || null,
        assigneeId: assigneeId || null,
        creatorId: req.user?.id || null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: true,
        creator: true
      }
    });

    // Log Activity
    await logActivity({
      taskId: task.id,
      actorId: req.user?.id,
      actionType: 'CREATED',
      details: `Request created via Quick Intake by ${req.user?.name || 'User'}`
    });

    // Notify Assignee if assigned
    if (assigneeId && assigneeId !== req.user?.id) {
      await createNotification({
        userId: assigneeId,
        taskId: task.id,
        title: 'New Task Assigned',
        message: `${req.user?.name || 'Someone'} assigned you to "${task.title}"`
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { assignee: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const {
      title,
      description,
      category,
      priority,
      status,
      requesterName,
      requesterContact,
      assigneeId,
      dueDate
    } = req.body;

    const data = {};
    const activitiesToLog = [];

    if (title !== undefined && title !== existing.title) {
      data.title = title.trim();
      activitiesToLog.push(`Updated title to "${title}"`);
    }

    if (description !== undefined && description !== existing.description) {
      data.description = description;
      activitiesToLog.push('Updated task details & notes');
    }

    if (category !== undefined && category !== existing.category) {
      data.category = category;
      activitiesToLog.push(`Changed category from ${existing.category} to ${category}`);
    }

    if (priority !== undefined && priority !== existing.priority) {
      data.priority = priority;
      activitiesToLog.push(`Changed priority from ${existing.priority} to ${priority}`);
    }

    if (status !== undefined && status !== existing.status) {
      data.status = status;
      activitiesToLog.push(`Moved status from ${existing.status} to ${status}`);
    }

    if (requesterName !== undefined && requesterName !== existing.requesterName) {
      data.requesterName = requesterName;
    }

    if (requesterContact !== undefined && requesterContact !== existing.requesterContact) {
      data.requesterContact = requesterContact;
    }

    if (dueDate !== undefined) {
      const newDue = dueDate ? new Date(dueDate) : null;
      data.dueDate = newDue;
      activitiesToLog.push(
        newDue
          ? `Due date set to ${newDue.toLocaleDateString()}`
          : 'Cleared due date'
      );
    }

    if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
      data.assigneeId = assigneeId || null;
      let newAssigneeName = 'Unassigned';
      if (assigneeId) {
        const newAssignee = await prisma.user.findUnique({ where: { id: assigneeId } });
        newAssigneeName = newAssignee?.name || 'Someone';

        if (assigneeId !== req.user?.id) {
          await createNotification({
            userId: assigneeId,
            taskId: existing.id,
            title: 'Task Reassigned to You',
            message: `${req.user?.name || 'A team member'} assigned you to "${existing.title}"`
          });
        }
      }
      activitiesToLog.push(`Reassigned task to ${newAssigneeName}`);
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, role: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    // Save activity logs
    for (const logText of activitiesToLog) {
      await logActivity({
        taskId: updated.id,
        actorId: req.user?.id,
        actionType: 'UPDATED',
        details: logText
      });
    }

    // Status change notification to requester or assignee if different actor
    if (status && status !== existing.status && existing.assigneeId && existing.assigneeId !== req.user?.id) {
      await createNotification({
        userId: existing.assigneeId,
        taskId: updated.id,
        title: 'Status Updated',
        message: `Task "${updated.title}" moved to ${status}`
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { assignee: true, creator: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId: task.id,
        authorId: req.user.id,
        content: content.trim()
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    // Log Activity
    await logActivity({
      taskId: task.id,
      actorId: req.user.id,
      actionType: 'COMMENT_ADDED',
      details: `${req.user.name} posted an update comment`
    });

    // Notify assignee if not the author
    if (task.assigneeId && task.assigneeId !== req.user.id) {
      await createNotification({
        userId: task.assigneeId,
        taskId: task.id,
        title: 'New Comment on Task',
        message: `${req.user.name}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`
      });
    }

    // Touch task updatedAt
    await prisma.task.update({
      where: { id: task.id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
