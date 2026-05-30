import { apiError, apiOk } from "@/app/api/_utils";
import { deleteDiaryEntry, updateDiaryEntry } from "@/services/diary/diaryService";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateDiaryEntry(id, body);
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
    const result = await deleteDiaryEntry(id);
    return apiOk(result);
  } catch (error) {
    return apiError(error, 400);
  }
}
