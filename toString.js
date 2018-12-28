
const Uint8ArrayToString = (array) => {
    const charFromCodePt = String.fromCodePoint || String.fromCharCode
    const buffLen = array.length

    let result = []

    let codePt, byte1

    for (let i = 0; i < buffLen;) {
        byte1 = array[i++]

        if (byte1 <= 0x7F) {
            codePt = byte1
        } else if (byte1 <= 0xDF) {
            codePt = ((byte1 & 0x1F) << 6) | (array[i++] & 0x3F)
        } else if (byte1 <= 0xEF) {
            codePt = ((byte1 & 0x0F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F)
        } else if (String.fromCodePoint) {
            codePt = ((byte1 & 0x07) << 18) | ((array[i++] & 0x3F) << 12) | ((array[i++] & 0x3F) << 6) | (array[i++] & 0x3F)
        } else {
            codePt = 63  // Cannot convert four byte code points, so use "?" instead
            i += 3
        }

        result.push(charFromCodePt(codePt))
    }

    return result.join("")
}

module.exports = Uint8ArrayToString
