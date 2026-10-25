// Level 3 mechanic: press the green dot, drag along the line towards the red dot.
// Damage scales with how far you got (reaching 90% counts as complete). The trail colour shows
// the damage tier. Straying too far from the line ends the attempt (you keep the damage so far).
// A new path appears after every attempt.
import {
  segmentProgress, distanceToSegment, dragMultiplier,
  dragEffectiveProgress, dragTier, DRAG_FULL_PROGRESS,
} from '../logic.js';

const NS = 'http://www.w3.org/2000/svg';
const START_RADIUS = 40;   // how close to the start dot you must press
const TIER_COLORS = { none: '#bbbbbb', low: '#e67e22', mid: '#f1c40f', full: '#2ecc71' };
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
  const outline = make('line', { stroke: '#ffffff', 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.8 });
  const guide = make('line', { stroke: '#777', 'stroke-width': 6, 'stroke-dasharray': '10 8' });
  const trail = make('line', { stroke: TIER_COLORS.none, 'stroke-width': 10, 'stroke-linecap': 'round' });
  const startDot = make('circle', { r: 20, fill: '#2ecc71', stroke: '#fff', 'stroke-width': 3 });
  const endDot = make('circle', { r: 20, fill: '#c0392b', stroke: '#fff', 'stroke-width': 3 });
  svg.append(outline, guide, trail, startDot, endDot);
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
    outline.setAttribute('x1', a.x); outline.setAttribute('y1', a.y);
    outline.setAttribute('x2', b.x); outline.setAttribute('y2', b.y);
    startDot.setAttribute('cx', a.x); startDot.setAttribute('cy', a.y);
    endDot.setAttribute('cx', b.x); endDot.setAttribute('cy', b.y);
    drawTrail();
  }

  function drawTrail() {
    trail.setAttribute('x1', a.x); trail.setAttribute('y1', a.y);
    trail.setAttribute('x2', a.x + furthest * (b.x - a.x));
    trail.setAttribute('y2', a.y + furthest * (b.y - a.y));
    trail.setAttribute('stroke', TIER_COLORS[dragTier(furthest)]);
  }

  function local(e) {
    const r = arena.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function finish() {
    if (!active) return;
    active = false;
    const effective = dragEffectiveProgress(furthest);
    if (effective > 0) onValidAction(dragMultiplier(level.dragDamageMultiplier, effective));
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
    if (furthest >= DRAG_FULL_PROGRESS) finish();
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
