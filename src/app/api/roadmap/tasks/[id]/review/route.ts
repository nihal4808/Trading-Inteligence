import { apiError, apiOk } from "@/app/api/_utils";
import { createOrUpdateReview, getReviewForTask } from "@/services/progression/reviewService";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const review = await getReviewForTask(id);
    return apiOk(review);
  } catch (error) {
    return apiError(error, 400);
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const review = await createOrUpdateReview(id, {
      roadmapTaskId: id,
      review: body.review,
      reflection: body.reflection,
      mood: body.mood,
      confidenceLevel: body.confidenceLevel,
      difficultyLevel: body.difficultyLevel,
      lessonsLearned: body.lessonsLearned,
    });

    return apiOk(review, 200);
  } catch (error) {
    return apiError(error, 400);
  }
}