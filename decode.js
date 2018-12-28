//@ts-check
// 修改自https://github.com/themasch/node-bencode/blob/master/lib/decode.js

var INTEGER_START = 0x69 // 'i'
var STRING_DELIM = 0x3A // ':'
var DICTIONARY_START = 0x64 // 'd'
var LIST_START = 0x6C // 'l'
var END_OF_TYPE = 0x65 // 'e'

/**
 * @param {Uint8Array} buffer
 * @param {Number} start
 * @param {Number} end
 * @return {Number} calculated number
 */
function getIntFromBuffer(buffer, start, end) {
    var sum = 0
    var sign = 1

    for (var i = start; i < end; i++) {
        var num = buffer[i]

        if (num < 58 && num >= 48) {
            sum = sum * 10 + (num - 48)
            continue
        }

        if (i === start && num === 43) { // +
            continue
        }

        if (i === start && num === 45) { // -
            sign = -1
            continue
        }

        if (num === 46) { // .
            // its a float. break here.
            break
        }

        throw new Error('not a number: buffer[' + i + '] = ' + num)
    }

    return sum * sign
}

/**
 * Decodes bencoded data.
 *
 * @param  {Uint8Array} data
 * @param  {Number=} start (optional)
 * @param  {Number=} end (optional)
 * @return {Object|Array|Uint8Array|String|Number}
 */
function decode(data, start, end) {
    if (data == null || data.length === 0) {
        return null
    }

    decode.position = 0

    decode.data = data.slice(start, end)

    decode.bytes = decode.data.length

    return decode.next()
}

decode.bytes = 0
decode.position = 0
decode.data = null

decode.next = function () {
    switch (decode.data[decode.position]) {
    case DICTIONARY_START:
        return decode.dictionary()
    case LIST_START:
        return decode.list()
    case INTEGER_START:
        return decode.integer()
    default:
        return decode.buffer()
    }
}

decode.find = function (chr) {
    var i = decode.position
    var c = decode.data.length
    var d = decode.data

    while (i < c) {
        if (d[i] === chr) return i
        i++
    }

    throw new Error(
        'Invalid data: Missing delimiter "' +
        String.fromCharCode(chr) + '" [0x' +
        chr.toString(16) + ']'
    )
}

decode.dictionary = function () {
    decode.position++

    var dict = {}

    while (decode.data[decode.position] !== END_OF_TYPE) {
        var keyBuffer = decode.buffer()
        var key = decode.Uint8ArrayToString(keyBuffer)
        dict[key] = decode.next()
    }

    decode.position++

    return dict
}

decode.list = function () {
    decode.position++

    var lst = []

    while (decode.data[decode.position] !== END_OF_TYPE) {
        lst.push(decode.next())
    }

    decode.position++

    return lst
}

decode.integer = function () {
    var end = decode.find(END_OF_TYPE)
    var number = getIntFromBuffer(decode.data, decode.position + 1, end)

    decode.position += end + 1 - decode.position

    return number
}

decode.buffer = function () {
    var sep = decode.find(STRING_DELIM)
    var length = getIntFromBuffer(decode.data, decode.position, sep)
    var end = ++sep + length

    decode.position = end

    return decode.data.slice(sep, end)
}

// https://stackoverflow.com/a/41798356
decode.Uint8ArrayToString = (function () {
    var charCache = new Array(128) // Preallocate the cache for the common single byte chars
    var charFromCodePt = String.fromCodePoint || String.fromCharCode
    var result = []

    return function (array) {
        var codePt, byte1
        var buffLen = array.length

        result.length = 0

        for (var i = 0; i < buffLen;) {
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
                codePt = 63 // Cannot convert four byte code points, so use "?" instead
                i += 3
            }

            result.push(charCache[codePt] || (charCache[codePt] = charFromCodePt(codePt)))
        }

        return result.join("")
    }
})()

module.exports = decode
