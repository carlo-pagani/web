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
    if (!data || !data.items || !data.items.length) { if (grid) document.getElementById('videos').hidden = true; return; }
    var largos = data.items.filter(function (v) { return v.titulo.indexOf('#') === -1; });
    var DESTACADOS = ['C9m2NIsvO3U', 'ArzyE5pdRbY', 'yR5flMvfkpc', 'GZSyeOmEfJ8', '5hoIyxtzJGQ', 'DJEkMKGF4AA'];
    var lista = DESTACADOS.map(function (id) { return largos.filter(function (v) { return v.id === id; })[0]; }).filter(Boolean);
    largos.forEach(function (v) { if (lista.length < 6 && lista.indexOf(v) === -1) lista.push(v); });
    if (grid) grid.innerHTML = lista.slice(0, 6).map(function (v) {
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
  var LINKEDIN = '<a href="https://www.linkedin.com/in/carlo-g-pagani-48708625" target="_blank" rel="noopener" style="color:var(--brass)">LinkedIn</a>';
  function enviar(cfg, datos, archivos) {
    var fd = new FormData();
    Object.keys(datos).forEach(function (k) {
      var nombre = cfg.campos ? cfg.campos[k] : k;
      if (nombre) fd.append(nombre, datos[k]);
    });
    // Archivos adjuntos: van al campo de subida del formulario, si lo tiene
    if (archivos && archivos.length && cfg.campos && cfg.campos.archivos) archivos.forEach(function (f) { fd.append(cfg.campos.archivos, f, f.name); });
    var opaco = /jotform\.com/.test(cfg.url);
    if (opaco) { var fid = cfg.url.split('/').pop(); fd.append('formID', fid); fd.append('simple_spc', fid + '-' + fid); }
    return fetch(cfg.url, opaco ? { method: 'POST', mode: 'no-cors', body: fd } : { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!opaco && !r.ok) throw new Error(r.status); });
  }
  /* ---------- PayPal: cobro con monto exacto y confirmación inmediata ---------- */
  // clientId es el identificador público de la app «Live» en developer.paypal.com (no es la clave secreta). Vacío: apagado y se usa Deuna.
  // El navegador crea y captura la orden; el número de orden queda en cada envío para cotejarlo. La verificación en el servidor llega con el Worker.
  var PAYPAL = { clientId: 'BAAHPHYxpHokQA3PYUEiaYFXl32IAU8mMO-xXonNNzPgKvJHvtmyiMOBh-gI1SXRa9NoRBQVyrSMF_EWpE' };
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
      '<p class="pp-ayuda pp-nota">Si pagas con tarjeta, el «CSC» que pide PayPal es el código de seguridad (CVV) de tres dígitos del reverso. Si tu banco la rechaza, activa en su app las compras por internet y en el exterior.</p>' +
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
  var DEUDAS_E = ['Préstamo bancario', 'Línea de crédito o sobregiro', 'Tarjeta de crédito corporativa', 'Leasing', 'Cooperativa', 'Socios o familiares', 'Otra'];
  var O = 'Otra decisión de dinero';
  // Finanzas personales: el hogar puede analizarse con la pareja, y entonces cada cifra lleva una segunda columna
  var PAREJA = 'De mi hogar: mi pareja y yo aportamos';
  function conPareja() { return resp.tema === P && resp.p2c === PAREJA; }
  var QUIEN = { k: 'quien', l: 'De quién', sel: ['', 'Tuyo', 'De tu pareja', 'De ambos'], si: conPareja };
  var CONFIDENCIAL = 'Recuerda: esta información es confidencial y solo la uso para preparar tu análisis. ';
  var LEYENDA = 'Anota todo lo que sepas: mientras más datos me des, más útil será tu análisis. Si no sabes alguno, déjalo en blanco y lo calculo yo. ';
  var MEDICO = 'Asistencia médica';
  function filas(id) { return Array.isArray(resp[id]) ? resp[id] : []; }
  function tieneTarjetas() { return resp.p5b === 'Sí, una' || resp.p5b === 'Sí, varias'; }
  function conDiferidos() { return filas('p5t').some(function (t) { return t.diferido > 0 || /diferidos/.test(t.pago || ''); }); }
  function invierte() { var v = resp.p11 || {}; return ['polizas', 'polizas_p', 'inversiones', 'inversiones_p'].some(function (k) { return v[k] > 0; }); }
  function variasMedicas() { return filas('p13s').filter(function (s) { return s.tipo === MEDICO; }).length > 1; }
  function pagando(b) { return b.paga === 'Lo estoy pagando'; }

  var OT = { deuda: 'Refinanciar una deuda o seguir igual', prepago: 'Pagar antes una deuda con dinero que tengo', compra: 'Comprar vivienda o seguir arrendando',
    credito: 'Comprar algo al contado o a crédito', trabajo: 'Cambiar de trabajo o emprender', venta: 'Vender un bien o un negocio', otra: 'Otra decisión' };
  var DIAS = ['De contado', 'Hasta 30 días', 'De 31 a 60 días', 'De 61 a 90 días', 'Más de 90 días'];
  // Partes del análisis: la base siempre va incluida y cada parte adicional suma $5 + IVA. El cliente las elige y paga antes de responder;
  // al final se le ofrecen las que no eligió («por» dice qué gana su informe con cada una) y paga la diferencia antes de responderlas.
  var BASE = 35, PARTE = 5, IVA = 0.15, SOLO_BASE = 'Solo lo básico', NO_EXTRA = 'No, gracias';
  var CATALOGO = {};
  CATALOGO['Mi empresa'] = { base: 'Diagnóstico de rentabilidad y punto de equilibrio, con recomendaciones concretas', partes: [
    { k: 'capital', l: 'Capital de trabajo y ciclo de caja', por: 'mide cuánto dinero inmoviliza tu operación entre lo que te deben, el inventario y lo que debes a proveedores.' },
    { k: 'deudas', l: 'Deudas de la empresa', por: 'calcula el costo real de cada deuda y en qué orden conviene pagarlas.' },
    { k: 'atrasos', l: 'Plan para ponerse al día', por: 'ordena las obligaciones atrasadas con el SRI, el IESS, los bancos o los proveedores.' }] };
  CATALOGO[P] = { base: 'Diagnóstico de tu presupuesto del mes y del año y de tu patrimonio, con la respuesta a tu pregunta y recomendaciones concretas', partes: [
    { k: 'deudas', l: 'Préstamos y bienes financiados', por: 'calcula cuánto te cuesta de verdad cada préstamo y en qué orden conviene pagarlos.' },
    { k: 'tarjetas', l: 'Tarjetas de crédito', por: 'separa el gasto del mes de la deuda, estima cuánto te cobra cada tarjeta y si sus beneficios compensan.' },
    { k: 'inversiones', l: 'Revisión de tus inversiones actuales', por: 'revisa el riesgo y el rendimiento real de lo que ya tienes invertido, y con quién.' },
    { k: 'invertir', l: 'Plan para invertir o para tu jubilación', por: 'propone cuánto invertir al mes, en qué tipo de instrumentos y con qué horizonte.' },
    { k: 'compra', l: 'Plan de compra de vivienda o vehículo', por: 'calcula cuánto necesitas de entrada, qué cuota soporta tu presupuesto y cuándo te conviene comprar.' },
    { k: 'colchon', l: 'Fondo de emergencia y seguros', por: 'calcula el fondo de emergencia que necesitas y revisa si tus seguros te protegen bien o si pagas de más.' }] };
  CATALOGO['Una inversión'] = { base: 'Evaluación de la inversión: riesgo, rendimiento real y costos', partes: [
    { k: 'encaje', l: 'Cómo encaja en tus finanzas', por: 'compara la inversión con tus ingresos, gastos, ahorro y deudas, para ver si su tamaño y su plazo te convienen.' },
    { k: 'comparar', l: 'Comparación con otras alternativas', por: 'la compara con las opciones que estás considerando, en rendimiento, riesgo y costos.' }] };
  CATALOGO[O] = { base: 'Análisis de tu decisión, con una recomendación clara de qué hacer', partes: [
    { k: 'numeros', l: 'Comparación numérica de las opciones', por: 'calcula el costo total de cada opción y su efecto en tu flujo de cada mes.' },
    { k: 'escenarios', l: 'Escenarios', por: 'muestra qué pasa si cambian la tasa, tus ingresos o los plazos.' }] };
  var compradas = [], cobros = [], aceptado = '';   // partes sumadas al final, pagos aprobados y fecha en que aceptó las condiciones
  function catalogo() { return CATALOGO[resp.tema] || { base: '', partes: [] }; }
  function etiqueta(x) { return x.l + ' · +$' + PARTE; }
  function elegida(k) { return compradas.indexOf(k) > -1 || catalogo().partes.some(function (x) { return x.k === k && tiene('partes', etiqueta(x)); }); }
  function elegidas() { return catalogo().partes.filter(function (x) { return elegida(x.k); }); }
  function pendientes() { return catalogo().partes.filter(function (x) { return !elegida(x.k); }); }
  var AE = [
    { id: 'tema', q: '¿Sobre qué quieres el análisis?', op: ['Mi empresa', P, 'Una inversión', O] },
    { id: 'partes', get q() { var b = catalogo().base; return 'Tu análisis incluye siempre lo esencial: ' + b.charAt(0).toLowerCase() + b.slice(1) + ', por $' + BASE + ' + IVA. ¿Quieres sumar alguna de estas partes? Cada una cuesta $' + PARTE + ' más; si no estás seguro, al final te muestro qué gana tu informe con cada una.'; },
      op: function () { return catalogo().partes.map(etiqueta).concat([SOLO_BASE]); }, multi: true, solo: [SOLO_BASE] },
    { id: 'datos', q: '¿A nombre de quién preparo el informe y a qué correo te lo envío?', campos: true },
    { id: 'factura', q: '¿Necesitas factura?', op: ['Sí', 'No'] },
    { id: 'fdatos', cond: function () { return resp.factura === 'Sí'; }, q: '¿A nombre de quién la emito y con qué RUC o cédula?', ph: 'Por ejemplo: Comercial Andes S.A., RUC 1790000000001' },
    { id: 'pago', cobro: true, q: 'Tu pago' },

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
    { id: 'e5', si: 'Mi empresa', parte: 'capital', para: 'Saldos actuales de caja, cuentas por cobrar, inventario y cuentas por pagar.', q: 'Ahora el capital de trabajo, con los saldos de hoy:', opcional: true, ficha: [
      { k: 'caja', l: 'Caja y bancos' },
      { k: 'cxc', l: 'Cuentas por cobrar a clientes' },
      { k: 'inv', l: 'Inventario' },
      { k: 'cxp', l: 'Cuentas por pagar a proveedores' }] },
    { id: 'e6', si: 'Mi empresa', parte: 'capital', q: '¿En cuánto tiempo te pagan tus clientes, en promedio?', op: DIAS },
    { id: 'e7', si: 'Mi empresa', parte: 'capital', q: '¿Y en cuánto tiempo les pagas a tus proveedores?', op: DIAS },
    { id: 'e8s', si: 'Mi empresa', sinParte: 'deudas', para: 'Carga total de las deudas de la empresa.', q: 'Para medir la carga de las deudas me basta el total: cuánto pagan al mes en cuotas y cuánto deben, más o menos. Si no tienen deudas, déjalo en blanco.', opcional: true, ficha: [
      { k: 'cuota', l: 'Cuotas de todas las deudas', d: 'al mes' },
      { k: 'saldo', l: 'Lo que deben en total' }] },
    { id: 'e8', si: 'Mi empresa', parte: 'deudas', para: 'Detalle de las deudas de la empresa para medir su carga financiera.', q: 'Anota las deudas de la empresa con su saldo y su cuota mensual. La tasa y el plazo son opcionales: si no los sabes, déjalos en blanco y los calculo yo.', deudas: DEUDAS_E },
    { id: 'e9', si: 'Mi empresa', q: 'En los últimos tres meses, ¿cómo estuvo la caja?', op: ['Hubo excedentes', 'Alcanzó justo', 'Faltó y usamos crédito o sobregiro', 'Tuvimos que atrasar pagos'] },
    { id: 'e10', si: 'Mi empresa', q: '¿Están al día con sus obligaciones? Marca lo que corresponda.', op: ['Todo al día', 'Atrasos con el SRI', 'Atrasos con el IESS', 'Atrasos con bancos', 'Atrasos con proveedores'], multi: true, solo: ['Todo al día'] },
    { id: 'e11', si: 'Mi empresa', q: '¿Qué información financiera llevan? Puedes marcar varias.', op: ['Contabilidad al día', 'Estados financieros mensuales', 'Flujo de caja proyectado', 'Presupuesto anual', 'Costos por producto', 'Nada formal todavía'], multi: true, solo: ['Nada formal todavía'] },
    { id: 'e12', si: 'Mi empresa', para: 'El problema financiero concreto que el informe debe atender.', q: '¿Cuál es el problema o la decisión principal que quieres resolver con este análisis?', ph: 'Por ejemplo: vendemos más que el año pasado, pero no alcanza la caja' },
    { id: 'e13', si: 'Mi empresa', para: 'Acciones ya intentadas, para no repetir recomendaciones.', q: '¿Qué han intentado hasta ahora para resolverlo?', opcional: true },
    { id: 'e14', si: 'Mi empresa', nota: lecturaEmpresa },

    { id: 'p1', si: P, q: '¿Qué quieres lograr? Puedes marcar varias.', op: ['Ordenar mi presupuesto', 'Salir de deudas', 'Tener un fondo de emergencia', 'Empezar a invertir', 'Comprar vivienda o vehículo', 'Planear mi jubilación'], multi: true },
    { id: 'p0', si: P, para: 'La pregunta concreta que el informe debe responder.', q: 'En pocas palabras, ¿qué te gustaría que te responda este informe?', ph: 'Por ejemplo: ¿me alcanza para cambiar de carro el próximo año?',
      conversa: 'Que la expectativa del cliente quede concreta: qué decisión quiere tomar o qué quiere saber, para cuándo, y qué consideraría una buena respuesta. Cuando esté claro, resume lo que quiere saber; ese resumen encabezará el informe.' },
    { id: 'p0b', si: P, cond: function () { return !IA.url; }, para: 'Lo que el cliente considera una respuesta útil.', q: '¿Qué tendría que decir el informe para que te sea útil?', ph: 'Por ejemplo: cuánto tendría que ahorrar al mes y si conviene vender mi carro actual' },
    { id: 'p2', si: P, q: '¿En qué rango de edad estás?', op: ['Menos de 30', 'De 30 a 39', 'De 40 a 49', 'De 50 a 59', '60 o más'] },
    { id: 'p3', si: P, q: '¿Cuál es tu situación laboral?', op: ['Empleado con relación de dependencia', 'Independiente o con negocio propio', 'Ambas', 'Jubilado', 'Sin ingresos fijos por ahora'] },
    { id: 'p2c', si: P, q: '¿El análisis es solo de tus finanzas o de tu hogar?', op: ['Solo de las mías', PAREJA, 'De mi hogar, pero solo aporto yo'] },
    { id: 'p2p', si: P, cond: conPareja, q: 'Desde aquí, cada cifra lleva una columna para ti y otra para tu pareja. ¿En qué rango de edad está tu pareja?', op: ['Menos de 30', 'De 30 a 39', 'De 40 a 49', 'De 50 a 59', '60 o más'] },
    { id: 'p3p', si: P, cond: conPareja, q: '¿Y cuál es su situación laboral?', op: ['Empleado con relación de dependencia', 'Independiente o con negocio propio', 'Ambas', 'Jubilado', 'Sin ingresos fijos por ahora'] },
    { id: 'p4', si: P, get q() { return 'Además de ' + (conPareja() ? 'ustedes dos' : 'ti') + ', ¿cuántas personas dependen económicamente de ' + (conPareja() ? 'sus' : 'tus') + ' ingresos?'; }, op: ['Ninguna', '1', '2', '3', '4 o más'] },
    { id: 'p5', si: P, dos: ['Tú', 'Tu pareja'], para: 'Ingreso neto mensual y extras anuales.', q: 'Empecemos por tus ingresos, ya libres de descuentos. Un aviso antes: el informe será tan bueno como estas cifras. Si no estás seguro de alguna, pon un aproximado razonable.', req: true, total: 'Ingreso mensual', ficha: [
      { k: 'sueldo', l: 'Sueldo o ingreso principal', d: 'al mes' },
      { k: 'extra', l: 'Negocio o trabajos independientes', d: 'al mes' },
      { k: 'otros', l: 'Otros ingresos', d: 'alquileres que cobras, jubilación u otros, al mes' },
      { k: 'anual', l: 'Ingresos extra del año', d: 'décimos, utilidades y bonos, en total', anual: true }] },
    { id: 'p6', si: P, dos: ['Lo pagas tú', 'Lo paga tu pareja'], para: 'Gastos fijos mensuales por rubro, para armar el presupuesto.', q: 'Ahora tus gastos fijos de cada mes. Anota cada gasto en su rubro, también los que pagas con tarjeta. Un estimado basta; deja en blanco lo que no aplique.', req: true, total: 'Gastos fijos al mes', ficha: [
      { k: 'vivienda', l: 'Vivienda', d: 'arriendo y alícuota; la cuota de la hipoteca va más adelante, con tus bienes' },
      { k: 'servicios', l: 'Servicios básicos', d: 'luz, agua, gas, internet y celular' },
      { k: 'alimentacion', l: 'Alimentación', d: 'supermercado y mercado' },
      { k: 'transporte', l: 'Transporte', d: 'gasolina, pasajes, parqueadero y mantenimiento; la cuota del carro va con tus bienes' },
      { k: 'seguros', l: 'Cuotas de seguros', d: 'médico, de vida y del vehículo; solo lo que pagas tú. Si te lo descuentan del sueldo, no lo pongas; si lo pagas una vez al año, va en los gastos del año' },
      { k: 'salud', l: 'Salud de tu bolsillo', d: 'consultas, exámenes y medicinas: solo lo que el seguro no te devuelve' },
      { k: 'educacion', l: 'Educación', d: 'pensiones escolares, universidad y cursos' },
      { k: 'familia', l: 'Apoyo a familiares' }] },
    { id: 'p7', si: P, dos: ['Lo pagas tú', 'Lo paga tu pareja'], para: 'Gastos variables mensuales por rubro, para armar el presupuesto.', q: 'Y los gastos variables, que suelen ser los que más se escapan:', total: 'Gastos variables al mes', ficha: [
      { k: 'comidas', l: 'Comidas fuera y delivery' },
      { k: 'ocio', l: 'Entretenimiento y salidas' },
      { k: 'suscripciones', l: 'Suscripciones', d: 'streaming, aplicaciones y gimnasio' },
      { k: 'hormiga', l: 'Gastos hormiga', d: 'cafés, snacks, taxis y compras pequeñas' },
      { k: 'ropa', l: 'Ropa y cuidado personal' },
      { k: 'mascotas', l: 'Mascotas' },
      { k: 'otros', l: 'Otros' }] },
    { id: 'p6a', si: P, dos: ['Lo pagas tú', 'Lo paga tu pareja'], todoAnual: true, opcional: true, para: 'Gastos que llegan una o dos veces al año, para provisionarlos cada mes.', q: 'Hay gastos que llegan una o dos veces al año y desordenan cualquier presupuesto. Anota cuánto suman en el año; solo lo que no pusiste en los gastos del mes.', total: 'Gastos del año', ficha: [
      { k: 'matricula', l: 'Matrícula del vehículo e impuesto predial' },
      { k: 'segurosanual', l: 'Seguros que pagas una vez al año' },
      { k: 'escolar', l: 'Matrículas, útiles y uniformes escolares' },
      { k: 'vacaciones', l: 'Vacaciones y viajes' },
      { k: 'navidad', l: 'Navidad, cumpleaños y regalos' },
      { k: 'otrosanual', l: 'Otros', d: 'arreglos grandes de la casa o del carro' }] },
    { id: 'p12', si: P, q: '¿Tienes vivienda, terreno o vehículo, ya pagados o que estés pagando?', op: ['Sí', 'No'] },
    { id: 'p12b', si: P, cond: function () { return resp.p12 === 'Sí'; }, para: 'Valor de compra y de mercado de cada bien, y su crédito, para el patrimonio neto.',
      get q() { return CONFIDENCIAL + 'Anota cada bien. Lo que vale hoy es un aproximado: lo que te darían si lo vendieras. Si lo estás pagando, lo indispensable es la cuota y los meses que te faltan; el saldo lo calculo yo si no lo sabes.'; },
      filas: { add: '+ Agregar otro bien', total: { k: 'cuota', l: 'Cuotas al mes' }, campos: [
        { k: 'tipo', l: 'Qué es', sel: ['Vivienda', 'Terreno', 'Vehículo', 'Otro'] }, QUIEN,
        { k: 'costo', l: 'Cuánto te costó', t: 'usd' },
        { k: 'anio', l: 'Año de compra', t: 'anio' },
        { k: 'valor', l: 'Cuánto vale hoy, más o menos', t: 'usd', req: true },
        { k: 'paga', l: '¿Lo estás pagando?', sel: ['', 'Ya está pagado', 'Lo estoy pagando'], req: true },
        { k: 'cuota', l: 'Cuota al mes', t: 'usd', req: true, si: pagando },
        { k: 'meses', l: 'Meses que te faltan', t: 'meses', req: true, si: pagando },
        { k: 'saldo', l: 'Saldo que debes, si lo sabes', t: 'usd', si: pagando }],
        error: 'De cada bien necesito cuánto vale hoy, más o menos, si lo estás pagando y, en ese caso, la cuota y los meses que te faltan.' } },
    { id: 'p8s', si: P, sinParte: 'deudas', dos: ['Tú', 'Tu pareja'], opcional: true, para: 'Cuotas y saldo total de los préstamos, para que el presupuesto cuadre.',
      get q() { return (resp.p12 === 'Sí' ? '' : CONFIDENCIAL) + 'Para que tu presupuesto cuadre necesito el total de tus préstamos' + (resp.p12 === 'Sí' ? ', sin contar los de los bienes que ya anotaste' : '') + ': cuánto pagas al mes en cuotas y cuánto debes, más o menos. Las tarjetas van aparte. Si no tienes préstamos, déjalo en blanco.'; },
      ficha: [
      { k: 'cuota', l: 'Cuotas de préstamos', d: 'al mes, todas sumadas' },
      { k: 'saldo', l: 'Lo que debes en total' }] },
    { id: 'p8', si: P, parte: 'deudas', para: 'Cada préstamo con saldo, cuota y meses que faltan, para medir el endeudamiento.',
      get q() { return (resp.p12 === 'Sí' ? '' : CONFIDENCIAL) + 'Ahora tus préstamos. ' + LEYENDA + 'Lo indispensable son tres datos: cuánto crees que debes hoy, cuánto pagas de cuota y cuántos meses te faltan. La hipoteca y el préstamo del carro ya van con tus bienes, y las tarjetas tienen su propio apartado.'; },
      filas: { add: '+ Agregar otro préstamo', vacio: 'No tengo préstamos', total: { k: 'cuota', l: 'Cuotas al mes' }, campos: [
        { k: 'tipo', l: 'Tipo', sel: ['Préstamo de consumo', 'Cooperativa', 'Crédito educativo', 'Familiares o amigos', 'Otro'] }, QUIEN,
        { k: 'entidad', l: 'Banco o entidad, si quieres', t: 'txt' },
        { k: 'saldo', l: 'Cuánto crees que debes hoy', t: 'usd', req: true },
        { k: 'cuota', l: 'Cuota al mes', t: 'usd', req: true },
        { k: 'meses', l: 'Meses que te faltan', t: 'meses', req: true },
        { k: 'tasa', l: 'Tasa anual, si la sabes', t: 'pct' }],
        error: 'De cada préstamo necesito, aunque sea aproximado, cuánto debes, la cuota y los meses que te faltan.' } },
    { id: 'p5s', si: P, sinParte: 'tarjetas', dos: ['Tú', 'Tu pareja'], opcional: true, para: 'Lo que se paga de deuda de tarjetas cada mes y el saldo total.',
      q: 'Ahora tus tarjetas de crédito, en total. Los gastos del mes que pagas con tarjeta ya los anotaste en su rubro; aquí va solo la deuda: lo que pagas al mes por compras a meses, diferidos o saldos que arrastras, y lo que debes en total. Si no tienes tarjetas o las pagas completas cada mes, déjalo en blanco.',
      ficha: [
      { k: 'cuotas', l: 'Cuotas de diferidos y saldos', d: 'al mes; sin repetir los gastos del mes' },
      { k: 'deuda', l: 'Lo que debes en tarjetas', d: 'saldo total, con los diferidos' }] },
    { id: 'p5b', si: P, parte: 'tarjetas', q: '¿Tienes tarjetas de crédito?', op: ['No', 'Sí, una', 'Sí, varias'] },
    { id: 'p5t', si: P, parte: 'tarjetas', cond: tieneTarjetas, para: 'Cada tarjeta con emisor, marca, nivel, estado de cuenta y forma de pago, para estimar su costo real.',
      q: 'Una tarjeta mezcla dos cosas distintas: el gasto del mes que pagas con ella, como el supermercado o la gasolina, y la deuda que arrastras, que es el saldo que no pagas completo y los diferidos. Ya anotaste tus gastos del mes por rubro; aquí me interesa la deuda y cómo usas cada tarjeta, para separar bien una cosa de la otra. El banco, la marca y el tipo me ayudan a estimar cuánto te cobra cada una.',
      filas: { add: '+ Agregar otra tarjeta', campos: [
        { k: 'banco', l: 'Banco', t: 'txt' },
        { k: 'marca', l: 'Marca', sel: ['', 'Visa', 'Mastercard', 'American Express', 'Diners Club', 'Discover', 'Otra'] },
        { k: 'nivel', l: 'Tipo o color', sel: ['', 'Clásica', 'Oro', 'Platinum', 'Black o similar', 'No sé'] },
        { k: 'millas', l: '¿Acumula millas o puntos?', sel: ['', 'Sí', 'No', 'No sé'] }, QUIEN,
        { k: 'estado', l: 'Cuánto te llegó en el último estado de cuenta', t: 'usd', req: true },
        { k: 'pago', l: 'Cómo lo pagas', sel: ['', 'El total', 'El total, pero tengo diferidos', 'Más del mínimo', 'Solo el mínimo'], req: true },
        { k: 'diferido', l: 'Lo que te falta pagar de diferidos, si los tienes', t: 'usd' },
        { k: 'cupo', l: 'Cupo, si lo sabes', t: 'usd' }],
        error: 'De cada tarjeta necesito cuánto te llegó en el último estado de cuenta y cómo lo pagas.' } },
    { id: 'p5u', si: P, parte: 'tarjetas', cond: function () { return tieneTarjetas() && !!IA.url; }, para: 'Uso de cada tarjeta, diferidos, costo anual y beneficios.',
      q: 'Cuéntame cómo usas tus tarjetas: qué pagas con cada una y si tienes alguna para algo en particular, como la gasolina, el supermercado o las compras grandes.', ph: 'Por ejemplo: la Visa para todo por las millas y la Mastercard solo para electrodomésticos a meses',
      conversa: 'Entender el uso de cada tarjeta para separar el gasto corriente de la deuda y estimar su costo: qué paga con cada una (gasto del mes como supermercado, combustible o restaurantes; compras grandes o de temporada como electrodomésticos, pensiones o viajes; o todo, por las millas y beneficios); qué difiere y a cuántos meses; si sabe cuánto paga al año por cada tarjeta (si no lo sabe, dile que lo estimamos con lo que nos dio); qué beneficios aprovecha de verdad; si saca avances de efectivo; y si las compras que paga con tarjeta las anotó en sus gastos del mes, para no contarlas dos veces. Haz que sienta que conoces bien cómo funcionan las tarjetas en Ecuador.' },
    { id: 'p5c', si: P, parte: 'tarjetas', cond: function () { return tieneTarjetas() && !IA.url; }, q: '¿Qué pagas con tarjeta? Puedes marcar varias.', op: ['Gastos del mes: supermercado, combustible, restaurantes, entretenimiento', 'Compras grandes: electrodomésticos, pensiones o matrículas, viajes', 'Todo, porque me gusta usar las millas para viajes y otros beneficios'], multi: true, solo: ['Todo, porque me gusta usar las millas para viajes y otros beneficios'] },
    { id: 'p5g', si: P, parte: 'tarjetas', cond: function () { return tieneTarjetas() && !IA.url; }, q: 'Las compras que pagas con tarjeta, ¿las anotaste en tus gastos del mes?', op: ['Sí, todas en su rubro', 'Algunas sí y otras no', 'No, no las anoté'] },
    { id: 'p5f', si: P, parte: 'tarjetas', cond: function () { return tieneTarjetas() && !IA.url; }, q: '¿Sabes si pagas un monto anual por la tarjeta? Si no lo sabes, no te preocupes: lo estimo con la información que me diste.', op: ['Sí, sé cuánto', 'No lo sé', 'No pago nada al año'] },
    { id: 'p5fm', si: P, parte: 'tarjetas', cond: function () { return tieneTarjetas() && !IA.url && resp.p5f === 'Sí, sé cuánto'; }, q: '¿Cuánto pagas al año por tus tarjetas, en total?', opcional: true, ficha: [{ k: 'anual', l: 'Monto anual por tus tarjetas', anual: true }] },
    { id: 'p5d', si: P, parte: 'tarjetas', cond: function () { return tieneTarjetas() && !IA.url && conDiferidos(); }, opcional: true, para: 'Compras diferidas: qué y a cuántos meses.', q: '¿Qué compras tienes diferidas y a cuántos meses?', ph: 'Por ejemplo: refrigeradora a 12 meses, quedan 5; pasajes a 6 meses, quedan 2' },
    { id: 'p10', si: P, q: '¿Has tenido atrasos en algún pago en los últimos doce meses?', op: ['Ninguno', 'Alguna vez', 'Sí, tengo pagos atrasados ahora'] },
    { id: 'p11', si: P, dos: ['Tú', 'Tu pareja'], para: 'Ahorros e inversiones disponibles, para medir el colchón de emergencia.', q: '¿Qué ahorros e inversiones tienes hoy?', opcional: true, total: 'Ahorro e inversiones', ficha: [
      { k: 'ahorro', l: 'Ahorro disponible', d: 'cuentas de ahorro y efectivo' },
      { k: 'polizas', l: 'Pólizas y depósitos a plazo', d: 'el monto' },
      { k: 'tasapol', l: 'Interés que te pagan por esas pólizas', d: 'al año, aproximado', t: 'pct', noSuma: true },
      { k: 'inversiones', l: 'Fondos, acciones u otras inversiones' }] },
    { id: 'p11b', si: P, parte: 'inversiones', cond: invierte, opcional: true, para: 'En qué y con quién está invertido el dinero, para detectar inversiones riesgosas.', q: 'Cuéntame en qué y con quién tienes invertido tu dinero, y qué rendimiento te ofrecieron.', ph: 'Por ejemplo: póliza a un año en una cooperativa al 9 %; un fondo en una casa de valores',
      conversa: 'Saber en qué está invertido su dinero, con quién (banco, cooperativa, casa de valores, plataforma o persona), qué rendimiento le prometieron, si puede retirarlo cuando quiera y si la entidad está controlada por alguna superintendencia. El objetivo es detectar inversiones en las que podría perder su dinero: no adviertas nada al cliente, solo reúne la información.' },
    { id: 'p13i', si: P, get q() { return 'Ahora tu protección. ¿Estás afiliado al IESS?'; }, op: ['Sí', 'No', 'Soy jubilado'] },
    { id: 'p13ip', si: P, cond: conPareja, q: '¿Y tu pareja?', op: ['Sí', 'No', 'Es jubilada o jubilado'] },
    { id: 'p13s', si: P, parte: 'colchon', opcional: true, para: 'Seguros con aseguradora, cobertura, deducible y montos asegurados.',
      q: 'Este apartado es opcional. Me ayuda a decirte si estás bien protegido y si pagas de más; si lo saltas, el resto de tu informe no cambia. Anota tus seguros, aunque los datos sean de memoria.',
      filas: { add: '+ Agregar otro seguro', vacio: 'No tengo seguros privados', campos: [
        { k: 'tipo', l: 'Tipo', sel: [MEDICO, 'Vida', 'Desgravamen', 'Vehículo', 'Otro'] }, QUIEN,
        { k: 'aseguradora', l: 'Aseguradora', t: 'txt' },
        { k: 'costo', l: 'Cuánto cuesta, si lo sabes', t: 'usd', unidad: 'periodo' },
        { k: 'periodo', l: 'Ese costo es', sel: ['', 'Al mes', 'Al año'], enTexto: false },
        { k: 'cobertura', l: 'Porcentaje de cobertura', t: 'pct', si: function (r) { return r.tipo === MEDICO; } },
        { k: 'deducible', l: 'Deducible', t: 'usd', si: function (r) { return r.tipo === MEDICO; } },
        { k: 'maximo', l: 'Monto máximo de cobertura', t: 'usd', si: function (r) { return r.tipo === MEDICO; } },
        { k: 'asegurado', l: 'Monto asegurado', t: 'usd', si: function (r) { return r.tipo === 'Vida'; } },
        { k: 'encuota', l: '¿Va incluido en la cuota de un préstamo?', sel: ['', 'Sí', 'No', 'No sé'], si: function (r) { return r.tipo === 'Desgravamen'; } }] } },
    { id: 'p13x', si: P, parte: 'colchon', cond: variasMedicas, opcional: true, para: 'Para qué usa cada póliza médica y cómo se complementan.', q: 'Tienes más de un seguro médico. Cuéntame para qué usas cada uno y si uno cubre lo que el otro no.', ph: 'Por ejemplo: con una me atiendo lo del día a día y la otra es para algo grave, a partir de un deducible alto',
      conversa: 'Entender para qué usa cada póliza médica, cómo se coordinan los beneficios entre ellas (qué cubre una que la otra no, deducibles, porcentajes), y si alguna podría sobrar. No preguntes por enfermedades ni diagnósticos: solo coberturas, deducibles, costos y uso. Si el cliente menciona una enfermedad, no profundices en ella.' },
    { id: 'p14', si: P, q: '¿Llevas un registro de tus gastos?', op: ['Sí, al detalle', 'Más o menos', 'No'] },
    { id: 'p14p', si: P, cond: conPareja, q: '¿Y tu pareja?', op: ['Sí, al detalle', 'Más o menos', 'No'] },
    { id: 'p15', si: P, q: '¿Ya tienes en mente una meta concreta para los próximos doce meses? Si no, la propongo yo en el informe.', op: ['Sí, la tengo clara', 'No, que salga del informe'] },
    { id: 'p15b', si: P, cond: function () { return resp.p15 === 'Sí, la tengo clara'; }, para: 'Una meta medible, con monto y plazo.', q: 'Escríbela con monto y fecha, si puedes.', ph: 'Por ejemplo: pagar la tarjeta de 2.400 antes de junio' },
    { id: 'pinv', si: P, parte: 'invertir', para: 'Objetivo, horizonte, monto y tolerancia al riesgo del plan de inversión o de jubilación.',
      q: 'Vamos a tu plan para invertir. Cuéntame para qué es ese dinero, en cuánto tiempo lo necesitarías y cuánto podrías apartar cada mes o de una vez.', ph: 'Por ejemplo: quiero jubilarme a los 60 y podría apartar 200 al mes',
      conversa: 'Entender el plan de inversión o de jubilación: para qué es el dinero, en cuántos años lo necesitaría, cuánto podría invertir al mes o de una vez, qué haría si su inversión cayera 20 % en un año (su tolerancia al riesgo), si ya aporta a algún fondo de jubilación además del IESS y, si el objetivo es jubilarse, a qué edad quisiera hacerlo.' },
    { id: 'pcom', si: P, parte: 'compra', para: 'Bien, precio, plazo, entrada y financiamiento del plan de compra.',
      q: 'Ahora tu plan de compra. Cuéntame qué quieres comprar, cuánto cuesta más o menos, para cuándo y cuánto tienes para la entrada.', ph: 'Por ejemplo: un departamento de 90.000 en dos años; tengo 10.000 ahorrados',
      conversa: 'Entender el plan de compra: qué bien (vivienda o vehículo, nuevo o usado), su precio aproximado, para cuándo, cuánto tiene para la entrada, si piensa financiarlo y con quién (banco, BIESS, cooperativa o concesionario) y si vendería algún bien actual para pagarlo.' },
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
    { id: 'i11', si: 'Una inversión', parte: 'encaje', para: 'Situación financiera general de quien invierte.', q: 'Para ubicar la inversión en tu situación general:', opcional: true, ficha: [
      { k: 'ingreso', l: 'Ingreso mensual neto' },
      { k: 'gastos', l: 'Gastos mensuales', d: 'incluidas las cuotas de deudas' },
      { k: 'ahorro', l: 'Ahorro disponible', d: 'aparte de esta inversión' },
      { k: 'deuda', l: 'Deudas totales', d: 'saldo pendiente' }] },
    { id: 'i12', si: 'Una inversión', parte: 'comparar', para: 'Alternativas con las que compara la inversión.', q: '¿La estás comparando con otras opciones? ¿Con cuáles?', opcional: true },

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

    { id: 'extra', cond: function () { return !!resp.pago && (pendientes().length > 0 || 'extra' in resp); }, multi: true, solo: [NO_EXTRA],
      get q() { var n = pendientes(); return 'Antes de terminar: tu informe ganaría mucho con ' + (n.length > 1 ? 'estas partes, que no elegiste' : 'esta parte, que no elegiste') + ' al inicio. Cada una cuesta $' + PARTE + ' + IVA y, si la sumas, te hago ahora sus preguntas.\n\n' +
        n.map(function (x) { return '· ' + x.l + ': ' + x.por; }).join('\n'); },
      op: function () { return pendientes().map(function (x) { return x.l; }).concat([NO_EXTRA]); } },
    { id: 'mas', para: 'Cambios, ingresos o gastos previstos que modifiquen el análisis.', opcional: true,
      get q() { return resp.tema === P ? '¿Hay algo más que quieras contarme, o alguna parte que quieras explicarme mejor, para que tu informe se ajuste a lo que esperas?' : '¿Hay algo más que deba considerar, como un cambio previsto, un ingreso que viene o un gasto importante en los próximos meses?'; },
      get conversa() { return resp.tema === P ? 'Profundizar en lo que el cliente cuenta aquí para que el informe se ajuste a lo que espera: cambios previstos, ingresos o gastos que vienen, o cualquier punto de sus respuestas que quiera explicar mejor. Pregunta solo lo que aporte al informe y nada que ya esté respondido.' : ''; } },
    { id: 'adj', si: P, archivos: true, q: '¿Quieres adjuntar algo que me ayude? Por ejemplo, tu último estado de cuenta de la tarjeta, la tabla de pagos de un préstamo o tus pólizas de seguro. Hasta 5 archivos de 5 MB cada uno, en PDF, foto o Excel. Tapa el número completo de la tarjeta: me bastan los últimos cuatro dígitos. Tus archivos se tratan con la misma confidencialidad que tus respuestas.' },
  ];
  // Etiquetas cortas para el resumen previo al pago
  var RES = {
    tema: 'Tema del análisis', partes: 'Partes adicionales', pago: 'Tu pago', extra: 'Partes que sumaste al final', mas: 'Algo más a considerar', datos: 'Informe a nombre de', factura: 'Factura', fdatos: 'Datos para la factura',
    e1: 'A qué se dedica la empresa', e2: 'Personas que trabajan', e3: 'Cifras del último año', e4: 'Gastos fijos al mes', e5: 'Capital de trabajo',
    e6: 'Plazo de cobro a clientes', e7: 'Plazo de pago a proveedores', e8: 'Deudas de la empresa', e8s: 'Deudas de la empresa, en total', e9: 'Caja en los últimos tres meses',
    e10: 'Obligaciones', e11: 'Información financiera que llevan', e12: 'Problema o decisión principal', e13: 'Lo que han intentado',
    p1: 'Lo que quieres lograr', p0: 'Lo que quieres que responda el informe', p0b: 'Lo que haría útil el informe', p2: 'Edad', p3: 'Situación laboral',
    p2c: 'Unidad del análisis', p2p: 'Edad de tu pareja', p3p: 'Situación laboral de tu pareja', p4: 'Personas que dependen de los ingresos',
    p5: 'Ingresos', p6: 'Gastos fijos', p7: 'Gastos variables', p6a: 'Gastos del año', p12: '¿Tiene vivienda, terreno o vehículo?', p12b: 'Bienes',
    p8: 'Préstamos', p8s: 'Préstamos, en total', p5s: 'Deuda de tarjetas, en total', pinv: 'Tu plan para invertir', pcom: 'Tu plan de compra', p5b: 'Tarjetas de crédito', p5t: 'Detalle de tus tarjetas', p5u: 'Uso de tus tarjetas', p5c: 'Lo que pagas con tarjeta',
    p5g: '¿Anotaste las compras con tarjeta en tus gastos?', p5f: 'Monto anual por la tarjeta', p5fm: 'Monto anual por tus tarjetas', p5d: 'Compras diferidas',
    p10: 'Atrasos en los últimos doce meses', p11: 'Ahorros e inversiones', p11b: 'En qué y con quién inviertes', p13i: 'Afiliación al IESS',
    p13ip: 'Afiliación al IESS de tu pareja', p13s: 'Seguros', p13x: 'Uso de tus seguros médicos', p14: 'Registro de gastos', p14p: 'Registro de gastos de tu pareja',
    p15: '¿Tiene una meta definida?', p15b: 'Meta para los próximos doce meses', adj: 'Archivos adjuntos',
    i1: 'Inversión que evalúas', i2: 'Condiciones de la inversión', i3: 'Objetivo del dinero', i4: 'Origen del dinero', i5: 'Peso en tu patrimonio',
    i6: 'Necesidad del dinero antes del plazo', i7: 'Si cayera 20 % en un año', i8: 'Inversiones anteriores', i9: 'Costos y condiciones de retiro',
    i10: 'Control de una superintendencia', i11: 'Tu situación general', i12: 'Alternativas que comparas',
    o1: 'La decisión', o2: 'Ámbito de la decisión', o3c: 'Lo que va a comprar', o3d: 'Su caso', o3e: 'Lo que quiere vender', o3f: 'La decisión', o5a: 'Cifras principales', o5g: 'Cifras principales',
    o5b: 'Cifras principales', o5c: 'Cifras principales', o5d: 'Cifras principales', o5e: 'Cifras principales', o5f: 'Cifras principales',
    o6: 'Lo que más cuida'
  };
  var CONDICIONES = 'versión del 10 de octubre de 2026';
  var INTRO = 'Hola, soy Carlo. Para darte un análisis serio necesito conocer bien tu situación, así que te haré las preguntas de una primera reunión de asesoría; te tomarán entre diez y veinte minutos, según tu caso. Con tus respuestas preparo un informe con un diagnóstico y recomendaciones concretas, y te lo envío por correo en un máximo de tres días hábiles.';
  var INTRO_PRECIO = 'Primero eliges el tema y las partes que quieres analizar, y pagas: $' + BASE + ' + IVA por lo esencial y $' + PARTE + ' más por cada parte adicional. Te pido el pago al inicio porque vas a compartir información muy sensible, y la trato con un rigor que tiene un costo: viaja cifrada, solo yo la veo, no la comparto con nadie sin tu consentimiento expreso y, 72 horas después de enviarte el informe, borro tus respuestas y los archivos que adjuntes.';
  var INTRO_IA = 'Te acompaña un asistente con inteligencia artificial: si algo no queda claro, te lo explica o te pide un dato que falte. El análisis y el informe los hago yo.';
  var BORRADO = '72 horas después de enviarte el informe, borro tus respuestas y los archivos que adjuntaste. Solo conservo los datos que la ley me obliga a guardar para tu factura. Si más adelante quieres profundizar o revisar cómo evolucionaste, compárteme el informe que recibiste y partimos de ahí.';
  function intro() { return INTRO + '\n\n' + INTRO_PRECIO + (IA.url ? '\n\n' + INTRO_IA : ''); }
  var dlg = document.getElementById('ae'), log = document.getElementById('ae-log'), chipsEl = document.getElementById('ae-chips');
  var row = document.getElementById('ae-row'), txt = document.getElementById('ae-txt'), camposEl = document.getElementById('ae-campos');
  var okBtn = document.getElementById('ae-ok'), backBtn = document.getElementById('ae-back'), skipBtn = document.getElementById('ae-skip');
  var errEl = document.getElementById('ae-err'), inForm = document.getElementById('ae-in'), dudaBtn = document.getElementById('ae-duda');
  // Asistente con IA (opcional): la dirección llega en data/asistente.json cuando el servicio está desplegado
  var IA = { url: '' }, aclar = {}, dudas = [], revisada = {}, pendiente = null, modoDuda = false;
  var servicios = fetch('/data/asistente.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (j) { if (j && /^https:\/\//.test(j.url || '')) IA.url = j.url; }).catch(function () {});
  // Pasarelas de cobro. El recorrido solo llama a cobrar(caja, monto, descripción, referencia, tipo, datos, alError); la primera pasarela activa
  // pinta el pago en `caja` y llama a ok({ monto, texto }) únicamente cuando confirma el pago completo. Cada pasarela es un objeto con:
  //   activa()  → si está disponible;   nota, ayuda → textos del resumen y de la ventana de pago;
  //   pintar(caja, monto, descripción, referencia, ok, mal) → muestra el pago;
  //   sale: true y vuelta(cobro, ok, mal) → para las que llevan al cliente a otra página y lo devuelven (como Payphone): antes de salir
  //   se guarda el cuestionario en este navegador y, al volver, vuelta() confirma el pago con `cobro` ({ monto, referencia, ... }).
  // Para cambiar de pasarela basta con añadir su entrada aquí, antes de las demás (o en window.AE_PASARELA); el recorrido no cambia.
  var PRUEBA = !!window.AE_PRUEBA;   // versión de prueba: simula el pago y no envía nada
  var PASARELAS = [
    { activa: function () { return PRUEBA; }, nota: 'Versión de prueba: el pago se simula y no se cobra nada.', ayuda: 'Versión de prueba: pulsa el botón para simular un pago aprobado. No se cobra nada.',
      pintar: function (caja, monto, desc, referencia, ok) {
        caja.innerHTML = '<button type="button" class="btn btn-brass">Simular el pago de ' + dolares(monto) + '</button>';
        caja.querySelector('button').addEventListener('click', function () { ok({ monto: monto, texto: 'Versión de prueba: pago simulado de ' + dolares(monto) + ' USD (' + referencia + ')' }); });
      } },
    { activa: function () { return !!PAYPAL.clientId; }, nota: 'Pagas con PayPal o con tarjeta de crédito o débito, con el monto exacto y confirmación inmediata.',
      ayuda: 'Paga con tu cuenta PayPal o con tarjeta de crédito o débito. El monto ya está fijado y la confirmación es inmediata. Si pagas con tarjeta, el «CSC» que pide PayPal es el código de seguridad (CVV) de tres dígitos del reverso; si tu banco la rechaza, activa en su app las compras por internet y en el exterior.',
      pintar: function (caja, monto, desc, referencia, ok, mal) {
        botonesPayPal(caja, monto, desc, referencia, function (r) { ok({ monto: monto, texto: textoPayPal(r) }); }, mal);
      } }
  ];
  if (window.AE_PASARELA) PASARELAS.unshift(window.AE_PASARELA);
  function pasarela() { return PASARELAS.filter(function (x) { return x.activa(); })[0] || null; }
  // tipo: 'inicial' (las partes elegidas) o 'extra' (las sumadas al final, con sus claves en datos); al aprobarse sigue pagado()
  function cobrar(caja, monto, desc, referencia, tipo, datos, alError) {
    var p = pasarela();
    if (!p) { caja.innerHTML = ''; return alError('El pago en línea no está disponible en este momento. Escríbeme por LinkedIn y lo resolvemos.'); }
    var cobro = { tipo: tipo, datos: datos, monto: monto, desc: desc, referencia: referencia };
    if (p.sale) guardarCurso(cobro);
    p.pintar(caja, monto, desc, referencia, function (r) { pagoAprobado(cobro, r); }, alError);
  }
  var resp = {}, camino = [], actual = null, enviado = false, ref = '', previo = {}, editando = null, respaldo = null;
  var resEl = document.getElementById('ae-res'), resLista = document.getElementById('ae-res-list'), acepto = document.getElementById('ae-acepto');
  var pagarBtn = document.getElementById('ae-pagar'), resErr = document.getElementById('ae-res-err'), tituloAE = document.getElementById('ae-t');
  var sinMov = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function aePaso(id) { return AE.filter(function (x) { return x.id === id; })[0]; }
  function aplica(p) { return (!p.si || resp.tema === p.si) && (!p.parte || elegida(p.parte)) && (!p.sinParte || !elegida(p.sinParte)) && (!p.cond || p.cond()); }
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
  // Suma mensual de una ficha: los extras del año se prorratean y las tasas no se suman; las claves _p son de la pareja
  function sumar(v) { v = v || {}; var t = 0; for (var k in v) if (!/^tasa/.test(k)) t += /^anual(_p)?$/.test(k) ? v[k] / 12 : v[k]; return t; }
  function sumaPlana(v) { v = v || {}; var t = 0; for (var k in v) if (!/^tasa/.test(k)) t += v[k]; return t; }
  function sumarDe(v, pareja) { var o = {}; for (var k in v || {}) if (/_p$/.test(k) === pareja) o[k] = v[k]; return o; }
  function sumaDeuda(l, k) { return (l || []).reduce(function (t, d) { return t + (d[k] || 0); }, 0); }
  function valor(f, n) { return f.t === 'pct' ? dec(n) + ' %' : f.t === 'meses' ? dec(n) + (n === 1 ? ' mes' : ' meses') : usd(n) + (f.anual ? ' al año' : ''); }
  function lecturaPersonal() {
    var ing = sumar(resp.p5), gas = sumar(resp.p6) + sumar(resp.p7) + sumaPlana(resp.p6a) / 12;
    var bienes = filas('p12b'), prest = filas('p8');
    // Sin las partes de préstamos o de tarjetas, sus totales vienen de p8s y p5s (con la columna de la pareja)
    var tot = function (id, k) { var x = resp[id] || {}; return (x[k] || 0) + (x[k + '_p'] || 0); };
    var cuo = sumaDeuda(prest, 'cuota') + sumaDeuda(bienes.filter(pagando), 'cuota') + tot('p8s', 'cuota') + tot('p5s', 'cuotas');
    if (!ing || !gas) return '';
    var libre = ing - gas - cuo, nos = conPareja();
    var t = 'Un primer vistazo con lo que me contaste: ' + (nos ? 'entre los dos ingresan' : 'ingresas') + ' unos ' + usd(ing) + ' al mes; los gastos suman ' + usd(gas) +
      (resp.p6a && sumaPlana(resp.p6a) ? ', contando la parte mensual de los gastos del año' + (cuo ? ',' : '') : '') + (cuo ? ' y las cuotas de ' + (tot('p5s', 'cuotas') ? 'préstamos, bienes y tarjetas' : 'préstamos y bienes') + ', ' + usd(cuo) : '') + '. ';
    t += libre >= 0 ? (nos ? 'Les quedan' : 'Te quedan') + ' unos ' + usd(libre) + ' al mes, el ' + pc(libre / ing) + ' del ingreso.' : (nos ? 'Les faltan' : 'Te faltan') + ' unos ' + usd(-libre) + ' al mes, que hoy salen de deuda o de ahorros.';
    if (cuo) t += ' Las cuotas se llevan el ' + pc(cuo / ing) + ' del ingreso' + (cuo / ing > 0.4 ? ', por encima del 30 al 40 % que suele considerarse prudente.' : '.');
    var v = resp.p11 || {}, ah = (v.ahorro || 0) + (v.ahorro_p || 0);
    if (ah) { var m = ah / (gas + cuo); t += m < 1 ? ' El ahorro disponible no alcanza a cubrir un mes de gastos.' : ' El ahorro disponible cubre ' + (Math.round(m) === 1 ? 'cerca de un mes' : 'unos ' + Math.round(m) + ' meses') + ' de gastos.'; }
    if (filas('p5t').length) t += ' Las tarjetas las analizo aparte, separando el gasto del mes de la deuda.';
    // Patrimonio neto, solo si se conoce el saldo de cada bien que se está pagando
    var deben = bienes.filter(pagando);
    if (bienes.length && deben.every(function (b) { return b.saldo != null; })) {
      var pat = sumaDeuda(bienes, 'valor') + ah + (v.polizas || 0) + (v.polizas_p || 0) + (v.inversiones || 0) + (v.inversiones_p || 0)
        - sumaDeuda(deben, 'saldo') - sumaDeuda(prest, 'saldo') - sumaDeuda(filas('p5t'), 'diferido') - tot('p8s', 'saldo') - tot('p5s', 'deuda');
      t += ' ' + (nos ? 'Su' : 'Tu') + ' patrimonio neto aproximado, lo que vale lo que ' + (nos ? 'tienen' : 'tienes') + ' menos lo que ' + (nos ? 'deben' : 'debes') + ', es de ' + usd(pat) + '.';
    }
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
      var dos = p.dos && Object.keys(v).some(function (k) { return /_p$/.test(k); });
      var ls = p.ficha.filter(function (f) { return v[f.k] != null || v[f.k + '_p'] != null; }).map(function (f) {
        if (!dos) return f.l + ': ' + valor(f, v[f.k]);
        return f.l + ': ' + [v[f.k] != null ? p.dos[0].toLowerCase() + ' ' + valor(f, v[f.k]) : '', v[f.k + '_p'] != null ? p.dos[1].toLowerCase() + ' ' + valor(f, v[f.k + '_p']) : ''].filter(Boolean).join(' · ');
      });
      if (!ls.length) return 'Prefiero no responder';
      if (p.total && (ls.length > 1 || dos)) {
        var porPersona = function (x) { return p.todoAnual ? usd(sumaPlana(x)) : usd(sumar(x)); };
        ls.push(p.total + ': ' + totalFicha(p, v) + (dos ? ' (' + p.dos[0].toLowerCase() + ' ' + porPersona(sumarDe(v, false)) + ' · ' + p.dos[1].toLowerCase() + ' ' + porPersona(sumarDe(v, true)) + ')' : '') +
          (p.todoAnual ? ', unos ' + usd(sumaPlana(v) / 12) + ' al mes' : ''));
      }
      return ls.join('\n');
    }
    if (p.filas) {
      if (!v.length) return p.filas.vacio || 'Prefiero no responder';
      var fs = v.map(function (r) { return textoFila(p.filas, r); });
      if (v.length > 1 && p.filas.total) fs.push(p.filas.total.l + ': ' + usd(sumaDeuda(v, p.filas.total.k)));
      return fs.join('\n');
    }
    if (p.archivos) return v.length ? v.join(', ') : 'Sin archivos adjuntos';
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
      if (p.cobro) { burbuja('Pago aprobado: ' + dolares(pagado()) + ' USD.', 'yo'); return; }
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
    var prev = previo[p.id] || {}, dos = p.dos && conPareja();
    var c = burbuja((dos ? '<p class="f f2 f-cab"><span></span><b>' + esc(p.dos[0]) + '</b><b>' + esc(p.dos[1]) + '</b></p>' : '') +
      '<div class="f-list">' + p.ficha.map(function (f) {
        return '<label class="f' + (dos ? ' f2' : '') + '"><span class="f-l">' + esc(f.l) + (f.d ? '<small>' + esc(f.d) + '</small>' : '') + '</span>' + campo(f.k, prev[f.k], f.t, f.l + (dos ? ', ' + p.dos[0] : '')) +
          (dos ? campo(f.k + '_p', prev[f.k + '_p'], f.t, f.l + ', ' + p.dos[1]) : '') + '</label>';
      }).join('') + '</div>' +
      (p.total ? '<p class="f-tot"><span>' + esc(p.total) + '</span><b></b></p>' : '') +
      '<div class="f-acc"><button type="button" class="btn btn-brass f-ok">Continuar</button>' +
      (confirmar ? '<button type="button" class="btn btn-line f-igual">Está bien así</button>' : '') + '</div>', 'ficha', true, true);
    if (confirmar) c.querySelector('.f-igual').addEventListener('click', function () { c.remove(); responder(previo[p.id]); });
    var leer = function () {
      var v = {}; c.querySelectorAll('input[data-k]').forEach(function (i) { var n = monto(i.value); if (n != null) v[i.dataset.k] = n; }); return v;
    };
    var tot = c.querySelector('.f-tot b'), calc = function () { if (tot) tot.textContent = totalFicha(p, leer()); };
    c.addEventListener('input', calc); calc();
    c.querySelector('.f-ok').addEventListener('click', function () {
      var v = leer();
      if (p.req && !Object.keys(v).length) { errEl.textContent = 'Anota al menos un monto aproximado.'; c.querySelector('input').focus(); return; }
      c.remove(); responder(v);
    });
    enterAvanza(c);
    return c;
  }
  // Total de una ficha: mensual (los extras del año se prorratean) o, en los gastos del año, la suma anual
  function totalFicha(p, v) { return p.todoAnual ? usd(sumaPlana(v)) + ' al año' : usd(sumar(v)); }
  // Filas repetibles (bienes, préstamos, tarjetas, seguros): cada campo puede depender de lo elegido en la misma fila
  function visible(f, r) { return !f.si || (f.si.length ? f.si(r) : f.si()); }
  function leerFila(el, def) {
    var r = {};
    el.querySelectorAll('[data-k]').forEach(function (i) {
      if (i.tagName === 'SELECT') { if (i.value) r[i.dataset.k] = i.value; }
      else if (i.dataset.t === 'txt') { if (i.value.trim()) r[i.dataset.k] = i.value.trim(); }
      else { var n = monto(i.value); if (n != null) r[i.dataset.k] = n; }
    });
    def.campos.forEach(function (f) { if (!visible(f, r)) delete r[f.k]; });
    return r;
  }
  function filaConDatos(def, r) {
    return def.campos.some(function (f) { return r[f.k] != null && (!f.sel || f.sel[0] === ''); });
  }
  function htmlFila(def, r) {
    r = r || {};
    var campos = def.campos.map(function (f, i) {
      var cuerpo = f.sel ? '<select data-k="' + f.k + '" aria-label="' + esc(f.l) + '">' + f.sel.map(function (o) {
          return '<option value="' + esc(o) + '"' + (r[f.k] === o ? ' selected' : '') + '>' + esc(o || 'Elige…') + '</option>'; }).join('') + '</select>' :
        f.t === 'txt' ? '<span class="f-in txt"><input data-k="' + f.k + '" data-t="txt" autocomplete="off" value="' + esc(r[f.k] || '') + '" aria-label="' + esc(f.l) + '"></span>' :
        campo(f.k, r[f.k], f.t === 'anio' ? 'num' : f.t, f.l);
      return '<label data-c="' + f.k + '"' + (i === 0 ? ' class="r-tipo"' : '') + '><span>' + esc(f.l) + '</span>' + cuerpo + '</label>';
    });
    return '<div class="d-row r-row"><div class="d-top">' + campos[0] + '<button type="button" class="d-x" aria-label="Quitar esta fila">×</button></div><div class="d-cols r-cols">' + campos.slice(1).join('') + '</div></div>';
  }
  function ajustarFila(def, el) {
    var r = leerFila(el, def), crudo = {};
    el.querySelectorAll('select[data-k]').forEach(function (s) { crudo[s.dataset.k] = s.value; });
    def.campos.forEach(function (f) { var l = el.querySelector('[data-c="' + f.k + '"]'); if (l) l.hidden = !visible(f, Object.assign({}, crudo, r)); });
  }
  function listaFilas(p, confirmar) {
    var def = p.filas, prev = previo[p.id];
    var c = burbuja('<div class="d-list">' + (prev && prev.length ? prev : [{}]).map(function (r) { return htmlFila(def, r); }).join('') + '</div>' +
      '<button type="button" class="back d-add">' + esc(def.add) + '</button>' +
      (def.total ? '<p class="f-tot"><span>' + esc(def.total.l) + '</span><b></b></p>' : '') +
      '<div class="f-acc"><button type="button" class="btn btn-brass f-ok">Continuar</button>' +
      (confirmar ? '<button type="button" class="btn btn-line f-igual">Está bien así</button>' : def.vacio ? '<button type="button" class="btn btn-line d-no">' + esc(def.vacio) + '</button>' : '') + '</div>', 'ficha', true, true);
    var lista = c.querySelector('.d-list'), tot = c.querySelector('.f-tot b');
    var leer = function () {
      return Array.prototype.map.call(lista.querySelectorAll('.r-row'), function (el) { return leerFila(el, def); })
        .filter(function (r) { return filaConDatos(def, r); });
    };
    var calc = function () {
      lista.querySelectorAll('.r-row').forEach(function (el) { ajustarFila(def, el); });
      if (tot) tot.textContent = usd(sumaDeuda(leer(), def.total.k));
    };
    c.addEventListener('input', calc); c.addEventListener('change', calc); calc();
    c.addEventListener('click', function (e) {
      var r;
      if (e.target.closest('.d-add')) { lista.insertAdjacentHTML('beforeend', htmlFila(def)); calc(); lista.lastElementChild.querySelector('select, input').focus(); }
      else if ((r = e.target.closest('.d-x'))) {
        r = r.closest('.r-row');
        if (lista.children.length > 1) r.remove(); else r.outerHTML = htmlFila(def);
        calc();
      }
      else if (e.target.closest('.d-no')) { c.remove(); responder([]); }
      else if (e.target.closest('.f-igual')) { c.remove(); responder(previo[p.id]); }
      else if (e.target.closest('.f-ok')) {
        var v = leer();
        if (!v.length) { errEl.textContent = def.vacio ? 'Anota al menos una fila, o elige «' + def.vacio + '».' : 'Anota al menos una fila.'; return; }
        var falta = v.some(function (x) { return def.campos.some(function (f) { return f.req && visible(f, x) && x[f.k] == null; }); });
        if (falta) { errEl.textContent = def.error || 'Completa los datos indispensables de cada fila.'; return; }
        c.remove(); responder(v);
      }
    });
    enterAvanza(c);
    return c;
  }
  function textoFila(def, r) {
    var tipo = def.campos[0].sel ? r[def.campos[0].k] : '';
    var partes = def.campos.slice(tipo ? 1 : 0).filter(function (f) { return r[f.k] != null && visible(f, r) && f.enTexto !== false; }).map(function (f) {
      var x = r[f.k];
      return f.sel || f.t === 'txt' ? f.l + ': ' + x : f.l + ': ' + (f.t === 'pct' ? dec(x) + ' %' : f.t === 'meses' ? dec(x) + (x === 1 ? ' mes' : ' meses') : f.t === 'anio' ? x : usd(x)) +
        (f.unidad && r[f.unidad] ? ' ' + r[f.unidad].toLowerCase() : '');
    });
    return (tipo ? tipo + (partes.length ? ' · ' : '') : '') + partes.join(' · ');
  }
  // Adjuntos: se guardan en memoria y se suben solo al enviar; las fotos grandes se reducen antes
  var adjuntos = [], MAX_ARCH = 5, MAX_MB = 5;
  function reducir(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.5e6 || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (img) {
      var k = Math.min(1, 2000 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      return new Promise(function (ok) { cv.toBlob(function (b) { ok(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file); }, 'image/jpeg', 0.82); });
    }).catch(function () { return file; });
  }
  function archivos(p, confirmar) {
    var c = burbuja('<ul class="a-list"></ul><label class="btn btn-line a-pick">Elegir archivos<input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.heic,.xls,.xlsx,.csv,application/pdf,image/*" hidden></label>' +
      '<div class="f-acc"><button type="button" class="btn btn-brass f-ok">Continuar</button><button type="button" class="btn btn-line d-no">No tengo nada que adjuntar</button></div>', 'ficha', true, true);
    var ul = c.querySelector('.a-list'), input = c.querySelector('input[type=file]');
    var pintarA = function () {
      ul.innerHTML = adjuntos.map(function (a, i) { return '<li><span>' + esc(a.name) + '</span><small>' + (a.size / 1e6).toFixed(1) + ' MB</small><button type="button" class="d-x" data-i="' + i + '" aria-label="Quitar ' + esc(a.name) + '">×</button></li>'; }).join('');
      c.querySelector('.a-pick').hidden = adjuntos.length >= MAX_ARCH;
    };
    pintarA();
    input.addEventListener('change', function () {
      var nuevos = Array.prototype.slice.call(input.files, 0, MAX_ARCH - adjuntos.length); input.value = '';
      errEl.textContent = input.files && input.files.length > nuevos.length ? 'Puedes adjuntar hasta ' + MAX_ARCH + ' archivos.' : '';
      Promise.all(nuevos.map(reducir)).then(function (fs) {
        fs.forEach(function (f) {
          if (f.size > MAX_MB * 1e6) errEl.textContent = '«' + f.name + '» pesa más de ' + MAX_MB + ' MB. Si es una foto, prueba con una captura de pantalla; si es un PDF, envía solo las páginas necesarias.';
          else adjuntos.push(f);
        });
        pintarA();
      });
    });
    c.addEventListener('click', function (e) {
      var b = e.target.closest('.d-x');
      if (b) { adjuntos.splice(+b.dataset.i, 1); pintarA(); }
      else if (e.target.closest('.d-no')) { adjuntos = []; c.remove(); responder([]); }
      else if (e.target.closest('.f-ok')) { c.remove(); responder(adjuntos.map(function (a) { return a.name; })); }
    });
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
    var c = p.ficha ? ficha(p, confirmar) : p.filas ? listaFilas(p, confirmar) : p.archivos ? archivos(p, confirmar) : deudas(p, confirmar);
    skipBtn.hidden = !p.opcional || confirmar;
    dudaBtn.hidden = !IA.url || !!p.archivos;
    log.scrollTop += ancla.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
    if (dlg.open && window.matchMedia('(hover: hover)').matches) c.querySelector('input, select').focus({ preventScroll: true });
  }
  // Barra de progreso con la sección: «Paso 3 de 9 · Gastos»
  var SEC = {};
  [['Tu consulta', 'tema partes'], ['Datos y pago', 'datos factura fdatos pago'],
    ['Lo que buscas', 'p1 p0 p0b'], ['Tu hogar', 'p2 p3 p2c p2p p3p p4'], ['Ingresos', 'p5'], ['Gastos', 'p6 p7 p6a'], ['Bienes', 'p12 p12b'],
    ['Préstamos y tarjetas', 'p8s p8 p5s p5b p5t p5u p5c p5g p5f p5fm p5d p10'], ['Ahorros e inversiones', 'p11 p11b'], ['Protección', 'p13i p13ip p13s p13x'],
    ['Hábitos y metas', 'p14 p14p p15 p15b'], ['Tu plan', 'pinv pcom'],
    ['Tu empresa', 'e1 e2'], ['Resultados', 'e3 e4'], ['Capital de trabajo', 'e5 e6 e7'], ['Deudas', 'e8s e8'], ['Caja y obligaciones', 'e9 e10 e11'], ['Lo que buscas', 'e12 e13'],
    ['La inversión', 'i1 i2 i3 i4'], ['Tu perfil', 'i5 i6 i7 i8 i9 i10'], ['Tu situación', 'i11'], ['Alternativas', 'i12'],
    ['Para terminar', 'extra mas adj']
  ].forEach(function (x) { x[1].split(' ').forEach(function (id) { SEC[id] = x[0]; }); });
  function seccion(id) { return SEC[id] || (/^o/.test(id) ? 'Tu decisión' : 'Tu caso'); }
  function progreso(p) {
    var lista = AE.filter(function (x) { return !x.nota && aplica(x); }), secs = [];
    lista.forEach(function (x) { var n = seccion(x.id); if (secs.indexOf(n) < 0) secs.push(n); });
    document.getElementById('ae-bar').style.width = Math.round(100 * camino.length / (AE.filter(aplica).length + 1)) + '%';
    var el = document.getElementById('ae-paso'); if (!el) return;
    el.textContent = !p ? (resp.pago ? 'Resumen y envío' : '') : !resp.tema ? seccion(p.id) :
      'Paso ' + (secs.indexOf(seccion(p.id)) + 1) + ' de ' + secs.length + ' · ' + seccion(p.id);
  }
  // Después del pago no se vuelve atrás con «Corregir la anterior» más allá del pago ni de las partes sumadas al final
  function bloqueado() {
    var ultimo = camino.filter(function (id) { return !aePaso(id).nota; }).pop();
    return ultimo === 'pago' || ultimo === 'extra';
  }
  function preguntar(conPausa) {
    if (editando && editando in resp) depurar();
    guardarCurso();
    actual = siguiente(); errEl.textContent = '';
    progreso(actual && !actual.nota && !actual.cobro ? actual : null);
    backBtn.hidden = !camino.length || enviado || (editando && editando in resp) || (!editando && bloqueado());
    backBtn.textContent = editando ? '↶ Volver al resumen' : '↶ Corregir la anterior';
    chipsEl.innerHTML = ''; camposEl.hidden = true; row.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    if (!actual) return cierre();
    var p = actual;
    if (p.cobro) {
      // Antes de las preguntas del caso: resumen de lo elegido, condiciones y pago
      actual = null; backBtn.hidden = true;
      if (!ref) ref = 'AE-' + Date.now().toString(36).toUpperCase().slice(-6);
      if (editando) { editando = null; respaldo = null; return mostrarResumen(); }
      burbuja('Gracias, ' + resp.datos.nombre.split(' ')[0] + '. Antes de entrar en tu caso, revisa lo que elegiste, acepta las condiciones y paga; luego seguimos con tus preguntas.', 'yo', true);
      return setTimeout(mostrarResumen, sinMov ? 0 : 900);
    }
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
      if (p.ficha || p.deudas || p.filas || p.archivos) return mostrarFicha(p, qb, false);
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
    if (p.id === 'extra') return cobrarExtra(v);
    if (revisada[p.id] && !aclar[p.id]) {
      aclar[p.id] = [{ pregunta: revisada[p.id], respuesta: JSON.stringify(v) === JSON.stringify(previo[p.id]) ? 'Confirmó las cifras.' : 'Ajustó las cifras.' }];
      return preguntar(true);
    }
    if (IA.url && !p.op && !p.campos && !p.archivos && p.id !== 'fdatos' && !(v === '' || (p.ficha && !Object.keys(v).length) || (p.filas && !v.length))) return revisar(p);
    preguntar(true);
  }
  function contexto(hasta) {
    var t = camino.filter(function (id) { return id !== hasta && !aePaso(id).nota; })
      .map(function (id) { var p = aePaso(id); return p.q + '\n' + textoResp(p, resp[id]); }).join('\n\n');
    return t.slice(-8000);
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
    // Las preguntas con «conversa» son una conversación guiada: la IA pregunta lo que falte y cierra con un resumen que el cliente confirma.
    // El tope de 15 es solo un resguardo técnico; la IA termina cuando el objetivo está cumplido.
    var conversa = p.conversa || '';
    pedirIA({ modo: conversa ? 'conversar' : 'revisar', tema: resp.tema, pregunta: p.q, proposito: p.para || '', objetivo: conversa, respuesta: textoResp(p, resp[p.id]), aclaraciones: lista, contexto: contexto(p.id) })
      .then(function (r) {
        espera.remove();
        if (camino[camino.length - 1] !== p.id || enviado) return;   // el cliente corrigió mientras tanto
        if (r.accion === 'seguir' || !r.mensaje || lista.length >= (conversa ? 15 : 2)) return preguntar(false);
        if (r.accion === 'resumir') {
          burbuja(r.mensaje, 'yo', true);
          pendiente = { id: p.id, q: r.mensaje, resumen: true };
          return abrirTexto('Escribe «sí» si está correcto, o corrige lo que haga falta…', false);
        }
        if (p.ficha || p.deudas || p.filas) {
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
    if (pe.resumen && /^(s[ií]|correcto|exacto|as[ií] es|ok|de acuerdo|perfecto)(?=$|[\s,.;!])/i.test(a.trim())) return preguntar(true);
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
      if (!p.op && !p.ficha && !p.deudas && !p.filas && !p.archivos) abrirTexto(p.ph || 'Escribe tu respuesta…', p.opcional);
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
    if (editando) { editando = null; respaldo = null; return mostrarResumen(); }
    burbuja('Gracias, ' + resp.datos.nombre.split(' ')[0] + '. Revisa el resumen de tus respuestas y envíamelas.', 'yo', true);
    setTimeout(mostrarResumen, sinMov ? 0 : 900);
  }
  // Tras corregir un dato: quita respuestas que ya no aplican y recalcula los primeros vistazos
  function depurar() {
    AE.forEach(function (p) {
      if (p.id in resp && !aplica(p)) { previo[p.id] = resp[p.id]; delete resp[p.id]; delete aclar[p.id]; delete revisada[p.id]; }
    });
    // Si ya no se analiza con la pareja, se quitan sus cifras y el «de quién» de cada fila
    if (!conPareja()) AE.forEach(function (p) {
      if (p.dos && resp[p.id]) Object.keys(resp[p.id]).forEach(function (k) { if (/_p$/.test(k)) delete resp[p.id][k]; });
      if (p.filas && Array.isArray(resp[p.id])) resp[p.id].forEach(function (r) { delete r.quien; });
    });
    AE.forEach(function (p) { if (p.nota && p.id in resp) resp[p.id] = p.nota(); });
    camino = camino.filter(function (id) { return id in resp; });
  }
  function enOrden() { return AE.map(function (p) { return p.id; }).filter(function (id) { return id in resp; }); }
  // Precio: $35 de base más $5 por cada parte elegida, antes de IVA
  function tiene(id, v) { return Array.isArray(resp[id]) && resp[id].indexOf(v) > -1; }
  function dolares(n) { return '$' + n.toFixed(2); }
  function conIVA(n) { return Math.round(n * (1 + IVA) * 100) / 100; }
  function precio() { var neto = BASE + PARTE * elegidas().length; return { neto: neto, total: conIVA(neto) }; }
  function pagado() { return Math.round(cobros.reduce(function (t, c) { return t + c.monto; }, 0) * 100) / 100; }
  function minus(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function lista(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1]; }
  function fechaEC() { return new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'long', timeStyle: 'short' }); }
  function pintarPrecio() {
    var c = catalogo(), pr = precio(), el = elegidas();
    document.getElementById('ae-mods').innerHTML = '<li><label><input type="checkbox" checked disabled><span>' + esc(c.base) + '</span><b>$' + BASE + '</b></label></li>' +
      c.partes.map(function (x) {
        return '<li><label><input type="checkbox" data-mod="' + x.k + '"' + (elegida(x.k) ? ' checked' : '') + '><span>' + esc(x.l) + '</span><b>+ $' + PARTE + '</b></label></li>';
      }).join('');
    document.getElementById('ae-sub').textContent = '$' + pr.neto + ' + IVA (15 %)';
    // Por qué cuesta lo que cuesta: la suma a la vista, junto al botón de pagar
    document.getElementById('ae-porque').innerHTML = el.length ?
      'Base $' + BASE + el.map(function (x) { return ' + $' + PARTE + ' por ' + esc(minus(x.l)); }).join('') + ' = $' + pr.neto + ' + IVA.' :
      'Precio base del análisis. <a href="#ae-mods" data-ir-mods>¿Quieres sumar alguna parte?</a>';
    document.getElementById('ae-total').textContent = dolares(pr.total) + ' USD';
  }
  document.getElementById('ae-res').addEventListener('click', function (e) {
    if (!e.target.closest('[data-ir-mods]')) return;
    e.preventDefault(); document.querySelector('.res-mods').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // Antes de pagar, el cliente puede sumar o quitar partes en el resumen
  document.getElementById('ae-mods').addEventListener('change', function (e) {
    var i = e.target.closest('[data-mod]'); if (!i || resp.pago) return;
    var x = catalogo().partes.filter(function (y) { return y.k === i.dataset.mod; })[0];
    var marcadas = catalogo().partes.filter(function (y) { return y === x ? i.checked : elegida(y.k); }).map(etiqueta);
    resp.partes = previo.partes = marcadas.length ? marcadas : [SOLO_BASE];
    pintarPrecio();
  });
  // Resumen en dos momentos: antes del pago (lo elegido, condiciones y consentimiento) y al final (todas las respuestas, para enviarlas)
  var CERRADOS = ['tema', 'partes', 'pago', 'extra'];
  function mostrarResumen() {
    camino = enOrden();
    var cobro = !resp.pago;
    resLista.innerHTML = camino.filter(function (id) { return !aePaso(id).nota && !(cobro && id === 'partes'); }).map(function (id) {
      var p = aePaso(id), fijo = !cobro && CERRADOS.indexOf(id) > -1;
      var extra = (aclar[id] || []).filter(function (a) { return !/^(Confirmó|Ajustó) las cifras\.$/.test(a.respuesta); })
        .map(function (a) { return '<i>Aclaraste: ' + esc(a.respuesta) + '</i>'; }).join('');
      var r = id === 'pago' ? dolares(pagado()) + ' USD, aprobado' : textoResp(p, resp[id]);
      return '<li><span class="res-q">' + esc(RES[id] || p.q) + '</span><span class="res-a">' + esc(r) + extra + '</span>' +
        (fijo ? '' : '<button type="button" class="back res-edit" data-id="' + id + '">Corregir</button>') + '</li>';
    }).join('');
    document.getElementById('ae-res-intro').textContent = cobro ? 'Revisa lo que elegiste. Si algo no está bien, pulsa «Corregir» junto a ese dato.' :
      'Este es el resumen de lo que ingresaste. Si algo no está bien, pulsa «Corregir» junto a ese dato.';
    document.querySelector('.res-mods').hidden = !cobro;
    document.querySelector('.res-legal').hidden = !cobro;
    document.querySelector('.res-aviso').hidden = cobro;
    document.getElementById('ae-acepto-t').textContent = cobro ? 'Acepto las condiciones y doy mi consentimiento expreso para que trate mis datos como se indica en ellas.' :
      'Revisé mis respuestas y confirmo que son correctas.';
    if (cobro) pintarPrecio();
    else {
      document.getElementById('ae-sub').textContent = 'Pagado';
      document.getElementById('ae-total').textContent = dolares(pagado()) + ' USD';
      document.getElementById('ae-porque').innerHTML = '';
    }
    acepto.checked = false; pagarBtn.disabled = true; resErr.textContent = '';
    pagarBtn.textContent = cobro ? 'Continuar al pago' : 'Enviar mis respuestas';
    document.getElementById('ae-res-nota').textContent = cobro ? (pasarela() ? pasarela().nota : '') : BORRADO;
    tituloAE.textContent = cobro ? 'Confirma y paga' : 'Revisa tus respuestas';
    log.hidden = true; inForm.hidden = true; ppEl.hidden = true; resEl.hidden = false;
    resEl.classList.remove('entra'); void resEl.offsetWidth; resEl.classList.add('entra');
    document.getElementById('ae-res-body').scrollTop = 0;
    if (dlg.open) document.getElementById('ae-res-body').focus({ preventScroll: true });
  }
  function cerrarResumen() {
    resEl.hidden = true; ppEl.hidden = true; log.hidden = false; inForm.hidden = false; tituloAE.textContent = 'Cuéntame tu caso';
  }
  function corregir(id) {
    cerrarResumen();
    editando = id; pendiente = null; modoDuda = false;
    respaldo = { v: resp[id], aclar: aclar[id], revisada: revisada[id], partes: resp.partes };
    previo[id] = resp[id]; delete resp[id]; delete aclar[id]; delete revisada[id];
    if (id === 'tema') { previo.partes = resp.partes; delete resp.partes; }   // las partes dependen del tema
    camino = camino.filter(function (x) { return x !== id && x in resp; });
    burbuja(id === 'tema' ? 'Si cambias el tema, te mostraré las partes que corresponden a ese tema.' : 'Corrijamos ese dato.', 'yo', true);
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
    if (respaldo.partes && !resp.partes) resp.partes = respaldo.partes;
    editando = null; respaldo = null; actual = null; pendiente = null; modoDuda = false;
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true; errEl.textContent = '';
    mostrarResumen();
  }
  resLista.addEventListener('click', function (e) { var b = e.target.closest('.res-edit'); if (b) corregir(b.dataset.id); });
  acepto.addEventListener('change', function () { pagarBtn.disabled = !acepto.checked; if (acepto.checked) resErr.textContent = ''; });
  pagarBtn.addEventListener('click', function () {
    if (!acepto.checked) { resErr.textContent = resp.pago ? 'Marca la casilla para confirmar tus respuestas.' : 'Marca la casilla para aceptar las condiciones.'; return; }
    if (resp.pago) enviarRespuestas(); else mostrarPago();
  });
  // Lo que se guarda en Jotform: la transcripción completa, el alcance pagado y los datos de contacto
  function alcance() {
    var c = catalogo();
    return 'Alcance del análisis\n✓ ' + c.base + ' ($' + BASE + ')\n' + c.partes.map(function (x) {
      return elegida(x.k) ? '✓ ' + x.l + ' ($' + PARTE + (compradas.indexOf(x.k) > -1 ? ', sumada al final' : '') + ')' : '✗ No eligió: ' + x.l;
    }).join('\n') + '\nPagado: ' + dolares(pagado()) + ' con IVA' +
      (aceptado ? '\n\nAceptó las condiciones (' + CONDICIONES + ') y dio su consentimiento expreso el ' + aceptado + ', hora de Ecuador, antes de pagar.' : '');
  }
  function paquete() {
    camino = enOrden();
    var lineas = camino.filter(function (id) { return ['partes', 'pago', 'extra', 'datos', 'factura', 'fdatos'].indexOf(id) < 0 && (!aePaso(id).nota || resp[id]); })
      .map(function (id) {
        var p = aePaso(id);
        if (p.nota) return 'Primer vistazo calculado en la web\n→ ' + resp[id];
        if (p.archivos) return 'Archivos adjuntos\n→ ' + textoResp(p, resp[id]);
        return p.q + '\n→ ' + textoResp(p, resp[id]).replace(/\n/g, '\n→ ') +
          (aclar[id] || []).map(function (a) { return '\n  Asistente: ' + a.pregunta + '\n  → ' + a.respuesta; }).join('');
      }).join('\n\n') +
      (dudas.length ? '\n\nDudas que planteó\n' + dudas.map(function (d) { return '· ' + d.duda + ' (en «' + d.pregunta + '»)\n  Asistente: ' + d.respuesta; }).join('\n') : '') +
      '\n\n' + alcance() + '\nRevisó y confirmó sus respuestas el ' + fechaEC() + ', hora de Ecuador.';
    return { referencia: ref, tema: resp.tema, respuestas: lineas, nombre: resp.datos.nombre, email: resp.datos.email,
      whatsapp: resp.datos.whatsapp, factura: resp.factura + (resp.fdatos ? ' · ' + resp.fdatos : ''),
      pago: cobros.map(function (c) { return c.texto; }).join(' | '), importe: dolares(pagado()) };
  }
  // Constancia de cada pago en Jotform, con la misma referencia, por si el cliente no llega a enviar sus respuestas
  function registrarPago(titulo, r) {
    if (PRUEBA) return;
    enviar(FORMS.analisis, { referencia: ref, tema: resp.tema, nombre: resp.datos.nombre, email: resp.datos.email, whatsapp: resp.datos.whatsapp,
      factura: resp.factura + (resp.fdatos ? ' · ' + resp.fdatos : ''), pago: r.texto,
      respuestas: titulo + '. El cliente sigue respondiendo el cuestionario; sus respuestas llegan en otro envío con la misma referencia.\n\n' + alcance() }).catch(function () {});
  }
  // Pago al inicio: el monto sale de las partes elegidas y las preguntas del caso empiezan cuando la pasarela confirma el pago completo
  var ppEl = document.getElementById('ae-pp'), ppErr = document.getElementById('ae-pp-err');
  function mostrarPago() {
    var pr = precio(), p = pasarela();
    aceptado = fechaEC();
    document.getElementById('ae-pp-total').textContent = dolares(pr.total) + ' USD';
    document.getElementById('ae-pp-ayuda').textContent = p ? p.ayuda : '';
    ppErr.textContent = ''; document.getElementById('ae-pp-volver').hidden = false;
    tituloAE.textContent = 'Paga tu Consulta Express';
    log.hidden = true; inForm.hidden = true; resEl.hidden = true; ppEl.hidden = false;
    ppEl.classList.remove('entra'); void ppEl.offsetWidth; ppEl.classList.add('entra');
    document.getElementById('ae-pp-body').scrollTop = 0;
    cobrar(document.getElementById('ae-pp-btns'), pr.total, 'Consulta Express ' + ref, ref, 'inicial', elegidas().map(function (x) { return x.k; }),
      function (msg) { ppErr.textContent = msg; });
  }
  // Pago confirmado por la pasarela: se registra y el recorrido sigue donde corresponde
  function pagoAprobado(cobro, r) {
    cobros.push({ monto: r.monto, texto: r.texto, partes: cobro.datos });
    if (cobro.tipo === 'inicial') {
      resp.pago = r.texto; if (camino.indexOf('pago') < 0) camino.push('pago');
      registrarPago('Pago inicial', r);
      cerrarResumen();
      burbuja('Listo: recibí tu pago de ' + dolares(r.monto) + ' USD. Ahora sí, vamos a tu caso. Si tienes que cerrar esta página, al volver a abrirla en este mismo navegador retomas donde quedaste.', 'yo', true);
    } else {
      var nombres = catalogo().partes.filter(function (x) { return cobro.datos.indexOf(x.k) > -1; }).map(function (x) { return minus(x.l); });
      cobro.datos.forEach(function (k) { if (compradas.indexOf(k) < 0) compradas.push(k); });
      registrarPago('Pago adicional por ' + lista(nombres), r);
      var b = log.querySelector('.pp-msg'); if (b) b.remove();
      burbuja('Listo: recibí tu pago de ' + dolares(r.monto) + ' USD. Sigamos con ' + lista(nombres) + '.', 'yo', true);
      depurar();
    }
    preguntar(true);
  }
  document.getElementById('ae-pp-volver').addEventListener('click', mostrarResumen);
  // Al final se ofrecen las partes que no eligió; si suma alguna, paga la diferencia aquí mismo y siguen sus preguntas
  function cobrarExtra(v) {
    var nuevas = pendientes().filter(function (x) { return v.indexOf(x.l) > -1; });
    if (!nuevas.length) return preguntar(true);
    backBtn.hidden = true;
    var total = conIVA(PARTE * nuevas.length), nombres = nuevas.map(function (x) { return minus(x.l); });
    var b = burbuja('Son ' + dolares(total) + ' USD con IVA por ' + esc(lista(nombres)) + '. Cuando se apruebe el pago, te hago sus preguntas.' +
      '<div class="pp-btns"></div><span class="ae-err" role="status"></span><button type="button" class="back">Mejor no, sigamos así</button>', 'yo pp-msg', true, true);
    var err = b.querySelector('.ae-err');
    log.scrollTop = log.scrollHeight;
    b.querySelector('.back').addEventListener('click', function () {
      b.remove(); resp.extra = [NO_EXTRA]; burbuja(NO_EXTRA, 'tu', true); preguntar(true);
    });
    cobrar(b.querySelector('.pp-btns'), total, 'Consulta Express ' + ref + ' · partes adicionales', ref + '-' + (cobros.length + 1), 'extra',
      nuevas.map(function (x) { return x.k; }), function (msg) { err.textContent = msg; });
  }
  function terminado() {
    enviado = true; borrarCurso(); backBtn.hidden = true; cerrarResumen();
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    document.getElementById('ae-bar').style.width = '100%'; document.getElementById('ae-paso').textContent = 'Enviado';
  }
  function enviarRespuestas() {
    var datos = paquete();
    if (PRUEBA) return mostrarPrueba(datos);
    pagarBtn.disabled = true; pagarBtn.textContent = 'Enviando…'; resErr.textContent = '';
    enviar(FORMS.analisis, datos, adjuntos).then(function () {
      terminado();
      burbuja('Listo: recibí tus respuestas con la referencia ' + ref + '. Te envío el informe a ' + resp.datos.email + ' en un máximo de tres días hábiles. ' + BORRADO, 'yo', true);
    }).catch(function () {
      pagarBtn.disabled = false; pagarBtn.textContent = 'Enviar mis respuestas';
      resErr.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo; tu pago no se pierde.';
    });
  }
  // Versión de prueba (la página la activa con window.AE_PRUEBA): no cobra ni envía nada; muestra lo que llegaría a Jotform
  function mostrarPrueba(datos) {
    terminado();
    burbuja('Versión de prueba: no se cobra ni se envía nada. Esto es lo que me llegaría, con ' + datos.importe + ' pagados:', 'yo', true);
    var d = burbuja(datos.respuestas + '\n\nPago: ' + datos.pago + (adjuntos.length ? '\n\nArchivos adjuntos: ' + adjuntos.map(function (a) { return a.name + ' (' + (a.size / 1e6).toFixed(1) + ' MB)'; }).join(', ') : ''), 'yo prueba', true);
    log.scrollTop = d.offsetTop - 12;
  }
  // Cuestionario en curso, ya pagado: se guarda en este navegador para retomarlo si la página se cierra (los archivos se vuelven a elegir).
  // También se guarda justo antes de salir a una pasarela que lleva a otra página, con el cobro pendiente, para confirmarlo al volver.
  var CURSO = 'ae-curso', porConfirmar = null;
  function guardarCurso(cobro) {
    if ((!resp.pago && !cobro) || enviado || PRUEBA) return;
    try { localStorage.setItem(CURSO, JSON.stringify({ resp: resp, aclar: aclar, dudas: dudas, revisada: revisada, ref: ref, cobros: cobros, compradas: compradas, aceptado: aceptado, camino: camino, cobro: cobro || null, t: Date.now() })); } catch (e) {}
  }
  function borrarCurso() { try { localStorage.removeItem(CURSO); } catch (e) {} }
  function leerCurso() {
    var g = null; try { g = JSON.parse(localStorage.getItem(CURSO)); } catch (e) {}
    if (g && (!g.resp || !(g.resp.pago || g.cobro) || !(Date.now() - g.t < 7 * 864e5))) { borrarCurso(); g = null; }
    return g;
  }
  function retomar() {
    var g = PRUEBA ? null : leerCurso(); if (!g) return false;
    resp = g.resp; aclar = g.aclar || {}; dudas = g.dudas || []; revisada = g.revisada || {}; ref = g.ref || '';
    cobros = g.cobros || []; compradas = g.compradas || []; aceptado = g.aceptado || ''; porConfirmar = g.cobro || null;
    previo = {}; enviado = false; editando = null; pendiente = null; modoDuda = false;
    if (Array.isArray(resp.adj) && resp.adj.length) delete resp.adj;
    camino = (g.camino || []).filter(function (id) { return id in resp; });
    return true;
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
    if (!actual || actual.op || actual.ficha || actual.deudas || actual.filas || actual.archivos) return;
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
    responder(actual.ficha ? {} : actual.filas || actual.archivos ? [] : '');
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
    if (enviado) { compradas = []; cobros = []; aceptado = ''; adjuntos = []; resp = {}; camino = []; previo = {}; aclar = {}; dudas = []; revisada = {}; pendiente = null; modoDuda = false; ref = ''; enviado = false; editando = null; log.innerHTML = ''; cerrarResumen(); }
    dlg.showModal(); document.documentElement.style.overflow = 'hidden';
    if (!log.children.length) {
      var sigue = retomar();
      pintar();
      if (porConfirmar) return confirmarAlVolver();
      if (sigue) burbuja('Retomemos donde quedaste. Tu pago ya está registrado.', 'yo', true);
      preguntar(true);
    }
  }
  // De vuelta de una pasarela que llevó al cliente a otra página: ella confirma el pago y el recorrido sigue, o se vuelve a ofrecer el pago
  function confirmarAlVolver() {
    var cobro = porConfirmar, p = pasarela(); porConfirmar = null;
    var espera = burbuja('Estoy confirmando tu pago…', 'yo', true);
    var mal = function (msg) {
      espera.remove(); if (resp.pago) guardarCurso(); else borrarCurso();
      burbuja((msg || 'El pago no se completó.') + ' Puedes intentarlo de nuevo.', 'yo', true);
      if (cobro.tipo === 'extra') cobrarExtra(resp.extra || []); else preguntar(true);
    };
    if (!p || !p.vuelta) return mal('No pude confirmar tu pago.');
    p.vuelta(cobro, function (r) { espera.remove(); pagoAprobado(cobro, r); }, mal);
  }
  dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.getElementById('ae-x').addEventListener('click', function () { dlg.close(); });
  document.querySelectorAll('[data-ae]').forEach(function (b) { b.addEventListener('click', abrir); });
  if (location.hash === '#empezar' || location.hash === '#analisis-expres') abrir();
  // Si quedó un cuestionario pagado a medias en este navegador, se abre solo para retomarlo
  servicios.then(function () { if (!dlg.open && !PRUEBA && leerCurso()) abrir(); });
  })();

  /* ---------- Carrete de temas en Docencia: flechas ---------- */
  (function () {
    var car = document.getElementById('vcar'); if (!car) return;
    function mover(dir) { car.scrollBy({ left: dir * Math.max(car.clientWidth * 0.8, 240), behavior: 'smooth' }); }
    document.getElementById('vcar-ant').addEventListener('click', function () { mover(-1); });
    document.getElementById('vcar-sig').addEventListener('click', function () { mover(1); });
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
