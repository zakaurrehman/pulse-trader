import "dotenv/config";
import { put, del } from "@vercel/blob";

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const blob = await put("diagnostic-public-test.txt", "hello", {
      access: "public",
      token,
      allowOverwrite: true,
    });
    console.log("\n✅ PUBLIC upload now WORKS. Store is public.");
    console.log("   URL:", blob.url);
    await del(blob.url, { token });
    console.log("   (cleaned up test file)");
  } catch (err) {
    console.log("\n❌ PUBLIC still rejected:");
    console.log("   message:", (err as Error).message);
  }
}

main();
