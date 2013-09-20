exports.serviceName = 'Config';
exports.getConfig = getConfig;
exports.setConfig = setConfig;

var fs = require('fs'),
	path = require('path');

// 配置文件保存的路径
var configFileName = path.resolve(__dirname, 'config/config.json');

var config;

function getConfig(args, callback) {
	if (config === undefined) {
		if (!loadConfigFromFile()) {
			callback({error: 'load config from file failed'});
			return;
		}
	}

	callback(config);
}

function setConfig(args, callback) {
	config = args;
	if (!saveConfigToFile()) {
		callback({error: 'save config to file failed'});
	} else {
		callback({});
	}
}

function loadConfigFromFile() {
	try {
		config = JSON.parse(fs.readFileSync(configFileName, {encoding: 'utf8'}));
		return true;
	} catch(err) {
		console.log('[loadConfigFromFile] ' + err.toString());
		return false;
	}
}

function saveConfigToFile() {
	try {
		fs.writeFileSync(configFileName, JSON.stringify(config), {encoding: 'utf8'});
		return true;
	} catch(err) {
		console.log('[saveConfigToFile] ' + err.toString());
		return false;
	}
}