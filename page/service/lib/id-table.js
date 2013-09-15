exports.create = create;
exports.IdTable = IdTable;

var KeyTable = require('./key-table').KeyTable,
	util = require('util');

function create() {
	return new IdTable();
}

// IdTable 是通过扩展 KeyTable 得来的
util.inherits(IdTable, KeyTable);

function IdTable() {
	this.idCount = 0;
	// 初始化 KeyTable 特定的一些数据项
	KeyTable.apply(this);
}

// 注意，添加的时候不需要指定 ID，因为会自动生成
IdTable.prototype.add = function(value) {
	var id = this.idCount++;
	var baseAdd = this.__proto__.__proto__.add;

	// 调用上级函数完成添加，并返回 id
	return baseAdd.apply(this, [id, value]);
}