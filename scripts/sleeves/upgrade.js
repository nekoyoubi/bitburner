/** @param {NS} ns */
export async function main(ns) {
	let all = ns.args.length == 0 || ns.args.includes("-a");
	// let augs = [
	// 	"Neurotrainer I",
	// 	"Neurotrainer II",
	// 	"Neurotrainer III",
	// 	"ADR-V1 Pheromone Gene",
	// 	"ADR-V2 Pheromone Gene",
	// 	"Augmented Targeting I",
	// 	"Augmented Targeting II",
	// 	"Augmented Targeting III",
	// 	"Bionic Arms",
	// 	"Bionic Legs",
	// 	"Bionic Spine",
	// 	"Combat Rib I",
	// 	"Combat Rib II",
	// 	"Combat Rib III",
	// 	"BrachiBlades",
	// 	"HemoRecirculator",
	// 	"HyperSight Corneal Implant",
	// 	"INFRARET Enhancement",
	// 	"LuminCloaking-V1 Skin Implant",
	// 	"LuminCloaking-V2 Skin Implant",
	// 	"Nanofiber Weave",
	// 	"NEMEAN Subdermal Weave",
	// 	"Synfibril Muscle",
	// 	"Synthetic Heart",
	// 	"CordiARC Fusion Reactor",
	// 	"Graphene Bionic Arms Upgrade",
	// 	"Graphene Bionic Legs Upgrade",
	// 	"Graphene Bionic Spine Upgrade",
	// 	"Graphene Bone Lacings",
	// 	"Graphene BrachiBlades Upgrade",
	// 	"Wired Reflexes",
	// 	"BitRunners Neurolink",
	// 	"BitWire",
	// 	"PCMatrix",
	// 	"Photosynthetic Cells",
	// 	"Power Recirculation Core",
	// 	"SmartJaw",
	// 	"CRTX42-AA Gene Modification",
	// 	"DermaForce Particle Barrier",
	// 	"Embedded Netburner Module Analyze Engine",
	// 	"Embedded Netburner Module Core Implant",
	// 	"Embedded Netburner Module Core V2 Upgrade",
	// 	"Embedded Netburner Module Core V3 Upgrade",
	// 	"Embedded Netburner Module Direct Memory Access Upgrade",
	// 	"Embedded Netburner Module",
	// 	"Enhanced Myelin Sheathing",
	// 	"Enhanced Social Interaction Implant",
	// 	"SmartSonar Implant",
	// 	"Speech Enhancement",
	// 	"Speech Processor Implant",
	// 	"SPTN-97 Gene Modification",
	// 	"Synaptic Enhancement Implant",
	// 	"Artificial Bio-neural Network Implant",
	// 	"Artificial Synaptic Potentiation",
	// 	"The Shadow's Simulacrum",
	// 	"TITN-41 Gene-Modification Injection",
	// 	"Unstable Circadian Modulator",
	// 	"FocusWire",
	// 	"Neotra",
	// 	"Neural Accelerator",
	// 	"Neural-Retention Enhancement",
	// 	"Neuralstimulator",
	// 	"Neuronal Densification",
	// 	"nextSENS Gene Modification",
	// 	"Nuoptimal Nootropic Injector Implant",
	// 	"OmniTek InfoLoad",
	// 	"PC Direct-Neural Interface NeuroNet Injector",
	// 	"PC Direct-Neural Interface Optimization Submodule",
	// 	"PC Direct-Neural Interface",
	// 	"DataJack",
	// 	"Cranial Signal Processors - Gen I",
	// 	"Cranial Signal Processors - Gen II",
	// 	"Cranial Signal Processors - Gen III",
	// 	"Cranial Signal Processors - Gen IV",
	// 	"Cranial Signal Processors - Gen V",
	// ];
	let money = ns.getPlayer().money;
	//augs.sort((a,b) => Math.random() < .5);
	for (let i = (all ? 0 : Math.min(...ns.args)); i < (all ? 8 : (Math.max(...ns.args) + 1)); i++) {
		let augs = ns.sleeve.getSleevePurchasableAugs(i).filter(a => a.cost < 1e12);
		augs.sort((a, b) => ns.sleeve.getSleeveAugmentationPrice(a) - ns.sleeve.getSleeveAugmentationPrice(b));
		for (let a in augs) {
			if (money * .25 > ns.getPlayer().money) return;
			if (!all && !ns.args.includes(i)) continue;
			for (let a in augs) {
				ns.sleeve.purchaseSleeveAug(i, augs[a].name);
			}
		}
	}
}