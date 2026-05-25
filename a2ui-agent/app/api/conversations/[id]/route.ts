import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export const GET = auth(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: req.auth.user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        surfaceStates: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  },
);

export const PATCH = auth(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: req.auth.user.id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      status?: string;
      title?: string;
    };

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
      },
    });

    return NextResponse.json({ conversation: updated });
  },
);

export const DELETE = auth(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: req.auth.user.id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.conversation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  },
);
