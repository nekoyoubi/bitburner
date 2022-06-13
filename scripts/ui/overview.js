const doc = eval("document");

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	
	let overviewSelector = "#root > div > div div.MuiCollapse-root > div > div > table > tbody >";
	let hpElements = doc.querySelectorAll(`${overviewSelector} tr:nth-child(1) p`);
	let chaText = doc.querySelector(`${overviewSelector} tr:nth-child(14)`);
	let chaBar = doc.querySelector(`${overviewSelector} tr:nth-child(15)`);
	
	var refresh = true;

	let getStat = function(stat) {
		var value = 0;
		switch (stat) {
			case "int": value = ns.getPlayer().intelligence; break;
			case "kar": value = ns.heart.break(); break;
		}
		let thisStat = stats.find(s => s.stat == stat);
		if (thisStat.lastValue != value) refresh = true;
		thisStat.lastValue = value;
		return value;
	}

	let stats = [
		{ "stat": "kar", "label": "Kar", "color":"#C83700", "lastValue": 0, "barValue": -54000, "element": undefined, "bar": undefined },
		{ "stat": "int", "label": "Int", "color":"#49A0FF", "lastValue": 0, "barValue": null, "element": undefined, "bar": undefined },
	];
		
	for (let h in hpElements)
		if (hpElements[h].style != undefined)
	 		hpElements[h].style.cssText = "color:#F69 !important;";

	ns.atExit(() => {
		for (let s in stats) {
			stats[s].element.remove();
			if (stats[s].bar != undefined)
				stats[s].bar.remove();
		}
		for (let h in hpElements)
			if (hpElements[h].style != undefined)
				hpElements[h].style.cssText = "";
	});

	while (true) {
		for (let s in stats) getStat(stats[s].stat);
		if (refresh) {
			for (let s in stats) {
				if (stats[s].element != undefined) stats[s].element.remove();
				if (stats[s].bar != undefined) stats[s].bar.remove();
				var textHtml = chaText.outerHTML
					.replace(/"overview-cha-hook"/gi, `"overview-${stats[s].stat}-hook"`)
					.replace(/>Cha/g, `>${stats[s].label}`)
					.replace(/(<p[^>]+?>)[\d\.,]+</g, `\$1${ns.nFormat(getStat(stats[s].stat), "-0,0")}<`)
					.replace(/<p (class=)/gi, `<p style="color: ${stats[s].color};" \$1`)
					;
				stats[s].element = htmlToElement(textHtml);
				chaBar.after(stats[s].element);
				if (stats[s].barValue != null) {
					let progress = Math.max(Math.min((Math.abs(getStat(stats[s].stat)) / Math.abs(stats[s].barValue)) * 100, 100), 0);
					var barHtml = chaBar.outerHTML
						.replace(/style="transform: translateX\(-?[^\)]+%\);/gi, `style="background-color: ${stats[s].color}; transform: translateX(-${100-progress}%);`)
						;
					stats[s].bar = htmlToElement(barHtml);
					stats[s].element.after(stats[s].bar);
				}
			}
		}
		await ns.sleep(1000);
	}
}

// https://stackoverflow.com/a/35385518/11131159
function htmlToElement(html) {
    var template = doc.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

// inspiration for this script from https://gameplay.tips/guides/bitburner-unorthodox-automation-in-game-modding.html