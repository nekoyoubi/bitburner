/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	let cityFactions = [ 
		{ "group": 1, "city": "Sector-12" },
		{ "group": 1, "city": "Aevum" },
		{ "group": 2, "city": "Volhaven" },
		{ "group": 3, "city": "Chongqing" },
		{ "group": 3, "city": "New Tokyo" },
		{ "group": 3, "city": "Ishima" }
	];
	let backdoorServers = [ "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z" ];
	let autoHackFactions = [ "CyberSec", "NiteSec", "Tian Di Hui", "The Black Hand", "BitRunners", "Daedalus" ];
	//let noJoinNotify = [];
	let cityFactionGroup = 0;
	while (true) {
		var message = "";
		let invitations = ns.singularity.checkFactionInvitations();
		let factions = ns.getPlayer().factions;
		if (cityFactionGroup == 0)
			cityFactionGroup = cityFactions.find(c => factions.includes(c.city))?.group ?? cityFactionGroup;
		for (let i in invitations) {
			let faction = invitations[i];
			let city = cityFactions.find(c => c.city == faction);
			if (city != undefined && city.group != cityFactionGroup)// {
			//if (cityFactions.find(c => c.city == faction)?.group ?? cityFactionGroup != cityFactionGroup) {
				//if (!noJoinNotify.includes(faction)) {
				//	ns.print(`FAIL — not auto-joining ${faction}`);
				//	noJoinNotify.push(faction);
				//}
				continue;
			//}
			message = `INFO — auto-joined ${faction}`;
			ns.singularity.joinFaction(faction);
			if (autoHackFactions.includes(faction)) {
				ns.singularity.workForFaction(faction, "Hacking Contracts", ns.singularity.isFocused());
			}
			ns.print(message);
			ns.tprint(message);
			ns.toast(message);
		}
		/** @type {Array<ServerMap>} */
		let map = JSON.parse(await ns.read("map.txt"));
		let factionServers = map.filter(h => h.rooted && !h.backdoored && backdoorServers.includes(h.host))
		for (let s in factionServers) {
			message = `WARN — backdooring ${factionServers[s].host} for faction invitation`
			ns.print(message);
			ns.run("goto.js", 1, factionServers[s].host);
			await ns.sleep(1000);
			await ns.singularity.installBackdoor();
			ns.run("goto.js", 1, "home");
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