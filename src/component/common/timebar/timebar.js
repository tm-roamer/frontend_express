'use strict';
/**
 * 【功能说明】：timebar时间条公共组件
 * 【内容说明】：开始时间/结束时间/检索按钮/   半年/一年选中
 *             时间弹窗选择年份/月份
 */
define(function(require, exports, module) {

	var time = {
		type: '',
		startYear: 0,
		startMonth: 0,
		endYear: 0,
		endMonth: 0
	};
	
	// 移除监听
	function unbindEvent() {
	    // 半年,一年 时间按钮
	    $(".app-time-selected").off('click', timeClick);
	    // 时间窗内选择年
	    $(".app-panel-head").off('click', ".time-year-link", timeYearClick);
	    // 时间窗内选择月
	    $(".app-panel-head").off('click', ".time-month-link", timeMonthClick);
	    // 时间窗移除
	    $('.app-panel-head-time').off("click", timePopoverClick);
	    $('.app-panel-head-time').popover('destroy');
	    // 检索按钮
	    $(".app-panel-head-search").off('click', searchClick);
	}

	// 绑定监听
	function bindEvent() {
	    // 半年,一年 时间按钮
	    $(".app-time-selected").on('click', timeClick);
	    // 时间窗内选择年
	    $(".app-panel-head").on('click', ".time-year-link", timeYearClick);
	    // 时间窗内选择月
	    $(".app-panel-head").on('click', ".time-month-link", timeMonthClick);
	    // 时间窗弹出
	    $('.app-panel-head-time').on("click", timePopoverClick);
	    $('.app-panel-head-time').popover({
	    	html: true,
	    	content: function() {
	    		// 根据显示时间, 初始化时间窗, 默认最大时间间隔为3年
	    		var year = time[time.type+'Year'],
	    			month = time[time.type+'Month'];
				return template('app-time-panel', {
					min:time.endYear-3,
					max:time.endYear,
					current:year,
					month:month,
					maxMonth: year === getDate('year') ? getDate('month') : 11,
					list:new Array(12)});
			}
		});
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

        if(!isActive) {
        	all.removeClass("active");
        	self.addClass("active");
        	// 更新显示时间
        	initDisplayTime(parseInt(type));
        	// 关闭时间窗
        	showTimePopover('start');
        	showTimePopover('end');
        	// 重新加载
        	load();
        }
	}

	// 时间窗选择年
	function timeYearClick(e, active) {
		var that = e.currentTarget,
        self = $(that),                               // 当前按钮
        type = self.attr('data-type'),                // 标识, 左右切换年
        timeType = self.parents(".popover").prev("a.app-panel-head-time").attr("type"),	//判断是开始时间还是结束时间窗
        monthList = self.parents(".popover").find('.time-month-ul'),					//月份列表
        current = parseInt(self.parents('.time-year').find(".current-year").text()),	//当前时间
        min = self.attr('data-min'),				  // 最小时间
        max = self.attr("data-max");				  // 最大时间

        current = type === 'left' ? current - 1 : current + 1;
        // 隐藏左右切换年按钮
        if (current <= min) {
			$(".time-year-link.left").hide();
        } else if (current >= max) {
        	$(".time-year-link.right").hide();	
        } else {
        	$(".time-year-link").show();
        }
        self.parents('.time-year').find(".current-year").text(current+'年');	
        // 判断当前年, 大于当前月份, 刷新月份, 置灰
        if (current == max) {
        	var month = time[timeType+'Month'] > getDate('month') ? getDate('month') : time[timeType+'Month'];
        	monthList.html(template('time-month-li',{month: month, 
        		maxMonth: getDate('month'), list: new Array(12)}))
        } else {
        	//monthList.find('.time-month-link').removeClass('disable active');
        	monthList.html(template('time-month-li',{month: time[timeType+'Month'], maxMonth: 11, list: new Array(12)}))
        }
        // 更新显示时间,并更新数据,比较开始时间和结束时间
        updateDisplayTime(timeType, {year:current});
	}

	// 时间窗选择月
	function timeMonthClick(e, active) {
		var that = e.currentTarget,
        self = $(that),                               // 当前按钮
        all = $(".time-month-link"),				  // 所有按钮
        disable = self.hasClass('disable'),			  // 是不是禁用状态
        type = self.parents(".popover").prev("a.app-panel-head-time").attr("type"),	//判断是开始时间还是结束时间窗
        month = parseInt(self.text());				  // 当前月
        // 过滤disable, 点击无效
        if (disable) return;
        all.removeClass('active')
        self.addClass('active');
        // 更新显示时间,并更新数据,比较开始时间和结束时间
        updateDisplayTime(type, {month:month});
	}

	// 点击时间, 弹出时间窗
	function timePopoverClick(e, active) {
		var that = e.currentTarget,
        	self = $(that),                               // 当前按钮
        	type = self.attr("type");					  // 判断是开始时间还是结束时间窗
        // 是否显示时间窗, 互斥, 弹出开始时间, 关闭结束时间
        showTimePopover(type);
        // 记录点击的是开始时间还是结束时间
        time.type = type;
	}

	// 检索按钮
	function searchClick(e, active) {
		var that = e.currentTarget;
		// 关闭时间窗
        showTimePopover('start');
        showTimePopover('end');
		// 判断时间大小,触发告警
		var date = new Date();
		date.setFullYear(time.endYear);
		date.setMonth(time.endMonth);
		var end = date.getTime();
		date.setFullYear(time.startYear);
		date.setMonth(time.startMonth);
		var start = date.getTime();
		if (start > end ) {
			app.showWarning('开始时间不能大于结束时间'); 
		} else {
			console.log('开始检索');
		}
	}

	// 获取时间
	function getDate(type) {
		var date = new Date();
		return type == 'year' ? date.getFullYear() : date.getMonth();
	}

	// 是否显示时间窗, 互斥, 弹出开始时间, 关闭结束时间
	function showTimePopover(type) {
		var start = $(".app-panel-head-time[type='start']"),  // 显示开始时间
        	end = $(".app-panel-head-time[type='end']");  	  // 显示结束时间

        if (type == 'start') {
        	end.next(".popover").length !== 0  ? end.click() : '';
        } else {
        	start.next(".popover").length !== 0  ? start.click() : '';
        }
	}

	// 初始化开始时间和结束时间显示标签
	function initDisplayTime(space) {
		// 初始化
		var end = new Date(),
			endYear = end.getFullYear(),
			endMonth = end.getMonth()+1;
		end.setMonth(end.getMonth()-space);
		var start = end,
			startYear = start.getFullYear(),
			startMonth = start.getMonth()+1;
		$(".app-panel-head-time[type='start']").find('.year').text(startYear)
		$(".app-panel-head-time[type='start']").find('.month').text(startMonth);
		$(".app-panel-head-time[type='end']").find('.year').text(endYear);
		$(".app-panel-head-time[type='end']").find('.month').text(endMonth);
		time.startYear = startYear;
		time.startMonth = startMonth-1;
		time.endYear = endYear;
		time.endMonth = endMonth-1;
	}

	// 更新开始时间和结束时间显示标签
	function updateDisplayTime(type, date) {
		var displayTime = $(".app-panel-head-time[type='"+type+"']"),
			year = displayTime.find('.year'),
			month = displayTime.find('.month');
		if (date.year) {
			year.text(date.year);
			time[type+'Year'] = date.year;
		}
		if (date.month) {
			month.text(date.month);
			time[type+'Month'] = date.month-1;
		}
	}

	// 模块载入的初始化方法
	function init(callback) {
		// 加载插件模板
		app.getTpl(app.baseUrl+'/component/common/timebar/timebar.html', function(html) {
			$("body").append(html);
			// 先插入模板
			callback();
			// 初始化监听
			unbindEvent();
	  		bindEvent();
	  		// 初始化时间, 默认半年
	  		initDisplayTime(6);
		});
	}

	// 加载刷新模块
	function load() {
		console.log("重新查询, 别忘了还有loading");
	}

	// 获取时间(开始和结束)
	function getTime() {
		return [];
	}

	exports.init = init; 		// 初始化
	exports.load = load;		// 加载刷新
	exports.getTime = getTime;	// 获取时间
  
});