/** @param {NS} ns */
export async function main(ns) {
	if (!ns.fileExists(ns.args[0])) { if (ns.args.length == 0) ns.tprint(`file ${ns.args[0]} not found`); return; }
	let script = ns.args[0];
	let threads = ns.args.length == 2 ? ns.args[1] : 1;
	while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
	var map = JSON.parse(await ns.read("map.txt"));
	let targets = map.filter(h => h.rooted).map(h => h.host);	
	var per = 1;
	for (let t in targets) {
		let target = targets[t];
		if (threads == 0) {
			let ram = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
			per = Math.floor(ram / ns.getScriptRam(script, target));
			per = per < 1 ? 1 : per;
		}
		ns.scriptKill(script, target);
		ns.exec(script, target, per);
	}
}