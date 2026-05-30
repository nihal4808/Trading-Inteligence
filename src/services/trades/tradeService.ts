import { prisma } from "@/lib/db/prisma";

export async function listTrades() {
  return prisma.trade.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
}

export async function createTrade(input: {
  symbol: string;
  tradeType: string;
  entryPrice: number;
  quantity: number;
  exitPrice?: number;
  strategy?: string;
  emotionalState?: string;
  mistakes?: string;
  lessons?: string;
  date?: string;
}) {
  const profitLoss =
    typeof input.exitPrice === "number"
      ? (input.exitPrice - input.entryPrice) * input.quantity
      : null;

  return prisma.trade.create({
    data: {
      symbol: input.symbol.toUpperCase(),
      tradeType: input.tradeType,
      entryPrice: input.entryPrice,
      quantity: input.quantity,
      exitPrice: input.exitPrice,
      profitLoss,
      strategy: input.strategy,
      emotionalState: input.emotionalState,
      mistakes: input.mistakes,
      lessons: input.lessons,
      date: input.date ? new Date(input.date) : new Date(),
    },
  });
}

export async function updateTrade(
  id: string,
  patch: Partial<{
    symbol: string;
    tradeType: string;
    entryPrice: number;
    quantity: number;
    exitPrice: number | null;
    strategy: string;
    emotionalState: string;
    mistakes: string;
    lessons: string;
    date: string;
  }>
) {
  const current = await prisma.trade.findUnique({ where: { id } });
  const entryPrice = patch.entryPrice ?? current?.entryPrice ?? 0;
  const quantity = patch.quantity ?? current?.quantity ?? 0;
  const exitPrice =
    patch.exitPrice !== undefined ? patch.exitPrice : current?.exitPrice ?? null;
  const profitLoss =
    typeof exitPrice === "number" ? (exitPrice - entryPrice) * quantity : null;

  return prisma.trade.update({
    where: { id },
    data: {
      ...patch,
      symbol: patch.symbol ? patch.symbol.toUpperCase() : undefined,
      date: patch.date ? new Date(patch.date) : undefined,
      profitLoss,
    },
  });
}

export async function deleteTrade(id: string) {
  await prisma.trade.delete({ where: { id } });
  return { ok: true };
}
