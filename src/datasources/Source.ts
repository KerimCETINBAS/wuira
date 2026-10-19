import { DataSource } from "./DataSource";

const openers = new Map<Function, (props: readonly unknown[]) => unknown>();

/** Lets a protected constructor stay closed while UseSource can still open it. */
export function registerSource(ctor: Function, open: (props: readonly unknown[]) => unknown): boolean {
    openers.set(ctor, open);
    return true;
}

export function openSource(ctor: Function, props: readonly unknown[]): unknown {
    const open = openers.get(ctor);
    if (open === undefined) error("UseSource: this source is not registered");
    return open(props);
}

/** Opens a registered source. Public call sites use the typed overloads in UseSource.ts. */
export function UseSource<T>(source: { prototype: T }, ...props: unknown[]): T {
    return openSource(source as Function, props) as T;
}

/**
 * One query. Construction stores the props; every read passes those same props back in.
 * The source value is the reading.
 */
export abstract class Source<TReading, TProps extends readonly unknown[] = []> extends DataSource<TReading> {
    protected readonly props: TProps;
    protected constructor(initial: TReading, ...props: TProps) {
        super(initial);
        this.props = props;
    }

    protected abstract read(props: TProps): TReading;

    protected override GetValue(): TReading {
        return this.read(this.props);
    }
}
