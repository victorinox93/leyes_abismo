import Phaser from 'phaser';
import { api, isOnline } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { makeHeroFromAvatar } from '../art/sprites';
import { T } from '../textos';
import { FORM_URL, W, H } from '../config';
import { starterDeck } from '../data/cards';
import { CLASSES } from '../data/classes';
import { GRAVITY } from '../data/gravity';
import { siguienteNivel } from '../data/progreso';
import { ALMA_IDS } from '../data/almas';
import { progresoGrimorio } from './Codex';
import { REGALO_DIARIO } from '../data/tienda';
import { BAYES_EXPEDICIONES } from '../data/figures';
import { DIAG_POST_EXPEDICIONES, DIAGNOSTICO } from '../data/diagnostico';
import { MOMENTUM_POR_AYUDA, TOPE_AYUDAS } from '../huellas';
import { amVencido, claseJugable, codexFlag, expediciones, ganarMomentum, momentum, tiendaAbierta, regaloDiario, clearSession, Game, isAdmin, nucleoDisponible, nivelActual, logEvent, newRun, saveLocal, syncRun, unlock } from '../state';
import { button, dungeonBackground, embers, fadeTo, frame, panel, title, torch, txt } from '../ui/widgets';

/** ¿Qué diagnóstico toca? (el profesor no lo hace) */
function diagPendiente(): 'pre' | 'post' | null {
  if (isAdmin()) return null;
  const d = Game.codex.diag ?? {};
  if (d.pre === undefined) return 'pre';
  if (d.post === undefined && expediciones() >= DIAG_POST_EXPEDICIONES) return 'post';
  return null;
}

/** los avisos de huellas se piden una vez por sesión */
let avisosPedidos = false;

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create(data: { iniciar?: boolean } = {}) {
    this.iniciando = false;
    this.cameras.main.fadeIn(300);
    audio.play('menu');
    dungeonBackground(this, 5, 0x1a1622);
    embers(this);
    const p = Game.profile!;
    const av = p.avatar!;
    makeHeroFromAvatar(this, av);

    title(this, W / 2, 50, T.titulo, 50);
    txt(this, W / 2, 90, T.menu.lugar, 24, CSS.dim).setOrigin(0.5);

    torch(this, 300, 330);
    this.add.image(300, 352, 'i_fire').setScale(5);
    const hero = this.add.image(200, 330, 'hero').setScale(3);
    this.tweens.add({ targets: hero, y: 326, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.progreso();
    button(this, 70, 22, 110, 26, T.menu.creditos, () => fadeTo(this, 'Credits'), { size: 15 });
    // regalo diario de Layla (fomenta entrar seguido)
    this.avisosHuellas();
    const regalo = tiendaAbierta() ? regaloDiario(REGALO_DIARIO) : 0;
    if (regalo) {
      const t = txt(this, 690, 112, `Layla te dejó +${regalo} ◈ Momentum. ¡Pasa a su tienda!`, 18, '#f0b070').setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 600, delay: 600, hold: 3500, yoyo: true });
    }

    panel(this, 60, 412, 450, 108);
    const aliasT = txt(this, 80, 422, av.alias, 30, CSS.gold);
    if (av.insignia === 'am' || amVencido()) {
      // insignia de quien venció a AM
      const ojo = this.add.image(80 + aliasT.width + 18, 440, 'i_ojo').setScale(2).setTint(0xff3a3a).setInteractive();
      this.tweens.add({ targets: ojo, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
      const lbl = txt(this, 80 + aliasT.width + 18, 398, 'Vencedor de AM', 16, '#ff8a7a').setOrigin(0.5).setStroke('#000', 4).setAlpha(0);
      ojo.on('pointerover', () => lbl.setAlpha(1)).on('pointerout', () => lbl.setAlpha(0));
    }
    const xp = Game.codex.xp ?? 0;
    const sig = siguienteNivel(xp, nivelActual());
    txt(this, 494, 424, `Conocimiento: nivel ${nivelActual()}`, 18, '#9ad8f0').setOrigin(1, 0);
    txt(this, 494, 452, sig ? `${xp} / ${sig}` : 'máximo', 16, CSS.dim).setOrigin(1, 0);
    txt(this, 80, 454, `${CLASSES.find((c) => c.id === av.clase)?.name ?? 'Caballero de la Masa'} · ${p.matricula}`, 20, CSS.bone);
    const gmax = Game.codex.gravedadMax;
    txt(this, 80, 476, `${T.menu.mejorGravedad}: ${gmax ? GRAVITY[gmax - 1].name : T.menu.ninguna}`, 18, CSS.dim);
    txt(this, 80, 496, p.offline || !isOnline() ? `● ${T.menu.desconectado}` : `● ${T.menu.conectado} ${p.grupo}`, 18,
      p.offline || !isOnline() ? CSS.dim : CSS.green);
    const seg = Game.codex.tiempo ?? 0;
    const hrs = Math.floor(seg / 3600);
    const min = Math.floor((seg % 3600) / 60);
    const nExp = expediciones();
    txt(this, 494, 476, `Expediciones: ${nExp}`, 16, CSS.bone).setOrigin(1, 0);
    txt(this, 494, 498, `Jugado: ${hrs ? `${hrs} h ` : ''}${min} min`, 16, CSS.dim).setOrigin(1, 0);

    const x = 690;
    let y = 150;
    const run = Game.run && !Game.run.done ? Game.run : null;
    if (run) {
      button(this, x, y, 330, 48, `${T.menu.continuar} (${T.hud.piso.toLowerCase()} ${run.floor + 1})`, () => fadeTo(this, 'Map'), { color: UI.gold, size: 24 });
      y += 58;
    }
    button(this, x, y, 330, 48, run ? T.menu.nueva : T.menu.comenzar, () => {
      // v0.32: diagnóstico inicial antes de la primera expedición y final al cumplir DIAG_POST_EXPEDICIONES
      const fase = diagPendiente();
      if (fase) return fadeTo(this, 'Diagnostico', { fase, luego: 'expedicion' });
      this.pickGravity();
    }, { color: run ? UI.border : UI.blood, size: 26 });
    if (diagPendiente() === 'post') {
      const t = txt(this, x, y + 30, `📝 Toca tu diagnóstico final (${DIAGNOSTICO.length} preguntas, ~4 min)`, 15, CSS.gold).setOrigin(0.5, 0);
      this.tweens.add({ targets: t, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
    }
    y += 64;
    const grid: [string, () => void][] = [
      [T.menu.grimorio, () => fadeTo(this, 'Codex')],
      [T.menu.ranking, () => fadeTo(this, 'Ranking')],
      [T.menu.ayuda, () => fadeTo(this, 'Help', { next: 'Menu' })],
      ['Glosario', () => fadeTo(this, 'Glosario')],
      [T.menu.editar, () => fadeTo(this, 'Avatar')],
      ['Vestidor', () => fadeTo(this, 'Vestidor')],
      [tiendaAbierta() ? 'Tienda de Layla' : '🔒 Tienda de Layla', () => {
        if (tiendaAbierta()) return fadeTo(this, 'Tienda');
        const t = txt(this, 690, 112, 'La tienda de Layla abre cuando regreses de tu primera expedición.', 18, '#f0b070').setOrigin(0.5);
        this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 500, onComplete: () => t.destroy() });
      }],
      [expediciones() >= BAYES_EXPEDICIONES || isAdmin() ? '📊 Estadísticas' : '🔒 Estadísticas', () => {
        if (expediciones() >= BAYES_EXPEDICIONES || isAdmin()) return fadeTo(this, 'Estadisticas');
        const t = txt(this, 690, 112, `Termina ${BAYES_EXPEDICIONES} expediciones y Thomas Bayes analizará tus datos.`, 18, CSS.dim).setOrigin(0.5);
        this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 500, onComplete: () => t.destroy() });
      }],
      [Game.codex.victorias > 0 ? '♪ Soundtrack' : '🔒 Soundtrack', () => {
        if (Game.codex.victorias > 0) return fadeTo(this, 'Musica');
        const t = txt(this, 690, 112, 'Vence a Hibbelerius para desbloquear el soundtrack.', 18, CSS.dim).setOrigin(0.5);
        this.tweens.add({ targets: t, alpha: 0, delay: 1800, duration: 500, onComplete: () => t.destroy() });
      }],
      ...(FORM_URL ? [['✎ Tu opinión', () => window.open(FORM_URL, '_blank')] as [string, () => void]] : []),
      [T.menu.salir, () => {
        clearSession();
        Game.profile = null;
        Game.run = null;
        fadeTo(this, 'Login');
      }],
    ];
    grid.forEach(([label, fn], i) => {
      button(this, x - 84 + (i % 2) * 168, y + Math.floor(i / 2) * 46, 160, 40, label, fn, { size: label.length > 14 ? 16 : 20 });
    });
    if (isAdmin()) button(this, x, y + Math.ceil(grid.length / 2) * 46, 330, 38, 'Modo profesor (depuración)', () => fadeTo(this, 'Debug'), { color: 0x9a4040, size: 21 });
    // al volver del diagnóstico inicial: directo a elegir la gravedad
    if (data.iniciar) this.time.delayedCall(400, () => this.pickGravity());
  }

  /** v0.30: ¿tus signos ayudaron a alguien? ¿honraron tu lápida? (una vez por sesión) */
  private avisosHuellas() {
    const prof = Game.profile;
    if (!prof || prof.offline || !isOnline() || avisosPedidos) return;
    avisosPedidos = true;
    api.avisos(prof.token).then((a) => {
      const msgs: string[] = [];
      if (a.ayudas > 0) {
        const mom = Math.min(TOPE_AYUDAS, a.ayudas * MOMENTUM_POR_AYUDA);
        ganarMomentum(mom);
        saveLocal();
        const quien = a.ayudantes?.length ? a.ayudantes.join(', ') : 'un compañero';
        msgs.push(`✦ Tu signo dorado ayudó a ${quien} a vencer a un jefe: +${mom} ◈ Momentum`);
      }
      if (a.honras > 0) msgs.push(`🪦 Tus compañeros honraron tu lápida ${a.honras} ${a.honras === 1 ? 'vez' : 'veces'}.`);
      if (!msgs.length || !this.scene.isActive()) return;
      const t = txt(this, 690, 84, msgs.join('\n'), 16, CSS.gold, { align: 'center', wordWrap: { width: 520 } }).setOrigin(0.5, 0).setStroke('#000', 4).setDepth(800).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 600, hold: 6000, yoyo: true, onComplete: () => t.destroy() });
    }).catch(() => { avisosPedidos = false; });
  }

  /** Panel de progreso: Grimorio, jefes, almas, figuras y cartas */
  private progreso() {
    const g = this.add.graphics();
    frame(g, 60, 106, 380, 150, 0x0e0b12, UI.border, 0.88);
    txt(this, 76, 112, 'Tu avance', 18, CSS.gold);
    const pg = progresoGrimorio();
    if (pg.known / Math.max(1, pg.total) >= 0.75) codexFlag('logro_grimorio');
    const flags = Game.codex.flags ?? [];
    const nucleo = nucleoDisponible() || flags.includes('acto4');
    const jefes = ['acto1', 'acto2', 'acto3', ...(nucleo ? ['acto4'] : [])];
    const almas = ALMA_IDS.filter((id) => Game.codex.npcs.includes(`alma_${id}`)).length;
    const filas: [string, number, number, number, string][] = [
      ['Grimorio', pg.known, pg.total, 0xc8a050, `${Math.round((100 * pg.known) / Math.max(1, pg.total))} %`],
      ['Jefes', jefes.filter((f) => flags.includes(f)).length, jefes.length, 0xc84a4a, ''],
      ['Almas', almas, ALMA_IDS.length, 0x9ad8f0, ''],
      ['Figuras', pg.tabs[2].known, pg.tabs[2].total, 0xb89ad0, ''],
      ['Cartas', pg.tabs[3].known, pg.tabs[3].total, 0x7fc87a, ''],
    ];
    filas.forEach(([nombre, k, t, color, etiqueta], i) => {
      const y = 140 + i * 22;
      txt(this, 76, y - 9, nombre, 16, CSS.dim);
      const x0 = 160, w = 190;
      g.fillStyle(0x1e1a24, 1).fillRect(x0, y - 4, w, 9);
      const frac = Math.min(1, k / Math.max(1, t));
      if (frac > 0) g.fillStyle(color, 1).fillRect(x0, y - 4, Math.max(3, w * frac), 9);
      g.lineStyle(1, 0x3a3444, 1).strokeRect(x0, y - 4, w, 9);
      txt(this, 428, y - 9, etiqueta || `${k}/${t}`, 16, frac >= 1 ? CSS.gold : CSS.bone).setOrigin(1, 0);
    });
  }

  /** Ventana para elegir el nivel de gravedad antes de una expedición */
  private pickGravity() {
    const layer = this.add.container(0, 0).setDepth(900);
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setInteractive();
    const g = this.add.graphics();
    frame(g, 150, 70, W - 300, 410, 0x0b090e, UI.gold);
    layer.add([shade, g, title(this, W / 2, 104, T.menu.gravedad, 36),
      txt(this, W / 2, 138, T.menu.gravedadInfo, 18, CSS.dim, { align: 'center', wordWrap: { width: W - 360 } }).setOrigin(0.5, 0)]);
    GRAVITY.forEach((lv, i) => {
      const unlocked = lv.id <= Game.codex.gravedadMax + 1;
      const y = 200 + i * 86;
      const b = button(this, W / 2, y + 18, W - 360, 74, '', () => {
        layer.destroy();
        this.start(lv.id);
      }, { enabled: unlocked, color: i === 0 ? UI.border : i === 1 ? 0x6a8fc4 : 0xc87533 });
      b.label.setText('');
      b.add(txt(this, -(W - 360) / 2 + 20, -26, `${lv.name}  ·  g = ${lv.g} m/s²  ·  puntaje ×${lv.scoreMul}`, 23, unlocked ? CSS.gold : '#5a5468'));
      b.add(txt(this, -(W - 360) / 2 + 20, 2, unlocked ? lv.desc : T.menu.gravedadBloqueada, 18, unlocked ? CSS.bone : '#5a5468',
        { wordWrap: { width: W - 400 } }));
      layer.add(b);
    });
    layer.add(button(this, W / 2, 458, 160, 34, T.menu.cancelar, () => layer.destroy(), { size: 20 }));
  }

  private iniciando = false;

  private async start(gravity: number) {
    // evita que un doble clic (o la espera del servidor) cree varias expediciones
    if (this.iniciando) return;
    this.iniciando = true;
    const espera = this.add.container(0, 0).setDepth(950);
    espera.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0).setInteractive());
    espera.add(txt(this, W / 2, H / 2, 'Abriendo las criptas…', 28, CSS.gold).setOrigin(0.5));
    const p = Game.profile!;
    const av = p.avatar!;
    if (Game.run && !Game.run.done) syncRun('abandonada', 'nueva expedición');
    let runId = `L-${Date.now().toString(36)}`;
    if (!p.offline && isOnline()) {
      try {
        runId = (await api.startRun(p.token, av.clase, gravity)).runId;
      } catch (e) {
        console.warn(e);
      }
    }
    const clase = claseJugable(av.clase);
    Game.run = newRun(runId, gravity, clase);
    starterDeck(clase).forEach((id) => unlock('cards', id));
    saveLocal();
    logEvent('inicio', '', '', { clase: av.clase, gravedad: gravity });
    fadeTo(this, 'Help', { next: 'Map', first: true });
  }
}
