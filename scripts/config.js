/** @type {NS} */
var ns = null;

/** @param {NS} lns */
export async function main(lns) {
	ns = lns;
	let c = load();
	if (ns.args.length == 2) {
		eval(`c.${ns.args[0]} = ${ns.args[1]}`);
	}
	save(c);
}

/** @param {NS} lns */
export function init(lns) { ns = lns; }

/** @returns {Config} */
export function load() { return JSON.parse(ns.read("config.txt")); }

/** @param {Config} config
 * @param {NS} ns
 */
export function save(config) { ns.write("config.txt", JSON.stringify(config, null, "\t"), "w"); }

/**
 * @typedef Config
 * @type {object}
 * @property {HacknetConfig} hacknet
 */

/**
 * @typedef HacknetConfig
 * @type {object}
 * @property {boolean} upgrade
 */