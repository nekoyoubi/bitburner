/** @param {NS} ns */
export async function main(ns) {
	ns.print("==================================================");
	//ns.disableLog("ALL");
	ns.disableLog("sleep");
	let target = ns.args.length > 0 ? ns.args[0] : ns.getHostname();
	let threads = ns.getRunningScript().threads;
	while (true) {
		let player = ns.getPlayer();
		let server = ns.getServer(target);
		let cores = server.cpuCores;
		let rooted = server.hasAdminRights;
		let maxMoney = server.moneyMax;
		let minMoney = maxMoney * .75;
		let minSec = server.minDifficulty;
		let secLevel = server.hackDifficulty;
		let moneyNow = server.moneyAvailable;
		//let secOffset = minSec * .5;
		var maxSec = minSec + 5; //secOffset;
		//var secLevel, weakenResult, moneyNow, growResult, hackResult;
		if (!rooted) { await ns.sleep(5_000); continue; }
		//else if (server.hackDifficulty > player.hacking) {
		//	await ns.sleep(5_000);
		//	continue;
		//}
		let div = 20;
		let affectStock = false;
		var ht = Math.min(Math.max(Math.floor(ns.hackAnalyzeThreads(target, maxMoney / div)), 1), threads);
		var gt = Math.min(Math.floor(ns.growthAnalyze(target, 1 + (1 / div), cores)), threads);
		//var wt = ns.weakenAnalyze)target, cores);
		ns.print(`WARN — [ ${ns.nFormat(moneyNow, "0,0.0a")} / ${ns.nFormat(maxMoney, "0,0.0a")} (S:${ns.nFormat(secLevel, "0.0")} / ${ns.nFormat(minSec, "0.0")}) ]`);
		if (secLevel > maxSec) {
			//weakenResult = 
			await ns.weaken(target, { threads: threads, stock: true });
			//ns.print(`weaken -> ${weakenResult}`);
		}
		else if (moneyNow < minMoney) {
			//growResult = 
			await ns.grow(target, { threads: /*threads*/gt, stock: affectStock });
			//ns.print(`grow -> ${(growResult-1)*100}%`);
		}
		else {
			//hackResult = 
			await ns.hack(target, { threads: ht, stock: affectStock });
			//ns.print(`hack -> ${ns.nFormat(hackResult, "($0,0.0a)")}`);
		}
		//await ns.sleep(Math.random() * 5_000);
	}

}