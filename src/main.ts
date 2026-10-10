import Phaser from 'phaser';
import '@fontsource/vt323/latin.css';
import '@fontsource/vt323/latin-ext.css';
import '@fontsource/pirata-one/latin.css';
import '@fontsource/pirata-one/latin-ext.css';
import './style.css';
import { W, H, RES } from './config';
import { BootScene } from './scenes/Boot';
import { LoginScene } from './scenes/Login';
import { AvatarScene } from './scenes/Avatar';
import { MenuScene } from './scenes/Menu';
import { MapScene } from './scenes/MapScene';
import { AlmaScene } from './scenes/Alma';
import { GlosarioScene } from './scenes/Glosario';
import { VestidorScene } from './scenes/Vestidor';
import { TiendaScene } from './scenes/Tienda';
import { MyriamScene } from './scenes/Myriam';
import { EstadisticasScene } from './scenes/Estadisticas';
import { DiagnosticoScene } from './scenes/Diagnostico';
import { AMScene } from './scenes/AM';
import { TabernaScene } from './scenes/Taberna';
import { TiroBlancoScene } from './scenes/TiroBlanco';
import { TiraAflojaScene } from './scenes/TiraAfloja';
import { MasMenosScene } from './scenes/MasMenos';
import { MusicaScene } from './scenes/Musica';
import { CombatScene } from './scenes/Combat';
import { RewardScene } from './scenes/Reward';
import { RuneScene } from './scenes/Rune';
import { CampfireScene } from './scenes/Campfire';
import { EndScene } from './scenes/End';
import { HelpScene } from './scenes/Help';
import { EventScene } from './scenes/Event';
import { ShopScene } from './scenes/Shop';
import { OverlayScene } from './scenes/Overlay';
import { SanctuaryScene } from './scenes/Sanctuary';
import { CodexScene } from './scenes/Codex';
import { RankingScene } from './scenes/Ranking';
import { CreditsScene } from './scenes/Credits';
import { ActTransitionScene } from './scenes/ActTransition';
import { DilemmaScene } from './scenes/Dilemma';
import { DebugScene } from './scenes/Debug';
import { TitleScene } from './scenes/Title';
import { Game } from './state';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  // Se dibuja al doble de resolución; cada escena usa coordenadas de 960×540
  width: W * RES,
  height: H * RES,
  backgroundColor: '#060508',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game',
  },
  input: { mouse: { preventDefaultWheel: false } },
  disableContextMenu: true,
  scene: [BootScene, TitleScene, LoginScene, AvatarScene, MenuScene, MapScene, CombatScene, RewardScene, RuneScene,
    CampfireScene, EndScene, HelpScene, EventScene, ShopScene, SanctuaryScene, CodexScene, RankingScene, CreditsScene, ActTransitionScene, DilemmaScene, AlmaScene, GlosarioScene, VestidorScene, TiendaScene, MyriamScene, EstadisticasScene, DiagnosticoScene, MusicaScene, AMScene, TabernaScene, TiroBlancoScene, TiraAflojaScene, MasMenosScene, DebugScene, OverlayScene],
});

// Cámara de cada escena: zoom ×RES desde la esquina superior izquierda
game.events.once(Phaser.Core.Events.READY, () => {
  for (const sc of game.scene.scenes) {
    sc.sys.events.on(Phaser.Scenes.Events.CREATE, () => {
      sc.cameras.main.setOrigin(0, 0).setZoom(RES);
      sc.input.enabled = true;
    });
  }
});

// ── tiempo de juego ACTIVO: cuenta sólo con la pestaña visible y si hubo actividad en los últimos 2 min ──
let lastInput = Date.now();
for (const ev of ['pointerdown', 'keydown', 'pointermove']) window.addEventListener(ev, () => (lastInput = Date.now()), { passive: true });
setInterval(() => {
  const r = Game.run;
  if (!r || r.done || document.visibilityState !== 'visible' || Date.now() - lastInput > 120000) return;
  r.tiempo = (r.tiempo ?? 0) + 5;
  Game.codex.tiempo = (Game.codex.tiempo ?? 0) + 5;
}, 5000);

// acceso de depuración sólo en modo desarrollo (npm run dev)
if (import.meta.env.DEV) (window as any).__criptas = { game, Game };
