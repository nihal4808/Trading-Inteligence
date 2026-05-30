import { NextResponse } from "next/server";

export function apiOk(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ ok: false, error: message }, { status });
}
