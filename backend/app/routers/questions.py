from fastapi import APIRouter, HTTPException
from app.schemas.interview import AnswerSubmit
from app.routers.interviews import _interviews, _questions

router = APIRouter(prefix="/questions", tags=["questions"])

_answers: dict[str, dict] = {}


@router.post("/{question_id}/answer", status_code=201)
def submit_answer(question_id: str, body: AnswerSubmit) -> dict:
    _answers[question_id] = {
        "question_id": question_id,
        "answer_text": body.answer_text,
    }
    return {"status": "submitted", "question_id": question_id}
