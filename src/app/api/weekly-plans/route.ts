import { apiError, apiOk } from "@/app/api/_utils";
import { createWeeklyPlan, listWeeklyPlans } from "@/services/weekly-plans/weeklyPlanService";

export async function GET() {
  try {
    const plans = await listWeeklyPlans();
    return apiOk(plans);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createWeeklyPlan(body);
    return apiOk(created, 201);
  } catch (error) {
    return apiError(error, 400);
  }
}
