define(function(require,exports,module){

	//require("../js/common/variable-pie.js");

	var page = {};

	//跳转对应页面
	page.dir_url = ["cumulative-curve.html","cumulative-curve.html","no_loan_overview.html","customer_list.html"];

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
		params.evaDate = $("#estimate").val();

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

	//标题
	page.typeTitle = ["对公客户分类","存款日均余额","EAD日均余额","净收入","经济利润"];
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/eva/findPandect",
			data: page.getParams(),
			success: function(data){
				if(data && data.object.length > 0){
					page.data_obj = {
						total: _.pluck(data.object,"total"),
						loanNoRisk: _.pluck(data.object,"loanNoRisk"),
						loanRisk: _.pluck(data.object,"loanRisk"),						
						noLoan: _.pluck(data.object,"noLoan"),
						sleep: _.pluck(data.object,"sleep"),
					};

					$(".right-table-content").html(template("table-body",{data: page.data_obj,title: {total:"总客户",loanNoRisk:"正常客户",loanRisk:"风险警示客户",noLoan:"无贷户",sleep:"休眠户"}}));
					dfd.resolve(data);
				} else {
					w2alert("当前没有数据");
					dfd.resolve(data);
				}
			},
			error: function(e){
				w2alert(e.message);
				dfd.resolve(e);
			}
		});

		return dfd.promise();
	};

	//设置柱状图
	page.setChartColumns = function(){

	    page.chart = Highcharts.chart("chart-container2", {
			chart: {
	            type: 'pie',
	            backgroundColor: "none"
	        },
	        title: false,
	        plotOptions: {
	            pie: {
	                shadow: false,
	                startAngle: -180,
	                endAngle: 0,
	                center: ['100%', '45%'],
	                slicedOffset: 10
	            }
	        },
	        legend: {
	        	enabled: true,
	        	align: "left",
	        	verticalAlign: "top"
	        },
	        tooltip: {
	            enabled: false
	        },
	        series: [
	        	//上层
	        	{
	        		size: '80%',
	            	innerSize: '0',
		            cursor: "pointer",
		            zIndex: 2,
		            name: '总户数',
		            data: [
		            	{
			            	name:"总户数",
			            	y: parseInt(page.data_obj.total[0]),
			            	color: "#4776C7"
			            }
		            ],	            
		            dataLabels: {
		                formatter: function(){
		                	if(this.point.y > 0){
		                		return "<span class='chart-point-text'>" + this.point.name + "</span><span class='chart-point-val'>" + this.y + "</span>";
		                	} 

		                	return "";
		                },
		                useHTML: true,
		                style: {
		                	color: "#fff",
		                	fontSize: "20px",
		                	fontWeight: "normal",
		                	textAlign: "center"
		                },
		                distance: -70,
		                y: -20
		            },
		            states:{
		                hover: {
		                    enabled: false
		                }
		            }
	        	}, 
		        {
		        	allowPointSelect: true,
		            cursor: "pointer",
		        	size: '160%',
		            innerSize: '60%',
		            zIndex: 3,
		            name: '分项-上层',
		            data: [
		            	{
		            		id:1,
		            		name: "休眠户",
		            		y: parseInt(page.data_obj.sleep[0]),
		            		color: "#b9b9b9"
		            	},
		            	{
		            		id:2,
		            		name: "无贷户",
		            		y: parseInt(page.data_obj.noLoan[0]),
		            		color: "#39BBDE"
		            	},
		            	{
		            		id:3,
		            		name: "风险警示客户",
		            		y: parseInt(page.data_obj.loanRisk[0]),
		            		color: "#FDB84A"
		            	},
		            	{
		            		id:4,
		            		name: "正常客户",
		            		y: parseInt(page.data_obj.loanNoRisk[0]),
		            		color: "#2FA65B"
		            	},
		            ],
		            dataLabels: {
		                formatter: function () {
		                    // 大于1则显示
		                    return this.y >= 1 ? this.y : null;
		                },
		                distance: -50,
		                y: -10,
		                style:{
		                    fontSize: "24px",
		                    fontWeight: "normal",
		                    color: "#fff",
		                    backgroundColor: "none"
		                },
		                connectorPadding: 0
		            },
		            states:{
		                hover: {
		                    enabled: false
		                }
		            },
		            events: {
		            	click: function(){
		            		var _that = this;
		            		setTimeout(function(){
		            			page.selected_point = false;
		            			_.each(_that.points, function(v,i){
		            				if(v.selected){
		            					page.selected_point = v.selected;
		            					// page.chart.series[1].data[i].update({
		            					// 	z: 200
		            					// });
	            						page.setFloatBar(i);
	            						return false;            					
		            				}
		            			});

		            			if(!page.selected_point){
		            				page.removeFloatBar();
		            			}
		            		},10);
		            	}
		            }
		        },
		        //中层
		        {
		        	size: '160%',
		            innerSize: '60%',		            
		            allowPointSelect: false,
		            cursor: "pointer",
		            zIndex: 2,
		            name: '分项-中间层',
		            data: [
		            	{
		            		name: "休眠户",
		            		y: parseInt(page.data_obj.sleep[0]),
		            		color: "#fff"
		            	},
		            	{
		            		name: "无贷户",
		            		y: parseInt(page.data_obj.noLoan[0]),
		            		color: "#fff"
		            	},
		            	{
		            		name: "风险警示客户",
		            		y: parseInt(page.data_obj.loanRisk[0]),
		            		color: "#fff"
		            	},
		            	{
		            		name: "正常客户",
		            		y: parseInt(page.data_obj.loanNoRisk[0]),
		            		color: "#fff"
		            	},
		            ],
		            dataLabels: {
		                enabled: false
		            },
		            states:{
		                hover: {
		                    enabled: false
		                }
		            }
		        },
		        //下层
		        {
		        	size: '160%',
		            innerSize: '60%',		            
		            allowPointSelect: false,
		            zIndex: 1,
		            name: '分项-底层',
		            data: [
		            	{
		            		name: "休眠户",
		            		y: parseInt(page.data_obj.sleep[0]),
		            		color: "#b9b9b9",
		            		dataLabels: {
		            			color: "#b9b9b9"
		            		}
		            	},
		            	{
		            		name: "无贷户",
		            		y: parseInt(page.data_obj.noLoan[0]),
		            		color: "#39BBDE",
		            		dataLabels: {
		            			color: "#39BBDE"
		            		}
		            	},
		            	{
		            		name: "风险警示客户",
		            		y: parseInt(page.data_obj.loanRisk[0]),
		            		color: "#FDB84A",
		            		dataLabels: {
		            			color: "#FDB84A"
		            		}
		            	},
		            	{
		            		name: "正常客户",
		            		y: parseInt(page.data_obj.loanNoRisk[0]),
		            		color: "#2FA65B",
		            		dataLabels: {
		            			color: "#2FA65B"
		            		}
		            	},
		            ],
		            dataLabels: {
		                formatter: function () {
		                    // 大于1则显示
		                    return this.y >= 1 ? this.point.name : null;
		                },
		                style:{
		                    fontSize: "16px",
		                    fontWeight: "bold"
		                },
		                connectorPadding: 0,
		                crop: false
		            },
		            states:{
		                hover: {
		                    enabled: false
		                }
		            }
		        }
	        ]
	    });

	  	$("tspan.highcharts-text-outline").css("fill","none");
		$("tspan.highcharts-text-outline").css("stroke","none");
	};

	//右侧表格浮动
	page.setFloatBar = function(index){
		page.removeFloatBar();
		var curr_id = 3 - index;
		var $_left_float = $(".float-bar").eq(curr_id);
		var $_right_ul = $(".float-ul").eq(curr_id);
		var left_float_margin = 130 - $_left_float.width();
		var left_float_background = $_left_float.css("background");
		var float_bar_top = 100*(curr_id+1)+60;
		var float_bar = [
			"<div class='curr-float-bar clearfix' style='top:"+(float_bar_top)+"px;' data-dirId='"+curr_id+"'>",
			"	<div class='left-block' style='width:"+$_left_float.width()+"px; margin-left:"+left_float_margin+"px;background:"+left_float_background+";'>",
					$_left_float.text(),
			"	</div>",
			"	<ul style='float:left;'>",
					$_right_ul.html(),
			"	</ul>",
			"</div>"
		].join("");

		$(".right-customer-warp").append(float_bar);
		$(".curr-float-bar").fadeIn();
	};

	page.removeFloatBar = function(){
		$(".curr-float-bar").fadeOut(function(){
			$(this).remove();
		});
	};

/********************************************************************/

	//$(".table-body").height($("#right-main-content").height() - 70 - 200 - 38);
	commonObj.bindEvent_NavAndSearch();

	//获取日期下拉
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.setYearList()).done(function(){
		$.when(page.bindGrid()).done(function(){
			$.when(page.setChartColumns()).done(function(){
				utilObj.hideLoading();
			});			
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
	        	$.when(page.bindGrid()).done(function(){
		            $.when(page.setChartColumns()).done(function(){
						utilObj.hideLoading();
					});
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
	            $.when(page.setChartColumns()).done(function(){
					utilObj.hideLoading();
				});
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
            $.when(page.setChartColumns()).done(function(){
				utilObj.hideLoading();
			});
        });
    });

    //年份下拉
    $("#estimate").on("select2:select", function(e){
    	utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            $.when(page.setChartColumns()).done(function(){
				utilObj.hideLoading();
			});
        });
    });

    //点击右侧跳转
    $(document).on("click",".float-ul",function(){
    	var id = $(this).index()-1;
    	var uri = id == 3 ? page.dir_url[id]+"?type=sleep&subsidiary="+($("#subsidiary").val() == null ? "" : $("#subsidiary").val())+"&branch="+($("#branch").val() == "支行[All]" ? "" : $("#branch").val())+"&year="+$("#estimate").val() : page.dir_url[id];
    	utilObj.gotoPageUri(uri);
    });

    $(document).on("click",".float-bar",function(){
    	var id = $(this).index();
    	var uri = id == 3 ? page.dir_url[id]+"?type=sleep&subsidiary="+($("#subsidiary").val() == null ? "" : $("#subsidiary").val())+"&branch="+($("#branch").val() == "支行[All]" ? "" : $("#branch").val())+"&year="+$("#estimate").val() : page.dir_url[id];
    	utilObj.gotoPageUri(uri);
    });

    //点击浮动跳转
    $(document).on("click",".curr-float-bar",function(){
    	var id = $(this).attr("data-dirId");
    	var uri = id == 3 ? page.dir_url[id]+"?type=sleep&subsidiary="+($("#subsidiary").val() == null ? "" : $("#subsidiary").val())+"&branch="+($("#branch").val() == "支行[All]" ? "" : $("#branch").val())+"&year="+$("#estimate").val() : page.dir_url[id];
    	utilObj.gotoPageUri(uri);
    });
});