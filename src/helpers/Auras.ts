import type { AuraData } from "../datasources/NativeApi";

/** Walks `GetAuraDataByIndex` until the API returns no row. This client does not return the list itself. */
export function ReadAuras(unit: string, filter: string): AuraData[] {
    const read = C_UnitAuras?.GetAuraDataByIndex;
    if (read === undefined) error("ReadAuras: this client does not expose C_UnitAuras.GetAuraDataByIndex");
    const result: AuraData[] = [];
    for (let index = 1; index <= 1024; index++) {
        const aura = read(unit, index, filter);
        if (issecretvalue(aura) || (aura !== undefined && (issecretvalue(aura.spellId) || issecretvalue(aura.name) || issecretvalue(aura.icon)))) error("ReadAuras: secret data cannot be read");
        if (aura === undefined) return result;
        result.push(aura);
    }
    error("ReadAuras: aura enumeration exceeded its safety limit");
}

/** True when the current list contains the spell id or the aura name. */
export function FilterAura(auras: readonly AuraData[], spell: string | number): boolean {
    if (issecretvalue(spell) || (typeof spell !== "string" && typeof spell !== "number")) error("FilterAura expects a public spell id or name");
    for (const aura of auras) {
        if (issecretvalue(aura) || issecretvalue(aura.spellId) || issecretvalue(aura.name)) error("FilterAura: secret data cannot be read");
        if (typeof spell === "number" ? aura.spellId === spell : aura.name === spell) return true;
    }
    return false;
}
