import { useMemo, useState } from "react";
import "./DungeonGuildLayout.css";
import { useHaptics } from "../../hooks/useHaptics.js";
import { ReadyPanel } from "../common/ReadyPanel.js";

import type { DungeonGuildCardModel, DungeonGuildLayoutModel } from "./models.js";
import { textPicker, type SupportedLanguage } from "@open-party-lab/protocol";

interface Props { model: DungeonGuildLayoutModel }
type Page = "character" | "cards";


const names: Record<DungeonGuildCardModel["kind"], [string, string, string]> = {
  monster: ["Monster", "Monster", "モンスター"], curse: ["Fluch", "Curse", "のろい"], class: ["Klasse", "Class", "クラス"],
  race: ["Herkunft", "Ancestry", "種族"], item: ["Ausrüstung", "Gear", "そうび"], boost: ["Kampftrick", "Combat trick", "戦闘トリック"], level: ["Stufe", "Level", "レベル"]
};

function Icon({ name }: { name: "character" | "cards" | "sell" | "equip" | "sword" | "door" }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const shapes = {
    character: <><circle {...p} cx="12" cy="8" r="4" /><path {...p} d="M4 21c.8-4.5 3.3-6.5 8-6.5s7.2 2 8 6.5" /></>,
    cards: <><path {...p} d="m8 4 11 2v14L8 18V4Zm-3 2v13l3 1m4-12 3 1m-3 3 3 1" /></>,
    sell: <><path {...p} d="M12 3v18m4-13c-.5-2-2-3-4-3s-4 1-4 3 1.6 3 4 3 4 1.1 4 3-1.7 3-4 3-3.6-.9-4-3" /></>,
    equip: <><path {...p} d="M8 4h8l3 4-3 2v10H8V10L5 8l3-4Zm1 6h6M10 14h4" /></>,
    sword: <><path {...p} d="m14 3-9 11h6l-1 7 9-12h-6l1-6Z" /></>,
    door: <><path {...p} d="M5 21V4l14-2v19M8 21h13m-6-10h.01" /></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{shapes[name]}</svg>;
}

function Art({ card, className }: { card: DungeonGuildCardModel; className?: string }) {
  return <img className={className} src={card.artPath} alt="" draggable={false} loading="lazy" />;
}


function slotLabel(card: DungeonGuildCardModel, language?: SupportedLanguage): string {
  const labels: Record<string, [string, string, string]> = { head: ["Kopf", "Head", "あたま"], body: ["Körper", "Body", "からだ"], feet: ["Füße", "Feet", "あし"], hands: [card.twoHand ? "Beide Hände" : "Eine Hand", card.twoHand ? "Both hands" : "One hand", card.twoHand ? "両手" : "片手"], other: ["Extra", "Accessory", "アクセサリー"] };
  return textPicker(language)(...(labels[card.slot ?? "other"] ?? labels.other));
}

function replacements(card: DungeonGuildCardModel, equipment: DungeonGuildCardModel[]): DungeonGuildCardModel[] {
  const occupied = equipment.filter((item) => item.id !== card.id && item.equipped !== false && item.slot === card.slot);
  if (card.slot !== "hands") return occupied;
  let used = occupied.reduce((sum, item) => sum + (item.twoHand ? 2 : 1), 0);
  const result: DungeonGuildCardModel[] = [];
  for (const item of [...occupied].reverse()) {
    if (used + (card.twoHand ? 2 : 1) <= 2) break;
    result.push(item);
    used -= item.twoHand ? 2 : 1;
  }
  return result;
}


function BodyEquipment({ equipment, language, selectedId, onSelect }: { equipment: DungeonGuildCardModel[]; language?: SupportedLanguage; selectedId?: string; onSelect: (id: string) => void }) {
  const t = textPicker(language);
  const equipped = equipment.filter((card) => card.equipped !== false);
  const hands = equipped.filter((card) => card.slot === "hands");
  const twoHand = hands.find((card) => card.twoHand);
  const slots = [

    { id: "head", label: t("Kopf", "Head", "あたま"), card: equipped.find((card) => card.slot === "head") },
    { id: "body", label: t("Körper", "Body", "からだ"), card: equipped.find((card) => card.slot === "body") },
    { id: "left", label: t("Linke Hand", "Left hand", "左手"), card: twoHand ?? hands[0] },
    { id: "right", label: t("Rechte Hand", "Right hand", "右手"), card: twoHand ?? hands[1] },
    { id: "feet", label: t("Füße", "Feet", "あし"), card: equipped.find((card) => card.slot === "feet") },
    { id: "other", label: t("Extra", "Accessory", "アクセサリー"), card: equipped.find((card) => card.slot === "other") }
  ];
  return <div className="dg-phone-body" aria-label={t("Ausrüstungsplätze am Körper", "Equipment slots on your body", "からだのそうび欄")}>
    <svg className="dg-phone-body-figure" viewBox="0 0 180 300" aria-hidden="true"><circle cx="90" cy="37" r="23" /><path d="M66 67h48l28 32 14 70-19 5-19-57-3 72 14 87-25 4-14-69-14 69-25-4 14-87-3-72-19 57-19-5 14-70z" /></svg>
    {slots.map(({ id, label, card }) => <button key={id} type="button" className={"dg-phone-body-slot slot-" + id + (card ? " is-filled" : "") + (card?.id === selectedId ? " is-selected" : "")} disabled={!card} 
aria-label={label + ": " + (card ? card.title + (card.twoHand ? t(", belegt beide Hände", ", uses both hands", "・両手がふさがる") : "") : t("frei", "empty", "空き"))} aria-pressed={Boolean(card && card.id === selectedId)} onClick={() => { if (card) onSelect(card.id); }}>
      <small>{label}</small>{card ? <><Art card={card} />
<span>{card.twoHand ? t("2 Hände", "2 hands", "両手") : "+" + (card.bonus ?? 0)}</span></> : <span className="dg-phone-body-free">{t("Frei", "Empty", "空き")}</span>}
    </button>)}
  </div>;
}


function stats(card: DungeonGuildCardModel, language?: SupportedLanguage): Array<[string, string]> {
  const t = textPicker(language);
  if (card.kind === "monster") return [
    [t("Stärke", "Strength", "つよさ"), String(card.level ?? 0)],
    [t("Beute", "Rewards", "もらえるもの"), "+" + (card.levelReward ?? 1) + t(" Stufe", " level", " レベル") + " · " + (card.treasureCount ?? 1) + t(" Schätze", " treasures", " 個のお宝")],
    [t("Flucht", "Escape", "にげる"), (card.escapeTarget ?? 5) + "+"]
  ];
  if (card.kind === "item") return [
    [t("Bonus", "Bonus", "ボーナス"), "+" + (card.bonus ?? 0)],
    [t("Platz", "Slot", "つける場所"), slotLabel(card, language)],
    [t("Wert", "Value", "売値"), (card.goldValue ?? 0) + t(" Gold", " gold", " ゴールド")]
  ];
  if (card.kind === "boost") return [[t("Kampf", "Combat", "戦闘"), "+" + (card.bonus ?? 0)], [t("Einsatz", "Use", "使い方"), t("Einmal im Kampf", "Once per fight", "1回の戦闘で1度")]];
  if (card.kind === "class" || card.kind === "race") return [[t("Stärke", "Strength", "つよさ"), "+" + (card.bonus ?? 0)]];
  return [];
}


function Gear({ card, language, equip, sell, canSell, canEquip = false, replaced = [], selling = false }: { card: DungeonGuildCardModel; language?: SupportedLanguage; equip?: () => void; sell?: () => void; canSell: boolean; canEquip?: boolean; replaced?: DungeonGuildCardModel[]; selling?: boolean }) {
  const t = textPicker(language);
  const isEquipped = card.equipped !== false;
  return <article className={"dg-phone-gear" + (isEquipped ? " is-equipped" : " is-carried")}>
    <Art card={card} className="dg-phone-gear-art" />

    <div className="dg-phone-gear-copy"><strong>{card.title}</strong><small>{card.kind === "item" ? slotLabel(card, language) + (isEquipped ? " · +" + (card.bonus ?? 0) : t(" · kein aktiver Bonus", " · no active bonus", " · ボーナスなし")) : t(...names[card.kind])}</small>{!isEquipped && replaced.length ? <small className="dg-phone-replacement">{t("Ersetzt: ", "Replaces: ", "入れかえ: ")}{replaced.map((item) => item.title).join(", ")}</small> : null}</div>
    {equip ? <button className="dg-phone-icon-action" type="button" disabled={!canEquip} aria-label={(isEquipped ? t("In den Rucksack: ", "Put in backpack: ", "リュックに入れる: ") : t("Anlegen: ", "Equip: ", "そうびする: ")) + card.title} onClick={equip}><Icon name="equip" /><span>{isEquipped ? t("Ablegen", "Stow", "しまう") : t("Anlegen", "Equip", "そうび")}</span></button> : null}
    {sell ? <button className="dg-phone-sell" type="button" disabled={!canSell} onClick={sell} aria-pressed={selling} aria-label={t("Zum Verkauf auswählen: ", "Select for sale: ", "売るものに選ぶ: ") + card.title}><Icon name="sell" /><span>{selling ? "✓ " : ""}{card.goldValue ?? 0}</span></button> : null}
  </article>;
}

export function DungeonGuildLayout({ model }: Props) {

  const t = textPicker(model.language);
  const haptics = useHaptics();
  const [page, setPage] = useState<Page>("cards");
  const [selection, setSelection] = useState<{ round: string; id: string } | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [saleSelection, setSaleSelection] = useState<{ round: string; ids: string[] }>({ round: model.resetKey, ids: [] });
  const [targetId, setTargetId] = useState("");
  const saleCards = [...model.equipment, ...model.hand].filter((card) => card.kind === "item" && saleSelection.round === model.resetKey && saleSelection.ids.includes(card.id));
  const saleTotal = saleCards.reduce((sum, card) => sum + (card.goldValue ?? 0), 0);
  const saleLevels = Math.min(Math.max(0, 9 - model.ownLevel), Math.floor(saleTotal / 1000));
  const toggleSale = (id: string) => setSaleSelection((previous) => ({ round: model.resetKey, ids: previous.round === model.resetKey ? previous.ids.includes(id) ? previous.ids.filter((value) => value !== id) : [...previous.ids, id] : [id] }));
  const inCombat = model.stage === "combat" || model.stage === "help";
  const selected = (selection?.round === model.resetKey ? model.hand.find((card) => card.id === selection.id) : undefined) ?? (inCombat ? model.hand.find((card) => card.playable) : undefined) ?? model.hand[0] ?? null;
  const equipped = model.equipment.filter((card) => card.equipped !== false);
  const backpack = model.equipment.filter((card) => card.equipped === false);
  const inspectedGear = equipped.find((card) => card.id === equipmentId) ?? equipped[0];
  const replaced = selected?.kind === "item" ? replacements(selected, model.equipment) : [];
  const actions = useMemo(() => new Map(model.actions.map((action) => [action.id, action])), [model.actions]);
  const sellActions = model.actions.filter((action) => action.id.startsWith("sell:"));
  const gearActions = model.actions.filter((action) => action.id.startsWith("gear:"));
  const turnActions = model.actions.filter((action) => !action.id.startsWith("sell:") && !action.id.startsWith("gear:"));

  const stageNames: Record<string, [string, string, string]> = {
    door: ["Vor der Tür", "At the door", "とびらの前"], combat: ["Im Kampf", "In combat", "戦闘中"], help: ["Hilfe gesucht", "Help requested", "助けを求めている"],
    loot: ["Beute", "Loot", "お宝"], main: ["Zugaktionen", "Turn actions", "手番の行動"], finished: ["Abenteuer beendet", "Adventure over", "冒険おわり"]
  };

  const act = (id: string) => {
    const action = actions.get(id);
    if (!action?.enabled || !model.canAct || model.disabled) return;
    haptics.tap(id === "escape" ? 22 : 14);
    model.onAction(id);
  };
  const playSelected = (options?: Parameters<DungeonGuildLayoutModel["onPlayCard"]>[1]) => {
    if (!selected?.playable || !model.canAct) return;
    haptics.tap(18);
    model.onPlayCard(selected.id, { ...options, ...((selected.kind === "curse" || selected.kind === "level") ? { targetId: model.playerTargets.find((player) => player.id === targetId)?.id ?? model.playerTargets[0]?.id } : {}) });
  };

  if (model.gameOver) return <main className="dg-phone dg-phone-result">
    <span className="dg-phone-result-mark" aria-hidden="true">✦</span>

    <span className="dg-phone-kicker">{t("DER DUNGEON IST STILL", "THE DUNGEON IS QUIET", "ダンジョンは静かになった")}</span>
    <h1>{model.winnerName ? t(model.winnerName + " gewinnt", model.winnerName + " wins", model.winnerName + " の勝ち") : t("Das Abenteuer endet", "The journey ends", "冒険はここで終わり")}</h1>
    {model.ready ? <ReadyPanel ready={model.ready} /> : null}
  </main>;

  return <main className="dg-phone" key={model.resetKey}>
    <header className="dg-phone-head">
      <div className="dg-phone-brand"><span className="dg-phone-brand-mark" aria-hidden="true">✦</span><div>
<span className="dg-phone-kicker">DUNGEON-GILDE · {t(...(stageNames[model.stage] ?? ([model.stage, model.stage, model.stage] as [string, string, string])))}</span><h1>{model.playerName}</h1></div></div>

      <span className="dg-phone-stage">{model.activePlayerName === model.playerName ? t("Dein Zug", "Your turn", "あなたの番") : t("Zug: ", "Turn: ", "手番: ") + (model.activePlayerName ?? "—")}</span>
    </header>

    <section className="dg-phone-vitals" aria-label={t("Charakterwerte", "Character stats", "キャラクターの数値")}>
      <div className="dg-phone-vital"><span className="dg-phone-vital-icon">✧</span><div><span>{t("Stufe", "Level", "レベル")}</span><strong>{model.ownLevel}<small>/10</small></strong></div></div>
      <div className="dg-phone-vital"><span className="dg-phone-vital-icon">⚔</span><div><span>{t("Kampfstärke", "Strength", "戦闘力")}</span><strong>{model.ownStrength}</strong></div></div>
    </section>
    {model.lastError ? <div className="dg-phone-message" role="alert"><b aria-hidden="true">!</b><span>{model.lastError}</span></div> : null}
    {page === "character" ? <div className="dg-phone-sale-panel">

      <strong>{t("Verkaufswert", "Sale value", "売値")}: {model.saleValue} {t("Gold", "gold", "ゴールド")}</strong>
      {saleCards.length ? <><span>{saleCards.length} {t("ausgewählt", "selected", "個えらんだ")} · {saleTotal} {t("Gold", "gold", "ゴールド")} → +{saleLevels} {t(saleLevels === 1 ? "Stufe" : "Stufen", saleLevels === 1 ? "level" : "levels", "レベル")}</span>{saleTotal > saleLevels * 1000 ? <small>{saleTotal - saleLevels * 1000}{t(" Restwert verfallen.", " remaining value is lost.", " ゴールドはあまって消える。")}</small> : null}<button type="button" className="dg-phone-play" disabled={!model.canAct || model.disabled || saleLevels < 1} onClick={() => { model.onSellCards(saleCards.map((card) => card.id)); setSaleSelection({ round: model.resetKey, ids: [] }); }}>{t("Auswahl verkaufen", "Sell selected items", "えらんだものを売る")}</button></> : null}
    </div> : null}
    <section className="dg-phone-content">
      {page === "character" ? <div className="dg-phone-character">

        {model.dead ? <div className="dg-phone-dead">{t("Deine Figur kehrt im nächsten Zug zurück.", "Your adventurer returns next turn.", "あなたの冒険者は次の手番でもどってくる。")}</div> : null}
        <div className="dg-phone-identity">

          {model.classCard ? <Gear card={model.classCard} language={model.language} canSell={false} /> : <div className="dg-phone-gear dg-phone-empty-gear"><span>♜</span><strong>{t("Keine Klasse", "No class", "クラスなし")}</strong></div>}
          {model.raceCard ? <Gear card={model.raceCard} language={model.language} canSell={false} /> : <div className="dg-phone-gear dg-phone-empty-gear"><span>◇</span><strong>{t("Keine Herkunft", "No ancestry", "種族なし")}</strong></div>}
        </div>
        <div className="dg-phone-section-title"><span>{t("Am Körper", "On your body", "からだにつけている")}</span></div>
        <BodyEquipment equipment={model.equipment} language={model.language} selectedId={inspectedGear?.id} onSelect={(id) => { haptics.tap(8); setEquipmentId(id); }} />
        {inspectedGear ? <Gear card={inspectedGear} language={model.language} canSell={Boolean(actions.get("sell:" + inspectedGear.id)?.enabled && model.canAct)} selling={saleCards.some((card) => card.id === inspectedGear.id)} sell={actions.has("sell:" + inspectedGear.id) ? () => toggleSale(inspectedGear.id) : undefined} equip={actions.has("gear:" + inspectedGear.id) ? () => act("gear:" + inspectedGear.id) : undefined} canEquip={Boolean(actions.get("gear:" + inspectedGear.id)?.enabled && model.canAct)} /> : null}

        <div className="dg-phone-section-title"><span>{t("Rucksack", "Backpack", "リュック")}</span><small>{backpack.length}</small></div>
        {backpack.length ? backpack.map((card) => {
          const equip = gearActions.find((action) => action.id === "gear:" + card.id);
          const sell = actions.get("sell:" + card.id);

          return <Gear key={card.id} card={card} language={model.language} canSell={Boolean(sell?.enabled && model.canAct)} canEquip={Boolean(equip?.enabled && model.canAct)} replaced={replacements(card, model.equipment)} equip={equip ? () => act(equip.id) : undefined} selling={saleCards.some((item) => item.id === card.id)} sell={sell ? () => toggleSale(card.id) : undefined} />;
        }) : null}
        {sellActions.some((action) => model.hand.some((card) => card.id === action.id.slice(5))) ? <>

          <div className="dg-phone-section-title"><span>{t("Aus der Hand verkaufen", "Sell from hand", "手札から売る")}</span></div>
          <div className="dg-phone-bag">{sellActions.map((action) => {
            const card = model.hand.find((candidate) => candidate.id === action.id.slice(5));
            return card ? <div className="dg-phone-bag-row" key={card.id}><Art card={card} /><strong>{card.title}</strong><button className="dg-phone-sell" type="button" disabled={!action.enabled || !model.canAct} aria-pressed={saleCards.some((item) => item.id === card.id)} 
aria-label={t("Zum Verkauf auswählen: ", "Select for sale: ", "売るものに選ぶ: ") + card.title} onClick={() => toggleSale(card.id)}><Icon name="sell" /><span>{card.goldValue ?? 0}</span></button></div> : null;
          })}</div>
        </> : null}
      </div> : <>
        {selected ? <div className="dg-phone-card-focus" aria-live="polite">
          <Art key={selected.id} card={selected} className="dg-phone-card-art-large" />

          <span className="dg-phone-card-kind">{t(...names[selected.kind])}{selected.slot ? " · " + slotLabel(selected, model.language) : ""}</span>
          <h2 className="dg-phone-card-title">{selected.title}</h2>
          {selected.kind === "curse" || selected.kind === "level" ? 
<label className="dg-phone-target">{t("Zielperson", "Target", "ねらう相手")}<select aria-label={t("Zielperson", "Target", "ねらう相手")} value={model.playerTargets.some((player) => player.id === targetId) ? targetId : model.playerTargets[0]?.id ?? ""} onChange={(event) => setTargetId(event.target.value)}>{model.playerTargets.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select></label> : null}
          {selected.effect ? <p className="dg-phone-card-effect">{selected.effect}</p> : null}

          {stats(selected, model.language).length ? <div className="dg-phone-card-stats">{stats(selected, model.language).map(([label, value]) => <div className="dg-phone-card-stat" key={label}><span>{label}</span><b>{value}</b></div>)}</div> : null}
          {selected.kind === "item" && replaced.length ? 
<p className="dg-phone-replacement">{t("Wandert in den Rucksack: ", "Moves to backpack: ", "リュックに移る: ")}{replaced.map((card) => card.title).join(", ")}</p> : null}
          <div className={"dg-phone-detail-action" + (selected.kind === "item" || selected.kind === "boost" ? " has-two-actions" : "")}>
            {selected.kind === "boost" ? <>
              <button className="dg-phone-play" type="button" disabled={!selected.playable || !model.canAct} 
onClick={() => playSelected({ combatSide: "party" })}>{t("Gruppe", "Party", "味方")} +{selected.bonus}</button>
              <button className="dg-phone-play dg-phone-monster-play" type="button" disabled={!selected.playable || !model.canAct} 
onClick={() => playSelected({ combatSide: "monster" })}>{t("Monster", "Monster", "モンスター")} +{selected.bonus}</button>
            </> : selected.kind === "item" ? <>
              <button className="dg-phone-play" type="button" disabled={!selected.playable || !model.canAct} 
onClick={() => playSelected({ itemMode: "equip" })}>{t("Anlegen", "Equip", "そうびする")}</button>
              <button className="dg-phone-play dg-phone-store-play" type="button" disabled={!selected.playable || !model.canAct} 
onClick={() => playSelected({ itemMode: "store" })}>{t("In Rucksack", "Backpack", "リュックへ")}</button>
            </> : <button className="dg-phone-play" type="button" disabled={!selected.playable || !model.canAct} 
onClick={() => playSelected()}>{t("Karte spielen", "Play card", "カードを出す")}</button>}
          </div>
        </div> : <div className="dg-phone-card-focus"><span className="dg-phone-brand-mark">✦</span></div>}
        <div className="dg-phone-hand-wrap">

          <div className="dg-phone-hand" aria-label={t("Karten auf deiner Hand", "Cards in your hand", "あなたの手札")}>
            {model.hand.map((card) => <button key={card.id} type="button" className={"dg-phone-thumb" + (selected?.id === card.id ? " is-selected" : "") + (inCombat ? (card.playable ? " is-combat-playable" : " is-combat-inactive") : "")} onClick={() => { haptics.tap(9); setSelection({ round: model.resetKey, id: card.id }); }} 
aria-label={card.title + ". " + (inCombat && card.playable ? t("Jetzt spielbar. ", "Playable now. ", "いま出せる。") : "") + (card.effect ?? "")} aria-pressed={selected?.id === card.id}><Art card={card} /><strong>{card.title}</strong>{inCombat && card.playable ? <span className="dg-phone-thumb-playable" aria-hidden="true">⚔</span> : null}</button>)}

            {!model.hand.length ? <span className="dg-phone-hint">{t("Keine Handkarten.", "No cards in hand.", "手札がない。")}</span> : null}
          </div>
        </div>
      </>}
    </section>

    {turnActions.length ? <div className="dg-phone-actions" aria-label={t("Zugaktionen", "Turn actions", "手番の行動")}>{turnActions.map((action) => <button type="button" className={"dg-phone-action" + (action.kind === "primary" ? " primary" : "") + (action.kind === "danger" ? " danger" : "")} key={action.id} disabled={!action.enabled || (!model.canAct && action.id !== "help")} onClick={() => act(action.id)}>{action.id === "open-door" ? <Icon name="door" /> : action.id === "escape" || action.id === "fight" ? <Icon name="sword" /> : null}{action.label}</button>)}</div> : null}

    <nav className="dg-phone-nav" aria-label={t("Spielansicht", "Game view", "画面の切りかえ")}>
      <button type="button" className="dg-phone-tab" aria-selected={page === "character"} onClick={() => { haptics.tap(8); setPage("character"); }}>
<Icon name="character" /><span>{t("Charakter", "Character", "キャラ")}</span></button>
      <button type="button" className="dg-phone-tab" aria-selected={page === "cards"} onClick={() => { haptics.tap(8); setPage("cards"); }}>
<Icon name="cards" /><span>{t("Karten", "Cards", "カード")} · {model.hand.length}</span></button>
    </nav>
  </main>;
}
