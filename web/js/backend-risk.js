define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	};

	//保存参数
	page.curr_input = [];

	//下拉参数
	page.selectItem = [
		{
			id:0,
			text: "低"
		},
		{
			id:1,
			text: "中"
		},
		{
			id:2,
			text: "高"
		}
	];

	//表结构
	page.columns = [
		{field: "costType", caption: "信用评级", size: "25%", attr: "align=center"},
		{
			field: "recommendation",
			caption:"推荐度",
			size:"20%",
			attr:"align=center",
			editable: {
				type: "select",
				items: page.selectItem
			}
		},
		{field: "pd", caption: "PD(%)", size: "25%", attr: "align=center", editable:{
			type: 'float',
			max: 100,
			min: 0
		}},
		{field: "lgd", caption: "LGD(%)", size: "25%", attr: "align=center"},
		{field: "option", caption: "操作", size: "25%", attr: "align=center"}
	];

	page.records = [];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findCostRiskConfigPage",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = [];
					$.each(data.object.content, function(i,v){
						page.records.push({
							recid: i,
							costType: v.costType,
							recommendation: page.getCurrList(v.recommendationLevel),
							pd: v.pd,
							lgd: v.lgd,
							option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>"
						});
					});
				}

				if(w2ui["Risk"]){
					w2ui.Risk.clear();
					w2ui.Risk.records = page.records;
					w2ui.Risk.refresh();
				} else {
					$("#myGrid").w2grid({
						name: "Risk",
						total: 10,
						limit: 200,
						recordHeight: 60,
						selectType: "row",
						show: {recordTitles: false},
						columns: page.columns,
						records: page.records,
						onEditField: function(event){
							event.onComplete = function(){
								if(event.column == 1){
									event.input.select("");
									event.input.css({
										'width': '25%',
										'height':'36px',
										'line-height':'36px',
										'border':'1px solid #d2d2d2',
										'border-radius':'4px',
										'text-align': 'center',
									});
									var curr = w2ui["Risk"].get(event.recid);
									page.ori_recommendation = curr.recommendation;
									$.each(page.selectItem, function(i,v){
										if(v.text == curr.recommendation){
											event.input.val(v.id);
										}
									});
								} else {
									event.input.css({
										'width': '50%',
										'text-align': 'center',
									});
								}
								
								event.input.data('keep-open', true);
								page.curr_input.push(event.input);
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

	//当前选中推荐度
	page.getCurrList = function(itemCode){
		var text = "";
		if(!itemCode){
			text = "高";
		} else {
			$.each(page.selectItem, function(i,v){
				if(v.id == itemCode){
					text = v.text;
				}
			});

			if(text == ""){
				text = "高";
			}
		}

		return text;
	};

	//保存修改
	page.saveEdit = function(){
		utilObj.showLoading($("#wrap"),"正在保存");
		utilObj.ajax({
			url: "m/params/saveCostRiskConfig",
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
				costType: w2ui["Risk"].get(recid).costType,
				recommendationLevel: page.curr_input[0].val(),
				pd: page.curr_input[1].val()
			};

			//切换保存按钮
			$(this).text("编辑").removeClass("save-btn");

			//保存
			page.saveEdit();
		} else {
			if(page.curr_input && page.curr_input.length > 0){
				$.each(page.curr_input, function(i,v){
					if(i == 0){
						$_parent = v.parent("div");
						v.parent("div").removeClass("w2ui-editable");
						$_parent.text(page.ori_recommendation);
						v.remove();
					} else {
						v.data("keep-open",false).blur();
					}
				});
				page.curr_input = [];
				$(".save-btn").removeClass("save-btn").text("编辑");
			}
			
			$(this).text("保存").addClass("save-btn");
			w2ui["Risk"].editField(recid,1);
			w2ui["Risk"].editField(recid,2);
		}
		
	});
});