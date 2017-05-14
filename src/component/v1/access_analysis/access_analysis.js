'use strict';
/**
 * 【功能说明】：access_analysis.html页的模块文件
 */
define(function(require, exports, module) {

	var datepicker = require('datepicker');				// 时间控件
	var visitline = require('visitline');				// 折线图

	// 初始化高度
	function initWidthHeight() {
		var container = $("#app-panel-content-access"),		// 外层容器
			top = $("#access-top10"),						// 访问top10
			week = $("#access-line-week"),					// 星期线柱图
			month = $("#access-line-month"),				// 月份线柱图
			width = container.width(),						// 容器宽度
			height = container.height(),					// 容器高度
			topWidth = top.width(),							
			topHeight = top.height(),
			calculate = {
				weekHeight: height- topHeight,
				monthHeight: height- topHeight
			};
		week.height(calculate.weekHeight);
		month.height(calculate.monthHeight);
	}

	// 移除监听
	function unbindEvent() {
	}

	// 绑定监听
	function bindEvent() {
	}

	// 加载topn列表
	function loadTopNList() {
		// 加载top10列表数据
		app.get(app.baseUrl+'/backinterface/v1/visit/top.json', function(data) {
			// 线性比例尺
			var range = d3.scale.linear()
						  		.domain([10,100])
						  		.range(d3.extent(data.list, function(d){ return d.num}));
			// 转换比例, num转换成width
			var list = data.list;
			for(var i =0; i<list.length; i++) {
				var d  = list[i];
				d.w = range.invert(d.num);
				d.num = app.num2str(d.num,2);
			}
			// 构建列表
			initTopNList(data);
			// 制作动画
			d3.select("#access-top10").selectAll(".topn-scale-in")
			  	.transition()
			  	.delay(function(d, i) { return 100*i })
		      	.duration(function(d, i) { return 200 })
			  	.attr("style", function(d, i) {
			  		return "width:"+data.list[i].w +"px";
			  	})
		})
	}

	// 构建topn列表
	function initTopNList(data) {
		var html = template('app-panel-content-access-topn', data);
		$("#access-top10").html(html);
	}

	// 模块载入的初始化方法
	function init() {
		// 加载时间条
		datepicker.init(function() {
			$("#app-component-access-analysis").prepend(template('app-panel-head',{
				title:"互联网访问态势 (k 表示千次,  m 表示百万次, g 表示10亿次)"}));	
		});
		// 初始化各个模块的宽度和高度
		initWidthHeight();
		// 初始化监听
		unbindEvent();
  		bindEvent();
		// 加载topn列表
		loadTopNList();
		// 加载折线图(小时图)
		app.get(app.baseUrl+'/backinterface/v1/access_analysis/linebar_hour.json', function(data) {
			visitline.init("#access-line-hour", data);
		});
		// 加载折线图(星期图)
		app.get(app.baseUrl+'/backinterface/v1/access_analysis/linebar_week.json', function(data) {
			visitline.init("#access-line-week", data);
		});
		// 加载折线图(月份图)
		app.get(app.baseUrl+'/backinterface/v1/access_analysis/linebar_month.json', function(data) {
			visitline.init("#access-line-month", data);
		})
	}

	// 加载刷新模块
	function load() {
		// 初始化监听
		unbindEvent();
  		bindEvent();
		// 加载topn列表
		loadTopNList();
		// 加载折线图(小时图)
		app.get(app.baseUrl+'/backinterface/v1/access_analysis/linebar_hour.json', function(data) {
			visitline.load("#access-line-hour", data);
		});
		// 加载折线图(星期图)
		app.get(app.baseUrl+'/backinterface/v1/access_analysis/linebar_week.json', function(data) {
			visitline.load("#access-line-week", data);
		});
		// 加载折线图(月份图)
		app.get(app.baseUrl+'/backinterface/v1/access_analysis/linebar_month.json', function(data) {
			visitline.load("#access-line-month", data);
		})
	}

	// 卸载页面,
	function unload() {
	}

	exports.init = init; 	// 初始化
	exports.load = load;	// 加载刷新
	exports.unload = unload;	// 卸载页面, 离开页面触发
  
});