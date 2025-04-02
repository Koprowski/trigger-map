import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NodeType } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { mapId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { index } = await request.json();

  // Get current nodes to calculate order
  const currentNodes = await prisma.mapNode.findMany({
    where: { triggerMapId: params.mapId },
    orderBy: { order: 'asc' },
  });

  // Calculate the new order value
  let newOrder: number;
  if (index === 0) {
    newOrder = currentNodes[0]?.order ?? 0;
  } else if (index === currentNodes.length) {
    newOrder = (currentNodes[currentNodes.length - 1]?.order ?? 0) + 1;
  } else {
    newOrder = ((currentNodes[index - 1]?.order ?? 0) + (currentNodes[index]?.order ?? 0)) / 2;
  }

  // Create the new node
  const node = await prisma.mapNode.create({
    data: {
      triggerMapId: params.mapId,
      content: "New node",
      type: NodeType.TRIGGER,
      order: newOrder,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(node);
} 