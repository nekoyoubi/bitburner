/** @param {NS} ns */
export async function main(ns) {
	let factor = ns.args.length > 0 ? parseFloat(ns.args[0]) : 1;
	let attack = "attack.js";
	let exclusions = ["home", "darkweb", "CSEC", "avmnite-02h", "I.I.I.I", ".", "run4theh111z", "The-Cave" ];
	let mapFile = "map.txt";
	//if (!ns.fileExists(mapFile))
	ns.run("map.js");
	while (!ns.fileExists(mapFile) && !ns.isRunning("map.js", "home")) await ns.sleep(50);
	var map = JSON.parse(await ns.read(mapFile));
	let hackingLevel = ns.getHackingLevel();
	var targets = map.filter(m =>
		!exclusions.includes(m.host) &&
		m.rooted &&
		m.hacking <= hackingLevel &&
		m.maxMoney > 0);
	targets.sort((a,b) => b.maxMoney - a.maxMoney);
	ns.scriptKill(attack, ns.getHostname());
	ns.tprint(`attempting to bomb ${targets.length} targets`);
	for (let t in targets) {
		let target = targets[t];
		let threads = Math.floor((target.ram > 0 ? target.ram : 32) * factor);
		threads = threads > 0 ? threads : 1;
		//if (ns.getServerRequiredHackingLevel(target.host) > ns.getHackingLevel()) continue;
		ns.tprint(`${target.host} -t ${threads}`);
		ns.run(attack, threads, target.host);
	}
}