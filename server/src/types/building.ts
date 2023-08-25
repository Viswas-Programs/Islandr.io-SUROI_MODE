import { ID } from "../utils";
import { Hitbox, Vec2 } from "./math";
import { MinBuilding } from "./minimized";
import { Obstacle } from "./obstacle";

export default class Building {
	id: string;
	// Center of the building
	position = Vec2.ZERO;
	direction = Vec2.UNIT_X;
	// "position" here is the relative position of the obstacle towards the center of the building
	obstacles: { obstacle: Obstacle, position: Vec2 }[] = [];
	zones: { position: Vec2, hitbox: Hitbox }[] = [];
	color?: number;

	constructor() {
		this.id = ID();
	}

	addZone(position: Vec2, hitbox: Hitbox) {
		this.zones.push({ position, hitbox });
	}

	addObstacle(position: Vec2, obstacle: Obstacle) {
		this.obstacles.push({ position, obstacle });
	}

	setPosition(position: Vec2) {
		this.position = position;
		for (const ob of this.obstacles)
			ob.obstacle.position = this.position.addVec(ob.position);
	}

	setDirection(direction: Vec2) {
		const delta = this.direction.angleBetween(direction);
		this.direction = direction;
		for (const ob of this.obstacles) {
			ob.obstacle.direction = ob.obstacle.direction.addAngle(-delta);
			ob.obstacle.position = this.position.addVec(ob.position.addAngle(delta));
		}
	}

	minimize() {
		return <MinBuilding>{
			id: this.id,
			position: this.position.minimize(),
			direction: this.direction.minimize(),
			zones: this.zones.map(zone => ({ position: zone.position.minimize(), hitbox: zone.hitbox.minimize() })),
			color: this.color
		};
	}
}