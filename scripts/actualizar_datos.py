"""Actualiza data/noticias.json (economía: EE. UU., América Latina y Ecuador), data/videos.json (canal de YouTube) y data/btc.json (precio de bitcoin).

Lo ejecuta la acción programada de GitHub; solo usa la biblioteca estándar.
"""
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CANAL = "UCgNAS6dyYXn8vcLnmSci03A"
# Carrete y sección de noticias: dos titulares de economía mundial centrados en EE. UU., uno de América Latina y dos de Ecuador
GRUPOS = [
    {"region": "EE. UU.", "n": 2, "gl": "US",
     "q": '("Reserva Federal" OR "Wall Street" OR "economía de Estados Unidos" OR "inflación en Estados Unidos" OR "empleo en Estados Unidos" OR aranceles OR "bonos del Tesoro") when:3d',
     "foco": r"Estados Unidos|EE\. ?UU|EEUU|\bFed\b|Reserva Federal|Wall Street|Powell|Tesoro|Trump|S&P|Nasdaq|Dow Jones|estadounidense"},
    {"region": "América Latina", "n": 1, "gl": "US",
     "q": '("América Latina" OR Latinoamérica OR CEPAL OR "la región") economía when:7d',
     "foco": r"América Latina|Latinoam[eé]rica|latinoamerican|CEPAL|\bBID\b|la región|Sudam[eé]rica"},
    {"region": "Ecuador", "n": 2, "gl": "EC",
     "q": 'Ecuador (economía OR "Banco Central del Ecuador" OR "riesgo país" OR SRI OR petróleo OR impuestos OR IVA OR exportaciones OR FMI OR crédito OR inversión) when:4d',
     "foco": r"Ecuador|ecuatorian|Quito|Guayaquil|\bSRI\b|Noboa"},
]
ECONOMIA = re.compile(r"econom|inflaci|\btasas?\b|interés|\bFed\b|Reserva Federal|banc|bolsa|Wall Street|d[oó]lar|\bPIB\b|empleo|desempleo|arancel|petr[oó]leo|crudo|deuda|bonos?\b|riesgo pa[ií]s|\bFMI\b|impuest|\bIVA\b|\bSRI\b|export|import|cr[eé]dito|inversi|mercado|precio|salari|presupuest|fiscal|recesi[oó]n|crecimiento|\bBID\b|CEPAL|comercio|remesas|miner[ií]a|financ|recaudaci", re.I)
MAX_VIDEOS = 12


def leer(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (web carlo-pagani)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def buscar(grupo):
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
        {"q": grupo["q"], "hl": "es-419", "gl": grupo["gl"], "ceid": grupo["gl"] + ":es-419"})
    raiz = ET.fromstring(leer(url))
    items = []
    for it in raiz.iter("item"):
        titulo = (it.findtext("title") or "").strip()
        fuente = (it.findtext("source") or "").strip()
        if fuente and titulo.endswith(" - " + fuente):
            titulo = titulo[: -len(" - " + fuente)]
        if not titulo:
            continue
        try:
            fecha = parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc).isoformat()
        except Exception:
            fecha = None
        items.append({"region": grupo["region"], "titulo": titulo, "fuente": fuente, "url": it.findtext("link"), "fecha": fecha})
    items.sort(key=lambda x: x["fecha"] or "", reverse=True)
    # primero los titulares que hablan de economía y de esa región; si no alcanzan, se completa con los de economía
    foco = re.compile(grupo["foco"], re.I)
    mejores = [i for i in items if ECONOMIA.search(i["titulo"]) and foco.search(i["titulo"])]
    return mejores + [i for i in items if ECONOMIA.search(i["titulo"]) and i not in mejores]


def noticias():
    ruta = RAIZ / "data" / "noticias.json"
    anteriores = json.loads(ruta.read_text("utf-8")).get("items", []) if ruta.exists() else []
    vistas, out = set(), []
    for grupo in GRUPOS:
        try:
            candidatos = buscar(grupo)
        except Exception as exc:
            print(f"noticias {grupo['region']}: error {exc!r}")
            candidatos = []
        # si una región no trae nada, se conservan sus titulares anteriores
        candidatos += [i for i in anteriores if i.get("region") == grupo["region"]]
        tomados = 0
        for i in candidatos:
            clave = i["titulo"].lower()[:60]
            if clave in vistas:
                continue
            vistas.add(clave)
            out.append(i)
            tomados += 1
            if tomados == grupo["n"]:
                break
    return out


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


def btc():
    """Precio de bitcoin en dólares: cierre semanal desde 2013 (Kraken) y el último precio como punto final."""
    datos = json.loads(leer("https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=10080"))
    if datos.get("error"):
        raise RuntimeError(datos["error"])
    velas = next(v for k, v in datos["result"].items() if k != "last")
    out = [[datetime.fromtimestamp(int(v[0]), timezone.utc).strftime("%Y-%m-%d"), round(float(v[4]), 2)] for v in velas]
    try:
        tic = json.loads(leer("https://api.kraken.com/0/public/Ticker?pair=XBTUSD"))["result"]
        ultimo = round(float(next(iter(tic.values()))["c"][0]), 2)
        out.append([datetime.now(timezone.utc).strftime("%Y-%m-%d"), ultimo])
    except Exception as exc:
        print(f"btc: sin precio actual {exc!r}")
    return out if len(out) > 100 else []


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


for nombre, fuente in (("noticias.json", noticias), ("videos.json", videos), ("btc.json", btc)):
    try:
        guardar(nombre, fuente())
    except Exception as exc:
        print(f"{nombre}: error {exc!r}")
