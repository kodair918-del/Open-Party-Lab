import { useEffect, useRef, useState } from "react";
import type { SchaetzoramaAnswerSet, SchaetzoramaAssignQuestion, SchaetzoramaAssignmentZone, SchaetzoramaCategoryId, SchaetzoramaPublicQuestion, SchaetzoramaRankQuestion } from "@open-party-lab/protocol";
import { textPicker } from "@open-party-lab/protocol";
import type { SchaetzoramaLayoutModel } from "./models.js";
import { ReadyPanel } from "../common/ReadyPanel.js";
import { AssignmentControl, RankingControl } from "./SchaetzoramaDragControls.js";
import "./SchaetzoramaLayout.css";

interface Props { model: SchaetzoramaLayoutModel }
type JokerDraft = { categoryId: SchaetzoramaCategoryId; targetPlayerId: string };
const categories: SchaetzoramaCategoryId[] = ["number", "percent", "rank", "assign"];

export function SchaetzoramaLayout({ model }: Props) {
  return <RoundLayout key={model.resetKey} model={model} />;
}

function RoundLayout({ model }: Props) {
  const automaticReady = model.ready && model.autoContinue && !model.ready.currentPlayerReady;
  const automaticReadySent = useRef(false);
  useEffect(() => {
    if (!automaticReady) { automaticReadySent.current = false; return; }
    if (!automaticReadySent.current) { automaticReadySent.current = true; model.onAutoReady(); }
  }, [automaticReady, model.onAutoReady]);
  const [answers, setAnswers] = useState<SchaetzoramaAnswerSet>(() => initialAnswers(model));
  const [active, setActive] = useState<SchaetzoramaCategoryId>("number");
  const [reviewed, setReviewed] = useState<Set<SchaetzoramaCategoryId>>(new Set());
  const [joker, setJoker] = useState<JokerDraft>(() => initialJoker(model));
  const t = textPicker(model.language);

  if (!model.roundContent) {
    return <p className="szc-empty">{t("Das Quiz-Pult wird vorbereitet.", "The quiz panel is warming up.", "クイズ台を準備している。")}</p>;
  }

  const locked = Object.keys(model.ownAnswers).length > 0;
  const index = categories.indexOf(active);
  const canLock = categories.slice(0, -1).every((category) => reviewed.has(category));
  const finishStep = () => {
    const done = new Set(reviewed).add(active);
    setReviewed(done);
    const target = categories.find((category, position) => position > index && !done.has(category));
    if (target) setActive(target);
  };

  return <div className="szc-shell">
    <header className="szc-header">
      <div><span className="szc-kicker">{model.roundContent.roundLabel}</span><strong>{stageTitle(model)}</strong></div>
      <span className="szc-limit">{t("Ohne Zeitlimit", "No timer", "時間制限なし")}</span>
    </header>
    {model.ready ? <ReadyPanel ready={model.ready} /> : null}
    {model.stage === "revealed" ? <ResultView model={model} /> : model.stage === "joker" ? <CopyView model={model} draft={joker} onDraftChange={setJoker} /> : locked ? <LockedView model={model} /> : <>
      <nav className="szc-tabs" aria-label={t("Fragen", "Questions", "問題")}>
        {categories.map((category, position) => <button key={category} type="button" className={`szc-tab szc-${category}${active === category ? " is-active" : ""}${reviewed.has(category) ? " is-done" : ""}`} onClick={() => setActive(category)} aria-label={`${position + 1}. ${model.categoryLabels[category]}`}><span>{glyph(category)}</span><small>{position + 1}</small></button>)}
      </nav>
      <Question question={model.roundContent.questions[active]} answer={answers[active]} language={model.language} disabled={!model.canSubmitAnswers} onChange={(answer) => setAnswers((current) => ({ ...current, [active]: answer }))} />
      <div className="szc-actions">
        {index > 0 ? <button type="button" className="szc-button szc-button-secondary" onClick={() => setActive(categories[index - 1])}>← {t("Zurück", "Back", "戻る")}</button> : <span />}
        {index < 3 ? <button type="button" className="szc-button szc-button-primary" onClick={finishStep}>{t("Fertig", "Done", "完了")} →</button> : <button type="button" className="szc-button szc-button-submit" disabled={!model.canSubmitAnswers || !canLock} onClick={() => model.onSubmitAnswers(answers)}>{t("Antworten einloggen", "Lock answers", "回答を確定")}</button>}
      </div>
      {!canLock && index === 3 ? <p className="szc-note">{t("Schließe die Fragen 1 bis 3 ab, bevor du einloggst.", "Complete questions 1 to 3 before locking in.", "確定する前に、1〜3の問題を終わらせて。")}</p> : null}
    </>}
    <Progress model={model} />
  </div>;
}

function Question({ question, answer, language, disabled, onChange }: { question: SchaetzoramaPublicQuestion; answer: SchaetzoramaAnswerSet[SchaetzoramaCategoryId]; language: SchaetzoramaLayoutModel["language"]; disabled: boolean; onChange: (answer: NonNullable<SchaetzoramaAnswerSet[SchaetzoramaCategoryId]>) => void }) {
  return <section className={`szc-question szc-${question.categoryId}`}>
    <div className="szc-question-head"><span className="szc-question-icon">{glyph(question.categoryId)}</span><div><span>{question.shortLabel}</span><strong>{question.title}</strong></div></div>
    <h2>{question.prompt}</h2>
    {questionControl(question, answer, language, disabled, onChange)}
  </section>;
}

function questionControl(question: SchaetzoramaPublicQuestion, answer: SchaetzoramaAnswerSet[SchaetzoramaCategoryId], language: SchaetzoramaLayoutModel["language"], disabled: boolean, onChange: (answer: NonNullable<SchaetzoramaAnswerSet[SchaetzoramaCategoryId]>) => void) {
  const t = textPicker(language);
  if (question.kind === "number" || question.kind === "percent") {
    const value = answer?.kind === "number" ? answer.value : 0;
    const progress = ((value - question.min) / Math.max(1, question.max - question.min)) * 100;
    const unit = question.unitLabel ?? (question.kind === "percent" ? "%" : "");
    return <div className="szc-number-control">
      {question.kind === "percent" ? <div className="szc-percent-ring" style={{ "--value": `${progress}%` } as React.CSSProperties}><strong>{value}<small>%</small></strong></div> : <div className="szc-number-readout"><strong>{value}</strong><span>{unit}</span></div>}
      <input className="szc-range" type="range" min={question.min} max={question.max} value={value} disabled={disabled} onChange={(event) => onChange({ kind: "number", value: Number(event.currentTarget.value) })}/>
      <div className="szc-range-labels"><span>{question.min}</span><span>{question.max}{unit ? ` ${unit}` : ""}</span></div>
      <div className="szc-stepper"><button type="button" disabled={disabled || value <= question.min} aria-label={t("Verringern", "Decrease", "下げる")} onClick={() => onChange({ kind: "number", value: Math.max(question.min, value - 1) })}>−</button><input type="number" min={question.min} max={question.max} value={value} disabled={disabled} aria-label={t("Schätzwert", "Estimate", "予想の数")} onChange={(event) => onChange({ kind: "number", value: clamp(Number(event.currentTarget.value), question.min, question.max) })}/><button type="button" disabled={disabled || value >= question.max} aria-label={t("Erhöhen", "Increase", "上げる")} onClick={() => onChange({ kind: "number", value: Math.min(question.max, value + 1) })}>+</button></div>
    </div>;
  }

  if (question.kind === "rank") {
    const order = answer?.kind === "rank" ? answer.order : question.items.map((item) => item.id);
    return <RankingControl key={question.id} question={question} order={order} language={language} disabled={disabled} onChange={(order) => onChange({ kind: "rank", order })} />;
  }

  if (question.kind === "assign") {
    const assignments = answer?.kind === "assign" ? answer.assignments : Object.fromEntries(question.terms.map((term) => [term.id, "both" as const]));
    return <AssignmentControl key={question.id} question={question} assignments={assignments} language={language} disabled={disabled} onChange={(assignments) => onChange({ kind: "assign", assignments })} />;
  }
  return null;
}

function LockedView({ model }: { model: SchaetzoramaLayoutModel }) {
  const t = textPicker(model.language);
  const waiting = model.progress.filter((player) => !player.answered).length;
  return <section className="szc-status"><span>✓</span><h2>{t("Antworten eingeloggt", "Answers locked", "回答を確定した")}</h2><p>{waiting ? t(`Noch ${waiting} fehlen.`, `Waiting for ${waiting} more.`, `あと ${waiting} 人待ち。`) : t("Alle sind bereit.", "Everyone is ready.", "全員そろった。")}</p></section>;
}

function CopyView({ model, draft, onDraftChange }: { model: SchaetzoramaLayoutModel; draft: JokerDraft; onDraftChange: (draft: JokerDraft) => void }) {
  const t = textPicker(model.language);
  const preview = model.ownJokerPreview;
  const categoryId = preview?.categoryId ?? draft.categoryId;
  const targetId = preview?.targetPlayerId ?? draft.targetPlayerId;
  const target = model.copyTargets.find((player) => player.playerId === targetId) ?? model.copyTargets[0];
  if (!model.canSubmitJoker) return <section className="szc-status"><span>✓</span><h2>{t("Entscheidung eingeloggt", "Decision locked", "決定した")}</h2></section>;
  if ((!preview && model.ownInventory.copy <= 0) || !target) return <section className="szc-copy"><h2>{t("Eigene Antworten behalten", "Keep your answers", "自分の回答のままにする")}</h2><p>{t("In dieser Runde ist kein Abschreiben verfügbar.", "No copy is available this round.", "このラウンドは写せない。")}</p><button className="szc-button szc-button-primary" onClick={() => model.onChooseJoker(null)}>{t("Weiter", "Continue", "次へ")}</button></section>;
  return <section className="szc-copy">
    <div className="szc-copy-token"><span aria-hidden="true">◫</span><strong>{model.ownInventory.copy}</strong><small>{t("übrig", "remaining", "のこり")}</small></div>
    <h2>{preview ? t("Behalten oder abschreiben?", "Keep or copy?", "そのまま？写す？") : t("Bei wem abgucken?", "Whose answer?", "誰の回答を見る？")}</h2>
    {!preview ? <>
      <div className="szc-tabs" role="group" aria-label={t("Frage", "Question", "問題")}>{categories.map((category) => <button key={category} type="button" className={`szc-tab szc-copy-category szc-${category}${categoryId === category ? " is-active" : ""}`} aria-pressed={categoryId === category} onClick={() => onDraftChange({ ...draft, categoryId: category })}><span aria-hidden="true">{glyph(category)}</span><b>{model.categoryLabels[category]}</b></button>)}</div>
      <p className="szc-copy-prompt">{model.roundContent?.questions[categoryId].prompt}</p>
      <div className="szc-people" role="group" aria-label={t("Person", "Player", "だれ")}>{model.copyTargets.map((player) => <button key={player.playerId} type="button" className={`szc-person${target.playerId === player.playerId ? " is-selected" : ""}`} aria-pressed={target.playerId === player.playerId} onClick={() => onDraftChange({ ...draft, targetPlayerId: player.playerId })}><span aria-hidden="true">{player.name.slice(0, 1).toUpperCase()}</span><strong>{player.name}</strong></button>)}</div>
    </> : <><p className="szc-copy-prompt">{model.categoryLabels[categoryId]} · {model.roundContent?.questions[categoryId].prompt}</p><div className="szc-compare"><Preview title={t("Du", "You", "じぶん")} text={formatAnswer(model, categoryId, model.ownAnswers[categoryId])}/><Preview title={target.name} text={formatAnswer(model, categoryId, target.answers?.[categoryId])}/></div></>}
    <div className="szc-copy-actions"><button type="button" className="szc-button szc-button-keep" onClick={() => model.onChooseJoker(null)}>{t("Eigene behalten", "Keep mine", "自分のまま")}</button>{preview ? <button type="button" className="szc-button szc-button-submit" onClick={() => model.onChooseJoker({ kind: "copy", categoryId, targetPlayerId: target.playerId })}>{t("Abschreiben", "Copy", "写す")}</button> : <button type="button" className="szc-button szc-button-primary" onClick={() => model.onPreviewJoker({ kind: "copy", categoryId, targetPlayerId: target.playerId })}>{t("Ansehen · 1 Joker", "Reveal · 1 token", "見る · 1枚つかう")}</button>}</div>
  </section>;
}

function Preview({ title, text }: { title: string; text: string }) { return <div className="szc-answer-preview"><span>{title}</span><strong>{text}</strong></div>; }
function ResultView({ model }: { model: SchaetzoramaLayoutModel }) {
  const t = textPicker(model.language);
  const category = categories[model.revealStep];
  const waiting = category && !model.revealAnswersVisible;
  return <section className="szc-result-controls">
    <span className="szc-result-icon" aria-hidden="true">{waiting ? "◷" : "✓"}</span>
    <h2>{category ? (waiting ? t("Antworten werden aufgedeckt", "Revealing answers", "回答を公開中") : t("Alle Antworten aufgedeckt", "All answers revealed", "全部公開した")) : t("Rundenwertung", "Round standings", "ラウンドの順位")}</h2>
    <p>{category ? model.categoryLabels[category] : t("Die Wertung steht auf dem großen Bildschirm.", "The standings are on the big screen.", "順位は大きい画面に出ている。")}</p>
    {category && model.revealAnswersVisible ? <button type="button" className="szc-button szc-button-primary" disabled={model.disabled || model.ownRevealReady || model.autoContinue} onClick={model.onContinueReveal}>{model.ownRevealReady || model.autoContinue ? t("Bereit · warte auf alle", "Ready · waiting for everyone", "準備OK · 全員待ち") : t("Weiter →", "Continue →", "次へ →")}</button> : null}
    <label className="szc-auto-continue"><input type="checkbox" checked={model.autoContinue} onChange={(event) => model.onSetAutoContinue(event.currentTarget.checked)} /><span>{t("Automatisch weiter und bereit", "Automatically continue and ready up", "自動で次へ進んで準備OKにする")}</span></label>
    <p className="szc-note">{t("Weiter geht es, wenn alle bereit sind. Diese Einstellung meldet dich auch für die nächste Runde bereit.", "Continue after everyone is ready. This preference also readies you for the next round.", "全員が準備OKになったら進む。この設定は次のラウンドの準備OKにもなる。")}</p>
  </section>;
}
function Progress({ model }: { model: SchaetzoramaLayoutModel }) { return model.progress.length ? <div className="szc-progress">{model.progress.map((player) => { const done = model.stage === "joker" ? player.jokerReady : player.answered; return <i key={player.playerId} title={player.name} className={done ? "is-done" : ""} style={{ "--player": player.color } as React.CSSProperties}/>; })}</div> : null; }

function initialAnswers(model: SchaetzoramaLayoutModel): SchaetzoramaAnswerSet { if (!model.roundContent) return {}; const rank = model.roundContent.questions.rank as SchaetzoramaRankQuestion; const assign = model.roundContent.questions.assign as SchaetzoramaAssignQuestion; return { number: model.ownAnswers.number ?? { kind: "number", value: 0 }, percent: model.ownAnswers.percent ?? { kind: "number", value: 0 }, rank: model.ownAnswers.rank ?? { kind: "rank", order: rank.items.map((item) => item.id) }, assign: model.ownAnswers.assign ?? { kind: "assign", assignments: Object.fromEntries(assign.terms.map((term) => [term.id, "both"])) } }; }
function initialJoker(model: SchaetzoramaLayoutModel): JokerDraft { const joker = model.ownJokerPreview ?? model.ownJoker; return { categoryId: joker?.categoryId ?? "number", targetPlayerId: joker?.targetPlayerId ?? model.copyTargets[0]?.playerId ?? "" }; }
function clamp(value: number, min: number, max: number) { return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min; }
function glyph(category: SchaetzoramaCategoryId) { return category === "number" ? "#" : category === "percent" ? "%" : category === "rank" ? "↕" : "◉"; }
function stageTitle(model: SchaetzoramaLayoutModel) { const t = textPicker(model.language); return model.stage === "revealed" ? t("Auflösung", "Results", "答え合わせ") : model.stage === "joker" ? t("Abschreiben", "Copy round", "写しラウンド") : t("Deine Schätzungen", "Your estimates", "君の予想"); }
function zoneLabel(zone: SchaetzoramaAssignmentZone, question: Pick<SchaetzoramaAssignQuestion, "leftLabel" | "rightLabel">, language: SchaetzoramaLayoutModel["language"]) { return zone === "left" ? question.leftLabel : zone === "right" ? question.rightLabel : textPicker(language)("Beide", "Both", "両方"); }
function formatAnswer(model: SchaetzoramaLayoutModel, category: SchaetzoramaCategoryId, answer: SchaetzoramaAnswerSet[SchaetzoramaCategoryId]): string { const question = model.roundContent?.questions[category]; if (!answer || !question) return "–"; if (answer.kind === "number") return `${answer.value}${question.kind === "percent" ? "%" : question.kind === "number" && question.unitLabel ? ` ${question.unitLabel}` : ""}`; if (answer.kind === "rank" && question.kind === "rank") return answer.order.map((id) => question.items.find((item) => item.id === id)?.label ?? id).join(" › "); if (answer.kind === "assign" && question.kind === "assign") return question.terms.map((term) => `${term.label}: ${zoneLabel(answer.assignments[term.id], question, model.language)}`).join(" · "); return "–"; }
