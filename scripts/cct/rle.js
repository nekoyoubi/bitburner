/** @param {NS} ns */
export async function main(ns) {
	let input = ns.args.length == 1 ? ns.args[0] : "vvrrrrrwwXXXXXXSSpSSYBR44444444444Y6nnMMDllyyeeeeeeXX1f666666WWDXXlC44444d";
	ns.tprint(`IN: ${input}`);
	let array = Array.from(input.matchAll(/(?:(.)\1{0,8})/g), m => m[0]);
	var output = "";
	for (let e in array) {
		output += array[e].length + array[e][0];
	}
	ns.tprint(`OUT: ${output}`);	
}