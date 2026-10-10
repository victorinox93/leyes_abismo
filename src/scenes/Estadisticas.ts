import Phaser from 'phaser';
import { api, Estadisticas, isOnline } from '../api';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W } from '../config';
import { ENEMIES } from '../data/enemies';
import { expediciones, Game } from '../state';
import { button, dungeonBackground, fadeTo, frame, title, txt } from '../ui/widgets';

/** Nombres legibles de los temas (los conceptos internos no llevan acentos) */
const TEMA: Record<string, string> = {
  '1a ley': '1ª ley de Newton', '2a ley': '2ª ley de Newton', '3a ley': '3ª ley de Newton', '2a ley (sistemas)': '2ª ley (sistemas)', Trabajo: 'Trabajo',
  Friccion: 'Fricción', 'Plano inclinado': 'Plano inclinado', 'Caida libre': 'Caída libre',
  'Trabajo-energia': 'Trabajo y energía', 'Energia cinetica': 'Energía cinética', 'Energia potencial': 'Energía potencial',
  Potencia: 'Potencia', Impulso: 'Impulso', 'Cantidad de movimiento': 'Cantidad de movimiento', Choques: 'Choques',
  Peso: 'Peso', Resortes: 'Resortes',
};
const ACENTOS: [RegExp, string][] = [
  [/aceleracion/g, 'aceleración'], [/Conservacion/g, 'Conservación de la energía'], [/Graficas/g, 'Gráficas'], [/Energia/g, 'Energía'],
  [/cinetica/g, 'cinética'], [/Friccion/g, 'Fricción'], [/Caida/g, 'Caída'], [/(\d)a ley/g, '$1ª ley'],
];
const bonito = (t: string) => TEMA[t] ?? ACENTOS.reduce((x, [re, r]) => x.replace(re, r), t)
  .replace(/-/g, ' y ').replace(/^Derivada: /, 'Derivada · ').replace(/^Integral: /, 'Integral · ');

/** Jefes en orden de aparición: acto → [id, nombre corto, sprite] */
const JEFES: [number, string, string][] = [[1, 'Coloso Inerte', 'colossus'], [2, 'Bruja de la Fricción', 'bruja'], [3, 'Hibbelerius', 'hibbelerius'], [4, 'AM', 'am_jefe']];
const FLAG = ['acto1', 'acto2', 'acto3', 'acto4'];

/**
 * Menú → Estadísticas (v0.30, rediseño v0.31.2). Thomas Bayes analiza tus datos:
 * resumen, jefes derrotados, quién te vence, a quién vences y los temas que más se complican.
 * Datos del servidor (Partidas y Eventos) más el conteo de enemigos del Grimorio.
 * P(acertar) = (aciertos + 1) / (intentos + 2) · regla de sucesión de Laplace (prior uniforme).
 */
export class EstadisticasScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;

  constructor() { super('Estadisticas'); }

  create() {
    this.cameras.main.fadeIn(250);
    audio.play('santuario');
    dungeonBackground(this, 53, 0x14121a);
    title(this, W / 2, 28, 'Estadísticas', 36);
    const fig = this.add.image(78, 96, 'fig_bayes').setScale(3.4);
    this.tweens.add({ targets: fig, y: 93, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const g = this.add.graphics();
    frame(g, 130, 58, W - 170, 64, 0x0e0b12, UI.border, 0.94);
    txt(this, 146, 66, '«Cada expedición es un dato. Con suficientes datos, ya no adivinamos: estimamos.\nEsto es lo que tus intentos dicen de ti… y lo que conviene repasar.»  — Thomas Bayes', 16, CSS.bone, { lineSpacing: 3 });
    this.layer = this.add.container(0, 0);
    button(this, W / 2, 516, 200, 36, 'Volver', () => fadeTo(this, 'Menu'), { size: 21 });
    const prof = Game.profile!;
    if (!prof.offline && isOnline()) {
      const cargando = txt(this, W / 2, 300, 'Bayes está revisando tus datos…', 20, CSS.dim).setOrigin(0.5);
      api.estadisticas(prof.token)
        .then((e) => { cargando.destroy(); if (this.scene.isActive()) this.mostrar(e); })
        .catch(() => { cargando.destroy(); if (this.scene.isActive()) this.mostrar(null); });
    } else this.mostrar(null);
  }

  private mostrar(e: Estadisticas | null) {
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const c = Game.codex;
    const g = L(this.add.graphics());
    const Y0 = 134, H0 = 362;
    const col = (x: number, w: number, titulo: string) => { frame(g, x, Y0, w, H0, 0x0e0b12, UI.border, 0.94); L(txt(this, x + 14, Y0 + 8, titulo, 19, CSS.gold)); };
    const fila = (x: number, w: number, y: number, k: string, v: string, color: string = CSS.bone) => {
      L(txt(this, x + 14, y, k, 15, CSS.dim));
      L(txt(this, x + w - 14, y, v, 15, color).setOrigin(1, 0));
    };

    // ── 1 · resumen ──
    const A = 40, AW = 270;
    col(A, AW, 'Tu resumen');
    const seg = Math.max(c.tiempo ?? 0, (e?.minutos ?? 0) * 60);
    const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60);
    const partidas = e ? e.partidas : expediciones();
    const vic = e ? e.victorias : c.victorias ?? 0;
    const der = e ? e.derrotas : Math.max(0, partidas - vic);
    const totalBajas = Object.values(c.bajas ?? {}).reduce((a, b) => a + b, 0);
    const filas: [string, string][] = [
      ['Tiempo jugado', `${h ? `${h} h ` : ''}${m} min`],
      ['Expediciones', `${partidas}`],
      ['Victorias', `${vic}`],
      ['Derrotas', `${der}`],
      ['Tasa de victoria', partidas ? `${Math.round((100 * vic) / partidas)} %` : '—'],
      ...(e ? ([
        ['Mejor acto', e.mejorActo ? ['I', 'II', 'III', 'IV'][Math.min(3, e.mejorActo - 1)] : '—'],
        ['Combates ganados', `${e.combates ?? '—'}`],
        ['Élites vencidas', `${e.elites ?? '—'}`],
        ['Abandonadas', `${e.abandonadas}`],
      ] as [string, string][]) : []),
      ['Enemigos vencidos*', totalBajas ? `${totalBajas}` : '—'],
    ];
    filas.forEach(([k, v], i) => fila(A, AW, Y0 + 42 + i * 26, k, v));
    L(txt(this, A + 14, Y0 + H0 - 26, '* contados desde la v0.31.2', 13, CSS.dim));

    // ── 2 · jefes, rivales y presas ──
    const B = A + AW + 14, BW = 300;
    col(B, BW, 'Jefes derrotados');
    const flags = c.flags ?? [];
    JEFES.forEach(([acto, nombre, spr], i) => {
      const y = Y0 + 40 + i * 30;
      const n = e?.jefes?.[acto] ?? (flags.includes(FLAG[acto - 1]) ? -1 : 0); // −1 = vencido, sin conteo
      const conocido = n !== 0 || flags.includes(FLAG[acto - 1]);
      if (acto === 4 && !conocido && !flags.includes('acto3')) return; // el Núcleo es secreto
      const im = L(this.add.image(B + 28, y + 9, spr));
      im.setScale(Math.min(22 / im.height, 26 / im.width)).setAlpha(conocido ? 1 : 0.25);
      if (!conocido) im.setTint(0x000000);
      L(txt(this, B + 48, y, conocido || acto < 4 ? nombre : '???', 15, conocido ? CSS.bone : CSS.dim));
      L(txt(this, B + BW - 14, y, n > 0 ? `×${n}` : n < 0 ? '✓' : '—', 16, n !== 0 ? CSS.gold : CSS.dim).setOrigin(1, 0));
    });
    const nom = (x: string) => ENEMIES[x]?.name ?? x.replace(/^Cayó en el Núcleo: /, '');
    let y = Y0 + 160;
    L(txt(this, B + 14, y, 'Quién te ha vencido más', 16, '#e08a8a'));
    y += 24;
    const causas = (e?.causas ?? []).slice(0, 3);
    if (!causas.length) { L(txt(this, B + 14, y, e ? 'Nadie todavía.' : 'Conéctate para verlo.', 15, CSS.dim)); y += 22; }
    causas.forEach(([k, v]) => { fila(B, BW, y, nom(k), `${v} ${v === 1 ? 'vez' : 'veces'}`, '#e08a8a'); y += 22; });
    y += 8;
    L(txt(this, B + 14, y, 'A quién has vencido más', 16, CSS.green));
    y += 24;
    const presas = Object.entries(c.bajas ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!presas.length) L(txt(this, B + 14, y, 'Se cuenta desde esta versión.', 15, CSS.dim));
    presas.forEach(([k, v]) => { fila(B, BW, y, nom(k), `×${v}`, CSS.green); y += 22; });

    // ── 3 · temas ──
    const C = B + BW + 14, CW = W - 40 - C;
    col(C, CW, 'Lo que más se te complica');
    if (!e) {
      L(txt(this, C + 14, Y0 + 44, Game.profile!.offline || !isOnline() ? 'Sin conexión. Conéctate para que Bayes analice tus respuestas.' : 'No se pudieron leer tus datos. Intenta más tarde.', 15, CSS.dim, { wordWrap: { width: CW - 28 } }));
      return;
    }
    const temas = e.temas
      .filter(([, , n]) => n > 0)
      .map(([t, ok, n]) => ({ t: bonito(t), ok, n, p: (ok + 1) / (n + 2) }))
      .sort((a, b) => a.p - b.p);
    if (!temas.length) {
      L(txt(this, C + 14, Y0 + 44, 'Aún no hay respuestas. ¡Contesta runas y encuentros!', 15, CSS.dim, { wordWrap: { width: CW - 28 } }));
      return;
    }
    temas.slice(0, 7).forEach((x, i) => {
      const yy = Y0 + 40 + i * 40;
      const nt = L(txt(this, C + 14, yy, x.t, 15, CSS.bone));
      if (nt.width > CW - 110) nt.setScale((CW - 110) / nt.width, 1);
      L(txt(this, C + CW - 14, yy, `${Math.round(100 * x.p)} % · ${x.ok}/${x.n}`, 14, CSS.dim).setOrigin(1, 0));
      const bx = C + 14, bw = CW - 28;
      g.fillStyle(0x1e1a24, 1).fillRect(bx, yy + 20, bw, 9);
      g.fillStyle(x.p < 0.5 ? 0xc84a4a : x.p < 0.7 ? 0xe8c15a : 0x7fc87a, 1).fillRect(bx, yy + 20, Math.max(3, bw * x.p), 9);
      g.lineStyle(1, 0x3a3444, 1).strokeRect(bx, yy + 20, bw, 9);
    });
    L(txt(this, C + 14, Y0 + H0 - 38, 'P = (aciertos + 1) / (intentos + 2):\ncon pocos datos, Bayes no se precipita.', 13, CSS.dim, { lineSpacing: 2 }));
  }
}
