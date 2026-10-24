#!/usr/bin/env python3
"""Build index.html (the GitHub Pages app) from src/app.html + data/words.json.

    python3 build.py            # writes index.html
    python3 build.py --artifact # also prints a body-only version (no <html>/<head> wrapper)
                                # for publishing as a Claude artifact

No dependencies beyond the Python standard library.
"""
import json, sys, pathlib

ROOT = pathlib.Path(__file__).parent
HEAD = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="theme-color" content="#0f5c6e">'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0}img{max-width:100%}</style></head><body>\n')

def main():
    words = json.loads((ROOT / "data/words.json").read_text())
    for i, w in enumerate(words):
        assert isinstance(w, list) and len(w) == 4 and all(isinstance(s, str) and s for s in w), f"bad entry {i}: {w}"
    tpl = (ROOT / "src/app.html").read_text()
    assert tpl.count("__DATA__") == 1, "src/app.html must contain __DATA__ exactly once"
    body = tpl.replace("__DATA__", json.dumps(words, ensure_ascii=False, separators=(",", ":")))
    (ROOT / "index.html").write_text(HEAD + body + "\n</body></html>\n")
    if "--artifact" in sys.argv:
        (ROOT / "dist").mkdir(exist_ok=True)
        (ROOT / "dist/artifact.html").write_text(body)
        print("wrote dist/artifact.html")
    print(f"wrote index.html ({len(words)} words)")

if __name__ == "__main__":
    main()
