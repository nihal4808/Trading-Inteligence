import { apiError, apiOk } from "@/app/api/_utils";
import { markTaskAsReviewed } from "@/services/progression/reviewService";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await markTaskAsReviewed(id);
    return apiOk({ ok: true });
  } catch (error) {
    return apiError(error, 400);
  }
}