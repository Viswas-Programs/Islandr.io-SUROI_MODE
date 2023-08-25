import * as crypto from "crypto";

// ID generator
export function ID() {
    return crypto.randomBytes(24).toString("hex");
}

// Promisified setTimeout
export function wait(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Maths
// Capping value with limits
export function clamp(val: number, min: number, max: number) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}
// Random between numbers
export function randomBetween(min: number, max: number) {
    return (Math.random() * (max - min)) + min;
}
export function randomBoolean() {
    return !!Math.floor(Math.random() * 2);
}
export function toRadians(degree: number) {
    return degree * Math.PI / 180;
}

// Networking
import { encode, decode } from "msgpack-lite";
import { deflate, inflate } from "pako";
import WebSocket = require("ws");
import { ClientPacketResolvable, IPacket } from "./types/packet";
// Send packet
export function send(socket: WebSocket, packet: IPacket) {
    //socket.send(deflate(deflate(encode(packet).buffer)));
    socket.send(deflate(encode(packet).buffer));
}
// Receive packet
export function receive(msg: ArrayBuffer) {
    //return <ClientPacketResolvable>decode(inflate(inflate(new Uint8Array(msg))));
    return <ClientPacketResolvable>decode(inflate(new Uint8Array(msg)));
}

// Things that require game object imports
import { world } from ".";
import { Ammo, Gun, Grenade } from "./store/entities";
import { Vec2 } from "./types/math";
import { GunColor } from "./types/misc";

// Spawners
export function spawnGun(id: string, color: GunColor, position: Vec2, ammoAmount: number) {
    const gun = new Gun(id, color);
    gun.position = position;
    world.entities.push(gun);
    var halfAmmo = Math.round(ammoAmount/2)
    spawnAmmo(halfAmmo, color, position);
    spawnAmmo(ammoAmount - halfAmmo, color, position)
}
export function spawnAmmo(amount: number, color: GunColor, position: Vec2) {
    const ammo = new Ammo(amount, color);
    ammo.position = position;
    world.entities.push(ammo);
}
export function spawnGrenade(id: string, amount: number, position: Vec2){
    const grenade = new Grenade(id, amount);
    grenade.position = position;
    world.entities.push(grenade);
}
//Overall spawner to spawn any type of loot
export function spawnLoot(type: string, id: string, color: GunColor, position: Vec2, amount: number){
    if(type == "ammo"){
        spawnAmmo(amount, color, position)
    }
}