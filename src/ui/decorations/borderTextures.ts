import { borderTextures } from "../media/clientMedia";

export { borderTextures };
export type BorderTexture = keyof typeof borderTextures | { path: string; edgeSize: number };
