import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { T } from '../textos';
import { W, H } from '../config';
import { addErgios, FLOORS, Game, MapNode, NodeType, saveLocal, unlock } from '../state';
import { makeHeroFromAvatar } from '../art/sprites';
import { cargarHuellas, datosDe, HONRA_ERGIOS, MAX_LAPIDAS, usarHuella } from '../huellas';
import { ENEMIES } from '../data/enemies';
import { topBar } from '../ui/hud';
import { button, embers, engraneGfx, fadeTo, frame, icon, title, Tooltip, txt, vignette } from '../ui/widgets';
import { CONSEJOS } from '../data/glosario';
import { ENCARGOS } from '../data/encargos';

const NODE_STYLE: Record<NodeType, { icon: string; color: number }> = {
  combate: { icon: 'i_combat', color: 0x8a8296 },
  elite: { icon: 'i_elite', color: 0xa84a4a },
  fogata: { icon: 'i_fire', color: 0xc87533 },
  runa: { icon: 'i_rune', color: 0x8e5bb0 },
  evento: { icon: 'i_event', color: 0x6a8fc4 },
  mercader: { icon: 'i_bag', color: 0xe8c15a },
  santuario: { icon: 'i_shrine', color: 0x7fd8ff },
  taberna: { icon: 'i_jarra', color: 0xd89a4a },
  jefe: { icon: 'i_boss', color: 0xe8c15a },
};
const NODE_INFO = Object.fromEntries(
  Object.entries(NODE_STYLE).map(([k, v]) => [k, { ...v, name: T.mapa.nodos[k][0], desc: T.mapa.nodos[k][1] }]),
) as Record<NodeType, { icon: string; color: number; name: string; desc: string }>;

/** Posición de un nodo; el ancho entre pisos se ajusta a cuántos pisos tiene el mapa */
export const nodeAt = (n: MapNode, maxFloor = FLOORS) => ({
  x: n.type === 'jefe' ? 884 : 60 + n.floor * (790 / maxFloor),
  y: n.type === 'jefe' ? 280 : 112 + n.lane * 82,
});

export class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }

  create() {
    this.cameras.main.fadeIn(300);
    audio.play((Game.run?.acto ?? 1) >= 4 ? 'mapa4' : (Game.run?.acto ?? 1) === 3 ? 'mapa3' : (Game.run?.acto ?? 1) === 2 ? 'mapa2' : 'mapa');
    const run = Game.run!;
    const tip = new Tooltip(this);

    // fondo: pergamino oscuro
    const bg = this.add.graphics().setDepth(-10);
    const act2 = (run.acto ?? 1) === 2;
    const act3 = (run.acto ?? 1) === 3;
    const act4 = (run.acto ?? 1) >= 4;
    bg.fillStyle(act2 ? 0x020203 : act3 ? 0x050307 : act4 ? 0x070605 : 0x060508, 1).fillRect(0, 0, W, H);
    if (act4) {
      // plano de la fábrica: engranes que giran detrás del mapa y fórmulas de cálculo
      const gears: [number, number, number][] = [[120, 200, 110], [W - 140, 360, 130], [W / 2 + 40, 470, 90], [W / 2 - 160, 90, 60]];
      gears.forEach(([x, y, r], i) => {
        const e = engraneGfx(this, x, y, r, 0x1a1610, 1, Math.round(r / 8)).setDepth(-9);
        this.tweens.add({ targets: e, angle: i % 2 ? -360 : 360, duration: r * 300, repeat: -1 });
      });
      const eqs = ['v = dx/dt', 'a = dv/dt', 'x = ∫v dt', 'W = ∫F·dx', 'I = ∫F dt', 'P = dW/dt', 'd/dt(t²) = 2t', '∫2t dt = t²'];
      eqs.forEach((e, i) => {
        const t = txt(this, 50 + (i % 4) * 240 + Math.random() * 40, 100 + Math.floor(i / 4) * 330 + Math.random() * 40, e, 24, '#3a3020').setDepth(-9);
        this.tweens.add({ targets: t, alpha: 0.4, duration: 2000 + i * 300, yoyo: true, repeat: -1 });
      });
    }
    if (act3) {
      // plano de la torre: círculos rúnicos concéntricos y engranes, como en un grimorio
      for (let r = 60; r < 620; r += 70) {
        bg.lineStyle(1, 0x2a1e34, 0.9).strokeCircle(W / 2, H / 2 + 20, r);
      }
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        bg.lineStyle(1, 0x1e1626, 0.9).lineBetween(W / 2 + Math.cos(a) * 60, H / 2 + 20 + Math.sin(a) * 60, W / 2 + Math.cos(a) * 640, H / 2 + 20 + Math.sin(a) * 640);
      }
      const eqs = ['F = m·a', '∫F dt = Δp', '½mv²', 'm₁v₁ = m₂v₂', 'e = v′/v', 'H = I·ω', 'ΣM = I·α', 'T = Iω²/2'];
      eqs.forEach((e, i) => {
        const t = txt(this, 60 + (i % 4) * 240 + Math.random() * 40, 90 + Math.floor(i / 4) * 360 + Math.random() * 40, e, 26, '#3a2a48').setDepth(-9);
        this.tweens.add({ targets: t, alpha: 0.4, duration: 2000 + i * 300, yoyo: true, repeat: -1 });
      });
    }
    if (act2) {
      // mapa estilo calabozo de Wizardry: cuadrícula de líneas frías
      bg.lineStyle(1, 0x1c2630, 0.9);
      for (let x = 0; x <= W; x += 24) bg.lineBetween(x, 44, x, H);
      for (let y = 44; y <= H; y += 24) bg.lineBetween(0, y, W, y);
      bg.lineStyle(1, 0x2a3846, 0.9);
      for (let x = 0; x <= W; x += 96) bg.lineBetween(x, 44, x, H);
      for (let y = 44; y <= H; y += 96) bg.lineBetween(0, y, W, y);
    }
    for (let i = 0; i < (act2 || act3 || act4 ? 0 : 260); i++) {
      bg.fillStyle(0x15111a, Math.random() * 0.7).fillRect(Math.random() * W, 44 + Math.random() * (H - 44), 3 + Math.random() * 10, 2 + Math.random() * 4);
    }
    embers(this);
    vignette(this);

    topBar(this, tip, { onMenu: () => fadeTo(this, 'Menu') });
    title(this, W / 2, 66, act4 ? T.mapa.titulo4 : act3 ? T.mapa.titulo3 : act2 ? T.mapa.titulo2 : T.mapa.titulo, 28, act4 ? '#e0a860' : act3 ? '#b89ad0' : act2 ? '#9ab8c8' : undefined);

    const byId = new Map(run.map.map((n) => [n.id, n]));
    const maxF = Math.max(...run.map.map((n) => n.floor)) || FLOORS;
    const nodeXY = (n: MapNode) => nodeAt(n, maxF);
    const current = run.pos >= 0 ? byId.get(run.pos)! : null;
    // si la partida se cerró en el nodo del jefe: retoma la pelea o el paso al siguiente acto
    if (current?.type === 'jefe' && !run.done) {
      const acto = run.acto ?? 1;
      if (!(run.seen ?? []).includes(`jefe_${acto}`)) return void fadeTo(this, 'Combat', { kind: 'boss', floor: current.floor });
      if (acto < 4) return void fadeTo(this, 'ActTransition', { to: acto + 1 });
    }
    const available = new Set<number>(current ? current.next : run.map.filter((n) => n.floor === 0).map((n) => n.id));
    const visited = new Set<number>(run.visited ?? []);
    if (current) visited.add(current.id);

    // caminos
    // nodos alcanzables desde donde estás (todo lo que aún puedes recorrer)
    const alcanzable = new Set<number>();
    const pila = [...available];
    while (pila.length) {
      const id = pila.pop()!;
      if (alcanzable.has(id)) continue;
      alcanzable.add(id);
      pila.push(...(byId.get(id)?.next ?? []));
    }
    const lines = this.add.graphics();
    const punteado = (g: Phaser.GameObjects.Graphics, a: { x: number; y: number }, b: { x: number; y: number }, color: number, sz = 4) => {
      const d = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      const steps = Math.floor(d / 12);
      g.fillStyle(color, 1);
      for (let i = 2; i < steps - 1; i++) {
        const t = i / steps;
        g.fillRect(a.x + (b.x - a.x) * t - sz / 2, a.y + (b.y - a.y) * t - sz / 2, sz, sz);
      }
    };
    for (const n of run.map) {
      const a = nodeXY(n);
      for (const nid of n.next) {
        const b = nodeXY(byId.get(nid)!);
        const travelled = visited.has(n.id) && visited.has(nid);
        const from = current?.id === n.id && available.has(nid);
        const futuro = alcanzable.has(n.id) && alcanzable.has(nid);
        if (travelled) {
          // el camino que ya recorriste: línea dorada continua
          lines.lineStyle(4, UI.gold, 0.85).lineBetween(a.x, a.y, b.x, b.y);
        } else punteado(lines, a, b, from ? 0xe8d8b0 : futuro ? 0x8a7a9a : 0x2a2433, from ? 5 : 4);
      }
    }
    // al pasar el cursor sobre un nodo alcanzable, se ilumina el camino hasta él
    const ruta = this.add.graphics();
    const rutaHasta = (destino: number) => {
      ruta.clear();
      if (!alcanzable.has(destino)) return;
      // búsqueda hacia atrás: de qué nodo (alcanzable o actual) se llega
      const prev = new Map<number, number>();
      const cola = current ? [current.id] : [];
      const inicio = current ? [] : [...available];
      for (const s0 of inicio) prev.set(s0, -1);
      cola.push(...inicio);
      while (cola.length) {
        const id = cola.shift()!;
        if (id === destino) break;
        for (const nx of byId.get(id)?.next ?? []) if (!prev.has(nx)) { prev.set(nx, id); cola.push(nx); }
      }
      let k = destino;
      while (prev.has(k) && prev.get(k)! >= 0) {
        const p0 = prev.get(k)!;
        ruta.lineStyle(5, 0x9ad8f0, 0.8).lineBetween(nodeXY(byId.get(p0)!).x, nodeXY(byId.get(p0)!).y, nodeXY(byId.get(k)!).x, nodeXY(byId.get(k)!).y);
        k = p0;
      }
    };

    // el jefe del acto se ve en el mapa: ya cuenta para el Bestiario
    unlock('enemies', act4 ? 'am' : act3 ? 'hibbelerius' : act2 ? 'bruja' : 'colossus');
    // nodos
    for (const n of run.map) {
      const { x, y } = nodeXY(n);
      const jt = act4 ? T.mapa.jefe4 : act3 ? T.mapa.jefe3 : T.mapa.jefe2;
      const info = n.type === 'jefe' && (act2 || act3 || act4) ? { ...NODE_INFO.jefe, name: jt[0], desc: jt[1] } : NODE_INFO[n.type];
      const size = n.type === 'jefe' ? 76 : 42;
      const g = this.add.graphics();
      const isAvail = available.has(n.id);
      const isPast = n.floor < (current ? current.floor : 0) || (current && n.id === current.id);
      frame(g, x - size / 2, y - size / 2, size, size, isAvail ? 0x261e2c : 0x141017, isAvail ? info.color : 0x3a3244);
      const im = n.type === 'jefe' && act4 ? this.add.image(x, y, 'am_jefe').setScale(1.05) : n.type === 'jefe' && act3 ? this.add.image(x, y, 'hibbelerius').setScale(1.1) : this.add.image(x, y, info.icon).setScale(n.type === 'jefe' ? 6 : 3.1);
      if (!isAvail && !(current && n.id === current.id)) im.setAlpha(isPast ? 0.3 : 0.75);
      if (visited.has(n.id)) {
        const mark = this.add.graphics();
        mark.lineStyle(3, UI.gold, 0.9).strokeCircle(x, y, size / 2 + 4);
      }
      if (isAvail) {
        const glow = this.add.rectangle(x, y, size + 10, size + 10).setStrokeStyle(2, info.color, 1);
        this.tweens.add({ targets: glow, alpha: 0.2, scale: 1.12, duration: 700, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: im, scale: im.scale * 1.12, duration: 700, yoyo: true, repeat: -1 });
      }
      const z = this.add.zone(x, y, size, size).setInteractive({ useHandCursor: isAvail });
      z.on('pointerover', () => { rutaHasta(n.id); tip.show(x + 30, y - 20, info.name, info.desc + (isAvail ? '\n' + T.mapa.clicAvanzar : '')); });
      z.on('pointerout', () => { ruta.clear(); tip.hide(); });
      z.on('pointerdown', () => {
        if (!isAvail) return;
        run.visited = [...(run.visited ?? []), n.id];
        run.pos = n.id;
        saveLocal();
        this.enter(n);
      });
    }

    // lápidas de compañeros (llegan del servidor; se dibujan cuando estén)
    const lapidas = () => this.dibujarLapidas(run.map.filter((n) => n.type !== 'jefe'), nodeXY, tip);
    if (run.huellas?.acto === (run.acto ?? 1)) lapidas();
    else void cargarHuellas(() => { if (this.scene.isActive()) lapidas(); });

    // héroe en el mapa
    const hp = current ? nodeXY(current) : { x: 30, y: 280 };
    const hero = this.add.image(hp.x, hp.y - 46, 'hero').setScale(1);
    this.tweens.add({ targets: hero, y: hero.y - 4, duration: 500, yoyo: true, repeat: -1 });

    // leyenda
    const types: NodeType[] = ['combate', 'elite', 'evento', 'santuario', 'runa', 'mercader', 'taberna', 'fogata', 'jefe'];
    types.forEach((t, i) => {
      const x = 22 + i * 105;
      this.add.image(x, H - 22, NODE_INFO[t].icon).setScale(2.6);
      const lt = txt(this, x + 16, H - 33, t === 'jefe' && act4 ? 'AM' : t === 'jefe' && act3 ? 'Hibbelerius' : t === 'jefe' && act2 ? T.mapa.jefe2[0] : NODE_INFO[t].name, 18, CSS.dim);
      if (lt.width > 84) lt.setScale(84 / lt.width, 1);
    });

    // al empezar cada acto: un consejo para quien no ha jugado este tipo de juegos
    if (run.pos === -1) {
      if (!run.encargo || run.encargo.acto !== (run.acto ?? 1)) this.tablon(() => this.consejo());
      else this.consejo();
    }
  }

  /** Tablón de encargos: elige un contrato opcional para este acto (src/data/encargos.ts) */
  private tablon(despues: () => void) {
    const run = Game.run!;
    const opts = Phaser.Utils.Array.Shuffle([...ENCARGOS]).slice(0, 2);
    const c = this.add.container(0, 0).setDepth(900);
    c.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setInteractive());
    const g = this.add.graphics();
    frame(g, W / 2 - 300, 120, 600, 300, 0x120c08, 0xd89a4a, 0.98);
    c.add([g, title(this, W / 2, 152, 'Tablón de Encargos', 32, '#e8b070'),
      txt(this, W / 2, 184, 'Acepta un contrato opcional para este acto. Si lo cumples, te pagan.', 17, CSS.dim).setOrigin(0.5)]);
    const cerrar = (id: string | null) => {
      run.encargo = { id: id ?? '', acto: run.acto ?? 1, hecho: !id };
      saveLocal();
      c.destroy();
      this.scene.restart(); // al reiniciar ya aparece el consejo y el encargo en la barra
      void despues;
    };
    opts.forEach((e, i) => {
      const y = 240 + i * 70;
      const b = button(this, W / 2, y, 540, 60, '', () => cerrar(e.id), { size: 19, color: 0xd89a4a });
      b.label.setText(`${e.nombre} · +${e.premio} ${T.moneda}`).setY(-11);
      b.add(txt(this, 0, 13, e.texto, 16, CSS.dim).setOrigin(0.5));
      c.add(b);
    });
    c.add(button(this, W / 2, 386, 200, 34, 'Ninguno', () => cerrar(null), { size: 18 }));
  }

  /** Ventanita con un consejo al azar (src/data/glosario.ts → CONSEJOS); clic para cerrarla */
  private consejo() {
    const [ic, h, b] = Phaser.Utils.Array.GetRandom(CONSEJOS);
    const c = this.add.container(W / 2, H - 92).setDepth(800).setAlpha(0);
    const g = this.add.graphics();
    frame(g, -300, -38, 600, 76, 0x0b090e, UI.gold, 0.96);
    const t = txt(this, -238, -28, `Consejo · ${h}`, 19, CSS.gold);
    const d = txt(this, -238, -4, b, 16, CSS.bone, { wordWrap: { width: 520 } });
    if (d.height > 40) d.setFontSize(14);
    c.add([g, icon(this, -268, 0, ic, 4), t, d]);
    this.tweens.add({ targets: c, alpha: 1, duration: 500, delay: 600 });
    const cerrar = () => this.tweens.add({ targets: c, alpha: 0, duration: 400, onComplete: () => c.destroy() });
    this.time.delayedCall(12000, cerrar);
    g.setInteractive(new Phaser.Geom.Rectangle(-300, -38, 600, 76), Phaser.Geom.Rectangle.Contains).on('pointerdown', cerrar);
  }

  enter(n: MapNode) {
    switch (n.type) {
      case 'combate':
        return fadeTo(this, 'Combat', { kind: n.floor <= 1 ? 'easy' : 'normal', floor: n.floor });
      case 'elite':
        return fadeTo(this, 'Combat', { kind: 'elite', floor: n.floor });
      case 'jefe': {
        const r = Game.run!;
        const signos = r.huellas?.acto === (r.acto ?? 1) ? r.huellas.signos : [];
        if (signos.length && !r.fantasma) return this.elegirSigno(n.floor, signos);
        return fadeTo(this, 'Combat', { kind: 'boss', floor: n.floor });
      }
      case 'fogata':
        return fadeTo(this, 'Campfire', { floor: n.floor });
      case 'runa':
        return fadeTo(this, 'Rune', { floor: n.floor, source: 'altar' });
      case 'evento':
        return fadeTo(this, 'Event', { floor: n.floor });
      case 'mercader':
        return fadeTo(this, 'Shop', { floor: n.floor });
      case 'santuario':
        return fadeTo(this, 'Sanctuary', { floor: n.floor });
      case 'taberna':
        return fadeTo(this, 'Taberna', { floor: n.floor });
    }
  }

  /** Lápidas: donde cayó un compañero del grupo (mismo acto y piso). Clic = honrar (+Ergios, una vez) */
  private dibujarLapidas(nodos: MapNode[], nodeXY: (n: MapNode) => { x: number; y: number }, tip: Tooltip) {
    const r = Game.run!;
    const h = r.huellas;
    if (!h?.lapidas.length) return;
    const usados = new Map<string, number>();
    // máximo 3 por acto y una por compañero (lo más reciente primero)
    const vistos = new Set<string>();
    const lista = h.lapidas.filter((l) => !vistos.has(l.alias) && vistos.add(l.alias)).slice(0, MAX_LAPIDAS);
    for (const l of lista) {
      const enPiso = nodos.filter((n) => n.floor === Math.max(0, Math.min(l.piso, Math.max(...nodos.map((m) => m.floor)))));
      if (!enPiso.length) continue;
      const n = enPiso[l.id % enPiso.length];
      const k = `${n.id}`;
      const off = usados.get(k) ?? 0;
      usados.set(k, off + 1);
      const { x, y } = nodeXY(n);
      const lx = x + 30 + off * 22, ly = y + 30;
      const honrada = h.honradas.includes(l.id);
      const brillo = this.add.circle(lx, ly - 4, 18, honrada ? 0xe8c15a : 0x9ad8f0, 0.12).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: brillo, alpha: 0.03, scale: 1.25, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const g = this.add.graphics({ x: lx, y: ly });
      const lapida = (oro: boolean) => {
        g.clear();
        g.fillStyle(0x000000, 0.5).fillEllipse(0, 13, 30, 8);
        g.fillStyle(0x0d0b10, 1).fillRoundedRect(-12, -19, 24, 32, { tl: 12, tr: 12, bl: 2, br: 2 });
        g.fillStyle(oro ? 0xb8b0a0 : 0x8a8698, 1).fillRoundedRect(-10, -17, 20, 29, { tl: 10, tr: 10, bl: 1, br: 1 });
        g.fillStyle(oro ? 0xe8c15a : 0x3a3644, 1).fillRect(-1.5, -12, 3, 14).fillRect(-6, -7, 12, 3);
      };
      lapida(honrada);
      const d = datosDe(l);
      const enemigo = d.por ? (ENEMIES[d.por]?.name ?? d.por) : '¿?';
      const z = this.add.zone(lx, ly - 3, 26, 34).setInteractive({ useHandCursor: !honrada });
      z.on('pointerover', () => tip.show(lx + 14, ly - 20, `Aquí cayó ${l.alias}`, `Lo venció: ${enemigo}${d.concepto ? `\nFalló una pregunta de: ${d.concepto}` : ''}\n${honrada ? 'Ya la honraste.' : `Clic para honrarla (+${HONRA_ERGIOS} Ergios).`}`));
      z.on('pointerout', () => tip.hide());
      z.on('pointerdown', () => {
        if (h.honradas.includes(l.id)) return;
        h.honradas.push(l.id);
        addErgios(HONRA_ERGIOS);
        usarHuella(l.id);
        saveLocal();
        audio.sfx('coin');
        lapida(true);
        brillo.setFillStyle(0xe8c15a, 0.12);
        const t = txt(this, lx, ly - 30, `Honraste a ${l.alias} · +${HONRA_ERGIOS}`, 15, CSS.gold).setOrigin(0.5).setStroke('#000', 4);
        this.tweens.add({ targets: t, y: t.y - 20, alpha: 0, delay: 900, duration: 700, onComplete: () => t.destroy() });
      });
    }
  }

  /** Antes del jefe: signos dorados de compañeros que ya lo vencieron. Puedes invocar a uno. */
  private elegirSigno(floor: number, signos: { id: number; alias: string; datos: string }[]) {
    const r = Game.run!;
    const layer = this.add.container(0, 0).setDepth(5000);
    layer.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.82).setOrigin(0).setInteractive());
    const g = this.add.graphics();
    frame(g, 150, 80, W - 300, 380, 0x0c0a10, 0xe8c15a, 0.97);
    layer.add(g);
    layer.add(txt(this, W / 2, 96, 'Signos dorados en el suelo', 28, CSS.gold).setOrigin(0.5, 0));
    layer.add(txt(this, W / 2, 134, 'Compañeros de tu grupo que ya vencieron a este jefe dejaron su signo.\nPuedes invocar a uno para que pelee a tu lado. Si ganan, a él le llega Momentum.', 16, CSS.bone, { align: 'center' }).setOrigin(0.5, 0));
    const ir = (f?: { id: number; alias: string; datos: string }) => {
      if (f) { r.fantasma = { id: f.id, alias: f.alias, avatar: datosDe(f).avatar ?? '{}', acto: r.acto ?? 1 }; saveLocal(); }
      fadeTo(this, 'Combat', { kind: 'boss', floor });
    };
    signos.slice(0, 3).forEach((sg, i) => {
      const x = W / 2 + (i - (Math.min(3, signos.length) - 1) / 2) * 200, y = 268;
      let av: Record<string, unknown> = {};
      try { av = JSON.parse(datosDe(sg).avatar ?? '{}'); } catch { av = {}; }
      const key = `signo_${sg.id}`;
      try { makeHeroFromAvatar(this, av as never, key); } catch { /* avatar raro: sin dibujo */ }
      if (this.textures.exists(key)) {
        const halo = this.add.image(x, y, key).setScale(2.6).setTintFill(0xe8c15a).setAlpha(0.25).setBlendMode(Phaser.BlendModes.ADD);
        const im = this.add.image(x, y, key).setScale(2.5).setAlpha(0.85);
        this.tweens.add({ targets: [im, halo], y: y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        layer.add([halo, im]);
      }
      layer.add(txt(this, x, y + 64, sg.alias || 'Compañero', 18, CSS.gold).setOrigin(0.5, 0));
      layer.add(button(this, x, y + 112, 160, 34, 'Invocar', () => ir(sg), { color: UI.gold, size: 18 }));
    });
    layer.add(button(this, W / 2, 432, 200, 32, 'Pelear solo', () => ir(), { size: 17 }));
  }
}
