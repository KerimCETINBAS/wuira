import { ProgressSource } from "./ProgressSource";
import { Unit, UnitSource, resolveUnit } from "./UnitSource";
import type { UnitInput } from "./UnitSource";
import type { ProgressOverrides } from "./ProgressSource";
import { ManaRegenTimer } from "./ManaRegenTimer";
import { Source, registerSource } from "./Source";
import { UseSource } from "./UseSource";

export { Unit } from "./UnitSource";

/** Direct API-to-widget binding; opaque values are never compared or calculated. */
abstract class Resource extends ProgressSource {
    private readonly listeners = new Set<(event: string, payload: unknown[], value: number) => void>();
    private eventFrame?: wuiraNativeFrame;
    private dispatching = false;
    private eventValue = 0;
    private stopUnit?: () => void;
    protected constructor(
        current: () => number,
        maximum: () => number,
        percent: () => number,
        private readonly unitReference: UnitSource,
        private readonly events: string[],
    ) {
        super({ current, min: () => 0, max: maximum, percent });
    }

    protected AddEvents(...events: string[]): void {
        for (const event of events) {
            if (this.events.includes(event)) continue;
            this.events.push(event);
            if (this.listeners.size > 0) this.eventFrame?.RegisterEvent(event);
        }
    }

    protected override GetValue(): number { return this.dispatching ? this.eventValue : super.GetValue(); }

    /** Future readable value changes only. Unsubscribe when the consumer is removed. */
    public onChange(listener: (value: number) => void): () => void {
        let previous = this.GetValue();
        let readable = !issecretvalue(previous);
        return this.Observe((_, _payload, value) => {
            if (issecretvalue(value) || !this.CanEmit(value)) return;
            if (readable && value === previous) return;
            previous = value;
            readable = true;
            listener(value);
        });
    }

    /** One native event frame is shared by widgets, observers, and accessories. */
    protected Observe(listener: (event: string, payload: unknown[], value: number) => void): () => void {
        this.listeners.add(listener);
        if (this.listeners.size === 1) {
            if (this.eventFrame === undefined) this.eventFrame = CreateFrame("Frame", undefined, UIParent);
            const frame = this.eventFrame;
            const dispatch = (event: string, payload: unknown[]) => {
                this.eventValue = super.GetValue();
                this.dispatching = true;
                try {
                    for (const callback of this.listeners) callback(event, payload, this.eventValue);
                } finally { this.dispatching = false; }
            };
            frame.SetScript("OnEvent", (_frame, event, ...payload: unknown[]) => {
                if (event !== "PLAYER_ENTERING_WORLD" && (issecretvalue(payload[0]) || payload[0] !== this.unitReference.Token)) return;
                dispatch(event, payload);
            });
            this.stopUnit = this.unitReference.onChange(() => dispatch("UNIT_IDENTITY_CHANGED", [this.unitReference.Token]));
            frame.RegisterEvent("PLAYER_ENTERING_WORLD");
            for (const event of this.events) frame.RegisterEvent(event);
        }
        return () => {
            this.listeners.delete(listener);
            if (this.listeners.size === 0) {
                this.stopUnit?.(); this.stopUnit = undefined;
                this.eventFrame?.UnregisterAllEvents();
                this.eventFrame?.SetScript("OnEvent", undefined);
            }
        };
    }

    protected Listen(_frame: wuiraNativeFrame, refresh: () => void): () => void {
        return this.Observe(() => refresh());
    }
}

function unitToken(unit: UnitInput): string {
    return typeof unit === "string" ? unit : unit.Token;
}

function nativeAmount(value: number | undefined): number {
    if (issecretvalue(value)) return value!;
    return value ?? 0;
}

/** One optional unit amount. A missing native function stays unavailable and is never called. */
abstract class UnitAmount extends Source<number, [UnitInput]> {
    public readonly target: UnitSource;
    public abstract get IsAvailable(): boolean;
    protected constructor(unit: UnitInput) {
        super(0, unit);
        this.target = resolveUnit(unit);
    }
    public ApplyTo(frame: wuiraNativeStatusBar, maximum: number): void {
        if (!this.IsAvailable) { frame.Hide(); return; }
        const value = this.GetValue();
        if (!this.CanEmit(value)) { frame.Hide(); return; }
        frame.SetMinMaxValues(0, maximum);
        frame.SetValue(value);
        frame.Show();
    }
}

/** Total absorbs on a unit. `UnitGetTotalAbsorbs`. */
export class Absorb extends UnitAmount {
    public get IsAvailable(): boolean { return UnitGetTotalAbsorbs !== undefined; }
    protected constructor(unit: UnitInput) { super(unit); }
    protected read(props: [UnitInput]): number {
        return UnitGetTotalAbsorbs === undefined ? 0 : nativeAmount(UnitGetTotalAbsorbs(unitToken(props[0])));
    }
    static { registerSource(Absorb, props => new Absorb(props[0] as UnitInput)); }
}

/** Incoming heals on a unit. `UnitGetIncomingHeals`. */
export class Prediction extends UnitAmount {
    public get IsAvailable(): boolean { return UnitGetIncomingHeals !== undefined; }
    protected constructor(unit: UnitInput) { super(unit); }
    protected read(props: [UnitInput]): number {
        return UnitGetIncomingHeals === undefined ? 0 : nativeAmount(UnitGetIncomingHeals(unitToken(props[0])));
    }
    static { registerSource(Prediction, props => new Prediction(props[0] as UnitInput)); }
}

export class HP extends Resource {
    private absorb?: Absorb;
    private prediction?: Prediction;
    /** Same object as `UseSource(Absorb, unit)`. Absent until `UseAbsorb`. */
    public get Absorb(): Absorb | undefined { return this.absorb; }
    /** Same object as `UseSource(Prediction, unit)`. Absent until `UsePrediction`. */
    public get Prediction(): Prediction | undefined { return this.prediction; }
    /** @deprecated Use Absorb. */
    public get AbsorbPrediction(): Absorb | undefined { return this.absorb; }
    /** @deprecated Use Prediction. */
    public get HealPrediction(): Prediction | undefined { return this.prediction; }
    public UseAbsorb(): this {
        if (this.absorb === undefined) {
            this.absorb = UseSource(Absorb, this.target);
            if (this.absorb.IsAvailable) this.AddEvents("UNIT_ABSORB_AMOUNT_CHANGED");
        }
        return this;
    }
    public UsePrediction(): this {
        if (this.prediction === undefined) {
            this.prediction = UseSource(Prediction, this.target);
            if (this.prediction.IsAvailable) this.AddEvents("UNIT_HEAL_PREDICTION");
        }
        return this;
    }
    /** @deprecated Use UseAbsorb. */
    public UseAbsorbPrediction(): this { return this.UseAbsorb(); }
    /** @deprecated Use UsePrediction. */
    public UseHealPrediction(): this { return this.UsePrediction(); }
    public override BindTo(frame: wuiraNativeStatusBar, options: ProgressOverrides = {}): () => void {
        if ((options.healPredictionBar !== undefined || options.absorbPredictionBar !== undefined)
            && (options.min !== undefined || options.max !== undefined || options.current !== undefined)) {
            error("HP: prediction overlays require the native health scale without min/max/current overrides");
        }
        return super.BindTo(frame, { ...options, onRefresh: () => {
            if (options.healPredictionBar !== undefined || options.absorbPredictionBar !== undefined) {
                const maximum = UnitHealthMax(this.unit);
                if (options.healPredictionBar !== undefined) this.prediction?.ApplyTo(options.healPredictionBar, maximum);
                if (options.absorbPredictionBar !== undefined) this.absorb?.ApplyTo(options.absorbPredictionBar, maximum);
            }
            options.onRefresh?.();
        } }) as () => void;
    }
    public readonly target: UnitSource;
    public get unit(): string { return this.target.Token; }
    protected constructor(unit: UnitInput = Unit.Player) {
        const target = resolveUnit(unit);
        super(() => UnitHealth(target.Token), () => UnitHealthMax(target.Token),
            () => UnitHealthPercent(target.Token, true, CurveConstants.ScaleTo100), target, ["UNIT_HEALTH", "UNIT_MAXHEALTH", "UNIT_CONNECTION"]);
        this.target = target;
    }
    static { registerSource(HP, props => new HP(props[0] as UnitInput | undefined)); }
}

/** Explicit mana (power type 0), even while the unit uses rage/energy. */
export class Mana extends Resource {
    private regenTimer?: ManaRegenTimer;
    public get RegenTimer(): ManaRegenTimer | undefined { return this.regenTimer; }
    public UseRegenTimer(): this {
        if (this.unit !== "player") error("Mana.UseRegenTimer: only the player is supported");
        if (this.regenTimer === undefined) {
            this.AddEvents("UNIT_SPELLCAST_SUCCEEDED");
            this.regenTimer = UseSource(ManaRegenTimer, listener => this.Observe(listener));
        }
        return this;
    }
    public readonly target: UnitSource;
    public get unit(): string { return this.target.Token; }
    protected constructor(unit: UnitInput) {
        const target = resolveUnit(unit);
        super(() => UnitPower(target.Token, 0), () => UnitPowerMax(target.Token, 0),
            () => UnitPowerPercent(target.Token, 0, true, CurveConstants.ScaleTo100), target, ["UNIT_POWER_UPDATE", "UNIT_MAXPOWER", "UNIT_DISPLAYPOWER", "UNIT_CONNECTION"]);
        this.target = target;
    }
    static { registerSource(Mana, props => new Mana(props[0] as UnitInput)); }
}

export const DataSources = { Resources: { HP, Mana } };
