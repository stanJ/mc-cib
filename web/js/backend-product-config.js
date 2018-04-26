define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}
	page.employeeId = utilObj.userLogined.employeeId;
	
	page.columns = [
		{field: "productCode", caption: "产品编号", size: "11%", attr: "align=center"},
		{field: "productType", caption: "业务类型", size: "11%", attr: "align=center",},
		{field: "productName", caption: "产品名称", size: "11%", attr: "align=center",
			render: function(record, index, column_index){
				var h = '<span class="product-name backend-link" data-id="'+record.productId+'">'+record.productName+'</span>'
				return h;
			}
		},
		{field: "unit", caption: "产品单位", size: "11%", attr: "align=center",
			render: function(record, index, column_index){
				var unit = '';
				if(record.isEva == 1){
					unit = '金额';
				}else if(record.isEva == 0){
					unit = '数量';
				}
				return unit;
			}
		},
		{field: "productManagerName", caption: "主办产品经理", size: "11%", attr: "align=center"},
		{field: "isExamine", caption: "是否信审", size: "11%", attr: "align=center",
			render: function(record, index, column_index){
				var text = '';
				if(record.isExamine == 'Y'){
					text = '是';
				}else if(record.isExamine == 'N'){
					text = '否';
				}
				var h = '<span>'+text+'</span>';
				return h;
			}
		},
		{field: "", caption: "操作", size: "140px", attr: "align=center",
			render: function(record, index, column_index){
				var h = '';
				h += 
					'<span class="operation operation--edit" data-id="'+record.recid+'" data-index="'+index+'">编辑</span>';
				h += 
					'<span class="operation operation--delete" data-id="'+record.recid+'" data-index="'+index+'">删除</span>';
						
				return h;
			}
		}
	];
	//穿梭框事件
	page.bindTransferEvent = function(){
		$(".transfer-wrapper").on('click', '.transfer__btn--go-one', function(){
			var wrapper = $(this).parents('.transfer-wrapper');
			var selectedLeft = wrapper.find('.transfer__part--left>.transfer__item.selected').removeClass('selected');
			wrapper.find('.transfer__part--right').append(selectedLeft);
		});
		$(".transfer-wrapper").on('click', '.transfer__btn--back-one', function(){
			var wrapper = $(this).parents('.transfer-wrapper');
			var selectedRight = wrapper.find('.transfer__part--right>.transfer__item.selected').removeClass('selected');
			wrapper.find('.transfer__part--left').append(selectedRight);
		});
		$(".transfer-wrapper").on('click', '.transfer__btn--go-all', function(){
			var wrapper = $(this).parents('.transfer-wrapper');
			var allLeft = wrapper.find('.transfer__part--left>.transfer__item').removeClass('selected');
			wrapper.find('.transfer__part--right').append(allLeft);
		});
		$(".transfer-wrapper").on('click', '.transfer__btn--back-all', function(){
			var wrapper = $(this).parents('.transfer-wrapper');
			var allRight = wrapper.find('.transfer__part--right>.transfer__item').removeClass('selected');
			wrapper.find('.transfer__part--left').append(allRight);
		});
		$(".transfer-wrapper").on('click', '.transfer__item', function(){
			$(this).siblings().removeClass('selected');
			$(this).addClass('selected');
		});
	};
	//绑定选择协助产品经理事件
	page.bindSelectManagerEvent = function(){
		var vm = this;
		$("#select-manager").off('click').click(function(){
			var rightAll = $(".transfer__part--right").find('.transfer__item');
			var assistManagers = [];
			rightAll.each(function(){
				var id = $(this).data('id');
				var name = $(this).data('name');
				assistManagers.push({
					employeeId: id,
					employeeName: name,
				})
			});
			w2ui['productForm'].record.productEmployeeList = assistManagers;
			vm.openProduct('set');
		});
		$("#go-back").off('click').click(function(){
			vm.openProduct('set');
		});
	};
	//绑定表格
	page.getTableData = function(){
		var vm = this;
		if(this.options){
			$.when(this.getProducts())
			.then(function(productsData){
				var ary = utilObj.addRecid(productsData, 'productId');
				vm.data = ary;
				vm.loadTable();
			})
		}else{
			$.when(this.getProducts(), this.getOptions())
			.then(function(productsData, options){
				var ary = utilObj.addRecid(productsData, 'productId');
				vm.data = ary;
				vm.options = options;
				vm.loadTable();
			})
		}
	};
	//产品数据
	page.getProducts = function(){
		var vm = this;
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/product/findProduct',
			data: {
				
			},
			success: function(data){
				dtd.resolve(data.object);
			}
		});
		return dtd;
	};
	//某产品数据
	page.getThisProductData = function(id){
		var vm = this;
		utilObj.ajax({
			url: 'm/product/findProductById',
			data: {
				productId: id,
			},
			beforeSend: function(){
				utilObj.showLoading('#wrap');
			},
			complete: function(){
				utilObj.hideLoading('#wrap');
			},
			success: function(data){
				var res = data.object;
				w2ui['productForm'].record = res.product;
				w2ui['productForm'].record.productEmployeeList = res.productEmployeeList;
				w2ui['productForm'].refresh();
				vm.loadSelectedAssistManager();
				vm.toDisableInput();
			}
		});
	};
	
	page.loadTable = function(){
		if(!w2ui.product){
			$(".product-table").w2grid({
				name: "product",
				show: { 
		            toolbar: true,
		            footer: false,
		            toolbarReload: false,
		            toolbarColumns: false,
					toolbarSearch: false,
		        },
		        multiSearch: true,
		        searches: [
		            { field: 'productCode', caption: '产品编号', type: 'text', operator: "contains"},
		            { field: 'productType', caption: '业务类型', type: 'text', operator: "contains"},
		        	{ field: "all",caption: "产品编号,业务类型",type:"text", operator: "contains"},
		        ],
				recordHeight: 44,
				fixedBody: true,
				columns: this.columns,
				records: this.data,
				onDblClick: function(event){
					event.preventDefault();
				}
			});
		}else{
			w2ui['product'].records = this.data;
			w2ui['product'].refresh();
			$(".product-table").w2render('product');
		}
	};
	//点击编辑
	page.edit = function(id){
		var vm = this;
		vm.loadForm();
		vm.openProduct(id);
	};
	//点击删除
	page.delete = function(id){
		var vm = this;
		w2confirm({
		 	msg:'确定删除？',
		 	title: '提示',
		 	btn_yes: {
		 		text:　'确定',
		 		class: 'button--primary',
		 		style: 'margin-right: 20px',
		 	},
		 	btn_no: {
		 		text:　'取消',
		 		class: 'button--cancel',
		 	},
		 })
	    .yes(function () {
	    	vm.toDelete(id);
	    })
	    .no(function () { 
	    	
	    });
	};
	
	page.toDelete = function(id){
		var vm = this;
		utilObj.ajax({
			url: 'm/product/deleteProduct',
			data: {
				productId: id,
				employeeId: utilObj.userLogined.employeeId,
			},
			beforeSend: function(){
				w2ui['product'].lock('删除中', true);
			},
			complete: function(){
				w2ui['product'].unlock();
			},
			success: function(data){
				vm.getTableData();
			}
			
		})
	};
	
	page.bindEvent = function(){
		var vm = this;
		$(".product-table").on('click', '.product-name', function(){
			var id = $(this).data('id');
			vm.openManager(id);
		});
		$(".product-table").on('click', '.operation--edit', function(){
			var id = $(this).data('id');
			vm.edit(id);
		});
		$(".product-table").on('click', '.operation--delete', function(){
			var id = $(this).data('id');
			vm.delete(id);
		});
		$("#add").click(function(){
			vm.loadForm();
			vm.openProduct();
		});
		$(document).on('click', '#setManager', function(){
			vm.selectManager();
		});
		$("#import-product").change(function(e){
			var file = e.target.files[0];
			if(!file){
				return;
			}
			var form = new FormData();
			form.append("excelFile", file);
			
			utilObj.ajax({
				url: 'm/input/inputProduct',
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
	};
	
	page.bindProductEvent = function(){
//		var vm = this;
//		$("#setManager").click(function(){
//			vm.selectManager();
//		});
	}
	//产品负责人弹框
	page.openManager = function(id){
		var vm = this;
		$().w2popup('open', {
	        title   : '产品负责人',
	        body    : '<div class="backend-popup-body"><div class="backend-popup-content backend-popup-content--manager"></div></div>',
	        buttons : '<button class="button popup-btn button--primary" onclick="w2popup.close();">确定</button>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : 402,
	        height  : 296, 
	        showClose: false,
	        modal	: true,
	        onOpen: function (event) {
	            event.onComplete = function () {
	            	utilObj.ajax({
						url: 'm/product/findProductById',
						data: {
							productId: id,
						},
						beforeSend: function(){
							utilObj.showLoading('.w2ui-popup-body');
						},
						complete: function(){
							utilObj.hideLoading('.w2ui-popup-body');
						},
						success: function(data){
							var res = data.object;
							var assistManagers = $.map(res.productEmployeeList, function(val){
								return val.employeeName;
							});
							assistManagers = assistManagers.join(',');
							var h = template('manager', {
								data: {
									mainManager: res.product.productManagerName,
									assistManagers: assistManagers,
									remark: res.product.remark == null ? "" : res.product.remark
								},
							});
	            			$(".backend-popup-content--manager").html(h);
						}
					})
	            }
	        }
	    });
	};
	//获取选项信息
	page.getOptions = function(){
		var vm = this;
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/product/findProductById',
			data: {
				
			},
			success: function(data){
				dtd.resolve(data.object);
			}
		});
		return dtd;
	};
	//编辑或添加产品表单
	page.loadForm = function(){
		var vm = this;
		var types = vm.options.sysConfigList;
		types = $.map(types, function(val, i){
			return val.configName;
		});
		var units = [
			{
				id: 1,
				text: '金额',
			},
			{
				id: 0,
				text: '数量',
			},
		];
		var isExamine = [
			{
				id: 'Y',
				text: '是',
			},
			{
				id: 'N',
				text: '否',
			},
		];
		var evaTypes = [
			{
				id: '存款业务',
				text: '存款业务',
			},
			{
				id: '贷款业务',
				text: '贷款业务',
			},
			{
				id: '银行承兑',
				text: '银行承兑',
			},
			{
				id: '非融资性保函',
				text: '非融资性保函',
			},
			{
				id: '信用证',
				text: '信用证',
			},
			{
				id: '非标业务',
				text: '非标业务',
			},
			{
				id: '贷款承诺',
				text: '贷款承诺',
			},
		];
		var bizs = [
			{
				id: '表内',
				text: '表内',
			},
			{
				id: '表外',
				text: '表外',
			},
		]
		var managers = vm.options.employeeList;
		managers = $.map(managers, function(val){
			return {
				id: val.employeeId,
				text: val.employeeName,
			}
		});
		this.actualOptions = {
			types: types,
			units: units,
			isExamine: isExamine,
			managers: managers,
			evaTypes: evaTypes,
			bizs: bizs,
		}
		if(!w2ui.productForm){
			$().w2form({
	            name: 'productForm',
	            style: 'border: 0px; background-color: transparent;',
	            formHTML: template('product-form')(),
	            fields: [
	                { name: 'productCode', type: 'text', required: true},
	                { name: 'productType', type: 'list', required: true, 
	                	options: {
		                	items: types,
		                },
	                },
	                { name: 'productName', type: 'text', required: true},
	                { name: 'isEva', type: 'list', required: true, 
	                	options: {
		                	items: units,
		                },
	                },
	                { name: 'productEvaType', type: 'list', required: true, 
	                	options: {
		                	items: evaTypes,
		                },
	                },
	                { name: 'creditConvert', type: 'percent', required: true, 
	                	options: {
	                		precision: 0,
	                		min: 0,
	                		max: 100,
	                	}
	                },
	                { name: 'inBiz', type: 'list', required: true, 
	                	options: {
		                	items: bizs,
		                },
	                },
	                { name: 'isExamine', type: 'list', required: true,
	                	options: {
		                	items: isExamine,
		                },
	                },
	                { name: 'productManager', type: 'list', required: true, 
	                	options: {
		                	items: managers,
		                },
	                },
	                { name: 'productEmployeeList', type: 'text',},
	                { name: 'remark', type: "text"}
	            ],
	            record: {
	            	
	            },
	            actions: {
	                "save": function () { 
	                	var errs = this.validate();
	                	if(this.record.isEva.id == 0){
	                		errs = vm.deleteError(errs);
	                		vm.removeError();
	                	}
	                	if(errs.length == 0){
	                		if(this.record.productId){
	                			vm.editForm();
	                		}else{
	                			vm.addForm();
	                		}
	                	}
	                },
	                "reset": function () { 
	                	this.clear();
	                	w2popup.close();
	                }
	            },
	            onChange: function(event){
					event.onComplete = function(){
	            		w2ui['productForm'].validate();
	            		if(event.target == 'productManager'){
	            			var newId = event.value_new.id;
	            			var productEmployeeList = w2ui['productForm'].record.productEmployeeList.slice(0);
	            			var index = _.findIndex(productEmployeeList, {
	            				employeeId: newId,
	            			});
	            			productEmployeeList.splice(index, 1);
	            			w2ui['productForm'].record.productEmployeeList = productEmployeeList;
	            			vm.loadSelectedAssistManager();
	            		}else if(event.target == 'isEva'){
	            			var newId = event.value_new.id;
	            			if(newId == 0){//数量为单位

								vm.toDisableInput();
	            			}else{

								vm.toEnableInput();
	            			}
	            		}else{
	            			if(w2ui['productForm'].record.isEva.id == 0){//产品单位为数量单位时
	            				vm.removeError();
	            			}
	            		}
	            	}
	            }
	        });
		}else{
			w2ui['productForm'].clear();
		}
	};
	//数量为单位时,校验时应该去掉EVA产品类型,转换系数,表内表外的报错
	page.removeError = function(){
		$("input[name=productEvaType]").w2tag();
	    $("input[name=productEvaType]").addClass('w2ui-disabled');
		$("input[name=inBiz]").w2tag();
	    $("input[name=inBiz]").addClass('w2ui-disabled');
		$("input[name=creditConvert]").w2tag();
	    $("input[name=creditConvert]").addClass('w2ui-disabled');
	};
	//剔除转换系数报错
	page.deleteError = function(errs){
		errs = utilObj.deleteOneError(errs, 'creditConvert');
		errs = utilObj.deleteOneError(errs, 'productEvaType');
		errs = utilObj.deleteOneError(errs, 'inBiz');
		return errs;
	};
	page.loadTransfer = function(){
		var allManagers = this.options.employeeList.slice(0);
		var mainId = w2ui['productForm'].record.productManager.id;
		var mainIndex = _.findIndex(allManagers, {
			employeeId: mainId,
		});
		allManagers.splice(mainIndex, 1);
		var productEmployeeList =  w2ui['productForm'].record.productEmployeeList.slice(0);
		$.each(productEmployeeList, function(i, val) {
			var index = _.findIndex(allManagers, {
				employeeId: val.employeeId,
			});
			allManagers.splice(index, 1);
		});
		var h = template('transfer', {
			data: {
				left: allManagers,
				right: productEmployeeList,
			}
		});
	    $(".backend-popup-content--select-manager").html(h);
	};
	
	page.editForm = function(){
		var vm = this;
		var res = w2ui['productForm'].record;
		var data = $.extend({},  w2ui['productForm'].record);
		data.isEva = res.isEva.id;
		data.isExamine = res.isExamine.id;
		var manager = $.extend({}, res.productManager);
		data.productManager = manager.id;
		data.productManagerName = manager.text;
		data.productType = res.productType.id;
		if(data.isEva == 1){
			data.productEvaType = res.productEvaType.id;
			data.inBiz = res.inBiz.id;
			data.creditConvert = res.creditConvert;
		}else{
			delete data.productEvaType;
			delete data.inBiz;
			delete data.creditConvert;
		}
		data.productId = res.productId;
		var list = '[{}]';
		if(res.productEmployeeList.length>0){
			list = JSON.stringify(res.productEmployeeList);
		}
		delete data.productEmployeeList;
		data.remark = $.trim($("#remark").val()).length > 0 ? $.trim($("#remark").val()) : data.remark;
		utilObj.ajax({
			url: 'm/product/updateProduct',
			data: {
				jsonEntity: JSON.stringify(data),
				data: list,
				employeeId: this.employeeId,
			},
			success: function(data){
				vm.getTableData();
				w2popup.close();
			}
		});
	};
	
	page.addForm = function(){
		var vm = this;
		var data = $.extend({},  w2ui['productForm'].record);
		data.isEva = data.isEva.id;
		data.isExamine = data.isExamine.id;
		var manager = $.extend({}, data.productManager);
		data.productManager = manager.id;
		data.productManagerName = manager.text;
		data.productType = data.productType.id;
		if(data.isEva == 1){
			data.productEvaType = data.productEvaType.id;
			data.inBiz = data.inBiz.id;
			data.creditConvert = data.creditConvert;
		}else{
			delete data.productEvaType;
			delete data.inBiz;
			delete data.creditConvert;
		}
		var list = '[{}]';
		if(data.productEmployeeList.length>0){
			list = JSON.stringify(data.productEmployeeList);
		}
		delete data.productEmployeeList;
		utilObj.ajax({
			url: 'm/product/createProduct',
			data: {
				jsonEntity: JSON.stringify(data),
				data: list,
				employeeId: this.employeeId,
			},
			success: function(data){
				vm.getTableData();
				w2popup.close();
			}
		})
	};
	//编辑或添加产品弹框
	page.openProduct = function(id){
		var vm = this;
		$().w2popup('open', {
	        title   : '产品信息',
	        body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : 640,
	        height  : 560,
	        modal	: true,
	        showClose: false,
	        onOpen: function (event) {
	            event.onComplete = function () {
	                $('#w2ui-popup #form').w2render('productForm');
	                if(id){
	                	if(id != 'set'){
	                		vm.getThisProductData(id);
	                	}else{
	                		vm.toDisableInput();
	                		vm.loadSelectedAssistManager();
	                	}
	                }else{
	                	w2ui['productForm'].record.productType = vm.actualOptions.types[0];
	                	w2ui['productForm'].record.isEva = vm.actualOptions.units[0];
	                	w2ui['productForm'].record.isExamine = vm.actualOptions.isExamine[0];
	                	w2ui['productForm'].record.productManager = vm.actualOptions.managers[0];
	                	w2ui['productForm'].record.productEvaType = vm.actualOptions.evaTypes[0];
	                	w2ui['productForm'].record.inBiz = vm.actualOptions.bizs[0];
	                	w2ui['productForm'].record.productEmployeeList = [];
	                	w2ui['productForm'].refresh();
	                	vm.loadSelectedAssistManager();
	                	vm.toDisableInput();
	                }
	                vm.bindProductEvent();
	            }
	        }
	    });
	};
	page.toDisableInput = function(){
		var isEva = w2ui['productForm'].record.isEva.id;
		if(isEva == 0){
			$("input[name=productEvaType]").prop('disabled', true);
			$("input[name=creditConvert]").prop('disabled', true);
			$("input[name=inBiz]").prop('disabled', true);
			
			$("input[name=productEvaType]").w2tag();
			$("input[name=productEvaType]").addClass('w2ui-disabled');
			$("input[name=creditConvert]").w2tag();
			$("input[name=creditConvert]").addClass('w2ui-disabled');
			$("input[name=inBiz]").w2tag();
			$("input[name=inBiz]").addClass('w2ui-disabled');
		}
	};
	page.toEnableInput = function(){
		var isEva = w2ui['productForm'].record.isEva.id;
		if(isEva == 1){
			$("input[name=productEvaType]").prop('disabled', false);
			$("input[name=creditConvert]").prop('disabled', false);
			$("input[name=inBiz]").prop('disabled', false);
			
			$("input[name=productEvaType]").removeClass('w2ui-disabled');
			$("input[name=creditConvert]").removeClass('w2ui-disabled');
			$("input[name=inBiz]").removeClass('w2ui-disabled');
		}
	};
	page.loadSelectedAssistManager = function(){
		var productEmployeeList = w2ui['productForm'].record.productEmployeeList.slice(0);
		var h = '';
		$.each(productEmployeeList, function(i, val){
			h += '<span class="tag" data-id="'+val.employeeId+'" data-name="'+val.employeeName+'">'+val.employeeName+'</span>';
		})
		$(".assistManagerWrapper").html(h);
	}
	//选择协助产品经理弹框
	page.selectManager = function(){
		var vm = this;
		$().w2popup('open', {
	        title   : '设置协助产品经理',
	        body    : '<div class="backend-popup-body" style="padding: 0 20px;"><div class="backend-popup-content backend-popup-content--select-manager"></div></div>',
	        buttons : '<button class="button popup-btn button--primary" style="margin-right:20px" id="select-manager">确定</button><button class="button popup-btn button--cancel" id="go-back">取消</button>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : 640,
	        height  : 500,
	        modal	: true,
	        showClose: false,
	        onOpen: function (event) {
	            event.onComplete = function () {
	            	vm.loadTransfer();
	            	vm.bindTransferEvent();
	            	vm.bindSelectManagerEvent();
	            }
	        }
	    });
	};
	
	page.bindEvent();
	page.getTableData();
/********************************************************************/
	// utilObj.showLoading($("#wrap"),"加载中");
	// $.when(page.bindGrid()).done(function(){
	// 	utilObj.hideLoading();
	// });

	//编辑/保存
	// $(document).on("click",".edit-btn",function(){
	// 	var recid = $(this).attr("data-recid");
	// 	if($(this).hasClass("save-btn")){
	// 		//保存参数
	// 		page.saveParam = {
	// 			costType: w2ui["Risk"].get(recid).costType,
	// 			pd: page.curr_input.val()
	// 		};

	// 		//切换保存按钮
	// 		$(this).text("编辑").removeClass("save-btn");

	// 		//保存
	// 		page.saveEdit();
	// 	} else {
	// 		if(page.curr_input){
	// 			page.curr_input.data('keep-open', false).blur();
	// 			$(".save-btn").removeClass("save-btn").text("编辑");
	// 		}
			
	// 		$(this).text("保存").addClass("save-btn");			
	// 		w2ui["Risk"].editField(recid,1);
	// 	}
		
	// });
});