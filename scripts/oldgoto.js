/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args.length == 1 ? ns.args[0].toLowerCase() : "home";
	ns.run("map.js"); while (!ns.fileExists("map.txt") && !ns.isRunning("map.js", "home")) await ns.sleep(50);
	var map = JSON.parse(await ns.read("map.txt"));
	let searched = map.filter(h => h.host.toLowerCase() == target);
	var route = [ ];
	if (searched != undefined && searched.length > 0) route.push(searched[0]);
	else route.push(map.filter(h => h.host.match(new RegExp(target, "i")))[0]);
	if (route.length == 0 || route[0] == undefined) {
		ns.tprint(`ERROR — unable to find anything "${target}" to connect to`);
		return;
	}
	while (route.filter(h => h.host.toLowerCase() == "home").length == 0) {
		route.push(map.filter(h => h.host.toLowerCase() == route.at(-1).parent.toLowerCase())[0])
	}
	route.reverse();
	var command = "h;";
	for (let r in route) {
		let bd = route[r].host == "home" ? "[*]" : route[r].backdoored ? "[B]" : "[ ]";
		let owner = route[r].host == "home" ? "" : `— ${route[r].owner}`;
		if (route[r].host != "home")
			command += `c ${route[r].host};`;
		ns.tprint(`${bd} ${route[r].host} ${owner}`);
	};
	ns.tprint(command += !route.at(-1).backdoored ? "b;" : "");
	const terminalInput = document.getElementById("terminal-input");
	terminalInput.value = command;		
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({target:terminalInput});
	terminalInput[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
	//while (ns.getHostname().toLowerCase() != target) {
		
	//}
}