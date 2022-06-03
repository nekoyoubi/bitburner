/** @param {NS} ns */
export async function main(ns) {
	let getProperty = function(p) {
		switch (p) {
			case "h" : return "hacking";
			case "m" :
			case "$" : return "maxMoney";
			case "b" : return "backdoored";
			case "a" : return "rooted";
			case "g" : return "growthRate";
			case "r" : return "ram";
			case "n" : return "host";
			case "o" : return "owner";
			default : return p;
		}
	}

	var order = ns.args.indexOf("/o") > -1 ? ns.args[ns.args.indexOf("/o") + 1] : "";
	if (order == "") order = ns.args.indexOf("\\o") > -1 ? ns.args[ns.args.indexOf("\\o") + 1] : "";
	if (order != "") order = getProperty(order);
	let ascending = ns.args.includes("/o");
	var where = ns.args.indexOf("-w") > -1 ? ns.args[ns.args.indexOf("-w") + 1] : "";
	var limit = ns.args.indexOf("-n") > -1 ? ns.args[ns.args.indexOf("-n") + 1] : "";
	ns.run("map.js"); while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
	/** @type {Array<ServerMap>} */
	var map = JSON.parse(await ns.read("map.txt"));
	if (order != "") {
		map.sort(function(a,b) {
			let v = 0;
			if (["backdoored", "rooted"].includes(order)) {
				v = a[order] - b[order] * - 1;
			} else if (["host", "parent", "owner"].includes(order)) {
				v = a[order].toString() - b[order].toString();
			} else {
				v = a[order] - b[order];
			}
			return v * (ascending ? 1 : -1);
		});
	}
	//else if (order != "") map.sort((a,b) => (a[order] - b[order]) * (["backdoored", "rooted"].includes(order) ? -1 : 1));
	if (where != "") {
		let clause = where.match(/(?<prop>.+?)(?<op>[><=!%]{1,2})(?<val>.+)/);
		if (["==", "="].includes(clause.groups.op)) {
			map = map.filter(m => m[getProperty(clause.groups.prop)] == clause.groups.val);
		} else if (["!=", "<>"].includes(clause.groups.op)) {
			map = map.filter(m => m[getProperty(clause.groups.prop)] != clause.groups.val);
		} else if (clause.groups.op == ">") {
			map = map.filter(m => m[getProperty(clause.groups.prop)] > clause.groups.val);
		} else if (clause.groups.op == "<") {
			map = map.filter(m => m[getProperty(clause.groups.prop)] < clause.groups.val);
		} else if (clause.groups.op == ">=") {
			map = map.filter(m => m[getProperty(clause.groups.prop)] >= clause.groups.val);
		} else if (clause.groups.op == "<=") {
			map = map.filter(m => m[getProperty(clause.groups.prop)] <= clause.groups.val);
		} else if (clause.groups.op == "%") {
			map = map.filter(m => m[getProperty(clause.groups.prop)] % clause.groups.val == 0);
		}
	}
	if (limit != "") map = map.slice(0, limit);
	let nameLen = Math.max(Math.max(...map.map(h => h.host.length)), 9+map.length.toString().length);
	let ownerLen = Math.max(...map.map(h => h.owner.length));
	let ramLen = Math.max(...map.map(h => h.ram.toString().length));
	let moneyLen = Math.max(...map.map(h => ns.nFormat(h.maxMoney, "$(0,0.0a)").length));
	var header = ` [B] [R] | Skill | ${`Server (${map.length})`.padEnd(nameLen, " ")} | ${"Owner".padEnd(ownerLen, " ")} | ${"RAM".padStart(ramLen+2, " ")} | ${"Money".padStart(moneyLen)} | Growth `;
	ns.tprint(` ${"=".repeat(header.length)}`);
	ns.tprint(header);
	ns.tprint(` ${"-".repeat(header.length)}`);
	for (let h in map) {
		let host = map[h];
		let bd = host.host == "home" ? "[*]" : host.backdoored ? "[B]" : "[ ]";
		let rooted = host.host == "home" ? "[*]" : host.rooted ? "[R]" : "[ ]";
		let name = host.host;
		let money = host.maxMoney;
		let ram = host.ram;
		let skill = host.hacking;
		let owner = host.owner;
		let growth = host.growthRate;
		ns.tprint(` ${bd} ${rooted} | ${skill.toString().padStart(5, " ")} | ${name.padEnd(nameLen, " ")} | ${owner.padEnd(ownerLen, " ")} | ${ram.toString().padStart(ramLen, " ")}GB | ${ns.nFormat(money, "$(0,0.0a)").padStart(moneyLen, " ")} | ${growth}`);
	}
	ns.tprint(` ${"=".repeat(header.length)}`);
}

/**
 * @typedef ServerMap
 * @type {object}
 * @property {string} host - the hostname of the server
 * @property {string} parent - the hostname of the server's parent server
 * @property {number} ram - the maximum RAM on the server
 * @property {boolean} rooted - true if the player has admin access to the server
 * @property {boolean} backdoored - true if the player has installed a backdoor on the server
 * @property {number} distance - the amount of server hops between the server and "home"
 * @property {number} hacking - the minimum hack skill level required to hack the server
 * @property {number} maxMoney - the maximum amount of money that the server can hold
 * @property {number} minSec - the minimum security level of the server
 * @property {number} growthRate - the grow() rate of the server
 * @property {string} owner - the entity or organization that owns the server
 */