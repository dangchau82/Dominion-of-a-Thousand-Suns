// Checks every race saga Gemini wrote (src/engine/data/sagas/*.ts): shape, forks, endings, scale.
import { describe, expect, it } from "vitest";
import { SAGA_BEATS, SAGA_ENDINGS, type SagaOutcome } from "../src/engine/data/sagas";
import { RACES } from "../src/engine/data/races";

const OUTCOMES: SagaOutcome[] = ["goldenAge", "civilWar", "rivalBecomesAlly", "everyoneFearsUs", "councilFavour", "greatWorkSurge", "legendFleet", "exodus", "ascension", "fallFromGrace"];
const LIMIT: Record<string, number> = { money: 450, research: 600, culture: 240, population: 8, morale: 12, relations: 30, factories: 15, planetSize: 10, revealStars: 8, ships: 4 };
const races = [...new Set(SAGA_BEATS.filter((b) => b.kind === "act").map((b) => b.raceId))];

describe("saga data", () => {
  it("ids are unique and races are real", () => {
    const ids = [...SAGA_BEATS, ...SAGA_ENDINGS].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    const real = new Set(RACES.map((r) => r.id));
    for (const b of SAGA_BEATS) { expect(real.has(b.raceId), b.id).toBe(true); if (b.withRace) expect(real.has(b.withRace), b.id).toBe(true); }
  });

  for (const race of races) {
    describe(race, () => {
      const beats = SAGA_BEATS.filter((b) => b.raceId === race);
      const endings = SAGA_ENDINGS.filter((e) => e.raceId === race);
      it("has 3 act beats per act, 3 choices each, and 4 endings with a fallback last", () => {
        for (const act of [1, 2, 3, 4]) expect(beats.filter((b) => b.kind === "act" && b.act === act).length, `act ${act}`).toBe(3);
        for (const b of beats) expect(b.choices.length, b.id).toBe(3);
        expect(endings.length).toBe(4);
        expect(endings.at(-1)!.needs).toBeUndefined();
        expect(endings.at(-1)!.needsFlags).toBeUndefined();
        for (const e of endings) { expect(OUTCOMES).toContain(e.outcome); expect(e.choices.length).toBe(1); }
        expect(new Set(endings.map((e) => e.outcome)).size).toBeGreaterThanOrEqual(3);
      });
      it("every flag needed is set by an earlier act or branch", () => {
        const setAt = new Map<string, number>();
        for (const b of beats) for (const c of b.choices) for (const f of c.sets ?? []) setAt.set(f, Math.min(setAt.get(f) ?? 9, b.act));
        for (const b of beats) for (const f of b.needs ?? []) { expect(setAt.has(f), `${b.id} needs ${f}`).toBe(true); expect(setAt.get(f)!, `${b.id} needs ${f}`).toBeLessThanOrEqual(b.act); }
        for (const e of endings) for (const f of e.needsFlags ?? []) expect(setAt.has(f), `${e.id} needs ${f}`).toBe(true);
      });
      it("only uses known placeholders, shifts in range, effects in scale", () => {
        for (const x of [...beats, ...endings]) {
          expect(x.title, `${x.id} title`).not.toMatch(/[{}]/);
          for (const t of [x.text, ...x.choices.flatMap((c) => [c.label, c.result])]) expect(t.replace(/\{(rival|colony|star)\}/g, ""), x.id).not.toMatch(/[{}]/);
          for (const c of x.choices) {
            for (const v of Object.values((c as { shift?: Record<string, number> }).shift ?? {})) expect(Math.abs(v), x.id).toBeLessThanOrEqual(2);
            for (const fx of c.effects) {
              const amount = "amount" in fx ? fx.amount : "count" in fx ? fx.count : 0;
              const key = fx.kind;
              if (LIMIT[key] !== undefined) expect(Math.abs(amount), `${x.id} ${key}`).toBeLessThanOrEqual(LIMIT[key]!);
            }
          }
        }
      });
    });
  }
});
