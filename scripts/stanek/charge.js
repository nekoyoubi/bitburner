/** @param {NS} ns */
export async function main(ns) {
	//ns.scriptKill(ns.getScriptName(), ns.getHostname());
	let size = ns.args.length == 1 ? parseInt(ns.args[0]) : -1;
	let frags = size > -1 ? [] : ns.args.map((v,i,a) => {
		let xy = v.trim().split(/,/).map((v,i,a) => parseInt(v));
		return xy;
	});
	while (size > 0 || frags.length > 0) {
		try { 
			if (frags.length == 0) {
				for (let y = 0; y < size; y++) {
					for (let x = 0; x < size; x++) {
						try { await ns.stanek.chargeFragment(x, y); } catch { await ns.sleep(1); }
					}
				}
			} else {
				for (let f in frags)
					//try {
						await ns.stanek.chargeFragment(frags[f][0], frags[f][1]);
					//	} catch { await ns.sleep(1); }
			}
		} catch { await ns.sleep(1); }
	}
}