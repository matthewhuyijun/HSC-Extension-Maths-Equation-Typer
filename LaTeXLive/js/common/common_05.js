window.page_type = document.getElementById("common_config").dataset.pagetype;
window.boot_body = Config[Environment].Boot_OSS;
window.ver_body = Config[Environment].Version;
window.js_body = Config[Environment].MainJS[window.page_type];

function loadCss(href) {
    var link = document.createElement("link");
    link.href = href;
    link.rel = "stylesheet";
    document.head.appendChild(link);
}

loadCss(window.boot_body + "/lib/bootstrap-4.3.1-dist/css/bootstrap.min.css");
loadCss(window.boot_body + "/lib/font-awesome-4.7.0/Font-Awesome-master/css/font-awesome.min.css");
