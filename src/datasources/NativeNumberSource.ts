import { DataSource } from "./DataSource";
import { registerSource } from "./Source";

/** Read-only API value; no cached assignment or game-state mutation. */
export class NativeNumberSource extends DataSource<number> {
    protected constructor(private readonly read: () => number) { super(0); }
    static { registerSource(NativeNumberSource, props => new NativeNumberSource(props[0] as () => number)); }
    protected override GetValue(): number { return this.read(); }
}
