/* Recuadro de Consulta Express y Masterclass, siempre a la vista: arriba a la derecha en computadora y barra abajo en el teléfono.
   Su mensaje cambia según la sección que se está leyendo. La × lo reduce a un botón dorado y la elección se recuerda durante la visita. */
(function () {
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
    p.classList.toggle('modo-mc', !!s && s.getAttribute('data-pest-modo') === 'mc');
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
  document.addEventListener('focusout', function () { p.classList.remove('escribiendo'); });

  tab.addEventListener('click', function () {
    cerrada = false; abrir(true);
    try { sessionStorage.removeItem('pest-cerrada'); } catch (e) {}
  });
  document.getElementById('pest-x').addEventListener('click', function () {
    cerrada = true; abrir(false);
    try { sessionStorage.setItem('pest-cerrada', '1'); } catch (e) {}
  });
})();
