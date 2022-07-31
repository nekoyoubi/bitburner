/** @param {NS} ns */
export async function main(ns) {
	let reserve = ns.args.length > 0 ? parseFloat(ns.args[0]) : 32;
	let host = ns.getHostname();
	let attack = "attack.js";
	//let exclusions = ["home", "darkweb", "CSEC", "avmnite-02h", "I.I.I.I", ".", "run4theh111z", "The-Cave" ];
	let player = ns.getPlayer();
	ns.scriptKill(attack, host);
	let size = ns.getServerMaxRam(host) - ns.getServerUsedRam(host) - reserve;
	let targetFile = ns.read("target.txt");
	/** @type {Array<string>} host names to target */
	var targets = [ ];
	while (!ns.fileExists("map.txt")) await ns.sleep(50);
	/** @type {Array<ServerMap>} */
	let map = JSON.parse(ns.read("map.txt"));
	let allowed = map.filter(h => h.rooted && h.hacking <= (player.skills.hacking * .5) && h.maxMoney > 0);
	if (targetFile.length > 0) {
		targets = [ ...targetFile.match(/[^,;\s]+/g) ];
		allowed = map.filter(h => targets.includes(h.host));
	}
	allowed.sort((a, b) => b.hacking - a.hacking);
	targets = allowed.slice(0, attackScale(size));
	let per = 0;
	for (let t = targets.length - 1; t >= 0; t--) {
		per = Math.floor(size / (ns.getScriptRam(attack, host) * targets.length));
		if (per == 0 && targets.length > 0) {
			targets.pop();
			await ns.sleep(1);
		}
		else break;
	}
	if (per > 0 && targets.length > 0) {
		ns.tprint(`-t ${per} bombing ${targets.length} target${targets.length == 1 ? "" : "s"}: ${targets.map(t => t.host).join(", ")}`);
		for (let t in targets) {
			ns.exec(attack, host, per, targets[t].host);
			await ns.sleep(1);
		}
	}
}

function attackScale(size) { return Math.max(Math.floor(Math.pow(Math.log(size) - 2, 1.25)) + 1, 1); }