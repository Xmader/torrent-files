//@ts-check
const bencode = require("bencode")
const fs = require("fs")

const filePath0 = "./[自压][电波女与青春男][Denpa_Onna_to_Seishun_Otoko][BDRIP][1920x1080][01-12+13隐藏话][x264_aac][10bit].torrent"
const filePath1 = "[VCB-Studio] Gochuumon wa Usagi Desuka__ Dear My Sister _ 请问您今天要来点兔子吗__ Dear My Sister 10-bit 1080p HEVC BDRip [Fin].torrent"
const f = new Uint8Array(fs.readFileSync(filePath1))

/** @type {{ length: number; path: Uint8Array[]; }[]} */
const files = bencode.decode(f).info.files

console.log(
    files.map((x) => {
        return x.path.map((p) => p.toString()).join("/")
    })
)
