define(function(require,exports,module){
	//当前数据
	page.dataList = {
		TRADE: [],
		CREDIT:[],
		SIZE:[
			{
				listCode: "大型",
				listText: "大型",
				listChild: []
			},
			{
				listCode: "中型",
				listText: "中型",
				listChild: []
			},
			{
				listCode: "小型",
				listText: "小型",
				listChild: []
			},
			{
				listCode: "微型",
				listText: "微型",
				listChild: []
			}
		],
		STRATEGIC:[
			{
				listCode: "1",
				listText: "是",
				listChild: []
			},
			{
				listCode: "0",
				listText: "否",
				listChild: []
			},
		],
		DURATION:[
			{
				listCode: "0",
				listText: "<1年",
				listChild: []
			},
			{
				listCode: "1",
				listText: "1~2年",
				listChild: []
			},
			{
				listCode: "2",
				listText: "2~3年",
				listChild: []
			},
			{
				listCode: "3",
				listText: "3~4年",
				listChild: []
			},
			{
				listCode: "4",
				listText: "4~5年",
				listChild: []
			},
			{
				listCode: "5,6,7,8,9",
				listText: "5~10年",
				listChild: []
			},
			{
				listCode: "10",
				listText: "10年以上",
				listChild: []
			}
		],
		CATEGORY:[
			{
				listCode: "无贷户",
				listText: "无贷户",
				listChild: [
					{
						listCode: "白金卡",
						listText: "白金卡",
						listChild: []
					},
					{
						listCode: "普卡",
						listText: "普卡",
						listChild: []
					},
					{
						listCode: "银卡",
						listText: "银卡",
						listChild: []
					},
					{
						listCode: "金卡",
						listText: "金卡",
						listChild: []
					},
				]
			},
			{
				listCode: "休眠户",
				listText: "休眠户",
				listChild: []
			},
			{
				listCode: "有贷户",
				listText: "有贷户",
				listChild: [
					{
						listCode: "1",
						listText: "已出现风险",
						listChild: []
					},
					{
						listCode: "0",
						listText: "无风险",
						listChild: [
							{
								listCode: "未来之星",
								listText: "未来之星",
								listChild: []
							},
							{
								listCode: "限期改善",
								listText: "限期改善",
								listChild: []
							},
							{
								listCode: "现金牛",
								listText: "现金牛",
								listChild: []
							},
							{
								listCode: "提升收益",
								listText: "提升收益",
								listChild: []
							},
							{
								listCode: "价值创造",
								listText: "价值创造",
								listChild: []
							},
							{
								listCode: "价值中立",
								listText: "价值中立",
								listChild: []
							},
							{
								listCode: "价值毁灭",
								listText: "价值毁灭",
								listChild: []
							},
						]
					},
				]
			},
		],
		TYPE:[
			{
				listCode: "0",
				listText: "新增客户",
				listChild: []
			},
			{
				listCode: "1",
				listText: "存量客户",
				listChild: []
			},
		],
		MARK:[
			{
				listCode: "1",
				listText: "已标识为待规划客户",
				listChild: []
			},
			{
				listCode: "0",
				listText: "未标识为待规划客户",
				listChild: []
			},
		]
	};

	//已选中的项
	page.selectedItem = {
		TRADE: {
			level1: [],
			level2: [],
			level3: []
		},
		CREDIT:{
			level1: []
		},
		SIZE:{
			level1: []
		},
		STRATEGIC:{
			level1: []
		},
		DURATION:{
			level1: []
		},
		CATEGORY:{
			level1: [],
			level2: [],
			level3: []
		},
		TYPE:{
			level1: []
		},
		MARK:{
			level1: []
		}
	};

	//当前tab对应的key
	page.currKey = "";

	//弹出筛选
	page.switchSelectBox = function(){
		//第一次弹出，未选择标签
		if(page.currKey == "") {
			page.currKey = "STRATEGIC";
		}
		if(page.dataList[page.currKey].length > 0){
			page.setDataList();
		} else {
			switch(page.currKey){
				case "TRADE" :
					page.getTradeList();
					break;
				case "CREDIT" :
					page.getCreditList();
					break;
			}
		}
	};

	//获取行业
	page.getTradeList = function(){
		utilObj.showLoading($("#wrap"),"加载中");
		utilObj.ajax({
			url: "m/trade/findTradeList",
			success: function(data){
				if(data && data.object.length > 0){
					page.dataList[page.currKey] = [];					
					$.each(data.object, function(i,v){
						if(v.tradeList.length > 0){
							var level2 = [];
							$.each(v.tradeList, function(j,k){
								if(k.tradeList.length > 0){
									var level3 = [];
									$.each(k.tradeList, function(l,m){
										level3.push({
											listCode: m.level3,
											listText: m.level3
										});
									});
									level2.push({
										listCode: k.level2,
										listText: k.level2,
										listChild: level3
									});
								} else{
									level2.push({
										listCode: k.level2,
										listText: k.level2,
										listChild: []
									});
								}
							});
							page.dataList[page.currKey].push({
								listCode: v.level1,
								listText: v.level1,
								listChild: level2
							});
						} else {
							page.dataList[page.currKey].push({
								listCode: v.level1,
								listText: v.level1,
								listChild: []
							});
						}
					});
					utilObj.hideLoading($("#wrap"));
					page.setDataList();
				}
			},
			error: function(err){
				utilObj.hideLoading($("#wrap"));
			}
		});
	};

	//获取信用评级
	page.getCreditList = function(){
		utilObj.ajax({
			url: "m/config/findCreditLever",
			success: function(data){
				if(data && data.object.length > 0){
					$.each(data.object, function(i,v){
						page.dataList[page.currKey].push({
							listCode: v.creditCode,
							listText: v.creditCode,
							listChild: []
						});
					});
					page.setDataList();
				}
			},
			error: function(err){}
		});
	};

	




	

	//配置行业显示
	page.setDataList = function(){
		utilObj.showLoading($("#w2ui-popup"),"加载中");
		$().w2popup("open",{
			name: "client-filter",
			title: "筛选条件",
			width: 1000,
			height: 800,
			body: template("popupSelect"),
			onOpen: function(event){
				event.onComplete = function(){
					$(".tab-ul > .tab-item[data-type='"+page.currKey+"']").addClass("item-selected");

					//生成结构
					var level1 = "";
					var level2 = "";
					var level3 = "";
					$.each(page.dataList[page.currKey], function(i,v){
						if(v.listChild.length > 0){
							level2 += "<div class='level2-wrap' data-parent='"+v.listCode+"'>";
							$.each(v.listChild, function(j,k){
								if(k.listChild.length > 0){
									level3 += "<div class='level3-wrap' data-parent='"+k.listCode+"'>";
									$.each(k.listChild, function(l,m){
										level3 += [
											"<div class='check-item item-level3' data-code='"+m.listCode+"'>",
												"<span class='item-check-icon'></span>",
												"<span class='item-dec'>"+m.listText+"</span>",
											"</div>"
										].join("");
									});
									level3 += "</div>";
								}

								level2 += [
									"<div class='check-item item-level2' data-code='"+k.listCode+"'>",
										"<span class='item-check-icon'></span>",
										"<span class='item-dec'>"+k.listText+"</span>",
									"</div>"
								].join("");

							});
							level2 += "</div>";
						}

						level1 += [
							"<div class='check-item item-level1' data-code='"+v.listCode+"'>",
								"<span class='item-check-icon'></span>",
								"<span class='item-dec'>"+v.listText+"</span>",
							"</div>"
						].join("");
					});

					//当前三级选择对象
					page.curr_level1 = $(".select-wrap[data-target='"+page.currKey+"'] > .list-level1");
					page.curr_level2 = $(".select-wrap[data-target='"+page.currKey+"'] > .list-level2");
					page.curr_level3 = $(".select-wrap[data-target='"+page.currKey+"'] > .list-level3");

					//生成DOM
					page.curr_level1.html(level1);
					page.curr_level2.html(level2);
					page.curr_level3.html(level3);

					//显示默认
					setTimeout(function(){
						var levelCode1 = page.curr_level1.children(".check-item").eq(0).addClass("selected-level1").data('code');
//						var levelCode1 = page.curr_level1.children(".check-item").eq(0).data('code');
						var levelCode2 = page.curr_level2.children(".level2-wrap[data-parent='"+levelCode1+"']").addClass("list-shown").children(".check-item").eq(0).addClass("selected-level2").data('code');
						page.curr_level3.children(".level3-wrap[data-parent='"+levelCode2+"']").addClass("list-shown");

						page.matchSelectedLevel();
					},100);
				}
			}
		});
	};

	//是否已选中
	page.matchSelectedLevel = function(){

		//从level3开始勾选
		if(page.selectedItem[page.currKey].level3 && page.selectedItem[page.currKey].level3.length > 0){
			$.each(page.selectedItem[page.currKey].level3,function(i,v){
				page.curr_level3.find(".item-level3[data-code='"+v.levelCode+"']").addClass("full-checked");
			});
		}

		//level2选中
		if(page.selectedItem[page.currKey].level2 && page.selectedItem[page.currKey].level2.length > 0){
			$.each(page.selectedItem[page.currKey].level2,function(i,v){
				var $_level3 = page.curr_level3.children(".level3-wrap[data-parent='"+v.levelCode+"']");
				var level3_checked = $_level3.children(".full-checked").size();
				var level3_size = $_level3.children(".item-level3").size();
				var $_level2 = page.curr_level2.find(".item-level2[data-code='"+v.levelCode+"']");
				if(level3_checked == level3_size){//全选
					$_level2.addClass("full-checked");
				} else if(level3_checked > 0){
					$_level2.addClass("half-checked");
				} else {
					$_level2.removeClass("full-checked half-checked");
				}			
			});
		}

		//level1选中
		if(page.selectedItem[page.currKey].level1 && page.selectedItem[page.currKey].level1.length > 0){
			$.each(page.selectedItem[page.currKey].level1,function(i,v){
				var $_level2 = page.curr_level2.children(".level2-wrap[data-parent='"+v.levelCode+"']");
				var level2_checked = $_level2.children(".full-checked").size();
				var level2_half = $_level2.children(".half-checked").size();
				var level2_size = $_level2.children(".item-level2").size();
				var checked = level2_checked + level2_half;
				var $_level1 = page.curr_level1.find(".item-level1[data-code='"+v.levelCode+"']");
				if(checked == level2_size){//全选
					$_level1.addClass("full-checked");
				} else if(checked > 0){
					$_level1.addClass("half-checked");
				} else {
					$_level1.removeClass("full-checked half-checked");
				}			
			});
		}

		//显示对应标签的选项
		$(".select-wrap[data-target='"+page.currKey+"']").show().siblings(".select-wrap").hide();

		utilObj.hideLoading($("#w2ui-popup"));
	};

	//Level1选中/取消
	page.changeLevel1CheckStatus = function($_level1){

		var checked = $_level1.hasClass("full-checked") ? true : false;

		var $_level2 = page.curr_level2.children(".level2-wrap[data-parent='"+$_level1.attr("data-code")+"']");
		$.each($_level2.children(".item-level2"), function(i,v){
			//变更level2状态
			if(checked){
				$(v).removeClass("half-checked").addClass("full-checked");
			} else {
				$(v).removeClass("half-checked full-checked");
			}
			
			//变更level3状态
			var $_level3 = page.curr_level3.children(".level3-wrap[data-parent='"+$(v).attr("data-code")+"']");
			$.each($_level3.children(".item-level3"),function(j,k){
				if(checked){
					$(k).removeClass("half-checked").addClass("full-checked");
				} else {
					$(k).removeClass("half-checked full-checked");
				}
			});
		});

		//记录选中项
		page.saveLevel1();
		page.saveLevel2();
		page.saveLevel3();
	};

	//Level2选中/取消
	page.changeLevel2CheckStatus = function(){
		//var $_level1 = $(".select-wrap[data-target="+page.currKey+"] > .list-level1 > .item-level1[data-code="+$(".list-level2 > .list-shown").attr("data-parent")+"]");
		var $_level1 = $(".item-level1[data-code='"+$(".list-level2 > .list-shown").attr("data-parent")+"']");
		var $_level2 = $(".list-level2 > .list-shown > .item-level2");
		var $_full_items = $(".list-level2 > .list-shown > .full-checked");
		var $_half_items = $(".list-level2 > .list-shown > .half-checked");
		var full_size = $_full_items.size();
		var half_size = $_half_items.size();
		var checked = full_size + half_size;
		var total = $_level2.size();

		//level1变化
		if(checked == total){//全选
			$_level1.removeClass("half-checked").addClass("full-checked");
		} else if(checked > 0){//部分选
			$_level1.removeClass("full-checked").addClass("half-checked");
		} else {//全不选
			$_level1.removeClass("half-checked full-checked");
		}

		//level3变化
		$.each($_level2, function(i,v){
			if($(v).hasClass("full-checked")){//三级全选
				$(".level3-wrap[data-parent='"+$(v).attr("data-code")+"']").children(".item-level3").addClass("full-checked");
			} else if($(v).hasClass("half-checked")){//三级不变

			} else {//三级全不选
				$(".level3-wrap[data-parent='"+$(v).attr("data-code")+"']").children(".item-level3").removeClass("full-checked");
			}
		});

		//记录选中项
		page.saveLevel1();
		page.saveLevel2();
		page.saveLevel3();
	};

	//level3选中/取消
	page.changeLevel3CheckStatus = function(){
		var $_level3 = $(".list-level3 > .list-shown");
		var $_level2_item = $(".list-level2 > .list-shown > .selected-level2");
		var level3_items = $_level3.children(".check-item").size();
		var level3_checked = $_level3.children(".full-checked").size();

		//leve2变化
		if(level3_items == level3_checked){//全选
			$_level2_item.addClass("full-checked").removeClass("half-checked");
		} else if(level3_checked > 0){//部分选择
			$_level2_item.addClass("half-checked").removeClass("full-checked");
		} else {//全不选
			$_level2_item.removeClass("full-checked half-checked");
		}

		//level1变化
		var $_level2_shown = $(".list-level2 > .list-shown");
		var $_level1 = $(".item-level1[data-code='"+$_level2_shown.attr("data-parent")+"']");
		var level2_full_checked = $_level2_shown.children(".full-checked").size();
		var level2_half_checked = $_level2_shown.children(".half-checked").size();
		var total = $_level2_shown.children(".item-level2").size();
		var checked = level2_full_checked + level2_half_checked;
		if(checked == total){//全选
			$_level1.addClass("full-checked").removeClass("half-checked");
		} else if(checked > 0){
			$_level1.addClass("half-checked").removeClass("full-checked");
		} else {
			$_level1.removeClass("full-checked half-checked");
		}

		//记录选中项
		page.saveLevel1();
		page.saveLevel2();
		page.saveLevel3();
	};

	//重新赋值level1
	page.saveLevel1 = function(){
		page.selectedItem[page.currKey].level1 = [];
		$.each(page.curr_level1.children(".full-checked,.half-checked"), function(i,v){
			page.selectedItem[page.currKey].level1.push({
				name: $(v).children(".item-dec").text(),
				levelCode: $(v).attr("data-code")
			});
		});
	};

	//重新赋值level2
	page.saveLevel2 = function(){
		page.selectedItem[page.currKey].level2 = [];
		$.each(page.curr_level2.find(".full-checked,.half-checked"), function(i,v){
			page.selectedItem[page.currKey].level2.push({
				parent: $(v).parent(".level2-wrap").attr("data-parent"),
				levelCode: $(v).attr("data-code")
			});
		});
	};

	//重新赋值level3
	page.saveLevel3 = function(){
		page.selectedItem[page.currKey].level3 = [];
		$.each(page.curr_level3.find(".full-checked"), function(i,v){
			page.selectedItem[page.currKey].level3.push({
				parent: $(v).parent(".level3-wrap").attr("data-parent"),
				levelCode: $(v).attr("data-code")
			});
		});

		console.log(page.selectedItem);
	};

	/*********************************/

	//弹出筛选
	$(document).on("click",".screen__select-btn",function(){
		page.switchSelectBox();
	});

	//点击level1显示level2和level3
	$(document).on("click",".item-level1 > .item-dec", function(){
		var $_parent = $(this).parent(".item-level1");
		if($_parent.hasClass("selected-level1")){
			return false;
		} else {
			
			//level1添加选中效果
			$_parent.addClass("selected-level1").siblings(".item-level1").removeClass("selected-level1");
			page.currLevel1 = $_parent;

			//leve2联动
			var $_level2 = $(".level2-wrap[data-parent='"+$_parent.attr("data-code")+"']");
			$(".level2-wrap").removeClass("list-shown");
			if($_level2 != null){
				$_level2.addClass("list-shown").children(".check-item").eq(0).addClass("selected-level2").siblings(".check-item").removeClass("selected-level2").end();
				page.currLevel2 = $_level2;
			} else {
				page.currLevel2 = null;
			}
			
			//level3联动
			var $_level3 = $(".level3-wrap[data-parent='"+$_level2.children(".selected-level2").attr("data-code")+"']");
			$(".level3-wrap").removeClass("list-shown");
			if($_level3 != null){
				$_level3.addClass("list-shown");
				page.currLevel3 = $_level3;
			} else {
				page.currLevel3 = null;
			}	
		}
	});

	//勾选level1
	$(document).on("click",".item-level1 > .item-check-icon",function(event){
		var $_item = $(this).parent(".item-level1");
		if($_item.hasClass("full-checked")){//转换为全不选
			$_item.removeClass("full-checked");
		} else if($_item.hasClass("half-checked")){//转换为全选
			$_item.removeClass("half-checked").addClass("full-checked");
		} else {//转换为全选
			$_item.addClass("full-checked");
		}

		page.changeLevel1CheckStatus($_item);
	});

	//勾选level2
	$(document).on("click",".item-level2 > .item-check-icon",function(event){
		var $_item = $(this).parent(".item-level2");
		if($_item.hasClass("full-checked")){//转换为全不选
			$_item.removeClass("full-checked");
		} else if($_item.hasClass("half-checked")){//转换为全选
			$_item.removeClass("half-checked").addClass("full-checked");
		} else {//转换为全选
			$_item.addClass("full-checked");
		}

		page.changeLevel2CheckStatus($_item);
	});

	//点击leve2显示level3
	$(document).on("click",".item-level2 > .item-dec",function(event){
		var $_item = $(this).parent(".item-level2");
		if($_item.hasClass("selected-level2")){
			return false;
		} else {
			
			//level1添加选中效果
			$_item.addClass("selected-level2").siblings(".item-level2").removeClass("selected-level2");

			$(".level3-wrap").removeClass("list-shown");
			$(".level3-wrap[data-parent='"+$_item.attr("data-code")+"']").addClass("list-shown");
		}
	});

	//点击选中level3
	$(document).on("click",".item-level3",function(){
		if($(this).hasClass("full-checked")){//已选中则变成未选中
			$(this).removeClass("full-checked");
		} else {
			$(this).addClass("full-checked");
		}

		page.changeLevel3CheckStatus();
	});

	//点击切换tab
	$(document).on("click",".tab-item",function(){
		if($(this).hasClass(".item-selected")){
			return false;
		} else {
			$(this).addClass("item-selected").siblings(".tab-item").removeClass("item-selected");
			page.currKey = $(this).attr("data-type");
			page.switchSelectBox();
		}
	});
	//点击弹框的重置按钮
	$(document).on("click",".reset-btn", function(){

		//已选中的项
		page.selectedItem.TRADE.level1 = [];
		page.selectedItem.TRADE.level2 = [];
		page.selectedItem.TRADE.level3 = [];
		page.selectedItem.CREDIT.level1 = [];
		page.selectedItem.SIZE.level1 = [];
		page.selectedItem.STRATEGIC.level1 = [];
		page.selectedItem.CATEGORY.level1 = [];
		page.selectedItem.CATEGORY.level2 = [];
		page.selectedItem.CATEGORY.level3 = [];
		page.selectedItem.TYPE.level1 = [];
		page.selectedItem.DURATION.level1 = [];
		page.selectedItem.MARK.level1 = [];

		$(".full-checked,.half-checked").removeClass("full-checked half-checked");

		$(".screen__conditions").html("");
	});
	
	module.exports = page.selectedItem;
});