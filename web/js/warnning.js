define(function(require,exports,module){
	var page = {};

	//获取查询参数
	page.getParams = function(){
		var params = {
			employeeId: utilObj.userLogined.employeeId,
			nextPage: 0,
			pageSize: 9999
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
			params.employeeId1 = $("#manager").val();
		}

		return params;
	};

	//表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/sale/findWarnning",
			data: page.getParams(),
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = page.setTableRecords(data.object.content);
				} else {
					page.records = [];
				}

				if(w2ui["Warnning"]){
					w2ui.Warnning.clear();
					w2ui.Warnning.records = page.records;
					w2ui.Warnning.refresh();
				} else {
					$("#myGrid").w2grid({
						name: "Warnning",
						total: 999,
						limit: 999,
						recordHeight: 80,
						columns: [
							{field: "step1", caption: "客户编号", size: "10%", attr: "align=center"},
							{field: "step2", caption: "客户名称", size: "20%", attr: "align=center"},
							{field: "step3", caption: "线索信息", size: "15%", attr: "align=center"},
							{field: "step4", caption: "时间节点", size: "8%", attr: "align=center"},
							{field: "step5", caption: "预警环节", size: "8%", attr: "align=center"},
							{field: "step6", caption: "停滞原因", size: "11%", attr: "align=center"},
							{field: "step7", caption: "目前工作", size: "8%", attr: "align=center"},
							{field: "step8", caption: "分支机构", size: "20%", attr: "align=center"},
							{field: "customerId", caption: "客户id", size: "1", hidden: true},
							{field: "planningId", caption: "规划id", size: "1", hidden: true}
						],
						records: page.records,
						onClick: function(event){
							var _that = this;
							event.onComplete = function(){
								var customerId = _that.get(_that.getSelection())[0].customerId;
								var planningId = _that.get(_that.getSelection())[0].planningId;
								if(utilObj.userLogined.roleId != 3 && utilObj.userLogined.roleId != 4){
									if(customerId && planningId){
										utilObj.gotoPageUri("client.html?c_id="+customerId+"&p_id="+planningId);
									}
								}								
							};
						}
					});

					//阻止默认双击
					w2ui.Warnning.on('dblClick', function(event) {
					    event.preventDefault();
					});
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

	//表格内容
	page.setTableRecords = function(table_arr){
		var arr = [];
		$.each(table_arr,function(i,v){
			arr.push({
				recid: i+1,
				step1: v.customerCode,
				step2: v.customerName,
				step3: page.setThread(v.productName,v.bizType,v.bizVolume),
				step4: v.day,
				step5: v.stage,
				step6: v.reason,
				step7: v.action,
				step8: "<span class='org-data'>"+v.bankBranchName+"</span><br /><br /><span class='org-data'>"+v.bankSubsetName+"</span>",
				customerId: v.customerId,
				planningId: v.planningId
			});
		});

		return arr;
	};

	//设置线索信息
	page.setThread = function(a,b,c){
		var str = "";
		str += (a == null ? "" : "<p>"+a+"</p>");
		str += (b == null ? "" : "<p>"+b+"</p>");
		str += (c == null ? "" : "<p>"+c+"万</p>");
		return str;
	};

/********************************************************************/

	$("#myGrid").height($("#right-main-content").height() - 50);
	commonObj.bindEvent_NavAndSearch();

	//获取数据
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.bindGrid()).done(function(){
		utilObj.hideLoading($("#wrap"));
	});

	//下拉事件
    //分行下拉选中
    $("#subsidiary").on("select2:select", function(e) {
        var data = e.params.data;
        if(data.id != ""){
        	var sel_data = {
	            parentId: data.id
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
});