import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');
  
  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.document.deleteMany();
  await prisma.report.deleteMany();
  await prisma.task.deleteMany();
  await prisma.event.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.smsTemplate.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing data cleared.');

  // Create Super Admin
  console.log('Creating Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@reve.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Super Admin created:', superAdmin.email);

  // Create Admin
  console.log('Creating Admin...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@reve.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Admin User',
      role: 'ADMIN',
      supervisorId: superAdmin.id,
    },
  });
  console.log('Admin created:', admin.email);

  // Create Broker
  console.log('Creating Broker...');
  const broker = await prisma.user.create({
    data: {
      email: 'broker@reve.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'John Broker',
      role: 'BROKER',
      supervisorId: admin.id,
    },
  });
  console.log('Broker created:', broker.email);

  // Create Agents
  console.log('Creating Agents...');
  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@reve.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Sarah Agent',
      role: 'AGENT',
      supervisorId: broker.id,
    },
  });
  console.log('Agent 1 created:', agent1.email);

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@reve.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Mike Agent',
      role: 'AGENT',
      supervisorId: broker.id,
    },
  });
  console.log('Agent 2 created:', agent2.email);

  // Create Contacts
  console.log('Creating contacts...');
  const contact1 = await prisma.contact.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '555-0101',
      address: '123 Main St, Anytown, USA',
      birthdate: new Date('1985-03-15'),
      workplace: 'Tech Corp',
      status: 'CLIENT',
      tags: {
        interests: ['Auto', 'Home'],
        source: 'Referral',
        priority: 'High'
      },
      assignedToId: agent1.id,
      notes: 'High-value client with multiple policies',
    },
  });
  console.log('Contact 1 created:', contact1.name);

  const contact2 = await prisma.contact.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '555-0102',
      address: '456 Oak Ave, Anytown, USA',
      birthdate: new Date('1990-06-20'),
      workplace: 'Local Business',
      status: 'SOI',
      tags: {
        interests: ['Commercial'],
        source: 'Website',
        priority: 'Medium'
      },
      assignedToId: agent1.id,
      notes: 'Regular referral source, interested in commercial insurance',
    },
  });
  console.log('Contact 2 created:', contact2.name);

  const contact3 = await prisma.contact.create({
    data: {
      name: 'Carol White',
      email: 'carol@example.com',
      phone: '555-0103',
      address: '789 Pine Rd, Anytown, USA',
      birthdate: new Date('1988-09-10'),
      workplace: 'Self-employed',
      status: 'LEAD',
      tags: {
        interests: ['Life'],
        source: 'Cold Call',
        priority: 'Low'
      },
      assignedToId: agent2.id,
      notes: 'Interested in business insurance package',
    },
  });
  console.log('Contact 3 created:', contact3.name);

  // Create Policies
  console.log('Creating policies...');
  const homePolicy = await prisma.policy.create({
    data: {
      contactId: contact1.id,
      policyNumber: 'HOME-001',
      type: 'HOME',
      carrier: 'SafeGuard Insurance',
      effectiveDate: new Date('2023-01-01'),
      expiryDate: new Date('2024-01-01'),
      monthlyPremium: 150.00,
      annualPremium: 1800.00,
      status: 'ACTIVE',
      details: {
        coverage: 500000,
        deductible: 1000,
        provider: 'SafeGuard Insurance'
      },
      notes: 'Premium property coverage',
    },
  });
  console.log('Home policy created:', homePolicy.policyNumber);

  const autoPolicy = await prisma.policy.create({
    data: {
      contactId: contact1.id,
      policyNumber: 'AUTO-001',
      type: 'AUTO',
      carrier: 'SafeGuard Insurance',
      effectiveDate: new Date('2023-02-01'),
      expiryDate: new Date('2024-02-01'),
      monthlyPremium: 100.00,
      annualPremium: 1200.00,
      status: 'ACTIVE',
      details: {
        coverage: 300000,
        deductible: 500,
        provider: 'SafeGuard Insurance'
      },
      notes: 'Multi-car discount applied',
    },
  });
  console.log('Auto policy created:', autoPolicy.policyNumber);

  // Create Tasks
  console.log('Creating tasks...');
  await prisma.task.create({
    data: {
      title: 'Follow up on quote request',
      description: 'Send home insurance quote to Carol',
      dueDate: new Date('2024-01-05'),
      priority: 'HIGH',
      status: 'TODO',
      contactId: contact3.id,
      assignedToId: agent2.id,
      createdById: broker.id,
    },
  });
  console.log('Task created: Follow up on quote request');

  await prisma.task.create({
    data: {
      title: 'Policy renewal review',
      description: 'Review and prepare renewal options for home policy',
      dueDate: new Date('2023-12-15'),
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      contactId: contact1.id,
      assignedToId: agent1.id,
      createdById: agent1.id,
    },
  });
  console.log('Task created: Policy renewal review');

  // Create Calendar Events
  console.log('Creating calendar events...');
  await prisma.event.create({
    data: {
      title: "Policy Review Meeting",
      description: "Annual policy review with Alice Johnson",
      start: new Date("2023-12-20T17:00:00.000Z"),
      end: new Date("2023-12-20T18:00:00.000Z"),
      type: "MEETING",
      contactId: contact1.id,
      createdById: broker.id,
      userId: broker.id
    }
  });

  await prisma.event.create({
    data: {
      title: "Follow-up Call",
      description: "Follow up on quote request with Bob Smith",
      start: new Date("2023-12-21T15:00:00.000Z"),
      end: new Date("2023-12-21T15:30:00.000Z"),
      type: "CALL",
      contactId: contact2.id,
      createdById: broker.id,
      userId: broker.id
    }
  });

  // Create Documents
  console.log('Creating documents...');
  await prisma.document.create({
    data: {
      name: 'Home Insurance Policy Document',
      type: 'POLICY',
      fileUrl: '/documents/policies/HOME-001.pdf',
      contactId: contact1.id,
      policyId: homePolicy.id,
      uploadedById: agent1.id,
    },
  });
  console.log('Document created: Home Insurance Policy Document');

  await prisma.document.create({
    data: {
      name: 'Auto Insurance Policy Document',
      type: 'POLICY',
      fileUrl: '/documents/policies/AUTO-001.pdf',
      contactId: contact1.id,
      policyId: autoPolicy.id,
      uploadedById: agent1.id,
    },
  });
  console.log('Document created: Auto Insurance Policy Document');

  await prisma.document.create({
    data: {
      name: 'Business Requirements',
      type: 'OTHER',
      fileUrl: '/documents/other/business-req.pdf',
      contactId: contact3.id,
      uploadedById: agent2.id,
    },
  });
  console.log('Document created: Business Requirements');

  // Create Reports
  console.log('Creating reports...');
  await prisma.report.create({
    data: {
      title: 'Monthly Sales Report',
      description: 'Insurance policy sales summary for November 2023',
      data: {
        totalPolicies: 45,
        newPolicies: 12,
        renewals: 33,
        revenue: 52000,
        topProducts: ['Home Insurance', 'Auto Insurance'],
        performance: {
          agent1: { policies: 28, revenue: 32000 },
          agent2: { policies: 17, revenue: 20000 },
        },
      },
      createdById: broker.id,
    },
  });
  console.log('Report created: Monthly Sales Report');

  await prisma.report.create({
    data: {
      title: 'Lead Conversion Report',
      description: 'Lead to client conversion analysis Q4 2023',
      data: {
        totalLeads: 85,
        qualifiedLeads: 45,
        conversions: 15,
        conversionRate: '33%',
        leadSources: {
          referral: 40,
          website: 25,
          social: 20,
        },
        topPerformers: ['Sarah Agent', 'Mike Agent'],
      },
      createdById: admin.id,
    },
  });
  console.log('Report created: Lead Conversion Report');

  // Create Email Templates
  console.log('Creating email templates...');
  await prisma.emailTemplate.create({
    data: {
      name: 'Welcome Email',
      subject: 'Welcome to Our Insurance Agency',
      body: 'Dear {firstName},\n\nWelcome to our insurance agency! We\'re excited to help you protect what matters most.',
      createdById: agent1.id,
    },
  });
  console.log('Email template created: Welcome Email');

  await prisma.emailTemplate.create({
    data: {
      name: 'Policy Renewal',
      subject: 'Your Policy Renewal Notice',
      body: 'Dear {firstName},\n\nYour {policyType} policy is due for renewal on {expiryDate}.',
      createdById: agent1.id,
    },
  });
  console.log('Email template created: Policy Renewal');

  // Create SMS Templates
  console.log('Creating SMS templates...');
  await prisma.smsTemplate.create({
    data: {
      name: 'Appointment Reminder',
      body: 'Hi {firstName}, reminder of your insurance consultation tomorrow at {time}. Reply Y to confirm.',
      createdById: agent1.id,
    },
  });
  console.log('SMS template created: Appointment Reminder');

  await prisma.smsTemplate.create({
    data: {
      name: 'Payment Due',
      body: 'Hi {firstName}, your insurance payment of ${amount} is due on {dueDate}.',
      createdById: agent1.id,
    },
  });
  console.log('SMS template created: Payment Due');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
