var child_process = require('child_process');

exports.shutdownComputer = shutdownComputer;

// 【功能】
// 关闭计算机

// 【参数】

// [scb]
// 非空回调函数，关机操作成功发起后调用该函数
// 其函数原型为：
// scb()

// [fcb]
// 非空未凋函数，关机操作发起失败后调用该函数
// 其函数原型为：
// fcb()

// 【返回值】
// 本函数没有任何有意义的返回值

// 【备注】
// 本函数只负责发起关机操作，但是由于权限或其他限制，可能无法成功
// 即使发起成功，由于操作系统的运行机制，用户也可能中断、取消关机过程
// 当本函数通过 scb 回调通知调用者操作执行成功的时候，只是说明关机操作成功发起
// 但是不保证确实能关闭计算机

function shutdownComputer(scb, fcb) {
	// 【参数】
	var platformMap;
	// 【过程】
	platformMap = {};
	platformMap['win32'] = 'shutdown -s';
	platformMap['linux'] = 'shutdown -h now';
	platformMap['darwin'] = 'shutdown -h now';
	platformMap['freebsd'] = '';
	platformMap['sunos'] = '';

	
	child_process.exec(platformMap[process.platform], function(err, stdout, stderr){
		if(err) {
			fcb();
			return;
		}
		scb();
		return;
	});

}