/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.includes("?")) {
		let targets = [];
		targets.push(...ns.read("target.txt")?.matchAll(/[^,;\s]+/gi));
		ns.tprint(targets);
	}
	else
		ns.write("target.txt", `${ns.args.join("\n")}`, "w");
}