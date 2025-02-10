
//%block="character cube encoder"
//%icon="\uf468"
//%color="#40de9c"
namespace charcubenum {

    let idxValKey: { [key: string]: number } = {}

    //%block="$name"
    //%blockId=charcube_indexkeyshadow
    //%blockHidden=true shim=TD_ID
    //%name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //%name.fieldOptions.key="charcube_IndexKey"
    export function _indexKeyShadow(name: string) {
        return name
    }

    //%blockid=charcube_setindexkey
    //%block="set index key as $name by $val"
    //%name.shadow=charcube_indexkeyshadow name.defl="myIdxKey"
    //%group="index key"
    //%weight=10
    export function setIdxKey(name: string, val: number) {
        idxValKey[name] = val
    }

    //%blockid=charcube_getindexkey
    //%block="get index key as $name"
    //%name.shadow=charcube_indexkeyshadow name.defl="myIdxKey"
    //%group="index key"
    //%weight=5
    export function getIdxKey(name: string) {
        if (!idxValKey[name]) return -1
        return idxValKey[name]
    }

    //%blockid=charcube_writeandencode
    //%block="write $txt"
    //%group="main"
    //%weight=10
    export function write(txt: string) {
        let charw = 2, charlen = 0
        for (let val of txt.split("")) charlen = Math.max(charlen, val.charCodeAt(0))
        while (charw * (charw * charw) < charlen) charw += charw
        let utxt = "", ccol = -1, crow = -1, cdep = -1, ncol = 0, nrow = 0, ndep = 0, cnum = 0
        utxt = utxt + "8" + (charw.toString().length).toString() + charw.toString()
        for (let val of txt.split("")) {
            cnum = val.charCodeAt(0), ncol = cnum % charw, nrow = Math.floor(cnum / charw) % charw, ndep = Math.floor(cnum / (charw * charw))
            if (ndep != cdep) {
                cdep = ndep, utxt = utxt + "6" + (cdep.toString().length).toString() + cdep.toString()
            }
            if (nrow != crow) {
                crow = nrow, utxt = utxt + "4" + (crow.toString().length).toString() + crow.toString()
            }
            ccol = ncol, utxt = utxt + "2" + (ccol.toString().length).toString() + ccol.toString()
        }
        utxt = utxt + "0"
        return utxt
    }

    //%blockid=charcube_readanddecode
    //%block="read $txt with $name as index key"
    //%name.shadow=charcube_indexkeyshadow name.defl="myIdxKey"
    //%group="main"
    //%weight=5
    export function read(txt: string, name: string) {
        for (let v of txt.split("")) {
            const nv = parseInt(v)
            if (v != nv.toString()) return ""
        }
        let curidx = idxValKey[name], ccol = 0, crow = 0, cdep = 0, cnum = 0, cwid = 0, clen = 0, utxt = "", subchar = "", curchar = "", charcm = ""
        while (curidx < txt.length) {
            charcm = txt.charAt(curidx)
            if (["8", "6", "4", "2", "0"].indexOf(charcm) < 0) break;
            if (charcm == "8") {
                curidx += 1, clen = parseInt(txt.charAt(curidx))
                curidx += 1, cwid = parseInt(txt.substr(curidx, clen))
                curidx += clen
            } else if (charcm == "6") {
                curidx += 1, clen = parseInt(txt.charAt(curidx))
                curidx += 1, cdep = parseInt(txt.substr(curidx, clen))
                curidx += clen
            } else if (charcm == "4") {
                curidx += 1, clen = parseInt(txt.charAt(curidx))
                curidx += 1, crow = parseInt(txt.substr(curidx, clen))
                curidx += clen
            } else if (charcm == "2") {
                curidx += 1, clen = parseInt(txt.charAt(curidx))
                curidx += 1, ccol = parseInt(txt.substr(curidx, clen))
                curidx += clen, cnum = (cdep * (cwid * cwid)) + (crow * cwid) + ccol
                utxt += String.fromCharCode(cnum)
            } else if (charcm == "0") {
                break
            } else {
                curidx++
            }
        }
        curidx += 1
        idxValKey[name] = curidx
        return utxt
    }
}
