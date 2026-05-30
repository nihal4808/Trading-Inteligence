import { apiError, apiOk } from "@/app/api/_utils";
import { createMedia, listMedia } from "@/services/media/mediaService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const mediaType = searchParams.get("mediaType") ?? undefined;
    const media = await listMedia({ status, category, mediaType });
    return apiOk(media);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createMedia(body);
    return apiOk(created, 201);
  } catch (error) {
    return apiError(error, 400);
  }
}
