var CircleZone = function (x, y, r) {
	var cz = new Object();
	Object.extend(cz, InertDrawable);
	var d = 2 * r;
	cz.color = SET.killzone_color;
	
	function circle(x, y, r, c) {
    context.beginPath();
    var rad = context.createRadialGradient(x, y, 1, x, y, r);
    rad.addColorStop(0, 'rgba('+c+',1)');
    rad.addColorStop(1, 'rgba('+c+',0)');
    context.fillStyle = rad;
    context.arc(x, y, r, 0, Math.PI*2, false);
    context.fill();
	context.closePath();
	};
	
	cz.draw = function () {
		context.save();
		context.fillStyle = this.color;
		context.lineWidth = 2;
		context.strokeStyle="rgba(0,0,0,1)";
		circle(x , y , d*.5, '255,0,0');
		context.stroke();
		context.restore();
	};
	return cz
}

var KillZone = function (x, y, r) {
	var kz = new CircleZone(x, y, r);
	assign_to_depth(kz, SET.zIndex.killzone);
	return kz;
};

var BuildRadius = function (x, y, r) {
	var br = KillZone(x, y, r);
	assign_to_depth(br, SET.zIndex.build);
	return br;
};

var MissileRadius = function (x, y, r) {
	var mr = KillZone(x, y, r);
	mr.color = color(0, 40, 40, 0.5);
	return mr;
}
