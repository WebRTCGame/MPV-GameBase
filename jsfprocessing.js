var context;
var start;
var canvas;


var draw = function () {}; 

function frameRate(rate) {
	window.requestAnimFrame(draw);
};

window.requestAnimFrame = (function () {
	console.log("window.requestAnimFrame");
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function (callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

var update_groups = function (groups) {
	
	SET.now = ((new Date).getTime() - start);


	
	if (SET.imageDataPopulated) {
		context.save();
		SET.tempCanvasContext.save();
		
		if (SET.xval < 100) {
			SET.xval++
		};
		
		SET.tempCanvasContext.fillStyle = "rgb(" + 255 + "," + 0 + "," + 0 + ")";
		SET.tempCanvasContext.beginPath();
		SET.tempCanvasContext.rect(SET.xval, 10, 40, 80);
		SET.tempCanvasContext.closePath();
		SET.tempCanvasContext.fill();
		SET.tempCanvasContext.restore();
		context.drawImage(SET.tempCanvas, 0, 0);
		context.restore();
	};
	
	if (!SET.imageDataPopulated) {
		context.globalAlpha = 1;
		SET.imageDataPopulated = true;
	};
	
};

var default_set = function () {
	var set = {};
	set.height = 400;
	set.width = 600;
	set.framerate = 60;
	set.tempCanvas = document.createElement("canvas");
	set.tempCanvas.width = set.width;
	set.tempCanvas.height = set.height;
	set.tempCanvasContext = set.tempCanvas.getContext("2d");
	set.xval = 0;
	set.state = undefined;
	
	return set
};
var SET;




var Game_Init = function () {
	setup = function () {
		//set_canvas("Game");
			canvas = document.getElementById("Game");
	context = canvas.getContext("2d");
	start = (new Date).getTime();
	canvas.width = 600;
	canvas.height = 400;
		SET = default_set();
		canvas.height = 400;
		canvas.width = 600;
		frameRate(SET.framerate);
		
	}
	draw = function () {
		if (SET.state) {
			var state_name = SET.state.name();
			if (state_name == "GameOverMode" || state_name == "PauseMode")
				return
		}
		update_groups(SET.rendering_groups);
		window.requestAnimFrame(draw);
	}
	setup();
}
