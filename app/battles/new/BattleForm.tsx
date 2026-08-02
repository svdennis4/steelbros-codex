"use client";

import { useMemo, useState } from "react";
import { submitBattle } from "./actions";

type SharedChapter = {
  id: string;
  name: string;
  gameSystem: {
    id: string;
    name: string;
  };
};

type Opponent = {
  id: string;
  name: string;
  sharedChapters: SharedChapter[];
};

type Faction = {
  id: string;
  name: string;
  gameSystemId: string;
};

type BattleFormProps = {
  opponents: Opponent[];
  factions: Faction[];
};

export default function BattleForm({
  opponents,
  factions,
}: BattleFormProps) {
  const [opponentId, setOpponentId] = useState("");
  const [selectedGameSystemId, setSelectedGameSystemId] = useState("");
  const [playerFactionId, setPlayerFactionId] = useState("");
  const [opponentFactionId, setOpponentFactionId] = useState("");

  const selectedOpponent = useMemo(
    () => opponents.find((opponent) => opponent.id === opponentId),
    [opponents, opponentId]
  );

  const availableGameSystems = useMemo(() => {
    if (!selectedOpponent) {
      return [];
    }

    const gameSystems = new Map<
      string,
      {
        id: string;
        name: string;
      }
    >();

    selectedOpponent.sharedChapters.forEach((chapter) => {
      gameSystems.set(chapter.gameSystem.id, chapter.gameSystem);
    });

    return Array.from(gameSystems.values());
  }, [selectedOpponent]);

  const activeGameSystemId =
    availableGameSystems.length === 1
      ? availableGameSystems[0].id
      : selectedGameSystemId;

  const eligibleChapters = useMemo(() => {
    if (!selectedOpponent || !activeGameSystemId) {
      return [];
    }

    return selectedOpponent.sharedChapters.filter(
      (chapter) => chapter.gameSystem.id === activeGameSystemId
    );
  }, [selectedOpponent, activeGameSystemId]);

  const availableFactions = useMemo(() => {
    if (!activeGameSystemId) {
      return [];
    }

    return factions.filter(
      (faction) => faction.gameSystemId === activeGameSystemId
    );
  }, [factions, activeGameSystemId]);

  function handleOpponentChange(newOpponentId: string) {
    setOpponentId(newOpponentId);
    setSelectedGameSystemId("");
    setPlayerFactionId("");
    setOpponentFactionId("");
  }

  function handleGameSystemChange(newGameSystemId: string) {
    setSelectedGameSystemId(newGameSystemId);
    setPlayerFactionId("");
    setOpponentFactionId("");
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      action={submitBattle}
      className="border border-zinc-800 bg-zinc-950 p-6"
    >
      {/* Opponent */}
      <div>
        <label
          htmlFor="opponent"
          className="text-xs font-black tracking-wider text-zinc-400"
        >
          OPPONENT
        </label>

        <select
          id="opponent"
          name="opponentId"
          value={opponentId}
          onChange={(event) => handleOpponentChange(event.target.value)}
          required
          className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
        >
          <option value="">Select an opponent</option>

          {opponents.map((opponent) => (
            <option key={opponent.id} value={opponent.id}>
              {opponent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Game System */}
      {selectedOpponent && availableGameSystems.length > 1 && (
        <div className="mt-8">
          <label
            htmlFor="gameSystem"
            className="text-xs font-black tracking-wider text-zinc-400"
          >
            GAME SYSTEM
          </label>

          <select
            id="gameSystem"
            name="gameSystemId"
            value={selectedGameSystemId}
            onChange={(event) =>
              handleGameSystemChange(event.target.value)
            }
            required
            className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
          >
            <option value="">Select a game system</option>

            {availableGameSystems.map((gameSystem) => (
              <option key={gameSystem.id} value={gameSystem.id}>
                {gameSystem.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Automatically include the game system when only one is available */}
      {selectedOpponent &&
        availableGameSystems.length === 1 &&
        activeGameSystemId && (
          <input
            type="hidden"
            name="gameSystemId"
            value={activeGameSystemId}
          />
        )}

      {selectedOpponent && activeGameSystemId && (
        <>
          {/* Chapters */}
          <div className="mt-8">
            <p className="text-xs font-black tracking-wider text-zinc-400">
              SHARED CHAPTERS
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Select the Chapters where this battle should be recorded.
            </p>

            <div className="mt-4 space-y-3">
              {eligibleChapters.map((chapter) => (
                <label
                  key={`${opponentId}-${activeGameSystemId}-${chapter.id}`}
                  className="flex cursor-pointer items-center justify-between border border-zinc-800 bg-black p-4 hover:border-zinc-700"
                >
                  <div>
                    <p className="font-bold text-zinc-100">
                      {chapter.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {chapter.gameSystem.name}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="communityIds"
                    value={chapter.id}
                    defaultChecked
                    className="h-5 w-5 accent-orange-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Factions */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="playerFaction"
                className="text-xs font-black tracking-wider text-zinc-400"
              >
                YOUR FACTION
              </label>

              <select
                id="playerFaction"
                name="playerFactionId"
                value={playerFactionId}
                onChange={(event) =>
                  setPlayerFactionId(event.target.value)
                }
                required
                className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
              >
                <option value="">Select your faction</option>

                {availableFactions.map((faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="opponentFaction"
                className="text-xs font-black tracking-wider text-zinc-400"
              >
                {selectedOpponent.name.toUpperCase()}&apos;S FACTION
              </label>

              <select
                id="opponentFaction"
                name="opponentFactionId"
                value={opponentFactionId}
                onChange={(event) =>
                  setOpponentFactionId(event.target.value)
                }
                required
                className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
              >
                <option value="">Select their faction</option>

                {availableFactions.map((faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scores */}
          <div className="mt-8">
            <p className="text-xs font-black tracking-wider text-zinc-400">
              FINAL SCORE
            </p>

            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="playerScore"
                  className="text-sm font-bold text-zinc-200"
                >
                  Your Score
                </label>

                <input
                  id="playerScore"
                  name="playerScore"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="0"
                  className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="opponentScore"
                  className="text-sm font-bold text-zinc-200"
                >
                  {selectedOpponent.name}&apos;s Score
                </label>

                <input
                  id="opponentScore"
                  name="opponentScore"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="0"
                  className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
                />
              </div>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              The result will be determined automatically from the final
              score.
            </p>
          </div>

          {/* Date */}
          <div className="mt-8">
            <label
              htmlFor="playedAt"
              className="text-xs font-black tracking-wider text-zinc-400"
            >
              DATE PLAYED
            </label>

            <input
              id="playedAt"
              name="playedAt"
              type="date"
              defaultValue={today}
              required
              className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
            />
          </div>

          {/* Mission */}
          <div className="mt-8">
            <label
              htmlFor="mission"
              className="text-xs font-black tracking-wider text-zinc-400"
            >
              MISSION
              <span className="ml-2 font-normal text-zinc-600">
                OPTIONAL
              </span>
            </label>

            <input
              id="mission"
              name="mission"
              type="text"
              maxLength={100}
              placeholder="Enter mission"
              className="mt-2 block w-full border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
            />
          </div>

          {/* Notes */}
          <div className="mt-8">
            <label
              htmlFor="notes"
              className="text-xs font-black tracking-wider text-zinc-400"
            >
              BATTLE NOTES
              <span className="ml-2 font-normal text-zinc-600">
                OPTIONAL
              </span>
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={1000}
              placeholder="Anything worth remembering about the battle..."
              className="mt-2 block w-full resize-none border border-zinc-700 bg-black px-4 py-3 text-zinc-100"
            />
          </div>

          {/* Submit */}
          <div className="mt-10 border-t border-zinc-800 pt-6">
            <button
              type="submit"
              className="w-full bg-orange-500 px-6 py-4 text-sm font-black tracking-[0.2em] text-black transition hover:bg-orange-400"
            >
              SUBMIT BATTLE
            </button>

            <p className="mt-3 text-center text-xs text-zinc-500">
              Submitted battles count immediately toward the selected
              Chapters.
            </p>
          </div>
        </>
      )}
    </form>
  );
}