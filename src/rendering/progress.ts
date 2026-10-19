import type { IProgressBar } from "../ui/ProgressBar";
import { applyStatusBarTexture, resolveStatusBarTexture } from "../ui/decorations/statusBarTextures";
import type { MountedTree, RenderedCell } from "./types";

export function renderProgress(item: RenderedCell, tree: MountedTree, onActiveChange: (active: boolean) => void): void {
    const props = (item.cell as IProgressBar).props;
    const bar = item.frame as wuiraNativeStatusBar;
    const color = props.foreground?.color ?? props.color;
    applyStatusBarTexture(bar, resolveStatusBarTexture(props.foreground?.texture ?? props.texture ?? "solid"));
    bar.SetStatusBarColor(color?.r ?? 1, color?.g ?? 1, color?.b ?? 1, color?.a ?? 1);
    if (props.foreground !== undefined) {
        const fill = bar.GetStatusBarTexture();
        fill.SetHorizTile(props.foreground.tileX ?? false);
        fill.SetVertTile(props.foreground.tileY ?? false);
        fill.SetBlendMode(props.foreground.blendMode ?? "BLEND");
        const uv = props.foreground.texCoords ?? [0, 1, 0, 1];
        fill.SetTexCoord(uv[0], uv[1], uv[2], uv[3]);
    }
    bar.SetOrientation(props.orientation === "vertical" ? "VERTICAL" : "HORIZONTAL");
    bar.SetReverseFill(props.reverse ?? false);
    bar.SetMinMaxValues(props.min ?? 0, props.max ?? 100);
    const source = item.cell.source ?? props.source;
    if (source !== undefined && "BindTo" in source) {
        const dispose = source.BindTo(bar, {
            min: props.min, max: props.max, current: props.current ?? props.value, onActiveChange,
        });
        if (dispose !== undefined) tree.bindings.push(dispose);
    } else if (source === undefined) {
        bar.SetValue(props.current ?? props.value ?? 0);
    }
}
