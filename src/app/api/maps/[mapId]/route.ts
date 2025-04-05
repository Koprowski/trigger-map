import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface NodeUpdate {
  id: string;
  content: string;
  order: number;
}

export async function PUT(
  request: Request,
  { params }: { params: { mapId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { nodes } = await request.json() as { nodes: NodeUpdate[] };

    // Verify map ownership
    const map = await prisma.triggerMap.findFirst({
      where: {
        id: params.mapId,
        userId: session.user.id,
      },
    });

    if (!map) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Update all nodes in a transaction
    await prisma.$transaction(
      nodes.map((node) =>
        prisma.mapNode.update({
          where: { id: node.id },
          data: {
            content: node.content,
            order: node.order,
          },
        })
      )
    );

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error updating map:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 