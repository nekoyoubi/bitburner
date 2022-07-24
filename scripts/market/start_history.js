/** @param {NS} ns */
export async function main(ns) {
	let data = ns.stock.getSymbols().map(s => new Object({
		"symbol": s,
		"history": [],
		"maxShares": ns.stock.getMaxShares(s),
	}));
	await ns.write("/market/data.txt", JSON.stringify(data, null, "\t"), "w");
	ns.spawn("/market/history.js", 1);
}