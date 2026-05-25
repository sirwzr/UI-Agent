import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: req.auth.user.id, status: "active" },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ conversations });
});

export const POST = auth(async (req) => {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, surfaceId } = (await req.json().catch(() => ({}))) as {
    title?: string;
    surfaceId?: string;
  };

  const conversation = await prisma.conversation.create({
    data: {
      userId: req.auth.user.id,
      title: title ?? "新对话",
      status: "active",
    },
  });

  if (surfaceId) {
    await prisma.surfaceState.create({
      data: {
        conversationId: conversation.id,
        surfaceId,
        dataModel: {},
        componentTree: {},
      },
    });
  }

  return NextResponse.json({ conversation }, { status: 201 });
});
