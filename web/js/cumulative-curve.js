define(function(require,exports,module){
	var page = {};

	//堆叠图为空
	page.emptyStock = [
            {
                "areaName":"经济利润(亿元)",
                "areaType":"CREATE",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"经济利润(亿元)",
                "areaType":"KEEP",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"经济利润(亿元)",
                "areaType":"DESTORY",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"净收入(亿元)",
                "areaType":"CREATE",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"净收入(亿元)",
                "areaType":"KEEP",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"净收入(亿元)",
                "areaType":"DESTORY",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"日均余额(亿元)",
                "areaType":"CREATE",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"日均余额(亿元)",
                "areaType":"KEEP",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            },
            {
                "areaName":"日均余额(亿元)",
                "areaType":"DESTORY",
                "total":0,
                "deposit":0,
                "middle":0,
                "assets":0
            }
        ];

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

		//日期
		params.evaDate = ($("#estimate").val() == "" ? new Date().getFullYear() : $("#estimate").val());

		return params;
	};

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

	//千分位分割
	page.thousandBitSeparator = function(num){
		return num && num.toString().replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {
            return $1 + ",";
        });
	};

	//获取数据
	page.getData = function(){
		var dfd = $.Deferred();
		var params = page.getParams();

		utilObj.ajax({
			url: "m/eva/findAccumulation",
			data: params,
			success: function(data){
				if(data && data.object && data.object.profits && data.object.profits.length > 0){
					var max = _.max(data.object.profits, function(v,i){
						return v.ration
					});
					page.secondBand = (max.headRate*100)/(5)-1;
					page.ration = _.pluck(data.object.profits, "ration"); //经济利润
					page.income = _.pluck(data.object.profits, "income"); //净收入
					page.balanceDaily = _.pluck(data.object.profits, "balanceDaily");//日均余额

					page.ration = _.map(page.ration, function(v,i){return parseInt(v*100)});
					page.income = _.map(page.income, function(v,i){return parseInt(v*100)});
					page.balanceDaily = _.map(page.balanceDaily, function(v,i){return parseInt(v*100)});
				} else {
					page.ration = [];
					page.income = [];
					page.balanceDaily = [];
				}

				if(data && data.object && data.object.headCount && data.object.headCount.length > 0){
					page.rationPeople = page.thousandBitSeparator(parseInt(data.object.headCount[0]));
					page.incomePeople = page.thousandBitSeparator(parseInt(data.object.headCount[1]));
					page.balanceDailyPeople = page.thousandBitSeparator(parseInt(data.object.headCount[2]));
				} else {
					page.rationPeople = 0;
					page.incomePeople = 0;
					page.balanceDailyPeople = 0;
				}

				//柱状图
				page.setTopChart();

				//堆叠图
				if(data && data.object && data.object.stackResults && data.object.stackResults.length > 0){
					page.setOtherChart(data.object.stackResults);
				} else {
					page.setOtherChart(page.emptyStock);
				}				
			}
		});
	};

	//设置柱状图
	page.setTopChart = function(){
		page.topChart = Highcharts.chart("top-chart-container",{
	        chart: {
	        	height: 495,
	        	margin: 0
	        },
	        title: false,
	        tooltip: {
	            shared: true
	        },
	        legend: {
	            layout: 'horizontal',
	            align: 'center',
	            verticalAlign: 'top',
	            backgroundColor: "none",
	            y: -70,
	            squareSymbol: true,
	            symbolHeight: 12,
	            symbolRadius: 3,
	            itemStyle:{
	            	fontWeight: "normal",
	            	fontSize: "14px"
	            },
	            enabled: false
	        },
	        plotOptions:{
	        	series: {
	        		events: {
	        			legendItemClick: function(){
	        				return false;
	        			}
	        		},
	        		pointPadding: 0.2,
	        		borderWidth:0
	        	}
	        },
	        tooltip: {
	        	shared: true,
	        	formatter: function () {
	        		var str = "";
	                str += this.points[0].series.name + " : " + this.points[0].y + "%<br />";
	                str += this.points[1].series.name + " : " + this.points[1].y + "%<br />";
	                str += this.points[2].series.name + " : " + this.points[2].y + "%<br />";

	                return str;
	            }
	        },
	        xAxis: [{
	            categories: [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100],
	            crosshair: true,
	            //lineWidth: 1,
	            // gridLineWidth: 1,
	            // gridLineDashStyle:"ShortDash",
	            //lineColor: "rgb(0,0,0)",
	            tickmarkPlacement: "on",
	            plotBands: [ //背景区域
	            	{
		            	color: "rgb(209,220,244)",
		            	from: -1,
		            	to: 3,
		            	label: { //区域顶部文字
		            		align: "center",
		            		text: page.rationPeople > 0 ? "价值创造客户<br />("+ page.rationPeople +"个客户)" : "",
		            		style: {
		            			color: "#4776C7",
		        				fontSize: 12
		            		},
		            		y:-20
		            	}
		            },
		            {
		            	color: "rgb(247,248,250)",
		            	from: 3,
		            	to: parseInt(page.secondBand),
		            	label: { //区域顶部文字
		            		align: "center",
		            		text: page.incomePeople > 0 ? "价值中立客户<br />("+page.incomePeople+"个客户)" : "",
		            		style: {
		            			color: "#8C8C8C",
		        				fontSize: 12
		            		},
		            		y:-20
		            	}
		            },
		            {
		            	color: "rgb(246,229,204)",
		            	from: parseInt(page.secondBand),
		            	to: 100,
		            	label: {
		            		align: "center",
		            		text: page.balanceDailyPeople > 0 ? "价值毁灭客户<br />("+page.balanceDailyPeople+"个客户)" : "",
		            		style: {
		            			color: "#F49D14",
		        				fontSize: 12
		            		},
		            		y:-20
		            	}
		            }
	            ]
	        }],
	        yAxis: [
	            {
	                gridLineWidth: 0,
	                labels: false,
	                title: false,
	                opposite: true,
	                min: 0,
	                max: 100
	            }, { 
	                title: false,
	                labels: {
	                    format: '{value}%',
	                    style: {
	                        color: "rgba(0,0,0,0.8)"
	                    }
	                },
	                min: 0,
	                max: 100
	            }, {
	                title: false,
	                labels: false,
	                opposite: true,
	                min: 0,
	                max: 100
	            }
	        ],
	        series: [{
	            name: '经济利润',
	            type: 'column',
	            yAxis: 1,
	            data: page.ration,
	            tooltip: {},
	            color:"rgb(244,157,20)"
	        }, {
	            name: '净收入',
	            type: 'spline',
	            yAxis: 2,
	            data: page.income,
	            marker: {
	                enabled: false
	            },
	            tooltip: {},
	            color: "rgb(47,166,91)"
	        }, {
	            name: '日均余额',
	            type: 'spline',
	            data: page.balanceDaily,
	            marker: {
	                enabled: false
	            },
	            tooltip: {},
	            color: "#4776C7"
	        }]
	    });
	};

	//右侧柱状图
	var option = {
		chart: {
            type: 'column',
            height: 165,
            margin: 0
        },
        title: "",
        legend: false,
        tooltip: {
            formatter: function () {
                return this.series.name + ': ' + this.y;                    
            }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    color: "#000",
                    textShadow: "0 0 0 0",
                    x: 0,
                    y: 6,
                    fontSize: "12px"
                },
                borderWidth: 0
            },
            series: {
        		events: {
        			legendItemClick: function(){
        				return false;
        			}
        		},
        		pointPadding: 0.2
        	},
        },
        xAxis: {
            categories: ['价值创造', '价值中立', '价值毁灭'],
            labels: {
            	enabled: false,
            	reserveSpace: false
            },
            tickWidth: 0,
            plotBands: [
            	{
	            	color: "rgb(209,220,244)",
	            	from: -0.5,
	            	to: 0.5,
	            	label: { //区域顶部文字
	            		align: "center",
	            		text: "价值创造",
	            		style: {
	            			color: "#4776C7",
	        				fontSize: 12
	            		},
	            		y:-15
	            	}
	            },
	            {
	            	color: "rgb(247,248,250)",
	            	from: 0.5,
	            	to: 1.5,
	            	label: { //区域顶部文字
	            		align: "center",
	            		text: "价值中立",
	            		style: {
	            			color: "#8C8C8C",
	        				fontSize: 12
	            		},
	            		y:-15
	            	}
	            },
	            {
	            	color: "rgb(246,229,204)",
	            	from: 1.5,
	            	to: 2.5,
	            	label: { //区域顶部文字
	            		align: "center",
	            		text: "价值毁灭",
	            		style: {
	            			color: "#F49D14",
	        				fontSize: 12
	            		},
	            		y:-15
	            	}
	            }
            ]
        },
        yAxis: {
            title: "",
            plotLines: [{
            	color: "rgba(0,0,0,0.2)",
            	width: 1,
            	value: 0,
            	dashStyle: "ShortDash"
            }],
            tickInterval: 1,
            lineWidth: 0,
            gridLineWidth: 0,
            labels: {
                enabled: false
            }
        }
	};

	//生成堆叠图
	page.setOtherChart = function(chart_arr){
		var opt1 = option,
			opt2 = option,
			opt3 = option;

		//第一个chart
		opt1.series = [{
            name: '存款',
            data: [chart_arr[0].deposit,chart_arr[1].deposit,chart_arr[2].deposit],
            color: "#14C8F4"
        }, {
            name: '中间业务',
            data: [chart_arr[0].middle,chart_arr[1].middle,chart_arr[2].middle],
			color: "#83A7FF"
        }, {
            name: '资产',
            data: [chart_arr[0].assets,chart_arr[1].assets,chart_arr[2].assets],
            color: "#8CDA53"
        }];
		page.column_chart_1 = Highcharts.chart("column-chart-1",opt1);

		//第二个chart
		opt2.xAxis.plotBands[0].label.text = "";
		opt2.xAxis.plotBands[1].label.text = "";
		opt2.xAxis.plotBands[2].label.text = "";
		opt2.series = [{
            name: '存款',
            data: [chart_arr[3].deposit,chart_arr[4].deposit,chart_arr[5].deposit],
            color: "#14C8F4"
        }, {
            name: '中间业务',
            data: [chart_arr[3].middle,chart_arr[4].middle,chart_arr[5].middle],
            color: "#83A7FF"
        }, {
            name: '资产',
            data: [chart_arr[3].assets,chart_arr[4].assets,chart_arr[5].assets],
            color: "#8CDA53"
        }];
		page.column_chart_2 = Highcharts.chart("column-chart-2",option);

		//第三个chart
		opt3.xAxis.plotBands[0].label.text = "";
		opt3.xAxis.plotBands[1].label.text = "";
		opt3.xAxis.plotBands[2].label.text = "";
		var legend = {
			align: 'center',
            verticalAlign: 'bottom',
            squareSymbol: true,
            symbolHeight: 12,
            symbolRadius: 3,
            y: 80,
            itemStyle:{
            	fontSize: "12px",
            	fontWeight: "normal",
            	lineHeight: 12
            }
		};
		//opt3.legend = legend;
		opt3.series = [{
            name: '存款',
            data: [chart_arr[6].deposit,chart_arr[7].deposit,chart_arr[8].deposit],
            color: "#14C8F4"
        }, {
            name: '中间业务',
            data: [chart_arr[6].middle,chart_arr[7].middle,chart_arr[8].middle],
            color: "#83A7FF"
        }, {
            name: '资产',
            data: [chart_arr[6].assets,chart_arr[7].assets,chart_arr[8].assets],
            color: "#8CDA53"
        }];
		page.column_chart_3 = Highcharts.chart("column-chart-3",option);

		//文字去阴影
		$("tspan.highcharts-text-outline").css("fill","none");
		$("tspan.highcharts-text-outline").css("stroke","none");
	};

/********************************************************************/
	commonObj.bindEvent_NavAndSearch();

	//获取日期下拉
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.setYearList()).done(function(){
		$.when(page.getData()).done(function(){
			utilObj.hideLoading();
		});
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
	        	$.when(page.getData()).done(function(){
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

            $.when(page.getData()).done(function(){
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
        $.when(page.getData()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //年份下拉
    $("#estimate").on("select2:select", function(e){
    	utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.getData()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //选择分层
    $(document).on("click",".right-tab-inner .success",function(){
    	utilObj.gotoPageUri("loan-stratification.html");
    });
});