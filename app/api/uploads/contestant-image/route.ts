import { NextResponse } from "next/server";
import { getAdminSession } from "@/src/lib/admin-auth";
import { hasAdminPermission } from "@/src/lib/admin-permissions";
import {
  getCloudinaryConfig,
  signCloudinaryUploadParams,
} from "@/src/lib/cloudinary";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!hasAdminPermission(session.role, "manage_contestants")) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Select an image file to upload." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image uploads are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "Image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const { cloudName, apiKey, apiSecret, uploadFolder } =
      getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = signCloudinaryUploadParams(
      {
        folder: uploadFolder,
        timestamp,
      },
      apiSecret
    );

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp);
    uploadFormData.append("folder", uploadFolder);
    uploadFormData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
        cache: "no-store",
      }
    );

    const payload = (await response.json()) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string };
    };

    if (!response.ok || !payload.secure_url) {
      throw new Error(
        payload.error?.message || "Cloudinary upload failed. Please try again."
      );
    }

    return NextResponse.json({
      url: payload.secure_url,
      publicId: payload.public_id ?? "",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload contestant image right now.",
      },
      { status: 500 }
    );
  }
}
