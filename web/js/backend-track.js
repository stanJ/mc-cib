define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}

	page.columns = [
		{field: "phase", caption: "阶段", size: "20%", attr: "align=center"},
		{field: "benchmark", caption: "基准", size: "20%", attr: "align=center", editable:{
			type: 'int',
			max: 100,
			min: 0
		}},
		{field: "warningRatio", caption: "预警天数(天)", size: "20%", attr: "align=center", editable:{
			type: 'int',
			max: 100,
			min: 0
		}},
		{field: "score", caption: "产能积分", size: "20%", attr: "align=center", editable:{
			type: 'int',
			max: 100,
			min: 0
		}},
		{field: "option", caption: "操作", size: "20%", attr: "align=center"},
		{field: "benchmarkId", caption: "",size:"1%", hidden:true}
	];

	page.records = [];

	page.curr_input = [];

	//获得当前预警提前量
	page.getWranning = function(){
		utilObj.ajax({
			url: "m/params/findWarnningDay",
			success: function(data){
				if(data && data.object){
					page.wranning = data.object;
				} else {
					page.wranning = 0;
				}
			}
		});
	};

	//保存提前预警
	page.saveWranning = function(day){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/saveWarnningDay",
			data: {day: day},
			success: function(data){
				if(data){
					dfd.resolve(data);
				}
			},
			error: function(err){
				dfd.resolve(err);
			}
		});

		return dfd.promise();
	};

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/params/findBenchmarkPage",
			data: page.params,
			success: function(data){
				if(data && data.object && data.object.content.length > 0){
					page.records = [];
					$.each(data.object.content, function(i,v){
						page.records.push({
							recid: i,
							phase: v.phase,
							benchmark: v.benchmark,
							warningRatio: v.warningRatio,
							score: v.score,
							option: "<span class='edit-btn' data-recid='"+i+"'>编辑</span>",
							benchmarkId: v.benchmarkId
						});
					});
				} else {

				}

				if(w2ui["Track"]){
					w2ui.Track.clear();
					w2ui.Track.records = page.records;
					w2ui.Track.refresh();
				} else {
					$("#myGrid").w2grid({
						name: "Track",
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
			url: "m/params/saveBenchmark",
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
		page.getWranning();
	});

	//编辑/保存
	$(document).on("click",".edit-btn",function(){
		var recid = $(this).attr("data-recid");
		if($(this).hasClass("save-btn")){
			//保存参数
			page.saveParam = {
				benchmarkId: w2ui["Track"].get(recid).benchmarkId,
				benchmark: page.curr_input[0].val(),
				warningRatio: page.curr_input[1].val(),
				score: page.curr_input[2].val()
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
			w2ui["Track"].editField(recid,1);
			w2ui["Track"].editField(recid,2);
			w2ui["Track"].editField(recid,3);
		}
	});

	//设置预警提前量
	$(document).on("click",".warnning-btn",function(){
		$("#popup-wrap").w2popup({
			title: "销售预警提前量",
			onOpen: function(event){
				event.onComplete = function(){
					//输入框
					$("#w2ui-popup input").w2field('int',{max: 365,min: 0});
					$("#w2ui-popup input").val(page.wranning);
				}
			}
		});
	});

	//点击确定
	$(document).on("click",".confirm-btn",function(){
		var days = $("#w2ui-popup input").val();
		if(days < 0 || days == ""){
			w2alert("只能填写正整数");
			return false;
		} else {
			utilObj.showLoading($("#wrap"),"保存中");
			$.when(page.saveWranning(days)).done(function(){
				$.when(page.getWranning()).done(function(){
					utilObj.hideLoading($("#wrap"));
					w2popup.close();
				});				
			});
		}
	});

	//点击取消
	$(document).on("click",".cancel-btn",function(){
		$("#w2ui-popup input").val("");
		w2popup.close();
	});
});