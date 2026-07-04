import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = Path(r"C:\Users\Enku\Downloads\Дүрэм -2025.docx")
W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

CHAPTER_START = re.compile(
    r"^(Нэг|Хоёр|Гурав|Дөрөв|Тав|Зургаа|Долоо|Найм|Ес|Арав|"
    r"Арван нэг|Арван хоёр|Арван гурав|Арван дөрөв|Арван тав|Арван зургаа|"
    r"Арван долоо|Арван найм|Арван ес|Хорь|Хорин нэг)\.\s*(.*)$",
    re.IGNORECASE,
)
SUBSECTION = re.compile(r"^(\d+\.\d+)\s*(.+)$")
NUMBERED = re.compile(r"^(\d+\.?\d*)\s*(.+)$")


def read_paras(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    paras: list[str] = []
    for p in root.iter(f"{W_NS}p"):
        texts: list[str] = []
        for t in p.iter(f"{W_NS}t"):
            if t.text:
                texts.append(t.text)
            if t.tail:
                texts.append(t.tail)
        s = re.sub(r"\s+", " ", "".join(texts)).strip()
        if s:
            paras.append(s)
    return paras


def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"\s+", "-", s)
    return s[:48] or "section"


def is_table_start(paras: list[str], i: int) -> bool:
    return (
        i + 4 < len(paras)
        and paras[i] == "№"
        and paras[i + 1] == "Овог нэр"
        and paras[i + 2] == "Регистер"
    )


def parse_table(paras: list[str], i: int) -> tuple[dict, int]:
    headers = paras[i : i + 5]
    rows: list[list[str]] = []
    i += 5
    while i + 4 < len(paras):
        if paras[i].isdigit():
            rows.append(paras[i : i + 5])
            i += 5
        else:
            break
    return {"type": "table", "headers": headers, "rows": rows}, i


def should_merge_title_line(line: str) -> bool:
    if not line or line == "№":
        return False
    if CHAPTER_START.match(line) or SUBSECTION.match(line):
        return False
    if line[0].isdigit():
        return False
    if line.endswith(";"):
        return False
    if len(line) > 55:
        return False
    if line.endswith(".") and len(line) > 28:
        return False
    return True


def parse_charter(paras: list[str]) -> dict:
    title = paras[0]
    sections: list[dict] = []
    current: dict | None = None
    pending_title: str | None = None
    i = 1

    while i < len(paras):
        p = paras[i]

        if is_table_start(paras, i):
            if current is None:
                current = {"id": "misc", "title": "Хавсралт", "blocks": []}
            block, i = parse_table(paras, i)
            current["blocks"].append(block)
            continue

        m = CHAPTER_START.match(p)
        if m:
            if current:
                sections.append(current)
            num, rest = m.group(1), m.group(2).strip()
            section_title = f"{num}. {rest}" if rest else num + "."
            # title may continue on next line
            if not rest and i + 1 < len(paras):
                nxt = paras[i + 1]
                if should_merge_title_line(nxt):
                    section_title = f"{num}. {nxt}"
                    i += 1
            elif rest and i + 1 < len(paras):
                nxt = paras[i + 1]
                if should_merge_title_line(nxt):
                    section_title = f"{section_title} {nxt}"
                    i += 1

            current = {
                "id": slugify(section_title),
                "title": section_title,
                "blocks": [],
            }
            i += 1
            continue

        if current is None:
            current = {"id": "intro", "title": "Оршил", "blocks": []}

        sm = SUBSECTION.match(p)
        if sm:
            current["blocks"].append({"type": "subtitle", "text": f"{sm.group(1)} {sm.group(2)}"})
            i += 1
            continue

        if p.endswith(";") and len(p) < 220:
            # collect consecutive list items
            items = [p]
            i += 1
            while i < len(paras) and paras[i].endswith(";") and len(paras[i]) < 220:
                if CHAPTER_START.match(paras[i]):
                    break
                items.append(paras[i])
                i += 1
            current["blocks"].append({"type": "list", "items": items})
            continue

        current["blocks"].append({"type": "paragraph", "text": p})
        i += 1

    if current:
        sections.append(current)

    return {"title": title, "sections": sections}


def main() -> None:
    paras = read_paras(DOCX)
    doc = parse_charter(paras)
    out_ts = ROOT / "src/lib/charter-data.ts"
    merge_fn = """

export function mergeCharterDocument(raw?: Partial<CharterDocument> | null): CharterDocument {
  if (!raw?.sections?.length) {
    return {
      title: DEFAULT_CHARTER_DOCUMENT.title,
      sections: DEFAULT_CHARTER_DOCUMENT.sections.map(s => ({
        ...s,
        blocks: s.blocks.map(b => ({ ...b })),
      })),
    }
  }
  return {
    title: raw.title?.trim() || DEFAULT_CHARTER_DOCUMENT.title,
    sections: raw.sections as CharterSection[],
  }
}
"""
    header = """export type CharterBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subtitle'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }

export interface CharterSection {
  id: string
  title: string
  blocks: CharterBlock[]
}

export interface CharterDocument {
  title: string
  sections: CharterSection[]
}

export const DEFAULT_CHARTER_DOCUMENT: CharterDocument = """
    content = header + json.dumps(doc, ensure_ascii=False, indent=2) + merge_fn
    out_ts.write_text(content, encoding="utf-8")
    print(f"sections: {len(doc['sections'])}, paras: {len(paras)}")


if __name__ == "__main__":
    main()
