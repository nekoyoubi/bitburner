/** @param {NS} ns */
//Object.prototype.dump = async function() { await _ns.sleep(10); await _ns.tprint(JSON.stringify(this)); return this; };
export async function main(ns) {
	_ns = ns;
	let getRandoms = function(amount) {
		var o = [];
		for (let r = 0; r < amount; r++)
			o.push(Math.floor(Math.random()*amount));
		return o; 
	}; 
	let input =
		ns.args.length == 1 ? getRandoms(parseInt(ns.args[0])) :
		ns.args.length > 1 ? ns.args.map(a => parseInt(a)) :
		[1,7,2];
	ns.tprint(`${input} = ${solveArrayJumpingGame(input)}`);
}
var _ns;
function solveArrayJumpingGame(data) {
	var j = 0;
	for (var p = 0; p < data.length; p++)
	{
		j++;
		var v = parseInt(data[p]);
		if (v == 0) return 0;
		else if (p + v >= data.length - 1) return j;// > 0 ? j : 1;
		var x = Math.max(...data.slice(p+1, Math.min(v, data.length - 1 - p + v)));
		if (x == 0) return 0;
		var o = p + v;
		while (o < data.length - 1 && data[o--] < x && o >= p) { }
		p = o;
		if (p >= data.length - 1) break;
	}
	return j;
}