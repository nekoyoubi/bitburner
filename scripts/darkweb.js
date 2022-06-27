/** @param {NS} ns */
export async function main(ns) {
	let hoursSinceBN = function() { return Math.abs(new Date() - new Date(new Date() - new Date(ns.getPlayer().playtimeSinceLastBitnode))) / (60*60*1000) }
	var programs = [ 
		{ "program": "BruteSSH",		"priority": 1, "cost": 500_000,			"ratio": 1 },
		{ "program": "FTPCrack",		"priority": 1, "cost": 1_500_000,		"ratio": 1 },
		{ "program": "relaySMTP",		"priority": 1, "cost": 5_000_000,		"ratio": 1 },
		{ "program": "HTTPWorm",		"priority": 2, "cost": 30_000_000,		"ratio": .5 },
		{ "program": "SQLInject",		"priority": 3, "cost": 250_000_000,		"ratio": .5 },
		{ "program": "AutoLink",		"priority": 2, "cost": 1_000_000,		"ratio": .1 },
		{ "program": "DeepScanv1",		"priority": 2, "cost": 500_000,			"ratio": .5 },
		{ "program": "DeepScanv2",		"priority": 3, "cost": 25_000_000,		"ratio": .1 },
		{ "program": "ServerProfiler",	"priority": 3, "cost": 30_000_000,		"ratio": .1 },
		{ "program": "Formulas",		"priority": 4, "cost": 5_000_000_000,	"ratio": .1 },
	];
	programs.sort((a,b) => a.priority - b.priority);
	let done = function() { return programs.find(c => !ns.fileExists(`${c.program}.exe`, "home")) == undefined; }
	while (!done()) {
		let player = ns.getPlayer();
		programs = programs.filter(c => !ns.fileExists(`${c.program}.exe`, "home"));
		if (programs.find(p => p.program == "BruteSSH") != undefined && player.hacking > 50 && hoursSinceBN() < 48)
			ns.singularity.createProgram("BruteSSH.exe", false);
		let available = ns.singularity.getDarkwebPrograms();
		if (available.length == 0 && player.money > 200_000) {
			ns.singularity.purchaseTor();
			await ns.sleep(1000);
			continue;
		} else if (programs.length > 0) {
			let priority = programs.filter(p => p.priority == Math.min(...programs.map(pp => pp.priority)));
			for (let p in priority) {
				let program = priority[p];
				if (program.cost <= player.money * program.ratio) {
					if (ns.singularity.purchaseProgram(`${program.program}.exe`)) {
						ns.tprint(`${program.program} purchased for ${ns.nFormat(program.cost, "$0.0a")}`);
						programs.splice(programs.findIndex(p => p.program == program.program), 1);
					}
					await ns.sleep(1000);
				}
			}
		}
		await ns.sleep(10_000);
	}
}