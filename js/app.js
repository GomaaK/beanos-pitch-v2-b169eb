// Beano's pitch site: pitch controls and a quiet background parallax. No 3D.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fx = document.querySelector('.bgfx');
if (fx && !reduce) {
  addEventListener('pointermove', e => {
    const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
    fx.style.setProperty('--px', (x * -22).toFixed(1) + 'px');
    fx.style.setProperty('--py', (y * -16).toFixed(1) + 'px');
  });
}

const beats = [...document.querySelectorAll('.beat')];
if (beats.length) {
  const dots = [...document.querySelectorAll('.dots a')];
  let cur = 0;
  const pos = [[0, 0, 1], [8, -6, 1.06], [-4, 6, 0.96], [10, 4, 1.1], [-8, -4, 1], [6, 8, 1.04], [-10, 0, 0.98], [0, -8, 1.12]];
  function setBeat(i) {
    const p = pos[i] || pos[0];
    if (fx) { fx.style.setProperty('--bx', p[0] + 'vmax'); fx.style.setProperty('--by', p[1] + 'vmax'); fx.style.setProperty('--bs', p[2]); fx.style.setProperty('--rot', (i * 22) + 'deg'); }
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      cur = beats.indexOf(e.target);
      dots.forEach((d, i) => d.classList.toggle('on', i === cur));
      setBeat(cur);
      const n = document.querySelector('.notes');
      if (n) n.innerHTML = '<b>Presenter notes · beat ' + (cur + 1) + '</b>' + (e.target.dataset.say || '');
      const lab = document.getElementById('beatlab');
      if (lab) lab.textContent = 'Beat ' + (cur + 1) + ' of ' + beats.length;
    }
  }), { threshold: 0.6 });
  beats.forEach(b => io.observe(b));
  const go = i => { i = Math.max(0, Math.min(beats.length - 1, i)); beats[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    else if (e.key >= '1' && e.key <= '8') go(+e.key - 1);
    else if (e.key === 'n' || e.key === 'N') document.querySelector('.notes').classList.toggle('on');
    else if (e.key === 'd' || e.key === 'D') { const l = beats[cur].querySelector('.cta a.btn'); if (l) location.href = l.href; }
  });
  let t0 = 0, run = false, el = 0;
  const tm = document.getElementById('time'), bar = document.getElementById('tbar'), sb = document.getElementById('tstart');
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  (function loop() { if (run) { el = (performance.now() - t0) / 1000; tm.textContent = fmt(el); bar.style.width = Math.min(100, el / 480 * 100) + '%'; } requestAnimationFrame(loop); })();
  if (sb) sb.addEventListener('click', () => {
    if (!run) { run = true; t0 = performance.now() - el * 1000; sb.textContent = 'Pause timer'; if (cur === 0) go(1); }
    else { run = false; sb.textContent = 'Resume timer'; }
  });
  setBeat(0);
}
