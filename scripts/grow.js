export async function main(ns) {
	let targets = ns.args.length > 0 ? ns.args : [ ns.getHostname() ]
	while (true) for (let t in targets) await ns.grow(targets[t]);
}