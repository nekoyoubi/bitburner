/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.clearLog();
	let canSpend = () => (ns.getPlayer().money * .25);
	//** @type {Array<NodeStats>} */
	var nodes = [];
	while (true) {
		await ns.sleep(10);
		let config = JSON.parse(ns.read("config.txt"));
		// sell excess hash
		let globalProduction = (ns.hacknet.numNodes() > 0) // estimating for now
			? ns.hacknet.getNodeStats(0).production * ns.hacknet.numNodes()
			: 0;
		//let globalProduction = nodes.reduce((a, b) => a.production + b.production, 0);
		if (ns.hacknet.numHashes() > ns.hacknet.hashCapacity() * .995)
			for (let s = 0; s < Math.max(Math.ceil(globalProduction / 4), 1); s++)
				ns.hacknet.spendHashes("Sell for Money");

		// bounce early if we're no longer buying/upgrading
		if (!config.hacknet.upgrade) continue;

		// buy a node
		if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes() && ns.hacknet.getPurchaseNodeCost() < (canSpend() * 3))
			ns.hacknet.purchaseNode();
		
		// upgrade a node
		//** @type {Array<NodeStats>} */
		nodes = [];
		for (let n = 0; n < ns.hacknet.numNodes(); n++) {
			let node = ns.hacknet.getNodeStats(n);
			node.index = parseInt(node.name.replaceAll(/\D+/gi, ""));
			node.upgradeLevelCost = ns.hacknet.getLevelUpgradeCost(node.index, 1);
			node.upgradeRamCost = ns.hacknet.getRamUpgradeCost(node.index, 1);
			node.upgradeCoreCost = ns.hacknet.getCoreUpgradeCost(node.index);
			node.upgradeCacheCost = ns.hacknet.getCacheUpgradeCost(node.index);
			node.minUpgradeCost = Math.min(node.upgradeLevelCost, node.upgradeRamCost, node.upgradeCoreCost, node.upgradeCacheCost);
			node.minUpgradeType =
				node.minUpgradeCost == node.upgradeLevelCost ? "level" :
				node.minUpgradeCost == node.upgradeRamCost ? "ram" :
				node.minUpgradeCost == node.upgradeCoreCost ? "core" :
				node.minUpgradeCost == node.upgradeCacheCost ? "cache" :
				"";
			nodes.push(node);
		}
		//nodes.sort((a, b) => a.totalProduction - b.totalProduction);
		nodes = nodes.filter(n => n.minUpgradeCost != Infinity);
		nodes.sort((a, b) => a.minUpgradeCost - b.minUpgradeCost);
		//for (let n in nodes) {
			let node = nodes[0];//n];
			if (node.minUpgradeCost < canSpend()) {
				if (node.minUpgradeType == "level")
					ns.hacknet.upgradeLevel(node.index, 1);
				else if (node.minUpgradeType == "ram")
					ns.hacknet.upgradeRam(node.index, 1);
				else if (node.minUpgradeType == "core")
					ns.hacknet.upgradeCore(node.index, 1);
				else if (node.minUpgradeType == "cache")
					ns.hacknet.upgradeCache(node.index, 1);
			}
		//}
	}
}