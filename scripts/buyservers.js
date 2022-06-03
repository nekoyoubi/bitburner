/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	var override = ns.args.length == 1 ? parseInt(ns.args[0]) : 0;
	let gameMaxServers = ns.getPurchasedServerLimit();
	let maxServers = override > 0 ? override : gameMaxServers;
	let cost = 55_000;
	let maxUpgrade = ns.getPurchasedServerMaxRam(); //65536;
	var size = ns.serverExists("s25") ? ns.getServerMaxRam("s25") : 0;
	var message = "";
	var totalCost = 0;
	while (size < maxUpgrade) {
		while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
		var map = JSON.parse(await ns.read("map.txt"));
		let hackingLevel = ns.getHackingLevel();
		let targets = map
			.filter(t => t.rooted && t.ram > 0 && t.maxMoney > 0 && t.hackingLevel <= hackingLevel)
			.map(t => t.host);
		for (let r = size > 0 ? size : 8; r <= maxUpgrade; r *= 2) {
			totalCost = maxServers * r * cost;
			if (totalCost >= (ns.getPlayer().money * (override > 0 ? 1 : .25))) {
				message = "";
				break;
			}
			//totalCost = testCost;
			size = r;
		}
		let currentRam = 0;
		while (ns.isRunning("loic.js", "home")) await ns.sleep(50);
		for (let s = maxServers; s > 0; s--)
			currentRam = Math.max(
				ns.serverExists(`s${s.toString().padStart(2, "0")}`) ? ns.getServerMaxRam(`s${s.toString().padStart(2, "0")}`) : 0,
				currentRam);
		ns.print(`size:${size} - currentRam:${currentRam}`);
		if (size <= currentRam) {
			ns.print(`next upgrade (${size * 2}GB) will cost ${ns.nFormat(totalCost, "($0,0.0a)")}`);
		} else {
			message = `INFO — upgrading servers to ${size}GB for ${ns.nFormat(totalCost, "($0,0.0a)")}`;
			ns.print(message);
			ns.tprint(message);
			ns.toast(message);
			var servers = ns.getPurchasedServers();
			if (servers.length >= gameMaxServers)
				for (let s = 1; s <= gameMaxServers; s++) {
					ns.killall(`s${ns.nFormat(s, "00")}`);
					ns.deleteServer(`s${ns.nFormat(s, "00")}`);
				}
			servers = ns.getPurchasedServers();
			for (let s = servers.length + 1; s <= maxServers; s++) {
				let name = `s${ns.nFormat(s, "00")}`;
				ns.purchaseServer(name, size);
			}
			if (ns.isRunning("loic.js", "home"))
				ns.scriptKill("loic.js", "home");
			ns.run("loic.js", 1, ...targets);
		}
		if (override > 0) return;
		await ns.sleep(60_000);
	}
}