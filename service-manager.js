// [导出]
exports.dispatch = dispatch;

// [模块]
var fs = require('fs'),
	path = require('path');

// [变量]
var serviceList = [];

// [流程]
var serviceDir = path.resolve(__dirname, 'service/');
loadServices(serviceDir);

// [函数]
function dispatch(req, callback, _rawReq, _rawRes) {
	var funcName,
		args;

	// funcName 必须属于字符串而且不能是空串
	if (typeof req.funcName !== 'string' || req.funcName === '') {
		safeCall(callback, {error: 'funcName not provided'});
		return;
	}

	// funcName 的格式必须满足要求
	if (!/^[^\.]+\.[^$]+$/.test(req.funcName)) {
		safeCall(callback, {error: 'funcName format incorrect'});
		return;
	}

	// args 必须属于对象而且不能为 null
	if (typeof req.args !== 'object' || req.args === null) {
		safeCall(callback, {error: 'args type error'});
		return;
	}

	funcName = req.funcName;
	args = req.args;

	console.log('call >> ' + funcName);

	// 从 funcName 中分离出 serviceName 和 func 两部分
	var serviceName,
		func;
	var service;

	serviceName = /^[^\.]+/.exec(funcName)[0];
	func = funcName.substring(serviceName.length + 1);

	// 查找对应的 service 并进行调用
	service = serviceList[serviceName];
	if (service) {
		// 确定该 service 确实有对应的 func
		if (!service[func]) {
			safeCall(callback, {error: 'unknown funcName (func not found on service)'});
			return;
		}

		// 调用
		try {
			service[func](args, callback, _rawReq, _rawRes);
		} catch(err) {
			safeCall(callback, {error: 'function internal error > ' + err.toString()});
			console.log(err.stack);
		}

	} else {
		safeCall(callback, {error: 'unknown funcName (service not found)'});
	}
}

function loadServices(serviceDir) {
	var files,
		obj;

	// 读取文件列表
	files = fs.readdirSync(serviceDir);

	// 转换为绝对路径
	files = files.map(function(file) {
		return path.resolve(serviceDir, file);
	});

	// 逐个加载
	files.forEach(function(file) {
		try {
			if (!isJsFile(file)) return;
			obj = require(file);
			// TODO 对 obj 进行一些验证
			serviceList.push(obj);
			serviceList[obj.serviceName] = obj;
			obj.requestOtherService = requestOtherServiceImp;
			console.log('load service ok: ' + obj.serviceName);
		} catch(err) {
			console.log('load service failed: ' + file);
			console.error(err.toString());
		}
	});

	function isJsFile(filename) {
		var ext = path.extname(filename);
		if (typeof ext === 'string') {
			return ext.toLowerCase() === '.js';
		} else {
			return false;
		}
	}
}

function safeCall(callback, resObj) {
	if (typeof callback !== 'function') return;
	try {
		callback(resObj);
	} catch(err) {

	}
}

function requestOtherServiceImp(req, callback) {
	dispatch(req, callback);
}