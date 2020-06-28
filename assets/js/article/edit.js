$(function () {
    var layer = layui.layer;
    var form = layui.form;
    var art_state = '已发布';


    initEditor()
    initCate();
    //初始化分类
    function initCate() {
        $.ajax({
            url: '/my/article/cates',
            success: function (res) {
                // console.log(res);

                if (res.status !== 0) {
                    return layer.msg('初始化文章分类失败！');
                }

                //调用模板引擎，渲染分类的下拉菜单
                var htmlStr = template('tpl-cate', res);
                // console.log(res);

                $('[name=cate_id]').html(htmlStr)
                //调用 form.render() 方法渲染下拉框
                form.render()
            }

        })

    }

    // 1. 初始化图片裁剪器
    var $image = $('#image')
    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        autoCropArea: 1, // 让剪裁框铺满整个剪裁区
        preview: '.img-preview'
    }
    // 3. 初始化裁剪区域
    $image.cropper(options);


    //为选择封面的按钮，绑定点击事件处理函数
    $('#btnChooseImage').on('click', function () {
        $('#coverFile').click()
    })

    //监听 coverFile 的 change 事件，获取用户选择的文件列表
    $('#coverFile').on('change', function (e) {
        //获取到文件的列表数组
        var files = e.target.files
        //判断用户是否选择了文件
        if (files.length === 0) {
            return
        }
        //根据文件，创建对应的 URL 地址
        var newImgURL = URL.createObjectURL(files[0])
        $image
            .cropper('destroy')      // 销毁旧的裁剪区域
            .attr('src', newImgURL)  // 重新设置图片路径
            .cropper(options)        // 重新初始化裁剪区域
    })

    //为存为草稿按钮，绑定点击事件处理函数
    $('#btnSave2').on('click', function () {
        art_state = "草稿"
    })

    //为表单绑定 submit 提交事件
    $('#form-pub').on('submit', function (e) {
        e.preventDefault();
        //基于 form 表单，快速创建一个 FormData 对象
        var fd = new FormData($(this)[0]);
        //将文章的发布状态，存到 fd 中
        fd.append('state', art_state)
        //将封面裁剪过后的图片，输出为一个文件对象
        $image
            .cropper('getCroppedCanvas', {
                // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function (blob) {
                // 将 Canvas 画布上的内容，转化为文件对象
                // 得到文件对象后，进行后续的操作
                // 将文件对象，存储到 fd 中
                fd.append('cover_img', blob)
                //发起 ajax 数据请求
                publishArticle(fd)
            })
    })

    function publishArticle(fd) {
        $.ajax({
            type: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意：如果向服务器提交的是 FormData 格式的数据，
            // 必须添加以下两个配置项
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('发布文章失败！')
                }
                layer.msg('发布文章成功！')
                //发布文章成功后，跳转到文章列表页面
                location.href = '/article/art_list.html'
            }
        })
    }

    // // 获取地址栏的id，根据id获取一篇文章详情。快速为表单赋值
    let id = new URLSearchParams(location.search).get('id');
    // 获取地址栏的id，根据id获取一篇文章详情。快速为表单赋值
    $.ajax({
        url: '/my/article/' + id,
        success: function (res) {
            console.log(res);
            if (res.status === 0) {
                form.val('edit-form', res.data);
                //销毁剪裁区，更换图片，重新创建剪裁区
                $image
                    .cropper('destroy')      // 销毁旧的裁剪区域
                    .attr('src', 'http://www.liulongbin.top:3007' + res.data.cover_img)  // 重新设置图片路径
                    .cropper(options)        // 重新初始化裁剪区域
            }
        }
    })

})