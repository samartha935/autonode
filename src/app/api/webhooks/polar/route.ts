import { db } from "@/db";
import { workflow } from "@/db/schema";
import { sendWorkflowExecution } from "@/inngest/utils";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    const secret = url.searchParams.get("secret");

    if (!workflowId || !secret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter",
        },
        { status: 400 },
      );
    }

    const workflowResult = await db.query.workflow.findFirst({
      where: eq(workflow.id, workflowId),
    });

    if (!workflowResult || workflowResult.webhookSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const polarData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.timestamp,
      raw: body.data,
    };

    // Trigger an Inngest job
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        polar: polarData,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Polar webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Polar event" },
      { status: 500 },
    );
  }
}
