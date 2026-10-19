import type { LayoutProps, ILayout } from "./Layout";
import type { Element, Children } from "./primitives/jsx";
import { UI } from "./primitives/jsx";

export type FlowDirection = "ltr" | "rtl" | "ttb" | "btt" | "horizontal" | "vertical" | "horizontalReverse" | "verticalReverse";

export interface FlowOptions {
    /** ltr packs left to right. rtl packs right to left. ttb packs top to bottom. btt packs bottom to top. horizontal and vertical remain readable. */
    direction: FlowDirection;
    /** Wrap to another row or column when full. */
    grow?: boolean;
    /** Horizontal space between children. Falls back to gap or lineGap, depending on direction. */
    columnGap?: number;
    /** Vertical space between children. Falls back to gap or lineGap, depending on direction. */
    rowGap?: number;
    /** Older shared spacing, used when columnGap or rowGap is unset. */
    gap?: number;
    /** Older cross-axis spacing, used when the matching axis gap is unset. */
    lineGap?: number;
    /** Places the arranged lines on the horizontal axis. */
    alignX?: "left" | "center" | "right";
    /** Places the arranged lines on the vertical axis. */
    alignY?: "top" | "center" | "bottom";
    /** Older main-axis alignment, used when the matching axis position is unset. */
    justify?: "start" | "center" | "end";
}

export type FlowLayoutProps = LayoutProps & FlowOptions;

export interface IFlowLayout extends ILayout {
    kind: "flow";
    props: FlowLayoutProps;
    children: Element[];
}

export function FlowLayout(props: Partial<FlowLayoutProps> & { child?: Children }): Element {
    return UI.createElement("flow", props, props.child ?? []);
}
