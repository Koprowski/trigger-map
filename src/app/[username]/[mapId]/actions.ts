'use server'

import { prisma } from "@/lib/prisma";
import { NodeType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addNode(mapId: string, index: number, currentOrders: number[], username: string) {
  // Calculate the new order value
  let newOrder: number;
  if (index === 0) {
    newOrder = currentOrders[0] - 1 || 0;
  } else if (index === currentOrders.length) {
    newOrder = (currentOrders[currentOrders.length - 1] || 0) + 1;
  } else {
    newOrder = (currentOrders[index - 1] + currentOrders[index]) / 2;
  }

  // Create the new node
  await prisma.mapNode.create({
    data: {
      triggerMapId: mapId,
      content: "New node",
      type: NodeType.TRIGGER,
      order: newOrder,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/${username}/${mapId}`);
}

export async function updateNode(nodeId: string, content: string, mapId: string, username: string) {
  await prisma.mapNode.update({
    where: { id: nodeId },
    data: {
      content,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/${username}/${mapId}`);
} 