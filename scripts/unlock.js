/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	var done = false;
	while (!done) {
		var crackers = [ "BruteSSH", "FTPCrack", "relaySMTP", "HTTPWorm", "SQLInject" ];
		let crackersOwned = crackers.filter(c => ns.fileExists(`${c}.exe`, "home"));
		let player = ns.getPlayer();
		ns.run("map.js"); while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
		var map = JSON.parse(await ns.read("map.txt"));
		let breakThem = map.filter(h => !h.rooted && h.hacking <= player.hacking);
		let hackThem = map.filter(h => h.rooted && h.hacking <= player.hacking && h.maxMoney > 0);
		hackThem.sort((a, b) => b.hacking - a.hacking);
		let hackTargets = hackThem.slice(0, 3).map(h => h.host);
		done = map.filter(h => !h.rooted).length < 1;
		let targetOverride = await ns.read("target.txt");
		if (targetOverride.length > 0)
			hackTargets = [ ...targetOverride.match(/[^,;\s]+/g) ];
		for (let b in breakThem) {
			let target = breakThem[b].host;
			if (target == "home") continue;
			let server = ns.getServer(target);
			if (!server.hasAdminRights && server.numOpenPortsRequired <= crackersOwned.length) {
				var message = `unlocking ${target}...`;
				ns.print(message);
				for (let c in crackersOwned) {
					switch (crackersOwned[c].toLowerCase()) {
						case "brutessh" : ns.brutessh(target); break;
						case "ftpcrack" : ns.ftpcrack(target); break;
						case "relaysmtp" : ns.relaysmtp(target); break;
						case "httpworm" : ns.httpworm(target); break;
						case "sqlinject" : ns.sqlinject(target); break;
					}
				}
				ns.nuke(target);
				message = `INFO — ${target} unlocked`
				ns.print(message)
				ns.tprint(message);
				ns.toast(message, "info");
				await ns.scp("attack.js", target);
				await ns.scp("goto.js", target);
				var per = 0;
				for (let t = hackTargets.length - 1; t >= 0; t--) {
					per = Math.floor(((server.maxRam - 4) / ns.getScriptRam("attack.js", server.hostname)) / hackTargets.length);
					if (per == 0 && hackTargets.length > 0)
						hackTargets.pop();
					else break;
				}
				if (per > 0)
					for (let t in hackTargets)
						ns.exec("attack.js", server.hostname, per, hackTargets[t]);
			}
		}
		await ns.sleep(5_000);
	}
}