import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { MapNode } from '@prisma/client';

interface RouteContext {
  params: {
    mapId: string;
  };
}

// PUT Update Existing Trigger Map
export async function PUT(req: NextRequest, context: RouteContext) {
    const session = await getServerSession(authOptions);
    const mapId = context.params.mapId;

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { goal, nodes } = body as { goal: string; nodes: Omit<MapNode, 'id' | 'triggerMapId' | 'createdAt' | 'updatedAt'>[] };

        if (!goal || !nodes || !Array.isArray(nodes)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (nodes.some(node => !node.content || !node.type || node.order === undefined)) {
            return NextResponse.json({ error: 'Invalid node data' }, { status: 400 });
        }

        // Verify the map belongs to the user before updating
        const existingMap = await prisma.triggerMap.findUnique({
            where: { id: mapId },
        });

        if (!existingMap || existingMap.userId !== session.user.id) {
            return NextResponse.json({ error: 'Map not found or unauthorized' }, { status: 404 });
        }

        // Perform Upsert: Update map, delete old nodes, create new ones
        // This ensures the nodes match the latest state from the client
        const updatedMap = await prisma.triggerMap.update({
            where: { id: mapId },
            data: {
                goal: goal,
                nodes: {
                    deleteMany: {}, // Delete all existing nodes for this map
                    create: nodes.map(node => ({ // Create the new set of nodes
                        content: node.content,
                        type: node.type,
                        order: node.order,
                    })),
                },
            },
            include: { nodes: { orderBy: { order: 'asc' } } },
        });

        return NextResponse.json(updatedMap);
    } catch (error) {
        console.error("Failed to update trigger map:", error);
        return NextResponse.json({ error: 'Failed to update map' }, { status: 500 });
    }
}

// DELETE Trigger Map
export async function DELETE(req: NextRequest, context: RouteContext) {
    const session = await getServerSession(authOptions);
    const mapId = context.params.mapId;

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Verify the map belongs to the user before deleting
        const existingMap = await prisma.triggerMap.findUnique({
            where: { id: mapId },
        });

        if (!existingMap || existingMap.userId !== session.user.id) {
            return NextResponse.json({ error: 'Map not found or unauthorized' }, { status: 404 });
        }

        await prisma.triggerMap.delete({
            where: { id: mapId },
        });

        return NextResponse.json({ message: 'Map deleted successfully' }, { status: 200 }); // Or 204 No Content

    } catch (error) {
        console.error("Failed to delete trigger map:", error);
        return NextResponse.json({ error: 'Failed to delete map' }, { status: 500 });
    }
} 