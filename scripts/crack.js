export async function main(ns) {
	for (let h = 0; h < ns.args.length; h++) {
		ns.tprint("ftpcrack: " + await ns.ftpcrack(ns.args[h]));
		ns.tprint("brutessh: " + await ns.brutessh(ns.args[h]));
		ns.tprint("nuke: " + await ns.nuke(ns.args[h]));
		//ns.connect(ns.args[h]);
	}
}