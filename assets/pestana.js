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
  // Abierto de entrada en computadora; en pantallas angostas taparía el texto y queda como pestaña
  abrir(!cerrada && window.innerWidth >= 1400);
  tab.addEventListener('click', function () {
    abrir(true);
    try { sessionStorage.removeItem('pest-cerrada'); } catch (e) {}
  });
  document.getElementById('pest-x').addEventListener('click', function () {
    abrir(false);
    try { sessionStorage.setItem('pest-cerrada', '1'); } catch (e) {}
  });
})();
