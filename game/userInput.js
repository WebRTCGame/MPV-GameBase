var userInput = new processing();

/* Hotkeys! */
special_keys = {
	27 : 'esc',
	9 : 'tab',
	32 : 'space',
	13 : 'return',
	8 : 'backspace',
	145 : 'scroll',
	20 : 'capslock',
	144 : 'numlock',
	19 : 'pause',
	45 : 'insert',
	36 : 'home',
	46 : 'del',
	35 : 'end',
	33 : 'pageup',
	16 : 'shift',
	34 : 'pagedown',
	37 : 'left',
	38 : 'up',
	39 : 'right',
	40 : 'down',
	112 : 'f1',
	113 : 'f2',
	114 : 'f3',
	115 : 'f4',
	116 : 'f5',
	117 : 'f6',
	118 : 'f7',
	119 : 'f8',
	120 : 'f9',
	121 : 'f10',
	122 : 'f11',
	123 : 'f12'
};

/* Modifier keys */
var modifierkeys = {};
var shift_down = false;

//extract hotkeys from the DOM
var hotkeys = {};

$('button .hotkey').each(function () {
	//this is bass ackwards, but I got type errors passing around the native click method
	var button = this.parentNode;
	hotkeys[$(this).html().toUpperCase()] = function () {
		button.click()
	};
});

//hotkeys that aren't in the dom
hotkeys["space"] = userInput.pause();
hotkeys["esc"] = userInput.unselect();
hotkeys['Z'] = function () {
	$('#log').empty()
};
hotkeys['R'] = function () {
	if ( SET.state.name() === "GameOverMode" )
		reset_game();
};

//modifiers to be called on keydown and keyup
modifierkeys["shift"] = function () {
	shift_down = !shift_down;
};

$(document).bind("keydown", function (e) {
	// if the user is holding down ctrl or cmd, let the browser handle it
	if (e.metaKey)
		return true;
	var key = special_keys[e.keyCode] || String.fromCharCode(e.keyCode);
	if (key in hotkeys) {
		hotkeys[key]();
		return false;
	}
	if (key in modifierkeys) {
		modifierkeys[key]();
		return false;
	}
	return true;
});

$(document).bind("keyup", function (e) {
	if (e.metaKey)
		return true;
	var key = special_keys[e.keyCode] || String.fromCharCode(e.keyCode);
	if (key in modifierkeys) {
		modifierkeys[key]();
		return false;
	}
	return true;
});

/* Toggle buttons along the bottom */

// all of this is really a prime candidate for some cleanup
// so much dupiclation and so many global variables for such
// simple behavior

var paused = false;

function mute() {
	mute_unmute();
	$('#mute_button').html(muted ? "Unmute" : "Mute");
}
var logging = true;
var prim_log = log;
function toggle_logging() {
	logging = !logging;
	
	if (logging)
		log = prim_log;
	else
		log = function () {};
	$("#logging_button").toggleClass("active_mode").html(logging ? "Stop <span class='hotkey'>D</span>ebugging" : 'Start <span class="hotkey">D</span>ebugging');
}

if (document.location.hash === "#debug")
	$('#logging_button').show();
else {
	toggle_logging()
	$('#logging_button')[0].onclick = function () {};
}

var getIdFromURL = function (url) {
	return url.slice(url.indexOf("#"));
}
$("#help-headers .section").click(function () {
	$("#help-sections div").hide();
	$(getIdFromURL(this.href)).show();
	$("#help-headers .section").removeClass("active");
	$(this).addClass("active");
	return false;
})

var help_displayed = false;
var toggle_help = function () {
	help_displayed = !help_displayed;
	if (help_displayed) {
		$("#help").show();
		$("#help_button").addClass("active_mode");
		if (!paused)
			userInput.pause();
	} else {
		$('#help').hide();
		$('#help_button').removeClass('active_mode');
		if (paused)
			userInput.pause();
	}
};

for (event in userInput.mode_signifiers) {
	$('').bind(event, function (e) {
		$('#' + userInput.mode_signifiers[e.type]).addClass('active_mode');
	});
}
$('').bind('no_mode', function () {
	$('.mode_button').removeClass('active_mode');
})

/* Messages for the player */

//Temporary messages are a bit of a pain
var timeToHide = null;
["error", "message"].forEach(function (s) {
	$('.' + s).hide();
	$('').bind(s, function (e, message) {
		timeToHide = new Date().getTime() + 2500;
		var el = $('.' + s);
		el.html(message).fadeIn();
		window.setTimeout(function () {
			if (new Date().getTime() >= timeToHide)
				el.fadeOut();
		}, 3000);
	});
});
$('#game_over').hide();
$('').bind('game_over', function (e, over) {
	if (over == true) {
		log("game over");
		$('#game_over').html("Game Over! Final score: " + $("#score").html()).fadeIn();
		//tempt tempt tempt
		for (var i = 0; i < 3; i++)
			$("#reset_button").effect("highlight", {
				color : "#f60"
			}, 3000);
	} else {
		log("game (re?)started");
		$('#game_over').html("Just once more...").fadeOut();
	}
});

function initUserInput() {
	mouseMoved(on_mouse_moved);
	mousePressed(on_mouse_press);
	userInput.init();
	//initProcessing();
};

var on_mouse_moved = function () {
	if (SET.state && SET.state.draw) {
		var pos = userInput.mouse_pos();
		SET.state.draw(pos.x, pos.y);
	};
};

// user-interface modes that can be entered by clicking within
// the game canvas (i.e. this does not include states reached
// by clicking an html button)
var UI_MODES_FROM_CLICK = [TowerSelectMode, CreepSelectMode];

var on_mouse_press = function () {
	var pos = userInput.mouse_pos();
	if (SET.state) {
		if (SET.state.is_legal(pos.x, pos.y)) {
			SET.state.action(pos.x, pos.y);
		};
		if (SET.state.can_leave_mode(pos.x, pos.y)) {
			userInput.unselect();
		};
	};
	if (!SET.state) {
		var len = UI_MODES_FROM_CLICK.length;
		for (var i = 0; i < len; i++) {
			var modeFunc = UI_MODES_FROM_CLICK[i];
			var mode = new modeFunc();
			if (mode.can_enter_mode(pos.x, pos.y)) {
				SET.state = mode;
				SET.state.set_up(pos.x, pos.y);
				break;
			};
		};
	};
};

var message = function (msg) {
	$('').trigger("message", msg);
};

var error = function (msg) {
	$('').trigger("error", msg);
};

function mousePressed(func) {
	userInput.mousePressed = func;
};

function mouseReleased(func) {
	userInput.mouseReleased = func;
};

function mouseMoved(func) {
	userInput.mouseMoved = func;
};

function mouseReleased(func) {
	userInput.mouseDragged = func;
};