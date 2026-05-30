import { apiError, apiOk } from "@/app/api/_utils";
import { createTrade, listTrades } from "@/services/trades/tradeService";

export async function GET() {
  try {
    const trades = await listTrades();
    return apiOk(trades);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createTrade(body);
    return apiOk(created, 201);
  } catch (error) {
    return apiError(error, 400);
  }
}
