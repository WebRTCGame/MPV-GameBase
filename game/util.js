/* Coordinate System

There are two coordinate systems in effect that need
to be taken into consideration. The first is the pixel
coordinate system, and the second is a coordinate system
formed by a grid of veritical and horizontal lines.
The grid's size is determined by three settings.

1. *pixels_per_square* determines the number of pixels per grid square.
2. *height* determines the overall height of the board.
3. *width* determines the overall width of the board.

Thus the board will create as many squares as possible within
the constraints of the height and width that it is given.

Within the code, positions within the grid coordinate
system are always referred to as (gx,gy) and positions
in the pixel coordinate system are always referred to
as (x,y). This is a very important distinction, and
mixing the two together can cause ample confusion.

 */

/*
General utility functions.
 */
 /*
			#include <iostream>
#include <cmath>

struct Vector {
  double x,y;

  Vector(double x, double y):x(x),y(y){
  }

  double dot(Vector const &v) const{
    return x*v.x+y*v.y;
  }
};

Vector operator*(double s, Vector const &v){
  return Vector(s*v.x,s*v.y);
}

struct Point {
  double x,y;

  Point(double x, double y):x(x),y(y){
  }

  Vector operator-(Point const &p) const{
    return Vector(x-p.x,y-p.y);
  }

  Point operator+(Vector const &v) const{
    return Point(x+v.x,y+v.y);
  }
};
*/
 var largest_root_of_quadratic_equation = function(A,B,C){
 return (Math.sqrt(B*B-4*A*C))/(2*a);
 };
 /*


Point intercept(Point const &shooter, double bullet_speed, Point const &target, Vector const &target_velocity){
  double a = bullet_speed*bullet_speed - target_velocity.dot(target_velocity);
  double b = -2*target_velocity.dot(target-shooter);
  double c = -(target-shooter).dot(target-shooter);

  return target+largest_root_of_quadratic_equation(a,b,c)*target_velocity;
}

Vector shoot_at(Point const &shooter, Point const &interception, double bullet_speed){
  Vector v = interception-shooter;
  return bullet_speed/std::sqrt(v.dot(v))*v;
}

int main(){
  Point shooter(0,0);
  Point target(0,10);
  Vector target_velocity(3,0);
  double bullet_speed = 5.0;

  Point P = intercept(shooter,bullet_speed,target,target_velocity);
  Vector V = shoot_at(shooter,P,bullet_speed);

  std::cout << "Shoot in direction (" << V.x << ',' << V.y << ") and you'll hit the target at (" << P.x << ',' << P.y << ").\n";
}
			*/

 
var color = function (r, g, b, a) {
	if (!a)
		return "rgb(" + r + "," + g + "," + b + ")";
	else
		return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}; 
 
// return a random number (0 <= n <= max)
var random = function (max) {
	return Math.floor(Math.random() * (max + 1));
};

function radians(deg) {
	return deg * Math.PI / 180;
};
function degrees(rad) {
	return rad * 180 / Math.PI;
};

function clamp(value, min, max) {
	if (max < min) {
		var temp = min;
		min = max;
		max = temp;
		
	}
	return Math.max(min, Math.min(value, max));
};

//given a start point, and end point, and a speed at which to travel,
//return the point that the entity should go to in the next draw
var calc_path = function (x1, y1, x2, y2, speed) {
	var ac = y2 - y1;
	var bc = x2 - x1;
	var ab = Math.sqrt(Math.pow(ac, 2) + Math.pow(bc, 2));
	var de = (1.0 * speed * ac) / ab;
	var be = (1.0 * speed * bc) / ab;
	return {
		y : de,
		x : be
	};
};

var dist = function (x1, y1, x2, y2) {
	var ac = y2 - y1;
	var bc = x2 - x1;
	return Math.sqrt(Math.pow(ac, 2) + Math.pow(bc, 2));
}

var VDistance = function (a, b) {
	return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
}

var getAngle = function (a, b) {
	var tx = a.x - b.x,
	ty = a.y - b.y,
	rad = Math.atan2(ty, tx),
	angle = rad; //Math.PI * 180;
	return angle;
}
var randomRange = function (_min, _max) {
	return Math.floor(Math.random() * _max + _min);
}
/*
Coordinate systems utilities.
 */

// return pixel coordinates of top left corner
// of square at grid coordinates (gx,gy)
var grid_to_pixel = function (gx, gy) {
	if (gy == undefined) {
		gy = gx.gy;
		gx = gx.gx;
	}
	return {
		x : gx * SET.pixels_per_square,
		y : gy * SET.pixels_per_square
	};
};

// return grid coordinates of square containing pixel
// coordinate (x,y)
var pixel_to_grid = function (x, y) {
	if (y == undefined) {
		y = x.y;
		x = x.x;
	}
	var grid_x = Math.floor(x / SET.pixels_per_square);
	var grid_y = Math.floor(y / SET.pixels_per_square);
	return {
		gx : grid_x,
		gy : grid_y
	};
};

// return pixel coordinates for the center of
// square at grid coordinates (gx,gy)
var center_of_square = function (gx, gy) {
	if (gy == undefined) {
		gy = gx.gy;
		gx = gx.gx;
	}
	var coords = grid_to_pixel(gx, gy);
	return {
		x : coords.x + SET.half_pixels_per_square,
		y : coords.y + SET.half_pixels_per_square
	};
};

/*
Drawing functions.
 */

// draw a square filling square (gx,gy)
var draw_square_in_grid = function (gx, gy) {
	var pos = grid_to_pixel(gx, gy);
	context.beginPath();
	context.rect(pos.x, pos.y, SET.pixels_per_square, SET.pixels_per_square);
	context.closePath();
}



/*
Various game utility functions.
 */

var can_build_here = function (gx, gy) {
	if (get_tower_at(gx, gy) != false)
		return false;
	if ((gx == SET.entrance.gx) && (gy == SET.entrance.gy))
		return false;
	if ((gx == SET.exit.gx) && (gy == SET.exit.gy))
		return false;
	
	return true;
};

var get_tower_at = function (gx, gy) {
	var cached = SET.grid_cache_at(gx, gy);
	if (cached.tower)
		return cached.tower;
	
	var towers = SET.rendering_groups[SET.zIndex.tower];//SET.tower_render_level];
	for (var i = 0; i < towers.length; i++) {
		var tower = towers[i];
		if (tower.gx == gx && tower.gy == gy) {
			cached.tower = tower;
			return tower;
		}
	}
	return false;
};

var get_terrain_at = function (gx, gy) {
	var cached = SET.grid_cache_at(gx, gy);
	if (cached.terrain)
		return cached.terrain;
	
	var squares = SET.rendering_groups[SET.zIndex.square];//SET.square_render_level];
	for (var i = 0; i < squares.length; i++) {
		var square = squares[i];
		if (square.gx === gx && square.gy === gy) {
			cached.terrain = square;
			return square;
		}
	}
	return;
}

var get_creep_nearest = function (x, y, sensitivity) {
	if (!sensitivity)
		sensitivity = 10;
	var creeps = SET.rendering_groups[SET.zIndex.creep];
	var len = creeps.length;
	var nearest_creep;
	var distance = sensitivity;
	for (var i = 0; i < len; i++) {
		var creep = creeps[i];
		var d = dist(x, y, creep.x, creep.y);
		if (d < distance) {
			distance = d;
			nearest_creep = creep;
		}
	}
	return (distance < sensitivity) ? nearest_creep : undefined;
}

// Object.extend borrowed from Prototype javascript library.
Object.extend = function (destination, source) {
	for (var property in source) {
		destination[property] = source[property];
	}
	return destination;
};

// Pretty-printing of objects
var pp = function (obj, depth) {
	if (depth === undefined)
		depth = 4;
	depth -= 1;
	if (depth <= 0)
		return '' + obj;
	if (obj instanceof Array) {
		var str = "[";
		obj.forEach(function (i) {
			str += pp(i, depth) + ", ";
		});
		return str + "]";
	}
	if (obj instanceof String)
		return '"' + str + '"';
	if (obj instanceof Object) {
		var str = "{"; //variable which will hold property values
		for (prop in obj) {
			if (prop === "ancestor")
				depth = 0;
			str += pp(prop, depth) + ":" + pp(obj[prop], depth) + ", ";
		}
		return str + "}";
	}
	
	return '' + obj;
	
}

var log = function (label, thing) {
	if (thing === undefined)
		$('#log').append(label + "<br/>");
	else
		$('#log').append(label + ": " + pp(thing) + "<br/>");
}

Array.prototype.equals = function (testArr) {
	if (this.length != testArr.length)
		return false;
	for (var i = 0; i < testArr.length; i++) {
		if (this[i].equals) {
			if (!this[i].equals(testArr[i]))
				return false;
		}
		if (this[i] != testArr[i])
			return false;
	}
	return true;
}

var insert_sorted = function (array, value, sortKey) {
	var vkey = sortKey(value);
	var min = 0;
	var max = array.length;
	var mid = -1;
	while (true) {
		if (max <= min) {
			break;
		}
		mid = Math.floor((max + min) / 2);
		if (mid >= array.length || mid < 0) {
			log("outofbounds in insert sorted");
			break;
		}
		if (vkey <= sortKey(array[mid]))
			max = mid - 1;
		else
			min = mid + 1;
	}
	mid = Math.floor((max + min) / 2);
	if (array[mid])
		if (vkey > sortKey(array[mid]))
			mid += 1;
	mid = Math.max(0, mid);
	
	var result = array.slice(0, mid).concat([value]).concat(array.slice(mid))
		//   log("inserting", [mid,vkey,array.map(sortKey), result.map(sortKey)]);
		//   var rm = result.map(sortKey);
		//   if (!rm.equals(rm.slice().sort(function(a,b){return a-b})))
		//     log("insert_sorted failed inserting",[vkey,rm]);
		return result;
}

//moves the given object towards the target at speed
//also ensures that the given object doesn't go outside of the bounds
//of the map
var move_towards = function (obj, x, y, tx, ty, speed) {
	var path = calc_path(x, y, tx, ty, speed);
	obj.x += path.x;
	obj.y += path.y;
	obj.x = Math.max(0, Math.min(SET.width, obj.x));
	obj.y = Math.max(0, Math.min(SET.height, obj.y));
}
