/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	let maxServers = 25;//ns.getPurchasedServerLimit();
	let baseCost = 55_000;
	let minSize = 8;
	let maxUpgrade = ns.getPurchasedServerMaxRam(); //65536;
	while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);

	/** @param {number} money */
	let getServerSize = function (money) {
		for (let r = maxUpgrade; r >= minSize; r /= 2) 
			if (r * baseCost >= money * .25) continue;
			else return r;
	}

	/** @param {string} server
	 *  @param {number} size
	 *	@param {Player} player */
	let newServer = async function (server, size, player) {
		await ns.scp("attack.js", server);
		await ns.scp("goto.js", server);
		let targetFile = await ns.read("target.txt");
		/** @type {Array<string>} host names to target */
		var targets = [ ];
		if (targetFile.length > 0) {
			targets = [ ...targetFile.match(/[^,;\s]+/g) ];
		} else {
			/** @type {Array<ServerMap>} */
			let map = JSON.parse(await ns.read("map.txt"));
			let allowed = map.filter(h => h.rooted && h.hacking <= player.hacking && h.maxMoney > 0);
			allowed.sort((a, b) => b.hacking - a.hacking);
			targets = allowed.slice(0, 3).map(h => h.host);
		}
		let per = 0;
		for (let t = targets.length - 1; t >= 0; t--) {
			per = Math.floor(((size - 4) / ns.getScriptRam("attack.js", server)) / targets.length);
			if (per == 0 && targets.length > 0) {
				targets.pop();
				await ns.sleep(1);
			}
			else break;
		}
		if (per > 0) {
			for (let t in targets) {
				ns.exec("attack.js", server, per, targets[t]);
				await ns.sleep(1);
			}
		}
	}

	var maxed = 0;
	while (maxed < maxServers) {
		maxed = 0;
		for (let s = 0; s < maxServers; s++) {
			let server = `s${ns.nFormat(s, "00")}`;
			let player = ns.getPlayer();
			var size = 0;
			if (ns.serverExists(server)) {
				let current = ns.getServerMaxRam(server);
				size = getServerSize(player.money);
				if (size == undefined || size <= current) continue;
				if (current >= maxUpgrade) { maxed++; continue; }
				ns.killall(server);
				ns.deleteServer(server);
				ns.purchaseServer(server, size);
				let message = `INFO — ${server} updated to ${size}GB for ${ns.nFormat(size * baseCost, "$(0.0a)")}`;
				ns.print(message);
				//ns.tprint(message);
				ns.toast(message);
				await newServer(server, size, player);
			} else {
				size = getServerSize(player.money);
				if (size == undefined) continue;
				ns.purchaseServer(server, size);
				let message = `INFO — ${server} purchased with ${size}GB for ${ns.nFormat(size * baseCost, "$(0.0a)")}`;
				ns.print(message);
				//ns.tprint(message);
				ns.toast(message);
				await newServer(server, size, player);
			}
		}
		await ns.sleep(60_000);
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