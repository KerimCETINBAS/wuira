import type { FlowLayoutProps } from "../FlowLayout";

export interface FlowChild {
    width: number;
    height: number;
    anchor?: string;
}

function axisFraction(anchor: string | undefined, axis: "x" | "y", fallback: number): number {
    if (anchor === undefined || anchor === "") return fallback;
    if (axis === "x") {
        if (anchor.includes("LEFT")) return 0;
        if (anchor.includes("RIGHT")) return 1;
        return 0.5;
    }
    if (anchor.includes("TOP")) return 0;
    if (anchor.includes("BOTTOM")) return 1;
    return 0.5;
}

/** Horizontal space is columnGap. Vertical space is rowGap. Older gap and lineGap fill whichever axis is unset. */
export function flowSpacing(direction: string | undefined, props: { gap?: number; lineGap?: number; columnGap?: number; rowGap?: number }): { main: number; cross: number } {
    const horizontal = direction === "horizontal" || direction === "ltr" || direction === "rtl" || direction === "horizontalReverse";
    const gap = props.gap ?? 0;
    const lineGap = props.lineGap ?? gap;
    const column = props.columnGap ?? (horizontal ? gap : lineGap);
    const row = props.rowGap ?? (horizontal ? lineGap : gap);
    if (column < 0 || row < 0) error("FlowLayout gaps must be non-negative");
    return horizontal ? { main: column, cross: row } : { main: row, cross: column };
}

function flowAxis(direction: string | undefined): { horizontal: boolean; reverse: boolean } {
    const horizontal = direction === "horizontal" || direction === "ltr" || direction === "rtl" || direction === "horizontalReverse";
    const reverse = direction === "rtl" || direction === "btt" || direction === "horizontalReverse" || direction === "verticalReverse";
    return { horizontal, reverse };
}

function fraction(value: string | undefined, center: string, end: string): number {
    if (value === center) return 0.5;
    if (value === end) return 1;
    return 0;
}

/** Pack children along one direction, then place the group and each child separately. */
export function calculateFlow(props: FlowLayoutProps & { width: number; height: number }, children: readonly FlowChild[]): { x: number; y: number }[] {
    const { horizontal, reverse } = flowAxis(props.direction);
    const requestedLimit = horizontal ? props.width : props.height;
    const limit = props.sizing === "content" && requestedLimit === 0 ? Infinity : requestedLimit;
    const spacing = flowSpacing(props.direction, props);
    const gap = spacing.main;
    const lineGap = spacing.cross;
    const mainJustify = (horizontal && props.alignX === undefined) || (!horizontal && props.alignY === undefined) ? props.justify : undefined;
    const alignX = fraction(props.alignX ?? (horizontal && mainJustify === "center" ? "center" : horizontal && mainJustify === "end" ? "right" : undefined), "center", "right");
    const alignY = fraction(props.alignY ?? (!horizontal && mainJustify === "center" ? "center" : !horizontal && mainJustify === "end" ? "bottom" : undefined), "center", "bottom");
    interface Item { index: number; main: number; mainSize: number; crossSize: number; width: number; height: number; anchor?: string }
    interface Line { items: Item[]; mainSize: number; crossSize: number }
    const lines: Line[] = [];
    let line: Line = { items: [], mainSize: 0, crossSize: 0 };
    for (let index = 0; index < children.length; index += 1) {
        const child = children[index];
        const mainSize = horizontal ? child.width : child.height;
        const crossSize = horizontal ? child.height : child.width;
        const next = line.items.length === 0 ? 0 : line.mainSize + gap;
        if (props.grow && line.items.length > 0 && next + mainSize > limit) {
            lines.push(line);
            line = { items: [], mainSize: 0, crossSize: 0 };
        }
        const main = line.items.length === 0 ? 0 : line.mainSize + gap;
        line.items.push({ index, main, mainSize, crossSize, width: child.width, height: child.height, anchor: child.anchor });
        line.mainSize = main + mainSize;
        line.crossSize = Math.max(line.crossSize, crossSize);
    }
    if (line.items.length > 0) lines.push(line);
    let packCross = 0;
    let packMain = 0;
    for (let index = 0; index < lines.length; index += 1) {
        packMain = Math.max(packMain, lines[index].mainSize);
        packCross += lines[index].crossSize;
        if (index < lines.length - 1) packCross += lineGap;
    }
    const mainBox = horizontal
        ? props.sizing === "content" && props.width === 0 ? packMain : props.width
        : props.sizing === "content" && props.height === 0 ? packMain : props.height;
    const crossBox = horizontal
        ? props.sizing === "content" && props.height === 0 ? packCross : props.height
        : props.sizing === "content" && props.width === 0 ? packCross : props.width;
    const mainFraction = horizontal ? alignX : alignY;
    const crossFraction = horizontal ? alignY : alignX;
    const result = children.map(() => ({ x: 0, y: 0 }));
    let cross = (crossBox - packCross) * crossFraction;
    for (let index = 0; index < lines.length; index += 1) {
        const packed = lines[index];
        const mainShift = (mainBox - packed.mainSize) * mainFraction;
        for (const item of packed.items) {
            const main = (reverse ? packed.mainSize - item.main - item.mainSize : item.main) + mainShift;
            const slotX = horizontal ? main : cross;
            const slotY = horizontal ? cross : main;
            const slotW = horizontal ? item.mainSize : packed.crossSize;
            const slotH = horizontal ? packed.crossSize : item.mainSize;
            result[item.index] = {
                x: slotX + (slotW - item.width) * axisFraction(item.anchor, "x", 0),
                y: slotY + (slotH - item.height) * axisFraction(item.anchor, "y", 0),
            };
        }
        cross += packed.crossSize;
        if (index < lines.length - 1) cross += lineGap;
    }
    return result;
}
