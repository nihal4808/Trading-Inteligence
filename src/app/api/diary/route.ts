import { apiError, apiOk } from "@/app/api/_utils";
import { createDiaryEntry, listDiaryEntries } from "@/services/diary/diaryService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;
    const entries = await listDiaryEntries({ search, tag });
    return apiOk(entries);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createDiaryEntry(body);
    return apiOk(created, 201);
  } catch (error) {
    return apiError(error, 400);
  }
}
