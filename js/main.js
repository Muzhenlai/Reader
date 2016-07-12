/**
 * Created by Mumu on 2016/7/12.
 */
(function () {
  //工具类
  var Util = (function () {
    var prefix = 'reader_';//防止同一域名下的误操作覆盖key
    var StorageGetter = function (key) {
      return localStorage.getItem(prefix + key);
    };
    var StorageSetter = function (key, val) {
      return localStorage.setItem(prefix + key, val);
    };
    var getJSONP = function(url,callback){
      return $.jsonp({
        url:url,
        cache:true,
        callback:'duokan_fiction_chapter',
        success:function(result){
          var data = $.base64.decode(result);
          var json = decodeURIComponent(escape(data));
          callback(json);
        }
      });
    };
    return {
      StorageGetter: StorageGetter,
      StorageSetter: StorageSetter,
      getJSONP : getJSONP
    }
  })();
  //常量
  var Dom = {
    top_nav: $('#top-nav'),
    bottom_nav: $('#footer'),
    theme_switch: $('#theme_switch'),
    theme_pannel: $('.js_bottom_theme'),
    bottom_font:$('.icon-normal'),
    bg_container:$('.bg-container'),
    bg_theme:$('.bg-container-current')
  };

  var Bg_Color = ['#fff','#452221','#009900','#669977','#333'];

  var Win = $(window);
  var Doc = $(document);
  var readerModel;
  var readerUI;
  var PageContainer = $('#fiction_container');
  var initFontSize = Util.StorageGetter('font-size');
  //初始字体
  initFontSize = parseInt(initFontSize);
  if(!initFontSize){
    initFontSize = 10;
  }
  PageContainer.css('font-size',initFontSize);
  //初始背景
  var initBgColor = Util.StorageGetter('bg-theme-color');
  if(!initBgColor){
    initBgColor = Bg_Color[0];//默认白色
  }
  if(initBgColor === '#333'){
    changeTheme(4);
  }
  $('#root').css('background-color',initBgColor);

  function main() {
    //TODO 项目入口
    readerModel = ReaderModel();
    readerUI = ReaderBaseFrame(PageContainer);
    readerModel.init(function(data){
      readerUI(data);
    });
    EventHanlder();
  }
  function ReaderModel() {
    //TODO 数据交互方法
    var Chapter_id;
    var ChapterTotal;
    var init = function(UIcallback){
      getFictionInfo(function(){
        getCurChapterContent(Chapter_id,function(data){
          //TODO...
          UIcallback && UIcallback(data);
        });
      })
    };
    var getFictionInfo = function(callback){
      $.get('data/chapter.json',function(data){
        //TODO 获得章节信息
        Chapter_id = data.chapters[1].chapter_id;
        ChapterTotal = data.chapters.length//保存所有章节数
        callback && callback();
      },'json');
    };
    var getCurChapterContent = function(chapter_id,callback){
      //TODO 或得当前章节内容
      $.get('data/data' + chapter_id + '.json',function(data){
        if(data.result == 0){
          var url = data.jsonp;
          Util.getJSONP(url,function(data){
            callback && callback(data);
          });
        }
      },'json');
    };
    var prevChapter = function(UIcallback){
      Chapter_id = parseInt(Chapter_id,10);
      if(Chapter_id == 0){
        return;
      }
      Chapter_id -= 1;
      getCurChapterContent(Chapter_id,UIcallback);
    };
    var nextChapter = function(UIcallback){
      Chapter_id = parseInt(Chapter_id,10);
      if(Chapter_id == ChapterTotal){
        return;
      }
      Chapter_id += 1;
      getCurChapterContent(Chapter_id,UIcallback);
    };
    return {
      init : init,
      prevChapter : prevChapter,
      nextChapter : nextChapter
    }
  }

  function ReaderBaseFrame(container) {
    //TODO 初始化页面结构
    function parseChapterData(jsonData){
      var jsonObj = JSON.parse(jsonData);
      var html = '<h4>' + jsonObj.t + '</h4>';
      for(var i = 0 ; i <jsonObj.p.length ; i++){
        html += '<p>' + jsonObj.p[i] + '</p>';
      }
      return html;
    }
    return function (data){
      container.html(parseChapterData(data));
    }
  }

  function EventHanlder() {
    //TODO 交互事件绑定
    //唤出上下边栏
    $('#action-mid').click(function () {
      if (Dom.top_nav.css('display') === 'none') {
        Dom.top_nav.show();
        Dom.bottom_nav.show();
      }
      else {
        Dom.top_nav.hide();
        Dom.bottom_nav.hide();
        Dom.theme_pannel.hide();
        Dom.bottom_font.removeClass('icon-orange');
      }
    });
    //唤出字体背景面板
    $('#font-button').click(function(){
      if(Dom.theme_pannel.css('display') === 'none'){
        Dom.theme_pannel.show();
        Dom.bottom_font.addClass('icon-orange');
      }
      else {
        Dom.theme_pannel.hide();
        Dom.bottom_font.removeClass('icon-orange');
      }
    });
    //夜间白天模式切换
    Dom.theme_switch.click(function(){
      //TODO 触发背景切换事件
      var b_length = Dom.bg_container.length;
      //黑
      if(Util.StorageGetter('bg-theme-color') != '#333'){
        for(var j = 0 ; j < b_length ; j++){
          Dom.bg_theme.removeClass('bg-current-border');
        }
        changeTheme(4);
        Dom.bg_theme.last().addClass('bg-current-border');
        Dom.bg_theme.first().removeClass('bg-current-border');
      }
      //白
      else {
        for(var j = 0 ; j < b_length ; j++){
          Dom.bg_theme.removeClass('bg-current-border');
        }
        changeTheme(0);
        Dom.bg_theme.first().addClass('bg-current-border');
        Dom.bg_theme.last().removeClass('bg-current-border');
      }
    });

    //背景切换事件
    Dom.bg_container.click(function(){
      //TODO 切换背景
      var b_length = Dom.bg_container.length;
      for(var i = 0 ; i < b_length ; i++){
        for(var j = 0 ; j < b_length ; j++){
          Dom.bg_theme.removeClass('bg-current-border');
        }
        $(this).find('div').addClass('bg-current-border');
        var currentIndex = $(this).index()-1;
        changeTheme(currentIndex);
      }
    });

    //放大缩小字体
    $('#large-font').click(function(){
      if(initFontSize > 19){
        return;
      }
      initFontSize += 1;
      PageContainer.css('font-size',initFontSize);
      Util.StorageSetter('font-size',initFontSize);
    });
    $('#small-font').click(function(){
      if(initFontSize <= 8){
        return;
      }
      initFontSize -= 1;
      PageContainer.css('font-size',initFontSize);
      Util.StorageSetter('font-size',initFontSize);
    });

    //变更阅读背景
    function changeTheme(index){
      $('#root').css('background-color',Bg_Color[index]);
      if(index === 4){
        $('#day').hide();
        $('#night').show();
      }
      else {
        $('#day').show();
        $('#night').hide();
      }
      Util.StorageSetter('bg-theme-color',Bg_Color[index]);
    }

    Win.scroll(function(){
      Dom.top_nav.hide();
      Dom.bottom_nav.hide();
      Dom.theme_pannel.hide();
      Dom.bottom_font.removeClass('icon-orange');
    });

    $('#prev_button').click(function(data){
      //TODO 获取前一章数据->渲染到Dom文档
      readerModel.prevChapter(function(data){
        readerUI(data);
      });
    });
    $('#next_button').click(function(){
      //TODO 获取后一章数据->渲染到Dom文档
      readerModel.nextChapter(function(data){
        readerUI(data);
      });
    });
  }
  main();
})();
