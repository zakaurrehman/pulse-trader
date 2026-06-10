import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// TEMPORARY diagnostic endpoint. Visit /api/admin/blob-diagnostic while logged
// in as ADMIN. It runs a server-side public upload (no CORS) and reports the
// REAL error so we can see what the browser hides. Delete after debugging.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = token ? token.split("_")[3] ?? "(unparseable)" : "(no token)";

  const result: Record<string, unknown> = {
    tokenPresent: !!token,
    storeIdInToken: storeId,
  };

  try {
    const blob = await put("diagnostic-public-test.txt", "diagnostic", {
      access: "public",
      token,
      allowOverwrite: true,
    });
    result.publicUpload = "SUCCESS";
    result.url = blob.url;
  } catch (err) {
    result.publicUpload = "FAILED";
    result.errorName = (err as Error).name;
    result.errorMessage = (err as Error).message;
  }

  return NextResponse.json(result, { status: 200 });
}
