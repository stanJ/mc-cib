define(function(require, exports, module){
	var page = {};
	page.roleId = utilObj.userLogined.roleId;
	page.employeeId = utilObj.userLogined.employeeId;
	//获取客户信息
	page.getClientData = function(){
		var dtd = $.Deferred();
		var id = url('?')?url('?')['cid']: undefined;
		utilObj.ajax({
			url: 'm/customer/findCustomerInfoById',
			data: {
				customerId: id,
			},
			success: function(data){
				dtd.resolve(data.object);
			}
		})
		return dtd;
	};
	//获取银行数据
	page.getBankData = function(){
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/employee/findBankInstitution',
			data: {
				
			},
			success: function(data){
				dtd.resolve(data.object);
			}
		})
		return dtd;
	};
	//获取信用评级
	page.getCreditList = function(){
		var dtd = $.Deferred();
		utilObj.ajax({
			url: "m/config/findCreditLever",
			success: function(data){
				dtd.resolve(data.object);
			},
		});
		return dtd;
	};
	//获取行业数据
	page.getTradeData = function(){
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/trade/findTradeList',
			data: {
				
			},
			success: function(data){
				dtd.resolve(data.object);
			}
		})
		return dtd;
	};
	//获取某分行下的支行数据
	page.getSubsets = function(id){
		var res = _.findWhere(this.originOptionsData.bankData, {
			bankId: utilObj.parseToInt(id),
		});
		res = utilObj.alterToObj(res);
		var ary = utilObj.alterToAry(res.bankVoList);
		var subsets = $.map(ary, function(val, i){
			return {
				id: val.bankId,
				text: val.bankName,
			}
		});
		return subsets;
	};
	//获取客户经理数据
	page.getManagerData = function(bankSubsetId, hasValue){
//		POST /m/employee/findList
		var params = {
//			employeeId: this.employeeId,
			bankBranchId: '13',
			bankSubsetId: bankSubsetId,
		}
		utilObj.ajax({
			url: 'm/employee/findList',
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
    			if(!hasValue){
    				w2ui['customerForm'].get('employeeId').$el.data('selected', managers.length?managers[0]:{}).change();
//  				w2ui['customerForm'].get('employeeId').options.selected = managers[0];
    			}
    			w2ui['customerForm'].refresh();
				w2ui['customerForm'].validate();
			}
		})
	};
	page.getOptions = function(){
		var isStrategic = [
			{
				id: '1',
				text: '是',
			},
			{
				id: '0',
				text: '否',
			},
		];
		var hasrRisk = [
			{
				id: '1',
				text: '是',
			},
			{
				id: '0',
				text: '否',
			},
		];
		var credit = this.originOptionsData.creditData;
		credit = $.map(credit, function(val, i){
			return {
				id: val.creditCode,
				text: val.creditCode,
			}
		});
		var trade = this.originOptionsData.tradeData;
		trade = $.map(trade, function(val, i){
			return {
				id: val.tradeCode,
				text: val.level1,
			}
		});
		var branches = this.originOptionsData.bankData;
		branches = $.map(branches, function(val, i){
			return {
				id: val.bankId,
				text: val.bankName,
			}
		});
		this.options = {
			isStrategic: isStrategic,
			hasrRisk: hasrRisk,
			branches: branches,
			credit: credit,
			trade: trade,
		}
	};
	//客户经理角色时可以修改大部分信息
	page.loadFormForManager = function(){
		var vm = this;
		if(w2ui.customerForm){
			w2ui['customerForm'].destroy();
		}
		$(".client-info-wrapper").w2form({
            name: 'customerForm',
//          style: 'height: inherit;',
            fields: [
                { name: 'customerName', type: 'text', required: true},
                { name: 'customerCode', type: 'text', required: true},
                { name: 'isStrategic', type: 'list', required: true, 
                	options: {
	                	items: this.options.isStrategic,
	                },
                },
                { name: 'companyName', type: 'text', required: true},
                { name: 'employeeId', type: 'list', required: true, 
                	options: {
	                	items: [],
	                },
                },
                { name: 'hasrRisk', type: 'list', required: true, 
                	options: {
	                	items: this.options.hasrRisk,
	                },
                },
                { name: 'bankBranchId', type: 'list', required: true, 
                	options: {
	                	items: this.options.branches,
	                },
                },
                { name: 'bankSubsetId', type: 'list', required: true, 
                	options: {
	                	items: [],
	                },
                },
                { name: 'creditRating', type: 'list', required: true, 
                	options: {
	                	items: this.options.credit,
	                },
                },
                { name: 'level1Code', type: 'list', required: true, 
                	options: {
	                	items: this.options.trade,
	                },
                },
            ],
            record: {
            	
            },
            actions: {
                "save": function () { 
                	var errs = this.validate(); 
                	if(this.record.customerId){
            			vm.editForm();
            		}else{
            			vm.addForm();
            		}
                },
                "reset": function () { 
                	this.clear();
                	w2popup.close();
                }
            },
            onChange: function(event){
				event.onComplete = function(){
					if(event.target == 'bankBranchId'){//分行
            			var bankBranchId = event.value_new.id;
            			var subsets = vm.getSubsets(bankBranchId);
//	            			var managers = [];
//	            			if(subsets.length != 0){
//	            				vm.getManagerData(subsets[0].id);
//	            			}else{
//	            				
//	            				w2ui['customerForm'].get('employeeId').options.items = managers.slice(0);
//	            				w2ui['customerForm'].get('employeeId').$el.data('selected', managers.length?managers[0]:{}).change();
//	            			}
            			w2ui['customerForm'].get('bankSubsetId').options.items = subsets.slice(0);
            			w2ui['customerForm'].get('bankSubsetId').$el.data('selected', subsets.length?subsets[0]:{}).change();
//	            			w2ui['customerForm'].validate();
            		}else if(event.target == 'bankSubsetId'){//支行
            			var bankSubsetId = event.value_new.id;
            			var managers = [];
            			if(bankSubsetId){
            				vm.getManagerData(bankSubsetId);
            			}else{
            				w2ui['customerForm'].get('employeeId').options.items = managers.slice(0);
            				w2ui['customerForm'].get('employeeId').$el.data('selected', managers.length?managers[0]:{}).change();
            			}
            		}
//	            		w2ui['customerForm'].refresh();
            	}
            }
        });
//		}else{
//			w2ui['customerForm'].clear();
//		}
		var originData = $.extend({}, this.clientData.CustomerInfo);
		var data = $.extend({}, this.clientData.CustomerInfo);
		w2ui['customerForm'].record = data;
		w2ui['customerForm'].record.bankBranchId = originData.bankBranchCode;
		w2ui['customerForm'].record.bankSubsetId = originData.bankSubsetCode;
		var subsets = vm.getSubsets(originData.bankBranchCode);
		var managers = [];
		if(subsets.length != 0){
			vm.getManagerData(originData.bankSubsetCode, true);
		}else{
			w2ui['customerForm'].get('employeeId').options.items = managers.slice(0);
		}
		w2ui['customerForm'].get('bankSubsetId').options.items = subsets.slice(0);
		w2ui['customerForm'].refresh();
		this.showFormForManager();
	}
	//除客户经理外，其他
	page.loadFormForOther = function(){
		var vm = this;
		if(w2ui.customerForm){
			w2ui['customerForm'].destroy();
		}
		$(".client-info-wrapper").w2form({
            name: 'customerForm',
//          style: 'height: inherit;',
            fields: [
                { name: 'employeeId', type: 'list', required: true, 
                	options: {
	                	items: [],
	                },
                },
            ],
            record: {
            	
            },
            actions: {
                "save": function () { 
                	var errs = this.validate(); 
                	if(this.record.customerId){
            			vm.editForm();
            		}else{
            			vm.addForm();
            		}
                },
                "reset": function () { 
                	this.clear();
                	w2popup.close();
                }
            },
            onChange: function(event){
				event.onComplete = function(){
            		w2ui['customerForm'].validate();
            	}
            }
        });
//		}else{
//			w2ui['customerForm'].clear();
//		}
		var originData = $.extend({}, this.clientData.CustomerInfo);
		var data = $.extend({}, this.clientData.CustomerInfo);
		w2ui['customerForm'].record = data;
		w2ui['customerForm'].record.bankBranchId = originData.bankBranchCode;
		w2ui['customerForm'].record.bankSubsetId = originData.bankSubsetCode;
//		var subsets = vm.getSubsets(originData.bankBranchCode);
		var managers = [];
		if(originData.bankSubsetCode){
			vm.getManagerData(originData.bankSubsetCode, true);
		}else{
			w2ui['customerForm'].get('employeeId').options.items = managers.slice(0);
		}
//		w2ui['customerForm'].get('bankSubsetId').options.items = subsets.slice(0);
		w2ui['customerForm'].refresh();
		this.showFormForOther();
	};
	//客户经理打开form时
	page.showFormForManager = function(){
		$(".client-main-info__value").hide();
		$(".client-main-info__value[data-show='yes']").show();
		$(".client-main-info__input").show();
//		$(".client-info-wrapper").addClass('w2ui-reset w2ui-form');
	};
	//其他角色打开form时
	page.showFormForOther = function(){
		$("#value--manager").hide();
		$("#input--manager").show();
//		$(".client-info-wrapper").addClass('w2ui-reset w2ui-form');
	};
	page.bindEvent = function(){
		var vm = this;
		$(document).on('click', ".block-btn--edit", function(){
			if(vm.clientData.CustomerInfo.importNo){
				w2alert('该客户无法修改', '提示');
				return;
			}
			$(this).hide();
			$(".block-btn--save").show();
			$(".block-btn--cancel").show();
			vm.loadForm();			
		});
		$(document).on('click', ".block-btn--save", function(){
			var errs = w2ui['customerForm'].validate();
			if(errs.length == 0){
				vm.editForm();
			}
		});
		$(document).on('click', ".block-btn--cancel", function(){
			vm.getAllData();
		});
	};
	page.editForm = function(){
		if(this.roleId == 1){
			this.editFormForManager();
		}else{
			this.editFormForOther();
		}
	};
	//客户经理编辑form
	page.editFormForManager = function(){
		var vm = this;
		var res = w2ui['customerForm'].record;
		var params = $.extend({}, w2ui['customerForm'].record);
		params.creditRating = res.creditRating.id;
		params.level1Code = res.level1Code.id;
		params.isStrategic = res.isStrategic.id;
		params.hasrRisk = res.hasrRisk.id;
		params.employeeId = res.employeeId.id;
		params.bankBranchId = res.bankBranchId.id;
		params.bankSubsetId = res.bankSubsetId.id;
		delete	params.level2Code;
		delete	params.level3Code;
		utilObj.ajax({
			url: 'm/customer/saveCustomerInfo',
			data: params,
			success: function(data){
				vm.getAllData();
			}
		})
	};
	//其他角色编辑form
	page.editFormForOther = function(){
		var vm = this;
		var res = w2ui['customerForm'].record;
		var params = $.extend({}, w2ui['customerForm'].record);
		params.employeeId = res.employeeId.id;
		delete	params.level2Code;
		delete	params.level3Code;
		utilObj.ajax({
			url: 'm/customer/saveCustomerInfo',
			data: params,
			success: function(data){
				vm.getAllData();
			}
		})
	};
	page.loadForm = function(){
		this.getOptions();
		if(this.roleId == 1){//客户经理
			this.loadFormForManager();
		}else{
			this.loadFormForOther();
		}
	};
	page.getAllData = function(){
		var vm = this;
		utilObj.showLoading('#wrap', '加载中..');
		if(!this.originOptionsData){
			$.when(this.getClientData(), this.getBankData(), this.getCreditList(), this.getTradeData())
			.then(function(clientData, bankData, creditData, tradeData){
				vm.originOptionsData = {
					bankData: bankData,
					creditData: creditData,
					tradeData: tradeData,
				}
				vm.clientData = clientData;
				vm.loadClientInfo(clientData);
				utilObj.hideLoading('#wrap');
			});
		}else{
			
			$.when(this.getClientData())
			.then(function(clientData){
				vm.clientData = clientData;
				vm.loadClientInfo(clientData);
				utilObj.hideLoading('#wrap');
			});
		}
	}
	page.loadClientInfo = function(clientData){
		clientData.roleId = this.roleId;
		var h = template('client-info', {
			data: clientData,
		});
		$(".client-info-wrapper").html(h).removeClass('w2ui-reset w2ui-form');
	};
	//初始化
	page.init = function(){
		var date = new Date().format('yyyy年MM月dd日');
		$(".homepage-refresh-date").html('数据截止日期' + date);
		this.bindEvent();
		this.getAllData();
	};
	page.init();
});