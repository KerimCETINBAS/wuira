export type OverlayGlowKind = "buttonOverlay" | "Pixel" | "ACShine" | "Proc";

export interface OverlayGlowOptions {
    kind: OverlayGlowKind;
    color?: { r: number; g: number; b: number; a?: number };
    lines?: number;
    frequency?: number;
    length?: number;
    thickness?: number;
    scale?: number;
    border?: boolean;
    x?: number;
    y?: number;
    duration?: number;
}

function finite(value: number | undefined, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function count(value: number | undefined, fallback: number, limit: number): number {
    const number = Math.floor(finite(value, fallback));
    if (number < 1) return 1;
    return number > limit ? limit : number;
}

function quad(parent: wuiraNativeFrame): wuiraNativeTexture {
    const texture = parent.CreateTexture(undefined, "OVERLAY");
    if (texture.SetColorTexture !== undefined) texture.SetColorTexture(1, 1, 1, 1);
    else texture.SetTexture("Interface\\Buttons\\WHITE8X8");
    texture.SetBlendMode("ADD");
    return texture;
}

/** Additive overlay. Addon code cannot install a shader, so each style is drawn with colored textures. */
export function startOverlayGlow(frame: wuiraNativeFrame, options: OverlayGlowOptions): () => void {
    const kind = options.kind;
    if (kind !== "buttonOverlay" && kind !== "Pixel" && kind !== "ACShine" && kind !== "Proc") return () => {};
    let host: wuiraNativeFrame;
    try { host = CreateFrame("Frame", undefined, frame); }
    catch { return () => {}; }
    host.SetAllPoints(frame);
    const level = frame.GetFrameLevel();
    if (typeof level === "number") host.SetFrameLevel(level + 6);
    host.EnableMouse(false);
    host.Show();
    const color = options.color;
    const red = finite(color?.r, 0.95);
    const green = finite(color?.g, 0.95);
    const blue = finite(color?.b, 0.32);
    const alpha = finite(color?.a, 1);
    const frequency = finite(options.frequency, 0.25);
    const xOffset = finite(options.x, 0);
    const yOffset = finite(options.y, 0);
    const pieces: wuiraNativeTexture[] = [];
    let phase = 0;
    let running = true;
    const paint = (texture: wuiraNativeTexture, amount: number) => texture.SetVertexColor(red, green, blue, alpha * amount);
    if (kind === "buttonOverlay") {
        const thickness = Math.max(1, finite(options.thickness, 3));
        for (let index = 0; index < 4; index += 1) pieces.push(quad(host));
        host.SetScript("OnUpdate", (_host, elapsed) => {
            if (!running) return;
            phase += elapsed * frequency;
            const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(phase * 6.28318));
            const width = host.GetWidth();
            const height = host.GetHeight();
            if (width <= 0 || height <= 0) return;
            const top = pieces[0], bottom = pieces[1], left = pieces[2], right = pieces[3];
            top.ClearAllPoints(); top.SetSize(width + xOffset * 2, thickness); top.SetPoint("TOPLEFT", host, "TOPLEFT", -xOffset, yOffset);
            bottom.ClearAllPoints(); bottom.SetSize(width + xOffset * 2, thickness); bottom.SetPoint("BOTTOMLEFT", host, "BOTTOMLEFT", -xOffset, -yOffset);
            left.ClearAllPoints(); left.SetSize(thickness, height); left.SetPoint("TOPLEFT", host, "TOPLEFT", -xOffset, yOffset);
            right.ClearAllPoints(); right.SetSize(thickness, height); right.SetPoint("TOPRIGHT", host, "TOPRIGHT", xOffset, yOffset);
            for (const texture of pieces) paint(texture, pulse);
        });
    } else if (kind === "Pixel") {
        const lines = count(options.lines, 8, 24);
        const length = Math.max(2, finite(options.length, 10));
        const thickness = Math.max(1, finite(options.thickness, 2));
        for (let index = 0; index < lines; index += 1) pieces.push(quad(host));
        const edges = options.border === true ? [quad(host), quad(host), quad(host), quad(host)] : [];
        host.SetScript("OnUpdate", (_host, elapsed) => {
            if (!running) return;
            phase += elapsed * frequency;
            const width = host.GetWidth() + xOffset * 2;
            const height = host.GetHeight() + yOffset * 2;
            const perimeter = (width + height) * 2;
            if (perimeter <= 0) return;
            if (edges.length === 4) {
                const edge = Math.max(1, thickness);
                edges[0].ClearAllPoints(); edges[0].SetSize(width, edge); edges[0].SetPoint("TOPLEFT", host, "TOPLEFT", -xOffset, yOffset);
                edges[1].ClearAllPoints(); edges[1].SetSize(width, edge); edges[1].SetPoint("BOTTOMLEFT", host, "BOTTOMLEFT", -xOffset, -yOffset);
                edges[2].ClearAllPoints(); edges[2].SetSize(edge, height); edges[2].SetPoint("TOPLEFT", host, "TOPLEFT", -xOffset, yOffset);
                edges[3].ClearAllPoints(); edges[3].SetSize(edge, height); edges[3].SetPoint("TOPRIGHT", host, "TOPRIGHT", xOffset, yOffset);
                for (const texture of edges) paint(texture, 0.35);
            }
            for (let index = 0; index < lines; index += 1) {
                const distance = (((phase + index / lines) % 1) + 1) % 1 * perimeter;
                let x = 0, y = 0, horizontal = true;
                if (distance <= width) { x = distance; y = 0; horizontal = true; }
                else if (distance <= width + height) { x = width; y = distance - width; horizontal = false; }
                else if (distance <= width * 2 + height) { x = width - (distance - width - height); y = height; horizontal = true; }
                else { x = 0; y = height - (distance - width * 2 - height); horizontal = false; }
                const texture = pieces[index];
                texture.ClearAllPoints();
                texture.SetSize(horizontal ? length : thickness, horizontal ? thickness : length);
                texture.SetPoint("CENTER", host, "TOPLEFT", x - xOffset, -(y - yOffset));
                paint(texture, 1);
            }
        });
    } else if (kind === "ACShine") {
        const lines = count(options.lines, 4, 16);
        const scale = Math.max(0.2, finite(options.scale, 1));
        const size = 6 * scale;
        for (let index = 0; index < lines; index += 1) pieces.push(quad(host));
        host.SetScript("OnUpdate", (_host, elapsed) => {
            if (!running) return;
            phase += elapsed * frequency;
            const radiusX = host.GetWidth() / 2 + xOffset;
            const radiusY = host.GetHeight() / 2 + yOffset;
            if (radiusX === 0 && radiusY === 0) return;
            for (let index = 0; index < lines; index += 1) {
                const angle = phase * 6.28318 + index * 6.28318 / lines;
                const spark = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(angle * 2));
                const texture = pieces[index];
                texture.ClearAllPoints();
                texture.SetSize(size, size);
                texture.SetPoint("CENTER", host, "CENTER", Math.cos(angle) * radiusX, Math.sin(angle) * radiusY);
                paint(texture, spark);
            }
        });
    } else {
        const duration = Math.max(0.2, finite(options.duration, 1));
        const burst = quad(host);
        pieces.push(burst);
        host.SetScript("OnUpdate", (_host, elapsed) => {
            if (!running) return;
            phase += elapsed;
            const cycle = (phase % duration) / duration;
            const width = host.GetWidth();
            const height = host.GetHeight();
            if (width <= 0 || height <= 0) return;
            const grow = 0.85 + cycle * 0.5;
            burst.ClearAllPoints();
            burst.SetSize((width + xOffset * 2) * grow, (height + yOffset * 2) * grow);
            burst.SetPoint("CENTER", host, "CENTER", 0, 0);
            paint(burst, 1 - cycle);
        });
    }
    return () => {
        running = false;
        host.SetScript("OnUpdate", undefined);
        for (const texture of pieces) texture.Hide();
        host.Hide();
    };
}
