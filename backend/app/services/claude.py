import anthropic
from pydantic import BaseModel
from app.core.config import ANTHROPIC_API_KEY

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def generate_questions(
    role: str, difficulty: str, num_questions: int, resume_text: str = ""
) -> list[str]:
    questions: list[str] = []
    with client.messages.stream(
        model="claude-opus-4-8",
        max_tokens=1024,
        system=(
            "You are an expert technical interviewer. Generate concise, open-ended "
            "interview questions. Return only the questions, one per line, numbered."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Generate {num_questions} {difficulty} interview questions "
                    f"for a {role} position. Focus on real-world problem solving."
                    + (
                        f"\n\nCandidate resume (use it to tailor questions to their experience):\n{resume_text[:3000]}"
                        if resume_text
                        else ""
                    )
                ),
            }
        ],
    ) as stream:
        text = stream.get_final_message().content[0].text

    for line in text.strip().splitlines():
        line = line.strip()
        if line and line[0].isdigit():
            question = line.split(".", 1)[-1].strip()
            if question:
                questions.append(question)

    return questions[:num_questions]


class EvaluationResult(BaseModel):
    score: int
    max_score: int
    feedback: str
    strengths: list[str]
    improvements: list[str]


def evaluate_answer(question: str, answer: str, role: str) -> EvaluationResult:
    return client.messages.parse(
        model="claude-opus-4-8",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        system=(
            "You are an expert technical interviewer evaluating candidate answers. "
            "Score honestly and provide specific, actionable feedback."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Role: {role}\n\nQuestion: {question}\n\nAnswer: {answer}\n\n"
                    "Evaluate this answer out of 10."
                ),
            }
        ],
        output_format=EvaluationResult,
    ).parsed_output
