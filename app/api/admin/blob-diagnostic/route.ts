import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// TEMPORARY. Confirms whether the env token has stray whitespace that breaks
// client-token signing. DELETE after verifying.
export async function GET() {
  const raw = process.env.BLOB_READ_WRITE_TOKEN;
  const trimmed = raw?.trim();

  const result: Record<string, unknown> = {
    rawLength: raw?.length ?? 0,
    trimmedLength: trimmed?.length ?? 0,
    hadWhitespace: raw !== trimmed,
    storeId: trimmed?.split("_")[3] ?? null,
  };

  try {
    const blob = await put("diagnostic-test.txt", "x", {
      access: "public",
      token: trimmed,
      allowOverwrite: true,
    });
    result.publicUploadWithTrimmedToken = "SUCCESS";
    result.url = blob.url;
  } catch (err) {
    result.publicUploadWithTrimmedToken = "FAILED: " + (err as Error).message;
  }

  return NextResponse.json(result);
}
