import { uploadImageFn } from "./upload.functions";

/**
 * Client helper to upload an image File to the local server storage.
 * Reads the file as Base64, invokes TanStack Start server function or fallback API endpoint,
 * and returns `{ success: true, url: "/uploads/filename" }`.
 */
export async function uploadImageFile(
  file: File,
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file || file.size === 0) {
    return { success: false, error: "No file selected." };
  }

  // Validate file size (e.g. max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "File size exceeds maximum 10MB limit." };
  }

  try {
    // Convert File to Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

    // 1. Try TanStack Start Server Function
    try {
      const res = await uploadImageFn({
        data: {
          filename: file.name,
          base64,
        },
      });
      if (res?.success && res.url) {
        return res;
      }
    } catch (serverFnErr) {
      console.warn("uploadImageFn failed, falling back to /api/upload:", serverFnErr);
    }

    // 2. Fallback to Vite dev server middleware /api/upload
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        base64,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const errObj = err as { message?: string };
    return { success: false, error: errObj?.message || "Image upload failed." };
  }
}
