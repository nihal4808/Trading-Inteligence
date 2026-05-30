import { apiError, apiOk } from "@/app/api/_utils";
import { importRoadmapOnce } from "@/services/roadmap/roadmapImportService";
import { recomputeAndPersistRoadmapProgress } from "@/services/roadmap/roadmapProgressService";
import { getRoadmapAnalytics, getCurrentDayTasks } from "@/services/roadmap/roadmapAnalyticsService";

export async function GET() {
  try {
    const init = await importRoadmapOnce();
    if (!init.ok) {
      return apiError(new Error(init.error), 400);
    }

    const [progress, analytics, currentDay] = await Promise.all([
      recomputeAndPersistRoadmapProgress(),
      getRoadmapAnalytics(),
      getCurrentDayTasks(),
    ]);

    return apiOk({ progress, analytics, currentDay, init });
  } catch (error) {
    return apiError(error, 500);
  }
}
