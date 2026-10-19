import { DataSource } from "./DataSource";
import { registerSource } from "./Source";
import { UseSource } from "./UseSource";
import { TextureSource } from "./TextureSource";
import { SpellCooldown } from "./SpellCooldown";
import type { SecureAction } from "../ui/SecureButton";

/** Localized spell identity, texture and native cooldown, independent of action slots. */
export class SpellSource extends DataSource<string | undefined> {
    public readonly Texture: TextureSource;
    public readonly Cooldown: SpellCooldown;
    protected constructor(public readonly spellId: number) {
        super(undefined);
        this.Texture = UseSource(TextureSource, () => C_Spell?.GetSpellTexture?.(spellId), ["SPELLS_CHANGED", "PLAYER_ENTERING_WORLD"]);
        // Name-based secure casting lets the game choose the appropriate learned rank.
        this.Cooldown = UseSource(SpellCooldown, this.Identifier, { ignoreGCD: true });
    }
    static { registerSource(SpellSource, props => new SpellSource(props[0] as number)); }
    protected override GetValue(): string | undefined { return C_Spell?.GetSpellName?.(this.spellId); }
    public get Identifier(): number | string { return this.Value ?? this.spellId; }
    public get Action(): SecureAction { return { type: "spell", spell: this.Identifier }; }
}
