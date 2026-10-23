/* Recuadro de Consulta Express y Masterclass, siempre a la vista: arriba a la derecha en computadora y barra abajo en el teléfono.
   Su mensaje cambia según la sección que se está leyendo. La × lo reduce a un botón dorado y la elección se recuerda durante la visita. */
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
      Array.prototype.forEach.call(u.children, function (li) { if (cerrada && /^\s*Solo 30 cupos\s*$/.test(li.textContent)) li.hidden = true; });
      var li = document.createElement('li'); li.textContent = cerrada ? 'Cupos del 19 de diciembre cerrados' : 'Cupos del 14 de noviembre cerrados'; u.insertBefore(li, u.firstChild);
    });
    if (cerrada) Array.prototype.forEach.call(document.querySelectorAll('#mform'), function (f) {
      Array.prototype.forEach.call(f.children, function (c) { c.hidden = true; });
      var q = document.createElement('p'); q.className = 'q'; q.textContent = 'Próxima fecha por anunciar';
      var s = document.createElement('p'); s.textContent = 'Los cupos del 19 de diciembre se cerraron. La próxima fecha se anuncia aquí mismo.';
      f.insertBefore(s, f.firstChild); f.insertBefore(q, s);
    });
  })();
  var p = document.getElementById('pest'); if (!p) return;
  var tab = document.getElementById('pest-abrir');
  var texto = document.getElementById('pest-t');
  var compu = window.matchMedia('(min-width: 60.01rem)');
  function abrir(si) {
    p.classList.toggle('abierta', si);
    tab.setAttribute('aria-expanded', si ? 'true' : 'false');
    document.body.classList.toggle('con-pest', si);
  }
  var cerrada = false;
  try { cerrada = sessionStorage.getItem('pest-cerrada') === '1'; } catch (e) {}
  abrir(!cerrada);

  // En la portada, en computadora, espera a que pase la foto de Carlo para no taparle la cara
  var foto = document.querySelector('.hero img');
  function esperar() {
    p.classList.toggle('espera', !!foto && compu.matches && foto.getBoundingClientRect().bottom > 0);
  }

  // Mensaje según la sección: la última con data-pest cuyo inicio ya pasó el 45 % de la pantalla; antes de la primera, el mensaje inicial
  var secciones = Array.prototype.slice.call(document.querySelectorAll('[data-pest]'));
  var inicial = texto ? texto.textContent : '', actual;
  function seccion() {
    if (!secciones.length || !texto) return;
    var linea = window.innerHeight * 0.45, s = null;
    for (var i = 0; i < secciones.length; i++) {
      if (secciones[i].getBoundingClientRect().top < linea) s = secciones[i];
    }
    if (s === actual) return;
    actual = s;
    var nuevo = s ? s.getAttribute('data-pest') : inicial;
    if (texto.textContent === nuevo) return;
    texto.classList.add('cambia');
    setTimeout(function () { texto.textContent = nuevo; texto.classList.remove('cambia'); }, 220);
  }

  // Bajo el menú al inicio; al bajar por la página sube a la esquina
  function alMover() {
    p.classList.toggle('arriba', window.scrollY > 70);
    esperar();
    seccion();
  }
  alMover();
  window.addEventListener('scroll', alMover, { passive: true });
  window.addEventListener('resize', alMover);

  // En el teléfono, la barra se aparta mientras la persona escribe en un formulario
  document.addEventListener('focusin', function (e) {
    if (e.target.matches && e.target.matches('input, textarea, select')) p.classList.add('escribiendo');
  });
  // Vuelve con un respiro: si reapareciera al instante, el toque en «Enviar» caería sobre la barra
  var volver;
  document.addEventListener('focusout', function () {
    clearTimeout(volver);
    volver = setTimeout(function () {
      var a = document.activeElement;
      if (!(a && a.matches && a.matches('input, textarea, select'))) p.classList.remove('escribiendo');
    }, 450);
  });

  tab.addEventListener('click', function () {
    cerrada = false; abrir(true);
    try { sessionStorage.removeItem('pest-cerrada'); } catch (e) {}
  });
  document.getElementById('pest-x').addEventListener('click', function () {
    cerrada = true; abrir(false);
    try { sessionStorage.setItem('pest-cerrada', '1'); } catch (e) {}
  });
})();
