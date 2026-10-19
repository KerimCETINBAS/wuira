import type { GridLayoutProps } from "../GridLayout";
import type { FlowChild } from "./calculateFlow";

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

function fraction(value: string | undefined, end: string): number {
    if (value === "center") return 0.5;
    if (value === end) return 1;
    return 0;
}

/** Place children in slots. Direction chooses the order; each child anchors inside its slot. */
export function calculateGrid(props: GridLayoutProps & { width?: number; height?: number }, children: readonly FlowChild[]): { x: number; y: number }[] {
    if (!Number.isFinite(props.columns) || props.columns < 1 || Math.floor(props.columns) !== props.columns) error("GridLayout columns must be a positive integer");
    const rowGap = props.rowGap ?? props.gap ?? 0;
    const columnGap = props.columnGap ?? props.gap ?? 0;
    if (rowGap < 0 || columnGap < 0) error("GridLayout gaps must be non-negative");
    let width = props.cellWidth ?? 0;
    let height = props.cellHeight ?? 0;
    for (const child of children) {
        if (props.cellWidth === undefined) width = Math.max(width, child.width);
        if (props.cellHeight === undefined) height = Math.max(height, child.height);
    }
    if (width < 0 || height < 0) error("GridLayout cell sizes must be non-negative");
    const columns = props.columns;
    const rows = children.length === 0 ? 0 : Math.ceil(children.length / columns);
    const vertical = props.direction === "ttb" || props.direction === "btt" || props.direction === "vertical" || props.direction === "verticalReverse";
    const reverse = props.direction === "rtl" || props.direction === "btt" || props.direction === "horizontalReverse" || props.direction === "verticalReverse";
    const alignX = fraction(props.alignX, "right");
    const alignY = fraction(props.alignY, "bottom");
    const points = children.map((child, index) => {
        let column = index % columns;
        let row = Math.floor(index / columns);
        if (vertical) { column = Math.floor(index / Math.max(1, rows)); row = index % Math.max(1, rows); }
        if (reverse) { if (vertical) row = rows - 1 - row; else column = columns - 1 - column; }
        const slotX = column * (width + columnGap);
        const slotY = row * (height + rowGap);
        return {
            x: slotX + (width - child.width) * axisFraction(child.anchor, "x", 0),
            y: slotY + (height - child.height) * axisFraction(child.anchor, "y", 0),
        };
    });
    const packW = columns === 0 || rows === 0 ? 0 : columns * width + Math.max(0, columns - 1) * columnGap;
    const packH = columns === 0 || rows === 0 ? 0 : rows * height + Math.max(0, rows - 1) * rowGap;
    const boxW = props.sizing === "content" && (props.width ?? 0) === 0 ? packW : props.width ?? packW;
    const boxH = props.sizing === "content" && (props.height ?? 0) === 0 ? packH : props.height ?? packH;
    const shiftX = (boxW - packW) * alignX;
    const shiftY = (boxH - packH) * alignY;
    for (const point of points) { point.x += shiftX; point.y += shiftY; }
    return points;
}
