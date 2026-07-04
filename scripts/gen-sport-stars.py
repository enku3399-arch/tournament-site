import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = Path(r"C:\Users\Enku\Downloads\89 ОУХМ,СМ нэрс (1).docx")
W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def read_docx_rows(path: Path) -> list[list[str]]:
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    rows: list[list[str]] = []
    for tr in root.iter(f"{W_NS}tr"):
        cells: list[str] = []
        for tc in tr.findall(f"{W_NS}tc"):
            texts: list[str] = []
            for t in tc.iter(f"{W_NS}t"):
                if t.text:
                    texts.append(t.text)
                if t.tail:
                    texts.append(t.tail)
            cells.append("".join(texts).strip())
        if any(cells):
            rows.append(cells)
    return rows


rows = read_docx_rows(DOCX)

current_aimag = ""
aimag_phones: dict[str, str] = {}
entries: list[dict[str, str]] = []

for r in rows[1:]:
    while len(r) < 5:
        r.append("")
    if r[1].strip():
        current_aimag = r[1].strip()
        if r[4].strip():
            aimag_phones[current_aimag] = r[4].strip()
    name = r[2].strip().replace("_", ".")
    rank = r[3].strip()
    if name:
        entries.append({"aimag": current_aimag, "name": name, "rank": rank})


def extract_phone(s: str) -> str:
    m = re.search(r"(\d{7,8})", s.replace(" ", ""))
    return m.group(1) if m else ""


grouped: OrderedDict[str, list[dict[str, str]]] = OrderedDict()
for e in entries:
    grouped.setdefault(e["aimag"], []).append({"name": e["name"], "rank": e["rank"]})

groups = []
for aimag, athletes in grouped.items():
    contact = aimag_phones.get(aimag, "")
    groups.append({
        "aimag": aimag,
        "phone": extract_phone(contact),
        "athletes": athletes,
    })

out = ROOT / "src/lib/sport-stars-data.ts"
merge_fn = """

export function mergeSportStarGroups(raw?: SportStarGroup[] | null): SportStarGroup[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_SPORT_STAR_GROUPS.map(g => ({
      ...g,
      athletes: g.athletes.map(a => ({ ...a })),
    }))
  }
  return raw.map((g, i) => ({
    aimag: g.aimag?.trim() || DEFAULT_SPORT_STAR_GROUPS[i]?.aimag || '',
    phone: g.phone?.trim() || '',
    athletes: (g.athletes ?? []).map(a => ({
      name: a.name?.trim() || '',
      rank: a.rank?.trim() || '',
    })).filter(a => a.name),
  })).filter(g => g.aimag)
}
"""

header = """export interface SportStarAthlete {
  name: string
  rank: string
}

export interface SportStarGroup {
  aimag: string
  phone: string
  athletes: SportStarAthlete[]
}

export const DEFAULT_SPORT_STAR_GROUPS: SportStarGroup[] = """
content = header + json.dumps(groups, ensure_ascii=False, indent=2) + merge_fn
out.write_text(content, encoding="utf-8")
print(f"written {len(groups)} groups, {len(entries)} athletes")
