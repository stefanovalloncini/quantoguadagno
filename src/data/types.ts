export type IsoDate = `${number}-${number}-${number}`;

export interface Source {
  readonly ref: string;
  readonly url?: string;
  readonly published?: IsoDate;
  readonly retrieved?: IsoDate;
  readonly verified?: IsoDate;
  readonly note?: string;
}

export interface Entry<T, D extends IsoDate = IsoDate> {
  readonly from: D;
  readonly value: T;
  readonly source: Source;
}

export type Entries<T, D extends IsoDate = IsoDate> = readonly [Entry<T, D>, ...Entry<T, D>[]];

export interface ParamDefinition<T, D extends IsoDate = IsoDate> {
  readonly revaluedYearly: boolean;
  readonly entries: Entries<T, D>;
}

export interface Bracket {
  readonly min: number;
  readonly max: number | null;
  readonly rate: number;
}

export type PaymentFrequency = 12 | 13 | 14 | 15 | 16;
