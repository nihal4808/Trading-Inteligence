"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

type Trade = {
  id: string;
  date: string;
  symbol: string;
  tradeType: string;
  entryPrice: number;
  quantity: number;
  exitPrice?: number | null;
  profitLoss?: number | null;
  strategy?: string | null;
};

async function getTrades() {
  const res = await fetch("/api/trades", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load trades");
  return json.data as Trade[];
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    symbol: "",
    tradeType: "swing",
    entryPrice: "",
    quantity: "",
    exitPrice: "",
    strategy: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      setTrades(await getTrades());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const winRate = useMemo(() => {
    if (!trades.length) return 0;
    const wins = trades.filter((trade) => (trade.profitLoss || 0) > 0).length;
    return Math.round((wins / trades.length) * 100);
  }, [trades]);

  const totalPnL = useMemo(
    () => trades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0),
    [trades]
  );

  const addTrade = async () => {
    if (!form.symbol || !form.entryPrice || !form.quantity) return;
    await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: form.symbol,
        tradeType: form.tradeType,
        entryPrice: Number(form.entryPrice),
        quantity: Number(form.quantity),
        exitPrice: form.exitPrice ? Number(form.exitPrice) : undefined,
        strategy: form.strategy || undefined,
      }),
    });
    setForm({ symbol: "", tradeType: "swing", entryPrice: "", quantity: "", exitPrice: "", strategy: "" });
    await load();
  };

  const removeTrade = async (id: string) => {
    await fetch(`/api/trades/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Trades</h1>
        <p className="text-muted mt-1">Persistent trade journal with local SQLite storage</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-3">
          <input className="input-field" placeholder="Symbol" value={form.symbol} onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value }))} />
          <select className="input-field" value={form.tradeType} onChange={(e) => setForm((p) => ({ ...p, tradeType: e.target.value }))}>
            <option value="scalp">scalp</option>
            <option value="swing">swing</option>
            <option value="day">day</option>
            <option value="position">position</option>
          </select>
          <input className="input-field" placeholder="Strategy" value={form.strategy} onChange={(e) => setForm((p) => ({ ...p, strategy: e.target.value }))} />
          <input className="input-field" type="number" step="0.01" placeholder="Entry Price" value={form.entryPrice} onChange={(e) => setForm((p) => ({ ...p, entryPrice: e.target.value }))} />
          <input className="input-field" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
          <input className="input-field" type="number" step="0.01" placeholder="Exit Price (optional)" value={form.exitPrice} onChange={(e) => setForm((p) => ({ ...p, exitPrice: e.target.value }))} />
          <button onClick={addTrade} className="btn btn-primary md:col-span-3 gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-sm">
          <p className="text-sm text-muted">Total Trades</p>
          <p className="mt-2 text-3xl font-bold">{trades.length}</p>
        </div>
        <div className="card-sm">
          <p className="text-sm text-muted">Win Rate</p>
          <p className="mt-2 text-3xl font-bold text-green-400">{winRate}%</p>
        </div>
        <div className="card-sm">
          <p className="text-sm text-muted">Total P&L</p>
          <p className={`mt-2 text-3xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(totalPnL)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading trades...</div>
      ) : trades.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-300">No trades added yet</p>
          <p className="text-xs text-muted mt-2">Add your first trade to start performance tracking.</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="subsection-title mb-4">Trade History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="px-4 py-3 text-left">Symbol</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Entry</th>
                  <th className="px-4 py-3 text-right">Exit</th>
                  <th className="px-4 py-3 text-right">P&L</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-neutral-700/50 hover:bg-neutral-800/50">
                    <td className="px-4 py-3 font-semibold text-neutral-200">{trade.symbol}</td>
                    <td className="px-4 py-3 text-neutral-400">{trade.tradeType}</td>
                    <td className="px-4 py-3 text-right text-neutral-300">{trade.entryPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-neutral-300">{typeof trade.exitPrice === "number" ? trade.exitPrice.toFixed(2) : "-"}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${(trade.profitLoss || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(trade.profitLoss || 0)}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">{formatDate(new Date(trade.date))}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeTrade(trade.id)} className="text-neutral-500 hover:text-red-400">
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
