(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var CANAL = 'https://www.youtube.com/channel/UCgNAS6dyYXn8vcLnmSci03A';
  var fmt0 = new Intl.NumberFormat('es', { maximumFractionDigits: 0 });
  var fmtC = new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 });
  var fmt1 = new Intl.NumberFormat('es', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  var fmtFecha = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });
  var fmtFechaLarga = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(name, attrs, s, parent) { var n = el(name, attrs, parent); n.textContent = s; return n; }
  function niceMax(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    var s = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return s * p;
  }
  function tooltip(box) {
    var t = box.querySelector('.tip');
    if (!t) { t = document.createElement('div'); t.className = 'tip'; t.hidden = true; box.appendChild(t); }
    return t;
  }
  function showTip(box, svg, W, html, x, y) {
    var t = tooltip(box), sr = svg.getBoundingClientRect(), br = box.getBoundingClientRect(), s = sr.width / W;
    t.innerHTML = html; t.style.left = (sr.left - br.left + x * s) + 'px'; t.style.top = (sr.top - br.top + y * s) + 'px'; t.hidden = false;
  }
  function hideTip(box) { tooltip(box).hidden = true; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

  if (document.getElementById('metas')) (function () {
  /* ---------- Metas financieras ---------- */
  var OBJ = {
    jubilacion: { anios: 25, d: 'Jubilación: construir un capital que, cuando dejes de trabajar, te pague una renta sin depender de un sueldo. Es la meta de más largo plazo, y ahí el tiempo hace la mayor parte del trabajo.' },
    pasivo: { anios: 15, d: 'Ingreso pasivo: un capital cuyo rendimiento te asegure un ingreso fijo para trabajar menos y dedicarte más a lo que te gusta. Como referencia, la regla del 4 % sugiere reunir unas 25 veces el gasto anual que quieras cubrir.' },
    educacion: { anios: 12, d: 'Educación de los hijos: una fecha conocida y difícil de mover. Conviene ir bajando el riesgo de la inversión a medida que se acerca el ingreso a la universidad.' },
    vivienda: { anios: 5, d: 'Vivienda: reunir la cuota inicial de una casa. En plazos de tres a siete años, la estabilidad pesa más que el rendimiento.' },
    patrimonio: { anios: 20, d: 'Patrimonio a largo plazo: hacer crecer tu capital sin un uso definido. Es donde más rinden la diversificación y la paciencia.' }
  };
  var form = document.getElementById('meta');
  function num(id) { var n = parseFloat(document.getElementById(id).value); return isFinite(n) ? n : 0; }
  function modo() { return document.getElementById('modo-hoy').checked ? 'hoy' : 'futuro'; }

  function fvAportes(A, rr, meses) {
    var m = Math.pow(1 + rr, 1 / 12) - 1;
    return Math.abs(m) < 1e-12 ? A * meses : A * (Math.pow(1 + m, meses) - 1) / m;
  }
  function anios(n) { return n + (n === 1 ? ' año' : ' años'); }

  function calcMeta() {
    var m = modo(), monto = Math.max(num('monto'), 0), A = Math.max(num('aporte'), 0), r = num('retorno') / 100;
    var n = Math.min(Math.max(Math.round(num('anios')), 1), 50);
    var infl = document.getElementById('inflacion').checked;
    var rr = (1 + r) / (infl ? 1.03 : 1) - 1;
    var fA = fvAportes(A, rr, 12 * n);
    var capital = m === 'futuro' ? monto : Math.max((monto - fA) / Math.pow(1 + rr, n), 0);
    var serie = [];
    for (var t = 1; t <= n; t++) serie.push({ t: t, v: capital * Math.pow(1 + rr, t) + fvAportes(A, rr, 12 * t), ap: capital + A * 12 * t });
    var last = serie[n - 1], interes = last.v - last.ap;
    var hoyTxt = infl ? ', en dinero de hoy,' : '';
    var tasa = ' Rendimiento ' + (infl ? 'real ' : '') + 'de ' + fmt1.format(rr * 100) + ' % anual.';
    var reparto = interes > 0
      ? 'Tú aportas ' + fmt0.format(last.ap) + ' y el interés compuesto genera ' + fmt0.format(interes) + ': el ' + fmt0.format(interes / last.v * 100) + ' % del total.' + tasa
      : 'Con este rendimiento tu dinero pierde poder de compra frente a la inflación.';
    document.getElementById('monto-label').firstChild.textContent = m === 'futuro' ? 'Capital que invierto hoy' : 'Monto que quiero reunir';
    if (m === 'futuro') {
      document.getElementById('res-label').textContent = 'En ' + anios(n) + hoyTxt + ' tendrás';
      document.getElementById('res-valor').textContent = fmt0.format(last.v);
      document.getElementById('res-detalle').textContent = reparto;
    } else if (capital === 0 && A > 0) {
      document.getElementById('res-label').textContent = 'Con ' + fmt0.format(A) + ' al mes no necesitas un monto inicial';
      document.getElementById('res-valor').textContent = fmt0.format(fA);
      document.getElementById('res-detalle').textContent = 'Es lo que reúnes' + (infl ? ' en dinero de hoy' : '') + ' en ' + anios(n) + ', por encima de tu meta de ' + fmt0.format(monto) + '. ' + reparto;
    } else {
      document.getElementById('res-label').textContent = 'Para reunir ' + fmt0.format(monto) + hoyTxt + ' en ' + anios(n) + (A > 0 ? ' aportando ' + fmt0.format(A) + ' al mes' : '') + ', invierte hoy';
      document.getElementById('res-valor').textContent = fmt0.format(capital);
      document.getElementById('res-detalle').textContent = reparto;
    }
    drawMeta(serie, infl);
  }

  function drawMeta(serie, infl) {
    var svg = document.getElementById('meta-chart'), box = document.getElementById('meta-chart-box');
    var W = Math.max(svg.parentNode.clientWidth - 32, 260), H = 260, L = 52, R = 8, T = 10, B = 26;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = '';
    var max = niceMax(Math.max.apply(null, serie.map(function (d) { return Math.max(d.v, d.ap); })));
    var y = function (v) { return T + (H - T - B) * (1 - v / max); };
    var g = el('g', { 'class': 'axis' }, svg);
    for (var i = 0; i <= 4; i++) {
      var v = max * i / 4, yy = y(v);
      el('line', { x1: L, x2: W - R, y1: yy, y2: yy, 'class': 'grid-line' }, g);
      txt('text', { x: L - 8, y: yy + 4, 'text-anchor': 'end' }, fmtC.format(v), g);
    }
    var n = serie.length, band = (W - L - R) / n, gap = n > 30 ? 1 : 2, bw = Math.max(band - gap, 1);
    var every = n <= 10 ? 1 : n <= 20 ? 2 : 5;
    serie.forEach(function (d, k) {
      var x = L + k * band + gap / 2;
      var ap = Math.min(d.ap, d.v), gan = Math.max(d.v - d.ap, 0);
      var yAp = y(ap), yTop = y(d.v), base = y(0);
      var gBar = el('g', {}, svg);
      el('rect', { x: x, y: yAp, width: bw, height: Math.max(base - yAp, 0), fill: 'var(--c1)' }, gBar);
      if (gan > 0) el('path', { d: barTop(x, yTop, bw, Math.max(yAp - yTop - 2, 0)), fill: 'var(--c2)' }, gBar);
      var hit = el('rect', { x: L + k * band, y: T, width: band, height: H - T - B, fill: 'transparent' }, gBar);
      hit.addEventListener('mousemove', function () {
        showTip(box, svg, W, '<b>Año ' + d.t + '</b><br>Total: ' + fmt0.format(d.v) + '<br>Aportado: ' + fmt0.format(d.ap) + '<br>Interés compuesto: ' + fmt0.format(gan) + (infl ? '<br><i>en dinero de hoy</i>' : ''), x + bw / 2, yTop);
      });
      hit.addEventListener('mouseleave', function () { hideTip(box); });
      if ((d.t % every === 0) || d.t === 1) txt('text', { x: x + bw / 2, y: H - 8, 'text-anchor': 'middle', 'class': 'lbl' }, d.t, svg);
    });
    var last = serie[n - 1];
    txt('text', { x: W - R, y: Math.max(y(last.v) - 6, 10), 'text-anchor': 'end', 'class': 'lbl strong' }, fmtC.format(last.v), svg);
  }
  function barTop(x, y, w, h) {
    var r = Math.min(4, w / 2, h);
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }
  function setObjetivo(cambiarAnios) {
    var o = OBJ[document.getElementById('objetivo').value];
    document.getElementById('objetivo-desc').textContent = o.d + ' Plazo de referencia: ' + o.anios + ' años.';
    if (cambiarAnios) document.getElementById('anios').value = o.anios;
  }
  document.getElementById('objetivo').addEventListener('change', function () { setObjetivo(true); calcMeta(); });
  form.addEventListener('input', function (e) { if (e.target.id !== 'objetivo') calcMeta(); });
  form.addEventListener('change', function (e) { if (e.target.name === 'modo' || e.target.id === 'inflacion') calcMeta(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  var VIDEOS = [];
  var VIDEO_OBJ = { jubilacion: /jubil|retiro/i, pasivo: /metas de inversi|no invertir/i, educacion: /metas de inversi/i, vivienda: /casa/i, patrimonio: /metas de inversi|no invertir/i };
  function videoMeta() {
    var re = VIDEO_OBJ[document.getElementById('objetivo').value];
    var v = VIDEOS.filter(function (x) { return re.test(x.titulo); })[0] || VIDEOS.filter(function (x) { return /metas de inversi/i.test(x.titulo); })[0];
    var a = document.getElementById('meta-video');
    if (v) { a.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(v.id); a.textContent = 'Te lo explico en video: «' + v.titulo + '» →'; }
  }
  document.getElementById('objetivo').addEventListener('change', videoMeta);
  setObjetivo(false); calcMeta();

  /* ---------- Dalio: riesgo vs número de activos ---------- */
  function drawDalio() {
    var svg = document.getElementById('dalio-chart'), box = document.getElementById('dalio-box');
    var W = Math.max(svg.parentNode.clientWidth - 32, 260), H = 240, L = 36, R = 44, T = 10, B = 30;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = '';
    var rhos = [0, 0.2, 0.4, 0.6], cols = ['var(--s0)', 'var(--s1)', 'var(--s2)', 'var(--s3)'];
    var N = 20, sig = function (n, p) { return 10 * Math.sqrt(1 / n + (1 - 1 / n) * p); };
    var x = function (n) { return L + (W - L - R) * (n - 1) / (N - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - v / 10); };
    var g = el('g', { 'class': 'axis' }, svg);
    [0, 2.5, 5, 7.5, 10].forEach(function (v) {
      el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), 'class': 'grid-line' }, g);
      txt('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, fmt0.format(v) + '%', g);
    });
    [1, 5, 10, 15, 20].forEach(function (n) { txt('text', { x: x(n), y: H - 12, 'text-anchor': 'middle' }, n, g); });
    txt('text', { x: (L + W - R) / 2, y: H, 'text-anchor': 'middle', 'class': 'lbl' }, 'número de activos', svg);
    rhos.slice().reverse().forEach(function (p, i) {
      var idx = rhos.length - 1 - i, d = '';
      for (var n = 1; n <= N; n++) d += (n === 1 ? 'M' : 'L') + x(n).toFixed(1) + ',' + y(sig(n, p)).toFixed(1);
      el('path', { d: d, fill: 'none', stroke: cols[idx], 'stroke-width': idx === 0 ? 2.5 : 2, 'stroke-linejoin': 'round' }, svg);
      txt('text', { x: x(N) + 6, y: y(sig(N, p)) + 4, 'class': 'lbl' + (idx === 0 ? ' strong' : '') }, 'ρ ' + fmt1.format(p), svg);
    });
    el('circle', { cx: x(15), cy: y(sig(15, 0)), r: 4.5, fill: 'var(--s0)', stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
    txt('text', { x: x(15), y: y(sig(15, 0)) - 12, 'text-anchor': 'middle', 'class': 'lbl strong' }, '−74 %', svg);
    var cross = el('line', { y1: T, y2: H - B, stroke: 'var(--ink-soft)', 'stroke-width': 1, opacity: 0 }, svg);
    var hit = el('rect', { x: L, y: T, width: W - L - R, height: H - T - B, fill: 'transparent' }, svg);
    hit.addEventListener('mousemove', function (e) {
      var rect = svg.getBoundingClientRect(), sx = rect.width / W;
      var px = (e.clientX - rect.left) / sx, n = Math.min(N, Math.max(1, Math.round(1 + (px - L) / (W - L - R) * (N - 1))));
      cross.setAttribute('x1', x(n)); cross.setAttribute('x2', x(n)); cross.setAttribute('opacity', .5);
      var html = '<b>' + n + (n === 1 ? ' activo' : ' activos') + '</b>' + rhos.map(function (p) { return '<br>Correlación ' + fmt1.format(p) + ': ' + fmt1.format(sig(n, p)) + ' %'; }).join('');
      showTip(box, svg, W, html, x(n), y(sig(n, 0.6)));
    });
    hit.addEventListener('mouseleave', function () { cross.setAttribute('opacity', 0); hideTip(box); });
  }
  drawDalio();

  /* ---------- S&P 500 frente a otros activos, 2004–2023 ---------- */
  var SP = [
    ['S&P 500', 62540, 9.60, true], ['Oro', 49795, 8.36], ['Bonos corporativos Baa', 30160, 5.67],
    ['Vivienda en EE. UU.', 22410, 4.12], ['Bonos del Tesoro a 10 años', 17558, 2.85], ['Letras del Tesoro a 3 meses', 13209, 1.40]
  ];
  (function () {
    var c = document.getElementById('sp-chart'), tb = document.querySelector('#sp-table tbody'), max = 90000;
    SP.forEach(function (d) {
      var w = d[1] / max * 100;
      c.insertAdjacentHTML('beforeend', '<div class="hbar' + (d[3] ? ' hi' : '') + '"><span class="name">' + d[0] + '</span><span class="track"><span class="fill" style="width:' + w + '%"></span><span class="val" style="left:' + w + '%">' + fmt0.format(d[1]) + '</span></span></div>');
      tb.insertAdjacentHTML('beforeend', '<tr><td>' + d[0] + '</td><td>' + fmt0.format(d[1]) + '</td><td>' + fmt1.format(d[2]) + ' %</td></tr>');
    });
  })();

  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { calcMeta(); drawDalio(); }, 150); });

  /* ---------- Noticias y videos (los actualiza una acción programada) ---------- */
  fetch('/data/noticias.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
    var list = document.getElementById('news-list');
    if (!data || !data.items || !data.items.length) { list.innerHTML = '<li class="news-empty">Los titulares aparecerán aquí en la próxima actualización.</li>'; return; }
    var items = data.items.slice(0, 5);
    list.innerHTML = items.map(function (n) {
      var f = n.fecha ? fmtFecha.format(new Date(n.fecha)) : '';
      return '<li><span class="meta">' + (n.region ? '<b class="region">' + esc(n.region) + '</b>' : '') + esc([f, n.fuente].filter(Boolean).join(' · ')) + '</span><a href="' + esc(n.url) + '" target="_blank" rel="noopener">' + esc(n.titulo) + '</a></li>';
    }).join('');
    if (data.actualizado) document.getElementById('news-updated').textContent = 'Actualizado el ' + fmtFechaLarga.format(new Date(data.actualizado)) + '. Se renueva automáticamente cada seis horas con titulares de medios; las noticias pertenecen a sus fuentes.';
    carrete(items);
  }).catch(function () {});

  // Carrete: un titular a la vez; cambia solo cada 6 s y se detiene al pasar el cursor o al enfocarlo
  function carrete(items) {
    var box = document.getElementById('carrete'), rot = document.getElementById('ticker-rot'), nEl = document.getElementById('rot-n');
    rot.innerHTML = items.map(function (n) { return '<a href="' + esc(n.url) + '" target="_blank" rel="noopener"><span>' + esc(n.region || n.fuente || '') + '</span>' + esc(n.titulo) + '</a>'; }).join('');
    var links = rot.querySelectorAll('a'), k = 0, timer = null;
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function mostrar(j) {
      var prev = links[k];
      prev.classList.remove('on'); prev.classList.add('out'); prev.tabIndex = -1; prev.setAttribute('aria-hidden', 'true');
      setTimeout(function () { prev.classList.remove('out'); }, 600);
      k = (j + links.length) % links.length;
      links[k].classList.add('on'); links[k].removeAttribute('tabindex'); links[k].removeAttribute('aria-hidden');
      nEl.textContent = (k + 1) + '/' + links.length;
    }
    function parar() { clearInterval(timer); timer = null; }
    function seguir() { parar(); if (!quieto && links.length > 1) timer = setInterval(function () { mostrar(k + 1); }, 6000); }
    Array.prototype.forEach.call(links, function (a, i) { if (i) { a.tabIndex = -1; a.setAttribute('aria-hidden', 'true'); } });
    links[0].classList.add('on'); nEl.textContent = '1/' + links.length;
    document.getElementById('rot-next').addEventListener('click', function () { mostrar(k + 1); });
    box.addEventListener('mouseenter', parar); box.addEventListener('mouseleave', seguir);
    box.addEventListener('focusin', parar); box.addEventListener('focusout', seguir);
    box.hidden = false; seguir();
  }

  fetch('/data/videos.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
    var grid = document.getElementById('video-grid');
    if (!data || !data.items || !data.items.length) { document.getElementById('videos').hidden = true; return; }
    var largos = data.items.filter(function (v) { return v.titulo.indexOf('#') === -1; });
    var DESTACADOS = ['C9m2NIsvO3U', 'ArzyE5pdRbY', 'yR5flMvfkpc', 'GZSyeOmEfJ8', '5hoIyxtzJGQ', 'DJEkMKGF4AA'];
    var lista = DESTACADOS.map(function (id) { return largos.filter(function (v) { return v.id === id; })[0]; }).filter(Boolean);
    largos.forEach(function (v) { if (lista.length < 6 && lista.indexOf(v) === -1) lista.push(v); });
    grid.innerHTML = lista.slice(0, 6).map(function (v) {
      var f = v.fecha ? fmtFechaLarga.format(new Date(v.fecha)) : '';
      return '<a class="video" href="https://www.youtube.com/watch?v=' + encodeURIComponent(v.id) + '" target="_blank" rel="noopener"><span class="thumb"><img loading="lazy" src="https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg" alt=""><span class="play">▶ Ver</span></span><strong>' + esc(v.titulo) + '</strong><span class="d">' + esc(f) + '</span></a>';
    }).join('');
    VIDEOS = largos; videoMeta();
  }).catch(function () {});


  })();
  /* ---------- Formulario de contacto, en cuatro pasos ---------- */
  // Destino de cada formulario. Con Jotform: url 'https://submit.jotform.com/submit/<ID>' y
  // campos = { nombreInterno: 'qN_nombre' }. Si la url está vacía, el formulario avisa que aún no está activo.
  var FORMS = {
    contacto: { url: 'https://submit.jotform.com/submit/262790999014065', campos: {
      servicio: 'q2_textbox0', tamano: 'q3_textbox1', plazo: 'q4_textbox2', prioridad: 'q5_textbox3', nombre: 'q6_textbox4',
      email: 'q7_email5', empresa: 'q8_textbox6', whatsapp: 'q9_textbox7', mensaje: 'q10_textarea8' } },
    masterclass: { url: 'https://submit.jotform.com/submit/262791033090049', campos: {
      nombre: 'q2_textbox0', email: 'q3_email1', whatsapp: 'q4_textbox2', intereses: 'q5_textarea3', referencia: 'q7_textbox5', pago: 'q8_textbox6' } },
    analisis: { url: 'https://submit.jotform.com/submit/262794223035052', campos: {
      referencia: 'q2_textbox0', tema: 'q3_textbox1', respuestas: 'q4_textarea2', nombre: 'q5_textbox3',
      email: 'q6_email4', whatsapp: 'q7_textbox5', factura: 'q8_textbox6', pago: 'q9_textbox7' } }
  };
  // Enlace de cobro fijo (opcional), si no se usa el Botón de Pagos: monto de $40.25 (35 + IVA 15 %), de uso múltiple.
  // Vacío: la solicitud se guarda y Carlo envía el enlace por correo.
  var PAGO = { url: '' };
  var LINKEDIN = '<a href="https://www.linkedin.com/in/carlo-g-pagani-48708625" target="_blank" rel="noopener" style="color:var(--brass)">LinkedIn</a>';
  function enviar(cfg, datos) {
    var fd = new FormData();
    Object.keys(datos).forEach(function (k) {
      var nombre = cfg.campos ? cfg.campos[k] : k;
      if (nombre) fd.append(nombre, datos[k]);
    });
    var opaco = /jotform\.com/.test(cfg.url);
    if (opaco) { var fid = cfg.url.split('/').pop(); fd.append('formID', fid); fd.append('simple_spc', fid + '-' + fid); }
    return fetch(cfg.url, opaco ? { method: 'POST', mode: 'no-cors', body: fd } : { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!opaco && !r.ok) throw new Error(r.status); });
  }
  /* ---------- PayPal: cobro con monto exacto y confirmación inmediata ---------- */
  // clientId es el identificador público de la app «Live» en developer.paypal.com (no es la clave secreta). Vacío: apagado y se usa Deuna.
  // El navegador crea y captura la orden; el número de orden queda en cada envío para cotejarlo. La verificación en el servidor llega con el Worker.
  var PAYPAL = { clientId: '' };
  var ppCarga = null;
  function cargarPayPal() {
    if (window.paypal && window.paypal.Buttons) return Promise.resolve(window.paypal);
    if (ppCarga) return ppCarga;
    ppCarga = new Promise(function (ok, mal) {
      var sc = document.createElement('script');
      sc.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(PAYPAL.clientId) + '&currency=USD&intent=capture&components=buttons&disable-funding=paylater,venmo&locale=es_EC';
      sc.onload = function () { window.paypal && window.paypal.Buttons ? ok(window.paypal) : mal(new Error('sin PayPal')); };
      sc.onerror = function () { ppCarga = null; mal(new Error('sin PayPal')); };
      document.head.appendChild(sc);
    });
    return ppCarga;
  }
  // Pinta los botones de PayPal en `caja` por `monto` (número). alPagar recibe {orden, captura, monto, pagador} solo con el pago completo.
  function botonesPayPal(caja, monto, descripcion, referencia, alPagar, alError) {
    var valor = monto.toFixed(2);
    caja.innerHTML = '<p class="pp-cargando">Cargando el pago seguro…</p>';
    return cargarPayPal().then(function (pp) {
      caja.innerHTML = '';
      return pp.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 45 },
        createOrder: function (d, actions) {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: 'USD', value: valor }, description: descripcion, custom_id: referencia, invoice_id: referencia + '-' + Date.now().toString(36).toUpperCase() }],
            application_context: { brand_name: 'Carlo Pagani', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' }
          });
        },
        onApprove: function (d, actions) {
          return actions.order.capture().then(function (o) {
            var cap = o && o.purchase_units && o.purchase_units[0] && o.purchase_units[0].payments && o.purchase_units[0].payments.captures && o.purchase_units[0].payments.captures[0];
            if (!o || o.status !== 'COMPLETED' || !cap || cap.status !== 'COMPLETED' || cap.amount.value !== valor || cap.amount.currency_code !== 'USD') {
              alError('PayPal no confirmó el pago completo. Si se te cobró algo, escríbeme y lo reviso.'); return;
            }
            var pagador = o.payer ? [o.payer.name && [o.payer.name.given_name, o.payer.name.surname].filter(Boolean).join(' '), o.payer.email_address].filter(Boolean).join(' · ') : '';
            alPagar({ orden: o.id, captura: cap.id, monto: '$' + valor, pagador: pagador });
          });
        },
        onCancel: function () { alError('Cancelaste el pago. Puedes intentarlo de nuevo cuando quieras.'); },
        onError: function () { alError('PayPal no pudo procesar el pago. Revisa los datos de tu tarjeta o inténtalo de nuevo.'); }
      }).render(caja);
    }).catch(function () {
      caja.innerHTML = '';
      alError('No pude cargar el pago de PayPal. Revisa tu conexión y vuelve a intentarlo.');
    });
  }
  function textoPayPal(r) { return 'PayPal: pagado ' + r.monto + ' USD · orden ' + r.orden + ' · captura ' + r.captura + (r.pagador ? ' · ' + r.pagador : ''); }

  if (document.getElementById('cform')) (function () {
  var cf = document.getElementById('cform'), cs = document.getElementById('c-status');
  var paso = 1, atras = document.getElementById('w-atras');
  var TAM = {
    empresa: { q: '¿Cuánto factura tu empresa al año?', o: ['Menos de 100 mil dólares', 'De 100 mil a 500 mil dólares', 'De 500 mil a 2 millones de dólares', 'Más de 2 millones de dólares'] },
    fondos: { q: '¿Cuánto planeas invertir?', o: ['Menos de 10 mil dólares', 'De 10 mil a 50 mil dólares', 'De 50 mil a 250 mil dólares', 'Más de 250 mil dólares'] }
  };
  var PLAZOS = { 1: 'Lo antes posible', 2: 'En uno a tres meses', 3: 'Solo estoy explorando' };
  function esFondos() { return document.getElementById('w-servicio').value === 'Fondos de inversión'; }
  function ir(n) {
    paso = n;
    cf.querySelectorAll('.step').forEach(function (s) { s.hidden = +s.dataset.step !== n; });
    document.getElementById('w-paso').textContent = 'Paso ' + n + ' de 4';
    document.getElementById('w-bar').style.width = (n * 25) + '%';
    atras.hidden = n === 1; cs.textContent = '';
    if (n === 2) {
      var t = esFondos() ? TAM.fondos : TAM.empresa, actual = document.getElementById('w-tamano').value;
      document.getElementById('q2').textContent = t.q;
      document.getElementById('w-opts2').innerHTML = t.o.map(function (o, k) {
        return '<button type="button" class="chip" data-v="' + (k + 1) + '" aria-pressed="' + (actual === String(k + 1)) + '"><b>' + o + '</b></button>';
      }).join('');
    }
    if (n === 4) {
      document.getElementById('c-empresa-l').hidden = esFondos();
      var t2 = esFondos() ? TAM.fondos : TAM.empresa;
      document.getElementById('w-resumen').textContent = [document.getElementById('w-servicio').value, t2.o[+document.getElementById('w-tamano').value - 1], PLAZOS[document.getElementById('w-plazo').value]].join(' · ');
    }
    var foco = cf.querySelector('.step[data-step="' + n + '"] ' + (n === 4 ? 'input' : '.chip'));
    if (foco && document.activeElement && cf.contains(document.activeElement)) foco.focus();
  }
  cf.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip'); if (!chip) return;
    var group = chip.parentNode, field = document.getElementById('w-' + group.dataset.field);
    if (field.id === 'w-servicio' && field.value !== chip.dataset.v) document.getElementById('w-tamano').value = '';
    field.value = chip.dataset.v;
    group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c === chip); });
    setTimeout(function () { ir(paso + 1); }, 160);
  });
  atras.addEventListener('click', function () { ir(Math.max(1, paso - 1)); });
  // «Agenda tu cita» (CFO) y «Evalúa mi portafolio» (fondos): bajan al formulario con el servicio ya elegido
  function agendar(servicio, e) {
    if (e) e.preventDefault();
    var chip = cf.querySelector('.chip[data-v="' + servicio + '"]');
    document.getElementById('w-servicio').value = servicio; document.getElementById('w-tamano').value = '';
    cf.querySelectorAll('[data-field="servicio"] .chip').forEach(function (c) { c.setAttribute('aria-pressed', c === chip); });
    ir(2);
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  var cfoCard = document.querySelector('.service[data-cfo]');
  if (cfoCard) cfoCard.addEventListener('click', function (e) { if (!e.target.closest('a:not([data-cita])')) agendar('CFO fraccional', e); });
  document.querySelectorAll('[data-agendar]').forEach(function (a) {
    a.addEventListener('click', function (e) { agendar(a.dataset.agendar, e); });
  });
  cf.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = Array.prototype.filter.call(cf.querySelectorAll('.step[data-step="4"] [required]'), function (f) {
      var bad = !f.checkValidity(); f.setAttribute('aria-invalid', bad ? 'true' : 'false'); return bad;
    });
    if (invalid.length) { cs.className = 'cstatus'; cs.textContent = 'Necesito tu nombre y un correo válido.'; invalid[0].focus(); return; }
    var tam = +document.getElementById('w-tamano').value, plazo = +document.getElementById('w-plazo').value;
    var prio = plazo === 3 || tam === 1 ? 'C' : (plazo <= 2 && tam >= 2 ? 'A' : 'B');
    var t = esFondos() ? TAM.fondos : TAM.empresa;
    var datos = {
      servicio: document.getElementById('w-servicio').value, tamano: t.o[tam - 1], plazo: PLAZOS[plazo], prioridad: prio,
      nombre: cf.nombre.value.trim(), email: cf.email.value.trim(), empresa: esFondos() ? '' : cf.empresa.value.trim(),
      whatsapp: cf.whatsapp.value.trim(), mensaje: cf.mensaje.value.trim()
    };
    if (!FORMS.contacto.url) { cs.className = 'cstatus'; cs.innerHTML = 'El formulario se activa en los próximos días. Mientras tanto, escríbeme por ' + LINKEDIN + '.'; return; }
    var btn = document.getElementById('c-enviar'); btn.disabled = true; cs.className = 'cstatus'; cs.textContent = 'Enviando…';
    (cf._gotcha.value ? Promise.resolve() : enviar(FORMS.contacto, datos)).then(function () {
      cf.querySelector('.step[data-step="4"]').innerHTML = '<p class="q">Gracias, ' + esc(cf.nombre.value.split(' ')[0]) + '.</p><p style="color:var(--on-navy-soft)">Recibí tu solicitud. Reviso todas cada semana y, si encaja, te escribo para agendar una conversación.</p>';
      atras.hidden = true; cs.textContent = '';
    }).catch(function () {
      cs.className = 'cstatus'; cs.textContent = 'No se pudo enviar. Inténtalo de nuevo en unos minutos o escríbeme por LinkedIn.';
    }).then(function () { btn.disabled = false; });
  });
  })();

  /* ---------- Registro a la masterclass ---------- */
  var mf = document.getElementById('mform'), ms = document.getElementById('m-status');
  document.getElementById('m-intereses').addEventListener('click', function (e) {
    var chip = e.target.closest('.chip'); if (!chip) return;
    chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') !== 'true');
  });
  var MC = { precio: '$15.00', qr: '/assets/deuna-qr.png' };
  function refMC() { return 'MC-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }
  mf.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = Array.prototype.filter.call(mf.querySelectorAll('[required]'), function (f) {
      var bad = !f.checkValidity(); f.setAttribute('aria-invalid', bad ? 'true' : 'false'); return bad;
    });
    if (invalid.length) { ms.className = 'cstatus'; ms.textContent = 'Necesito tu nombre y un correo válido.'; invalid[0].focus(); return; }
    if (!FORMS.masterclass.url) { ms.className = 'cstatus'; ms.innerHTML = 'El registro se activa en los próximos días. Mientras tanto, puedes apartar tu lugar escribiéndome por ' + LINKEDIN + '.'; return; }
    var intereses = Array.prototype.filter.call(mf.querySelectorAll('.chip'), function (c) { return c.getAttribute('aria-pressed') === 'true'; })
      .map(function (c) { return c.dataset.v; }).join('; ');
    var ref = refMC();
    var datos = { nombre: mf.nombre.value.trim(), email: mf.email.value.trim(), whatsapp: mf.whatsapp.value.trim(), intereses: intereses, referencia: ref, pago: 'Pendiente de pago' };
    // Los campos Referencia y Pago van también dentro de Intereses, que es el campo seguro del formulario
    datos.intereses = (intereses || 'Sin intereses marcados') + '\nReferencia: ' + ref + '\nPago: pendiente';
    var btn = document.getElementById('m-enviar'); btn.disabled = true; ms.className = 'cstatus'; ms.textContent = 'Enviando…';
    var bot = !!mf._gotcha.value;
    (bot ? Promise.resolve() : enviar(FORMS.masterclass, datos)).then(function () {
      if (bot) { mf.innerHTML = '<p class="q">Gracias.</p>'; return; }
      pagoMC(datos, ref, intereses);
    }).catch(function () {
      ms.className = 'cstatus'; ms.textContent = 'No se pudo enviar. Inténtalo de nuevo en unos minutos.';
    }).then(function () { if (document.body.contains(btn)) btn.disabled = false; });
  });
  function pagoMC(datos, ref, intereses) {
    var nombre = esc(datos.nombre.split(' ')[0]);
    if (PAYPAL.clientId) return pagoMCPayPal(datos, ref, intereses, nombre);
    mf.innerHTML = '<p class="q">Último paso, ' + nombre + ': paga tu cupo</p>' +
      '<div class="dp-qr"><img src="' + MC.qr + '" alt="Código QR de Deuna para pagar la masterclass a Carlo Pagani"><span>Valor de la masterclass, IVA incluido</span><strong>' + MC.precio + ' USD</strong></div>' +
      '<div class="dp-movil"><p>¿Estás en el celular? <a href="' + MC.qr + '" download="deuna-carlo-pagani.png">Guarda el código</a> y elígelo desde la galería en el lector de QR de tu app.</p></div>' +
      '<ol class="dp-pasos"><li>Abre <b>Deuna</b>, o la app de tu banco en su opción para pagar con Deuna, y escanea el código.</li>' +
      '<li>Escribe el monto exacto, <b>' + MC.precio + '</b>, y como motivo tu referencia: <b>' + ref + '</b>.</li>' +
      '<li>Escribe aquí el número de comprobante que te muestra la app.</li></ol>' +
      '<label class="dp-comp"><span>Número de comprobante</span><input id="m-comp" autocomplete="off" maxlength="40" spellcheck="false"></label>' +
      '<button class="btn btn-brass" type="button" id="m-pagado" style="margin-top:1rem">Ya pagué, confirmar mi cupo</button>' +
      '<p class="cstatus" id="m-status2" role="status"></p>';
    var comp = document.getElementById('m-comp'), st = document.getElementById('m-status2'), ok = document.getElementById('m-pagado');
    comp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); ok.click(); } });
    ok.addEventListener('click', function () {
      var n = comp.value.trim();
      if (!/^[A-Za-z0-9][A-Za-z0-9 .\/#-]{3,39}$/.test(n)) { comp.setAttribute('aria-invalid', 'true'); st.className = 'cstatus'; st.textContent = 'Escribe el número de comprobante que te mostró la app al pagar.'; comp.focus(); return; }
      var pago = 'Deuna: comprobante ' + n + ' por ' + MC.precio + '. Por confirmar en Deuna Negocios que el monto esté completo.';
      var d2 = Object.assign({}, datos, { pago: pago, intereses: (intereses || 'Sin intereses marcados') + '\nReferencia: ' + ref + '\nPago: ' + pago });
      ok.disabled = true; st.className = 'cstatus'; st.textContent = 'Enviando…';
      enviar(FORMS.masterclass, d2).then(function () {
        mf.innerHTML = '<p class="q">Listo, ' + nombre + '. Tu cupo queda separado.</p><p style="color:var(--on-navy-soft);margin:0">Verifico tu pago y te escribo a ' + esc(datos.email) + ' con la hora y el enlace. Si la masterclass no llegara a abrirse, te devuelvo el valor completo.</p>';
      }).catch(function () {
        ok.disabled = false; st.className = 'cstatus'; st.textContent = 'No se pudo enviar. Inténtalo de nuevo en unos minutos.';
      });
    });
    comp.focus();
  }
  function pagoMCPayPal(datos, ref, intereses, nombre) {
    mf.innerHTML = '<p class="q">Último paso, ' + nombre + ': paga tu cupo</p>' +
      '<div class="dp-qr pp-total"><span>Valor de la masterclass, IVA incluido</span><strong>' + MC.precio + ' USD</strong></div>' +
      '<p class="pp-ayuda">Paga con tu cuenta PayPal o con tarjeta de crédito o débito. Tu cupo queda confirmado en cuanto se aprueba el pago.</p>' +
      '<div class="pp-btns" id="m-pp"></div><p class="cstatus" id="m-status2" role="status"></p>';
    var st = document.getElementById('m-status2');
    botonesPayPal(document.getElementById('m-pp'), 15, 'Masterclass de finanzas personales, 14 de noviembre de 2026', ref, function (r) {
      var pago = textoPayPal(r);
      var d2 = Object.assign({}, datos, { pago: pago, intereses: (intereses || 'Sin intereses marcados') + '\nReferencia: ' + ref + '\nPago: ' + pago });
      st.className = 'cstatus'; st.textContent = 'Pago aprobado. Guardando tu cupo…';
      var guardar = function () {
        return enviar(FORMS.masterclass, d2).then(function () {
          mf.innerHTML = '<p class="q">Listo, ' + nombre + '. Tu cupo está confirmado.</p><p style="color:var(--on-navy-soft);margin:0">Recibí tu pago de ' + MC.precio + ' (orden de PayPal ' + esc(r.orden) + '). Te escribo a ' + esc(datos.email) + ' con la hora y el enlace. Si la masterclass no llegara a abrirse, te devuelvo el valor completo.</p>';
        }).catch(function () {
          st.innerHTML = 'Tu pago se aprobó (orden ' + esc(r.orden) + '), pero no pude guardar tu cupo. <button type="button" class="back" id="m-reintentar">Reintentar</button>';
          document.getElementById('m-reintentar').addEventListener('click', guardar);
        });
      };
      guardar();
    }, function (msg) { st.className = 'cstatus'; st.textContent = msg; });
  }
  // Cuenta regresiva hasta la masterclass
  document.querySelectorAll('[data-faltan]').forEach(function (n) {
    var dias = Math.ceil((new Date(n.dataset.faltan + 'T00:00:00-05:00') - Date.now()) / 864e5);
    if (dias > 1) n.textContent = 'Faltan ' + dias + ' días'; else if (dias === 1) n.textContent = 'Es mañana'; else n.hidden = true;
  });

  /* ---------- Consulta Express: una entrevista breve en una ventana (solo en /consulta-express/) ---------- */
  if (document.getElementById('ae')) (function () {
  var P = 'Mis finanzas personales';
  var DEUDAS_P = ['Tarjeta de crédito', 'Préstamo de consumo', 'Hipotecario', 'Préstamo vehicular', 'Cooperativa', 'Préstamo de familiares o amigos', 'Otra'];
  var DEUDAS_E = ['Préstamo bancario', 'Línea de crédito o sobregiro', 'Tarjeta de crédito corporativa', 'Leasing', 'Cooperativa', 'Socios o familiares', 'Otra'];
  var O = 'Otra decisión de dinero';
  var SIN_TC = 'No, uso efectivo, transferencia o débito', TC_TOTAL = 'Pago el total', TC_DIF = 'Pago el total, pero tengo compras diferidas';
  var TC_GASTOS = ['Supermercado', 'Gasolina y transporte', 'Servicios básicos y suscripciones', 'Restaurantes y salidas', 'Salud y farmacia', 'Educación', 'Ropa y cuidado personal', 'Compras grandes: electrodomésticos, tecnología o viajes'];
  function usaTarjeta() { return !!resp.p5b && resp.p5b !== SIN_TC; }
  function difiere() { return usaTarjeta() && resp.p5g === TC_DIF; }
  function tcTotal() { return usaTarjeta() && (resp.p5g === TC_TOTAL || resp.p5g === TC_DIF); }
  var Q_DEUDAS = 'Hablemos de deudas: tarjetas, préstamos, hipoteca, vehículo o cooperativas. Anota cada una con su saldo y su cuota mensual. La tasa y el plazo son opcionales: casi nadie los sabe, y calcular cuánto te cuesta de verdad cada deuda es parte de tu informe.';
  var OT = { deuda: 'Refinanciar una deuda o seguir igual', prepago: 'Pagar antes una deuda con dinero que tengo', compra: 'Comprar vivienda o seguir arrendando',
    credito: 'Comprar algo al contado o a crédito', trabajo: 'Cambiar de trabajo o emprender', venta: 'Vender un bien o un negocio', otra: 'Otra decisión' };
  var DIAS = ['De contado', 'Hasta 30 días', 'De 31 a 60 días', 'De 61 a 90 días', 'Más de 90 días'];
  var AE = [
    { id: 'tema', q: '¿Sobre qué quieres el análisis?', op: ['Mi empresa', P, 'Una inversión', O] },

    { id: 'e1', si: 'Mi empresa', para: 'Giro del negocio, tipo de clientes y antigüedad.', q: '¿A qué se dedica tu empresa? Cuéntame qué vende, a quién y desde cuándo opera.', ph: 'Por ejemplo: distribuidora de alimentos para tiendas y restaurantes, desde 2018' },
    { id: 'e2', si: 'Mi empresa', q: '¿Cuántas personas trabajan en ella?', op: ['De 1 a 5', 'De 6 a 20', 'De 21 a 50', 'De 51 a 200', 'Más de 200'] },
    { id: 'e3', si: 'Mi empresa', para: 'Ventas, costo de ventas y utilidad del último año, para estimar el margen.', q: 'Vamos a las cifras del último año. Aproximadas está bien; deja en blanco lo que no sepas.', opcional: true, ficha: [
      { k: 'ventas', l: 'Ventas del año' },
      { k: 'costo', l: 'Costo de lo vendido', d: 'mercadería, materia prima y producción' },
      { k: 'utilidad', l: 'Utilidad o pérdida del año', d: 'si fue pérdida, anótala con signo menos' }] },
    { id: 'e4', si: 'Mi empresa', para: 'Gastos fijos mensuales por rubro, para estimar el punto de equilibrio.', q: '¿Cuánto suman los gastos fijos de cada mes?', opcional: true, total: 'Gastos fijos al mes', ficha: [
      { k: 'nomina', l: 'Nómina', d: 'sueldos con beneficios de ley y aportes al IESS' },
      { k: 'arriendo', l: 'Arriendo y servicios básicos' },
      { k: 'admin', l: 'Otros gastos administrativos', d: 'contador, sistemas, seguros, movilización' },
      { k: 'ventasg', l: 'Gastos de ventas', d: 'comisiones, publicidad, transporte de entregas' }] },
    { id: 'e5', si: 'Mi empresa', para: 'Saldos actuales de caja, cuentas por cobrar, inventario y cuentas por pagar.', q: 'Ahora el capital de trabajo, con los saldos de hoy:', opcional: true, ficha: [
      { k: 'caja', l: 'Caja y bancos' },
      { k: 'cxc', l: 'Cuentas por cobrar a clientes' },
      { k: 'inv', l: 'Inventario' },
      { k: 'cxp', l: 'Cuentas por pagar a proveedores' }] },
    { id: 'e6', si: 'Mi empresa', q: '¿En cuánto tiempo te pagan tus clientes, en promedio?', op: DIAS },
    { id: 'e7', si: 'Mi empresa', q: '¿Y en cuánto tiempo les pagas a tus proveedores?', op: DIAS },
    { id: 'e8', si: 'Mi empresa', para: 'Detalle de las deudas de la empresa para medir su carga financiera.', q: 'Anota las deudas de la empresa con su saldo y su cuota mensual. La tasa y el plazo son opcionales: si no los sabes, déjalos en blanco y los calculo yo.', deudas: DEUDAS_E },
    { id: 'e9', si: 'Mi empresa', q: 'En los últimos tres meses, ¿cómo estuvo la caja?', op: ['Hubo excedentes', 'Alcanzó justo', 'Faltó y usamos crédito o sobregiro', 'Tuvimos que atrasar pagos'] },
    { id: 'e10', si: 'Mi empresa', q: '¿Están al día con sus obligaciones? Marca lo que corresponda.', op: ['Todo al día', 'Atrasos con el SRI', 'Atrasos con el IESS', 'Atrasos con bancos', 'Atrasos con proveedores'], multi: true, solo: ['Todo al día'] },
    { id: 'e11', si: 'Mi empresa', q: '¿Qué información financiera llevan? Puedes marcar varias.', op: ['Contabilidad al día', 'Estados financieros mensuales', 'Flujo de caja proyectado', 'Presupuesto anual', 'Costos por producto', 'Nada formal todavía'], multi: true, solo: ['Nada formal todavía'] },
    { id: 'e12', si: 'Mi empresa', para: 'El problema financiero concreto que el informe debe atender.', q: '¿Cuál es el problema o la decisión principal que quieres resolver con este análisis?', ph: 'Por ejemplo: vendemos más que el año pasado, pero no alcanza la caja' },
    { id: 'e13', si: 'Mi empresa', para: 'Acciones ya intentadas, para no repetir recomendaciones.', q: '¿Qué han intentado hasta ahora para resolverlo?', opcional: true },
    { id: 'e14', si: 'Mi empresa', nota: lecturaEmpresa },

    { id: 'p1', si: P, q: '¿Qué quieres lograr? Puedes marcar varias.', op: ['Ordenar mi presupuesto', 'Salir de deudas', 'Tener un fondo de emergencia', 'Empezar a invertir', 'Comprar vivienda o vehículo', 'Planear mi jubilación'], multi: true },
    { id: 'p2', si: P, q: '¿En qué rango de edad estás?', op: ['Menos de 30', 'De 30 a 39', 'De 40 a 49', 'De 50 a 59', '60 o más'] },
    { id: 'p3', si: P, q: '¿Cuál es tu situación laboral?', op: ['Empleado con relación de dependencia', 'Independiente o con negocio propio', 'Ambas', 'Jubilado', 'Sin ingresos fijos por ahora'] },
    { id: 'p4', si: P, q: 'Además de ti, ¿cuántas personas dependen económicamente de tus ingresos?', op: ['Ninguna', '1', '2', '3', '4 o más'] },
    { id: 'p5', si: P, para: 'Ingreso neto mensual y extras anuales.', q: 'Empecemos por tus ingresos, ya libres de descuentos. Un aviso antes: el informe será tan bueno como estas cifras. Si no estás seguro de alguna, pon un aproximado razonable.', req: true, total: 'Ingreso mensual', ficha: [
      { k: 'sueldo', l: 'Sueldo o ingreso principal', d: 'al mes' },
      { k: 'extra', l: 'Negocio o trabajos independientes', d: 'al mes' },
      { k: 'otros', l: 'Otros ingresos', d: 'alquileres que cobras, jubilación u otros, al mes' },
      { k: 'anual', l: 'Ingresos extra del año', d: 'décimos, utilidades y bonos, en total', anual: true }] },
    { id: 'p5b', si: P, q: 'Mucho de lo que se paga con tarjeta de crédito es gasto del mes, no deuda, y quiero contarlo bien. ¿Pagas algunos o todos tus gastos con tarjeta?', op: [SIN_TC, 'Sí, algunos', 'Sí, casi todos'] },
    { id: 'p5c', si: P, cond: usaTarjeta, q: '¿Qué pagas con tarjeta? Puedes marcar varios.', op: TC_GASTOS, multi: true },
    { id: 'p5g', si: P, cond: usaTarjeta, q: 'Cuando llega el estado de cuenta, ¿cómo lo pagas?', op: [TC_TOTAL, TC_DIF, 'Pago más del mínimo, sin llegar al total', 'Pago solo el mínimo'] },
    { id: 'p6', si: P, para: 'Gastos fijos mensuales por rubro, para armar el presupuesto.', get q() { return 'Ahora tus gastos fijos de cada mes. ' + (usaTarjeta() ? 'Anota cada gasto en su rubro, también los que pagas con tarjeta. ' : '') + 'Un estimado basta; deja en blanco lo que no aplique.'; }, req: true, total: 'Gastos fijos al mes', ficha: [
      { k: 'vivienda', l: 'Vivienda', d: 'arriendo y alícuota; la hipoteca va con las deudas' },
      { k: 'servicios', l: 'Servicios básicos', d: 'luz, agua, gas, internet y celular' },
      { k: 'alimentacion', l: 'Alimentación', d: 'supermercado y mercado' },
      { k: 'transporte', l: 'Transporte', d: 'gasolina, pasajes, parqueadero y mantenimiento' },
      { k: 'seguros', l: 'Seguros', d: 'médico, de vida y del vehículo' },
      { k: 'salud', l: 'Salud', d: 'consultas y medicinas' },
      { k: 'educacion', l: 'Educación', d: 'pensiones escolares, universidad y cursos' },
      { k: 'familia', l: 'Apoyo a familiares' }] },
    { id: 'p7', si: P, para: 'Gastos variables mensuales por rubro, para armar el presupuesto.', q: 'Y los gastos variables, que suelen ser los que más se escapan:', total: 'Gastos variables al mes', ficha: [
      { k: 'comidas', l: 'Comidas fuera y delivery' },
      { k: 'ocio', l: 'Entretenimiento y salidas' },
      { k: 'suscripciones', l: 'Suscripciones', d: 'streaming, aplicaciones y gimnasio' },
      { k: 'hormiga', l: 'Gastos hormiga', d: 'cafés, snacks, taxis y compras pequeñas' },
      { k: 'ropa', l: 'Ropa y cuidado personal' },
      { k: 'mascotas', l: 'Mascotas' },
      { k: 'otros', l: 'Otros' }] },
    { id: 'p8', si: P, para: 'Cada deuda con saldo, cuota, tasa y plazo, para medir el endeudamiento.', get q() { return (!usaTarjeta() ? '' : tcTotal() ? 'Como pagas la tarjeta completa cada mes, no la anotes aquí: esos consumos ya están en tus gastos. Si tienes compras diferidas, anota solo lo que te falta pagar de ellas. ' : 'Ojo con la tarjeta: tus compras del mes ya están en tus gastos, así que anota solo el saldo que arrastras y lo diferido que te falta pagar. ') + (tcTotal() ? Q_DEUDAS.replace('tarjetas, ', '') : Q_DEUDAS); },  deudas: DEUDAS_P },
    { id: 'p9', si: P, cond: function () { return !usaTarjeta() && (resp.p8 || []).some(function (d) { return d.tipo === 'Tarjeta de crédito'; }); }, q: 'Con esa tarjeta, ¿qué sueles pagar cada mes?', op: ['Más del mínimo, sin llegar al total', 'Solo el mínimo', 'Depende del mes'] },
    { id: 'p10', si: P, q: '¿Has tenido atrasos en algún pago en los últimos doce meses?', op: ['Ninguno', 'Alguna vez', 'Sí, tengo pagos atrasados ahora'] },
    { id: 'p11', si: P, para: 'Ahorros e inversiones disponibles, para medir el colchón de emergencia.', q: '¿Qué ahorros e inversiones tienes hoy?', opcional: true, total: 'Ahorro e inversiones', ficha: [
      { k: 'ahorro', l: 'Ahorro disponible', d: 'cuentas de ahorro y efectivo' },
      { k: 'polizas', l: 'Pólizas y depósitos a plazo' },
      { k: 'inversiones', l: 'Fondos, acciones u otras inversiones' }] },
    { id: 'p12', si: P, q: '¿Qué bienes tienes? Puedes marcar varios.', op: ['Vivienda propia', 'Terreno', 'Vehículo', 'Ninguno'], multi: true, solo: ['Ninguno'] },
    { id: 'p13', si: P, q: '¿Con qué protección cuentas? Puedes marcar varias.', op: ['Afiliación al IESS', 'Seguro médico privado', 'Seguro de vida', 'Ninguna'], multi: true, solo: ['Ninguna'] },
    { id: 'p14', si: P, q: '¿Llevas un registro de tus gastos?', op: ['Sí, al detalle', 'Más o menos', 'No'] },
    { id: 'p15', si: P, q: '¿Ya tienes en mente una meta concreta para los próximos doce meses? Si no, la propongo yo en el informe.', op: ['Sí, la tengo clara', 'No, que salga del informe'] },
    { id: 'p15b', si: P, cond: function () { return resp.p15 === 'Sí, la tengo clara'; }, para: 'Una meta medible, con monto y plazo.', q: 'Escríbela con monto y fecha, si puedes.', ph: 'Por ejemplo: pagar la tarjeta de 2.400 antes de junio' },
    { id: 'p16', si: P, nota: lecturaPersonal },

    { id: 'i1', si: 'Una inversión', para: 'Qué es la inversión y quién la ofrece, para evaluar riesgo y regulación.', q: '¿Qué inversión estás evaluando? Cuéntame en qué consiste y quién la ofrece.', ph: 'Por ejemplo: una póliza a un año en una cooperativa, un departamento para arrendar, un fondo…' },
    { id: 'i2', si: 'Una inversión', para: 'Monto, rendimiento ofrecido y plazo de la inversión.', q: 'Sus condiciones principales:', opcional: true, ficha: [
      { k: 'monto', l: 'Monto que piensas invertir' },
      { k: 'rend', l: 'Rendimiento ofrecido o esperado', d: 'anual', t: 'pct' },
      { k: 'plazo', l: 'Plazo', t: 'meses' }] },
    { id: 'i3', si: 'Una inversión', q: '¿Qué objetivo tiene ese dinero?', op: ['Hacerlo crecer a largo plazo', 'Generar un ingreso mensual', 'Protegerlo de la inflación', 'Una meta concreta, como vivienda o estudios'] },
    { id: 'i4', si: 'Una inversión', q: '¿De dónde sale el dinero?', op: ['De mis ahorros', 'De un préstamo', 'De la venta de un bien', 'De una liquidación o herencia'] },
    { id: 'i5', si: 'Una inversión', q: '¿Qué parte de tu patrimonio representa?', op: ['Menos del 10 %', 'Del 10 al 25 %', 'Del 25 al 50 %', 'Más de la mitad'] },
    { id: 'i6', si: 'Una inversión', q: '¿Podrías necesitar ese dinero antes de que termine el plazo?', op: ['No', 'Tal vez', 'Es probable'] },
    { id: 'i7', si: 'Una inversión', q: 'Si en un año esa inversión valiera 20 % menos, ¿qué harías?', op: ['Vendería para no perder más', 'Esperaría a que se recupere', 'Aprovecharía para invertir más'] },
    { id: 'i8', si: 'Una inversión', q: '¿En qué has invertido antes? Puedes marcar varias.', op: ['Pólizas o depósitos a plazo', 'Fondos de inversión', 'Acciones o ETF', 'Bienes raíces', 'Criptomonedas', 'Nunca he invertido'], multi: true, solo: ['Nunca he invertido'] },
    { id: 'i9', si: 'Una inversión', q: '¿Conoces sus costos, sus comisiones y las condiciones para retirar el dinero?', op: ['Sí, los tengo claros', 'Más o menos', 'No'] },
    { id: 'i10', si: 'Una inversión', q: '¿La entidad que la ofrece está controlada por alguna superintendencia (de Bancos, de Compañías o de Economía Popular y Solidaria)?', op: ['Sí', 'No', 'No lo sé'] },
    { id: 'i11', si: 'Una inversión', para: 'Situación financiera general de quien invierte.', q: 'Para ubicar la inversión en tu situación general:', opcional: true, ficha: [
      { k: 'ingreso', l: 'Ingreso mensual neto' },
      { k: 'gastos', l: 'Gastos mensuales', d: 'incluidas las cuotas de deudas' },
      { k: 'ahorro', l: 'Ahorro disponible', d: 'aparte de esta inversión' },
      { k: 'deuda', l: 'Deudas totales', d: 'saldo pendiente' }] },
    { id: 'i12', si: 'Una inversión', para: 'Alternativas con las que compara la inversión.', q: '¿La estás comparando con otras opciones? ¿Con cuáles?', opcional: true },

    { id: 'o1', si: O, q: '¿Qué decisión tienes que tomar?', op: [OT.deuda, OT.prepago, OT.compra, OT.credito, OT.trabajo, OT.venta, OT.otra] },
    { id: 'o2', si: O, q: '¿Es una decisión personal o de tu empresa?', op: ['Personal o familiar', 'De mi empresa'] },
    { id: 'o3c', si: O, cond: function () { return resp.o1 === OT.credito; }, q: '¿Qué vas a comprar? Del tipo de bien depende mucho la respuesta.', op: ['Vehículo', 'Electrodomésticos o tecnología', 'Inmueble o terreno', 'Maquinaria o equipo', 'Otra cosa'] },
    { id: 'o3d', si: O, cond: function () { return resp.o1 === OT.trabajo; }, q: '¿Cuál es tu caso?', op: ['Tengo una oferta de otro empleo', 'Quiero dejar el empleo para emprender', 'Quiero emprender sin dejar el empleo', 'Quiero trabajar por mi cuenta como profesional'] },
    { id: 'o3e', si: O, cond: function () { return resp.o1 === OT.venta; }, q: '¿Qué quieres vender?', op: ['Vivienda o terreno', 'Vehículo', 'Un negocio o una parte de él', 'Otro bien'] },
    { id: 'o3f', si: O, cond: function () { return resp.o1 === OT.otra; }, para: 'La decisión concreta, en una frase.', q: 'Resume tu decisión en una frase, como una pregunta de sí o no.', ph: 'Por ejemplo: ¿pago la universidad de mi hijo al contado con descuento?' },
    { id: 'o5a', si: O, cond: function () { return resp.o1 === OT.deuda; }, para: 'Condiciones de la deuda actual y de la propuesta, para comparar su costo real.', q: 'Las cifras de tu deuda y de la propuesta. Llena lo que sepas, con aproximados si no tienes el dato exacto; la tasa y el costo real los calculo yo.', opcional: true, ficha: [
      { k: 'saldo', l: 'Saldo que debes hoy', d: 'ej.: 8.000' },
      { k: 'cuota', l: 'Cuota actual al mes', d: 'ej.: 320' },
      { k: 'meses', l: 'Meses que te faltan', d: 'ej.: 30', t: 'meses' },
      { k: 'ncuota', l: 'Cuota que te ofrecen al refinanciar', d: 'al mes; ej.: 240' },
      { k: 'nmeses', l: 'Plazo que te ofrecen', d: 'ej.: 48', t: 'meses' },
      { k: 'costos', l: 'Costos del cambio', d: 'comisiones, seguros y gastos legales; ej.: 150' },
      { k: 'ingreso', l: 'Tu ingreso mensual neto', d: 'o el de la empresa; ej.: 1.500' }] },
    { id: 'o5g', si: O, cond: function () { return resp.o1 === OT.prepago; }, para: 'Deuda actual y dinero disponible, para comparar abonar frente a invertir o guardar.', q: 'Las cifras de tu deuda y del dinero que usarías. Llena lo que sepas, con aproximados si no tienes el dato exacto:', opcional: true, ficha: [
      { k: 'saldo', l: 'Saldo que debes hoy', d: 'ej.: 8.000' },
      { k: 'cuota', l: 'Cuota actual al mes', d: 'ej.: 320' },
      { k: 'meses', l: 'Meses que te faltan', d: 'ej.: 30', t: 'meses' },
      { k: 'abono', l: 'Dinero que usarías para abonar', d: 'ej.: 3.000' },
      { k: 'rinde', l: 'Lo que ese dinero te rinde hoy', d: 'interés anual de tu ahorro o póliza; ej.: 5', t: 'pct' },
      { k: 'ingreso', l: 'Tu ingreso mensual neto', d: 'o el de la empresa; ej.: 1.500' }] },
    { id: 'o5b', si: O, cond: function () { return resp.o1 === OT.compra; }, para: 'Costo de comprar frente a arrendar.', q: 'Las cifras de comprar y de arrendar. Llena lo que sepas, con aproximados si no tienes el dato exacto:', opcional: true, ficha: [
      { k: 'precio', l: 'Precio de la vivienda', d: 'ej.: 90.000' },
      { k: 'entrada', l: 'Entrada que tienes disponible', d: 'ej.: 18.000' },
      { k: 'cuota', l: 'Cuota del crédito que te ofrecen', d: 'al mes; ej.: 750' },
      { k: 'plazo', l: 'Plazo del crédito', d: 'ej.: 240, que son 20 años', t: 'meses' },
      { k: 'arriendo', l: 'Arriendo que pagas hoy', d: 'al mes; ej.: 450' },
      { k: 'ingreso', l: 'Tu ingreso mensual neto', d: 'del hogar; ej.: 2.500' }] },
    { id: 'o5c', si: O, cond: function () { return resp.o1 === OT.credito; }, para: 'Costo de pagar al contado frente a crédito.', q: 'Las cifras de la compra. Llena lo que sepas, con aproximados si no tienes el dato exacto:', opcional: true, ficha: [
      { k: 'contado', l: 'Precio si pagas al contado', d: 'con el descuento, si te lo dan; ej.: 1.200' },
      { k: 'entrada', l: 'Entrada que te piden a crédito', d: 'si te piden; ej.: 200' },
      { k: 'cuota', l: 'Cuota a crédito', d: 'al mes; ej.: 65' },
      { k: 'cuotas', l: 'Número de cuotas', d: 'ej.: 24', t: 'meses' },
      { k: 'ahorro', l: 'Ahorro disponible hoy', d: 'el que podrías usar para pagar al contado; ej.: 3.000' },
      { k: 'ingreso', l: 'Tu ingreso mensual neto', d: 'o el de la empresa; ej.: 1.500' }] },
    { id: 'o5d', si: O, cond: function () { return resp.o1 === OT.trabajo; }, para: 'Ingresos actuales y esperados, inversión y colchón.', q: 'Las cifras del cambio. Llena lo que sepas, con aproximados si no tienes el dato exacto:', opcional: true, ficha: [
      { k: 'actual', l: 'Ingreso mensual neto actual', d: 'ej.: 1.500' },
      { k: 'nuevo', l: 'Ingreso mensual que esperas', d: 'en el nuevo trabajo o negocio; ej.: 2.000' },
      { k: 'inversion', l: 'Inversión inicial', d: 'si vas a emprender; ej.: 10.000' },
      { k: 'gastos', l: 'Tus gastos mensuales', d: 'incluidas las cuotas de deudas; ej.: 1.200' },
      { k: 'ahorro', l: 'Ahorro disponible', d: 'ej.: 6.000' }] },
    { id: 'o5e', si: O, cond: function () { return resp.o1 === OT.venta; }, para: 'Valor de venta, deuda asociada y lo que el bien rinde o cuesta hoy.', q: 'Las cifras de la venta. Llena lo que sepas, con aproximados si no tienes el dato exacto:', opcional: true, ficha: [
      { k: 'valor', l: 'Valor de venta que esperas', d: 'ej.: 60.000' },
      { k: 'deuda', l: 'Deuda pendiente sobre el bien', d: 'ej.: 15.000' },
      { k: 'renta', l: 'Lo que te deja al mes', d: 'arriendo, utilidad o ahorro; ej.: 300' },
      { k: 'costo', l: 'Lo que te cuesta mantenerlo al mes', d: 'impuestos, mantenimiento, alícuota; ej.: 80' }] },
    { id: 'o5f', si: O, cond: function () { return resp.o1 === OT.otra; }, para: 'Cifras clave de la decisión.', q: 'Las cifras principales. Llena lo que sepas, con aproximados si no tienes el dato exacto:', opcional: true, ficha: [
      { k: 'monto', l: 'Monto involucrado', d: 'ej.: 5.000' },
      { k: 'cuota', l: 'Pago mensual que implicaría', d: 'si lo hay; ej.: 200' },
      { k: 'ingreso', l: 'Tu ingreso mensual neto', d: 'o el de la empresa; ej.: 1.500' },
      { k: 'ahorro', l: 'Ahorro o caja disponible', d: 'ej.: 4.000' }] },
    { id: 'o6', si: O, q: 'Si solo pudieras cuidar una cosa en esta decisión, ¿cuál sería?', op: ['Pagar menos en total', 'Una cuota mensual cómoda', 'Correr poco riesgo', 'Tener dinero disponible', 'Resolverlo rápido'] },

    { id: 'mas', para: 'Cambios, ingresos o gastos previstos que modifiquen el análisis.', q: '¿Hay algo más que deba considerar, como un cambio previsto, un ingreso que viene o un gasto importante en los próximos meses?', opcional: true },
    { id: 'datos', q: 'Perfecto. ¿A nombre de quién preparo el informe y a qué correo te lo envío?', campos: true },
    { id: 'factura', q: '¿Necesitas factura?', op: ['Sí', 'No'] },
    { id: 'fdatos', cond: function () { return resp.factura === 'Sí'; }, q: '¿A nombre de quién la emito y con qué RUC o cédula?', ph: 'Por ejemplo: Comercial Andes S.A., RUC 1790000000001' }
  ];
  // Etiquetas cortas para el resumen previo al pago
  var RES = {
    tema: 'Tema del análisis', mas: 'Algo más a considerar', datos: 'Informe a nombre de', factura: 'Factura', fdatos: 'Datos para la factura',
    e1: 'A qué se dedica la empresa', e2: 'Personas que trabajan', e3: 'Cifras del último año', e4: 'Gastos fijos al mes', e5: 'Capital de trabajo',
    e6: 'Plazo de cobro a clientes', e7: 'Plazo de pago a proveedores', e8: 'Deudas de la empresa', e9: 'Caja en los últimos tres meses',
    e10: 'Obligaciones', e11: 'Información financiera que llevan', e12: 'Problema o decisión principal', e13: 'Lo que han intentado',
    p1: 'Lo que quieres lograr', p2: 'Edad', p3: 'Situación laboral', p4: 'Personas que dependen de ti', p5: 'Ingresos', p6: 'Gastos fijos',
    p7: 'Gastos variables', p8: 'Deudas', p5b: 'Paga gastos con tarjeta', p5c: 'Lo que paga con tarjeta', p5g: 'Pago del estado de cuenta', p9: 'Pago de la tarjeta que debe', p10: 'Atrasos en los últimos doce meses', p11: 'Ahorros e inversiones',
    p12: 'Bienes', p13: 'Protección', p14: 'Registro de gastos', p15: '¿Tiene una meta definida?', p15b: 'Meta para los próximos doce meses',
    i1: 'Inversión que evalúas', i2: 'Condiciones de la inversión', i3: 'Objetivo del dinero', i4: 'Origen del dinero', i5: 'Peso en tu patrimonio',
    i6: 'Necesidad del dinero antes del plazo', i7: 'Si cayera 20 % en un año', i8: 'Inversiones anteriores', i9: 'Costos y condiciones de retiro',
    i10: 'Control de una superintendencia', i11: 'Tu situación general', i12: 'Alternativas que comparas',
    o1: 'La decisión', o2: 'Ámbito de la decisión', o3c: 'Lo que va a comprar', o3d: 'Su caso', o3e: 'Lo que quiere vender', o3f: 'La decisión', o5a: 'Cifras principales', o5g: 'Cifras principales',
    o5b: 'Cifras principales', o5c: 'Cifras principales', o5d: 'Cifras principales', o5e: 'Cifras principales', o5f: 'Cifras principales',
    o6: 'Lo que más cuida'
  };
  var CONDICIONES = 'versión del 8 de octubre de 2026';
  var INTRO = 'Hola, soy Carlo. Para darte un análisis serio necesito conocer bien tu situación, así que te haré las preguntas de una primera reunión de asesoría. Te tomará unos diez minutos; ayuda tener a mano un estimado de tus ingresos, gastos y deudas. Con tus respuestas preparo un informe con un diagnóstico y tres recomendaciones concretas, y te lo envío por correo en un máximo de tres días hábiles. Uso tus datos solo para preparar tu análisis.';
  var INTRO_IA = 'Te acompaña un asistente con inteligencia artificial: si algo no queda claro, te lo explica o te pide un dato que falte. El análisis y el informe los hago yo.';
  var INTRO_PRECIO = 'El análisis cuesta desde $35 USD + IVA: el precio sube un poco según lo que me pidas analizar, nunca más de $60 + IVA. Antes de pagar verás un resumen de tus respuestas y de lo que incluye tu análisis, y podrás quitar lo que no necesites.';
  function intro() { return INTRO + '\n\n' + (IA.url ? INTRO_IA + '\n\n' : '') + INTRO_PRECIO; }
  var dlg = document.getElementById('ae'), log = document.getElementById('ae-log'), chipsEl = document.getElementById('ae-chips');
  var row = document.getElementById('ae-row'), txt = document.getElementById('ae-txt'), camposEl = document.getElementById('ae-campos');
  var okBtn = document.getElementById('ae-ok'), backBtn = document.getElementById('ae-back'), skipBtn = document.getElementById('ae-skip');
  var errEl = document.getElementById('ae-err'), inForm = document.getElementById('ae-in'), dudaBtn = document.getElementById('ae-duda');
  // Asistente con IA (opcional): la dirección llega en data/asistente.json cuando el servicio está desplegado
  var IA = { url: '' }, aclar = {}, dudas = [], revisada = {}, pendiente = null, modoDuda = false;
  // Cobro con el Botón de Pagos del Banco Pichincha (opcional): el servicio consulta el pago y solo entonces se guardan las respuestas
  var COBRO = { url: '' }, ESTADO = 'ae-cobro';
  // Cobro con Deuna (Banco Pichincha): imagen del código QR de la app Deuna Negocios. qr vacío: apagado.
  // El QR no lleva monto: el cliente lo escribe y Carlo verifica en Deuna Negocios que el pago sea completo.
  // El cliente paga escaneando el código, escribe el número de comprobante y entonces se guardan sus respuestas; Carlo confirma el pago en la app.
  var DEUNA = { qr: '/assets/deuna-qr.png' }, DEUNA_ESTADO = 'ae-deuna';
  if (PAYPAL.clientId) DEUNA.qr = '';   // con PayPal activo, el código QR sin monto deja de ofrecerse
  var servicios = fetch('/data/asistente.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (j) {
      if (j && /^https:\/\//.test(j.url || '')) IA.url = j.url;
      if (j && /^https:\/\//.test(j.pago || '')) COBRO.url = j.pago;
    }).catch(function () {});
  var resp = {}, camino = [], actual = null, enviado = false, ref = '', previo = {}, editando = null, respaldo = null;
  var resEl = document.getElementById('ae-res'), resLista = document.getElementById('ae-res-list'), acepto = document.getElementById('ae-acepto');
  var pagarBtn = document.getElementById('ae-pagar'), resErr = document.getElementById('ae-res-err'), tituloAE = document.getElementById('ae-t');
  var dpEl = document.getElementById('ae-dp'), dpNum = document.getElementById('ae-dp-num'), dpOk = document.getElementById('ae-dp-ok'), dpErr = document.getElementById('ae-dp-err');
  var sinMov = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function aePaso(id) { return AE.filter(function (x) { return x.id === id; })[0]; }
  function aplica(p) { return (!p.si || resp.tema === p.si) && (!p.cond || p.cond()); }
  // Montos: acepta 1500, 1.500, 1,500.50 o 1.500,50
  function monto(x) {
    var t = String(x == null ? '' : x).replace(/−/g, '-').replace(/[^\d.,-]/g, '');
    if (!/\d/.test(t)) return null;
    var c = t.lastIndexOf(','), d = t.lastIndexOf('.');
    if (c > -1 && d > -1) t = c > d ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
    else if (c > -1 || d > -1) {
      var sep = c > -1 ? ',' : '.', partes = t.split(sep);
      t = partes.length > 2 || partes[partes.length - 1].length === 3 ? partes.join('') : t.replace(sep, '.');
    }
    var n = parseFloat(t); return isFinite(n) ? n : null;
  }
  function dec(n) { return n.toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function usd(n) { return (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2 }); }
  function pc(x) { return Math.round(x * 100) + ' %'; }
  function sumar(v) { v = v || {}; var t = 0; for (var k in v) if (k !== 'anual') t += v[k]; return t + (v.anual || 0) / 12; }
  function sumaDeuda(l, k) { return (l || []).reduce(function (t, d) { return t + (d[k] || 0); }, 0); }
  function valor(f, n) { return f.t === 'pct' ? dec(n) + ' %' : f.t === 'meses' ? dec(n) + (n === 1 ? ' mes' : ' meses') : usd(n) + (f.anual ? ' al año' : ''); }
  function lecturaPersonal() {
    var deudas = (resp.p8 || []).filter(function (d) { return !(tcTotal() && !difiere() && d.tipo === 'Tarjeta de crédito'); });
    var ing = sumar(resp.p5), gas = sumar(resp.p6) + sumar(resp.p7), cuo = sumaDeuda(deudas, 'cuota');
    if (!ing || !gas) return '';
    var libre = ing - gas - cuo;
    var t = 'Un primer vistazo con lo que me contaste: ingresas unos ' + usd(ing) + ' al mes; tus gastos suman ' + usd(gas) + (cuo ? ' y las cuotas de tus deudas, ' + usd(cuo) : '') + '. ';
    t += libre >= 0 ? 'Te quedan unos ' + usd(libre) + ' al mes, el ' + pc(libre / ing) + ' de tu ingreso.' : 'Te faltan unos ' + usd(-libre) + ' al mes, que hoy salen de deuda o de tus ahorros.';
    if (cuo) t += ' Las cuotas se llevan el ' + pc(cuo / ing) + ' de tu ingreso' + (cuo / ing > 0.4 ? ', por encima del 30 al 40 % que suele considerarse prudente.' : '.');
    var ah = resp.p11 && resp.p11.ahorro;
    if (ah) { var m = ah / (gas + cuo); t += m < 1 ? ' Tu ahorro disponible no alcanza a cubrir un mes de gastos.' : ' Tu ahorro disponible cubre ' + (Math.round(m) === 1 ? 'cerca de un mes' : 'unos ' + Math.round(m) + ' meses') + ' de gastos.'; }
    return t + ' En el informe lo vemos a fondo.';
  }
  function lecturaEmpresa() {
    var c = resp.e3 || {}, g = sumar(resp.e4), w = resp.e5 || {}, t = [];
    if (c.ventas && c.costo != null) {
      var mb = (c.ventas - c.costo) / c.ventas;
      t.push('tu margen bruto ronda el ' + pc(mb));
      if (g && mb > 0) t.push('con gastos fijos de ' + usd(g) + ' al mes, necesitas vender unos ' + usd(g * 12 / mb) + ' al año para cubrirlos, y el año pasado vendiste ' + usd(c.ventas));
    }
    if (w.caja != null || w.cxc != null || w.inv != null || w.cxp != null) t.push('tu capital de trabajo neto es de unos ' + usd((w.caja || 0) + (w.cxc || 0) + (w.inv || 0) - (w.cxp || 0)));
    if (!t.length) return '';
    return 'Un primer vistazo con tus cifras: ' + t.join('; ') + '. En el informe lo vemos a fondo.';
  }
  function siguiente() { for (var i = 0; i < AE.length; i++) if (aplica(AE[i]) && !(AE[i].id in resp)) return AE[i]; return null; }
  function burbuja(texto, quien, nuevo, html) {
    var d = document.createElement('div'); d.className = 'msg ' + quien + (nuevo ? ' nuevo' : '');
    if (html) d.innerHTML = texto; else d.textContent = texto;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function textoResp(p, v) {
    if (p.campos) return v.nombre + ' · ' + v.email + (v.whatsapp ? ' · ' + v.whatsapp : '');
    if (p.ficha) {
      var ls = p.ficha.filter(function (f) { return v[f.k] != null; }).map(function (f) { return f.l + ': ' + valor(f, v[f.k]); });
      if (!ls.length) return 'Prefiero no responder';
      if (p.total && ls.length > 1) ls.push(p.total + ': ' + usd(sumar(v)));
      return ls.join('\n');
    }
    if (p.deudas) {
      if (!v.length) return 'No tengo deudas';
      var ds = v.map(function (d) {
        return d.tipo + ': ' + [d.saldo != null ? 'saldo ' + usd(d.saldo) : '', d.cuota != null ? 'cuota de ' + usd(d.cuota) + ' al mes' : '',
          d.tasa != null ? dec(d.tasa) + ' % anual' : '', d.plazo != null ? 'faltan ' + dec(d.plazo) + ' meses' : ''].filter(Boolean).join(' · ');
      });
      if (v.length > 1) ds.push('Total: saldo ' + usd(sumaDeuda(v, 'saldo')) + ' · cuotas de ' + usd(sumaDeuda(v, 'cuota')) + ' al mes');
      return ds.join('\n');
    }
    if (Array.isArray(v)) return v.length ? v.join(', ') : 'Nada de esto';
    return v === '' ? 'Prefiero no responder' : v;
  }
  function pintar() {
    log.innerHTML = ''; burbuja(intro(), 'yo');
    camino.forEach(function (id) {
      var p = aePaso(id);
      if (p.nota) { if (resp[id]) burbuja(resp[id], 'yo'); return; }
      burbuja(p.q, 'yo'); burbuja(textoResp(p, resp[id]), 'tu');
      (aclar[id] || []).forEach(function (a) { burbuja(a.pregunta, 'yo'); burbuja(a.respuesta, 'tu'); });
    });
  }
  function autoAlto() { txt.style.height = 'auto'; txt.style.height = Math.min(txt.scrollHeight + 2, 144) + 'px'; }
  function campo(k, val, t, etiqueta) {
    return '<span class="f-in ' + (t || 'usd') + '"><input inputmode="decimal" autocomplete="off" data-k="' + k + '" value="' + (val != null ? val : '') + '" aria-label="' + esc(etiqueta) + '"></span>';
  }
  function enterAvanza(c) {
    c.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      var ins = Array.prototype.slice.call(c.querySelectorAll('input')), i = ins.indexOf(e.target);
      if (i < ins.length - 1) ins[i + 1].focus(); else c.querySelector('.f-ok').click();
    });
  }
  function ficha(p, confirmar) {
    var prev = previo[p.id] || {};
    var c = burbuja('<div class="f-list">' + p.ficha.map(function (f) {
        return '<label class="f"><span class="f-l">' + esc(f.l) + (f.d ? '<small>' + esc(f.d) + '</small>' : '') + '</span>' + campo(f.k, prev[f.k], f.t, f.l) + '</label>';
      }).join('') + '</div>' +
      (p.total ? '<p class="f-tot"><span>' + esc(p.total) + '</span><b></b></p>' : '') +
      '<div class="f-acc"><button type="button" class="btn btn-brass f-ok">Continuar</button>' +
      (confirmar ? '<button type="button" class="btn btn-line f-igual">Está bien así</button>' : '') + '</div>', 'ficha', true, true);
    if (confirmar) c.querySelector('.f-igual').addEventListener('click', function () { c.remove(); responder(previo[p.id]); });
    var leer = function () {
      var v = {}; c.querySelectorAll('input[data-k]').forEach(function (i) { var n = monto(i.value); if (n != null) v[i.dataset.k] = n; }); return v;
    };
    var tot = c.querySelector('.f-tot b'), calc = function () { if (tot) tot.textContent = usd(sumar(leer())); };
    c.addEventListener('input', calc); calc();
    c.querySelector('.f-ok').addEventListener('click', function () {
      var v = leer();
      if (p.req && !Object.keys(v).length) { errEl.textContent = 'Anota al menos un monto aproximado.'; c.querySelector('input').focus(); return; }
      c.remove(); responder(v);
    });
    enterAvanza(c);
    return c;
  }
  function filaDeuda(tipos, d) {
    d = d || {};
    return '<div class="d-row"><div class="d-top"><select aria-label="Tipo de deuda">' +
      tipos.map(function (t) { return '<option' + (d.tipo === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') +
      '</select><button type="button" class="d-x" aria-label="Quitar esta deuda">×</button></div><div class="d-cols">' +
      [['saldo', 'Saldo pendiente', 'usd'], ['cuota', 'Cuota al mes', 'usd'], ['tasa', 'Tasa anual, si la sabes', 'pct'], ['plazo', 'Meses que faltan, si lo sabes', 'num']].map(function (x) {
        return '<label><span>' + x[1] + '</span>' + campo(x[0], d[x[0]], x[2], x[1]) + '</label>';
      }).join('') + '</div></div>';
  }
  function deudas(p, confirmar) {
    var prev = previo[p.id];
    var c = burbuja('<div class="d-list">' + (prev && prev.length ? prev : [{}]).map(function (d) { return filaDeuda(p.deudas, d); }).join('') + '</div>' +
      '<button type="button" class="back d-add">+ Agregar otra deuda</button>' +
      '<p class="f-tot"><span>Cuotas al mes</span><b></b></p>' +
      '<div class="f-acc"><button type="button" class="btn btn-brass f-ok">Continuar</button>' +
      (confirmar ? '<button type="button" class="btn btn-line f-igual">Está bien así</button>' : '<button type="button" class="btn btn-line d-no">No tengo deudas</button>') + '</div>', 'ficha', true, true);
    var lista = c.querySelector('.d-list'), tot = c.querySelector('.f-tot b');
    var leer = function () {
      return Array.prototype.map.call(lista.querySelectorAll('.d-row'), function (r) {
        var d = { tipo: r.querySelector('select').value };
        r.querySelectorAll('input[data-k]').forEach(function (i) { var n = monto(i.value); if (n != null) d[i.dataset.k] = n; });
        return d;
      }).filter(function (d) { return d.saldo != null || d.cuota != null; });
    };
    var calc = function () { tot.textContent = usd(sumaDeuda(leer(), 'cuota')); };
    c.addEventListener('input', calc); c.addEventListener('change', calc); calc();
    c.addEventListener('click', function (e) {
      var r;
      if (e.target.closest('.d-add')) { lista.insertAdjacentHTML('beforeend', filaDeuda(p.deudas)); lista.lastElementChild.querySelector('select').focus(); }
      else if ((r = e.target.closest('.d-x'))) {
        r = r.closest('.d-row');
        if (lista.children.length > 1) r.remove(); else r.querySelectorAll('input').forEach(function (i) { i.value = ''; });
        calc();
      }
      else if (e.target.closest('.d-no')) { c.remove(); responder([]); }
      else if (e.target.closest('.f-igual')) { c.remove(); responder(previo[p.id]); }
      else if (e.target.closest('.f-ok')) {
        var v = leer();
        if (!v.length) { errEl.textContent = 'Anota el saldo o la cuota de cada deuda, o elige «No tengo deudas».'; return; }
        c.remove(); responder(v);
      }
    });
    enterAvanza(c);
    return c;
  }
  function mostrarFicha(p, ancla, confirmar) {
    var c = p.ficha ? ficha(p, confirmar) : deudas(p, confirmar);
    skipBtn.hidden = !p.opcional || confirmar;
    dudaBtn.hidden = !IA.url;
    log.scrollTop += ancla.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
    if (dlg.open && window.matchMedia('(hover: hover)').matches) c.querySelector('input, select').focus({ preventScroll: true });
  }
  function preguntar(conPausa) {
    if (editando && editando in resp) depurar();
    actual = siguiente(); errEl.textContent = '';
    document.getElementById('ae-bar').style.width = Math.round(100 * camino.length / (AE.filter(aplica).length + 1)) + '%';
    backBtn.hidden = !camino.length || enviado || (editando && editando in resp);
    backBtn.textContent = editando ? '↶ Volver al resumen' : '↶ Corregir la anterior';
    chipsEl.innerHTML = ''; camposEl.hidden = true; row.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    if (!actual) return cierre();
    var p = actual;
    if (p.nota) {
      var t = p.nota(); actual = null; resp[p.id] = t; camino.push(p.id);
      if (!t) return preguntar(conPausa);
      var decir = function () { burbuja(t, 'yo', true); preguntar(true); };
      if (conPausa && !sinMov) { var e0 = burbuja('• • •', 'yo escribe'); setTimeout(function () { e0.remove(); decir(); }, 700); }
      else decir();
      return;
    }
    var mostrar = function () {
      var qb = burbuja(p.q, 'yo', true);
      dudaBtn.hidden = !IA.url || !!p.campos || p.id === 'factura' || p.id === 'fdatos';
      if (p.ficha || p.deudas) return mostrarFicha(p, qb, false);
      if (p.op) {
        var antes = previo[p.id];
        chipsEl.innerHTML = (typeof p.op === 'function' ? p.op() : p.op).map(function (o) {
          var marcado = Array.isArray(antes) ? antes.indexOf(o) > -1 : antes === o;
          return '<button type="button" class="chip" aria-pressed="' + marcado + '" data-v="' + esc(o) + '"><b>' + esc(o) + '</b></button>'; }).join('') +
          (p.multi ? '<button type="button" class="chip listo" data-listo><b>Listo</b></button>' : '');
        chipsEl.classList.toggle('multi', !!p.multi);
        if (dlg.open) chipsEl.querySelector('.chip').focus();
      } else {
        row.hidden = false; row.classList.toggle('solo', !!p.campos);
        txt.hidden = !!p.campos; camposEl.hidden = !p.campos;
        okBtn.textContent = p.campos ? 'Continuar' : 'Enviar';
        if (p.campos) document.getElementById('ae-nombre').focus();
        else { txt.value = typeof previo[p.id] === 'string' ? previo[p.id] : ''; txt.placeholder = (typeof p.ph === 'function' ? p.ph() : p.ph) || 'Escribe tu respuesta…'; autoAlto(); txt.focus(); skipBtn.hidden = !p.opcional; }
      }
      log.scrollTop = log.scrollHeight;
    };
    if (conPausa && !sinMov) { var e = burbuja('• • •', 'yo escribe'); setTimeout(function () { e.remove(); mostrar(); }, 550); }
    else mostrar();
  }
  function responder(v) {
    var p = actual; if (!p) return;
    actual = null; modoDuda = false; resp[p.id] = v; camino.push(p.id);
    burbuja(textoResp(p, v), 'tu', true);
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    if (revisada[p.id] && !aclar[p.id]) {
      aclar[p.id] = [{ pregunta: revisada[p.id], respuesta: JSON.stringify(v) === JSON.stringify(previo[p.id]) ? 'Confirmó las cifras.' : 'Ajustó las cifras.' }];
      return preguntar(true);
    }
    if (IA.url && !p.op && !p.campos && p.id !== 'fdatos' && !(v === '' || (p.ficha && !Object.keys(v).length))) return revisar(p);
    preguntar(true);
  }
  function contexto(hasta) {
    var t = camino.filter(function (id) { return id !== hasta && !aePaso(id).nota; })
      .map(function (id) { var p = aePaso(id); return p.q + '\n' + textoResp(p, resp[id]); }).join('\n\n');
    return t.slice(-5000);
  }
  function pedirIA(datos) {
    var ctl = window.AbortController ? new AbortController() : null;
    var reloj = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    return fetch(IA.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : { accion: 'seguir' }; })
      .catch(function () { return { accion: 'seguir' }; })
      .then(function (r) { clearTimeout(reloj); return r || { accion: 'seguir' }; });
  }
  function abrirTexto(ph, conSkip, boton) {
    row.hidden = false; row.classList.remove('solo'); txt.hidden = false; camposEl.hidden = true;
    okBtn.textContent = boton || 'Enviar'; txt.value = ''; txt.placeholder = ph; autoAlto(); txt.focus();
    skipBtn.hidden = !conSkip; log.scrollTop = log.scrollHeight;
  }
  function revisar(p) {
    var lista = aclar[p.id] || [];
    var espera = burbuja('• • •', 'yo escribe');
    pedirIA({ modo: 'revisar', tema: resp.tema, pregunta: p.q, proposito: p.para || '', respuesta: textoResp(p, resp[p.id]), aclaraciones: lista, contexto: contexto(p.id) })
      .then(function (r) {
        espera.remove();
        if (camino[camino.length - 1] !== p.id || enviado) return;   // el cliente corrigió mientras tanto
        if (r.accion === 'seguir' || !r.mensaje || lista.length >= 2) return preguntar(false);
        if (p.ficha || p.deudas) {
          previo[p.id] = resp[p.id]; delete resp[p.id]; camino.pop();
          revisada[p.id] = r.mensaje; actual = p;
          return mostrarFicha(p, burbuja(r.mensaje, 'yo', true), true);
        }
        burbuja(r.mensaje, 'yo', true);
        pendiente = { id: p.id, q: r.mensaje };
        abrirTexto('Escribe tu respuesta…', true);
      });
  }
  function aclarar(a) {
    var pe = pendiente; pendiente = null;
    (aclar[pe.id] = aclar[pe.id] || []).push({ pregunta: pe.q, respuesta: a });
    burbuja(a, 'tu', true); row.hidden = true; skipBtn.hidden = true;
    if (a === 'Prefiero no responder') return preguntar(true);
    revisar(aePaso(pe.id));
  }
  function enviarDuda(d) {
    var p = actual; modoDuda = false;
    burbuja(d, 'tu', true); row.hidden = true;
    var espera = burbuja('• • •', 'yo escribe');
    pedirIA({ modo: 'duda', tema: resp.tema || '', pregunta: p.q, proposito: p.para || '', duda: d, contexto: contexto() }).then(function (r) {
      espera.remove();
      if (actual !== p) return;
      var m = r.mensaje || 'Ahora no pude responderte. Responde como mejor puedas; si algo no queda claro, lo vemos en el informe.';
      burbuja(m, 'yo', true); dudas.push({ pregunta: p.q, duda: d, respuesta: m });
      var c = log.querySelector('.msg.ficha'); if (c) log.appendChild(c);   // la ficha queda al final, a la vista
      if (!p.op && !p.ficha && !p.deudas) abrirTexto(p.ph || 'Escribe tu respuesta…', p.opcional);
      dudaBtn.hidden = false; log.scrollTop = log.scrollHeight;
    });
  }
  dudaBtn.addEventListener('click', function () {
    if (!actual || !IA.url) return;
    modoDuda = true; dudaBtn.hidden = true; errEl.textContent = '';
    abrirTexto('Escribe tu duda…', false, 'Preguntar');
  });
  function cierre() {
    document.getElementById('ae-bar').style.width = '100%';
    if (!ref) ref = 'AE-' + Date.now().toString(36).toUpperCase().slice(-6);
    if (editando) { editando = null; respaldo = null; return mostrarResumen(); }
    burbuja('Gracias, ' + resp.datos.nombre.split(' ')[0] + '. Antes de pagar, revisa el resumen de tus respuestas.', 'yo', true);
    setTimeout(mostrarResumen, sinMov ? 0 : 900);
  }
  // Tras corregir un dato: quita respuestas que ya no aplican y recalcula los primeros vistazos
  function depurar() {
    AE.forEach(function (p) {
      if (p.id in resp && !aplica(p)) { previo[p.id] = resp[p.id]; delete resp[p.id]; delete aclar[p.id]; delete revisada[p.id]; }
    });
    AE.forEach(function (p) { if (p.nota && p.id in resp) resp[p.id] = p.nota(); });
    camino = camino.filter(function (id) { return id in resp; });
  }
  function enOrden() { return AE.map(function (p) { return p.id; }).filter(function (id) { return id in resp; }); }
  // Precio según lo que se analiza: $35 de base más partes adicionales que el cliente puede quitar, con tope de $60 (antes de IVA)
  var BASE = 35, TOPE = 60, IVA = 0.15, quitados = {};
  function tiene(id, v) { return Array.isArray(resp[id]) && resp[id].indexOf(v) > -1; }
  function cifras(id) { return resp[id] && typeof resp[id] === 'object' && !Array.isArray(resp[id]) ? Object.keys(resp[id]).length : 0; }
  function modulos() {
    var t = resp.tema, m = [];
    if (t === 'Mi empresa') {
      m.push({ k: 'base', l: 'Diagnóstico de rentabilidad y punto de equilibrio, con tres recomendaciones', p: BASE });
      if (cifras('e5')) m.push({ c: 'el capital de trabajo', k: 'capital', l: 'Capital de trabajo y ciclo de caja: cuánto dinero inmoviliza tu operación', p: 10 });
      if ((resp.e8 || []).length) m.push({ c: 'las deudas', k: 'deudas', l: 'Carga de las deudas de la empresa y cómo ordenarlas', p: 10 });
      if ((resp.e10 || []).some(function (x) { return /^Atrasos/.test(x); })) m.push({ c: 'el plan de atrasos', k: 'atrasos', l: 'Plan para ponerse al día con las obligaciones atrasadas', p: 5 });
    } else if (t === P) {
      m.push({ k: 'base', l: 'Diagnóstico de tu presupuesto, con tres recomendaciones', p: BASE });
      if ((resp.p8 || []).some(function (d) { return !(tcTotal() && !difiere() && d.tipo === 'Tarjeta de crédito'); }) || difiere()) m.push({ c: 'el plan de deudas', k: 'deudas', l: 'Plan de deudas: cuánto te cuesta de verdad cada una, con su tasa, y en qué orden pagarlas', p: 10 });
      if (tiene('p1', 'Empezar a invertir') || tiene('p1', 'Planear mi jubilación')) m.push({ c: 'invertir o jubilarte', k: 'invertir', l: 'Primeros pasos para invertir o planear tu jubilación', p: 10 });
      if (tiene('p1', 'Comprar vivienda o vehículo')) m.push({ c: 'el plan de compra', k: 'compra', l: 'Plan para comprar vivienda o vehículo', p: 5 });
      if (tiene('p1', 'Tener un fondo de emergencia') || tiene('p13', 'Ninguna')) m.push({ c: 'el fondo de emergencia', k: 'colchon', l: 'Fondo de emergencia y protección', p: 5 });
    } else if (t === 'Una inversión') {
      m.push({ k: 'base', l: 'Evaluación de la inversión: riesgo, rendimiento real y costos', p: BASE });
      if (cifras('i11')) m.push({ c: 'el encaje con tus finanzas', k: 'encaje', l: 'Cómo encaja en tu situación financiera general', p: 5 });
      if (resp.i12) m.push({ c: 'comparar alternativas', k: 'comparar', l: 'Comparación con las alternativas que mencionas', p: 10 });
    } else {
      m.push({ k: 'base', l: 'Análisis de tu decisión, con una recomendación clara de qué hacer', p: BASE });
      var f = AE.filter(function (x) { return /^o5/.test(x.id) && x.id in resp; })[0];
      if (f && cifras(f.id) >= 2) m.push({ c: 'la comparación numérica', k: 'numeros', l: 'Comparación numérica de las opciones: costo total y efecto en tu flujo mensual', p: 10 });
      if (f && cifras(f.id) >= 4) m.push({ c: 'los escenarios', k: 'escenarios', l: 'Escenarios: qué pasa si cambian la tasa, tus ingresos o los plazos', p: 5 });
    }
    return m;
  }
  function precio() {
    var m = modulos(), sub = m.reduce(function (t, x) { return t + (x.k === 'base' || !quitados[x.k] ? x.p : 0); }, 0), neto = Math.min(sub, TOPE);
    return { m: m, sub: sub, neto: neto, total: Math.round(neto * (1 + IVA) * 100) / 100 };
  }
  function dolares(n) { return '$' + n.toFixed(2); }
  function pintarPrecio() {
    var pr = precio();
    document.getElementById('ae-mods').innerHTML = pr.m.map(function (x) {
      var base = x.k === 'base';
      return '<li><label><input type="checkbox" data-mod="' + x.k + '"' + (base || !quitados[x.k] ? ' checked' : '') + (base ? ' disabled' : '') + '><span>' + esc(x.l) + '</span><b>' + (base ? '$' : '+ $') + x.p + '</b></label></li>';
    }).join('') + (pr.sub > TOPE ? '<li><p class="tope">Con todo lo marcado sumaría $' + pr.sub + ', pero el análisis nunca pasa de $' + TOPE + ' + IVA.</p></li>' : '');
    document.getElementById('ae-sub').textContent = '$' + pr.neto + ' + IVA (15 %)';
    // Por qué cuesta lo que cuesta: la suma a la vista, junto al botón de pagar
    var activos = pr.m.filter(function (x) { return x.k === 'base' || !quitados[x.k]; });
    var porque = document.getElementById('ae-porque');
    if (porque) porque.innerHTML = activos.length < 2 ? 'Precio base del análisis. Si tu caso tuviera partes adicionales, aparecerían arriba con su precio.' :
      'Base $' + BASE + activos.slice(1).map(function (x) { return ' + $' + x.p + ' por ' + esc(x.c || x.l.split(':')[0].toLowerCase()); }).join('') +
      (pr.sub > TOPE ? ', con el tope de $' + TOPE : '') + ' = $' + pr.neto + ' + IVA. <a href="#ae-mods" data-ir-mods>¿Quieres quitar alguna parte?</a>';
    document.getElementById('ae-total').textContent = dolares(pr.total) + ' USD';
  }
  document.getElementById('ae-res').addEventListener('click', function (e) {
    if (!e.target.closest('[data-ir-mods]')) return;
    e.preventDefault(); document.querySelector('.res-mods').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('ae-mods').addEventListener('change', function (e) {
    var i = e.target.closest('[data-mod]'); if (!i || i.disabled) return;
    quitados[i.dataset.mod] = !i.checked; pintarPrecio();
  });
  function mostrarResumen() {
    camino = enOrden();
    resLista.innerHTML = camino.filter(function (id) { return !aePaso(id).nota; }).map(function (id) {
      var p = aePaso(id);
      var extra = (aclar[id] || []).filter(function (a) { return !/^(Confirmó|Ajustó) las cifras\.$/.test(a.respuesta); })
        .map(function (a) { return '<i>Aclaraste: ' + esc(a.respuesta) + '</i>'; }).join('');
      return '<li><span class="res-q">' + esc(RES[id] || p.q) + '</span><span class="res-a">' + esc(textoResp(p, resp[id])) + extra + '</span>' +
        '<button type="button" class="back res-edit" data-id="' + id + '">Corregir</button></li>';
    }).join('');
    pintarPrecio();
    acepto.checked = false; pagarBtn.disabled = true; resErr.textContent = '';
    pagarBtn.textContent = COBRO.url || PAYPAL.clientId || DEUNA.qr || PAGO.url ? 'Confirmar y pagar' : 'Confirmar y enviar';
    document.getElementById('ae-res-nota').textContent = COBRO.url ? 'Te llevo a la página segura del Botón de Pagos del Banco Pichincha para pagar con tarjeta; tus respuestas me llegan cuando el pago se aprueba.' :
      PAYPAL.clientId ? 'Pagas con PayPal o con tarjeta de crédito o débito; tus respuestas me llegan en cuanto se aprueba el pago.' :
      DEUNA.qr ? 'Pagas con Deuna, o con la app de tu banco, escaneando mi código QR; tus respuestas me llegan cuando escribas el número de comprobante.' :
      PAGO.url ? 'Se abre la página de pago en otra pestaña.' :
      'Te escribiré a ' + resp.datos.email + ' con el enlace de pago; en cuanto se acredite, empiezo tu análisis.';
    tituloAE.textContent = 'Revisa tus respuestas';
    log.hidden = true; inForm.hidden = true; dpEl.hidden = true; resEl.hidden = false;
    resEl.classList.remove('entra'); void resEl.offsetWidth; resEl.classList.add('entra');
    document.getElementById('ae-res-body').scrollTop = 0;
    if (dlg.open) document.getElementById('ae-res-body').focus({ preventScroll: true });
  }
  function cerrarResumen() {
    resEl.hidden = true; dpEl.hidden = true; if (ppEl) ppEl.hidden = true; log.hidden = false; inForm.hidden = false; tituloAE.textContent = 'Cuéntame tu caso';
  }
  function corregir(id) {
    cerrarResumen();
    editando = id; pendiente = null; modoDuda = false;
    respaldo = { v: resp[id], aclar: aclar[id], revisada: revisada[id] };
    previo[id] = resp[id]; delete resp[id]; delete aclar[id]; delete revisada[id];
    camino = camino.filter(function (x) { return x !== id; });
    burbuja(id === 'tema' ? 'Si cambias el tema, te haré las preguntas que correspondan a ese tema.' : 'Corrijamos ese dato.', 'yo', true);
    preguntar(false);
  }
  function cancelarCorreccion() {
    var id = editando;
    log.querySelectorAll('.msg.ficha').forEach(function (c) { c.remove(); });
    if (!(id in resp)) {
      resp[id] = respaldo.v; camino.push(id);
      if (respaldo.aclar) aclar[id] = respaldo.aclar;
      if (respaldo.revisada) revisada[id] = respaldo.revisada;
    }
    editando = null; respaldo = null; actual = null; pendiente = null; modoDuda = false;
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true; errEl.textContent = '';
    mostrarResumen();
  }
  resLista.addEventListener('click', function (e) { var b = e.target.closest('.res-edit'); if (b) corregir(b.dataset.id); });
  acepto.addEventListener('change', function () { pagarBtn.disabled = !acepto.checked; if (acepto.checked) resErr.textContent = ''; });
  pagarBtn.addEventListener('click', pagar);
  // Lo que se guarda en Jotform: la transcripción completa y los datos de contacto
  function paquete() {
    camino = enOrden();
    var pr = precio();
    var lineas = camino.filter(function (id) { return ['datos', 'factura', 'fdatos'].indexOf(id) < 0 && (!aePaso(id).nota || resp[id]); })
      .map(function (id) {
        var p = aePaso(id);
        if (p.nota) return 'Primer vistazo calculado en la web\n→ ' + resp[id];
        return p.q + '\n→ ' + textoResp(p, resp[id]).replace(/\n/g, '\n→ ') +
          (aclar[id] || []).map(function (a) { return '\n  Asistente: ' + a.pregunta + '\n  → ' + a.respuesta; }).join('');
      }).join('\n\n') +
      (dudas.length ? '\n\nDudas que planteó\n' + dudas.map(function (d) { return '· ' + d.duda + ' (en «' + d.pregunta + '»)\n  Asistente: ' + d.respuesta; }).join('\n') : '') +
      '\n\nAlcance del análisis\n' + pr.m.map(function (x) { return (x.k !== 'base' && quitados[x.k] ? '✗ Quitó: ' : '✓ ') + x.l + ' ($' + x.p + ')'; }).join('\n') +
      '\nPrecio: $' + pr.neto + ' + IVA = ' + dolares(pr.total) + (pr.sub > TOPE ? ' (tope aplicado; sumaba $' + pr.sub + ')' : '') +
      '\n\nRevisó el resumen y aceptó las condiciones (' + CONDICIONES + ') el ' +
      new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'long', timeStyle: 'short' }) + ', hora de Ecuador.';
    return { referencia: ref, tema: resp.tema, respuestas: lineas, nombre: resp.datos.nombre, email: resp.datos.email,
      whatsapp: resp.datos.whatsapp, factura: resp.factura + (resp.fdatos ? ' · ' + resp.fdatos : ''), pago: (PAGO.url ? 'Enviado a la página de pago' : 'Pendiente: enviar enlace de pago') + ' por ' + dolares(pr.total),
      importe: dolares(pr.total) };
  }
  function pagar() {
    if (!acepto.checked) { resErr.textContent = 'Marca la casilla para confirmar tus datos.'; return; }
    var datos = paquete();
    if (COBRO.url) return iniciarCobro(datos);
    if (PAYPAL.clientId) return mostrarPayPal(datos);
    if (DEUNA.qr) return mostrarDeuna(datos);
    var btn = pagarBtn; btn.disabled = true; resErr.textContent = '';
    var u = PAGO.url;
    var pestana = u ? window.open('', '_blank') : null;   // se abre en el clic para que el navegador no la bloquee
    enviar(FORMS.analisis, datos).then(function () {
      enviado = true; backBtn.hidden = true; cerrarResumen();
      chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
      if (u) {
        if (pestana) pestana.location = u; else location.href = u;
        burbuja('Listo. Completa el pago en la otra pestaña; cuando se acredite, te escribo a ' + esc(resp.datos.email) + ' y empiezo tu análisis. Si no se abrió, <a href="' + esc(u) + '" target="_blank" rel="noopener">ábrela aquí</a>.', 'yo', true, true);
      } else {
        burbuja('Recibí tu solicitud con la referencia ' + ref + '. Te escribo pronto a ' + resp.datos.email + ' con el enlace de pago.', 'yo', true);
      }
    }).catch(function () {
      if (pestana) pestana.close();
      btn.disabled = false; resErr.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
    });
  }
  function guardarEstado(v) { try { if (v) localStorage.setItem(ESTADO, JSON.stringify(v)); else localStorage.removeItem(ESTADO); return true; } catch (e) { return false; } }
  function consultar(ruta, cuerpo) {
    return fetch(COBRO.url + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
      .then(function (r) { return r.json(); });
  }
  // Paso 1 del cobro: guarda las respuestas en este navegador, crea la sesión de pago y lleva al cliente a la página del banco.
  // El banco lo devuelve a esta página con ?pago=<referencia> y ahí se consulta el resultado (retornoPago).
  function iniciarCobro(datos) {
    var tx = ref + '-' + Date.now().toString(36).toUpperCase().slice(-5);
    var estado = { tx: tx, datos: datos, estado: { resp: resp, aclar: aclar, dudas: dudas, revisada: revisada, ref: ref }, t: Date.now() };
    resErr.textContent = '';
    if (!guardarEstado(estado)) {
      resErr.textContent = 'Tu navegador no deja guardar tus respuestas mientras pagas. Prueba sin navegación privada o con otro navegador.'; return;
    }
    pagarBtn.disabled = true; pagarBtn.textContent = 'Abriendo el pago…';
    consultar('/sesion', { referencia: tx, nombre: resp.datos.nombre, email: resp.datos.email })
      .then(function (r) {
        if (!r.processUrl || !r.requestId) throw new Error('sin sesión');
        estado.requestId = r.requestId; guardarEstado(estado);
        location.href = r.processUrl;
      })
      .catch(function () {
        guardarEstado(null);
        pagarBtn.disabled = !acepto.checked; pagarBtn.textContent = 'Confirmar y pagar';
        resErr.textContent = 'No pude abrir el pago en este momento. Inténtalo de nuevo en unos minutos.';
      });
  }
  // Pago con PayPal: el monto lo fija la web y las respuestas se envían en cuanto PayPal confirma el pago completo
  var ppEl = document.getElementById('ae-pp'), ppErr = document.getElementById('ae-pp-err');
  function mostrarPayPal(datos) {
    if (!ppEl) return;
    var pr = precio();
    document.getElementById('ae-pp-total').textContent = dolares(pr.total) + ' USD';
    ppErr.textContent = '';
    tituloAE.textContent = 'Paga tu Consulta Express';
    log.hidden = true; inForm.hidden = true; resEl.hidden = true; dpEl.hidden = true; ppEl.hidden = false;
    ppEl.classList.remove('entra'); void ppEl.offsetWidth; ppEl.classList.add('entra');
    document.getElementById('ae-pp-body').scrollTop = 0;
    botonesPayPal(document.getElementById('ae-pp-btns'), pr.total, 'Consulta Express ' + ref, ref, function (r) {
      var envio = Object.assign({}, datos, { pago: textoPayPal(r) });
      ppErr.textContent = 'Pago aprobado. Enviando tus respuestas…';
      document.getElementById('ae-pp-volver').hidden = true;
      var guardar = function () {
        return enviar(FORMS.analisis, envio).then(function () {
          enviado = true; backBtn.hidden = true; ppEl.hidden = true; cerrarResumen();
          chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
          document.getElementById('ae-bar').style.width = '100%';
          burbuja('Listo: recibí tu pago de ' + r.monto + ' (orden de PayPal ' + esc(r.orden) + ') y tus respuestas con la referencia ' + ref + '. Te envío el informe a ' + esc(resp.datos.email) + ' en un máximo de tres días hábiles.', 'yo', true);
        }).catch(function () {
          ppErr.innerHTML = 'Tu pago se aprobó (orden ' + esc(r.orden) + '), pero no pude enviar tus respuestas. <button type="button" class="back" id="ae-pp-re">Reintentar</button>';
          document.getElementById('ae-pp-re').addEventListener('click', guardar);
        });
      };
      guardar();
    }, function (msg) { ppErr.textContent = msg; });
  }
  if (ppEl) document.getElementById('ae-pp-volver').addEventListener('click', function () { ppEl.hidden = true; mostrarResumen(); });
  // Pago con Deuna: se muestra el código QR; las respuestas quedan guardadas en este navegador por si la página se recarga
  // mientras el cliente paga en la app, y se envían cuando escribe el número de comprobante.
  var porPagar = null;
  function guardarDeuna(v) { try { if (v) localStorage.setItem(DEUNA_ESTADO, JSON.stringify(v)); else localStorage.removeItem(DEUNA_ESTADO); } catch (e) {} }
  function mostrarDeuna(datos) {
    porPagar = datos;
    guardarDeuna({ datos: datos, estado: { resp: resp, aclar: aclar, dudas: dudas, revisada: revisada, ref: ref, quitados: quitados }, t: Date.now() });
    document.getElementById('ae-dp-qr').src = DEUNA.qr;
    document.getElementById('ae-dp-baja').href = DEUNA.qr;
    document.getElementById('ae-dp-ref').textContent = ref;
    document.getElementById('ae-dp-total').textContent = datos.importe + ' USD';
    document.getElementById('ae-dp-monto').textContent = datos.importe;
    dpErr.textContent = ''; dpNum.removeAttribute('aria-invalid'); dpOk.disabled = false; dpOk.textContent = 'Ya pagué, enviar mis respuestas';
    tituloAE.textContent = 'Paga con Deuna';
    log.hidden = true; inForm.hidden = true; resEl.hidden = true; dpEl.hidden = false;
    dpEl.classList.remove('entra'); void dpEl.offsetWidth; dpEl.classList.add('entra');
    document.getElementById('ae-dp-body').scrollTop = 0;
    if (dlg.open) document.getElementById('ae-dp-body').focus({ preventScroll: true });
  }
  document.getElementById('ae-dp-volver').addEventListener('click', function () { guardarDeuna(null); mostrarResumen(); });
  dpNum.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); dpOk.click(); } });
  dpNum.addEventListener('input', function () { dpNum.removeAttribute('aria-invalid'); dpErr.textContent = ''; });
  dpOk.addEventListener('click', function () {
    var n = dpNum.value.trim().replace(/\s+/g, ' ');
    if (!/^[A-Za-z0-9][A-Za-z0-9 .\/#-]{3,39}$/.test(n)) {
      dpNum.setAttribute('aria-invalid', 'true'); dpErr.textContent = 'Escribe el número de comprobante que te mostró la app al pagar.'; dpNum.focus(); return;
    }
    dpOk.disabled = true; dpOk.textContent = 'Enviando…'; dpErr.textContent = '';
    enviar(FORMS.analisis, Object.assign({}, porPagar, { pago: 'Deuna: comprobante ' + n + ' por ' + porPagar.importe + '. Por confirmar en Deuna Negocios que el monto esté completo.' })).then(function () {
      guardarDeuna(null); enviado = true; backBtn.hidden = true; cerrarResumen();
      chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
      document.getElementById('ae-bar').style.width = '100%';
      burbuja('Recibí tus respuestas con la referencia ' + ref + ' y tu comprobante de Deuna ' + n + '. Confirmo el pago y te envío el informe a ' + resp.datos.email + ' en un máximo de tres días hábiles.', 'yo', true);
    }).catch(function () {
      dpOk.disabled = false; dpOk.textContent = 'Ya pagué, enviar mis respuestas';
      dpErr.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo; tu pago no se pierde.';
    });
  });
  // Si la página se recargó mientras el cliente pagaba con Deuna, vuelve al código QR con sus respuestas
  function retomarDeuna() {
    if (!DEUNA.qr || COBRO.url || new URLSearchParams(location.search).get('pago') || typeof dlg.showModal !== 'function') return;
    var g = null; try { g = JSON.parse(localStorage.getItem(DEUNA_ESTADO)); } catch (e) {}
    if (!g) return;
    if (!g.datos || !g.estado || !(Date.now() - g.t < 72e5)) return guardarDeuna(null);
    resp = g.estado.resp || {}; aclar = g.estado.aclar || {}; dudas = g.estado.dudas || []; revisada = g.estado.revisada || {};
    ref = g.estado.ref || ''; quitados = g.estado.quitados || {}; previo = {}; camino = enOrden(); enviado = false; editando = null;
    if (!dlg.open) dlg.showModal();
    document.documentElement.style.overflow = 'hidden';
    pintar(); document.getElementById('ae-bar').style.width = '100%';
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    mostrarDeuna(g.datos);
  }
  // Paso 2: de vuelta del banco, el servicio consulta el pago y solo con el pago aprobado se guardan las respuestas
  function retornoPago() {
    var tx = new URLSearchParams(location.search).get('pago');
    if (!tx || typeof dlg.showModal !== 'function') return;
    var limpiar = function () { history.replaceState(null, '', location.pathname + location.hash); };
    var g = null; try { g = JSON.parse(localStorage.getItem(ESTADO)); } catch (e) {}
    var mio = g && g.tx === tx && g.requestId && g.estado && g.datos;
    if (mio) {
      resp = g.estado.resp || {}; aclar = g.estado.aclar || {}; dudas = g.estado.dudas || []; revisada = g.estado.revisada || {};
      ref = g.estado.ref || ''; previo = {}; camino = enOrden();
    }
    if (!dlg.open) dlg.showModal();
    document.documentElement.style.overflow = 'hidden';
    cerrarResumen(); log.innerHTML = '';
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; backBtn.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    if (!mio || !COBRO.url) {
      limpiar(); enviado = true;   // al reabrir, el cuestionario empieza de cero
      burbuja('Volviste del pago, pero no encontré tus respuestas en este navegador. Si se llegó a cobrar, escríbeme por ' + LINKEDIN + ' con la referencia ' + esc(tx) + ' y lo resolvemos.', 'yo', true, true);
      return;
    }
    pintar();
    document.getElementById('ae-bar').style.width = '100%';
    var espera = burbuja('Consultando tu pago con el banco…', 'yo', true), intentos = 0;
    var guardar = function (pago, mensaje) {
      return enviar(FORMS.analisis, Object.assign({}, g.datos, { pago: pago })).then(function () {
        guardarEstado(null); limpiar(); enviado = true; burbuja(mensaje, 'yo', true);
      }, function () {
        burbuja('No pude guardar tus respuestas. Recarga esta página para intentarlo de nuevo, o escríbeme por ' + LINKEDIN + ' con tu referencia, ' + esc(tx) + '.', 'yo', true, true);
      });
    };
    (function revisarPago() {
      consultar('/estado', { requestId: g.requestId, referencia: tx }).then(function (r) {
        if (r.estado === 'pendiente' && ++intentos < 8) {
          if (intentos === 1) espera.textContent = 'El banco todavía está verificando tu pago. Espera un momento…';
          return setTimeout(revisarPago, 15000);
        }
        espera.remove();
        if (r.estado === 'aprobado') {
          return guardar(r.pago, 'Pago aprobado, autorización ' + r.autorizacion + '. Recibí tu solicitud con la referencia ' + ref + ' y te envío el informe a ' + resp.datos.email + ' en un máximo de tres días hábiles.');
        }
        if (r.estado === 'pendiente') {
          return guardar('Pago pendiente de verificación en el banco (sesión ' + g.requestId + ', referencia ' + tx + ')',
            'El banco sigue verificando tu pago. Ya guardé tus respuestas con la referencia ' + ref + '; empiezo tu análisis cuando el pago se apruebe y, si no se aprueba, no se te cobra.');
        }
        guardarEstado(null); limpiar();
        burbuja((r.motivo || 'El pago no se completó.') + ' Tus respuestas siguen aquí: revisa el resumen e inténtalo de nuevo.', 'yo', true);
        setTimeout(mostrarResumen, sinMov ? 0 : 1400);
      }).catch(function () {
        espera.remove();
        burbuja('No pude consultar tu pago todavía. Recarga esta página en un momento para intentarlo de nuevo.', 'yo', true);
      });
    })();
  }
  chipsEl.addEventListener('click', function (e) {
    var c = e.target.closest('.chip'); if (!c || !actual) return;
    if (!actual.multi) return responder(c.dataset.v);
    if (!c.hasAttribute('data-listo')) {
      var on = c.getAttribute('aria-pressed') !== 'true', solo = actual.solo || [];
      c.setAttribute('aria-pressed', on);
      // «Ninguna», «Todo al día» y similares no se combinan con las demás opciones
      if (on) chipsEl.querySelectorAll('.chip:not([data-listo])').forEach(function (x) {
        if (x !== c && (solo.indexOf(c.dataset.v) > -1 || solo.indexOf(x.dataset.v) > -1)) x.setAttribute('aria-pressed', 'false');
      });
      return;
    }
    responder(Array.prototype.filter.call(chipsEl.querySelectorAll('.chip[aria-pressed="true"]'), function (x) { return !x.hasAttribute('data-listo'); })
      .map(function (x) { return x.dataset.v; }));
  });
  inForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (modoDuda || pendiente) {
      var t = txt.value.trim();
      if (!t) { errEl.textContent = modoDuda ? 'Escribe tu duda.' : 'Escríbeme aunque sea una frase.'; txt.focus(); return; }
      errEl.textContent = '';
      return modoDuda ? enviarDuda(t) : aclarar(t);
    }
    if (!actual || actual.op || actual.ficha || actual.deudas) return;
    if (actual.campos) {
      var n = document.getElementById('ae-nombre'), c = document.getElementById('ae-correo');
      var okN = n.value.trim().length > 1, okC = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.value.trim());
      n.setAttribute('aria-invalid', !okN); c.setAttribute('aria-invalid', !okC);
      if (!okN || !okC) { errEl.textContent = 'Necesito tu nombre y un correo válido.'; (okN ? c : n).focus(); return; }
      return responder({ nombre: n.value.trim(), email: c.value.trim(), whatsapp: document.getElementById('ae-tel').value.trim() });
    }
    var v = txt.value.trim();
    if (v) return responder(v);
    if (actual.opcional) return responder('');
    errEl.textContent = 'Escríbeme aunque sea una frase.'; txt.focus();
  });
  txt.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); okBtn.click(); }
  });
  txt.addEventListener('input', autoAlto);
  skipBtn.addEventListener('click', function () {
    if (pendiente) return aclarar('Prefiero no responder');
    if (!actual || !actual.opcional) return;
    var c = log.querySelector('.msg.ficha'); if (c) c.remove();
    responder(actual.ficha ? {} : '');
  });
  backBtn.addEventListener('click', function () {
    if (editando) return cancelarCorreccion();
    if (!camino.length || enviado) return;
    pendiente = null; modoDuda = false;
    if (actual) delete revisada[actual.id];
    var quitar = function () { var id = camino.pop(); previo[id] = resp[id]; delete resp[id]; delete aclar[id]; delete revisada[id]; };
    var esNota = function () { return camino.length && aePaso(camino[camino.length - 1]).nota; };
    while (esNota()) quitar();
    if (camino.length) quitar();
    while (esNota()) quitar();
    pintar(); preguntar(false);
  });
  function abrir() {
    if (typeof dlg.showModal !== 'function') { location.hash = '#contacto'; return; }
    if (enviado) { quitados = {}; resp = {}; camino = []; previo = {}; aclar = {}; dudas = []; revisada = {}; pendiente = null; modoDuda = false; ref = ''; enviado = false; editando = null; log.innerHTML = ''; cerrarResumen(); }
    dlg.showModal(); document.documentElement.style.overflow = 'hidden';
    if (!log.children.length) { pintar(); preguntar(true); }
  }
  dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.getElementById('ae-x').addEventListener('click', function () { dlg.close(); });
  document.querySelectorAll('[data-ae]').forEach(function (b) { b.addEventListener('click', abrir); });
  if (location.hash === '#empezar' || location.hash === '#analisis-expres') abrir();
  servicios.then(function () { retornoPago(); retomarDeuna(); });
  })();

  /* ---------- Aparición progresiva al desplazarse ---------- */
  if ('IntersectionObserver' in window && window.matchMedia && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    var GRUPOS = '.services, .pains, .pmi, .split, .goal, .charts2, .custody, .mclass .wrap, .contact .wrap, .nopromise';
    var objetivos = [];
    document.querySelectorAll('section.block > .wrap > *').forEach(function (n) { if (!n.matches(GRUPOS)) objetivos.push(n); });
    document.querySelectorAll(GRUPOS).forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (n, i) {
        if (n.matches(GRUPOS)) return;
        n.style.setProperty('--i', Math.min(i, 5)); objetivos.push(n);
      });
    });
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    objetivos.forEach(function (n) { n.classList.add('r'); io.observe(n); });
    document.documentElement.classList.add('js-r');
  }

  /* ---------- Brillo que sigue al cursor (solo con ratón) ---------- */
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.cform, .alt .service').forEach(function (el) {
      el.classList.add('glow');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
      el.addEventListener('pointerleave', function () { el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
    });
  }

  document.getElementById('anio').textContent = new Date().getFullYear();
})();
