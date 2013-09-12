(function() {
	var refreshing = false,
		currentTagValue = undefined;

	setInterval(function() {
		refresh();
	}, 1000);

	function refresh() {
		// 防止重入
		if (refreshing) return;
		refreshing = true;

		rpc('Tag.get',{
			pathname: window.location.pathname,
			value: currentTagValue
		}, success, failure);

		function success(result) {
			if (!result || typeof result.value !== 'string') return;

			// currentTagValue 为 undefined 说明还没初始化
			// 那么先记录下来
			if (currentTagValue === void 0) {
				currentTagValue = result.value;

				// 别忘了结束刷新状态
				refreshing = false;
				return;
			}

			// 比对，如果不想等则刷新
			if (result.value != currentTagValue) {
				window.location.reload(true);
			} else {
				refreshing = false;
			}
		}

		function failure() {
			refreshing = false;
		}
	}
})();