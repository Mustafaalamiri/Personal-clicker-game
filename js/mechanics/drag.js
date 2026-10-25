// Level 3 mechanic: press the green dot, drag along the line towards the red dot.
// Damage scales with how far you got. Straying too far from the line ends the attempt
// (you keep the damage for the progress so far). A new path appears after every attempt.
import { segmentProgress, distanceToSegment, dragMultiplier } from '../logic.js';

const NS = 'http://www.w3.org/2000/svg';
const START_RADIUS = 26;   // how close to the green dot you must press
const MIN_PROGRESS = 0.1;  // ignore accidental taps
const rand = (min, max) => min + Math.random() * (max - min);

function make(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

export function activateDrag(element, arena, onValidAction, level) {
  const tolerance = level.dragTolerancePx;
  let a, b, furthest = 0, active = false;

  arena.classList.add('drag-arena');
  element.classList.add('drag-mode');

  const w = arena.clientWidth, h = arena.clientHeight;
  const svg = make('svg', { class: 'drag-svg', width: w, height: h, viewBox: `0 0 ${w} ${h}` });
  const guide = make('line', { stroke: '#999', 'stroke-width': 4, 'stroke-dasharray': '8 6' });
  const trail = make('line', { stroke: '#2ecc71', 'stroke-width': 7, 'stroke-linecap': 'round' });
  const startDot = make('circle', { r: 14, fill: '#2ecc71' });
  const endDot = make('circle', { r: 14, fill: '#c0392b' });
  svg.append(guide, trail, startDot, endDot);
  arena.appendChild(svg);

  function newPath() {
    const m = 30, minLen = w * 0.5;
    let tries = 0;
    do {
      a = { x: rand(m, w - m), y: rand(m, h - m) };
      b = { x: rand(m, w - m), y: rand(m, h - m) };
    } while (Math.hypot(b.x - a.x, b.y - a.y) < minLen && ++tries < 50);
    furthest = 0;
    guide.setAttribute('x1', a.x); guide.setAttribute('y1', a.y);
    guide.setAttribute('x2', b.x); guide.setAttribute('y2', b.y);
    startDot.setAttribute('cx', a.x); startDot.setAttribute('cy', a.y);
    endDot.setAttribute('cx', b.x); endDot.setAttribute('cy', b.y);
    drawTrail();
  }

  function drawTrail() {
    trail.setAttribute('x1', a.x); trail.setAttribute('y1', a.y);
    trail.setAttribute('x2', a.x + furthest * (b.x - a.x));
    trail.setAttribute('y2', a.y + furthest * (b.y - a.y));
  }

  function local(e) {
    const r = arena.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function finish() {
    if (!active) return;
    active = false;
    if (furthest >= MIN_PROGRESS) onValidAction(dragMultiplier(level.dragDamageMultiplier, furthest));
    newPath();
  }

  function down(e) {
    if (e.button !== 0) return;
    const p = local(e);
    if (Math.hypot(p.x - a.x, p.y - a.y) > START_RADIUS) return;
    active = true;
    furthest = 0;
    try { arena.setPointerCapture(e.pointerId); } catch (err) { /* not critical */ }
  }

  function move(e) {
    if (!active) return;
    const p = local(e);
    if (distanceToSegment(p, a, b) > tolerance) { finish(); return; }
    furthest = Math.max(furthest, segmentProgress(p, a, b));
    drawTrail();
    if (furthest >= 0.98) { furthest = 1; finish(); }
  }

  const noMenu = (e) => e.preventDefault();

  arena.addEventListener('pointerdown', down);
  arena.addEventListener('pointermove', move);
  arena.addEventListener('pointerup', finish);
  arena.addEventListener('pointercancel', finish);
  arena.addEventListener('contextmenu', noMenu);
  newPath();

  return function deactivate() {
    active = false;
    arena.removeEventListener('pointerdown', down);
    arena.removeEventListener('pointermove', move);
    arena.removeEventListener('pointerup', finish);
    arena.removeEventListener('pointercancel', finish);
    arena.removeEventListener('contextmenu', noMenu);
    svg.remove();
    element.classList.remove('drag-mode');
    arena.classList.remove('drag-arena');
  };
}
