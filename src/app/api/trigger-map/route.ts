// src/app/api/trigger-map/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { MapNode, Prisma } from '@prisma/client';

// GET User's Trigger Maps (simplified for one map for now)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const triggerMap = await prisma.triggerMap.findFirst({
            where: { userId: session.user.id },
            include: { nodes: { orderBy: { order: 'asc' } } }, // Include nodes ordered correctly
        });

        if (!triggerMap) {
             // If no map exists yet for the user, return null or empty object
             return NextResponse.json(null);
        }

        return NextResponse.json(triggerMap);
    } catch (error) {
        console.error("Failed to fetch trigger map:", error);
        return NextResponse.json({ error: 'Failed to fetch map' }, { status: 500 });
    }
}

// POST Create New Trigger Map
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { goal, nodes } = body as { goal: string; nodes: Omit<MapNode, 'id' | 'triggerMapId' | 'createdAt' | 'updatedAt'>[] };

        if (!goal || !nodes || !Array.isArray(nodes)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Basic validation for node content
        if (nodes.some(node => !node.content || !node.type || node.order === undefined)) {
             return NextResponse.json({ error: 'Invalid node data' }, { status: 400 });
        }

        const newMap = await prisma.triggerMap.create({
            data: {
                userId: session.user.id,
                goal: goal,
                nodes: {
                    create: nodes.map(node => ({
                        content: node.content,
                        type: node.type,
                        order: node.order,
                    })),
                },
            },
            include: { nodes: { orderBy: { order: 'asc' } } },
        });

        return NextResponse.json(newMap, { status: 201 });
    } catch (error) {
         if (error instanceof Prisma.PrismaClientValidationError) {
             console.error("Validation Error:", error);
             return NextResponse.json({ error: 'Invalid data provided', details: error.message }, { status: 400 });
         }
        console.error("Failed to create trigger map:", error);
        return NextResponse.json({ error: 'Failed to create map' }, { status: 500 });
    }
}