/** Flat binary encoding **/
export interface Flat {
    flatMaxSize: () => number;
    flatEncode: Encoder;
}
export declare type Decoder = (s: DecoderState) => any;
export declare class DecoderState {
    /** The buffer that contains a sequence of flat-encoded values */
    buffer: Uint8Array;
    /** Pointer to the current byte being decoded (0..buffer.byteLength-1) */
    currPtr: number;
    /** Number of already decoded bits in the current byte (0..7) */
    usedBits: number;
    /**
     *
     * @param buffer The flat-encoded binary value
     */
    constructor(buffer: Uint8Array);
    dFiller(): boolean | null;
    dBit(): boolean | null;
    dBits8(numBits: number): number | null;
    dArray(decoder: Decoder): Array<any> | null;
    dArray_(decoder: Decoder, arr: Array<any>): Array<any> | null;
    isEnd(): boolean;
    hasBit(): boolean;
    hasBits(requiredBits: number): boolean;
    /** Decode a Filler, a special value that is used to byte align values.
     */
    zmFiller(decoders?: Decoder[]): string;
    zmBytes(decoders?: Decoder[]): Uint8Array;
    zmChar(decoders?: Decoder[]): string;
    zmString(decoders?: Decoder[]): string;
    zmWord7(decoders?: Decoder[]): number;
    zmWord8(decoders?: Decoder[]): number;
    zmWord16(decoders?: Decoder[]): number;
    zmWord32(decoders?: Decoder[]): number;
    zmArray(decoders: Decoder[]): Array<any>;
    /** Decode a byteArray
     * @return the decoded byteArray
     */
    byteArray(): Uint8Array;
    /** Decode up to 8 bits
     * @param numBits the number of bits to decode (0..8)
     */
    bits8(numBits: number): number;
    /** Decode a ZM Word see definition at  */
    word(): number;
    zero(): boolean;
    ensureBit(): void;
    ensureBits(requiredBits: number): void;
    ensureBytes(requiredBytes: number): void;
    availableBits(): number;
    availableBytes(): number;
    dropBits(numBits: number): void;
    seal(): void;
}
export declare type Encoder = (s: EncoderState) => void;
export declare class EncoderState {
    buffer: Uint8Array;
    nextPtr: number;
    usedBits: number;
    currentByte: number;
    constructor(bufferSize: number);
    static szFiller: (v?: string | undefined) => number;
    static szBytes: (v: Uint8Array) => number;
    zmBytes(v: Uint8Array): void;
    static szChar: (v?: string | undefined) => number;
    zmChar(v: string): void;
    static szString: (v: string) => number;
    zmString(s: string): void;
    static szWord7: (n: number) => number;
    zmWord7(n: number): void;
    static szWord8: (n: number) => number;
    zmWord8(n: number): void;
    static szWord16: (n: number) => number;
    zmWord16(n: number): void;
    static szWord32: (n: number) => number;
    zmWord32(n: number): void;
    static sizeArray<A>(sz: (e: A) => number, vals: A[]): number;
    static szArray<A extends Flat>(vals: A[]): number;
    zmArray<A extends Flat>(vals: A[]): void;
    zmFiller(v?: string): void;
    word(n: number): void;
    bits(numBits: number, value: number): void;
    zero(): void;
    one(): void;
    byteArray(arr: Uint8Array): void;
    nextWord(): void;
    seal(): Uint8Array;
}
export declare function byteArraySize(arr: Uint8Array): number;
export declare function arrayBlocks(len: number): number;
//# sourceMappingURL=flat.d.ts.map