'use strict';
/**
 * 【功能说明】：index.html页的模块文件
 * 【内容说明】：包含导航条的事件处理
 *             包含边栏菜单的事件处理
 */
define(function(require, exports, module) {

  var timeoutId = null; // 函数节流

  	// 移除监听
	function unbindEvent() {
	    // 边栏菜单
	    $(".app-sidebar-menu-link").off('click', menuClick);
	    // 展开收起菜单按钮
	    $(".app-show-hide-menu").off('click', btnShrinkClick);
      // 窗口resize
      $(window).off('resize', resizeEvent);
      // 控制tooltip显示
      $('[data-toggle="tooltip"]').tooltip('destroy');
      // 顶部导航菜单
      $(".app-navbar-link").off("click", navbarClick);
	}

	// 绑定监听
	function bindEvent() {
	    // 边栏菜单
	    $(".app-sidebar-menu-link").on('click', menuClick);
	    // 展开收起菜单按钮
	    $(".app-show-hide-menu").on('click', btnShrinkClick);
      // 窗口resize
      $(window).on('resize', resizeEvent);
      // 控制tooltip显示
      $('[data-toggle="tooltip"]').tooltip({container: "body"});
      // 顶部导航菜单
      $(".app-navbar-link").on("click", navbarClick);
	}

  // 展开收起菜单
  function btnShrinkClick(e, active) {
    var that = e.currentTarget,
        self = $(that),
        isShow = self.attr("data-show"),
        sidebar = $(".app-sidebar");
    if (isShow == 'hide') {
      sidebar.addClass("app-sidebar-show");
      self.attr("data-show", "show").addClass("active");
    } else {
      sidebar.removeClass("app-sidebar-show");
      self.attr("data-show", "hide").removeClass('active');
    }
  }

  // 选中边栏菜单
  function activeMenu(activeDom) {
    var self = $(activeDom),                          // 当前菜单
        issub = self.attr('data-issub'),              // 标识二级菜单项
        svgAll = $('.app-link-show-hide-ico'),        // 所有图标
        listAll = $(".app-sidebar-sub-menu"),         // 所有二级菜单列表
        all  = $('.app-sidebar-menu-link'),           // 所有菜单项
        list = self.parents('.app-sidebar-sub-menu'), // 二级菜单列表
        subMenuItem = list.find('.app-sidebar-menu-link'),     // 同级的二级菜单项
        parentMenuItem = list.prev('.app-sidebar-menu-link'),  //父亲一级菜单
        svg  = parentMenuItem.find('.app-link-show-hide-ico');  // 图标
    // 判断如果手动触发, 退出
    if (app.activeMenuIsHand) {
      app.activeMenuIsHand = false;
      return;
    };
    // 判断是一级菜单
    if (!issub) {
      // 关闭其他展开的一级菜单
      listAll.hide();
      // 展开自己
      //list.length > 0 && list.css({"height": list.height()}).show();
      // 移除所有
      all.attr("data-active", "false").parents("li").removeClass('active');
      svgAll.removeClass('down-transform');
      // 选中当前
      self.attr("data-active", "true").parents("li").addClass('active');
      //svg.addClass('down-transform');
    }
    // 判断是二级菜单
    else {
      // ------------------------  一级菜单的控制
      // 关闭其他展开的一级菜单
      listAll.hide();
      // 展开自己
      list.show();
      // 移除所有
      all.attr("data-active", "false").parents("li").removeClass('active');
      svgAll.removeClass('down-transform');
      // 选中当前
      parentMenuItem.attr("data-active", "true").parents("li").addClass('active');
      svg.addClass('down-transform');
      // ------------------------  二级菜单的控制
      // 移除所有
      subMenuItem.attr("data-active", "false").parents("li").removeClass('active');
      // 选中当前
      self.attr("data-active", "true").parents("li").addClass('active');
    }
  }

	// 边栏菜单
  function menuClick(e, activeDom) {
    var that =  e && e.currentTarget,
        self = $(that || activeDom),                  // 当前菜单
        issub = self.attr('data-issub'),              // 标识二级菜单项
        svg  = self.find('.app-link-show-hide-ico'),  // 图标
        list = self.next('.app-sidebar-sub-menu'),    // 二级菜单列表
        svgAll = $('.app-link-show-hide-ico'),        // 所有图标
        listAll = $(".app-sidebar-sub-menu"),         // 所有二级菜单列表
        all  = $('.app-sidebar-menu-link'),           // 所有菜单项
        subMenuItem = self.parents('.app-sidebar-sub-menu').find('.app-sidebar-menu-link'); //同级的二级菜单项
    // 记录手动触发
    app.activeMenuIsHand = true;
   	// 判断是一级菜单
    if (!issub) {
      // 判断是不是点击自己
      if (self.attr("data-active") === "true") {
        //self.attr("data-active", "false");
        if (list.css("display") == "none") {
          svg.addClass('down-transform');
          list.slideDown("fast");  
        } else {
          svg.removeClass('down-transform');
          list.slideUp("fast");  
        }
        return;
      } else {
        listAll.each(function(i) {
          if ($(this).css("display") != "none") {
            $(this).slideUp("fast");
          }
        });
        list.length > 0 && list.css({"height": list.height()}).slideDown("fast");
        // 移除所有
        all.attr("data-active", "false").parents("li").removeClass('active');
        svgAll.removeClass('down-transform');
        // 选中当前
        self.attr("data-active", "true").parents("li").addClass('active');
        svg.addClass('down-transform');
      }
    }
    // 判断是二级菜单
    else {
      // 移除所有
      subMenuItem.attr("data-active", "false").parents("li").removeClass('active');
      // 选中当前
      self.attr("data-active", "true").parents("li").addClass('active');
    }
  }

  // 窗口resze
  function resizeEvent(e) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(function() {
      // 计算整屏高度
      computeContentWH();
    }, 100);
  }

  // 顶部导航菜单
  function navbarClick(e) {
    // 隐藏提示
    $('[data-toggle="tooltip"]').tooltip('hide');
  }

  // 计算整屏高度
  function computeContentWH() {
    var win = $(window),
        nav = $(".app-navbar"),
        content = $(".app-content-page.active[data-fill-screen='true']"),
        winW = win.width(),
        winH = win.height(),
        headH = nav.height(),
        headMarginTop = parseInt(nav.css("margin-top")),
        headMarginBottom = parseInt(nav.css("margin-bottom"));
    content.css("height", winH-headH-headMarginTop-headMarginBottom);
  }

  // 显示告警提示
  function showWarning(title, content) {
    var html = template('app-alert', {title:title,content:content});
    $('#app-alert-container').html(html);
    setTimeout(function(){
      $('#app-alert-container').html('');
    },3000);
  }

  // 格式化显示数字, k === 1千,  m === 1百万, g === 10亿
  function num2str(n, decimal) {
      if (n <1000) return n;
      var scale = 1000, unit = 'k';
      if ( n >= 1000000 ) {
        scale = 1000000;
        unit = 'm';
      } else if ( n >= 1000000000 ) {
        scale = 1000000;
        unit = 'g';
      }
      return parseFloat(n/scale).toFixed(decimal || 1) + unit;
  }

  // 初始化时间, 默认半年
  function initDate(space) {
    var end = new Date();
    var start = new Date();
    start.setMonth(start.getMonth()-space);
    setDate(start, end);
  }

  // 获取时间(开始和结束)
  function getDate() {
    return app._date;
  }

  // 设置时间
  function setDate(start, end) {
    app._date = [start, end];
  }

  // 显示时间
  function _showDate() {
    var end = app._date[1],
        endYear = end.getFullYear(),
        endMonth = end.getMonth()+1,
        endDay = end.getDate();
    var start = app._date[0],
        startYear = start.getFullYear(),
        startMonth = start.getMonth()+1,
        startDay = start.getDate();
    console.log("start: "+startYear+"-"+startMonth+"-"+startDay)
    console.log("end: "+endYear+"-"+endMonth+"-"+endDay)
  }

  // // 权限验证接口 auth
  // function getAuth(callback) {
  //     var url = '/auth';
  //     var xhr = new XMLHttpRequest();
  //     xhr.open('GET', url);
  //     xhr.onload = function () {
  //         if (xhr.readyState === 4 && xhr.status === 200) {
  //             if (callback && typeof callback === 'function') {
  //                 callback(JSON.parse(xhr.responseText));
  //             }
  //         }
  //     };
  //     xhr.send();
  // }

  function _ajax(type, url, callback, paramater) {
      // 配置数据
      var time = app.getDate();
      var data = {
          startTime: time[0].getTime(),
          endTime: time[1].getTime()
      };
      if (paramater) {
          data.paramater = paramater
      }
      // 发送请求
      $.ajax({
          url: url + '?' + 'data=' + encodeURIComponent(JSON.stringify(data)),
          type: type, //"get", "post"
          dataType: "json",
          // 请求成功执行回调
          success: function (result) {
              if (callback && typeof callback === 'function') {
                  callback(result);
              }
          },
          // 请求接口的错误处理方法, 403等权限判断, 仅限使用$.ajax(error)
          error: function(XMLHttpRequest, textStatus, errorThrown) {
              if (XMLHttpRequest.status === 403) {
                  // alert("报错:"+XMLHttpRequest.status)
                  console.log("这里会有对应页面来进行接收")
                  // that.loading('hide');
                  // window.localStorage.clear();
                  // location.href = window.localStorage.loginURL || '/login.html';
              } else if ( XMLHttpRequest.status === 500 ) {
                console.log("这里会有对应页面来进行接收")
              }
          }
      });
  }

  // ajax请求接口封装, 方便进行权限判断和验证
  function get(url, callback, paramater) {
      _ajax('get', url, callback, paramater)
  }

  // ajax请求接口封装, 方便进行权限判断和验证
  function post(url, callback, paramater) {
      _ajax('post', url, callback, paramater)
  }

  unbindEvent();
  bindEvent();
  computeContentWH();
  initDate(6);

  window.app.computeContentWH = computeContentWH;  //绑定到全局
  app.activeMenu = activeMenu;
  app.showWarning = showWarning;
  app.num2str = num2str;
  app.getDate = getDate;
  app.setDate = setDate;
  app._showDate = _showDate;
  app.get = get;
  app.post = post

});