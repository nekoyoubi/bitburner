/** @param {NS} ns */
export async function main(ns) {
	let attack = "attack.js";
	let burn = "burn.js";
	let skill = ns.getHackingLevel();
	var targets = ns.args.length > 0 ? ns.args : [ "all" ];
	let isBurn = targets[0].toString().match(/burn/i) != null;
	let targetOverride = await ns.read("target.txt");
	if (targetOverride.length > 0) targets = [ ...targetOverride.match(/[^,;\s]+/g) ];
	if (targets[0].toLowerCase().match(/all|burn/i) != null) {
		while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
		var map = JSON.parse(await ns.read("map.txt"));
		targets = map.filter(h => h.rooted && h.hacking <= skill && h.maxMoney > 0).map(h => h.host);	
	}
	else
		targets = targets.filter(t => ns.getServerRequiredHackingLevel(t) <= skill);
	let servers = ns.getPurchasedServers();
	for (let s = 1; s <= servers.length; s++) {
		let name = `s${ns.nFormat(s, "00")}`;
		if (!ns.serverExists(name)) continue;
		ns.killall(name, true);
		let script = isBurn ? burn : attack;
		await ns.scp(script, name);
		let ram = ns.getServerMaxRam(name) - ns.getServerUsedRam(name);
		let per = Math.floor((ram / ns.getScriptRam(script, name)) / targets.length);
		per = per < 1 ? 1 : per;
		for (let t = 0; t < targets.length; t++) {
			ns.print(`running ${script} on ${name} with ${per} threads against ${targets[t]}`);
			ns.exec(script, name, per, targets[t]);
		}
		await ns.sleep(1_000);
	}
}