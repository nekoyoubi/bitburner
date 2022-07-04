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
	let getNewMemberName = function () {
		let name = "";
		while(name == "" || ns.gang.getMemberNames().includes(name)) {
			let possibleNames = Array.from(`
				Alfa,Bravo,Charlie,Delta,Echo,Foxtrot,Golf,Hotel,India,Juliett,Kilo,Lima,Mike,November,Oscar,Papa,Quebec,Romeo,Sierra,Tango,Uniform,Victor,Whiskey,X-Ray,Zulu
				Armani,Bambi,Ciro,Dom,Enzo,Franco,Gia,Hector,Isabella,Jules,Klaus,Luca,
				Access,Backdoor,Crash,Daemon,Error,Failsafe,Gridlock,Handle,Inline,JNE,Kernel,Link,
				`.matchAll(new RegExp(`\\b[^,]+(?=\\S)`, "gi"))).map(n => n.toString().trim());
			name = possibleNames[Math.floor(Math.random() * possibleNames.length)];
		}
		return name;
	};
	if (getGang()) ns.tail(ns.getScriptName(), ns.getHostname(), ...ns.args);
	while (getGang()) {
		/** @type {Array<GangEquipment>} */
		let equipment = ns.gang.getEquipmentNames().map(e => new Object({
			"name": e,
			"type": ns.gang.getEquipmentType(e),
			"cost": ns.gang.getEquipmentCost(e),
			"stats": ns.gang.getEquipmentStats(e),
		}));
		let tasks = ns.gang.getTaskNames();
		let justice = tasks.filter(j => ["Ethical Hacking", "Vigilante Justice"].includes(j))[0];
		let training = `Train ${gang.isHacking ? "Hacking" : Math.random() < .75 ? "Combat" : "Hacking"}`
		if (override == "combat") training = "Train Combat";
		/** @type Array<GangMemberInfo> */
		var members = [ ];
		//** @returns {Array<GangMemberInfo>} */
		let getMembers = () => Array.from(ns.gang.getMemberNames().map(n => ns.gang.getMemberInformation(n)));	
		// let heroes = names.filter(n => n.toUpperCase().startsWith("H"));
		// let willProtect = protecting || gang.wantedPenalty < 0.99; // I guess 1 would be full income, and it just goes down to 0 from there
		// if (willProtect && !protecting) {
		// 	protecting = true;
		// 	setTimeout(function() { protecting = false; }, 30_000);
		// }

		// other gangs
		let otherGangNames =
			["NiteSec", "Slum Snakes", "Speakers for the Dead", "Tetrads", "The Black Hand", "The Dark Army", "The Syndicate"]
			.filter(og => og != gang.faction);
		let otherGangs = ns.gang.getOtherGangInformation();
		let ogPower = 1;
		for (let n in otherGangNames) {
			let og = otherGangs[otherGangNames[n]];
			if (og.power > ogPower && og.territory > 0) ogPower = og.power;
		}
		let powerRatio = gang.power / ogPower;

		// new member loop
		members = getMembers();
		if (ns.gang.canRecruitMember()) {
			let name = getNewMemberName();
			ns.gang.recruitMember(name);
			ns.tprint(`INFO — GANG — ${name} recruited`);
			continue;
		}

		// equipment loop
		members = getMembers();
		members.forEach(async member => {
			var filteredEquipment = equipment.filter(eq => eq.type.match(new RegExp(`Rootkit|Vehicle${(gang.isHacking && override != "combat") ? "" : "|Weapon|Armor"}`, "i")));
			if (ns.getPlayer().money > 1e12)
				filteredEquipment.push(...equipment.filter(eq => eq.type.match(/Augmentation/i)));
			filteredEquipment.sort((a, b) => a.cost - b.cost);
			for (let e in filteredEquipment) {
				if (member.upgrades.includes(filteredEquipment[e].name) || filteredEquipment[e].cost > (ns.getPlayer().money * 0.05)) {
					//await ns.sleep(1);
					continue;
				} else {
					ns.gang.purchaseEquipment(member.name, filteredEquipment[e].name);
					//await ns.sleep(1);
				}
			}
		});
		
		// combat override task loop (probably never used again)
		if (override == "combat") {
			members = getMembers();
			members.forEach(member => {
				//await ns.sleep(1);
				let combatStats = (member.str + member.def + member.dex + member.agi) / 4;
				ns.gang.setMemberTask(member.name,
					(combatStats % 100) <= Math.min(Math.max(Math.max(200_000 - combatStats, 0) / 1000, 0), 100)
						? "Territory Warfare"
						: training);
			});
		}
		
		// hacking task loop (probably never used again)
		else if (gang.isHacking) {
			members = getMembers();
			members.forEach(member => {
				//await ns.sleep(1);
				ns.gang.setMemberTask(member.name,
					member.hack >= 3000 ? Math.floor(member.hack / 20) % 2 == 0 ? "Money Laundering" : "Cyberterrorism" :
					member.hack >= 2000 ? "Money Laundering" :
					member.hack >= 750 ? "Fraud & Counterfeiting" :
					member.hack >= (members.length < 8 ? 200 : 175) ? "Identity Theft" :
					member.hack >= 100 ? "Phishing" :
					training);
			});
		}

		// combat task loop
		else {
			let tasks = {
				"combat": "Train Combat",
				"strongarm": "Strongarm Civilians",
				"robbery": "Armed Robbery",
				"arms": "Traffick Illegal Arms",
				"humans": "Human Trafficking",
				"war": "Territory Warfare",
				"threaten": "Threaten & Blackmail",
				"terror": "Terrorism",
				"justice": "Vigilante Justice",
			};
			ns.clearLog();
			members = getMembers();
			members.forEach(member => {
				let combat = (member.str + member.def + member.dex + member.agi) / 4;
				let warCap = gang.territory < 1 ? 10_000 : -1;
				let warRate = ((Math.max(warCap - combat, 0) / warCap) * 100).toFixed(2);
				//ns.print(`  ${ns.nFormat((combat % 100).toFixed(2), "00.00")} < ${ns.nFormat(warRate, "00.00")} — ${member.name}`);
				let canJustice = gang.respect > 200 && combat > 200;
				let trainForWar =
					canJustice &&
					members.length == 12 &&
					gang.territory < .2 &&
					!gang.territoryWarfareEngaged &&
					combat < 5_000;
				let task =
					canJustice && gang.wantedPenalty < 0.995 && member.task == tasks.justice ? tasks.justice :
					canJustice && gang.wantedPenalty < 0.99 ? tasks.justice :
					trainForWar ? tasks.combat :
					combat > 10_000 ? tasks.humans :
					combat > 5000 ? (combat % 10 < 9) ? tasks.humans : tasks.terror :
					combat > 2000 ? (combat % 10 < 7) ? tasks.humans : tasks.terror :
					combat > 1500 ? (combat % 10 < 5) ? tasks.humans : tasks.arms :
					combat > 1000 ? (combat % 10 < 7) ? tasks.arms : tasks.combat :
					combat > 500 ? (combat % 10 < 7) ? tasks.arms : tasks.combat :
					combat > 250 ? (combat % 10 < 5) ? tasks.robbery : tasks.combat :
					combat > 125 ? (combat % 10 < 3) ? tasks.strongarm : tasks.combat :
					tasks.combat;	
				if (member.task != task) {
					if (warCap > 0 && combat > 200 && task != justice && members.length > 7 && powerRatio < 5)
						ns.gang.setMemberTask(member.name,
							(warCap < 0 || (((combat % 100) /* *  was /  powerRatio*/) < warRate)) ? task : tasks.war);
					else
						ns.gang.setMemberTask(member.name, task);
				}
			});
		}

		ns.print(`${powerRatio < 1.5 ? "WEAK" : powerRatio < 2 ? "WARN" : "FAIL"} — Power Ratio: ${ns.nFormat(powerRatio, `0,0${powerRatio < 2 ? ".00" : "a"}%`)}`);
		ns.print(`${gang.territory < 100 ? "WARN" : "GOOD"} — Territory: ${ns.nFormat(gang.territory, "0.00%")}`);
		ns.print(`${gang.wantedPenalty < .9 ? "FAIL" : gang.wantedPenalty < .99 ? "WARN" : "GOOD"} — Wanted Penalty: -${ns.nFormat(1 - gang.wantedPenalty, "0.0000%")}`);

		// ascension loop
		members = getMembers();
		members.forEach(member => {
			let oldStats = [ member.hack_asc_mult, member.str_asc_mult, member.def_asc_mult, member.dex_asc_mult, member.agi_asc_mult, member.cha_asc_mult ];
			let oldTotal = oldStats.reduce((a, b) => a + b);
			let result = ns.gang.getAscensionResult(member.name);
			let nameLen = Math.max(...members.map(m => m.name.length));
			if (result == undefined) {
				ns.print(`NORM — ${member.name.trim().padStart(nameLen, " ")}  = ${ns.nFormat(oldTotal, "0.00").padStart(7, " ")}`);
			} else {
				let newStats = [ result.hack, result.str, result.def, result.dex, result.agi, result.cha ];
				let newTotal = newStats.reduce((a, b) => a + b) * (gang.isHacking ? 1.25 : 1);
				ns.print(`${newTotal > 11.5 ? "FAIL" : newTotal > 11 ? "WARN" : newTotal < 8 ? "NORM" : "INFO"} — ${member.name.trim().padStart(nameLen, " ")}  = ${ns.nFormat(oldTotal, "0.00").padStart(7, " ")}  -> ${ns.nFormat(newTotal, "0.00").padStart(7, " ")}  [${member.task.replaceAll(/[a-z\s]+/g,"")}]`);
				if (newTotal >= 12) { //(oldTotal == 6 ? 10 : 12)) {
					let ascended = ns.gang.ascendMember(member.name);
					let message = ascended == null ? `WARN — GANG — ${member.name.trim()} could not ascend` : `INFO — GANG — ${member.name} has ascended`;
					//ns.print(message);
					ns.tprint(message);
					ns.toast(message);
				}
			}
		});

		// war check
		let warMessage = "";
		if (gang.territory < 1 && powerRatio > 2 && !gang.territoryWarfareEngaged) {
			ns.gang.setTerritoryWarfare(true);
			warMessage = `INFO — GANG — Territory warfare engaged with a ${ns.nFormat(powerRatio, "0%")} power ratio`;
		} else if (gang.territory == 1 && gang.territoryWarfareEngaged) {
			warMessage = `INFO — GANG — Territory warfare disengaged at 100% territory ownership`;
			ns.gang.setTerritoryWarfare(false);
		} else if (powerRatio < 1.75 && gang.territoryWarfareEngaged) {
			warMessage = `FAIL — GANG — Territory warfare disengaged due to a ${ns.nFormat(powerRatio, "0%")} power ratio`;
			ns.gang.setTerritoryWarfare(false);
		}
		if (warMessage != "") { ns.tprint(warMessage); ns.toast(warMessage); }
		
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