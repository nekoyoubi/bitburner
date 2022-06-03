/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	let type = "Homicide";
	//let type = "Mug someone";
	let start = new Date();
	let done = start.setMinutes(start.getMinutes() + 60);
	while (Date.now() < done) {
		while (!ns.singularity.isBusy())
			ns.singularity.commitCrime(type);
		await ns.sleep(10);
	}
}