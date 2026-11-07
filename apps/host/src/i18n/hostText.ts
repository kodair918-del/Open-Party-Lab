import {
  defaultLanguage,
  normalizeLanguage,
  type RoomLifecycle,
  type SupportedLanguage
} from "@open-party-lab/protocol";

const languagePreferenceKey = "open-party-lab.host-language";

export function readStoredHostLanguage(): SupportedLanguage {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return defaultLanguage;
  }

  return normalizeLanguage(window.localStorage.getItem(languagePreferenceKey));
}

export function writeStoredHostLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }

  window.localStorage.setItem(languagePreferenceKey, language);
}

export interface HostText {
  languageLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  phoneController: string;
  showPhoneController: string;
  hide: string;
  fullscreen: string;
  exitFullscreen: string;
  fpsLabel: string;
  musicVolumeLabel: string;
  soundEffectsVolumeLabel: string;
  hostControlsTitle: string;
  hostControlsSubtitle: string;
  close: string;
  noGame: string;
  connected: string;
  waitingForRoom: string;
  offline: string;
  connectionMissing: string;
  players: string;
  playerRange: (min: number, max: number) => string;
  selected: string;
  lobby: string;
  connectedShort: string;
  noPlayersJoined: string;
  noPlayersConnected: string;
  roomListPending: string;
  moderationAllowed: string;
  moderationLocked: string;
  ready: string;
  waiting: string;
  reconnecting: string;
  notReady: string;
  kick: string;
  kickPlayer: (name: string) => string;
  roomCode: string;
  join: string;
  lobbyTitle: string;
  lobbyPlayersTitle: string;
  quickStartTitle: string;
  quickStartLines: string[];
  gameSelectionFallback: string;
  gameSelectRoundActiveSubtitle: string;
  gameSelectAutoReadySubtitle: string;
  gameSelectClassicSubtitle: string;
  playerStatusTitle: string;
  noActiveGameTitle: string;
  noActiveGameSelectLine: string;
  noActiveGameRoundActiveLine: string;
  noActiveGameStartLine: string;
  playersConnected: (count: number, max: number) => string;
  activeRoundLockedLine: string;
  setupChoicePendingLine: string;
  autoReadyLine: string;
  spaceStartLine: string;
  setupControlsLine: string;
  afterRoundSwitchLine: string;
  autoStartsWhenReadyLine: string;
  readyVisibleLine: string;
  setupFollowsTitle: string;
  readyToStartTitle: string;
  backToMenu: string;
  backToMenuShort: string;
  gameLobbySubtitle: string;
  gameLobbySetupTitle: string;
  characterSelecting: string;
  morePlayers: (count: number) => string;
  errorLabel: string;
  roomPrefix: string;
  hostCreatingRoom: string;
  hostConnecting: string;
  scanQr: string;
  hostPageHint: string;
  serverOnline: string;
  serverOffline: string;
  readyNextTitle: string;
  lifecycle: (phase: RoomLifecycle | string) => string;
  hostControlRequestTitle: string;
  hostControlRequestBody: (name: string) => string;
  hostControlRequestHint: string;
  hostControlAllow: string;
  hostControlDeny: string;
  hostControlDelegatedTitle: string;
  hostControlDelegatedBody: (name: string) => string;
  hostControlReclaim: string;
  roundPausedTitle: string;
  roundPausedByPlayer: (name: string) => string;
  roundPausedByScreen: string;
  roundPausedHint: string;
  shellKicker: string;
  shellTitle: string;
  shellSetupKicker: string;
  shellStartRound: string;
  shellRoundRunning: string;
  shellBackToCatalog: string;
  shellRosterEmpty: string;
  shellNeedsPlayers: (missing: number) => string;
  shellReadyCount: (ready: number, total: number) => string;
  roomExpiryTitle: string;
  roomExpiryBody: (minutes: number) => string;
  roomExpiryExtend: string;
  roomExpiryExtending: string;
  roomExpiryExtended: string;
  roomExpiryCountdown: (time: string) => string;
}

const hostText = {
  de: {
    shellKicker: "Spiel waehlen",
    shellTitle: "Was spielen wir?",
    shellSetupKicker: "Einstellungen",
    shellStartRound: "Runde starten",
    shellRoundRunning: "Runde laeuft",
    shellBackToCatalog: "Zur Auswahl",
    shellRosterEmpty: "Noch niemand da. Code scannen zum Beitreten.",
    shellNeedsPlayers: (missing: number) =>
      missing === 1 ? "Es fehlt noch 1 Spieler." : `Es fehlen noch ${missing} Spieler.`,
    shellReadyCount: (ready: number, total: number) => `${ready} von ${total} bereit`,
    roomExpiryTitle: "Raum laeuft bald ab",
    roomExpiryBody: (minutes: number) => `Dieser Raum wird in etwa ${minutes} Minuten geschlossen.`,
    roomExpiryExtend: "Um 1 Stunde verlaengern",
    roomExpiryExtending: "Verlaengere...",
    roomExpiryExtended: "Raum um eine Stunde verlängert.",
    roomExpiryCountdown: (time: string) => `Dieser Raum wird in ${time} geschlossen.`,
    roundPausedTitle: "Runde angehalten",
    roundPausedByPlayer: (name: string) => `${name} hat das Host-Menue geoeffnet.`,
    roundPausedByScreen: "Das Host-Menue ist geoeffnet.",
    roundPausedHint: "Es geht weiter, sobald das Menue geschlossen wird.",
    hostControlRequestTitle: "Steuerung uebernehmen?",
    hostControlRequestBody: (name: string) => `${name} moechte den Host steuern.`,
    hostControlRequestHint: "Spielauswahl, Rundenstart und Spielerverwaltung wandern aufs Handy.",
    hostControlAllow: "Erlauben",
    hostControlDeny: "Ablehnen",
    hostControlDelegatedTitle: "Handy steuert",
    hostControlDelegatedBody: (name: string) => `${name} steuert den Host.`,
    hostControlReclaim: "Zurueckholen",
    languageLabel: "Sprache",
    themeLabel: "Design",
    themeLight: "Hell",
    themeDark: "Dunkel",
    phoneController: "Handy-Controller",
    showPhoneController: "Handy-Controller anzeigen",
    hide: "Verstecken",
    fullscreen: "Vollbild",
    exitFullscreen: "Vollbild beenden",
    fpsLabel: "FPS",
    musicVolumeLabel: "Musik",
    soundEffectsVolumeLabel: "Soundeffekte",
    hostControlsTitle: "Host-Steuerung",
    hostControlsSubtitle: "Audio, Bild, Sprache, Spieler",
    close: "Schliessen",
    noGame: "Kein Spiel",
    connected: "Verbunden",
    waitingForRoom: "Warte auf Raum",
    offline: "Offline",
    connectionMissing: "Verbindung fehlt",
    players: "Spieler",
    playerRange: (min: number, max: number) => `${min}-${max} Spieler`,
    selected: "Ausgewaehlt",
    lobby: "Lobby",
    connectedShort: "verbunden",
    noPlayersJoined: "Noch keine Spieler beigetreten.",
    noPlayersConnected: "Noch keine Spieler verbunden.",
    roomListPending: "Sobald ein Raum da ist, erscheint die Liste hier.",
    moderationAllowed: "Spieler koennen im Lobby- oder Zwischenrunden-Zustand entfernt werden.",
    moderationLocked: "Waehrend einer aktiven Runde ist Kicken gesperrt.",
    ready: "bereit",
    waiting: "wartet",
    reconnecting: "verbindet neu",
    notReady: "nicht bereit",
    kick: "Kicken",
    kickPlayer: (name: string) => `Spieler ${name} kicken`,
    roomCode: "RAUMCODE",
    join: "Join",
    lobbyTitle: "Party Lobby",
    lobbyPlayersTitle: "Spieler in der Lobby",
    quickStartTitle: "Schnellstart",
    quickStartLines: [
      "Klick oder Zahlentaste waehlt ein Spiel.",
      "Start danach automatisch oder mit SPACE."
    ],
    gameSelectionFallback: "Spielauswahl",
    gameSelectRoundActiveSubtitle:
      "Die Spieluebersicht ist offen. Solange eine Runde laeuft, bleiben Auswahl und Start gesperrt.",
    gameSelectAutoReadySubtitle:
      "Spiel per Maus oder Zahlentaste wechseln. Ready-basierte Runden starten automatisch.",
    gameSelectClassicSubtitle:
      "Spiel per Maus oder Zahlentaste wechseln. Standard-Runden starten mit SPACE.",
    playerStatusTitle: "Spielerstatus",
    noActiveGameTitle: "Noch kein Spiel aktiv",
    noActiveGameSelectLine: "Waehle oben eine Spielkarte aus.",
    noActiveGameRoundActiveLine:
      "Die aktuelle Runde laeuft noch. Nach dem Ende kannst du hier wieder ein neues Spiel waehlen.",
    noActiveGameStartLine:
      "Danach startet die Runde je nach Spiel automatisch ueber Bereitschaft oder klassisch mit SPACE.",
    playersConnected: (count: number, max: number) => `Spieler verbunden: ${count}/${max}`,
    activeRoundLockedLine:
      "Aktive Runde laeuft gerade. Die Auswahl bleibt sichtbar, ist aber bis zum Rundenende gesperrt.",
    setupChoicePendingLine: "Alle Spieler muessen zuerst ihre Auswahl treffen.",
    autoReadyLine: "Alle Spieler muessen am Handy bereit sein.",
    spaceStartLine: "SPACE startet die Runde, sobald genug Spieler verbunden sind.",
    setupControlsLine: "Dieses Spiel hat Setup-Optionen, die direkt hier gesetzt werden.",
    afterRoundSwitchLine: "Nach dem Rundenende kannst du hier wieder frei umschalten.",
    autoStartsWhenReadyLine: "Sobald alle wieder bereit sind, startet die Runde automatisch.",
    readyVisibleLine: "Bereitschaft und Startstatus bleiben hier sichtbar.",
    setupFollowsTitle: "Setup folgt",
    readyToStartTitle: "Startbereit",
    backToMenu: "Zum Hauptmenue",
    backToMenuShort: "Menue",
    gameLobbySubtitle: "Stellt die Runde ein und startet gemeinsam.",
    gameLobbySetupTitle: "Rundeneinstellungen",
    characterSelecting: "Charakter waehlt noch",
    morePlayers: (count: number) => `+${count} weitere Spieler`,
    errorLabel: "Fehler",
    roomPrefix: "Raum",
    hostCreatingRoom: "Raum wird erstellt ...",
    hostConnecting: "Verbinde Host mit Server ...",
    scanQr: "QR scannen oder Link am Handy oeffnen",
    hostPageHint: "Am Handy immer den angezeigten Controller-Link oder QR-Code verwenden.",
    serverOnline: "Server online",
    serverOffline: "Server offline",
    readyNextTitle: "Bereit fuer die naechste Runde",
    lifecycle: (phase: RoomLifecycle | string) => phase
  },
  en: {
    shellKicker: "Choose a game",
    shellTitle: "What are we playing?",
    shellSetupKicker: "Settings",
    shellStartRound: "Start round",
    shellRoundRunning: "Round running",
    shellBackToCatalog: "Back to games",
    shellRosterEmpty: "Nobody here yet. Scan the code to join.",
    shellNeedsPlayers: (missing: number) =>
      missing === 1 ? "1 more player needed." : `${missing} more players needed.`,
    shellReadyCount: (ready: number, total: number) => `${ready} of ${total} ready`,
    roomExpiryTitle: "Room expiring soon",
    roomExpiryBody: (minutes: number) => `This room will close in about ${minutes} minutes.`,
    roomExpiryExtend: "Extend by 1 hour",
    roomExpiryExtending: "Extending...",
    roomExpiryExtended: "Room extended by one hour.",
    roomExpiryCountdown: (time: string) => `This room will close in ${time}.`,
    roundPausedTitle: "Round paused",
    roundPausedByPlayer: (name: string) => `${name} opened the host menu.`,
    roundPausedByScreen: "The host menu is open.",
    roundPausedHint: "Play resumes when the menu is closed.",
    hostControlRequestTitle: "Hand over control?",
    hostControlRequestBody: (name: string) => `${name} wants to drive the host.`,
    hostControlRequestHint: "Game selection, round start and the roster move to the phone.",
    hostControlAllow: "Allow",
    hostControlDeny: "Decline",
    hostControlDelegatedTitle: "Phone in control",
    hostControlDelegatedBody: (name: string) => `${name} is driving the host.`,
    hostControlReclaim: "Take back",
    languageLabel: "Language",
    themeLabel: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    phoneController: "Phone Controller",
    showPhoneController: "Show phone controller",
    hide: "Hide",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    fpsLabel: "FPS",
    musicVolumeLabel: "Music",
    soundEffectsVolumeLabel: "Sound effects",
    hostControlsTitle: "Host Controls",
    hostControlsSubtitle: "Audio, video, language, players",
    close: "Close",
    noGame: "No game",
    connected: "Connected",
    waitingForRoom: "Waiting for room",
    offline: "Offline",
    connectionMissing: "Connection missing",
    players: "Players",
    playerRange: (min: number, max: number) => `${min}-${max} players`,
    selected: "Selected",
    lobby: "Lobby",
    connectedShort: "connected",
    noPlayersJoined: "No players have joined yet.",
    noPlayersConnected: "No players connected yet.",
    roomListPending: "The player list appears here once a room exists.",
    moderationAllowed: "Players can be removed in the lobby or between rounds.",
    moderationLocked: "Kicking is locked during an active round.",
    ready: "ready",
    waiting: "waiting",
    reconnecting: "reconnecting",
    notReady: "not ready",
    kick: "Kick",
    kickPlayer: (name: string) => `Kick player ${name}`,
    roomCode: "ROOM CODE",
    join: "Join",
    lobbyTitle: "Party Lobby",
    lobbyPlayersTitle: "Players in Lobby",
    quickStartTitle: "Quick Start",
    quickStartLines: [
      "Click or press a number key to pick a game.",
      "Then start automatically or with SPACE."
    ],
    gameSelectionFallback: "Game Selection",
    gameSelectRoundActiveSubtitle:
      "The game overview is open. While a round is running, selection and start stay locked.",
    gameSelectAutoReadySubtitle:
      "Switch games with the mouse or number keys. Ready-based rounds start automatically.",
    gameSelectClassicSubtitle:
      "Switch games with the mouse or number keys. Standard rounds start with SPACE.",
    playerStatusTitle: "Player Status",
    noActiveGameTitle: "No active game",
    noActiveGameSelectLine: "Select a game card above.",
    noActiveGameRoundActiveLine:
      "The current round is still running. Once it ends, you can choose a new game here.",
    noActiveGameStartLine:
      "After that, the round starts either through readiness or classically with SPACE.",
    playersConnected: (count: number, max: number) => `Players connected: ${count}/${max}`,
    activeRoundLockedLine:
      "An active round is running. The selection stays visible, but it is locked until the round ends.",
    setupChoicePendingLine: "All players need to make their selection first.",
    autoReadyLine: "All players need to be ready on their phones.",
    spaceStartLine: "SPACE starts the round once enough players are connected.",
    setupControlsLine: "This game has setup options that can be configured here.",
    afterRoundSwitchLine: "After the round ends, you can switch freely again.",
    autoStartsWhenReadyLine: "As soon as everyone is ready again, the round starts automatically.",
    readyVisibleLine: "Readiness and start status stay visible here.",
    setupFollowsTitle: "Setup Next",
    readyToStartTitle: "Ready to Start",
    backToMenu: "Back to menu",
    backToMenuShort: "Menu",
    gameLobbySubtitle: "Configure the round and start together.",
    gameLobbySetupTitle: "Round setup",
    characterSelecting: "Choosing character",
    morePlayers: (count: number) => `+${count} more players`,
    errorLabel: "Error",
    roomPrefix: "Room",
    hostCreatingRoom: "Creating room ...",
    hostConnecting: "Connecting host to server ...",
    scanQr: "Scan QR code or open the link on your phone",
    hostPageHint: "Always use the displayed controller link or QR code on the phone.",
    serverOnline: "Server online",
    serverOffline: "Server offline",
    readyNextTitle: "Ready for the next round",
    lifecycle: (phase: RoomLifecycle | string) => {
      switch (phase) {
        case "lobby":
          return "lobby";
        case "game_selected":
          return "game selected";
        case "round_intro":
          return "intro";
        case "countdown":
          return "countdown";
        case "playing":
          return "playing";
        case "locked":
          return "locked";
        case "result":
          return "result";
        case "scoreboard":
          return "scoreboard";
        case "finished":
          return "finished";
        default:
          return phase;
      }
    }
  },
  ja: {
    shellKicker: "ゲームを選ぶ",
    shellTitle: "なにで遊ぶ？",
    shellSetupKicker: "設定",
    shellStartRound: "ラウンド開始",
    shellRoundRunning: "ラウンド中",
    shellBackToCatalog: "ゲーム一覧へ",
    shellRosterEmpty: "まだ誰もいない。コードを読み取って参加。",
    shellNeedsPlayers: (missing: number) =>
      missing === 1 ? "あと1人必要。" : `あと${missing}人必要。`,
    shellReadyCount: (ready: number, total: number) => `${total}人中 ${ready}人が準備OK`,
    roomExpiryTitle: "部屋がもうすぐ閉まる",
    roomExpiryBody: (minutes: number) => `この部屋はあと約${minutes}分で閉まる。`,
    roomExpiryExtend: "1時間延長する",
    roomExpiryExtending: "延長している...",
    roomExpiryExtended: "部屋を1時間延長した。",
    roomExpiryCountdown: (time: string) => `この部屋は ${time} で閉まる。`,
    roundPausedTitle: "ラウンド一時停止",
    roundPausedByPlayer: (name: string) => `${name} がホストメニューを開いた。`,
    roundPausedByScreen: "ホストメニューが開いている。",
    roundPausedHint: "メニューを閉じれば再開する。",
    hostControlRequestTitle: "操作を渡す？",
    hostControlRequestBody: (name: string) => `${name} がホストを操作したいと言っている。`,
    hostControlRequestHint: "ゲーム選択・ラウンド開始・プレイヤー管理がスマホに移る。",
    hostControlAllow: "許可する",
    hostControlDeny: "断る",
    hostControlDelegatedTitle: "スマホが操作中",
    hostControlDelegatedBody: (name: string) => `${name} がホストを操作している。`,
    hostControlReclaim: "取り戻す",
    languageLabel: "言語",
    themeLabel: "配色",
    themeLight: "ライト",
    themeDark: "ダーク",
    phoneController: "スマホコントローラー",
    showPhoneController: "スマホコントローラーを表示",
    hide: "隠す",
    fullscreen: "全画面",
    exitFullscreen: "全画面をやめる",
    fpsLabel: "FPS",
    musicVolumeLabel: "音楽",
    soundEffectsVolumeLabel: "効果音",
    hostControlsTitle: "ホスト設定",
    hostControlsSubtitle: "音・画面・言語・プレイヤー",
    close: "閉じる",
    noGame: "ゲームなし",
    connected: "接続中",
    waitingForRoom: "部屋を待っている",
    offline: "オフライン",
    connectionMissing: "接続がない",
    players: "プレイヤー",
    playerRange: (min: number, max: number) => `${min}〜${max}人`,
    selected: "選択中",
    lobby: "ロビー",
    connectedShort: "接続中",
    noPlayersJoined: "まだ誰も参加していない。",
    noPlayersConnected: "まだ誰もつながっていない。",
    roomListPending: "部屋ができるとここにプレイヤー一覧が出る。",
    moderationAllowed: "ロビー中かラウンドの合間なら、プレイヤーを退出させられる。",
    moderationLocked: "ラウンド中は退出させられない。",
    ready: "準備OK",
    waiting: "待っている",
    reconnecting: "再接続中",
    notReady: "まだ",
    kick: "退出",
    kickPlayer: (name: string) => `${name} を退出させる`,
    roomCode: "部屋コード",
    join: "参加",
    lobbyTitle: "パーティーロビー",
    lobbyPlayersTitle: "ロビーのプレイヤー",
    quickStartTitle: "かんたん操作",
    quickStartLines: [
      "クリックか数字キーでゲームを選ぶ。",
      "そのあと自動か SPACE で開始。"
    ],
    gameSelectionFallback: "ゲーム選択",
    gameSelectRoundActiveSubtitle:
      "ゲーム一覧を開いている。ラウンド中は選択と開始ができない。",
    gameSelectAutoReadySubtitle:
      "マウスか数字キーでゲームを切り替える。準備OK式のラウンドは自動で始まる。",
    gameSelectClassicSubtitle:
      "マウスか数字キーでゲームを切り替える。通常のラウンドは SPACE で始まる。",
    playerStatusTitle: "プレイヤーの状態",
    noActiveGameTitle: "まだゲームが始まっていない",
    noActiveGameSelectLine: "上のゲームカードから選ぶ。",
    noActiveGameRoundActiveLine:
      "いまのラウンドがまだ続いている。終われば、ここで次のゲームを選べる。",
    noActiveGameStartLine:
      "そのあとは、ゲームによって準備OKで自動か、いつもの SPACE でラウンドが始まる。",
    playersConnected: (count: number, max: number) => `接続中のプレイヤー: ${count}/${max}`,
    activeRoundLockedLine:
      "ラウンドが進行中。一覧は見えているが、ラウンドが終わるまで選べない。",
    setupChoicePendingLine: "まず全員が選択を済ませる必要がある。",
    autoReadyLine: "全員がスマホで準備OKにする必要がある。",
    spaceStartLine: "人数が揃ったら SPACE でラウンドが始まる。",
    setupControlsLine: "このゲームには、ここで設定できる項目がある。",
    afterRoundSwitchLine: "ラウンドが終われば、また自由に切り替えられる。",
    autoStartsWhenReadyLine: "全員がまた準備OKになれば、ラウンドは自動で始まる。",
    readyVisibleLine: "準備OKと開始の状態はここに出たままになる。",
    setupFollowsTitle: "次は設定",
    readyToStartTitle: "開始できる",
    backToMenu: "メインメニューへ",
    backToMenuShort: "メニュー",
    gameLobbySubtitle: "ラウンドを設定して、みんなで始める。",
    gameLobbySetupTitle: "ラウンド設定",
    characterSelecting: "キャラを選んでいる",
    morePlayers: (count: number) => `ほか${count}人`,
    errorLabel: "エラー",
    roomPrefix: "部屋",
    hostCreatingRoom: "部屋を作っている ...",
    hostConnecting: "ホストをサーバーにつないでいる ...",
    scanQr: "QRを読み取るか、リンクをスマホで開く",
    hostPageHint: "スマホでは、画面に出ているコントローラーのリンクかQRを必ず使う。",
    serverOnline: "サーバー稼働中",
    serverOffline: "サーバー停止中",
    readyNextTitle: "次のラウンドの準備OK",
    lifecycle: (phase: RoomLifecycle | string) => {
      switch (phase) {
        case "lobby":
          return "ロビー";
        case "game_selected":
          return "ゲーム選択済み";
        case "round_intro":
          return "イントロ";
        case "countdown":
          return "カウントダウン";
        case "playing":
          return "プレイ中";
        case "locked":
          return "ロック中";
        case "result":
          return "結果";
        case "scoreboard":
          return "スコア";
        case "finished":
          return "終了";
        default:
          return phase;
      }
    }
  }
} satisfies Record<SupportedLanguage, HostText>;

export function getHostText(language: SupportedLanguage | null | undefined): HostText {
  return hostText[normalizeLanguage(language)];
}
