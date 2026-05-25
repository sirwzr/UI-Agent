import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export const POST = auth(
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

    const { messages } = (await req.json()) as {
      messages?: { role: string; content: string; textContent?: string; a2uiPayload?: unknown }[];
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const created = await Promise.all(
      messages.map((m) =>
        prisma.message.create({
          data: {
            conversationId: id,
            role: m.role,
            content: m.content,
            textContent: m.textContent ?? null,
            a2uiPayload: m.a2uiPayload ?? undefined,
          },
        }),
      ),
    );

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ messages: created }, { status: 201 });
  },
);
