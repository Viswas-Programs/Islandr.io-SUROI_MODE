import { MinEntity, MinObstacle, MinMinObstacle, MinTerrain, MinVec2, MinBuilding, MinCircleHitbox, MinParticle } from "./minimized";
import { MovementDirection } from "./misc";

export interface IPacket {
	type: string;
}

// Packet to respond the server Ack
export class ResponsePacket implements IPacket {
	type = "response";
	id: string;
	username: string;
	skin: string | null;
	deathImg: string | null;
	accessToken?: string;

	constructor(id: string, username: string, skin: string | null, deathImg: string | null, accessToken?: string) {
		this.id = id;
		this.username = username;
		this.skin = skin;
		this.deathImg = deathImg
		this.accessToken = accessToken;
	}
}

// Packet to ping the server
export class PingPacket implements IPacket {
	type = "ping";
}

// Packet to notify movement key press
export class MovementPressPacket implements IPacket {
	type = "movementpress";
	direction: MovementDirection;

	constructor(direction: MovementDirection) {
		this.direction = direction;
	}
}

// Packet to notify movement key release
export class MovementReleasePacket implements IPacket {
	type = "movementrelease";
	direction: MovementDirection;

	constructor(direction: MovementDirection) {
		this.direction = direction;
	}
}

// Packet to notify mouse button press
export class MousePressPacket implements IPacket {
	type = "mousepress";
	button: number;

	constructor(button: number) {
		this.button = button;
	}
}

// Packet to notify mouse button release
export class MouseReleasePacket implements IPacket {
	type = "mouserelease";
	button: number;

	constructor(button: number) {
		this.button = button;
	}
}

// Packet to notify mouse movement
export class MouseMovePacket implements IPacket {
	type = "mousemove";
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

// Packet to notify interaction (e.g. pickup)
export class InteractPacket implements IPacket {
	type = "interact";
}

// Packet to notify weapon switching
export class SwitchWeaponPacket implements IPacket {
	type = "switchweapon";
	delta: number;
	setMode: boolean;

	constructor(delta: number, setMode = false) {
		this.delta = delta;
		this.setMode = setMode;
	}
}

// Packet to notify weapon reloading
export class ReloadWeaponPacket implements IPacket {
	type = "reloadweapon";
}

// Packet to notify healing item usage
export class UseHealingPacket implements IPacket {
	type = "usehealing";
	item: string;

	constructor(item: string) {
		this.item = item;
	}
}

/// Packet from server acknowledgement
export class AckPacket implements IPacket {
	type = "ack";
	id!: string;
	tps!: number;
	size!: number[];
	terrain!: MinTerrain;
}

/// Packet from server containing game data
export class GamePacket implements IPacket {
	type = "game";
	entities!: MinEntity[];
	obstacles!: MinObstacle[];
	player!: any;
	alivecount!: number;
	discardEntities?: string[];
	discardObstacles?: string[];
	safeZone?: { hitbox: MinCircleHitbox, position: MinVec2 };
	nextSafeZone?: { hitbox: MinCircleHitbox, position: MinVec2 };
}

/// Packet from server containing map data
export class MapPacket implements IPacket {
	type = "map";
	obstacles!: MinMinObstacle[];
	buildings!: MinBuilding[];
	terrains!: MinTerrain[];
}

/// Packet from server about sound and its location
export class SoundPacket implements IPacket {
	type = "sound";
	path!: string;
	position!: MinVec2;
}

export class ParticlesPacket implements IPacket {
	type = "particles";
	particles!: MinParticle[];
}

export type ServerPacketResolvable = AckPacket | GamePacket | MapPacket | SoundPacket | ParticlesPacket;