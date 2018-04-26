define(function(require,exports,module){
	var page = {};

	//tab选项
	var filter_data = [
		{
			name: "客户",
			value: "CUSTOMER_INFO"
		},
		{
			name: "产品",
			value: "PRODUCT"
		},
		{
			name: "客户类型",
			value: "CUSTOMER_TYPE"
		},
		{
			name: "客户分层",
			value: "CUSTOMER_CLASS"
		},
		{
			name: "战略客户",
			value: "IS_STRATEGIC"
		}
	];

	page.steps = ["step1","step2","step3","step4","step5","step6","step7","step8","step9"];

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

		//客户经理
		if($("#manager").val() != null && $.trim($("#manager").val()).length > 0 && $("#manager").val() != "客户经理[All]"){//客户经理优先
			params.employeeId = $("#manager").val();
		} /*else {
			params.employeeId1 = utilObj.userLogined.employeeId;
		}*/

		//首列字段
		params.type = $(".tab-filter-selected").attr("data-val");

		return params;
	};

	//筛选条件
	page.getFilter = function(){
		var filter_str = "";
		_.each(filter_data, function(v,i){
			filter_str += "<li class='tab-filter-item' data-val='" + v.value + "'>" + v.name + "<div class='move-mark bg-base-blue'></div></li>";
		});

		$("#line-filter").append(filter_str);
		$(".tab-filter-item").eq(0).addClass("tab-filter-selected");
	};

	//标题
	page.setTableTitle = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/sysConfig/findListTimeConsuming",
			data: {type: "CUSTOMER_STAGE"},
			success: function(data){
				if(data && data.object.length > 0){
					page.columns = [{field: "fType", caption: "", size: "19%", attr: "align=center"}];
					page.configVal = [];
					$.each(data.object, function(i,v){
						page.columns.push({
							field: page.steps[i],
							caption: v.configName,
							size: "9%",
							attr: "align=center"
						});
						page.configVal.push(v.configValue);
					});
					page.columns.push({field: "total", caption: "合计", size: "10%", attr: "align=center"});
				} else {
					w2alert("当前没有数据");
				}

				dfd.resolve(data);
			},
			error: function(e){
				w2alert(e.message);
				dfd.resolve(e);
			}
		});
		return dfd.promise();
	};

	//表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/sale/findTimeConsuming",
			data: page.getParams(),
			success: function(data){
				if(data && data.object.length){
					page.records = [];
					$.each(data.object, function(i,v){
						page.setRecordItem(v,i);
					});

					if(w2ui["Time"]){
						w2ui.Time.clear();
						w2ui.Time.records = page.records;
						w2ui.Time.refresh();
					} else {
						$("#myGrid").w2grid({
							name: "Time",
							total: 10,
							limit: 200,
							recordHeight: 80,
							selectType: "row",
							show: {
								recordTitles: false
							},
							columns: page.columns,
							records: page.records
						});

						//阻止默认双击
						w2ui.Time.on('dblClick', function(event) {
						    event.preventDefault();
						});
					}					
				}

				dfd.resolve(data);
			},
			error: function(err){
				utilObj.hideLoading($("#wrap"));
				dfd.resolve(err);
			}
		});

		return dfd.promise();
	};

	//第一行数据
	page.setRecordItem = function(data,index){
		var days = data.day.split(",");
		var percent = data.percent == null ? "" : (data.percent.length > 0 ? data.percent.split(",") : "");
		var highlight = data.highlight == null ? "" : (data.highlight.length > 0 ? data.highlight.split(",") : "");
		if(index == 0){
			page.records.push({
				recid: index,
				fType: "<span class='columns-title'>" + data.headName + "</span>",
				step1: "<div class='" + (highlight.length > 0 ? (highlight[0] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[0] +"</span></div>",
				step2: "<div class='" + (highlight.length > 0 ? (highlight[1] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[1] +"</span></div>",
				step3: "<div class='" + (highlight.length > 0 ? (highlight[2] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[2] +"</span></div>",
				step4: "<div class='" + (highlight.length > 0 ? (highlight[3] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[3] +"</span></div>",
				step5: "<div class='" + (highlight.length > 0 ? (highlight[4] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[4] +"</span></div>",
				step6: "<div class='" + (highlight.length > 0 ? (highlight[5] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[5] +"</span></div>",
				step7: "<div class='" + (highlight.length > 0 ? (highlight[6] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[6] +"</span></div>",
				step8: "<div class='" + (highlight.length > 0 ? (highlight[7] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[7] +"</span></div>",
				total: "<div><span class='uptext'>"+ days[8] +"</span></div>",
			});
		}else{
			page.records.push({
				recid: index,
				fType: "<span class='columns-title'>" + data.headName + "</span>",
				step1: "<div class='" + (highlight.length > 0 ? (highlight[0] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[0] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[0] : "") +"</span></div>",
				step2: "<div class='" + (highlight.length > 0 ? (highlight[1] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[1] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[1] : "") +"</span></div>",
				step3: "<div class='" + (highlight.length > 0 ? (highlight[2] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[2] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[2] : "") +"</span></div>",
				step4: "<div class='" + (highlight.length > 0 ? (highlight[3] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[3] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[3] : "") +"</span></div>",
				step5: "<div class='" + (highlight.length > 0 ? (highlight[4] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[4] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[4] : "") +"</span></div>",
				step6: "<div class='" + (highlight.length > 0 ? (highlight[5] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[5] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[5] : "") +"</span></div>",
				step7: "<div class='" + (highlight.length > 0 ? (highlight[6] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[6] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[6] : "") +"</span></div>",
				step8: "<div class='" + (highlight.length > 0 ? (highlight[7] == "1" ? "warnning" : "") : "" ) + "'><span class='uptext'>"+ days[7] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[7] : "") +"</span></div>",
				total: "<div><span class='uptext'>"+ days[8] +"</span>&nbsp;/&nbsp;<span class='downtext'>"+ (percent.length > 0 ? percent[8] : "") +"</span></div>",
			});
		}
	};

/********************************************************************/

	$("#myGrid").height($("#right-main-content").height() - 50);
	commonObj.bindEvent_NavAndSearch();

	//过滤
	page.getFilter();

	//获取数据
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.setTableTitle()).done(function(){
		$.when(page.bindGrid()).done(function(){
			utilObj.hideLoading($("#wrap"));
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
	        $.when(commonObj.getBankSelect($("#branch"), sel_data, "支行[All]")).done(function(){
	        	$.when(commonObj.getCustomerManager($("#manager"), sel_data, "客户经理[All]")).done(function(){
		        	utilObj.showLoading($("#wrap"),"加载中");
			        $.when(page.bindGrid()).done(function(){
			            utilObj.hideLoading($("#wrap"));
			        });
		        });
	        });
        } else {
        	$("#branch").select2("destroy");
            $("#branch").html("<option>支行[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });

            $("#manager").select2("destroy");
            $("#manager").html("<option>客户经理[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });

            utilObj.showLoading($("#wrap"),"加载中");
	        $.when(page.bindGrid()).done(function(){
	            utilObj.hideLoading($("#wrap"));
	        });
        }
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
        var data = e.params.data;
        
        if(data.id != ""){
        	var sel_data = {
	            bankBranchId: $("#subsidiary").val(),
            	bankSubsetId: data.id
	        };

	        $.when(commonObj.getCustomerManager($("#manager"), sel_data, "客户经理[All]")).done(function(){
	        	utilObj.showLoading($("#wrap"),"加载中");
		        $.when(page.bindGrid()).done(function(){
		            utilObj.hideLoading($("#wrap"));
		        });
	        });
        } else {
        	$("#manager").select2("destroy");
            $("#manager").html("<option>客户经理[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });

            utilObj.showLoading($("#wrap"),"加载中");
	        $.when(page.bindGrid()).done(function(){
	            utilObj.hideLoading($("#wrap"));
	        });
        }
    });

    //客户经理下拉
    $("#manager").on("select2:select", function(e){
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
		}

		utilObj.showLoading($("#wrap"),"加载中");
		$.when(page.bindGrid()).done(function(){
			utilObj.hideLoading($("#wrap"));
		});
	});
});