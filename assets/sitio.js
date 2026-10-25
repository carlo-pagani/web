(function () {
  // Masterclass: la venta del sábado 14 de noviembre cierra el jueves 12 al terminar el día (hora de Ecuador); desde el 13,
  // la web ofrece la del sábado 19 de diciembre y avisa que los cupos del 14 se cerraron. sitio.js y pestana.js lo hacen una sola vez.
  (function () {
    if (window.MC_FECHA) return;
    var ahora = Date.now();
    var nueva = ahora >= Date.parse('2026-11-13T00:00:00-05:00');
    // La del 19 de diciembre cierra el jueves 17 al terminar el día; desde el 18 la web anuncia que la próxima fecha está por anunciarse.
    var cerrada = ahora >= Date.parse('2026-12-18T00:00:00-05:00');
    window.MC_FECHA = nueva ? { iso: '2026-12-19', texto: '19 de diciembre', cerrada: cerrada } : { iso: '2026-11-14', texto: '14 de noviembre' };
    if (!nueva) return;
    var cambia = cerrada
      ? function (t) { return t.replace(/[Ss]ábado 14 de noviembre, en línea: ordena tus finanzas personales conmigo\./, 'Masterclass de finanzas personales: próxima fecha por anunciar.').replace(/Sábado 14 de noviembre/g, 'Próxima fecha por anunciar').replace(/(sábado )?14 de noviembre/g, 'próxima fecha por anunciar'); }
      : function (t) { return t.replace(/14 de noviembre/g, '19 de diciembre'); };
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (n.nodeValue.indexOf('14 de noviembre') > -1) n.nodeValue = cambia(n.nodeValue);
    Array.prototype.forEach.call(document.querySelectorAll('[data-pest]'), function (e) { e.setAttribute('data-pest', cambia(e.getAttribute('data-pest'))); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-faltan="2026-11-14"]'), function (e) { if (cerrada) e.removeAttribute('data-faltan'), e.hidden = true; else e.setAttribute('data-faltan', '2026-12-19'); });
    Array.prototype.forEach.call(document.querySelectorAll('.mc-datos'), function (u) {
      Array.prototype.forEach.call(u.children, function (li) { if (cerrada && /^\s*(Solo 30 cupos|\$15 · IVA incluido)\s*$/.test(li.textContent)) li.hidden = true; });
      var li = document.createElement('li'); li.textContent = cerrada ? 'Cupos del 19 de diciembre cerrados' : 'Cupos del 14 de noviembre cerrados'; u.insertBefore(li, u.firstChild);
    });
    if (cerrada) Array.prototype.forEach.call(document.querySelectorAll('a[href$="#masterclass"] span, a[href$="#masterclass"] em'), function (e) {
      e.textContent = e.textContent.replace(/ · \$15, IVA incluido| · \$15/, '');
    });
    if (cerrada) Array.prototype.forEach.call(document.querySelectorAll('#mform'), function (f) {
      Array.prototype.forEach.call(f.children, function (c) { c.hidden = true; });
      var q = document.createElement('p'); q.className = 'q'; q.textContent = 'Próxima fecha por anunciar';
      var s = document.createElement('p'); s.textContent = 'Los cupos del 19 de diciembre se cerraron. La próxima fecha se anuncia aquí mismo.';
      f.insertBefore(s, f.firstChild); f.insertBefore(q, s);
    });
  })();
  var NS = 'http://www.w3.org/2000/svg';
  var CANAL = 'https://www.youtube.com/channel/UCgNAS6dyYXn8vcLnmSci03A';
  var fmt0 = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 0 });
  var fmtC = new Intl.NumberFormat('es', { notation: 'compact', maximumFractionDigits: 1 });
  var fmt1 = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
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
    var m = modo(), monto = Math.max(num('monto'), 0), A = Math.max(num('aporte'), 0), r = Math.min(Math.max(num('retorno'), -90), 100) / 100;
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
      : !last.ap ? 'Escribe cuánto inviertes hoy o cuánto sumas cada mes.'
      : interes === 0 ? 'Sin rendimiento, al final tienes exactamente lo que aportaste.'
      : infl && r >= 0 ? 'Con este rendimiento tu dinero pierde poder de compra frente a la inflación.'
      : 'Con un rendimiento negativo terminas con menos de lo que aportaste.';
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
      txt('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, (v % 1 ? fmt1 : fmt0).format(v) + '%', g);
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
    if (data.actualizado) document.getElementById('news-updated').textContent = 'Actualizado el ' + fmtFechaLarga.format(new Date(data.actualizado)) + '. Las noticias pertenecen a sus fuentes.';
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
      email: 'q6_email4', whatsapp: 'q7_textbox5', factura: 'q8_textbox6', pago: 'q9_textbox7', archivos: 'q11_archivosAdjuntos[]' } }
  };
  // El navegador acepta «ana@ejemplo»; para escribir de vuelta hace falta un dominio completo
  function correoOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }
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
  // Con el Worker de PayPal (PAYPAL.servidor, de data/asistente.json), el Worker fija el precio y crea la orden, el cliente la
  // aprueba en PayPal y el Worker la cobra y devuelve el texto del pago con el sello del servidor.
  // Sin Worker de PayPal, el navegador crea y captura la orden como antes y el registro dice que no tiene sello.
  var PAYPAL = { clientId: 'BAAHPHYxpHokQA3PYUEiaYFXl32IAU8mMO-xXonNNzPgKvJHvtmyiMOBh-gI1SXRa9NoRBQVyrSMF_EWpE', servidor: '' };
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
  // `pedido` dice qué se compra, para que el Worker fije el precio: { producto: 'masterclass' } o
  // { producto: 'consulta', tema, partes, extra }.
  function botonesPayPal(caja, monto, descripcion, referencia, alPagar, alError, pedido) {
    var valor = monto.toFixed(2), motivo = '';
    caja.innerHTML = '<p class="pp-cargando">Cargando el pago seguro…</p>';
    return cargarPayPal().then(function (pp) {
      caja.innerHTML = '';
      return pp.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 45 },
        createOrder: function (d, actions) {
          motivo = '';
          if (PAYPAL.servidor) return crearPedido('paypal', referencia, descripcion, monto, pedido).then(function (r) { return r.id; }, function (e) { motivo = e.message; throw e; });
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{ amount: { currency_code: 'USD', value: valor }, description: descripcion, custom_id: referencia, invoice_id: referencia + '-' + Date.now().toString(36).toUpperCase() }],
            application_context: { brand_name: 'Carlo Pagani', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' }
          });
        },
        onApprove: function (d, actions) {
          return serviciosWeb.then(function () {
            if (PAYPAL.servidor) return cobroServidor(d.orderID, Math.round(monto * 100), valor, actions, alPagar, alError);
            return actions.order.capture().then(function (o) {
              var cap = o && o.purchase_units && o.purchase_units[0] && o.purchase_units[0].payments && o.purchase_units[0].payments.captures && o.purchase_units[0].payments.captures[0];
              if (!o || o.status !== 'COMPLETED' || !cap || cap.status !== 'COMPLETED' || cap.amount.value !== valor || cap.amount.currency_code !== 'USD') {
                alError('PayPal no confirmó el pago completo. Si se te cobró algo, escríbeme y lo reviso.'); return;
              }
              var pagador = o.payer ? [o.payer.name && [o.payer.name.given_name, o.payer.name.surname].filter(Boolean).join(' '), o.payer.email_address].filter(Boolean).join(' · ') : '';
              alPagar({ orden: o.id, captura: cap.id, monto: '$' + valor, pagador: pagador });
            });
          });
        },
        onCancel: function () { alError('Cancelaste el pago. Puedes intentarlo de nuevo cuando quieras.'); },
        onError: function () { alError(motivo || 'PayPal no pudo procesar el pago. Revisa los datos de tu tarjeta o inténtalo de nuevo.'); }
      }).render(caja);
    }).catch(function () {
      caja.innerHTML = '';
      alError('No pude cargar el pago de PayPal. Revisa tu conexión y vuelve a intentarlo.');
    });
  }
  // Pide al Worker el pedido con su precio (PayPal: crea la orden; Payphone: anota la transacción). Si el precio del Worker
  // no es el que muestra la página, no sigue: así nadie paga un monto distinto del que vio.
  function crearPedido(proveedor, referencia, descripcion, monto, pedido) {
    var url = (proveedor === 'paypal' ? PAYPAL.servidor.replace(/\/paypal$/, '') : PAYPHONE.url) + '/orden';
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({}, pedido, { proveedor: proveedor, referencia: referencia, descripcion: descripcion })) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); }, function () { return { ok: false, j: {} }; })
      .then(function (x) {
        if (!x.ok || !(x.j.id || x.j.tx)) throw new Error(x.j.motivo || 'No pude preparar el pago. Inténtalo de nuevo en un momento.');
        if (x.j.centavos !== Math.round(monto * 100)) throw new Error('El precio no coincide con el de la página. Recárgala e inténtalo de nuevo; si sigue igual, escríbeme por LinkedIn.');
        return x.j;
      });
  }
  // El Worker cobra la orden aprobada. Si la conexión falla, reintenta con la misma orden: PayPal nunca la cobra dos veces.
  function cobroServidor(orden, centavos, valor, actions, alPagar, alError) {
    var intento = function (n) {
      return fetch(PAYPAL.servidor, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orden: orden }) })
        .then(function (r) { if (r.status >= 500) throw new Error(r.status); return r.json(); })
        .catch(function (e) { if (n > 1) throw e; return new Promise(function (ok) { setTimeout(ok, 1500); }).then(function () { return intento(n + 1); }); });
    };
    return intento(0).then(function (r) {
      if (r.aprobado && r.centavos === centavos) return alPagar({ orden: r.orden, captura: r.captura, monto: '$' + valor, pagador: r.pagador, texto: r.pago });
      if (r.reintentar) { alError(r.motivo); return actions.restart(); }
      alError(r.motivo || 'PayPal no confirmó el pago completo. Si se te cobró algo, escríbeme y lo reviso.');
    }, function () {
      alError('No pude confirmar tu pago con PayPal. Inténtalo de nuevo en un momento; un mismo pago nunca se cobra dos veces.');
    });
  }
  function textoPayPal(r) { return r.texto || 'PayPal: pagado ' + r.monto + ' USD · orden ' + r.orden + ' · captura ' + r.captura + (r.pagador ? ' · ' + r.pagador : '') + ' · sin sello del servidor'; }

  /* ---------- Payphone: cobro con tarjeta de cualquier banco del Ecuador ---------- */
  // Se activa cuando data/asistente.json trae «pago»: la dirección del Worker, que guarda el token de Payphone.
  // La Cajita de Pagos cobra dentro de la página; después Payphone lleva al cliente a /pago/ con ?id=…&clientTransactionId=…,
  // el Worker confirma el pago con Payphone y solo entonces se guardan los datos en Jotform.
  var PAYPHONE = { url: '' }, PPH = 'pph-cobro', CAJITA = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box', cajitaCarga = null;
  var serviciosWeb = fetch('/data/asistente.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
  serviciosWeb.then(function (j) {
    if (j && /^https:\/\//.test(j.pago || '')) PAYPHONE.url = j.pago;
    if (j && /^https:\/\//.test(j.paypal || '')) PAYPAL.servidor = j.paypal;
  });
  function cargarCajita() {
    if (window.PPaymentButtonBox) return Promise.resolve();
    if (cajitaCarga) return cajitaCarga;
    cajitaCarga = new Promise(function (ok, mal) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = CAJITA + '.css'; document.head.appendChild(l);
      var sc = document.createElement('script'); sc.type = 'module'; sc.src = CAJITA + '.js';
      sc.onload = function () {
        var n = 0;
        (function esperar() { if (window.PPaymentButtonBox) return ok(); if (++n > 50) return mal(new Error('sin Cajita')); setTimeout(esperar, 100); })();
      };
      sc.onerror = function () { mal(new Error('sin Cajita')); };
      document.head.appendChild(sc);
    });
    cajitaCarga.catch(function () { cajitaCarga = null; });
    return cajitaCarga;
  }
  function guardarPph(v) { try { if (v) localStorage.setItem(PPH, JSON.stringify(v)); else localStorage.removeItem(PPH); return true; } catch (e) { return false; } }
  function leerPph() { try { return JSON.parse(localStorage.getItem(PPH)); } catch (e) { return null; } }
  // Pinta la Cajita en `caja` por `monto` (IVA incluido). `cobro` se guarda en este navegador y dice qué hacer al volver de Payphone:
  //   { form: 'analisis' | 'masterclass', datos, anexo, listo, volver } → /pago/ confirma y guarda `datos` en ese formulario
  //     (con el texto del pago en `pago` y, si hay `anexo`, también al final de ese campo) y muestra `listo`;
  //   { retoma: true, volver } → /pago/ devuelve al cliente a `volver`, que retoma su recorrido con confirmarPayphone().
  // `pedido` dice qué se compra, como en botonesPayPal; el Worker fija el precio y crea la transacción (clientTransactionId).
  function cajitaPayphone(caja, monto, descripcion, referencia, email, cobro, alError, pedido) {
    var centavos = Math.round(monto * 100), base = Math.round(centavos / 1.15), tx = '';
    if (!guardarPph({ prueba: 1 })) {
      return alError('Tu navegador no deja guardar tus datos mientras pagas. Prueba sin navegación privada o con otro navegador.');
    }
    caja.innerHTML = '<div class="pph-caja"><p class="pp-cargando">Cargando el pago con tarjeta…</p></div>';
    Promise.all([fetch(PAYPHONE.url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }), cargarCajita(),
      crearPedido('payphone', referencia, descripcion, monto, pedido).then(function (r) { tx = r.tx; guardarPph(Object.assign({ tx: tx, centavos: centavos, t: Date.now() }, cobro)); })])
      .then(function (x) {
        var id = 'pph-' + Date.now().toString(36);
        caja.innerHTML = '<div class="pph-caja"><div id="' + id + '"></div></div>';
        var op = { token: x[0].token, storeId: x[0].storeId, clientTransactionId: tx, reference: descripcion.slice(0, 100),
          amount: centavos, amountWithTax: base, tax: centavos - base, amountWithoutTax: 0, service: 0, tip: 0,
          currency: 'USD', lang: 'es', defaultMethod: 'card', timeZone: -5 };
        if (email) op.email = email;
        new window.PPaymentButtonBox(op).render(id);
      })
      .catch(function (e) {
        guardarPph(null); caja.innerHTML = '';
        alError(e && /precio/.test(e.message) ? e.message : 'No pude abrir el pago con tarjeta. Inténtalo de nuevo en unos minutos.');
      });
  }
  // De vuelta de Payphone: el Worker confirma el pago. ok({ monto, texto, autorizacion, cobro }) solo si está aprobado por el monto que se cobró.
  function confirmarPayphone(ok, mal) {
    var q = new URLSearchParams(location.search), id = q.get('id'), tx = q.get('clientTransactionId'), g = leerPph();
    var limpiar = function () { history.replaceState(null, '', location.pathname + location.hash); };
    if (!id || !tx) return mal('No encontré los datos de tu pago.');
    if (!g || g.tx !== tx) { limpiar(); return mal('Volviste del pago, pero no encontré tus datos en este navegador. Si se llegó a cobrar, Payphone anula el cargo en unos minutos.'); }
    serviciosWeb.then(function () {
      if (!PAYPHONE.url) throw new Error('sin servicio');
      return fetch(PAYPHONE.url + '/confirmar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, clientTxId: tx }) })
        .then(function (r) { return r.json(); });
    }).then(function (r) {
      limpiar(); guardarPph(null);
      if (!r.aprobado) return mal(r.motivo ? esc(r.motivo) : 'El pago no se completó.');
      if (r.centavos !== g.centavos) return mal('Payphone confirmó un monto distinto al de tu compra. Escríbeme por ' + LINKEDIN_PAGO + ' y lo reviso.');
      ok({ monto: g.centavos / 100, texto: r.pago, autorizacion: r.autorizacion, cobro: g });
    }, function () {
      mal('No pude confirmar tu pago todavía. Recarga esta página en un momento; si no se confirma en unos minutos, Payphone anula el cargo.');
    });
  }
  var LINKEDIN_PAGO = '<a href="https://www.linkedin.com/in/carlo-g-pagani-48708625" target="_blank" rel="noopener">LinkedIn</a>';
  // Página /pago/, adonde vuelve Payphone
  var pphEl = document.getElementById('pph-retorno');
  if (pphEl) (function () {
    var g = leerPph(), msg = document.getElementById('pph-msg'), sigue = document.getElementById('pph-volver');
    if (g && g.volver) sigue.href = g.volver;
    if (g && g.retoma && g.volver && /^\/[^\/]/.test(g.volver)) { location.replace(g.volver.split('#')[0] + location.search + (g.volver.split('#')[1] ? '#' + g.volver.split('#')[1] : '')); return; }
    var fin = function (titulo, html) { document.getElementById('pph-t').textContent = titulo; msg.innerHTML = html; sigue.hidden = false; };
    confirmarPayphone(function (r) {
      var cfg = FORMS[r.cobro.form], datos = Object.assign({}, r.cobro.datos, { pago: r.texto });
      if (r.cobro.anexo) datos[r.cobro.anexo] = (datos[r.cobro.anexo] || '') + r.texto;
      var guardar = function () {
        msg.textContent = 'Pago aprobado. Guardando tus datos…';
        enviar(cfg, datos).then(function () {
          fin('Pago aprobado', esc(r.cobro.listo || 'Recibí tu pago.') + ' Autorización de Payphone: ' + esc(r.autorizacion) + '.');
        }, function () {
          fin('Pago aprobado', 'Tu pago se aprobó (autorización ' + esc(r.autorizacion) + '), pero no pude guardar tus datos. <button type="button" class="back" id="pph-re">Reintentar</button>');
          document.getElementById('pph-re').addEventListener('click', guardar);
        });
      };
      if (!cfg) return fin('Pago aprobado', 'Tu pago se aprobó (autorización ' + esc(r.autorizacion) + '). Escríbeme por ' + LINKEDIN_PAGO + ' y lo registro.');
      guardar();
    }, function (m) { fin('El pago no se completó', m); });
  })();
  if (pphEl) return;   // en /pago/ no hay más que hacer

  if (document.getElementById('cform')) (function () {
  var cf = document.getElementById('cform'), cs = document.getElementById('c-status');
  var paso = 1, atras = document.getElementById('w-atras');
  var TAM = {
    empresa: { q: '¿Cuánto factura tu empresa al año?', o: ['Menos de 100 mil dólares', 'De 100 mil a 500 mil dólares', 'De 500 mil a 2 millones de dólares', 'Más de 2 millones de dólares'] },
    fondos: { q: '¿Cuánto planeas invertir?', o: ['Menos de 10 mil dólares', 'De 10 mil a 50 mil dólares', 'De 50 mil a 250 mil dólares', 'Más de 250 mil dólares'] }
  };
  var PLAZOS = { 1: 'Lo antes posible', 2: 'En uno a tres meses', 3: 'Solo estoy explorando' };
  var EMPRESA_SERV = 'CFO fraccional o consultoría';
  function esFondos() { return document.getElementById('w-servicio').value === 'Asesoría de inversiones'; }
  function esEmpresa() { return document.getElementById('w-servicio').value === EMPRESA_SERV; }
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
      document.getElementById('w-leyenda').hidden = !esEmpresa();   // empresas: se les atiende lo antes posible y el pago va antes de la cita formal
      var t2 = esFondos() ? TAM.fondos : TAM.empresa;
      document.getElementById('w-resumen').textContent = [document.getElementById('w-servicio').value, t2.o[+document.getElementById('w-tamano').value - 1], PLAZOS[document.getElementById('w-plazo').value]].join(' · ');
    }
    var foco = cf.querySelector('.step[data-step="' + n + '"] ' + (n === 4 ? 'input' : '.chip'));
    if (foco && document.activeElement && cf.contains(document.activeElement)) foco.focus();
  }
  cf.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip'); if (!chip || chip.hasAttribute('data-ir')) return;   // los enlaces del paso 1 llevan a la Consulta Express
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
  if (cfoCard) cfoCard.addEventListener('click', function (e) { if (!e.target.closest('a:not([data-cita])')) agendar(EMPRESA_SERV, e); });
  document.querySelectorAll('[data-agendar]').forEach(function (a) {
    a.addEventListener('click', function (e) { agendar(a.dataset.agendar, e); });
  });
  cf.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = Array.prototype.filter.call(cf.querySelectorAll('.step[data-step="4"] [required]'), function (f) {
      var bad = !f.checkValidity() || (f.type === 'email' && !correoOk(f.value)); f.setAttribute('aria-invalid', bad ? 'true' : 'false'); return bad;
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
      cf.querySelector('.step[data-step="4"]').innerHTML = '<p class="q">Gracias, ' + esc(cf.nombre.value.split(' ')[0]) + '.</p><p style="color:var(--on-navy-soft)">' + (esEmpresa() ? 'Te atiendo lo más pronto posible: te escribo a ' + esc(cf.email.value.trim()) + ' para confirmar lo que necesitas y, antes de agendar la cita formal, te indico el pago.' : 'Recibí tu solicitud. Reviso todas cada semana y, si encaja, te escribo para agendar una conversación.') + '</p>';
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
    if (window.MC_FECHA.cerrada) return;
    var invalid = Array.prototype.filter.call(mf.querySelectorAll('[required]'), function (f) {
      var bad = !f.checkValidity() || (f.type === 'email' && !correoOk(f.value)); f.setAttribute('aria-invalid', bad ? 'true' : 'false'); return bad;
    });
    if (invalid.length) { ms.className = 'cstatus'; ms.textContent = 'Necesito tu nombre y un correo válido.'; invalid[0].focus(); return; }
    if (!FORMS.masterclass.url) { ms.className = 'cstatus'; ms.innerHTML = 'El registro se activa en los próximos días. Mientras tanto, puedes apartar tu lugar escribiéndome por ' + LINKEDIN + '.'; return; }
    var intereses = Array.prototype.filter.call(mf.querySelectorAll('.chip'), function (c) { return c.getAttribute('aria-pressed') === 'true'; })
      .map(function (c) { return c.dataset.v; }).join('; ');
    var ref = refMC();
    var datos = { nombre: mf.nombre.value.trim(), email: mf.email.value.trim(), whatsapp: mf.whatsapp.value.trim(), intereses: intereses, referencia: ref, pago: 'Pendiente de pago' };
    // Los campos Referencia y Pago van también dentro de Intereses, que es el campo seguro del formulario
    datos.intereses = (intereses || 'Sin intereses marcados') + '\nFecha: ' + window.MC_FECHA.texto + ' de 2026\nReferencia: ' + ref + '\nPago: pendiente';
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
    if (PAYPAL.clientId || PAYPHONE.url) return pagoMCPayPal(datos, ref, intereses, nombre);
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
      var d2 = Object.assign({}, datos, { pago: pago, intereses: (intereses || 'Sin intereses marcados') + '\nFecha: ' + window.MC_FECHA.texto + ' de 2026\nReferencia: ' + ref + '\nPago: ' + pago });
      ok.disabled = true; st.className = 'cstatus'; st.textContent = 'Enviando…';
      enviar(FORMS.masterclass, d2).then(function () {
        mf.innerHTML = '<p class="q">Listo, ' + nombre + '. Tu cupo queda separado.</p><p style="color:var(--on-navy-soft);margin:0">Verifico tu pago y te escribo a ' + esc(datos.email) + ' con la hora y el enlace. Si la masterclass no llegara a abrirse, te devuelvo el valor completo.</p>';
        verMF();
      }).catch(function () {
        ok.disabled = false; st.className = 'cstatus'; st.textContent = 'No se pudo enviar. Inténtalo de nuevo en unos minutos.';
      });
    });
    comp.focus();
  }
  // Al cambiar el contenido del formulario, la página sube a su inicio para que no quede viendo lo que está debajo
  function verMF() {
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    mf.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
  }
  function pagoMCPayPal(datos, ref, intereses, nombre) {
    var tarjeta = !!PAYPHONE.url, pp = !!PAYPAL.clientId;
    mf.innerHTML = '<p class="q">Último paso, ' + nombre + ': paga tu cupo</p>' +
      '<div class="dp-qr pp-total"><span>Valor de la masterclass, IVA incluido</span><strong>' + MC.precio + ' USD</strong></div>' +
      (tarjeta ? '<p class="pp-ayuda">Paga con tarjeta de crédito o débito de cualquier banco. Tu cupo queda confirmado en cuanto se aprueba el pago.</p>' +
        '<div id="m-pph"></div>' + (pp ? '<p class="pp-ayuda pp-o">¿Prefieres PayPal? También puedes pagar con tu cuenta:</p>' : '') :
        '<p class="pp-ayuda">Paga con tu cuenta PayPal o con tarjeta de crédito o débito. Tu cupo queda confirmado en cuanto se aprueba el pago.</p>' +
        '<p class="pp-ayuda pp-nota">Si pagas con tarjeta, el «CSC» que pide PayPal es el código de seguridad (CVV) de tres dígitos del reverso. Si tu banco la rechaza, activa en su app las compras por internet y en el exterior.</p>') +
      (pp ? '<div class="pp-btns" id="m-pp"></div>' : '') + '<p class="cstatus" id="m-status2" role="status"></p>';
    verMF();
    var st = document.getElementById('m-status2');
    // Si el pago no carga o falla, se ofrece volver a intentarlo con los mismos datos y la misma referencia
    var alError = function (msg) {
      st.className = 'cstatus'; st.textContent = msg + ' ';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'back'; b.textContent = 'Volver a intentar';
      b.addEventListener('click', function () { pagoMCPayPal(datos, ref, intereses, nombre); });
      st.appendChild(b);
    };
    if (tarjeta) cajitaPayphone(document.getElementById('m-pph'), 15, 'Masterclass de finanzas personales, ' + window.MC_FECHA.texto + ' de 2026', ref, datos.email, {
      form: 'masterclass', anexo: 'intereses', volver: '/#masterclass',
      datos: Object.assign({}, datos, { intereses: (intereses || 'Sin intereses marcados') + '\nFecha: ' + window.MC_FECHA.texto + ' de 2026\nReferencia: ' + ref + '\nPago: ' }),
      listo: 'Listo, ' + datos.nombre.split(' ')[0] + '. Tu cupo en la masterclass está confirmado. Te escribo a ' + datos.email + ' con la hora y el enlace. Si la masterclass no llegara a abrirse, te devuelvo el valor completo.'
    }, alError, { producto: 'masterclass' });
    if (pp) botonesPayPal(document.getElementById('m-pp'), 15, 'Masterclass de finanzas personales, ' + window.MC_FECHA.texto + ' de 2026', ref, function (r) {
      var pago = textoPayPal(r);
      var d2 = Object.assign({}, datos, { pago: pago, intereses: (intereses || 'Sin intereses marcados') + '\nFecha: ' + window.MC_FECHA.texto + ' de 2026\nReferencia: ' + ref + '\nPago: ' + pago });
      st.className = 'cstatus'; st.textContent = 'Pago aprobado. Guardando tu cupo…';
      var guardar = function () {
        return enviar(FORMS.masterclass, d2).then(function () {
          mf.innerHTML = '<p class="q">Listo, ' + nombre + '. Tu cupo está confirmado.</p><p style="color:var(--on-navy-soft);margin:0">Recibí tu pago de ' + MC.precio + ' (orden de PayPal ' + esc(r.orden) + '). Te escribo a ' + esc(datos.email) + ' con la hora y el enlace. Si la masterclass no llegara a abrirse, te devuelvo el valor completo.</p>';
          verMF();
        }).catch(function () {
          st.innerHTML = 'Tu pago se aprobó (orden ' + esc(r.orden) + '), pero no pude guardar tu cupo. <button type="button" class="back" id="m-reintentar">Reintentar</button>';
          document.getElementById('m-reintentar').addEventListener('click', guardar);
        });
      };
      guardar();
    }, alError, { producto: 'masterclass' });
  }
  // Cuenta regresiva hasta la masterclass
  document.querySelectorAll('[data-faltan]').forEach(function (n) {
    var dias = Math.ceil((new Date(n.dataset.faltan + 'T00:00:00-05:00') - Date.now()) / 864e5);
    if (dias > 1) n.textContent = 'Faltan ' + dias + ' días'; else if (dias === 1) n.textContent = 'Es mañana'; else n.hidden = true;
  });

  /* ---------- Consulta Express: el cliente cuenta su caso a un asistente con IA, en una ventana (solo en /consulta-express/) ---------- */
  // Un caso abierto: el cliente elige el tema, paga un solo precio y le cuenta su caso al asistente con sus palabras; el asistente
  // le pregunta lo que Carlo necesita saber (según el tema) y cierra con un resumen que el cliente confirma. Luego adjunta documentos.
  // Empresas: el mismo recorrido, por $70 (más impuestos si aplica), confirma una cita; Carlo analiza el caso y escribe para acordar la fecha. Si la agenda
  // está llena (data/agenda.json), la empresa deja sus datos y su caso en pocas líneas, sin pagar, y se le avisa por correo cuando llegue su turno.
  if (document.getElementById('ae')) (function () {
  var E = 'Mi empresa', P = 'Mis finanzas personales', I = 'Una inversión', O = 'Otra decisión de dinero';
  // Precios sin partes: uno para la empresa y otro para el resto. Deben coincidir con PRECIOS.consulta del Worker (worker/src/index.js).
  var PRECIOS = { 'Mi empresa': 70 }, PRECIO = 35, IVA = 0.15;
  function precioBase() { return PRECIOS[resp.tema] || PRECIO; }
  // Clave de cada tema para el Worker, que fija el precio con su propia copia
  var TEMAS = { 'Mi empresa': 'empresa', 'Mis finanzas personales': 'personal', 'Una inversión': 'inversion', 'Otra decisión de dinero': 'otra' };
  var cobros = [], aceptado = '';   // pagos aprobados y fecha en que aceptó las condiciones
  // Agenda de citas para empresas: «abierta» o «llena». Se cambia en data/agenda.json, sin tocar el código.
  // Cupos de empresa: data/agenda.json trae { "empresa": { "cupos": 3, "ocupados": 1 } }; sin cupos libres, la empresa ve la lista de espera
  var AGENDA = { cupos: 1, ocupados: 0 };
  fetch('/data/agenda.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) {
    var e = j && j.empresa;
    if (e && typeof e === 'object') AGENDA = { cupos: +e.cupos || 0, ocupados: +e.ocupados || 0 };
    else if (e === 'llena') AGENDA = { cupos: 0, ocupados: 0 };
  }).catch(function () {});
  function cuposLibres() { return Math.max(0, AGENDA.cupos - AGENDA.ocupados); }
  function llena() { return resp.tema === E && cuposLibres() <= 0; }
  // País y moneda del cliente: la moneda rige las cifras que usa la IA; el cobro sigue en dólares.
  // El país queda guardado para el IVA de los clientes del exterior y para adaptar los términos (IESS, SRI, décimos).
  var OTRO_PAIS = 'Otro país';
  var MONEDAS = {
    'Ecuador · dólares': { pais: 'Ecuador', moneda: 'dólares estadounidenses', s: '$', c: '' },
    'México · pesos mexicanos': { pais: 'México', moneda: 'pesos mexicanos', s: '$', c: 'MXN' },
    'Chile · pesos chilenos': { pais: 'Chile', moneda: 'pesos chilenos', s: '$', c: 'CLP' },
    'Colombia · pesos colombianos': { pais: 'Colombia', moneda: 'pesos colombianos', s: '$', c: 'COP' },
    'Perú · soles': { pais: 'Perú', moneda: 'soles', s: 'S/', c: '' }
  };
  function mon() {
    if (resp.pais === OTRO_PAIS && resp.pais2) {
      var t = resp.pais2.split(/[,;·]| - /), pais = t.length > 1 ? t[0].trim() : resp.pais2.trim(), moneda = t.length > 1 ? t.slice(1).join(' ').trim() : '';
      return { pais: pais, moneda: moneda || 'la moneda de su país', s: '', c: moneda };
    }
    return MONEDAS[resp.pais] || MONEDAS['Ecuador · dólares'];
  }
  function ec() { return mon().pais === 'Ecuador'; }
  // Quien vive fuera del Ecuador recibe una exportación de servicios: IVA 0 % (LRTI art. 56). Paga solo con PayPal y el Worker
  // comprueba, antes de cobrar, que el pagador sea del exterior; si no, no cobra y le pide elegir Ecuador.
  function exterior() { return !!resp.pais && !/^\s*ecuador\s*$/i.test(mon().pais); }
  function ivaExacto() { return exterior() ? ' (IVA 0 %, exportación de servicios)' : ' + IVA'; }
  function conIVAtxt() { return exterior() ? ' sin IVA (exportación de servicios)' : ' con IVA'; }
  // Montos de ejemplo en la escala de la moneda del cliente, redondeados a dos cifras (¤ marca un monto dentro de un texto)
  var ESCALA = { 'México': 20, 'Chile': 1000, 'Colombia': 4000, 'Perú': 4 };
  function ejemplo(n) {
    var x = +String(n).replace(/\./g, '') * (ESCALA[mon().pais] || 1), p = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1));
    return (Math.round(x / p) * p).toLocaleString('de-DE');
  }
  function ej(t) { return String(t || '').replace(/¤([\d.]+)/g, function (_, n) { return ejemplo(n); }); }
  function USD() { return ec() ? '' : ' USD'; }
  // Lámina de bienvenida: el proceso en cuatro pasos, al estilo de las miniaturas, justo después de elegir el tema
  var TIEMPO = '<strong>Dedica unos treinta minutos de tu tiempo a conciencia y obtendrás grandes resultados.</strong> Es una conversación, no un formulario: cuéntalo con tus palabras y las cifras pueden ser aproximadas. Lo que no sepas, dilo y yo lo cubro con supuestos; si tienes ¤, tenlos a mano.';
  var LAMINAS = {};
  LAMINAS[P] = { pasos: ['Le cuentas tu caso a mi asistente con tus palabras; él te pregunta lo que haga falta.', 'Adjuntas lo que ayude: estados de cuenta, tablas de pagos, pólizas o capturas de pantalla.'], docs: 'tus estados de cuenta o la tabla de pagos de un préstamo' };
  LAMINAS[I] = { pasos: ['Le cuentas a mi asistente qué inversión es, quién la ofrece y cuánto pondrías; él te pregunta lo que haga falta.', 'Adjuntas el folleto o el contrato de la inversión, si lo tienes.'], docs: 'el folleto o el contrato de la inversión' };
  LAMINAS[O] = { pasos: ['Le cuentas a mi asistente la decisión y sus opciones; él te pregunta lo que haga falta.', 'Adjuntas cotizaciones, tablas de pagos, estados de cuenta o capturas de pantalla.'], docs: 'cotizaciones, tablas de pagos o estados de cuenta' };
  // Empresas: la cita se confirma con el caso ya analizado; el pago cubre ese análisis previo y la coordinación de la agenda
  LAMINAS[E] = { titulo: 'Tu cita <b>en 4 pasos</b>', pago: ': cubre el análisis previo de tu caso y la coordinación de la agenda.',
    pasos: ['Le cuentas tu caso a mi asistente con tus palabras; él te pregunta lo que haga falta.', 'Adjuntas lo que ayude: estados financieros, extractos bancarios, capturas de pantalla o tus propios registros.'],
    fin: 'Analizo tu caso y te escribo para acordar el día y la hora de la cita.', docs: 'estados financieros o extractos bancarios',
    nota: '<strong>Llego a la primera cita con tu caso ya analizado.</strong> El pago cubre ese análisis previo, la coordinación de la agenda y la infraestructura: es parte del proceso para darte la mejor atención desde el inicio. Atiendo pocas empresas a la vez; ahora mismo §. Dedica unos 30 minutos; si tienes ¤, tenlos a mano.' };
  // Empresas con la agenda llena: lista de espera gratuita, con los datos de contacto y el caso en pocas líneas
  var ESPERA = { titulo: 'Lista de espera <b>en 4 pasos</b>', boton: 'Dejar mis datos',
    pasos: ['Me cuentas tu caso en pocas líneas y me dejas tu correo, sin costo.', 'Te escribo a tu correo cuando pueda atender tu caso.', 'Entonces pagas $70 (más impuestos si aplica) y le cuentas tu caso completo a mi asistente, con tus documentos.', 'Analizo tu caso y acordamos el día y la hora de la cita.'],
    nota: '<strong>Para mantener la calidad atiendo pocas empresas a la vez, y ahora mismo la agenda está llena.</strong> Te aviso a tu correo cuando llegue tu turno.' };
  // El símbolo del logo (tres barras y la flecha), dibujado para animarse: las barras suben y la flecha se traza
  var lamN = 0;
  function logoAnimado() {
    var id = 'lam' + (++lamN), curva = 'M150 830 L170 828 L190 824 L210 818 L230 811 L250 803 L270 794 L290 784 L310 773 L330 762 L350 749 L370 736 L390 722 L410 707 L430 691 L450 675 L470 658 L490 640 L510 622 L530 603 L550 584 L570 564 L590 544 L610 524 L630 503 L650 482 L670 461 L690 440 L710 419 L730 398 L750 377 L770 356 L790 335';
    return '<svg class="lam-logo" viewBox="110 230 740 630" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A7898"/><stop offset="1" stop-color="#043E5C"/></linearGradient>' +
      '<mask id="' + id + 'm"><rect x="0" y="0" width="1024" height="1024" fill="#fff"/><path class="lam-curva" d="' + curva + '" fill="none" stroke="#000" stroke-width="102" stroke-linecap="round" stroke-linejoin="round"/></mask></defs>' +
      '<g class="lam-barras" fill="url(#' + id + 'g)" mask="url(#' + id + 'm)"><rect x="212" y="490" width="150" height="300" rx="10"/><rect x="396" y="380" width="150" height="410" rx="10"/><rect x="580" y="270" width="150" height="520" rx="10"/></g>' +
      '<path class="lam-curva" d="' + curva + '" fill="none" stroke="url(#' + id + 'g)" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<polygon class="lam-punta" points="821,272 795,444 658,334" fill="url(#' + id + 'g)"/></svg>';
  }
  function lamina(p, viva) {
    var l = llena() ? ESPERA : LAMINAS[resp.tema] || LAMINAS[O];
    var pasos = l === ESPERA ? l.pasos : ['Pagas $' + precioBase() + USD() + ' (más impuestos si aplica)' + (l.pago || '.')].concat(l.pasos, [l.fin || 'Recibes tu informe entre 3 y 5 días hábiles.']);
    var html = '<p class="lam-eyebrow">' + esc(resp.tema) + '</p><p class="lam-t">' + (l.titulo || 'Así funciona <b>en 4 pasos</b>') + '</p>' +
      logoAnimado() +
      '<ol class="lam-pasos">' + pasos.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
      '<p class="lam-tiempo">' + (l.nota || TIEMPO).replace('§', cuposLibres() === 1 ? 'queda 1 cupo' : 'quedan ' + cuposLibres() + ' cupos').replace('¤', esc(l.docs || '')) + '</p>' +
      '<div class="lam-botones"><button type="button" class="btn btn-navy" data-empezar>' + (l.boton || 'Empezar') + '</button><button type="button" class="back" data-otro>Elegir otro tema</button></div>';
    var d = burbuja(html, 'lamina' + (viva ? ' nuevo' : ' hecha'), viva, true);
    if (!viva) return d;
    d.querySelector('[data-empezar]').addEventListener('click', function () {
      if (actual !== p) return;
      actual = null; resp[p.id] = 'Empezar'; camino.push(p.id); d.classList.add('hecha');
      preguntar(true);
    });
    d.querySelector('[data-otro]').addEventListener('click', function () { if (actual === p) backBtn.click(); });
    return d;
  }
  // Lo que el asistente debe averiguar en cada tema: es la lista de la primera reunión de asesoría, y la IA pide solo lo que la duda necesite
  var OBJETIVO = {};
  OBJETIVO[P] = 'Entender el caso completo, como en una primera reunión de asesoría, para que Carlo pueda responder la duda del cliente en su informe. Lo que hay que saber: ' +
    '(1) la pregunta concreta que el informe debe responder, para cuándo necesita la respuesta y qué consideraría una buena respuesta; ' +
    '(2) su situación: edad aproximada, situación laboral, si el análisis es solo de él o de su hogar, y cuántas personas dependen de sus ingresos; ' +
    '(3) sus cifras de cada mes, aunque sean aproximadas: ingresos netos, gastos fijos y variables, y cuotas de deudas; ' +
    '(4) sus deudas y tarjetas: saldo, cuota, meses que faltan y tasa si la sabe; ' +
    '(5) ahorros, inversiones y bienes que tengan que ver con la duda; ' +
    '(6) lo que ya intentó o las opciones que está considerando. ' +
    'Pide solo lo que la duda necesite: si pregunta por una tarjeta, no hace falta todo su patrimonio.';
  OBJETIVO[I] = 'Entender la inversión que el cliente evalúa, para que Carlo juzgue en su informe su riesgo, su rendimiento real y si le conviene. Lo que hay que saber: ' +
    '(1) qué es la inversión, quién la ofrece y si esa entidad está regulada o supervisada en su país; ' +
    '(2) monto, rendimiento prometido o esperado, plazo, costos o comisiones y condiciones para retirar el dinero; ' +
    '(3) para qué es ese dinero, de dónde sale y qué parte de su patrimonio representa; ' +
    '(4) si podría necesitarlo antes del plazo y qué haría si la inversión cayera; ' +
    '(5) qué experiencia tiene invirtiendo y con qué otras opciones la está comparando; ' +
    '(6) a grandes rasgos su situación: ingreso mensual neto, gastos, ahorro disponible y deudas.';
  OBJETIVO[O] = 'Entender la decisión de dinero que el cliente debe tomar, para que Carlo le dé en su informe una recomendación clara. Lo que hay que saber: ' +
    '(1) la decisión, planteada como una pregunta concreta, las opciones que tiene y para cuándo debe decidir; ' +
    '(2) si es personal o de su empresa; ' +
    '(3) las cifras de cada opción: montos, cuotas, plazos, tasas, costos de cambio o de entrada, descuentos, y lo que un bien rinde o cuesta mantener; ' +
    '(4) su ingreso mensual neto, sus gastos y el ahorro o efectivo disponible; ' +
    '(5) qué es lo que más le importa cuidar: pagar menos en total, una cuota cómoda, correr poco riesgo o tener dinero disponible; ' +
    '(6) lo que ya intentó o le han ofrecido.';
  OBJETIVO[E] = 'Entender el caso de la empresa antes de la primera cita con Carlo, para que llegue a esa reunión conociendo la empresa y sus cifras. Lo que hay que saber: ' +
    '(1) a qué se dedica la empresa: qué vende, a quién, desde cuándo opera y cuántas personas trabajan en ella; ' +
    '(2) el problema o la decisión que quiere resolver, para cuándo y qué consideraría una buena salida; ' +
    '(3) sus cifras aproximadas del último año: ventas, costo de lo vendido, utilidad o pérdida, y los gastos fijos de cada mes; ' +
    '(4) el efectivo: si en los últimos meses sobró, alcanzó justo o faltó; cuánto le deben los clientes y cuánto debe a proveedores, y en qué plazos cobra y paga; ' +
    '(5) sus deudas: cuotas al mes y saldo total, y si está al día con los impuestos, la seguridad social, los bancos y los proveedores; ' +
    '(6) qué información financiera lleva (contabilidad al día, estados mensuales, presupuesto, flujo proyectado) y qué ha intentado hasta ahora. ' +
    'Pide solo lo que el caso necesite y acepta aproximados.';
  var PH = {};
  PH[E] = 'Por ejemplo: vendemos más que el año pasado, pero el efectivo no alcanza para pagar a tiempo a los proveedores…';
  PH[P] = 'Por ejemplo: debo ¤8.000 en dos tarjetas y quiero saber si me conviene un préstamo para juntarlas…';
  PH[I] = 'Por ejemplo: me ofrecen una póliza al 9 % anual a un año en una cooperativa y pondría ¤10.000…';
  PH[O] = 'Por ejemplo: pago ¤450 de arriendo y me ofrecen un crédito para comprar con una cuota de ¤750…';
  function sinIA() { return !IA.url || !!IA.caida; }
  var AE = [
    // Quien llega desde la portada diciendo que no es de empresa ve «Mi empresa» al final
    { id: 'tema', q: '¿Sobre qué quieres el análisis?', get op() { return location.hash === '#persona' ? [P, I, O, E] : [E, P, I, O]; } },
    { id: 'intro', lamina: true },
    // Empresa con la agenda llena: el caso en pocas líneas y los datos de contacto, sin pagar
    { id: 'ecaso', cond: llena, para: 'El caso de la empresa, en pocas líneas, para la lista de espera.', q: 'Cuéntame tu caso en pocas líneas: a qué se dedica tu empresa, qué está pasando y qué quieres resolver.', get ph() { return PH[E]; } },
    // Fuera del Ecuador: exportación de servicios (IVA 0 %, solo PayPal)
    { id: 'pais', vende: true, get q() { return '¿Dónde vives y en qué moneda manejas tus finanzas? Así anoto tus cifras en tu moneda y te hablo con los términos de tu país.' + ' Si vives fuera del Ecuador, lo pagas con PayPal.'; }, op: Object.keys(MONEDAS).concat([OTRO_PAIS]) },
    { id: 'pais2', vende: true, cond: function () { return resp.pais === OTRO_PAIS; }, q: '¿En qué país vives y en qué moneda manejas tus finanzas?', ph: 'Por ejemplo: Argentina, pesos argentinos' },
    { id: 'datos', get q() { return llena() ? 'Déjame tu nombre y tu correo: ahí te aviso cuando pueda atender tu caso.' : resp.tema === E ? '¿A nombre de quién preparo el análisis y a qué correo te escribo para acordar la cita?' : '¿A nombre de quién preparo el informe y a qué correo te lo envío?'; }, campos: true },
    { id: 'factura', vende: true, q: '¿Necesitas factura?', op: ['Sí', 'No'] },
    { id: 'fdatos', vende: true, cond: function () { return resp.factura === 'Sí'; }, get q() { return '¿A nombre de quién la emito y con qué ' + (ec() ? 'RUC o cédula' : 'número de identificación tributaria o pasaporte') + '?'; }, get ph() { return ec() ? 'Por ejemplo: Comercial Andes S.A., RUC 1790000000001' : 'Por ejemplo: Ana Pérez, número tributario 20123456789'; } },
    { id: 'pago', vende: true, cobro: true, q: 'Tu pago' },

    // El caso, en una conversación con el asistente: el cliente lo cuenta con sus palabras y la IA pregunta lo que falte (modo «caso» del Worker)
    { id: 'caso', vende: true, caso: true, para: 'El caso o la duda del cliente, con todo lo que el informe necesita para responderla.',
      get q() { return resp.tema === E ? 'Cuéntame el caso de tu empresa con tus palabras, como se lo contarías a un asesor: a qué se dedica, qué está pasando y qué quieres resolver. Mi asistente te irá preguntando lo que haga falta.' :
        'Cuéntame tu caso o tu duda con tus palabras, como se lo contarías a un asesor: qué pasa, qué quieres decidir o saber, y para cuándo. Mi asistente te irá preguntando lo que haga falta.'; },
      get ph() { return PH[resp.tema] || PH[O]; }, get conversa() { return OBJETIVO[resp.tema] || OBJETIVO[O]; } },
    // Si el asistente no está disponible, dos preguntas fijas recogen lo esencial
    { id: 'cifras', vende: true, cond: sinIA, opcional: true, para: 'Las cifras del caso.', q: 'Anota las cifras que tengan que ver con tu caso, aunque sean aproximadas: ingresos y gastos del mes, saldos y cuotas de deudas, ahorros, o los montos de lo que estás evaluando.' },
    { id: 'espera', vende: true, cond: sinIA, opcional: true, para: 'Lo que el cliente considera una respuesta útil.', get q() { return resp.tema === E ? '¿Qué tendría que resolver la cita para que te sea útil, y para cuándo necesitas la respuesta?' : '¿Qué tendría que decir el informe para que te sea útil, y para cuándo necesitas la respuesta?'; } },
    { id: 'adj', vende: true, archivos: true, get q() { return 'Adjunta lo que me ayude a entender tu caso: ' + (resp.tema === E ? 'estados financieros, extractos bancarios, tus propios registros, la tabla de pagos de una deuda o capturas de pantalla' : 'estados de cuenta, la tabla de pagos de un préstamo, cotizaciones, el folleto de una inversión, tus pólizas o capturas de pantalla de tu banca') + '. Los que necesites, de cualquier tipo, de hasta ' + MAX_MB + ' MB cada uno. Tapa el número completo de las tarjetas o de las cuentas: me bastan los últimos cuatro dígitos. Nunca incluyas claves ni contraseñas. Tus archivos se tratan con la misma confidencialidad que tus respuestas.'; } }
  ];
  // Etiquetas cortas para el resumen previo al envío
  var RES = {
    tema: 'Tema del análisis', pais: 'País y moneda', pais2: 'País y moneda', pago: 'Tu pago', get datos() { return resp.tema === E ? 'Análisis a nombre de' : 'Informe a nombre de'; }, factura: 'Factura', fdatos: 'Datos para la factura',
    caso: 'Tu caso', ecaso: 'Tu caso', cifras: 'Tus cifras', espera: 'Lo que haría útil el informe', adj: 'Archivos adjuntos'
  };
  var CONDICIONES = 'versión 9 del 23 de octubre de 2026';
  var INTRO = 'Hola, soy Carlo. Para darte un análisis serio necesito conocer bien tu situación, así que te haré las preguntas de una primera reunión de asesoría. Con tus respuestas preparo un informe con un diagnóstico y recomendaciones concretas; si es sobre tu empresa, preparo con ellas nuestra primera cita.';
  var INTRO_PRECIO = 'Te pido el pago al inicio porque vas a compartir información muy sensible, y la trato con un rigor que tiene un costo: viaja cifrada, solo yo la veo, no la comparto con nadie sin tu consentimiento expreso y la borro cuando deja de ser necesaria.';
  var INTRO_IA = 'Las preguntas te las hace mi asistente con inteligencia artificial, conversando contigo; el análisis y el informe los hago yo.';
  var borradoVisto = false;
  var BORRADO = 'Cuando ya no los necesito para tu informe y su seguimiento, borro tus respuestas y los archivos que adjuntaste. Solo conservo lo que la ley me obliga a guardar, como los datos de tu factura. Si más adelante quieres profundizar o revisar cómo evolucionaste, compárteme el informe que recibiste y partimos de ahí.';
  function intro() { return INTRO + '\n\n' + INTRO_PRECIO + (IA.url ? '\n\n' + INTRO_IA : ''); }
  var dlg = document.getElementById('ae'), log = document.getElementById('ae-log'), chipsEl = document.getElementById('ae-chips');
  var row = document.getElementById('ae-row'), txt = document.getElementById('ae-txt'), camposEl = document.getElementById('ae-campos');
  var okBtn = document.getElementById('ae-ok'), backBtn = document.getElementById('ae-back'), skipBtn = document.getElementById('ae-skip');
  var errEl = document.getElementById('ae-err'), inForm = document.getElementById('ae-in'), dudaBtn = document.getElementById('ae-duda');
  // Asistente con IA: la dirección llega en data/asistente.json cuando el servicio está desplegado
  var IA = { url: '' }, aclar = {}, dudas = [], resumenes = {}, pendiente = null, modoDuda = false;
  var servicios = serviciosWeb.then(function (j) { if (j && /^https:\/\//.test(j.url || '')) IA.url = j.url; });
  // Pasarelas de cobro. El recorrido solo llama a cobrar(caja, monto, descripción, referencia, alError); la primera pasarela activa
  // pinta el pago en `caja` y llama a ok({ monto, texto }) únicamente cuando confirma el pago completo. Cada pasarela es un objeto con:
  //   activa()  → si está disponible;   nota, ayuda → textos del resumen y de la ventana de pago;
  //   pintar(caja, monto, descripción, referencia, ok, mal) → muestra el pago;
  //   sale: true y vuelta(cobro, ok, mal) → para las que llevan al cliente a otra página y lo devuelven (como Payphone): antes de salir
  //   se guarda el cuestionario en este navegador y, al volver, vuelta() confirma el pago con `cobro` ({ monto, referencia, ... });
  //   volvio() opcional → si la página se abrió de vuelta de la pasarela (si no, el pago se vuelve a ofrecer sin intentar confirmarlo).
  // Para cambiar de pasarela basta con añadir su entrada aquí, antes de las demás (o en window.AE_PASARELA); el recorrido no cambia.
  var PRUEBA = !!window.AE_PRUEBA;   // versión de prueba: simula el pago y no envía nada
  var PASARELAS = [
    { activa: function () { return PRUEBA; }, nota: 'Versión de prueba: el pago se simula y no se cobra nada.', ayuda: 'Versión de prueba: pulsa el botón para simular un pago aprobado. No se cobra nada.',
      pintar: function (caja, monto, desc, referencia, ok) {
        caja.innerHTML = '<button type="button" class="btn btn-brass">Simular el pago de ' + dolares(monto) + '</button>';
        caja.querySelector('button').addEventListener('click', function () { ok({ monto: monto, texto: 'Versión de prueba: pago simulado de ' + dolares(monto) + ' USD (' + referencia + ')' }); });
      } },
    // Payphone: la Cajita cobra con tarjeta dentro de la página y luego Payphone lleva al cliente a /pago/, que lo devuelve aquí para confirmar.
    // Si PayPal también está activo, sus botones quedan debajo como alternativa.
    { activa: function () { return !!PAYPHONE.url && !exterior(); }, sale: true,
      nota: 'Pagas con tarjeta de crédito o débito de cualquier banco, con el monto exacto y confirmación inmediata.',
      ayuda: 'Paga con tarjeta de crédito o débito de cualquier banco. El monto ya está fijado y la confirmación es inmediata.',
      pintar: function (caja, monto, desc, referencia, ok, mal, pedido) {
        caja.innerHTML = '<div></div>' + (PAYPAL.clientId ? '<p class="pp-ayuda pp-o">¿Prefieres PayPal? También puedes pagar con tu cuenta:</p><div class="pp-btns"></div>' : '');
        cajitaPayphone(caja.firstChild, monto, desc, referencia, resp.datos.email, { retoma: true, volver: '/consulta-express/' }, mal, pedido);
        if (PAYPAL.clientId) botonesPayPal(caja.lastChild, monto, desc, referencia, function (r) { ok({ monto: monto, texto: textoPayPal(r) }); }, mal, pedido);
      },
      volvio: function () { var q = new URLSearchParams(location.search); return !!(q.get('id') && q.get('clientTransactionId')); },
      vuelta: function (cobro, ok, mal) {
        confirmarPayphone(function (r) { ok({ monto: r.monto, texto: r.texto }); }, mal);
      } },
    { activa: function () { return !!PAYPAL.clientId; }, nota: 'Pagas con PayPal o con tarjeta de crédito o débito, con el monto exacto y confirmación inmediata.',
      ayuda: 'Paga con tu cuenta PayPal o con tarjeta de crédito o débito. El monto ya está fijado y la confirmación es inmediata. Si pagas con tarjeta, el «CSC» que pide PayPal es el código de seguridad (CVV) de tres dígitos del reverso.',
      pintar: function (caja, monto, desc, referencia, ok, mal, pedido) {
        botonesPayPal(caja, monto, desc, referencia, function (r) { ok({ monto: monto, texto: textoPayPal(r) }); }, mal, pedido);
      } }
  ];
  if (window.AE_PASARELA) PASARELAS.unshift(window.AE_PASARELA);
  function pasarela() { return PASARELAS.filter(function (x) { return x.activa(); })[0] || null; }
  // Un solo cobro, al inicio; al aprobarse sigue pagado()
  function cobrar(caja, monto, desc, referencia, alError) {
    var p = pasarela();
    if (!p) { caja.innerHTML = ''; return alError('El pago en línea no está disponible en este momento. Escríbeme por LinkedIn y lo resolvemos.'); }
    var cobro = { monto: monto, desc: desc, referencia: referencia };
    if (p.sale) guardarCurso(cobro);
    // Lo que se compra, para que el Worker fije el precio: el tema y si el cliente vive fuera del Ecuador (IVA 0 %)
    var pedido = { producto: 'consulta', tema: TEMAS[resp.tema], exterior: exterior() };
    p.pintar(caja, monto, desc, referencia, function (r) { pagoAprobado(cobro, r); }, alError, pedido);
  }
  var resp = {}, camino = [], actual = null, enviado = false, ref = '', previo = {}, editando = null, respaldo = null;
  var resEl = document.getElementById('ae-res'), resLista = document.getElementById('ae-res-list'), acepto = document.getElementById('ae-acepto');
  var pagarBtn = document.getElementById('ae-pagar'), resErr = document.getElementById('ae-res-err'), tituloAE = document.getElementById('ae-t');
  var sinMov = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function aePaso(id) { return AE.filter(function (x) { return x.id === id; })[0]; }
  function aplica(p) { return (!p.si || resp.tema === p.si) && (!p.vende || !llena()) && (!p.cond || p.cond()); }
  function siguiente() { for (var i = 0; i < AE.length; i++) if (aplica(AE[i]) && !(AE[i].id in resp)) return AE[i]; return null; }
  function burbuja(texto, quien, nuevo, html) {
    var d = document.createElement('div'); d.className = 'msg ' + quien + (nuevo ? ' nuevo' : '');
    if (html) d.innerHTML = texto; else d.textContent = texto;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function textoResp(p, v) {
    if (p.campos) return v.nombre + ' · ' + v.email + (v.whatsapp ? ' · ' + v.whatsapp : '');
    if (p.archivos) return v.length ? v.join(', ') : 'Sin archivos adjuntos';
    if (Array.isArray(v)) return v.length ? v.join(', ') : 'Nada de esto';
    return v === '' ? 'Prefiero no responder' : v;
  }
  function pintar() {
    log.innerHTML = ''; burbuja(intro(), 'yo');
    camino.forEach(function (id) {
      var p = aePaso(id);
      if (p.lamina) { lamina(p, false); return; }
      if (p.cobro) { burbuja('Pago aprobado: ' + dolares(pagado()) + ' USD.', 'yo'); return; }
      burbuja(p.q, 'yo');
      burbuja(textoResp(p, resp[id]), 'tu');
      (aclar[id] || []).forEach(function (a) { burbuja(a.pregunta, p.caso ? 'yo ia' : 'yo'); burbuja(a.respuesta, 'tu'); });
    });
  }
  function autoAlto() { txt.style.height = 'auto'; txt.style.height = Math.min(txt.scrollHeight + 2, 144) + 'px'; }
  // Adjuntos: se guardan en memoria y se suben solo al enviar; las fotos y capturas grandes se reducen antes (JPEG de hasta 2000 px)
  var adjuntos = [], MAX_MB = 5; // sin tope de cantidad (decisión de Carlo, 25 oct 2026); el peso por archivo cuida el espacio de Jotform
  function reducir(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.5e6 || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (img) {
      var k = Math.min(1, 2000 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      if (img.close) img.close();   // suelta la foto descomprimida antes de pasar a la siguiente
      return new Promise(function (ok) { cv.toBlob(function (b) { cv.width = cv.height = 0; ok(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file); }, 'image/jpeg', 0.82); });
    }).catch(function () { return file; });
  }
  function archivos(p, ancla) {
    var c = burbuja('<ul class="a-list"></ul><label class="btn btn-line a-pick">Elegir archivos<input type="file" multiple hidden></label>' +
      '<div class="f-acc"><button type="button" class="btn btn-brass f-ok">Continuar</button><button type="button" class="btn btn-line d-no">No tengo nada que adjuntar</button></div>', 'ficha', true, true);
    var ul = c.querySelector('.a-list'), input = c.querySelector('input[type=file]');
    var pintarA = function () {
      ul.innerHTML = adjuntos.map(function (a, i) { return '<li><span>' + esc(a.name) + '</span><small>' + (a.size / 1e6).toFixed(1) + ' MB</small><button type="button" class="d-x" data-i="' + i + '" aria-label="Quitar ' + esc(a.name) + '">×</button></li>'; }).join('');
    };
    pintarA();
    input.addEventListener('change', function () {
      // Sin archivos vacíos ni el mismo archivo dos veces (mismo nombre, tamaño y fecha que uno ya elegido)
      var clave = function (f) { return f.name + '|' + f.size + '|' + f.lastModified; };
      var nuevos = Array.prototype.slice.call(input.files).filter(function (f, i, todos) {
        return f.size > 0 && !adjuntos.some(function (a) { return a.origen === clave(f); }) &&
          todos.findIndex(function (g) { return clave(g) === clave(f); }) === i;
      }); input.value = '';
      errEl.textContent = '';
      // Una foto a la vez: reducirlas todas juntas llena la memoria del teléfono y puede cerrar la pestaña
      var pesados = [];
      nuevos.reduce(function (cadena, f0) {
        return cadena.then(function () { return reducir(f0); }).then(function (f) {
          if (f.size > MAX_MB * 1e6) pesados.push('«' + f.name + '»'); else { f.origen = clave(f0); adjuntos.push(f); }
          pintarA();
        });
      }, Promise.resolve()).then(function () {
        if (pesados.length) errEl.textContent = (pesados.length > 1 ? pesados.slice(0, -1).join(', ') + ' y ' + pesados[pesados.length - 1] + ' pesan' : pesados[0] + ' pesa') + ' más de ' + MAX_MB + ' MB. Si es un PDF, envía solo las páginas necesarias.';
      });
    });
    c.addEventListener('click', function (e) {
      var b = e.target.closest('.d-x');
      if (b) { adjuntos.splice(+b.dataset.i, 1); pintarA(); }
      else if (e.target.closest('.d-no')) { adjuntos = []; c.remove(); responder([]); }
      else if (e.target.closest('.f-ok')) { c.remove(); responder(adjuntos.map(function (a) { return a.name; })); }
    });
    skipBtn.hidden = true; dudaBtn.hidden = true;
    log.scrollTop += ancla.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
    return c;
  }
  // Barra de progreso con la sección: «Paso 3 de 4 · Tu caso»
  var SEC = {};
  [['Tu consulta', 'tema pais pais2'], ['Datos y pago', 'datos factura fdatos pago'], ['Tu caso', 'caso ecaso cifras espera'], ['Documentos', 'adj']]
    .forEach(function (x) { x[1].split(' ').forEach(function (id) { SEC[id] = x[0]; }); });
  function seccion(id) { return SEC[id] || 'Tu caso'; }
  function progreso(p) {
    var lista = AE.filter(function (x) { return !x.lamina && aplica(x); }), secs = [];
    lista.forEach(function (x) { var n = seccion(x.id); if (secs.indexOf(n) < 0) secs.push(n); });
    document.getElementById('ae-bar').style.width = Math.round(100 * camino.length / (AE.filter(aplica).length + 1)) + '%';
    var el = document.getElementById('ae-paso'); if (!el) return;
    el.textContent = !p ? (resp.pago ? 'Resumen y envío' : '') : !resp.tema ? seccion(p.id) :
      'Paso ' + (secs.indexOf(seccion(p.id)) + 1) + ' de ' + secs.length + ' · ' + seccion(p.id);
  }
  // Después del pago no se vuelve atrás con «Corregir la anterior» más allá del pago
  function bloqueado() { return camino[camino.length - 1] === 'pago'; }
  function preguntar(conPausa) {
    if (editando && editando in resp) depurar();
    guardarCurso();
    actual = siguiente(); errEl.textContent = '';
    progreso(actual && !actual.cobro && !actual.lamina ? actual : null);
    backBtn.hidden = !camino.length || enviado || (editando && editando in resp) || (!editando && bloqueado());
    backBtn.textContent = editando ? '↶ Volver al resumen' : '↶ Corregir la anterior';
    chipsEl.innerHTML = ''; camposEl.hidden = true; row.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    if (!actual) return cierre();
    var p = actual;
    if (p.cobro) {
      // Antes de contar el caso: resumen de lo elegido, condiciones y pago
      actual = null; backBtn.hidden = true;
      if (!ref) ref = 'AE-' + Date.now().toString(36).toUpperCase().slice(-6);
      if (editando) { editando = null; respaldo = null; return mostrarResumen(); }
      burbuja('Gracias, ' + resp.datos.nombre.split(' ')[0] + '. Revisa tus datos, acepta las condiciones y paga; luego me cuentas tu caso.', 'yo', true);
      return setTimeout(mostrarResumen, sinMov ? 0 : 900);
    }
    if (p.lamina) {
      backBtn.hidden = true;
      if (conPausa && !sinMov) { var e1 = burbuja('• • •', 'yo escribe'); setTimeout(function () { e1.remove(); lamina(p, true); }, 550); }
      else lamina(p, true);
      return;
    }
    var mostrar = function () {
      var qb = burbuja(p.q, 'yo', true);
      dudaBtn.hidden = !IA.url || !!p.campos || !!p.caso || p.id === 'factura' || p.id === 'fdatos'; llamarDuda();
      if (p.archivos) return archivos(p, qb);
      if (p.op) {
        var antes = previo[p.id];
        chipsEl.innerHTML = p.op.map(function (o) {
          var marcado = Array.isArray(antes) ? antes.indexOf(o) > -1 : antes === o;
          return '<button type="button" class="chip" aria-pressed="' + marcado + '" data-v="' + esc(o) + '"><b>' + esc(o) + '</b></button>'; }).join('');
        chipsEl.classList.remove('multi');
        if (dlg.open) chipsEl.querySelector('.chip').focus();
      } else {
        row.hidden = false; row.classList.toggle('solo', !!p.campos);
        txt.hidden = !!p.campos; camposEl.hidden = !p.campos;
        okBtn.textContent = p.campos ? 'Continuar' : 'Enviar';
        if (p.campos) document.getElementById('ae-nombre').focus();
        else { txt.value = typeof previo[p.id] === 'string' ? previo[p.id] : ''; txt.placeholder = ej(p.ph) || 'Escribe tu respuesta…'; autoAlto(); txt.focus(); skipBtn.hidden = !p.opcional; }
      }
      log.scrollTop = log.scrollHeight;
    };
    if (conPausa && !sinMov) { var e = burbuja('• • •', 'yo escribe'); setTimeout(function () { e.remove(); mostrar(); }, 550); }
    else mostrar();
  }
  function responder(v) {
    var p = actual; if (!p) return;
    actual = null; modoDuda = false;
    resp[p.id] = v; camino.push(p.id);
    burbuja(textoResp(p, v), 'tu', true);
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true;
    if (IA.url && !p.op && !p.campos && !p.archivos && p.id !== 'fdatos' && p.id !== 'ecaso' && v !== '') return revisar(p);
    preguntar(true);
  }
  function contexto(hasta) {
    // Sin datos personales: a la IA le basta el caso, no el nombre, el correo, la cédula ni el pago
    var privados = ['datos', 'factura', 'fdatos', 'pago'];
    var t = camino.filter(function (id) { return id !== hasta && !aePaso(id).lamina && privados.indexOf(id) < 0; })
      .map(function (id) { var p = aePaso(id); return p.q + '\n' + textoResp(p, resp[id]) + (resumenes[id] ? '\nResumen confirmado: ' + resumenes[id] : ''); }).join('\n\n');
    return t.slice(-8000);
  }
  // Si el asistente falla una vez, el resto del recorrido sigue sin él, sin volver a esperar en cada paso
  function pedirIA(datos) {
    if (IA.caida) return Promise.resolve({ accion: 'seguir' });
    var m = mon(); datos.pais = m.pais; datos.moneda = m.moneda;
    var ctl = window.AbortController ? new AbortController() : null;
    var reloj = setTimeout(function () { if (ctl) ctl.abort(); }, datos.modo === 'caso' ? 22000 : 15000);
    return fetch(IA.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) IA.caida = true; return r.ok ? r.json() : { accion: 'seguir' }; })
      .catch(function () { IA.caida = true; return { accion: 'seguir' }; })
      .then(function (r) { clearTimeout(reloj); return r || { accion: 'seguir' }; });
  }
  function abrirTexto(ph, conSkip, boton) {
    row.hidden = false; row.classList.remove('solo'); txt.hidden = false; camposEl.hidden = true;
    okBtn.textContent = boton || 'Enviar'; txt.value = ''; txt.placeholder = ph; autoAlto(); txt.focus();
    skipBtn.hidden = !conSkip; log.scrollTop = log.scrollHeight;
  }
  // El caso es una entrevista guiada: la IA pregunta lo que falte (modo «caso») y cierra con un resumen que el cliente confirma.
  // En las demás respuestas de texto, la IA solo revisa que sirvan (modo «revisar»). Los topes son un resguardo técnico.
  function revisar(p) {
    var lista = aclar[p.id] || [];
    var espera = burbuja('• • •', 'yo escribe');
    pedirIA({ modo: p.caso ? 'caso' : 'revisar', tema: resp.tema, pregunta: p.q, proposito: p.para || '', objetivo: p.conversa || '', respuesta: textoResp(p, resp[p.id]), aclaraciones: lista, contexto: contexto(p.id) })
      .then(function (r) {
        espera.remove();
        if (camino[camino.length - 1] !== p.id || enviado) return;   // el cliente corrigió mientras tanto
        if (r.accion === 'seguir' || !r.mensaje || lista.length >= (p.caso ? 30 : 2)) return preguntar(false);
        burbuja(r.mensaje, 'yo ia', true);
        if (r.accion === 'resumir') {
          pendiente = { id: p.id, q: r.mensaje, resumen: true };
          return abrirTexto('Escribe «sí» si está correcto, o corrige o añade lo que haga falta…', false, 'Enviar');
        }
        pendiente = { id: p.id, q: r.mensaje };
        abrirTexto(p.caso ? 'Escribe tu respuesta; si no lo sabes, dilo…' : 'Escribe tu respuesta…', !p.caso);
      });
  }
  function aclarar(a) {
    var pe = pendiente; pendiente = null;
    (aclar[pe.id] = aclar[pe.id] || []).push({ pregunta: pe.q, respuesta: a });
    burbuja(a, 'tu', true); row.hidden = true; skipBtn.hidden = true;
    if (a === 'Prefiero no responder') return preguntar(true);
    if (pe.resumen && /^(s[ií]|correcto|exacto|as[ií] es|ok|de acuerdo|perfecto|todo bien|est[aá] bien)(?=$|[\s,.;!])/i.test(a.trim())) {
      resumenes[pe.id] = pe.q;   // el resumen confirmado es lo que Carlo lee primero
      return preguntar(true);
    }
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
      burbuja(m, r.mensaje ? 'yo ia' : 'yo', true); dudas.push({ pregunta: p.q, duda: d, respuesta: m });
      if (!p.op && !p.archivos) abrirTexto(ej(p.ph) || 'Escribe tu respuesta…', p.opcional);
      dudaBtn.hidden = false; log.scrollTop = log.scrollHeight;
    });
  }
  // La primera vez que aparece, el botón del asistente late dos veces para que se note
  var dudaVista = false;
  function llamarDuda() { if (dudaBtn.hidden || dudaVista) return; dudaVista = true; dudaBtn.classList.add('llama'); }
  dudaBtn.addEventListener('click', function () {
    if (!actual || !IA.url) return;
    modoDuda = true; dudaBtn.hidden = true; errEl.textContent = '';
    dudaBtn.classList.remove('llama');
    abrirTexto('Escribe tu duda y mi asistente te responde…', false, 'Preguntar');
  });
  function cierre() {
    document.getElementById('ae-bar').style.width = '100%';
    if (llena()) return cierreEspera();
    if (editando) { editando = null; respaldo = null; return mostrarResumen(); }
    burbuja('Listo, ' + resp.datos.nombre.split(' ')[0] + '. Revisa el resumen de lo que me contaste y envíamelo.', 'yo', true);
    setTimeout(mostrarResumen, sinMov ? 0 : 900);
  }
  // Lista de espera de empresas: los datos y el caso van al formulario de contacto, con el servicio ya elegido, y Carlo avisa por correo cuando llegue el turno
  function cierreEspera() {
    var d = resp.datos, nombre = d.nombre.split(' ')[0];
    var datos = { servicio: 'Consultoría financiera', nombre: d.nombre, email: d.email, whatsapp: d.whatsapp, empresa: '',
      mensaje: 'Lista de espera de la Consulta Express para empresas (la agenda estaba llena). Avisar por correo cuando se pueda atender el caso.\n\nCaso:\n' + resp.ecaso };
    var listo = function () {
      terminado();
      burbuja('Gracias, ' + nombre + '. Anoté tu caso y te escribo a ' + d.email + ' cuando pueda atenderlo, con el enlace para seguir el proceso. Tus datos quedan solo para eso.', 'yo', true);
    };
    if (PRUEBA) { listo(); burbuja('Versión de prueba: no se envía nada. Esto es lo que me llegaría:\n\n' + datos.mensaje, 'yo prueba', true); return; }
    var espera = burbuja('Guardando tus datos…', 'yo', true);
    enviar(FORMS.contacto, datos).then(function () { espera.remove(); listo(); }).catch(function () {
      espera.textContent = 'No pude guardar tus datos. Revisa tu conexión e inténtalo de nuevo.';
      var b = burbuja('<button type="button" class="back">Reintentar</button>', 'yo', true, true);
      b.querySelector('button').addEventListener('click', function () { b.remove(); espera.remove(); cierreEspera(); });
    });
  }
  // Tras corregir un dato: quita respuestas que ya no aplican
  function depurar() {
    AE.forEach(function (p) {
      if (p.id in resp && !aplica(p)) { previo[p.id] = resp[p.id]; delete resp[p.id]; delete aclar[p.id]; delete resumenes[p.id]; }
    });
    camino = camino.filter(function (id) { return id in resp; });
  }
  function enOrden() { return AE.map(function (p) { return p.id; }).filter(function (id) { return id in resp; }); }
  // Precio único, antes de IVA
  function dolares(n) { return '$' + n.toFixed(2); }
  function conIVA(n) { return Math.round(n * (1 + (exterior() ? 0 : IVA)) * 100) / 100; }
  function precio() { return { neto: precioBase(), total: conIVA(precioBase()) }; }
  function pagado() { return Math.round(cobros.reduce(function (t, c) { return t + c.monto; }, 0) * 100) / 100; }
  function fechaEC() { return new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil', dateStyle: 'long', timeStyle: 'short' }); }
  function pintarPrecio() {
    var pr = precio();
    document.getElementById('ae-sub').textContent = '$' + pr.neto + (exterior() ? ' · IVA 0 % por exportación de servicios' : ' + IVA (15 %)');
    document.getElementById('ae-porque').textContent = resp.tema === E ? 'Cubre el análisis previo de tu caso y la coordinación de la cita.' : 'Diagnóstico de tu caso y recomendaciones concretas, por escrito.';
    document.getElementById('ae-total').textContent = dolares(pr.total) + ' USD';
  }
  // Resumen en dos momentos: antes del pago (lo elegido, condiciones y consentimiento) y al final (todo lo que contó, para enviarlo)
  var CERRADOS = ['tema', 'intro', 'pais', 'pais2', 'pago'];
  function mostrarResumen() {
    camino = enOrden();
    var cobro = !resp.pago;
    resLista.innerHTML = camino.filter(function (id) { return !aePaso(id).lamina; }).map(function (id) {
      var p = aePaso(id), fijo = !cobro && CERRADOS.indexOf(id) > -1;
      // Del caso se muestra el resumen que confirmó; si no lo hubo, lo que fue aclarando
      var extra = resumenes[id] ? '<i class="res-ia">✦ Resumen de mi asistente, que confirmaste: ' + esc(resumenes[id]) + '</i>' :
        (aclar[id] || []).map(function (a) { return '<i>' + (p.caso ? esc(a.pregunta) + ' ' : 'Aclaraste: ') + esc(a.respuesta) + '</i>'; }).join('');
      var r = id === 'pago' ? dolares(pagado()) + ' USD, aprobado' : textoResp(p, resp[id]);
      return '<li><span class="res-q">' + esc(RES[id] || p.q) + '</span><span class="res-a">' + esc(r) + extra + '</span>' +
        (fijo ? '' : '<button type="button" class="back res-edit" data-id="' + id + '">Corregir</button>') + '</li>';
    }).join('');
    document.getElementById('ae-res-intro').textContent = cobro ? 'Revisa tus datos. Si algo no está bien, pulsa «Corregir» junto a ese dato.' :
      'Este es el resumen de lo que me contaste. Si algo no está bien, pulsa «Corregir» junto a ese dato.';
    document.querySelector('.res-legal').hidden = !cobro;
    document.querySelector('.res-aviso').hidden = cobro;
    document.getElementById('ae-acepto-t').textContent = cobro ? 'Acepto las condiciones y doy mi consentimiento expreso para que trate mis datos como se indica en ellas.' :
      'Revisé lo que conté y confirmo que es correcto.';
    if (cobro) pintarPrecio();
    else {
      document.getElementById('ae-sub').textContent = 'Pagado';
      document.getElementById('ae-total').textContent = dolares(pagado()) + ' USD';
      document.getElementById('ae-porque').textContent = '';
    }
    acepto.checked = false; pagarBtn.disabled = true; resErr.textContent = '';
    pagarBtn.textContent = cobro ? 'Continuar al pago' : 'Enviar mi caso';
    document.getElementById('ae-res-nota').textContent = cobro ? (pasarela() ? pasarela().nota : '') : BORRADO; borradoVisto = !cobro;
    tituloAE.textContent = cobro ? 'Confirma y paga' : 'Revisa tu caso';
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
    respaldo = { v: resp[id], aclar: aclar[id], resumen: resumenes[id] };
    previo[id] = resp[id]; delete resp[id]; delete aclar[id]; delete resumenes[id];
    camino = camino.filter(function (x) { return x !== id && x in resp; });
    burbuja(id === 'caso' ? 'Cuéntamelo de nuevo; mi asistente te vuelve a preguntar lo que haga falta.' : 'Corrijamos ese dato.', 'yo', true);
    preguntar(false);
  }
  function cancelarCorreccion() {
    var id = editando;
    log.querySelectorAll('.msg.ficha').forEach(function (c) { c.remove(); });
    if (!(id in resp)) {
      resp[id] = respaldo.v; camino.push(id);
      if (respaldo.aclar) aclar[id] = respaldo.aclar;
      if (respaldo.resumen) resumenes[id] = respaldo.resumen;
    }
    editando = null; respaldo = null; actual = null; pendiente = null; modoDuda = false;
    chipsEl.innerHTML = ''; row.hidden = true; camposEl.hidden = true; skipBtn.hidden = true; dudaBtn.hidden = true; errEl.textContent = '';
    mostrarResumen();
  }
  resLista.addEventListener('click', function (e) { var b = e.target.closest('.res-edit'); if (b) corregir(b.dataset.id); });
  acepto.addEventListener('change', function () { pagarBtn.disabled = !acepto.checked; if (acepto.checked) resErr.textContent = ''; });
  pagarBtn.addEventListener('click', function () {
    if (!acepto.checked) { resErr.textContent = resp.pago ? 'Marca la casilla para confirmar lo que contaste.' : 'Marca la casilla para aceptar las condiciones.'; return; }
    if (resp.pago) enviarRespuestas(); else mostrarPago();
  });
  // Lo que se guarda en Jotform: la conversación completa, el resumen del asistente, el alcance pagado y los datos de contacto
  function alcance() {
    return 'Alcance del análisis\n✓ Consulta Express sobre ' + resp.tema.toLowerCase() + ' ($' + precioBase() + ', más impuestos si aplica): ' + (resp.tema === E ? 'análisis previo del caso y cita por acordar' : 'diagnóstico del caso y recomendaciones concretas') +
      '\nPagado: ' + dolares(pagado()) + conIVAtxt() +
      (exterior() ? '\nDeclaró que vive fuera del Ecuador (' + mon().pais + ') y que usará ' + (resp.tema === E ? 'el análisis' : 'el informe') + ' allí: exportación de servicios, factura con IVA 0 %.' : '') +
      (aceptado ? '\n\nAceptó las condiciones (' + CONDICIONES + ') y dio su consentimiento expreso el ' + aceptado + ', hora de Ecuador, antes de pagar.' : '');
  }
  function paquete() {
    camino = enOrden();
    var lineas = camino.filter(function (id) { return ['intro', 'cita', 'pago', 'datos', 'factura', 'fdatos'].indexOf(id) < 0; })
      .map(function (id) {
        var p = aePaso(id);
        if (p.archivos) return 'Archivos adjuntos\n→ ' + textoResp(p, resp[id]);
        return p.q + '\n→ ' + textoResp(p, resp[id]).replace(/\n/g, '\n→ ') +
          (resumenes[id] ? '\n\n  Resumen del asistente, confirmado por el cliente:\n  ' + resumenes[id].replace(/\n/g, '\n  ') + '\n\n  Conversación completa:' : '') +
          (aclar[id] || []).map(function (a) { return '\n  Asistente: ' + a.pregunta + '\n  → ' + a.respuesta; }).join('');
      }).join('\n\n') +
      (dudas.length ? '\n\nDudas que planteó\n' + dudas.map(function (d) { return '· ' + d.duda + ' (en «' + d.pregunta + '»)\n  Asistente: ' + d.respuesta; }).join('\n') : '') +
      '\n\n' + alcance() + '\nRevisó y confirmó lo que contó el ' + fechaEC() + ', hora de Ecuador.' +
      '\n\nPagos\n' + cobros.map(function (c) { return '· ' + c.texto; }).join('\n');
    return { referencia: ref, tema: resp.tema, respuestas: lineas, nombre: resp.datos.nombre, email: resp.datos.email,
      whatsapp: resp.datos.whatsapp, factura: resp.factura + (resp.fdatos ? ' · ' + resp.fdatos : ''),
      pago: cobros.map(function (c) { return c.texto; }).join(' | '), importe: dolares(pagado()) };
  }
  // Constancia del pago en Jotform, con la misma referencia, por si el cliente no llega a enviar su caso
  // La constancia no lleva el sello del servidor: un pago se sella en un solo envío, el del caso, y así un mismo
  // pago nunca vale para dos consultas (scripts/verificar_sellos.mjs marca REPETIDO un sello que aparece en dos envíos).
  function registrarPago(titulo, r) {
    if (PRUEBA) return;
    var texto = r.texto.replace(/ · sello v2~\S+/, ' · el sello del servidor llega con las respuestas');
    enviar(FORMS.analisis, { referencia: ref, tema: resp.tema, nombre: resp.datos.nombre, email: resp.datos.email, whatsapp: resp.datos.whatsapp,
      factura: resp.factura + (resp.fdatos ? ' · ' + resp.fdatos : ''), pago: texto,
      respuestas: titulo + '. El cliente sigue contando su caso; sus respuestas llegan en otro envío con la misma referencia.\n\n' + alcance() + '\n\nPago: ' + texto }).catch(function () {});
  }
  // Pago al inicio: el caso empieza cuando la pasarela confirma el pago completo
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
    cobrar(document.getElementById('ae-pp-btns'), pr.total, 'Consulta Express ' + ref, ref, function (msg) { ppErr.textContent = msg; });
  }
  function pagoAprobado(cobro, r) {
    cobros.push({ monto: r.monto, texto: r.texto });
    resp.pago = r.texto; if (camino.indexOf('pago') < 0) camino.push('pago');
    registrarPago('Pago inicial', r);
    cerrarResumen();
    burbuja('Listo: recibí tu pago de ' + dolares(r.monto) + ' USD. Ahora sí, vamos a tu caso. Si tienes que cerrar esta página, al volver a abrirla en este mismo navegador retomas donde quedaste.', 'yo', true);
    preguntar(true);
  }
  document.getElementById('ae-pp-volver').addEventListener('click', mostrarResumen);
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
      burbuja('Listo: recibí tu caso con la referencia ' + ref + '. ' + (resp.tema === E ? 'Lo analizo y te escribo a ' + resp.datos.email + ' en los próximos días hábiles para acordar el día y la hora de la cita.' : 'Te envío el informe a ' + resp.datos.email + ' entre 3 y 5 días hábiles.') + (borradoVisto ? '' : ' ' + BORRADO), 'yo', true);
    }).catch(function () {
      pagarBtn.disabled = false; pagarBtn.textContent = 'Enviar mi caso';
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
  // Caso en curso, ya pagado: se guarda en este navegador para retomarlo si la página se cierra (los archivos se vuelven a elegir).
  // También se guarda justo antes de salir a una pasarela que lleva a otra página, con el cobro pendiente, para confirmarlo al volver.
  var CURSO = 'ae-curso', porConfirmar = null;
  function guardarCurso(cobro) {
    if ((!resp.pago && !cobro) || enviado || PRUEBA) return;
    try { localStorage.setItem(CURSO, JSON.stringify({ resp: resp, aclar: aclar, dudas: dudas, resumenes: resumenes, ref: ref, cobros: cobros, aceptado: aceptado, camino: camino, cobro: cobro || null, t: Date.now() })); } catch (e) {}
  }
  function borrarCurso() { try { localStorage.removeItem(CURSO); } catch (e) {} }
  function leerCurso() {
    var g = null; try { g = JSON.parse(localStorage.getItem(CURSO)); } catch (e) {}
    if (g && (!g.resp || !(g.resp.pago || g.cobro) || !(Date.now() - g.t < 7 * 864e5))) { borrarCurso(); g = null; }
    return g;
  }
  function retomar() {
    var g = PRUEBA ? null : leerCurso(); if (!g) return false;
    resp = g.resp; aclar = g.aclar || {}; dudas = g.dudas || []; resumenes = g.resumenes || {}; ref = g.ref || '';
    cobros = g.cobros || []; aceptado = g.aceptado || ''; porConfirmar = g.cobro || null;
    previo = {}; enviado = false; editando = null; pendiente = null; modoDuda = false;
    if (Array.isArray(resp.adj) && resp.adj.length) delete resp.adj;
    // Un caso guardado por la versión anterior, con partes y preguntas que ya no existen, sigue desde el pago
    Object.keys(resp).forEach(function (id) { if (!aePaso(id)) { delete resp[id]; delete aclar[id]; } });
    camino = (g.camino || []).filter(function (id) { return id in resp; });
    return true;
  }
  chipsEl.addEventListener('click', function (e) {
    var c = e.target.closest('.chip'); if (!c || !actual) return;
    responder(c.dataset.v);
  });
  inForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (modoDuda || pendiente) {
      var t = txt.value.trim();
      if (!t) { errEl.textContent = modoDuda ? 'Escribe tu duda.' : 'Escríbeme aunque sea una frase.'; txt.focus(); return; }
      errEl.textContent = '';
      return modoDuda ? enviarDuda(t) : aclarar(t);
    }
    if (!actual || actual.op || actual.archivos) return;
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
    responder('');
  });
  backBtn.addEventListener('click', function () {
    if (editando) return cancelarCorreccion();
    if (!camino.length || enviado) return;
    pendiente = null; modoDuda = false;
    var id = camino.pop(); previo[id] = resp[id]; delete resp[id]; delete aclar[id]; delete resumenes[id];
    pintar(); preguntar(false);
  });
  function abrir() {
    if (typeof dlg.showModal !== 'function') { location.hash = '#contacto'; return; }
    if (enviado) { cobros = []; aceptado = ''; adjuntos = []; resp = {}; camino = []; previo = {}; aclar = {}; dudas = []; resumenes = {}; pendiente = null; modoDuda = false; ref = ''; enviado = false; editando = null; log.innerHTML = ''; cerrarResumen(); }
    dlg.showModal(); document.documentElement.style.overflow = 'hidden';
    if (!log.children.length) {
      var sigue = retomar();
      // Desde la portada, «Agenda tu cita» llega con el tema de empresa ya elegido
      if (!sigue && location.hash === '#empresa') { resp.tema = E; camino.push('tema'); }
      pintar();
      if (porConfirmar) return confirmarAlVolver();
      if (sigue) burbuja('Retomemos donde quedaste. Tu pago ya está registrado.', 'yo', true);
      preguntar(true);
    }
  }
  // De vuelta de una pasarela que llevó al cliente a otra página: ella confirma el pago y el recorrido sigue, o se vuelve a ofrecer el pago
  function confirmarAlVolver() {
    var cobro = porConfirmar, p = pasarela(); porConfirmar = null;
    if (!volvio()) {   // dejó el pago sin terminarlo: se le vuelve a ofrecer
      if (resp.pago) guardarCurso(); else borrarCurso();
      return preguntar(true);
    }
    var espera = burbuja('Estoy confirmando tu pago…', 'yo', true);
    var mal = function (msg) {
      espera.remove(); if (resp.pago) guardarCurso(); else borrarCurso();
      burbuja((msg || 'El pago no se completó.') + ' Puedes intentarlo de nuevo.', 'yo', true);
      preguntar(true);
    };
    if (!p || !p.vuelta) return mal('No pude confirmar tu pago.');
    p.vuelta(cobro, function (r) { espera.remove(); pagoAprobado(cobro, r); }, mal);
  }
  dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.getElementById('ae-x').addEventListener('click', function () { dlg.close(); });
  document.querySelectorAll('[data-ae]').forEach(function (b) { b.addEventListener('click', abrir); });
  if (/^#(empezar|analisis-expres|empresa|persona)$/.test(location.hash)) abrir();
  // Si quedó un caso pagado a medias en este navegador, se abre solo para retomarlo
  function volvio() { var p = pasarela(); return !p || !p.volvio || p.volvio(); }
  servicios.then(function () { var g = !dlg.open && !PRUEBA && leerCurso(); if (g && (g.resp.pago || volvio())) abrir(); });
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
    // Red de seguridad: si el navegador no avisa (Safari a veces no lo hace al volver a una pestaña o con una copia
    // guardada), todo lo que ya está a la vista o quedó arriba aparece igual; y ante cualquier error, se muestra todo.
    var revisar = function () {
      var h = window.innerHeight;
      objetivos.forEach(function (n) { if (!n.classList.contains('in') && n.getBoundingClientRect().top < h) { n.classList.add('in'); io.unobserve(n); } });
    };
    var espera = null;
    window.addEventListener('scroll', function () { if (!espera) espera = setTimeout(function () { espera = null; revisar(); }, 400); }, { passive: true });
    window.addEventListener('load', function () { setTimeout(revisar, 1500); });
    window.addEventListener('pageshow', function () { setTimeout(revisar, 300); });
    window.addEventListener('error', function () { document.documentElement.classList.remove('js-r'); });
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
