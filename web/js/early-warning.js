define(function(require,exports,module){
	var page = {};

	/*mork data bank1*/
	var bank1 = [
		{
			name: "上海分行",
			code: "0210001"
		},
		{
			name: "广州分行",
			code: "0310001"
		},
		{
			name: "北京分行",
			code: "0100001"
		}
	];

	var bank2 = [
		{
			name: "静安支行",
			code: "0210011"
		},
		{
			name: "黄埔支行",
			code: "0210012"
		},
		{
			name: "徐汇支行",
			code: "0210013"
		}
	];

	//分行
	page.getSubsidiaryBank = function(){
		/*utilObj.ajax({
			utl: "",
			success: function(data){
				if(data && data.object.length > 0){

				}
			}
		});*/
		var optstr = "<option></option>";
		_.each(bank1, function(v,i){
			optstr += "<option value='"+ v.code +"'>"+v.name+"</option>";
		});

		$("#subsidiary").html(optstr).select2({
			width:"100%",
			placeholder: "分行[All]",
			allowClear: true,
			minimumResultsForSearch: -1
		});
	};

	//支行
	page.getBranchBank = function(){
		/*utilObj.ajax({
			utl: "",
			success: function(data){
				if(data && data.object.length > 0){

				}
			}
		});*/

		var optstr = "<option></option>";
		_.each(bank2, function(v,i){
			optstr += "<option value='"+ v.code +"'>"+v.name+"</option>";
		});

		$("#branch").html(optstr).select2({
			width:"100%",
			placeholder: "支行[All]",
			allowClear: true,
			minimumResultsForSearch: -1
		});
	};

	//表格
	page.bindGrid = function(){
		/*utilObj.ajax({
			url: "",
			success: function(data){
				if(data && data.object.length > 0){
	
				}
			}
		});*/

		$("#myGrid").w2grid({
			name: "timeConsuming",
			total: 10,
			limit: 200,
			recordHeight: 60,
			columns: [
				{field: "cnumber", caption: "客户编号", size: "11%", attr: "align=center"},
				{field: "cname", caption: "客户名称", size: "11%", attr: "align=center"},
				{field: "clewinfo", caption: "线索信息", size: "11%", attr: "align=center"},
				{field: "warning", caption: "预警环节", size: "11%", attr: "align=center"},
				{field: "reason", caption: "停滞原因", size: "11%", attr: "align=center"},
				{field: "currwork", caption: "目前工作", size: "11%", attr: "align=center"},
				{field: "deadline", caption: "时间节点", size: "11%", attr: "align=center"},
				{field: "sub", caption: "所属分行", size: "11%", attr: "align=center"},
				{field: "branch", caption: "所属支行", size: "11%", attr: "align=center"}
			],
			records: [
				{
					recid: 1,
					cnumber: "A111111111",
					cname: "xxxx分公司",
					clewinfo:"1",
					warning:"5",
					reason:"9",
					currwork:"3",
					deadline:"8",
					sub:"2",
					branch:"7",
				},
				{
					recid: 2,
					cnumber: "A111111111",
					cname: "xxxx分公司",
					clewinfo:"1",
					warning:"5",
					reason:"9",
					currwork:"3",
					deadline:"8",
					sub:"2",
					branch:"7",
				}
			]
		});
	};

/********************************************************************/

	$("#myGrid").height($("#right-main-content").height() - 50);

	page.getSubsidiaryBank();
	page.getBranchBank();
	page.bindGrid();


	//点击filter
	$(document).on("click",".filter-item",function(){
		if($(this).hasClass("filter-selected")){
			return false;
		} else {
			$(this).addClass("filter-selected").siblings(".filter-item").removeClass("filter-selected");
		}
	});
});