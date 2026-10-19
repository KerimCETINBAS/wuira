export { progressTextures as statusBarTextures } from "../media/clientMedia";
import { progressTextures } from "../media/clientMedia";

function fileId(value: string): number | undefined {
    if (value.length === 0) return undefined;
    let index = 0;
    while (index < value.length) {
        const code = value.charCodeAt(index);
        if (code < 48 || code > 57) return undefined;
        index++;
    }
    return Number(value);
}

declare function GetAtlasInfo(this: void, atlas: string): unknown;

/** Accepts a catalog name, a texture path, a status-bar atlas, or a numeric client file id. */
export function resolveStatusBarTexture(texture: string): string | number {
    const preset = progressTextures[texture as keyof typeof progressTextures];
    if (preset !== undefined) return preset.path;
    return fileId(texture) ?? texture;
}

declare const C_Texture: { GetAtlasInfo?(this: void, atlas: string): unknown } | undefined;

function isAtlas(name: string): boolean {
    if (typeof GetAtlasInfo === "function" && GetAtlasInfo(name) !== undefined) return true;
    const textures = C_Texture;
    return textures !== undefined && textures.GetAtlasInfo !== undefined && textures.GetAtlasInfo(name) !== undefined;
}

/** Power-bar entries from the client are atlases. A file path stays on SetStatusBarTexture. */
export function applyStatusBarTexture(bar: wuiraNativeStatusBar, texture: string | number): void {
    if (typeof texture === "string" && isAtlas(texture)) {
        bar.SetStatusBarTexture("Interface\\Buttons\\WHITE8X8");
        const fill = bar.GetStatusBarTexture();
        if (fill !== undefined && fill.SetAtlas !== undefined) fill.SetAtlas(texture);
        return;
    }
    bar.SetStatusBarTexture(texture);
}
