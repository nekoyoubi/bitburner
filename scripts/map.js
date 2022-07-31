/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		let display = ns.args.length > 0 ? ns.args.find(a => a.match(/^[\-/]d/i)) != undefined : false;
		var hosts = [ {
			host: "home",
			parent: "",
			ram: ns.getServerMaxRam("home"),
			rooted: true,
			sniffed: false,
			distance: 0,
			hacking: ns.getPlayer().skills.hacking,
			maxMoney: 0,
			minSec: 0,
			owner: "Nekoyoubi",
			growthRate: 0
		} ];
		var base = "home";
		var safety = 5000;
		while (safety-- > 0 && base != null && base != undefined) {
			let results = ns.scan(base)
				.filter(h => h != "home"/* && ns.getServerMaxRam(h) > 0*/)
				.sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b));
			for (var r in results) {
				let host = results[r];
				if (host.match(/^s\d{2}$/)) continue;
				let server = ns.getServer(host);
				let rooted = ns.hasRootAccess(host);
				if (hosts.filter(h => h.host == host).length == 0) {
					hosts[hosts.length] = {
						host: host,
						parent: base,
						ram: server.maxRam,
						rooted: rooted,
						backdoored: server.backdoorInstalled,
						distance: findServerDistance(hosts, base),
						hacking: host == "home" ? 9001 : server.requiredHackingSkill,
						maxMoney: host == "home" ? 0 : server.moneyMax,
						minSec: host == "home" ? 0 :  server.minDifficulty,
						owner: host == "home" ? "Nekoyoubi" :  server.organizationName,
						growthRate: host == "home" ? 0 :  server.serverGrowth,
						sniffed: false
					};
					if (display) ns.tprint(JSON.stringify(hosts[hosts.length-1]));
				}
			}
			let next = hosts.find(h => h.sniffed == false);
			if (next != undefined) {
				next.sniffed = true;
				base = next.host;
			}
		}
		await ns.write("map.txt", JSON.stringify(hosts), "w");
		if (display) ns.tprint(`map.txt updated with findings of ${hosts.length} total servers`);
		await ns.sleep(10);
	}
}

function findServerDistance(hosts, base) {
	var next = base;
	for (let d = 0; d < 100; d++) {
		let it = hosts.find(h => h.host === next);
		if (it == undefined)
			return d;
		else
			next = it.parent;
	}
}