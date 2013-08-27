$(function() {
	var requesting = false;
	var currentTag = '';

	$(document).ajaxError(onAjaxError);

	// 不断的请求，但是请求的最短间隔有限制
	request(onRequestSuccess);
	setInterval(function() {
		request(onRequestSuccess);
	}, 500);

	// # scb(tag)
	function request(scb) {
		// 防止重叠请求
		if (requesting) return;
		requesting = true;

		var url =  '/tag?action=get&pathname=' + 
					encodeURIComponent(window.location.pathname) + 
					'&value=' + 
					encodeURIComponent(currentTag);

		$.get(url, onGetSuccess);

		function onGetSuccess(tag, textStatus, jqXHR) {
			requesting = false;
			scb(tag);
		}
	}

	function onRequestSuccess(tag) {
		if (currentTag === '') {
			currentTag = tag;
		} else if (currentTag !== tag) {
			window.location.reload(true);
		}
	}

	function onAjaxError() {
		requesting = false;
		//alert('request failed');
	}
});