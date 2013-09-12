// # scb(resObj)
// # fcb()
function request(reqObj, scb, fcb) {
	var url = '/service';
	var data = JSON.stringify(reqObj);
	var settings = {
		type: 'POST',
		data: data,
		contentType: 'application/json;charset=UTF-8',
		success: onSuccess,
		error: onError
	};
	$.ajax(url, settings);

	function onSuccess(data, textStatus, jqXHR) {
		if (typeof scb === 'function') {
			try {
				scb(data);
			} catch(err) {
				console.log(err);
			}
		}
	}

	function onError(jqXHR, textStatus, errorThrown) {
		if (typeof fcb === 'function') {
			try {
				fcb({error: 'send request failed'});
			} catch(err) {
				console.log(err);
			}
		}
	}
}

function rpc(funcName, args, scb, fcb) {
	var reqObj = {
		funcName: funcName,
		args: args
	};

	request(reqObj, scb_proxy, fcb);

	function scb_proxy(result) {
		if (result.error) {
			if (typeof fcb === 'function') {
				try {
					fcb(result);
				} catch(err) {
					console.log(err);
				}
			}
		} else {
			if (typeof scb === 'function') {
				try {
					scb(result);
				} catch(err) {
					console.log(err);
				}
			}
		}
	}
}