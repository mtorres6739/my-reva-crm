import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedContacts() {
  try {
    console.log('Starting additional contacts seed...');
    
    // Get all agents and brokers to assign contacts to
    console.log('Finding agents and brokers...');
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['AGENT', 'BROKER']
        }
      }
    });

    console.log(`Found ${users.length} agents/brokers`);

    if (users.length === 0) {
      console.log('No agents or brokers found to assign contacts to');
      return;
    }

    // Create 20 sample contacts
    const contacts = [];
    for (let i = 0; i < 20; i++) {
      const assignedTo = users[Math.floor(Math.random() * users.length)];
      const status = faker.helpers.arrayElement(['LEAD', 'SOI', 'CLIENT', 'ARCHIVED']);
      
      const contact = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number('(###) ###-####'),
        address: faker.location.streetAddress(true),
        birthdate: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
        workplace: faker.company.name(),
        notes: faker.helpers.arrayElement([
          'Interested in home and auto bundle',
          'Looking for better life insurance rates',
          'Needs commercial coverage for new business',
          'Current policy up for renewal next month',
          'Referred by existing client',
          'Requested quote for umbrella policy',
          'Multiple properties need coverage',
          'Recently married, reviewing coverage',
          'New business owner seeking coverage',
          'Moving to new home, needs updated policy'
        ]),
        status,
        tags: {
          interests: faker.helpers.arrayElements(
            ['Auto', 'Home', 'Life', 'Business', 'Umbrella', 'Health'],
            faker.number.int({ min: 1, max: 3 })
          ),
          source: faker.helpers.arrayElement(
            ['Referral', 'Website', 'Cold Call', 'Social Media', 'Event', 'Partner']
          ),
          priority: faker.helpers.arrayElement(['High', 'Medium', 'Low'])
        },
        assignedToId: assignedTo.id
      };

      contacts.push(contact);
      console.log(`Created contact object: ${contact.name}`);
    }

    // Insert all contacts
    console.log('Inserting contacts into database...');
    const result = await prisma.contact.createMany({
      data: contacts,
      skipDuplicates: true,
    });

    console.log(`Successfully created ${result.count} sample contacts`);

    // Create some policies for clients
    console.log('Finding CLIENT contacts...');
    const clientContacts = await prisma.contact.findMany({
      where: { status: 'CLIENT' }
    });
    console.log(`Found ${clientContacts.length} clients`);

    for (const contact of clientContacts) {
      const numPolicies = faker.number.int({ min: 1, max: 3 });
      console.log(`Creating ${numPolicies} policies for client ${contact.name}...`);
      
      for (let i = 0; i < numPolicies; i++) {
        const policyType = faker.helpers.arrayElement(['HOME', 'AUTO', 'LIFE', 'UMBRELLA', 'COMMERCIAL']);
        
        const policy = await prisma.policy.create({
          data: {
            type: policyType,
            policyNumber: faker.string.alphanumeric(10).toUpperCase(),
            effectiveDate: faker.date.past(),
            expiryDate: faker.date.future(),
            monthlyPremium: faker.number.float({ min: 50, max: 500, precision: 2 }),
            annualPremium: faker.number.float({ min: 600, max: 6000, precision: 2 }),
            contactId: contact.id,
            carrier: faker.company.name(),
            status: faker.helpers.arrayElement(['ACTIVE', 'PENDING', 'RENEWAL']),
            details: {
              coverage: faker.number.float({ min: 100000, max: 1000000, precision: 2 }),
              deductible: faker.number.float({ min: 500, max: 5000, precision: 2 }),
              provider: faker.company.name()
            }
          }
        });
        console.log(`Created ${policyType} policy: ${policy.policyNumber}`);
      }
    }

    console.log('Successfully created sample policies for clients');

    // Create some tasks for contacts
    console.log('Creating tasks for contacts...');
    const allContacts = await prisma.contact.findMany();
    console.log(`Found ${allContacts.length} total contacts`);
    
    for (const contact of allContacts) {
      const numTasks = faker.number.int({ min: 0, max: 2 });
      console.log(`Creating ${numTasks} tasks for contact ${contact.name}...`);
      
      for (let i = 0; i < numTasks; i++) {
        const task = await prisma.task.create({
          data: {
            title: faker.helpers.arrayElement([
              'Follow up on quote request',
              'Policy renewal review',
              'Update contact information',
              'Claims assistance needed',
              'Schedule annual review',
              'Document collection pending',
              'Premium payment reminder',
              'Coverage evaluation',
              'Beneficiary update needed',
              'New policy orientation'
            ]),
            description: faker.lorem.paragraph(),
            dueDate: faker.date.future(),
            priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
            status: faker.helpers.arrayElement(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
            contactId: contact.id,
            assignedToId: contact.assignedToId,
            createdById: contact.assignedToId
          }
        });
        console.log(`Created task: ${task.title}`);
      }
    }

    console.log('Successfully created sample tasks for contacts');

  } catch (error) {
    console.error('Error seeding contacts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedContacts();
