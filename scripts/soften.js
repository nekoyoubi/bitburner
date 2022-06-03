/** @param {NS} ns */
export async function main(ns) {
	let maxServers = ns.getPurchasedServerLimit();
	let cost = 55_000;
	var size = 0;
	var message = "";
	while (size < 8192) {
		// ns.run("map.js"); while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
		// var map = JSON.parse(await ns.read("map.txt"));
		// let nohack = JSON.parse(await ns.read("nohack.txt"));
		// let targets = map.filter(t => t.rooted && t.ram > 0 && !nohack.includes(t.host)).map(t => t.host);
		for (let r = 2; r <= 8192; r *= 2) {
			let totalCost = maxServers * r * cost;
			ns.tprint(`${r} = ${totalCost}`);
			if (totalCost >= (ns.getPlayer().money * .25) || size >= r) {
				message = "";
				break;
			}
			size = r;
		}
		ns.tprint(`${size} - ${ns.getServerMaxRam("s01")}`);
	}
}