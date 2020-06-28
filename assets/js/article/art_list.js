$(function () {

    var form = layui.form
    var laypage = layui.laypage
    //补零函数
    //时间过滤器
    function padZero(n) { return n < 10 ? '0' + n : n };
    template.defaults.imports.dateFormat = function (dtStr) {
        var dt = new Date(dtStr);
        var y = dt.getFullYear();
        var m = padZero(dt.getMonth() + 1);
        var d = padZero(dt.getDate());
        var hh = padZero(dt.getHours());
        var mm = padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());
        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }
    // 定义一个查询的参数对象，将来请求数据的时候，
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1,// 页码值，默认请求第一页的数据
        pagesize: 3,// 每页显示几条数据，默认每页显示2条
        cate_id: '',// 文章分类的 Id
        state: ''// 文章的发布状态
    }

    initTable()
    //获取文章列表数据的方法
    function initTable() {
        $.ajax({
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                //使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                //调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    initCate()
    initCate()
    //初始化文章分类的方法
    function initCate() {
        $.ajax({
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！')
                }
                //调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res);
                $('[name=cate_id]').html(htmlStr)
                //通过 layui 重新渲染表单区域的UI结构
                form.render()
            }
        })
    }

    //为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault();
        //获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        //为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id;
        q.state = state;
        //根据最新的筛选条件，重新渲染表格的数据
        initTable()
    })

    //定义渲染分页的方法
    function renderPage(total) {
        // console.log(total);
        //调用 laypage.render() 方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox',//分页容器的 Id
            count: total,//总数据条数
            limit: q.pagesize,//每页显示几条数据
            curr: q.pagenum,//设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],

            //分页发生切换的时候，触发 jump 回调
            jump: function (obj, first) {

                // 触发 jump 回调的方式有两种：
                // 1. 点击页码的时候，会触发 jump 回调
                // 2. 只要调用了 laypage.render() 方法，就会触发
                //设置first来判断是那种方式触发的，当渲染页面时first是true，
                //当点击页码是first是undefined
                //console.log(first);
                //console.log(obj.curr);
                //把最新的页码值，赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr
                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit
                //判断，当first为undefined的时候重新渲染页面，这时first为ture
                if (!first) {
                    initTable()
                }
            }
        })
    }

    //通过代理的形式，为删除按钮绑定点击事件处理函数
    $('tbody').on('click', '.btn-delete', function () {
        //获取删除按钮的个数
        var len = $('.btn-delete').length
        //获取到文章的 id
        var id = $(this).attr('data-id');
        console.log(id);

        //询问用户是否要删除数据
        layer.confirm('确认删除?', { icon: 3, title: '提示' },
            function (index) {
                $.ajax({
                    url: '/my/article/delete/' + id,
                    success: function (res) {
                        console.log(res);

                        if (res.status !== 0) {
                            return layer.msg('删除文章失败！');
                        }
                        layer.msg('删除文章成功！');

                        //判断当前页面是否还有数据，如果没有数据让页码值-1再渲染
                        if (len === 1) { q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1 }
                        initTable();
                    }
                })
                layer.close(index);
            })
    })


})