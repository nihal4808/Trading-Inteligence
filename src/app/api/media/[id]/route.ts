import { apiError, apiOk } from "@/app/api/_utils";
import { deleteMedia, updateMedia } from "@/services/media/mediaService";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateMedia(id, body);
    return apiOk(updated);
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await deleteMedia(id);
    return apiOk(result);
  } catch (error) {
    return apiError(error, 400);
  }
}
