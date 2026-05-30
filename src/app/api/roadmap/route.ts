import { apiError, apiOk } from "@/app/api/_utils";
import { importRoadmapOnce } from "@/services/roadmap/roadmapImportService";
import { getRoadmapSectionsWithTasks } from "@/services/roadmap/roadmapQueryService";
import { recomputeAndPersistRoadmapProgress } from "@/services/roadmap/roadmapProgressService";
import { getRoadmapAnalytics } from "@/services/roadmap/roadmapAnalyticsService";

export async function GET() {
  try {
    // Attempt one-time initialization, but do not treat "already_initialized" as an error.
    const init = await importRoadmapOnce();
    if (!init.ok) {
      return apiError(new Error(init.error), 400);
    }

    const [sections, progress, analytics] = await Promise.all([
      getRoadmapSectionsWithTasks(),
      recomputeAndPersistRoadmapProgress(),
      getRoadmapAnalytics(),
    ]);

    return apiOk({ sections, progress, analytics, init });
  } catch (error) {
    return apiError(error, 500);
  }
}
