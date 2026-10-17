import { resolveUnit } from "../datasources/UnitSource";
import type { UnitInput } from "../datasources/UnitSource";
import type { CellProps } from "./Cell";
import { UI } from "./primitives/jsx";

/** A portrait texture plus a protected unit button. Resource widgets stay on their own frames. */
interface PortraitHost extends wuiraNativeFrame {
    IsVisible(): boolean;
    GetEffectiveScale(): number;
    GetEffectiveAlpha(): number;
    GetFrameStrata(): Parameters<wuiraNativeFrame["SetFrameStrata"]>[0];
}
declare function SetPortraitTexture(this: void, texture: wuiraNativeTexture, unit: string, disablePortraitMask?: boolean): void;

export function unitPortrait(props: Partial<CellProps>, input: UnitInput, crop?: readonly number[], preview = false) {
    if (issecretvalue(input) || typeof input === "string" && input.trim() === "") throw "Unit portrait requires a public unit token";
    const target = resolveUnit(input);
    return UI.createElement("cell", { ...props, clickThrough: true, onMount: (frame: wuiraNativeFrame) => {
        const host = frame as PortraitHost;
        const button = preview ? undefined : CreateFrame("Button", undefined, UIParent, "SecureActionButtonTemplate");
        const owner = button ?? host;
        const texture = owner.CreateTexture(undefined, "OVERLAY");
        texture.SetAllPoints(owner);
        let buttonUnit = target.Token;
        let stopUnit: (() => void) | undefined;
        let stopped = false, stopping = false, elapsed = 0;
        let lastX: number | undefined, lastY: number | undefined, lastWidth: number | undefined, lastHeight: number | undefined;
        let lastStrata: string | undefined, lastLevel: number | undefined, lastAlpha: number | undefined;
        const draw = () => {
            if (stopped || stopping) return;
            SetPortraitTexture(texture, target.Token, true);
            const uv = crop ?? [0, 1, 0, 1];
            texture.SetTexCoord(uv[0], uv[1], uv[2], uv[3]);
        };
        const cleanup = () => {
            if (stopped) return;
            stopped = true; stopUnit?.(); stopUnit = undefined;
            host.SetScript("OnUpdate", undefined);
            owner.UnregisterAllEvents(); owner.SetScript("OnEvent", undefined);
            if (button !== undefined) {
                button.SetAttribute("type1", undefined); button.SetAttribute("type2", undefined);
                button.EnableMouse(false); button.Hide();
            }
        };
        const sync = () => {
            if (button === undefined || stopped || stopping || InCombatLockdown()) return;
            if (buttonUnit !== target.Token) { button.SetAttribute("unit", target.Token); buttonUnit = target.Token; }
            if (!host.IsVisible()) { if (button.IsShown()) button.Hide(); return; }
            const [x, y] = host.GetCenter();
            if (x === undefined || y === undefined) return;
            const scale = host.GetEffectiveScale() / (UIParent as PortraitHost).GetEffectiveScale();
            const width = host.GetWidth() * scale, height = host.GetHeight() * scale;
            const cx = x * scale, cy = y * scale;
            if (cx !== lastX || cy !== lastY || width !== lastWidth || height !== lastHeight) {
                button.ClearAllPoints();
                button.SetPoint("CENTER", UIParent, "BOTTOMLEFT", cx, cy);
                button.SetSize(width, height);
                lastX = cx; lastY = cy; lastWidth = width; lastHeight = height;
            }
            const strata = host.GetFrameStrata(), level = host.GetFrameLevel() + 2, alpha = host.GetEffectiveAlpha();
            if (strata !== lastStrata) { button.SetFrameStrata(strata); lastStrata = strata; }
            if (level !== lastLevel) { button.SetFrameLevel(level); lastLevel = level; }
            if (alpha !== lastAlpha) { button.SetAlpha(alpha); lastAlpha = alpha; }
            if (!button.IsShown()) button.Show();
        };
        try {
            if (button !== undefined) {
                button.RegisterForClicks("LeftButtonUp", "RightButtonUp");
                button.SetID(0); button.SetAttribute("useOnKeyDown", false);
                button.SetAttribute("unit", target.Token);
                button.SetAttribute("type1", "target"); button.SetAttribute("type2", "togglemenu");
                button.EnableMouse(true);
                host.SetScript("OnUpdate", (_frame, delta) => {
                    elapsed += delta;
                    if (elapsed >= .05) { elapsed = 0; sync(); }
                });
                host.HookScript("OnShow", sync); host.HookScript("OnHide", sync);
                owner.RegisterEvent("PLAYER_REGEN_ENABLED");
            }
            for (const event of ["UNIT_PORTRAIT_UPDATE", "UNIT_MODEL_CHANGED", "PORTRAITS_UPDATED", "PLAYER_ENTERING_WORLD"]) owner.RegisterEvent(event);
            if (target.Token.includes("target")) owner.RegisterEvent("PLAYER_TARGET_CHANGED");
            if (target.Token.includes("focus")) owner.RegisterEvent("PLAYER_FOCUS_CHANGED");
            owner.SetScript("OnEvent", (_frame, event, eventUnit) => {
                if (event === "PLAYER_REGEN_ENABLED") {
                    if (stopping) cleanup(); else sync();
                } else if (event !== "UNIT_PORTRAIT_UPDATE" && event !== "UNIT_MODEL_CHANGED" || eventUnit === target.Token) draw();
            });
            stopUnit = target.onTokenChange(() => { draw(); sync(); });
            draw(); sync();
        } catch (failure) { cleanup(); throw failure; }
        return () => {
            stopping = true;
            if (button !== undefined && InCombatLockdown()) return;
            cleanup();
        };
    } });
}
