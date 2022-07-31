/** @param {NS} ns */
export async function main(ns) {
	//let augs = JSON.parse(ns.read("augs.txt"));
	//ns.tprint(augs.map(a => a.name));
	ns.tprint(ns.bladeburner.getActionEstimatedSuccessChance("blackop", "Operation Typhoon"));
	ns.tprint(ns.sleeve.getSleevePurchasableAugs(0));
	//ns.tprint(ns.bladeburner.getActionEstimatedSuccessChance("BlackOp", "Operation K"));
	//ns.tprint(ns.bladeburner.getSkillLevel("Overclock"));
	//ns.tprint(ns.formulas.hacking.growTime(ns.getServer("joesguns"), ns.getPlayer()));
	//ns.tprint(ns.formulas.hacking.hackTime(ns.getServer("joesguns"), ns.getPlayer()));
	//let augs = ns.sleeve.getSleevePurchasableAugs(2);
	//ns.tprint(`${ns.nFormat(augs.filter(a => a.cost < 1e12).reduce((a,b) => a + b.cost, 0), "0.0a")}`);

	// if (ns.hacknet.numHashes() > 4)
	// 	for (let s = 0; s < Math.max(ns.hacknet.numHashes() / 4, 1); s++)
	// 		ns.hacknet.spendHashes("Sell for Money");

	//ns.tprint(ns.getPlayer().("BlackOp", "Operation X"));
	//let otherGangs = ns.gang.getOtherGangInformation();
	//ns.tprint(`${ns.nFormat(ns.bladeburner.getCityEstimatedPopulation("Aevum"), "0,0")}`);
	//ns.tprint(ns.getPlayer().workType);
	//var gang = null;
	//let getGang = function () { try { gang = ns.gang.getGangInformation(); } catch { gang = null;} return gang != null; };
	//ns.tprint(getGang());
	//ns.deleteServer("s00-0");
	//ns.deleteServer("s01-0");
	//ns.deleteServer("s02-0");
	//ns.tprint(Math.abs(new Date() - new Date(new Date() - new Date(ns.getPlayer().playtimeSinceLastBitnode))) / (60*1000));

}

/**
 * @typedef GangEquipment
 * @type {object}
 * @property {string} name
 * @property {string} type
 * @property {number} cost
 * @property {Array<EquipmentStats>} stats
 */

/**
 * @typedef EquipmentStats
 * @type {object}
 * @property {number} str
 * @property {number} def
 * @property {number} dex
 * @property {number} agi
 * @property {number} cha
 * @property {number} hack
 */