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
    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };

    // Trigger an Inngest job
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        googleForm: formData,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Google form webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Google Form submission" },
      { status: 500 },
    );
  }
}
