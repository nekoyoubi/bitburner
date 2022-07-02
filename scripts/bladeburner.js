/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.clearLog();
	var lastAction = null;
	const skillNames = ns.bladeburner.getSkillNames();
	const types = {
		general: "General",
		contract: "Contract",
		operation: "Operation",
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
	const shouldDoOperation = function (operationType, currentAction) {
		return currentAction.name != operationType &&
			ns.bladeburner.getActionCountRemaining(types.operation, operationType) > 50 &&
			Math.min(...ns.bladeburner.getActionEstimatedSuccessChance(types.operation, operationType)) >= 1;
	}
	const shouldDoContract = function (contractType, currentAction) {
		return currentAction.name != contractType &&
			ns.bladeburner.getActionCountRemaining(types.contract, contractType) > 50 &&
			Math.min(...ns.bladeburner.getActionEstimatedSuccessChance(types.contract, contractType)) >= 1;
	}

	while (true) {
		await ns.sleep(1_000);
		let player = ns.getPlayer();
		if (!player.inBladeburner) {
			if (["strength", "defense", "dexterity", "agility"].some(s => player[s] < 100)) continue;
			else ns.bladeburner.joinBladeburnerDivision();
		}
		let currentAction = ns.bladeburner.getCurrentAction();
		let healing = currentAction.name == general.regen;
		if (!healing) lastAction = currentAction;
		let stam = ns.bladeburner.getStamina();
		let city = ns.bladeburner.getCity();
		let chaos = ns.bladeburner.getCityChaos(city);
		let skillPoints = ns.bladeburner.getSkillPoints();
		//let contractNames = ns.bladeburner.getContractNames();

		// skill points
		for (let n in skillNames) {
			let cost = ns.bladeburner.getSkillUpgradeCost(skillNames[n]);
			if (cost <= skillPoints) {
				ns.bladeburner.upgradeSkill(skillNames[n]);
				skillPoints = ns.bladeburner.getSkillPoints();
			}
		}

		// health
		if (!healing &&
			(player.hp < Math.max(player.max_hp * .25, 10) || stam[0] < (stam[1] * .6))) {
			lastAction = ns.bladeburner.getCurrentAction();
			ns.bladeburner.startAction(types.general, general.regen);
			continue; // yes, I will remove all of these once I'm certain this if-else-if is the structure
		} else if (healing &&
			player.hp > (player.max_hp * .75) && stam[0] > (stam[1] * .8)) {
			if (lastAction != null) {
				ns.bladeburner.startAction(lastAction.type, lastAction.name);
			} else {
				ns.bladeburner.stopBladeburnerAction();
			}
			continue;
		}

		else if ([types.contract, types.operation].includes(currentAction.type) &&
			Math.min(...ns.bladeburner.getActionEstimatedSuccessChance(currentAction.type, currentAction.name)) < 1) {
			ns.bladeburner.stopBladeburnerAction();
			continue;
		}

		else if (ns.singularity.isBusy()) {
			continue;
		}

		// chaos
		else if (currentAction.name != general.diplomacy && chaos > 10) {
			ns.bladeburner.startAction(types.general, general.diplomacy);
			continue;
		} else if (currentAction.name == general.diplomacy && chaos < 3) {
			ns.bladeburner.startAction(lastAction.type, lastAction.name);
			continue;
		}

		// operations
		else if (healing || [types.general, types.operation].includes(currentAction.type)) {
			continue;
		} else if (shouldDoOperation(operation.assassination, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.assassination);
			continue;
		} else if (shouldDoOperation(operation.stealth, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.stealth);
			continue;
		} else if (shouldDoOperation(operation.raid, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.raid);
			continue;
		} else if (shouldDoOperation(operation.sting, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.sting);
			continue;
		} else if (shouldDoOperation(operation.undercover, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.undercover);
			continue;
		} else if (shouldDoOperation(operation.investigation, currentAction)) {
			ns.bladeburner.startAction(types.operation, operation.investigation);
			continue;
		}

		// contracts
		else if (healing || [types.general, types.contract].includes(currentAction.type)) {
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