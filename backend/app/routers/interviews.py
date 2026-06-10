import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.schemas.interview import (
    InterviewCreate,
    InterviewOut,
    AnswerSubmit,
    NextQuestionOut,
    ResultOut,
    ScoreOut,
)
from app.services.claude import generate_questions, evaluate_answer

router = APIRouter(prefix="/api/interviews", tags=["interviews"])

_interviews: dict[str, dict] = {}


@router.post("/start", response_model=InterviewOut, status_code=201)
def start_interview(body: InterviewCreate) -> InterviewOut:
    interview_id = str(uuid.uuid4())
    questions = generate_questions(
        body.role, body.difficulty, body.num_questions, body.resume_text or ""
    )
    _interviews[interview_id] = {
        "id": interview_id,
        "role": body.role,
        "difficulty": body.difficulty,
        "status": "in_progress",
        "created_at": datetime.utcnow(),
        "questions": [
            {"id": str(uuid.uuid4()), "text": q, "order": i + 1, "answer": None}
            for i, q in enumerate(questions)
        ],
    }
    data = _interviews[interview_id]
    return InterviewOut(
        id=data["id"],
        role=data["role"],
        difficulty=data["difficulty"],
        status=data["status"],
        created_at=data["created_at"],
    )


@router.get("/{interview_id}/next-question", response_model=NextQuestionOut)
def next_question(interview_id: str) -> NextQuestionOut:
    interview = _interviews.get(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    questions = interview["questions"]
    for idx, q in enumerate(questions):
        if q["answer"] is None:
            return NextQuestionOut(
                completed=False,
                id=q["id"],
                text=q["text"],
                order=q["order"],
                number=idx + 1,
                total=len(questions),
            )
    return NextQuestionOut(completed=True)


@router.post("/{interview_id}/answer")
def submit_answer(interview_id: str, body: AnswerSubmit) -> dict:
    interview = _interviews.get(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    for q in interview["questions"]:
        if q["id"] == body.question_id:
            q["answer"] = body.answer_text
            return {"status": "saved", "question_id": body.question_id}
    raise HTTPException(status_code=404, detail="Question not found")


@router.get("/{interview_id}/results", response_model=ResultOut)
def get_results(interview_id: str) -> ResultOut:
    interview = _interviews.get(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    scores: list[ScoreOut] = []
    for q in interview["questions"]:
        if q["answer"]:
            ev = evaluate_answer(q["text"], q["answer"], interview["role"])
            scores.append(
                ScoreOut(
                    question_id=q["id"],
                    score=ev.score,
                    max_score=ev.max_score,
                    feedback=ev.feedback,
                    strengths=ev.strengths,
                    improvements=ev.improvements,
                )
            )
    overall = sum(s.score for s in scores)
    max_total = sum(s.max_score for s in scores)
    return ResultOut(
        interview_id=interview_id,
        role=interview["role"],
        difficulty=interview["difficulty"],
        overall_score=overall,
        max_score=max_total,
        summary=f"Scored {overall}/{max_total} across {len(scores)} questions.",
        scores=scores,
    )
