/* Recuadro fijo arriba a la derecha (computadora): se oculta en pestaña y recuerda la elección durante la visita. */
(function () {
  var p = document.getElementById('pest'); if (!p) return;
  var tab = document.getElementById('pest-abrir');
  function abrir(si) {
    p.classList.toggle('abierta', si);
    tab.setAttribute('aria-expanded', si ? 'true' : 'false');
  }
  var cerrada = false;
  try { cerrada = sessionStorage.getItem('pest-cerrada') === '1'; } catch (e) {}
  // Abierto en computadora; en pantallas angostas taparía el texto y queda como pestaña.
  // Donde el encabezado tiene la foto de Carlo, se abre recién cuando la foto sale de la pantalla, para no taparle la cara.
  var foto = document.querySelector('.hero img');
  var aMano = false;
  function auto() {
    if (cerrada || aMano || window.innerWidth < 1400) return;
    abrir(!foto || foto.getBoundingClientRect().bottom < 0);
  }
  // Bajo el menú al inicio; al bajar por la página sube a la esquina
  function subir() { p.classList.toggle('arriba', window.scrollY > 70); auto(); }
  subir();
  window.addEventListener('scroll', subir, { passive: true });
  tab.addEventListener('click', function () {
    aMano = true; cerrada = false;
    abrir(true);
    try { sessionStorage.removeItem('pest-cerrada'); } catch (e) {}
  });
  document.getElementById('pest-x').addEventListener('click', function () {
    cerrada = true; abrir(false);
    try { sessionStorage.setItem('pest-cerrada', '1'); } catch (e) {}
  });
})();
