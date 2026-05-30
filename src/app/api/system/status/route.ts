import { getSystemStatus } from "@/services/system/systemService";
import { apiError, apiOk } from "@/app/api/_utils";

export async function GET() {
  try {
    const status = await getSystemStatus();
    return apiOk(status);
  } catch (error) {
    return apiError(error);
  }
}
