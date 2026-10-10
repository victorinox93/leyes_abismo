import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W, H } from '../config';
import { BAYES_EXPEDICIONES, BOONS, FIGURES, FigureDef } from '../data/figures';
import { addCard, addEntropia, addErgios, expediciones, Game, logEvent, saveLocal, sumarAfinidad, syncRun, unlock } from '../state';
import { DUOS, Duo, Rivalidad, rivalesDe } from '../data/relaciones';
import { CardInst, cardName, evolucionable } from '../data/cards';
import { ENTROPIA } from '../data/abismo';
import { T } from '../textos';
import { deckOverlay, topBar } from '../ui/hud';
import { button, fadeTo, frame, icon, title, Tooltip, txt, vignette } from '../ui/widgets';

export interface SanctuaryData {
  floor: number;
  figureId?: string;
  phase?: 'intro' | 'elegir';
  epic?: boolean;
  reto?: boolean; // venía de un reto de reconciliación
  sinResponder?: boolean;
}

const nombreDe = (id: string) => FIGURES.find((f) => f.id === id)?.name ?? id;

/** ¿Este eco está molesto? (aceptaste en esta expedición un don de su rival y no se han reconciliado) */
export function molestia(figId: string): { rival: string; r: Rivalidad } | null {
  const run = Game.run!;
  if ((run.seen ?? []).includes(`recon_${figId}`)) return null;
  const tengo = new Set(run.boons.map((b) => BOONS[b.id]?.figure));
  return rivalesDe(figId).find((x) => tengo.has(x.rival)) ?? null;
}

/** Dúos que este eco puede ofrecer (tienes un don de su pareja y aún no tienes el dúo) */
export function duosListos(figId: string): Duo[] {
  const run = Game.run!;
  const tengo = new Set(run.boons.map((b) => BOONS[b.id]?.figure));
  return DUOS.filter((d) => d.figs.includes(figId) && tengo.has(d.figs.find((f) => f !== figId)!) && !run.boons.some((b) => b.id === d.id));
}

function pickFigure(): FigureDef {
  const r = Game.run!;
  const acto = r.acto ?? 1;
  const posibles = FIGURES.filter((f) => (!f.act || acto >= f.act) && (f.id !== 'bayes' || expediciones() >= BAYES_EXPEDICIONES));
  // en el Núcleo, los ecos del Núcleo (Asimov y Turing) salen más seguido
  const delActo = posibles.filter((f) => f.act === acto && !r.met.includes(f.id));
  if (delActo.length && Math.random() < 0.6) return Phaser.Utils.Array.GetRandom(delActo);
  const unmet = posibles.filter((f) => !r.met.includes(f.id));
  const pool = unmet.length ? unmet : posibles;
  return Phaser.Utils.Array.GetRandom(pool);
}

export class SanctuaryScene extends Phaser.Scene {
  private hud!: ReturnType<typeof topBar>;
  private tip!: Tooltip;

  constructor() { super('Sanctuary'); }

  create(data: SanctuaryData) {
    this.cameras.main.fadeIn(500);
    audio.play('santuario');
    const run = Game.run!;
    const fig = (data.figureId && FIGURES.find((f) => f.id === data.figureId)) || pickFigure();
    const phase = data.phase ?? 'intro';
    unlock('figures', fig.id);
    saveLocal();

    // ── ambiente: haz de luz espectral ──
    this.add.rectangle(0, 0, W, H, 0x040308).setOrigin(0);
    const fx = phase === 'intro' ? 250 : 150;
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(fx, 0, 160 - i * 22, H, 0x7fd8ff, 0.025).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD);
    }
    const glow = this.add.circle(fx, 250, 120, 0x7fd8ff, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.15, scale: 1.08, duration: 2200, yoyo: true, repeat: -1 });
    this.add.particles(fx, 420, 'px', {
      x: { min: -70, max: 70 }, speedY: { min: -40, max: -15 }, lifespan: 4000, frequency: 90,
      scale: { start: 1.6, end: 0 }, alpha: { start: 0.7, end: 0 }, tint: [0x7fd8ff, 0xd8f4ff, 0xe8c15a], blendMode: 'ADD',
    });
    vignette(this);
    this.tip = new Tooltip(this);
    this.hud = topBar(this, this.tip);

    const sc = phase === 'intro' ? 9 : 6;
    const por = this.add.image(fx, phase === 'intro' ? 250 : 230, fig.sprite).setScale(sc).setTint(0xd8ecff).setAlpha(0);
    this.tweens.add({ targets: por, alpha: 0.95, duration: 1200 });
    this.tweens.add({ targets: por, y: por.y - 6, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    txt(this, fx, phase === 'intro' ? 352 : 312, fig.name, 26, CSS.bone).setOrigin(0.5);
    txt(this, fx, phase === 'intro' ? 378 : 336, `${fig.years} · ${fig.epithet}`, 18, '#9ad8f0').setOrigin(0.5);

    // relaciones: afinidad, molestia y dúos
    const yb = phase === 'intro' ? 404 : 360;
    const mol = molestia(fig.id);
    const af = Game.codex.afinidad?.[fig.id] ?? 0;
    const badges: [string, string, string][] = [];
    if (mol) badges.push([`💢 Molesto (llevas dones de ${nombreDe(mol.rival)})`, '#e08a8a', `${mol.r.titulo}\n${mol.r.historia}`]);
    else if (af > 0) badges.push([`❤ Afinidad ×${af}`, '#e8a0b0', `Has elegido a ${fig.name} ${af} ${af === 1 ? 'vez' : 'veces'} en todas tus expediciones.`]);
    for (const d of duosListos(fig.id)) {
      const otro = d.figs.find((f) => f !== fig.id)!;
      badges.push([`✦ Don dúo con ${nombreDe(otro)}`, CSS.gold, `${BOONS[d.id].name}: ${BOONS[d.id].text[0]}`]);
    }
    badges.slice(0, 2).forEach(([t, col, info], i) => {
      const b = txt(this, fx, yb + i * 24, t, 17, col, { align: 'center' }).setOrigin(0.5).setInteractive();
      if (b.width > 300) b.setScale(300 / b.width);
      this.tip.attach(b, t.replace(/^\S+ /, ''), info);
    });

    if (phase === 'intro') this.intro(fig, data);
    else this.choose(fig, data, !!data.epic);
    void run;
  }

  private intro(fig: FigureDef, data: SanctuaryData) {
    title(this, 690, 76, T.mapa.nodos.santuario[0], 38, '#9ad8f0');
    const g = this.add.graphics();
    frame(g, 470, 110, 460, 250, 0x07090e, 0x3a6a8a, 0.95);
    const mol = molestia(fig.id);
    const af = Game.codex.afinidad?.[fig.id] ?? 0;
    const saludo = mol ? mol.r.queja[fig.id] : af >= 3 ? `«Otra vez tú. Ya van ${af} veces que confías en mí, y eso no se olvida.»` : fig.intro;
    txt(this, 490, 128, saludo, 21, mol ? '#f0c0b0' : CSS.bone, { wordWrap: { width: 420 }, lineSpacing: 2 });
    txt(this, 490, 250, `${T.santuario.don}s:`, 19, CSS.gold);
    fig.boons.forEach((id, i) => {
      const b = BOONS[id];
      const im = icon(this, 504, 286 + i * 24, b.icon, 2);
      txt(this, 520, 276 + i * 24, b.name, 19, CSS.dim);
      this.tip.attach(im, b.name, `${T.santuario.comun}: ${b.text[0]}\n${T.santuario.epico}: ${b.text[1]}`);
    });
    button(this, 580, 430, 220, 60, mol ? 'Reconciliarte\n(si fallas, se va)' : T.santuario.responder, () => {
      fadeTo(this, 'Rune', { floor: data.floor, source: 'santuario', figureId: fig.id, reto: !!mol });
    }, { color: mol ? 0xc8643a : UI.gold, size: mol ? 19 : 21 });
    button(this, 820, 430, 220, 60, mol ? 'Sin responder\n(sólo 2 dones comunes)' : T.santuario.sinResponder, () => {
      fadeTo(this, 'Sanctuary', { floor: data.floor, figureId: fig.id, phase: 'elegir', epic: false, sinResponder: true });
    }, { size: mol ? 19 : 21 });
  }

  /** Dones que hacen algo en el momento (Oppenheimer, Darwin) */
  private donInmediato(id: string, epic: boolean, done: (extra?: string) => void) {
    const run = Game.run!;
    const vida = (n: number) => { run.maxHp += n; run.hp = Math.min(run.maxHp, run.hp + n); };
    if (id === 'o_trinity') {
      addCard('trinity', epic);
      return done('La carta «Trinity» está en tu mazo. Úsala con cuidado: sólo hay una.');
    }
    if (id === 'd_adaptacion') {
      vida(epic ? 20 : 12);
      return done(`+${epic ? 20 : 12} de Vida máxima.`);
    }
    if (id === 'd_seleccion') {
      vida(epic ? 10 : 5);
      const cands = run.deck.filter(evolucionable);
      if (!cands.length) return done(`+${epic ? 10 : 5} de Vida máxima.`);
      const evo = (ci: CardInst) => {
        ci.evo = (ci.evo ?? 0) + 3;
        if (epic) ci.up = true;
        saveLocal();
        audio.sfx('victory');
        done(`«${cardName(ci)}» evolucionó 3 niveles. +${epic ? 10 : 5} de Vida máxima.`);
      };
      deckOverlay(this, 'Selección Natural: elige la carta que evolucionará', cands, (i) => evo(cands[i]),
        () => evo(Phaser.Utils.Array.GetRandom(cands)));
      return;
    }
    done();
  }

  private choose(fig: FigureDef, data: SanctuaryData, epic: boolean) {
    const run = Game.run!;
    title(this, 600, 76, `${T.santuario.elige} · ${epic ? T.santuario.epico : T.santuario.comun}`, 36, epic ? CSS.gold : CSS.bone);
    const finish = (msg: string) => {
      if (!run.met.includes(fig.id)) run.met.push(fig.id);
      addEntropia(ENTROPIA.eco); // una mente lúcida calma la tuya
      run.floor = data.floor + 1;
      saveLocal();
      syncRun('en curso');
      this.hud.refresh();
      this.children.list.filter((o) => o.getData?.('boon')).forEach((o) => o.destroy());
      const g = this.add.graphics();
      frame(g, 330, 180, 560, 180, 0x07090e, 0x3a6a8a, 0.95);
      txt(this, 610, 230, fig.farewell, 23, CSS.bone, { align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5);
      txt(this, 610, 300, msg, 20, CSS.gold, { align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5);
      button(this, 610, 420, 220, 44, T.santuario.continuar, () => fadeTo(this, 'Map'), { size: 22 });
    };

    // ── relaciones ──
    const mol = molestia(fig.id);
    if (mol && data.reto && !epic) {
      // falló la reconciliación: el eco se va sin dar nada
      logEvent('eco_molesto', fig.id, false, { rival: mol.rival });
      return finish(`${fig.name} sigue molesto por ${nombreDe(mol.rival)} y se desvanece sin darte nada.`);
    }
    if (mol && data.reto && epic) {
      (run.seen ??= []).push(`recon_${fig.id}`);
      logEvent('eco_molesto', fig.id, true, { rival: mol.rival });
    }
    const molesto = !!mol && !(data.reto && epic);
    const avail = fig.boons.filter((id) => !run.boons.some((b) => b.id === id));
    if (!avail.length && !duosListos(fig.id).length) {
      addErgios(30);
      return finish(T.santuario.sinDones);
    }
    // molesto y sin reconciliarse: sólo 2 dones (comunes)
    let lista = [...fig.boons];
    if (molesto) lista = Phaser.Utils.Array.Shuffle([...avail]).slice(0, 2);
    // don dúo como cuarta opción
    const duos = molesto ? [] : duosListos(fig.id);
    lista.push(...duos.slice(0, 1).map((d) => d.id));
    if (!lista.length) {
      addErgios(30);
      return finish(T.santuario.sinDones);
    }
    const n = lista.length;
    const ancho = n >= 4 ? 156 : 190, paso = n >= 4 ? 168 : 210, x0 = n >= 4 ? 352 : 390;
    lista.forEach((id, i) => {
      const b = BOONS[id];
      const esDuo = !!b.duo;
      const owned = !esDuo && !avail.includes(id);
      const x = x0 + i * paso, y = 140;
      const c = this.add.container(0, 0).setData('boon', true);
      const g = this.add.graphics();
      const draw = (hover: boolean) => {
        g.clear();
        frame(g, x - ancho / 2, y, ancho, 290, hover ? (esDuo ? 0x2a2010 : 0x14182a) : esDuo ? 0x1a140a : 0x0b0d16, owned ? UI.border : esDuo ? 0xe8a040 : epic ? UI.gold : 0x9aa4b8, 0.97);
      };
      draw(false);
      c.add(g);
      c.add(icon(this, x, y + 50, b.icon, 6).setAlpha(owned ? 0.3 : 1));
      // los textos se apilan según su alto real y se encogen hasta caber en la caja (y … y+282)
      const nombreT = txt(this, x, 0, b.name, n >= 4 ? 19 : 22, owned ? CSS.dim : esDuo ? '#f0c070' : CSS.bone, { align: 'center', wordWrap: { width: ancho - 20 } }).setOrigin(0.5, 0);
      const etiquetaT = txt(this, x, 0, owned ? T.santuario.yaLoTienes : esDuo ? `✦ Dúo con ${nombreDe(b.duo!.find((f) => f !== fig.id)!)}` : epic ? T.santuario.epico : T.santuario.comun, n >= 4 ? 15 : 18,
        owned ? CSS.dim : esDuo ? CSS.gold : epic ? CSS.gold : '#b8c0d0', { align: 'center', wordWrap: { width: ancho - 16 } }).setOrigin(0.5, 0);
      // el texto puede traer una segunda parte con el costo de radiación
      const [good, rad] = b.text[epic ? 1 : 0].split('\nRadiación:');
      const efectoT = txt(this, x, 0, good, n >= 4 ? 16 : 18, CSS.bone, { align: 'center', wordWrap: { width: ancho - 20 } }).setOrigin(0.5, 0);
      const radT = rad ? txt(this, x, 0, `Radiación:${rad}`, 16, '#9bf07a', { align: 'center', wordWrap: { width: ancho - 20 } }).setOrigin(0.5, 0) : null;
      const loreT = !rad && n < 4 ? txt(this, x, 0, b.lore, 15, '#7a8a9a', { align: 'center', wordWrap: { width: ancho - 20 } }).setOrigin(0.5, 0) : null;
      const textos = [nombreT, etiquetaT, efectoT, radT, loreT].filter((t): t is Phaser.GameObjects.Text => !!t);
      const base = textos.map((t) => Number.parseInt(String(t.style.fontSize), 10) || 16);
      const fondo = y + 282;
      const acomodar = () => {
        let yy = y + 92;
        textos.forEach((t, k) => { t.setY(yy); yy += t.height + (k === 0 ? 4 : 8); });
        return yy - 8;
      };
      // primero se encoge; si aun así no cabe, la cita (lore) se queda sólo en el tooltip
      for (let k = 0; acomodar() > fondo && k < 4; k++) textos.forEach((t, i) => t.setFontSize(Math.max(13, base[i] - k - 1)));
      if (acomodar() > fondo && loreT) { textos.pop(); loreT.destroy(); acomodar(); }
      textos.forEach((t) => c.add(t));
      if (!owned) {
        const z = this.add.zone(x - ancho / 2, y, ancho, 290).setOrigin(0).setInteractive({ useHandCursor: true });
        z.on('pointerover', (p: Phaser.Input.Pointer) => { draw(true); audio.sfx('hover'); this.tip.show(p.worldX + 20, 452, b.name, b.lore); });
        z.on('pointerout', () => { draw(false); this.tip.hide(); });
        z.on('pointerdown', () => {
          run.boons.push({ id, epic });
          unlock('boons', id);
          if (!run.debug) sumarAfinidad(fig.id);
          audio.sfx('heal');
          logEvent('don', fig.id, epic, { don: id, epico: epic, duo: esDuo });
          const d = esDuo ? DUOS.find((x) => x.id === id) : null;
          const msg = `${T.santuario.don}${esDuo ? ' dúo' : ''}: ${b.name} (${epic ? T.santuario.epico : T.santuario.comun})${d ? `\n${d.dialogo[0]}\n${d.dialogo[1]}` : ''}`;
          this.tip.hide();
          this.donInmediato(id, epic, (extra) => finish(extra ? `${msg}\n${extra}` : msg));
        });
        c.add(z);
      }
    });
  }
}
