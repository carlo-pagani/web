"""Descarga la transcripción en español de los videos del canal (uso puntual para redactar la página Aprende)."""
import json, subprocess, sys, glob, os, re
from pathlib import Path

IDS = ["C9m2NIsvO3U", "yR5flMvfkpc", "ArzyE5pdRbY", "5hoIyxtzJGQ", "DJEkMKGF4AA",
       "BiRlceclsDg", "GZSyeOmEfJ8", "jhB5hz4Zadg", "wi9hIl7NSTs", "VKFItb_FVOY"]
OUT = Path("transcripciones"); OUT.mkdir(exist_ok=True)

def con_api(vid):
    from youtube_transcript_api import YouTubeTranscriptApi
    api = YouTubeTranscriptApi()
    t = api.fetch(vid, languages=["es", "es-419", "es-MX", "es-ES"])
    return " ".join(s.text for s in t)

def con_ytdlp(vid):
    subprocess.run(["yt-dlp", "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "es.*,es",
                    "--sub-format", "vtt", "-o", f"/tmp/{vid}.%(ext)s", f"https://www.youtube.com/watch?v={vid}"], check=False)
    archivos = glob.glob(f"/tmp/{vid}*.vtt")
    if not archivos:
        raise RuntimeError("sin subtítulos")
    lineas, prev = [], None
    for l in open(archivos[0], encoding="utf-8"):
        l = re.sub(r"<[^>]+>", "", l).strip()
        if not l or "-->" in l or l.startswith(("WEBVTT", "Kind:", "Language:")) or l == prev:
            continue
        lineas.append(l); prev = l
    return " ".join(lineas)

for vid in IDS:
    texto, err = None, []
    for f in (con_api, con_ytdlp):
        try:
            texto = f(vid); break
        except Exception as e:
            err.append(f"{f.__name__}: {e!r}"[:300])
    (OUT / f"{vid}.txt").write_text(texto if texto else "ERROR\n" + "\n".join(err), encoding="utf-8")
    print(vid, "ok" if texto else "ERROR", len(texto or ""))
