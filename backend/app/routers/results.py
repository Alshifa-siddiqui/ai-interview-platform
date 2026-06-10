from fastapi import APIRouter, HTTPException
from app.schemas.interview import ResultOut, ScoreOut
from app.services.claude import evaluate_answer
from app.routers.interviews import _interviews, _questions
from app.routers.questions import _answers

router = APIRouter(prefix="/results", tags=["results"])


@router.get("/{interview_id}", response_model=ResultOut)
def get_results(interview_id: str) -> ResultOut:
    interview = _interviews.get(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    questions = _questions.get(interview_id, [])
    scores: list[ScoreOut] = []

    for q in questions:
        answer_data = _answers.get(q["id"])
        if not answer_data:
            continue
        evaluation = evaluate_answer(q["text"], answer_data["answer_text"], interview["role"])
        scores.append(
            ScoreOut(
                question_id=q["id"],
                score=evaluation.score,
                max_score=evaluation.max_score,
                feedback=evaluation.feedback,
                strengths=evaluation.strengths,
                improvements=evaluation.improvements,
            )
        )

    overall = sum(s.score for s in scores)
    max_total = sum(s.max_score for s in scores)

    return ResultOut(
        interview_id=interview_id,
        overall_score=overall,
        max_score=max_total,
        summary=f"Scored {overall}/{max_total} across {len(scores)} questions.",
        scores=scores,
    )
