/** @param {NS} ns */
export async function main(ns) {
	ns.print("==================================================");
	//ns.disableLog("ALL");
	let target = ns.args.length > 0 ? ns.args[0] : ns.getHostname();
	let maxMoney = ns.getServerMaxMoney(target);
	let minMoney = maxMoney * .75;
	let minSec = ns.getServerMinSecurityLevel(target);
	let secOffset = 5;
	var maxSec = minSec + secOffset;
	var secLevel, weakenResult, moneyNow, growResult, hackResult;
	let cores = ns.getServer().cpuCores;
	let threads = ns.getRunningScript().threads;
	while (true) {
		var ht = ns.hackAnalyzeThreads(target, maxMoney / 30);
		var gt = ns.growthAnalyze(target, 2, cores);
		//var wt = ns.weakenAnalyze)target, cores);
		secLevel = ns.getServerSecurityLevel(target);
		moneyNow = ns.getServerMoneyAvailable(target);
		ns.print("==========[ $" + ns.nFormat(moneyNow, "0,0.0a") + " / $" + ns.nFormat(maxMoney, "0,0.0a") + " (S:" + ns.nFormat(secLevel, "0.0") + ") ]==========");
		if (secLevel > maxSec) {
			weakenResult = await ns.weaken(target, { threads: threads });
			ns.print(`weaken -> ${weakenResult}`);
		}
		else if (moneyNow < minMoney) {
			growResult = await ns.grow(target, { threads: gt });
			ns.print(`grow -> ${(growResult-1)*100}%`);
		}
		else {
			hackResult = await ns.hack(target, { threads: ht });
			ns.print(`hack -> ${ns.nFormat(hackResult, "($0,0.0a)")}`);
		}
	}

}