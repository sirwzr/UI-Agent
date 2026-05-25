import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/metrics";

export async function GET() {
  const metrics = await getMetrics();
  return new NextResponse(metrics, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
