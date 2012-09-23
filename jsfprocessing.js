var GLOBAL_PROCESSING;
var context;
var start;
var canvas;

function set_canvas(id) {
	canvas = document.getElementById(id);
	//GLOBAL_PROCESSING = Processing(canvas);
	context = canvas.getContext("2d");
	start = (new Date).getTime();
	canvas.width = 600;
	canvas.height = 400;
};

var draw = function () {}; // stub to replace

function frameRate(rate) {
	window.requestAnimFrame(draw);
};

 window.requestAnimFrame = (function(){
 console.log("window.requestAnimFrame");
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
 })();


function text(itext, x, y) {
	context.save();
	context.font = "bold 16pt Ariel";
	context.fillText(itext, x, y);
	context.restore();
};

function text2(itext, x, y, isize) {
	context.save();
	context.font = "bold " + isize + "pt Ariel";
	context.fillText(itext, x, y);
	context.restore();
};

function mouse_pos() {
	return {
		x : GLOBAL_PROCESSING.mouseX,
		y : GLOBAL_PROCESSING.mouseY
	};
};

function previous_mouse_pos() {
	return {
		x : GLOBAL_PROCESSING.pmouseX,
		y : GLOBAL_PROCESSING.pmouseY
	};
};

function mousePressed(func) {
	GLOBAL_PROCESSING.mousePressed = func;
};

function mouseReleased(func) {
	GLOBAL_PROCESSING.mouseReleased = func;
};

function mouseMoved(func) {
	GLOBAL_PROCESSING.mouseMoved = func;
};

function mouseReleased(func) {
	GLOBAL_PROCESSING.mouseDragged = func;
};

function initProcessing() {
	//GLOBAL_PROCESSING.init();
};
