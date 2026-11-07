import type {
  AvailableGameDto,
  HostControlSnapshot,
  RoomLifecycle,
  RoomSnapshot
} from "@open-party-lab/protocol";
import { resolveGameMaxPlayers, resolveGameMinPlayers, textPicker } from "@open-party-lab/game-core";
import type { RoomRecord } from "./roomStore.js";

type PlayerRecord = RoomRecord["players"] extends Map<string, infer TPlayer> ? TPlayer : never;
type PlayerSetupValue = string | string[];
type PlayerSetupDefinition = NonNullable<AvailableGameDto["playerSetup"]>;

export function deriveRoomLifecycle(room: RoomRecord): RoomLifecycle {
  if (room.currentRound) {
    return room.currentRound.phase;
  }

  if (room.selectedGameId) {
    return "game_selected";
  }

  return "lobby";
}

function getPlayerSetupSelectionKey(setup: PlayerSetupDefinition): string {
  return setup.selectionKey ?? "character";
}

function getPlayerSetupValue(
  selectedGame: AvailableGameDto,
  player: PlayerRecord
): PlayerSetupValue | undefined {
  const setup = selectedGame.playerSetup;

  if (!setup) {
    return undefined;
  }

  const selectionKey = getPlayerSetupSelectionKey(setup);
  const storedValue = player.setupSelectionsByGameId[selectedGame.id]?.[selectionKey];

  if (storedValue !== undefined) {
    return storedValue;
  }

  if (setup.kind === "choice" && selectionKey === "character") {
    return player.selectedCharacterId ?? undefined;
  }

  if (setup.kind === "multi-select" && setup.defaultValue) {
    return [...setup.defaultValue];
  }

  return undefined;
}

function getPublicPlayerSetupSelections(
  selectedGame: AvailableGameDto | undefined,
  player: PlayerRecord
): Record<string, PlayerSetupValue> {
  if (!selectedGame?.playerSetup) {
    return {};
  }

  const setup = selectedGame.playerSetup;
  const selectionKey = getPlayerSetupSelectionKey(setup);
  const value = getPlayerSetupValue(selectedGame, player);

  return value === undefined ? {} : { [selectionKey]: Array.isArray(value) ? [...value] : value };
}

function getSelectedPlayerSetupChoiceId(
  selectedGame: AvailableGameDto | undefined,
  player: PlayerRecord
): string | null {
  if (selectedGame?.playerSetup?.kind !== "choice") {
    return null;
  }

  const value = getPlayerSetupValue(selectedGame, player);
  return typeof value === "string" ? value : null;
}

function isPlayerSetupComplete(selectedGame: AvailableGameDto, player: PlayerRecord): boolean {
  const setup = selectedGame.playerSetup;

  if (!setup || setup.required !== true) {
    return true;
  }

  const validOptionIds = new Set(setup.options.map((option) => option.id));
  const value = getPlayerSetupValue(selectedGame, player);

  if (setup.kind === "choice") {
    return typeof value === "string" && validOptionIds.has(value);
  }

  if (!Array.isArray(value)) {
    return false;
  }

  const uniqueValidValues = [...new Set(value)].filter((entry) => validOptionIds.has(entry));
  return uniqueValidValues.length >= setup.minSelections && uniqueValidValues.length <= setup.maxSelections;
}

function areRequiredPlayerSetupChoicesSelected(room: RoomRecord, selectedGame: AvailableGameDto): boolean {
  const setup = selectedGame.playerSetup;
  if (setup?.kind === "choice" && setup.minPlayersPerOption) {
    const key = getPlayerSetupSelectionKey(setup);
    if (setup.options.some((option) => [...room.players.values()].filter((player) =>
      player.setupSelectionsByGameId[selectedGame.id]?.[key] === option.id).length < setup.minPlayersPerOption!)) return false;
  }
  return [...room.players.values()].every((player) => isPlayerSetupComplete(selectedGame, player));
}

function isLobbySetupConfirmed(room: RoomRecord, selectedGame: AvailableGameDto): boolean {
  const confirmation = selectedGame.lobbySetup?.confirmation;

  if (!confirmation) {
    return true;
  }

  const settings = room.gameSettingsByGameId[selectedGame.id] ?? {};
  return settings[confirmation.settingKey] === true;
}

function toPublicSelectedGameSettings(room: RoomRecord): Record<string, string | number | boolean> | undefined {
  if (!room.selectedGameId) {
    return undefined;
  }

  const settings = room.gameSettingsByGameId[room.selectedGameId] ?? {};
  const publicSettings = Object.fromEntries(
    Object.entries(settings).filter(
      (entry): entry is [string, string | number | boolean] =>
        typeof entry[1] === "string" || typeof entry[1] === "number" || typeof entry[1] === "boolean"
    )
  );

  return Object.keys(publicSettings).length > 0 ? publicSettings : undefined;
}

export function canStartRound(room: RoomRecord, selectedGame: AvailableGameDto | undefined): boolean {
  if (!room.selectedGameId || !selectedGame) {
    return false;
  }

  if (room.currentRound && room.currentRound.phase !== "finished") {
    return false;
  }

  const players = [...room.players.values()];
  const allPlayersReady = players.length > 0 && players.every((player) => player.isReady);
  const allRequiredPlayerSetupChoicesSelected = areRequiredPlayerSetupChoicesSelected(room, selectedGame);
  const setupConfirmed = isLobbySetupConfirmed(room, selectedGame);
  const minimumPlayers = resolveGameMinPlayers(
    selectedGame,
    room.gameSettingsByGameId[selectedGame.id]
  );
  const maximumPlayers = resolveGameMaxPlayers(
    selectedGame,
    room.gameSettingsByGameId[selectedGame.id]
  );

  return (
    allPlayersReady &&
    allRequiredPlayerSetupChoicesSelected &&
    setupConfirmed &&
    players.length >= minimumPlayers &&
    players.length <= maximumPlayers
  );
}

export function explainCannotStartRound(
  room: RoomRecord,
  selectedGame: AvailableGameDto | undefined
): string | null {
  const t = textPicker(room.language);

  if (!room.selectedGameId || !selectedGame) {
    return t("Bitte zuerst ein Spiel auswaehlen.", "Please choose a game first.", "まずゲームを選んで。");
  }

  if (room.currentRound && room.currentRound.phase !== "finished") {
    return t("Die aktuelle Runde laeuft noch.", "The current round is still running.", "いまのラウンドがまだ続いている。");
  }

  const players = [...room.players.values()];
  const minimumPlayers = resolveGameMinPlayers(
    selectedGame,
    room.gameSettingsByGameId[selectedGame.id]
  );
  const maximumPlayers = resolveGameMaxPlayers(
    selectedGame,
    room.gameSettingsByGameId[selectedGame.id]
  );

  if (players.length < minimumPlayers) {
    return t(
      `${selectedGame.displayName} braucht mindestens ${minimumPlayers} Spieler.`,
      `${selectedGame.displayName} needs at least ${minimumPlayers} players.`,
      `${selectedGame.displayName} は最低 ${minimumPlayers} 人必要。`
    );
  }

  if (players.length > maximumPlayers) {
    return t(
      `${selectedGame.displayName} erlaubt hoechstens ${maximumPlayers} Spieler.`,
      `${selectedGame.displayName} allows at most ${maximumPlayers} players.`,
      `${selectedGame.displayName} は最大 ${maximumPlayers} 人まで。`
    );
  }

  const waitingPlayers = players.filter((player) => !player.isReady);

  if (waitingPlayers.length > 0) {
    const names = waitingPlayers.map((player) => player.name).join("、");
    return t(
      `Es sind noch nicht alle bereit: ${waitingPlayers.map((player) => player.name).join(", ")}.`,
      `Not everyone is ready yet: ${waitingPlayers.map((player) => player.name).join(", ")}.`,
      `まだ全員が準備OKじゃない: ${names}`
    );
  }

  if (!areRequiredPlayerSetupChoicesSelected(room, selectedGame)) {
    const setup = selectedGame.playerSetup;
    if (setup?.kind === "choice" && setup.minPlayersPerOption) {
      return t(
        `Jedes Team braucht mindestens ${setup.minPlayersPerOption} Personen.`,
        `Each team needs at least ${setup.minPlayersPerOption} players.`,
        `どのチームも最低 ${setup.minPlayersPerOption} 人必要。`
      );
    }
    const missingChoices = players
      .filter((player) => !isPlayerSetupComplete(selectedGame, player))
      .map((player) => player.name)
      .join(", ");

    return t(
      `Diese Spieler muessen erst ihre Auswahl treffen: ${missingChoices}.`,
      `These players need to choose their setup first: ${missingChoices}.`,
      `この人たちが先に選ぶ必要がある: ${missingChoices}`
    );
  }

  if (!isLobbySetupConfirmed(room, selectedGame)) {
    return t(
      "Der Host muss das Spiel-Setup erst bestaetigen.",
      "The host needs to confirm the game setup first.",
      "先にホストがゲーム設定を確定する必要がある。"
    );
  }

  return null;
}

function toHostControlSnapshot(room: RoomRecord): HostControlSnapshot {
  const holder = room.hostControl.holderPlayerId
    ? room.players.get(room.hostControl.holderPlayerId)
    : undefined;
  const requester = room.hostControl.pendingRequest
    ? room.players.get(room.hostControl.pendingRequest.playerId)
    : undefined;

  return {
    holderPlayerId: holder ? holder.id : null,
    holderName: holder ? holder.name : null,
    pendingRequest:
      room.hostControl.pendingRequest && requester
        ? {
            playerId: requester.id,
            playerName: requester.name,
            requestedAt: room.hostControl.pendingRequest.requestedAt,
            expiresAt: room.hostControl.pendingRequest.expiresAt
          }
        : null
  };
}

export function toRoomSnapshot(
  room: RoomRecord,
  availableGames: AvailableGameDto[]
): RoomSnapshot {
  const selectedGame = room.selectedGameId
    ? availableGames.find((game) => game.id === room.selectedGameId)
    : undefined;
  return {
    code: room.code,
    createdAt: room.createdAt,
    expiresAt: room.expiresAt,
    joinUrl: room.joinUrl,
    language: room.language,
    theme: room.theme,
    hostConnected: room.hostSocketId !== null,
    hostControl: toHostControlSnapshot(room),
    lifecycle: deriveRoomLifecycle(room),
    pausedBy:
      room.clock.pausedAt === null
        ? null
        : {
            playerId: room.clock.pausedByPlayerId,
            playerName: room.clock.pausedByPlayerId
              ? room.players.get(room.clock.pausedByPlayerId)?.name ?? null
              : null
          },
    selectedGameId: room.selectedGameId,
    selectedGameSettings: toPublicSelectedGameSettings(room),
    availableGames,
    players: [...room.players.values()]
      .sort((left, right) => left.joinedAt - right.joinedAt)
      .map((player) => {
        const selectedChoiceId = getSelectedPlayerSetupChoiceId(selectedGame, player);

        return {
          id: player.id,
          name: player.name,
          avatar: player.avatar ?? null,
          color: player.color,
          selectedCharacterId: selectedChoiceId,
          selectedCharacterName: selectedChoiceId
            ? selectedGame?.playerSetup?.options.find((option) => option.id === selectedChoiceId)?.name ?? null
            : null,
          setupSelections: getPublicPlayerSetupSelections(selectedGame, player),
          isReady: player.isReady,
          connected: player.connected,
          presence: player.presence,
          score: player.score,
          joinedAt: player.joinedAt,
          lastSeenAt: player.lastSeenAt,
          reconnectGraceEndsAt: player.reconnectGraceEndsAt
        };
      }),
    currentRound: room.currentRound
      ? {
          gameId: room.currentRound.gameId,
          roundNumber: room.currentRound.roundNumber,
          phase: room.currentRound.phase,
          startedAt: room.currentRound.startedAt,
          phaseStartedAt: room.currentRound.phaseStartedAt,
          phaseEndsAt: room.currentRound.phaseEndsAt,
          updatedAt: room.currentRound.updatedAt,
          message: room.currentRound.message
        }
      : null
  };
}
