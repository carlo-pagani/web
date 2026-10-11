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
//   DUPLICADO   la firma es válida y el pago aparece en varios envíos con exactamente el mismo texto (un reenvío tras un
//               corte): es una sola compra y cuenta una vez, con el primero de esos envíos.
//   REPETIDO    el mismo pago aparece en envíos distintos: un pago vale para un solo cupo o un solo informe. (La constancia
//               que la Consulta Express envía al pagar no lleva el sello; el sello llega solo con las respuestas.)
// El «texto» de cada envío debe ser solo lo que escribió el cliente, sin el número ni la fecha del envío, para que dos
// reenvíos idénticos se reconozcan.
// Sale con 1 si hay algún sello FALSO o REPETIDO, con 2 si no hay ningún sello y con 0 si todo está verificado.
import { readFileSync } from "node:fs";

const SELLO = /sello (v2~(paypal|payphone)~([A-Za-z0-9-]{1,40})~([A-Za-z0-9-]{1,40})~(\d{1,7})~([a-z0-9.]{1,160}))~([0-9a-f]{8})~([A-Za-z0-9_-]{40,120})/g;
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
    if (!pagos.has(llave)) pagos.set(llave, { proveedor, id, ref, centavos: Number(centavos), det, kid, firma, firmado, envios: [], textos: new Set(), otros: [] });
    const p = pagos.get(llave);
    if (p.firmado !== firmado || p.firma !== firma) p.otros.push({ firmado, kid, firma, envio: e.id });
    p.envios.push(e.id);
    p.textos.add(e.texto.trim());
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
  const donde = `envío ${p.envios.join(", ")}`;
  const resumen = `${p.proveedor} ${p.id} · referencia ${p.ref} · $${(p.centavos / 100).toFixed(2)} USD · ${detalle(p.det)}`;
  const buena = await valida(p.firmado, p.kid, p.firma);
  if (!buena || p.otros.length) {
    malos++;
    console.log(`FALSO      ${resumen} · ${donde}${claves.some((k) => k.kid === p.kid) ? "" : " (clave desconocida)"}${p.otros.length ? " (el mismo pago aparece con datos distintos)" : ""}`);
    continue;
  }
  if (p.envios.length > 1 && p.textos.size === 1) {
    const copias = p.envios.slice(1), una = copias.length === 1;
    console.log(`DUPLICADO  ${resumen} · envío ${p.envios[0]} (${una ? "el envío" : "los envíos"} ${copias.join(", ")} ${una ? "es copia idéntica" : "son copias idénticas"}; cuenta una vez)`);
    continue;
  }
  if (p.envios.length > 1) {
    malos++;
    console.log(`REPETIDO   ${resumen} · ${donde}`);
    continue;
  }
  console.log(`VERIFICADO ${resumen} · ${donde}`);
}
if (!pagos.size) console.log("No encontré ningún sello: ningún pago de estos envíos está verificado por el servidor.");
process.exit(malos ? 1 : pagos.size ? 0 : 2);
