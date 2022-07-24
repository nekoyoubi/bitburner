/** @param {NS} ns */
export async function main(ns) {
	ns.killall("home", true);
	ns.rm("/market/data.txt");
	ns.singularity.installAugmentations("wakeup.js");
}