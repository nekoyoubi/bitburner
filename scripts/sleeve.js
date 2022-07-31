/** @param {NS} ns */
export async function main(ns) {
	let command = ns.args[0];
	if (command.match(/upgrade/i)) {
		if (ns.args.length == 1) {
			ns.tprint(`ERROR — Sleeve upgrade command requires the sleeve index at minimum`);
			return;
		}
		let index = parseInt(ns.args[1]);
		let augs = ns.sleeve.getSleevePurchasableAugs(index).filter(a => a.cost < 1e12);
		ns.tprint(JSON.stringify(augs));
		for (let a in augs) {
			ns.sleeve.purchaseSleeveAug(index, augs[a].name);
		}
	}	
}