export interface AsString {
  toStr(nested?: boolean): string;
  pretty(nested?: boolean): string;
}

export function nestedPars(nested: boolean, s: string): string {
  return nested ? "(" + s + ")" : s;
}
