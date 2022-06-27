/** @param {NS} ns */
export async function main(ns) {
	let purchaseAugs = ns.args.find(a => a.toString().match(/-[pb]/i)) != undefined;
	let excludeAugs = ns.args.find(a => a.toString().match(/-[xa]/i)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-[xa]/i)) + 1]
		: undefined;
	let excludeFactions = ns.args.find(a => a.toString().match(/-[f]/i)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-[f]/i)) + 1]
		: undefined;
	let rateCap = ns.args.find(a => a.toString().match(/-[r]/i)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-[r]/i)) + 1]
		: 100;
	//ns.tprint(`${excludeFactions} — ${excludeAugs}`);
	var player = ns.getPlayer();
	/** @type {Array<Aug>} */
	var augs = [];
	for (let f in player.factions) {
		let faction = player.factions[f];
		if (excludeFactions != undefined && faction.match(new RegExp(excludeFactions, "gi"))) continue;
		let factionAugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (let fa in factionAugs) {
			let augName = factionAugs[fa];
			if (augName == "NeuroFlux Governor" ||
				excludeAugs != undefined && augName.match(new RegExp(excludeAugs, "gi"))) continue;
			if (augs.find(a => a.name == augName) == undefined)
				augs.push({
					"name": augName,
					"cost": ns.singularity.getAugmentationPrice(augName),
					"rep": ns.singularity.getAugmentationRepReq(augName),
					"prereqs": ns.singularity.getAugmentationPrereq(augName),
					"factions": [ faction ],
					"owned": ns.singularity.getOwnedAugmentations(true).includes(augName),
				});
			else
				augs.find(a => a.name == augName).factions.push(faction);
		}
	}
	let canBuy = augs.filter(a =>
		!a.owned &&
		a.cost <= player.money &&
		a.factions.filter(f => ns.singularity.getFactionRep(f) >= a.rep).length > 0 &&
		a.prereqs.every(p => ns.singularity.getOwnedAugmentations(true).includes(p))
	);
	let buySoA = chooseSoA(canBuy.filter(s => s.name.startsWith("SoA - ")).map(s => s.name));
	if (buySoA != null) canBuy = canBuy.filter(a => !a.name.startsWith("SoA - ") || a.name == buySoA);
	canBuy.sort((a,b) => b.cost - a.cost);
	var money = player.money;
	var multiplier = 1;
	let lens = {
		"name": Math.max(...canBuy.map(a => a.name.length)),
		"cost": 8,
	};
	var augmentsPurchased = 0;
	var moneySpent = 0;
	var output = "";
	var confirmation = false;
	var shoppingList = [];
	let lastCost = 1e50;
	for (let a in canBuy) {
		let aug = canBuy[a];
		let cost = aug.name.startsWith("SoA - ") ? aug.cost : aug.cost * multiplier;
		let faction = aug.factions.filter(f => ns.singularity.getFactionRep(f) >= aug.rep)[0];
		if (money >= cost && cost <= lastCost * rateCap) {
			augmentsPurchased++;
			moneySpent += cost;
			lastCost = cost;
			let message = `${aug.name.padStart(lens.name, " ")} — ${ns.nFormat(cost, "$0.0a").padEnd(lens.cost, " ")} — ${faction}`;
			if (!confirmation) ns.tprint(message);
			output += `${message}\n`;
			money -= cost;
			multiplier *= 1.9;
			if (purchaseAugs) {
				shoppingList.push({"faction": faction, "aug": aug.name});
				//ns.singularity.purchaseAugmentation(faction, aug.name);
			}
		}
	}
	if (purchaseAugs) {
		if (await ns.prompt(output += `\n\nPurchase these ${augmentsPurchased} augmentations for ${ns.nFormat(moneySpent, "$0.0a")}?`, { type: "boolean", choices: ["Yes", "No"]} ))
			for (let a in shoppingList)
				ns.singularity.purchaseAugmentation(shoppingList[a].faction, shoppingList[a].aug);
		else purchaseAugs = false;
	}
	ns.tprint(`========== ${augmentsPurchased} augmentations ${purchaseAugs ? "purchased" : "listed"} for ${ns.nFormat(moneySpent, "$0.0a")} ==========`);
}

function chooseSoA(soas) {
	let order = [
		"SoA - phyzical WKS harmonizer",	// everything
		"SoA - Flood of Poseidon",			// hex board
		"SoA - Hunt of Artemis",			// minesweeper
		"SoA - Knowledge of Apollo",		// wire cutting
		"SoA - Chaos of Dionysus",			// backwards
		"SoA - Wisdom of Athena",			// brackets
		"SoA - Might of Ares",				// combat slash
		"SoA - Beauty of Aphrodite",		// bribe words
		"SoA - Trickery of Hermes",			// arrows
	];
	for (let o in order)
		if (soas.includes(order[o]))
			return order[o];
	return null;
}


/**
 * @typedef Aug
 * @type {object}
 * @property {string} name
 * @property {Array<string>} factions - the factions that offer this
 * @property {number} cost
 * @property {number} rep - the faction reputation required to purchase
 * @property {Array<string>} prereqs - the prerequisite augments required to purchase
 */