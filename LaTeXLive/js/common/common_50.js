
function loadScript(src, type, async) {
    return new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = src;
        if (type) s.type = type;
        if (async !== undefined) s.async = async;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
    });
}

function loadScriptHtml(html) {
    // Parse HTML string like "<script src='...'></script>"
    var div = document.createElement('div');
    div.innerHTML = html;
    var script = div.querySelector('script');
    if (script) {
        return loadScript(script.src, script.type || undefined, false); // Default to sync-like loading for safety in this legacy context
    }
    return Promise.resolve();
}

// Ensure boot_body is available (from global window object set in common_05.js)
var boot_body = window.boot_body || Config[Environment].Boot_OSS;
var ver_body = window.ver_body || Config[Environment].Version;
var js_body = window.js_body || Config[Environment].MainJS[window.page_type];
var page_type = window.page_type || document.getElementById("common_config").dataset.pagetype;

// Load JQuery and Bootstrap first
loadScript(boot_body + "/lib/JQuery-3.4.1/jquery-3.4.1.min.js")
    .then(function () {
        return loadScript(boot_body + "/lib/bootstrap-4.3.1-dist/js/bootstrap.bundle.min.js");
    })
    .then(function () {
        // Initialize scriptLoader
        scriptLoader.init();
    })
    .catch(function (err) {
        console.error("Failed to load base scripts", err);
    });

var scriptLoader = {
  // Use structured objects instead of strings for better control
  script_list: {
    latex: [
        { src: boot_body + "/lib/tippy/popper.min.js" },
        { src: boot_body + "/lib/tippy/tippy-bundle.umd.min.js" },
        { src: boot_body + "/lib/caret/caret.js" },
        { src: boot_body + js_body + "?ver=" + ver_body, type: 'module' }
    ],
    readme: [
        { src: boot_body + js_body + "?ver=" + ver_body, type: 'module' }
    ],
    update: [
        { src: boot_body + js_body + "?ver=" + ver_body, type: 'module' }
    ],
    messageboard: [
        { src: boot_body + "/lib/wangEditor/wangEditor.min.js" },
        { src: boot_body + js_body + "?ver=" + ver_body, type: 'module' }
    ],
    login: [
        { src: boot_body + "/lib/MD5/md5.js" },
        { src: boot_body + "/lib/gVerify/gVerify.js" },
        { src: boot_body + js_body + "?ver=" + ver_body, type: 'module' }
    ],
    personal: [
        { src: boot_body + "/lib/MD5/md5.js" },
        { src: boot_body + js_body + "?ver=" + ver_body, type: 'module' }
    ],
  },
  init: function () {
    if (scriptLoader.isIE()) {
      var jsDiv = document.getElementById("isJavaScript");
      if(jsDiv) jsDiv.style.display = "none";

      var ieDiv = document.getElementById("ifIE-show");
      if(ieDiv) ieDiv.style.display = "block";

      document.body.style.overflowY = "hidden";
      return false;
    } else {
      var jsDiv = document.getElementById("isJavaScript");
      if(jsDiv) jsDiv.remove();

      var ieDiv = document.getElementById("ifIE-show");
      if(ieDiv) ieDiv.remove();

      //更新标题中的版本号
      var verElement = document.getElementById("ver_h1");
      if (verElement) {
        verElement.innerHTML = "ver" + ver_body;
      }
      //加载body资源
      scriptLoader.loadOuterScript();
      scriptLoader.googleads();
    }
  },
  isIE: function () {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
    var isIE11 = userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1;
    if (isIE) {
      var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
      reIE.test(userAgent);
      var fIEVersion = parseFloat(RegExp["$1"]);
      if (fIEVersion == 7) {
        return true;
      } else if (fIEVersion == 8) {
        return true;
      } else if (fIEVersion == 9) {
        return true;
      } else if (fIEVersion == 10) {
        return true;
      } else {
        return true; //IE版本<=7
      }
    } else if (isEdge) {
      return true; //edge
    } else if (isIE11) {
      return true; //IE11
    } else {
      return false; //不是ie浏览器
    }
  },
  loadOuterScript: function () {
    let array = scriptLoader.script_list[page_type];
    if (!array) return;

    // Load scripts sequentially
    var promise = Promise.resolve();
    array.forEach(function (scriptObj) {
        promise = promise.then(function () {
            return loadScript(scriptObj.src, scriptObj.type, false);
        });
    });
  },
  googleads: function () {
    if (Environment != "development") {
        loadScript("https://www.googletagmanager.com/gtag/js?id=UA-164353536-1", undefined, true)
            .then(function() {
                window.dataLayer = window.dataLayer || [];
                function gtag() {
                  dataLayer.push(arguments);
                }
                gtag('js', new Date());
                gtag('config', 'UA-164353536-1');
            });
    }
  },
};
