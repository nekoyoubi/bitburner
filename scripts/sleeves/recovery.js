/** @param {NS} ns */
export async function main(ns) {
	for (let s = 0; s < 8; s++) {
		ns.sleeve.setToShockRecovery(s);
	}
}