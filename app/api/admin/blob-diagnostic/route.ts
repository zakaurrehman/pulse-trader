import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// TEMPORARY public diagnostic endpoint (no auth, so a broken session can't
// hide the result). It runs a server-side public AND private upload (no CORS)
// and reports the REAL errors so we can see what the browser hides.
// DELETE THIS FILE after debugging.
export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = token ? token.split("_")[3] ?? "(unparseable)" : "(no token)";

  const result: Record<string, unknown> = {
    tokenPresent: !!token,
    storeIdInToken: storeId,
    tokenLength: token ? token.length : 0,
  };

  // Test PUBLIC upload
  try {
    const blob = await put("diagnostic-public-test.txt", "diagnostic", {
      access: "public",
      token,
      allowOverwrite: true,
    });
    result.publicUpload = "SUCCESS";
    result.publicUrl = blob.url;
  } catch (err) {
    result.publicUpload = "FAILED";
    result.publicError = (err as Error).message;
  }

  // Test PRIVATE upload (tells us if the store is actually private)
  try {
    const blob = await put("diagnostic-private-test.txt", "diagnostic", {
      access: "private" as "public",
      token,
      allowOverwrite: true,
    });
    result.privateUpload = "SUCCESS";
    result.privateUrl = blob.url;
  } catch (err) {
    result.privateUpload = "FAILED";
    result.privateError = (err as Error).message;
  }

  return NextResponse.json(result, { status: 200 });
}
