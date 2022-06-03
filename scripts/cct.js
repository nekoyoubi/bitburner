/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
		let map = JSON.parse(await ns.read("map.txt"));
		let hosts = map.map(h => h.host);
		for (let h in hosts) {
			let host = hosts[h];
			let files = ns.ls(host, ".cct");
			for (let f in files) {
				let file = files[f];
				let type = ns.codingcontract.getContractType(file, host);
				let input = ns.codingcontract.getData(file, host);
				let desc = ns.codingcontract.getDescription(file, host);
				let tries = ns.codingcontract.getNumTriesRemaining(file, host);
				let message = `${host}/${file} (${type}) [${input}] #${tries}`;
				ns.print(message);
				ns.print(desc);
				ns.print("=".repeat(50));
				//ns.tprint(message);
				//if (tries == 1) continue;
				var result = `WARN — SKIPPED: type ${type} is not yet solvable; skipping`;
				if (type.match(/RLE Compression/))
					result = ns.codingcontract.attempt(solveRleCompression(input), file, host, { returnReward: true });
				else if (type.match(/^Array Jump(?:ing)? Game$/))
					result = ns.codingcontract.attempt(solveArrayJumpingGame(input) > 0 ? 1 : 0, file, host, { returnReward: true });
				else if (type.match(/^Array Jump(?:ing)? Game II$/))
					result = ns.codingcontract.attempt(solveArrayJumpingGame(input), file, host, { returnReward: true });
				else if (type.match(/^Generate IP Addresses$/))
					result = ns.codingcontract.attempt(solveGenerateIpAddresses(input), file, host, { returnReward: true });
				if (result == "") {
					message = `ERROR — FAILED: ${host}/${file} (${type}) [${input}] #${tries-1} remaining`;
				} else if (!result.match(/SKIPPED/)) {
					message = `INFO — SOLVED: ${host}/${file} -> ${result}`;
					ns.tprint(message);
					ns.toast(message, "success", 10_000);
				}
				ns.print(message);			
				ns.print("=".repeat(50));
			}
		}
		await ns.sleep(60_000);
	}
}

/** @param {string} input */
function solveRleCompression(input) {
	let array = Array.from(input.matchAll(/(?:(.)\1{0,8})/g), m => m[0]);
	var output = "";
	for (let e in array) output += array[e].length + array[e][0];
	return output;
}

/** @param {string} input */
function solveArrayJumpingGame(input) {
	var j = 0;
	for (var p = 0; p < input.length; p++) {
		j++;
		var v = parseInt(input[p]);
		if (v == 0) return 0;
		else if (p + v >= input.length - 1) return j;
		var x = Math.max(...input.slice(p+1, Math.min(v, input.length - 1 - p + v)));
		if (x == 0) return 0;
		var o = p + v;
		while (o < input.length - 1 && input[o--] < x && o >= p) { }
		p = o;
		if (p >= input.length - 1) break;
	}
	return j;
}

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