import prisma from '../db.js';

export async function createNotification({ userId, taskId, title, message }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        taskId,
        title,
        message,
        isRead: false
      }
    });
    // Log simulation for email / external alert
    console.log(`[ALERT SIMULATION] To User: ${userId} | ${title}: ${message}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function logActivity({ taskId, actorId, actionType, details }) {
  try {
    return await prisma.activityLog.create({
      data: {
        taskId,
        actorId: actorId || null,
        actionType,
        details,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
