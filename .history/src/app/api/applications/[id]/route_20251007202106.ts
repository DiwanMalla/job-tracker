import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { JobApplicationService } from "@/lib/services/job-application.service";
import { updateJobApplicationSchema } from "@/lib/validations";

// GET /api/applications/[id] - Get single job application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await JobApplicationService.findById(
      id,
      session.user.id
    );

    if (!application) {
      return NextResponse.json(
        { error: "Job application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error fetching job application:", error);
    return NextResponse.json(
      { error: "Failed to fetch job application" },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[id] - Update job application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const validationResult = updateJobApplicationSchema.safeParse({
      ...body,
      id,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const application = await JobApplicationService.update(
      id,
      session.user.id,
      {
        ...validationResult.data,
        id,
        applicationDate: validationResult.data.applicationDate 
          ? (typeof validationResult.data.applicationDate === 'string' 
              ? validationResult.data.applicationDate 
              : validationResult.data.applicationDate.toISOString())
          : undefined,
        followUpDate: validationResult.data.followUpDate 
          ? (typeof validationResult.data.followUpDate === 'string' 
              ? validationResult.data.followUpDate 
              : validationResult.data.followUpDate.toISOString())
          : undefined,
        salary: validationResult.data.salary ?? undefined,
        resumeId: validationResult.data.resumeId ?? undefined,
        coverLetterId: validationResult.data.coverLetterId ?? undefined,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Job application updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error updating job application:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Job application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update job application" },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id] - Delete job application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await JobApplicationService.delete(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Job application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job application:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Job application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete job application" },
      { status: 500 }
    );
  }
}
