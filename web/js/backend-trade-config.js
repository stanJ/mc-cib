define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}
	
	page.employeeId = utilObj.userLogined.employeeId;
	
	page.columns = [
		{field: "tradeCode", caption: "行业代码", size: "11%", attr: "align=center"},
		{field: "level1", caption: "一级行业", size: "11%", attr: "align=center",},
		{field: "level2", caption: "二级行业", size: "11%", attr: "align=center",},
		{field: "level3", caption: "三级行业", size: "11%", attr: "align=center",},
	];
	//绑定表格
	page.getTableData = function(){
		var vm = this;
		utilObj.ajax({
			url: 'm/trade/findTradeList',
			data: {
				
			},
			success: function(data){
				var ary = vm.changeTreeData(data.object);
				vm.data = ary;
				vm.loadTable();
			}
		});
		
	};
	//加工树状结构数据里的一层数据
	page.changeTreeDataOne = function(data, res, index, count){
		var vm = this;
		index++;
		$.each(data, function(i, val) {
			count++;
			var obj = {
				tradeCode: val.tradeCode,
				level1: val.level1,
				level2: val.level2,
				level3: val.level3,
				recid: count,
			}
			if(val.tradeList && val.tradeList.length>0){
				if(index == 1){
					obj.level1 = "<span class='slider_down' data-recid='"+obj.recid+"'>"+val.level1+"</span>";
				}else if(index == 2){
					obj.level2 = "<span class='slider_down' data-recid='"+obj.recid+"'>"+val.level2+"</span>";
				}
				obj.w2ui = {
					children: [],
				}
				var result = vm.changeTreeDataOne(val.tradeList, [], index, count);
				obj.w2ui.children = result.records;
				count = result.count;
			}
			res.push(obj);
		});
		return {
			records: res,
			count: count,
		};
	};
	//加工树状结构数据
	page.changeTreeData = function(data){
		var records = [];
		var index = 0;
		var count = 0;
		records = this.changeTreeDataOne(data, records, index, count).records;
		return records;
	};
	page.loadTable = function(){
		if(!w2ui.trade){
			$(".trade-table").w2grid({
				name: "trade",
				show: { 
		            toolbar: true,
		            footer: false,
		            toolbarReload: false,
		            toolbarColumns: false,
					toolbarSearch: false,
		        },
		        multiSearch: true,
		        searches: [
		            { field: 'level1', caption: '一级行业', type: 'text', operator: "contains"},
		            { field: 'tradeCode', caption: '行业代码', type: 'text', operator: "contains"},
		             { field: "all",caption: "一级行业,行业代码",type:"text", operator: "contains"},
		        ],
				recordHeight: 44,
				fixedBody: false,
				columns: this.columns,
				records: this.data,
				onDblClick: function(event){
					event.preventDefault();
				}
			});
		}else{
			w2ui['trade'].records = this.data;
			w2ui['trade'].refresh();
			$(".trade-table").w2render('trade');
		}
	};
	
	
	page.bindEvent = function(){
		var vm = this;
		$("#import-trade").change(function(e){
			var file = e.target.files[0];
			if(!file){
				return;
			}
			var form = new FormData();
			form.append("excelFile", file);
			utilObj.ajax({
				url: 'm/input/inputTrade',
				data: form,
				contentType: false,
				processData: false,
				beforeSend: function(){
					utilObj.showLoading('#wrap', '上传中');
				},
				complete: function(){
					utilObj.hideLoading('#wrap');
				},
				success: function(data){
					vm.getTableData();
					utilObj.clearFile(e.target);
					w2alert('上传成功', '提示');
				}
			})
		});
		//点击展开
		$(document).on("click",".slider_down",function(){
			var recid = $(this).attr("data-recid");
			w2ui['trade'].toggle(recid);
		});
	};
	
/********************************************************************/
	page.bindEvent();
	page.getTableData();
});