/** @param {NS} ns */
export async function main(ns) {
	let upgrade = ns.args.length > 0 ? ns.args[0] : "cash";
	let amount = ns.args.length == 2 ? ns.args[1] : "all";
	let total = ns.hacknet.numHashes();
	amount =
		amount.toString().match(/all|\*/i) ? total :
		amount.toString().match(/^\d*\.?\d*%$/i) ? total * (parseFloat(amount.toString().replace("%","")) / 100) :
		amount;
	if (upgrade.match(/cash/i)) {
		let confirm = await ns.prompt(
			`Sell ${ns.nFormat(amount, "0.00a")} hashes out of ${ns.nFormat(total, "0.00a")} for ${ns.nFormat((amount / 4) * 1e6, "$0.0a")}?`,
			{ type: "boolean", choices: ["Yes", "No"]});
		if (!confirm) amount = 0;
		for (let a = 0; a < (amount / 4); a++)
			ns.hacknet.spendHashes("Sell for Money");
	}
	else if (upgrade.match(/blade\s?burner|bb/i)) {
		let confirm = await ns.prompt(
			`Spend ${ns.nFormat(amount, "0.00a")} hashes out of ${ns.nFormat(total, "0.00a")} on Bladeburner levels and skill points?`,
			{ type: "boolean", choices: ["Yes", "No"]});
		if (!confirm) amount = 0;
		let bbText = "Exchange for Bladeburner ";
		while (confirm && amount > 0) {
			if (!(ns.hacknet.spendHashes(`${bbText}Rank`) && ns.hacknet.spendHashes(`${bbText}SP`))) break;
		}
		//for (let a = 0; a < (amount / 4); a++)
		//	ns.hacknet.spendHashes("Sell for Money");
	}
}