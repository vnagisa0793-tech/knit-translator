#!/usr/bin/env python3
import os, csv, re, shutil, tempfile, logging, base64
from pathlib import Path

import anthropic
import pdfplumber
from pdf2image import convert_from_path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

GLOSSARY_CSV = Path(__file__).parent / "knitting_glossary.csv"
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── 日本語フォント ───
FONT_NAME = "HeiseiKakuGo-W5"
pdfmetrics.registerFont(UnicodeCIDFont(FONT_NAME))

# ─── 用語辞書 ───
def load_glossary():
    g = {}
    if GLOSSARY_CSV.exists():
        with open(GLOSSARY_CSV, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                e, j = row.get("english","").strip(), row.get("japanese","").strip()
                if e and j:
                    g[e.lower()] = j
    log.info(f"用語辞書: {len(g)} 件")
    return g

GLOSSARY = load_glossary()

def apply_glossary(text, glossary):
    placeholders, idx = {}, 0
    for term in sorted(glossary.keys(), key=len, reverse=True):
        pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
        if pattern.search(text):
            ph = f"__TERM_{idx}__"
            placeholders[ph] = glossary[term]
            text = pattern.sub(ph, text)
            idx += 1
    return text, placeholders

def restore_glossary(text, placeholders):
    for ph, jp in placeholders.items():
        text = text.replace(ph, jp)
    return text

def remove_markdown(text):
    """Markdown記号を除去（プレースホルダーは保護）"""
    # プレースホルダーを一時退避
    saved = {}
    for i, m in enumerate(re.finditer(r'__TERM_\d+__', text)):
        key = f"SAFE_{i}_SAFE"
        saved[key] = m.group()
    for key, val in saved.items():
        text = text.replace(val, key)
    # Markdown除去
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*{1,2}(.+?)\*{1,2}', r'\1', text)
    text = re.sub(r'^---+$', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # プレースホルダー復元
    for key, val in saved.items():
        text = text.replace(key, val)
    return text.strip()

# ─── Claude翻訳（テキスト）───
def claude_translate(text, direction):
    if not text.strip():
        return text
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    system = (
        "あなたは編み物専門の翻訳家です。英語の編み図を自然な日本語に翻訳してください。__TERM_X__はそのまま残し、翻訳文のみ返してください。Markdownや記号（##、**、---など）は使わないでください。"
        if direction == "en_to_ja" else
        "You are a knitting pattern translator. Translate Japanese patterns to natural English. Keep __TERM_X__ as-is. Return plain text only, no Markdown."
    )
    chunks = []
    if len(text) <= 3000:
        chunks = [text]
    else:
        current = ""
        for s in re.split(r'(?<=[。.!?])\s*', text):
            if len(current) + len(s) < 3000:
                current += s
            else:
                if current: chunks.append(current)
                current = s
        if current: chunks.append(current)

    results = []
    for chunk in chunks:
        if not chunk.strip(): continue
        try:
            r = client.messages.create(
                model="claude-sonnet-4-6", max_tokens=4000,
                system=system, messages=[{"role":"user","content":chunk}]
            )
            results.append(remove_markdown(r.content[0].text))
        except Exception as e:
            log.error(f"翻訳エラー: {e}")
            results.append(chunk)
    return "\n".join(results)

# ─── Claude翻訳（画像）───
def claude_translate_image(img_path, direction):
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    with open(img_path, "rb") as f:
        img_data = base64.standard_b64encode(f.read()).decode("utf-8")

    prompt = (
        "この編み図ページの英語テキストをすべて読み取り、自然な日本語に翻訳してください。編み物の専門用語は正確に訳し、Markdownや記号（##、**など）は使わず、翻訳文のみ返してください。"
        if direction == "en_to_ja" else
        "Read all Japanese text from this knitting pattern page and translate it to natural English. Use standard knitting terminology. Return plain text only, no Markdown."
    )
    try:
        r = client.messages.create(
            model="claude-sonnet-4-6", max_tokens=4000,
            messages=[{"role":"user","content":[
                {"type":"image","source":{"type":"base64","media_type":"image/png","data":img_data}},
                {"type":"text","text":prompt}
            ]}]
        )
        return remove_markdown(r.content[0].text)
    except Exception as e:
        log.error(f"画像翻訳エラー: {e}")
        return ""

# ─── PDF処理 ───
def translate_pdf(input_path, output_path, direction):
    glossary = GLOSSARY if direction == "en_to_ja" else {}

    with pdfplumber.open(str(input_path)) as pdf:
        page_count = len(pdf.pages)
        try:
            page_images = convert_from_path(str(input_path), dpi=150)
        except Exception as e:
            log.warning(f"ページ画像取得失敗: {e}")
            page_images = []

        doc = SimpleDocTemplate(str(output_path), pagesize=A4,
            rightMargin=15*mm, leftMargin=15*mm, topMargin=15*mm, bottomMargin=15*mm)

        sN = ParagraphStyle("N", fontName=FONT_NAME, fontSize=10, leading=16, spaceAfter=6)
        sC = ParagraphStyle("C", fontName=FONT_NAME, fontSize=9, leading=13,
                            alignment=TA_CENTER, textColor=(0.5,0.5,0.5), spaceAfter=8)

        story = []
        tmp_dir = Path(tempfile.mkdtemp())

        try:
            for i, page in enumerate(pdf.pages):
                raw = page.extract_text() or ""
                has_img = bool(page.images)

                # ① 元ページを画像としてそのまま出力
                if page_images and i < len(page_images):
                    img_path = tmp_dir / f"p{i}.png"
                    page_images[i].save(str(img_path), "PNG")
                    w_mm = float(page.width) / 72 * 25.4
                    h_mm = float(page.height) / 72 * 25.4
                    scale = 180 / w_mm
                    story.append(RLImage(str(img_path), width=180*mm, height=h_mm*scale*mm))
                    story.append(PageBreak())

                # ② 翻訳テキストを次ページに出力
                story.append(Paragraph(f"【翻訳】{i+1}ページ目", sC))
                story.append(Spacer(1, 4*mm))

                # 画像ページはClaudeが画像を直接読んで翻訳
                if has_img and page_images and i < len(page_images):
                    translated = claude_translate_image(str(img_path), direction)
                    text_to_show = translated
                else:
                    # テキストページはpdfplumberで抽出して翻訳
                    if raw.strip():
                        pre, ph = apply_glossary(raw, glossary)
                        trans = claude_translate(pre, direction)
                        text_to_show = restore_glossary(trans, ph)
                    else:
                        text_to_show = ""

                # テキストを段落として出力
                for p in text_to_show.split("\n"):
                    p = p.strip()
                    if p:
                        safe = p.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
                        story.append(Paragraph(safe, sN))

                # 最終ページ以外はページ区切り
                if i < page_count - 1:
                    story.append(PageBreak())

            doc.build(story)
        finally:
            shutil.rmtree(tmp_dir, ignore_errors=True)

# ─── エンドポイント ───
@app.get("/")
def root(): return {"status":"ok","font":FONT_NAME}

@app.get("/health")
def health(): return {"status":"healthy","font_name":FONT_NAME}

@app.post("/translate")
async def translate(file: UploadFile = File(...), direction: str = Form("en_to_ja")):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "PDFファイルのみ対応")
    if direction not in ("en_to_ja","ja_to_en"):
        raise HTTPException(400, "directionが正しくありません")

    tmp_dir = Path(tempfile.mkdtemp())
    try:
        inp = tmp_dir/"input.pdf"
        inp.write_bytes(await file.read())
        suffix = "JA" if direction=="en_to_ja" else "EN"
        out_name = f"{Path(file.filename).stem}_{suffix}.pdf"
        out = tmp_dir/out_name
        translate_pdf(inp, out, direction)
        return FileResponse(str(out), filename=out_name, media_type="application/pdf", background=None)
    except anthropic.AuthenticationError:
        raise HTTPException(401, "APIキーが無効です")
    except Exception as e:
        log.error(f"エラー: {e}", exc_info=True)
        raise HTTPException(500, f"翻訳エラー: {str(e)}")
