$.ajaxPrefilter(function (options) {
    //拼接url路径
    options.url = 'http://ajax.frontend.itheima.net' + options.url
})