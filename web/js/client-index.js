define(function(require,exports,module){
	//require("./common/date.js");
	var page = {};

	page.employeeId = utilObj.userLogined.employeeId;

	page.setParam = function(){
		var params = {
			employeeId: utilObj.userLogined.employeeId
		};
		//搜索条件
		if($("#search-input").val() != null && $.trim($("#search-input").val()).length > 0){ //关键字优先
			params.keyword = $("#search-input").select2("data")[0].text;
			params.customerId = $("#search-input").select2("data")[0].id;
		}

		return params;
	};

	//表格结构
	page.createBoardRow = function(obj,rec){
		var row = {
			recid: rec,
			customerName: "<span class='client-name' data-cid='"+obj.customerId+"' data-pid='"+obj.accountPlanningId+"'>"+page.isNull(obj.customerName)+"</span>",
			importType: page.isNull(obj.importType),
			tradeName: page.isNull(obj.tradeName),
			inCome: page.isNull(obj.inCome),
			loanAvg: page.isNull(obj.loanAvg),
			depositAvg: page.isNull(obj.depositAvg),
			planningStatus: (obj.planningStatus == "已拒绝" ? "<span class='red-text'>"+obj.planningStatus+"</span>" : "<span>"+obj.planningStatus+"</span>"),
			trackCount: page.isNull(obj.trackCount),
			finishedRate: page.isNull(obj.finishedRate)
		};

		return row;
	};

	//右侧搜索按钮
	page.setSearchBar = function(){
		// if($(".search-input").size() > 0){
		// 	$(document).on("input change",".search-input",function(){
		// 		console.log($(this).val());
		// 	});
		// }
		
		var optstr = "<option></option>";
		var search = $("#search-input").html(optstr).select2({
			width:"100%",
			language: selet2LangZh,
			placeholder: "关键字:客户,集团,行业",
			allowClear: false,
			minimumInputLength: 1,
			multiple: true,
			ajax: {
				url: utilObj.getAjaxUrl() +"m/customer/findCustomerInfo",
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

	//生成表格
	page.setBoard = function(){
		var dfd = $.Deferred();
		//请求数据
		utilObj.ajax({
			url: "m/board/findCustomerInfo",
			data: page.setParam(),
			success: function(data){
				if(data && data.object.length > 0){
					var records = [];
					_.map(data.object,function(v,i){
						var records_l1 = page.createBoardRow(v,i.toString());
						records.push(records_l1);			
					});
					
					if(w2ui["Clue"]){
						w2ui.Clue.clear();
						w2ui.Clue.records = records;
						w2ui.Clue.refresh();
					} else {
						//生成结构
						$("#myGrid").w2grid({
							name: "Clue",
							total: 10,
							limit: 200,
							recordHeight: 44,
							columns: [
								{field: "customerName", caption: "客户", size: "30%", attr: "align=center"},
								{field: "importType", caption: "类型", size: "5%", attr: "align=center"},
								{field: "tradeName", caption: "行业", size: "10%", attr: "align=center"},
								{field: "inCome", caption: "净收入<br/>(万元)", size: "10%", attr: "align=center"},
								{field: "loanAvg", caption: "日均贷款<br/>(万元)", size: "10%", attr: "align=center"},
								{field: "depositAvg", caption: "日均存款<br/>(万元)", size: "10%", attr: "align=center"},
								{field: "planningStatus", caption: "规划状态", size: "10%", attr: "align=center"},
								{field: "trackCount", caption: "线索<br/>个数", size: "7%", attr: "align=center"},
								{field: "finishedRate", caption: "落地转<br/>化率(%)", size: "7%", attr: "align=center"},
							],
							records: records
						});

						//阻止默认双击
						w2ui.Clue.on('dblClick', function(event) {
						    event.preventDefault();
						});						
					}
				} else {
					//w2alert("当前用户没有看板数据");
				}
				dfd.resolve(data);
			},
			error: function(e){
				dfd.resolve(e);
				w2alert("服务器错误");
			}
		});

		return dfd.promise();
	};

	//线索备忘结构
	page.createTradeRow = function(obj,rec){
		var row = {
			recid: rec,
			customerName: page.isNull(obj.customerName),
			trackStatus: page.cutTrackNo(obj.trackNo),
			stage: page.isNull(obj.stage),
			action: page.isNull(obj.action),
			estimateEndDate: page.isNull(obj.estimateEndDate)
		};

		return row;
	};

	//线索换行
	page.cutTrackNo = function(str){
		if(str == null || str.length == 0){
			return "";
		} else if(str.indexOf(";") > 0) {
			var new_str = "";
			$.each(str.split(";"),function(i,v){
				if(i == 2){
					new_str += "<span style='padding: 2px 0; display:block;'>"+(v*1)+"万</span>"
				} else {
					new_str += "<span style='padding: 2px 0; display:block;'>"+v+"</span>";
				}
				
			});
			return new_str;
		} else {
			return str;
		}
	};

	//生成线索备忘
	page.setTrade = function(){
		var dfd = $.Deferred();
		//请求数据
		utilObj.ajax({
			url: "m/track/findTrackMemo",
			data: page.setParam(),
			success: function(data){
				if(data && data.object.length > 0){
					var records = [];
					_.map(data.object,function(v,i){
						var records_l1 = page.createTradeRow(v,i.toString());
						records.push(records_l1);				
					});
					
					if(w2ui["Trade"]){
						w2ui.Trade.clear();
						w2ui.Trade.records = records;
						w2ui.Trade.refresh();
					} else {
						//生成结构
						$("#tradeGrid").w2grid({
							name: "Trade",
							total: 10,
							limit: 200,
							recordHeight: 64,
							columns: [
								{field: "customerName", caption: "客户", size: "40%", attr: "align=center"},
								{field: "trackStatus", caption: "线索", size: "15%", attr: "align=center"},
								{field: "stage", caption: "目前阶段", size: "15%", attr: "align=center"},
								{field: "action", caption: "具体行动", size: "15%", attr: "align=center"},
								{field: "estimateEndDate", caption: "预计完成时间", size: "15%", attr: "align=center"}
							],
							records: records
						});

						//阻止默认双击
						w2ui.Trade.on('dblClick', function(event) {
						    event.preventDefault();
						});
					} 					
				} else {

				}

				dfd.resolve(data);
			},
			error: function(e){
				dfd.resolve(e);
				utilObj.hideLoading($("#wrap"));
			}
		});

		return dfd.promise();
	};

	//行动看板左侧box
	page.setAction = function(){
		var dfd = $.Deferred();
		//请求数据
		utilObj.ajax({
			url: "m/accountPlanning/findAccountPlanBoard",
			data: page.setParam(),
			success: function(data){
				if(data && data.object.length > 0){
					$(".list-box2 > .inner-count").text(data.object[0].customerInfoList.length);
					$(".list-box2 > .inner-ul").html(template("single-li",{data:data.object[0].customerInfoList}));

					if(typeof(data.object[1]) != "undefined"){
						$(".list-box1 > .inner-count").text(data.object[1].customerInfoList.length);
						$(".list-box1 > .inner-ul").html(template("single-li",{data:data.object[1].customerInfoList}));
					}

					//右侧box内容
					/*$(".inner-right > .inner-up-box > .inner-count").text(mork_li.object2.length);
					$(".inner-right > .inner-down-box > .inner-count").text(mork_li.object3.length);					
					$(".inner-right > .inner-up-box > .inner-ul").html(template("down-li",{data:mork_li.object2}));
					$(".inner-right > .inner-down-box > .inner-ul").html(template("down-li",{data:mork_li.object3}));*/
				} else {
					//w2alert("当前用户没有行动看板数据");
				}

				dfd.resolve(data);
			},
			error: function(e){
				dfd.resolve(e);
				w2alert("服务器错误");
			}
		});

		return dfd.promise();
	};

	//销售线索预警
	page.setActionRightTop = function(){
		var dfd = $.Deferred();
		//请求数据
		utilObj.ajax({
			url: "m/sale/findWarnning4HomePage",
			data: page.setParam(),
			success: function(data){
				if(data && data.object && data.object.content.length > 0){

					//右侧box内容
					$(".list-box3 > .inner-count").text(data.object.totalElements);
					$(".list-box3 > .inner-ul").html(template("desc-li",{data:data.object.content}));									
					
				} else {
					//w2alert("当前用户没有行动看板数据");
				}

				dfd.resolve(data);
			},
			error: function(e){
				dfd.resolve(e);
				w2alert("服务器错误");
			}
		});

		return dfd.promise();
	};

	//长期未更新线索
	page.setActionRightBottom = function(){
		var dfd = $.Deferred();
		//请求数据
		utilObj.ajax({
			url: "m/sale/findNoUpdate4HomePage",
			data: page.setParam(),
			success: function(data){
				if(data && data.object && data.object.content.length > 0){

					//右侧box内容
					$(".list-box4 > .inner-count").text(data.object.totalElements);
					$(".list-box4 > .inner-ul").html(template("desc-li2",{data:data.object.content}));
				} else {
					//w2alert("当前用户没有行动看板数据");
				}

				dfd.resolve(data);
			},
			error: function(e){
				dfd.resolve(e);
				w2alert("服务器错误");
			}
		});

		return dfd.promise();
	};

	//是否为null
	page.isNull = function(val){
		return val == null ? "" : val;
	};

/************************************/

	utilObj.showLoading($("#wrap"),"正在加载");
	page.setSearchBar();
	$(".homepage-refresh-date").text("数据截止日期" + new Date().format('yyyy年MM月dd日'));
	$(".left-table-wrap").css("width",($(".wrap-content").width() - 320)+"px");
	$.when(page.setBoard(),page.setTrade(),page.setAction(),page.setActionRightTop(),page.setActionRightBottom()).done(function(){
		$("#right-content").show();
		utilObj.hideLoading($("#wrap"));
	});

	//点击搜索
	// $(document).on("click",".search-btn",function(){
	// 	utilObj.showLoading($("#wrap"),"正在加载");
	// 	$.when(page.setBoard(),page.setTrade(),page.setAction(),page.setActionRightTop(),page.setActionRightBottom()).done(function(){
	// 		$("#right-content").show();
	// 		utilObj.hideLoading($("#wrap"));
	// 	});
	// });
	//点击搜索
	$(".search-input").on("select2:select", function(e){
    	var data = e.params.data;
    	var id = data.id;
    	var pid = data.id.planningId;
    	sessionStorage.setItem('curTab', 'tab7');
    	utilObj.navigate('client', {
    		c_id: id,
    		p_id: pid?pid:'null',
    	});
   });

	//点击客户名称
	$(document).on("click",".client-name",function(){
		var cid = $(this).attr("data-cid");
		var pid = $(this).attr("data-pid");
		if(cid == "undefined" || pid == "undefined"){
			w2alert("缺少参数!");
			return false;
		} else {
			utilObj.gotoPageUri("client.html?c_id="+cid+"&p_id="+pid);
		}		
	});

	//点击已拒绝
	$(document).on("click",".list-box1 .inner-count,.list-box2 .inner-count", function(){
		utilObj.gotoPageUri("account-profile.html");
	});

	//点击已拒绝中的条目
	$(document).on("click",".list-box2 .inner-ul li,.list-box1 .inner-ul li", function(){
		var uri = "client.html?c_id="+$(this).attr("data-cid") + "&p_id="+$(this).attr("data-pid");
		utilObj.gotoPageUri(uri);
	});

	//点击销售线索预警
	$(document).on("click",".list-box3",function(){
		utilObj.gotoPageUri("warnning.html");
	});

	//点击长期未更新线索
	$(document).on("click",".list-box4",function(){
		utilObj.gotoPageUri("dashboard.html");
	});
});