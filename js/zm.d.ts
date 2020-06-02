/**
  Primitives required by the generated ADT definitions.
 */
import { Flat, Decoder } from "./flat";
import { AsString } from "./pretty";
/** Saturated ZM Type Fold */
export declare type zmFold<T> = <A>(f: (tId: zmTypeInfo, pars: A[]) => A) => A;
export declare function zmConst(v: any): (f: any) => any;
export declare type zmId = [number, number, number, number, number, number];
export declare type zmTypeInfo = {
    zid: zmId;
    decoder: (decoders: Decoder[]) => Decoder;
};
export interface ZM extends Flat, AsString {
}
export declare function flatDecoder(t: zmTypeInfo, decoders: Decoder[]): Decoder;
//# sourceMappingURL=zm.d.ts.map