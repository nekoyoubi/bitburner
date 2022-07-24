/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	var type = ns.args.length > 0 ? ns.args[0] : CRIME_MUG;
	if (type.match(/mug(?:ging)?|1/i)) type = CRIMES.find(c => c.crime.match(/mug/i))?.crime;
	else if (type.match(/(?:h|homicide|murder|kill|2)/i)) type = CRIMES.find(c => c.crime.match(/homicide/i))?.crime;
	else if (type.match(/(?:bonds?|forge(?:ry)?)/i)) type = CRIMES.find(c => c.crime.match(/bond/i))?.crime;
	else type = CRIMES.find(c => c.crime.match(new RegExp(type)))?.crime ?? type;
	let start = new Date();
	let done = start.setMinutes(start.getMinutes() + (60*24));
	while (Date.now() < done) {
		ns.tail("crime.js", "home", ...ns.args);
		while (!ns.singularity.isBusy())
			ns.singularity.commitCrime(type);
		await ns.sleep(1);
	}
}

const CRIME_MUG = "Mug someone";
const CRIME_HOMICIDE = "Homicide";

const CRIMES = [
    { "crime": "Shoplift",				"seconds": 2,	"money": 4617 },
    { "crime": "Rob store",				"seconds": 60,	"money": 123131 },
    { "crime": "Mug someone",			"seconds": 4,	"money": 11082 },
    { "crime": "Larceny",				"seconds": 90,	"money": 246262 },
    { "crime": "Deal Drugs",			"seconds": 10,	"money": 36939 },
    { "crime": "Bond Forgery",			"seconds": 300,	"money": 1385000 },
    { "crime": "Traffick illegal Arms",	"seconds": 40,	"money": 184697 },
    { "crime": "Homicide",				"seconds": 3,	"money": 13852 },
];