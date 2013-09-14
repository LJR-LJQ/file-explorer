exports.serviceName = 'Directory';
exports.create = create;
exports['delete'] = _delete;
exports.rename = rename;
exports.copy = copy;
exports.move = move;
exports.query = query;

var libfs = require('libfs');

function create(args, callback) {
	libfs.createDir(args.dirPathAbs, args.dirName, success, failure);

	function success() {
		callback({});
	}

	function failure() {
		callback({error: 'unknwon'});
	}
}

function _delete(args, callback) {
	libfs.deleteDir(args.dirPathAbs, success, function(){}, failure);
	
	function success() {
		callback({});
	}

	function failure() {
		callback({error: 'unknwon'});
	}
}

function rename(args, callback) {
	libfs.renameDir(args.dirPathAbs, args.newName, success, failure);
	
	function success() {
		callback({});
	}

	function failure() {
		callback({error: 'unknwon'});
	}
}

function copy(args, callback) {
	libfs.copyDir(args.srcDirPathAbs, args.targetDirPathAbs, success, function(){}, failure);
	
	function success() {
		callback({});
	}

	function failure() {
		callback({error: 'unknwon'});
	}
}

function move(args, callback) {
	libfs.moveDir(args.srcDirPathAbs, args.targetDirPathAbs, success, empty, empty, failure);

	function empty() {

	}
	
	function success() {
		callback({});
	}

	function failure() {
		callback({error: 'unknwon'});
	}
}

function query(args, callback) {
	libfs.queryDir(args.dirPathAbs, success, failure);

	function success(dirList, fileList) {
		callback({
			dirList: dirList,
			fileList: fileList
		});
	}

	function failure() {
		callback({error: 'unknwon'});
	}
}