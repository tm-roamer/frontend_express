/* 
 *  页面路由控制模块
 */
define(function(require, exports, module) {

  var cacheHTML = {};  // 缓存所有ajax加载页面
  var cacheMod = {};   // 缓存所有的js模块

  /**
   * 路由地址
   */
  var route = {
    index: function (ctx, next) {
      //var that = this;
      ctx.path = '/v1_attack';
      route.v1_attack(ctx, next);
    },
    v1_visit: function (ctx, next) {
      var name = ctx.path.substring(1);
      // 第一步: 构建页面结构
      handlerCachePage({menu: name, fill:true});
      // 第二步: 加载具体模块页面, cacheHTML控制缓存
      getTpl(app.baseUrl+'/component/v1/visit/visit.html', function (html) {   // 第一处修改: url地址
        if (!cacheMod[name]) {  // 判断是否缓存
          // 第三步: 添加到页面框架中
          $('.app-content-page.active').html(html);
          // 第四步: 加载js业务模块
          require.async("v1_visit", function(mod) {          // 第二处修改: 模块名称,和路由统一
            cacheMod[name] = mod;
            cacheMod[name].init();
            app.pageload = cacheMod[name].load;              // 缓存当前页的刷新方法
          });                               
        } else {
          cacheMod[name].load();
        }
      }); 
    },
    v1_access_analysis: function (ctx, next) {
      var name = ctx.path.substring(1);
      // 第一步: 构建页面结构
      handlerCachePage({menu: name, fill:true});
      // 第二步: 加载具体模块页面, cacheHTML控制缓存
      getTpl(app.baseUrl+'/component/v1/access_analysis/access_analysis.html', function (html) {
        if (!cacheMod[name]) {  // 判断是否缓存
          // 第三步: 添加到页面框架中
          $('.app-content-page.active').html(html);
          // 第四步: 加载js业务模块
          require.async("v1_access_analysis", function(mod) {
            cacheMod[name] = mod;
            cacheMod[name].init();
            app.pageload = cacheMod[name].load;
          }); 
        } else {
          cacheMod[name].load();
        }
      }); 
    },
    v1_attack: function (ctx, next) {
      var name = ctx.path.substring(1);
      // 第一步: 构建页面结构
      handlerCachePage({menu: name, fill:true});
      // 第二步: 加载具体模块页面, cacheHTML控制缓存
      getTpl(app.baseUrl+'/component/v1/attack/attack.html', function (html) {        
        if (!cacheMod[name]) {  // 判断是否缓存
          // 第三步: 添加到页面框架中
          $('.app-content-page.active').html(html);
          // 第四步: 加载js业务模块
          require.async("v1_attack", function(mod) {
            cacheMod[name] = mod;
            cacheMod[name].init();
            app.pageload = cacheMod[name].load;
          }); 
        } else {
          cacheMod[name].load();
        }
      });
    },
    v1_leak: function (ctx, next) {
      var name = ctx.path.substring(1);
      // 第一步: 构建页面结构
      handlerCachePage({menu: name, fill:true});
      // 第二步: 加载具体模块页面, cacheHTML控制缓存
      getTpl(app.baseUrl+'/component/v1/leak/leak.html', function (html) {        
        if (!cacheMod[name]) {  // 判断是否缓存
          // 第三步: 添加到页面框架中
          $('.app-content-page.active').html(html);
          // 第四步: 加载js业务模块
          require.async("v1_leak", function(mod) {
            cacheMod[name] = mod;
            cacheMod[name].init();
            app.pageload = cacheMod[name].load;
          }); 
        } else {
          cacheMod[name].load();
        }
      });
    }
  };

  // 构建缓存页面
  // obj.menu 页面名称, obj.fill 是否填充满首屏
  function handlerCachePage(obj) {
    var content = $(".app-content"),
        pageAll = $('.app-content-page'),
        currentPage = $(".app-content-page[data-menu='"+obj.menu+"']");
    pageAll.removeClass("active");
    if (currentPage.length !== 0) { // 已存在, 执行回调
      currentPage.addClass("active");
    } else {                        // 不存在, 新增
      var str = '<div class="app-content-page active" data-menu="'+obj.menu+'" data-fill-screen="'+obj.fill+'"></div>';
      content.append(str)
      // 计算高度
      if (obj.fill) {               // 是否充满屏幕
        app.computeContentWH();
      }
    }
  }

  // 获取模板
  function getTpl(url, callback) {
    if (cacheHTML[url]) return callback(cacheHTML[url]);
    $.ajax({
      url: url,
      success: function(html) {
        cacheHTML[url] = html;
        callback(html);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
      },
      dataType: 'text'
    });
  }

  // 选中菜单
  function activeMenu(ctx, next) {
    var path = ctx.path === "/" ? '/v1_attack' : ctx.path,
        href = '#!' + (path+'').substring(1),
        activeDom = $(".app-sidebar-menu").find("a.app-sidebar-menu-link[href='"+href+"']")[0];
    app.activeMenu(activeDom);
    next();
  }

  // 初始路由
  page.base(app.baseUrl);
  page('/', activeMenu, route.index);
  page('/v1_visit', activeMenu, route.v1_visit);
  page('/v1_access_analysis', activeMenu, route.v1_access_analysis);
  page('/v1_attack', activeMenu, route.v1_attack);
  page('/v1_leak', activeMenu, route.v1_leak);
  // page('*', route.notfound);    // 404
  page({
    // popstate:false,
    hashbang:true   // 通过#号跳转
  });
  // 监听离开页面触发
  page.exit('*', function(ctx, next) {
    var name = ctx.path.substring(1);
    cacheMod[name].unload && cacheMod[name].unload();
    next();
  });

  window.app.getTpl = getTpl;  //绑定到全局
  

});