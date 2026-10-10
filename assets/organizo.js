/* Sección «Organizo mis Finanzas»: la pantalla del teléfono avanza sola y los pasos de la izquierda la acompañan. */
(function () {
  var sec = document.getElementById('app'); if (!sec) return;
  var imgs = sec.querySelectorAll('.pantalla img');
  var botones = sec.querySelectorAll('.app-pasos button');
  var actual = 0, timer = null;
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ver(i) {
    actual = (i + imgs.length) % imgs.length;
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === actual); });
    botones.forEach(function (b, k) { b.setAttribute('aria-current', String(k === actual)); });
  }
  function seguir() { clearInterval(timer); if (!quieto) timer = setInterval(function () { ver(actual + 1); }, 4500); }
  botones.forEach(function (b, k) { b.addEventListener('click', function () { ver(k); seguir(); }); });
  // Solo avanza mientras la sección está a la vista.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { if (e[0].isIntersecting) seguir(); else clearInterval(timer); }, { threshold: 0.25 }).observe(sec);
  } else seguir();
  ver(0);
})();
