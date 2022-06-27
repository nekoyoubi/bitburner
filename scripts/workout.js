/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	var work = null;
	while (true) {
		let player = ns.getPlayer();
		if (work != null && !player.workType.startsWith("Studying")) break;
		var gym = GYMS.filter(g => g.city == player.city).sort((a,b) => a.cost < b.cost)[0];
		if (gym == undefined && (player.money * .1) > 2_000_000) {
			ns.singularity.travelToCity(GYMS[0].city);
			await ns.sleep(1);
			continue;
		}
		let now = player.strength % 5 == 0 ? 
			player.defense < player.strength ? "def" :
			player.dexterity < player.strength ? "dex" :
			player.agility < player.strength ? "agi" :
			"str" : "str";
		if (now != work) ns.singularity.gymWorkout(gym.name, now, ns.singularity.isFocused());
		work = now;
		await ns.sleep(1);
	}
}

/**
 * @typedef Gym
 * @type {object}
 * @property {string} city
 * @property {string} name
 * @property {number} cost
 */

/** @type {Array<Gym>} */
const GYMS = [
	{ "city": "Sector-12",	"name": "Powerhouse Gym",			"cost": 2400 },
	{ "city": "Aevum",		"name": "Snap Fitness Gym",			"cost": 1200 },
	{ "city": "Volhaven",	"name": "Millenium Fitness Gym",	"cost": 840 },
	{ "city": "Aevum",		"name": "Crush Fitness Gym",		"cost": 360 },
	{ "city": "Sector-12",	"name": "Iron Gym",					"cost": 120 },
];