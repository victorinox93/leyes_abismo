// ════════════════════════════════════════════════════════════════
//  HUELLAS (v0.30) · inspiradas en los juegos «Souls», asíncronas:
//  · LÁPIDAS: donde murió un compañero de tu grupo aparece una lápida
//    en el mapa (mismo acto y piso). Honrarla da unos Ergios.
//  · SIGNOS: quien vence a un jefe deja su signo dorado. Antes de ese
//    jefe, otro alumno puede invocar su fantasma para pelear juntos.
//    Si ganan, el dueño del signo recibe Momentum y un aviso.
//  Sólo entre alumnos del MISMO grupo; se muestra el alias, nunca la matrícula.
//  Datos en la hoja «Huellas» (apps-script/Code.gs).
// ════════════════════════════════════════════════════════════════
import { api, enqueue, isOnline } from './api';
import { Game, Run, saveLocal } from './state';

/** Lápidas que se muestran por acto (el servidor también manda a lo más 3, una por compañero) */
export const MAX_LAPIDAS = 3;
/** Ergios por honrar una lápida */
export const HONRA_ERGIOS = 6;
/** Momentum para el dueño de un signo cada vez que ayuda a ganar (tope por aviso) */
export const MOMENTUM_POR_AYUDA = 1;
export const TOPE_AYUDAS = 5;

const enLinea = (r?: Run | null) => !!Game.profile && !Game.profile.offline && isOnline() && !(r ?? Game.run)?.debug;

/** Pide al servidor las huellas del acto actual (una vez por acto). Llama a `listo` cuando llegan. */
export async function cargarHuellas(listo?: () => void) {
  const r = Game.run;
  if (!r || !enLinea(r)) return;
  const acto = r.acto ?? 1;
  if (r.huellas?.acto === acto) return;
  try {
    const h = await api.huellas(Game.profile!.token, acto);
    if (Game.run !== r) return;
    r.huellas = { acto, lapidas: h.lapidas ?? [], signos: h.signos ?? [], honradas: [] };
    saveLocal();
    listo?.();
  } catch (e) {
    console.warn('[huellas]', e);
  }
}

const avatarJSON = () => JSON.stringify(Game.profile?.avatar ?? {});

/** Al morir: deja tu lápida (enemigo que te venció y último concepto fallado) */
export function dejarLapida(r: Run, por: string) {
  if (!enLinea(r)) return;
  enqueue('dejarHuella', {
    token: Game.profile!.token, tipo: 'lapida', acto: r.acto ?? 1, piso: r.floor ?? 0, jefe: '',
    datos: JSON.stringify({ por, concepto: r.ultimoFallo ?? '', clase: r.clase, avatar: avatarJSON() }),
  });
}

/** Al vencer a un jefe: deja (o actualiza) tu signo dorado para ese jefe */
export function dejarSigno(r: Run, jefe: string) {
  if (!enLinea(r)) return;
  enqueue('dejarHuella', {
    token: Game.profile!.token, tipo: 'signo', acto: r.acto ?? 1, piso: r.floor ?? 0, jefe,
    datos: JSON.stringify({ clase: r.clase, avatar: avatarJSON(), runas: r.stats?.runasOk ?? 0 }),
  });
}

/** Avisa al servidor que usaste una huella (honrar lápida / ganar con un signo) */
export function usarHuella(id: number) {
  if (!enLinea()) return;
  enqueue('usarHuella', { token: Game.profile!.token, id });
}

/** Datos de una huella (JSON) */
export function datosDe(h: { datos: string }): { por?: string; concepto?: string; clase?: string; avatar?: string; runas?: number } {
  try { return JSON.parse(h.datos || '{}'); } catch { return {}; }
}
