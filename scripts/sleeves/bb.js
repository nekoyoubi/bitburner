/** @param {NS} ns */
export async function main(ns) {
	for (let s = 0; s < 8; s++) {
		ns.sleeve.setToBladeburnerAction(s,
			s < 2 ? "Field analysis" :
			s < 4 ? "Diplomacy" :
			s < 7 ? "Infiltrate synthoids" :
			"Recruitment");
	}
}