exports.create = create;

function create() {
	return new IdTable();
}

function IdTable() {
	this.idCount = 0;
	this.map = {};
	this.list = [];
}

IdTable.prototype.get = function(id) {
	return this.map[id];
}

IdTable.prototype.set = function(id, value) {
	var o = this.map[id];
	if (!o) return false;

	o.value = value;
	return true;
}

// 注意，添加的时候不需要指定 ID，因为会自动生成
IdTable.prototype.add = function(value) {
	var id = this.idCount++;
	var o = {
		id: id,
		value: value
	};
	this.list.push(o);
	this.map[id] = o;

	return id;
}

IdTable.prototype.remove = function(id) {
	var o = this.map[id];
	if (!o) return false;

	// 删除要做两件事
	// 1、从列表中删除
	// 2、从映射中删除
	this.list = this.list.filter(function(item) {
		return item !== o;
	});

	delete this.map[id];

	return true;
}

IdTable.prototype.exists = function(id) {
	return this.map[id] !== undefined;
}