import { apiError, apiOk } from "@/app/api/_utils";
import { resetRoadmap } from "@/services/roadmap/roadmapAdminService";

export async function POST() {
  try {
    const result = await resetRoadmap();
    return apiOk(result);
  } catch (error) {
    return apiError(error, 400);
  }
}
