/** Inclusive integer span. `Range(1, 5)` is `[1, 2, 3, 4, 5]`. An inverted span is empty. */
export function Range(from: number, to: number): number[] {
    if (issecretvalue(from) || issecretvalue(to) || typeof from !== "number" || typeof to !== "number" || !Number.isInteger(from) || !Number.isInteger(to)) error("Range expects public integers");
    const values: number[] = [];
    if (to < from) return values;
    for (let value = from; value <= to; value++) values.push(value);
    return values;
}
