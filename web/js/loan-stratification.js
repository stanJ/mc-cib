define(function(require,exports,module){
	var page = {};

	//获取查询参数
	page.getParams = function(){
		var params = {
			employeeId: utilObj.userLogined.employeeId
		};

		//分行
        if($("#subsidiary").val() != null && $.trim($("#subsidiary").val()).length > 0){ 
             params.bankBranchId = $("#subsidiary").val();
        }

        //支行
        if($("#branch").val() != null && $.trim($("#branch").val()).length > 0 && $("#branch").val() != "支行[All]"){
            params.bankId= $("#branch").val();
        }

		//年份
		params.evaDate = $("#estimate").select2("data")[0].id;

		return params;
	};

	//年份下拉
	page.setYearList = function(){
		$("#estimate").parents(".top-select").css("display","inline-block");
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/customer/findCompleteDate",
            data: {employeeId: utilObj.userLogined.employeeId},
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
                    $("#estimate").val(new Date().getFullYear()).trigger("change");
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
                                code: 255,
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
                            $(".chart-box").eq(i).attr("data-type",v.code);
                            $.each($(".chart-render").eq(i).find("li"), function(j,k){
                                var id = $(k).attr("id");
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

                dfd.resolve(data);
            },
            error: function(e){
                dfd.resolve(e);
            }
        });
        return dfd.promise();
    };

    //赋值点
    page.setValue = function(){

        //page.raroc_amount //显示的金额
        //page.rarocAvg //平均值
        //page.rarocMiddle //中位值
        //page.rarocValue //当前值
        //page.breakevenPoint //盈亏平衡点
        //page.basePoint //当前点

        //顶部显示
        if(page.rarocValue == page.rarocAvg){
            $(".avg-text").text("平均值");
        } else if(page.rarocValue == page.rarocMiddle){
            $(".avg-text").text("中位值");
        } else {
            $(".avg-text").text("分界值");
        }

        $(".avg-show").text(page.raroc_amount);

        //右侧值
        if(page.basePoint == page.breakevenPoint){
            $(".percent-text").text("盈亏平衡点");
        } else {
            $(".percent-text").text("分界值");
        }

        $(".percent-show").text(page.basePoint);
    };

/********************************************************************/
	commonObj.bindEvent_NavAndSearch();

	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.setYearList()).done(function(){
		$.when(page.bindGrid()).done(function(){
			utilObj.hideLoading();
		});
	});

	//选择累计曲线
    $(document).on("click",".right-tab-inner .unsuccess",function(){
    	utilObj.gotoPageUri("cumulative-curve.html");
    });

    //下拉事件
    //分行下拉选中
    $("#subsidiary").on("select2:select", function(e) {
        var data = e.params.data;
        if(data.id != ""){
            var sel_data = {
                parentId: data.id,
                employeeId: utilObj.userLogined.employeeId
            };

            utilObj.showLoading($("#wrap"),"加载中");
            $.when(commonObj.getBankSelect($("#branch"), sel_data, "支行[All]")).done(function(){
                $.when(page.bindGrid()).done(function(){
                    utilObj.hideLoading($("#wrap"));
                });
            });
            
        } else {
            utilObj.showLoading($("#wrap"),"加载中");

            $("#branch").select2("destroy");
            $("#branch").html("<option>支行[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });

            $.when(page.bindGrid()).done(function(){
                utilObj.hideLoading($("#wrap"));
            });
        }
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
        var data = e.params.data;
        var sel_data = {
            bankBranchId: $("#subsidiary").val(),
            bankSubsetId: data.id
        };
        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //年份下拉
    $("#estimate").on("select2:select", function(e){
        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //点击区域，跳转到详情
    $(document).on("click",".chart-box",function(){
        var code = $(this).attr("data-key");
        utilObj.gotoPageUri("loan-detail.html?key="+code);
    });
});