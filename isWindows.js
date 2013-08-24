exports.isWindows = isWindows;

var _isWindows = undefined;

function isWindows() {
	if (_isWindows === undefined) {
		_isWindows = /^win/.test(process.platform.toLowerCase());
	}
	return _isWindows;
}