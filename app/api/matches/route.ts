import { NextRequest, NextResponse } from "next/server";
import { getMatchesByDateWithSource } from "@/data/repositories/matches.repository";

function parseDateParam(value: string | null): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return new Date(`${value}T00:00:00`);
}

export async function GET(request: NextRequest) {
  const date = parseDateParam(request.nextUrl.searchParams.get("date"));
  const timezone = request.nextUrl.searchParams.get("timezone") ?? undefined;
  const result = await getMatchesByDateWithSource(date, timezone);
  return NextResponse.json(result);
}
