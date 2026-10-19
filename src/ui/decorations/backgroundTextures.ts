import { backgroundTextures } from "../media/clientMedia";

export { backgroundTextures };
export type BackgroundTexture = keyof typeof backgroundTextures | { path: string };
