import { world } from "../..";
import { CircleHitbox } from "../../types/math";
import Item from "./item";
import Player from "./player";

export default class Scope extends Item {
	type = "scope";
	hitbox = new CircleHitbox(1);
	zoom: number;

	constructor(zoom: number) {
		super();
		this.zoom = zoom;
	}

	picked(player: Player) {
		world.onceSounds.push({"path": "item_usage/scope_equip.mp3", "position": this.position})
		return player.inventory.addScope(this.zoom);
	}

	translationKey() {
		return `${super.translationKey()} ${this.zoom}`;
	}

	minimize() {
		return Object.assign(super.minimize(), { zoom: this.zoom });
	}
}