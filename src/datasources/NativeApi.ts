import { Source, registerSource } from "./Source";

export interface UnitName {
    readonly name: string | undefined;
    readonly realm: string | undefined;
}

/** Fields named by `GetRaidRosterInfo`. No identity or pet is added. */
export interface RaidRosterInfo {
    readonly name: string | undefined;
    readonly rank: number | undefined;
    readonly subgroup: number | undefined;
    readonly level: number | undefined;
    readonly className: string | undefined;
    readonly fileName: string | undefined;
    readonly zone: string | undefined;
    readonly online: boolean | undefined;
    readonly isDead: boolean | undefined;
    readonly role: string | undefined;
    readonly isML: boolean | undefined;
}

/** Fields returned by `C_UnitAuras.GetAuraDataByIndex`. */
export interface AuraData {
    readonly spellId: number;
    readonly name: string;
    readonly icon: number;
    readonly sourceUnit?: string;
}

interface NativeApi {
    GetNumGroupMembers?(this: void): number;
    IsInRaid?(this: void): boolean;
    UnitGUID?(this: void, unit: string): string | undefined;
    UnitFullName?(this: void, unit: string): wuiraNativeReturns<[string | undefined, string | undefined]>;
    UnitExists?(this: void, unit: string): boolean;
    GetRaidRosterInfo?(this: void, index: number): wuiraNativeReturns<[
        string | undefined, number | undefined, number | undefined, number | undefined,
        string | undefined, string | undefined, string | undefined,
        boolean | undefined, boolean | undefined, string | undefined, boolean | undefined
    ]>;
    UnitHealth?(this: void, unit: string): number;
    UnitHealthMax?(this: void, unit: string): number;
    UnitPower?(this: void, unit: string, powerType: number): number;
    UnitPowerMax?(this: void, unit: string, powerType: number): number;
    UnitGetTotalAbsorbs?(this: void, unit: string): number | undefined;
    UnitGetIncomingHeals?(this: void, unit: string): number | undefined;
    UnitClass?(this: void, unit: string): wuiraNativeReturns<[string | undefined, string | undefined, number | undefined]>;
    UnitIsPlayer?(this: void, unit: string): boolean;
    UnitIsUnit?(this: void, first: string, second: string): boolean;
    GetNumTotemSlots?(this: void): number;
    GetTotemInfo?(this: void, slot: number): wuiraNativeReturns<[
        boolean | undefined, string | undefined, number | undefined, number | undefined,
        number | undefined, number | undefined, number | undefined,
    ]>;
    GetTotemDuration?(this: void, slot: number): object | undefined;
    GetNumSpellTabs?(this: void): number;
    GetSpellTabInfo?(this: void, tab: number): wuiraNativeReturns<[string | undefined, number | undefined, number | undefined, number | undefined]>;
    UnitHealthPercent?(this: void, unit: string, predicted: boolean, curve: unknown): number;
    UnitPowerPercent?(this: void, unit: string, powerType: number, predicted: boolean, curve: unknown): number;
    UnitCastingDuration?(this: void, unit: string): object | undefined;
    UnitChannelDuration?(this: void, unit: string): object | undefined;
    UnitCastingInfo?(this: void, unit: string): wuiraNativeReturns<[
        string | undefined, string | undefined, number | undefined, number | undefined, number | undefined,
        boolean | undefined, string | undefined, boolean | undefined, number | undefined,
    ]>;
    UnitChannelInfo?(this: void, unit: string): wuiraNativeReturns<[
        string | undefined, string | undefined, number | undefined, number | undefined, number | undefined,
        boolean | undefined, boolean | undefined, number | undefined,
    ]>;
}

declare const _G: NativeApi;

function missing(name: string): never {
    error(name + ": this client does not expose " + name);
}

/** `GetNumGroupMembers`. The value is the group size, including the player. */
export class GetNumGroupMembers extends Source<number, []> {
    protected constructor() { super(0); }
    static { registerSource(GetNumGroupMembers, () => new GetNumGroupMembers()); }
    protected read(): number {
        const read = _G.GetNumGroupMembers;
        if (read === undefined) missing("GetNumGroupMembers");
        return read();
    }
}

/** `IsInRaid`. */
export class IsInRaid extends Source<boolean, []> {
    protected constructor() { super(false); }
    static { registerSource(IsInRaid, () => new IsInRaid()); }
    protected read(): boolean {
        const read = _G.IsInRaid;
        if (read === undefined) missing("IsInRaid");
        return read();
    }
}

/** `UnitGUID(unit)`. */
export class UnitGUID extends Source<string | undefined, [string]> {
    protected constructor(unit: string) { super(undefined, unit); }
    static { registerSource(UnitGUID, props => new UnitGUID(props[0] as string)); }
    protected read(props: [string]): string | undefined {
        const read = _G.UnitGUID;
        if (read === undefined) missing("UnitGUID");
        return read(props[0]);
    }
}

/** `UnitFullName(unit)`. Both native returns are kept. */
export class UnitFullName extends Source<UnitName, [string]> {
    protected constructor(unit: string) { super({ name: undefined, realm: undefined }, unit); }
    static { registerSource(UnitFullName, props => new UnitFullName(props[0] as string)); }
    protected override HasSecretFields(value: UnitName): boolean {
        return issecretvalue(value.name) || issecretvalue(value.realm);
    }
    protected read(props: [string]): UnitName {
        const read = _G.UnitFullName;
        if (read === undefined) missing("UnitFullName");
        const [name, realm] = read(props[0]);
        return { name, realm };
    }
}

/** `UnitExists(unit)`. */
export class UnitExists extends Source<boolean, [string]> {
    protected constructor(unit: string) { super(false, unit); }
    static { registerSource(UnitExists, props => new UnitExists(props[0] as string)); }
    protected read(props: [string]): boolean {
        const read = _G.UnitExists;
        if (read === undefined) missing("UnitExists");
        return read(props[0]);
    }
}

/** `GetRaidRosterInfo(index)`. One row. */
export class GetRaidRosterInfo extends Source<RaidRosterInfo, [number]> {
    protected constructor(index: number) { super({
        name: undefined, rank: undefined, subgroup: undefined, level: undefined, className: undefined,
        fileName: undefined, zone: undefined, online: undefined, isDead: undefined, role: undefined, isML: undefined,
    }, index); }
    static { registerSource(GetRaidRosterInfo, props => new GetRaidRosterInfo(props[0] as number)); }
    protected override HasSecretFields(value: RaidRosterInfo): boolean {
        return issecretvalue(value.name) || issecretvalue(value.rank) || issecretvalue(value.subgroup)
            || issecretvalue(value.level) || issecretvalue(value.className) || issecretvalue(value.fileName)
            || issecretvalue(value.zone) || issecretvalue(value.online) || issecretvalue(value.isDead)
            || issecretvalue(value.role) || issecretvalue(value.isML);
    }
    protected read(props: [number]): RaidRosterInfo {
        const read = _G.GetRaidRosterInfo;
        if (read === undefined) missing("GetRaidRosterInfo");
        const [name, rank, subgroup, level, className, fileName, zone, online, isDead, role, isML] = read(props[0]);
        return { name, rank, subgroup, level, className, fileName, zone, online, isDead, role, isML };
    }
}

/** `C_UnitAuras.GetAuraDataByIndex(unit, index, filter)`. One aura, or undefined when the index is past the end. */
export class GetAuraDataByIndex extends Source<AuraData | undefined, [string, number, string]> {
    protected constructor(unit: string, index: number, filter: string) { super(undefined, unit, index, filter); }
    static { registerSource(GetAuraDataByIndex, props => new GetAuraDataByIndex(props[0] as string, props[1] as number, props[2] as string)); }
    protected override HasSecretFields(value: AuraData | undefined): boolean {
        return value !== undefined && (issecretvalue(value.spellId) || issecretvalue(value.name) || issecretvalue(value.icon) || issecretvalue(value.sourceUnit));
    }
    protected read(props: [string, number, string]): AuraData | undefined {
        const read = C_UnitAuras?.GetAuraDataByIndex;
        if (read === undefined) missing("GetAuraDataByIndex");
        return read(props[0], props[1], props[2]);
    }
}

function readNumber(name: "UnitHealth" | "UnitHealthMax" | "UnitGetTotalAbsorbs" | "UnitGetIncomingHeals", unit: string): number {
    const read = _G[name];
    if (read === undefined) missing(name);
    return read(unit) ?? 0;
}

/** `UnitHealth(unit)`. */
export class UnitHealth extends Source<number, [string]> {
    protected constructor(unit: string) { super(0, unit); }
    static { registerSource(UnitHealth, props => new UnitHealth(props[0] as string)); }
    protected read(props: [string]): number { return readNumber("UnitHealth", props[0]); }
}

/** `UnitHealthMax(unit)`. */
export class UnitHealthMax extends Source<number, [string]> {
    protected constructor(unit: string) { super(0, unit); }
    static { registerSource(UnitHealthMax, props => new UnitHealthMax(props[0] as string)); }
    protected read(props: [string]): number { return readNumber("UnitHealthMax", props[0]); }
}

/** `UnitPower(unit, powerType)`. */
export class UnitPower extends Source<number, [string, number]> {
    protected constructor(unit: string, powerType: number) { super(0, unit, powerType); }
    static { registerSource(UnitPower, props => new UnitPower(props[0] as string, props[1] as number)); }
    protected read(props: [string, number]): number {
        const read = _G.UnitPower;
        if (read === undefined) missing("UnitPower");
        return read(props[0], props[1]);
    }
}

/** `UnitPowerMax(unit, powerType)`. */
export class UnitPowerMax extends Source<number, [string, number]> {
    protected constructor(unit: string, powerType: number) { super(0, unit, powerType); }
    static { registerSource(UnitPowerMax, props => new UnitPowerMax(props[0] as string, props[1] as number)); }
    protected read(props: [string, number]): number {
        const read = _G.UnitPowerMax;
        if (read === undefined) missing("UnitPowerMax");
        return read(props[0], props[1]);
    }
}

/** `UnitGetTotalAbsorbs(unit)`. */
export class UnitGetTotalAbsorbs extends Source<number, [string]> {
    protected constructor(unit: string) { super(0, unit); }
    static { registerSource(UnitGetTotalAbsorbs, props => new UnitGetTotalAbsorbs(props[0] as string)); }
    protected read(props: [string]): number { return readNumber("UnitGetTotalAbsorbs", props[0]); }
}

/** `UnitGetIncomingHeals(unit)`. */
export class UnitGetIncomingHeals extends Source<number, [string]> {
    protected constructor(unit: string) { super(0, unit); }
    static { registerSource(UnitGetIncomingHeals, props => new UnitGetIncomingHeals(props[0] as string)); }
    protected read(props: [string]): number { return readNumber("UnitGetIncomingHeals", props[0]); }
}

export interface UnitClassInfo {
    readonly name: string | undefined;
    readonly classFile: string | undefined;
    readonly classId: number | undefined;
}

/** `UnitClass(unit)`. */
export class UnitClass extends Source<UnitClassInfo, [string]> {
    protected constructor(unit: string) { super({ name: undefined, classFile: undefined, classId: undefined }, unit); }
    static { registerSource(UnitClass, props => new UnitClass(props[0] as string)); }
    protected override HasSecretFields(value: UnitClassInfo): boolean {
        return issecretvalue(value.name) || issecretvalue(value.classFile) || issecretvalue(value.classId);
    }
    protected read(props: [string]): UnitClassInfo {
        const read = _G.UnitClass;
        if (read === undefined) missing("UnitClass");
        const [name, classFile, classId] = read(props[0]);
        return { name, classFile, classId };
    }
}

/** `UnitIsPlayer(unit)`. */
export class UnitIsPlayer extends Source<boolean, [string]> {
    protected constructor(unit: string) { super(false, unit); }
    static { registerSource(UnitIsPlayer, props => new UnitIsPlayer(props[0] as string)); }
    protected read(props: [string]): boolean {
        const read = _G.UnitIsPlayer;
        if (read === undefined) missing("UnitIsPlayer");
        return read(props[0]);
    }
}

/** `UnitIsUnit(first, second)`. */
export class UnitIsUnit extends Source<boolean, [string, string]> {
    protected constructor(first: string, second: string) { super(false, first, second); }
    static { registerSource(UnitIsUnit, props => new UnitIsUnit(props[0] as string, props[1] as string)); }
    protected read(props: [string, string]): boolean {
        const read = _G.UnitIsUnit;
        if (read === undefined) missing("UnitIsUnit");
        return read(props[0], props[1]);
    }
}

/** `C_Spell.GetSpellName(spellId)`. */
export class GetSpellName extends Source<string | undefined, [number | string]> {
    protected constructor(spellId: number | string) { super(undefined, spellId); }
    static { registerSource(GetSpellName, props => new GetSpellName(props[0] as number | string)); }
    protected read(props: [number | string]): string | undefined {
        const read = C_Spell?.GetSpellName;
        if (read === undefined) missing("GetSpellName");
        return read(props[0]);
    }
}

/** `C_Spell.GetSpellTexture(spellId)`. */
export class GetSpellTexture extends Source<number | undefined, [number | string]> {
    protected constructor(spellId: number | string) { super(undefined, spellId); }
    static { registerSource(GetSpellTexture, props => new GetSpellTexture(props[0] as number | string)); }
    protected read(props: [number | string]): number | undefined {
        const read = C_Spell?.GetSpellTexture;
        if (read === undefined) missing("GetSpellTexture");
        return read(props[0]);
    }
}

/** Opaque duration object returned by `C_Spell.GetSpellCooldownDuration`. */
export interface SpellCooldownDuration { readonly __wuiraSpellCooldown: unique symbol; }

/** `C_Spell.GetSpellCooldownDuration(spellId, ignoreGCD)`. */
export class GetSpellCooldownDuration extends Source<SpellCooldownDuration | undefined, [number | string, boolean]> {
    protected constructor(spellId: number | string, ignoreGCD: boolean) { super(undefined, spellId, ignoreGCD); }
    static { registerSource(GetSpellCooldownDuration, props => new GetSpellCooldownDuration(props[0] as number | string, props[1] === true)); }
    protected read(props: [number | string, boolean]): SpellCooldownDuration | undefined {
        const read = C_Spell?.GetSpellCooldownDuration;
        if (read === undefined) missing("GetSpellCooldownDuration");
        return read(props[0], props[1]) as SpellCooldownDuration | undefined;
    }
}

/** `C_Spell.IsSpellPassive(spellId)`. */
export class IsSpellPassive extends Source<boolean | undefined, [number | string]> {
    protected constructor(spellId: number | string) { super(undefined, spellId); }
    static { registerSource(IsSpellPassive, props => new IsSpellPassive(props[0] as number | string)); }
    protected read(props: [number | string]): boolean | undefined {
        const read = C_Spell?.IsSpellPassive;
        if (read === undefined) missing("IsSpellPassive");
        return read(props[0]);
    }
}

/** `C_UnitAuras.GetAuraDataBySpellName(unit, name, filter)`. */
export class GetAuraDataBySpellName extends Source<wuiraNativeAuraData | undefined, [string, string, string]> {
    protected constructor(unit: string, name: string, filter: string) { super(undefined, unit, name, filter); }
    static { registerSource(GetAuraDataBySpellName, props => new GetAuraDataBySpellName(props[0] as string, props[1] as string, props[2] as string)); }
    protected read(props: [string, string, string]): wuiraNativeAuraData | undefined {
        const read = C_UnitAuras?.GetAuraDataBySpellName;
        if (read === undefined) missing("GetAuraDataBySpellName");
        return read(props[0], props[1], props[2]);
    }
}

export interface TotemInfo {
    readonly haveTotem: boolean | undefined;
    readonly name: string | undefined;
    readonly startTime: number | undefined;
    readonly duration: number | undefined;
    readonly icon: number | undefined;
    readonly modRate: number | undefined;
    readonly spellId: number | undefined;
}

/** `GetTotemInfo(slot)`. */
export class GetTotemInfo extends Source<TotemInfo, [number]> {
    protected constructor(slot: number) { super({
        haveTotem: undefined, name: undefined, startTime: undefined, duration: undefined, icon: undefined, modRate: undefined, spellId: undefined,
    }, slot); }
    static { registerSource(GetTotemInfo, props => new GetTotemInfo(props[0] as number)); }
    protected read(props: [number]): TotemInfo {
        const read = _G.GetTotemInfo;
        if (read === undefined) missing("GetTotemInfo");
        const [haveTotem, name, startTime, duration, icon, modRate, spellId] = read(props[0]);
        return { haveTotem, name, startTime, duration, icon, modRate, spellId };
    }
}

/** `GetNumTotemSlots`. */
export class GetNumTotemSlots extends Source<number, []> {
    protected constructor() { super(0); }
    static { registerSource(GetNumTotemSlots, () => new GetNumTotemSlots()); }
    protected read(): number {
        const read = _G.GetNumTotemSlots;
        if (read === undefined) missing("GetNumTotemSlots");
        return read();
    }
}

export interface EditModeLayoutRow { layoutName: string; layoutType: number; interfaceStyle?: number; }
export interface EditModeLayoutList { layouts: EditModeLayoutRow[]; activeLayout: number; }
declare const C_EditMode: { GetLayouts?: (this: void) => EditModeLayoutList | undefined } | undefined;

/** `C_EditMode.GetLayouts`. */
export class GetLayouts extends Source<EditModeLayoutList | undefined, []> {
    protected constructor() { super(undefined); }
    static { registerSource(GetLayouts, () => new GetLayouts()); }
    protected read(): EditModeLayoutList | undefined {
        const read = C_EditMode?.GetLayouts;
        if (read === undefined) missing("GetLayouts");
        return read();
    }
}

export interface SpecializationRow {
    readonly id: number | undefined;
    readonly name: string | undefined;
    readonly description: string | undefined;
    readonly icon: number | undefined;
    readonly role: string | undefined;
    readonly primaryStat: number | undefined;
    readonly pointsSpent: number | undefined;
}

declare const C_SpecializationInfo: {
    GetNumSpecializationsForClassID?: (this: void, classId: number) => number;
    GetSpecializationInfo?: (this: void, index: number, inspect: boolean, pet: boolean, unit?: string, sex?: number, group?: number, classId?: number) => wuiraNativeReturns<[
        number | undefined, string | undefined, string | undefined, number | undefined, string | undefined, number | undefined, number | undefined
    ]>;
} | undefined;

/** `C_SpecializationInfo.GetNumSpecializationsForClassID(classId)`. */
export class GetNumSpecializationsForClassID extends Source<number, [number]> {
    protected constructor(classId: number) { super(0, classId); }
    static { registerSource(GetNumSpecializationsForClassID, props => new GetNumSpecializationsForClassID(props[0] as number)); }
    protected read(props: [number]): number {
        const read = C_SpecializationInfo?.GetNumSpecializationsForClassID;
        if (read === undefined) missing("GetNumSpecializationsForClassID");
        return read(props[0]);
    }
}

/** `C_SpecializationInfo.GetSpecializationInfo`. One row. */
export class GetSpecializationInfo extends Source<SpecializationRow, [number, boolean, boolean, string | undefined, number | undefined, number | undefined, number | undefined]> {
    protected constructor(index: number, inspect: boolean, pet: boolean, unit?: string, sex?: number, group?: number, classId?: number) {
        super({ id: undefined, name: undefined, description: undefined, icon: undefined, role: undefined, primaryStat: undefined, pointsSpent: undefined }, index, inspect, pet, unit, sex, group, classId);
    }
    static { registerSource(GetSpecializationInfo, props => new GetSpecializationInfo(
        props[0] as number, props[1] === true, props[2] === true, props[3] as string | undefined,
        props[4] as number | undefined, props[5] as number | undefined, props[6] as number | undefined)); }
    protected read(props: [number, boolean, boolean, string | undefined, number | undefined, number | undefined, number | undefined]): SpecializationRow {
        const read = C_SpecializationInfo?.GetSpecializationInfo;
        if (read === undefined) missing("GetSpecializationInfo");
        const [id, name, description, icon, role, primaryStat, pointsSpent] = read(props[0], props[1], props[2], props[3], props[4], props[5], props[6]);
        return { id, name, description, icon, role, primaryStat, pointsSpent };
    }
}

/** `C_SpellBook.GetNumSpellBookSkillLines`. */
export class GetNumSpellBookSkillLines extends Source<number, []> {
    protected constructor() { super(0); }
    static { registerSource(GetNumSpellBookSkillLines, () => new GetNumSpellBookSkillLines()); }
    protected read(): number {
        const read = C_SpellBook?.GetNumSpellBookSkillLines;
        if (read === undefined) missing("GetNumSpellBookSkillLines");
        return read();
    }
}

/** `C_SpellBook.GetSpellBookItemInfo(slot, bank)`. */
export class GetSpellBookItemInfo extends Source<{ itemType: number; spellID?: number; name?: string; isOffSpec?: boolean; isPassive?: boolean } | undefined, [number, number]> {
    protected constructor(slot: number, bank: number) { super(undefined, slot, bank); }
    static { registerSource(GetSpellBookItemInfo, props => new GetSpellBookItemInfo(props[0] as number, props[1] as number)); }
    protected read(props: [number, number]) {
        const read = C_SpellBook?.GetSpellBookItemInfo;
        if (read === undefined) missing("GetSpellBookItemInfo");
        return read(props[0], props[1]);
    }
}

/** Opaque object returned by native duration calls. */
export interface NativeDurationHandle { readonly __wuiraNativeDuration: unique symbol; }

export interface SpellTabInfo {
    readonly name: string | undefined;
    readonly texture: number | undefined;
    readonly offset: number | undefined;
    readonly numSlots: number | undefined;
}

export interface SpellPowerCost { readonly type: number; readonly cost?: number; }

export interface SpellBookSkillLine {
    readonly itemIndexOffset: number;
    readonly numSpellBookItems: number;
}

export interface CastInfo {
    readonly name: string | undefined;
    readonly text: string | undefined;
    readonly texture: number | undefined;
    readonly startTimeMS: number | undefined;
    readonly endTimeMS: number | undefined;
    readonly isTradeSkill: boolean | undefined;
    readonly castID: string | undefined;
    readonly notInterruptible: boolean | undefined;
    readonly spellId: number | undefined;
}

export interface ChannelInfo {
    readonly name: string | undefined;
    readonly text: string | undefined;
    readonly texture: number | undefined;
    readonly startTimeMS: number | undefined;
    readonly endTimeMS: number | undefined;
    readonly isTradeSkill: boolean | undefined;
    readonly notInterruptible: boolean | undefined;
    readonly spellId: number | undefined;
}

function duration(value: object | undefined): NativeDurationHandle | undefined {
    return value as NativeDurationHandle | undefined;
}

/** `UnitHealthPercent(unit, predicted, curve)`. */
export class UnitHealthPercent extends Source<number, [string, boolean, unknown]> {
    protected constructor(unit: string, predicted: boolean, curve: unknown) { super(0, unit, predicted, curve); }
    static { registerSource(UnitHealthPercent, props => new UnitHealthPercent(props[0] as string, props[1] === true, props[2])); }
    protected read(props: [string, boolean, unknown]): number {
        const read = _G.UnitHealthPercent;
        if (read === undefined) missing("UnitHealthPercent");
        return read(props[0], props[1], props[2]);
    }
}

/** `UnitPowerPercent(unit, powerType, predicted, curve)`. */
export class UnitPowerPercent extends Source<number, [string, number, boolean, unknown]> {
    protected constructor(unit: string, powerType: number, predicted: boolean, curve: unknown) { super(0, unit, powerType, predicted, curve); }
    static { registerSource(UnitPowerPercent, props => new UnitPowerPercent(props[0] as string, props[1] as number, props[2] === true, props[3])); }
    protected read(props: [string, number, boolean, unknown]): number {
        const read = _G.UnitPowerPercent;
        if (read === undefined) missing("UnitPowerPercent");
        return read(props[0], props[1], props[2], props[3]);
    }
}

/** `UnitCastingDuration(unit)`. */
export class UnitCastingDuration extends Source<NativeDurationHandle | undefined, [string]> {
    protected constructor(unit: string) { super(undefined, unit); }
    static { registerSource(UnitCastingDuration, props => new UnitCastingDuration(props[0] as string)); }
    protected read(props: [string]): NativeDurationHandle | undefined {
        const read = _G.UnitCastingDuration;
        if (read === undefined) missing("UnitCastingDuration");
        return duration(read(props[0]));
    }
}

/** `UnitChannelDuration(unit)`. */
export class UnitChannelDuration extends Source<NativeDurationHandle | undefined, [string]> {
    protected constructor(unit: string) { super(undefined, unit); }
    static { registerSource(UnitChannelDuration, props => new UnitChannelDuration(props[0] as string)); }
    protected read(props: [string]): NativeDurationHandle | undefined {
        const read = _G.UnitChannelDuration;
        if (read === undefined) missing("UnitChannelDuration");
        return duration(read(props[0]));
    }
}

const emptyCast: CastInfo = {
    name: undefined, text: undefined, texture: undefined, startTimeMS: undefined, endTimeMS: undefined,
    isTradeSkill: undefined, castID: undefined, notInterruptible: undefined, spellId: undefined,
};

/** `UnitCastingInfo(unit)`. */
export class UnitCastingInfo extends Source<CastInfo, [string]> {
    protected constructor(unit: string) { super(emptyCast, unit); }
    static { registerSource(UnitCastingInfo, props => new UnitCastingInfo(props[0] as string)); }
    protected override HasSecretFields(value: CastInfo): boolean {
        return issecretvalue(value.name) || issecretvalue(value.text) || issecretvalue(value.texture)
            || issecretvalue(value.startTimeMS) || issecretvalue(value.endTimeMS) || issecretvalue(value.spellId);
    }
    protected read(props: [string]): CastInfo {
        const read = _G.UnitCastingInfo;
        if (read === undefined) missing("UnitCastingInfo");
        const [name, text, texture, startTimeMS, endTimeMS, isTradeSkill, castID, notInterruptible, spellId] = read(props[0]);
        return { name, text, texture, startTimeMS, endTimeMS, isTradeSkill, castID, notInterruptible, spellId };
    }
}

const emptyChannel: ChannelInfo = {
    name: undefined, text: undefined, texture: undefined, startTimeMS: undefined, endTimeMS: undefined,
    isTradeSkill: undefined, notInterruptible: undefined, spellId: undefined,
};

/** `UnitChannelInfo(unit)`. */
export class UnitChannelInfo extends Source<ChannelInfo, [string]> {
    protected constructor(unit: string) { super(emptyChannel, unit); }
    static { registerSource(UnitChannelInfo, props => new UnitChannelInfo(props[0] as string)); }
    protected override HasSecretFields(value: ChannelInfo): boolean {
        return issecretvalue(value.name) || issecretvalue(value.text) || issecretvalue(value.texture)
            || issecretvalue(value.startTimeMS) || issecretvalue(value.endTimeMS) || issecretvalue(value.spellId);
    }
    protected read(props: [string]): ChannelInfo {
        const read = _G.UnitChannelInfo;
        if (read === undefined) missing("UnitChannelInfo");
        const [name, text, texture, startTimeMS, endTimeMS, isTradeSkill, notInterruptible, spellId] = read(props[0]);
        return { name, text, texture, startTimeMS, endTimeMS, isTradeSkill, notInterruptible, spellId };
    }
}

/** `GetTotemDuration(slot)`. */
export class GetTotemDuration extends Source<NativeDurationHandle | undefined, [number]> {
    protected constructor(slot: number) { super(undefined, slot); }
    static { registerSource(GetTotemDuration, props => new GetTotemDuration(props[0] as number)); }
    protected read(props: [number]): NativeDurationHandle | undefined {
        const read = _G.GetTotemDuration;
        if (read === undefined) missing("GetTotemDuration");
        return duration(read(props[0]));
    }
}

/** `GetNumSpellTabs`. */
export class GetNumSpellTabs extends Source<number, []> {
    protected constructor() { super(0); }
    static { registerSource(GetNumSpellTabs, () => new GetNumSpellTabs()); }
    protected read(): number {
        const read = _G.GetNumSpellTabs;
        if (read === undefined) missing("GetNumSpellTabs");
        return read();
    }
}

/** `GetSpellTabInfo(tab)`. */
export class GetSpellTabInfo extends Source<SpellTabInfo, [number]> {
    protected constructor(tab: number) { super({ name: undefined, texture: undefined, offset: undefined, numSlots: undefined }, tab); }
    static { registerSource(GetSpellTabInfo, props => new GetSpellTabInfo(props[0] as number)); }
    protected read(props: [number]): SpellTabInfo {
        const read = _G.GetSpellTabInfo;
        if (read === undefined) missing("GetSpellTabInfo");
        const [name, texture, offset, numSlots] = read(props[0]);
        return { name, texture, offset, numSlots };
    }
}

/** `C_UnitAuras.GetAuraDuration(unit, spellId)`. */
export class GetAuraDuration extends Source<NativeDurationHandle | undefined, [string, number]> {
    protected constructor(unit: string, spellId: number) { super(undefined, unit, spellId); }
    static { registerSource(GetAuraDuration, props => new GetAuraDuration(props[0] as string, props[1] as number)); }
    protected read(props: [string, number]): NativeDurationHandle | undefined {
        const read = C_UnitAuras?.GetAuraDuration;
        if (read === undefined) missing("GetAuraDuration");
        return duration(read(props[0], props[1]));
    }
}

/** `C_Spell.GetSpellPowerCost(spellId)`. */
export class GetSpellPowerCost extends Source<SpellPowerCost[] | undefined, [number]> {
    protected constructor(spellId: number) { super(undefined, spellId); }
    static { registerSource(GetSpellPowerCost, props => new GetSpellPowerCost(props[0] as number)); }
    protected read(props: [number]): SpellPowerCost[] | undefined {
        const read = C_Spell?.GetSpellPowerCost;
        if (read === undefined) missing("GetSpellPowerCost");
        return read(props[0]);
    }
}

/** `C_SpellBook.GetSpellBookSkillLineInfo(line)`. */
export class GetSpellBookSkillLineInfo extends Source<SpellBookSkillLine | undefined, [number]> {
    protected constructor(line: number) { super(undefined, line); }
    static { registerSource(GetSpellBookSkillLineInfo, props => new GetSpellBookSkillLineInfo(props[0] as number)); }
    protected read(props: [number]): SpellBookSkillLine | undefined {
        const read = C_SpellBook?.GetSpellBookSkillLineInfo;
        if (read === undefined) missing("GetSpellBookSkillLineInfo");
        return read(props[0]);
    }
}
