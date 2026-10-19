import type { LayoutProps, ILayout } from "./Layout";
import type { FlowDirection } from "./FlowLayout";
import type { Element, Children } from "./primitives/jsx";
import { UI } from "./primitives/jsx";

export interface GridOptions {
    columns: number;
    /** ltr fills rows left to right. ttb fills columns top to bottom. Older horizontal and vertical values remain readable. */
    direction?: FlowDirection;
    /** Places the whole grid on the horizontal axis. */
    alignX?: "left" | "center" | "right";
    /** Places the whole grid on the vertical axis. */
    alignY?: "top" | "center" | "bottom";
    /** Horizontal space between columns. Falls back to gap. */
    columnGap?: number;
    /** Vertical space between rows. Falls back to gap. */
    rowGap?: number;
    /** Defaults to the maximum child width/height. Does not resize children. */
    cellWidth?: number;
    cellHeight?: number;
}

export type GridLayoutProps = LayoutProps & GridOptions;

export interface IGridLayout extends ILayout {
    kind: "grid";
    props: GridLayoutProps;
    children: Element[];
}

export function GridLayout(props: Partial<GridLayoutProps> & { child?: Children }): Element {
    return UI.createElement("grid", props, props.child ?? []);
}
