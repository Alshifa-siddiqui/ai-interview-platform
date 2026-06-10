from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InterviewCreate(BaseModel):
    role: str
    difficulty: str = "mid-level"
    num_questions: int = 5
    resume_text: Optional[str] = None


class InterviewOut(BaseModel):
    id: str
    role: str
    difficulty: str
    status: str
    created_at: datetime


class NextQuestionOut(BaseModel):
    completed: bool
    id: Optional[str] = None
    text: Optional[str] = None
    order: Optional[int] = None
    number: Optional[int] = None
    total: Optional[int] = None


class AnswerSubmit(BaseModel):
    question_id: str
    answer_text: str


class ScoreOut(BaseModel):
    question_id: str
    score: int
    max_score: int
    feedback: str
    strengths: list[str]
    improvements: list[str]


class ResultOut(BaseModel):
    interview_id: str
    role: str
    difficulty: str
    overall_score: int
    max_score: int
    summary: str
    scores: list[ScoreOut]
