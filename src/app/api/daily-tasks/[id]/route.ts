import { apiError, apiOk } from "@/app/api/_utils";
import { deleteTask, updateTask } from "@/services/tasks/taskService";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateTask(id, body);
    return apiOk(updated);
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await deleteTask(id);
    return apiOk(result);
  } catch (error) {
    return apiError(error, 400);
  }
}
