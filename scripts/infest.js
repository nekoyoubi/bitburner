/** @param {NS} ns */
export async function main(ns) {
	let clean = ns.args.length > 0 && ns.args[0].startsWith("clean");
	let dashes = ns.args.length > 0 && ns.args[0].startsWith("-") ? ns.args[0] : "";
	let replicator = "infest.js";
	let script = "attack.js";
	let scriptRam = ns.getScriptRam(script);
	let hosts = ns.scan()
		.filter(host => host != "home" && ns.getServerMaxRam(host) > 0)
		.sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b));
	for (let h = 0; h < hosts.length; h++) {
		let host = hosts[h];
		let ram = ns.getServerMaxRam(host);
		let hasSsh = ns.fileExists("BruteSSH.exe");
		let hasFtp = ns.fileExists("FTPCrack.exe");
		let hasSmtp = ns.fileExists("relaySMTP.exe");
		let portCount = [hasSsh, hasFtp, hasSmtp].filter(b => b).length;
		let rooted = ns.hasRootAccess(host);
		ns.tprint((ns.getHostname() + " -> " + dashes + " " + (rooted ? "[R] " : "[ ] ") + host + "(" + ram + ")").replace("  ", " "));
		if (!rooted && ns.getServerNumPortsRequired(host) <= portCount) {
			ns.tprint("... rooting.");
			if (hasSsh) ns.brutessh(host);
			if (hasFtp) ns.ftpcrack(host);
			if (hasSmtp) ns.relaysmtp(host);
			ns.nuke(host);
		}
		ns.killall(host, true);
		//if (!ns.fileExists(replicator, host) || clean)
		//{
			ns.rm(replicator, host);
			ns.rm(script, host);
			await ns.scp(replicator, host);
			await ns.scp(script, host);
			ns.exec(replicator, host, 1, dashes + "-");
			while (ns.isRunning(replicator, host)) await ns.sleep(10);
			if (ns.getHostname() != "home") ns.rm(replicator);
		//}
		//ns.killall(host, true);
		ns.exec(script, host, Math.floor(ram / scriptRam));
		//if (!ns.isRunning(script, host))
	}
}