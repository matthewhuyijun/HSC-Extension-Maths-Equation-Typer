// Move loading div generation here
var loadingDiv = `
  <div id='loading'>
    <div id='loading-center'>
      <div id='loading-center-absolute'>
        <div id='loading-object'></div>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', loadingDiv);

var jsDiv = `
<div id='isJavaScript'
    style='width: 100%;height: 100%;position: absolute;z-index:3;top:0;left:0;background-color: #fff;display: block;'>
    <div
      style='width:60%;text-align: center;margin: 200px auto auto auto;padding:30px 50px 50px 50px;border: 1px solid rgba(0,0,0,0.2);border-radius: 0.25rem;'>
      <span style='font-size: 20px;'>妈咪叔提醒您</span>
      <h2 style='text-align: center;'>您的浏览器禁用了JavaScript</h2>
      <p>要正常使用此WebAPP，请启用JavaScript，然后刷新页面</p>
      <a href='http://aboutjavascript.com/en/how-to-enable-javascript-in-chrome.html'
        target='_blank'>关于如何启用JavaScript，请戳这里</a>
    </div>
  </div>

  <div id='ifIE-show'
    style='width: 100%;height: 100%;position: absolute;z-index:3;top:0;left:0;background-color: #fff;display: none;'>
    <div class='container'>
      <div
        style='width:60%;text-align: center;margin:60px auto 0 auto;padding:30px 50px 50px 50px;border: 1px solid rgba(0,0,0,0.2);border-radius: 0.25rem;'>
        <span style='font-size: 20px;'>妈咪叔提醒您</span>
        <h2 style='text-align: center;'>您的浏览器内核不支持此应用</h2>
        <p>要正常使用此WebAPP，请使用支持此应用的浏览器，浏览器支持情况如下</p>
        <p style='margin-top: 1rem;'>请使用现代浏览器以获得最佳体验。</p>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', jsDiv);
