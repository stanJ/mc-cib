define(function(require,exports,module){
	var page = {};
	var organization = 'bankSubsetName';
	if(utilObj.userLogined.roleId == 3){
		organization = 'bankBranchName';
	}
	
	//tab选项
	var filter_data = [
		{
			name: "行业",
			value: "level1"
		},
		{
			name: "信用评级",
			value: "creditRating"
		},
		{
			name: "客户规模",
			value: "customerSize"
		},
		{
			name: "客户机构",
			value: organization
		},
		{
			name: "合作时长",
			value: "cooperationYear"
		},
		{
			name: "客户经理",
			value: "employeeId"
		},
	];
	page.employeeId = utilObj.userLogined.employeeId;
	page.useUrlParams = true;
	//获取url参数
	page.getUrlParams = function(){
		var obj = null;
		var res = url('?');
		if(res){
			obj = {};
			obj.bankBranchCode = res.subsidiary;
			obj.bankSubsetCode = res.branch;
			obj.year = res.year;
			obj.card = $("#card").val() != '普通卡'?$("#card").val():'普卡';
			obj.groupBy = $(".tab-filter-selected").attr("data-val");
			obj.employeeId = this.employeeId;
		}
		return obj;
	};
	//获取查询参数
	page.getParams = function(obj){
		var urlParams = this.getUrlParams();
		var params = {};
		if(urlParams && this.useUrlParams){
			$("#subsidiary").val(urlParams.bankBranchCode).trigger('change');
			$("#branch").val(urlParams.bankSubsetCode).trigger('change');
			$("#estimate").val(urlParams.year).trigger('change');
			this.useUrlParams = false;
			return urlParams;
		}else{
			params.bankBranchCode = $("#subsidiary").val();
			params.bankSubsetCode = $("#branch").val();
			params.year = $("#estimate").val();
			params.card = $("#card").val() != '普通卡'?$("#card").val():'普卡';
			params.employeeId = this.employeeId;
			//首列字段
			params.groupBy = $(".tab-filter-selected").attr("data-val");
			if(obj){
				params = $.extend(params, obj);
			}
			
			return params;
		}
	};

	//筛选条件
	page.getFilter = function(){
		var filter_str = "";
		_.each(filter_data, function(v,i){
			filter_str += "<li class='tab-filter-item' data-val='" + v.value + "'>" + v.name + "<div class='move-mark bg-base-blue'></div></li>";
		});

		$("#line-filter").append(filter_str);
		$(".tab-filter-item").eq(0).addClass("tab-filter-selected");
	};

	page.getTableData = function(obj){
		var vm = this;
		var params = vm.getParams(obj);
		utilObj.ajax({
			url: 'm/noLoanAccount/findNoLoanAccountDetail',
			data: params,
			success: function(data){
				var ary = utilObj.addRecid(data.object);
				vm.data = ary;
				vm.loadTable(params);
			}
		})
	};
	page.loadTable = function(obj){
		var columns = [
			{field: "group", caption: "<span style='font-size: 18px'>"+obj.card+"</span>", size: "16%", attr: "align=center"},
			{field: "dailyAverageDepositRatio", caption: "日均存款占比(%)", size: "9%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += record.dailyAverageDepositRatio + '%';
					return h;
				}
			},
			{field: "account", caption: "客户数量(个)", size: "9%", attr: "align=center"},
			{field: "dailyAverageDeposit", caption: "客户日均存款(亿)", size: "9%", attr: "align=center"},
			{field: "economicProfit", caption: "经济利润(%)", size: "9%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += record.economicProfit + '%';
					return h;
				}
			},
			{field: "depositEconomicProfit", caption: "存款经济利润(%)", size: "9%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += record.depositEconomicProfit + '%';
					return h;
				}
			},
			{field: "", caption: "操作", size: "9%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					if(record.group != '合计'){
						h += '<span class="operation operation--edit" data-cid="'+record.customerIdStr+'" data-id="'+record.recid+'" data-index="'+index+'">清单</span>';
					}
					return h;
				},
			},
		];
		
		if(!w2ui.noLoanList){
			$(".no-loan-list-table").w2grid({
				name: "noLoanList",
				recordHeight: 44,
				selectType: "row",
				fixedBody: false,
				columns: columns,
				records: this.data,
				onDblClick: function(event){
					event.preventDefault();
				}
			});
		}else{
			w2ui['noLoanList'].columns = columns;
			w2ui['noLoanList'].records = this.data;
			w2ui['noLoanList'].refresh();
			$(".no-loan-list-table").w2render('noLoanList');
		}
	};
	
/********************************************************************/
	var date = new Date().format('yyyy年MM月dd日');
	$(".homepage-refresh-date").html('数据截止日期' + date);
	var dfds = commonObj.bindQueryEvent();
	
	//过滤
	page.getFilter();
	var card = url('?')?url('?')['card']: undefined;
	//获取数据
	dfds.push(commonObj.loadYearSelect());
	dfds.push(commonObj.loadCardSelect(card));
	$.when.apply($, dfds).done(function(){
		page.getTableData();
	});

	//下拉事件
    //分行下拉选中
    $("#subsidiary").on("select2:select", function(e) {
        var data = e.params.data;

        if(data.id != ""){
            var sel_data = {
                parentId: data.id,
                employeeId: utilObj.userLogined.employeeId
            };
            commonObj.loadBankSelect($("#branch"), sel_data, "支行[All]");
        } else {
            $("#branch").select2("destroy");
            $("#branch").html("<option>支行[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });
        }
        
        page.getTableData({
        	bankSubsetCode: '',
        });
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
        page.getTableData();
    });
    
	//日期下拉
    $("#estimate").on("select2:select", function(e){
    	page.getTableData();
    });
    
    //卡别下拉
    $("#card").on("select2:select", function(e){
    	page.getTableData();
    });

	//点击filter
	$(document).on("click",".tab-filter-item",function(){
		if($(this).hasClass("tab-filter-selected")){
			return false;
		} else {
			$(this).addClass("tab-filter-selected").siblings(".tab-filter-item").removeClass("tab-filter-selected");
		}
		page.getTableData();
	});
	//点击清单按钮
	$(document).on("click",".operation--edit",function(){
		var cid = $(this).data('cid');
		var years = $("#estimate").val();
		localStorage.setItem("customerQuery",JSON.stringify({cid:cid,years:years}));
		utilObj.gotoPageUri("customer_list.html?detail=detail");
		// utilObj.navigate('customer_list', {
		// 	cid: cid,
		// 	years: years,
		// });
	});
});