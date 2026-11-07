import { defaultLanguage, normalizeLanguage, type SupportedLanguage } from "@open-party-lab/protocol";

export interface ProfileText {
  title: string;
  name: string;
  changePhoto: string;
  remove: string;
  save: string;
  saving: string;
  preparing: string;
  saved: string;
  photoError: string;
  preview: string;
  reconnecting: string;
  hostOffline: string;
}

const profileText = {
  de: {
    title: "Dein Name & Selfie",
    name: "Spielername",
    changePhoto: "Charakterfoto ändern",
    remove: "Selfie entfernen",
    save: "Profil speichern",
    saving: "Wird gespeichert…",
    preparing: "Foto wird vorbereitet…",
    saved: "Profil gespeichert.",
    photoError: "Das Foto konnte nicht gelesen werden. Bitte wähle ein anderes.",
    preview: "Dein Charakter-Selfie",
    reconnecting: "Verbindung unterbrochen. Wird automatisch wiederhergestellt…",
    hostOffline: "Host-Verbindung unterbrochen. Der Host verbindet sich erneut…"
  },
  en: {
    title: "Your name & selfie",
    name: "Player name",
    changePhoto: "Change character photo",
    remove: "Remove selfie",
    save: "Save profile",
    saving: "Saving…",
    preparing: "Preparing photo…",
    saved: "Profile saved.",
    photoError: "Could not read this photo. Please choose another.",
    preview: "Your character selfie",
    reconnecting: "Connection lost. Reconnecting automatically…",
    hostOffline: "Host connection lost. The host is reconnecting…"
  },
  ja: {
    title: "名前と自撮り",
    name: "プレイヤー名",
    changePhoto: "キャラの写真を変える",
    remove: "自撮りを消す",
    save: "プロフィールを保存",
    saving: "保存している…",
    preparing: "写真を準備している…",
    saved: "プロフィールを保存した。",
    photoError: "この写真は読み込めなかった。別の写真を選んで。",
    preview: "君のキャラの自撮り",
    reconnecting: "接続が切れた。自動でつなぎ直している…",
    hostOffline: "ホストとの接続が切れた。ホストがつなぎ直している…"
  }
} satisfies Record<SupportedLanguage, ProfileText>;

export function getProfileText(language: SupportedLanguage = defaultLanguage): ProfileText {
  return profileText[normalizeLanguage(language)];
}
