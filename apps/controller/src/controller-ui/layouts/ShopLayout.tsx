import { useEffect, useState } from "react";
import type { ShopLayoutModel } from "./models.js";
import { textPicker, type SupportedLanguage } from "@open-party-lab/protocol";
import { BigButton } from "../common/BigButton.js";

interface ShopLayoutProps {
  model: ShopLayoutModel;
}

function formatLabel(kind: ShopLayoutModel["offers"][number]["kind"], language?: SupportedLanguage): string {
  switch (kind) {
    case "weapon":
      return textPicker(language)("Waffe", "Weapon", "武器");
    case "upgrade":
      return textPicker(language)("Upgrade", "Upgrade", "強化");
    default:
      return textPicker(language)("Item", "Item", "アイテム");
  }
}

export function ShopLayout({ model }: ShopLayoutProps) {
  const t = textPicker(model.language);
  const [selectedWeaponInstanceId, setSelectedWeaponInstanceId] = useState<string | null>(null);
  const selectedWeapon =
    model.loadout?.weapons.find(
      (weapon) => weapon.weaponInstanceId === selectedWeaponInstanceId
    ) ??
    model.loadout?.weapons[0] ??
    null;

  useEffect(() => {
    if (!model.loadout?.weapons.length) {
      setSelectedWeaponInstanceId(null);
      return;
    }

    if (
      !selectedWeaponInstanceId ||
      !model.loadout.weapons.some(
        (weapon) => weapon.weaponInstanceId === selectedWeaponInstanceId
      )
    ) {
      setSelectedWeaponInstanceId(model.loadout.weapons[0].weaponInstanceId);
    }
  }, [model.loadout?.weapons, selectedWeaponInstanceId]);

  const showWeaponActions = Boolean(model.onSellWeapon || model.onCombineWeapon);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <header
        style={{
          display: "grid",
          gap: 8,
          padding: 18,
          borderRadius: 22,
          border: "1px solid var(--panel-border)",
          background: "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent) 0%, color-mix(in srgb, var(--accent-soft) 82%, transparent) 100%)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <strong style={{ fontSize: "1.3rem", color: model.accentColor ?? "var(--accent)" }}>{model.title}</strong>
          <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>{t("Welle", "Wave", "ウェーブ")} {model.waveNumber}</span>
        </div>
        {model.subtitle ? <span style={{ color: "var(--text-muted)" }}>{model.subtitle}</span> : null}
        {model.helperText ? <span style={{ color: "var(--text-muted)" }}>{model.helperText}</span> : null}
      </header>

      {model.ready ? (
        <section
          style={{
            display: "grid",
            gap: 12,
            padding: 18,
            borderRadius: 22,
            border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
            background: "linear-gradient(180deg, color-mix(in srgb, var(--accent-soft) 50%, transparent) 0%, color-mix(in srgb, var(--surface) 86%, transparent) 100%)"
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ fontSize: "1.05rem" }}>
              {model.ready.currentPlayerReady ? t("Bereit fuer naechste Welle", "Ready for next wave", "次のウェーブの準備OK") : t("Noch nicht bereit", "Not ready yet", "まだ準備できていない")}
            </strong>
            <span style={{ color: "var(--text-muted)", lineHeight: 1.45 }}>

              {model.ready.description ?? t(
                `Warte auf alle Spieler. ${model.ready.readyCount}/${model.ready.playerCount} bereit.`,
                `Waiting for all players. ${model.ready.readyCount}/${model.ready.playerCount} ready.`,
                `みんなを待っている。${model.ready.readyCount}/${model.ready.playerCount} 人が準備OK。`
              )}
            </span>
          </div>

          <BigButton
            disabled={model.disabled}
            onClick={model.ready.onToggleReady}
            style={{
              opacity: model.disabled ? 0.55 : 1,
              minHeight: 64,
              background: model.ready.currentPlayerReady
                ? "linear-gradient(180deg, color-mix(in srgb, var(--sage) 94%, transparent) 0%, color-mix(in srgb, var(--sage-strong) 98%, transparent) 100%)"
                : "linear-gradient(180deg, var(--accent) 0%, var(--accent) 100%)"
            }}
          >
            {model.ready.currentPlayerReady ? t("Nicht bereit", "Not ready", "準備をやめる") : model.ready.label}
          </BigButton>
        </section>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: "color-mix(in srgb, var(--surface) 52%, transparent)",
            border: "1px solid var(--panel-border)"
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>Material</div>
          <strong style={{ fontSize: "1.6rem" }}>{model.materials}</strong>
        </div>
        {typeof model.runSummary?.wavesCleared === "number" ? (
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "color-mix(in srgb, var(--surface) 52%, transparent)",
              border: "1px solid var(--panel-border)"
            }}
          >
            <div style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>{t("Gespielte Wellen", "Waves played", "遊んだウェーブ数")}</div>
            <strong style={{ fontSize: "1.6rem" }}>{model.runSummary.wavesCleared}</strong>
          </div>
        ) : null}
      </section>

      {model.loadout?.items?.length || model.loadout?.weapons?.length ? (
        <section style={{ display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: "1rem", color: "var(--text-muted)" }}>{t("Aktives Setup", "Active Setup", "いまの装備")}</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {model.loadout?.weapons?.map((weapon, index) => (
              <button
                type="button"
                key={weapon.weaponInstanceId}
                onClick={() => setSelectedWeaponInstanceId(weapon.weaponInstanceId)}
                style={{
                  display: "grid",
                  gridTemplateColumns: weapon.iconPath ? "44px 1fr auto" : "1fr auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 16,
                  background:
                    selectedWeapon?.weaponInstanceId === weapon.weaponInstanceId
                      ? "color-mix(in srgb, var(--accent) 20%, transparent)"
                      : "color-mix(in srgb, var(--accent-soft) 34%, transparent)",
                  border:
                    selectedWeapon?.weaponInstanceId === weapon.weaponInstanceId
                      ? "1px solid color-mix(in srgb, var(--accent) 44%, transparent)"
                      : "1px solid color-mix(in srgb, var(--accent) 18%, transparent)",
                  color: "var(--text-main)",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                {weapon.iconPath ? (
                  <img
                    src={weapon.iconPath}
                    alt=""
                    width={40}
                    height={40}
                    style={{
                      borderRadius: 10,
                      objectFit: "contain",
                      background: "color-mix(in srgb, var(--surface) 68%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--muted) 18%, transparent)",
                      padding: 4
                    }}
                  />
                ) : null}
                <span>
                  {`W${index + 1} ${weapon.displayName}`}
                  {weapon.sellable ? (
                    <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.68rem", marginTop: 2 }}>
                      {t("Verkauf", "Sell", "売る")} {weapon.sellValue ?? 0} M
                    </span>
                  ) : null}
                  {weapon.canCombine ? (
                    <span
                      style={{
                        display: "block",
                        marginTop: 2,
                        color: "var(--ink-soft)",
                        fontSize: "0.68rem",
                        fontWeight: 700
                      }}
                    >
                      {t("Kombi bereit", "Merge ready", "合成できる")}
                    </span>
                  ) : null}
                </span>
                <strong>Lv. {weapon.level}</strong>
              </button>
            ))}
            {model.loadout?.items?.map((item) => (
              <div
                key={item.itemId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: "color-mix(in srgb, var(--surface) 42%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--muted) 16%, transparent)"
                }}
              >
                <span>{item.displayName}</span>
                <strong>Lv. {item.level}</strong>
              </div>
            ))}
          </div>
          {selectedWeapon && model.onCombineWeapon ? (
            <BigButton
              disabled={!selectedWeapon.canCombine}
              onClick={() => model.onCombineWeapon?.(selectedWeapon.weaponInstanceId)}
              style={{
                minHeight: 52,
                fontSize: "clamp(1.05rem, 2.7vw, 1.35rem)",
                opacity: selectedWeapon.canCombine ? 1 : 0.55,
                background: selectedWeapon.canCombine
                  ? "linear-gradient(180deg, color-mix(in srgb, var(--sage) 94%, transparent) 0%, color-mix(in srgb, var(--sage-strong) 98%, transparent) 100%)"
                  : "color-mix(in srgb, var(--surface-raised) 82%, transparent)"
              }}
            >

              {selectedWeapon.canCombine
                ? t(
                    `${selectedWeapon.displayName} zu Lv. ${selectedWeapon.level + 1} kombinieren`,
                    `Merge ${selectedWeapon.displayName} to Lv. ${selectedWeapon.level + 1}`,
                    `${selectedWeapon.displayName} を Lv.${selectedWeapon.level + 1} に合成`
                  )
                : t(
                    "Kombinieren braucht zwei gleiche Waffen desselben Levels",
                    "Merge needs two matching weapons of the same level",
                    "合成には同じレベルの同じ武器が2つ必要"
                  )}
            </BigButton>
          ) : null}
          {selectedWeapon ? (
            <section
              style={{
                display: "grid",
                gap: 10,
                padding: 14,
                borderRadius: 18,
                background: "color-mix(in srgb, var(--accent-soft) 28%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <strong>{selectedWeapon.displayName}</strong>
                <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>Lv. {selectedWeapon.level}</span>
              </div>
              <span style={{ color: "var(--text-muted)", lineHeight: 1.45 }}>{selectedWeapon.description}</span>
              {selectedWeapon.stats?.length ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
                    gap: 8
                  }}
                >
                  {selectedWeapon.stats.map((stat) => (
                    <div
                      key={`${selectedWeapon.weaponInstanceId}:${stat.label}`}
                      style={{
                        display: "grid",
                        gap: 2,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: stat.highlighted
                          ? "1px solid color-mix(in srgb, var(--accent) 34%, transparent)"
                          : "1px solid color-mix(in srgb, var(--muted) 14%, transparent)",
                        background: stat.highlighted
                          ? "color-mix(in srgb, var(--accent-soft) 50%, transparent)"
                          : "color-mix(in srgb, var(--surface) 36%, transparent)"
                      }}
                    >
                      <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                        {stat.label}
                      </span>
                      <strong style={{ fontSize: "0.92rem", lineHeight: 1.1 }}>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
              {showWeaponActions ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <BigButton
                  disabled={!selectedWeapon.sellable}
                  onClick={() => model.onSellWeapon?.(selectedWeapon.weaponInstanceId)}
                  style={{
                    minHeight: 52,
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    opacity: selectedWeapon.sellable ? 1 : 0.55,
                    background: selectedWeapon.sellable
                      ? "linear-gradient(180deg, color-mix(in srgb, var(--amber) 94%, transparent) 0%, color-mix(in srgb, var(--amber) 98%, transparent) 100%)"
                      : "color-mix(in srgb, var(--surface-raised) 82%, transparent)"
                  }}
                >

                  {selectedWeapon.sellable
                    ? t(
                        `Verkaufen fuer ${selectedWeapon.sellValue ?? 0} M`,
                        `Sell for ${selectedWeapon.sellValue ?? 0} M`,
                        `${selectedWeapon.sellValue ?? 0} M で売る`
                      )
                    : t("Nicht verkaufbar", "Cannot sell", "売れない")}
                </BigButton>
                {model.onCombineWeapon ? (
                  <BigButton
                    disabled={!selectedWeapon.canCombine}
                    onClick={() => model.onCombineWeapon?.(selectedWeapon.weaponInstanceId)}
                    style={{
                      minHeight: 52,
                      fontSize: "clamp(1.1rem, 2.7vw, 1.4rem)",
                      opacity: selectedWeapon.canCombine ? 1 : 0.55,
                      background: selectedWeapon.canCombine
                        ? "linear-gradient(180deg, color-mix(in srgb, var(--sage) 94%, transparent) 0%, color-mix(in srgb, var(--sage-strong) 98%, transparent) 100%)"
                        : "color-mix(in srgb, var(--surface-raised) 82%, transparent)"
                    }}
                  >
                    {selectedWeapon.canCombine
                      ? t(`Kombinieren zu Lv. ${selectedWeapon.level + 1}`, `Merge to Lv. ${selectedWeapon.level + 1}`, `Lv.${selectedWeapon.level + 1} に合成`)
                      : t("Keine passende Kopie", "No matching copy", "同じものが無い")}
                  </BigButton>
                ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
        </section>
      ) : null}

      <section style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: "1rem", color: "var(--text-muted)" }}>Shop</h2>
          {model.reroll ? (
            <BigButton
              disabled={model.disabled || !model.reroll.affordable}
              onClick={model.reroll.onReroll}
              style={{
                minHeight: 52,
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                opacity: model.disabled || !model.reroll.affordable ? 0.55 : 1,
                background: "linear-gradient(180deg, color-mix(in srgb, var(--amber) 94%, transparent) 0%, color-mix(in srgb, var(--amber) 98%, transparent) 100%)"
              }}
            >
              {`${t("Neu wuerfeln", "Reroll", "引き直す")} ${model.reroll.cost} M`}
            </BigButton>
          ) : null}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          {model.offers.map((offer) => (
            <article
              key={offer.id}
              style={{
                display: "grid",
                gap: 10,
                padding: 14,
                borderRadius: 20,
                border: "1px solid var(--panel-border)",
                background: offer.purchased
                  ? "linear-gradient(180deg, color-mix(in srgb, var(--sage) 16%, transparent), color-mix(in srgb, var(--surface) 72%, transparent))"
                  : offer.affordable
                    ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 14%, transparent), color-mix(in srgb, var(--surface) 72%, transparent))"
                    : "color-mix(in srgb, var(--surface) 72%, transparent)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {offer.iconPath ? (
                    <img
                      src={offer.iconPath}
                      alt=""
                      width={42}
                      height={42}
                      style={{
                        borderRadius: 12,
                        objectFit: "cover",
                        background: "color-mix(in srgb, var(--surface) 70%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--muted) 18%, transparent)"
                      }}
                    />
                  ) : null}
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong>{offer.title}</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {formatLabel(offer.kind, model.language)}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    alignSelf: "start",
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: offer.affordable ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "color-mix(in srgb, var(--muted) 14%, transparent)",
                    color: "var(--text-main)",
                    fontWeight: 800,
                    fontSize: "0.86rem"
                  }}
                >
                  {offer.cost} M
                </div>
              </div>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.45 }}>
                {offer.description}
              </p>
              {offer.summary ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>{offer.summary}</div>
              ) : null}
              {offer.stats?.length ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
                    gap: 8,
                    paddingTop: 2
                  }}
                >
                  {offer.stats.map((stat) => (
                    <div
                      key={`${offer.id}:${stat.label}`}
                      style={{
                        display: "grid",
                        gap: 2,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: stat.highlighted
                          ? "1px solid color-mix(in srgb, var(--accent) 34%, transparent)"
                          : "1px solid color-mix(in srgb, var(--muted) 14%, transparent)",
                        background: stat.highlighted
                          ? "color-mix(in srgb, var(--accent-soft) 50%, transparent)"
                          : "color-mix(in srgb, var(--surface) 36%, transparent)"
                      }}
                    >
                      <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                        {stat.label}
                      </span>
                      <strong style={{ fontSize: "0.92rem", lineHeight: 1.1 }}>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                disabled={model.disabled || offer.purchased || !offer.affordable}
                onClick={() => model.onBuy(offer.id)}
                style={{
                  minHeight: 48,
                  borderRadius: 14,
                  border: "1px solid var(--panel-border)",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  background: offer.purchased
                    ? "color-mix(in srgb, var(--sage) 18%, transparent)"
                    : offer.affordable
                      ? "linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%)"
                      : "color-mix(in srgb, var(--surface-raised) 82%, transparent)",
                  color: "var(--text-main)",
                  opacity: model.disabled ? 0.5 : 1,
                  cursor: model.disabled || offer.purchased || !offer.affordable ? "not-allowed" : "pointer",
                  touchAction: "manipulation"
                }}
              >
                  {offer.purchased
                    ? t("Gekauft", "Bought", "買った")
                    : offer.affordable
                      ? t("Kaufen", "Buy", "買う")
                      : t("Zu teuer", "Too expensive", "お金が足りない")}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
