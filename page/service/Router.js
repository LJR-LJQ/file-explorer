exports.serviceName = 'Router';
exports.deliver = deliver;
exports.query = query;

var IdTable = require('./lib/id-table');

var idCount = 0;
// 用于保存 ticket 列表
var deliveryTaskTable = IdTable.create();
// 用于保存路由表
var routerTable = {};
var routerList = [];

function deliver(args, callback, _rawReq, _rawRes) {
	// 目前没有真正实现路由功能
	// 因此只是交给本地来处理

	var target,
		content;

	content = args.content;
	if (!content) {
		callback({error: 'empty content'});
		return;
	}

	// 创建一个任务返回给客户端
	var id = deliveryTaskTable.add();
	callback({
		id: id
	});

	// 把 content 再交给 serviceManager 去分发
	serviceManager.dispatch(content, localCallback, _rawReq, _rawRes);

	function localCallback(result) {
		deliveryTaskTable.set(id, {
			result: result
		});
	}
}

function query(args, callback) {
	var id,
		deliveryTask;

	id = args.id;
	if (!id) {
		callback({error: 'id is missing'});
		return;
	}

	deliveryTask = deliveryTaskTable.get(id);
	if (!deliveryTask) {
		callback({error: 'deliveryTask not found, id=' + id});
		return;
	}

	// 返回 deliveryTask
	callback(deliveryTask);
}