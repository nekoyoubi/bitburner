/** @param {NS} ns */
export async function main(ns) {
	for (let s = 0; s < 8; s++) {
		ns.sleeve.setToUniversityCourse(
			s,
			ns.args.includes("-v") ? "ZB Institute of Technology" :
			"Rothman University",
			ns.args.includes("-a") ? "Algorithms" :
			ns.args.includes("-d") ? "Data Structures" :
			ns.args.includes("-n") ? "Networks" :
			"Study Computer Science");
	}
}