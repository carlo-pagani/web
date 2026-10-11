// Comprueba los sellos de pago que pone el Worker (ver la clase Sello en worker/src/index.js).
// Uso: node scripts/verificar_sellos.mjs < texto.txt   (o con archivos como argumentos)
// Lee cualquier texto (registros de Jotform copiados tal cual), encuentra cada «sello v1~…» y dice si la firma es válida
// con alguna de las claves públicas de data/sellos.json. Un registro que dice «pagado» sin un sello válido no es un pago.
// También avisa si un cupo de la Masterclass (referencia MC-…) no se pagó por su precio completo; en la Consulta Express
// hay que comparar el monto con el importe que dice el registro, porque depende de las partes elegidas.
// Sale con código 1 si hay algún sello falso, un mismo pago sellado para dos referencias o un monto que no cuadra.
// Si el texto no tiene ningún sello, sale con código 2: ese registro no es un pago verificado.
import { readFileSync } from "node:fs";

const PRECIO_MASTERCLASS = 1500;   // centavos, IVA incluido
const SELLO = /sello (v1~(paypal|payphone)~([A-Za-z0-9-]{1,40})~([A-Za-z0-9-]{1,40})~(\d+))~([0-9a-f]{8})~([A-Za-z0-9_-]+)/g;
const raiz = new URL("..", import.meta.url);
const claves = JSON.parse(readFileSync(new URL("data/sellos.json", raiz), "utf8"));
const texto = process.argv.length > 2 ? process.argv.slice(2).map((f) => readFileSync(f, "utf8")).join("\n") : readFileSync(0, "utf8");
const deB64url = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

let malos = 0, n = 0;
const pagos = new Map();
for (const m of texto.matchAll(SELLO)) {
  n++;
  const [, firmado, proveedor, id, ref, centavos, kid, firma] = m;
  const clave = claves.find((k) => k.kid === kid);
  let valido = false;
  if (clave) {
    const publica = await crypto.subtle.importKey("jwk", { kty: clave.kty, crv: clave.crv, x: clave.x, y: clave.y }, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    valido = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publica, deB64url(firma), new TextEncoder().encode(firmado));
  }
  const monto = `$${(Number(centavos) / 100).toFixed(2)} USD`;
  if (!valido) {
    malos++;
    console.log(`FALSO     ${proveedor} ${id} · referencia ${ref} · ${monto}${clave ? "" : " (clave desconocida)"}`);
    continue;
  }
  const llave = `${proveedor}|${id}`;
  if (pagos.has(llave) && pagos.get(llave) !== ref) {
    malos++;
    console.log(`REPETIDO  ${proveedor} ${id} · referencias ${pagos.get(llave)} y ${ref}`);
    continue;
  }
  pagos.set(llave, ref);
  if (ref.startsWith("MC-") && Number(centavos) !== PRECIO_MASTERCLASS) {
    malos++;
    console.log(`MONTO     ${proveedor} ${id} · referencia ${ref} · ${monto}: la Masterclass cuesta $${(PRECIO_MASTERCLASS / 100).toFixed(2)}`);
    continue;
  }
  console.log(`VERIFICADO ${proveedor} ${id} · referencia ${ref} · ${monto}`);
}
if (!n) console.log("No encontré ningún sello: ningún pago de este texto está verificado por el servidor.");
process.exit(malos ? 1 : n ? 0 : 2);
