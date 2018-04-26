define(function(require,exports,module){
	require("../css/simplePagination.css");
	require("../js/common/jquery.simplePagination.js");

	var page = {};
	page.params = {
		keyword: "",
		nextPage: 0,
		pageSize: 100
	}

	page.tmpPage = 0;
	page.tmpVal = "";
	page.isSearch = false;
	
	page.employeeId = utilObj.userLogined.employeeId;
	
	page.getParams = function(obj){
		var params = {};
		params.year = $("#year-select").val();
		params.month = $("#month-select").val();
		params.keyword = page.params.keyword;
		params.nextPage = page.params.nextPage;
		params.pageSize = page.params.pageSize;
		if(obj){
			params = $.extend(params, obj);
		}
		return params;
	};
	
	page.columns = [
		{field: "customerCode", caption: "客户编号", size: "11%", attr: "align=center"},
		{field: "customerName", caption: "客户名称", size: "11%", attr: "align=center",},
		{field: "accountPeriod", caption: "时间范围", size: "11%", attr: "align=center",},
		{field: "productName", caption: "产品名称", size: "11%", attr: "align=center",},
		{field: "balance", caption: "余额(元)", size: "11%", attr: "align=center"},
		{field: "balanceDaily", caption: "日均余额(元)", size: "11%", attr: "align=center",},
		{field: "ftpIncome", caption: "FTP净收入(元)", size: "11%", attr: "align=center",},
		{field: "middleIncome", caption: "中间业务收入(元)", size: "11%", attr: "align=center",},
		{field: "balanceRelease", caption: "风险缓释日均余额(元)", size: "11%", attr: "align=center",},
	];
	//绑定表格
	page.getTableData = function(){
		var vm = this;
		utilObj.ajax({
			url: 'm/biz/findPageCustomerBizData',
			data: this.getParams(),
			success: function(data){
				var ary = utilObj.addRecid(data.object.content, 'customerId');
				vm.data = ary;
				if(ary.length > 0){
					var pageObj = {
						numberOfElements: data.object.numberOfElements,
						totalElements: data.object.totalElements,
						firstPage: data.object.firstPage,
						lastPage: data.object.lastPage,
						size: data.object.size
					};

					if($(".page-size").size() == 0){
						var pages = [
							"<div class='page-size'>",
								"<span>每页"+page.params.pageSize+"条记录</span>",
								"<span>/共"+pageObj.totalElements+"条记录</span>",						
							"</div>"
						].join("");

						$("#pagination").before(pages);
					} else {
						$(".page-size").children("span").eq(0).text("每页"+page.params.pageSize+"条记录");
						$(".page-size").children("span").eq(1).text("/共"+pageObj.totalElements+"条记录");
					}

					$(".page-size").show();
					page.pagination(pageObj);

					vm.loadTable();
				} else {
					if(!page.isSearch){
						utilObj.currNoData();
					}
					$(".page-size").hide();
					$("#pagination").hide();
				}
			}
		});
		
	};
	
	page.loadTable = function(){
		if(!w2ui.customerData){
			$("#myGrid").w2grid({
				name: "customerData",
				total: 10,
				limit: 200,
				recordHeight: 44,
				selectType: "row",
				multiSelect: false,
				show: { 
		            toolbar: true,
					toolbarReload: false,
					toolbarColumns: false,
					toolbarSearch: false,
					recordTitles: false,
					footer: true
		        },
		        multiSearch: true,
		        searches: [
		            { field: 'customerName', caption: '客户名称', type: 'text', operator: "contains"},
		            { field: 'customerCode', caption: '客户编号', type: 'text', operator: "contains"},
		            { field: 'productName', caption: '产品名称', type: 'text', operator: "contains"},
		            { field: "all",caption: "客户名称,客户编号,产品名称",type:"text", operator: "contains"},
		        ],
		        toolbar: {
					items: [
						{ type: 'html',  id: 'item5',
			                html: function (item) {
			                    var html = [
			                    	"<div style='padding: 0 10px;'>",
			                    	"	<input size='15' onkeydown='if(event.keyCode == 13){var grid = w2ui[\"customerData\"]; grid.search(this.value);}' style='padding: 3px; width: 150px; height: 24px; border-radius: 2px; border: 1px solid silver;' placeholder='客户名称,客户编号,产品名称' value='"+ (page.tmpVal || '') +"' />",
			                    	"</div>"
			                    ].join("");
			                    return html;
			                },
			            },
					],
				},
				columns: this.columns,
				records: this.data,
				onDblClick: function(event){
					event.preventDefault();
				},
				onClick: function(event){
					event.preventDefault();
				},
				onSearch: function(obj){
					var val = obj.searchValue;
					if($.trim(val).length > 0){
						page.params.keyword = val;
						page.tmpVal = val;
						page.params.nextPage = 0;
						page.isSearch = true;
						page.getTableData();
					} else {
						page.params.keyword = "";
						page.tmpVal = "";
						page.params.nextPage = page.tmpPage;
						page.isSearch = false;
						page.getTableData();
					}
				}
			});
		}else{
			w2ui['customerData'].clear();
			w2ui['customerData'].records = this.data;
			w2ui['customerData'].refresh();
			$("#myGrid").w2render('customerData');
		}

		$("#empty-data").hide();
		$("#myGrid").show();
		$("#pagination").show();
	};


	//分页
	page.pagination = function(obj){
		$("#pagination").pagination("destroy");
		$("#pagination").pagination({
			cssStyle: "light-theme",
			items: obj.totalElements,
			itemsOnPage: page.params.pageSize,
			currentPage: (page.params.nextPage+1),
			displayedPages: 5,
			edges: 1,
			prevText: "上一页",
			nextText: "下一页",
			ellipsePageSet: true,
			onInit: function(){
			},
			onPageClick: function(pageNumber,event){
				page.params.nextPage = (pageNumber - 1);
				page.tmpPage = (pageNumber - 1);
				page.getTableData();
			}
		});
	};
	
	page.bindEvent = function(){
		var vm = this;
		$("#import-customer").change(function(e){
			var file = e.target.files[0];
			if(!file){
				return;
			}
			var form = new FormData();
			form.append("excelFile", file);
			utilObj.ajax({
				url: 'm/input/inputCustomerBizData',
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
	    $("#year-select").on("select2:select", function(e){
	    	page.getTableData();
	    });

	    $("#month-select").on("select2:select", function(e){
	    	page.getTableData();
	    });
	};
	page.loadYearSelect = function(){
		var optstr = '';
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/biz/findYearList",
			success: function(data){
				if (data && data.object.length > 0) {
                    _.each(data.object, function(v, i) {
                        optstr += "<option value='" + v + "'>" + v + "年</option>";
                    });
                }
            	$("#year-select").html(optstr).select2({
		            width: "100%",
		            language: selet2LangZh,
		            minimumResultsForSearch: -1
		        });

		        var select_data = [];
            	for(i = 1; i < 13; i++){
            		//monthstr += "<option value='"+i+"'>"+i+"月</option>";
            		select_data.push({
            			id: i,
            			text: i+"月"
            		});
            	}
		        $("#month-select").select2({
		            width: "100%",
		            data: select_data,
		            language: selet2LangZh,
		            minimumResultsForSearch: -1
		        });
		        $("#month-select").select2("val",(new Date().getMonth()+1).toString());
		        dfd.resolve(data);
			}
		});
		return dfd.promise();
	};
	
/********************************************************************/
	page.bindEvent();
	$.when(page.loadYearSelect())
	.done(function(){
		page.getTableData();
	});
});