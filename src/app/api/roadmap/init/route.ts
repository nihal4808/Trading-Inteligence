import { apiError, apiOk } from "@/app/api/_utils";
import { importRoadmapOnce } from "@/services/roadmap/roadmapImportService";

export async function POST() {
  try {
    const result = await importRoadmapOnce();
    if (!result.ok) {
      return apiError(new Error(result.error), 400);
    }
    return apiOk(result);
  } catch (error) {
    return apiError(error, 500);
  }
}
