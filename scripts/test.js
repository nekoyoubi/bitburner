/** @param {NS} ns */
export async function main(ns) {
	//ns.deleteServer("s00-0");
	//ns.deleteServer("s01-0");
	//ns.deleteServer("s02-0");
	ns.tprint(Math.abs(new Date() - new Date(new Date() - new Date(ns.getPlayer().playtimeSinceLastBitnode))) / (60*1000));
}