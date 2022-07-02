const doc = eval("document");

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	ns.clearLog();
	
	let rootSelector = "#root > div";
	let overviewSelectorBase = `${rootSelector} > div.MuiPaper-root > div.MuiCollapse-root`;
	let overviewSelectorTable = `${overviewSelectorBase} > div > div > table`;
	let overviewSelectorTBody = `${overviewSelectorTable} > tbody`;
	let mainWindowSelector = `${rootSelector} > div.MuiBox-root > div.MuiBox-root`;
	let overviewCollapsedSelector = `${overviewSelectorBase}.MuiCollapse-hidden`;
	let hpElements = doc.querySelectorAll(`${overviewSelectorTBody} > tr:nth-child(1) p`);
	let intOffset = Math.min(ns.getPlayer().intelligence + 1, 2);
	let anchorText = doc.querySelector(`${overviewSelectorTBody} > tr:nth-child(${14 + intOffset})`);
	let anchorBar = doc.querySelector(`${overviewSelectorTBody} > tr:nth-child(${15 + intOffset})`);
	
	var refresh = true;

	var karmaTracking = [ ];

	let getKarmaRate = function() {
		//karmaTracking.reverse();
		//karmaTracking.reverse();
		var delta = 0;//Math.abs(karmaTracking[0] - karmaTracking[1]);
		for (let k = 0; k < karmaTracking.length - 2; k++) {
			delta += Math.abs(karmaTracking[k] - karmaTracking[k+1]);
		}
		return delta / karmaTracking.length;
	}


	let getStat = function(stat, track) {
		var value = 0;
		ns.print(stat);
		switch (stat) {
			//case "int": value = ns.getPlayer().intelligence; break;
			case "kar":
				value = ns.heart.break();
				if (track) {
					let trackAmount = 60;
					if (karmaTracking.length == 0) {
						for (let k = 0; k < trackAmount; k++)
							karmaTracking.push(value);
					} else {
						if (karmaTracking.length >= trackAmount)
							karmaTracking = karmaTracking.slice(1);
						karmaTracking.push(value);
					}
				}
				break;
			case "ter": value = ns.gang.getGangInformation().territory; break;
		}
		let thisStat = allStats.find(s => s.stat == stat);
		if (thisStat.lastValue != value) refresh = true;
		thisStat.lastValue = value;
		return value;
	}

	let getStatDisplay = function(stat) {
		var value = getStat(stat, false);
		switch (stat) {
			case "kar":
				if (value <= -54_000) return "😈";
				//let rate = Math.abs(karmaTracking.reduce((a,b) => b - a, null));
				let rate = Math.abs(getKarmaRate());
				//ns.print(`rate:${rate}\n${JSON.stringify(karmaTracking, null, "  ")}`)
				rate = (rate == 0 ? 1 : rate);
				let seconds = Math.ceil(Math.abs(-54_000 - value) / rate);
				let hours = Math.floor(seconds / 60 / 60);
				let minutes = Math.floor((seconds - (hours * 60 * 60)) / 60);
				seconds = Math.abs(Math.ceil(seconds - ((hours * 60 * 60) + (minutes * 60))));
				//value = value <= -54_000 ? "100%" : `${ns.nFormat((value/-54_000), "0%")} — ${hours > 0 ? `${hours}h `: ""} ${`${minutes}m`}`;
				//value = value <= -54_000 ? value : `${hours}:${`${minutes} ${ns.nFormat((value/-54_000), "0%")}`}`;
				value = `${hours}:${ns.nFormat(minutes, "00")}:${ns.nFormat(seconds, "00")}`;
				break;
			case "ter":
				let t = ns.gang.getGangInformation().territory;
				value = ns.nFormat(t, `0%`);//`0${(t >= 1 ? "" : ".00")}%`)}`;
				break;
		}
		return value;
	}

	let allStats = [
		{ "stat": "kar", "label": "Kar", "color":"#C83700", "lastValue": 0, "barValue": -54000, "element": undefined, "bar": undefined, "condition": () => !ns.gang.inGang() },
		{ "stat": "ter", "label": "Ter", "color":"#966633", "lastValue": 0, "barValue": 1, "element": undefined, "bar": undefined, "condition": () => ns.gang.inGang() },
		// I lol'd; this already exists in the game (nearly identical too)
		//{ "stat": "int", "label": "Int", "color":"#49A0FF", "lastValue": 0, "barValue": null, "element": undefined, "bar": undefined },
	].reverse();
	
	for (let h in hpElements)
		if (hpElements[h].style != undefined)
	 		hpElements[h].style.cssText = "color:#F69 !important;";

	ns.atExit(() => {
		for (let s in allStats) {
			allStats[s].element?.remove();
			if (allStats[s].bar != undefined)
				allStats[s].bar.remove();
		}
		for (let h in hpElements)
			if (hpElements[h].style != undefined)
				hpElements[h].style.cssText = "";
		doc.querySelector(mainWindowSelector).style = `margin-right: 0;`;
		doc.querySelector(overviewSelectorTable).style = "";
	});

	while (true) {
		await ns.sleep(1000);
		let tableElement = doc.querySelector(overviewSelectorTable);
		if (tableElement != undefined)
			tableElement.style = "max-width: 200px";
		let mainWindow = doc.querySelector(mainWindowSelector);
		if (mainWindow != undefined)
			mainWindow.style = (doc.querySelector(overviewCollapsedSelector) == undefined)
				? `margin-right: ${doc.querySelector(overviewSelectorBase).offsetWidth}px !important;`
				: "margin-right: 0;";
		let stats = allStats.filter(s => s.condition())
		for (let s in stats) getStat(stats[s].stat, true);
		if (refresh) {
			for (let s in stats) {
				if (stats[s].element != undefined || !stats[s].condition()) stats[s].element.remove();
				if (stats[s].bar != undefined || !stats[s].condition()) stats[s].bar.remove();
				if (!stats[s].condition()) continue;
				var textHtml = anchorText.outerHTML
					.replace(new RegExp(`/"overview-${intOffset > 0 ? "int" : "cha"}-hook"/`,"gi"), `"overview-${stats[s].stat}-hook"`)
					.replace(new RegExp(`>${intOffset > 0 ? "Int" : "Cha"}`,"g"), `>${stats[s].label}`)
					//.replace(/(<p[^>]+?>)[\d\.,]+</g, `\$1${ns.nFormat(getStat(stats[s].stat), "-0,0")}<`)
					.replace(/(<p[^>]+?)>[\d\.,]+</g, `\$1title="${ns.nFormat(getStat(stats[s].stat, false), "0,0.00")}">${getStatDisplay(stats[s].stat)}<`)
					.replace(/<p (class=)/gi, `<p style="color: ${stats[s].color};" \$1`)
					;
				stats[s].element = htmlToElement(textHtml);
				anchorBar.after(stats[s].element);
				if (stats[s].barValue != null) {
					let progress = Math.max(Math.min((Math.abs(getStat(stats[s].stat, false)) / Math.abs(stats[s].barValue)) * 100, 100), 0);
					var barHtml = anchorBar.outerHTML
						.replace(/style="transform: translateX\(-?[^\)]+%\);/gi, `title="${Math.round(progress)}%" style="background-color: ${stats[s].color}; transform: translateX(-${100-progress}%);`)
						;
					stats[s].bar = htmlToElement(barHtml);
					stats[s].element.after(stats[s].bar);
				}
			}
		}
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