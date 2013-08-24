var child_process = require('child_process');

exports.rebootComputer = rebootComputer;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function rebootComputer() {
	// 【参数】
	var platformMap;
	// 【过程】
	platformMap = {};
	platformMap['win32'] = 'shutdown -r';
	platformMap['linux'] = 'shutdown -r now';
	platformMap['darwin'] = 'shutdown -r now';
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