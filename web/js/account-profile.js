define(function(require,exports,module){
	var page = {};

	//获取查询参数
	page.getParams = function(){
		var params = {
			employeeId: utilObj.userLogined.employeeId
		};

		//搜索条件
		if($("#search-input").val() != null && $.trim($("#search-input").val()).length > 0){ //关键字优先
			params.keyword = $("#search-input").select2("data")[0].text;
			params.customerId = $("#search-input").select2("data")[0].id;
		} 

		if($("#branch").val() != null && $.trim($("#branch").val()).length > 0){//支行优先
			params.bankId = $("#branch").val();
		} else if($("#subsidiary").val() != null && $.trim($("#subsidiary").val()).length > 0){ //未选支行
			params.bankId = $("#subsidiary").val();
		}

		//客户经理
		if($("#manager").val() != null && $.trim($("#manager").val()).length > 0 && $("#manager").val() != "客户经理[All]"){//客户经理优先
			params.employeeId = $("#manager").val();
		} else {
			params.employeeId = utilObj.userLogined.employeeId;
		}

		//状态
		if($(".tab-filter-selected").attr("data-key") == "finished"){
			params.planningStatus = 5;			
		} else if($(".tab-filter-selected").attr("data-key") == "doing") {
			params.planningStatus = 1;
		} else {
			params.planningStatus = 0;
		}

		params.completeDate = $("#estimate").select2("data")[0].id;

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

                if(utilObj.userLogined.roleId == 1 || utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7){
                	$(".date-select").css("margin-left","0");
                }

               	dfd.resolve(data);
			}
		});

		return dfd.promise();
	};

	//右侧搜索按钮
	page.setSearchBar = function(){
		var optstr = "<option></option>";
		$("#search-input").html(optstr).select2({
			width:"100%",
			language: selet2LangZh,
			placeholder: "关键字:客户,集团,行业",
			allowClear: true,
			minimumInputLength: 1,
			ajax: {
				url: "http://mckinsey2.3tichina.com/service/m/customer/findCustomerInfo",
				type: "POST",
				dataType: "json",
				data: function(params){
					return {
						keyword: params.term,
						token: utilObj.token,
						employeeId: page.employeeId
					};
				},
				processResults: function(data){
					var _data = [];
					if(data && data.object.length > 0){
						$.each(data.object, function(i,v){
							_data.push({
								id: v.customerId,
								text: v.customerName
							});
						});
					} 
					return {
						results: _data
					};
				},
				cache: true
			}
		});
	};

	//表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		var params = page.getParams();
		utilObj.ajax({
			url: "m/customer/findCustomerAccount",
			data: params,
			success: function(data){
				if(data && data.object.length > 0){
					var columns = [];
					var hide_manager = utilObj.userLogined.roleId == 1 ? true : false;
					if(params.planningStatus == 5){
						columns = [
							{field: "customerCode", caption: "客户编号", size: "20%", attr: "align=center"},
							{field: "customerName", caption: "客户名称", size: "40%", attr: "align=center"},
							{field: "createDate", caption: "创建日期", size: "10%", attr: "align=center"},
							{field: "completeDate", caption: "完成时间", size: "10%", attr: "align=center"},
							{field: "employeeName", caption: "客户经理", size: "10%", attr: "align=center", hidden: hide_manager},
							{field: "option", caption: "操作", size: "10%", attr: "align=center"},
							{field: "companyName", caption: "集团", size: "1%", attr: "align=center", hidden: true},
							{field: "trade", caption: "行业", size: "1%", attr: "align=center", hidden: true}
						];
					} else {
						columns = [
							{field: "customerCode", caption: "客户编号", size: "20%", attr: "align=center"},
							{field: "customerName", caption: "客户名称", size: "40%", attr: "align=center"},
							{field: "employeeName", caption: "客户经理", size: "10%", attr: "align=center", hidden: hide_manager},
							{field: "planningStatusName", caption: "状态", size: "10%", attr: "align=center"},
							{field: "description", caption: "说明", size: "10%", attr: "align=center"},
							{field: "option", caption: "操作", size: "10%", attr: "align=center"},
							{field: "companyName", caption: "集团", size: "1%", attr: "align=center", hidden: true},
							{field: "trade", caption: "行业", size: "1%", attr: "align=center", hidden: true}
						];
					}

					//var records = page.setRecords(data.object);
					if(w2ui["gailan"]){
						w2ui.gailan.clear();
						w2ui.gailan.columns = columns;
						w2ui.gailan.records = page.setRecords(data.object,params);
						w2ui.gailan.refresh();
					} else {
						$("#myGrid").w2grid({
							name: "gailan",
							total: 10,
							limit: 200,
							recordHeight: 60,
							show: {
								toolbar: true,
								toolbarReload: false,
								toolbarColumns: false,
								toolbarSearch: false,
								recordTitles: false
							},
							multiSearch: true,
							searches: [
								{field: "customerCode",caption: "客户编号",type:"text",operator: "contains"},
								{field: "customerName",caption: "客户名称",type:"text",operator: "contains"},
								{field: "companyName",caption: "集团",type:"text",operator: "contains"},
								{field: "trade",caption:"行业",type:"text",operator: "contains"},
								{field: "all",caption: "客户,集团,行业",type:"text",operator: "contains"}
							],
							columns: columns,
							records: page.setRecords(data.object,params)
						});
					}					
				} else {
					var columns = [];
					var hide_manager = utilObj.userLogined.roleId == 1 ? true : false;
					if(w2ui["gailan"]){
						w2ui.gailan.clear();
						w2ui.gailan.refresh();
					} else {
						$("#myGrid").w2grid({
							name: "gailan",
							total: 10,
							limit: 200,
							recordHeight: 60,
							show: {
								toolbar: true,
								toolbarReload: false,
								toolbarColumns: false,
								toolbarSearch: false,
								recordTitles: false
							},
							multiSearch: true,
							searches: [
								{field: "customerCode",caption: "客户编号",type:"text"},
								{field: "customerName",caption: "客户名称",type:"text"},
								{field: "companyName",caption: "集团",type:"text"},
								{field: "trade",caption:"行业",type:"text"},
								{field: "all",caption: "客户,集团,行业",type:"text"}
							],
							columns: columns,
							records: page.setRecords(data.object,params)
						});
					}
				}

				dfd.resolve(data);
			}
		});

		return dfd.promise();
	};

	//生成表格内容
	page.setRecords = function(arr_obj,params){
		/*
			流程状态 planningStatus
			未提交: 0
			已提交: 1
			团队审批: 2
			审核完成: 3
			已拒绝: 4
			已完成: 5


			用户角色  utilObj.userLogined.roleId
			客户经理: 1
			总行行长: 3
			分行行长: 4
			支行行长: 5
			产品经理: 6
			信审经理: 7
		*/
		var records = [];
		$.each(arr_obj, function(i,v){
			var rec_obj = {
				recid: i,
				customerCode: v.customerCode,
				customerName: v.customerName
			};
			if(params.planningStatus == 5){
				rec_obj.createDate = v.createDate;
				rec_obj.completeDate = v.completeDate;
				rec_obj.option = "<div class='redirect-uri green_text' data-id='"+v.customerId+"' data-planning='"+v.planningId+"'>查看</div>";
			}

			if(utilObj.userLogined.roleId != 1){ //支行行长显示客户经理信息
				rec_obj.employeeName = v.employeeName;
			}

			var class_txt = "";
			var opt_class = "";
			var opt_txt = "";

			//不同角色显示样式不同
			if(utilObj.userLogined.roleId == 1){ //客戶经理

				if(page.currFilterStatus == "waiting"){
					class_txt = "default_text";
					opt_class = "redirect-uri green_text createPlanning";
					opt_txt = "新建规划";
				} else if(page.currFilterStatus == "doing"){
					class_txt = v.planningStatus == "4" ? "red_text" : "default_text";
					opt_class = "redirect-uri edit_text";
					opt_txt = "编辑";
				} else {
					class_txt = "default_text";
					opt_class = "redirect-uri green_text";
					opt_txt = "查看";
				}
			
			} else if(utilObj.userLogined.roleId == 5){//支行行长
				if(page.currFilterStatus == "waiting"){
					class_txt = "default_text";
					opt_class = "redirect-uri green_text";
					opt_txt = "查看";
				} else if(page.currFilterStatus == "doing"){
					class_txt = v.planningStatus == "2" ? "red_text" : "default_text";
					opt_class = "redirect-uri " + (v.planningStatus == "2" ? "edit_text" : "green_text");
					opt_txt = v.planningStatus == "2" ? "审批" : "查看";
				} else {
					class_txt = "default_text";
					opt_class = "redirect-uri green_text";
					opt_txt = "查看";
				}

			} else if(utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7){//产品经理/信审经理
				if(page.currFilterStatus == "waiting"){
					class_txt = "default_text";
					opt_class = "redirect-uri green_text";
					opt_txt = "查看";
				} else if(page.currFilterStatus == "doing"){
					class_txt = v.planningStatus == "1" ? "red_text" : "default_text";
					opt_class = "redirect-uri " + (v.planningStatus == "1" ? "edit_text" : "green_text");
					opt_txt = v.planningStatus == "1" ? "审批" : "查看";
				} else {
					class_txt = "default_text";
					opt_class = "redirect-uri green_text";
					opt_txt = "查看";
				}
			}

			rec_obj.planningStatusName = "<div class='"+ class_txt +"'>" + v.planningStatusName + "</div>";
			rec_obj.description = "<div class='"+ class_txt +"'>" + v.description + "</div>";
			rec_obj.option = "<div class='"+ opt_class +"' data-id='"+v.customerId+"' data-planning='"+v.planningId+"'>" + opt_txt + "</div>";
			rec_obj.companyName = v.companyName;
			rec_obj.trade = v.level3;

			records.push(rec_obj);
		});

		return records;
	};

	//新建规划
	page.createPlanning = function(cid){
		var dfd = $.Deferred();
		utilObj.showLoading($("#wrap"),"正在新建...");
		utilObj.ajax({
			url: "m/accountPlanning/creatAccountPlanning",
			data: {customerId: cid,employeeId:utilObj.userLogined.employeeId,year:$("#estimate").val()},
			success: function(data){
				if(data && data.object){
					utilObj.hideLoading();
					utilObj.gotoPageUri("client.html?c_id="+cid+"&p_id="+data.object.accountPlanningId);
				} else {
					w2alert("数据新建失败");
				}

				dfd.resolve(data);
			},
			error: function(e){
				utilObj.hideLoading();
				dfd.resolve(e);
			}
		});

		return dfd.promise();
	};

/********************************************************************/

	$("#myGrid").height($("#right-main-content").height() - 50);
	commonObj.bindEvent_NavAndSearch();
	page.setSearchBar();
	utilObj.showLoading($("#wrap"),"加载中");
	page.currFilterStatus = $(".tab-filter-selected").attr("data-key");
	$.when(page.setYearList()).done(function(){
		$.when(page.bindGrid()).done(function(){
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
	        commonObj.getBankSelect($("#branch"), sel_data, "支行[All]");
        } else {
        	$("#branch").select2("destroy");
            $("#branch").html("<option>支行[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });
        }

        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
        var data = e.params.data;

        if(data.id != ""){
        	var sel_data = {
	            bankBranchId: $("#subsidiary").val(),
            	bankSubsetId: data.id
	        };
	        commonObj.getCustomerManager($("#manager"), sel_data, "客户经理[All]");
        } else {
        	$("#manager").select2("destroy");
            $("#manager").html("<option>客户经理[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });
        }

        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //客户经理下拉
    $("#manager").on("select2:select", function(e){
        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //日期下拉
    $("#estimate").on("select2:select", function(e){
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
			$(this).attr("data-key") == "waiting" ? $(".right-create").show() : $(".right-create").hide();
			w2ui["gailan"].searchReset();
			page.currFilterStatus = $(this).attr("data-key");

			utilObj.showLoading($("#wrap"),"加载中");

			$.when(page.bindGrid()).done(function(){
				utilObj.hideLoading();
			});
		}
	});

	//搜索
	$(document).on("click", ".search-btn", function(){
    	utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

	//编辑/查看/新建
	$(document).on("click",".redirect-uri",function(){
		if($(this).hasClass("createPlanning")){
			if(utilObj.userLogined.roleId == 1){
				var id = $(this).attr("data-id");
				page.createPlanning(id);
			} else {
				var id = $(this).attr("data-id");
				var p_id = $(this).attr("data-planning");
				utilObj.gotoPageUri("client.html?c_id="+id+"&p_id="+(p_id == "" ? null : p_id));
			}
			
		} else {
			var id = $(this).attr("data-id");
			var p_id = $(this).attr("data-planning");
			utilObj.gotoPageUri("client.html?c_id="+id+"&p_id="+(p_id == "" ? null : p_id));
		}
	});
});