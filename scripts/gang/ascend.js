/** @param {NS} ns */
export async function main(ns) {
	if (!ns.gang.inGang()) return;
	while (true) {
		let names = ns.gang.getMemberNames();
		for (let n in names) {
			let member = ns.gang.getMemberInformation(names[n]);
			let oldStats = [ member.hack_asc_mult, member.str_asc_mult, member.def_asc_mult, member.dex_asc_mult, member.agi_asc_mult, member.cha_asc_mult ];
			//ns.tprint(`${names[n]} = ${JSON.stringify(oldStats)}`);
			let result = ns.gang.getAscensionResult(names[n]);
			if (result == undefined) break;
			let newStats = [ result.hack, result.str, result.def, result.dex, result.agi, result.cha ];
			//ns.tprint(`${names[n]} = ${JSON.stringify(newStats)}`);
			let oldTotal = oldStats.reduce((a, b) => a + b);
			let newTotal = newStats.reduce((a, b) => a + b);
			let nameLen = Math.max(...names.map(n => n.length));
			ns.print(`${newTotal > 11.5 ? "ERROR" : newTotal > 11 ? "WARN " : newTotal < 8 ? "GREEN" : "INFO "} — ${names[n].padStart(nameLen, " ")}  = ${ns.nFormat(oldTotal, "0.00").padStart(7, " ")}  -> ${ns.nFormat(newTotal, "0.00").padStart(7, " ")}`);
			if (newTotal > 12) {
				let ascended = ns.gang.ascendMember(names[n]);
				let message = ascended == null ? `WARN — GANG — ${names[n]} could not ascend` : `INFO — GANG — ${names[n]} has ascended`;
				ns.print(message);
				ns.tprint(message);
				ns.toast(message);
			}
		}
		await ns.sleep(30_000);
	}
}