// [导出]
exports.serviceName = 'Tunnel';
exports.register = register;
exports.query = query;

// [模块]
var IdTable = require('./lib/id-table');

// [变量]
var tunnelTable = IdTable.create();

// [函数]
function register(args, callback) {
	var fileName,
		fileSize;

	fileName = args.fileName;
	if (typeof fileName !== 'string' || fileName === '') {
		callback({error: 'fileName must be string and not empty'});
		return;
	}

	fileSize = args.fileSize;
	if (typeof fileSize !== 'number') {
		callback({error: 'fileSize must be number'});
		return;
	}

	var tunnelId = tunnelTable.add({
		fileName: fileName,
		fileSize: fileSize
	});

	// 返回 tunnelId 给用户
	callback({tunnelId: tunnelId});

	console.log('register tunnel, id=' + tunnelId, + ' fileName=' + fileName);
}

function query(args, callback) {
	var id;

	id = args.id;
	if (id === undefined) {
		callback({error: 'id is missing'});
		return;
	}

	var o = tunnelTable.get(id);
	if (!o) {
		callback({error: 'id not found'});
		return;
	}

	callback(o);
}