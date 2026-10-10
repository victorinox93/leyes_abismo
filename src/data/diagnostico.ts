// ════════════════════════════════════════════════════════════════
//  DIAGNÓSTICO INICIAL Y FINAL (v0.32) · para medir la ganancia de
//  aprendizaje normalizada de Hake:  g = (post − pre) / (100 − pre)
//  · 8 preguntas conceptuales (~4 min), sin cálculos, una por tema.
//  · Son DISTINTAS de las preguntas del juego, para que no se aprendan
//    las respuestas jugando. Las opciones se barajan cada vez.
//  · INICIAL: antes de la primera expedición.
//  · FINAL: las mismas preguntas al cumplir DIAG_POST_EXPEDICIONES.
//  · No da puntos ni cuenta para calificación; completar cada uno da
//    DIAG_PREMIO de Momentum (sin importar el resultado).
//  Resultados: Google Sheets → menú Criptas → «Calcular ganancia (Hake)».
//  Si cambias las preguntas a mitad del curso, cambia también DIAG_VERSION.
// ════════════════════════════════════════════════════════════════

export const DIAG_VERSION = 1;
/** Expediciones terminadas para que se pida el diagnóstico final */
export const DIAG_POST_EXPEDICIONES = 6;
/** Momentum por completar cada diagnóstico */
export const DIAG_PREMIO = 2;

export interface ItemDiag {
  id: string;
  tema: string;
  pregunta: string;
  opciones: string[]; // la primera es la correcta (se barajan al mostrarlas)
}

export const DIAGNOSTICO: ItemDiag[] = [
  {
    id: 'd1', tema: '1ª ley (inercia)',
    pregunta: 'Un disco de hockey se desliza sobre hielo sin fricción con velocidad constante. ¿Cuál es la fuerza neta horizontal sobre el disco?',
    opciones: ['Cero', 'Una fuerza hacia adelante que lo mantiene en movimiento', 'Una fuerza que disminuye poco a poco hasta que se detiene', 'Depende de la masa del disco'],
  },
  {
    id: 'd2', tema: '2ª ley',
    pregunta: 'Aplicas la misma fuerza neta a dos cajas. La caja B tiene el doble de masa que la caja A. ¿Cómo es la aceleración de B comparada con la de A?',
    opciones: ['La mitad', 'Igual', 'El doble', 'Cero, porque B es más pesada'],
  },
  {
    id: 'd3', tema: '3ª ley',
    pregunta: 'Un camión grande choca de frente con un auto pequeño. Durante el choque, ¿cómo son las fuerzas que se ejercen entre sí?',
    opciones: ['Iguales en magnitud', 'La del camión sobre el auto es mayor', 'La del auto sobre el camión es mayor', 'Depende de cuál iba más rápido'],
  },
  {
    id: 'd4', tema: 'Fricción',
    pregunta: 'Empujas una caja pesada que está en reposo con una fuerza pequeña, pero no se mueve. ¿Cuánto vale la fuerza de fricción sobre la caja?',
    opciones: ['Igual a la fuerza con que empujas', 'Cero, porque la caja no se mueve', 'Siempre μs·N, su valor máximo', 'Mayor que la fuerza con que empujas'],
  },
  {
    id: 'd5', tema: 'Trabajo',
    pregunta: 'Llevas una mochila en la espalda y caminas en línea recta sobre piso horizontal con velocidad constante. ¿Cuánto trabajo hace sobre la mochila la fuerza vertical con que la sostienes?',
    opciones: ['Cero', 'm·g·d, donde d es la distancia recorrida', 'Depende de qué tan rápido camines', 'Es negativo'],
  },
  {
    id: 'd6', tema: 'Energía',
    pregunta: 'Sueltas una pelota desde 2 m y otra igual desde 8 m (sin resistencia del aire). Justo antes de tocar el piso, ¿cómo es la rapidez de la segunda?',
    opciones: ['El doble', 'Cuatro veces mayor', 'Igual, porque caen con la misma aceleración', 'La mitad'],
  },
  {
    id: 'd7', tema: 'Impulso',
    pregunta: 'Para atrapar un huevo que cae sin romperlo, bajas la mano mientras lo atrapas. ¿Por qué funciona?',
    opciones: ['Aumenta el tiempo del frenado, así la fuerza es menor', 'Disminuye el cambio de cantidad de movimiento del huevo', 'Disminuye la masa del huevo durante el choque', 'Anula la fuerza de gravedad'],
  },
  {
    id: 'd8', tema: 'Cantidad de movimiento',
    pregunta: 'Sobre hielo, una patinadora de 60 kg y un patinador de 30 kg están en reposo y se empujan. Después del empujón, ¿qué se cumple?',
    opciones: ['El de 30 kg se aleja con el doble de rapidez', 'Los dos se alejan con la misma rapidez', 'Sólo se mueve el de 30 kg', 'La de 60 kg se aleja más rápido porque es más fuerte'],
  },
];

/** Ganancia normalizada de Hake (null si el inicial fue perfecto) */
export function ganancia(pre: number, post: number, total = DIAGNOSTICO.length) {
  if (pre >= total) return null;
  return (post - pre) / (total - pre);
}
