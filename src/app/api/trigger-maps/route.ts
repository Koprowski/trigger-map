import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';

// Define the Prisma enum values
const PrismaNodeType = {
  TRIGGER: 'TRIGGER',
  ACTION: 'ACTION',
  OUTCOME: 'OUTCOME',
} as const;

type NodeType = 'TRIGGER' | 'ACTION' | 'OUTCOME';

interface Node {
  type: NodeType;
  content: string;
  order: number;
}

function isValidNodeType(type: any): type is NodeType {
  const validTypes = ['TRIGGER', 'ACTION', 'OUTCOME'];
  return validTypes.includes(type);
}

function generateSlug(text: string, userId: string): string {
  // Convert to lowercase and replace spaces with hyphens
  const baseSlug = text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

  // Add a timestamp to ensure uniqueness
  return `${baseSlug}-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('No session or user email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    const { goal, title, nodes } = data;

    // Add detailed request data logging
    console.log('Received request data:', {
      goal,
      title,
      nodes,
      nodeCount: nodes?.length,
      nodeTypes: nodes?.map((n: Node) => n.type),
      hasValidNodes: nodes?.every((n: Node) => n.content && n.type)
    });

    if ((!goal && !title) || !nodes || !Array.isArray(nodes)) {
      console.error('Invalid request data:', { goal, title, nodes });
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    console.log('Creating trigger map with data:', { goal, title, nodes });

    const now = new Date();
    const slug = generateSlug(goal || title, user.id);

    try {
      // Create the trigger map first
      console.log('Attempting to create trigger map...');
      const triggerMap = await prisma.triggerMap.create({
        data: {
          title: title || goal,
          description: null,
          goal: goal || title,
          userId: user.id,
          createdAt: now,
          updatedAt: now,
        },
      });
      console.log('Successfully created trigger map:', triggerMap);

      // Then create the nodes
      console.log('Attempting to create nodes...');
      const createdNodes = await Promise.all(
        nodes.map((node: Node) => {
          console.log('Creating node:', node);
          // Validate node type
          if (!isValidNodeType(node.type)) {
            throw new Error(`Invalid node type: ${node.type}`);
          }

          // The type is already in the correct format for Prisma
          console.log('Node type validation:', {
            type: node.type,
            isValid: isValidNodeType(node.type),
            validTypes: Object.values(PrismaNodeType)
          });

          return prisma.mapNode.create({
            data: {
              content: node.content,
              type: node.type,  // This should match Prisma's enum exactly
              order: parseFloat(node.order.toString()) || 0,
              triggerMapId: triggerMap.id,
              createdAt: now,
              updatedAt: now,
            },
          });
        })
      );
      console.log('Successfully created nodes:', createdNodes);

      // Fetch the complete trigger map with nodes
      const completeTriggerMap = await prisma.triggerMap.findUnique({
        where: { id: triggerMap.id },
        include: {
          nodes: true,
        },
      });

      console.log('Successfully created complete trigger map:', completeTriggerMap);
      return NextResponse.json(completeTriggerMap);
    } catch (dbError) {
      console.error('Database operation failed:', {
        error: dbError,
        errorName: dbError instanceof Error ? dbError.name : 'Unknown',
        errorMessage: dbError instanceof Error ? dbError.message : 'Unknown',
        errorStack: dbError instanceof Error ? dbError.stack : undefined,
        prismaError: dbError instanceof Error ? (dbError as any).code : undefined,
        prismaMeta: dbError instanceof Error ? (dbError as any).meta : undefined,
        query: dbError instanceof Error ? (dbError as any).query : undefined,
      });
      throw dbError;
    }
  } catch (error) {
    console.error('Error in POST /api/trigger-maps:', {
      error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown',
      errorStack: error instanceof Error ? error.stack : undefined,
      prismaError: error instanceof Error ? (error as any).code : undefined,
      prismaMeta: error instanceof Error ? (error as any).meta : undefined,
      query: error instanceof Error ? (error as any).query : undefined,
    });
    return NextResponse.json(
      { 
        error: 'Failed to create trigger map',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const triggerMaps = await prisma.triggerMap.findMany({
      where: { userId: user.id },
      include: {
        nodes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(triggerMaps);
  } catch (error) {
    console.error('Error in GET /api/trigger-maps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trigger maps' },
      { status: 500 }
    );
  }
} 