#!/usr/bin/env python3
"""
編み図PDF翻訳 Web API
- FastAPI バックエンド
- Claude API で英↔日翻訳
- PDF アップロード → 翻訳済みPDF を返す
"""

import os
import csv
import re
import shutil
import tempfile
import logging
from pathlib import Path

import anthropic
import pdfplumber
from pdf2image import convert_from_path
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

# ─────────────────────────────────────────────
# 設定
# ─────────────────────────────────────────────
GLOSSARY_CSV = Path(__file__).parent / "knitting_glossary.csv"

# APIキーはサーバーの環境変数から取得
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

FONT_CANDIDATES = [
    "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/noto-cjk/NotoSansCJKjp-Regular.otf",
    "C:/Windows/Fonts/msgothic.ttc",
    "C:/Windows/Fonts/meiryo.ttc",
]

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# FastAPI アプリ
# ─────────────────────────────────────────────
app = FastAPI(title="編み図PDF翻訳API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# フォント登録
# ─────────────────────────────────────────────
def register_font() -> str:
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont("JapaneseFont", path))
                return "JapaneseFont"
            except Exception:
                pass
    return "Helvetica"

FONT_NAME = register_font()

# ─────────────────────────────────────────────
# 用語辞書
# ─────────────────────────────────────────────
def load_glossary() -> dict:
    glossary = {}
    if not GLOSSARY_CSV.exists():
        return glossary
    with open(GLOSSARY_CSV, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            eng = row.get("english", "").strip()
            jpn = row.get("japanese", "").strip()
            if eng and jpn:
                glossary[eng.lower()] = jpn
    log.info(f"用語辞書: {len(glossary)} 件")
    return glossary

GLOSSARY = load_glossary()

def apply_glossary(text: str, glossary: dict) -> tuple:
    placeholders = {}
    idx = 0
    for term in sorted(glossary.keys(), key=len, reverse=True):
        pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
        if pattern.search(text):
            ph = f"__TERM_{idx}__"
            placeholders[ph] = glossary[term]
            text = pattern.sub(ph, text)
            idx += 1
    return text, placeholders

def restore_glossary(text: str, placeholders: dict) -> str:
    for ph, jp in placeholders.items():
        text = text.replace(ph, jp)
    return text

# ─────────────────────────────────────────────
# Claude API 翻訳
# ─────────────────────────────────────────────
def claude_translate(text: str, direction: str) -> str:
    if not text.strip():
        return text

    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="APIキーが設定されていません")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    if direction == "en_to_ja":
        system_prompt = """あなたは編み物（ニッティング・かぎ針編み）の専門翻訳家です。
英語の編み図・パターンを自然な日本語に翻訳してください。

ルール：
- 編み物の専門用語は日本の編み物業界で使われる標準的な用語を使う
- __TERM_X__ というプレースホルダーはそのまま残す
- 数字・記号はそのまま保持する
- 翻訳文のみを返し、説明や注釈は不要"""
    else:
        system_prompt = """You are a professional knitting pattern translator.
Translate Japanese knitting/crochet patterns into natural English.

Rules:
- Use standard English knitting terminology
- __TERM_X__ placeholders should remain as-is
- Keep numbers and symbols intact
- Return only the translated text, no explanations"""

    max_chars = 3000
    if len(text) <= max_chars:
        chunks = [text]
    else:
        sentences = re.split(r'(?<=[。.!?！？])\s*', text)
        chunks, current = [], ""
        for s in sentences:
            if len(current) + len(s) < max_chars:
                current += s
            else:
                if current:
                    chunks.append(current)
                current = s
        if current:
            chunks.append(current)

    results = []
    for chunk in chunks:
        if not chunk.strip():
            continue
        try:
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4000,
                system=system_prompt,
                messages=[{"role": "user", "content": chunk}]
            )
            results.append(response.content[0].text)
        except Exception as e:
            log.error(f"Claude API エラー: {e}")
            results.append(chunk)

    return "\n".join(results)

# ─────────────────────────────────────────────
# PDF 処理
# ─────────────────────────────────────────────
def translate_pdf(input_path: Path, output_path: Path, direction: str):
    glossary = GLOSSARY if direction == "en_to_ja" else {}

    with pdfplumber.open(str(input_path)) as pdf:
        page_count = len(pdf.pages)

        try:
            page_images = convert_from_path(str(input_path), dpi=150)
        except Exception:
            page_images = []

        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            rightMargin=15*mm, leftMargin=15*mm,
            topMargin=15*mm, bottomMargin=15*mm,
        )

        style_normal = ParagraphStyle("N", fontName=FONT_NAME, fontSize=10, leading=16, spaceAfter=6)
        style_heading = ParagraphStyle("H", fontName=FONT_NAME, fontSize=13, leading=20,
                                       spaceBefore=10, spaceAfter=6, textColor=(0.1, 0.1, 0.5))
        style_caption = ParagraphStyle("C", fontName=FONT_NAME, fontSize=9, leading=13,
                                       alignment=TA_CENTER, textColor=(0.4, 0.4, 0.4), spaceAfter=6)
        style_small = ParagraphStyle("S", fontName=FONT_NAME, fontSize=8, leading=12, spaceAfter=4)

        story = []
        tmp_dir = Path(tempfile.mkdtemp())

        try:
            for page_num, page in enumerate(pdf.pages):
                raw_text = page.extract_text() or ""
                has_images = bool(page.images)

                if has_images and page_images and page_num < len(page_images):
                    img_path = tmp_dir / f"page_{page_num}.png"
                    page_images[page_num].save(str(img_path), "PNG")

                    page_w_mm = float(page.width) / 72 * 25.4
                    page_h_mm = float(page.height) / 72 * 25.4
                    avail_w = 180
                    scale = avail_w / page_w_mm
                    img_h_mm = page_h_mm * scale

                    story.append(RLImage(str(img_path), width=avail_w*mm, height=img_h_mm*mm))

                    if raw_text.strip():
                        story.append(Spacer(1, 4*mm))
                        story.append(Paragraph("【翻訳テキスト】", style_caption))
                        preprocessed, placeholders = apply_glossary(raw_text, glossary)
                        translated = claude_translate(preprocessed, direction)
                        final = restore_glossary(translated, placeholders)
                        for para in final.split("\n"):
                            para = para.strip()
                            if para:
                                safe = para.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
                                story.append(Paragraph(safe, style_small))
                else:
                    if raw_text.strip():
                        preprocessed, placeholders = apply_glossary(raw_text, glossary)
                        translated = claude_translate(preprocessed, direction)
                        final = restore_glossary(translated, placeholders)
                        for para in final.split("\n"):
                            para = para.strip()
                            if not para:
                                continue
                            safe = para.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
                            if len(para) < 60 and para.isupper():
                                story.append(Paragraph(safe, style_heading))
                            else:
                                story.append(Paragraph(safe, style_normal))

                if page_num < page_count - 1:
                    story.append(PageBreak())

            doc.build(story)

        finally:
            shutil.rmtree(tmp_dir, ignore_errors=True)

# ─────────────────────────────────────────────
# エンドポイント
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "編み図PDF翻訳API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/translate")
async def translate(
    file: UploadFile = File(...),
    direction: str = Form("en_to_ja"),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDFファイルのみ対応しています")
    if direction not in ("en_to_ja", "ja_to_en"):
        raise HTTPException(status_code=400, detail="directionはen_to_jaまたはja_to_enを指定してください")

    tmp_dir = Path(tempfile.mkdtemp())
    try:
        input_path = tmp_dir / "input.pdf"
        with open(input_path, "wb") as f:
            f.write(await file.read())

        suffix = "JA" if direction == "en_to_ja" else "EN"
        output_filename = f"{Path(file.filename).stem}_{suffix}.pdf"
        output_path = tmp_dir / output_filename

        translate_pdf(input_path, output_path, direction)

        return FileResponse(
            path=str(output_path),
            filename=output_filename,
            media_type="application/pdf",
            background=None,
        )

    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="APIキーが無効です")
    except Exception as e:
        log.error(f"翻訳エラー: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"翻訳中にエラーが発生しました: {str(e)}")
