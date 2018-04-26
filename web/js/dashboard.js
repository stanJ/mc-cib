define(function(require,exports,module){
	require("./common/date.js");

	var page = {};

	//获取查询参数
	page.getParams = function(){
		var params = {
			employeeId: utilObj.userLogined.employeeId
		};

		//搜索条件
		if($("#branch").val() != null && $.trim($("#branch").val()).length > 0){//支行优先
			params.bankId = $("#branch").val();
		} else if($("#subsidiary").val() != null && $.trim($("#subsidiary").val()).length > 0){ //未选支行
			params.bankId = $("#subsidiary").val();
		}

		//搜索关键字
		if($("#search-input").val() != null && $.trim($("#search-input").val()).length > 0){
			params.keyword = $("#search-input").select2("data")[0].text;
			params.customerId = $("#search-input").select2("data")[0].id;
		}

		//客户经理
		if($("#manager").val() != null && $.trim($("#manager").val()).length > 0 && $("#manager").val() != "客户经理[All]"){//客户经理优先
			params.employeeId = $("#manager").val();
		} else {
			params.employeeId = utilObj.userLogined.employeeId;
		}

		//步骤
		var filter_arr = [];
		$.each($(".filter-selected"), function(i,v){
			filter_arr.push($(v).attr("data-configvalue"));
		});

		if(filter_arr.length == 0){
			$.each($(".filter-item"), function(i,v){
				if($(v).attr("data-configvalue") != "RENVENUE"){
					filter_arr.push($(v).attr("data-configvalue"));
				}
			});
		}
		
		params.step = filter_arr.join(",");

		return params;
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

	//步骤显示
	page.setStep = function(){
		var param = page.getParams();
		utilObj.showLoading($("#wrap"),"加载中...");
		utilObj.ajax({
			url: "m/track/findStep",
			data: param,
			success: function(data){
				if(data && data.object.length > 0){
					$(".filter-wrap").html(template("filter-item",{data: data.object}));
					$(".clue-wrap").html(template("clue-item",{data: data.object}));

					if(url("?")){
						$(".filter-item[data-configvalue="+ url("?").stepFilter +"]").addClass("filter-selected");
					}

					//构建表格
					page.setTable();
				}
			},
			error: function(e){
				w2alert(e.message);
				utilObj.hideLoading();
			}
		});
	};

	//访问客户下拉项
	page.getVisitList = function(){
		utilObj.ajax({
			url: "m/sysConfig/findList",
			data: {type: "CUSTOMER_VISIT"},
			success: function(data){
				page.visitList = [];
				if(data && data.object.length > 0){
					$.each(data.object, function(i,v){
						page.visitList.push({
							id: v.configValue,
							text: v.configName
						});
					});
				}
			},
		});
	};

	//根据不同权限/步骤生成不同操作
	page.setOption = function(obj,rec){
		var config = {
			_option: "",
			_backup: ""
		};

		var finsh_class = "finish-btn" + (obj.trackStatusCode == "6" ? " gray-btn" : "");
		var edit_class = "edit-btn" + (obj.trackStatusCode == "6" ? " gray-btn" : "");

		if(utilObj.userLogined.roleId == 5 || utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7 || obj.stageCode == "RENVENUE" || obj.trackStatusCode == "6"){
			config._backup = "<div class='backup-btn' data-recId='" + rec + "' data-trackId='" + obj.trackId + "' data-edit-status='0'>查看</div>";
			config._option = [
				"<div class='opt-wrap'>",
				obj.children.length > 0 ? "<span class='dropdown-btn down-arrow' data-trackId='" + obj.trackId + "' data-recid='" + rec + "' data-track-status-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>展开</span>" : "<span class='empty-btn'>&nbsp;&nbsp;&nbsp;&nbsp;</span>",
				"</div>"
			].join("");
		} else {
			config._backup = "<div class='backup-btn' data-recId='" + rec + "' data-trackId='" + obj.trackId + "' data-edit-status='1'>备注</div>";
			config._option = [
				"<div class='opt-wrap'>",
				"	<span class='"+edit_class+"' data-recId='"+rec+"' data-trackId='" + obj.trackId + "' data-track-status-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>跟进</span>",
				"	<span class='"+finsh_class+"' data-recId='"+rec+"' data-trackId='" + obj.trackId + "' data-track-status-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>终止</span>",
				obj.children.length > 0 ? "<span class='dropdown-btn down-arrow' data-trackId='" + obj.trackId + "' data-recid='" + rec + "' data-track-status-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>展开</span>" : "<span class='empty-btn'>&nbsp;&nbsp;&nbsp;&nbsp;</span>",
				"</div>"
			].join("");
		}

		return config;
	};

	//一级表格结构
	page.createRow = function(ori,obj,rec){

		//支行行长不跟进和终止备注只能查看
		var config = page.setOption(obj,rec);

		//构建结构
		var row = {
			recid: rec,
			client: "",
			trackNo: (obj.trackNo == null ? "" : page.cutTrackNo(obj.trackNo)),
			action: obj.action,
			estimateEndDate: obj.estimateEndDate,
			visitClient: obj.visitClient,
			trackStatus: page.setTrackColor(obj),
			probability: obj.probability == null ? "" : obj.probability+"%",
			stage: obj.stage,
			backup: config._backup,
			employeeName: obj.employeeName,
			option: config._option,
			trackStatusCode: obj.trackStatusCode,
			stageCode: obj.stageCode,
			amount: obj.amount,
			landingTime: obj.landingTime,
			customerName: obj.customerName,
			benchmark: obj.benchmark,
			trade: ori.trade,
			level1: ori.level1,
			level2: ori.level2,
			level3: ori.level3
		};

		if(obj.children.length > 0){
			row.w2ui = {
				children: page.createSubRow(ori,obj.children,obj,rec)
			}
		}

		return row;
	};

	//已落后的标红
	page.setTrackColor = function(obj){
		if(obj.trackStatusCode == -1){
			return "<span class='red-statis'>"+obj.trackStatus+"</span>";
		} else {
			return "<span>"+obj.trackStatus+"</span>";
		}
	};

	//二级表格结构
	page.createSubRow = function(ori,arr,parent,rec){
		var sub_row = [];
		_.map(arr, function(v,i){

			var _backup = "";
			if(utilObj.userLogined.roleId == 5 || utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7 || parent.stageCode == "RENVENUE" || parent.trackStatusCode == "6"){
				_backup = "<div class='backup-btn' data-recId='" + rec + "' data-trackId='" + v.trackId + "' data-edit-status='0'>查看</div>";
			} else {
				_backup = "<div class='backup-btn' data-recId='" + rec + "' data-trackId='" + v.trackId + "' data-edit-status='0'>备注</div>"
			}

			var row = {
				recid: rec+i,
				trackNo: (v.trackNo == null ? "" : page.cutTrackNo(v.trackNo)),
				action: v.action,
				estimateEndDate: v.estimateEndDate,
				visitClient: v.visitClient,
				trackStatus: v.trackStatus,
				probability: v.probability == null ? "" : v.probability+"%",
				stage: v.stage,
				backup: _backup,
				employeeName: v.employeeName,
				w2ui: {"style": "background-color: rgb(240,240,240)"},
				trackStatusCode: v.trackStatusCode,
				customerName: v.customerName,
				trade: ori.trade,
				level1: ori.level1,
				level2: ori.level2,
				level3: ori.level3
			};
			sub_row.push(row);
		});
		
		return sub_row;
	};

	//分割线索
	page.cutTrackNo = function(str){
		var cut_str = "";
		$.each(str.split(";"),function(i,v){
			if(i == 2){
				cut_str += "<span class='track-cut'>"+v*1+"万元</span>";
			} else {
				cut_str += "<span class='track-cut'>"+v+"</span>";
			}
			
		});
		return cut_str;
	};

	//生成表格
	page.setTable = function(){
		utilObj.showLoading($("#wrap"),"加载中...",true);
		//请求数据
		utilObj.ajax({
			url: "m/track/findTrack",
			data: page.getParams(),
			success: function(data){
				var records = [];
				if(data && data.object.length > 0){					
					_.map(data.object,function(v,i){
						var records_l1 = {
							recid: i.toString(),
							client: "<span class='level1-client-show'>" + v.customerName + "</span>",
							customerName: v.customerName,
							trade: v.trade,
							level1: v.level1,
							level2: v.level2,
							level3: v.level3
						};

						records.push(records_l1);

						_.map(v.items, function(v1,i1){
							var records_l2 = page.createRow(v,v1,i.toString()+i1.toString());
							records.push(records_l2);
						});
						
					});
					
				} else {
					records = [];
				}

				if(w2ui["Clue"]){
					w2ui.Clue.clear();
					w2ui.Clue.records = records;
					w2ui.Clue.refresh();
				} else {
					//支行行长显示客户经理列
					var show_columns = true;
					if(utilObj.userLogined.roleId == 5){
						show_columns = false;
					}

					//生成结构
					$("#myGrid").w2grid({
						name: "Clue",
						total: 10,
						limit: 200,
						markSearch: false,
						recordHeight: 84,
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
							{field: "level1", caption: "行业", type:"text",operator: "contains"},
							{field: "level2", caption: "行业", type:"text",operator: "contains"},
							{field: "level3", caption: "行业", type:"text",operator: "contains"},
							{field: "all",caption: "客户,集团,行业",type:"text",operator: "contains"}
						],
						columns: [
							{field: "client", caption: "", size: "1%", attr: "align=center"},
							{field: "trackNo", caption: "线索", size: "10%", attr: "align=center"},
							{field: "action", caption: "具体新行动", size: "5%", attr: "align=center"},
							{field: "estimateEndDate", caption: "预计完成时间", size: "5%", attr: "align=center"},
							{field: "visitClient", caption: "拜访客户", size: "5%", attr: "align=center"},
							{field: "trackStatus", caption: "目前状态", size: "5%", attr: "align=center"},
							{field: "probability", caption: "成功概率", size: "5%", attr: "align=center"},
							{field: "stage", caption: "目前阶段", size: "5%", attr: "align=center"},
							{field: "backup", caption: "备注", size: "5%", attr: "align=center"},
							{field: "employeeName", caption: "客户经理", size: "5%", attr:"align=center", hidden: show_columns},
							{field: "option", caption: "操作", size: "10%", attr: "align=center"},
							{field: "trackStatusCode",caption: "",size:"1%",hidden: true},
							{field: "stageCode",caption:"",size:"1%",hidden: true},
							{field: "amount",caption:"",size:"1%",hidden:true},
							{field: "landingTime",caption:"",size:"1%",hidden:true},
							{field: "companyName", caption: "集团", size: "1%", attr: "align=center", hidden: true},
							{field: "trade", caption: "行业", size: "1%", attr: "align=center", hidden: true},
							{field: "level1", caption: "行业", size: "1%", attr: "align=center", hidden: true},
							{field: "level2", caption: "行业", size: "1%", attr: "align=center", hidden: true},
							{field: "level3", caption: "行业", size: "1%", attr: "align=center", hidden: true},
							{field: "customerName", caption: "客户", size: "1%", attr: "align=center", hidden: true},
							{field: "benchmark", caption: "基准天数", size: "1%", attr: "align=center", hidden: true}
						],
						records: records,
						onRender: function(event){
							event.onComplete = function(){
								setTimeout(function(){
									$(".level1-client-show").parents(".w2ui-grid-data").attr("colspan","10");
								},10);
							};
						},
						onRefresh: function(event){
							event.onComplete = function(){
								setTimeout(function(){
									$(".level1-client-show").parents(".w2ui-grid-data").attr("colspan","10");
								},10);
							};
						}
					});

					//阻止默认双击
					w2ui.Clue.on('dblClick', function(event) {
					    event.preventDefault();
					});
				}

				utilObj.hideLoading($("#wrap"));
			},
			error: function(e){
				utilObj.hideLoading($("#wrap"));
			}
		});
	};

	//备注弹框
	page.popupBackup = function(rec,trackId,edit_status){
		if(w2ui.Clue.get(rec).trackNo){
			var clue_obj = w2ui.Clue.get(rec);
			//ajax请求
			utilObj.showLoading($("#wrap"),"加载中...");
			utilObj.ajax({
				url: "m/track/findTrackLog",
				data: {trackId: trackId},
				success: function(data){
					var tmp = template('backup-box',{data:data.object,trackId:trackId,showStatus: edit_status});
					if(w2ui["Backup"]){
						w2ui.Backup.clear();
						w2ui.Backup.formHTML = tmp;
						w2ui.Backup.refresh();
					} else {
						page.clue_obj = w2ui.Clue.get(rec);
						page.createForm(tmp,"Backup");
					}
					var popup_height = edit_status == 1 ? 420 : 320;
					page.openPopup('线索名称: ' + clue_obj.trackNo,"popupBck","Backup",480,popup_height);
					utilObj.hideLoading();
				},
				error: function(e){
					w2alert("数据请求失败");
					utilObj.hideLoading();
				}
			});
		} else {
			w2alert('数据不完整，无法显示备注');
			return false;
		}
	};

	//保存备注
	page.saveBack = function(t_data){
		utilObj.showLoading($("#wrap"),"数据提交");
		utilObj.ajax({
			url: "m/track/saveTrackLog",
			data: t_data,
			success: function(data){
				utilObj.hideLoading();
				if(data){
					page.setTable();
				} else {
					w2alert("备注提交失败");
				}
				
			},
			error: function(e){
				utilObj.hideLoading();
				w2alert("服务器错误");
			}
		});
	};

	//跟进弹框
	page.popupTrack = function(rec,trackId,stageCode,trackStatusCode){
		page.clue_obj = w2ui.Clue.get(rec);
		var tmp = template("track-box",{data: page.clue_obj,recid:rec,trackId:trackId,stageCode:stageCode,trackStatusCode:trackStatusCode});
		if(w2ui["Track"]){
			w2ui.Track.clear();
			w2ui.Track.formHTML=tmp;
			w2ui.Track.refresh();
		} else {
			page.createForm(tmp,"Track");
		}
		page.openPopup('工作纪要: '+page.clue_obj.stage,"popupTrack","Track",520,520);	
	};

	//保存跟进
	page.saveTrack = function(save_data){
		utilObj.showLoading($("#wrap"),"提交中...");
		utilObj.ajax({
			url: "m/track/saveTrack",
			data: save_data,
			success: function(data){
				if(save_data.isFinish == 1 && save_data.stageCode == "DECLARATION"){
					location.reload();
				} else {
					page.setTable();
					utilObj.hideLoading();
				}				
			},
			error: function(e){
				w2alert("服务器错误");
				utilObj.hideLoading();
			}
		});
	};

	//终止弹框
	page.popupFinality = function(rec,trackId){
		var tmp = template("finality-box",{recid:rec,trackId:trackId});
		page.clue_obj = w2ui.Clue.get(rec);
		if(w2ui["Finality"]){
			w2ui.Finality.clear();
			w2ui.Finality.formHTML=tmp;
			w2ui.Finality.refresh();
		} else {
			page.createForm(tmp,"Finality");
		}
		page.openPopup('项目终止',"popupFinality","Finality",480,250); 
	};

	//保存终止原因
	page.saveFinality = function(finality_data){
		utilObj.showLoading($("#wrap"),"提交中...");
		utilObj.ajax({
			url: "m/track/saveTrackFinsh",
			data: finality_data,
			success: function(data){
				utilObj.hideLoading();
				if(data){
					w2alert("终止完成");
					page.setTable();
				} else {
					w2alert("终止失败");
				}
			},
			error: function(e){
				w2alert("服务器错误");
				utilObj.hideLoading();
			}
		});
	}

	//弹框内容
	page.createForm = function(tmp,name){
		$().w2form({
            name: name,
            style: 'border: 0px; background-color: transparent;',
            formHTML: tmp,
            actions: {
                // save: function () {
                // 	this.clear();
                // },
                reset: function () { 
                	this.clear();
                	w2popup.close();
                }
            },
            onRender: function(event){
            	event.onComplete = function(){
            		$("#percent").parent("div").css("position","relative");
            		$("#percent").w2field("percent",{
            			min: 1,
            			max: 100
            		});

            		$("#amount").w2field("money",{
            			currencyPrefix    : "",
			            currencySuffix    : "万元",
			            currencyPrecision : 0,
			            groupSymbol       : ",",
			            decimalSymbol     : ".",
            		});

            		if(page.clue_obj.visitClient == "电话"){
            			$("input[name='visit']").eq(0).prop("checked","true");
            		} else if(page.clue_obj.visitClient == "会议"){
            			$("input[name='visit']").eq(1).prop("checked","true");
            		} else {
            			$("input[name='visit']").eq(2).prop("checked","true");
            		}

            		w2ui[name].reload();
            	};
            }
        });
	};
	
	//完成阶段Form
	page.createFinishedForm = function(tmp,name){
		$().w2form({
            name: name,
            style: 'border: 0px; background-color: transparent;',
            formHTML: tmp,
            actions: {
                reset: function () { 
                	this.clear();
                	w2popup.close();
                }
            },
            onRender: function(event){
            	event.onComplete = function(){
            		$("#finish-date").w2field("date",{
            			format:"yyyy-mm-dd",
            			start: Date.today().addDays(-3).toString("yyyy-MM-dd"),
            			end: Date.today().addDays(3).toString("yyyy-MM-dd")
            		}).attr("placeholder","请选择日期");
            	};
            }
        });
	};

	//弹框结构
	page.openPopup = function(title,popId,name,width,height){
		$().w2popup('open', {
	        title   : title,
	        body    : '<div id="'+popId+'" style="width: 100%; height: 100%;"></div>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : width,//480
	        height  : height,//420 
	        showClose: false,
	        onOpen: function (event) {
	            event.onComplete = function () {
	                $('#w2ui-popup #'+popId).w2render(name);
	                if(name == "Track"){
	            		$("#estimate").w2field("date", {
	            			format: "yyyy-mm-dd",
	            			start: Date.today().addDays(1).toString("yyyy-MM-dd")
	            		}).attr("placeholder","请选择日期");	            		
	            	}
	            }
	        }
	    });
	};

	//验证输入框
	page.validateInput = function(stageCode,trackStatusCode){

		//不是额度申报状态，勾不勾选都要验证
		if(stageCode != "DECLARATION"){
			if($.trim($("#action").val()).length == 0){
				$("#action").focus();
				return false;
			}

			if($.trim($("#estimate").val()).length == 0){
				$("#estimate").focus();
				return false;
			}

			// if(!$("#visit").w2field().get("selected").id){
			// 	$("#visit").focus();
			// 	return false;
			// }

			if($.trim($("#percent").val().replace(/%/g,"")).length == 0){
				$("#percent").focus();
				return false;
			}
		} else if(!$("#if_finished").prop("checked")){ //额度申报状态，未勾选已完成也要验证
			if($.trim($("#action").val()).length == 0){
				$("#action").focus();
				return false;
			}

			if($.trim($("#estimate").val()).length == 0){
				$("#estimate").focus();
				return false;
			}

			// if(!$("#visit").w2field().get("selected").id){
			// 	$("#visit").focus();
			// 	return false;
			// }

			if($.trim($("#percent").val().replace(/%/g,"")).length == 0){
				$("#percent").focus();
				return false;
			}
			if($.trim($("#amount").val()).length == 0){
				$("#amount").focus();
				return false;
			}
		} else {
			if($.trim($("#amount").val()).length == 0){
				$("#amount").focus();
				return false;
			}
		}

		// if(trackStatusCode == "-1" && $.trim($("#remark").val()).length == 0){
		// 	$("#remark").focus();
		// 	return false;
		// }

		return true;		
	};

	page.checkPopupMessage = function(trackStatusCode){

		if($.trim($("#finish-date").val()).length == 0){
			return false;
		}

		if(trackStatusCode == "-1" && $.trim($("#remark").val()).length == 0){
			$("#remark").focus();
			return false;
		}

		return true
	};

	//发送完成阶段信息
	page.sendFinished = function(info){
		utilObj.showLoading($("#wrap"),"正在提交...");
		utilObj.ajax({
			url: "m/track/saveTrack",
			data: info,
			success: function(data){
				if(info.isFinish == 1 && info.stageCode == "DECLARATION"){
					location.reload();
				} else {
					page.setTable();
					utilObj.hideLoading();
					w2popup.message();
				}				
			},
			error: function(e){
				w2alert("服务器错误");
				utilObj.hideLoading();
			}
		});
	};

/************************************/
	//初始化
	$("#myGrid").height($("#right-main-content").height() - 50);
	commonObj.bindEvent_NavAndSearch();
	page.setSearchBar();
	page.getVisitList();
	page.setStep();

	//下拉事件
    //分行下拉选中
    $("#subsidiary").on("select2:select", function(e) {
        var data = e.params.data;
        var sel_data = {
            parentId: data.id,
            employeeId: utilObj.userLogined.employeeId
        };
        commonObj.getBankSelect($("#branch"), sel_data, "支行[All]");
        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.setTable()).done(function(){
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
        $.when(page.setTable()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //客户经理下拉
    $("#manager").on("select2:select", function(e){
        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.setTable()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });

    //右侧搜索按钮
    $(document).on("click", ".search-btn", function(){
    	page.setTable();
    });

    //步骤选中
	$(document).on("click", ".filter-item", function(){
		if($(this).hasClass("filter-selected")){
			$(this).removeClass("filter-selected");
		} else if($(this).hasClass("last-filter")){
			$(this).addClass("filter-selected").siblings(".filter-item").removeClass("filter-selected");
		} else {
			$(this).addClass("filter-selected").siblings(".last-filter").removeClass("filter-selected");
		}

		w2ui["Clue"].searchReset();

		//请求数据
		page.setTable();
	});

	//线索显示
	$(document).on("mouseenter",".clue-item", function(){
		var $_line = $(this).children(".clue-line");
		var $_num = $(this).children(".clue-num");
		if($_line.length > 0){
			if($_line.hasClass("first-clue-line")){//第一个
				var $_next = $(this).next(".clue-item");
				$_next.css("visibility","hidden");
				$_next.next(".clue-item").css("visibility","hidden");
			} else if($_line.hasClass("last-clue-line")){//最后一个
				var $_prev = $(this).prev(".clue-item");
				$_prev.css("visibility","hidden");
				$_prev.prev(".clue-item").css("visibility","hidden");
			} else {//中间
				var $_prev = $(this).prev(".clue-item");
				var $_next = $(this).next(".clue-item");
				$_prev.css("visibility","hidden");
				$_next.css("visibility","hidden");
			}
			$_num.addClass("clue-hide");
			if(!$_line.hasClass("first-clue-line") && !$_line.hasClass("last-clue-line")){
				$_line.css({"width":"300%","height":"auto","margin-left":"-150%"});
			} else {
				$_line.css({"width":"300%","height":"auto"});
			}
			
			//$(this).parent(".clue-item").addClass("clue-show");
		}		
	});

	$(document).on("mouseleave",".clue-line", function(){
		var $_parent = $(this).parent(".clue-item");
		if($(this).hasClass("first-clue-line")){//第一个
			$_parent.next(".clue-item").hasClass("clue-no-show") ? 0 : $_parent.next(".clue-item").css("visibility","visible");
			$_parent.next(".clue-item").next(".clue-item").hasClass("clue-no-show") ? 0 : $_parent.next(".clue-item").next(".clue-item").css("visibility","visible");
		} else if($(this).hasClass("first-clue-line")){//最后一个
			$_parent.prev(".clue-item").hasClass("clue-no-show") ? 0 : $_parent.prev(".clue-item").css("visibility","visible");
			$_parent.prev(".clue-item").prev(".clue-item").hasClass("clue-no-show") ? 0 : $_parent.prev(".clue-item").prev(".clue-item").css("visibility","visible");
		} else {//其他
			$_parent.next(".clue-item").hasClass("clue-no-show") ? 0 : $_parent.next(".clue-item").css("visibility","visible");
			$_parent.prev(".clue-item").hasClass("clue-no-show") ? 0 : $_parent.prev(".clue-item").css("visibility","visible");
		}
		$(this).prev(".clue-num").removeClass("clue-hide");
		$(this).css({"width":"0","height":"0","margin":"0"});
		//$(this).parent(".clue-item").removeClass("clue-show");
	});

	//备注
	$(document).on("click", ".backup-btn", function(){
		var curr_trackId = $(this).attr("data-trackId");
		var rec = $(this).attr("data-recid");
		var edit_status = $(this).attr("data-edit-status");
		page.popupBackup(rec,curr_trackId,edit_status);
	});

	//保存备注
	$(document).on("click","#save-back",function(){
		var track_data = {
			employeeId: utilObj.userLogined.employeeId,
			trackId: $(this).attr("data-trackid"),
			remark: $("#backup-content").val()
		};
		page.saveBack(track_data);
		w2popup.close();
	});

	//跟进
	$(document).on("click", ".edit-btn", function(){
		if($(this).hasClass("gray-btn")){
			return false;
		} else {
			var curr_recid = $(this).attr("data-recid");
			var curr_trackId = $(this).attr("data-trackId");
			var curr_stageCode = $(this).attr("data-stage-code");
			var curr_trackStatusCode = $(this).attr("data-track-status-code");
			page.popupTrack(curr_recid,curr_trackId,curr_stageCode,curr_trackStatusCode);
		}		
	});

	//加减
	$(document).on("click",".plus-num",function(){
		var _percent = parseFloat($.trim($("#percent").val().replace(/%/g,"")));

		if(_percent > 95){
			$("#percent").val(100+"%");
		} else {
			_percent+=5;
			$("#percent").val(_percent+"%");
		}
	});

	$(document).on("click",".minus-num",function(){
		var _percent = parseFloat($.trim($("#percent").val().replace(/%/g,"")));

		if(_percent <= 5){
			$("#percent").val(1+"%");
		} else {
			_percent-=5;
			$("#percent").val(_percent+"%");
		}
	});

	//勾选已完成
	$(document).on("click","#if_finished", function(){
		var stageCode = $(this).parents(".w2ui-field").prev(".w2ui-field").children(".stage-box").attr("data-val");
		if(stageCode == "DECLARATION"){
			if($(this).prop("checked")){
				$("#popupTrack input[type!=checkbox][autocomplete!=off][id!=amount]").prop("disabled",true).css("background","#D2D2D2");
				$("#popupTrack input[autocomplete=off]").prop("disabled",true);
				$("input[name='visit']").prop("disabled",true);
			} else {
				$("#popupTrack input[type!=checkbox][autocomplete!=off]").prop("disabled",false).css("background","#fff");
				$("#popupTrack input[autocomplete=off]").prop("disabled",false);
				$("input[name='visit']").prop("disabled",false);
			}
		}
	});

	//保存跟进
	$(document).on("click","#save-edit", function(){
		if(!page.validateInput($(this).attr("data-stage-code"),$(this).attr("data-track-status-code"))){
			w2alert("请填写完整信息");
		} else {
			//console.log($("input[name='visit']:checked").val());
			var save_data = {
				employeeId: utilObj.userLogined.employeeId,
				trackId: $(this).attr("data-trackId"),
				action: $("#action").val(),
				estimateEndDate: $("#estimate").val(),
				visitClient: $("input[name='visit']:checked").val(),
				//visitClientCode: $("#visit").w2field().get("selected").id,
				probability: $("#percent").val().replace(/%/g,""),
				amount: $.trim($("#amount").val()).length > 0 ? parseFloat($("#amount").val().replace(/万元/g,"").split(",").join("")) : "",
				// remark: $("#remark").val(),
				// isFinish: $("#if_finished").prop("checked") ? 1 : 0,
				stageCode: $(".stage-box").attr("data-val")
			}
			page.saveTrack(save_data);
			w2popup.close();		
		}
	});

	//终止
	$(document).on("click",".finish-btn",function(){
		if($(this).hasClass("gray-btn")){
			return false;
		} else {
			var curr_recid = $(this).attr("data-recid");
			var curr_trackId = $(this).attr("data-trackId");
			page.popupFinality(curr_recid,curr_trackId);
		}
	});

	//保存终止原因
	$(document).on("click","#finality-btn",function(){
		if($.trim($("#finality-text").val()).length > 0){
			var $_that = $(this);
			w2confirm({
				msg: "线索终止后，无法恢复。请确认是否终止？",
				title: "提示",
				width: 400,
				height:200,
				btn_yes: {
					text: "确认",
					class: "btn-confirm",
					callBack: function(){
						var finality_data = {
							endRemark: $("#finality-text").val(),
							trackId: $_that.attr("data-trackid")
						};
						page.saveFinality(finality_data);
						w2popup.close();
					}
				},
				btn_no: {
			        text: '取消',    // text for no button (or no_text)
			        class: 'btn-unconfirm',      // class for no button (or no_class)
			        callBack: function(){
			        	w2confirm.close();
			        	w2confirm.clear();
			        }     // callBack for no button (or no_callBack)
			    }
			});
		} else {
			w2alert("终止原因不能为空");
			return;
		}
		
	});

	//完成本阶段
	$(document).on("click","#finish-step",function(){
		var clue_obj = w2ui.Clue.get($(this).attr("data-recid"));
		var tmp = template('Finished',{data: clue_obj,trackId: $(this).attr("data-trackid"),stageCode: $(this).attr("data-stage-code")});
		w2popup.message({
		    width  : 400,
		    height : 300,
		    html   : tmp,
		    onOpen: function(){
		    	$("#finish-date").w2field("date",{
        			format:"yyyy-mm-dd",
        			start: Date.today().addDays(-3).toString("yyyy-MM-dd"),
        			end: Date.today().addDays(3).toString("yyyy-MM-dd")
        		}).attr("placeholder","请选择日期");
		    }
		});
	});

	//关闭二层弹框
	$(document).on("click","#cancel-finished",function(){
		w2popup.message();
	});

	//提交完成阶段
	$(document).on("click","#send-finished",function(){
		var trackCode = $(this).attr("data-track-status-code");
		var stageCode = $(this).attr("data-stage-code");
		if(!page.validateInput($(this).attr("data-stage-code"),$(this).attr("data-track-status-code"))){
			w2alert("请先填写工作纪要中的必填项");
		} else if(!page.checkPopupMessage(trackCode)){
			w2alert("请完整填写信息");
		} else {
			if(stageCode != "DECLARATION" || ($.trim($("#amount").val()).length > 0 && parseFloat($("#amount").val().replace(/万元/g,"").split(",").join("")) > 0)){
				var sendInfo = {
					employeeId: utilObj.userLogined.employeeId,
					trackId: $(this).attr("data-trackid"),
					estimateEndDate: $("#finish-date").val(),
					visitClient: $("input[name='visit']:checked").val(),
					probability: $("#percent").val().replace(/%/g,""),
					amount: $.trim($("#amount").val()).length > 0 ? parseFloat($("#amount").val().replace(/万元/g,"").split(",").join("")) : "",
					action: $("#action").val(),
					remark: $("#remark").val(),
					stageCode: $(".stage-box").attr("data-val"),
					isFinish: 1
				};
				page.saveTrack(sendInfo);
				w2popup.message();
				w2popup.close();
			} else {
				w2alert("请先填写累计落地业务量");
			}			
		}		
	});

	//展开/收起
	$(document).on("click", ".dropdown-btn", function(event){
		var curr_recid = $(this).attr("data-recid");
		var track_status_code = $(this).attr("data-track-status-code");
		var trackid = $(this).attr("data-trackId");
		var stage_code = $(this).attr("data-stage-code");
		var curr_rec = w2ui.Clue.get(curr_recid);
		var finsh_class = "finish-btn" + (track_status_code == "0" ? " gray-btn" : "");
		var edit_class = "edit-btn" + (track_status_code == "0" ? " gray-btn" : "");
		if($(this).hasClass("down-arrow")){
			if(utilObj.userLogined.roleId == 5 || utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7 || stage_code == "RENVENUE" || track_status_code == "6"){
				curr_rec.backup = "<div class='backup-btn' data-recId='" + curr_recid + "' data-trackId='" + trackid + "' data-edit-status='0'>查看</div>";
				curr_rec.option = [
					"<div class='opt-wrap'>",
					"	<span class='dropdown-btn up-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>收起</span>",
					"</div>"
				].join("");
			} else {
				curr_rec.option = [
					"<div class='opt-wrap'>",
					"	<span class='"+edit_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>跟进</span>",
					"	<span class='"+finsh_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>终止</span>",
					"	<span class='dropdown-btn up-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>收起</span>",
					"</div>"
				].join("");
			}
			
			//$(curr_rec.option).children(".dropdown-btn").removeClass("down-arrow").addClass("up-arrow").text("收起");
		} else {
			if(utilObj.userLogined.roleId == 5 || utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7 || stage_code == "RENVENUE" || track_status_code == "6"){
				curr_rec.backup = "<div class='backup-btn' data-recId='" + curr_recid + "' data-trackId='" + trackid + "' data-edit-status='0'>查看</div>";
				curr_rec.option = [
					"<div class='opt-wrap'>",
					"	<span class='dropdown-btn down-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>展开</span>",
					"</div>"
				].join("");
			} else {
				curr_rec.option = [
					"<div class='opt-wrap'>",
					"	<span class='"+edit_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>跟进</span>",
					"	<span class='"+finsh_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>终止</span>",
					"	<span class='dropdown-btn down-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-track-status-code='"+track_status_code+"' data-stage-code='"+stage_code+"'>展开</span>",
					"</div>"
				].join("");
			}
			
			//$(curr_rec.option).children(".dropdown-btn").removeClass("up-arrow").addClass("down-arrow").text("展开");
		}
		w2ui.Clue.refreshCell(curr_recid,"option");
		w2ui.Clue.toggle(curr_recid);
	});
});

