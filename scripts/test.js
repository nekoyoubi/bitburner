/** @param {NS} ns */
export async function main(ns) {
	//ns.deleteServer("s00-0");
	ns.deleteServer("s01-0");
	ns.deleteServer("s02-0");
	ns.tprint(ns.getPurchasedServers());
}