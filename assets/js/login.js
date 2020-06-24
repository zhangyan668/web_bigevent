$(function () {
    //点击去注册显示注册盒子
    $('#link_reg').on('click', function () {
        $('.reg-box').show().prev().hide()
    });
    //点击去登录显示登录盒子
    $('#link_login').on('click', function () {
        $('.login-box').show().next().hide()
    });

    //表单验证
    var form = layui.form

    //定义密码校验规则
    form.verify({
        //自定义一个pwd校验规则
        pwd: [/^[\S]{6,12}$/, '密码必须6-12位，且不能出现空格'],
        //校验两次输入密码是否一致
        repwd: function (value) {
            var pwd = $('.reg-box [name = "password"]').val();
            //判断两次密码是否一致
            if (value !== pwd) {
                return '两次密码不一致';
            }
        }
    })

    //发请求注册帐号
    var layer = layui.layer
    $('#form_reg').on('submit', function (e) {
        e.preventDefault()
        var data = $(this).serialize()
        $.ajax({
            type: 'POST',
            url: '/api/reguser',
            data: data,
            success: function (res) {
                layer.msg(res.message)
                if (res.status === 0) {
                    $('.reg-box').hide().prev().show()
                }
            }
        })
    })

    //发请求登录
    $('#form_login').on('submit', function (e) {
        e.preventDefault()
        $.ajax({
            type: 'POST',
            url: '/api/login',
            data: $(this).serialize(),
            success: function (res) {
                layer.msg(res.message);
                if (res.status === 0) {
                    // 将登录成功得到的 token 字符串，保存到 localStorage 中
                    localStorage.setItem('token', res.token)
                    localStorage.href = '/index.html'
                }
            }
        })
    })
})