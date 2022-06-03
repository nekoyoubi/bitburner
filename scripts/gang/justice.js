/** @param {NS} ns */
export async function main(ns) {
	while(ns.gang.inGang()) {
		let tasks = ns.gang.getTaskNames();
		let justice = tasks.filter(j => ["Vigilante Justice", "Ethical Hacking"].includes(j))[0];
		let members = ns.gang.getMemberNames();
		let heroes = members.filter(m => ["Flash"].includes(m));
		let us = ns.gang.getGangInformation();
		//ns.print(us.wantedPenalty);
		let willProtect = us.wantedPenalty < 0.999; // I guess 1 would be full income, and it just goes down to 0 from there
		for (let h in heroes) {

			ns.gang.setMemberTask(
				heroes[h],
				willProtect ? justice  : `Train ${us.isHacking ? "Hacking" : Math.random() < .66 ? "Combat" : "Hacking"}`);
		}
		await ns.sleep(30_000 * (willProtect ? 2 : 1));
	}
}