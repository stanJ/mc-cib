define(function(require,exports,module){
    require("../css/range-slider.css");
    var page = {};

    page.topText = {
        avg: "平均值",
        middle: "中位值",
        value: "分界值"
    };

    //顶部保存对象
    page.topVal = {};

    //右侧保存对象
    page.rightVal = {};

    //获取查询参数
    page.getParams = function(){
        var params = {
            userId: utilObj.userLogined.userId
        };

        //搜索条件
        // if($("#branch").val() != null && $.trim($("#branch").val()).length > 0){//支行优先
        //     params.bankId = $("#branch").val();
        // } else if($("#subsidiary").val() != null && $.trim($("#subsidiary").val()).length > 0){ //未选支行
        //     params.bankId = $("#subsidiary").val();
        // }

        // //年份
        // params.evaDate = $("#estimate").select2("data")[0].id;

        return params;
    };

    //年份下拉
    page.setYearList = function(){
        $("#estimate").parents(".top-select").css("display","inline-block");
        var dfd = $.Deferred();
        utilObj.ajax({
            url: "m/customer/findCompleteDate",
            success: function(data){
                if (data && data.object.length > 0) {
                    var optstr = "<option></option>";
                    _.each(data.object, function(v, i) {
                        optstr += "<option value='" + v + "'>" + v + "年</option>";
                    });
                    $("#estimate").html(optstr).select2({
                        width: "100%",
                        language: selet2LangZh,
                        placeholder: "请选择年份",
                        allowClear: true,
                        minimumResultsForSearch: -1
                    });
                    $("#estimate").val(data.object[0]).trigger("change");
                } else {
                    $("#estimate").html("<option value=''></option>").select2({
                        width: "100%",
                        language: selet2LangZh,
                        placeholder: "请选择年份",
                        allowClear: true,
                        minimumResultsForSearch: -1
                    });
                }

                dfd.resolve(data);
            }
        });

        return dfd.promise();
    };

    //pie通用配置
    Highcharts.setOptions({
        chart: {
            type: 'solidgauge',
        },
        title: null,
        pane: {
            center: ['50%', '50%'],
            size: '100%',
            startAngle: 0,
            endAngle: 360,
            background: {
                backgroundColor: '#EEE',
                innerRadius: '80%',
                outerRadius: '100%',
                shape: 'arc',
                borderWidth: 0
            },
        },
        tooltip: {
            enabled: false
        },
        yAxis: {
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            title: "",
            labels: ""
        },
        plotOptions: {
            solidgauge: {
                innerRadius: '80%',//值得宽度，保持与pane中的innerRadius一样
                dataLabels: {
                    y: 0,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    });

    //绑定chart
    page.seriesNames = ["客户数","净收入","信贷资源","经济利润"];
    page.chartType = ["headCount","netIncome","ead","profit"];
    page.chartColors = ["rgb(71,118,199)","rgb(244,157,20)","rgb(47,166,91)","rgb(222,76,57)"];
    page.bindGrid = function(){
        utilObj.showLoading($("#wrap"),"加载中");
        var dfd = $.Deferred();
        utilObj.ajax({
            url: "m/eva/findLayer",
            data: page.getParams(),
            success: function(data){
                if(data && data.object){
                    page.raroc_amount = (data.object.raroc == null ? 0 : data.object.raroc);//显示的金额
                    page.rarocAvg = (data.object.rarocAvg == null ? 0 : data.object.rarocAvg);//平均值
                    page.rarocMiddle = (data.object.rarocMiddle == null ? 0 : data.object.rarocMiddle);//中位值
                    page.rarocValue = (data.object.rarocValue == null ? 0 : data.object.rarocValue);//当前值
                    page.breakevenPoint = (data.object.breakevenPoint == null ? 0 : data.object.breakevenPoint);//盈亏平衡点
                    page.basePoint = (data.object.basePoint == null ? 0 : data.object.basePoint); //当前点

                    //赋值点
                    page.setValue();

                    if(data.object.layerList.length > 0){

                        page.chartData = [];
                        var list_arr = data.object.layerList;
                        var tmp = {};
                        
                        //0 1 互换
                        tmp = list_arr[0];
                        list_arr[0] = list_arr[1];
                        list_arr[1] = tmp;

                        //2 3 互换
                        tmp = list_arr[2];
                        list_arr[2] = list_arr[3];
                        list_arr[3] = tmp;

                        //生成数据结构
                        $.each(list_arr,function(i,v){
                            page.chartData.push({
                                headCount: { //客户数
                                    count: v.headCount,
                                    percent: v.headCountRate
                                },
                                netIncome : { //净收入
                                    count: v.netIncome,
                                    percent: v.netIncomeRate
                                },
                                ead: { //信贷资源
                                    count: v.ead,
                                    percent: v.eadRate
                                },
                                profit: { //经济利润
                                    count: v.profit,
                                    percent: v.profitRate
                                }
                            });
                        });

                        //生成chart
                        $.each(page.chartData, function(i,v){
                            $.each($(".chart-render").eq(i).find("li"), function(j,k){
                                var id = $(k).attr("id");
                                var data_arr = [];
                                data_arr.push(v[page.chartType[j]].percent);
                                var new_opt = {
                                    yAxis: {
                                        min: 0,
                                        max: 100,
                                        title: ""
                                    },
                                    series: [{
                                        name: "",
                                        data: [{
                                            y:v[page.chartType[j]].percent,
                                            color: page.chartColors[j]
                                        }],
                                        dataLabels: {
                                            format: '<div style="text-align:center"><span style="font-size:12px;color:'+page.chartColors[j]+'">'+v[page.chartType[j]].count+'</span><br/><span style="font-size:12px;color:'+page.chartColors[j]+'">'+v[page.chartType[j]].percent+'%</span></div>',
                                            y: -20
                                        },
                                        tooltip: ""
                                    }]
                                };
                                Highcharts.chart(id,new_opt);
                            });
                        });
                    } else {
                        page.chartData = [];
                    }                
                    
                } else {
                    page.raroc = 0;
                    page.breakevenPoint = 0;
                    page.chartData = [];
                }
                utilObj.hideLoading($("#wrap"));
                dfd.resolve(data);
            },
            error: function(e){
                utilObj.hideLoading($("#wrap"));
                dfd.resolve(e);
            }
        });
        return dfd.promise();
    };

    //赋值点
    page.setValue = function(){

        // page.raroc_amount //显示的金额
        // page.rarocAvg //平均值
        // page.rarocMiddle //中位值
        // page.rarocValue //当前值
        // page.breakevenPoint //盈亏平衡点
        // page.basePoint //当前点

        //顶部显示
        if(page.rarocValue == page.rarocAvg){
            $(".avg-text").text("平均值");
        } else if(page.rarocValue == page.rarocMiddle){
            $(".avg-text").text("中位值");
        } else {
            $(".avg-text").text("分界值");
        }

        $(".avg-show").text(page.rarocValue);

        //右侧值
        if(page.basePoint == page.breakevenPoint){
            $(".percent-text").text("盈亏平衡点");
        } else {
            $(".percent-text").text("分界值");
        }

        $(".percent-show").text(page.basePoint);
    };

    //保存顶部
    page.saveTopVal = function(){
        utilObj.showLoading($("#wrap"),"保存中");
        utilObj.ajax({
            url: "m/loanLayering/saveLoanLayering",
            data: page.topVal,
            success: function(data){
                w2popup.close();
                utilObj.hideLoading($("#wrap"));
                page.bindGrid(); //根据新值刷新数据
            },
            error: function(e){
                w2popup.close();
                utilObj.hideLoading($("#wrap"));
            }
        });
    };

    //保存设置
    page.saveRightVal = function(){
        utilObj.showLoading($("#wrap"),"保存中");
        utilObj.ajax({
            url: "m/loanLayering/saveLoanLayering",
            data: page.rightVal,
            success: function(data){
                w2popup.close();
                utilObj.hideLoading($("#wrap"));
                page.bindGrid(); //根据新值刷新数据
            },
            error: function(e){
                w2popup.close();
                utilObj.hideLoading($("#wrap"));
            }
        });
    };

/********************************************************************/
    commonObj.bindEvent_NavAndSearch();

    //加载数据
    page.bindGrid();

    //顶部设置
    $(document).on("click",".top-edit",function(){
        $(".top-popup").w2popup({
            title: "敞口规模EAD",
            width: 300,
            height: 260,
            onOpen: function(event){
                event.onComplete = function(){
                    //输入框
                    $("#w2ui-popup input").w2field("int",{max: 9999999999,min: 0,autoFormat: false}).val(page.rarocValue);
                }
            }
        });
    });

    //平均值/中位值
    $(document).on("click","#w2ui-popup .up-btn",function(){
        if($(this).hasClass("avg-btn")){
            $("#w2ui-popup input").val(page.rarocAvg);
        } else {
            $("#w2ui-popup input").val(page.rarocMiddle);
        }
    });

    //顶部确定
    $(document).on("click",".save-top-btn",function(){
        var val = $("#w2ui-popup input").val().replace(/,/g,"");
        if(val.length == 0){
            val = 0;
        }
        val = parseInt(val);
        page.topVal.userId = utilObj.userLogined.userId;
        if(val == page.rarocAvg){
            page.topVal.rarocType = "rarocAvg";
            page.topVal.rarocValue = val;
            page.topVal.basePoint = page.basePoint;
        } else if(val == page.rarocMiddle){
            page.topVal.rarocType = "rarocMiddle";
            page.topVal.rarocValue = val;
            page.topVal.basePoint = page.basePoint;
        } else {
            page.topVal.rarocType = "raroc";
            page.topVal.rarocValue = val;
            page.topVal.basePoint = page.basePoint;
        }
        page.topVal.evaDate = new Date().getFullYear();
        page.saveTopVal();
    });

    //盈亏平衡点
    $(document).on("click",".right-edit",function(){
        $(".right-popup").w2popup({
            title: "RAROC",
            width: 300,
            height: 300,
            onOpen: function(event){
                event.onComplete = function(){

                    page.rightText = "";

                    //默认值
                    if(page.basePoint == page.breakevenPoint){
                        page.rightText = "盈亏平衡点";
                    } else {
                        page.rightText = "分界值";
                    }

                    $(".text-show").text(page.rightText);
                    $(".val-show").text(page.basePoint);

                    //绑定滑块
                    $('.slider-bar').val(page.basePoint).jRange({
                        from: 0,
                        to: 100,
                        step: 1,
                        scale: [0,10,20,30,40,50,60,70,80,90,100],
                        format: '%s',
                        width: 250,
                        showLabels: true,
                        showScale: true,
                        onstatechange: function(){
                            if(this.options.value == page.breakevenPoint){
                                page.rightText = "盈亏平衡点";
                            } else {
                                page.rightText = "分界值";
                            }

                            page.basePoint = this.options.value;

                            $(".text-show").text(page.rightText);
                            $(".val-show").text(this.options.value);
                        }
                    });
                }
            },
            onClose: function(){
                $(".slider-container").remove();
            }
        });
    });

    //右侧设置
    $(document).on("click",".save-right-btn",function(){
        page.rightVal.userId = utilObj.userLogined.userId;
        page.rightVal.basePoint = page.basePoint;
        page.rightVal.evaDate = new Date().getFullYear();
        page.saveRightVal();
    });

    //取消
    $(document).on("click",".cancel-btn",function(){
        w2popup.close();
    });
});