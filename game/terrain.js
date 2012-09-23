var NeutralTerrain = function (gx, gy) {
	var terrain_color = color(200, 200, 200);
	var t = Square(gx, gy, terrain_color);
	t.type = "neutral";
	t.tower_range_modifier = 1.0;
	t.tower_damage_modifier = 1.0;
	t.tower_frequency_modifier = 1.0;
	t.draw = function () {
		if (!SET.imageDataPopulated) {
			SET.tempCanvasContext.save();
			SET.tempCanvasContext.fillStyle = this.color;
			var pos = grid_to_pixel(this.gx, this.gy);
			SET.tempCanvasContext.beginPath();
			SET.tempCanvasContext.rect(pos.x, pos.y, SET.pixels_per_square, SET.pixels_per_square);
			SET.tempCanvasContext.closePath();
			SET.tempCanvasContext.fill();
			SET.tempCanvasContext.restore();
		};
	};
	return t;
}

var WaterTerrain = function (gx, gy) {
	var t = NeutralTerrain(gx, gy);
	t.color = color(78, 150, 236);
	t.type = "water";
	t.draw = function () {
		if (!SET.imageDataPopulated) {
			SET.tempCanvasContext.save();
			SET.tempCanvasContext.fillStyle = this.color;
			var pos = grid_to_pixel(this.gx, this.gy);
			SET.tempCanvasContext.beginPath();
			SET.tempCanvasContext.rect(pos.x, pos.y, SET.pixels_per_square, SET.pixels_per_square);
			SET.tempCanvasContext.closePath();
			SET.tempCanvasContext.fill();
			SET.tempCanvasContext.restore();
		};
	};
	return t;
}

var MountainTerrain = function (gx, gy) {
	var t = NeutralTerrain(gx, gy);
	t.color = color(250, 225, 200); //color(228, 51, 51);
	t.type = "mountain";
	t.tower_range_modifier = 1.25;
	
	function circle(x, y, r, c) {
		SET.tempCanvasContext.beginPath();
		var rad = SET.tempCanvasContext.createRadialGradient(x, y, 1, x, y, r);
		rad.addColorStop(0, 'rgba(' + c + ',1)');
		rad.addColorStop(1, 'rgba(' + c + ',0)');
		SET.tempCanvasContext.fillStyle = rad;
		SET.tempCanvasContext.arc(x, y, r, 0, Math.PI * 2, false);
		SET.tempCanvasContext.closePath();
		SET.tempCanvasContext.fill();
	}
	t.draw = function () {
		if (!SET.imageDataPopulated) {
			SET.tempCanvasContext.save();
			SET.tempCanvasContext.fillStyle = this.color;
			var pos = grid_to_pixel(this.gx, this.gy);
			SET.tempCanvasContext.beginPath();
			SET.tempCanvasContext.rect(pos.x, pos.y, SET.pixels_per_square, SET.pixels_per_square);
			SET.tempCanvasContext.closePath();
			SET.tempCanvasContext.fill();
			circle(pos.x + (SET.pixels_per_square * 0.5), pos.y + (SET.pixels_per_square * 0.5), (SET.pixels_per_square * 0.5), '255,0,0');
			SET.tempCanvasContext.restore();
		};
	};
	return t;
}

var PowerPlantTerrain = function (gx, gy) {
	var t = NeutralTerrain(gx, gy);
	t.color = color(189, 194, 78);
	t.type = "power plant";
	t.tower_damage_modifier = 2.0;
	t.draw = function () {
		if (!SET.imageDataPopulated) {
			SET.tempCanvasContext.save();
			SET.tempCanvasContext.fillStyle = this.color;
			var pos = grid_to_pixel(this.gx, this.gy);
			SET.tempCanvasContext.beginPath();
			SET.tempCanvasContext.rect(pos.x, pos.y, SET.pixels_per_square, SET.pixels_per_square);
			SET.tempCanvasContext.closePath();
			SET.tempCanvasContext.shadowOffsetX = 5;
			SET.tempCanvasContext.shadowOffsetY = 5;
			SET.tempCanvasContext.shadowColor = "black";
			SET.tempCanvasContext.shadowBlur = 10;
			SET.tempCanvasContext.fill();
			SET.tempCanvasContext.restore();
		};
	};
	return t;
}

var populate_terrains = function () {
	var p_mountains = SET.terrain_percent_mountains || 0.1;
	var p_water = SET.terrain_percent_water || 0.2;
	var p_power_plant = SET.terrain_percent_power_plant || 0.075;
	// remainder is neutral terrain
	
	var range_mountain = p_mountains;
	var range_water = p_mountains + p_water;
	var range_power_plant = p_power_plant + range_water;
	// remainder is neutral terrain
	
	var entrance = SET.entrance;
	var exit = SET.exit;
	var gwidth = SET.gwidth;
	var gheight = SET.gheight;
	
	// column with entrance & exit squares
	// are all neutral terrain
	for (var gy = 0; gy < gheight; gy++) {
		if (gy != entrance.gy) {
			NeutralTerrain(0, gy);
		}
		if (gy != exit.gy) {
			NeutralTerrain(gwidth - 1, gy);
		};
	};
	
	for (var gx = 1; gx < gwidth - 1; gx++) {
		for (var gy = 0; gy < gheight; gy++) {
			var n = Math.random();
			if (n <= range_mountain)
				MountainTerrain(gx, gy);
			else if (n <= range_water)
				WaterTerrain(gx, gy);
			else if (n <= range_power_plant)
				PowerPlantTerrain(gx, gy);
			else
				NeutralTerrain(gx, gy);
		};
	};
	SET.gridDirty = true;
	SET.updateGrid();
	
}
