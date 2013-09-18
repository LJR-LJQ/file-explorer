var t;

function login() {
	transitionBetween('#login-container', '#login-progress-container', function() {
		setTimeout(function() {
			transitionBetween('#login-progress-container', '#file-explorer-container');
		}, 1000);
	});
}

function cancelLogin() {
	transitionBetween('#login-progress-container', '#login-container');
}


function transitionBetween(fromSelector, toSelector, scb) {
	hideUI(fromSelector, function() {
		showUI(toSelector, scb);
	});
}

function hideUI(selector, scb) {
	$(selector).addClass('anim-hide');
	setTimeout(function() {
		$(selector).addClass('none');
		scb();
	}, 1250);
}

function showUI(selector, scb) {
	$(selector).removeClass('none');
	setTimeout(function() {
		$(selector).removeClass('anim-hide');
		scb();
	}, 0);
}