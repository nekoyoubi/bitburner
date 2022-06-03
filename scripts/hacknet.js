/** @param {NS} ns */
export async function main(ns) {
	var totalNodes = 6;
	var maxLevel = 200;
	var maxRam = 64;
	var maxCore = 16;
	var skip = 0;
	function spend() { return ns.getPlayer().money * .05; };
	while (totalNodes <= 30) {
		while (skip < totalNodes) {
			while (ns.hacknet.numNodes() < totalNodes && spend() > ns.hacknet.getPurchaseNodeCost()) {
				ns.hacknet.purchaseNode();
				await ns.sleep(10);
			}
			for (let n = 0; n < ns.hacknet.numNodes(); n++) {
				let node = ns.hacknet.getNodeStats(n);
				if (node.level >= maxLevel && node.ram >= maxRam && node.cores >= maxCore) { skip++; continue; } else skip = 0;
				while (
					ns.hacknet.getNodeStats(n).level < maxLevel &&
					spend() > ns.hacknet.getLevelUpgradeCost(n, 1) &&
					ns.hacknet.upgradeLevel(n, 1)) await ns.sleep(10);
				while (
					ns.hacknet.getNodeStats(n).level >= maxLevel &&
					ns.hacknet.getNodeStats(n).ram < maxRam &&
					spend() > ns.hacknet.getRamUpgradeCost(n, 1) &&
					ns.hacknet.upgradeRam(n, 1)) await ns.sleep(10);
				while (
					ns.hacknet.getNodeStats(n).level >= maxLevel &&
					ns.hacknet.getNodeStats(n).ram >= maxRam &&
					ns.hacknet.getNodeStats(n).cores < maxCore &&
					spend() > ns.hacknet.getCoreUpgradeCost(n, 1) &&
					ns.hacknet.upgradeCore(n, 1)) await ns.sleep(10);
			}
			if (skip >= totalNodes && totalNodes >= 30) break;
			await ns.sleep(120_000);
		}
		ns.toast(`Hacknet farm (${totalNodes}) complete!`);
		totalNodes += 3;
	}
}