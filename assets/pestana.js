/* Pestaña fija a la derecha (computadora): se abre y se oculta, y recuerda la elección durante la visita. */
(function () {
  var p = document.getElementById('pest'); if (!p) return;
  var tab = document.getElementById('pest-abrir');
  function abrir(si) {
    p.classList.toggle('abierta', si);
    tab.setAttribute('aria-expanded', si ? 'true' : 'false');
  }
  var cerrada = false;
  try { cerrada = sessionStorage.getItem('pest-cerrada') === '1'; } catch (e) {}
  // Abierta de entrada solo donde hay margen libre a la derecha (página Aprende en pantallas anchas)
  abrir(!cerrada && p.hasAttribute('data-abierta') && window.innerWidth >= 1600);
  tab.addEventListener('click', function () {
    abrir(true);
    try { sessionStorage.removeItem('pest-cerrada'); } catch (e) {}
  });
  document.getElementById('pest-x').addEventListener('click', function () {
    abrir(false);
    try { sessionStorage.setItem('pest-cerrada', '1'); } catch (e) {}
  });
})();
