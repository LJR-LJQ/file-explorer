exports.serviceName = 'Directory';
/*
exports.create = create;
exports['delete'] = _delete;
exports.rename = rename;
exports.copy = copy;
exports.move = move;
*/
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
	var dirPathAbs,
		result;

	dirPathAbs = args.dirPathAbs;
	if (typeof dirPathAbs !== 'string' || dirPathAbs === '') {
		callback({error: 'dirPathAbs must be string and not empty'});
		return;
	}

	result = {
		path: dirPathAbs,
		dirList: [],
		fileList: []
	};

	// 注意，Windows 的路径表示法在这里是和 Linux 一样的
	// C:\Windows\System32 表示为： /C/Windows/System32
	// 因此在实际进行查询之前，需要先进行转换
	if (libfs.isWindows()) {
		// 如果要查根目录，则直接返回驱动器列表
		if (dirPathAbs === '/') {

			libfs.getLogicalDrives(function(logicalDriveList) {
				result.dirList = logicalDriveList;

				// 向客户端返回结果
				callback(result);
			});


			// 不再继续向下执行
			return;
		}

		// 对于普通目录，则只需要先转换一下路径即可
		dirPathAbs = convertPath(dirPathAbs);
	}

	libfs.queryDir(dirPathAbs, success, failure);

	function success(dirList, fileList) {
		result.dirList = dirList;
		result.fileList = fileList;
		callback(result);		
	}

	function failure() {
		callback({error: 'unknwon'});
	}

	function convertPath(path) {
		if (!path) return path;
		return path.replace(/^(\/([a-zA-Z]))(\/|$)/, "$2:/");
	}
}