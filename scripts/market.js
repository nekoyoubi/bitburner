/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("stock.buy");
	ns.disableLog("stock.sell");
	let tradeRate = .1;
	while (true) {
		if (ns.getPlayer().money < 1e12) { await ns.sleep(6_000); continue; }
		let symbols = ns.stock.getSymbols();
		for (let ss in symbols) {
			let symbol = symbols[ss];
			let position = ns.stock.getPosition(symbol);
			let price = ns.stock.getPrice(symbol);
			let maxShares = ns.stock.getMaxShares(symbol);
			let forecast = ns.stock.getForecast(symbol);
			if (position[0] == 0 && forecast >= (.5 + tradeRate)) {
				let bought = ns.stock.buy(symbol, maxShares);
				if (bought > 0) ns.print(`INFO — ${symbol}: bought at ${ns.nFormat(bought, "$0.0a")} for ${ns.nFormat(bought * maxShares, "$0.0a")}`);
				//continue;
			} else if (position[0] > 0 && forecast <= .5 /*&& price > (position[1] * 1.1)*/) {
				let amount = position[0];
				let sold = ns.stock.sell(symbol, amount);
				if (sold > 0) ns.print(`SELL — ${symbol}: sold at ${ns.nFormat(sold, "$0.0a")} for ${ns.nFormat(sold * amount, "$0.0a")}`);
			}
			// if (position[0] == 0 && price < maxBuyPrice) {
			// 	let bought = ns.stock.buy(symbol, maxShares);
			// 	if (bought > 0) ns.print(`${symbol}: bought for ${ns.nFormat(bought, "$0,0")}`);
			// 	//continue;
			// } else if (position[0] > 0 && price > minSellPrice) {
			// 	let sold = ns.stock.sell(symbol, 1e100);
			// 	if (sold > 0) ns.print(`${symbol}: sold for ${ns.nFormat(sold, "$0,0")}`);
			// }
			//let gain = ns.stock.getSaleGain(symbol, position[0], "Long");
			//ns.tprint(`${symbol}: ${gain}`);
		}
		await ns.sleep(6_000);
	}
}