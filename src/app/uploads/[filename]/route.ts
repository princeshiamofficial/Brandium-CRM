import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    if (!filename) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Security: sanitize filename to prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeFilename);

    const fileBuffer = await fs.readFile(filePath);

    // Determine MIME type
    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".avif") contentType = "image/avif";
    else if (ext === ".ico") contentType = "image/x-icon";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    console.warn("Upload asset delivery 404:", err);
    return new NextResponse("File Not Found", { status: 404 });
  }
}
