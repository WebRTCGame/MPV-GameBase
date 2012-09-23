

/*
Used in by the Creep method "display stats" to
support constantly updated hp for the specific
selected creep. Conceivably one might move into
another state immediately without transitioning
into normal state before that. Preferably some
kind of state cleanup function will be added to
the state API, but at the moment it will function
correctly anyway, because the creep div will either
be invisible, or the most recent creephpupdater
will be the last one called, meaning that the
correct hp will be displayed even if there are
multiple existing creephpupdaters in the
system rendering level.
 */

var CreepHpUpdater = function (creep) {
	var chp = new Object();
	Object.extend(chp, InertDrawable);
	chp.update = function () {
		//WIDGETS.creep_hp.innerHTML = creep.hp;
	}
	chp.should_die = false;
	chp.is_dead = function () {
		if (chp.should_die || !creep || !SET.state || SET.state.name() != "CreepSelectMode" || creep.is_dead()) {
			unselect();
			if (chp.kz)
				chp.kz.is_dead = function () {
					return true;
				};
			return true;
		} else
			return false;
	}
	chp.draw = function () {
		if (chp.kz)
			chp.kz.is_dead = function () {
				return true;
			};
		chp.kz = KillZone(creep.x, creep.y, 15);
	}
	
	assign_to_depth(chp, SET.zIndex.system); //SET.system_render_level);
	return chp;
}

/*
### Types of creeps

Creeps interact with terrain in a variety of ways.
Some types of creeps will be much faster on certain
squares, and much slower on others. Some types will
be ignore towers and fly over them.

#### Terrain baseline (how a non-modified creep reacts
to certain types of terrain):

1. Mountains: 3/4 speed.
2. Water: 1/2 speed.
3. Neutral: 1/1 speed.
4. Power Plant: 2/1 speed.

#### Creep mixins

1. FlyingMixin: ignore standard pathfinding, and go in a straight line to exit.
2. WaterAdverseMixin: very slow walking through water.
3. WaterLovingMixin: very quick walking in water.
4. MoutainAdverseMixin: very slow crossing mountains.
5. MountainLovingMixin: very quick crossing mountains.
6. ImmuneMixin: ignores terrain effects completely.


### Implementation

Each creep has an object named terrain, the keys of which
are the varying types of terrain. The value stored for each
key is a decimal which is used as a multiplier against the
creep's base speed in that type of terrain.

 */

/* Creep Mixins */

var FlyingMixin = function (creep) {
	creep.creep_type = "Flying " + creep.creep_type;
	creep.terrain['water'] = 1.0;
	creep.terrain['mountain'] = 1.0;
	creep.ignores_towers = true;
	return creep;
}

var WaterAdverseMixin = function (creep) {
	creep.terrain['water'] = 0.25;
	creep.creep_type = "Water-Hating " + creep.creep_type;
	return creep;
}

var WaterLovingMixin = function (creep) {
	creep.terrain['water'] = 2.0;
	creep.creep_type = "Water-Loving " + creep.creep_type;
	return creep;
}

var MountainAdverseMixin = function (creep) {
	creep.terrain['mountain'] = 0.25;
	creep.creep_type = "Mountain-Hating " + creep.creep_type;
	return creep;
}

var MountainLovingMixin = function (creep) {
	creep.terrain['mountain'] = 1.25;
	creep.creep_type = "Mountain-Loving " + creep.creep_type;
	return creep;
}

var ImmuneMixin = function (creep) {
	creep.terrain['mountain'] = 1.0;
	creep.terrain['neutral'] = 1.0;
	creep.terrain['water'] = 1.0;
	creep.terrain['mountain'] = 1.0;
	creep.terrain['power plant'] = 1.0;
	creep.creep_type = "Immune " + creep.creep_type;
	return creep;
}

var StrongMixin = function (creep) {
	creep.color = color(0, 255, 255);
	creep.size = creep.size * 1.3;
	creep.hp = Math.floor(creep.hp * 2);
	creep.value = Math.floor(creep.value * 1.5);
	creep.creep_type = "Strong " + creep.creep_type;
	return creep;
}

var QuickMixin = function (creep) {
	creep.creep_type = "Quick " + creep.creep_type;
	creep.color = color(200, 150, 50);
	creep.speed = creep.speed * 1.5;
	creep.hp = Math.floor(creep.hp * .75);
	creep.size = creep.size * 0.9;
	creep.value = Math.floor(creep.value * 1.25);
	return creep;
}

var BossMixin = function (creep) {
	creep.creep_type = "Boss " + creep.creep_type;
	creep.color = color(255, 100, 150);
	creep.size = creep.size * 1.5;
	creep.hp = Math.floor(creep.hp * 10);
	creep.value = Math.floor(creep.value * 20);
	return creep;
}

var Creep = function (wave) {
	var cp = SET.creeps_spawned;
	var c = new Object();
	c.terrain = {
		"entrance" : 1.0,
		"exit" : 1.0,
		"mountain" : 0.75,
		"water" : 0.5,
		"neutral" : 1.0,
		"power plant" : 2.0
	};
	c.angle = 0;
	c.x = SET.entrance.x_mid;
	c.y = SET.entrance.y_mid;
	c.color = SET.creep_color;
	c.size = SET.creep_size;
	c.hp = Math.floor(SET.creep_hp * Math.pow(1.4, wave));
	c.startinghp = Math.floor(SET.creep_hp * Math.pow(1.4, wave));
	c.value = SET.creep_value + wave;
	c.speed = 50; //SET.creep_speed;
	//c.thrust = 0;
	c.last = ((new Date).getTime() - start);
	c.explosion = -1;
	c.index = 0;
	
	c.is_dead = function () {
		if (this.hp <= 0) {
			SET.gold += this.value;
			SET.score += this.value;
			return true;
		}
		return false;
	}
	c.terrain_modified_speed = function () {
		var terrain = get_terrain_at(this.gx, this.gy);
		if (terrain) {
			var terrain_type = terrain.type;
			var terrain_modifier = c.terrain[terrain_type];
		} else {
			var terrain_modifier = 1.0;
		}
		return terrain_modifier;
	}
	
	c.ignores_towers = false;
	
	c.update = function () {
		var elapsed = 1.0 * (SET.now - this.last);
		var speed = (this.speed * (elapsed / 1000)) * this.terrain_modified_speed();
		this.last = SET.now;
		
		var gpos = {
			gx : 0,
			gy : 0
		}; 
		
		gpos.gx = (Math.floor(this.x / SET.pixels_per_square));
		gpos.gy = (Math.floor(this.y / SET.pixels_per_square));
		this.gx = gpos.gx;
		this.gy = gpos.gy;
		
		if (this.gx === SET.exit.gx && this.gy === SET.exit.gy) {
			this.hp = -1;
			this.value = 0;
			SET.lives--;
			if (SET.lives < 1)
				game_lost();
		} else if (!this.ignores_towers) {
			
			var pathPoint = SET.getPathPoint(c.index + 1);
			
			var pathx = pathPoint.x;
			var pathy = pathPoint.y;
			
			var coords = center_of_square(pathx, pathy);
			var close = dist(this.x, this.y, coords.x, coords.y);
			
			if (close < SET.half_pixels_per_square) {
				c.index += 1
			};
			
			this.angle = Math.atan2((coords.y - this.y), (coords.x - this.x));
			this.x += (speed) * Math.cos(this.angle);
			this.y += (speed) * Math.sin(this.angle);
		} else if (this.ignores_towers) {
			this.angle = Math.atan2((SET.exit.y_mid - this.y), (SET.exit.x_mid - this.x));
			this.x += (speed) * Math.cos(this.angle);
			this.y += (speed) * Math.sin(this.angle);
		}
	}
	c.draw = function () {
		SET.addLight(this.x,this.y,50);
		var scaleup = 20 - (20 / (this.hp + .1)); //(percentageLife / 10);
		context.save;
		var red = Math.floor(255 / scaleup);
		var green = Math.floor(scaleup * 15);
		var blue = 0;
		
		context.fillStyle = color(red, green, blue, 1);
		context.beginPath();
		context.rect(this.x - 5, this.y - 15, scaleup, 5);
		context.closePath();
		context.fill();
		context.stroke();
		context.restore;
		
		context.save();
		context.fillStyle = this.color;
		context.lineWidth = 1;
		context.translate(this.x, this.y);
		context.rotate(this.angle);
		context.beginPath();
		context.moveTo(-4, -4);
		context.lineTo(8, 0);
		context.lineTo(-4, 4);
		context.closePath();
		context.shadowOffsetX = 5;
		context.shadowOffsetY = 5;
		context.shadowColor = "black";
		context.shadowBlur = 10;
		context.fill();
		context.stroke();
		context.restore();
		
	}
	c.creep_type = "Normal Creep";
	c.display_stats = function () {
		//WIDGETS.creep_type.innerHTML = this.creep_type;
		//WIDGETS.creep_hp.innerHTML = this.hp;
		//WIDGETS.creep_value.innerHTML = this.value + " gold";
		//WIDGETS.creep.style.display = "block";
	}
	SET.creeps_spawned++;
	assign_to_depth(c, SET.zIndex.creep);
	return c;
};

/* pathfinding */

var known_best_paths = undefined;

var reset_pathfinding = function (new_value) {
	if (new_value === undefined) {
		var coords = [SET.exit.gx, SET.exit.gy];
		new_value = {};
		SET.grid_cache_reset_all_values_for_key("valid_tower_location");
		new_value[coords] = {}; //The actual value doesn't really matter
	}
	var previous = known_best_paths;
	known_best_paths = new_value;
	SET.gridDirty = true;
	SET.updateGrid();
	return previous;
}

//Could a creep occupy this square?
var valid_path_location = function (gx, gy) {
	//out of bounds
	if (gx < 0 || gy < 0)
		return false;
	if (gx >= SET.gwidth || gy >= SET.gheight) {
		return false;
	};
	
	if (get_tower_at(gx, gy) != false) {
		return false;
	};
	
	if (get_terrain_at(gx, gy).type === "power plant") {
		return false;
	};
	
	//a hypothetical tower is present (when selecting a space for a new tower)
	if (SET.considering_location && SET.considering_location.gx === gx && SET.considering_location.gy === gy) {
		return false;
	};
	
	return true;
}

var pathfind = function (start_block) {
	//   log("pathfinding [from, to]", [start_block, SET.exit]);
	if ([start_block.gx, start_block.gy]in known_best_paths) {
		//     log("path found from cache", start_block);
		return known_best_paths[[start_block.gx, start_block.gy]].next_block.gpos;
	}
	
	var successors = function (block) {
		var candidates = [];
		var normal_dist = 10;
		[[0, 1], [1, 0], [-1, 0], [0, -1]].forEach(function (pair) {
			var gpos = {
				gx : block.gpos.gx + pair[0],
				gy : block.gpos.gy + pair[1],
				dist : normal_dist
			};
			if (valid_path_location(gpos.gx, gpos.gy))
				candidates.push(gpos);
		});
		
		var diag_dist = 14; //sqrt(2) * 10
		[[1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(function (pair) {
			var gpos = {
				gx : block.gpos.gx + pair[0],
				gy : block.gpos.gy + pair[1],
				dist : diag_dist
			};
			if (valid_path_location(gpos.gx, gpos.gy) && valid_path_location(block.gpos.gx, gpos.gy) && valid_path_location(gpos.gx, block.gpos.gy))
				candidates.push(gpos);
		})
		return candidates;
	}
	
	//Heuristic assumes that we move at a 45˚ angle until we've got a
	//horizontal or vertical path to the goal, then we move straight
	//to the goal.  This is the actual behavior when there are no obstructions.
	var heuristic = function (gpos) {
		var dx = Math.abs(gpos.gx - SET.exit.gx);
		var dy = Math.abs(gpos.gy - SET.exit.gy);
		var dist = Math.min(dx, dy) * 14;
		dist += (Math.max(dx, dy) - Math.min(dx, dy)) * 10
		return dist
	}
	
	var closed = {};
	var pqueue = [{
			gpos : start_block,
			f : heuristic(start_block),
			g : 0
		}
	];
	while (pqueue.length > 0) {
		var block = pqueue[0];
		pqueue = pqueue.slice(1);
		//     log("looking at", block)
		if (closed[[block.gpos.gx, block.gpos.gy]] == true) {
			//       log("in closed, skipping", closed)
			continue;
		}
		if ([block.gpos.gx, block.gpos.gy]in known_best_paths) {
			//logging:
			//       rpath = [];
			while ("ancestor" in block) {
				block.ancestor.next_block = block;
				known_best_paths[[block.ancestor.gpos.gx, block.ancestor.gpos.gy]] = block.ancestor
					//         rpath.push({gx:block.gx, gy:block.gy});
					block = block.ancestor;
			}
			//       rpath.push({gx:block.gx, gy:block.gy});
			//       rpath.reverse();
			//       log("known_best_paths", known_best_paths);
			var result = known_best_paths[[start_block.gx, start_block.gy]].next_block.gpos;
			//       log("path found!", rpath);
			return result;
		}
		closed[[block.gpos.gx, block.gpos.gy]] = true;
		//     log("closed", closed);
		successors(block).forEach(function (s) {
			var suc = {
				gpos : s,
				g : s.dist + block.g,
				ancestor : block
			};
			suc.f = suc.g + heuristic(suc.gpos);
			
			pqueue = insert_sorted(pqueue, suc, function (bl) {
					return bl.f
				});
		})
		
		//     log("pqueue", pqueue);
	}
	//   log("---------pathfinding failed!----------");
}
