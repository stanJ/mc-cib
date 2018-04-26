define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}

	page.columns = [
		{field: "bankBranchName", caption: "总行/分行", size: "9%", attr: "align=center"},
		{field: "bankSubsetName", caption: "支行", size: "9%", attr: "align=center"},
		{field: "activeAccount", caption: "新增有效客户数<br />(户)", size: "6%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "strategicAccount", caption: "战略客户新增<br />(户)", size: "6%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "ebankAccount", caption: "网银开户数<br />(户)", size: "6%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "planingAccount", caption: "规划完成量<br />(条)", size: "6%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "loan", caption: "日均贷款新增<br />(亿元)", size: "6%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "deposit", caption: "日均存款新增<br />(亿元)", size: "6%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "netIncome", caption: "存量客户净收入提升<br />(亿元)", size: "7%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "tradingBankProducts", caption: "交易银行产品新增实施量<br />(亿元)", size: "9%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "investmentBankProducts", caption: "投资银行产品新增实施量<br />(亿元)", size: "9%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "option", caption: "操作", size: "9%", attr: "align=center"},
		{field: "bankId", caption: "",size:"1%", hidden:true},
		{field: "bankBranchId", caption: "",size:"1%", hidden:true},
		{field: "bankSubsetId", caption: "",size:"1%", hidden:true}
	];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findYearlyPlanningPage",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = [];
					$.each(data.object.content, function(i,v){
						if(v.bankId != null){
							page.headBank = {
								recid: i,
								bankBranchName: v.bankName,
								bankSubsetName: "",
								activeAccount: v.activeAccount,
								strategicAccount: v.strategicAccount,
								ebankAccount: v.ebankAccount,
								planingAccount: v.planingAccount,
								loan: v.loan,
								deposit: v.deposit,								
								netIncome:v.netIncome,
								tradingBankProducts: v.tradingBankProducts,
								investmentBankProducts: v.investmentBankProducts,
								option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>",
								bankId: v.bankId,
								bankBranchId: "",
								bankSubsetId: ""
							};
						} else {
							page.records.push({
								recid: i,
								bankBranchName: v.bankBranchName,
								bankSubsetName: v.bankSubsetName,
								activeAccount: v.activeAccount,
								strategicAccount: v.strategicAccount,
								ebankAccount: v.ebankAccount,
								planingAccount: v.planingAccount,
								loan: v.loan,
								deposit: v.deposit,
								netIncome:v.netIncome,
								tradingBankProducts: v.tradingBankProducts,
								investmentBankProducts: v.investmentBankProducts,
								option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>",
								bankId: "",
								bankBranchId: v.bankBranchId,
								bankSubsetId: v.bankSubsetId
							});
						}						
					});

					page.records.push(page.headBank);
				}
				if(w2ui["Target"]){
					w2ui.Target.clear();
					w2ui.Target.records = page.records;
					w2ui.Target.refresh();
				} else {
					page.curr_input = [];
					$("#myGrid").w2grid({
						name: "Target",
						total: 10,
						limit: 200,
						recordHeight: 60,
						selectType: "row",
						show: {recordTitles: false},
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
						}
					});
				}
			}
		});
	};

	//保存修改
	page.saveEdit = function(){
		utilObj.showLoading($("#wrap"),"正在保存");
		utilObj.ajax({
			url: "m/params/saveYearlyPlanning",
			data: page.saveParam,
			success: function(data){
				//切换输入框
				$.each(page.curr_input, function(i,v){
					v.data('keep-open', false).blur();
				});
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading();
				});
			}
		});
	};

	//综合得分权重数据
	page.setPoint = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findBusinessWeightConfigPage",
			data: {nextPage: 0,pageSize: 99},
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.pointRec = [];
					$.each(data.object.content,function(i,v){
						page.pointRec.push({
							recid: i,
							name: "<span class='columns-title'>"+v.name+"</span>",
							weight: v.weight,
							option: "<div class='point-edit-btn' data-recid="+i+">编辑</div>",
							businessWeightId: v.businessWeightId
						});
					});
					
				} else {
					page.pointRec = [];
				}

				page.poupPoint();

				dfd.resolve(data);
			},
			error: function(e){
				w2ui.point.clear();
				w2ui.point.refresh();
				dfd.resolve(e);
			}
		});

		dfd.promise();
	};

	//综合得分弹框
	page.poupPoint = function(){
		$("#point-grid").w2popup({
			title: "综合得分权重",
			width: 500,
			height: 500,
			showClose: true,
			body: "<div id='inner-poin'></div>",
			onClose: function(event){
				event.onComplete = function(){
					w2ui.point.destroy();
				};
			},
			onOpen: function(event){
				event.onComplete = function(){
					$("#inner-poin").w2grid({
						name: "point",
						height: 400,
						width:400,
						recordHeight: 60,
						columns: [
							{field: "name",caption: "业务类型", size: "33%", attr: "align=center"},
							{field: "weight",caption: "业务权重", size: "33%", attr: "align=center",editable:{
								type: 'float',
								max: 100,
								min: 0
							}},
							{field: "option",caption: "操作", size: "33%", attr: "align=center"},
							{field: "businessWeightId",caption: "",size:"1%",hidden:true}
						],
						records: page.pointRec,
						onEditField: function(event){
							event.onComplete = function(){
								page.point_input = event.input;
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
						}
					});
				}
			}
		});
	};

	//权重保存/修改
	page.savePoint = function(){
		utilObj.showLoading($("#wrap"),"正在保存");
		utilObj.ajax({
			url: "m/params/saveBusinessWeightConfig",
			data: page.pointParam,
			success: function(data){
				//切换输入框
				page.point_input.data('keep-open', false).blur();
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading();
				});
			}
		});
	};

	//红绿灯设置
	page.setTraffic = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findPassConfigPage",
			success: function(data){
				if(data && data.object){
					page.yellowUp = (data.object.maxLine == null ? 0 : data.object.maxLine);
					page.yellowDown = (data.object.minLine == null ? 0 : data.object.minLine);
				} else {
					page.yellowUp = 0;
					page.yellowDown = 0;
				}

				page.poupTraffic();

				dfd.resolve(data);
			},
			error: function(e){

				dfd.resolve(e);
			}
		});

		dfd.promise();
	};

	//红绿灯弹框
	page.poupTraffic = function(){
		$("#traffic-grid").w2popup({
			title: "红绿灯设置",
			width: 500,
			height: 400,
			showClose: true,
			onClose: function(event){
				// event.onComplete = function(){
				// 	w2ui.point.destroy();
				// };
			},
			onOpen: function(event){
				event.onComplete = function(){
					$("#w2ui-popup .yellow-up-input").attr("id","yellow-up-input").val(page.yellowUp).w2field("int",{max: 100,min:0});
					$("#w2ui-popup .yellow-down-input").attr("id","yellow-down-input").val(page.yellowDown).w2field("int",{max: 100,min:0});
					$("#w2ui-popup .red-up input").val(page.yellowDown);
					$("#w2ui-popup .green-down input").val(page.yellowUp);
				}
			}
		});
	};

	//红绿灯保存
	page.saveTraffic = function(max,min){
		utilObj.showLoading($("#wrap"),"正在保存");
		utilObj.ajax({
			url: "m/params/savePassConfig",
			data: {
				minLine: min,
				maxLine: max
			},
			success: function(data){
				w2popup.close();
				
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading();
				});
			},
			erroe: function(err){
				
			}
		});
	};

	//比对上下限
	page.checkUpDown = function(){
		var up = parseInt($("#w2ui-popup #yellow-up-input").val());
		var down = parseInt($("#w2ui-popup #yellow-down-input").val());
		if(!up){
			up = 0;
		}
		if(!down){
			down = 0;
		}
		if(down >= up){
			$("#w2ui-popup #yellow-down-input").val((up - 1 > 0 ? (up - 1) : 0));
			$("#w2ui-popup .green-down input").val((up - 1 > 0 ? (up - 1) : 0));
		}

		$("#w2ui-popup #yellow-up-input").val(up);
	};

	//红灯上限
	page.setRedLight = function(){
		$("#w2ui-popup .red-up input").val($("#w2ui-popup #yellow-up-input").val());
	};

	//绿灯下限
	page.setGreenLight = function(){
		$("#w2ui-popup .green-down input").val($("#w2ui-popup #yellow-down-input").val());
	};

/********************************************************************/
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.bindGrid()).done(function(){
		utilObj.hideLoading();
	});

	//编辑/保存
	$(document).on("click",".edit-btn",function(){
		var recid = $(this).attr("data-recid");
		if($(this).hasClass("save-btn")){
			//保存参数
			page.saveParam = {
				bankId: w2ui["Target"].get(recid).bankId,
				bankBranchId: w2ui["Target"].get(recid).bankBranchId,
				bankSubsetId: w2ui["Target"].get(recid).bankSubsetId,
				activeAccount: parseFloat(page.curr_input[0].val().replace(/,/g,"")),
				strategicAccount: parseFloat(page.curr_input[1].val().replace(/,/g,"")),
				ebankAccount: parseFloat(page.curr_input[2].val().replace(/,/g,"")),
				planingAccount: parseFloat(page.curr_input[3].val().replace(/,/g,"")),
				loan: parseFloat(page.curr_input[4].val().replace(/,/g,"")),
				deposit: parseFloat(page.curr_input[5].val().replace(/,/g,"")),
				netIncome: parseFloat(page.curr_input[6].val().replace(/,/g,"")),
				tradingBankProducts: parseFloat(page.curr_input[7].val().replace(/,/g,"")),
				investmentBankProducts: parseFloat(page.curr_input[8].val().replace(/,/g,""))
			};			

			//切换保存按钮
			$(this).text("编辑").removeClass("save-btn");

			//保存
			page.saveEdit();
		} else {
			if(page.curr_input && page.curr_input.length > 0){
				$.each(page.curr_input, function(i,v){
					v.data('keep-open', false).blur();
				});
				$(".save-btn").removeClass("save-btn").text("编辑");
				page.curr_input = [];
			}

			$(this).text("保存").addClass("save-btn");
			w2ui["Target"].editField(recid,2);
			w2ui["Target"].editField(recid,3);
			w2ui["Target"].editField(recid,4);
			w2ui["Target"].editField(recid,5);
			w2ui["Target"].editField(recid,6);
			w2ui["Target"].editField(recid,7);
			w2ui["Target"].editField(recid,8);
			w2ui["Target"].editField(recid,9);
			w2ui["Target"].editField(recid,10);
		}
	});

	//点击综合得分
	$(document).on("click",".point-btn",function(){
		utilObj.showLoading($("#wrap"),"加载中");
		$.when(page.setPoint()).done(function(){
			utilObj.hideLoading($("#wrap"));
		});
	});

	//point编辑/保存
	$(document).on("click",".point-edit-btn",function(){
		var recid = $(this).attr("data-recid");
		if($(this).hasClass("point-save-btn")){
			//保存参数
			page.pointParam = {
				businessWeightId: w2ui["point"].get(recid).businessWeightId,
				weight: parseFloat(page.point_input.val().replace(/,/g,""))
			};

			//切换保存按钮
			$(this).text("编辑").removeClass("point-save-btn");

			//保存
			page.savePoint();
		} else {
			if(page.point_input && page.point_input.length > 0){
				page.point_input.data('keep-open', false).blur();
				$(".point-save-btn").removeClass("point-save-btn").text("编辑");
			}

			$(this).text("保存").addClass("point-save-btn");
			w2ui["point"].editField(recid,1);
		}
	});

	//点击红绿灯
	$(document).on("click",".traffic-btn",function(){
		utilObj.showLoading($("#wrap"),"加载中");
		$.when(page.setTraffic()).done(function(){
			utilObj.hideLoading($("#wrap"));
		});
	});

	//黄灯上限
	$(document).on("blur","#w2ui-popup #yellow-up-input",function(){
		page.checkUpDown();
		page.setRedLight();
		page.setGreenLight();
	});

	//黄灯下限
	$(document).on("blur","#w2ui-popup #yellow-down-input",function(){
		page.checkUpDown();
		page.setRedLight();
		page.setGreenLight();
		
	});

	//红绿灯保存
	$(document).on("click","#w2ui-popup .btn-confirm",function(){
		var up = parseInt($("#w2ui-popup #yellow-up-input").val());
		var down = parseInt($("#w2ui-popup #yellow-down-input").val());

		page.saveTraffic(up,down);
	});

	//红绿灯取消
	$(document).on("click","#w2ui-popup .btn-cancel",function(){
		w2popup.close();
	});
});