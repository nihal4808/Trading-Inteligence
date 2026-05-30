import { apiError, apiOk } from "@/app/api/_utils";
import { deleteTrade, updateTrade } from "@/services/trades/tradeService";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateTrade(id, body);
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
    const result = await deleteTrade(id);
    return apiOk(result);
  } catch (error) {
    return apiError(error, 400);
  }
}
