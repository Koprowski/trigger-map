import { PrismaClient, NodeType } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Test user creation
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('✅ Successfully created test user:', testUser);

    // Test trigger map creation
    const testMap = await prisma.triggerMap.create({
      data: {
        goal: 'Test Goal',
        userId: testUser.id,
        nodes: {
          create: [
            {
              content: 'Test Trigger',
              type: NodeType.TRIGGER,
              order: 0.0,
            },
          ],
        },
      },
      include: {
        nodes: true,
      },
    });
    console.log('✅ Successfully created test trigger map:', testMap);

    // Clean up test data
    await prisma.triggerMap.delete({
      where: { id: testMap.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Successfully cleaned up test data');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 