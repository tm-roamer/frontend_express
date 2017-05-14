'use strict';
/**
 * 【功能说明】：timebar时间条公共组件
 * 【内容说明】：开始时间/结束时间/检索按钮/   半年/一年选中
 *             时间弹窗选择年/月/日
 *  [帮助说明]: 日历控件中文api http://www.bootcss.com/p/bootstrap-datetimepicker/
 */
define(function(require, exports, module) {
	
	// 移除监听
	function unbindEvent() {
	    // 半年,一年 时间按钮
	    $(".app-time-selected").off('click', timeClick);
	    // 检索按钮
	    $(".app-panel-head-search").off('click', searchClick);
	}

	// 绑定监听
	function bindEvent() {
	    // 半年,一年 时间按钮
	    $(".app-time-selected").on('click', timeClick);	    
		// 检索按钮
	    $(".app-panel-head-search").on('click', searchClick);
	}

	// 半年,一年
	function timeClick(e, active) {
		var that = e.currentTarget,
        self = $(that),                               // 当前按钮
        type = self.attr('data-type'),                // 标识
        isActive  = self.hasClass('active'),		  // 是否选中
        all  = $(".app-time-selected");				  // 所有按钮

    	all.removeClass("active");
    	self.addClass("active");
    	// 更新显示时间
    	updateDisplayTime(parseInt(type));
    	// 更新时间窗
    	$('.app-starttime').datetimepicker('update');
    	$('.app-endtime').datetimepicker('update');
    	// 重新加载
    	app.pageload();
	}

	// 检索按钮
	function searchClick(e, active) {
		var that = e.currentTarget;
		// 判断时间大小,触发告警
		var date = app.getDate();
		var start = date[0];
		var end = date[1];
		if (start > end ) {
			app.showWarning('开始时间不能大于结束时间'); 
		} else {
			// alert('开始检索');
			app.pageload();
		}
	}

	// 初始化开始时间和结束时间显示标签
	function updateDisplayTime(space) {
		// 初始化
		if (space) {	// 赋值
			var end = new Date();
			var start = new Date();
			start.setMonth(start.getMonth()-space);
			app.setDate(start, end);
		} else {		// 取全局,进行赋值
			var start = app.getDate()[0];
			var end = app.getDate()[1];
		}
		$(".app-starttime").val(start.getFullYear()+"-"+(start.getMonth()+1<10?'0':'')+(start.getMonth()+1)+"-"+start.getDate());
		$(".app-endtime").val(end.getFullYear()+"-"+(end.getMonth()+1<10?'0':'')+(end.getMonth()+1)+"-"+end.getDate());
	}

	// 模块载入的初始化方法
	function init(callback) {
		// 加载插件模板
		app.getTpl(app.baseUrl+'/component/common/datepicker/datepicker.html', function(html) {
			$("body").append(html);
			// 先插入模板
			callback();
			// 初始化监听
			unbindEvent();
	  		bindEvent();
	  		// 默认时间间隔半年
	  		updateDisplayTime()
	  		// 初始化日历控件 
	  		require.async('datetimepicker', function(mod) {
	  			// 设置语言环境
	  			$.fn.datetimepicker.dates['zh'] = {
				    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
				    daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
				    daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
				    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				    monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				    meridiem:    ['上午', '下午'],
			      	suffix:      ['st', 'nd', 'rd', 'th'],
			      	today:       '今天',
			      	clear:       '清除'
				};
				// 日历控件至多显示前三年
				var endDate = new Date();
				var startDate = new Date();
				startDate.setFullYear(startDate.getFullYear()-3);
				// 开始时间
				$('.app-starttime').datetimepicker({
					language:  'zh',
					format: 'yyyy-mm-dd',
					startDate: startDate,	// 可以选择的最早日期；所有早的日期将被禁用
					endDate: endDate,		// 可以选择的最晚日期；所有晚的日期将被禁用
			        todayBtn:  "linked",	// 底部显示一个 "今天" 按钮用以选择当前日期, "linked"，当天日期将会被选中
					autoclose: true,		// 当选择一个日期之后是否立即关闭此日期时间选择器
					todayHighlight: true,	// 如果为true, 高亮当前日期。
					startView: 2,			// 日期时间选择器打开之后首先显示的视图。
					minView: 2,				// 日期时间选择器所能够提供的最精确的时间选择视图。
					//forceParse: true		// 当选择器关闭的时候，是否强制解析输入框中的值。
				});
				// 结束时间
				$('.app-endtime').datetimepicker({
					language:  'zh',
					format: 'yyyy-mm-dd',
					startDate: startDate,
					endDate: endDate,
			        todayBtn:  "linked",
					autoclose: true,
					todayHighlight: true,
					startView: 2,
					minView: 2,
					//forceParse: true
				});
				// 监听时间变化
				$('.app-starttime, .app-endtime').datetimepicker().on('changeDate', function(ev) {
					// 取消 半年/一年 选中 
				   	$(".app-time-selected").removeClass('active');
				   	// 更新时间
				   	updateDate();
				});
				// 补充左右切换图标(原因,舍弃了bootstrap的字体图标,节省流量, 但这个插件使用字体图标,所以需要手动添加)
				var svgLeft = '<svg><use xlink:href="#left"></use></svg>';
				var svgRight = '<svg><use xlink:href="#right"></use></svg>';
				$(".datetimepicker").find('.glyphicon-arrow-left').html(svgLeft);
				$(".datetimepicker").find('.glyphicon-arrow-right').html(svgRight);
			});
		});
	}

	// 更新时间
	function updateDate() {
	    if ($('.app-starttime').length > 0) {
	      var starttime = $('.app-starttime').datetimepicker('getDate')
	      var endtime = $('.app-endtime').datetimepicker('getDate');  
	      app.setDate(starttime, endtime);
	    }
	}

	exports.init = init; 		// 初始化

});