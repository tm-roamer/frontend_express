'use strict';
/**
 *  [功能说明]：access_analysis.html页的折线图
 *  [内容说明]：折线柱状图
 *  [帮助说明]  D3的api,请查询: https://github.com/d3/d3/wiki/API--%E4%B8%AD%E6%96%87%E6%89%8B%E5%86%8C
 */
define(function(require, exports, module) {

	// 移除监听
	function unbindEvent(selector) {
		$(selector).off('click', '.mark_click', markClick);
	}

	// 绑定监听
	function bindEvent(selector) {
		$(selector).on('click', '.mark_click', markClick);
	}

	// 点击标识块, 交替隐藏/显示
	function markClick(e) {
		// 点击是min还是max
		var type = null,
			ison = null;	// 1为选中, 0为未选中
		var circle = d3.select(e.currentTarget)
					  .select("circle")
					  .each(function(d, i) {
					  	type = d.type;
					  	d.ison = !d.ison+0;	// 点击后要切换状态
					  	ison = d.ison;
					  })
					  .attr("data-ison", function(d){ return d.ison})	//存储状态
					  .attr("stroke-width",1)
					  .attr("stroke", function(d, i) {
					  	return d.ison ? '#fff' : d.color
					  })
					  .attr("fill", function(d, i) {
					  	return d.ison ? 'none' : d.color
					  })
		// 制作动画
		handleMarkAnimate(e.delegateTarget, type, ison);
	}

	// 制作线图和柱图的动画
	function handleMarkAnimate(selector, type, ison) {
		// 反转
		var invert = type == "max" ? "min" : "max";
		// 标识块的状态 1选中状态; 0未选中状态
		var mark = { min: null, max: null };
		var container = d3.select(selector);
		container.selectAll(".mark")
			.selectAll("circle")
			.each(function(d, i) {
				mark[d.type] = d.ison;
			});
		// 设置线图的动画
		container.select("." + type + "line")
			.transition()
	      	.duration(300)
			.attr('stroke-opacity', !ison+0);  // 1为选中, 但是透明度要0, 0为未选中,透明度要1

		// 设置柱图的动画
		// 4种情况, 第一种都选中, 第二种max选中, 第三种min选中, 第四种都未选中
		if (mark.min && mark.max) {
			container.selectAll("." + type + "bar")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", 0);
			container.selectAll("." + invert + "bar")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", 0);
		} else if ( mark.max ) {
			container.selectAll(".maxbar")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", 0);
			container.selectAll(".minbar")
				.attr("width", "10px")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", "20px");	
		} else if ( mark.min ) {
			// 正常单个选中情况
			container.selectAll(".minbar")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", 0);
			container.selectAll(".maxbar")
				.attr("width", "10px")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", "20px");	
		} else {
			container.selectAll("." + type + "bar")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", "10px");
			container.selectAll("." + invert + "bar")
				// .attr("width", "10px")
				.transition()
				.duration(function(d, i) {
		      		return 200 +  100*i
		      	})
				.attr("width", "10px");		
		}
	}

	// 初始化图表
	function initChart(selector, data) {

		var content = $(selector),									// 读题容器选择器
			width  = content.width(),								// 地图容器宽
			height = content.height(),								// 地图容器高
			svg = null;												// 地图对象
			
		svg = d3.select(selector)
				.append("svg")
				.attr("width", width)
				.attr("height", height);

		//外边框
		var padding = { top: 50 , right: 30, bottom: 35, left: 60 };

		//计算攻击量的最大值	
		var attackMax = 0;
		for(var i = 0; i < data.length; i++) {
			var currMax = d3.max( data[i].list , function(d) { return d[2]; } );
			if( currMax > attackMax )
				attackMax = currMax;
		}

		// x轴的比例尺
		var xScale = d3.time.scale()
							.domain([new Date(2000,0,1),new Date(2014,0,1)])
							.range([ 0 , width - padding.left - padding.right ]);
		// xScale.ticks(d3.time.minutes, 15) // 时间间隔
							
		// y轴的比例尺(针对线图)
		var yScale = d3.scale.linear()
							.domain([0, attackMax * 1.1])
							.range([ height - padding.top - padding.bottom , 0 ]);

		// y轴的比例尺(针对柱图)
		var yBarScale = d3.scale.linear()
							.domain([0, attackMax * 1.1])
							.range([ 0, height - padding.top - padding.bottom ]);

		

		//定义颜色				
		var colors = ["#f15127", "#f1c15c", "#4ac97a", "#4fafc8","#199de6"];
			
				

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
						.tickFormat(function(d, i){
							return app.num2str(d)
						})
						.orient("left");

		// 绘制颜色块标识
		drawMark(svg, data, width, height, padding);
		// 绘制线图
		drawLineChart(svg, data, width, height, xScale, yScale, padding);
		// 绘制柱图
		drawBarChart(svg, data, width, height, xScale, yBarScale, padding);
		// 绘制坐标轴
		drawAxis(svg, xAxis, yAxis, padding, height);
	}

	// 绘制颜色块标识
	function drawMark(svg, data, width, height, padding) {
		// 标识块的间距
		var markStep = 65;
		var spacing = 5;
		var data = [
			{name:"最大量", color:"#1a9ee5", type: 'max', ison: 0},
			{name:"最小量", color:"#48cb78", type: 'min', ison: 0},
		];
			
		var mark = svg.selectAll(".mark")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "mark mark_click")
			.attr("style", "cursor: pointer;")
			.attr("transform",function(d,i) {
				return "translate(" + (width - padding.left - spacing - i * markStep)  + ", "+spacing+")";
			});
			
		mark.append("circle")
			.attr('data-type', function(d,i){ return d.type })
			.attr('data-ison', function(d,i){ return d.ison })
			.attr("cx", "10px")
			.attr("cy", "10px")
			.attr("r", "5px")
			.attr("fill", function(d,i){ return d.color });

		mark.append("text")
			.attr('data-type', function(d,i){ return d.type })
			.attr('data-ison', function(d,i){ return d.ison })
			.attr("dx", "20px")
			.attr("dy", "15px")
			.attr("fill", "#fff")
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px")
			.text(function(d){ return d.name; });
	}

	// 绘制线图
	function drawLineChart(svg, data, width ,height, xScale, yScale, padding) {
		// 线要比柱子高一点才好看, 调试优化
		var lineCoding = 30;
		// 创建一个直线生成器
		var linePathMin = d3.svg.line()
						.x(function(d) { return xScale(d[0]) })
						.y(function(d) { return yScale(d[1]) - lineCoding; })
						.interpolate("basis");

		// 创建一个直线生成器
		var linePathMax = d3.svg.line()
						.x(function(d) { return xScale(d[0]) })
						.y(function(d) { return yScale(d[2]) - lineCoding; })
						.interpolate("basis");

		// 添加路径
		var lines = svg.selectAll("path").data(data).enter();
		// 最小量
		lines.append("path")
			.attr("d", function(d) {
				return linePathMin(d.list);		//返回线段生成器得到的路径
			})
			.attr("class", "minline")
			.attr("fill","none")
			.attr("stroke-width",1)
			.attr("stroke", "#48cb78")
			.attr("stroke-opacity",0)
			.attr("transform","translate(" + 0 + "," +  height/2  +")")
			.transition()
			.delay(1000)
	      	.duration(300)
	      	.ease(Math.sqrt)
	      	.attr("stroke-opacity",1)
	      	.attr("transform","translate(" + padding.left + "," +  padding.top  +")")
		// 最大量
		lines.append("path")
			.attr("d", function(d) {
				return linePathMax(d.list);		//返回线段生成器得到的路径
			})
			.attr("class", "maxline")
			.attr("fill","none")
			.attr("stroke-width",1)
			.attr("stroke", "#1a9ee5")
			.attr("stroke-opacity",0)
			.attr("transform","translate(" + 0 + "," +  height/2  +")")
			.transition()
			.delay(1200)
			.ease(Math.sqrt)
	      	.duration(300)
	      	// .ease("bounce")
	      	.attr("stroke-opacity",1)
	      	.attr("transform","translate(" + padding.left + "," +  padding.top  +")")
	}

	// 绘制柱图
	function drawBarChart(svg, data, width, height, xScale, yScale, padding) {

		var bars = svg.selectAll("rect").data(data[0].list).enter();
		// 最小量
		bars.append("rect")
			.attr("class", "minbar")
			.attr("fill","#48cb78")
			.attr("width",'10px')
			.attr("x", function(d,i) {
				return padding.left + xScale(d[0])-10;
			})
			.attr("y", function(d,i) {
				return height - padding.bottom;
			})
			.attr("height", 0)
			.transition()
	      	.duration(function(d, i) {
	      		return 200 +  100*i
	      	})
	      	// .ease("bounce")
			.attr("height",function(d) {
				return yScale(d[1]);
			})
			.attr("y", function(d,i) {
				return height - padding.bottom - yScale(d[1]);
			})
		// 最大量
		bars.append("rect")
			.attr("class", "maxbar")
			.attr("fill","#1a9ee5")
			.attr("width",'10px')
			.attr("x", function(d,i) {
				return padding.left + xScale(d[0]);
			})
			.attr("y", function(d,i) {
				return height - padding.bottom;
			})
			.attr("height", 0)
			.transition()
	      	.duration(function(d, i) {
	      		return 300 +  100*i
	      	})
	      	// .ease("bounce")
			.attr("height",function(d) {
				return yScale(d[2]);
			})
			.attr("y", function(d,i) {
				return height - padding.bottom - yScale(d[2]);
			})
	}

	// 绘制坐标轴
	function drawAxis(svg, xAxis, yAxis, padding, height) {
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
	function init(selector, data) {
  		// 初始化图表
		initChart(selector, data);
		// 初始化监听
		unbindEvent(selector);
  		bindEvent(selector);
	}

	// 加载刷新模块
	function load(selector, data) {
		//  清空
		d3.select(selector).select("svg").remove();
		// 初始化图表
		initChart(selector, data);
		// 初始化监听
		unbindEvent(selector);
  		bindEvent(selector);
	}

	exports.init = init; 	// 初始化
	exports.load = load;	// 加载刷新

});