/** @param {NS} ns */
export async function main(ns) {
	let quantity = ns.args.length > 0 ? parseInt(ns.args[0]) : 1;
	let cost = 55_000;
	let maxUpgrade = ns.getPurchasedServerMaxRam();
	var totalCost = 0;
	var size = 0;
	for (let r = size > 0 ? size : 2; r <= maxUpgrade; r *= 2) {
		let testCost = quantity * r * cost;
		if (testCost >= ns.getPlayer().money) break;
		totalCost = testCost;
		size = r;
	}
	var confirm = await ns.prompt(`Buy ${quantity} ${size}GB servers for ${ns.nFormat(totalCost, "($0,0.0a)")}`);
	ns.tprint(confirm);
	if (confirm) {
		ns.tprint("in confirm block");
		let servers = ns.getPurchasedServers().length;
		ns.tprint(servers);
		for (let s = servers + 1; s <= quantity; s++) {
			let name = `s${ns.nFormat(s, "00")}`;
			ns.tprint(name);
			ns.purchaseServer(name, size);
			ns.scp("attack.js", name);
			var per = Math.floor(size / ns.getScriptRam("attack.js", name));
			if (per > 0)
				ns.exec("attack.js", name, per, "joesguns");
		}
	}
}