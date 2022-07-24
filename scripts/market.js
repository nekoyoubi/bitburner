/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("stock.buy");
	ns.disableLog("stock.short");
	ns.disableLog("stock.sell");
	ns.disableLog("stock.sellShort");
	ns.disableLog("stock.purchase4SMarketDataTixApi");
	//let symbols = ns.stock.getSymbols();
	let hold = 20;
	let rate = .10;
	let maxAvailable = 100_000_000;
	const FEE = 100_000;
	//let tradeRate = .1;
	//let monitor = ["BLD","JGN","FLCM","FNS","FSIG"];
	const worth = () => ns.getPlayer().money + data.reduce((a, v) => a.invested + v.invested, 0);
	let readyNow = false;
	while (true) {
		await ns.sleep(6_000);
		/** @type {Array<Stock>} */
		let data = JSON.parse(await ns.read("/market/data.txt"));
		data.forEach(s => {
			s.price = ns.stock.getPrice(s.symbol);//ns.stock.getPrice(s.symbol);
			s.position = ns.stock.getPosition(s.symbol);
			s.investedLong = s.position[0] * s.position[1];
			s.investedShort = s.position[2] * s.position[3];
			s.investedTotal = s.investedLong + s.investedShort;
			s.highest = (amount) => s.history.length == 0 ? -1.0 : s.history.slice(0, amount).reduce((a, h) => h > a ? h : a, 0.0);
			s.lowest = (amount) => s.history.length == 0 ? -1.0 : s.history.slice(0, amount).reduce((a, h) => h < a ? h : a, 1e999);
			s.average = (amount) => s.history.length == 0 ? -1.0 : s.history.slice(0, amount).reduce((a, h) => a + h, 0) / (amount ?? s.history.length);
			s.deviation = (amount) => s.history.length == 0 ? -1.0 : s.history.slice(0, amount).map((v, i, a) => i == 0 ? undefined : Math.abs(v - a[i - 1])).slice(1);
			s.deviationAverage = (amount) => s.history.length == 0 ? -1.0 : s.deviation(amount).reduce((a, h) => a + h, 0) / s.deviation(amount).length;
			s.flux = (amount) => (s.deviationAverage(amount) / s.average(amount));
			s.growth = (amount) => s.history.length == 0 ? -1.0 : s.history.slice(0, amount + 1).map((v, i, a) => v > a[i - 1] ? 0 : 1).slice(1).reduce((a, g) => a + g, 0);
			s.growthPercentage = (amount) => s.growth(amount) / (amount ?? s.history.length);
			// let ar = [100,102,103,104,105,107,109,106,109,103];
			// let rm = ar.map((v,i,a) => i == 0 ? 0 : Math.abs(v - a[i-1]));
			// let av = ar.reduce((a,b) => a + b, 0) / ar.length;
			// let avd = rm.reduce((a,b) => a + b, 0) / ar.length;
			// let mx = rm.reduce((a,b) => a > b ? a : b, 0);
			// console.log(ar);
			// console.log(rm);
			// console.log(av);
			// console.log(mx);
			// console.log(avd/av);
			s.ready = s.history.length >= hold;
			s.forecast = (amount) => {
				amount ??= 10;
				if (ns.getPlayer().has4SDataTixApi) {
					return ns.stock.getForecast(s.symbol);
				} else { return null; }
				// } else if (s.history.length > amount) {
				// 	//ns.print(`${s.symbol} - ${(1 - ((s.average(amount) / s.average()) * .5))}`)
				// 	return (1 - ((s.average(amount) / s.average()) * .5));
				// 	//return 1.0 - ((s.price - s.lowest) / (s.highest - s.lowest));
				// 	//return (this.average/this.price);
				// } else {
				// 	return .5;
				// }
			}
		});
		//ns.clearLog();
		ns.stock.purchase4SMarketDataTixApi();
		//data.sort((a, b) => Math.random()-.5);
		data.sort((a, b) => a.flux(20) - b.flux(20));
		//data.sort((a, b) => a.average(20) - b.average(20));
		//let orders = ns.stock.getOrders();
		//data.sort((a, b) => a.price - b.price);
		for (let d in data/*.slice(0, data.length/2)*/) {
			if (data[d].ready && !ns.getPlayer().has4SDataTixApi) {
				// let orderAdjust = .05;
				// if (orders[data[d].symbol] == undefined && data[d].position[0] == 0 && data[d].growth(10) < .5)
				// 	ns.stock.placeOrder(
				// 		data[d].symbol, 
				// 		5e6 / (data[d].price * (1 - orderAdjust)), 
				// 		data[d].price * (1 - orderAdjust),
				// 		"Limit Buy Order",
				// 		"Long");
				// else if (orders[data[d].symbol] == undefined && data[d].position[0] > 0 && data[d].growth(10) > .5)
				// 	ns.stock.placeOrder(
				// 		data[d].symbol,
				// 		data[d].position[0],
				// 		data[d].price * (1 + orderAdjust),
				// 		"Limit Sell Order",
				// 		"Long");
				// else if (orders[data[d].symbol] != undefined) {
				// 	let order = orders[data[d].symbol][0];
				// 	if (order.type.match(/Buy/g) && order.price < (data[d].price * .5) ||
				// 		order.type.match(/Sell/g) && order.price > (data[d].price * 1.5))
				// 		ns.stock.cancelOrder(data[d].symbol, order.shares, order.price, order.type, order.position);		
				// }
				//continue;
				// let price = 0;
				// if (ns.stock.getSaleGain(data[d].symbol, data[d].position[0], "L") > ((data[d].investedLong * 1.25) + FEE))
				// 	price = ns.stock.sell(data[d].symbol, data[d].position[0]);
				// if (ns.stock.getSaleGain(data[d].symbol, data[d].position[2], "S") < ((data[d].investedShort * .75) + FEE))
				// 	price = ns.stock.sellShort(data[d].symbol, data[d].position[2]);
				
				let money = () => Math.max(ns.getPlayer().money * .1, 5e6);
				let growth = data[d].growth(10);
				//let growth = (data[d].average(10) / data[d].average(20));
				//ns.print(growth);
				let long = data[d].position[0];
				let short = data[d].position[2];
				if (growth >= 8 && long == 0 /*&& data[d].price < data[d].average(10)*/) {
					let shares = Math.floor(money() / data[d].price);
					//if ((shares * data[d].price) > 5_000_000) {
						let price = ns.stock.buy(data[d].symbol, shares);
						if (price > 0) {
							ns.print(`WARN — ${data[d].symbol.padEnd(5, " ")} — [L] bought ${shares} shares for ${ns.nFormat(price * shares, "$0.00a")} (${ns.nFormat(price, "$0.00a")})`)
							continue;
						}
					//}
				} else if (growth <= 6 && long > 0 /*&& (data[d].price > (data[d].position[1] * 1.1))*/) {				
					let shares = long;
					let position = data[d].position[1];
					let price = ns.stock.sell(data[d].symbol, shares);
					if (price > 0) {
						let gain = ns.nFormat(price / position, "0%");
						let formattedPrice = ns.nFormat(price, "$0.00a");
						let total = ns.nFormat(price * shares, "$0.00a");
						ns.print(`SELL — ${data[d].symbol.padEnd(5, " ")} — [L] sold ${shares} shares for ${total} (${formattedPrice}; +${gain})`);
						continue;
					}
				}
				if (false && growth <= 2 && short == 0 /*&& data[d].price > data[d].average(10)*/) {
					let shares = Math.floor(money() / data[d].price);
					//if ((shares * data[d].price) > 5_000_000) {
						let price = ns.stock.short(data[d].symbol, shares);
						if (price > 0) {
							ns.print(`WARN — ${data[d].symbol.padEnd(5, " ")} — [S] bought ${shares} shares for ${ns.nFormat(price * shares, "$0.00a")} (${ns.nFormat(price, "$0.00a")})`)
							continue;
						}
					//}
				} else if (growth >= 4 && short > 0 /*&& (data[d].price < (data[d].position[3] * .9))*/) {				
					let shares = short;
					let position = data[d].position[3];
					let price = ns.stock.sellShort(data[d].symbol, shares);
					if (price > 0) {
						let gain = ns.nFormat(position / price, "0%");
						let formattedPrice = ns.nFormat(price, "$0.00a");
						let total = ns.nFormat(price * shares, "$0.00a");
						ns.print(`SELL — ${data[d].symbol.padEnd(5, " ")} — [S] sold ${shares} shares for ${total} (${formattedPrice}; +${gain})`);
						continue;
					}
				}/**/
				continue;
			}
			//if (d < 20) ns.print(`${data[d].symbol} - flux:${data[d].flux(10)}/${data[d].flux()}`);
			//data[d].history.push(data[d].price);
			//if (data[d].history.length > hold)
			//	data[d].history = data[d].history.slice(1);
			// if (monitor.includes(data[d].symbol)) {
			// 	let status =
			// 		data[d].price > data[d].average * 1.1 ? "FAIL — SELL" :
			// 		data[d].price < data[d].average * .9 ? "WARN — BUY " :
			// 		"INFO — MEH ";
			// 	let price = ns.nFormat(data[d].price, "$0.00a").padStart(8, " ");
			// 	let min = ns.nFormat(data[d].lowest, "$0.00a").padStart(8, " ");
			// 	let max = ns.nFormat(data[d].highest, "$0.00a").padStart(8, " ");
			// 	let forecast = data[d].forecast;
			// 	ns.print(`${status} — ${data[d].symbol.padStart(4, " ")} — ${price} (MIN:${min} / MAX:${max}) ${forecast}`);
			// }
			if (data[d].ready) {
				let sym = data[d].symbol;
				//if (data[d].symbol == "MGCP") ns.print(`MGCP => ${data[d].forecast()}`);
				if (!readyNow) { ns.clearLog(); readyNow = true; }
				if (data[d].position[0] == 0 /*&& data[d].price == data[d].lowest(range)*/ && (data[d].forecast() ?? 1) > .5) {
					//ns.print(`LB-${data[d].symbol}`);
					let available = ns.getPlayer().money * .1 > maxAvailable ? maxAvailable : ns.getPlayer().money * .1;
					let shares = Math.floor(available / data[d].price);
					let cost = shares * data[d].price;
					if (cost > 5_000_000) {
						ns.print(`WARN — ${data[d].symbol.padEnd(4, " ")} — buying ${shares} shares in long for ${ns.nFormat(cost, "$0.00a")} (${ns.nFormat(data[d].price, "$0.00a")})`)
						ns.stock.buy(data[d].symbol, shares);
					}
				} else if (data[d].position[0] > 0 /*&& data[d].price == data[d].highest(range)*/ && (data[d].forecast() ?? 0) < .5) {
					//ns.print(`LS-${data[d].symbol}`);
					let shares = data[d].position[0];
					let position = data[d].position[1];
					if (data[d].symbol == "MGCP") {
						ns.print(`pos:${position} - ${data[d].price} > ${position * (1+rate)}`);
					}
					if (data[d].price > (position * (1 + rate))) {
						let price = ns.stock.sell(data[d].symbol, shares);
						let gain = ns.nFormat(price / position, "0%");
						let formattedPrice = ns.nFormat(price, "$0.00a");
						let total = ns.nFormat(price * shares, "$0.00a");
						if (price > 0)
							ns.print(`SELL — ${data[d].symbol.padEnd(4, " ")} — sold ${shares} shares in long for ${total} (${formattedPrice}; +${gain})`);
					}
				}
				//if (data[d].position[2] == 0 && data[d].price == data[d].highest) {
				if (data[d].position[2] == 0 /*&& data[d].price == data[d].highest(range)*/ && (data[d].forecast() ?? 0) < .5) {
					//ns.print(`SB-${data[d].symbol}`);
					let available = ns.getPlayer().money * .1 > maxAvailable ? maxAvailable : ns.getPlayer().money * .1;
					let shares = Math.floor(available / data[d].price);
					let cost = shares * data[d].price;
					if (cost > 5_000_000) {
						ns.print(`WARN — ${data[d].symbol.padEnd(4, " ")} — buying ${shares} shares in short for ${ns.nFormat(cost, "$0.00a")} (${ns.nFormat(data[d].price, "$0.00a")})`)
						ns.stock.short(data[d].symbol, shares);
					}
				} else if (data[d].position[2] > 0 /*&& data[d].price == data[d].lowest(range)*/ && (data[d].forecast() ?? 1) > .5) {
					//ns.print(`SS-${data[d].symbol}`);
					let shares = data[d].position[2];
					let position = data[d].position[3];
					//ns.stock.getSaleGain(data[d].symbol, shares, "Short") >
					if (data[d].price < (position * (1 - rate))) {
						let price = ns.stock.sellShort(data[d].symbol, shares);
						let gain = ns.nFormat(position / price, "0%");
						let formattedPrice = ns.nFormat(price, "$0.00a");
						let total = ns.nFormat(price * shares, "$0.00a");
						if (price > 0)
							ns.print(`SELL — ${data[d].symbol.padEnd(4, " ")} — sold ${shares} shares in short for ${total} (${formattedPrice}; +${gain})`);
					}
				}
			} else {
				ns.clearLog();
				ns.print(`   ===== READY IN ${((hold - data[d].history.length) * 6) / 60} minutes (${ns.nFormat(data[d].history.length / hold, "0%")}) =====   \n`)
			}
		}
		continue;
		//if (ns.getPlayer().money < 1e6) { await ns.sleep(6_000); continue; }
		for (let ss in symbols) {
			let symbol = symbols[ss];
			let position = ns.stock.getPosition(symbol);
			//let price = ns.stock.getPrice(symbol);
			//let maxShares = ns.stock.getMaxShares(symbol);
			//let forecast = ns.stock.getForecast(symbol);
			if (false) {//position[0] < maxShares && forecast >= (.5 + tradeRate)) {
				let available = maxShares - position[0];
				let buy = Math.min(available, (ns.getPlayer().money * .5) / price);
				//let buy = (maxShares - position[0]);
				if ((buy * price) < 500_000) continue;
				let bought = ns.stock.buy(symbol, buy);
				if (bought > 0) ns.print(`INFO — ${symbol}: bought at ${ns.nFormat(bought, "$0.0a")} for ${ns.nFormat(bought * buy, "$0.0a")}`);
				//continue;
			} else if (position[0] > 0 && forecast <= .5 /*&& price > (position[1] * 1.1)*/) {
				let amount = position[0];
				let sold = ns.stock.sell(symbol, amount);
				if (sold > 0) ns.print(`WARN — ${symbol}: sold at ${ns.nFormat(sold, "$0.0a")} for ${ns.nFormat(sold * amount, "$0.0a")}`);
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

/**
 * @typedef Stock
 * @type {object}
 * @property {string} symbol
 * @property {Array<number>} history
 * @property {number} maxShares
 * @property {number} price
 * @property {[number,number,number,number]} position
 */