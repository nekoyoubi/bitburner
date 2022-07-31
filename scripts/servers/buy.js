import * as libConfig from "config.js"

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("exec");
	ns.disableLog("getServerMaxRam");
	ns.disableLog("scp");
	libConfig.init(ns);
	/** @type {Config} */
	let config = libConfig.load();
	let maxServers = config.servers.maxServers ?? ns.getPurchasedServerLimit();
	//let baseCost = 110_000;
	let minSize = config.servers.minSize ?? 8;
	let maxUpgrade = config.servers.maxSize ?? ns.getPurchasedServerMaxRam(); // 65536 // 32768 // 16384 // 8192 // 4096 // 2048 // 1024 // 512 // 256;
	//ns.print(`Maximum server upgrade: ${maxUpgrade} for ${ns.nFormat(baseCost * maxUpgrade, "$(0.0a)")}`);
	while (!ns.fileExists("map.txt")) await ns.sleep(50);

	/** @param {number} money */
	let getServerSize = function (money) {
		for (let r = maxUpgrade; r >= minSize; r /= 2) 
			if (ns.getPurchasedServerCost(r) > money * .25) continue;
			else { minSize = r; return r };
	}

	/** @param {string} server
	 *  @param {number} size
	 *	@param {Player} player */
	let newServer = async function (server, size, player) {
		while (ns.serverExists(server)) { await ns.sleep(100); }
		//while (!ns.serverExists(server)) {
		ns.purchaseServer(server, size);
			//await ns.sleep(1_000);
			//if (!ns.serverExists(server))
			//	await ns.sleep(10_000);
		//}
		await ns.sleep(10);
		while (!ns.serverExists(server)) await ns.sleep(100);
		await ns.scp("attack.js", server);
		await ns.scp("goto.js", server);
		let targetFile = ns.read("target.txt");
		/** @type {Array<string>} host names to target */
		var targets = [ ];
		if (targetFile.length > 0) {
			targets = [ ...targetFile.match(/[^,;\s]+/g) ];
		} else {
			/** @type {Array<ServerMap>} */
			let map = JSON.parse(ns.read("map.txt"));
			let allowed = map.filter(h => h.rooted && h.hacking <= Math.ceil(player.skills.hacking * .5) && h.maxMoney > 0);
			allowed.sort((a, b) => b.hacking - a.hacking);
			targets = allowed.slice(0, attackScale(size)).map(h => h.host);
		}
		let per = 0;
		for (let t = targets.length - 1; t >= 0; t--) {
			per = Math.floor((size / ns.getScriptRam("attack.js", server)) / targets.length);
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
			var size = getServerSize(player.money);
			if (size == undefined) break;
			var cost = ns.getPurchasedServerCost(size);
			if (ns.serverExists(server)) {
				let current = ns.getServerMaxRam(server);
				if (current >= maxUpgrade) { maxed++; continue; }
				if (size == undefined || (size != maxUpgrade && size <= current * 4)) continue;
				while (!ns.deleteServer(server) && ns.serverExists(server)) {
					ns.killall(server);
					await ns.sleep(100);
				}
				let message = `INFO — [${now(true)}] upgrading ${server} to ${size}GB for ${ns.nFormat(cost, "$(0.0a)")}`;
				ns.print(message);
				//ns.tprint(message);
				ns.toast(message.replace(message.match(/\s\[.+?\]/g), ""));
			} else {
				//ns.purchaseServer(server, size);
				//await ns.sleep(10);
				let message = `INFO — [${now(true)}] purchasing ${server} with ${size}GB for ${ns.nFormat(cost, "$(0.0a)")}`;
				ns.print(message);
				//ns.tprint(message);
				ns.toast(message.replace(message.match(/\s\[.+?\]/g), ""));
			}
			await newServer(server, size, player);
		}
		await ns.sleep(1_000);
	}
}

function now(timeOnly) { return (new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60 * 1000))).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ").replace(/^(\S+?)\s/g, timeOnly ? "" : "\$1 "); }

function attackScale(size) { return Math.max(Math.floor(Math.pow(Math.log(size) - 2, 1.25)) + 1, 1); }

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