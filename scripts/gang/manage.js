/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("gang.setMemberTask");
	ns.disableLog("gang.purchaseEquipment");
	ns.disableLog("gang.ascendMember");
	let override = ns.args.find(a => a == "-o") ? ns.args[ns.args.findIndex(a => a == "-o") + 1] : null;
	/** @type {GangGenInfo} */
	var gang = null;
	let getGang = function () { try { gang = ns.gang.getGangInformation(); } catch { gang = null; } return gang != null; };
	/** @param {Array<GangMemberInfo>} currentMembers */
	let getNewMemberName = function (currentMembers) {
		var nextLetter = "A";
		for (let c = 65; c < 77; c++) {
			let letter = String.fromCharCode(c);
			if (currentMembers.filter(m => m.name.match(new RegExp(`^${letter}`, "i"))).length == 0) {
				nextLetter = letter;
				break;
			}
		}
		let possibleNames = Array.from(`
			Alfa,Bravo,Charlie,Delta,Echo,Foxtrot,Golf,Hotel,India,Juliett,Kilo,Lima,
			Armani,Bambi,Ciro,Dom,Enzo,Franco,Gia,Hector,Isabella,Jewels,Klaus,Luca,
			Access,Backdoor,Crash,Daemon,Error,Failsafe,Gridlock,Handle,Inline,JNE,Kernel,Link,
			`.matchAll(new RegExp(`\\b${nextLetter}[^,]+(?=\\S)`, "gi"))).map(n => n.toString().trim());
		return possibleNames[Math.floor(Math.random() * possibleNames.length)];
	};
	var protecting = false;
	if (getGang()) ns.tail(ns.getScriptName(), ns.getHostname(), ...ns.args);
	while (getGang()) {
		/** @type {Array<GangEquipment>} */
		let equipment = ns.gang.getEquipmentNames().map(e => new Object({
			"name": e,
			"type": ns.gang.getEquipmentType(e),
			"cost": ns.gang.getEquipmentCost(e),
			"stats": ns.gang.getEquipmentStats(e),
		}));
		//ns.write("gangequipment.txt", JSON.stringify(equipment));
		let tasks = ns.gang.getTaskNames();
		let justice = tasks.filter(j => ["Ethical Hacking", "Vigilante Justice"].includes(j))[0];
		let training = `Train ${gang.isHacking ? "Hacking" : Math.random() < .66 ? "Combat" : "Hacking"}`
		if (override == "combat") training = "Train Combat";
		let names = ns.gang.getMemberNames();
		/** @type Array<GangMemberInfo> */
		let members = [ ];
		for (let n in names) members.push(ns.gang.getMemberInformation(names[n]));
		let heroes = names.filter(n => n.toUpperCase().startsWith("H"));
		let willProtect = protecting || gang.wantedPenalty < 0.99; // I guess 1 would be full income, and it just goes down to 0 from there
		if (willProtect && !protecting) {
			protecting = true;
			setTimeout(function() { protecting = false; }, 30_000);
		}
		
		// new member loop
		var recruited = false;
		if (ns.gang.canRecruitMember()) {
			recruited = true;
			let name = getNewMemberName(members);
			ns.gang.recruitMember(name);
			ns.tprint(`${name} recruited`);
			await ns.sleep(1);
		}
		if (recruited) continue;

		// equipment loop
		for (let m in members) {
			let member = members[m];
			var filteredEquipment = equipment.filter(eq => eq.type.match(new RegExp(`Rootkit|Vehicle${(gang.isHacking && override != "combat") ? "" : "|Weapon|Armor"}`, "i")));
			if (ns.getPlayer().money > 1e12)
				filteredEquipment.push(...equipment.filter(eq => eq.type.match(/Augmentation/i)));
			filteredEquipment.sort((a, b) => a.cost - b.cost);
			for (let e in filteredEquipment) {
				if (member.upgrades.includes(filteredEquipment[e].name) || filteredEquipment[e].cost > (ns.getPlayer().money * 0.25)) {
					await ns.sleep(1);
					continue;
				} else
					ns.gang.purchaseEquipment(member.name, filteredEquipment[e].name);
				await ns.sleep(1);
			}
		}

		// justice loop
		for (let h in heroes) {
			let member = members.find(m => m.name == heroes[h]);
			if ((gang.isHacking && member.hack < 100) ||
				(!gang.isHacking && (member.str + member.def + member.dex + member.agi) < 360))
				willProtect = false;
			ns.gang.setMemberTask(heroes[h], willProtect ? justice : training);
			await ns.sleep(1);
		}
		
		// combat override task loop
		if (override == "combat") {
			for (let m in members) {
				let member = members[m];
				if (member.name.startsWith("H")) continue;					
				let combatStats = (member.str + member.def + member.dex + member.agi) / 4;
				ns.gang.setMemberTask(member.name,
					(combatStats % 100) <= Math.min(Math.max(Math.max(200_000 - combatStats, 0) / 1000, 0), 100)
						? "Territory Warfare"
						: training);
				await ns.sleep(1);
			}
		}
		
		// hacking task loop
		else if (gang.isHacking) {
			for (let m in members) {
				let member = members[m];
				if (member.name.startsWith("H")) continue;					
				ns.gang.setMemberTask(member.name,
					member.hack >= 3000 ? Math.floor(member.hack / 20) % 2 == 0 ? "Money Laundering" : "Cyberterrorism" :
					member.hack >= 2000 ? "Money Laundering" :
					member.hack >= 750 ? "Fraud & Counterfeiting" :
					member.hack >= (members.length < 8 ? 200 : 175) ? "Identity Theft" :
					member.hack >= 100 ? "Phishing" :
					training);
				await ns.sleep(1);
			}
		}

		// combat task loop
		else {
			for (let m in members) {
				let member = members[m];
				if (member.name.startsWith("H")) continue;					
				let combat = (member.str + member.def + member.dex + member.agi) / 4;
				let warCap = gang.territory < 1 ? 10_000 : -1;
				//let task = ns.getPlayer().money > 1e12 ? "Territory Warfare" : /*make money*/ "Train Combat";
				let task =
					combat > 3000 ? "Human Trafficking" :
					combat > 2000 ? "Traffick Illegal Arms" :
					combat > 500 ? "Armed Robbery" :
					combat > 125 ? "Strongarm Civilians" :
					//combat > 50 ? "Mug People" :
					"Train Combat"; //training;
				if (member.task != task)
					ns.gang.setMemberTask(member.name,
						(combat % 100) < ((Math.max(warCap - combat, 0) / warCap) * 100)
							? task
							: "Territory Warfare");
				await ns.sleep(1);
			}
		}

		ns.print(`${gang.territory < 100 ? "WARN" : "GOOD"} — Territory: ${ns.nFormat(gang.territory, "0.00%")}`);
		ns.print(`${gang.wantedPenalty < .9 ? "FAIL" : gang.wantedPenalty < .99 ? "WARN" : "GOOD"} — Wanted Penalty: -${ns.nFormat(1 - gang.wantedPenalty, "0.0000%")}`);

		// ascension loop
		for (let m in members) {
			let member = members[m];
			let oldStats = [ member.hack_asc_mult, member.str_asc_mult, member.def_asc_mult, member.dex_asc_mult, member.agi_asc_mult, member.cha_asc_mult ];
			let oldTotal = oldStats.reduce((a, b) => a + b);
			let result = ns.gang.getAscensionResult(member.name);
			let nameLen = Math.max(...names.map(n => n.length));
			if (result == undefined) {
				ns.print(`NORM — ${member.name.trim().padStart(nameLen, " ")}  = ${ns.nFormat(oldTotal, "0.00").padStart(7, " ")}`);
				continue;
			} 
			let newStats = [ result.hack, result.str, result.def, result.dex, result.agi, result.cha ];
			let newTotal = newStats.reduce((a, b) => a + b) * (gang.isHacking ? 1.25 : 1);
			ns.print(`${newTotal > 11.5 ? "FAIL" : newTotal > 11 ? "WARN" : newTotal < 8 ? "NORM" : "INFO"} — ${member.name.trim().padStart(nameLen, " ")}  = ${ns.nFormat(oldTotal, "0.00").padStart(7, " ")}  -> ${ns.nFormat(newTotal, "0.00").padStart(7, " ")}`);
			if (newTotal >= 12) { //(oldTotal == 6 ? 10 : 12)) {
				let ascended = ns.gang.ascendMember(member.name);
				let message = ascended == null ? `WARN — GANG — ${member.name.trim()} could not ascend` : `INFO — GANG — ${member.name} has ascended`;
				ns.print(message);
				ns.tprint(message);
				ns.toast(message);
			}
		}

		// combat loop
		// for (let m in members) {

		// }
		
		await ns.sleep(1_000);
	}
}

/**
 * @typedef GangEquipment
 * @type {object}
 * @property {string} name
 * @property {string} type
 * @property {number} cost
 * @property {Array<EquipmentStats>} stats
 */

/**
 * @typedef EquipmentStats
 * @type {object}
 * @property {number} str
 * @property {number} def
 * @property {number} dex
 * @property {number} agi
 * @property {number} cha
 * @property {number} hack
 */