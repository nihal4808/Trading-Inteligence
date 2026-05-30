import { apiError, apiOk } from "@/app/api/_utils";
import { createLearningLog, listLearningLogs } from "@/services/learning/learningService";

export async function GET() {
  try {
    const logs = await listLearningLogs();
    return apiOk(logs);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createLearningLog(body);
    return apiOk(created, 201);
  } catch (error) {
    return apiError(error, 400);
  }
}
