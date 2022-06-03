/** @param {NS} ns */
export async function main(ns) {
	let threads = ns.getRunningScript().threads;
	let target = ns.args.length > 0 ? ns.args[0] : ns.getHostname();
	while (ns.getServerMoneyAvailable(target) > 0)
		await ns.hack(target, { threads: threads });
}