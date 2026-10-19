import type { NativeDuration, TimerSource } from "./TimerSource";
import type { TextureSource } from "./TextureSource";
import type { SourceConverter, ValueSource } from "./SourceConverter";
import type { NativeNumberSource } from "./NativeNumberSource";
import type {
    GetAuraDataByIndex, GetAuraDataBySpellName, GetAuraDuration, GetLayouts, GetNumGroupMembers, GetNumSpellBookSkillLines,
    GetNumSpecializationsForClassID, GetNumSpellTabs, GetNumTotemSlots, GetRaidRosterInfo, GetSpecializationInfo, GetSpellBookItemInfo,
    GetSpellBookSkillLineInfo, GetSpellCooldownDuration, GetSpellName, GetSpellPowerCost, GetSpellTabInfo, GetSpellTexture, GetTotemDuration, GetTotemInfo, IsInRaid, IsSpellPassive, UnitCastingDuration, UnitCastingInfo, UnitChannelDuration, UnitChannelInfo, UnitClass,
    UnitExists, UnitFullName, UnitGUID, UnitGetIncomingHeals, UnitGetTotalAbsorbs, UnitHealth, UnitHealthMax, UnitHealthPercent,
    UnitIsPlayer, UnitIsUnit, UnitPower, UnitPowerMax, UnitPowerPercent,
} from "./NativeApi";
import { openSource } from "./Source";

export function UseSource(source: typeof GetNumGroupMembers): GetNumGroupMembers;
export function UseSource(source: typeof IsInRaid): IsInRaid;
export function UseSource(source: typeof UnitGUID, unit: string): UnitGUID;
export function UseSource(source: typeof UnitFullName, unit: string): UnitFullName;
export function UseSource(source: typeof UnitExists, unit: string): UnitExists;
export function UseSource(source: typeof GetRaidRosterInfo, index: number): GetRaidRosterInfo;
export function UseSource(source: typeof GetAuraDataByIndex, unit: string, index: number, filter: string): GetAuraDataByIndex;
export function UseSource(source: typeof GetAuraDataBySpellName, unit: string, name: string, filter: string): GetAuraDataBySpellName;
export function UseSource(source: typeof UnitHealth, unit: string): UnitHealth;
export function UseSource(source: typeof UnitHealthMax, unit: string): UnitHealthMax;
export function UseSource(source: typeof UnitPower, unit: string, powerType: number): UnitPower;
export function UseSource(source: typeof UnitPowerMax, unit: string, powerType: number): UnitPowerMax;
export function UseSource(source: typeof UnitGetTotalAbsorbs, unit: string): UnitGetTotalAbsorbs;
export function UseSource(source: typeof UnitGetIncomingHeals, unit: string): UnitGetIncomingHeals;
export function UseSource(source: typeof UnitClass, unit: string): UnitClass;
export function UseSource(source: typeof UnitIsPlayer, unit: string): UnitIsPlayer;
export function UseSource(source: typeof UnitIsUnit, first: string, second: string): UnitIsUnit;
export function UseSource(source: typeof GetSpellName, spellId: number | string): GetSpellName;
export function UseSource(source: typeof GetSpellTexture, spellId: number | string): GetSpellTexture;
export function UseSource(source: typeof GetSpellCooldownDuration, spellId: number | string, ignoreGCD?: boolean): GetSpellCooldownDuration;
export function UseSource(source: typeof IsSpellPassive, spellId: number | string): IsSpellPassive;
export function UseSource(source: typeof GetTotemInfo, slot: number): GetTotemInfo;
export function UseSource(source: typeof GetNumTotemSlots): GetNumTotemSlots;
export function UseSource(source: typeof GetLayouts): GetLayouts;
export function UseSource(source: typeof GetNumSpecializationsForClassID, classId: number): GetNumSpecializationsForClassID;
export function UseSource(source: typeof GetSpecializationInfo, index: number, inspect?: boolean, pet?: boolean, unit?: string, sex?: number, group?: number, classId?: number): GetSpecializationInfo;
export function UseSource(source: typeof GetNumSpellBookSkillLines): GetNumSpellBookSkillLines;
export function UseSource(source: typeof GetSpellBookItemInfo, slot: number, bank: number): GetSpellBookItemInfo;
export function UseSource(source: typeof UnitHealthPercent, unit: string, predicted: boolean, curve: unknown): UnitHealthPercent;
export function UseSource(source: typeof UnitPowerPercent, unit: string, powerType: number, predicted: boolean, curve: unknown): UnitPowerPercent;
export function UseSource(source: typeof UnitCastingDuration, unit: string): UnitCastingDuration;
export function UseSource(source: typeof UnitChannelDuration, unit: string): UnitChannelDuration;
export function UseSource(source: typeof UnitCastingInfo, unit: string): UnitCastingInfo;
export function UseSource(source: typeof UnitChannelInfo, unit: string): UnitChannelInfo;
export function UseSource(source: typeof GetTotemDuration, slot: number): GetTotemDuration;
export function UseSource(source: typeof GetNumSpellTabs): GetNumSpellTabs;
export function UseSource(source: typeof GetSpellTabInfo, tab: number): GetSpellTabInfo;
export function UseSource(source: typeof GetAuraDuration, unit: string, spellId: number): GetAuraDuration;
export function UseSource(source: typeof GetSpellPowerCost, spellId: number): GetSpellPowerCost;
export function UseSource(source: typeof GetSpellBookSkillLineInfo, line: number): GetSpellBookSkillLineInfo;
export function UseSource(source: typeof TimerSource, read: () => NativeDuration | undefined, events: readonly string[], unit?: string): TimerSource;
export function UseSource(source: typeof TextureSource, read: () => string | number | undefined, events: readonly string[], unit?: string): TextureSource;
export function UseSource<TInput, TOutput>(source: typeof SourceConverter, input: ValueSource<TInput>, convert: (value: TInput) => TOutput): SourceConverter<TInput, TOutput>;
export function UseSource(source: typeof NativeNumberSource, read: () => number): NativeNumberSource;
export function UseSource(source: { prototype: unknown }, ...props: unknown[]): unknown {
    return openSource(source as Function, props);
}
