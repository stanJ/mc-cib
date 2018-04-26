define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}

	page.columns = [
		{field: "bankBranchName", caption: "分行名称", size: "16%", attr: "align=center"},
		{field: "bankSubsetName", caption: "支行名称", size: "16%", attr: "align=center"},
		{field: "loanRate", caption: "贷款管理费用率(%)", size: "16%", attr: "align=center", editable:{
			type: 'float',
			max: 100,
			min: 0
		}},
		{field: "depositRate", caption: "存款管理费用率(%)", size: "16%", attr: "align=center", editable:{
			type: 'float',
			max: 100,
			min: 0
		}},
		{field: "middleRate", caption: "中间业务收入管理费用率(%)", size: "16%", attr: "align=center", editable:{
			type: 'float',
			max: 100,
			min: 0
		}},
		{field: "option", caption: "操作", size: "16%", attr: "align=center"},
		{field: "bankSubsetId", caption: "",size:"1%", hidden:true}
	];

	page.records = [];

	page.curr_input = [];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findBankCostPage",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = [];
					$.each(data.object.content, function(i,v){
						page.records.push({
							recid: i,
							bankBranchName: v.bankBranchName,
							bankSubsetName: v.bankSubsetName,
							loanRate: v.loanRate,
							depositRate: v.depositRate,
							middleRate: v.middleRate,
							option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>",
							bankSubsetId: v.bankSubsetId
						});
					});
				}

				if(w2ui["subBranch"]){
					w2ui.subBranch.clear();
					w2ui.subBranch.records = page.records;
					w2ui.subBranch.refresh();
				} else {
					$("#myGrid").w2grid({
						name: "subBranch",
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
			url: "m/params/saveBankCost",
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
				bankSubsetId: w2ui["subBranch"].get(recid).bankSubsetId,
				loanRate: page.curr_input[0].val(),
				depositRate: page.curr_input[1].val(),
				middleRate: page.curr_input[2].val()
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
			w2ui["subBranch"].editField(recid,2);
			w2ui["subBranch"].editField(recid,3);
			w2ui["subBranch"].editField(recid,4);
		}
		
	});
});