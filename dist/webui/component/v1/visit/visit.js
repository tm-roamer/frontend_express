'use strict';
/**
 * 【功能说明】：visit.html页的模块文件
 * 【内容说明】：依靠中国地图的chart图网站访问量top10排名
 *             包含查询功能和top10排名的排序说明面板
 *  [帮助说明]  D3的api,请查询: https://github.com/d3/d3/wiki/API--%E4%B8%AD%E6%96%87%E6%89%8B%E5%86%8C
 */
define(function(require, exports, module) {

	var datepicker = require('datepicker');						// 时间控件

	var color = ["#f15127", 									// 地图圆点的颜色数组
				 "#f1c15c", 
				 "#4ac97a", 
				 "#4fafc8",
				 "#199de6",
				 "#999997", 
				 "#999997", 
				 "#999997", 
				 "#999997", 
				 "#999997"],
		geojson = app.baseUrl + '/geojson/china.json',			// 地图底图地址
		selector = "#app-panel-content-china-map",				// 地图容器dom
		content = $(selector),									// 读题容器选择器
		width  = content.width(),								// 地图容器宽
		height = content.height(),								// 地图容器高
		cacheCentroid = {},										// 缓存地图圆点坐标
		svg = null,												// 地图对象
		features = null, 										// 省份的路径
		pointers = null,										// 圆点的路径
		image = null,											// 南海诸岛
		pointersAnimate = null,									// 圆点动画的路径
		pointerList = [],										// 圆点的数据
		intervalId = null;										// 地图冒泡动画的定时器id

	// 线性比例尺, 绘制圆点尺寸
	var linear = d3.scale.linear().domain([9,1]).range([7,16]);	

	// 地图投影
    var projection = d3.geo.mercator()
					.center([107, 31])
					.scale(600)
					.translate([width/2, height/1.5]);
	
	// 地理路径生成器
	var path = d3.geo.path()
			 		.projection(projection);

	// 移除监听
	function unbindEvent() {
	}

	// 绑定监听
	function bindEvent() {
	}

	// 初始化地图
	function initMap(data) {
		
		// 拖动和缩放
		var zoom = d3.behavior.zoom()
					    .translate([0, 0])
					    .scale(1)
					    .scaleExtent([1, 8])
					    .on("zoomstart", function(){ stopPointerAnimae() })
						.on("zoom", function() {
						  features.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						  pointers.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						  image.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
						})
						.on("zoomend", function() { runPointerAnimate() })

		// 初始
		svg = d3.select(selector)
				.append("svg")
    			.attr("width", width)
    			.attr("height", height)
    			.append("g");

		// 加载地图
		d3.json(geojson, function(error, root) {
		
			if (error) 
				return console.error(error);

			// 绘制地图
			features = svg.selectAll("path")
				.data(root.features)
				.enter()
				.append("path")
				.attr("class", "features")
				.attr("stroke","rgba(51, 51, 51, 0.35)")
				.attr("stroke-width",1)
				.attr("fill", "rgba(51, 51, 51, 0.3)")
				.attr("d", path)
				.each(function(d,i){
					var name = d.properties.name; 		// 省的名称
					var centroid = path.centroid(d);	// 取得坐标
					var index = data.indexOf(name);		// 判断是不是显示节点
					if ( index !== -1) {
						pointerList[pointerList.length] = {
							name: name, 		// 省份
							x: centroid[0], 	// x坐标
							y: centroid[1],		// y坐标
							index: index, 		// top排名
							color: color[index] // 颜色
						}
					}
					// 添加南海诸岛示意图
					addSouthChinaSea(d.properties.name, centroid);
				})

			// 添加圆点
			pointers = addPointer();
	
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
			
		});	// end d3.json

	}

	// 加载地图, 仅加载数据
	function loadMap(data) {
		// 清空节点和节点动画
		svg.selectAll(".pointer").remove()
		svg.selectAll(".pointer-animate").remove();
		// 重新取得数据
		pointerList = [],						// 圆点的数据清空
		features.each(function(d,i){
			var name = d.properties.name; 		// 省的名称
			var centroid = path.centroid(d);	// 取得坐标
			var index = data.indexOf(name);		// 判断是不是显示节点
			if ( index !== -1) {
				pointerList[pointerList.length] = {
					name: name, 		// 省份
					x: centroid[0], 	// x坐标
					y: centroid[1],		// y坐标
					index: index, 		// top排名
					color: color[index] // 颜色
				}
			}
		});
		// 添加圆点
		pointers = addPointer();
		// 添加圆点动画, 先停止再开始
		stopPointerAnimae();
		runPointerAnimate();
	}

	// 添加南海诸岛示意图
	function addSouthChinaSea(name, centroid) {
		// 放在台湾旁边
		if (name && name == "台湾") {
			image = svg.append("svg:image")
				.attr("xlink:href",app.baseUrl+"/component/v1/visit/southchinasea.png")
				.attr({
					x: centroid[0]+80,
					y: centroid[1]-20,
					"width":50,
					"height":70
				});
		}
	}

	// 制作渐变
	function makeGradient(color, index) {
		//定义一个放射渐变
		var defs = svg.append("defs");

		var radialGradient = defs.append("radialGradient")
								 .attr("id","radialGradient"+index)

		var stop1 = radialGradient.append("stop")
						.attr("offset","0%")
						.style("stop-color",color)
						.style("stop-opacity", 0.1);
		var stop2 = radialGradient.append("stop")
						.attr("offset","90%")
						.style("stop-color",color)
						.style("stop-opacity", 0.6);
		var stop3 = radialGradient.append("stop")
						.attr("offset","100%")
						.style("stop-color",color)
						.style("stop-opacity", 1);

		return radialGradient;
	}

	// 添加圆点
	function addPointer() {

		var pointers = svg.selectAll("circle.pointer")
			.data(pointerList)
			.enter()
			.append("circle")
			.attr("class", "pointer")
			.attr("fill", function(d){ return d.color})
			.attr("cx", function(d){ return d.x})
			.attr("cy", function(d){ return d.y})
			.attr("r", 2)
			// .attr("r", function(d,i){ return linear(index)})
		    //	console.log(name+"----------"+index+"-----------"+linear(index));

		return pointers;
	}

	// 添加圆点动画
	function addPointerAnimate() {
		// 循环添加动画
		svg.selectAll("circle.pointer")
	 		.each(function(d, i){
	 			svg.append("circle")
					.attr("class", "pointer-animate")
					.attr("transform", d3.select(this).attr("transform"))
					.attr("cx", d.x)
					.attr("cy", d.y)
					.attr("r", 2)
					.style("fill", "url(#" + makeGradient(d.color, d.index).attr("id") + ")")
					.style("fill-opacity", 0.5)
			      	.transition()
			      	.delay(100 * d.index)
			      	.duration(1500)
			      	.ease(Math.sqrt)
			      	.style("fill-opacity", 0.9)
			      	.attr("r", linear(d.index))
			      	.transition()
			      	.duration(1500)
			      	.ease(Math.sqrt)
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
			},2000);
		}
	}

	// 停止圆点动画
	function stopPointerAnimae() {
		clearInterval(intervalId);
		intervalId = null;
		svg.selectAll("circle.pointer-animate").remove(); // 关闭动画
	}

	// 加载topn列表
	function loadTopNList() {
		// 加载top10列表数据
		app.get(app.baseUrl+'/backinterface/v1/visit/top.json', function(data) {
			// 线性比例尺
			var range = d3.scale.linear()
						  		.domain([10,80])
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
			d3.selectAll(".topn-scale-in")
			  	.transition()
			  	.delay(function(d, i) { return 150*i })
		      	.duration(function(d, i) { return 300 })
			  	.attr("style", function(d, i) {
			  		return "width:"+data.list[i].w +"px";
			  	})
		})	
	}

	// 构建topn列表
	function initTopNList(data) {
		$(".app-panel-content-topn").remove();
		var html = template('app-panel-content-topn', data);
		$('#app-panel-content-china-map').append(html);
	}

	// 模块载入的初始化方法
	function init() {
		// 加载时间条
		datepicker.init(function() {
			$("#app-component-visit").prepend(template('app-panel-head',{title:"共6个月的数据互联网访问态势"}));	
		});
		// 初始化监听
		unbindEvent();
  		bindEvent();
		// 加载top10列表数据
		loadTopNList();
		// 构建地图数据
		initMap(["吉林","辽宁","北京","上海","黑龙江","内蒙古","新疆","西藏","甘肃","山东"]);
	}

	// 加载刷新模块
	function load() {
		// 初始化监听
		unbindEvent();
  		bindEvent();
		// 加载top10列表数据
		loadTopNList();
		// 构建地图数据
		loadMap(["湖北","湖南","福建","广州","深圳","台湾","云南","河南","广西","四川"]);
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