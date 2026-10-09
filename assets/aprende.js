/* Página «Aprende finanzas»: videos, calculadoras, gráficas y la Consulta Express fija. Todo dentro de una función para no chocar con nombres de otros scripts. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var f0 = new Intl.NumberFormat('es', { maximumFractionDigits: 0 });
  var f1 = new Intl.NumberFormat('es', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  var fFecha = new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  var fFechaL = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  function usd(v) { return (v < 0 ? '−$' : '$') + f0.format(Math.abs(Math.round(v))); }
  function pct(v, d) { return (d ? f1 : f0).format(v) + ' %'; }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sv(name, attrs, parent, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function anio() { var a = $('anio'); if (a) a.textContent = new Date().getFullYear(); }
  anio();

  /* ---------- Formularios: filas con etiqueta y número ---------- */
  // campos: [{id, l, s, v, step, min, max, full}]
  function formulario(cont, campos, antes) {
    var html = '<form class="ledger" autocomplete="off" novalidate>' + (antes || '') + '<div class="campos">';
    campos.forEach(function (c) {
      html += '<div class="row' + (c.full ? ' full' : '') + '"><label for="' + c.id + '">' + c.l + (c.s ? '<small>' + c.s + '</small>' : '') + '</label>' +
        '<input id="' + c.id + '" type="number" inputmode="decimal" step="' + (c.step || 1) + '"' + (c.min != null ? ' min="' + c.min + '"' : '') + (c.max != null ? ' max="' + c.max + '"' : '') + ' value="' + c.v + '"></div>';
    });
    html += '</div></form><div class="herr-out"></div>';
    cont.innerHTML = html;
    var form = cont.querySelector('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    return { form: form, out: cont.querySelector('.herr-out'), n: function (id) { var v = parseFloat($(id).value); return isFinite(v) ? v : 0; } };
  }
  function tarjetas(items) {
    return '<div class="herr-res">' + items.map(function (t) {
      return '<div><span class="k">' + t.k + '</span><span class="v' + (t.c ? ' ' + t.c : '') + '">' + t.v + '</span>' + (t.s ? '<span class="s">' + t.s + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function hbars(items, max) {
    max = max || Math.max.apply(null, items.map(function (i) { return i.v; }));
    return '<div class="hbars">' + items.map(function (i) {
      return '<div class="hbar' + (i.hi ? ' hi' : '') + '"><span class="name">' + i.n + (i.s ? '<small>' + i.s + '</small>' : '') + '</span><span class="track"><span class="fill" style="width:' + Math.max(0.6, 100 * i.v / max * 0.78).toFixed(1) + '%"></span><span class="val" style="left:' + Math.max(0.6, 100 * i.v / max * 0.78).toFixed(1) + '%">' + i.t + '</span></span></div>';
    }).join('') + '</div>';
  }

  /* ---------- Gráfica de líneas sencilla ---------- */
  // o: {series:[{pts:[[x,y]], color, w, area, dash}], xmin,xmax,ymin,ymax, log, xt:[valores], yt:[valores], fx, fy, h, marcas:[{x,y,t}], zona:{x0,x1}}
  function lineas(svg, o) {
    var W = Math.max((svg.parentNode.clientWidth || 600) - 32, 260), H = o.h || 240, L = o.L || 52, R = 14, T = 12, B = 28;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = '';
    var ly = function (v) { return o.log ? Math.log10(Math.max(v, 1e-9)) : v; };
    var X = function (x) { return L + (W - L - R) * (x - o.xmin) / (o.xmax - o.xmin || 1); };
    var Y = function (y) { return T + (H - T - B) * (1 - (ly(y) - ly(o.ymin)) / (ly(o.ymax) - ly(o.ymin) || 1)); };
    var g = sv('g', {}, svg);
    (o.yt || []).forEach(function (v) {
      sv('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), 'class': 'grid-line' }, g);
      sv('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end' }, g, o.fy ? o.fy(v) : v);
    });
    (o.xt || []).forEach(function (v) { sv('text', { x: X(v), y: H - 8, 'text-anchor': 'middle' }, g, o.fx ? o.fx(v) : v); });
    if (o.zona) sv('rect', { x: X(o.zona.x0), y: T, width: Math.max(0, X(o.zona.x1) - X(o.zona.x0)), height: H - T - B, fill: 'var(--neg)', opacity: 0.08 }, svg);
    o.series.forEach(function (s) {
      if (!s.pts.length) return;
      var d = s.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join('');
      if (s.area) sv('path', { d: d + 'L' + X(s.pts[s.pts.length - 1][0]).toFixed(1) + ',' + Y(o.ymin) + 'L' + X(s.pts[0][0]).toFixed(1) + ',' + Y(o.ymin) + 'Z', fill: s.color, opacity: s.area }, svg);
      sv('path', { d: d, fill: 'none', stroke: s.color, 'stroke-width': s.w || 2, 'stroke-linejoin': 'round', 'stroke-dasharray': s.dash || 'none' }, svg);
    });
    (o.marcas || []).forEach(function (m) {
      sv('circle', { cx: X(m.x), cy: Y(m.y), r: 4.5, fill: m.color || 'var(--brass)', stroke: 'var(--surface)', 'stroke-width': 2 }, svg);
      if (m.t) {
        var izq = X(m.x) > W * 0.7;
        sv('text', { x: X(m.x) + (izq ? -8 : 8), y: Y(m.y) + (m.dy || -8), 'text-anchor': izq ? 'end' : 'start', style: 'font-weight:500;fill:var(--ink)' }, svg, m.t);
      }
    });
    return { X: X, Y: Y, W: W, H: H, L: L, R: R, T: T, B: B };
  }
  var redibujar = [];
  var tRes;
  window.addEventListener('resize', function () { clearTimeout(tRes); tRes = setTimeout(function () { redibujar.forEach(function (f) { f(); }); }, 150); });
  function grafica(cont, leyenda) {
    var box = document.createElement('div'); box.className = 'chart-box';
    box.innerHTML = (leyenda ? '<ul class="legend">' + leyenda + '</ul>' : '') + '<svg role="img"></svg>';
    cont.appendChild(box);
    return box.querySelector('svg');
  }
  function pasos(max, n) {
    var bruto = max / (n || 4), mag = Math.pow(10, Math.floor(Math.log10(bruto || 1))), paso = [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; }).filter(function (p) { return p >= bruto; })[0];
    var out = []; for (var v = 0; ; v += paso) { out.push(v); if (v >= max - 1e-9) break; } return out;
  }
  function corto(v) { return v >= 1e6 ? f1.format(v / 1e6) + ' M' : v >= 1e3 ? (v % 1000 ? f1.format(v / 1e3) : f0.format(v / 1e3)) + ' k' : f0.format(v); }

  /* ---------- Videos: la miniatura se cambia por el reproductor ---------- */
  document.querySelectorAll('.yt').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.dataset.id) + '?autoplay=1&rel=0';
      f.title = b.getAttribute('aria-label').replace('Reproducir el video: ', '');
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      var d = document.createElement('div'); d.className = 'yt'; d.appendChild(f);
      b.replaceWith(d);
    });
  });

  /* ---------- 1. Metas: cuánto tendrás ---------- */
  (function () {
    var c = $('h-meta'); if (!c) return;
    var F = formulario(c, [
      { id: 'mt-cap', l: 'Capital que inviertes hoy', s: 'en dólares', v: 10000, step: 1000, min: 0 },
      { id: 'mt-ap', l: 'Aporte mensual', s: 'lo que sumas cada mes', v: 300, step: 50, min: 0 },
      { id: 'mt-r', l: 'Rendimiento anual', s: '% esperado', v: 8, step: 0.5 },
      { id: 'mt-n', l: 'Años', s: 'cuánto mantienes el compromiso', v: 25, min: 1, max: 60 }
    ], '');
    F.form.insertAdjacentHTML('beforeend', '<label class="check" for="mt-inf"><input id="mt-inf" type="checkbox"><span>Descontar inflación de 3 % anual<br><small style="color:var(--ink-soft)">El resultado queda en dinero de hoy.</small></span></label>');
    var svg;
    function calc() {
      var cap = F.n('mt-cap'), ap = F.n('mt-ap'), r = F.n('mt-r') / 100, n = Math.max(1, Math.min(60, Math.round(F.n('mt-n')))), inf = $('mt-inf').checked ? 0.03 : 0;
      var rr = (1 + r) / (1 + inf) - 1, rm = Math.pow(1 + rr, 1 / 12) - 1;
      var v = cap, aport = cap, ptsV = [[0, cap]], ptsA = [[0, cap]];
      for (var a = 1; a <= n; a++) {
        for (var m = 0; m < 12; m++) { v = v * (1 + rm) + ap; aport += ap; }
        ptsV.push([a, v]); ptsA.push([a, aport]);
      }
      F.out.innerHTML = tarjetas([
        { k: 'Tendrás' + (inf ? ', en dinero de hoy' : ''), v: usd(v) },
        { k: 'Lo que aportaste', v: usd(aport) },
        { k: 'Lo que generó el interés compuesto', v: usd(v - aport), c: 'pos', s: pct(aport ? 100 * (v - aport) / v : 0) + ' del total' }
      ]);
      svg = grafica(F.out, '<li><i style="background:var(--c1)"></i>Total</li><li><i style="background:var(--c2)"></i>Lo que aportas</li>');
      var max = pasos(v, 4); var top = max[max.length - 1];
      lineas(svg, { series: [{ pts: ptsV, color: 'var(--c1)', area: 0.15, w: 2.5 }, { pts: ptsA, color: 'var(--c2)', area: 0.25 }], xmin: 0, xmax: n, ymin: 0, ymax: top, yt: max, fy: corto, xt: pasos(n, 5).filter(function (x) { return x <= n; }), fx: function (x) { return x + ' a'; } });
    }
    F.form.addEventListener('input', calc); redibujar.push(calc); calc();
  })();

  /* ---------- 2. El costo de esperar ---------- */
  (function () {
    var c = $('h-esperar'); if (!c) return;
    var F = formulario(c, [
      { id: 'es-ap', l: 'Aporte mensual', s: 'en dólares', v: 200, step: 50, min: 0 },
      { id: 'es-r', l: 'Rendimiento anual', s: '%', v: 8, step: 0.5 },
      { id: 'es-e', l: 'Tu edad hoy', v: 25, min: 15, max: 70 },
      { id: 'es-j', l: 'Edad a la que dejas de aportar', v: 65, min: 30, max: 90 }
    ]);
    function fv(ap, rm, meses) { return meses <= 0 ? 0 : ap * (Math.pow(1 + rm, meses) - 1) / rm; }
    function calc() {
      var ap = F.n('es-ap'), r = F.n('es-r') / 100, e = F.n('es-e'), j = F.n('es-j'), rm = Math.pow(1 + r, 1 / 12) - 1 || 1e-9;
      var esp = [0, 5, 10, 15].filter(function (w) { return e + w < j; });
      var vals = esp.map(function (w) { return { w: w, v: fv(ap, rm, (j - e - w) * 12) }; });
      if (!vals.length) { F.out.innerHTML = '<p class="veredicto">Revisa las edades: la de retiro debe ser mayor que la actual.</p>'; return; }
      var hoy = vals[0].v, diez = vals.filter(function (x) { return x.w === 10; })[0];
      var html = '';
      if (diez) {
        var meses10 = (j - e - 10) * 12, apNec = hoy * rm / (Math.pow(1 + rm, meses10) - 1);
        html += tarjetas([
          { k: 'Si empiezas hoy, a los ' + j + ' tendrás', v: usd(hoy) },
          { k: 'Si esperas 10 años', v: usd(diez.v), c: 'neg', s: usd(hoy - diez.v) + ' menos (' + pct(100 * (1 - diez.v / hoy)) + ')' },
          { k: 'Para alcanzarte empezando 10 años tarde', v: usd(apNec) + '/mes', s: f1.format(apNec / ap) + ' veces tu aporte' }
        ]);
      } else html += tarjetas([{ k: 'Si empiezas hoy, a los ' + j + ' tendrás', v: usd(hoy) }]);
      html += '<div class="chart-box">' + hbars(vals.map(function (x) { return { n: x.w ? 'Empiezas a los ' + (e + x.w) : 'Empiezas hoy', s: (j - e - x.w) + ' años aportando', v: x.v, t: usd(x.v), hi: !x.w }; })) + '</div>';
      F.out.innerHTML = html;
    }
    F.form.addEventListener('input', calc); calc();
  })();

  /* ---------- 3. Jubilación ---------- */
  (function () {
    var c = $('h-jub'); if (!c) return;
    var F = formulario(c, [
      { id: 'jb-e', l: 'Tu edad hoy', v: 35, min: 18, max: 80 },
      { id: 'jb-j', l: 'Edad de jubilación', v: 65, min: 40, max: 85 },
      { id: 'jb-a', l: 'Años de jubilación', s: 'cuánto debe durar el dinero', v: 25, min: 5, max: 45 },
      { id: 'jb-g', l: 'Gasto mensual deseado', s: 'en dinero de hoy', v: 1500, step: 100, min: 0 },
      { id: 'jb-p', l: 'Pensión mensual esperada', s: 'en dinero de hoy, si la tendrás', v: 0, step: 100, min: 0 },
      { id: 'jb-s', l: 'Ahorro que ya tienes', s: 'para la jubilación', v: 10000, step: 1000, min: 0 },
      { id: 'jb-r', l: 'Rendimiento anual', s: '% de tus inversiones', v: 7, step: 0.5 },
      { id: 'jb-i', l: 'Inflación anual', s: '%', v: 3, step: 0.5 }
    ]);
    function calc() {
      var e = F.n('jb-e'), j = F.n('jb-j'), A = F.n('jb-a'), g = F.n('jb-g'), p = F.n('jb-p'), s = F.n('jb-s'), r = F.n('jb-r') / 100, inf = F.n('jb-i') / 100;
      var n = Math.max(0, j - e), rr = (1 + r) / (1 + inf) - 1, rm = Math.pow(1 + rr, 1 / 12) - 1, falta = Math.max(0, g - p);
      var N = A * 12, M = n * 12;
      var necesita = Math.abs(rm) < 1e-9 ? falta * N : falta * (1 - Math.pow(1 + rm, -N)) / rm * (1 + rm);
      var sFut = s * Math.pow(1 + rm, M), brecha = Math.max(0, necesita - sFut);
      var aporte = M <= 0 ? brecha : Math.abs(rm) < 1e-9 ? brecha / M : brecha * rm / (Math.pow(1 + rm, M) - 1);
      F.out.innerHTML = tarjetas([
        { k: 'Capital necesario al jubilarte', v: usd(necesita), s: 'en dinero de hoy; unos ' + usd(necesita * Math.pow(1 + inf, n)) + ' de ese año' },
        { k: 'Lo que tu ahorro actual alcanzará', v: usd(sFut), s: 'en dinero de hoy' },
        { k: 'Ahorro mensual necesario', v: brecha ? usd(aporte) : '$0', c: brecha ? '' : 'pos', s: brecha ? 'en dinero de hoy, subiéndolo con la inflación' : 'tu ahorro actual ya alcanza' }
      ]) + '<p class="veredicto">' + (brecha ? 'Con ' + usd(aporte) + ' al mes desde hoy, a los ' + j + ' años tendrías lo necesario para retirar ' + usd(falta) + ' al mes (en dinero de hoy) durante ' + A + ' años.' : 'Con lo que ya tienes invertido llegarías a tu meta si mantienes ese rendimiento.') + '</p>';
      var pts = [], v = s;
      for (var k = 0; k <= M + N; k++) {
        if (k % 12 === 0) pts.push([e + k / 12, Math.max(0, v)]);
        v = k < M ? v * (1 + rm) + aporte : v * (1 + rm) - falta;
      }
      var max = pasos(Math.max.apply(null, pts.map(function (q) { return q[1]; })) || 1, 4);
      var svg = grafica(F.out, '<li><i style="background:var(--c1)"></i>Tu capital, en dinero de hoy</li>');
      lineas(svg, { series: [{ pts: pts, color: 'var(--c1)', area: 0.15, w: 2.5 }], xmin: e, xmax: j + A, ymin: 0, ymax: max[max.length - 1], yt: max, fy: corto, xt: pasos(j + A - e, 5).map(function (x) { return x + e; }).filter(function (x) { return x <= j + A; }), fx: function (x) { return Math.round(x) + ' a'; }, marcas: [{ x: j, y: pts[Math.min(n, pts.length - 1)] ? pts[Math.min(n, pts.length - 1)][1] : 0, t: 'Jubilación' }] });
    }
    F.form.addEventListener('input', calc); redibujar.push(calc); calc();
  })();

  /* ---------- 4. Apalancamiento ---------- */
  (function () {
    var c = $('h-apal'); if (!c) return;
    var F = formulario(c, [
      { id: 'ap-c', l: 'Tu capital', s: 'dinero propio', v: 10000, step: 1000, min: 0 },
      { id: 'ap-t', l: 'Interés del préstamo', s: '% anual', v: 8, step: 0.5, min: 0 },
      { id: 'ap-m', l: 'Margen mínimo del bróker', s: '% de la posición', v: 25, step: 5, min: 0, max: 90 }
    ], '');
    F.form.insertAdjacentHTML('beforeend',
      '<div class="rango"><label for="ap-l">Apalancamiento <output id="ap-lo"></output></label><input type="range" id="ap-l" min="1" max="10" step="0.5" value="3"></div>' +
      '<div class="rango"><label for="ap-x">Lo que se mueve el activo en un año <output id="ap-xo"></output></label><input type="range" id="ap-x" min="-60" max="60" step="1" value="-15"></div>');
    function ret(Lv, m, t) { return Math.max(-1, Lv * m - (Lv - 1) * t); }
    function calc() {
      var C = F.n('ap-c'), t = F.n('ap-t') / 100, mm = Math.min(0.9, F.n('ap-m') / 100), Lv = parseFloat($('ap-l').value), m = parseFloat($('ap-x').value) / 100;
      $('ap-lo').textContent = f1.format(Lv) + ' a 1'; $('ap-xo').textContent = (m > 0 ? '+' : '') + f0.format(m * 100) + ' %';
      var r1 = m, rL = ret(Lv, m, t), liq = Lv > 1 ? 1 - (Lv - 1) / ((1 - mm) * Lv) : null;
      var liquidado = liq !== null && -m >= liq;
      F.out.innerHTML = tarjetas([
        { k: 'Sin apalancamiento', v: usd(C * r1), c: r1 < 0 ? 'neg' : 'pos', s: pct(r1 * 100) + ' de tu capital' },
        { k: 'Con ' + f1.format(Lv) + ' a 1 (posición de ' + usd(C * Lv) + ')', v: liquidado ? 'Liquidado' : usd(C * rL), c: rL < 0 || liquidado ? 'neg' : 'pos', s: liquidado ? 'el bróker vende antes de esa caída' : pct(rL * 100) + ' de tu capital, ya pagado el interés' },
        { k: 'Caída que activa la liquidación', v: liq !== null ? '−' + pct(liq * 100, true) : 'Ninguna', s: liq !== null ? 'con un margen mínimo de ' + pct(mm * 100) : 'sin préstamo no hay llamada de margen' }
      ]);
      var a = [], b = [];
      for (var x = -60; x <= 60; x += 1) { a.push([x, ret(1, x / 100, 0) * 100]); b.push([x, ret(Lv, x / 100, t) * 100]); }
      var top = Math.max(100, Math.ceil(ret(Lv, 0.6, t) * 100 / 100) * 100), yt = [-100, 0]; for (var y = 100; y <= top; y += top > 400 ? 200 : 100) yt.push(y);
      var svg = grafica(F.out, '<li><i style="background:var(--muted-mark)"></i>Sin apalancamiento</li><li><i style="background:var(--c1)"></i>Con ' + f1.format(Lv) + ' a 1</li><li><i style="background:var(--neg);opacity:.3"></i>Zona de liquidación</li>');
      lineas(svg, { series: [{ pts: a, color: 'var(--muted-mark)', w: 2 }, { pts: b, color: 'var(--c1)', w: 2.5 }], xmin: -60, xmax: 60, ymin: -100, ymax: top, yt: yt, fy: function (v) { return v + ' %'; }, xt: [-60, -30, 0, 30, 60], fx: function (v) { return (v > 0 ? '+' : '') + v + ' %'; }, zona: liq !== null && liq < 0.6 ? { x0: -60, x1: -liq * 100 } : null, marcas: [{ x: m * 100, y: rL * 100, t: liquidado ? 'liquidado' : pct(rL * 100), color: rL < 0 ? 'var(--neg)' : 'var(--c1)' }], h: 260 });
    }
    F.form.addEventListener('input', calc); redibujar.push(calc); calc();
  })();

  /* ---------- 5. Trading: el estudio de Brasil ---------- */
  (function () {
    var c = $('h-trading'); if (!c) return;
    var d = [['1 día', 29.8], ['2 a 50 días', 15.5], ['51 a 100 días', 8.9], ['101 a 200 días', 6.8], ['201 a 300 días', 5.4], ['Más de 300 días', 3.0]];
    c.innerHTML = '<div class="chart-box"><p class="small-note" style="margin:0 0 .8rem">Porcentaje de personas que terminaron con ganancia neta, según cuántos días hicieron trading</p>' +
      hbars(d.map(function (x, i) { return { n: x[0], v: x[1], t: pct(x[1], true), hi: i === d.length - 1 }; }), 30) +
      '<p class="small-note">De los 1.551 que insistieron más de 300 días, solo 17 (1,1 %) ganaron más que el salario mínimo de Brasil, unos 16 dólares al día.</p></div>';
  })();

  /* ---------- 6. Bitcoin: precio desde 2013 ---------- */
  (function () {
    var c = $('h-btc'); if (!c) return;
    var VIDEO = '2023-02-23';
    fetch('/data/btc.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      if (!data || !data.items || data.items.length < 50) return;
      var p = data.items.map(function (x) { return [Date.parse(x[0] + 'T00:00:00Z'), x[1], x[0]]; });
      var hoy = p[p.length - 1], tv = Date.parse(VIDEO + 'T00:00:00Z');
      var enVideo = p.reduce(function (a, b) { return Math.abs(b[0] - tv) < Math.abs(a[0] - tv) ? b : a; });
      var maxi = p.reduce(function (a, b) { return b[1] > a[1] ? b : a; });
      // Grandes caídas: desde cada máximo histórico hasta el mínimo previo al siguiente máximo
      var caidas = [], pico = p[0], valle = p[0];
      p.forEach(function (q) {
        if (q[1] > pico[1]) { if (1 - valle[1] / pico[1] >= 0.5) caidas.push([pico, valle]); pico = q; valle = q; }
        else if (q[1] < valle[1]) valle = q;
      });
      var actual = 1 - hoy[1] / pico[1];
      var html = tarjetas([
        { k: 'Precio hoy', v: usd(hoy[1]), s: fFechaL.format(new Date(hoy[0])) },
        { k: 'Cuando grabé el video', v: usd(enVideo[1]), s: '× ' + f1.format(hoy[1] / enVideo[1]) + ' desde entonces' },
        { k: 'Máximo histórico, al cierre de semana', v: usd(maxi[1]), s: fFecha.format(new Date(maxi[0])) + (actual > 0.05 ? ' · hoy ' + pct(-actual * 100) + ' por debajo' : '') }
      ]);
      c.innerHTML = html;
      var svg = grafica(c, '<li><i class="line" style="background:var(--c1)"></i>Precio de un bitcoin en dólares, escala logarítmica</li>');
      var tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; svg.parentNode.appendChild(tip);
      var g;
      function dibujar() {
        var y0 = new Date(p[0][0]).getUTCFullYear(), y1 = new Date(hoy[0]).getUTCFullYear(), xt = [];
        for (var y = y0 + 1; y <= y1; y += (y1 - y0 > 8 ? 2 : 1)) xt.push(Date.UTC(y, 0, 1));
        g = lineas(svg, { series: [{ pts: p, color: 'var(--c1)', w: 2, area: 0.08 }], xmin: p[0][0], xmax: hoy[0], ymin: 50, ymax: 200000, log: true, yt: [100, 1000, 10000, 100000], fy: corto, xt: xt, fx: function (t) { return new Date(t).getUTCFullYear(); }, h: 280, L: 46,
          marcas: [{ x: enVideo[0], y: enVideo[1], t: 'video, ' + usd(enVideo[1]), dy: 18 }, { x: maxi[0], y: maxi[1], t: 'máximo', dy: -10, color: 'var(--c2)' }, { x: hoy[0], y: hoy[1], t: 'hoy', dy: 18, color: 'var(--c1)' }] });
      }
      dibujar(); redibujar.push(dibujar);
      svg.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * (g.W / r.width);
        var t = p[0][0] + (x - g.L) / (g.W - g.L - g.R) * (hoy[0] - p[0][0]);
        var q = p.reduce(function (a, b) { return Math.abs(b[0] - t) < Math.abs(a[0] - t) ? b : a; });
        tip.innerHTML = '<b>' + usd(q[1]) + '</b><br>' + fFechaL.format(new Date(q[0]));
        tip.style.left = (g.X(q[0]) * r.width / g.W + 16) + 'px'; tip.style.top = (g.Y(q[1]) * r.height / g.H + 16) + 'px'; tip.hidden = false;
      });
      svg.addEventListener('pointerleave', function () { tip.hidden = true; });
      var filas = caidas.map(function (cv) { return '<tr><td>' + fFecha.format(new Date(cv[0][0])) + ' → ' + fFecha.format(new Date(cv[1][0])) + '</td><td>' + usd(cv[0][1]) + ' → ' + usd(cv[1][1]) + '</td><td>' + pct(-(1 - cv[1][1] / cv[0][1]) * 100) + '</td></tr>'; }).join('');
      if (filas) c.insertAdjacentHTML('beforeend', '<details class="data" open><summary>Las grandes caídas</summary><table><thead><tr><th>Del máximo al mínimo</th><th>Precio</th><th>Caída</th></tr></thead><tbody>' + filas + '</tbody></table></details>');
      c.insertAdjacentHTML('beforeend', '<div class="ledger" style="margin-top:1rem"><div class="row"><label for="bt-m">Si hubieras invertido el día del video<small>' + fFechaL.format(new Date(enVideo[0])) + '</small></label><input id="bt-m" type="number" inputmode="decimal" min="0" step="50" value="100"></div><p class="veredicto" id="bt-r" style="margin:.6rem 0 0"></p></div>' +
        '<p class="small-note">Precios semanales de Kraken, actualizados cada seis horas. ' + esc('Rendimientos pasados no garantizan rendimientos futuros.') + '</p>');
      function inv() { var m = parseFloat($('bt-m').value) || 0; $('bt-r').textContent = 'Hoy tendrías ' + usd(m * hoy[1] / enVideo[1]) + ', después de haber visto caer tu inversión varias veces en el camino.'; }
      $('bt-m').addEventListener('input', inv); inv();
    }).catch(function () {});
  })();

  /* ---------- 7. Casa ---------- */
  (function () {
    var c = $('h-casa'); if (!c) return;
    var F = formulario(c, [
      { id: 'cs-p', l: 'Precio de la vivienda', v: 80000, step: 1000, min: 0 },
      { id: 'cs-e', l: 'Entrada', s: '% que pagas de contado', v: 20, step: 5, min: 0, max: 100 },
      { id: 'cs-t', l: 'Tasa de interés', s: '% anual; ejemplo, consulta la vigente', v: 9, step: 0.25, min: 0 },
      { id: 'cs-n', l: 'Plazo', s: 'años', v: 20, min: 1, max: 30 },
      { id: 'cs-i', l: 'Ingreso familiar', s: 'mensual, neto', v: 2500, step: 100, min: 0 },
      { id: 'cs-d', l: 'Otras deudas', s: 'cuotas mensuales que ya pagas', v: 0, step: 50, min: 0 }
    ]);
    function cuota(P, i, n) { return i > 0 ? P * i / (1 - Math.pow(1 + i, -n)) : P / n; }
    function calc() {
      var P = F.n('cs-p'), e = F.n('cs-e') / 100, t = F.n('cs-t') / 100, n = Math.max(1, Math.round(F.n('cs-n'))) * 12, I = F.n('cs-i'), D = F.n('cs-d'), i = t / 12;
      var prestamo = P * (1 - e), q = cuota(prestamo, i, n), carga = I ? (q + D) / I : 0, extra = P * 0.01 / 12;
      var qMax = Math.max(0, 0.3 * I - D), pMax = (i > 0 ? qMax * (1 - Math.pow(1 + i, -n)) / i : qMax * n) / Math.max(0.01, 1 - e);
      F.out.innerHTML = tarjetas([
        { k: 'Cuota mensual', v: usd(q), s: 'más unos ' + usd(extra) + ' de mantenimiento, predial y seguros' },
        { k: 'Tus cuotas sobre tu ingreso', v: pct(carga * 100), c: carga > 0.4 ? 'neg' : carga <= 0.3 ? 'pos' : '', s: 'lo sano es hasta 30 %' },
        { k: 'Intereses en todo el plazo', v: usd(q * n - prestamo), s: 'sobre un préstamo de ' + usd(prestamo) }
      ]) + '<p class="veredicto ' + (carga <= 0.3 ? 'ok' : carga > 0.4 ? 'bad' : '') + '">' +
        (carga <= 0.3 ? 'La cuota cabe en tu presupuesto. ' : carga > 0.4 ? 'La cuota compromete demasiado tu ingreso: ante cualquier imprevisto quedas sin margen. ' : 'Es posible, pero ajustado: conviene más entrada o más plazo. ') +
        'Con tu ingreso y estas condiciones, una vivienda de hasta <strong>' + usd(pMax) + '</strong> mantiene tus cuotas en el 30 %.</p>';
      var anios = n / 12, saldo = prestamo, intA = [], capA = [];
      for (var a = 1; a <= anios; a++) { var ia = 0, ca = 0; for (var m = 0; m < 12; m++) { var it = saldo * i; ia += it; ca += q - it; saldo -= q - it; } intA.push(ia); capA.push(ca); }
      var svg = grafica(F.out, '<li><i style="background:var(--c2)"></i>Intereses pagados cada año</li><li><i style="background:var(--c1)"></i>Capital pagado cada año</li>');
      var W = Math.max(svg.parentNode.clientWidth - 32, 260), H = 200, L = 46, B = 24, T = 8, tope = pasos(q * 12, 3), top = tope[tope.length - 1], bw = (W - L - 10) / anios;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = '';
      tope.forEach(function (v) { var y = T + (H - T - B) * (1 - v / top); sv('line', { x1: L, x2: W - 10, y1: y, y2: y, 'class': 'grid-line' }, svg); sv('text', { x: L - 6, y: y + 4, 'text-anchor': 'end' }, svg, corto(v)); });
      intA.forEach(function (ia, k) {
        var x = L + k * bw + bw * 0.15, w = bw * 0.7, hI = (H - T - B) * ia / top, hC = (H - T - B) * capA[k] / top, base = H - B;
        sv('rect', { x: x, y: base - hC, width: w, height: hC, fill: 'var(--c1)' }, svg);
        sv('rect', { x: x, y: base - hC - hI, width: w, height: hI, fill: 'var(--c2)' }, svg);
        if (anios <= 12 || (k + 1) % 5 === 0 || k === 0) sv('text', { x: x + w / 2, y: H - 6, 'text-anchor': 'middle' }, svg, k + 1);
      });
    }
    F.form.addEventListener('input', calc); redibujar.push(calc); calc();
  })();

  /* ---------- 8. Costo real del auto ---------- */
  (function () {
    var c = $('h-auto'); if (!c) return;
    var DEF = {
      gas: { 'au-cons': [40, 'Rendimiento', 'km por galón'], 'au-en': [3.21, 'Precio del galón', 'Extra, sep. a oct. 2026'], 'au-mant': 400, 'au-mat': 350, 'au-d1': 20, 'au-d2': 12 },
      ev: { 'au-cons': [16, 'Consumo', 'kWh cada 100 km'], 'au-en': [0.10, 'Precio del kWh', 'tarifa residencial aprox.'], 'au-mant': 200, 'au-mat': 40, 'au-d1': 25, 'au-d2': 15 }
    };
    var F = formulario(c, [
      { id: 'au-p', l: 'Precio del auto', s: 'con impuestos', v: 25000, step: 500, min: 0 },
      { id: 'au-n', l: 'Años que lo tendrás', v: 5, min: 1, max: 15 },
      { id: 'au-km', l: 'Kilómetros al año', v: 15000, step: 1000, min: 0 },
      { id: 'au-cons', l: 'Rendimiento', s: 'km por galón', v: 40, step: 1, min: 1 },
      { id: 'au-en', l: 'Precio del galón', s: 'Extra, sep. a oct. 2026', v: 3.21, step: 0.01, min: 0 },
      { id: 'au-seg', l: 'Seguro', s: '% del valor del auto al año', v: 4, step: 0.5, min: 0 },
      { id: 'au-mant', l: 'Mantenimiento', s: 'al año', v: 400, step: 50, min: 0 },
      { id: 'au-mat', l: 'Matrícula e impuestos', s: 'al año, aproximado', v: 350, step: 10, min: 0 },
      { id: 'au-d1', l: 'Depreciación el primer año', s: '%', v: 20, step: 1, min: 0, max: 90 },
      { id: 'au-d2', l: 'Depreciación los años siguientes', s: '% por año', v: 12, step: 1, min: 0, max: 60 },
      { id: 'au-r', l: 'Rendimiento si lo invirtieras', s: '% anual', v: 6, step: 0.5, full: true }
    ], '<div class="seg" role="radiogroup" aria-label="Tipo de auto"><label><input type="radio" name="au-tipo" value="gas" checked><span>A gasolina</span></label><label><input type="radio" name="au-tipo" value="ev"><span>Eléctrico</span></label></div>');
    var COL = ['var(--c1)', 'var(--c2)', 'var(--s2)', 'var(--s3)', '#7C8BA1', '#B9A27A'];
    function tipo() { return F.form.querySelector('input[name="au-tipo"]:checked').value; }
    F.form.addEventListener('change', function (e) {
      if (e.target.name !== 'au-tipo') return;
      var d = DEF[tipo()];
      Object.keys(d).forEach(function (id) {
        var v = d[id];
        if (Array.isArray(v)) { $(id).value = v[0]; var lab = F.form.querySelector('label[for="' + id + '"]'); lab.innerHTML = v[1] + '<small>' + v[2] + '</small>'; }
        else $(id).value = v;
      });
      calc();
    });
    function costo(v0, n, km, seg, mant, mat, d1, d2, r, energiaKm) {
      var v = v0, s = 0;
      for (var a = 0; a < n; a++) { s += v * seg; v = v * (1 - (a === 0 ? d1 : d2)); }
      return { dep: v0 - v, energia: energiaKm * km * n, seguro: s, mant: mant * n, mat: mat * n, oport: v0 * (Math.pow(1 + r, n) - 1), final: v };
    }
    function total(o) { return o.dep + o.energia + o.seguro + o.mant + o.mat + o.oport; }
    function calc() {
      var ev = tipo() === 'ev', v0 = F.n('au-p'), n = Math.max(1, Math.round(F.n('au-n'))), km = F.n('au-km'), cons = Math.max(0.01, F.n('au-cons')), pe = F.n('au-en');
      var ekm = ev ? cons / 100 * pe : pe / cons;
      var seg = F.n('au-seg') / 100, mant = F.n('au-mant'), mat = F.n('au-mat'), d1 = F.n('au-d1') / 100, d2 = F.n('au-d2') / 100, r = F.n('au-r') / 100;
      var o = costo(v0, n, km, seg, mant, mat, d1, d2, r, ekm), T = total(o);
      var vu = v0 * (1 - d1) * Math.pow(1 - d2, 2), u = costo(vu, n, km, Math.max(0, seg - 0.01), mant * 1.3, mat * 0.85, d2, d2, r, ekm), TU = total(u);
      var iva = ev ? 0 : v0 - v0 / 1.15;
      var partes = [['Depreciación', o.dep], [ev ? 'Electricidad' : 'Gasolina', o.energia], ['Seguro', o.seguro], ['Mantenimiento', o.mant], ['Matrícula e impuestos', o.mat], ['Lo que dejaste de ganar', o.oport]];
      F.out.innerHTML = tarjetas([
        { k: 'Costo total en ' + n + ' años', v: usd(T), s: 'al final el auto vale ' + usd(o.final) },
        { k: 'Por mes', v: usd(T / (n * 12)), s: 'mucho más que la cuota' },
        { k: 'Por kilómetro', v: '$' + (km ? (T / (km * n)).toFixed(2).replace('.', ',') : '0'), s: 'compáralo con taxi o transporte' }
      ]) + '<div class="pila" role="img" aria-label="Composición del costo">' + partes.map(function (q, i) { return '<i style="width:' + (100 * q[1] / T).toFixed(2) + '%;background:' + COL[i] + '"></i>'; }).join('') + '</div>' +
        '<ul class="pila-ley">' + partes.map(function (q, i) { return '<li><i style="background:' + COL[i] + '"></i>' + q[0] + ' <b>' + usd(q[1]) + '</b></li>'; }).join('') + '</ul>' +
        '<p class="veredicto ok">El mismo auto con tres años de uso, comprado en unos ' + usd(vu) + ', te costaría ' + usd(TU) + ' en el mismo plazo: <strong>' + usd(T - TU) + ' menos</strong>. Ese ahorro, invertido, es parte de tu jubilación.</p>' +
        (ev ? '<p class="small-note">Los eléctricos pagan IVA 0 % y están exentos del ICE y del impuesto a la propiedad. La depreciación que viene por defecto es mayor que la de un auto a gasolina, como se observó en el mercado de usados de Estados Unidos; cámbiala si tienes un dato mejor.</p>' : '<p class="small-note">De los ' + usd(v0) + ' del precio, unos ' + usd(iva) + ' son IVA del 15 %; los autos de mayor precio pagan además ICE. La depreciación, el seguro y la matrícula son supuestos de referencia: cámbialos por los de tu caso.</p>');
    }
    F.form.addEventListener('input', calc); calc();
  })();

  /* ---------- 9. Rutas en eléctrico ---------- */
  (function () {
    var c = $('h-ruta'); if (!c) return;
    var RUTAS = {
      ciudad: { n: 'Un día en la ciudad (40 km)', p: [[0, 2800], [40, 2800]], ciudad: true },
      sal: { n: 'Guayaquil → Salinas (140 km)', p: [[0, 5], [60, 40], [100, 30], [140, 5]] },
      ibarra: { n: 'Quito → Ibarra (115 km)', p: [[0, 2850], [25, 2400], [38, 2100], [60, 2800], [75, 3050], [95, 2550], [115, 2225]] },
      cajas: { n: 'Guayaquil → Cuenca por El Cajas (200 km)', p: [[0, 5], [60, 20], [95, 250], [120, 1500], [140, 3000], [158, 4167], [175, 3500], [200, 2560]] },
      gq: { n: 'Guayaquil → Quito por Santo Domingo (420 km)', p: [[0, 5], [70, 10], [180, 75], [290, 550], [330, 900], [355, 1600], [375, 3100], [395, 2900], [420, 2850]] },
      qg: { n: 'Quito → Guayaquil por Santo Domingo (420 km)', p: null },
      cuenca: { n: 'Quito → Cuenca por la Panamericana (450 km)', p: [[0, 2850], [60, 3500], [100, 2800], [140, 2580], [200, 2750], [250, 3550], [310, 2350], [370, 3150], [410, 2700], [450, 2560]] }
    };
    RUTAS.qg.p = RUTAS.gq.p.map(function (q) { return [420 - q[0], q[1]]; }).reverse();
    var opts = Object.keys(RUTAS).map(function (k) { return '<option value="' + k + '"' + (k === 'cajas' ? ' selected' : '') + '>' + RUTAS[k].n + '</option>'; }).join('');
    var F = formulario(c, [
      { id: 'rt-b', l: 'Batería', s: 'kWh útiles', v: 60, step: 5, min: 10 },
      { id: 'rt-a', l: 'Autonomía de catálogo', s: 'km', v: 400, step: 10, min: 50 },
      { id: 'rt-s', l: 'Batería al salir', s: '%', v: 100, step: 5, min: 5, max: 100 },
      { id: 'rt-m', l: 'Peso con pasajeros', s: 'kg', v: 2100, step: 50, min: 800 }
    ], '<div class="row wide ruta-sel"><label for="rt-r">Ruta<small>perfiles de altura aproximados</small></label><select id="rt-r">' + opts + '</select></div>' +
      '<div class="row wide"><label for="rt-v">Velocidad en carretera</label><select id="rt-v"><option value="1">80 km/h</option><option value="1.1">90 km/h</option><option value="1.22" selected>100 km/h</option><option value="1.35">110 km/h</option></select></div>');
    F.form.insertAdjacentHTML('beforeend', '<label class="check" for="rt-ac"><input id="rt-ac" type="checkbox" checked><span>Aire acondicionado encendido</span></label>');
    function alt(p, km) { for (var i = 1; i < p.length; i++) if (km <= p[i][0]) return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * (km - p[i - 1][0]) / (p[i][0] - p[i - 1][0]); return p[p.length - 1][1]; }
    function calc() {
      var R = RUTAS[$('rt-r').value], bat = Math.max(1, F.n('rt-b')), aut = Math.max(1, F.n('rt-a')), s0 = Math.min(100, F.n('rt-s')) / 100, m = F.n('rt-m');
      var vel = R.ciudad ? 0.9 : parseFloat($('rt-v').value), ac = $('rt-ac').checked ? 1.08 : 1;
      var base = bat / aut * vel * ac, dist = R.p[R.p.length - 1][0], e = bat * s0, eRod = 0, eSub = 0, eRec = 0, agota = null;
      var bp = [[0, s0 * 100]], ap = [];
      for (var k = 0; k <= dist; k += 1) ap.push([k, alt(R.p, k)]);
      for (k = 1; k <= dist; k++) {
        var dh = alt(R.p, k) - alt(R.p, k - 1), sube = dh > 0 ? m * 9.81 * dh / 3.6e6 / 0.9 : 0, baja = dh < 0 ? m * 9.81 * -dh / 3.6e6 * 0.6 : 0;
        var paso = Math.max(base * 0.15, base + sube - baja);
        eRod += base; eSub += sube; eRec += Math.min(baja, base * 0.85 + sube);
        e -= paso; if (e <= 0 && agota === null) agota = k;
        bp.push([k, Math.max(0, e / bat * 100)]);
      }
      var llega = e / bat * 100, plano = bat / (bat / aut * vel * ac);
      var cls = agota !== null ? 'bad' : llega < 15 ? '' : 'ok';
      F.out.innerHTML = tarjetas([
        { k: 'Batería al llegar', v: agota !== null ? '0 %' : pct(llega), c: agota !== null ? 'neg' : llega < 15 ? '' : 'pos', s: agota !== null ? 'se acaba en el km ' + agota : 'de ' + pct(s0 * 100) + ' al salir' },
        { k: 'Energía para subir', v: f0.format(eSub) + ' kWh', s: 'recuperas unos ' + f0.format(eRec) + ' kWh al bajar' },
        { k: 'Autonomía real en plano', v: f0.format(plano) + ' km', s: 'frente a ' + f0.format(aut) + ' km de catálogo' }
      ]) + '<p class="veredicto ' + cls + '">' + (agota !== null ? 'No llegas sin cargar: la batería se agota cerca del kilómetro ' + agota + '. Tendrías que planificar al menos una parada en un cargador rápido, y en Ecuador hay pocos fuera de las ciudades.' : llega < 15 ? 'Llegas, pero con muy poco margen: un desvío, un tráfico o una estimación optimista del auto te dejan varado.' : 'Llegas con margen. Aun así, conviene saber dónde está el cargador más cercano a tu destino.') + '</p>';
      var svg = grafica(F.out, '<li><i class="line" style="background:var(--c1)"></i>Batería (%)</li><li><i style="background:var(--muted-mark)"></i>Altura del camino</li>');
      var maxAlt = 4500;
      var g = lineas(svg, { series: [{ pts: ap.map(function (q) { return [q[0], q[1] / maxAlt * 100]; }), color: 'var(--muted-mark)', area: 0.5, w: 1 }, { pts: bp, color: agota !== null ? 'var(--neg)' : 'var(--c1)', w: 3 }], xmin: 0, xmax: dist, ymin: 0, ymax: 100, yt: [0, 25, 50, 75, 100], fy: function (v) { return v + ' %'; }, xt: pasos(dist, 4).filter(function (x) { return x <= dist; }), fx: function (v) { return v + ' km'; }, h: 250,
        marcas: agota !== null ? [{ x: agota, y: 0, t: 'sin batería', color: 'var(--neg)', dy: -10 }] : [{ x: dist, y: Math.max(0, llega), t: pct(llega), dy: -10 }] });
      [1000, 2000, 3000, 4000].forEach(function (h) { if (h <= maxAlt) sv('text', { x: g.W - g.R - 2, y: g.Y(h / maxAlt * 100) - 3, 'text-anchor': 'end', opacity: 0.7 }, svg, f0.format(h) + ' m'); });
    }
    F.form.addEventListener('input', calc); F.form.addEventListener('change', calc); redibujar.push(calc); calc();
    F.out.insertAdjacentHTML('afterend', '<p class="small-note">Estimación física: energía para rodar según la autonomía de catálogo y la velocidad, energía para subir el peso del auto por la montaña y recuperación del 60 % al bajar. No considera viento, tráfico ni el desgaste de la batería, que solo restan.</p>');
  })();

  /* ---------- 10. Cargar no es llenar el tanque ---------- */
  (function () {
    var c = $('h-carga'); if (!c) return;
    c.innerHTML = '<div class="chart-box"><p class="small-note" style="margin:0 0 .8rem">Tiempo para recuperar la energía de una batería de 60 kWh</p>' +
      hbars([
        { n: 'Llenar el tanque de gasolina', v: 5, t: 'unos 5 minutos', hi: true },
        { n: 'Cargador rápido de 60 kW', s: 'del 10 al 80 %', v: 45, t: 'unos 45 minutos' },
        { n: 'Cargador de casa de 7 kW', s: 'del 0 al 100 %', v: 9 * 60, t: 'unas 9 horas' },
        { n: 'Enchufe común de 110 V', s: 'del 0 al 100 %', v: 43 * 60, t: 'más de 40 horas' }
      ]) + '</div><div class="chart-box" style="margin-top:1rem"><p class="small-note" style="margin:0 0 .8rem">Dónde abastecerse en Ecuador</p>' +
      hbars([
        { n: 'Gasolineras', s: 'mayo de 2025', v: 1244, t: f0.format(1244), hi: true },
        { n: 'Puntos de carga, de todo tipo', s: 'diciembre de 2025', v: 384, t: f0.format(384) },
        { n: 'Estaciones de carga rápida', s: 'febrero de 2026', v: 30, t: 'unas 30' }
      ]) + '<p class="small-note">Un punto de carga lento sirve para dejar el auto horas, no para seguir el viaje. La red crece, pero hoy se concentra en las ciudades.</p></div>';
  })();

  /* ---------- 11. Diferidos: el interés escondido ---------- */
  (function () {
    var c = $('h-dif'); if (!c) return;
    var F = formulario(c, [
      { id: 'df-c', l: 'Precio de contado', s: 'con el descuento por pagar en efectivo', v: 900, step: 10, min: 1 },
      { id: 'df-d', l: 'Precio total diferido', s: 'lo que pagas en cuotas', v: 1000, step: 10, min: 1 },
      { id: 'df-n', l: 'Número de cuotas', s: 'meses', v: 12, min: 1, max: 60, full: true }
    ]);
    function tasa(pv, q, n) {
      var lo = 0, hi = 1;
      for (var k = 0; k < 100; k++) { var mid = (lo + hi) / 2, v = q * (1 - Math.pow(1 + mid, -n)) / mid; if (v > pv) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    }
    function calc() {
      var C = F.n('df-c'), D = F.n('df-d'), n = Math.max(1, Math.round(F.n('df-n'))), q = D / n, extra = D - C;
      if (extra <= 0.005) { F.out.innerHTML = tarjetas([{ k: 'Cuota mensual', v: usd(q) }, { k: 'Interés escondido', v: '$0', c: 'pos' }, { k: 'Tasa equivalente', v: '0 %', c: 'pos' }]) + '<p class="veredicto ok">Si de verdad pagas lo mismo que de contado, diferir te conviene: usas dinero prestado gratis. Solo cuida no acumular demasiadas cuotas.</p>'; return; }
      var r = tasa(C, q, n), ea = Math.pow(1 + r, 12) - 1;
      F.out.innerHTML = tarjetas([
        { k: 'Cuota mensual', v: usd(q) },
        { k: 'Interés escondido', v: usd(extra), c: 'neg', s: pct(100 * extra / C, true) + ' sobre el precio de contado' },
        { k: 'Tasa efectiva anual equivalente', v: pct(ea * 100, true), c: 'neg', s: pct(r * 100, true) + ' al mes' }
      ]) + '<p class="veredicto bad">Ese «sin intereses» equivale a un crédito al ' + pct(ea * 100, true) + ' anual. Si puedes pagar de contado, el descuento es tu mejor inversión de este mes.</p>';
    }
    F.form.addEventListener('input', calc); calc();
  })();

  /* ---------- Consulta Express: texto según el tema que se lee, y barra que se cierra en el celular ---------- */
  (function () {
    var t = $('ce-t'), caja = $('ce-caja'); if (!t) return;
    var base = t.textContent, actual = base;
    function poner(s) {
      if (s === actual) return; actual = s;
      t.classList.add('cambia');
      setTimeout(function () { t.textContent = s; t.classList.remove('cambia'); }, 220);
    }
    if ('IntersectionObserver' in window) {
      var vis = new Map();
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { vis.set(e.target, e.intersectionRatio); });
        var mejor = null, r = 0;
        vis.forEach(function (v, k) { if (v > r) { r = v; mejor = k; } });
        poner(mejor && r > 0 ? mejor.dataset.ce : base);
      }, { threshold: [0, 0.15, 0.35, 0.6], rootMargin: '-20% 0px -35% 0px' });
      document.querySelectorAll('.tema[data-ce]').forEach(function (s) { io.observe(s); });
    }
    try { if (sessionStorage.getItem('ce-cerrada') === '1') document.body.classList.add('sin-barra'); } catch (e) {}
    $('ce-x').addEventListener('click', function () {
      document.body.classList.add('sin-barra');
      try { sessionStorage.setItem('ce-cerrada', '1'); } catch (e) {}
    });
  })();
})();
