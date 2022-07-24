/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	let hold = 200;
	/** @type {Array<Object>} */
	while (true) {
		let data = JSON.parse(await ns.read("/market/data.txt"));
		data.forEach(s => {
			s.history.push(ns.stock.getPrice(s.symbol));
			if (s.history.length > hold)
				s.history = s.history.slice(1, hold);
		});
		await ns.write("/market/data.txt", JSON.stringify(data, null, "\t"), "w");
		await ns.sleep(6_000);
	}
}