/** @param {NS} ns */
export async function main(ns) {
	let scripts = [ 
		{ r:16, s:[ "map", ] },
		{ r:32, s:[ "unlock", "[train]", /*"hacknet"*/ ] },
		{ r:64, s:[ /*"servers/buy", "darkweb",*/ "ui/overview", ] },
		{ r:128, s:[ "cct", "factions", "gang/manage", ] },
		{ r:256, s:[ "bladeburner", ] },
	];
	while (scripts.length > 0) {
		let ram = ns.getServerMaxRam("home");
		let able = scripts.filter(s => s.r <= ram);
		let player = ns.getPlayer();
		for (let a in able) {
			for (let s in able[a].s) {
				let action = able[a].s[s];
				if (action == "[train]" && !ns.singularity.isBusy()) {
					ns.singularity.universityCourse("rothman university", "Study Computer Science", false);
				} else if (action == "buyservers" && player.money < 44e6) {
					await ns.sleep(30_000);
				} else {
					ns.run(`${able[a].s[s]}.js`);
				}
			}
		}
		scripts = scripts.filter(s => s.r > ram);
		await ns.sleep(60_000);
	}
	//let scripts = [ , "buyservers" /*"darkweb", "hacknet"*/ ];
}