define(function(require,exports,module){
	require("../css/popup-select.css");
	var page = {};
	page.selectedItem = require("../js/customer-check-level.js");
	
	page.employeeId = utilObj.userLogined.employeeId;
	page.useUrlParams = true;
	//获取url参数
	page.getUrlParams = function(){
		var obj = null;
		var res = url('?');
		if(res){
			obj = {};
			if(res.type){
				obj.bankBranchCode = res.subsidiary;
				obj.bankSubsetCode = res.branch;
				obj.year = res.year;
				obj.filter = this.filterObj[res.type];
			}else if(res.detail){
				var query = JSON.parse(localStorage.getItem("customerQuery"));
				obj.year = query.years;
				obj.customerIds = query.cid;
				obj.filter = '{}';
			}
			obj.loginId = this.employeeId;
		} 
		// else {
		// 	res = JSON.parse(localStorage.getItem("customerQuery"));
		// 	obj = {};
		// 	obj.year = res.years;
		// 	obj.customerIds = res.cid;
		// 	obj.filter = '{}';
		// 	obj.loginId = this.employeeId;
		// }
		return obj;
	};
	//获取对应的筛选条件
	page.filterObj = {
		sleep: '{"customerClass":["休眠户"]}',
	}
	//获取查询参数
	page.getParams = function(obj){
		var urlParams = this.getUrlParams();
		var params = {};
		if(urlParams && this.useUrlParams){
			//因为此时分行下拉和支行下拉都还没有选项，所以给其赋值是无效的
			$("#subsidiary").val(urlParams.bankBranchCode).trigger('change');
			$("#branch").val(urlParams.bankSubsetCode).trigger('change');
			$("#estimate").val(urlParams.year).trigger('change');
			this.useUrlParams = false;
			return urlParams;
		}else{
			params.bankBranchCode = $("#subsidiary").val();
			params.bankSubsetCode = $("#branch").val();
			params.year = $("#estimate").val();
			//此处employeeId为客户经理id
			params.employeeId = $("#manager").val();
			params.loginId = this.employeeId;
			//筛选条件
			params.filter = JSON.stringify(this.getFilter());
			if(obj){
				params = $.extend(params, obj);
			}
			return params;
		}
		
	};
	//获取搜索查询参数
	page.getParamsForSearch = function(obj){
		var params = {};
		params.bankBranchCode = $("#subsidiary").val();
		params.bankSubsetCode = $("#branch").val();
		params.year = $("#estimate").val();
		//此处employeeId为客户经理id
		params.employeeId = $("#manager").val();
		//搜索条件
		params.loginId = this.employeeId;
    	var obj1 = {};
    	var key = $("#field-select").val();
    	obj1[key] = $("#search-select").val();
    	params.criteria = JSON.stringify(obj1);
		
		//筛选条件
		if(obj){
			params = $.extend(params, obj);
		}
		return params;
	};
	//判断当前处于筛选还是搜索状态
	page.getSwitchIndex = function(){
		var index = $(".switch__item.selected").data('index');
		return index;
	}
	//获取筛选条件
	page.getFilter = function(){
		var filter = {};
		filter.level1 = this.getOneFilter(this.selectedItem['TRADE'].level1);
		filter.level2 = this.getOneFilter(this.selectedItem['TRADE'].level2);
		filter.level3 = this.getOneFilter(this.selectedItem['TRADE'].level3);
		filter.creditRating = this.getOneFilter(this.selectedItem['CREDIT'].level1);
		filter.customerSize = this.getOneFilter(this.selectedItem['SIZE'].level1);
		filter.isStrategic = this.getOneFilter(this.selectedItem['STRATEGIC'].level1);
		filter.cooperationYear = this.getDurationFilter(this.selectedItem['DURATION'].level1);
		//客户类别
		var res = this.getCategoryFilter(this.selectedItem['CATEGORY']);
		filter.hasrRisk = res.hasrRisk;
		filter.customerClass = res.customerClass;
		filter.customerType = this.getOneFilter(this.selectedItem['TYPE'].level1);
		filter.customerSign = this.getOneFilter(this.selectedItem['MARK'].level1);
		
		for(var k in filter){
			if(filter[k].length == 0){
				delete filter[k];
			}
		}
		return filter;
	};
	//得到某个筛选条件
	page.getOneFilter = function(ary){
		var res = $.map(ary, function(val, i){
			return val.levelCode;
		});
		return res;
	};
	//得到合作年限筛选条件
	page.getDurationFilter = function(ary){
		var res = $.map(ary, function(val, i){
			return val.levelCode;
		});
		var str = res.join(',');
		if(str){
			return str.split(',');
		}else{
			return [];
		}
	};
	//得到客户类别筛选条件
	page.getCategoryFilter = function(obj){
		var customerClass = [];
		var hasrRisk = [];
		$.each(obj.level1, function(i, val){
			if(val.levelCode == '休眠户'){
				customerClass.push(val.levelCode);
			}
		})
		$.each(obj.level2, function(i, val){
			if(val.parent == '无贷户'){
				customerClass.push(val.parent+'-'+val.levelCode);
			}else{
				hasrRisk.push(val.levelCode);
			}
		})
		$.each(obj.level3, function(i, val){
			customerClass.push('有贷户-'+val.levelCode);
		})
		return {
			customerClass: customerClass,
			hasrRisk: hasrRisk,
		}
		
	};
	page.getTableData = function(obj){
		var vm = this;
		var params = vm.getParams(obj);
		utilObj.ajax({
			url: 'm/customerList/findCustomerListByFilter',
			data: params,
			beforeSend: function(){
				utilObj.showLoading($("#wrap"),"加载中");
			},
			complete: function(){
				utilObj.hideLoading($("#wrap"));
			},
			success: function(data){
				var ary = utilObj.addRecid(data.object, 'customerId');
				vm.data = ary;
				vm.loadTable();
			}
		})
	};
	//通过搜索获取列表数据
	page.getTableDataBySearch = function(obj){
		var vm = this;
		utilObj.ajax({
			url: 'm/customerList/findCustomerListByCriteria',
			data: this.getParamsForSearch(obj),
			beforeSend: function(){
				utilObj.showLoading($("#wrap"),"加载中");
			},
			complete: function(){
				utilObj.hideLoading($("#wrap"));
			},
			success: function(data){
				var ary = utilObj.addRecid(data.object, 'customerId');
				vm.data = ary;
				vm.loadTable();
			}
		})
		
	};
	page.fields = [
		{ field: 'customerCode', caption: '客户编号', },
		{ field: 'customerName', caption: '客户名称', },
		{ field: 'companyName', caption: '集团名称', },
		{ field: 'strategicAccount', caption: '战略客户', },
		{ field: 'annualIncome', caption: '客户年收入', },
		{ field: 'creditAmount', caption: '授信金额', },
		{ field: 'netIncome', caption: '净收入', },
		{ field: 'netIncomeDetail', caption: '净收入明细', },
		{ field: 'profit', caption: '经济利润', },
		{ field: 'customerSize', caption: '客户规模', },
		{ field: 'level1', caption: '行业', },
		{ field: 'cooperationYear', caption: '合作时长', },
		{ field: 'bankBranchName', caption: '所属分行', },
		{ field: 'bankSubsetName', caption: '所属支行', },
		{ field: 'employeeName', caption: '客户经理', },
		{ field: 'creditRating', caption: '信用评级', },
		{ field: 'riskStatus', caption: '风险状态', },
		{ field: 'balanceDaily', caption: '日均余额', },
		{ field: 'balanceDailyDetail', caption: '日均余额明细', },
		{ field: 'balance', caption: '期末余额', },
		{ field: 'balanceDetail', caption: '期末余额明细', },
		{ field: 'customerSign', caption: '客户标识', },
		{ field: 'customerType', caption: '客户类型', },
	]
	page.loadTable = function(){
		var vm = this;
		var columns = [
			{field: "", caption: "客户编号", size: "11%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '<span class="customer-name cib-link" data-id="'+record.customerId+'">'+record.customerCode+'</span>'
					return h;
				}
			},
			{field: "", caption: "客户名称", size: "11%", attr: "align=center",},
			{field: "", caption: "集团名称", size: "11%", attr: "align=center"},
			{field: "", caption: "战略客户", size: "8%", attr: "align=center"},
			{field: "", caption: "客户年收入<br>(万元)", size: "11%", attr: "align=center",},
			{field: "", caption: "授信金额<br>(万元)", size: "11%", attr: "align=center",},
			{field: "", caption: "净收入<br>(万元)", size: "11%", attr: "align=center"},
			{field: "", caption: "净收入明细<br>(万元)", size: "10%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += '<span class="operation operation--edit" data-type="netIncome" data-id="'+record.recid+'" data-index="'+index+'">明细</span>';
					return h;
				},
			},
			{field: "", caption: "经济利润<br>(万元)", size: "11%", attr: "align=center"},
			{field: "", caption: "客户规模", size: "11%", attr: "align=center"},
			{field: "", caption: "行业", size: "11%", attr: "align=center",},
			{field: "", caption: "合作时长", size: "11%", attr: "align=center",},
			{field: "", caption: "所属分行", size: "11%", attr: "align=center"},
			{field: "", caption: "所属支行", size: "11%", attr: "align=center",},
			{field: "", caption: "客户经理", size: "11%", attr: "align=center"},
			{field: "", caption: "信用评级", size: "11%", attr: "align=center"},
			{field: "", caption: "风险状态", size: "11%", attr: "align=center",},
			{field: "", caption: "日均余额<br>(万元)", size: "11%", attr: "align=center",},
			{field: "", caption: "日均余额明细<br>(万元)", size: "10%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += '<span class="operation operation--edit" data-type="balanceDaily" data-id="'+record.recid+'" data-index="'+index+'">明细</span>';
					return h;
				},
			},
			{field: "", caption: "期末余额<br>(万元)", size: "11%", attr: "align=center",},
			{field: "", caption: "期末余额明细<br>(万元)", size: "10%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += '<span class="operation operation--edit" data-type="balance" data-id="'+record.recid+'" data-index="'+index+'">明细</span>';
					return h;
				},
			},
			{field: "", caption: "客户标识", size: "11%", attr: "align=center"},
			{field: "", caption: "客户类型", size: "11%", attr: "align=center",},
		];
		columns = $.map(columns, function(val, i){
			val.field = vm.fields[i].field;
			return val;
		})
		if(!w2ui.customerList){
			$(".customer-list-table").w2grid({
				show: {
		            selectColumn: true
		        },
				name: "customerList",
				recordHeight: 44,
				selectType: "row",
				fixedBody: false,
				columns: columns,
				records: this.data,
				onDblClick: function(event){ // 事实上w2ui在IOS环境下会将grid的点击事件绑定为双击事件，目前将IOS环境变量强制定位false
					event.preventDefault();
				},
			});
		}else{
			w2ui['customerList'].records = this.data;
			w2ui['customerList'].refresh();
			$(".customer-list-table").w2render('customerList');
		}
		var selected = $(".fields__item.selected");
		if(selected.length == 0){
			vm.showDefaultFields();
		}
	};
	//获取行业数据
	page.getTradeData = function(){
		var vm = this;
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/trade/findTradeList',
			data: {
				
			},
			success: function(data){
				vm.tradeData = data.object;
				dtd.resolve(data.object);
			}
		})
		return dtd;
	};
	//获取银行数据
	page.getBankData = function(){
		var vm = this;
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/employee/findBankInstitution',
			data: {
				
			},
			success: function(data){
				vm.bankData = data.object;
				dtd.resolve(data.object);
			}
		})
		return dtd;
	};
	//获取客户经理数据
	page.getManagerData = function(bankSubsetId){
		var params = {
			employeeId: this.employeeId,
			bankBranchId: '',
			bankSubsetId: bankSubsetId,
		}
		utilObj.ajax({
			url: 'm/employee/findManageList',
			data: params,
			success: function(data){
				var res = utilObj.alterToAry(data.object);
				var managers = $.map(res, function(val, i){
					return {
						id: val.employeeId,
						text: val.employeeName,
					}
				});
				
    			w2ui['customerForm'].get('employeeId').options.items = managers.slice(0);
    			if(w2ui['customerForm'].get('employeeId').$el){
    				w2ui['customerForm'].get('employeeId').$el.data('selected', managers.length?managers[0]:{}).change();
    			}else{
    				w2ui['customerForm'].get('employeeId').options.selected = managers[0];
    			}
    			w2ui['customerForm'].refresh();
				w2ui['customerForm'].validate();
			}
		})
	};
	//得到下拉选项数据
	page.alterOptionsData = function(){
		var level1 = $.map(this.tradeData, function(val, i){
			return {
				id: val.tradeCode,
				text: val.level1,
			}
		});
		var branches = $.map(this.bankData, function(val, i){
			return {
				id: val.bankId,
				text: val.bankName,
			}
		});
		this.options = {
			level1: level1,
			branches: branches,
		};
	};
	//获取某一级行业下的二级行业数据
	page.getLevel2Options = function(code){
		var res = _.findWhere(this.tradeData, {
			tradeCode: code,
		});
		var level = $.map(res.tradeList, function(val, i){
			return {
				id: val.tradeCode,
				text: val.level2,
			}
		});
		return level;
	};
	//获取某二级行业下的三级行业数据
	page.getLevel3Options = function(code1, code2){
		var res1 = _.findWhere(this.tradeData, {
			tradeCode: code1,
		});
		var res2 = _.findWhere(res1.tradeList, {
			tradeCode: code2,
		});
		var level = $.map(res2.tradeList, function(val, i){
			return {
				id: val.tradeCode,
				text: val.level3,
			}
		});
		return level;
	};
	//获取某分行下的支行数据
	page.getSubsets = function(id){
		var res = _.findWhere(this.bankData, {
			bankId: id,
		});
		var subsets = $.map(res.bankVoList, function(val, i){
			return {
				id: val.bankId,
				text: val.bankName,
			}
		});
		return subsets;
	};
	page.loadForm = function(){
		var vm = this;
		var sizes = [
			{
				id: '大型',
				text: '大型',
			},
			{
				id: '中型',
				text: '中型',
			},
			{
				id: '小型',
				text: '小型',
			},
			{
				id: '微型',
				text: '微型',
			},
		];
		var level1 = this.options.level1;
		var level2 = this.getLevel2Options(level1[0].id);
		var level3 = [];
		if(level2.length != 0){
			level3 = this.getLevel3Options(level1[0].id, level2[0].id);
		}
		var branches = this.options.branches;
		var subsets = this.getSubsets(branches[0].id);
		var managers = [];
		if(subsets.length != 0){
			this.getManagerData(subsets[0].id);
		}
		if(w2ui.customerForm){
			w2ui['customerForm'].destroy();
		}
		$().w2form({
            name: 'customerForm',
            style: 'border: 0px; background-color: transparent;',
            formHTML: template('customer-form')(),
            fields: [
                { name: 'customerCode', type: 'text', required: true},
                { name: 'customerName', type: 'text', required: true,},
                { name: 'companyName', type: 'text',},
                { name: 'customerSize', type: 'list', required: true,
                	options: {
	                	items: sizes,
	                	selected: sizes[0],
	                },
                },
                { name: 'level1Code', type: 'list', required: true, 
                	options: {
	                	items: level1,
	                	selected: level1[0],
	                },
                },
                { name: 'level2Code', type: 'list', required: false, 
                	options: {
	                	items: level2,
	                	selected: level2[0],
	                },
                },
                { name: 'level3Code', type: 'list', required: false, 
                	options: {
	                	items: level3,
	                	selected: level3[0],
	                },
                },
                { name: 'bankBranchId', type: 'list', required: true,
                	options: {
	                	items: branches,
	                	selected: branches[0],
	                },
                },
                { name: 'bankSubsetId', type: 'list', required: true,
                	options: {
	                	items: subsets,
	                	selected: subsets[0],
	                },
                },
                { name: 'employeeId', type: 'list', required: true,
                	options: {
	                	items: managers,
	                	selected: managers.length?managers[0]:{},
	                },
                },
            ],
            record: {
            	
            },
            actions: {
                "save": function () { 
                	var errs = this.validate();
                	if(errs.length>0){
                		return;
                	}
                	vm.addForm();
                },
                "reset": function () { 
                	this.clear();
                	w2popup.close();
                }
            },
            onChange: function(event){
				event.onComplete = function(){
            		if(event.target == 'level1Code'){//一级行业
            			var level1Code = event.value_new.id;
            			var level2 = vm.getLevel2Options(level1Code);
            			var level3 = [];
            			if(level2.length != 0){
            				level3 = vm.getLevel3Options(level1Code, level2[0].id);
            			}
            			w2ui['customerForm'].get('level2Code').options.items = level2.slice(0);
            			w2ui['customerForm'].get('level3Code').options.items = level3.slice(0);
            			w2ui['customerForm'].refresh();
            			w2ui['customerForm'].get('level2Code').$el.data('selected', level2.length?level2[0]:{}).change();
            			w2ui['customerForm'].get('level3Code').$el.data('selected', level3.length?level3[0]:{}).change();
            			w2ui['customerForm'].validate();
            		}else if(event.target == 'level2Code'){//二级行业
            			var level2Code = event.value_new.id;
            			var level1Code = w2ui['customerForm'].record.level1Code.id;
            			var level3 = [];
            			if(level2Code){
            				level3 = vm.getLevel3Options(level1Code, level2Code);
            			}
            			w2ui['customerForm'].get('level3Code').options.items = level3.slice(0);
            			w2ui['customerForm'].refresh();
            			w2ui['customerForm'].get('level3Code').$el.data('selected', level3.length?level3[0]:{}).change();
            			w2ui['customerForm'].validate();
            		}else if(event.target == 'bankBranchId'){//分行
            			var bankBranchId = event.value_new.id;
            			var subsets = vm.getSubsets(bankBranchId);
            			var managers = [];
            			if(subsets.length != 0){
            				vm.getManagerData(subsets[0].id);
            			}else{
            				
            				w2ui['customerForm'].get('employeeId').options.items = managers.slice(0);
            				w2ui['customerForm'].get('employeeId').$el.data('selected', managers.length?managers[0]:{}).change();
            			}
            			w2ui['customerForm'].get('bankSubsetId').options.items = subsets.slice(0);
            			w2ui['customerForm'].get('bankSubsetId').$el.data('selected', subsets.length?subsets[0]:{}).change();
            			w2ui['customerForm'].validate();
            		}else if(event.target == 'bankSubsetId'){//支行
            			var bankSubsetId = event.value_new.id;
            			var managers = [];
            			if(bankSubsetId){
            				vm.getManagerData(bankSubsetId);
            			}else{
            				w2ui['customerForm'].get('employeeId').options.items = managers.slice(0);
            				w2ui['customerForm'].get('employeeId').$el.data('selected', managers.length?managers[0]:{}).change();
            			}
            		}else{
            			w2ui['customerForm'].validate();
            		}
	            	
            	}
            }
        });
	};
	//新增用户
	page.addForm = function(){
		var vm = this;
		var data = $.extend({}, w2ui['customerForm'].record);
		var res = {
			bankBranchCode: data.bankBranchId.id,
			bankBranchName: data.bankBranchId.text,
			bankSubsetCode: data.bankSubsetId.id,
			bankSubsetName: data.bankSubsetId.text, 
			companyName: data.companyName,
			customerCode: data.customerCode,
			customerName: data.customerName,
			customerSize: data.customerSize.id,
			employeeId: data.employeeId.id,
			employeeName: data.employeeId.text,
			level1Code: data.level1Code.id,
			level1: data.level1Code.text,
			level2Code: data.level2Code.id,
			level2: data.level2Code.text,
			level3Code: data.level3Code.id,
			level3: data.level3Code.text,
		}
		utilObj.ajax({
			url: 'm/customerList/createCustomerInfo',
			data: {
				jsonEntity: JSON.stringify(res),
				employeeId: this.employeeId,
			},
			success: function(data){
				w2popup.close();
				vm.getTableData();
			}
		});		
	};
	//新建客户
	page.openCustomer = function(){
		var vm = this;
		$().w2popup('open', {
	        title   : '新增客户',
	        body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : 800,
	        height  : 500,
	        modal	: true,
	        showClose: false,
	        onOpen: function (event) {
	            event.onComplete = function () {
	                $('#w2ui-popup #form').w2render('customerForm');
	                vm.bindFormEvent();
//              	w2ui['customerForm'].record.roleId = vm.actualOptions.roles[0];
//              	w2ui['userForm'].record.bankBranchId = vm.actualOptions.branchBanks[0];
//              	w2ui['userForm'].refresh();
	            }
	        }
	    });
	};
	//绑定表单事件
	page.bindFormEvent = function(){
		
	};
	
	//field select
	page.loadFieldSelect = function(){
		var fields = [
			{
				id: 'customerCode',
				text: '客户编号',
			},
			{
				id: 'customerName',
				text: '客户名称',
			},
			{
				id: 'companyName',
				text: '集团名称',
			},
			{
				id: 'customerSize',
				text: '客户规模',
			},
			{
				id: 'level1',
				text: '行业',
			},
		];
		var optstr = '';
		$.each(fields, function(i, v){
			optstr += "<option value='" + v.id + "'>" + v.text + "</option>";
		})
		$("#field-select").html(optstr).select2({
            width: "100%",
            language: selet2LangZh,
            minimumResultsForSearch: -1
        });
	};
	//search-select
	page.loadSearchSelect = function(){
		var vm = this;
		$("#search-select").select2({
			width: "100%",
			language: selet2LangZh,
			ajax: {
				url: utilObj.getAjaxUrl() + 'm/customerList/fuzzySearch',
				dataType: 'json',
				type: 'POST',
				delay: 250,
				data: function(params){
					return {
						value: params.term,
						type: $("#field-select").val(),
						bankBranchCode: $("#subsidiary").val(),
						bankSubsetCode: $("#branch").val(),
						employeeId: $("#manager").val(),
						loginId: vm.employeeId,
						token: utilObj.token,
					}
				},
				processResults: function(data, params){
					var res = utilObj.alterToAry(data.object);
					res = $.map(res, function(val, i){
						return {
							id: val,
							text: val,
						}
					})
					return {
						results: res,
					}
				},
				cache: true,
			},
			placeholder: '搜索',
			minimumInputLength: 1,
		})


	};
	//默认只显示4个字段
	page.showDefaultFields = function(){
		var params = $.map(this.fields, function(val, i){
			return val.field;
		});
		w2ui['customerList'].hideColumn.apply(w2ui['customerList'], params);
		w2ui['customerList'].showColumn('customerCode', 'customerName', 'companyName', 'strategicAccount');
	};
	//加载所有字段
	page.loadAllFields = function(){
		var h = template('fields', {
			data: this.fields,
		});
		$(".fields__content").html(h);
	};
	//生成筛选条件的显示
	page.filterTitle = {
		TRADE: "行业",
		CREDIT: "信用评级",
		SIZE: "客户规模",
		STRATEGIC: "战略客户",
		DURATION: "合作时长",
		CATEGORY: "客户类别",
		TYPE: "客户类型",
		MARK: "客户标识"
	};
	page.createFilter = function(key,arr){
		page.filterHtml += [
			"<div class='screen__condition'>",
			"	<div class='screen__title'>"+page.filterTitle[key]+":</div>",
			"	<div class='screen__condition-items clearfix'>"
		].join("");

		$.each(arr,function(i,v){
			page.filterHtml += [
				"	<div class='screen__condition-item clearfix'>",
				"		<div class='screen__condition-item-text'>"+v.name+"</div>",
				"		<div class='screen__condition-item-close' data-code="+v.levelCode+" data-type="+key+"></div>",
				"	</div>",
			].join("");
		});

		page.filterHtml += [
			"	</div>",
			"</div>"
		].join("");
	};
	//查看明细
	page.checkDetail = function(){
		utilObj.ajax({
			url: 'm/customerList/findDetail',
			data: {
				customerId: '',
				year: $("#estimate").val(),
				type: '',
			},
			success: function(data){
				
			}
		});
	};
	//绑定事件
	page.bindEvent = function(){
		var vm = this;
		//点击字段按钮
		$(".fields__content").on('click', '.fields__item:not(.disabled)', function(){
			
			var field = $(this).data('field');
			if($(this).hasClass('selected')){
				$(this).removeClass('selected');
				w2ui['customerList'].hideColumn(field);
			}else{
				var selected = $(".fields__content").find(".fields__item.selected");
				if(selected.length >= 6){
					w2alert('最多选择6个字段','提示');
					return;
				}
				$(this).addClass('selected');
				w2ui['customerList'].showColumn(field);
			}
		});
		$(".block-btn--add").click(function(){
			if(!vm.tradeData){
				$.when(vm.getTradeData(), vm.getBankData())
				.then(function(){
					vm.alterOptionsData();
					vm.loadForm();
					vm.openCustomer();
				})
			}else{
				vm.loadForm();
				vm.openCustomer();
			}
		})
		//点击切换筛选和搜索
		$(".switch-wrapper").on('click', '.switch__item', function(){
			var index = $(this).data('index');
			if(!$(this).hasClass('selected')){
				$(this).siblings().removeClass('selected');
				$(this).addClass('selected');
				if(index == 1){
					$(".screen-wrapper").show();
					$(".search-wrapper").hide();
					vm.getTableData();
				}else{
					$(".screen-wrapper").hide();
					$(".search-wrapper").show();
					if($("#search-select").val()){
						vm.getTableDataBySearch();
					}
				}
			}
		});
		//展开/收起筛选
		$(document).on("click",".screen__arrow",function(){
			if($(this).hasClass("screen__arrow--down")){
				$(this).removeClass("screen__arrow--down").addClass("screen__arrow--up");
				$(".screen__conditions").slideDown();
			} else {
				$(this).removeClass("screen__arrow--up").addClass("screen__arrow--down");
				$(".screen__conditions").slideUp();
			}
		});
		$(".screen__arrow").click();
		
		//点击弹框的确认按钮
		$(document).on("click",".confirm-btn",function(){
			w2popup.close();
			page.filterHtml = "";
			$.each(page.selectedItem,function(k,v){
				if(v.level1.length > 0){
					page.createFilter(k,v.level1);
				}
			});
	
			$(".screen__conditions").html(page.filterHtml);
			vm.getTableData();
		});
		
		//删除某个筛选条件
		$(document).on("click",".screen__condition-item-close",function(){
			var $_items = $(this).parents(".screen__condition-items");
			var $_item = $(this).parent(".screen__condition-item");
	
			//去掉数组中的对应数据
			var code = $(this).attr("data-code");
			var type = $(this).attr("data-type");
			if(page.selectedItem[type].level1.length > 0){
				var del_level1 = [];
				$.each(page.selectedItem[type].level1, function(i,v){
					//找到对应的code
					if(v.levelCode == code){
						if(page.selectedItem[type].level2.length > 0){
							var del_level2 = [];
							$.each(page.selectedItem[type].level2, function(i1,v1){
								if(v1.parent == v.levelCode){
	
									//删除对应的level3
									if(page.selectedItem[type].level3.length > 0){
										var del_level3 = [];
										$.each(page.selectedItem[type].level3,function(i2,v2){
											if(v2.parent == v1.levelCode){
												del_level3.push(i2);
												//page.selectedItem[type].level3.splice(i2,1);
											}
										});
	
										//删除对应level3
										del_level3.sort(function(a,b){return b-a});
										$.each(del_level3,function(i,v){
											page.selectedItem[type].level3.splice(v,1);
										});
									}
	
									//记录对应的level2
									del_level2.push(i1);								
								}
							});
	
							//删除level2
							del_level2.sort(function(a,b){return b-a});
							$.each(del_level2,function(i,v){
								page.selectedItem[type].level2.splice(v,1);
							});
						}
	
						//记录对应的level1
						del_level1.push(i);
					}
				});
	
				//删除level1
				del_level1.sort(function(a,b){return b-a});
				$.each(del_level1,function(i,v){
					page.selectedItem[type].level1.splice(v,1);
				});
			}
	
			$_item.remove();
			if($_items.children(".screen__condition-item").size() == 0){
				$_items.parent(".screen__condition").remove();
			}
			vm.getTableData();
		});
		//标记为待规划客户
		$("#markBtn").click(function(){
			var selected = w2ui['customerList'].getSelection();
			if(selected.length == 0){
				return;
			}
			var customerIds = selected.join(',');
			utilObj.ajax({
				url: 'm/customerList/customerIdentifer',
				data: {
					customerIds: customerIds,
					employeeId: vm.employeeId,
				},
				beforeSend: function(){
					utilObj.showLoading($("#wrap"),"加载中");
				},
				complete: function(){
					utilObj.hideLoading($("#wrap"));
				},
				success: function(data){
					w2ui['customerList'].selectNone();
					vm.getTableData();
				}
			});
		})
		//导入客户数据
		$("#import-customer").change(function(e){
			var file = e.target.files[0];
			if(!file){
				return;
			}
			var form = new FormData();
			form.append("excelFile", file);
			utilObj.ajax({
				url: 'm/input/inputCustomerInfo',
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
					w2alert('上传成功', '提示');
				}
				
			})
		});
		//点击客户编号
		$(document).on('click', '.customer-name.cib-link', function(){
			var id = $(this).data('id');
			utilObj.navigate('customer_info', {
				cid: id,
			});
		});
		//点击明细按钮
		$(document).on('click', '.operation--edit', function(){
			var type = $(this).data('type');
			var id = $(this).data('id');
			vm.openDetail(type, id);
		});
	};
	//弹出明细窗口
	page.openDetail = function(type, id){
		var vm = this;
		var year = $("#estimate").val();
		var options = {
	        title   : '',
	        body    : '<div class="client-popup-body" style="padding: 5px 20px 15px;"><div class="jc-records money-detail"></div></div>',
	        buttons : '<button class="button popup-btn button--primary" onclick="w2popup.close();">关闭</button>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : 402,
	        height  : 296, 
	        showClose: false,
	        modal	: true,
	        onOpen: function (event) {
	            event.onComplete = function () {
	            	utilObj.ajax({
						url: 'm/customerList/findDetail',
						data: {
							customerId: id,
							year: year,
							type: type,
						},
						success: function(data){
							var data = utilObj.alterToAry(data.object);
							var h = template('money-detail', {
								data: data,
							});
	            			$(".money-detail").html(h);
						}
					})
	            	
	            }
	        }
	    }
		if(type == 'netIncome'){
			options.title = '净收入明细(万元)';
		}else if(type == 'balanceDaily'){
			options.title = '日均余额明细(万元)';
		}else if(type == 'balance'){
			options.title = '期末余额明细(万元)';
		}
		$().w2popup('open', options);
	};
	//初始化
	page.init = function(){
		var date = new Date().format('yyyy年MM月dd日');
		$(".homepage-refresh-date").html('数据截止日期' + date);
		this.bindEvent();
		this.loadAllFields();
		this.loadFieldSelect();
		this.loadSearchSelect();
	};
/********************************************************************/
	page.init();
	var dfds = commonObj.bindQueryEvent();
	dfds.push(commonObj.loadYearSelect());

	//获取数据
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

				commonObj.loadCustomerManagerSelect($("#manager"), {
					bankSubsetId: data.id,
					employeeId: utilObj.userLogined.employeeId,
				}, '客户经理[All]');

        var switchIndex = page.getSwitchIndex();
        if(switchIndex == 2){
        	return;
        }
        page.getTableData({
					bankSubsetCode: '',
					employeeId: '' //此处employeeId指的是客户经理id
        });
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
    	var data = e.params.data;
    	commonObj.loadCustomerManagerSelect($("#manager"), {
    		bankSubsetId: data.id,
    		employeeId: utilObj.userLogined.employeeId,
    	}, '客户经理[All]');
    	var switchIndex = page.getSwitchIndex();
        if(switchIndex == 2){
        	return;
        }
        page.getTableData({
        	employeeId: '', //此处employeeId指的是客户经理id
        });
    });
    
	//日期下拉
    $("#estimate").on("select2:select", function(e){
    	var switchIndex = page.getSwitchIndex();
        if(switchIndex == 2){
        	return;
        }
    	page.getTableData();
    });
    
    //客户经理下拉
    $("#manager").on("select2:select", function(e){
    	var switchIndex = page.getSwitchIndex();
        if(switchIndex == 2){
        	return;
        }
    	page.getTableData();
    });
    //搜索下拉
    $("#search-select").on("select2:select", function(e){
    	var data = e.params.data;
    	var obj = {};
    	var key = $("#field-select").val();
    	obj[key] = data.id;
    	page.getTableDataBySearch({
    		criteria: JSON.stringify(obj),
    	});
    });
});