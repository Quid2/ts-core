"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayBlocks = exports.byteArraySize = exports.EncoderState = exports.DecoderState = void 0;
class DecoderState {
    /**
     *
     * @param buffer The flat-encoded binary value
     */
    constructor(buffer) {
        this.buffer = buffer;
        this.currPtr = 0;
        this.usedBits = 0;
    }
    // should return unit
    dFiller() {
        const b = this.dBit();
        if (b == null) {
            return null;
        }
        if (b) {
            return true;
        }
        return this.dFiller();
    }
    dBit() {
        if (!this.hasBit())
            return null;
        const b = this.buffer[this.currPtr] & (128 >>> this.usedBits);
        //console.log("BIT",this.buffer,this.currPtr,this.buffer[this.currPtr],128 >>> this.usedBits,(this.buffer[this.currPtr] & (128 >>> this.usedBits)),b);
        if (this.usedBits == 7) {
            this.currPtr++;
            this.usedBits = 0;
        }
        else
            this.usedBits++;
        return !!b;
    }
    dBits8(numBits) {
        if (!this.hasBits(numBits) || numBits < 0 || numBits > 8)
            return null;
        // usedBits=1 numBits=8 unusedBits=7 leadingZeros=0 unusedBits+leadingZeros=7
        const unusedBits = 8 - this.usedBits;
        const leadingZeros = 8 - numBits;
        var r = ((this.buffer[this.currPtr] << this.usedBits) & 255) >>> leadingZeros;
        if (numBits > unusedBits) {
            r |= this.buffer[this.currPtr + 1] >>> (unusedBits + leadingZeros);
        }
        this.dropBits(numBits);
        return r;
    }
    dArray(decoder) {
        return this.dArray_(decoder, []);
    }
    dArray_(decoder, arr) {
        var blkLen = this.dBits8(8);
        if (blkLen == null)
            return null;
        if (blkLen == 0)
            return arr;
        for (var i = 0; i < blkLen; i++) {
            const v = decoder(this);
            if (v == null)
                return null;
            arr.push(v);
        }
        return this.dArray_(decoder, arr);
    }
    isEnd() {
        return this.availableBits() == 0;
    }
    // Is this required? Or we can rely on build in js checks?
    hasBit() {
        return this.currPtr < this.buffer.byteLength;
    }
    hasBits(requiredBits) {
        return requiredBits > this.availableBits();
    }
    /** Decode a Filler, a special value that is used to byte align values.
     */
    zmFiller(decoders) {
        while (this.zero())
            ;
        return "";
    }
    zmBytes(decoders) {
        this.zmFiller();
        return this.byteArray();
    }
    zmChar(decoders) {
        return String.fromCharCode(this.word());
    }
    zmString(decoders) {
        var s = "";
        while (!this.zero()) {
            s += this.zmChar();
        }
        return s;
    }
    zmWord7(decoders) {
        return this.bits8(7);
    }
    zmWord8(decoders) {
        return this.bits8(8);
    }
    zmWord16(decoders) {
        return this.word();
    }
    zmWord32(decoders) {
        return this.word();
    }
    zmArray(decoders) {
        const dec = decoders[0];
        var arr = [];
        var blkLen;
        while ((blkLen = this.bits8(8)))
            for (var i = 0; i < blkLen; i++)
                arr.push(dec(this));
        //console.log(arr);
        return arr;
    }
    /** Decode a byteArray
     * @return the decoded byteArray
     */
    byteArray() {
        if (this.usedBits != 0)
            throw Error("DecoderState.byteArray: Buffer is not byte aligned");
        var st = this;
        // const arr = new Uint8Array(1000);
        // while (blkLen=st.buffer[st.currPtr++]) {
        //   arr.set(st.buffer.subarray(0,blkLen), arrPtr);
        //   arrPtr += blkLen;
        //   st.currPtr += blkLen;
        // }
        var arrPtr = st.currPtr;
        var arrSize = 0;
        var blkLen;
        st.ensureBytes(1);
        while ((blkLen = st.buffer[st.currPtr++])) {
            st.ensureBytes(blkLen + 1);
            st.buffer.copyWithin(st.currPtr - 1, st.currPtr, st.currPtr + blkLen);
            st.currPtr += blkLen;
            arrSize += blkLen;
        }
        return st.buffer.subarray(arrPtr, arrPtr + arrSize);
    }
    /** Decode up to 8 bits
     * @param numBits the number of bits to decode (0..8)
     */
    bits8(numBits) {
        if (numBits < 0 || numBits > 8)
            throw Error("Decoder.bits8: incorrect value of numBits " + numBits);
        this.ensureBits(numBits);
        // usedBits=1 numBits=8 unusedBits=7 leadingZeros=0 unusedBits+leadingZeros=7
        const unusedBits = 8 - this.usedBits;
        const leadingZeros = 8 - numBits;
        var r = ((this.buffer[this.currPtr] << this.usedBits) & 255) >>> leadingZeros;
        if (numBits > unusedBits) {
            r |= this.buffer[this.currPtr + 1] >>> (unusedBits + leadingZeros);
        }
        this.dropBits(numBits);
        return r;
    }
    /** Decode a ZM Word see definition at  */
    word() {
        var n = 0;
        var shl = 0;
        var w8;
        var w7;
        do {
            w8 = this.bits8(8);
            w7 = w8 & 127;
            n |= w7 << shl;
            shl += 7;
            //console.log("usedBits",this.usedBits,"w7",w7,"w8",w8,w8!==w7)
        } while (w8 !== w7);
        return n;
    }
    zero() {
        this.ensureBit();
        const b = !(this.buffer[this.currPtr] & (128 >>> this.usedBits));
        //console.log("BIT",this.buffer,this.currPtr,this.buffer[this.currPtr],128 >>> this.usedBits,(this.buffer[this.currPtr] & (128 >>> this.usedBits)),b);
        if (this.usedBits == 7) {
            this.currPtr++;
            this.usedBits = 0;
        }
        else
            this.usedBits++;
        return b;
    }
    ensureBit() {
        if (this.currPtr >= this.buffer.byteLength) {
            throw Error("DecoderState: Not enough data available: " + JSON.stringify(this));
        }
    }
    ensureBits(requiredBits) {
        if (requiredBits > this.availableBits()) {
            throw Error("DecoderState: Not enough data available: " + JSON.stringify(this));
        }
    }
    ensureBytes(requiredBytes) {
        if (requiredBytes > this.availableBytes()) {
            throw Error("DecoderState: Not enough data available: " + JSON.stringify(this));
        }
    }
    availableBits() {
        return 8 * this.availableBytes() - this.usedBits;
    }
    // Available bytes, ignoring used bits
    availableBytes() {
        return this.buffer.byteLength - this.currPtr;
    }
    dropBits(numBits) {
        const totUsed = numBits + this.usedBits;
        this.usedBits = totUsed % 8;
        this.currPtr += Math.floor(totUsed / 8);
    }
    seal() {
        if (this.availableBits() > 0) {
            throw Error("DecoderState: Unread data: " + JSON.stringify(this));
        }
    }
}
exports.DecoderState = DecoderState;
let EncoderState = /** @class */ (() => {
    class EncoderState {
        constructor(bufferSize) {
            this.buffer = new Uint8Array(bufferSize);
            this.nextPtr = 0;
            this.currentByte = 0;
            this.usedBits = 0;
        }
        zmBytes(v) {
            this.zmFiller();
            this.byteArray(v);
        }
        zmChar(v) {
            this.word(v.charCodeAt(0));
        }
        zmString(s) {
            const l = s.length;
            for (var i = 0; i < l; i++) {
                this.one();
                this.zmChar(s.charAt(i));
            }
            this.zero();
        }
        zmWord7(n) {
            this.bits(7, n);
        }
        zmWord8(n) {
            this.bits(8, n);
        }
        zmWord16(n) {
            this.word(n);
        }
        zmWord32(n) {
            this.word(n);
        }
        static sizeArray(sz, vals) {
            const len = vals.length;
            var size = arrayBlocks(len) * 8;
            for (var i = 0; i < len; i++)
                size += sz(vals[i]);
            return size;
        }
        static szArray(vals) {
            const len = vals.length;
            var size = arrayBlocks(len) * 8;
            for (var i = 0; i < len; i++)
                size += vals[i].flatMaxSize();
            return size;
        }
        zmArray(vals) {
            //const vals = this.values;
            var numElems = vals.length;
            var inx = 0;
            var blkLen;
            while ((blkLen = Math.min(255, numElems))) {
                this.bits(8, blkLen);
                for (var i = 0; i < blkLen; i++)
                    vals[inx + i].flatEncode(this);
                numElems -= blkLen;
            }
            this.bits(8, 0);
        }
        zmFiller(v) {
            this.currentByte |= 1;
            this.nextWord();
        }
        word(n) {
            do {
                var w = n & 127;
                n >>>= 7;
                if (n !== 0)
                    w |= 128;
                this.bits(8, w);
            } while (n !== 0);
        }
        // add indicated number of bits (up to ? bits)
        bits(numBits, value) {
            this.usedBits += numBits;
            let unusedBits = 8 - this.usedBits;
            if (unusedBits > 0)
                this.currentByte |= value << unusedBits;
            else if (unusedBits == 0) {
                this.currentByte |= value;
                this.nextWord();
            }
            else {
                let used = -unusedBits;
                this.currentByte |= value >>> used;
                this.nextWord();
                this.currentByte = value << (8 - used);
                this.usedBits = used;
            }
        }
        zero() {
            this.usedBits == 7 ? this.nextWord() : this.usedBits++;
        }
        one() {
            if (this.usedBits == 7) {
                this.currentByte |= 1;
                this.nextWord();
            }
            else {
                this.currentByte |= 1 << (7 - this.usedBits);
                this.usedBits++;
            }
        }
        // string(s) : void {
        //   let ptr = 0;
        //   let blkLen = Math.min(s.length-ptr, 255);
        //   bits8(blkLen)
        //   for (var i=0;i<blkLen)
        // }
        byteArray(arr) {
            if (this.usedBits != 0)
                throw Error("EncoderState.byteArray: Buffer is not byte aligned");
            var st = this;
            function writeBlk(srcPtr) {
                let srcLen = arr.byteLength - srcPtr;
                let blkLen = Math.min(srcLen, 255);
                st.buffer[st.nextPtr++] = blkLen;
                if (blkLen == 0)
                    return;
                st.buffer.set(arr.subarray(srcPtr, srcPtr + blkLen), st.nextPtr);
                st.nextPtr += blkLen;
                srcPtr += blkLen;
                writeBlk(srcPtr);
            }
            writeBlk(0);
        }
        nextWord() {
            this.buffer[this.nextPtr++] = this.currentByte;
            (this.currentByte = 0), (this.usedBits = 0);
        }
        seal() {
            if (this.usedBits != 0) {
                throw Error("EncoderState.seal: Byte partially filled: " + JSON.stringify(this));
            }
            return this.buffer.subarray(0, this.nextPtr);
        }
    }
    EncoderState.szFiller = (v) => 8;
    // Up to 8 bits for prefiller plus aligned byte array size;
    EncoderState.szBytes = (v) => 8 + byteArraySize(v);
    EncoderState.szChar = (v) => 24;
    EncoderState.szString = (v) => v.length * 25 + 1;
    EncoderState.szWord7 = (n) => 7;
    EncoderState.szWord8 = (n) => 8;
    EncoderState.szWord16 = (n) => 24;
    EncoderState.szWord32 = (n) => 40;
    return EncoderState;
})();
exports.EncoderState = EncoderState;
// Exact encoding size in bits of a prealigned Array of bytes
function byteArraySize(arr) {
    let numBytes = arr.byteLength + arrayBlocks(arr.byteLength);
    return 8 * numBytes;
}
exports.byteArraySize = byteArraySize;
// Exact number of bytes needed to store the array blocks lengths
function arrayBlocks(len) {
    return Math.ceil(len / 255) + 1;
}
exports.arrayBlocks = arrayBlocks;
//# sourceMappingURL=flat.js.map