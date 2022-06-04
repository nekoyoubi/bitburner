/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		var message = "";
		let invitations = ns.singularity.checkFactionInvitations();
		for (let i in invitations) {
			message = `INFO — auto-joined ${invitations[i]}`;
			ns.singularity.joinFaction(invitations[i]);
			ns.print(message);
			ns.tprint(message);
			ns.toast(message);
		}
		/** @type {Array<ServerMap>} */
		let map = JSON.parse(await ns.read("map.txt"));
		let factionServers = map.filter(h => h.rooted && !h.backdoored && ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].includes(h.host))
		for (let s in factionServers) {
			message = `WARN — backdooring ${factionServers[s].host} for faction invitation`
			ns.print(message);
			ns.singularity.connect(factionServers[s].host);
			await ns.singularity.installBackdoor();
		}
		await ns.sleep(10_000);
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