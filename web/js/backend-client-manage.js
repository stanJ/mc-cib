define(function(require,exports,module){
	require("../css/simplePagination.css");
	require("../js/common/jquery.simplePagination.js");

	var page = {};
	page.params = {
		keyword: "",
		nextPage: 0,
		pageSize: 100
	};

	page.tmpPage = 0;
	page.tmpVal = "";
	page.isSearch = false;

	page.columns = [
		{field: "customerCode", caption: "客户编号", size: "10%", attr: "align=center"},
		{field: "customerName", caption: "客户名称", size: "40%", attr: "align=center"},
		{field: "companyName", caption: "集团名称", size: "30%", attr: "align=center"},
		{field: "employeeName", caption: "客户经理", size: "10%", attr: "align=center"},
		{field: "option", caption: "操作", size: "10%", attr: "align=center"},
		{field: "customerId", caption: "客户Id",size:"1%", hidden:true},
		{field: "isStrategic",caption:"是否战略客户",size:"1%",hidden:true},
		{field: "level1",caption:"一级行业名称",size:"1%",hidden:true},
		{field: "level2",caption:"二级行业名称",size:"1%",hidden:true},
		{field: "level3",caption:"三级行业名称",size:"1%",hidden:true},
		{field: "startTime",caption:"开户时间",size:"1%",hidden:true},
		{field: "cooperationYear",caption:"合作年限",size:"1%",hidden:true},
		{field: "bankBranchName",caption:"所属分行",size:"1%",hidden:true},
		{field: "bankSubsetName",caption:"所属支行",size:"1%",hidden:true},
		{field: "creditRating",caption:"信用评级",size:"1%",hidden:true},
		{field: "hasrRisk",caption:"是否已出现风险",size:"1%",hidden:true},
		{field: "customerInfoCode",caption:"客户编号",size: "1%", hidden: true},
		{field: "annualIncome",caption:"年收入",size: "1%", hidden: true},
		{field: "creditAmount",caption:"授信金额",size: "1%", hidden: true},
		{field: "ebank",caption:"是否开通网银",size: "1%", hidden: true},
		{field: "dealCount",caption:"支付交易笔数",size: "1%", hidden: true},
		{field: "dealMoney",caption:"支付交易金额",size: "1%", hidden: true},
	];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "/m/customer/findPageCustomer",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = [];
					$.each(data.object.content, function(i,v){
						page.records.push({
							recid: i,
							customerCode: "<span class='show-customer-info' data-recid="+i+">"+v.customerCode+"</span>",
							customerName: v.customerName,
							companyName: v.companyName,
							employeeName: v.employeeName,
							option: "<span class='delete-btn' data-recid='"+i+"'>删除</span>",
							customerId: v.customerId,
							isStrategic: v.isStrategic,
							level1: v.level1,
							level2: v.level2,
							level3: v.level3,
							startTime: v.startTime,
							cooperationYear: v.cooperationYear,
							bankBranchName: v.bankBranchName,
							bankSubsetName:v.bankSubsetName,
							creditRating: v.creditRating,
							hasrRisk: v.hasrRisk,
							customerInfoCode: v.customerCode,
							annualIncome: v.annualIncome,
							creditAmount:v.creditAmount,
							ebank:(v.ebank == 0 ? "否" : "是"),
							dealCount: (v.dealCount == null ? "0" : v.dealCount),
							dealMoney:(v.dealMoney == null ? "0" : v.dealMoney)
						});
					});

					var pageObj = {
						numberOfElements: data.object.numberOfElements,
						totalElements: data.object.totalElements,
						firstPage: data.object.firstPage,
						lastPage: data.object.lastPage,
						size: data.object.size
					};

					if($(".page-size").size() == 0){
						var pages = [
							"<div class='page-size'>",
								"<span>每页"+page.params.pageSize+"条记录</span>",
								"<span>/共"+pageObj.totalElements+"条记录</span>",						
							"</div>"
						].join("");

						$("#pagination").before(pages);
					} else {
						$(".page-size").children("span").eq(0).text("每页"+page.params.pageSize+"条记录");
						$(".page-size").children("span").eq(1).text("/共"+pageObj.totalElements+"条记录");
					}				

					page.pagination(pageObj);
				
					page.loadTable();
				} else {
					if(!page.isSearch){
						utilObj.currNoData();
					}
					$(".page-size").hide();
					$("#pagination").hide();		
				}
				
			}
		});
	};

	//生成表格
	page.loadTable = function(){
		if(w2ui["Manage"]){
			w2ui.Manage.clear();
			w2ui.Manage.records = page.records;
			w2ui.Manage.refresh();
			$("#myGrid").w2render('Manage');
		} else {
			page.curr_input = [];
			$("#myGrid").w2grid({
				name: "Manage",
				total: 10,
				limit: 200,
				recordHeight: 60,
				selectType: "row",
				show: {
					toolbar: true,
					toolbarReload: false,
					toolbarColumns: false,
					toolbarSearch: false,
					recordTitles: false,
					footer: true
				},
				multiSearch: true,
				searches: [
		            { field: 'customerName', caption: '客户名称', type: 'text', operator: "contains"},
		            { field: 'customerCode', caption: '客户编号', type: 'text', operator: "contains"},
		            { field: "all",caption: "客户名称,客户编号",type:"text", operator: "contains"},
		        ],
				toolbar: {
					items: [
						{ type: 'html',  id: 'item5',
			                html: function (item) {
			                    var html = [
			                    	"<div style='padding: 0 10px;'>",
			                    	"	<input size='15' onkeydown='if(event.keyCode == 13){var grid = w2ui[\"Manage\"]; grid.search(this.value);}' style='padding: 3px; width: 150px; height: 24px; border-radius: 2px; border: 1px solid silver;' placeholder='客户名称,客户编号' value='"+ (page.tmpVal || '') +"' />",
			                    	"</div>"
			                    ].join("");
			                    return html;
			                },
			            },
					],
				},
				columns: page.columns,
				records: page.records,
				onEditField: function(event){
					event.onComplete = function(){
						page.curr_input.push(event.input);
						event.input.data('keep-open', true);

						event.input.css({
							'width': '50%',
							'text-align': 'center',
						});
					}
				},
				onDblClick: function(event){
					event.preventDefault();
				},
				onClick: function(event){
					event.preventDefault();
				},
				onSearch: function(obj){
					var val = obj.searchValue;
					if($.trim(val).length > 0){
						page.params.keyword = val;
						page.tmpVal = val;
						page.params.nextPage = 0;
						page.isSearch = true;
						page.bindGrid();
					} else {
						page.params.keyword = "";
						page.tmpVal = "";
						page.params.nextPage = page.tmpPage;
						page.isSearch = false;
						page.bindGrid();
					}
				}
			});
		}

		$("#empty-data").hide();
		$("#myGrid").show();
		$("#pagination").show();
	};

	page.search = function(val){
		if($.trim(val).length > 0){
			page.params.keyword = val;
			page.params.nextPage = 0;
			page.bindGrid();
		} else {
			page.params.keyword = "";
			page.params.nextPage = page.tmpPage;
			page.bindGrid();
		}
	};

	//分页
	page.pagination = function(obj){
		$("#pagination").pagination("destroy");
		$("#pagination").pagination({
			cssStyle: "light-theme",
			items: obj.totalElements,
			itemsOnPage: page.params.pageSize,
			currentPage: (page.params.nextPage+1),
			displayedPages: 5,
			edges: 1,
			prevText: "上一页",
			nextText: "下一页",
			ellipsePageSet: true,
			onInit: function(){
				
			},
			onPageClick: function(pageNumber,event){
				page.params.nextPage = (pageNumber - 1);
				page.tmpPage = (pageNumber - 1);
				page.bindGrid();
			}
		});
	};

	//删除客户
	page.deleteCus = function(cid){
		utilObj.showLoading($("#wrap"),"正在删除");
		utilObj.ajax({
			url: "m/customer/removeCustomerInfo",
			data: {customerId: cid},
			success: function(data){
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading($("#wrap"));
				});
			},
			error: function(e){
				w2alert("删除失败","删除失败");
				utilObj.hideLoading($("#wrap"));
			}
		});
	};

	//综合得分弹框
	page.popupDefine = function(){
		utilObj.showLoading($("#wrap"),"加载中");
		utilObj.ajax({
			url: "m/sysConfig/findCustomerValidConfig",
			success: function(data){
				if(data && data.object && data.object.length > 0){
					page.checkHtml = "";
					page.min_val = data.object[0].configValue;
					$.each(data.object,function(i,v){
						if(i > 0){
							var checked = v.configValue == null ? "" : "checked";
							page.checkHtml += [
								'<span class="check-item">',
									'<input type="checkbox" '+checked+' data-key="'+v.configKey+'">&nbsp;'+v.configKey,
								'</span>'
							].join("");
						}
					});

					$("#w2ui-popup .check-box").html(page.checkHtml);

				}
			}
		});
		$(".define-form-inner").w2popup("open",{
			title: "有效客户定义",
			width: 300,
			height: 400,
			showClose: true,
			onOpen: function(event){
				event.onComplete = function(){
					$("#w2ui-popup .min-value").w2field("int",{min:0,autoFormat: false}).val(page.min_val);
				}
			}
		});

		utilObj.hideLoading($("#wrap"));
	};

	//保存修改
	page.saveDefine = function(){
		utilObj.showLoading($("#wrap"),"正在保存");
		utilObj.ajax({
			url: "m/sysConfig/saveCustomerValidConfig",
			data: page.defineVal,
			success: function(data){
				w2popup.close();
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading();
				});
			}
		});
	};

	//弹出月度标准
	page.popupMonthlyStandar = function(){
		utilObj.showLoading($("#wrap"),"加载中");
		utilObj.ajax({
			url: "m/sysConfig/findBizDataConfig",
			success: function(data){
				if(data && data.object && data.object.length > 0){
					page.landing = data.object[0].configValue;
					page.Intentional = data.object[1].configValue;
				}
			}
		});
		$(".monthly-form-inner").w2popup("open",{
			title: "月度业务量标准",
			width: 374,
			height: 300,
			showClose: true,
			onOpen: function(event){
				event.onComplete = function(){
					$("#w2ui-popup .landing-value").w2field("int",{min:0,autoFormat: false}).val(page.landing);
					$("#w2ui-popup .Intentional-value").w2field("int",{min:0,autoFormat: false}).val(page.Intentional);
				}
			}
		});

		utilObj.hideLoading($("#wrap"));
	};

	//保存月度业务量标准
	page.saveMonthlyStandar = function(){
		utilObj.showLoading($("#wrap"),"正在保存");
		utilObj.ajax({
			url: "m/sysConfig/saveBizDataConfig",
			data: page.monthlyVal,
			success: function(data){
				w2popup.close();
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading();
				});
			}
		});
	};

	//弹出用户信息
	page.popupInfo = function(){
		var startTime = new Date(page.recObj.startTime);
		page.recObj.startTime = startTime.getFullYear() + "-" + ((startTime.getMonth()+1) > 9 ? (startTime.getMonth()+1) : "0"+ (startTime.getMonth()+1)) + "-" + (startTime.getDate() > 9 ? startTime.getDate() : "0"+startTime.getDate());
		var html = template("info",{data: page.recObj});
		$().w2popup({
			name: "info",
			title: "客户信息",
			width: 620,
			height: 550,
			body: html
		});
	};

/********************************************************************/
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.bindGrid()).done(function(){
		utilObj.hideLoading();
	});

	$(document).on("click",".delete-btn",function(){
		var id = w2ui.Manage.get($(this).attr("data-recid")).customerId;
		w2confirm({
			msg: "删除后客户无法恢复，确认删除吗？",
			title: "删除客户",
			yes_text: "删除",
			no_text: "取消",
			yes_class: "confrim-btn",
			no_class: "cancel-btn",
			yes_callBack: function(){
				page.deleteCus(id);
			},
			no_callBack: function(){
				return false;
			}
		});
	});

	//有效客户定义
	$(document).on("click",".define-btn",function(){
		page.popupDefine();
	});

	//保存有效客户定义
	$(document).on("click",".confirm-define",function(){
		var min_val = $("#w2ui-popup .min-value").val();
		min_val = min_val.length == 0 ? 0 : min_val;
		var productType = [];
		$.each($("#w2ui-popup .check-item"), function(i,v){
			var $_ipt = $(v).children("input");
			productType.push({
				type: $_ipt.attr("data-key"),
				value: $_ipt.prop("checked") == false ? 0 : 1
			});
		});

		page.defineVal = {
			minBizVolume: min_val,
			productType: JSON.stringify(productType)		
		}

		page.saveDefine();
	});

	//有效客户定义
	$(document).on("click",".standard-btn",function(){
		page.popupMonthlyStandar();
	});

	//保存月度业务量标准
	$(document).on("click",".confirm-montyly",function(){
		var landing_val = $("#w2ui-popup .landing-value").val();
		var _Intentional_val = $("#w2ui-popup .Intentional-value").val();
		landing_val = landing_val.length == 0 ? 0 : landing_val;
		_Intentional_val = _Intentional_val.length == 0 ? 0 : _Intentional_val;

		page.monthlyVal = {
			landing: landing_val,
			intentional: _Intentional_val		
		}

		page.saveMonthlyStandar();
	});

	//取消按钮
	$(document).on("click",".cancel-btn",function(){
		w2popup.close();
	});

	//点击某一客户查看详情
	$(document).on("click",".show-customer-info",function(){
		page.recObj = w2ui["Manage"].get($(this).attr("data-recid"));
		page.popupInfo();
	});

	//导入
	$(document).on("click",".import-btn",function(){
		$("#upload_file").trigger("click");
	});

	//上传
	$(document).on("change","#upload_file",function(e){
		utilObj.showLoading($("#wrap"),"加载中");
		var file = e.target.files[0];
		var form = new FormData();
		form.append("excelFile", file);
		
		utilObj.ajax({
			url: 'm/input/inputCustomerInfo',
			data: form,
			contentType: false,
			processData: false,
			success: function(data){
				utilObj.clearFile(e.target);
				w2alert('上传成功', '提示');
				utilObj.hideLoading($("#wrap"));
			},
			error: function(err){
				utilObj.hideLoading($("#wrap"));
			}
		});
	});
});