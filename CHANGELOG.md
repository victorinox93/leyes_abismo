# Historial de versiones

Lo más reciente primero. El resumen del juego está en el [README](README.md).

## v0.31.2 · Estadísticas más útiles

- **Estadísticas de Bayes en tres columnas:** resumen (ahora con combates ganados, élites y enemigos vencidos), **jefes derrotados** con su conteo (Coloso, Bruja, Hibbelerius y AM, que sigue oculto hasta abrir el Núcleo), **quién te ha vencido más** (top 3) y **a quién has vencido más** (top 3), y los temas.
- **Temas:** sólo cuentan preguntas reales (runas, encuentros y «¿Más o menos?»); antes se colaban los nombres de los ecos al elegir un don. Los temas se muestran con nombres legibles («Fricción», «Conservación de la energía», «2ª ley de Newton»).
- El Grimorio cuenta los enemigos vencidos por tipo (`codex.bajas`), desde esta versión.
- Requiere publicar el nuevo `Code.gs` (endpoint `estadisticas`).

## v0.31.1 · Dones legibles

- Santuario: el nombre, la etiqueta, el efecto, la radiación y la cita de cada don se apilan según su alto real y se encogen si hace falta; si aun así no cabe, la cita queda sólo en el tooltip. Ya no se salen de la caja (p. ej. con Bayes o con 4 opciones por un dúo).

## v0.31.0 · Mecha «Inercia-01», créditos y README

- **Último desbloqueable:** armadura completa **Mecha «Inercia-01»** (diseño original: cresta de una aleta, visor horizontal, propulsores, escudo con anillo y rifle de haz). Reemplaza todo el cuerpo del héroe y conserva el color de capa y de visor del alumno; los accesorios se le acomodan. Se desbloquea con el logro platino **«Piloto de élite»: conseguir todos los demás logros**. Se equipa en Vestidor → Armaduras. Arte en `src/art/mecha.ts` (generador `tools/arte/mecha.py`).
- **Créditos:** se agregan la saga «Souls» de FromSoftware (Demon’s Souls, Dark Souls, Bloodborne y Elden Ring) como inspiración y el cuento «I Have No Mouth, and I Must Scream» (1967) de Harlan Ellison como origen de AM. Aviso de que las referencias son homenajes sin afiliación.
- **Limpieza de la hoja:** se quita la opción duplicada «Limpiar datos de prueba…»; las opciones «Borrar datos de un alumno / de un grupo / TODO» (con respaldo automático) ahora incluyen la hoja Huellas.
- README reescrito y más corto; el historial de versiones pasa a este archivo.

## v0.30.0 · Lápidas y signos, Thomas Bayes y La Entropía

- **Huellas entre compañeros (estilo Souls, asíncrono, sólo dentro del mismo grupo y con alias):**
  - **Lápidas:** al morir dejas una lápida en tu acto y piso. Tus compañeros la ven en su mapa (hasta 6 por acto), con quién te venció y el último concepto que fallaste. Honrarla da +6 Ergios (una vez por expedición).
  - **Signos dorados:** al vencer a un jefe dejas tu signo (uno por jefe; se actualiza). Antes de ese jefe, un compañero puede invocar tu fantasma (hasta 3 opciones): pelea a su lado y golpea al final de cada turno. Si ganan, recibes +1 ◈ Momentum por ayuda (tope 5 por aviso) y un aviso en el menú con quién te invocó.
  - Hoja nueva **Huellas** (se crea sola). Endpoints: `dejarHuella`, `huellas`, `usarHuella`, `avisos`.
- **Thomas Bayes** (eco): aparece en los santuarios cuando el alumno lleva **5 expediciones**. Dones: Prior Informativo (robas más en el primer turno), Actualización Bayesiana (fallar no reinicia la racha; nivel 2: +10 Ergios por acierto) y Distribución Posterior (curación al ganar según tus aciertos).
- **Estadísticas** (menú, se abre a las 5 expediciones): tiempo, expediciones, victorias, derrotas, tasa de victoria, mejor acto, el enemigo que más te vence y los temas que más se complican, con la estimación bayesiana P = (aciertos + 1)/(intentos + 2). Datos del servidor (`estadisticas`, a partir de Partidas y Eventos).
- **La Entropía (UDEM):** carta rara neutral («Revuelve tu descarte dentro de tu mazo y roba 2/3; se agota») inspirada en la escultura amarilla del campus, y dos accesorios: Réplica de La Entropía y Papas a la Entropía.
- **Cosméticos de cabeza completa:** Cabeza de Calabaza, Escafandra de Astronauta, Cabeza de Robot, Máscara de Luchador, Calavera, Vendas de Momia, Visor Cyberpunk ancho y la nueva Máscara de Layla. Vistas previas más grandes en la tienda y el vestidor.
- **Música de la tienda:** «Kitty Paw» de Shook (álbum «Synth Funk», 2024 · shook.bandcamp.com/album/synth-funk), en créditos y en el Soundtrack. El botón del menú dice «Tienda de Layla».
- **Limpieza:** «Borrar datos de un alumno / de un grupo / TODO» (menú Criptas) ahora también borran las lápidas y los signos.

## v0.29.0 · Sir Dextro, Hibbelerius clásico y la nueva tienda

- **Hibbelerius** vuelve a su diseño original (archimago con cuernos, báculo y tomo).
- **Nueva alma en pena: Sir Dextro, el Caballero sin Diestra.** Perdió la mano derecha y con ella «la regla de la mano derecha». Si le enseñas que el producto cruz se calcula con un determinante, se vuelve tu aliado: cada turno calcula r × F = rx·Fy − ry·Fx con vectores al azar; si sale positivo (sale del plano) golpea, si sale negativo te da Bloqueo. Epílogo: escribe el determinante en su escudo. Su sprite no tiene mano (muñón vendado).
- **Tienda de Layla:**
  - Cerrada (🔒) hasta terminar la primera expedición; el regalo diario también empieza ahí.
  - Música propia: funk synth en Mi dórico (bajo slap, acordes staccato, palmadas y un sinte brillante).
  - Ya no hay temporadas ni rotación: **todo el catálogo (92 artículos) está siempre a la venta**, en 9 categorías: Clásicos, Armas, UDEM, México, Halloween, Día de Muertos, Navidad, Ciencia ficción y De las Criptas (objetos de ecos, almas, Myriam, AM y Hibbelerius).
  - Lo que antes era de temporada ahora cuesta más (8–16 ◈).
  - **Oferta del día:** un artículo con −40 %, igual para todo el grupo, cambia a medianoche.
- **Menú:** el panel del alumno muestra sus **expediciones** terminadas. Al iniciar sesión, el servidor las cuenta en la hoja Partidas (requiere publicar la nueva versión de `Code.gs`; sin eso se estima con el progreso guardado).

## v0.28.0 · Castillo y balance

- **Acto II:** las peleas ocurren en el salón de un castillo (muros de sillares, ventanales con luna, pilares, estandartes, antorchas y alfombra). Contra la Bruja aparece su trono, la luna se vuelve roja y los estandartes morados.
- **Balance:** enemigos con **+15 % de vida y +15 % de daño** en los Actos I–III (+10 % en el Núcleo). Se suma a la gravedad (Neptuno/Júpiter).
- Perillas en `src/data/enemies.ts`: `VIDA_POR_ACTO`, `VIDA_JEFES`, `VIDA_ELITES`, y las nuevas `DANO_POR_ACTO`, `DANO_JEFES`, `DANO_ELITES` (1 = sin cambio). El número que ve el alumno en la intención del enemigo ya incluye el ajuste.

## v0.27.1 · Ajustes de texto

- Encuentros: al responder, el mensaje del NPC y la recompensa/castigo se apilan y se encogen solos para no quedar debajo del botón «Continuar». La solución de la izquierda también se ajusta.
- Grimorio: los nombres largos (p. ej. «Hibbelerius, el Autor Eterno») se reducen para caber en un renglón y la ficha (masa, peso, vida) se acomoda debajo, sin encimarse. Igual en las cartas.

## v0.27.0 · Myriam, la Hechicera Oscura

- Nuevo encuentro: **Myriam**. En cada nodo de encuentro (desde el piso 3) hay **15 %** de probabilidad de toparte con ella, una sola vez por expedición.
- No regala nada: muestra **3 maldiciones** al azar (sólo las que pueden aplicarse) y debes aceptar una. Lo único que decides es cuál duele menos.
- Maldiciones: Entropía Creciente (−3 cartas al azar), Masa Perdida (−8 Vida máx.), Impuesto de Fricción (−½ Ergios), Ruido Térmico (+2 Ruido Blanco), Fatiga del Material (2 cartas pierden su mejora), Mirada del Abismo (+20 Locura), Pies de Lodo, Arma Hueca, Frascos Rotos (pierdes pociones), Hurto Arcano (roba una reliquia común).
- Se registra en el Grimorio (NPCs) y en Sheets (`myriam`, con la maldición elegida).
- Ajustes en `src/data/myriam.ts` (`MYRIAM_CHANCE`, lista `MALDICIONES`). Modo profesor: salto «Myriam».

## v0.26.0 · Layla atigrada, accesorios en «Forjar héroe» y más artículos

- **Layla** ahora es una atigrada gris-café (como la foto de referencia): rayas oscuras, hocico y pecho blancos, ojos gris verdoso. Tiene 19 frases (clic en ella para que hable) y se presenta como «Layla la comerciante».
- **Los accesorios se equipan en «Forjar héroe» → ✦ Accesorios** (botón junto a la vista previa): un selector por ranura con lo que ya compraste. En la tienda sólo se compra; lo tuyo aparece como «✓ Es tuyo».
- **Ranuras nuevas:** Cabeza, Cara, Mano (reemplaza al arma) y Pies.
- **Filtro en la tienda:** «Sólo lo nuevo» oculta lo que ya tienes. La rotación semanal ahora muestra 5 artículos.
- **25 artículos nuevos:** cascos (vikingo, espartano, astronauta, minero, kabuto, corona real), cara (lentes de sol, lentes de pasta, monóculo, parche, bigote), pies (botas vaqueras, tenis rojos, pantuflas de gato, botas lunares), armas con guiños a otros juegos y películas (sable láser azul y rojo, espada del mercenario, martillo del trueno, pico de minero, arco élfico, llave inglesa, varita estelar) y de temporada (máscara de calavera en Día de Muertos, botas de duende en Navidad).

## v0.25.0 · Momentum y la Tienda de Layla

- **Momentum (◈, p = m·v):** nueva moneda que se conserva entre expediciones (en el Grimorio, se sincroniza con la hoja como `mGanado`/`mGastado`). Se gana al vencer jefes en una expedición —Coloso 2, Bruja +3, Hibbelerius +5, AM +5 (máximo 15)— y **Layla regala 1 cada día** que entras al juego.
- **Tienda de Layla** (botón «Layla ◈N» en el menú): una gata atigrada que vende **accesorios para cualquier clase** (cabeza o mano; los de mano reemplazan al arma). Todo lo comprado es permanente y se equipa en la tienda o en Vestidor → Accesorios.
  - **Rotación semanal:** 4 artículos que cambian cada lunes, iguales para todos (orejas de gato, sombrero de copa, laurel, birrete, látigo, vaso de matcha, tridente, guadaña, espada de madera, calculadora).
  - **Temporada (tiempo limitado):** Día de Muertos del 1 oct al 5 nov (corona de cempasúchil, sombrero de Catrina, pan de muerto, calabaza), Navidad del 1 dic al 6 ene (gorro navideño, bastón de caramelo) y 14 de febrero (rosa).
  - Para agregar artículos: `src/data/tienda.ts` (cada uno es una matriz de pixeles pequeña con su precio, ranura y temporada). Layla: `tools/arte/layla.py`.
- «Créditos» pasó a un botón pequeño arriba a la izquierda del menú. Modo profesor: «Desbloquear todo» da 50 ◈.

## v0.24.0 · Relaciones entre ecos (inspirado en Hades)

Todo está en `src/data/relaciones.ts` (datos e historia real) y `src/scenes/Sanctuary.ts` (reglas).

- **Rivalidades** (Newton ⚔ Hooke, Newton ⚔ Huygens, Hooke ⚔ Huygens, Tesla ⚔ Einstein): si en la expedición aceptaste un don del rival, el eco llega **💢 molesto** y te lo reclama. Puedes **reconciliarte** respondiendo su pregunta (si aciertas: dones épicos y se le pasa; si fallas: se va sin darte nada) o **aceptar sin responder** (sólo 2 dones comunes).
- **Dones dúo** (✦): si tienes un don de un eco y encuentras a su pareja, aparece un cuarto don más fuerte, con diálogo entre los dos:
  - Galileo + Newton · *Hombros de Gigantes*: +1 kg y +1 m/s² (épico +2 kg).
  - Châtelet + Coriolis · *Teorema Trabajo-Energía*: cada enemigo derrotado devuelve 1 J (2).
  - Einstein + Curie · *Congreso Solvay*: la radiación que recibes también daña a los enemigos ×2 (×3).
  - Noether + Einstein · *Simetría del Espacio-tiempo*: tu primer ataque de cada turno hace el doble (+1 carta).
  - Huygens + Galileo · *Simpatía de Péndulos*: cada 3 turnos (2) +1 J y 1 carta.
  - Joule + Tesla · *Efecto Joule*: tus rayos aplican 2 de Calor (4).
  - Asimov + Turing · *El Robot Pensante*: un autómata ataca al final de tu turno (6, o 9 y 3 de Bloqueo).
  - Oppenheimer + Einstein · *La Carta a Roosevelt*: 20 (30) de daño a todos al iniciar cada combate, con 4 de radiación.
- **Afinidad:** cada eco recuerda cuántas veces lo elegiste (en el Grimorio, entre expediciones). Se ve como ❤ ×N y, desde 3, te saluda distinto.
- **Grimorio → Relaciones:** rivalidades con su historia real y lista de dúos; se descubren al conocer a ambos ecos.
- **Modo profesor:** saltos «Eco molesto» (Newton con un don de Hooke) y «Eco dúo» (Newton con un don de Galileo).

## v0.23.1 · Formulario, evidencia y perillas de dificultad

- **`apps-script/Formulario.gs`** (pégalo como archivo NUEVO en el mismo proyecto de Apps Script; también pega el `Code.gs` actualizado para que aparezcan las opciones en el menú «Criptas»; no requiere nueva implementación):
  - **Crear formulario de retroalimentación:** genera un Google Form (experiencia, dificultad, qué te ayudó a aprender por tema, confianza antes/después, ideas de personaje, enemigo, carta, alma o eco, errores, recomendación 0–10 y consentimiento para uso anónimo). Las respuestas llegan a una pestaña de la misma hoja. Pega el enlace en `FORM_URL` (`src/config.ts`) para que aparezca el botón «✎ Tu opinión».
  - **Generar evidencia:** pestaña «Evidencia» con alumnos activos, horas jugadas, problemas respondidos, % de aciertos, **curva de aprendizaje** (aciertos en las primeras 5 vs. últimas 5 respuestas de cada alumno), aciertos por tema (1ª vs. 2ª mitad) con gráfica, y tabla por alumno.
- **Perillas de vida** en `src/data/enemies.ts`: `VIDA_POR_ACTO`, `VIDA_JEFES` y `VIDA_ELITES` (todas en 1 = sin cambio), además de `VIDA_ENEMIGOS` (1.2).

## v0.23.0 · Guerrera, Vestidor y logros

- **Figura femenina** (editor del héroe → «Figura»): Masculina, o Femenina con cabello negro, castaño, rubio, rojizo o plateado. La caballera lleva yelmo de visera abierta (se le ve el rostro), trenza sobre el hombro y faldar largo; la arcanista, cabello largo (y sin barba); la penitente, cabello que asoma bajo el tocado.
- **Vestidor** (nuevo botón en el menú): todas las capas, armaduras y ojos con una vista previa de TU héroe. Clic para equipar; los bloqueados dicen cómo conseguirlos.
- **Logros** (`src/data/logros.ts`) que desbloquean cosméticos nuevos:
  - Capas: *Piedra del Coloso* (vence al Coloso), *Bruma de la Bruja* (vence a la Bruja), *Tinta de Hibbeler* (15 runas bien en una expedición), *Velo de las Almas* ✦ (vence a Hibbelerius con un alma aliada), *Llama de Júpiter* ✦ (vence a la Bruja en Júpiter).
  - Armaduras: *Pergamino Dorado* (vence a Hibbelerius), *Diamante* (vence a un jefe sin perder vida), *Cromo Dorado* ✦ (descubre el 75 % del Grimorio).
  - Ojos: *Lucidez* ✦ (gana sin llegar a 40 de Locura), *Ánima Dorada* ✦ (encuentra a todas las almas), *Aurora de Neptuno* ✦ (vence a la Bruja en Neptuno).
  - Los de AM (Holograma, Cromo Holográfico, Ojo Holográfico) pasan a ser el logro «Sin boca».
  - ✦ = holográfico: el tono se mueve dentro de su propia gama (fuego, aurora, oro…), no sólo en arcoíris.
- **Simulador de expediciones** (`tools/simular_expediciones.mjs`): un bot juega expediciones completas de un Caballero sin desbloqueos con los combates reales (los nodos sin combate se resuelven con reglas simples y 75 % de aciertos). Requiere el servidor de desarrollo en el puerto 5175 y Playwright; uso: `node tools/simular_expediciones.mjs base 10 2` (o `menos` para probar el mazo inicial sin una Fuerza Normal).

## v0.22.0 · Sir Autocompleto, Asimov y Turing, cosméticos holográficos

- **Nueva alma en pena: Sir Autocompleto, de la Llama Delirante.** Un guerrero que dejó que una llama amarilla en su yelmo pensara por él (la llama le dijo que K = m·v² y le creyó). Su pregunta: «si la llama ya sabe todas las respuestas, ¿para qué aprender yo?»; la respuesta compasiva es usarla si quieres, pero entender tú el problema para saber cuándo se equivoca. Como aliado, al final de tu turno su llama golpea a TODOS (7), pero 1 de cada 4 veces «alucina»: no le pega a nadie y te sube 3 de Locura. Epílogo: apaga la llama y escribe la solución a mano («Lo verifiqué yo»). En el modo profesor: «Fin + Autocomp.».
- **Ecos del Núcleo** (sólo aparecen en el Acto IV, y ahí salen más seguido; sus preguntas son de cálculo):
  - **Isaac Asimov**, el Padre de los Robots: *Primera Ley* (Bloqueo al iniciar cada combate), *Tercera Ley* (Bloqueo la primera vez que bajas de la mitad de vida) y *Psicohistoria* (robas más cartas en el primer turno).
  - **Alan Turing**, el Descifrador: *Máquina de Turing* (si juegas 4 cartas en un turno, +1 J en el siguiente), *Descifrar Enigma* (los enemigos empiezan con Fatiga) y *Test de Turing* (+3/+6 de daño contra autómatas y AM).
- **Cosméticos de AM, ahora holográficos y animados:** capa «Holograma de AM», armadura «Cromo Holográfico» y ojos «Ojo Holográfico». El color recorre el arcoíris por pixel y con el tiempo (`makeTextureHolo` en `src/art/sprites.ts`). Quien ya tenía las versiones anteriores las conserva, ahora animadas.
- **Curva de niveles el doble de larga** (`NIVELES` en `src/data/progreso.ts`: 2000 de Conocimiento para el nivel 10, ≈ 9 victorias). Nadie pierde lo que ya desbloqueó: el nivel que tenía con la curva anterior queda como piso (`Codex.nivelPiso`) y desde ahí sigue con la curva nueva.
- **Menú:** la etiqueta «Vencedor de AM» aparece arriba del panel y ya no tapa «Conocimiento: nivel…».

## v0.21.0 · Premios por vencer a AM y panel de avance

- **Al vencer a AM** (bandera `acto4` del Grimorio; la pantalla final avisa la primera vez):
  - **Cartas de cálculo** (neutrales, raras; desde entonces salen en recompensas, tienda y dilemas de cualquier clase):
    - **Derivada** (1 J): roba 1 carta y tu siguiente ataque gana +2 por cada ataque que ya jugaste este turno (mín. +4; mejorada +3/+6).
    - **Integral** (2 J, mejorada 1 J): inflige todo el daño que ya hiciste este turno (∫ daño dt, máx. 40).
    - **Límite** (1 J, se agota): si al enemigo le queda 25 % de vida o menos (mejorada 30 %; jefes 10 %), lo derrota; si no, 6 de daño (9) y Fatiga 1.
  - **Cosméticos de latón:** capa «Circuitos de AM», armadura «Latón del Núcleo» y ojos «Ojo de AM» (con 🔒 «Vence a AM» mientras no lo vences).
  - **Insignia «Vencedor de AM»:** un ojo rojo que late junto al nombre en el menú y en el Ranking. Viaja dentro del avatar, así que **no requiere cambiar `Code.gs`**. En el Ranking, quien llegó al Núcleo ve «39 +IV» en la columna de pisos.
- **Panel «Tu avance» en el menú:** barras de Grimorio (%), jefes vencidos (3, o 4 cuando el Núcleo ya se abrió), almas encontradas (8), figuras y cartas descubiertas.

## v0.20.2

- La portada, el inicio de sesión y los créditos muestran sólo el número de versión (p. ej. «v0.20.2»). La descripción de cambios sigue en `VERSION` de `src/config.ts` y en este README.

## v0.20.1 · Música sci-fi del Núcleo y epílogo del alma

- **Música del Acto IV, nueva:** más lenta y tétrica, estilo sci-fi. Cuatro voces nuevas en el sintetizador (`src/audio.ts`): pad analógico con filtro resonante que abre y cierra (`sweep`), sub grave que «respira» (`throb`), pings de sonar con eco (`sonar`) y chasquidos digitales (`glitch`). Mapa a 54 bpm, combate a 76 bpm con pulso claro (bombo, caja y bajo) y AM a 66 bpm, pesado, con campana y una melodía de notas largas.
- **Epílogo del alma a pantalla completa:** al ganar con un alma aliada aparece primero su escena animada en grande y luego las estadísticas. Antes, si el alumno tenía temas para repasar, el panel de repaso ocupaba ese lugar y sólo se veía el texto.
- **Modo profesor:** el botón «Fin + alma» abre el final con un alma aliada; cada clic pasa a la siguiente (Ícaro → Ayudante → … → Duda). Los saltos ahora van en 7 columnas.

## v0.20.0 · Acto IV secreto: el Núcleo del Cálculo

- **Cómo se abre:** al vencer a Hibbelerius por **segunda vez** (contador `hib` en el Grimorio; quien ya lo había vencido antes de esta versión cuenta con 1), su tomo se abre y aparece una grieta. Puedes **entrar al Núcleo** (reliquia de jefe + legendaria + 75 % de curación) o **terminar la expedición** ahí. La partida ya queda como «victoria» en la hoja desde que vences a Hibbelerius; si caes en el Núcleo, se registra como «Cayó en el Núcleo: …». Tras la primera victoria, la cita final deja una pista: «Detrás del tomo, algo hace tic-tac…».
- **Mapa corto y difícil:** 8 pisos + AM, con fondo de engranes que giran y fórmulas de cálculo. Música nueva en vivo: «El Núcleo del Cálculo», «Relojería» y «No tengo boca» (aparecen en el Soundtrack cuando se abre el Núcleo).
- **Autómatas** (`src/data/enemies.ts`, arte en `tools/arte/en4.py` → `src/art/act4.ts`):
  - Engrane Dentado, Reloj Andante (roba 1 J), Bobina de Chispas (Calor y escudo).
  - **Autómata Oscilante:** su golpe sigue A·sen(ωt): sube y baja.
  - **Autómata Derivador:** su golpe crece 3 cada turno (dF/dt = 3).
  - **Autómata Integrador:** golpea con 1 extra por cada 4 de daño que ha recibido (∫ daño dt).
  - Élites: **Máquina Diferencial** de Babbage (crecimiento cuadrático; detenerla lo reinicia), **Telar de Jacquard** (mete Ruido y arma engranes) y **El Turco Mecánico** (Jaque → Jaque mate).
- **AM, jefe final** (456 de vida; +40 si alguna vez hiciste un pacto con él), tres fases: **Odio** (Ruido y robo de energía), **Derivada** (su furia crece cada turno; DETENERLO la reinicia; invoca Derivadores) e **Integral** (te regresa el daño acumulado que le hiciste). Dispara un rayo rojo desde su ojo. Final propio: «¡AM ha caído!» (+20,000 puntos).
- **Preguntas de cálculo** (sólo en el Núcleo, `CALCULO_CONCEPTS` en `src/data/runes.ts`): v = dx/dt, a = dv/dt = d²x/dt², altura máxima (dy/dt = 0), P = dW/dt, Δx = ∫v dt, Δv = ∫a dt, W = ∫F dx (resorte y fuerza lineal), I = ∫F dt → Δv, y 8 de opción múltiple sobre pendientes y áreas de gráficas. Con sus mini lecciones para el repaso final.
- **Modo profesor:** botón «Acto IV (Núcleo)», salto «Grieta III→IV», «Jefe» en el Acto IV = AM, y «Desbloquear todo» abre el Núcleo.
- **Arreglo:** si la partida se cerraba en el nodo del jefe, al continuar el mapa quedaba sin salida. Ahora retoma la pelea, o pasa al siguiente acto si el jefe ya había caído.

## v0.19.0 · Locura, el Autor Eterno y epílogos ilustrados

- **Mapa más claro:** el camino recorrido se dibuja con una línea dorada continua; los caminos que todavía puedes tomar se ven más brillantes que los cerrados. Al pasar el cursor sobre cualquier nodo alcanzable (aunque esté 2 o 3 pisos adelante) se ilumina en azul la ruta para llegar.
- **Entropía mental → Locura** en todos los textos (barra superior, fogata, Necronomicón, dilemas, AM, glosario). El glosario explica que la Locura es «la entropía de tu mente: siempre tiende a subir». La carta **Entropía** (2ª ley de la termodinámica) conserva su nombre.
- **Hibbelerius, el Autor Eterno** (antes «la Parca del Tomo»): mismo diseño, nuevo título en el combate, el mapa y el soundtrack.
- **Epílogos ilustrados** (`src/art/epilogos.ts`): si vences a Hibbelerius con un alma aliada, la pantalla final muestra una escena animada distinta por alma: el examen de Ícaro con un 10, la calculadora de Sir Radián marcando 1, la tesis APROBADA del Doctorando, el pizarrón con g = 9.81 m/s² de la Dama, la máquina de Bernoulli girando, el reloj de Sir Mañana, la vela de la Ayudante y el foco del Encadenado.
- **Arreglos visuales:** «Servicios» ya no queda tapado en el Mercader; en los Encuentros el recuadro de información se cierra al elegir la respuesta; el puntaje se separó de los Ergios en la barra superior.

## v0.18.2 · Arreglos a partir de la hoja y la reseña

- **Partidas duplicadas:** al elegir la gravedad, el juego esperaba al servidor sin avisar y cada clic extra creaba otra expedición. Ahora aparece «Abriendo las criptas…» y se ignoran los clics repetidos.
- **Partidas que no quedaban en la hoja:** si el servidor tardaba al iniciar, la partida se jugaba con un id local (`L-…`) y sus avances se perdían. Ahora `updateRun` **crea la fila** si no existe. ⚠️ Requiere pegar el `Code.gs` nuevo y crear una **nueva versión** de la implementación.
- **Penitente:** si tu Bloqueo alcanza para el golpe, se usa el Bloqueo y **no** pierdes rapidez esquivando. La primera vez que lo juegas aparece una explicación corta de cómo acelerar y esquivar.

## v0.18.1 · «¿Más o menos?» reemplaza al Tira y Afloja

- En la Taberna, el **Tira y Afloja** (difícil de entender) se cambió por **«¿Más o menos?»** (`src/data/masmenos.ts`): aparecen dos cosas con su masa y rapidez (una bala, un elefante, Usain Bolt…) y eliges cuál tiene más **energía cinética** (K = ½mv²) o más **cantidad de movimiento** (p = m·v). Cada acierto duplica la apuesta (hasta 5 rondas); puedes retirarte cuando quieras. 4 de cada 10 pares son «tramposos»: uno gana en K y el otro en p. Al responder se muestran las cuentas.
- El Tira y Afloja sigue disponible sólo en el Modo profesor. El encargo «Rey de la taberna» cambió a «Acierta 4 seguidas en ¿Más o menos?».

## Novedades de la v0.18 · Economía y minijuegos

- **Tienda más presente:** cada acto garantiza 2 mercaderes (uno a mitad del camino y otro cerca del jefe), y el mercader ya puede quedar junto a fogatas o ecos. Siempre hay una **oferta del día** (−30 %) y puedes **vender hasta 2 cartas** por visita (común 14 · rara 25 · legendaria 45, +8 si está mejorada). A veces aparece un **Mercader Ambulante** en un encuentro, con precios rebajados.
- **La Taberna del Abismo** (nodo nuevo, 1–2 por acto) con dos minijuegos (`src/scenes/TiroBlanco.ts`, `src/scenes/TiraAfloja.ts`):
  - **Tiro al Blanco:** eliges θ y v₀; el proyectil cae en R = v₀²·sen2θ/g con la gravedad del astro. 3 tiros; hasta 25 Ergios por tiro.
  - **Tira y Afloja de Newton** (estilo Gwent, reglas en `src/data/tira.ts`): apuestas 10/25/50 Ergios y juegas al mejor de 3 rondas con 10 cartas de fuerza en tres filas (Jalón F, Rampa F·cosθ, Polea F×2) y especiales (Lodo, Acción-Reacción, Cuerda Rota, Masa Inamovible). Si ganas, recibes el doble.
- **Tablón de encargos** (`src/data/encargos.ts`): al empezar cada acto eliges un contrato opcional (p. ej. «vence una élite sin perder vida», «gana un duelo en la taberna»). Si lo cumples, te pagan; se ve arriba a la derecha.
- **Modo profesor:** saltos directos a Taberna, Tiro al blanco, Tira y Afloja, Mercader ambulante, Tablón y Vender cartas. Todo se registra en «Eventos» (`minijuego`, `minijuego_fin`, `venta`, `encargo`).

## Novedades de la v0.17 (reseña de un jugador de Slay the Spire)

- **Opciones explicadas antes de elegir:** en dilemas y encuentros, las opciones con ⓘ muestran al pasar el cursor qué es cada carta, efecto, reliquia o familiar que puede salir (p. ej. «Ruido Blanco: carta basura, injugable»).
- **Arcanista más amable al inicio:** empieza cada combate a 4 m/s (antes 3) y su mazo inicial trae 2 Acelerar (antes 1).
- **Consejos para principiantes:** nueva pestaña «Consejos» en el Glosario y un consejo al azar al empezar cada acto. En la **primera expedición** de cada alumno, los combates fáciles de los primeros pisos tienen 30 % menos vida.
- **Jefes que se adaptan:** cada vez que detienes a un jefe (1ª ley), su umbral sube ×1.5 (`UMBRAL_JEFE_MUL` en `src/scenes/Combat.ts`), para que no se pueda dejarlo sin turno todo el combate.

## Novedades de la v0.16

- **AM** (`src/data/am.ts`): una inteligencia artificial atrapada en las criptas (homenaje al cuento de Harlan Ellison; diálogos originales). Aparece rara vez desde el piso 4, **recuerda entre expediciones** (visitas, tu última respuesta, pactos) y te hace una pregunta filosófica sin respuesta correcta (se registra en «Eventos» como `am`). Luego ofrece un **pacto**: resolver por ti tus próximas 3 runas. Si aceptas, aparece el botón «Que AM lo resuelva»: aciertas, pero sin puntos, racha ni Conocimiento, y sube tu Entropía mental (las runas resueltas por AM se registran como `am_runa` y NO cuentan como aciertos del alumno). Si lo rechazas, mejora una carta.
- **Glosario** en el menú (`src/data/glosario.ts`): tipos de ataque, estados (Calor, Resonancia, Fatiga…), efectos y el abismo (Entropía, Necronomicón).
- **Soundtrack** en el menú: se desbloquea al vencer a Hibbelerius; las 13 pistas con su nombre.
- **3 almas en pena nuevas:** Sir Mañana el Procrastinador, la Dama de los Decimales y el Encadenado de la Duda. Las opciones de las almas ahora salen en orden al azar.
- **Familiar nuevo:** Dragón de Carnot (3 de Calor a todos cada turno).
- **7 cartas:** Reacción Normal, Perdigones, (F = m·a)², Descarga Total, Fractura Frágil, Golpe de Gracia y la Palanca de Arquímedes ahora es para todas las clases.
- **Grimorio:** los perfiles de Einstein, Curie y Oppenheimer ya no se enciman; el jefe de cada acto aparece en el Bestiario en cuanto lo ves en el mapa.

## Novedades de la v0.15

- **Portada en alta definición:** la ilustración original se reescaló al doble con una red de superresolución (EDSR) y se limpió el ruido del JPG; ahora se muestra a 1080 px sin verse borrosa.
- **Pergamino de cálculos:** las líneas largas se ajustan al cuadro (letra más chica o «…»). Pasa el cursor por el pergamino para leer los últimos 8 cálculos completos.
- **Cuarto personaje «¿?»:** queda como *Próximamente* para que lo propongan los alumnos.
- **Botón de retroalimentación:** pega la liga de tu formulario en `FORM_URL` (`src/config.ts`) y aparece «✎ Tu opinión» en el menú y «✎ Danos tu opinión» al terminar cada expedición.

## Novedades de la v0.14

- **Tercer personaje: el Penitente del Empuje** (se desbloquea al vencer a Hibbelerius). Su vida es su **masa**: las cartas de Empuje queman kilos y lo aceleran con la ecuación del cohete, **Δv = vₑ·ln(m₀/m₁)** (con poca masa acelera muchísimo más). Golpea con **p = m·v**, no tiene Bloqueo y **esquiva** si va a 6 m/s o más (perdiendo 3 m/s). El aire lo frena 2 m/s por turno y recupera masa al derrotar enemigos. 13 cartas propias en `src/data/cards.ts` (busca «PENITENTE»).
- **8 cartas legendarias** (marco dorado, una copia por expedición): Venganza de Newton, Tiro Parabólico (eliges el ángulo θ y ves el alcance R = v₀²·sen2θ/g), Péndulo, Patinadora, Resorte Comprimido, Dolor Resonante, Honda de David y Fuego Amigo. Se eligen tras vencer al jefe de los Actos I y II, y a veces salen tras una élite.
- **Hibbelerius rediseñado (antes «la Parca del Tomo», hoy «el Autor Eterno»)**: encapuchado, esquelético, flotando, con guadaña y su tomo encadenado; lanza hoces giratorias al atacar (`tools/arte/hib2.py`).

## Novedades de la v0.13 · Horror cósmico

- **Entropía mental** (0–100, el ojo verde arriba a la derecha): sube al empezar combates contra jefes (+8) y élites (+3) y al leer el Necronomicón (+20). Baja al descansar en la fogata (−20), al hablar con los Ecos (−10) y con cada runa bien resuelta (−3).
  - **40+ Inquieto:** las fórmulas de tus cartas se van tapando con símbolos. Nunca se muestran fórmulas incorrectas, sólo borrosas.
  - **70+ Delirante:** «Visión del Abismo», tus ataques hacen +2.
  - **100 Quiebre:** en el siguiente combate aparece una **Sombra del Abismo** que mete Ruido Blanco a tu mazo; después la Entropía baja a 60.
- **El Necronomicón de Hibbeler:** dilema raro en los Actos II y III («El Atril sin Lector»). Con él, en cada fogata puedes **leer un Problema Prohibido** en vez de descansar: 13-∞ (más cartas, menos vida máxima), 14-0 (más energía, Errores de Signo), 15-(−1) Masa Negativa, Ω Universo Cerrado y Mirar de Vuelta. Todos los valores están en `src/data/abismo.ts`.
- **Code.gs:** no cambió en esta versión; las lecturas del Necronomicón y los Quiebres se registran en la hoja «Eventos» como `prohibido` y `quiebre`.

## Novedades de la v0.12

- **Ecos nuevos:** **Nikola Tesla** (rayos que dañan a todos los enemigos), **J. Robert Oppenheimer** (la carta «Trinity», que se usa una sola vez: destruye a todos los enemigos y a los jefes les quita 30–40 % de vida; reacción en cadena; todo con radiación) y **Charles Darwin** (una carta EVOLUCIONA 3 niveles —+2 kg o +3 de Bloqueo por nivel, se marca con ✦— y más vida máxima).
- **Reliquias de jefe:** al vencer al jefe del Acto I y del Acto II eliges 1 de 3: Reactor de Fisión, Agujero Negro de Bolsillo, Tomo Prohibido de Hibbeler, Corazón del Coloso o Volante de Inercia. Son muy fuertes, pero cada una tiene un costo (`src/data/relics.ts`).
- **Almas en pena nuevas:** **Sir Radián, el Mal Configurado** (su calculadora está en RAD: a veces pega fuerte, a veces te da Bloqueo, a veces «Math ERROR») y **el Doctorando Eterno** (pone Fatiga a todos los enemigos).
- **Enemigos con 20 % más de vida** (`VIDA_ENEMIGOS` en `src/data/enemies.ts`).
- **Mapas más variados:** nunca hay dos lugares de descanso seguidos (ecos, fogatas o mercaderes) y cada mapa tiene un tope al azar de cada uno (2–3).

## Novedades de la v0.11

- **Puntaje estilo arcade** (`src/data/puntaje.ts`): cada enemigo vale su vida máxima × 10 (×1.5 élite, ×2 jefe); combate sin perder vida +500 (élite/jefe +1,000); runa correcta +300 con **racha** de hasta ×2; pista −100; acto superado +2,000 × acto; vencer a Hibbelerius +10,000. Al terminar: +20 por vida restante, +3,000 si no usaste la Vida Extra, +200 por poción y +5 por Ergio. Todo ×gravedad. En la pantalla final, pasa el cursor sobre el puntaje para ver el desglose.
- **El profe de mal humor** (5 % de los encuentros, una vez por expedición, nunca si ya viste al profe amable): te avienta el Hibbeler y pierdes la mitad de la vida. Si contestas bien: +60 Ergios y +8 de vida; si fallas: 2 «Tarea Pendiente».
- **Almas en pena** (`src/data/almas.ts`): Ícaro el Recursador, la Ayudante Sin Nombre y Sir Bernoulli el Errante. Si les ayudas o contestas su pregunta con compasión, se vuelven tu **aliado** y pelean a tu lado en élites y jefes. Sólo un aliado por expedición.
- **Música de Hibbelerius** más lenta y oscura (bajo distorsionado, campana con tritono).
- **Tiempo jugado total** en el menú.

