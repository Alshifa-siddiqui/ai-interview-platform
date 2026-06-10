import io
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(prefix="/api/resume", tags=["resume"])

_ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
_MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)) -> dict:
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are accepted"
        )

    content = await file.read()
    if len(content) > _MAX_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds the 5 MB limit")

    if file.content_type == "application/pdf":
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    else:
        from docx import Document

        doc = Document(io.BytesIO(content))
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())

    return {"text": text.strip(), "filename": file.filename}
