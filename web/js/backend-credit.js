define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}

	page.columns = [
		{field: "productType", caption: "产品类别", size: "33%", attr: "align=center"},
		{field: "factor", caption: "转换系数(%)", size: "33%", attr: "align=center", editable:{
			type: 'float',
			max: 100,
			min: 0
		}},
		{field: "option", caption: "操作", size: "33%", attr: "align=center"},
		{field: "creditConvertCfgId", caption: "", size: "1%", hidden: true}
	];

	page.records = [];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findCreditConvertConfigPage",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = [];
					$.each(data.object.content, function(i,v){
						page.records.push({
							recid: i,
							productType: v.productType,
							factor: v.factor,
							option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>",
							creditConvertCfgId: v.creditConvertCfgId
						});
					});
				}

				if(w2ui["Credit"]){
					w2ui.Credit.clear();
					w2ui.Credit.records = page.records;
					w2ui.Credit.refresh();
				} else {
					$("#myGrid").w2grid({
						name: "Credit",
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
								page.curr_input.data('keep-open', true);
								page.curr_input.css({
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
			url: "m/params/saveCreditConvertConfig",
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
				creditConvertCfgId: w2ui["Credit"].get(recid).creditConvertCfgId,
				factor: page.curr_input.val()
			};

			//切换保存按钮
			$(this).text("编辑").removeClass("save-btn");

			//保存
			page.saveEdit();
		} else {
			if(page.curr_input){
				page.curr_input.data('keep-open', false).blur();
				$(".save-btn").removeClass("save-btn").text("编辑");
			}
			
			$(this).text("保存").addClass("save-btn");			
			w2ui["Credit"].editField(recid,1);
		}
		
	});
});