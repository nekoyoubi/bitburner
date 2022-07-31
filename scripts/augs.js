/** @param {NS} ns */
export async function main(ns) {
	let purchaseAugs = ns.args.find(a => a.toString().match(/-[b]/i)) != undefined;
	let includeAugs = ns.args.find(a => a.toString().match(/-a/)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-a/)) + 1]
		: ".*";
	let excludeAugs = ns.args.find(a => a.toString().match(/-A/)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-A/)) + 1]
		: "^$";
	let includeFactions = ns.args.find(a => a.toString().match(/-f/)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-f/)) + 1]
		: ".*";
	let excludeFactions = ns.args.find(a => a.toString().match(/-F/)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-F/)) + 1]
		: "^$";
	let expandStats = (arg) => arg
		.replace("all", "hacking|strength|defense|dexterity|agility|charisma")
		.replace("combat", "strength|defense|dexterity|agility");
	let includeStats = ns.args.find(a => a.toString().match(/-s/)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-s/)) + 1]
		: ".*";
	let excludeStats = ns.args.find(a => a.toString().match(/-S/)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-S/)) + 1]
		: "^$";
	let rateCap = ns.args.find(a => a.toString().match(/-[r]/i)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-[r]/i)) + 1]
		: 100;
	let buyMost = ns.args.find(a => a.toString().match(/-m/i)) != undefined;
	let prepurchased = ns.args.find(a => a.toString().match(/-p/i)) != undefined
		? ns.args[ns.args.findIndex(a => a.toString().match(/-p/)) + 1]
		: 0;
	var player = ns.getPlayer();
	/** @type {Array<Aug>} */
	var augs = [];
	for (let f in player.factions) {
		let faction = player.factions[f];
		if (faction.match(new RegExp(includeFactions, "gi")) == null ||
			faction.match(new RegExp(excludeFactions, "gi")))
			continue;
		let factionAugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (let fa in factionAugs) {
			let augName = factionAugs[fa];
			if (augName == "NeuroFlux Governor" ||
				augName.match(new RegExp(includeAugs, "gi")) == null ||
				augName.match(new RegExp(excludeAugs, "gi")))
				continue;
			if (augs.find(a => a.name == augName) == undefined)
				augs.push({
					"name": augName,
					"cost": ns.singularity.getAugmentationPrice(augName),
					"rep": ns.singularity.getAugmentationRepReq(augName),
					"prereqs": ns.singularity.getAugmentationPrereq(augName),
					"factions": [ faction ],
					"stats": ns.singularity.getAugmentationStats(augName),
					"owned": ns.singularity.getOwnedAugmentations(true).includes(augName),
				});
			else
				augs.find(a => a.name == augName).factions.push(faction);
		}
	}
	//await ns.write("augs.txt", JSON.stringify(augs, null, "\t"));
	// I'll have to come back to this... this is just... wrong
	augs = augs.filter(aug => {
		let keys = Object.keys(aug.stats);
//		ns.tprint(aug.stats);
		let good = true;
		if (includeStats.match(/all/gi)) {
			good &&=
				keys.findIndex(k => k.match(/hacking/gi)) > -1 &&
				keys.findIndex(k => k.match(/strength/gi)) > -1 &&
				keys.findIndex(k => k.match(/defense/gi)) > -1 &&
				keys.findIndex(k => k.match(/dexterity/gi)) > -1 &&
				keys.findIndex(k => k.match(/agility/gi)) > -1 &&
				keys.findIndex(k => k.match(/charisma/gi)) > -1;
		}
		if (excludeStats.match(/all/gi)) {
			good &&= !(
				keys.findIndex(k => k.match(/hacking/gi)) > -1 &&
				keys.findIndex(k => k.match(/strength/gi)) > -1 &&
				keys.findIndex(k => k.match(/defense/gi)) > -1 &&
				keys.findIndex(k => k.match(/dexterity/gi)) > -1 &&
				keys.findIndex(k => k.match(/agility/gi)) > -1 &&
				keys.findIndex(k => k.match(/charisma/gi)) > -1);
		}
		if (includeStats.match(/combat/gi)) {
			good &&=
				keys.findIndex(k => k.match(/strength/gi)) > -1 &&
				keys.findIndex(k => k.match(/defense/gi)) > -1 &&
				keys.findIndex(k => k.match(/dexterity/gi)) > -1 &&
				keys.findIndex(k => k.match(/agility/gi)) > -1;
		}
		if (excludeStats.match(/combat/gi)) {
			good &&= !(
				keys.findIndex(k => k.match(/strength/gi)) > -1 &&
				keys.findIndex(k => k.match(/defense/gi)) > -1 &&
				keys.findIndex(k => k.match(/dexterity/gi)) > -1 &&
				keys.findIndex(k => k.match(/agility/gi)) > -1);
		}
		let scrub = (text) => text.replace("all|", "").replace("|all", "").replace("all", "").replace("combat|", "").replace("|combat", "").replace("combat", "");
		let newInclude = scrub(includeStats);
		if (newInclude == "") newInclude = ".*";
		let newExclude = scrub(excludeStats);
		if (newExclude == "") newExclude = "^$";
		//if (aug.name.match(/CashRoot/gi)) {
		//	ns.tprint(`${aug.name}\n${JSON.stringify(aug.stats, null, "  ")}`);
		//}
		let includeRegex = new RegExp(newInclude, "gi");
		let excludeRegex = new RegExp(newExclude, "gi");
		let noStats = Array.from(aug.stats).every(s => s <= 1) && newInclude == ".*";
		let doesInclude = keys.some(k => k.match(includeRegex) && ((aug.stats[k] ?? 1) > 1));
		let doesExclude = keys.every(k => !k.match(excludeRegex) || (k.match(excludeRegex) && ((aug.stats[k] ?? 1) <= 1)));
		// if (noStats || (doesInclude && doesExclude && good)) {
		// 	ns.tprint(`${aug.name}\n${JSON.stringify(aug.stats, null, "  ")}`);
			
		// }
		return (noStats || (doesInclude && doesExclude && good));
	});
	let canBuy = augs.filter(a =>
		!a.owned &&
		a.cost <= player.money &&
		a.factions.some(f => ns.singularity.getFactionRep(f) >= a.rep) &&
		!a.prereqs.some(p => !ns.singularity.getOwnedAugmentations(true).includes(p))
	);
	//let prereqs = canBuy.filter(a => a.prereqs.filter(p => !ns.singularity.getOwnedAugmentations(true).includes(p)));
	//ns.tprint(prereqs);
	//canBuy = canBuy.filter(a => prereqs.includes(a.name));
	let buySoA = chooseSoA(canBuy.filter(s => s.name.startsWith("SoA - ")).map(s => s.name));
	if (buySoA != null) canBuy = canBuy.filter(a => !a.name.startsWith("SoA - ") || a.name == buySoA);
	canBuy.sort((a,b) => b.cost - a.cost).sort((a,b) => a.name.startsWith("SoA - ") - b.name.startsWith("SoA - "));
	let purchaseMap = [];
	//let testBuy = canBuy;
	do {
		if (canBuy.length < 1) break;
		var money = player.money;
		var multRate = (1.9 - (1.9 * .07));
		var multiplier = prepurchased == 0 ? 1 : prepurchased * multRate;
		let lens = {
			"name": Math.max(...canBuy.map(a => a.name.length)),
			"cost": 8,
		};
		var augmentsPurchased = 0;
		var moneySpent = 0;
		var shoppingList = [];
		let lastCost = 1e50;
		for (let a = 0; a < canBuy.length; a++) {
			let aug = canBuy[a];
			if (buyMost && purchaseMap.length > 0 && a == 0) {
				canBuy = canBuy.slice(1);
				continue;
			}
			let cost = aug.name.startsWith("SoA - ") ? aug.cost : aug.cost * multiplier;
			let faction = aug.factions.filter(f => ns.singularity.getFactionRep(f) >= aug.rep)[0];
			/*
			let prereqsNeeded = aug.prereqs.filter(a =>
				prereqs.some(p => p.name == a) &&
				!ns.singularity.getOwnedAugmentations(true).includes(a));
			if (prereqsNeeded.length > 0)
				ns.tprint(`${aug.name} - ${JSON.stringify(prereqsNeeded)}`);
			*/
			if (money >= cost && cost <= lastCost * rateCap /*&& prereqsNeeded.length == 0*/) {
				augmentsPurchased++;
				moneySpent += cost;
				lastCost = cost;
				let message = `${aug.name.padStart(lens.name, " ")} — ${ns.nFormat(cost, "$0.0a").padEnd(lens.cost, " ")} — ${faction}`;
				money -= cost;
				multiplier *= multRate;
				shoppingList.push({ "faction": faction, "aug": aug.name, "cost": cost, "message": message, "stats": aug.stats });
				/*
				if (prereqs.some(p => p.name == aug.name)) {
					prereqs = prereqs.filter(a => a.name != aug.name);	
				}
				*/
			}
		}
		purchaseMap.push(shoppingList);
	} while (buyMost && purchaseMap[purchaseMap.length - 1].length > 1);
	purchaseMap.sort((a, b) => b.length - a.length);
	for (let a in purchaseMap[0])
		ns.tprint(purchaseMap[0][a].message);
	augmentsPurchased = purchaseMap[0]?.length ?? 0;
	if (augmentsPurchased > 0) {
		shoppingList = purchaseMap[0];
		moneySpent = purchaseMap[0].reduce((a, b) => a + b.cost, 0);
		let bigList = purchaseMap[0].reduce((a, b) => a + `${b.message}\n`, "");
		if (purchaseAugs) {
			if (await ns.prompt(bigList + `\nPurchase these ${augmentsPurchased} augmentations for ${ns.nFormat(moneySpent, "$0.0a")}?`, { type: "boolean", choices: ["Yes", "No"]} ))
				for (let a in shoppingList)
					ns.singularity.purchaseAugmentation(shoppingList[a].faction, shoppingList[a].aug);
			else purchaseAugs = false;
		}
	}
	ns.tprint(`========== ${augmentsPurchased} augmentations ${purchaseAugs ? "purchased" : "listed"} for ${ns.nFormat(moneySpent ?? 0, "$0.0a")} ==========`);
	//let gains = [];
	let stats = {};
	for (let a in shoppingList) {
		let aug = shoppingList[a];
		let keys = Object.keys(aug.stats);
		for (let k in keys)
			if ((aug.stats[keys[k]] ?? 1) > 1)
				stats[keys[k]] = 1 + ((stats[keys[k]] ?? 1) - 1) + (aug.stats[keys[k]] - 1);
		//gains.push(stats);
	}
	let statKeys = Object.keys(stats);
	statKeys.sort((a, b) => a.localeCompare(b));
	let statDisplay = [];
	for (let k in statKeys) {
		let keyName = statKeys[k]
			.replace(/[_]/g, " ")
			.replace(/(hacking|strength|defense|dexterity|agility|charisma)$/gi, "$1 Skill")
			.replace(/\b([a-z])/g, m => m.toUpperCase());
		let main = keyName.match(/^\w+/).toString()
			.replace(/Work|Company/, "Company")
		let sub = keyName.match(/(?<=\s).+/).toString().replace("Exp", "XP");
		if (true)
			sub = sub
				.replace("XP", "💡")
				.replace("Skill", "📊")
				.replace("Rep", "❤️")
				.replace(/(?:Node\s)?Money/, "💵"/*"💰""💲"*/)
				.replace("Grow", "📈"/*"↗️"*/)
				.replace("Speed", "⏱️")
				.replace("Analysis", "🕵️")
				.replace("Stamina Gain", "⚡")
				.replace("Max Stamina", "🏃🏽")
				.replace(/Success Chance|Success|Chance/, "🎲");
		statDisplay.push({ "main": main, "sub": sub,"full": keyName,"value": stats[statKeys[k]] - 1 });
	}
	let statLines = [];
	for (let s in statDisplay) {
		let stat = statDisplay[s];
		let valueFormat = `${stat.sub} ${ns.nFormat(stat.value, "0.??%")}`;
		if (statLines.filter(l => l.startsWith(stat.main)).length == 0) {
			statLines.push(`${stat.main} ${valueFormat}`);
		} else {
			let li = statLines.findIndex(l => l.startsWith(stat.main));
			statLines[li] = `${statLines[li]} ${valueFormat}`;
		}
	}
	//ns.tprint(statLines);
	for (let l in statLines)
		ns.tprint(statLines[l]);
	//ns.tprint(`${JSON.stringify(stats, null, "  ")}`);
	ns.tprint(`========== total stats gained ==========`);
	//ns.tprint(JSON.stringify(purchaseMap.map(p => p.length), null, "  "));
	//ns.tprint(`========== all shopping lists ==========`);
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