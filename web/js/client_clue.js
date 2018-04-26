define(function(require, exports, module){
	var page = {
		bindEvent: function(){
			var vm = this;
//			$(window).off('resize').resize(function(){
//				page.setHeight();
//			})
			//展开/收起
			$(document).on("click", ".dropdown-btn", function(event){
				var curr_recid = $(this).attr("data-recid");
				var stop_code = $(this).attr("data-stop-code");
				var trackid = $(this).attr("data-trackId");
				var stage_code = $(this).attr("data-stage-code");
				var curr_rec = w2ui.Clue.get(curr_recid);
				var finsh_class = "finish-btn" + (stop_code == "0" ? " gray-btn" : "");
				var edit_class = "edit-btn" + (stop_code == "0" ? " gray-btn" : "");
				if($(this).hasClass("down-arrow")){
//					if(utilObj.userLogined.roleId == 5 || stage_code == "RENVENUE" || stop_code == "0"){
						curr_rec.option = [
							"<div class='opt-wrap'>",
							"	<span class='dropdown-btn up-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>收起</span>",
							"</div>"
						].join("");
//					} else {
//						curr_rec.option = [
//							"<div class='opt-wrap'>",
//							"	<span class='"+edit_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>跟进</span>",
//							"	<span class='"+finsh_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>终止</span>",
//							"	<span class='dropdown-btn up-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>收起</span>",
//							"</div>"
//						].join("");
//					}
					
					//$(curr_rec.option).children(".dropdown-btn").removeClass("down-arrow").addClass("up-arrow").text("收起");
				} else {
//					if(utilObj.userLogined.roleId == 5 || stage_code == "RENVENUE" || stop_code == "0"){
						curr_rec.option = [
							"<div class='opt-wrap'>",
							"	<span class='dropdown-btn down-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>展开</span>",
							"</div>"
						].join("");
//					} else {
//						curr_rec.option = [
//							"<div class='opt-wrap'>",
//							"	<span class='"+edit_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>跟进</span>",
//							"	<span class='"+finsh_class+"' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>终止</span>",
//							"	<span class='dropdown-btn down-arrow' data-trackId='"+trackid+"' data-recid='"+curr_recid+"' data-stop-code='"+stop_code+"' data-stage-code='"+stage_code+"'>展开</span>",
//							"</div>"
//						].join("");
//					}
					
					//$(curr_rec.option).children(".dropdown-btn").removeClass("up-arrow").addClass("down-arrow").text("展开");
				}
				w2ui.Clue.refreshCell(curr_recid,"option");;
				w2ui.Clue.toggle(curr_recid);
			});
			//备注
			$(document).on("click", ".backup-btn", function(){
				var curr_trackId = $(this).attr("data-trackId");
				var rec = $(this).attr("data-recid");
				var edit_status = $(this).attr("data-edit-status");
				page.popupBackup(rec,curr_trackId,edit_status);
			});
		},
		popupBackup: function(rec,trackId,edit_status){
//			if(w2ui.Clue.get(rec).trackNo){
//				var clue_obj = w2ui.Clue.get(rec);
//				//ajax请求
//				utilObj.ajax({
//					url: "m/track/findTrackLog",
//					data: {trackId: trackId},
//					success: function(data){
//						var tmp = template('backup-box',{data:data.object,trackId:trackId,showStatus: edit_status});
//						if(w2ui["Backup"]){
//							w2ui.Backup.clear();
//							w2ui.Backup.formHTML = tmp;
//							w2ui.Backup.refresh();
//						} else {
//							page.createForm(tmp,"Backup");
//						}
//						var popup_height = edit_status == 1 ? 420 : 320;
//						page.openPopup('线索名称: ' + clue_obj.trackNo,"popupBck","Backup",480,popup_height);
//					},
//				});
//			} else {
//				w2alert('数据不完整，无法显示备注');
//				return false;
//			}
			
		    if(w2ui.Clue.get(rec).trackNo){
				var clue_obj = w2ui.Clue.get(rec);
			    $().w2popup('open', {
			        title   : '线索名称: '+clue_obj.trackNo,
			        body    : '<div id="form" class="w2ui-reset w2ui-form" style="width: 100%; height: 100%;border: 0px; background-color: transparent;"></div>',
			        buttons : '<button class="button popup-btn button--primary" onclick="w2popup.close();">确定</button>',
			        style   : 'padding: 15px 0px 0px 0px',
			        width   : 452,
			        height  : 296, 
			        showClose: false,
			        modal	: true,
			        onOpen: function (event) {
			            event.onComplete = function () {
			            	$('#w2ui-popup #form').html(template('backup-box')());
			            	utilObj.ajax({
								url: 'm/track/findTrackLog',
								data: {
									trackId: trackId,
								},
								success: function(data){
									var h = template('records-clue', {
										data: data.object,
									});
			            			$(".client-records--clue").html(h);
								}
							})
			            }
			        }
			    });
			}else{
				w2alert('数据不完整，无法显示备注');
				return false;
			}
		    
			
		},
		setHeight: function(){
			var height = $("#right-content").height();
			var h1 = height - 114 - $(".client-info-wrapper").height();
			$('.client-tab-content').outerHeight(h1);
		},
		loadContent: function(){
			var h = template('clue-content')();
			if(page.accountPlanningId !== null){
				$(".client-tab-content-container").html(h);
				$(window).resize();
				this.loadSteps();
				this.getTableData();
			}else{
				$(".client-tab-content-container").html('');
			}
		},
		loadSteps: function(){
			utilObj.ajax({
				url: "m/track/findStepByAccountPlanningId",
				data: {
					accountPlanningId: page.accountPlanningId,
				},
				success: function(data){
					$(".filter-wrap").html(template("filter-item",{data: data.object}));
					$(".clue-wrap").html(template("clue-item",{data: data.object}));
				},
			});
		},
		getTableData: function(){
			var vm = this;
			utilObj.ajax({
				url: "m/track/findTrackByAccountPlanningId",
				data: {
					accountPlanningId: vm.accountPlanningId,
				},
				success: function(data){
					var records = [];
					var res = [{
						items: data.object,
					}];
					_.map(res,function(v,i){
//						var records_l1 = {
//							recid: i.toString(),
//							client: "<span class='level1-client-show'>" + v.customerName + "</span>"					
//						};
//
//						records.push(records_l1);

						_.map(v.items, function(v1,i1){
							var records_l2 = page.createRow(v1,i.toString()+i1.toString());
							records.push(records_l2);
						});
						
					});
					vm.loadTable(records);
				}
			});
		},
		setOption: function(obj,rec){
			var config = {
				_option: "",
				_backup: ""
			};
	
			var finsh_class = "finish-btn" + (obj.trackStatusCode == "0" ? " gray-btn" : "");
			var edit_class = "edit-btn" + (obj.trackStatusCode == "0" ? " gray-btn" : "");
	
//			if(utilObj.userLogined.roleId == 5 || obj.stageCode == "RENVENUE" || obj.trackStatusCode == "0"){
				config._backup = "<div class='backup-btn' data-recId='" + rec + "' data-trackId='" + obj.trackId + "' data-edit-status='0'>查看</div>";
				config._option = [
					"<div class='opt-wrap'>",
					obj.children.length > 0 ? "<span class='dropdown-btn down-arrow' data-trackId='" + obj.trackId + "' data-recid='" + rec + "' data-stop-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>展开</span>" : "<span class='empty-btn'>&nbsp;&nbsp;&nbsp;&nbsp;</span>",
					"</div>"
				].join("");
//			} else {
//				config._backup = "<div class='backup-btn' data-recId='" + rec + "' data-trackId='" + obj.trackId + "' data-edit-status='1'>备注</div>";
//				config._option = [
//					"<div class='opt-wrap'>",
//					"	<span class='"+edit_class+"' data-recId='"+rec+"' data-trackId='" + obj.trackId + "' data-stop-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>跟进</span>",
//					"	<span class='"+finsh_class+"' data-recId='"+rec+"' data-trackId='" + obj.trackId + "' data-stop-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>终止</span>",
//					obj.children.length > 0 ? "<span class='dropdown-btn down-arrow' data-trackId='" + obj.trackId + "' data-recid='" + rec + "' data-stop-code='"+obj.trackStatusCode+"' data-stage-code='"+obj.stageCode+"'>展开</span>" : "<span class='empty-btn'>&nbsp;&nbsp;&nbsp;&nbsp;</span>",
//					"</div>"
//				].join("");
//			}
	
			return config;
		},
		getSuffixForAmount: function(isEva){
			var suffix = '';
			if(isEva == 1){
				suffix = '万元';
			}
			return suffix;
		},
		//一级表格结构
		createRow: function(item,rec){
			//支行行长不跟进和终止备注只能查看
			var productInfo = item.product;
			var suffix = this.getSuffixForAmount(productInfo.isEva);
			var obj = item.customerTrack;
			obj.children = item.children;
			var config = page.setOption(obj,rec);
			//构建结构
			var row = {
				recid: rec,
				client: "",
				trackNo: (obj.trackNo == null ? "" : page.cutTrackNo(obj.trackNo)),
				action: obj.action,
				estimateEndDate: obj.estimateEndDate,
				visitClient: obj.visitClient,
				trackStatus: obj.trackStatus,
				probability: obj.probability == null ? "" : utilObj.getInt(obj.probability) +"%",
				stage: obj.stage,
				backup: config._backup,
				customerManager: obj.customerManage,
				option: config._option,
				trackStatusCode: obj.trackStatusCode,
				stageCode: obj.stageCode,
				employeeName: obj.employeeName,
				amount: obj.amount == null?'': obj.amount+suffix,
				endDate: obj.endDate == null?'': obj.endDate,
			};
	
			if(item.children.length > 0){
				row.w2ui = {
					children: page.createSubRow(item.children,rec, suffix)
				}
			}
	
			return row;
		},
		//二级表格结构
		createSubRow: function(arr,rec, suffix){
			var sub_row = [];
			_.map(arr, function(item,i){
				var v = item;
				var row = {
					recid: rec+i,
					trackNo: (v.trackNo == null ? "" : page.cutTrackNo(v.trackNo)),
					action: v.action,
					estimateEndDate: v.estimateEndDate,
					visitClient: v.visitClient,
					trackStatus: v.trackStatus,
					probability: v.probability == null ? "" : utilObj.getInt(v.probability) +"%",
					stage: v.stage,
					backup: "<div class='backup-btn' data-recId='"+rec+"'  data-trackId='" + v.trackId + "'>查看</div>",
					w2ui: {"style": "background-color: rgb(240,240,240)"},
					trackStatusCode: v.trackStatusCode,
					employeeName: v.employeeName,
					amount: v.amount == null?'': v.amount+suffix,
					endDate: v.endDate == null?'': v.endDate,
				};
				sub_row.push(row);
			});
			
			return sub_row;
		},
		cutTrackNo: function(str){
			var cut_str = "";
			$.each(str.split(";"),function(i,v){
				if(i == 2){
					cut_str += "<span class='track-cut'>"+v*1+"万元</span>";
				} else {
					cut_str += "<span class='track-cut'>"+v+"</span>";
				}
				
			});
			return cut_str;
		},
		loadTable: function(records){
			
			if(w2ui["Clue"]){
//				w2ui.Clue.clear();
				w2ui.Clue.records = records;
				w2ui.Clue.refresh();
				$("#myGrid").w2render('Clue');
			} else {
				//生成结构
				$("#myGrid").w2grid({
					name: "Clue",
//					total: 10,
//					limit: 200,
					recordHeight: 84,
					fixedBody: false,
					columns: [
//						{field: "client", caption: "", size: "10%", attr: "align=center"},
						{field: "trackNo", caption: "线索", size: "16%", attr: "align=center"},
						{field: "action", caption: "具体新行动", size: "8%", attr: "align=center"},
						{field: "estimateEndDate", caption: "预计完成<br />时间", size: "8%", attr: "align=center"},
						{field: "endDate", caption: "阶段完成<br />时间", size: "8%", attr: "align=center"},
						{field: "visitClient", caption: "拜访客户", size: "7%", attr: "align=center"},
						{field: "trackStatus", caption: "目前状态", size: "7%", attr: "align=center"},
						{field: "probability", caption: "成功概率", size: "7%", attr: "align=center"},
						{field: "stage", caption: "目前阶段", size: "7%", attr: "align=center"},
						{field: "amount", caption: "落地业务量", size: "7%", attr: "align=center"},
						{field: "backup", caption: "备注", size: "7%", attr: "align=center"},
						{field: "employeeName", caption: "客户经理", size: "7%", attr: "align=center"},
						{field: "option", caption: "操作", size: "7%", attr: "align=center"},
						{field: "trackStatusCode",caption: "",size:"1%",hidden: true},
						{field: "stageCode",caption:"",size:"1%",hidden: true}
					],
					records: records
				});
				
				//阻止默认双击
				w2ui.Clue.on('dblClick', function(event) {
				    event.preventDefault();
				});
			}
			setTimeout(function(){
				$(window).resize();
			}, 0);
			
		},
	};
	
	module.exports = {
		init: function(params){
			page.accountPlanningId = params.accountPlanningId;
			page.loadContent();
			page.bindEvent();
			$(window).trigger('resize');
		}
	}
});