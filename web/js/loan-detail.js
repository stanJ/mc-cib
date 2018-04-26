define(function(require,exports,module){
	require("../css/popup-select.css");
	require("../css/qtip2.css");
	require("../js/common/qtip2.js");
	require("../js/common/underscore-min.js");
	require("../js/common/highcharts.js");
	var page = {};
	page.selectedItem = require("../js/check-level-select.js");

	//获取查询参数
	page.getParams = function(){
		var params = {
			employeeId: utilObj.userLogined.employeeId
		};

		//搜索条件
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

		//客户分层
		params.leverType = $(".switch__inner > .selected").attr("data-key");

		//首列字段
		params.title = $("#line-filter > .tab-filter-selected").attr("data-key");

		//弹框选中项
		params.params = JSON.stringify(page.selectedItem); //page.selectedItem; //JSON.stringify(page.selectedItem);

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
                        //allowClear: true,
                        minimumResultsForSearch: -1
                    });
                    $("#estimate").val(new Date().getFullYear()).trigger("change");
                } else {
                	$("#estimate").html("<option value=''></option>").select2({
                        width: "100%",
                        language: selet2LangZh,
                        placeholder: "请选择年份",
                        //allowClear: true,
                        minimumResultsForSearch: -1
                    });
                }

                if(utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7){
                	$(".date-select").css("margin-left","0");
                }

               	dfd.resolve(data);
			}
		});

		return dfd.promise();
	};

	//顶部客户分层选项
	page.getTopLever = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/sysConfig/findLoanLever",
			data: {employeeId: utilObj.userLogined.employeeId},
			success: function(data){
				var levers = "<div class='switch__item selected' data-key=''>全部客户</div>";
				if (data && data.object.length > 0) {
                    _.each(data.object, function(v, i) {
                        levers += "<div class='switch__item' data-key='"+v.configKey+"'>"+v.configValue+"</div>";
                    });   
                }

                $(".switch__inner").html(levers);

                //位置
                $(".switch").css({"margin-left":($(".switch").width()/2*-1)+"px","display":"block"});

                //是否带跳转参数
                if(url("?")){
                	$(".switch__item[data-key="+url("?").key+"]").addClass("selected").siblings(".switch__item").removeClass("selected");
                }                

               	dfd.resolve(data);
			}
		});

		return dfd.promise();
	};

	//表格
	page.column_title = {
		TRADE: {
			name: "行业",
			size: "20%",
			align: "align=left"
		},
		CREDIT: {
			name: "信用评级",
			size: "10%",
			align: "align=center"
		},
		SIZE: {
			name: "客户规模",
			size: "10%",
			align: "align=center"
		},
		STRATEGIC:{
			name: "战略客户",
			size: "10%",
			align: "align=center"
		},
		ORGAN: {
			name: "分支机构",
			size: "20%",
			align: "align=left"
		},
		LEVER: {
			name: "客户分层",
			size: "10%",
			align: "align=center"
		},
		DURATION: {
			name: "合作时长",
			size: "10%",
			align: "align=center"
		},
		MANAGER: {
			name: "客户经理",
			size: "10%",
			align: "align=center"
		}
	};
	var columns_obj = page.column_title[$("#line-filter > .tab-filter-selected").attr("data-key")];
	page.columns = [
		{field: "accountType", caption: columns_obj.name, size: columns_obj.size, attr: columns_obj.align,tooltip:false},
		{field: "accountCount", caption: "客户数(户)", size: "10%", attr: "align=center",tooltip:false},
		{field: "netIncome", caption: "净收入(亿元)", size: "10%", attr: "align=center",tooltip:false},
		{field: "profit", caption: "综合经济利润<br />(亿元)", size: "10%", attr: "align=center",tooltip:false},
		{field: "balance", caption: "期末余额<br />(亿元)", size: "10%", attr: "align=center",tooltip:false},
		{field: "margin", caption: "净利差(%)", size: "10%", attr: "align=center",tooltip:false},
		{field: "lossRate", caption: "不良率/<br />预期损失率(%)", size: "10%", attr: "align=center",tooltip:false},
		{field: "rorac", caption: "RAROC(%)", size: "10%", attr: "align=center",tooltip:false},
		{field: "option", caption: "操作", size: "5%", attr: "align=center",tooltip:false}
	];

	page.records = [];
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/eva/findAccountLoanDtl",
			data: page.getParams(),
			success: function(data){
				if(data && data.object && data.object.length > 0){
					var level1 = [];
					$.each(data.object, function(i,v){
						if(v){
							var level2 = [];
							if(v.childList && v.childList.length > 0){							
								$.each(v.childList, function(i1,v1){
									if(v1){
										var level3 = [];
										//生成level3
										if(v1.childList && v1.childList.length > 0){
											$.each(v1.childList,function(i2,v2){
												level3.push({
													recid: i+""+i1+""+i2,
													accountType: "<span class='account-text'>"+page.ifNullStr(v2.accountType)+"</span>",
													accountCount: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v2.accountCount)+"</span>",
													netIncome: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v2.netIncomeDtl)+"'>"+page.ifNull(v2.netIncome)+"</span>",
													profit: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v2.profitDtl)+"'>"+page.ifNull(v2.profit)+"</span>",
													balance: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v2.balanceDtl)+"'>"+page.ifNull(v2.balance)+"</span>",
													margin: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v2.marginDtl)+"'>"+page.ifNull(v2.margin)+"</span>",
													lossRate: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v2.lossRate)+"</span>",
													rorac: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v2.rorac)+"</span>",
													option: "<span class='show-list' data-recid='"+i+""+i1+""+i2+"' data-customerIds='"+page.ifNull(v2.customerIds)+"'>清单</span>"
												});
											});
										}

										//生成level2
										level2.push({
											recid: i+""+i1,
											accountType: "<span class='account-text'>"+page.ifNullStr(v1.accountType)+"</span>",
											accountCount: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v1.accountCount)+"</span>",
											netIncome: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v1.netIncomeDtl)+"'>"+page.ifNull(v1.netIncome)+"</span>",
											profit: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v1.profitDtl)+"'>"+page.ifNull(v1.profit)+"</span>",
											balance: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v1.balanceDtl)+"'>"+page.ifNull(v1.balance)+"</span>",
											margin: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v1.marginDtl)+"'>"+page.ifNull(v1.margin)+"</span>",
											lossRate: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v1.lossRate)+"</span>",
											rorac: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v1.rorac)+"</span>",
											option: "<span class='show-list' data-recid='"+i+""+i1+"' data-customerIds='"+page.ifNull(v1.customerIds)+"'>清单</span>"
										});

										//是否有下级
										if(level3.length > 0){
											level2[i1].w2ui = {children: level3};
										}
									}
								});
							}

							level1.push({
								recid: i,
								accountType: "<span class='account-text'>"+page.ifNullStr(v.accountType)+"</span>",
								accountCount: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v.accountCount)+"</span>",
								netIncome: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v.netIncomeDtl)+"'>"+page.ifNull(v.netIncome)+"</span>",
								profit: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v.profitDtl)+"'>"+page.ifNull(v.profit)+"</span>",
								balance: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v.balanceDtl)+"'>"+page.ifNull(v.balance)+"</span>",
								margin: "<span class='cell-val'></span><span class='cell-text show-tips' data-val='"+page.ifNull(v.marginDtl)+"'>"+page.ifNull(v.margin)+"</span>",
								lossRate: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v.lossRate)+"</span>",
								rorac: "<span class='cell-val'></span><span class='cell-text'>"+page.ifNull(v.rorac)+"</span>",
								option: "<span class='show-list' data-recid='"+i+"' data-customerIds='"+page.ifNull(v.customerIds)+"'>清单</span>"
							});

							//是否有下级
							if(level2.length > 0){
								level1[i].w2ui = {children: level2};
							}
						}
					});

					page.records = level1;
					columns_obj = page.column_title[$("#line-filter > .tab-filter-selected").attr("data-key")];
					if(w2ui["loanList"]){
						w2ui.loanList.clear();
						w2ui.loanList.columns[0].caption = columns_obj.name;
						w2ui.loanList.columns[0].size = columns_obj.size;
						w2ui.loanList.columns[0].attr = columns_obj.align;
						w2ui.loanList.records = page.records;
						w2ui.loanList.refresh();
					} else {
						$("#myGrid").w2grid({
							name: "loanList",
							total: 10,
							limit: 200,
							recordHeight: 60,
							show: {
								recordTitles: false
							},
							columns: page.columns,
							records: page.records
						});
					}

					setTimeout(function(){
						page.setTooltip();

						//如果是展开项设置宽度
						var _key = $("#line-filter > .tab-filter-selected").attr("data-key")
						if(_key == "TRADE" || _key == "ORGAN"){
							$(".account-text").css("width","65%");
						}
					},500);

					//生成chart
					page.setChart(data.object);
					dfd.resolve(data);
				} else {
					dfd.resolve(data);
				}
				
			},
			error: function(err){}
		});
		return dfd.promise();
	};

	//null值处理
	page.ifNull = function(num){
		return num == null ? 0 : num;
	};

	page.ifNullStr = function(str){
		return str == null ? "" : str;
	};

	//显示tooltip
	page.setTooltip = function(){
		$.each($(".show-tips"),function(i,v){
			var val_arr = $(v).attr("data-val").split(",");
			var max = 0;
			var c_val = [];

			val_arr.splice(0,1);

			if(val_arr.length > 0){
				max = _.max(val_arr,function(v){return parseFloat(v)});
				_.map(val_arr, function(v,i){
					c_val.push(parseFloat(v/max*85).toFixed(2));
				});
			} else {
				c_val[0] = 0;
				c_val[1] = 0;
				c_val[2] = 0;
			}

			$(v).qtip({
				overwrite: true,
				position: {
					my: "center,left",
					at: "center,right"
				},
				content: {
					text: [
						"<div class='tooltip-inner-wrap'>",
						"	<div class='left-bar'>",
						"		<ul>",
						"			<li class='bar-wrap'><span style='bottom: "+c_val[0]+"%;padding-bottom: 3px;'>"+(val_arr[0] ? (parseFloat(val_arr[0]) > 0 ? parseFloat(val_arr[0]).toFixed(2) : 0) : 0)+"</span><div class='blue-block' style='height:"+c_val[0]+"%'></div></li>",
						"			<li class='bar-wrap'><span style='bottom: "+c_val[1]+"%;padding-bottom: 3px;'>"+(val_arr[1] ? (parseFloat(val_arr[1]) > 0 ? parseFloat(val_arr[1]).toFixed(2) : 0) : 0)+"</span><div class='purple-block' style='height:"+c_val[1]+"%'></div></li>",
						"			<li class='bar-wrap'><span style='bottom: "+c_val[2]+"%;padding-bottom: 3px;'>"+(val_arr[2] ? (parseFloat(val_arr[2]) > 0 ? parseFloat(val_arr[2]).toFixed(2) : 0) : 0)+"</span><div class='green-block' style='height:"+c_val[2]+"%'></div></li>",
						"		</ul>",
						"	</div>",
						"	<div class='right-mark'>",
						"		<ul>",
						"			<li>",
						"				<span class='front-block blue-block'></span><span class='desc-text'>存款</span>",
						"			</li>",
						"			<li>",
						"				<span class='front-block purple-block'></span><span class='desc-text'>中收</span>",
						"			</li>",
						"			<li>",
						"				<span class='front-block green-block'></span><span class='desc-text'>资产</span>",
						"			</li>",
						"		</ul>",
						"	</div>",
						"</div>"
					].join("")
				},
				// hide: {
				// 	event: "click"
				// },
				style: {
					classes: "qtip-light"
				}
			});
		});
	};

	page.setChart = function(arr){
		arr.splice(0,1);
		var net_income = [];
		var account = [];
		var profit = [];
		var balance = [];
		var color = ["rgb(222,76,57)","rgb(47,166,91)","rgb(244,157,20)","rgb(71,118,199)"];
		$.each(arr,function(i,v){
			var name = v.accountType;
			net_income.push({
				name: name,
				y: parseFloat(v.netIncomeRate),
				aaa: v.netIncome,
				color: color[i]
			});
			account.push({
				name: name,
				y: parseFloat(v.accountRate),
				aaa: v.accountCount,
				color: color[i]
			});
			profit.push({
				name: name,
				y: parseFloat(v.profitRate),
				aaa: v.profit,
				color: color[i]
			});
			balance.push({
				name: name,
				y: parseFloat(v.balanceRate),
				aaa: v.balance,
				color: color[i]
			});
		});
		var chartOpt = {
			chart: {
	            plotBackgroundColor: "rgb(247,248,250)",
	            backgroundColor: "rgb(247,248,250)",
	            plotBorderWidth: null,
	            plotShadow: false,
	            height:270
	        },
	        title: false,
	        tooltip: {
	            headerFormat: '',
	            pointFormat: '{point.name}:<br />{point.percentage:.1f}%<br />{point.aaa:.2f}',
	            enabled: true
	        },
	        plotOptions: {
	            pie: {
	                allowPointSelect: false,
	                cursor: 'pointer',
	                dataLabels: {
	                    enabled: true,
	                    //format: '<b>{point.name}</b>: {point.percentage:.1f} %<br>{point.aaa}',
	                    formatter: function(){
	                    	return [
	                    		"<span style='width: 50px; display:inline-block; white-space:pre-wrap;font-size: 9px; text-align: left;'>"+this.point.name+"</span>:<br /><span>"+parseFloat(this.point.percentage).toFixed(2)+"%</span><br />",
	                    		"<span style='display:block; width: 30px; text-align: center;'>"+this.point.aaa+"</span>"
	                    	].join("");
	                    },
	                    useHTML: false,
	                    style: {
	                        color: 'black',
	                        textAlign: 'center',
	                        fontSize: "9px"
	                    }
	                }
	            }
	        },
	        series: [{
	            type: 'pie',
	            data: []
	        }]
		}

		//净利润
		chartOpt.series[0].data = net_income;
		$("#chart1 > .charts-show").highcharts(chartOpt);

		//综合利润
		chartOpt.series[0].data = profit;
		$("#chart2 > .charts-show").highcharts(chartOpt);

		//客户数
		chartOpt.series[0].data = account;
		$("#chart3 > .charts-show").highcharts(chartOpt);

		//期末利润
		chartOpt.series[0].data = balance;
		$("#chart4 > .charts-show").highcharts(chartOpt);
	};

	//生成筛选条件的显示
	page.filterTitle = {
		TRADE: "行业",
		CREDIT: "信用评级",
		SIZE: "客户规模",
		STRATEGIC: "战略客户",
		ORGAN: "分支机构",
		LEVER: "客户分层",
		DURATION: "合作时长",
		MANAGER: "客户经理"
	};
	page.createFilter = function(key,arr){
		page.filterHtml += [
			"<div class='screen__condition'>",
			"	<div class='screen__title'>"+page.filterTitle[key]+":</div>",
			"	<div class='screen__condition-items clearfix'>"
		].join("");

		$.each(arr,function(i,v){
			page.filterHtml += [
				"	<div class='screen__condition-item clearfix'>",
				"		<div class='screen__condition-item-text'>"+v.name+"</div>",
				"		<div class='screen__condition-item-close' data-code="+v.levelCode+" data-type="+key+"></div>",
				"	</div>",
			].join("");
		});

		page.filterHtml += [
			"	</div>",
			"</div>"
		].join("");
	};

/********************************************************************/

	$("#myGrid").height($("#right-content").height() - 332);
	commonObj.bindEvent_NavAndSearch();
	
	//获取数据
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.setYearList(),page.getTopLever()).done(function(){
		$.when(page.bindGrid()).done(function(){
			utilObj.hideLoading($("#wrap"));
			 w2ui["loanList"].on("expand",function(){
				setTimeout(function(){page.setTooltip();},500);
			});
			w2ui["loanList"].on("refresh",function(){
				setTimeout(function(){page.setTooltip();},500);
			});
		});
		utilObj.hideLoading($("#wrap"));
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

    //切换switch
	$(document).on("click",".switch__item",function(){
		if($(this).hasClass("selected")){
			return false;
		} else {
			$(this).addClass("selected").siblings(".switch__item").removeClass("selected");
			//刷新数据
			utilObj.showLoading($("#wrap"),"加载中");
			$.when(page.bindGrid()).done(function(){
				utilObj.hideLoading($("#wrap"));
			});
		}
	});

	//展开/收起筛选
	$(document).on("click",".screen__arrow",function(){
		if($(this).hasClass("screen__arrow--down")){
			$(this).removeClass("screen__arrow--down").addClass("screen__arrow--up");
			$(".screen__conditions").slideDown();
		} else {
			$(this).removeClass("screen__arrow--up").addClass("screen__arrow--down");
			$(".screen__conditions").slideUp();
		}
	});
	
	//删除某个筛选条件
	$(document).on("click",".screen__condition-item-close",function(){
		var $_items = $(this).parents(".screen__condition-items");
		var $_item = $(this).parent(".screen__condition-item");

		//去掉数组中的对应数据
		var code = $(this).attr("data-code");
		var type = $(this).attr("data-type");
		if(page.selectedItem[type].level1.length > 0){
			var del_level1 = [];
			$.each(page.selectedItem[type].level1, function(i,v){
				//找到对应的code
				if(v.levelCode == code){
					if(page.selectedItem[type].level2.length > 0){
						var del_level2 = [];
						$.each(page.selectedItem[type].level2, function(i1,v1){
							if(v1.parent == v.levelCode){

								//删除对应的level3
								if(page.selectedItem[type].level3.length > 0){
									var del_level3 = [];
									$.each(page.selectedItem[type].level3,function(i2,v2){
										if(v2.parent == v1.levelCode){
											del_level3.push(i2);
											//page.selectedItem[type].level3.splice(i2,1);
										}
									});

									//删除对应level3
									del_level3.sort(function(a,b){return b-a});
									$.each(del_level3,function(i,v){
										page.selectedItem[type].level3.splice(v,1);
									});
								}

								//记录对应的level2
								del_level2.push(i1);								
							}
						});

						//删除level2
						del_level2.sort(function(a,b){return b-a});
						$.each(del_level2,function(i,v){
							page.selectedItem[type].level2.splice(v,1);
						});
					}

					//记录对应的level1
					del_level1.push(i);
				}
			});

			//删除level1
			del_level1.sort(function(a,b){return b-a});
			$.each(del_level1,function(i,v){
				page.selectedItem[type].level1.splice(v,1);
			});
		}

		$_item.remove();
		if($_items.children(".screen__condition-item").size() == 0){
			$_items.parent(".screen__condition").remove();
		}

		//刷新grid
		utilObj.showLoading($("#wrap"),"加载中");
		$.when(page.bindGrid()).done(function(){
			utilObj.hideLoading($("#wrap"));
		});
	});

	//点击filter
	$(document).on("click",".tab-filter-item",function(){
		if($(this).hasClass("tab-filter-selected")){
			return false;
		} else {
			$(this).addClass("tab-filter-selected").siblings(".tab-filter-item").removeClass("tab-filter-selected");
			utilObj.showLoading($("#wrap"),"加载中");
			$.when(page.bindGrid()).done(function(){
				utilObj.hideLoading();
			});
		}
	});

	//右侧切换
	$(document).on("click", ".right-tab-inner > div", function(){
		if($(this).hasClass("selected-filter")){
			return false;
		} else {
			$(".selected-tab").text($(this).text());
			$(this).siblings("div").removeClass("selected-filter").end().addClass("selected-filter");
			if($(this).index() == 1){
				$(".selected-tab").css({"left": ($(this).siblings("div").width()+5)+"px"});
				$("#myGrid").hide();
				$("#myChart").show();
			} else {
				$(".selected-tab").css({"left": "5px"});
				$("#myGrid").show();
				$("#myChart").hide();
				w2ui["loanList"].refresh();
			}
		}
	});

	//点击弹框的确认按钮
	$(document).on("click",".confirm-btn",function(){
		utilObj.showLoading($("#wrap"),"加载中");
		w2popup.close();
		page.filterHtml = "";
		$.each(page.selectedItem,function(k,v){
			if(v.level1.length > 0){
				page.createFilter(k,v.level1);
			}
		});

		$(".screen__conditions").html(page.filterHtml);
		$.when(page.bindGrid()).done(function(){
			utilObj.hideLoading($("#wrap"));
		});		
	});

	//点击清单
	$(document).on("click",".show-list",function(){
		var cid = $(this).attr("data-customerids");
		var years = page.getParams().evaDate;
		localStorage.setItem("customerQuery",JSON.stringify({cid:cid,years:years}));
		utilObj.gotoPageUri("customer_list.html?detail=detail");
	});
});