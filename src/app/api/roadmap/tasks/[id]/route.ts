import { apiError, apiOk } from "@/app/api/_utils";
import { toggleRoadmapTaskWithStatus } from "@/services/progression/progressionService";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const completed = Boolean(body?.completed);
    const status = body?.status;
    const result = await toggleRoadmapTaskWithStatus(id, completed, status);
    return apiOk(result);
  } catch (error) {
    return apiError(error, 400);
  }
}
