exports.create = create;
exports.KeyTable = KeyTable;

function create() {
	return new KeyTable();
}

function KeyTable() {
	this.map = {};
	this.list = [];
}

KeyTable.prototype.get = function(key) {
	var o = this.map[key];
	if (!o) return undefined;
	else return o.value;
}

KeyTable.prototype.set = function(key, value) {
	var o = this.map[key];
	if (!o) return false;

	o.value = value;
	return true;
}

KeyTable.prototype.add = function(key, value) {
	// key 不能已经存在
	if (this.map[key]) {
		throw {error: 'key repetition'};
	}

	var o = {
		key: key,
		value: value
	};
	this.list.push(o);
	this.map[key] = o;

	return key;
}

KeyTable.prototype.remove = function(key) {
	var o = this.map[key];
	if (!o) return false;

	// 删除要做两件事
	// 1、从列表中删除
	// 2、从映射中删除
	this.list = this.list.filter(function(item) {
		return item !== o;
	});

	delete this.map[key];

	return true;
}

KeyTable.prototype.exists = function(key) {
	return this.map[key] !== undefined;
}

// # cb(key, value)
KeyTable.prototype.forEach = function(cb) {
	if (typeof cb !== 'function') return;
	for (var i = 0, len = this.list.length; i < len; ++i) {
		var item = this.list[i];
		if (false === cb(item.key, item.value)) {
			break;
		}
	}
}