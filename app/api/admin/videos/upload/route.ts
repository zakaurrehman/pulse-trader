import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as { role?: string }).role !== "ADMIN") {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-msvideo",
            "video/mpeg",
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
        };
      },
      // No onUploadCompleted: the DB record is created by the client after a
      // successful upload (POST /api/admin/videos). A server callback can't
      // reach localhost anyway, and would only add a redundant code path.
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[videos/upload] failed:", error);
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[videos/upload] BLOB_READ_WRITE_TOKEN is not set in the environment.");
    }
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
