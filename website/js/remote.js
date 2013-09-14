var gObjToWrap;

function createQuery() {
	var dirPathAbs = $('#dirPathAbs').val();
	gObjToWrap = {
		funcName: 'Directory.query',
		args: {
			dirPathAbs: dirPathAbs			
		}
	}
	logSuccess(JSON.stringify(gObjToWrap));
}

function wrap() {
	var target;

	if (!gObjToWrap) {
		logFailure('gObjToWrap=' + JSON.stringify(gObjToWrap));
		return;
	}

	target = $('#target').val();

	gObjToWrap = {
		funcName: 'Router.deliver',
		args: {
			target: target,
			content: gObjToWrap
		}
	};

	logSuccess(JSON.stringify(gObjToWrap));
}

// 投递
function deliver() {
	rpc(gObjToWrap.funcName, gObjToWrap.args, success, failure);
}

// 查询投递情况
function query() {
	var ticketId = $('#ticket-id').val();
	
	rpc('Router.query', {
		id: ticketId
	}, success, failure);
}

function success(result) {
	logSuccess(JSON.stringify(result));
}

function failure(err) {
	logFailure(JSON.stringify(err));
}

function logFailure(msg) {
	log('failure', msg);
}

function logSuccess(msg) {
	log('success', msg);
}

function log(type, msg) {
	var container = $('<div></div>').addClass(type).text(msg);
	$('#log').append(container);
}