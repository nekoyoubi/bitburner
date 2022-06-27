/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("run");
	/** @type {Array<ServerMap>} */
	let map = JSON.parse(await ns.read("map.txt"));
	let servers = map.filter(h => h.rooted && !h.backdoored && h.host != "home");
	servers.sort((a,b) => a.hacking - b.hacking);
	for (let s in servers) {
		ns.print(`========== backdooring ${servers[s].host} ==========`);
		ns.run("goto.js", 1, servers[s].host);
		await ns.sleep(100);
		await ns.singularity.installBackdoor();
		ns.run("goto.js", 1, "home");
		await ns.sleep(100);
	}
}

/**
 * @typedef ServerMap
 * @type {object}
 * @property {string} host - the hostname of the server
 * @property {string} parent - the hostname of the server's parent server
 * @property {number} ram - the maximum RAM on the server
 * @property {boolean} rooted - true if the player has admin access to the server
 * @property {boolean} backdoored - true if the player has installed a backdoor on the server
 * @property {number} distance - the amount of server hops between the server and "home"
 * @property {number} hacking - the minimum hack skill level required to hack the server
 * @property {number} maxMoney - the maximum amount of money that the server can hold
 * @property {number} minSec - the minimum security level of the server
 * @property {number} growthRate - the grow() rate of the server
 * @property {string} owner - the entity or organization that owns the server
 */