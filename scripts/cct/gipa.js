/** @param {NS} ns */
export async function main(ns) {
	//	"17616311428";
	_ns = ns;
	let getRandoms = function() {
		var o = [];
		for (let r = 0; r < (Math.random()*8)+4; r++)
			o.push(Math.floor(Math.random()*10));
		return o.join(""); 
	}; 
	let input = ns.args.length > 0 ? ns.args[0].toString() : getRandoms();
	//for (let e = 0; e < (ns.args.length > 0 ? 1 : 10); e++)
		ns.tprint(`${input} = ${JSON.stringify(await solveGenerateIpAddresses(input))}`);
}
var _ns;
/** @param {Array<string>} input */
async function solveGenerateIpAddresses(input) {
	/** @param {string} octet */
	let valid = function(octet) { let o = parseInt(octet); return !octet.match(/^0\d+/) && o > -1 && o < 256; };
	var answers = [];
	var il = input.length;
	for (let i1 = 1; i1 < 4 && i1 < il; i1++) {
		var o1 = input.substring(0, i1);
		if (!valid(o1)) continue;
		for (let i2 = 1; i2 < 4 && i1 + i2 < il; i2++) {
			var o2 = input.substring(i1, i1 + i2);
			if (!valid(o2)) continue;
			for (let i3 = 1; i3 < 4 && i1 + i2 + i3 < il; i3++) {
				var o3 = input.substring(i1 + i2, (i1 + i2 + i3));
				var o4 = input.substring(i1 + i2 + i3);
				if (!valid(o3) || !valid(o4)) continue;
				answers.push(`${o1}.${o2}.${o3}.${o4}`);
				await _ns.sleep(1); // too many ns operations, apparently; crashes the game without this
			}	
		}
	}
	return answers;
}