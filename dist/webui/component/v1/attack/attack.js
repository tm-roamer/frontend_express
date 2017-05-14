'use strict';
/**
 *  [功能说明]：attack.html页的模块文件
 *  [内容说明]：依靠世界地图的chart图攻击分布
 *             包含查询功能和排序说明面板
 *  [帮助说明]  D3的api,请查询: https://github.com/d3/d3/wiki/API--%E4%B8%AD%E6%96%87%E6%89%8B%E5%86%8C
 */
define(function(require, exports, module) {

	var datepicker = require('datepicker');		// 时间控件
	var attackline = require('attackline');		// 折线图

	var jsonUrl = app.baseUrl + '/geojson/world-50m.json',		// 地图底图地址
		selector = "#app-panel-content-world-map",				// 地图容器dom
		content = $(selector),									// 读题容器选择器
		width  = content.width(),								// 地图容器宽
		height = content.height(),								// 地图容器高
		cacheCentroid = {},										// 缓存地图圆点坐标
		svg = null,												// 地图对象
		projection = null,										// 地图投影
		features = null, 										// 国家的路径
		graticules = null,										// 经纬度
		pointers = null,										// 圆点的路径
		pointersAnimate = null,									// 圆点动画的路径
		pointerList = [],										// 圆点的数据
		intervalId = null;										// 地图冒泡动画的定时器id

	// 线性比例尺, 绘制圆点尺寸
	var linear = d3.scale.linear().domain([9,1]).range([7,16]);	

	// 移除监听
	function unbindEvent() {
		$("#app-panel-content-world-map").off('click', ".content-block-title", panelDrawerClick);
		$("#app-panel-content-world-map").off('click', ".handle-drawer", tableDrawerClick);
	}

	// 绑定监听
	function bindEvent() {
		// 攻击源列表和攻击目的列表和近期攻击趋势的展示收起
		$("#app-panel-content-world-map").on('click', ".content-block-title", panelDrawerClick);
		// 攻击列表的展示收起
		$("#app-panel-content-world-map").on('click', ".handle-drawer", tableDrawerClick);
	}

	// 攻击源列表和攻击目的列表和近期攻击趋势的展示收起
	function panelDrawerClick(e, active) {
		var that = e.currentTarget,
        	self = $(that),                               // 当前按钮
        	type = self.attr('data-type'),                // 标识
        	svg = self.find("svg"),						  // 图标
        	content = self.next(".content-block-work")	  // 展开收起的面板
        if (type === "open") {
        	content.slideUp("fast")
        	svg.addClass("down-transform")
        	self.attr('data-type', "close");
        } else {
        	content.slideDown("fast");
        	svg.removeClass("down-transform")
        	self.attr('data-type', "open");
        }
	}

	// 攻击列表的展示收起
	function tableDrawerClick(e, active) {
		var that = e.currentTarget,
        	self = $(that),                               // 当前按钮
        	type = self.attr('data-type'),                // 标识
        	svg = self.find("svg"),						  // 图标
        	content = self.next(".table-outside")	  		  // 展开收起table
        if (type === "open") {
        	content.slideUp("fast")
        	svg.addClass("down-transform")
        	self.attr('data-type', "close");
        } else {
        	content.slideDown("fast");
        	svg.removeClass("down-transform")
        	self.attr('data-type', "open");
        }
	}

	// 初始化地图
	function initMap(data) {

		// 地图投影
		projection = d3.geo.equirectangular()
							    .scale(150)
							    .translate([width / 2, height / 2])
							    .precision(.1);
		// 地理路径生成器
		var path = d3.geo.path()
			  		     .projection(projection);

		// 经纬网生成器
		// var graticule = d3.geo.graticule();

		// 初始
		svg = d3.select(selector)
				.append("svg")
			    .attr("width", width)
		    	.attr("height", height)

		// 拖动和缩放
		var zoom = d3.behavior.zoom()
					    .translate([0, 0])
					    .scale(1)
					    .scaleExtent([1, 8])
					    .on("zoomstart", function(){ stopPointerAnimae() })
						.on("zoom", function() {
						  features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						  graticules.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						  pointers.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						})
						.on("zoomend", function() { runPointerAnimate() })

		// // 绘制经纬网
		// svg.append("path")
		//     .datum(graticule)
		//     .attr("class", "graticule")
		//     .attr("fill", "none")
		//     .attr("stroke", "#5b7f8f")
		//     .attr("stroke-width", ".5px")
		//     .attr("stroke-opacity", ".5")
		//     .attr("d", path);

		// 加载地图资源
		d3.json(jsonUrl, function(error, world) {
		  	if (error) throw error;

		  	// 绘制地图
		  	features = svg.insert("path", ".graticule")
		      	.datum(topojson.feature(world, world.objects.land))
		      	.attr("class", "land")
		      	.attr("fill", "#333333")
		      	.attr("fill-opacity", "0.3")
		      	.attr("d", path)

		    // 绘制国家边境线
			graticules = svg.insert("path", ".graticule")
			    .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			    .attr("class", "boundary")
			    .attr("fill", "none")
			    .attr("stroke", "#333333")
			    .attr("stroke-width", ".5px")
			    .attr("stroke-opacity", "0.35")
			    .attr("d", path);

			// 添加圆点
			pointers = addPointer(data);
	
			// 添加圆点动画, 先停止再开始
			stopPointerAnimae();
			runPointerAnimate();

	 		// 添加透明矩形, 专门捕获zoom事件
			svg.append('rect')
				.attr("class", "overlay")
				.attr("fill", "none")
				.attr("pointer-events", "all")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", width)
				.attr("height", height)
				.call(zoom);

		}); // end d3.json

		d3.select(self.frameElement).style("height", height + "px");
	}

	// 加载地图, 仅加载数据
	function loadMap(data) {
		// 清空节点和节点动画
		svg.selectAll(".pointer").remove()
		svg.selectAll(".pointer-animate").remove();
		// 添加圆点
		pointers = addPointer(data);
		// 添加圆点动画, 先停止再开始
		stopPointerAnimae();
		runPointerAnimate();
	}

	// 制作渐变
	function makeGradient(color, type, index) {
		//定义一个放射渐变
		var defs = svg.append("defs");

		var radialGradient = defs.append("radialGradient")
								 .attr("id","radialGradient"+type+"_"+index);

		var stop1 = radialGradient.append("stop")
						.attr("offset","0%")
						.style("stop-color",color)
						.style("stop-opacity", 0.1);
		var stop2 = radialGradient.append("stop")
						.attr("offset","85%")
						.style("stop-color",color)
						.style("stop-opacity", 0.6);
		var stop3 = radialGradient.append("stop")
						.attr("offset","100%")
						.style("stop-color",color)
						.style("stop-opacity", 1);

		return radialGradient;
	}

	// 添加圆点
	function addPointer(data) {
		var nodes = data.nodes;
		// 设置坐标, 经纬度转换坐标和颜色
		for (var i = 0, j=0; i < nodes.length; i++) {
			var d = nodes[i];
			var coord = projection([d.coord[0], d.coord[1]]);
			if (d.type === "source") {
				d.color =  "#199de6";  // 蓝色
				d.index = i;
			} else {
				d.color =  "#f15127";  // 红色
				d.index = j++;
			}
			d.x = coord[0];
			d.y = coord[1];
		}
		// 绘制圆点
		var pointers = svg.selectAll("circle.pointer")
			.data(nodes)
			.enter()
			.append("circle")
			.attr("class", "pointer")
			.attr("fill", function(d){ return d.color})
			.attr("cx", function(d){ return d.x})
			.attr("cy", function(d){ return d.y})
			.attr("r", 2)

		return pointers;
	}

	// 添加圆点动画
	function addPointerAnimate() {
		// 循环添加动画
		svg.selectAll("circle.pointer")
	 		.each(function(d, i) {
	 			svg.insert("circle")
					.attr("class", "pointer-animate")
					.attr("transform", d3.select(this).attr("transform"))
					.attr("cx", d.x)
					.attr("cy", d.y)
					.attr("r", 2)
					.style("fill", "url(#" + makeGradient(d.color,d.type,d.index).attr("id") + ")")
					.style("fill-opacity", 0.5)
			      	.transition()
			      	.delay(150 * d.index)
			      	.duration(2000)
			      	.ease(Math.sqrt)
			      	.style("fill-opacity", 1)
			      	.attr("r", linear(d.index))
			      	.transition()
			      	.duration(1000)
			      	// .ease(Math.sqrt)
			      	.style("fill-opacity", 0.1)
			      	.remove();
	 		})
	}

	// 运行圆点动画
	function runPointerAnimate() {
		addPointerAnimate();
		if (!intervalId) {	// 定时器不存在才会新增定时器
			intervalId = setInterval(function(){
				addPointerAnimate();
			},4000);
		}
	}

	// 停止圆点动画
	function stopPointerAnimae() {
		clearInterval(intervalId);
		intervalId = null;
		svg.selectAll("circle.pointer-animate").remove(); // 关闭动画
	}

	// 构建top5资产列表
	function initTop5Asset(data) {
		$(".app-panel-asset").remove();
		var html = template('app-panel-asset', data);
		$('#app-component-attack').append(html);
		// 添加动画
		d3.select(".app-panel-asset")
		  	.selectAll("div.asset-item")
		  	.attr("style", "opacity: 0")
		  	.transition()
		  	.delay(function(d,i){return 500 + 100*i})
	      	.duration(function(d,i){return 300 + 100*i})
	      	.ease(Math.sqrt)
	      	.attr("style", "opacity: 1")
	}

	// 构建top10攻击源
	function initTop10Source(data) {
		$(".app-panel-content-source").remove();
		var html = template('app-panel-content-source', data);
		$('#app-panel-content-world-map').append(html);
		// 添加动画
		d3.select(".app-panel-content-source")
		  	.selectAll("li")
		  	.attr("style", "opacity: 0")
		  	.transition()
		  	.delay(function(d,i){return 300 + 50*i})
	      	.duration(function(d,i){return 150 + 50*i})
	      	.ease(Math.sqrt)
	      	.attr("style", "opacity: 1")
	}

	// 构建top10攻击目的
	function initTop10Target(data) {
		$(".app-panel-content-target").remove();
		var html = template('app-panel-content-target', data);
		$('#app-panel-content-world-map').append(html);
		// 添加动画
		d3.select(".app-panel-content-target")
		  	.selectAll("li")
		  	.attr("style", "opacity: 0")
		  	.transition()
		  	.delay(function(d,i){return 300 + 50*i})
	      	.duration(function(d,i){return 150 + 50*i})
	      	.ease(Math.sqrt)
	      	.attr("style", "opacity: 1")
	}

	// 构建攻击列表
	function initAttackList(data) {
		$(".app-panel-content-table").remove();
		var html = template('app-panel-content-table', data);
		$('#app-panel-content-world-map').append(html);
		// 添加动画
		d3.select(".app-panel-content-table")
		  	.selectAll("tr")
		  	.attr("style", "opacity: 0")
		  	.transition()
		  	.delay(function(d,i){return 500 + 100*i})
	      	.duration(function(d,i){return 500 + 100*i})
	      	.ease(Math.sqrt)
	      	.attr("style", "opacity: 1")
	}

	// 模块载入的初始化方法
	function init() {
		// 加载时间条
		datepicker.init(function() {
			$("#app-component-attack").prepend(template('app-panel-head',{title:"攻击汇总", subtitle:"黑客最感兴趣的TOP5资产"}));	
		});
		// 初始化监听
		unbindEvent();
  		bindEvent();
		// 加载折线图
		app.get(app.baseUrl+'/backinterface/v1/attack/line.json', function(data) {
			attackline.init(data);
		})
		// 构建资产列表
		app.get(app.baseUrl+'/backinterface/v1/attack/asset.json', function(data) {
			initTop5Asset(data);
		})
		// 构建攻击列表
		app.get(app.baseUrl+'/backinterface/v1/attack/attacklist.json', function(data) {
			initAttackList(data);
		})
		// 构建地图数据
		app.get(app.baseUrl+'/backinterface/v1/attack/node.json', function(data) {
			initMap(data);
			initTop10Source(data)
			initTop10Target(data)
		})
	}

	// 加载刷新模块
	function load() {
		// 加载折线图
		app.get(app.baseUrl+'/backinterface/v1/attack/line.json', function(data) {
			attackline.load(data);
		})
		// 构建资产列表
		app.get(app.baseUrl+'/backinterface/v1/attack/asset.json', function(data) {
			initTop5Asset(data);
		})
		// 构建攻击列表
		app.get(app.baseUrl+'/backinterface/v1/attack/attacklist.json', function(data) {
			initAttackList(data);
		})
		// 构建地图数据
		app.get(app.baseUrl+'/backinterface/v1/attack/node.json', function(data) {
			loadMap(data);
			initTop10Source(data)
			initTop10Target(data)
		})
	}

	// 卸载页面,
	function unload() {
		// 停止圆点动画
		stopPointerAnimae()
	}

	exports.init = init; 		// 初始化
	exports.load = load;		// 加载刷新, 进入页面触发, 检索查询联动触发
	exports.unload = unload;	// 卸载页面, 离开页面触发

});