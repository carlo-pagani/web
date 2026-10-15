"""Revisión periódica del rendimiento de carlo-pagani.com.

Deja un informe en informes/AAAA-MM-DD.json y .md (la acción los guarda en la
rama «monitoreo», fuera del sitio publicado). Tres partes:

1. Disponibilidad: que cada página del sitemap responda 200.
2. Velocidad: puntajes de Lighthouse (teléfono y computadora) que la acción
   deja en lighthouse/*.json.
3. Google: si existe el secreto GSC_CREDENTIALS (cuenta de servicio con acceso
   de lectura a Search Console), impresiones, clics, posición, consultas,
   páginas, sitemaps y estado de indexación de cada página.
"""

import datetime as dt
import glob
import json
import os
import re
import sys
import urllib.request

SITIO = "https://carlo-pagani.com"
PROPIEDAD = "sc-domain:carlo-pagani.com"
HOY = dt.date.today()


def paginas_del_sitemap():
    with urllib.request.urlopen(SITIO + "/sitemap.xml", timeout=30) as r:
        return re.findall(r"<loc>(.*?)</loc>", r.read().decode())


def disponibilidad(urls):
    filas = []
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "monitoreo-carlo-pagani"})
            with urllib.request.urlopen(req, timeout=30) as r:
                filas.append({"url": url, "estado": r.status})
        except Exception as e:  # noqa: BLE001
            filas.append({"url": url, "estado": getattr(e, "code", str(e))})
    return filas


def velocidad():
    filas = []
    for ruta in sorted(glob.glob("lighthouse/*.json")):
        try:
            d = json.load(open(ruta))
        except Exception:  # noqa: BLE001
            continue
        a = d.get("audits", {})
        cat = d.get("categories", {})

        def num(clave):
            return a.get(clave, {}).get("numericValue")

        def puntaje(clave):
            s = cat.get(clave, {}).get("score")
            return None if s is None else round(s * 100)

        filas.append({
            "url": d.get("finalDisplayedUrl") or d.get("requestedUrl"),
            "dispositivo": d.get("configSettings", {}).get("formFactor"),
            "rendimiento": puntaje("performance"),
            "accesibilidad": puntaje("accessibility"),
            "buenas_practicas": puntaje("best-practices"),
            "seo": puntaje("seo"),
            "lcp_s": None if num("largest-contentful-paint") is None else round(num("largest-contentful-paint") / 1000, 2),
            "cls": None if num("cumulative-layout-shift") is None else round(num("cumulative-layout-shift"), 3),
            "tbt_ms": None if num("total-blocking-time") is None else round(num("total-blocking-time")),
        })
    return filas


def search_console(urls):
    credenciales = os.environ.get("GSC_CREDENTIALS", "").strip()
    if not credenciales:
        return {"disponible": False, "motivo": "Falta el secreto GSC_CREDENTIALS"}

    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession

    cred = service_account.Credentials.from_service_account_info(
        json.loads(credenciales),
        scopes=["https://www.googleapis.com/auth/webmasters.readonly"],
    )
    s = AuthorizedSession(cred)
    base = "https://searchconsole.googleapis.com/webmasters/v3/sites/" + urllib.request.quote(PROPIEDAD, safe="")

    # Los datos de Google llegan con 2 o 3 días de retraso.
    fin = HOY - dt.timedelta(days=2)

    def consulta(dias, dimensiones, filas=25):
        cuerpo = {
            "startDate": str(fin - dt.timedelta(days=dias - 1)),
            "endDate": str(fin),
            "dimensions": dimensiones,
            "rowLimit": filas,
        }
        r = s.post(base + "/searchAnalytics/query", json=cuerpo, timeout=60)
        r.raise_for_status()
        return r.json().get("rows", [])

    def limpiar(filas):
        return [{
            "clave": f.get("keys", []),
            "clics": f["clicks"],
            "impresiones": f["impressions"],
            "ctr": round(f["ctr"] * 100, 1),
            "posicion": round(f["position"], 1),
        } for f in filas]

    resultado = {"disponible": True, "hasta": str(fin)}
    for dias in (8, 28):
        resultado[f"ultimos_{dias}_dias"] = {
            "total": limpiar(consulta(dias, [])),
            "consultas": limpiar(consulta(dias, ["query"])),
            "paginas": limpiar(consulta(dias, ["page"])),
            "paises": limpiar(consulta(dias, ["country"], 10)),
            "dispositivos": limpiar(consulta(dias, ["device"], 5)),
        }
    resultado["por_dia"] = limpiar(consulta(28, ["date"], 40))

    r = s.get(base + "/sitemaps", timeout=60)
    resultado["sitemaps"] = r.json().get("sitemap", []) if r.ok else {"error": r.status_code}

    indexacion = []
    for url in urls:
        r = s.post(
            "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
            json={"inspectionUrl": url, "siteUrl": PROPIEDAD, "languageCode": "es"},
            timeout=60,
        )
        if not r.ok:
            indexacion.append({"url": url, "error": r.status_code})
            continue
        i = r.json().get("inspectionResult", {}).get("indexStatusResult", {})
        indexacion.append({
            "url": url,
            "veredicto": i.get("verdict"),
            "estado": i.get("coverageState"),
            "ultimo_rastreo": i.get("lastCrawlTime"),
            "canonica_google": i.get("googleCanonical"),
        })
    resultado["indexacion"] = indexacion
    return resultado


def markdown(inf):
    l = [f"# Monitoreo de carlo-pagani.com — {inf['fecha']}", ""]
    l += ["## Disponibilidad", ""]
    l += [f"- {f['url']}: {f['estado']}" for f in inf["disponibilidad"]]
    l += ["", "## Velocidad (Lighthouse, 0 a 100)", "",
          "| Página | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP (s) | CLS | TBT (ms) |",
          "|---|---|---|---|---|---|---|---|---|"]
    for f in inf["velocidad"]:
        l.append(f"| {f['url']} | {f['dispositivo']} | {f['rendimiento']} | {f['accesibilidad']} | "
                 f"{f['buenas_practicas']} | {f['seo']} | {f['lcp_s']} | {f['cls']} | {f['tbt_ms']} |")
    g = inf["google"]
    l += ["", "## Google Search Console", ""]
    if not g.get("disponible"):
        l.append(f"Sin datos: {g.get('motivo') or g.get('error')}")
    else:
        for dias in (8, 28):
            p = g[f"ultimos_{dias}_dias"]
            t = p["total"][0] if p["total"] else {"clics": 0, "impresiones": 0, "ctr": 0, "posicion": "-"}
            l += [f"### Últimos {dias} días (hasta {g['hasta']})", "",
                  f"Impresiones {t['impresiones']}, clics {t['clics']}, CTR {t['ctr']} %, posición media {t['posicion']}", ""]
            for nombre in ("consultas", "paginas"):
                if p[nombre]:
                    l.append(f"**{nombre.capitalize()}**")
                    l += [f"- {' '.join(f['clave'])}: {f['impresiones']} impr., {f['clics']} clics, pos. {f['posicion']}"
                          for f in p[nombre][:15]]
                    l.append("")
        l.append("### Indexación")
        l += [f"- {f['url']}: {f.get('estado') or f.get('error')}" for f in g["indexacion"]]
    return "\n".join(l) + "\n"


def main():
    urls = paginas_del_sitemap()
    inf = {
        "fecha": str(HOY),
        "disponibilidad": disponibilidad(urls),
        "velocidad": velocidad(),
    }
    try:
        inf["google"] = search_console(urls)
    except Exception as e:  # noqa: BLE001
        inf["google"] = {"disponible": False, "error": str(e)[:500]}
    os.makedirs("informes", exist_ok=True)
    json.dump(inf, open(f"informes/{HOY}.json", "w"), ensure_ascii=False, indent=1)
    open(f"informes/{HOY}.md", "w").write(markdown(inf))
    print(markdown(inf))
    return 0


if __name__ == "__main__":
    sys.exit(main())
