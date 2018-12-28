//@ts-check
const bencode = require("bencode")
const fs = require("fs")

/** 
 * @typedef {object} File
 * @property {number} length
 * @property {Uint8Array[]} path
 */

const filePath0 = "./[自压][电波女与青春男][Denpa_Onna_to_Seishun_Otoko][BDRIP][1920x1080][01-12+13隐藏话][x264_aac][10bit].torrent"
const filePath1 = "[VCB-Studio] Gochuumon wa Usagi Desuka__ Dear My Sister _ 请问您今天要来点兔子吗__ Dear My Sister 10-bit 1080p HEVC BDRip [Fin].torrent"
const filePath2 = "【自压】【TSDM字幕组】[电波女与青春男][Denpa_Onna_to_Seishun_Otoko][13][简繁内挂][1080p][MKV][TV未播话].torrent"

const f = new Uint8Array(fs.readFileSync(filePath2))

/** @type {{ files?: File[]; name: Uint8Array; }} */
const torrentInfo = bencode.decode(f).info
const { files, name } = torrentInfo

if (!files) {  // 仅包含单个文件
    const paths = [name.toString()]
    console.log(paths)

} else {
    const paths = files.map((x) => {
        return x.path.map((p) => p.toString()).join("/")
    })

    console.log(paths)
}
