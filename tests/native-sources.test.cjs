const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), cp = require("node:child_process");

test("native sources read one Blizzard call and helpers stay outside the source layer", () => {
    const root = path.join(__dirname, "../src");
    const files = {};
    for (const name of ["DataSource", "Source", "NativeApi"]) files[name + ".ts"] = fs.readFileSync(path.join(root, "datasources", name + ".ts"), "utf8");
    files["Range.ts"] = fs.readFileSync(path.join(root, "helpers/Range.ts"), "utf8");
    files["Auras.ts"] = fs.readFileSync(path.join(root, "helpers/Auras.ts"), "utf8").replace("../datasources/NativeApi", "./NativeApi");
    files["globals.d.ts"] = `
declare function issecretvalue(this:void,value:unknown):boolean;
declare function error(this:void,message:string):never;
declare function assert(this:void,value:unknown,message?:string):void;
type wuiraNativeReturns<T extends unknown[]> = T & { readonly __tstlMultiReturn: unknown };
interface wuiraNativeAuraData { name?: string; icon?: number; }
declare const C_UnitAuras: {
    GetAuraDataByIndex?: (this: void, unit: string, index: number, filter: string) => { spellId: number; name: string; icon: number; sourceUnit?: string } | undefined;
    GetAuraDataBySpellName?: (this: void, unit: string, name: string, filter: string) => wuiraNativeAuraData | undefined;
    GetAuraDuration?: (this: void, unit: string, id: number) => object | undefined;
} | undefined;
declare const C_Spell: {
    GetSpellName?: (this: void, id: number | string) => string | undefined;
    GetSpellTexture?: (this: void, id: number | string) => number | undefined;
    GetSpellCooldownDuration?: (this: void, id: number | string, ignoreGCD?: boolean) => object | undefined;
    IsSpellPassive?: (this: void, id: number | string) => boolean;
    GetSpellPowerCost?: (this: void, id: number) => { type: number; cost?: number }[] | undefined;
} | undefined;
declare const C_SpellBook: {
    GetNumSpellBookSkillLines?: (this: void) => number;
    GetSpellBookItemInfo?: (this: void, slot: number, bank: number) => { itemType: number; spellID?: number; name?: string; isOffSpec?: boolean; isPassive?: boolean } | undefined;
    GetSpellBookSkillLineInfo?: (this: void, line: number) => { itemIndexOffset: number; numSpellBookItems: number } | undefined;
} | undefined;
`;
    files["main.ts"] = `
import { UseSource } from "./Source";
import { GetAuraDataByIndex, GetNumGroupMembers, GetRaidRosterInfo, IsInRaid, UnitExists, UnitFullName, UnitGUID } from "./NativeApi";
import { Range } from "./Range";
import { FilterAura, ReadAuras } from "./Auras";
const indexes = Range(1, 5);
let text = "";
for (const value of indexes) text += String(value);
assert(text === "12345" && Range(1, 0).length === 0, "Range includes both ends");
const count = UseSource(GetNumGroupMembers);
const raid = UseSource(IsInRaid);
assert(count.Value === 5 && raid.Value === false);
assert(UseSource(UnitGUID, "player").Value === "Player-1");
const named = UseSource(UnitFullName, "player").Value;
assert(named.name === "Ada" && named.realm === "Realm");
assert(UseSource(UnitExists, "pet").Value === true);
const row = UseSource(GetRaidRosterInfo, 2).Value;
assert(row.name === "Ada" && row.subgroup === 3 && row.rank === 1);
const aura = UseSource(GetAuraDataByIndex, "target", 1, "HELPFUL").Value;
assert(aura !== undefined && aura.name === "Fortitude" && UseSource(GetAuraDataByIndex, "target", 2, "HELPFUL").Value === undefined);
const auras = ReadAuras("target", "HELPFUL");
assert(FilterAura(auras, "Fortitude") && FilterAura(auras, 1243) && !FilterAura(auras, "Missing"));
export const passed = true;
`;
    const result = require("typescript-to-lua").transpileVirtualProject(files, { luaTarget: "5.1", luaLibImport: "inline", strict: true, types: [] });
    assert.deepEqual(result.diagnostics.map(d => String(d.messageText)), []);
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "wuira-native-"));
    try {
        for (const file of result.transpiledFiles) fs.writeFileSync(path.join(temp, path.basename(file.outPath)), file.lua);
        fs.writeFileSync(path.join(temp, "check.lua"), `
function issecretvalue() return false end
function GetNumGroupMembers() return 5 end
function IsInRaid() return false end
function UnitGUID(unit) assert(unit == "player"); return "Player-1" end
function UnitFullName(unit) assert(unit == "player"); return "Ada", "Realm" end
function UnitExists(unit) assert(unit == "pet"); return true end
function GetRaidRosterInfo(index)
  assert(index == 2)
  return "Ada", 1, 3, 60, "Paladin", "PALADIN", "Stormwind", true, false, "HEALER", false
end
C_UnitAuras = { GetAuraDataByIndex = function(unit, index, filter)
  assert(unit == "target" and filter == "HELPFUL")
  if index == 1 then return { spellId = 1243, name = "Fortitude", icon = 9 } end
  return nil
end }
assert(require("main").passed)
`);
        const run = cp.spawnSync(process.execPath, [require.resolve("fengari-node-cli/src/lua-cli.js"), "check.lua"], { cwd: temp, encoding: "utf8" });
        assert.equal(run.status, 0, run.stdout + run.stderr);
        assert.equal(run.stderr, "");
    } finally { assert.equal(path.dirname(temp), path.resolve(os.tmpdir())); fs.rmSync(temp, { recursive: true, force: true }); }
});
