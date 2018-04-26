define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}

	page.columns = [
		{field: "customerTyp", caption: "企业类型", size: "20%", attr: "align=center"},
		{field: "weight", caption: "权重(%)", size: "20%", attr: "align=center", editable:{
			type: 'int',
			max: 100,
			min: 0
		}},
		{field: "option", caption: "操作", size: "20%", attr: "align=center"},
		{field: "riskWeightCfgId", caption: "",size:"1%", hidden:true}
	];

	page.records = [];

	page.curr_input = [];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/config/findRiskWeight",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.length > 0){
					page.records = [];
					$.each(data.object, function(i,v){
						page.records.push({
							recid: i,
							customerTyp: v.customerTyp,
							weight: v.weight,
							option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>",
							riskWeightCfgId: v.riskWeightCfgId
						});
					});
				} else {

				}

				if(w2ui["Weight"]){
					w2ui.Weight.clear();
					w2ui.Weight.records = page.records;
					w2ui.Weight.refresh();
				} else {
					$("#myGrid").w2grid({
						name: "Weight",
						total: 10,
						limit: 200,
						recordHeight: 60,
						selectType: "row",
						show: {recordTitles: false},
						columns: page.columns,
						records: page.records,
						onEditField: function(event){
							event.onComplete = function(){
								page.curr_input = event.input;
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

				dfd.resolve(data);
			},

			error: function(err){
				dfd.resolve(err);
			}
		});

		return dfd.promise();
	};

	//保存修改
	page.saveEdit = function(){
		utilObj.showLoading($("#wrap"),"正在保存");
		utilObj.ajax({
			url: "m/config/saveRiskWeight",
			data: page.saveParam,
			success: function(data){
				//切换输入框
				page.curr_input.data('keep-open', false).blur();
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
				riskWeightCfgId: w2ui["Weight"].get(recid).riskWeightCfgId,
				customerTyp: w2ui["Weight"].get(recid).customerTyp,
				weight: page.curr_input.val()
			};

			//切换保存按钮
			$(this).text("编辑").removeClass("save-btn");

			//保存
			page.saveEdit();
		} else {
			if(page.curr_input && page.curr_input.length > 0){
				page.curr_input.data('keep-open', false).blur();
				$(".save-btn").removeClass("save-btn").text("编辑");
			}
			
			$(this).text("保存").addClass("save-btn");			
			w2ui["Weight"].editField(recid,1);
		}
	});
});