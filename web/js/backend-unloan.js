define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}

	page.columns = [
		{field: "name", caption: "无贷户分类", size: "25%", attr: "align=center"},
		{field: "lowerLimit", caption: "平均日存款(下限)", size: "25%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "upperLimit", caption: "平均日存款(上限)", size: "25%", attr: "align=center", editable:{
			type: 'float',
			max: 999999999,
			min: 0
		}},
		{field: "option", caption: "操作", size: "25%", attr: "align=center"},
		{field: "noLoanTypeId", caption: "",size:"1%", hidden:true}
	];

	page.records = [];

	page.curr_input = [];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findNoLoanLayeringPage",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = [];
					$.each(data.object.content, function(i,v){
						page.records.push({
							recid: i,
							name: v.name,
							lowerLimit: v.lowerLimit,
							upperLimit: v.upperLimit,
							option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>",
							noLoanTypeId: v.noLoanTypeId
						});
					});
				}
				if(w2ui["unLoan"]){
					w2ui.unLoan.clear();
					w2ui.unLoan.records = page.records;
					w2ui.unLoan.refresh();
				} else {
					$("#myGrid").w2grid({
						name: "unLoan",
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
			url: "m/params/saveNoLoanLayering",
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

	//检查参数是否合理
	page.checkLimit = function(recid){
		//第一条数据，比对前后大小
		if(recid == 0){
			if(page.saveParam.lowerLimit < page.saveParam.upperLimit){
				return true;
			} else {
				w2alert("下限必须小于上限");
				return false;
			}
		}

		//return false;
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
				noLoanTypeId: w2ui["unLoan"].get(recid).noLoanTypeId,
				lowerLimit: parseFloat($.trim(page.curr_input[0].val()).length > 0 ? $.trim(page.curr_input[0].val()).replace(/,/g,"") : 0),
				upperLimit: parseFloat($.trim(page.curr_input[1].val()).length > 0 ? $.trim(page.curr_input[1].val()).replace(/,/g,"") : 0)
			};

			//是否符合条件
			// if(!page.checkLimit(recid)){
			// 	return false;
			// }

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
			w2ui["unLoan"].editField(recid,1);
			w2ui["unLoan"].editField(recid,2);
		}
		
	});
});