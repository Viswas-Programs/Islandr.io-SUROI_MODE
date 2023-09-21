import { Player } from "../entities";
import { Obstacle } from "../../types/obstacle";
import { MinObstacle } from "../../types/minimized";
import { circleFromCenter } from "../../utils";
import { ObstacleSupplier } from "../../types/supplier";
import { OBSTACLE_SUPPLIERS } from ".";

const bushImg = new Image();
bushImg.src = "assets/images/game/objects/bush.svg";

const bushResidueImg = new Image();
bushResidueImg.src = "assets/images/game/objects/residues/bush.svg";

class BushSupplier implements ObstacleSupplier {
	create(minObstacle: MinObstacle) {
		return new Bush(minObstacle);
	}
}

// Bush
export default class Bush extends Obstacle {
	static readonly TYPE = "bush";
	type = Bush.TYPE;
	zIndex = 10;

	static {
		OBSTACLE_SUPPLIERS.set(Bush.TYPE, new BushSupplier());
	}

	render(you: Player, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number): void {
		if (!bushImg.complete || !bushResidueImg.complete) return;
		const relative = this.position.addVec(you.position.inverse());
		ctx.translate(canvas.width / 2 + relative.x * scale, canvas.height / 2 + relative.y * scale);
		ctx.rotate(-this.direction.angle());
		const img = this.despawn ? bushResidueImg : bushImg;
		// Times 2 because radius * 2 = diameter
		const width = scale * this.hitbox.comparable * 2 * (this.despawn ? 0.5 : 1), height = width * img.naturalWidth / img.naturalHeight;
		ctx.drawImage(img, -width / 2, -height / 2, width, height);
		ctx.resetTransform();
	}

	renderMap(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) {
		ctx.fillStyle = "#005f00";
		circleFromCenter(ctx, this.position.x * scale, this.position.y * scale, 2 * scale);
	}
}