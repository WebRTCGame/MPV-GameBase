/* todo:
individual upgrades
tower attack spot assignment
creep reroute based on other creep death
slow bullet type
wall tower type (no shooting)

 */
var mouse = {
	x : 0,
	y : 0
};

var assign_to_depth = function (obj, depth) {
	var rendering_group = SET.rendering_groups[depth];
	if (rendering_group == undefined) {
		SET.rendering_groups[depth] = [obj];
	} else {
		rendering_group.push(obj)
	};
}

// updates any groups
var update_groups = function (groups) {
	////SET.lightingCanvasContext.clearRect(0,0,SET.lightingCanvas.width,SET.lightingCanvas.height);
	//SET.lightingCanvasContext.fillStyle = color(255,255,255,1);
	//SET.lightingCanvasContext.fillRect(0, 0, SET.lightingCanvas.width, SET.lightingCanvas.height);
	//SET.lightingCanvasContext.fill();
	//SET.lightingCanvasContext.clearRect(0, 0, SET.lightingCanvas.width, SET.lightingCanvas.height);
	
	context.globalCompositeOperation = "source-over";
	
	if (SET.gridDirty) {
		SET.updateGrid
	};
	
	var obj_update = function (x) {
		if (x != undefined)
			x.update();
	};
	
	var obj_is_alive = function (x) {
		return !(x == undefined || x.is_dead());
	};
	
	var obj_draw = function (x) {
		x.draw();
	};
	
	if (SET.imageDataPopulated) {
		context.save();
		//context.putImageData(SET.imageData, 0, 0);
		SET.tempCanvasContext.save();
			SET.tempCanvasContext.fillStyle = color(255,0,0);
	SET.tempCanvasContext.beginPath();
	SET.tempCanvasContext.rect(10, 10, 40, 80);
	SET.tempCanvasContext.closePath();
	SET.tempCanvasContext.fill();
		SET.tempCanvasContext.restore();
		context.drawImage(SET.tempCanvas, 0, 0);
		context.restore();
	};
	
	for (var i = groups.length - 1; i >= 0; i--) {
		var group = groups[i];
		//if (i = SET.zIndex.tower){console.log(i)};
		if (group != undefined) {
			group.forEach(obj_update);
		}
	}
	
	var isPowerPlant = function (x) {
		return (x.type == "power plant");
	};
	var isMountain = function (x) {
		return (x.type == "mountain");
	};
	var isWater = function (x) {
		return (x.type == "water");
	};
	var isNeutral = function (x) {
		return (x.type == "neutral");
	};
	
	var isOther = function (x) {
		var t1 = isPowerPlant(x);
		var t2 = isMountain(x);
		var t3 = isWater(x);
		var t4 = isNeutral(x);
		var valOther = true;
		if (t1) {
			valOther = false
		};
		if (t2) {
			valOther = false
		};
		if (t3) {
			valOther = false
		};
		if (t4) {
			valOther = false
		};
		return valOther;
	};
	
	for (var i = groups.length - 1; i >= 0; i--) {
		var group = groups[i];
		if (group != undefined) {
			var alive = group.filter(obj_is_alive);
			
			if (i == SET.zIndex.square) {
				//ordered terrain rendering
				var tisOther = alive.filter(isOther);
				tisOther.forEach(obj_draw);
				
				if (!SET.imageDataPopulated) {
					var tisWater = alive.filter(isWater);
					tisWater.forEach(obj_draw);
					var tisNeutral = alive.filter(isNeutral);
					tisNeutral.forEach(obj_draw);
					var tisMountain = alive.filter(isMountain);
					tisMountain.forEach(obj_draw);
					var tisPowerPlant = alive.filter(isPowerPlant);
					tisPowerPlant.forEach(obj_draw);
				};
				
			} else {
				alive.forEach(obj_draw);
			}
			
			groups[i] = alive;
		}
	}
	//SET.addLight(mouse.x,mouse.y,60);
	//SET.lightingCanvasContext.globalAlpha = 1;
	//context.globalAlpha=1;
	//context.globalCompositeOperation = "destination-in";
	//context.drawImage(SET.lightingCanvas,0,0);
	//context.globalAlpha=.5;
	
	if (!SET.imageDataPopulated) {
		//SET.imageData = context.getImageData(0, 0, SET.width, SET.height);
		context.globalAlpha = 1;
		SET.imageDataPopulated = true;
	};
	
};

/*
Configuration & settings.
 */

var default_set = function () {
	var set = {};
	set.pixels_per_square = 25;
	set.half_pixels_per_square = (1.0 * set.pixels_per_square) / 2;
	set.height = 400;
	set.width = 600;
	set.framerate = 60;
	set.gheight = Math.floor(set.height / set.pixels_per_square);
	set.gwidth = Math.floor(set.width / set.pixels_per_square);
	set.gridDirty = true;
	set.tempCanvas = document.createElement("canvas");
	set.tempCanvas.width = set.width;
	set.tempCanvas.height = set.height;
	set.tempCanvasContext = set.tempCanvas.getContext("2d");
	//set.tempCanvasContext.globalCompositeOperation = "lighter";
	set.tempCanvasContext.globalAlpha = 0.5;
	//context.globalAlpha=0.2;
	set.lightingCanvas = document.createElement("canvas");
	set.lightingCanvas.width = set.width;
	set.lightingCanvas.height = set.height;
	set.lightingCanvasContext = set.lightingCanvas.getContext("2d");
	//set.lightingCanvasContext.fillStyle = color(255,255,255,1);
	//set.lightingCanvasContext.fillRect(0, 0, set.lightingCanvas.width, set.lightingCanvas.height);
	//set.lightingCanvasContext.fill();
	
	set.addLight = function (_x, _y, _radius) {
		set.lightingCanvasContext.save();
		var b = _radius;
		var x = _x;
		var y = _y;
		var width = b * 2;
		var height = b * 2;
		var rectx = x - b;
		var recty = y - b;
		var cgradient = set.lightingCanvasContext.createRadialGradient(x, y, 0, x, y, b);
		cgradient.addColorStop(0, "rgba(255, 255, 255, 1)");
		cgradient.addColorStop(1, "rgba(255, 255, 255, 0)");
		set.lightingCanvasContext.fillStyle = cgradient; //color(0,0,0,.5);
		//set.lightingCanvasContext.clearRect(rectx,recty,width,height);
		set.lightingCanvasContext.fillRect(rectx, recty, width, height);
		set.lightingCanvasContext.closePath();
		set.lightingCanvasContext.fill()
		set.lightingCanvasContext.restore();
	};
	
	set.grid_cache = {};
	
	set.grid_cache_at = function (gx, gy) {
		var gx_cache = set.grid_cache[gx];
		if (!gx_cache) {
			gx_cache = {};
			set.grid_cache[gx] = gx_cache;
		}
		var gy_cache = gx_cache[gy];
		if (!gy_cache) {
			gy_cache = {};
			gx_cache[gy] = gy_cache;
		}
		return gy_cache;
	}
	
	set.grid_cache_reset_all_values_for_key = function (key) {
		for (gx in set.grid_cache) {
			for (gy in set.grid_cache[gx]) {
				delete set.grid_cache[gx][gy][key];
			}
		}
	}
	
	// colors
	set.bg_colors = {
		neutral : color(90, 80, 70),
		positive : color(60, 80, 250),
		negative : color(250, 80, 60)
	};
	set.bg_color = set.bg_colors.neutral;
	set.grid_color = color(255, 255, 255);
	set.entrance_color = color(100, 255, 100);
	set.exit_color = color(255, 100, 50);
	set.killzone_color = color(200, 50, 50, 0.5);
	set.creep_color = color(255, 255, 0);
	
	// rendering groups
	set.rendering_groups = [];
	for (var i = 0; i <= 10; i++) {
		set.rendering_groups.push([]);
	};
	
	set.imageData = undefined;
	set.imageDataPopulated = false;
	
	set.finder = new PF.BiBestFirstFinder({
			allowDiagonal : false,
			heuristic : PF.Heuristic.euclidean
		});
	
	set.path = new Object; //undefined;
	
	set.updateGrid = function () {
		//console.log("set.updateGrid");
		if (set.gridDirty) {
			var _grid = new PF.Grid(set.gwidth, set.gheight);
			var gwidth = set.gwidth;
			var gheight = set.gheight;
			for (var gx = 0; gx < gwidth; gx++) {
				for (var gy = 0; gy < gheight; gy++) {
					_grid.setWalkableAt(gx, gy, valid_path_location(gx, gy));
				};
			};
			set.path = set.finder.findPath(set.entrance.gx, set.entrance.gy, set.exit.gx, set.exit.gy, _grid);
			
			set.gridDirty = false;
		};
	};
	
	set.getPathPoint = function (_index) {
		//console.log(_index);
		
		if (set.path[_index] == undefined) {
			set.gridDirty = true;
			set.updateGrid()
		};
		//console.log(set.path[_index]);
		var _point = {
			x : 0,
			y : 0
		};
		_point.x = set.path[_index][0];
		_point.y = set.path[_index][1];
		return _point;
	};
	
	set.zIndex = {
		system : 8,
		square : 7,
		killzone : 6,
		grid : 5,
		tower : 4,
		build : 3,
		creep : 2,
		bullet : 1,
		particle : 0
	};
	
	// game state
	set.state = undefined;
	
	// game values
	set.creep_variety = "Normal Creeps";
	set.creep_size = 10;
	set.creep_hp = 10;
	set.creep_value = 1;
	set.creep_speed = 100;
	set.missile_blast_radius = 5;
	set.missile_damage = 100;
	set.gold = 200;
	set.creeps_spawned = 0;
	set.max_creeps = 1;
	set.score = 0;
	set.lives = 20;
	set.nukes = 3;
	set.bomb_cost = 50;
	
	return set
};
var SET;

var fetch_ui_widgets = function () {
	var w = {};
	// status bar widgets
	
	w.score = document.getElementById("score");
	w.gold = document.getElementById("gold");
	w.lives = document.getElementById("lives");
	w.nukes_left = document.getElementById("nukes_left");
	w.creep_variety = document.getElementById("creep_variety");
	w.wave = document.getElementById("wave");
	w.till_next_wave = document.getElementById("till_next_wave");
	w.bomb_cost = document.getElementById("bomb_cost");
	
	// tower widgets
	w.tower = document.getElementById("tower");
	w.tower_type = document.getElementById("tower_type");
	w.tower_range = document.getElementById("tower_range");
	w.tower_damage = document.getElementById("tower_damage");
	w.tower_rate = document.getElementById("tower_rate");
	w.tower_upgrade_button = document.getElementById("tower_upgrade_button");
	w.tower_sell_button = document.getElementById("tower_sell_button");
	
	// creep widgets
	w.creep = document.getElementById("creep");
	w.creep_type = document.getElementById("creep_type");
	w.creep_hp = document.getElementById("creep_hp");
	w.creep_value = document.getElementById("creep_value");
	
	return w;
};
var WIDGETS;

/*
Drawable objects (grid, towers, creeps, everything).
 */

// prototype for grid lines and colored squares
var InertDrawable = new Object();
Object.extend(InertDrawable, {
	update : function () {},
	is_dead : function () {
		return false;
	},
	draw : function () {}
});

// responsible for updating settings in SET
// at the very beginning of a rendering cycle
var SettingUpdater = function () {
	var su = new Object();
	Object.extend(su, InertDrawable);
	su.update = function () {
		SET.now = ((new Date).getTime() - start);
	}
	assign_to_depth(su, SET.zIndex.system);
	return su;
};

var UIUpdater = function () {
	var uiu = new Object();
	Object.extend(uiu, InertDrawable);
	
	uiu.update = function () {
		//WIDGETS.creep_variety.innerHTML = SET.creep_variety;
		//WIDGETS.score.innerHTML = SET.score;
		//WIDGETS.gold.innerHTML = SET.gold;
		//WIDGETS.lives.innerHTML = SET.lives;
		//WIDGETS.nukes_left.innerHTML = SET.nukes + " left";
		//WIDGETS.till_next_wave.innerHTML = Math.floor(((SET.creep_wave_controller.last + SET.creep_wave_controller.delay) - SET.now) / 1000)
	};
	assign_to_depth(uiu, SET.zIndex.system);
	return uiu;
}

var Square = function (gx, gy, color) {
	var square = new Object();
	Object.extend(square, InertDrawable);
	square.type = "";
	square.gx = gx;
	square.gy = gy;
	square.x = grid_to_pixel(gx);
	square.y = grid_to_pixel(gy);
	var mid = center_of_square(gx, gy);
	square.x_mid = mid.x;
	square.y_mid = mid.y;
	square.color = color;
	square.draw = function () {};
	assign_to_depth(square, SET.zIndex.square);
	return square;
};

var ExitSquare = function (gx, gy) {
	var square = Square(gx, gy, SET.exit_color);
	square.type = "exit";
	square.draw = function () {
		context.save();
		context.fillStyle = SET.exit_color;
		draw_square_in_grid(this.gx, this.gy);
		var pos = grid_to_pixel(this.gx, this.gy);
		var h = SET.half_pixels_per_square;
		var l = SET.pixels_per_square;
		context.save();
		context.lineWidth = 2;
		context.strokeStyle = "rgba(0,0,0,1)";
		context.beginPath();
		context.moveTo(pos.x + h, pos.y + h);
		context.arc(pos.x + h, pos.y + h, (l - 1) / 2, 0, Math.PI * 2, false);
		context.closePath();
		context.stroke();
		context.fill();
		context.restore();
		context.restore();
	};
	return square;
};

var spawn_wave = function () {
	if (!SET.state || (SET.state.name() != "GameOverMode" && SET.state.name() != "PauseMode")) {
		var bonus = Math.floor(((SET.creep_wave_controller.last + SET.creep_wave_controller.delay) - SET.now) / 100);
		SET.creep_wave_controller.spawn_wave(bonus);
	};
};

var nuke_creeps = function () {
	if (SET.nukes > 0) {
		var creeps = SET.rendering_groups[SET.zIndex.creep];
		creeps.forEach(function (x) {
			x.hp = -1;
			x.value = 0;
		});
		play_sound("nuke");
		SET.nukes--;
	} else {
		error("You're all out of nukes!")
	}
};

var pause_resume = function () {
	if (SET.state) {
		var state_name = SET.state.name();
		if (state_name == "GameOverMode");
		else if (state_name == "PauseMode") {
			unselect();
		} else {
			unselect();
			SET.state = new PauseMode();
			SET.state.set_up();
		}
	} else {
		SET.state = new PauseMode();
		SET.state.set_up();
	};
};

var game_lost = function () {
	unselect();
	attempt_to_enter_ui_mode(new GameOverMode());
}

var reset_game = function () {
	SET = default_set();
	//WIDGETS = fetch_ui_widgets();
	//WIDGETS.bomb_cost.innerHTML = SET.bomb_cost;
	SettingUpdater();
	//UIUpdater();
	//SET.entrance = Square(0, random(SET.gheight - 1), SET.entrance_color);
	//SET.entrance.type = "entrance";
	//SET.exit = ExitSquare(SET.gwidth - 1, random(SET.gheight - 1));
	
	populate_terrains();
	
	//SET.creep_wave_controller = CreepWaveController();
	//reset_pathfinding();
	//$('').trigger("game_over", false);
};

/*
Mouse functions.
 */

var on_mouse_moved = function () {
	if (SET.state && SET.state.draw) {
		var pos = mouse_pos();
		mouse.x = pos.x;
		mouse.y = pos.y;
		SET.state.draw(pos.x, pos.y);
	}
};

// user-interface modes that can be entered by clicking within
// the game canvas (i.e. this does not include states reached
// by clicking an html button)
var UI_MODES_FROM_CLICK = [TowerSelectMode, CreepSelectMode];

var on_mouse_press = function () {
	var pos = mouse_pos();
	if (SET.state) {
		
		if (SET.state.is_legal(pos.x, pos.y)) {
			SET.state.action(pos.x, pos.y);
		}
		if (SET.state.can_leave_mode(pos.x, pos.y)) {
			unselect();
		}
	}
	if (!SET.state) {
		var len = UI_MODES_FROM_CLICK.length;
		for (var i = 0; i < len; i++) {
			var modeFunc = UI_MODES_FROM_CLICK[i];
			var mode = new modeFunc();
			if (mode.can_enter_mode(pos.x, pos.y)) {
				SET.state = mode;
				SET.state.set_up(pos.x, pos.y);
				break;
			}
		}
	}
}

var message = function (msg) {
	$('').trigger("message", msg);
}

var unselect = function () {
	if (SET.state)
		SET.state.tear_down();
	SET.state = undefined;
	$('').trigger("no_mode");
}

var error = function (msg) {
	$('').trigger("error", msg);
}

/*
Main game loop.
 */

var start_tower_defense = function () {
	setup = function () {
		//$('#pause_button').html("Pause");
		set_canvas("tower_defense");
		reset_game();
		canvas.height = 400;
		canvas.width = 600;
		frameRate(SET.framerate);
		//mouseMoved(on_mouse_moved);
		//mousePressed(on_mouse_press);
		initProcessing();
	}
	draw = function () {
		if (SET.state) {
			var state_name = SET.state.name();
			if (state_name == "GameOverMode" || state_name == "PauseMode")
				return
		}
		//background(SET.bg_color);
		update_groups(SET.rendering_groups);
		window.requestAnimFrame(draw);
	}
	setup();
}
