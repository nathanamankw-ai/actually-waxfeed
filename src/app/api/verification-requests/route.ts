import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Fetch user's pending verification request
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      select: {
        id: true,
        requestType: true,
        requestedType: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ pendingRequest })
  } catch (error) {
    console.error("Error fetching verification request:", error)
    return NextResponse.json(
      { error: "Failed to fetch verification request" },
      { status: 500 }
    )
  }
}

// POST - Create a new verification request
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { requestType, requestedType, reason, proofUrl, socialLinks } = body

    // Validate required fields
    if (!requestType || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate request type
    if (!["verification", "account_type"].includes(requestType)) {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      )
    }

    // Validate account type if requesting account type change
    if (requestType === "account_type" || requestedType) {
      const validTypes = ["artist", "org", "editor", "dj"]
      if (!validTypes.includes(requestedType)) {
        return NextResponse.json(
          { error: "Invalid account type" },
          { status: 400 }
        )
      }
    }

    // Check for existing pending request
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request" },
        { status: 400 }
      )
    }

    // Create the verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: session.user.id,
        requestType,
        requestedType: requestedType || null,
        reason,
        proofUrl: proofUrl || null,
        socialLinks: socialLinks || null,
      },
    })

    return NextResponse.json({
      success: true,
      request: verificationRequest,
    })
  } catch (error) {
    console.error("Error creating verification request:", error)
    return NextResponse.json(
      { error: "Failed to create verification request" },
      { status: 500 }
    )
  }
}

// DELETE - Cancel a pending verification request
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
    })

    if (!pendingRequest) {
      return NextResponse.json(
        { error: "No pending request found" },
        { status: 404 }
      )
    }

    await prisma.verificationRequest.delete({
      where: { id: pendingRequest.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error canceling verification request:", error)
    return NextResponse.json(
      { error: "Failed to cancel verification request" },
      { status: 500 }
    )
  }
}
