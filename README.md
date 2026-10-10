# Las Criptas de Hibbelerius

Roguelike de cartas *dark fantasy* para aprender **Dinámica** (Universidad de Monterrey). El alumno crea a su héroe, baja por las criptas y pelea con mecánicas que *son* física: cada golpe calcula **F = m·a**, la energía se paga en **Joules**, los enemigos con **inercia** sólo se detienen con una fuerza suficiente y los altares plantean problemas tipo Hibbeler con datos al azar y solución paso a paso.

**Jugar:** https://victorinox93.github.io/criptas_hibbelerius/

> ¿Quieres agregar enemigos, preguntas, ecos o música? Lee la [Guía para ampliar el juego](docs/GUIA-AMPLIAR.md). El historial de cambios está en [CHANGELOG.md](CHANGELOG.md).

## El juego en breve

| | |
|---|---|
| **Expedición** | 3 actos de 13 pisos: Leyes de Newton (Coloso Inerte), trabajo y energía (la Bruja de la Fricción) e impulso y cantidad de movimiento (**Hibbelerius**). Tras vencer dos veces a Hibbelerius se abre un **Acto IV secreto**, el Núcleo del Cálculo (derivadas e integrales), con **AM** como jefe final |
| **Clases** | Caballero de la Masa (F = m·a), Arcanista Cinético (K = ½mv²) y Penitente del Empuje (masa variable), con figura masculina o femenina |
| **Contenido** | 93 cartas, 44 enemigos, 16 ecos históricos con 56 dones, 10 almas en pena, pociones, familiares, reliquias, dilemas y encuentros especiales (el Profe, Myriam la Hechicera Oscura) |
| **Preguntas** | Problemas numéricos con datos al azar y preguntas conceptuales de opción múltiple. Siempre muestran la solución; al final se repasan los temas fallados |
| **Progreso** | Conocimiento por niveles (desbloquea cartas y cosméticos), Grimorio, 13 logros, Vestidor y la **Tienda de Layla** (95 accesorios pagados con *Momentum*, con oferta diaria) |
| **Entre compañeros** | Ranking por grupo, **lápidas** donde murió un compañero y **signos dorados** para invocar a quien ya venció a un jefe (estilo «Souls», sólo dentro del grupo y con alias) |
| **Diagnóstico** | 8 preguntas conceptuales (~4 min) antes de la primera expedición y otra vez a las 6 expediciones. La hoja calcula la **ganancia de aprendizaje normalizada de Hake** por alumno y por grupo |
| **Estadísticas** | Tras 5 expediciones, **Thomas Bayes** muestra tiempo, derrotas, quién te vence más y los temas que más se complican: P(acertar) = (aciertos+1)/(intentos+2) |

### La física como mecánica

| Concepto | En el juego |
|---|---|
| 2ª ley | Daño = masa del arma × aceleración. Forjar suma kg, Carrera suma m/s² |
| 1ª ley | Élites y jefes acumulan inercia; un solo golpe con F ≥ umbral los detiene |
| 3ª ley | Embestida devuelve parte de su fuerza; Acción-Reacción refleja golpes |
| Trabajo y energía | El Arcanista ataca con ½mv²; la fricción lo frena |
| Impulso | Hibbelerius carga un Impulso Final que hay que detener a tiempo |
| Producto cruz | Sir Dextro (sin mano derecha) calcula r × F con un determinante: el signo decide si ataca o protege |
| Entropía | La carta «La Entropía» (homenaje a la escultura del campus UDEM) revuelve tu descarte en el mazo |

## Para el profesor

### 1. Backend en Google Sheets

1. Crea una hoja de cálculo y abre **Extensiones → Apps Script**. Pega `apps-script/Code.gs` y ejecuta `setup` (acepta los permisos).
2. **Implementar → Nueva implementación → Aplicación web** (ejecutar como *Yo*, acceso *Cualquier usuario*). Copia la URL `/exec` en `src/backend.ts`.
3. En la hoja **Grupos** da de alta una clave por grupo (p. ej. `DIN-OTO26`, activo = TRUE). Los alumnos se registran con matrícula, contraseña y esa clave.
4. **Al actualizar `Code.gs`:** pégalo, guarda y ve a **Implementar → Gestionar implementaciones → editar → Nueva versión**. Así la URL no cambia.

| Hoja | Contenido |
|---|---|
| Panel · Resumen · Actividad · Conceptos | Avance por alumno, por grupo, por día y % de aciertos por tema (se recalculan con el menú **Criptas → Actualizar panel**) |
| Alumnos · Partidas · Eventos | Datos crudos: cuentas, cada expedición y cada respuesta |
| Huellas | Lápidas y signos entre compañeros (se crea sola) |

### 2. Menú «Criptas» de la hoja

- **Reiniciar contraseña de un alumno…** — el alumno entra con una contraseña nueva sin perder su progreso.
- **Borrar datos de un alumno / de un grupo / TODO…** — para limpiar pruebas antes de abrir el juego a la clase. Siempre guarda antes un respaldo en tu Drive. Consejo: usa una clave aparte (p. ej. `BETA`) para probar y bórrala con «Borrar datos de un grupo».
- **Calcular ganancia de aprendizaje (Hake)** — llena la hoja «Diagnóstico» con el inicial, el final y la ganancia g de cada alumno y grupo.
- **Generar evidencia** y **Crear formulario de retroalimentación** — reporte del proyecto y encuesta para los alumnos.

### 3. Modo profesor

Las matrículas de `ADMINS` (`src/config.ts`) ven un botón de depuración: empezar en cualquier acto, saltar a jefes, ecos, almas, Myriam o finales, desbloquear todo y ganar un combate con la tecla **K**. Esas partidas no se registran.

### Ajustar la dificultad

En `src/data/enemies.ts`: `VIDA_POR_ACTO`, `DANO_POR_ACTO`, `VIDA_JEFES`, `DANO_JEFES`, `VIDA_ELITES` y `DANO_ELITES` (1 = sin cambio). La probabilidad de Myriam está en `src/data/myriam.ts`, la de las almas en `src/data/almas.ts` y las expediciones necesarias para Bayes en `src/data/figures.ts`.

**Privacidad.** Las contraseñas se cifran (SHA-256 en el navegador y con sal en el servidor). En pantalla sólo se muestran alias, nunca matrículas. Es un sistema escolar: pide a los alumnos que no reutilicen contraseñas importantes.

## Desarrollo

Requiere [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/
```

Sin URL en `src/backend.ts` el juego funciona sin conexión (guarda en el navegador). Cada `push` a `main` se publica solo en GitHub Pages (`.github/workflows/deploy.yml`).

```
src/
  scenes/       pantallas (Menú, Mapa, Combate, Runa, Santuario, Tienda, Vestidor, Estadísticas…)
  data/         cartas, enemigos, ecos, almas, preguntas, logros, tienda, dificultad
  art/          pixel art definido como matrices de texto (héroes, enemigos, mecha, epílogos)
  audio.ts      música generada en vivo (Web Audio) y efectos
  textos.ts     casi todo el texto de pantalla
  huellas.ts    lápidas y signos entre compañeros
apps-script/    backend (Code.gs) y formulario
tools/          simulador de expediciones y generadores de arte
```

## Créditos

- **Creado por** Victorino Sepúlveda Arróniz · Universidad de Monterrey (UDEM) · curso de Dinámica basado en R. C. Hibbeler.
- **Inspirado en** Slay the Spire (Mega Crit), Loop Hero (Four Quarters), Hades (Supergiant Games) y la saga «Souls» de FromSoftware (Demon’s Souls, Dark Souls, Bloodborne, Elden Ring). **AM** está basado en el cuento *I Have No Mouth, and I Must Scream* (1967) de Harlan Ellison.
- **Música:** «Cold Soul» (partes 1–3) de [Lost in The Forest](https://lostintheforest.bandcamp.com/album/cold-soul) y «Kitty Paw» de [Shook](https://shook.bandcamp.com/album/synth-funk) (álbum «Synth Funk», 2024). El resto es dungeon synth generado en vivo.
- **Pixel art** diseñado en código con asistencia de Claude (Anthropic). **Tipografías** VT323 y Pirata One (SIL OFL). **Tecnología** Phaser 3, Vite y Google Apps Script.

Hibbelerius y los diálogos de las figuras históricas son ficción con fines educativos. Las referencias a otros juegos y obras son homenajes, sin afiliación con sus autores.
