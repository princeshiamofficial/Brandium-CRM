import { createServerFn } from "./server-fn";
import fs from "node:fs/promises";
import path from "node:path";

export type UploadImageInput = {
  filename: string;
  base64: string;
};

/**
 * Server Function: Handles image file upload, saves to public/uploads directory on local disk,
 * and returns the relative public URL path.
 */
export const uploadImageFn = createServerFn({ method: "POST" })
  .validator((input: UploadImageInput) => input)
  .handler(async ({ data }): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const { filename, base64 } = data;
      if (!filename || !base64) {
        return { success: false, error: "No file or image data provided" };
      }

      // Remove data URL prefix if present (e.g. data:image/png;base64,)
      const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      // Define upload directory in public/uploads
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      // Create a safe, unique filename
      const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeFilename);

      // Write file to disk
      await fs.writeFile(filePath, buffer);

      return { success: true, url: `/uploads/${safeFilename}` };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("uploadImageFn error:", errObj);
      return { success: false, error: errObj?.message || "Failed to upload image to disk." };
    }
  });
