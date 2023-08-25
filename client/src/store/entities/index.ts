import { DummyEntity } from "../../types/entity";
import { MinEntity } from "../../types/minimized";
import { EntitySupplier } from "../../types/supplier";

export const ENTITY_SUPPLIERS = new Map<string, EntitySupplier>();

export { default as Ammo } from "./ammo";
export { default as Bullet } from "./bullet";
export { default as Explosion } from "./explosion";
export { default as Grenade } from "./grenade";
export { default as Gun } from "./gun";
export { default as Healing } from "./healing";
export { default as Player, PartialPlayer, FullPlayer } from "./player";
export { default as Backpack } from "./backpack";
export { default as Scope } from "./scope";
export { default as Vest } from "./vest"

// This still need hard-coding unfortunately
export function castCorrectEntity(minEntity: MinEntity & any) {
	return ENTITY_SUPPLIERS.get(minEntity.type)?.create(minEntity) || new DummyEntity(minEntity);
}