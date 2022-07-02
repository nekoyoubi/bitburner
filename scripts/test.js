/** @param {NS} ns */
export async function main(ns) {
	//let otherGangs = ns.gang.getOtherGangInformation();
	ns.tprint(ns.bladeburner.getGeneralActionNames());
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