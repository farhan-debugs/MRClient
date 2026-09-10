import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding demo users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@business.com',
      password: passwordHash,
      role: 'MANAGER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  });

  const alex = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@business.com',
      password: passwordHash,
      role: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const maya = await prisma.user.create({
    data: {
      name: 'Maya Chen',
      email: 'maya@business.com',
      password: passwordHash,
      role: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const liam = await prisma.user.create({
    data: {
      name: 'Liam Patel',
      email: 'liam@business.com',
      password: passwordHash,
      role: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log('Seeding realistic requests & tasks...');
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 1. Overdue Critical Task
  const task1 = await prisma.task.create({
    data: {
      title: 'Emergency Server HVAC Unit Failure - North Data Closet',
      description: 'The secondary cooling system in Server Room B is throwing Error Code E-44. Ambient temp reached 84°F. Emergency vendor dispatched.',
      category: 'Maintenance',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      requesterName: 'Marcus Vance (Facilities)',
      requesterContact: '+1 (555) 234-8901 / WhatsApp',
      assigneeId: alex.id,
      creatorId: sarah.id,
      dueDate: yesterday, // Overdue!
      createdAt: threeDaysAgo,
      updatedAt: yesterday
    }
  });

  await prisma.activityLog.createMany({
    data: [
      {
        taskId: task1.id,
        actorId: sarah.id,
        actionType: 'CREATED',
        details: 'Intake request logged via emergency WhatsApp call',
        timestamp: threeDaysAgo
      },
      {
        taskId: task1.id,
        actorId: sarah.id,
        actionType: 'REASSIGNED',
        details: 'Assigned to Alex Rivera with URGENT priority',
        timestamp: threeDaysAgo
      },
      {
        taskId: task1.id,
        actorId: alex.id,
        actionType: 'STATUS_CHANGED',
        details: 'Moved from NEW to IN_PROGRESS',
        timestamp: twoDaysAgo(now)
      }
    ]
  });

  await prisma.comment.create({
    data: {
      taskId: task1.id,
      authorId: alex.id,
      content: 'Vendor technician arrived at 9am. Replacing coolant valve. Will test temperature curve in 2 hours.',
      createdAt: yesterday
    }
  });

  // 2. Stale / Blocked Task
  const task2 = await prisma.task.create({
    data: {
      title: 'POS Terminal Touchscreen Replacements (Waiting for Vendor)',
      description: '3 point-of-sale registers need new digitizer screens. Units are unboxed, awaiting warranty authorization token from hardware distributor.',
      category: 'Hardware',
      priority: 'HIGH',
      status: 'BLOCKED',
      requesterName: 'Rachel Green (Store 104)',
      requesterContact: 'rachel.g@retailclient.com',
      assigneeId: liam.id,
      creatorId: sarah.id,
      dueDate: tomorrow,
      createdAt: fiveDaysAgo,
      updatedAt: fourDaysAgo(now) // Stale > 3 days!
    }
  });

  await prisma.activityLog.createMany({
    data: [
      {
        taskId: task2.id,
        actorId: sarah.id,
        actionType: 'CREATED',
        details: 'Logged from email ticket request',
        timestamp: fiveDaysAgo
      },
      {
        taskId: task2.id,
        actorId: liam.id,
        actionType: 'STATUS_CHANGED',
        details: 'Changed status to BLOCKED: Vendor RMA approval pending',
        timestamp: fourDaysAgo(now)
      }
    ]
  });

  await prisma.comment.create({
    data: {
      taskId: task2.id,
      authorId: liam.id,
      content: 'Chased distributor rep on WhatsApp twice. No answer yet. Escalating to account director.',
      createdAt: fourDaysAgo(now)
    }
  });

  // 3. New Incoming Request
  const task3 = await prisma.task.create({
    data: {
      title: 'New Client Onboarding: Westside Medical Group Network Audit',
      description: 'Deliver initial network topology mapping, firewall scan, and password policy review for Westside Medical 4 satellite clinics.',
      category: 'Client Request',
      priority: 'MEDIUM',
      status: 'NEW',
      requesterName: 'Dr. Aris Thorne',
      requesterContact: 'admin@westsidemed.org / 555-443-1212',
      assigneeId: maya.id,
      creatorId: sarah.id,
      dueDate: nextWeek,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    }
  });

  await prisma.activityLog.create({
    data: {
      taskId: task3.id,
      actorId: sarah.id,
      actionType: 'CREATED',
      details: 'New client inquiry captured via intake modal',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    }
  });

  // 4. In Progress Task
  const task4 = await prisma.task.create({
    data: {
      title: 'Automated Offsite Database Backups Configuration',
      description: 'Implement nightly encrypted snapshots to Cloud Storage with retention policy of 90 days and weekly recovery drill verification.',
      category: 'Operations',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      requesterName: 'Sarah Jenkins (Internal)',
      requesterContact: 'sarah@business.com',
      assigneeId: alex.id,
      creatorId: sarah.id,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      createdAt: twoDaysAgo(now),
      updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
    }
  });

  await prisma.activityLog.createMany({
    data: [
      {
        taskId: task4.id,
        actorId: sarah.id,
        actionType: 'CREATED',
        details: 'Task created for Q3 infrastructure reliability',
        timestamp: twoDaysAgo(now)
      },
      {
        taskId: task4.id,
        actorId: alex.id,
        actionType: 'STATUS_CHANGED',
        details: 'Moved to IN_PROGRESS. Script writing started.',
        timestamp: yesterday
      }
    ]
  });

  // 5. Done Task
  const task5 = await prisma.task.create({
    data: {
      title: 'Client Portal SSL Certificate Renewal & DNS Propagation',
      description: 'Renewed wildcard SSL certificate *.clientservice.io. Verified all webhook endpoints and subdomains are responding on HTTPS.',
      category: 'Maintenance',
      priority: 'MEDIUM',
      status: 'DONE',
      requesterName: 'DevOps Alerts',
      requesterContact: 'alerts@clientservice.io',
      assigneeId: maya.id,
      creatorId: sarah.id,
      dueDate: yesterday,
      createdAt: threeDaysAgo,
      updatedAt: yesterday
    }
  });

  await prisma.activityLog.createMany({
    data: [
      {
        taskId: task5.id,
        actorId: sarah.id,
        actionType: 'CREATED',
        details: 'Created from automated cert expiration reminder',
        timestamp: threeDaysAgo
      },
      {
        taskId: task5.id,
        actorId: maya.id,
        actionType: 'STATUS_CHANGED',
        details: 'Marked DONE. Cert tested on Chrome, Safari, and curl.',
        timestamp: yesterday
      }
    ]
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        taskId: task1.id,
        title: 'Overdue Warning',
        message: 'Task "Emergency Server HVAC Unit Failure" is past due.',
        isRead: false,
        createdAt: yesterday
      },
      {
        userId: liam.id,
        taskId: task2.id,
        title: 'Task Stagnant Alert',
        message: 'Task "POS Terminal Touchscreen Replacements" has been BLOCKED for 4 days.',
        isRead: false,
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000)
      },
      {
        userId: maya.id,
        taskId: task3.id,
        title: 'New Assignment',
        message: 'You have been assigned to "Westside Medical Group Network Audit".',
        isRead: true,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('Database seeded successfully!');
}

function twoDaysAgo(now) {
  return new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
}

function fourDaysAgo(now) {
  return new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
