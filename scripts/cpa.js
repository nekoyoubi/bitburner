/** @param {NS} ns */
export async function main(ns) {
	if (!ns.fileExists(ns.args[0])) { if (ns.args.length == 0) ns.tprint(`file ${ns.args[0]} not found`); return; }
	while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
	var map = JSON.parse(await ns.read("map.txt"));
	let targets = map.filter(h => h.rooted).map(h => h.host);	
	for (let t in targets) await ns.scp(ns.args[0], targets[t]);
}