//@ts-check
const decode = require("./decode")

/** 
 * @typedef {object} File
 * @property {number} length
 * @property {Uint8Array[]} path
 */

/**
 * 解析BT种子文件中包含的所有文件名和文件路径
 * @param { Uint8Array | Buffer } torrent BT种子文件
 */
var getFilePathsFromTorrent = function (torrent) {
    /** @type {{ files?: File[]; name: Uint8Array; }} */
    var torrentInfo = decode(torrent).info
    var files = torrentInfo.files
    var name = torrentInfo.name

    if (!files) {  // 仅包含单个文件
        return [decode.Uint8ArrayToString(name)]
    } else {
        var paths = files.map(function (x) {
            return x.path.map(function (p) {
                return decode.Uint8ArrayToString(p)
            }).join("/")
        })

        return paths
    }
}

module.exports = getFilePathsFromTorrent
