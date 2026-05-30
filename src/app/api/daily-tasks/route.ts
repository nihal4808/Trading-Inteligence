import { apiError, apiOk } from "@/app/api/_utils";
import { createTask, listTasks } from "@/services/tasks/taskService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const tasks = await listTasks(category);
    return apiOk(tasks);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createTask(body);
    return apiOk(created, 201);
  } catch (error) {
    return apiError(error, 400);
  }
}
