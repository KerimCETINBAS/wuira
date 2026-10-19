const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

test("CLI creates and builds a standalone empty-JSX addon", async () => {
  const { create, build } = await import("../cli/wuira.mjs");
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "wuira-cli-"));
  try {
    const library = spawnSync(process.execPath, [path.join(__dirname, "../tools/build-library.mjs")], { encoding: "utf8" });
    assert.equal(library.status, 0, library.stdout + library.stderr);
    assert.throws(() => create("../Bad", temp));
    const project = create("HelloAddon", temp);
    assert.throws(() => create("HelloAddon", temp));
    fs.mkdirSync(path.join(project, "node_modules"));
    const installed = path.join(project, "node_modules/wuira");
    fs.mkdirSync(installed);
    for (const directory of ["config", "tools", "lib"]) fs.cpSync(path.join(__dirname, "..", directory), path.join(installed, directory), { recursive: true });
    fs.copyFileSync(path.join(__dirname, "../package.json"), path.join(installed, "package.json"));
    assert.equal(JSON.parse(fs.readFileSync(path.join(project, "tsconfig.json"))).extends, "wuira/config/tsconfig.json");
    assert.ok(!fs.existsSync(path.join(project, "tools")));
    assert.ok(!fs.existsSync(path.join(project, "cli")));
    assert.ok(!fs.existsSync(path.join(project, "src/wuira")));
    await build(project);
    assert.ok(fs.existsSync(path.join(project, "LICENSE")));
    const toc = fs.readFileSync(path.join(project, "dist/HelloAddon.toc"), "utf8");
    const loads = toc.split(/\r?\n/).filter(line => line && !line.startsWith("#"))
      .map(file => `dofile(${JSON.stringify(file.replace(/\\/g, "/"))})`);
    const script = `function issecretvalue(value) return type(value) == "table" and rawget(value,"secret") == true end\nlocal messages = {}\nfunction print(message) table.insert(messages,message) end\nfunction CreateFrame() error("Empty JSX must not create a frame") end\n${loads.join("\n")}\nassert(#messages == 1 and string.find(messages[1], "HelloAddon loaded", 1, true))\nassert(__wuiraModules_HelloAddon ~= nil)\nconsole.warn("warning", 42)\nconsole.error("error")\nassert(#messages == 3)\n`;
    fs.writeFileSync(path.join(project, "verify.lua"), script);
    const result = spawnSync(process.execPath, [require.resolve("fengari-node-cli/src/lua-cli.js"), "../verify.lua"], { cwd: path.join(project, "dist"), encoding: "utf8" });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.stderr, "");
    fs.appendFileSync(path.join(project, "src/index.tsx"), `
import { Encoding, wuira, WuiraApp, Store as RootStore, StoreRegistry as RootStoreRegistry } from "wuira";
import { UI } from "wuira/ui";
import { Icons } from "wuira/icons";
import { BlizzardUI, ActionBars } from "wuira/platform";
import { Nameplates } from "wuira/skins";
import { SourceConverter, UseSource, UnitHealth, GetSpellName } from "wuira/datasources";
const currentApp: WuiraApp = Wuira.App;
if (currentApp !== Wuira.App || wuira !== Wuira) throw "Application accessor must remain stable";
import { PaladinSpells, MageSpells, RacialSpells, GeneralSpells, BindingActions } from "wuira/spells";
import { WarriorSpells } from "wuira/spells/WarriorSpells";
const constantHeal = PaladinSpells.HolyLight;
import { Cell, FlowLayout, ForEach, Window, ProgressBar, SecureButton, Button, FrameMover, KeybindCapture } from "wuira/ui";
const hp = UseSource(UnitHealth, "player");
const spellName = UseSource(GetSpellName, 635);
if (false) {
    const transformed = UseSource(SourceConverter, hp, value => value * 2);
    const output: number = transformed.Value;
    const named = UseSource(SourceConverter, spellName, value => value?.length ?? 0);
    // @ts-expect-error SourceConverter callback input types follow their source.
    UseSource(SourceConverter, UseSource(UnitHealth, "player"), value => value.length);
    named.Dispose(); transformed.Dispose();
    const nativeTexture: number = Icons.BlessingOfFreedom_135968;
    const platform: typeof ActionBars = ActionBars;
    const stock: typeof BlizzardUI = BlizzardUI;
    const plates: typeof Nameplates = Nameplates;
    // @ts-expect-error Icon names are generated from the verified catalog.
    Icons.NotARealForeverIcon;
    class MemorySettings extends RootStore { spellId = PaladinSpells.HolyLight; }
    const snapshot = new RootStoreRegistry().get(MemorySettings);
    const spellId: number = snapshot.spellId;
    const fireball: number = MageSpells.Fireball;
    const racial: number = RacialSpells.WillOfTheForsaken;
    const attack: number = GeneralSpells.Attack;
    const warrior: number = WarriorSpells.HeroicStrike;
    const movement: string = BindingActions.MOVEFORWARD;
    const encoded: string = Encoding.Encode({ spellId: 635, enabled: true });
    const decoded: unknown = Encoding.Decode(encoded);
    // @ts-expect-error Decoded data requires application validation.
    decoded.spellId;
    // @ts-expect-error Encoded input must be a string.
    Encoding.Decode({ spellId: 635 });
}
const view = <Cell width={160} height={24}><ProgressBar min={0} max={100} current={40} /></Cell>;
const repeated = <FlowLayout width={100} height={24} direction="horizontal">
    <Cell width={1} height={1} />
    <ForEach items={[10, 20]}>{(width, index) => <Cell width={width} height={index + 1} condition={width > 0} />}</ForEach>
    {[30, 40].map(width => <Cell width={width} height={1} />)}
</FlowLayout>;
if (repeated.children?.length !== 5 || (repeated.children[2].props as {width:number}).width !== 20) throw "ForEach expansion failed";
// @ts-expect-error Loop items must match the input array.
const invalidLoop = <ForEach items={[1]}>{(item: string) => <Cell />}</ForEach>;
// @ts-expect-error Conditions are booleans or boolean callbacks.
const invalidCondition = <Cell condition="yes" />;
const secureView = <SecureButton width={32} height={32} action={{type:"spell",spell:635,unit:"player"}}><Cell /></SecureButton>;
const slotView = <secureButton action={{type:"action",slot:25}} />;
if (false) {
    const window = new Window({width: 800, height: 600});
    window.Open(() => <Cell onMount={frame => window.BindDragHandle(frame)} />);
    window.Close();
    window.Dispose();
    const unregister = wuira.registerCommand("/hello", (...args: string[]) => console.log(...args));
    wuira.registerCommand("/optional", (...args) => console.log(args.at(0)?.toUpperCase()));
    unregister();
    // @ts-expect-error Command arguments are strings.
    wuira.registerCommand("/bad", (message: number) => console.log(message));
    const settingsButton = <Button onClick={() => console.log("settings")} onMount={frame => {
        const mover = new FrameMover(frame, {label: "Panel", onMove: position => console.log(position.x)});
        return () => mover.Dispose();
    }} />;
    const capture = new KeybindCapture(() => console.log("done"));
    capture.SetActive(false);
    capture.Dispose();
    // @ts-expect-error Key bindings are strings.
    const invalidBinding = <SecureButton binding={1} />;
}
if (secureView.kind !== "secureButton" || slotView.kind !== "secureButton") throw "Secure exports failed";
// @ts-expect-error Secure spell actions need a spell reference.
const invalidSecureAction = <SecureButton action={{type:"spell"}} />;
// @ts-expect-error A secure button must receive mouse input.
const invalidClickThrough = <SecureButton clickThrough />;
// @ts-expect-error Secure units must be static tokens, not callbacks.
const invalidSecureUnit = <SecureButton action={{type:"spell",spell:635,unit:() => "target"}} />;
if (view.kind !== "cell" || view.child?.kind !== "progress" || hp === undefined || spellName === undefined) throw "Public exports failed";
// @ts-expect-error Width must be a number or inherit.
const invalid = <Cell width="invalid" />;
import { Store, StoreRegistry } from "wuira/store";
class MemorySettings extends Store {
    CastSpellId = 1232;
}
const store = new StoreRegistry();
store.set(MemorySettings, settings => { settings.CastSpellId = 635; return settings; });
if (store.get(MemorySettings).CastSpellId !== 635) throw "Store update failed";
if (false) {
    // @ts-expect-error Snapshot properties are readonly.
    store.get(MemorySettings).CastSpellId = 10;
    // @ts-expect-error Updater must return the settings data.
    store.set(MemorySettings, settings => 123);
}
`);
    const external = path.join(temp, "GameAddOns/HelloAddon");
    fs.writeFileSync(path.join(project, "wuira.config.mjs"), `export default { name: "HelloAddon", outDir: ${JSON.stringify(external)} };`);
    await build(project);
    assert.ok(fs.existsSync(path.join(external, "HelloAddon.toc")));
    const emitted = fs.readFileSync(path.join(external, "index.lua"), "utf8");
    assert.match(emitted, /local constantHeal = 635/);
    assert.doesNotMatch(emitted, /require\([^)]*spells/);
    assert.doesNotMatch(fs.readFileSync(path.join(installed, "lib/index.lua"), "utf8"), /require\([^)]*spells/);
    assert.doesNotMatch(fs.readFileSync(path.join(installed, "lib/spells/PaladinSpells.lua"), "utf8"), /HolyLight/);
    const newLoads = fs.readFileSync(path.join(external, "HelloAddon.toc"), "utf8").split(/\r?\n/)
      .filter(line => line && !line.startsWith("#"))
      .map(file => `dofile(${JSON.stringify(file.replace(/\\/g, "/"))})`);
    fs.writeFileSync(path.join(project, "verify.lua"), script.replace(loads.join("\n"), newLoads.join("\n")));
    const externalResult = spawnSync(process.execPath, [require.resolve("fengari-node-cli/src/lua-cli.js"), path.join(project, "verify.lua")], { cwd: external, encoding: "utf8" });
    assert.equal(externalResult.stderr, "", externalResult.stdout + externalResult.stderr);
    assert.equal(externalResult.status, 0);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
