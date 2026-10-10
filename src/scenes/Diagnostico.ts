import Phaser from 'phaser';
import { CSS, UI } from '../art/palette';
import { audio } from '../audio';
import { W } from '../config';
import { DIAG_PREMIO, DIAG_VERSION, DIAGNOSTICO, ganancia } from '../data/diagnostico';
import { Game, ganarMomentum, isAdmin, logEvent, saveLocal } from '../state';
import { button, Btn, dungeonBackground, fadeTo, frame, title, txt } from '../ui/widgets';

type Fase = 'pre' | 'post';

/**
 * Diagnóstico inicial / final (v0.32). 8 preguntas conceptuales, sin retroalimentación
 * durante el inicial (para no «enseñar el examen»). Al terminar se registra en la hoja
 * (Eventos: diag_pre / diag_post) y en el Grimorio (codex.diag).
 */
export class DiagnosticoScene extends Phaser.Scene {
  private fase: Fase = 'pre';
  private i = 0;
  private resp: { id: string; ok: boolean }[] = [];
  private t0 = 0;
  private layer!: Phaser.GameObjects.Container;
  private luego?: string;

  constructor() { super('Diagnostico'); }

  create(data: { fase: Fase; luego?: string }) {
    this.fase = data.fase;
    this.luego = data.luego;
    this.i = 0;
    this.resp = [];
    this.t0 = performance.now();
    this.cameras.main.fadeIn(300);
    audio.play('santuario');
    dungeonBackground(this, 71, 0x14121a);
    title(this, W / 2, 30, this.fase === 'pre' ? 'Diagnóstico inicial' : 'Diagnóstico final', 36);
    this.layer = this.add.container(0, 0);
    this.portada();
  }

  private portada() {
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const g = L(this.add.graphics());
    frame(g, 140, 90, W - 280, 330, 0x0e0b12, UI.border, 0.95);
    L(this.add.image(220, 200, 'fig_bayes').setScale(4));
    const pre = this.fase === 'pre';
    L(txt(this, 290, 112, pre
      ? 'Antes de tu primera expedición, Thomas Bayes quiere saber de dónde partes.'
      : 'Ya llevas varias expediciones. Veamos cuánto cambió lo que sabes.', 21, CSS.gold, { wordWrap: { width: 510 } }));
    L(txt(this, 290, 180, [
      `· ${DIAGNOSTICO.length} preguntas de opción múltiple, sin cálculos (unos 4 minutos).`,
      '· No da puntos ni cuenta para tu calificación: contesta con honestidad.',
      '· Si no sabes una, elige «No lo sé». Es mejor que adivinar.',
      pre ? '· Al final de tus expediciones contestarás las mismas preguntas.' : '· Al final verás cuánto mejoraste.',
      `· Por completarlo: +${DIAG_PREMIO} ◈ Momentum.`,
    ].join('\n'), 18, CSS.bone, { wordWrap: { width: 510 }, lineSpacing: 6 }));
    L(button(this, W / 2, 380, 240, 46, 'Empezar', () => { this.layer.removeAll(true); this.pregunta(); }, { color: UI.gold, size: 22 }));
  }

  private pregunta() {
    const it = DIAGNOSTICO[this.i];
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const n = DIAGNOSTICO.length;
    // avance
    const g = L(this.add.graphics());
    g.fillStyle(0x1e1a24, 1).fillRect(140, 68, W - 280, 8);
    g.fillStyle(0xe8c15a, 1).fillRect(140, 68, ((W - 280) * this.i) / n, 8);
    L(txt(this, W / 2, 80, `Pregunta ${this.i + 1} de ${n} · ${it.tema}`, 16, CSS.dim).setOrigin(0.5, 0));
    frame(g, 100, 104, W - 200, 104, 0x0e0b12, UI.border, 0.95);
    const q = L(txt(this, W / 2, 156, it.pregunta, 20, CSS.bone, { wordWrap: { width: W - 250 }, align: 'center', lineSpacing: 3 }).setOrigin(0.5));
    if (q.height > 92) q.setFontSize(17);
    // opciones barajadas (la correcta es la primera en los datos)
    const orden = Phaser.Utils.Array.Shuffle(it.opciones.map((o, k) => ({ o, ok: k === 0 })));
    const btns: Btn[] = [];
    const elegir = (ok: boolean, b?: Btn) => {
      btns.forEach((x) => x.disableInteractive());
      audio.sfx('click');
      if (b) b.label.setColor(CSS.gold);
      this.resp.push({ id: it.id, ok });
      this.time.delayedCall(260, () => {
        this.layer.removeAll(true);
        this.i++;
        if (this.i < n) this.pregunta(); else this.fin();
      });
    };
    orden.forEach((op, k) => {
      const b = L(button(this, W / 2, 246 + k * 54, W - 200, 46, '', () => elegir(op.ok, b), { size: 18 }));
      b.label.setText(`${'ABCD'[k]})  ${op.o}`).setWordWrapWidth(W - 240);
      if (b.label.height > 40) b.label.setFontSize(15);
      btns.push(b);
    });
    btns.push(L(button(this, W / 2, 470, 200, 34, 'No lo sé', () => elegir(false), { size: 17 })));
  }

  private fin() {
    const L = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.layer.add(o); return o; };
    const n = DIAGNOSTICO.length;
    const aciertos = this.resp.filter((r) => r.ok).length;
    const segundos = Math.round((performance.now() - this.t0) / 1000);
    const c = Game.codex;
    const d = (c.diag ??= {});
    const primeraVez = !d[this.fase];
    if (primeraVez && !isAdmin()) {
      d[this.fase] = aciertos;
      d.total = n;
      d.version = DIAG_VERSION;
      ganarMomentum(DIAG_PREMIO);
    }
    saveLocal();
    // el profesor (modo profesor) puede probarlo sin ensuciar la hoja
    if (!isAdmin()) logEvent(this.fase === 'pre' ? 'diag_pre' : 'diag_post', '', '', {
      aciertos, total: n, version: DIAG_VERSION, segundos, items: this.resp.map((r) => `${r.id}:${r.ok ? 1 : 0}`).join(','),
    });
    audio.sfx('victory');
    const g = L(this.add.graphics());
    frame(g, 160, 110, W - 320, 290, 0x0e0b12, UI.gold, 0.95);
    L(this.add.image(240, 210, 'fig_bayes').setScale(4));
    if (this.fase === 'pre') {
      L(txt(this, 310, 140, '¡Listo! Ya tengo tu punto de partida.', 22, CSS.gold, { wordWrap: { width: 460 } }));
      L(txt(this, 310, 190, `No te digo cuántas acertaste: lo verás al final, cuando lo compares con tu diagnóstico final.\n\n${primeraVez ? `+${DIAG_PREMIO} ◈ Momentum.` : ''}`, 18, CSS.bone, { wordWrap: { width: 460 }, lineSpacing: 4 }));
    } else {
      const pre = d.pre ?? 0;
      const gn = ganancia(pre, aciertos, n);
      const nivel = gn === null ? '' : gn >= 0.7 ? 'alta' : gn >= 0.3 ? 'media' : gn > 0 ? 'baja' : 'sin mejora';
      L(txt(this, 310, 136, 'Tu avance', 24, CSS.gold));
      L(txt(this, 310, 176, `Diagnóstico inicial: ${pre}/${n}\nDiagnóstico final:   ${aciertos}/${n}`, 20, CSS.bone, { lineSpacing: 6 }));
      L(txt(this, 310, 248, gn === null ? 'Tu inicial ya era perfecto: ¡no había nada que ganar!' : `Ganancia de aprendizaje g = ${gn.toFixed(2)} (${nivel})`, 20, gn !== null && gn >= 0.3 ? CSS.green : CSS.gold, { wordWrap: { width: 460 } }));
      L(txt(this, 310, 290, `g = (final − inicial) / (${n} − inicial): qué parte de lo que te faltaba aprendiste.${primeraVez ? `\n+${DIAG_PREMIO} ◈ Momentum.` : ''}`, 15, CSS.dim, { wordWrap: { width: 460 }, lineSpacing: 3 }));
    }
    L(button(this, W / 2, 440, 260, 44, this.luego === 'expedicion' ? 'A las criptas' : 'Volver al menú', () => fadeTo(this, 'Menu', this.luego === 'expedicion' ? { iniciar: true } : {}), { color: UI.gold, size: 21 }));
  }
}
