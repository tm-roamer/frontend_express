'use strict';
/**
 *  [功能说明]：attack.html页的折线图
 *  [内容说明]：top5的折线图
 *  [帮助说明]  D3的api,请查询: https://github.com/d3/d3/wiki/API--%E4%B8%AD%E6%96%87%E6%89%8B%E5%86%8C
 */
define(function(require, exports, module) {

	var selector = "#content-block-work-line",					// 地图容器dom
		content = $(selector),									// 读题容器选择器
		width  = content.width(),								// 地图容器宽
		height = content.height(),								// 地图容器高
		svg = null;												// 地图对象

	// 移除监听
	function unbindEvent() {
	}

	// 绑定监听
	function bindEvent() {
	}

	// 初始化图表
	function initChart(data) {
			
		svg = d3.select(selector)
				.append("svg")
				.attr("width", width)
				.attr("height", height);

		//外边框
		var padding = { top: 5 , right: 20, bottom: 25, left: 50 };

		//计算攻击量的最大值	
		var attackMax = 0;
		for(var i = 0; i < data.length; i++) {
			var currMax = d3.max( data[i].list , function(d) { return d[1]; } );
			if( currMax > attackMax )
				attackMax = currMax;
		}

		// x轴的比例尺
		// var xScale = d3.scale.linear()
		// 					.domain([2000,2013])
		// 					.range([ 0 , width - padding.left - padding.right ]);
		var xScale = d3.time.scale()
							.domain([new Date(2000,0,1), new Date(2014,0,1)])
							.range([ 0 , width - padding.left - padding.right ]);
		// xScale.ticks(d3.time.minutes, 15) // 时间间隔
							
		// y轴的比例尺
		var yScale = d3.scale.linear()
							.domain([0, attackMax * 1.1])
							.range([ height - padding.top - padding.bottom , 0 ]);

		//创建一个直线生成器
		var linePath = d3.svg.line()
						.x(function(d){ return xScale(d[0]); })
						.y(function(d){ return yScale(d[1]); })
						.interpolate("basis");

		//定义颜色				
		var colors = ["#f15127", "#f1c15c", "#4ac97a", "#4fafc8", "#199de6"];
						
		//添加路径
		svg.selectAll("path")
			.data(data)
			.enter()
			.append("path")
			.attr("d", function(d) {
				return linePath(d.list);		//返回线段生成器得到的路径
			})
			.attr("fill","none")
			.attr("stroke-width",1)
			.attr("stroke",function(d,i) {
				return colors[i];
			})
			.attr("stroke-opacity", 0)
			.attr("transform","translate(" + padding.left + "," +  height  +")")
			.transition()
			.delay(function(d,i){return 300 + 100*i})
	      	.duration(function(d,i){return 300 + 100*i})
	      	.ease(Math.sqrt)
	      	.attr("stroke-opacity", 1)
	      	.attr("transform","translate(" + padding.left + "," +  padding.top  +")");

		//x轴
		var xAxis = d3.svg.axis()
						.scale(xScale)
						.ticks(5)
						// .tickFormat(d3.format("d"))
						.orient("bottom");
			
		//y轴
		var yAxis = d3.svg.axis()
						.scale(yScale)
						.ticks(5)
						.orient("left");
						
		svg.append("g")
				.attr("class","axis")
				.attr("fill","none")
				.attr("stroke","#fff")
				.attr("stroke-opacity",0.8)
				.attr('font-size', "10px")
				.attr('font-family', "sans-serif")
				.attr("shape-rendering","crispEdges")
				.attr("transform","translate(" + padding.left + "," + (height - padding.bottom) +  ")")
				.call(xAxis);
					
		svg.append("g")
				.attr("class","axis")
				.attr("fill","none")
				.attr("stroke-opacity",0.8)
				.attr("stroke","#fff")
				.attr('font-size', "10px")
				.attr('font-family', "sans-serif")
				.attr("shape-rendering","crispEdges")
				.attr("transform","translate(" + padding.left + "," + padding.top +  ")")
				.call(yAxis); 

	}

	// 模块载入的初始化方法
	function init(data) {
		initChart(data);
	}

	// 加载刷新模块
	function load(data) {
		//  清空
		d3.select(selector).select("svg").remove();
		// 初始化图表
		initChart(data);
		// 初始化监听
		unbindEvent();
  		bindEvent();
	}

	exports.init = init; 	// 初始化
	exports.load = load;	// 加载刷新

});