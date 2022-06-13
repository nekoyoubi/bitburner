/** @param {NS} ns */
export async function main(ns) {
	let player = ns.getPlayer();
	/** @type {Array<Augmentation>} */
	var augs = [];
	for (let f in player.factions) {
		let faction = player.factions[f];
		let factionAugs = ns.singularity.getAugmentationsFromFaction(faction);
		for (let fa in factionAugs) {
			let price = ns.singularity.getAugmentationPrice(factionAugs[fa]);
			ns.tprint(`${faction} — ${factionAugs[fa]} — ${ns.nFormat(price, "$(0.0a)")}`);
		}
	}
}

/**
 * @typedef Augmentation
 * @type {object}
 * @property {string} name - the name of the augmentation
 * @property {Array<string>} factions - the factions that offer this augmentation
 * @property {number} price - the cost of this augmentation
 */