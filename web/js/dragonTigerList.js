define(function(require,exports,module){
	//加载日期函数
	require("../js/common/date.js");

	var page = {};

	page.upColumns = [
		{field:"name",caption: "排名范围", size: "16%",attr: "align=center"},
		{field:"landingMoney",caption: "落地业务量(亿)", size: "16%",attr: "align=center"},
		{field:"targetMoney",caption: "意向业务量(亿)", size: "16%",attr: "align=center"},
		{field:"transferRate",caption: "落地转化率(%)", size: "16%",attr: "align=center"},
		{field:"day",caption: "营销用时(天)", size: "16%",attr: "align=center"},
		{field:"score",caption: "产能积分", size: "16%",attr: "align=center"}
	];

	page.downColumns = [
		{field:"no",caption: "排名", size: "14%",attr: "align=center"},
		{field:"name",caption: "分行排名", size: "14%",attr: "align=center"},
		{field:"landingMoney",caption: "落地业务量(亿)", size: "14%",attr: "align=center"},
		{field:"targetMoney",caption: "意向业务量(亿)", size: "14%",attr: "align=center"},
		{field:"transferRate",caption: "落地转化率(%)", size: "14%",attr: "align=center"},
		{field:"day",caption: "营销用时(天)", size: "14%",attr: "align=center"},
		{field:"score",caption: "产能积分(分)", size: "14%",attr: "align=center"},
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
			params.bankId = $("#branch").val();
		}

		//客户经理
		// if($("#manager").val() != null && $.trim($("#manager").val()).length > 0){//客户经理优先
		// 	params.employeeId1 = $("#manager").val();
		// }

		params.type = $(".tab-filter-selected").attr("data-key");
		params.startDate = $("#startDate").val();
		params.endDate = $("#endDate").val();

		return params;
	};

	//日期控件
	page.setDate = function(){
		$("#startDate").w2field("date",{
			format: "yyyy-mm-dd"
		});

		$("#endDate").w2field("date",{
			format: "yyyy-mm-dd",
			start: $("#startDate")
		});
	};

	//表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		var params = page.getParams();
		utilObj.ajax({
			url: "m/sale/findRank",
			data: params,
			success: function(data){

				//上方表格
				if(data && data.object && data.object.totallist.length > 0){
					
					if(w2ui["upTable"]){
						w2ui.upTable.clear();
						w2ui.upTable.records = page.setUpRecords(data.object.totallist);
						w2ui.upTable.refresh();
					} else {
						$("#upGrid").w2grid({
							name: "upTable",
							total: 10,
							limit: 200,
							recordHeight: 60,
							columns: page.upColumns,
							records: page.setUpRecords(data.object.totallist)
						});
					}			
				} else {
					if(w2ui["upTable"]){
						w2ui.upTable.clear();
						w2ui.upTable.refresh();
					} else {
						$("#upGrid").w2grid({
							name: "upTable",
							total: 10,
							limit: 200,
							recordHeight: 60,
							columns: page.upColumns,
							records: page.setUpRecords(data.object.totallist)
						});
					}
				}

				//下方表格
				if(data && data.object && data.object.list.length > 0){
					if(w2ui["downTable"]){
						w2ui.downTable.clear();
						w2ui.downTable.columns = page.downColumns;
						w2ui.downTable.records = page.setDownRecords(data.object.list);
						w2ui.downTable.refresh();
					} else {
						$("#myGrid").w2grid({
							name: "downTable",
							total: 10,
							limit: 200,
							recordHeight: 60,
							columns: page.downColumns,
							records: page.setDownRecords(data.object.list)
						});
					}
				} else {
					if(w2ui["downTable"]){
						w2ui.downTable.clear();
						w2ui.downTable.columns = page.downColumns;
						w2ui.downTable.refresh();
					} else {
						$("#myGrid").w2grid({
							name: "downTable",
							total: 10,
							limit: 200,
							recordHeight: 60,
							columns: page.downColumns,
							records: page.setDownRecords(data.object.list)
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

	//生成上方表格内容
	page.setUpRecords = function(arr_obj){
		var records = [];
		$.each(arr_obj,function(i,v){
			records.push({
				recid: i,
				name: v.name,
				landingMoney: v.landingMoney,
				targetMoney: v.targetMoney,
				transferRate: v.transferRate,
				day: v.day,
				score: v.score
			});
		});

		return records;
	};

	//生成下方表格内容
	page.setDownRecords = function(arr_obj){
		var records = [];
		$.each(arr_obj,function(i,v){
			records.push({
				recid: i,
				no: v.no,
				name: v.name,
				landingMoney: v.landingMoney,
				targetMoney: v.targetMoney,
				transferRate: v.transferRate,
				day: v.day,
				score: v.score
			});
		});

		return records;
	};

	//季度设置
	page.setSeason = function(){
		var curr_month = Date.today().getMonth();
		var startDate = null,
			endDate = null;
		switch(curr_month){
			case 0: 
				startDate = Date.today().moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(2).moveToLastDayOfMonth().toString("yyyy-MM-dd");
					break;
			case 1: 
				startDate = Date.today().moveToMonth(0,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(2).moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 2:
				startDate = Date.today().moveToMonth(0,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 3: 
				startDate = Date.today().moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(5).moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 4: 
				startDate = Date.today().moveToMonth(3,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(5).moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 5: 
				startDate = Date.today().moveToMonth(3,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 6: 
				startDate = Date.today().moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(8).moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 7: 
				startDate = Date.today().moveToMonth(6,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(8).moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 8: 
				startDate = Date.today().moveToMonth(6,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 9: 
				startDate = Date.today().moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(11).moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 10: 
				startDate = Date.today().moveToMonth(9,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToMonth(11).moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
			case 11: 
				startDate = Date.today().moveToMonth(9,-1).moveToFirstDayOfMonth().toString("yyyy-MM-dd");
				endDate = Date.today().moveToLastDayOfMonth().toString("yyyy-MM-dd");
				break;
		}

		// console.log(startDate);
		// console.log(endDate);

		$("#startDate").val(startDate);
		$("#endDate").val(endDate);
	};

/********************************************************************/

	$("#myGrid").height($("#right-main-content").height() - 50);
	commonObj.bindEvent_NavAndSearch();
	page.setDate();
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.bindGrid()).done(function(){
 		utilObj.hideLoading();
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
	        	utilObj.showLoading($("#wrap"),"加载中");
		        $.when(page.bindGrid()).done(function(){
		            utilObj.hideLoading($("#wrap"));
		        });
	        });
        } else {
        	$("#branch").select2("destroy");
            $("#branch").html("<option>支行[All]</option>").select2({
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
    // $("#manager").on("select2:select", function(e){
    //     utilObj.showLoading($("#wrap"),"加载中");
    //     $.when(page.bindGrid()).done(function(){
    //         utilObj.hideLoading($("#wrap"));
    //     });
    // });

    //日期选择
    $(document).on("change","#endDate",function(){
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
			page.downColumns[1].caption = ($(this).attr("data-key") == "BANK_BRANCH" ? "分行排名" : ($(this).attr("data-key") == "BANK_SUBSET" ? "支行排名" : "客户经理排名"));
			utilObj.showLoading($("#wrap"),"加载中");
			$.when(page.bindGrid()).done(function(){
				utilObj.hideLoading();
			});
		}
	});

	//顶部按钮
	$(document).on("click",".top-btn-wrap",function(){
		if($(this).hasClass("top-btn-selected")){
			return false;
		} else {
			$(this).addClass("top-btn-selected").siblings(".top-btn-wrap").removeClass("top-btn-selected");
			var months = $(this).attr("data-month-range");
			if(months == "1"){
				$("#startDate").val(Date.today().moveToFirstDayOfMonth().format("yyyy-MM-dd"));
				$("#endDate").val(Date.today().moveToLastDayOfMonth().format("yyyy-MM-dd"));
			} else {
				page.setSeason();
			}

			utilObj.showLoading($("#wrap"),"加载中");
			$.when(page.bindGrid()).done(function(){
				utilObj.hideLoading();
			});
		}
	});
});