var headCommon = {
  init: function () {
    headCommon.loadingAnimate();
    if (document.getElementById("common_config").dataset.pagetype == "readme") {
      headCommon.preLoadMathJax();
    }
    headCommon.googleads();
  },
  loadingAnimate: function () {
    var style = document.createElement('style');
    style.innerHTML = `
    /* #region加载动画 */
    #loading {
      background-color: #337ab7;
      height: 100%;
      width: 100%;
      position: fixed;
      z-index: 1070;
      margin-top: 0;
      top: 0;
      opacity: 1;
    }

    #loading-center {
      width: 100%;
      height: 100%;
      position: relative;
    }

    #loading-center-absolute {
      position: absolute;
      left: 50%;
      top: 50%;
      height: 200px;
      width: 200px;
      margin-top: -100px;
      margin-left: -100px;
    }

    #loading-object {
      width: 80px;
      height: 80px;
      background-color: #fff;
      -webkit-animation: animate 1s infinite ease-in-out;
      animation: animate 1s infinite ease-in-out;
      margin-right: auto;
      margin-left: auto;
      margin-top: 60px;
    }

    @-webkit-keyframes animate {
      0% {
        -webkit-transform: perspective(160px);
      }

      50% {
        -webkit-transform: perspective(160px) rotateY(-180deg);
      }

      100% {
        -webkit-transform: perspective(160px) rotateY(-180deg) rotateX(-180deg);
      }
    }

    @keyframes animate {
      0% {
        transform: perspective(160px) rotateX(0deg) rotateY(0deg);
        -webkit-transform: perspective(160px) rotateX(0deg) rotateY(0deg);
      }

      50% {
        transform: perspective(160px) rotateX(-180deg) rotateY(0deg);
        -webkit-transform: perspective(160px) rotateX(-180deg) rotateY(0deg);
      }

      100% {
        transform: perspective(160px) rotateX(-180deg) rotateY(-180deg);
        -webkit-transform: perspective(160px) rotateX(-180deg) rotateY(-180deg);
      }
    }

    /* #endregion */
    `;
    document.head.appendChild(style);
  },
  preLoadMathJax: function () {
    var script = document.createElement('script');
    script.innerHTML = `
    window.MathJax = {
      options: {
        ignoreHtmlClass: 'ig',
        renderActions: {
          addMenu: [0, '', ''],
        },
      },
      tex: {
        packages: {
          '[+]': ['physics'],
        },
        inlineMath: [
          ['$', '$'],
          ['////(', '////)'],
        ],
      },
    };
    `;
    document.head.appendChild(script);

    var mjScript = document.createElement('script');
    mjScript.id = 'MathJax-script';
    mjScript.async = true;
    mjScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml-full.js';
    document.head.appendChild(mjScript);
  },
  googleads: function () {
    if (Environment != "development") {
        var script = document.createElement('script');
        script.dataset.adClient = 'ca-pub-4786420636728190';
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        document.head.appendChild(script);
    }
  },
};
headCommon.init();
