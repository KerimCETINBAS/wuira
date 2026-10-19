import { TimerSource } from "./TimerSource";
import { registerSource } from "./Source";

/** Native cooldown duration, including opaque timings during combat. */
export class SpellCooldown extends TimerSource {
    protected constructor(public readonly spellId: number | string, options: { ignoreGCD?: boolean } = {}) {
        super(() => C_Spell?.GetSpellCooldownDuration?.(spellId, options.ignoreGCD ?? false), ["SPELL_UPDATE_COOLDOWN", "PLAYER_ENTERING_WORLD", "SPELLS_CHANGED"]);
    }
    public get IsAvailable(): boolean { return C_Spell?.GetSpellCooldownDuration !== undefined; }
    static { registerSource(SpellCooldown, props => new SpellCooldown(props[0] as number | string, props[1] as { ignoreGCD?: boolean } | undefined)); }
}

export class GlobalCooldown extends SpellCooldown {
    protected constructor() { super(61304); }
    static { registerSource(GlobalCooldown, () => new GlobalCooldown()); }
}
