const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.policy.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.smsTemplate.deleteMany();
  await prisma.user.deleteMany();

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Admin User',
      role: 'ADMIN',
      supervisorId: superAdmin.id,
    },
  });

  // Create Broker
  const broker = await prisma.user.create({
    data: {
      email: 'broker@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'John Broker',
      role: 'BROKER',
      supervisorId: admin.id,
    },
  });

  // Create Agents
  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Sarah Agent',
      role: 'AGENT',
      supervisorId: broker.id,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Mike Agent',
      role: 'AGENT',
      supervisorId: broker.id,
    },
  });

  // Create Email Templates
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Welcome Email',
        subject: 'Welcome to Our Insurance Agency',
        body: 'Dear {firstName},\n\nWelcome to our insurance agency! We're excited to help you protect what matters most.',
        createdById: agent1.id,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Policy Renewal',
        subject: 'Your Policy Renewal Notice',
        body: 'Dear {firstName},\n\nYour {policyType} policy is due for renewal on {expiryDate}.',
        createdById: agent1.id,
      },
    }),
  ]);

  // Create SMS Templates
  const smsTemplates = await Promise.all([
    prisma.smsTemplate.create({
      data: {
        name: 'Appointment Reminder',
        body: 'Hi {firstName}, reminder of your insurance consultation tomorrow at {time}. Reply Y to confirm.',
        createdById: agent1.id,
      },
    }),
    prisma.smsTemplate.create({
      data: {
        name: 'Payment Due',
        body: 'Hi {firstName}, your insurance payment of ${amount} is due on {dueDate}.',
        createdById: agent1.id,
      },
    }),
  ]);

  // Create Contacts and Policies for Agent 1
  const contact1 = await prisma.contact.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '555-0101',
      address: '123 Main St, Anytown, USA',
      birthdate: new Date('1985-03-15'),
      workplace: 'Tech Corp',
      status: 'CLIENT',
      tags: ['VIP', 'Multi-Policy'],
      assignedToId: agent1.id,
      notes: 'Referred by Bob Smith',
      policies: {
        create: [
          {
            policyNumber: 'HOME-001',
            type: 'HOME',
            carrier: 'SafeGuard Insurance',
            effectiveDate: new Date('2023-01-01'),
            expiryDate: new Date('2024-01-01'),
            monthlyPremium: 150.00,
            annualPremium: 1800.00,
            notes: 'Premium property coverage',
          },
          {
            policyNumber: 'AUTO-001',
            type: 'AUTO',
            carrier: 'SafeGuard Insurance',
            effectiveDate: new Date('2023-02-01'),
            expiryDate: new Date('2024-02-01'),
            monthlyPremium: 100.00,
            annualPremium: 1200.00,
            notes: 'Multi-car discount applied',
          },
        ],
      },
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '555-0102',
      address: '456 Oak Ave, Anytown, USA',
      birthdate: new Date('1990-06-20'),
      workplace: 'Local Business',
      status: 'SOI',
      tags: ['Referral Source'],
      assignedToId: agent1.id,
      notes: 'Regular referral source',
    },
  });

  // Create Contacts for Agent 2
  const contact3 = await prisma.contact.create({
    data: {
      name: 'Carol White',
      email: 'carol@example.com',
      phone: '555-0103',
      address: '789 Pine Rd, Anytown, USA',
      birthdate: new Date('1988-09-10'),
      workplace: 'Self-employed',
      status: 'LEAD',
      tags: ['Hot Lead', 'Commercial Interest'],
      assignedToId: agent2.id,
      notes: 'Interested in commercial insurance',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
