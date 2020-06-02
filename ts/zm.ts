/**
  Primitives required by the generated ADT definitions.
 */

import { Flat, Decoder } from "./flat";
import { AsString } from "./pretty";

// ZM types

/** Saturated ZM Type Fold */
export type zmFold<T> = <A>(f: (tId: zmTypeInfo, pars: A[]) => A) => A;

//export const zmConst : <A> (v:A) => ((f: (tId: zmTypeInfo,pars: A[]) => A) => A) = function (v) {return function(f) {return v;}}

export function zmConst(v: any) {
  return function (f: any) {
    return v;
  };
}

//export const zmConst : string = ""

//export type zmFold0<T> = <A> (v:A) => zmFold<T>
//export const zmConst : zmFold0<T> = function (v) {return function(f) {return v;}}
//export const zmConst : zmFold0<T> = function (v) {return function(f) {return v;}}

//export type zmFold0 = <A> (v:A) => ((f: (tId: zmTypeInfo,pars: A[]) => A) => A)
//export const zmConst : zmFold0 = function (v) {return function(f) {return v;}}

// ZM type constructor unique code
export type zmId = [number, number, number, number, number, number];

export type zmTypeInfo = {
  zid: zmId;
  decoder: (decoders: Decoder[]) => Decoder;
};

export interface ZM extends Flat, AsString {}

//export type Decoder<T> = (s:DecoderState) => T

export function flatDecoder(t: zmTypeInfo, decoders: Decoder[]) {
  return t.decoder(decoders);
}
