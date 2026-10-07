"""Actualiza data/noticias.json (tasas de interés) y data/videos.json (canal de YouTube).

Lo ejecuta la acción programada de GitHub; solo usa la biblioteca estándar.
"""
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CANAL = "UCgNAS6dyYXn8vcLnmSci03A"
CONSULTA = '"tasas de interés" ("banco central" OR "Reserva Federal" OR Fed) when:7d'
MAX_NOTICIAS = 5
MAX_VIDEOS = 12


def leer(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (web carlo-pagani)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def noticias():
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
        {"q": CONSULTA, "hl": "es-419", "gl": "US", "ceid": "US:es-419"})
    raiz = ET.fromstring(leer(url))
    vistas, items = set(), []
    for it in raiz.iter("item"):
        titulo = (it.findtext("title") or "").strip()
        fuente = (it.findtext("source") or "").strip()
        if fuente and titulo.endswith(" - " + fuente):
            titulo = titulo[: -len(" - " + fuente)]
        clave = titulo.lower()[:60]
        if not titulo or clave in vistas:
            continue
        vistas.add(clave)
        try:
            fecha = parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc).isoformat()
        except Exception:
            fecha = None
        items.append({"titulo": titulo, "fuente": fuente, "url": it.findtext("link"), "fecha": fecha})
    items.sort(key=lambda x: x["fecha"] or "", reverse=True)
    return items[:MAX_NOTICIAS]


def videos():
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
          "media": "http://search.yahoo.com/mrss/"}
    raiz = ET.fromstring(leer(f"https://www.youtube.com/feeds/videos.xml?channel_id={CANAL}"))
    out = []
    for e in raiz.findall("a:entry", ns)[:MAX_VIDEOS]:
        vid = e.findtext("yt:videoId", namespaces=ns)
        desc = e.findtext("media:group/media:description", namespaces=ns) or ""
        out.append({"id": vid, "titulo": e.findtext("a:title", namespaces=ns),
                    "fecha": e.findtext("a:published", namespaces=ns),
                    "descripcion": desc.strip().split("\n")[0][:220]})
    return out


def guardar(nombre, items):
    if not items:  # si la fuente falla, se conserva el archivo anterior
        print(f"{nombre}: sin datos nuevos, se conserva el anterior")
        return
    ruta = RAIZ / "data" / nombre
    ruta.parent.mkdir(exist_ok=True)
    datos = {"actualizado": datetime.now(timezone.utc).isoformat(timespec="minutes"), "items": items}
    anterior = json.loads(ruta.read_text("utf-8")) if ruta.exists() else {}
    if anterior.get("items") == items:
        print(f"{nombre}: sin cambios")
        return
    ruta.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"{nombre}: {len(items)} elementos")


for nombre, fuente in (("noticias.json", noticias), ("videos.json", videos)):
    try:
        guardar(nombre, fuente())
    except Exception as exc:
        print(f"{nombre}: error {exc!r}")
