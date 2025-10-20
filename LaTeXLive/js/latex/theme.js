export var theme = {
  obj_highlight: {},
  currentTheme: "default",
  map_theme: {},
  isOpenCodeHighLight: true,
  init: function (opt) {
    theme.map_theme = opt.map_all[1].root;
    theme.obj_highlight = opt.obj_highlight;
    theme.isOpenCodeHighLight = opt.obj_highlight.isOpenCodeHighLight;
    theme.reinit();
  },
  reinit: function () {
    theme.setSingle();
    theme.setInput(theme.isOpenCodeHighLight);
    theme.setScroll();
    theme.setButton();
    theme.setMathJax();
  },
  setSingle: function () {
    let root = theme.map_theme[theme.currentTheme].element;
    let len_root = root.length;
    for (let i = 0; i < len_root; i++) {
      let slc = root[i].selecter;
      let stl = root[i].style;
      let len_stl = stl.length;
      for (let m = 0; m < len_stl; m++) {
        $(slc).css(stl[m].key, stl[m].val);
      }
    }
  },
  setInput: function (ishl) {
    let root = theme.map_theme[theme.currentTheme].special;
    if (ishl) {
      let slc_input = root.input.selecter;
      let stl_input = root.input.hl;
      stl_input.forEach((element) => {
        $(slc_input).css(element.key, element.val);
      });
      let slc_copy = root.copyinput.selecter;
      let stl_copy = root.copyinput.hl;
      stl_copy.forEach((element) => {
        $(slc_copy).css(element.key, element.val);
      });
    } else {
      let slc = root.input.selecter;
      let stl = root.input.nohl;
      stl.forEach((element) => {
        $(slc).css(element.key, element.val);
      });
    }
  },
  setScroll: function () {
    if (theme.currentTheme != "default") {
      let cls = "theme-" + theme.currentTheme + "-scroll";
      $("body").attr("class", cls);
      $("#wrap_output").attr("class", "output " + cls);
      $(".twins").attr("class", "form-control twins " + cls);
    } else {
      $("body").attr("class", "");
      $("#wrap_output").attr("class", "output");
      $(".twins").attr("class", "form-control twins");
    }
  },
  setButton: function () {
    if (theme.currentTheme != "default") {
      let cls1 = "theme-" + theme.currentTheme + "-button";
      $(".theme-fill").attr("class", "btn theme-fill " + cls1);
      let cls2 = "theme-" + theme.currentTheme + "-outline-button";
      $(".theme-outline").attr("class", "btn theme-outline " + cls2);
      let cls3 = "theme-" + theme.currentTheme + "-button";
      $(".theme-block").attr("class", "btn btn-block theme-block " + cls3);
      $(".layer1-img").each(function () {
        let el = this;
        if (!el.dataset.lightSrc) {
          el.dataset.lightSrc = el.src;
          if (el.src.indexOf("/img/shortcut/layer1/") !== -1) {
            el.dataset.darkSrc = el.src.replace("/img/shortcut/layer1/", "/img/shortcut_dark/layer1/");
          } else if (el.src.indexOf("/img/template/layer1/") !== -1) {
            el.dataset.darkSrc = el.src.replace("/img/template/layer1/", "/img/template_dark/layer1/");
          } else {
            el.dataset.darkSrc = el.src;
          }
        }
        if (theme.currentTheme === "dark" && el.dataset.darkSrc) {
          el.src = el.dataset.darkSrc;
        } else if (el.dataset.lightSrc) {
          el.src = el.dataset.lightSrc;
        }
      });
    } else {
      $(".theme-fill").attr("class", "btn btn-light theme-fill");
      $(".theme-outline").attr("class", "btn btn-outline-primary theme-outline");
      $(".theme-block").attr("class", "btn btn-block theme-block btn-light");
      $(".layer1-img").each(function () {
        let el = this;
        if (el.dataset && el.dataset.lightSrc) {
          el.src = el.dataset.lightSrc;
        } else if (!el.dataset && el.getAttribute("data-light-src")) {
          el.src = el.getAttribute("data-light-src");
        }
      });
    }
  },
  setMathJax: function () {
    let root = theme.map_theme[theme.currentTheme].special.mathjax;
    let slctr = root.selecter;
    let stl = root.style[0];
    setTimeout(function () {
      $(slctr).css(stl.key, stl.val);
    }, 0);
  },
};
