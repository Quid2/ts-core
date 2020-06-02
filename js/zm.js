"use strict";
/**
  Primitives required by the generated ADT definitions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatDecoder = exports.zmConst = void 0;
//export const zmConst : <A> (v:A) => ((f: (tId: zmTypeInfo,pars: A[]) => A) => A) = function (v) {return function(f) {return v;}}
function zmConst(v) {
    return function (f) {
        return v;
    };
}
exports.zmConst = zmConst;
//export type Decoder<T> = (s:DecoderState) => T
function flatDecoder(t, decoders) {
    return t.decoder(decoders);
}
exports.flatDecoder = flatDecoder;
//# sourceMappingURL=zm.js.map