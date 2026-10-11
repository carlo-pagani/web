// Comprueba los sellos de pago que pone el Worker (ver la clase Sello y PRECIOS en worker/src/index.js).
// El Worker fija el precio, crea el pedido y solo sella un pago completo de un pedido suyo; el sello firma el proveedor,
// el número del pago, la referencia, los centavos y el detalle de lo comprado. Un registro que dice «pagado» sin un sello
// válido no es un pago.
//
// Uso:
//   node scripts/verificar_sellos.mjs envios.json   ← lista de envíos de Jotform: [{ "id": "<id del envío>", "texto": "<todo su texto>" }]
//   node scripts/verificar_sellos.mjs texto.txt     ← un solo envío (también por la entrada estándar)
//
// Cada sello se marca:
//   VERIFICADO  la firma es válida y el pago aparece en un solo envío. Compara el detalle (tema y partes) con lo que dice
//               el registro: si el registro dice más partes de las que se pagaron, no cuadra.
//   FALSO       la firma no es válida o la clave es desconocida.
//   REPETIDO    el mismo pago aparece en más de un envío. Única excepción: en la Consulta Express (AE-…) un pago aparece en
//               dos envíos, la constancia del pago y las respuestas; si son más, o ninguno es la constancia, es REPETIDO.
// Sale con 1 si hay algún sello FALSO o REPETIDO, con 2 si no hay ningún sello y con 0 si todo está verificado.
import { readFileSync } from "node:fs";

const SELLO = /sello (v2~(paypal|payphone)~([A-Za-z0-9-]{1,40})~([A-Za-z0-9-]{1,40})~(\d{1,7})~([a-z0-9.]{1,160}))~([0-9a-f]{8})~([A-Za-z0-9_-]{40,120})/g;
const CONSTANCIA = "El cliente sigue respondiendo el cuestionario";
const raiz = new URL("..", import.meta.url);
const claves = JSON.parse(readFileSync(new URL("data/sellos.json", raiz), "utf8"));
const deB64url = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

// Envíos a revisar: [{ id, texto }]
const crudo = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
let envios;
try {
  const j = JSON.parse(crudo);
  envios = (Array.isArray(j) ? j : [j]).map((e, i) => ({ id: String(e.id ?? e.envio ?? i + 1), texto: String(e.texto ?? "") }));
} catch {
  envios = [{ id: "texto", texto: crudo }];
}

function detalle(d) {
  if (d === "masterclass") return "Masterclass";
  const p = d.split("."), extra = p[0] === "extra" ? p.shift() : "", tema = p.shift();
  return `Consulta (${tema})${extra ? ", partes sumadas al final" : ""}: ${p.length ? p.join(", ") : "solo lo esencial"}`;
}

// Junta cada pago con los envíos donde aparece (una vez por envío, aunque el texto lo repita)
const pagos = new Map();
for (const e of envios) {
  const vistos = new Set();
  for (const m of e.texto.matchAll(SELLO)) {
    const [, firmado, proveedor, id, ref, centavos, det, kid, firma] = m, llave = `${proveedor}|${id}`;
    if (vistos.has(llave)) continue;
    vistos.add(llave);
    if (!pagos.has(llave)) pagos.set(llave, { proveedor, id, ref, centavos: Number(centavos), det, kid, firma, firmado, envios: [], otros: [] });
    const p = pagos.get(llave);
    if (p.firmado !== firmado || p.firma !== firma) p.otros.push({ firmado, kid, firma, envio: e.id });
    p.envios.push({ id: e.id, constancia: e.texto.includes(CONSTANCIA) });
  }
}

async function valida(firmado, kid, firma) {
  const clave = claves.find((k) => k.kid === kid);
  if (!clave) return false;
  const publica = await crypto.subtle.importKey("jwk", { kty: clave.kty, crv: clave.crv, x: clave.x, y: clave.y }, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publica, deB64url(firma), new TextEncoder().encode(firmado));
}

let malos = 0;
for (const p of pagos.values()) {
  const donde = `envío ${p.envios.map((e) => e.id).join(", ")}`;
  const resumen = `${p.proveedor} ${p.id} · referencia ${p.ref} · $${(p.centavos / 100).toFixed(2)} USD · ${detalle(p.det)}`;
  const buena = await valida(p.firmado, p.kid, p.firma);
  if (!buena || p.otros.length) {
    malos++;
    console.log(`FALSO      ${resumen} · ${donde}${claves.some((k) => k.kid === p.kid) ? "" : " (clave desconocida)"}${p.otros.length ? " (el mismo pago aparece con datos distintos)" : ""}`);
    continue;
  }
  const n = p.envios.length, constancias = p.envios.filter((e) => e.constancia).length;
  if (n > 1 && !(p.ref.startsWith("AE-") && n === 2 && constancias === 1)) {
    malos++;
    console.log(`REPETIDO   ${resumen} · ${donde}`);
    continue;
  }
  console.log(`VERIFICADO ${resumen} · ${donde}`);
}
if (!pagos.size) console.log("No encontré ningún sello: ningún pago de estos envíos está verificado por el servidor.");
process.exit(malos ? 1 : pagos.size ? 0 : 2);
