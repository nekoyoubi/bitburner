/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		let sleeveCount = ns.sleeve.getNumSleeves();
		/** @type {Array<SleeveInformation>} */
		let sleeves = [];
		for (let s = 0; s < sleeveCount; s++)
			sleeves.push(ns.sleeve.getInformation(s));
		for (let s in sleeves) {
			let sleeve = sleeves[s];
			let stats = ns.sleeve.getSleeveStats(s);
			if (stats.sync < 100)
				ns.sleeve.setToSynchronize(s);
			else if (stats.shock < 100)
				ns.sleeve.setToShockRecovery(s);
			// else
			// 	ns.tprint(`Sleeve ${s} is ready`)
		}
		
		await ns.sleep(1000);
	}
}