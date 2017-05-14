## frondend_express

这是一个轻量的前端框架(脚手架), 一个闷骚前端的自娱自乐.

#### 前言

上传这个工程, 也是自娱自乐, 下面的陈述是我从业前端的心得体会.

#### 框架结构

	css样式部分:  bootstrap3

	js部分:		 page.js(路由), sea.js(模块), artTemplate.js(模板)三个技术.

	图表部分: 	 d3.js

	图标:		 svg矢量图标

	构建工具: 	 grunt

	开发方式:		 模块式开发

#### 这套框架的吐槽和不足, 优点和喜爱

	css样式部分: 其实我个人使用了uikit, foundation这些同类的css框架后, 发现bootstrap不一定是最好的选择,
				因为使用了bootstrap移动优先, 搞pc端的连select radio checkbox都没有定制, 丑的要命, 还要引入插件, 真的不够简洁, 它的日历控件竟然使用了自带的图标字体, 当然也支持fontawesome字体库, 如果我为美观定制, 干掉原生字体库, 也不用fontawesome, 就只能hack一下了.

	js部分:		之前搭了一套框架使用angular1.3 + require, angular基本只用了双向数据绑定和ui-router, 学习成本大, 	
				且推出2.0后基本停止维护和更新, 这个真的太尴尬了, 一直就想试试找个好用的路由配合模板引擎来搭建页面会不会有趣很多
				事实证明, 确实好玩和灵活了很多. page.js这个路由还是挺不错的, 简洁清爽易用, 不大包大揽, 这样我就可以在它基础上
				做很多有趣的事情, 比如页面间动画, 配合xhr加载html, 配合sea.js 完成页面间切换的init, load, unloand, resize等等, 实在方便, 我没真实的使用过react开发过, 所以没办法做类比, 让xhr后台加载数据回来后,通过artTemplate这样的模板引擎来渲染是一件愉快的事情. 简单好学易用.

	图表部分:		玩过echarts, highcharts, 它们都是非常优秀的图表插件, 但是项目中, 总是显的不够灵活, 这里不能改, 那里不能改, 
				这个是集成的, 改不了云云, 太折磨人, 这个项目我使用了d3.js来搭建图表, 之前一直想学
				, 这次我终于得逞了, d3学习成本高, 但是值得, 定制化极高, 图表随心所欲. 依我看, 最好的图表工具库就是d3了, 中文书籍也有了, d3 github api有中文版了, 是机会可以好好学学d3, 制作出非常酷炫的图表, 让人恶心的柱图,饼图和万年不变的表格一样惹人厌恶.


	小图标:		使用svg矢量图标, 完美兼容各种屏幕, 大屏不会模糊.


	构建工具:		使用grunt来构建, 我草草了实验了gulp, 更新的构建工具也没尝过鲜, 但是基本满足日常需要了, 它都做了
				css合并, 压缩, js合并, 压缩, svg合并, html压缩, css, js的md5戳, replace文本替换, 还支持静态服务器, 文件自动监听, 自动替换部署等开发环境命令, grunt是老东西了, 不过够稳定.


	开发方式:		借鉴了张云龙的fis模块化开发方式, src/component/下面都是一个一个的文件夹, 每个文件夹下面都是独立的模块,
				文件夹里面有相关的html,js,css等等, 这样开发有个好处, 就是这个模块废弃了, 直接kill掉, 从项目中移除非常干净
				不会有任何残留, 分开了也就能多人合作开发, 好处多多. 
    

#### 这套框架的美图(动画效果是展示不出来了)

![github](https://github.com/tm-roamer/frontend_express/blob/master/doc/login.png?raw=true "登录页面")
![github](https://github.com/tm-roamer/frontend_express/blob/master/doc/attack.png?raw=true "攻击页面")
![github](https://github.com/tm-roamer/frontend_express/blob/master/doc/visit.png?raw=true "访问页面")
![github](https://github.com/tm-roamer/frontend_express/blob/master/doc/visit_china.png?raw=true "访问中国地图页面")

#### 适用环境
	浏览器 ie9+,  开发环境 mac linux window都可以
