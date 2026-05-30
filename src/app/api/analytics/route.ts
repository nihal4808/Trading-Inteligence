import { getDashboardAnalytics } from "@/services/analytics/analyticsService";
import { apiError, apiOk } from "@/app/api/_utils";

export async function GET() {
  try {
    const analytics = await getDashboardAnalytics();
    return apiOk(analytics);
  } catch (error) {
    return apiError(error);
  }
}
