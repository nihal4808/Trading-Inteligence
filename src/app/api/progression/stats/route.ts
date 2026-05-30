import { apiError, apiOk } from "@/app/api/_utils";
import { getProgressionStats } from "@/services/progression/progressionService";

export async function GET() {
  try {
    const stats = await getProgressionStats();
    return apiOk(stats);
  } catch (error) {
    return apiError(error, 400);
  }
}
