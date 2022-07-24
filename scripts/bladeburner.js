/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.clearLog();
	var lastAction = null;
	const skills = [
		{ "skill": "Overclock", "preference": 100 }, //unused, but I'm thinking about it
	];
	const cityNames = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
	const types = {
		general: "General",
		contract: "Contract",
		operation: "Operation",
		blackop: "BlackOp",
	};
	const general = {
		regen: "Hyperbolic Regeneration Chamber",
		diplomacy: "Diplomacy",
	};
	const contract = {
		tracking: "Tracking",
		bounty: "Bounty Hunter",
		retirement: "Retirement",
	};
	const operation = {
		investigation: "Investigation",
		undercover: "Undercover Operation",
		sting: "Sting Operation",
		raid: "Raid",
		stealth: "Stealth Retirement Operation",
		assassination: "Assassination",
	};
	var blackops = [
		"Operation Typhoon",
		"Operation Zero",
		"Operation X",
		"Operation Titan",
		"Operation Ares",
		"Operation Archangel",
		"Operation Juggernaut",
		"Operation Red Dragon",
		"Operation K",
		"Operation Deckard",
		"Operation Tyrell",
		"Operation Wallace",
		"Operation Shoulder of Orion",
		"Operation Hyron",
		"Operation Morpheus",
		"Operation Ion Storm",
		"Operation Annihilus",
		"Operation Ultron",
		"Operation Centurion",
		"Operation Vindictus",
		"Operation Daedalus",
	]; 
	var doneBlackOps = [];
	const shouldDoOperation = function (operationType, currentAction) {
		return currentAction.name != operationType &&
			ns.bladeburner.getActionCountRemaining(types.operation, operationType) > 0 &&
			Math.min(...ns.bladeburner.getActionEstimatedSuccessChance(types.operation, operationType)) >= 1;
	}
	const shouldDoContract = function (contractType, currentAction) {
		return currentAction.name != contractType &&
			ns.bladeburner.getActionCountRemaining(types.contract, contractType) > 0 &&
			Math.min(...ns.bladeburner.getActionEstimatedSuccessChance(types.contract, contractType)) >= 1;
	}
	const doableBlackOps = function () {
		return blackops.filter(b =>
			!doneBlackOps.includes(b) &&
			ns.bladeburner.getRank() >= ns.bladeburner.getBlackOpRank(b) &&
			Math.min(...ns.bladeburner.getActionEstimatedSuccessChance(types.blackop, b)) >= 1);
	}
	const cityCheck = (city) =>
		ns.bladeburner.getCityCommunities(city) > 20 &&
		ns.bladeburner.getCityEstimatedPopulation(city) > 1_000_000 &&
		ns.bladeburner.getCityChaos(city) < 50;
	while (true) {
		await ns.sleep(1_000);
		let player = ns.getPlayer();
		if (!player.inBladeburner) {
			if (["strength", "defense", "dexterity", "agility"].some(s => player[s] < 100)) continue;
			else ns.bladeburner.joinBladeburnerDivision();
		}
		player = ns.getPlayer();
		if (!player.inBladeburner) continue;
		let skillNames = ns.bladeburner.getSkillNames();
		let currentAction = ns.bladeburner.getCurrentAction();
		let healing = currentAction.name == general.regen;
		if (currentAction.type != types.general) lastAction = currentAction;
		let stam = ns.bladeburner.getStamina();
		let city = ns.bladeburner.getCity();
		let chaos = ns.bladeburner.getCityChaos(city);
		let skillPoints = ns.bladeburner.getSkillPoints();
		
		// city health check
		if (!cityCheck(city)) {
			let newCities = cityNames.filter(c => c != city);
			ns.bladeburner.switchCity(newCities[Math.random() * newCities.length]);
			continue;
		}

		// skill points
		let skillsOrdered = [];
		for (let n in skillNames)
			skillsOrdered.push({ name: skillNames[n], cost: ns.bladeburner.getSkillUpgradeCost(skillNames[n]) });
		skillsOrdered.sort((a, b) => a.cost - b.cost);
		let oc = "Overclock";
		skillsOrdered.forEach(skill => {
			if (skill.cost <= skillPoints && (skill.name == oc ? ns.bladeburner.getSkillLevel(oc) < 90 : true)) {
				ns.bladeburner.upgradeSkill(skill.name);
				skillPoints = ns.bladeburner.getSkillPoints();
			}
		});

		// health
		if (!healing &&
			(player.hp < Math.max(player.max_hp * .25, 10) || stam[0] < (stam[1] * .6))) {
			lastAction = ns.bladeburner.getCurrentAction();
			ns.bladeburner.startAction(types.general, general.regen);
			continue; // yes, I will remove all of these once I'm certain this if-else-if is the structure
		} else if (healing &&
			player.hp > (player.max_hp * .75) && stam[0] > (stam[1] * .8)) {
			if (lastAction != null)
				ns.bladeburner.startAction(lastAction.type, lastAction.name);
			else
				ns.bladeburner.stopBladeburnerAction();
			
			continue;
		}

		// low success check
		else if ([types.contract, types.operation].includes(currentAction.type) &&
			Math.min(...ns.bladeburner.getActionEstimatedSuccessChance(currentAction.type, currentAction.name)) < 1) {
			ns.bladeburner.stopBladeburnerAction();
			continue;
		}

		// busy check
		else if (ns.singularity.isBusy() && !ns.singularity.getOwnedAugmentations(false).includes("The Blade's Simulacrum")) {
			continue;
		}

		// chaos
		else if (currentAction.type != types.blackop &&
			currentAction.name != general.diplomacy && chaos > 20) {
			ns.bladeburner.startAction(types.general, general.diplomacy);
			continue;
		} else if (currentAction.name == general.diplomacy && chaos < 10) {
			if (lastAction != null)
				ns.bladeburner.startAction(lastAction.type, lastAction.name);
			else
				ns.bladeburner.stopBladeburnerAction();
			continue;
		}

		// black ops
		else if (healing || [types.general, types.blackop].includes(currentAction.type)) {
			continue;
		} else if (doableBlackOps().length > 0) { //shouldDoBlackOp(currentAction) != "") {
			let doable = doableBlackOps();
			for (let b in doable)
				if (ns.bladeburner.startAction(types.blackop, doable[b]))
					break;
				else
					doneBlackOps.push(doable[b]);
			//doBlackOp(shouldDoBlackOp(currentAction));
			continue;
		} else if (doableBlackOps() == 0 && doneBlackOps.length == blackops.length) { //shouldDoBlackOp(currentAction) != "") {
			doneBlackOps = [];
			continue;
		}

		// operations
		else if (healing || [types.general, types.contract, types.operation, types.blackop].includes(currentAction.type)) {
			continue;
		} else if (shouldDoOperation(operation.assassination, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.assassination);
			continue;
		} else if (shouldDoOperation(operation.stealth, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.stealth);
			continue;
		//} else if (shouldDoOperation(operation.raid, currentAction)) {
		//	ns.bladeburner.startAction(types.operation, operation.raid);
		//	continue;
		//} else if (shouldDoOperation(operation.sting, currentAction)) {
		//	ns.bladeburner.startAction(types.operation, operation.sting);
		//	continue;
		} else if (shouldDoOperation(operation.undercover, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.undercover);
			continue;
		} else if (shouldDoOperation(operation.investigation, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.investigation);
			continue;
		}

		// contracts
		else if (healing || [types.general, types.contract, types.blackop].includes(currentAction.type)) {
			continue;
		} else if (shouldDoContract(contract.retirement, currentAction)) {
			ns.bladeburner.startAction(types.contract, contract.retirement);
			continue;
		} else if (shouldDoContract(contract.bounty, currentAction)) {
			ns.bladeburner.startAction(types.contract, contract.bounty);
			continue;
		} else if (shouldDoContract(contract.tracking, currentAction)) {
			ns.bladeburner.startAction(types.contract, contract.tracking);
			continue;
		}
		
		// else {
		// 	lastAction = (currentAction.name != general.regen ? ns.bladeburner.getCurrentAction() : null);
		//  	continue;
		// }
	}
}