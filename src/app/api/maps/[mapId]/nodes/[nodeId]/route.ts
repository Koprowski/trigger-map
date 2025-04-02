import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { mapId: string; nodeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { content } = await request.json();

  const node = await prisma.mapNode.update({
    where: { id: params.nodeId },
    data: {
      content,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(node);
} 