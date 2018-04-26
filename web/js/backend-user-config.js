define(function(require,exports,module){
	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}
	page.employeeId = utilObj.userLogined.employeeId;
	page.columns = [
		{field: "employeeNo", caption: "工号", size: "11%", attr: "align=center",
			render: function(record, index, column_index){
				var h = '<span class="employee-no backend-link" data-id="'+record.userId+'">'+record.employeeNo+'</span>'
				return h;
			}
		},
		{field: "employeeName", caption: "姓名", size: "11%", attr: "align=center",},
		{field: "roleName", caption: "角色", size: "11%", attr: "align=center",},
		{field: "bankBranchName", caption: "分行", size: "11%", attr: "align=center",},
		{field: "bankSubsetName", caption: "支行", size: "11%", attr: "align=center"},
//		{field: "mobile", caption: "联系方式", size: "11%", attr: "align=center"},
		{field: "", caption: "操作", size: "210px", attr: "align=center",
			render: function(record, index, column_index){
				var h = '';
				h += 
					'<span class="operation operation--edit" data-id="'+record.recid+'" data-index="'+index+'">编辑</span>';
				h += 
					'<span class="operation operation--delete" data-id="'+record.recid+'" data-index="'+index+'">删除</span>';
				h += 
					'<span class="operation operation--reset" data-id="'+record.recid+'" data-index="'+index+'">重置密码</span>';
						
				return h;
			}
		}
	];
	//绑定表格
	page.getTableData = function(){
		var vm = this;
		if(this.options){
			$.when(this.getUser())
			.then(function(userData){
				var ary = utilObj.addRecid(userData, 'userId');
				var index = _.findIndex(ary, {
					roleId: 2,
				});
				ary.splice(index, 1);
				vm.data = ary;
				vm.loadTable();
			})
		}else{
			$.when(this.getUser(), this.getOptions())
			.then(function(userData, options){
				var ary = utilObj.addRecid(userData, 'userId');
				var index = _.findIndex(ary, {
					roleId: 2,
				});
				ary.splice(index, 1);
				vm.data = ary;
				vm.options = options;
				vm.loadTable();
			})
		}
	};
	//产品数据
	page.getUser = function(){
		var vm = this;
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/employee/findEmployee',
			data: {
				
			},
			success: function(data){
				dtd.resolve(data.object);
			}
		});
		return dtd;
	};
	//某产品数据
	page.getThisUserData = function(id){
		var vm = this;
		utilObj.ajax({
			url: 'm/employee/findEmployeeByUserId',
			data: {
				userId: id,
			},
			beforeSend: function(){
				utilObj.showLoading('.backend-user-form');
			},
			complete: function(){
				utilObj.hideLoading('.backend-user-form');
			},
			success: function(data){
				var res = data.object;
				w2ui['userForm'].record = $.extend({}, res);
				w2ui['userForm'].refresh();
				vm.loadByRole(res.roleId);
				vm.loadAllCheckboxGroup(res.bankBranchId);
				vm.selectSubsetCheckboxGroup(res.bankSubsetId);
				vm.selectPageCheckboxGroup(res.resourceIdList);
			}
		});
	};
	
	page.loadTable = function(){
		if(!w2ui.user){
			$(".user-table").w2grid({
				name: "user",
				show: { 
		            toolbar: true,
		            footer: false,
		            toolbarReload: false,
		            toolbarColumns: false,
					toolbarSearch: false,
		        },
		        multiSearch: true,
		        searches: [
		            { field: 'employeeNo', caption: '工号', type: 'text', operator: "contains"},
		            { field: 'employeeName', caption: '姓名', type: 'text', operator: "contains"},
		            { field: 'roleName', caption: '角色', type: 'text', operator: "contains"},
		            { field: "all",caption: "工号,姓名,角色",type:"text", operator: "contains"},
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
			w2ui['user'].records = this.data;
			w2ui['user'].refresh();
			$(".user-table").w2render('user');
		}
	};
	//点击编辑
	page.edit = function(id){
		var vm = this;
		vm.loadForm();
		vm.openUser(id);
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
	//重置密码
	page.resetPW = function(id){
		var vm = this;
		w2confirm({
		 	msg:'确定重置密码？',
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
	    	vm.toResetPW(id);
	    })
	    .no(function () { 
	    	
	    });
	};
	page.toResetPW = function(id){
		var vm = this;
		utilObj.ajax({
			url: 'm/employee/resetPassword',
			data: {
				userId: id,
			},
			beforeSend: function(){
				w2ui['user'].lock('加载中..', true);
			},
			complete: function(){
				w2ui['user'].unlock();
			},
			success: function(data){
				
			}
			
		})
	};
	page.toDelete = function(id){
		var vm = this;
		utilObj.ajax({
			url: 'm/employee/deleteEmployee',
			data: {
				userId: id,
				employeeId: this.employeeId,
			},
			beforeSend: function(){
				w2ui['user'].lock('删除中', true);
			},
			complete: function(){
				w2ui['user'].unlock();
			},
			success: function(data){
				vm.getTableData();
			}
			
		})
	};
	
	page.bindEvent = function(){
		var vm = this;
		$(".user-table").on('click', '.employee-no', function(){
			var id = $(this).data('id');
			vm.openPage(id);
		});
		$(".user-table").on('click', '.operation--edit', function(){
			var id = $(this).data('id');
			vm.edit(id);
		});
		$(".user-table").on('click', '.operation--delete', function(){
			var id = $(this).data('id');
			vm.delete(id);
		});
		$(".user-table").on('click', '.operation--reset', function(){
			var id = $(this).data('id');
			vm.resetPW(id);
		});
		$("#add").click(function(){
			vm.loadForm();
			vm.openUser();
		});
		$("#import-user").change(function(e){
			var file = e.target.files[0];
			if(!file){
				return;
			}
			var form = new FormData();
			form.append("excelFile", file);
			utilObj.ajax({
				url: 'm/input/inputEmployee',
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
	//绑定表单事件
	page.bindFormEvent = function(){
		var vm = this;
		$(".checkboxgroup[data-name='bankSubsetId']").on('change', 'input[type=checkbox]', function(e){
			var roleId = w2ui['userForm'].record.roleId.id;
			if(roleId == 1){//客户经理只能单选
				var checked = $(this).prop('checked');
				if(checked){
					$(".checkboxgroup[data-name='bankSubsetId']").find('input[type=checkbox]').not(this).prop('checked', false);
				}
			}
			vm.validateSubset();
		});
	};
	//产品负责人弹框
	page.openPage = function(id){
		var vm = this;
		$().w2popup('open', {
	        title   : '显示页面',
	        body    : '<div class="backend-popup-body"><div class="backend-popup-content backend-popup-content--page"></div></div>',
	        buttons : '<button class="button popup-btn button--primary" onclick="w2popup.close();">确定</button>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : 650,
	        height  : 360, 
	        showClose: false,
	        modal	: true,
	        onOpen: function (event) {
	            event.onComplete = function () {
	            	utilObj.ajax({
						url: 'm/employee/findEmployeeByUserId',
						data: {
							userId: id,
						},
						beforeSend: function(){
							utilObj.showLoading('.w2ui-popup-body');
						},
						complete: function(){
							utilObj.hideLoading('.w2ui-popup-body');
						},
						success: function(data){
							var res = data.object;
							var resourceList = vm.options.resourceList;
							var h = template('pageCheckbox', {
								data: vm.alterPagesData(resourceList),
							})
							var h1 = template('page')();
	            			$(".backend-popup-content--page").html(h1);
	            			$(".checkboxgroup--page").html(h);
	            			vm.selectPageCheckboxGroup(res.resourceIdList, $(".checkboxgroup--page"));
	            			vm.disablePageCheckbox();
						}
					})
	            }
	        }
	    });
	};
	//checkbox disabled
	page.disablePageCheckbox = function(){
		$(".checkboxgroup--page").find('input[type=checkbox]').attr('disabled', true);
	};
	//获取选项信息
	page.getOptions = function(){
		var vm = this;
		var dtd = $.Deferred();
		utilObj.ajax({
			url: 'm/employee/findEmployeeByUserId',
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
		var roles = vm.options.roleList;
		roles = $.map(roles, function(val) {
			if(val.roleId == 2){
				return null;
			}else if(val.roleId == 3){
				return {
					id: val.roleId,
					text: '总行公司部',
				}
			}else{
				return {
					id: val.roleId,
					text: val.roleName,
				}
			}
		});
		var banks = vm.options.bankVoList;
		var branchBanks = $.map(banks, function(val){
			return {
				id: val.bankId,
				text: val.bankName,
			}
		})
		this.actualOptions = {
			roles: roles,
			branchBanks: branchBanks,
		}
		if(!w2ui.userForm){
			$().w2form({
	            name: 'userForm',
	            style: 'border: 0px; background-color: transparent;',
	            formHTML: template('user-form')(),
	            fields: [
	                { name: 'employeeNo', type: 'text', required: true},
	                { name: 'employeeName', type: 'text', required: true,},
	                { name: 'mobile', type: 'text',},
	                { name: 'roleId', type: 'list', required: true,
	                	options: {
		                	items: roles,
		                },
	                },
	                { name: 'bankBranchId', type: 'list', required: true, 
	                	options: {
		                	items: branchBanks,
		                },
	                },
	                { name: 'showSubset', type: 'text', required: true,},
	            ],
	            record: {
	            	
	            },
	            actions: {
	                "save": function () { 
	                	var errs = this.validate(); 
	                	var isSubsetPass = vm.validateSubset();
	                	var roleId = this.record.roleId.id;
	                	if(roleId == 1 || roleId == 5){//客户经理或支行行长
	                		if(!isSubsetPass){
	                			return;
	                		}
	                	}
	                	if(roleId == 6 || roleId == 7 || roleId == 3){//产品经理,信审经理,总行行长可以忽视两个错误
	                		errs = vm.deleteBranchError(errs);
	                		if(errs.length > 1){
	                			return;
	                		}
	                	}else{//其他角色有一个错误忽视
	                		if(errs.length > 1){
	                			return;
	                		}
	                	}
	                	if(this.record.userId){
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
	            		if(event.target == 'roleId'){
	            			var roleId = event.value_new.id;
	            			vm.loadByRole(roleId);
	            			vm.selectPageCheckboxGroupDefault(roleId);
	            		}else if(event.target == 'bankBranchId'){
	            			var branchId = event.value_new.id;
	            			vm.loadSubsetCheckboxGroup(branchId);
	            		}
	            		w2ui['userForm'].validate();
	            		vm.validateSubset();
	            	}
	            }
	        });
		}else{
			w2ui['userForm'].clear();
		}
	};
	//剔除分行报错
	page.deleteBranchError = function(errs){
		var index = null;
		$.each(errs, function(i, val){
			if(val.field.field == 'bankBranchId'){
				index = i;
			}
		});
		if(index != null){
			errs.splice(index, 1);
		}
		return errs;
	};
	//获取选中支行数据
	page.getSubsetData = function(){
		var checked = $(".checkboxgroup[data-name='bankSubsetId']").find('input:checked');
		return this.getSelectData(checked);
	};
	//获取选中页面数据
	page.getPageData = function(){
		var checked = $(".checkboxgroup[data-name='resourceIdList']").find('input:checked');
		return this.getSelectData(checked);
	};
	//获取选中数据
	page.getSelectData = function(checked){
		var ids = [];
		var texts = [];
		checked.each(function(i){
			var id = $(this).val();
			var text = $(this).data('text');
			ids.push(id);
			texts.push(text);
		})
		return {
			id: ids.join(','),
			text: texts.join(','),
		}
	}
	//根据角色不同控制分行和支行的显示隐藏
	page.loadByRole = function(roleId){
		if(roleId == 4){//分行行长显示所属分行，隐藏所属支行
			$(".field--branch").show();
			this.setBranchId();
			$(".field--subset").hide();
		}else if(roleId == 3){//总行公司部隐藏所属分行和所属支行
			$(".field--branch").hide();
			$(".field--subset").hide();
		}else if(roleId == 6){//产品经理隐藏所属分行和所属支行
			$(".field--branch").hide();
			$(".field--subset").hide();
		}else if(roleId == 7){//信审经理隐藏所属分行和所属支行
			$(".field--branch").hide();
			$(".field--subset").hide();
		}else if(roleId == 1){//客户经理显示所属分行和所属支行
			$(".field--branch").show();
			this.setBranchId();
			$(".field--subset").show();
		}else if(roleId == 5){//支行行长显示所属分行和所属支行
			$(".field--branch").show();
			this.setBranchId();
			$(".field--subset").show();
		}
		$(".checkboxgroup[data-name='bankSubsetId']").find('input[type=checkbox]').prop('checked', false);
	};
	//刷新分行id
	page.setBranchId = function(){
		var vm = this;
		var bankBranchId = w2ui['userForm'].record.bankBranchId;
		if(!bankBranchId){
			w2ui['userForm'].record.bankBranchId = vm.actualOptions.branchBanks[0].id;
	        w2ui['userForm'].refresh();
	        vm.loadSubsetCheckboxGroup(w2ui['userForm'].record.bankBranchId.id);
		}
	};
	//验证支行不为空
	page.validateSubset = function(){
		var isPass = false;
		var checked = $(".checkboxgroup[data-name='bankSubsetId']").find('input:checked');
		if(checked.length > 0){
			isPass = true;
		}
		if(!isPass){
			$(".checkboxgroup[data-name='bankSubsetId']").w2tag('请选择所属支行', { position: 'right' });
		}else{
			$(".checkboxgroup[data-name='bankSubsetId']").w2tag();
		}
		return isPass;
	};
	//获取请求参数
	page.getParams = function(){
		var record = w2ui['userForm'].record;
		var data = {};
		if(record.userId){
			data.userId = record.userId;
		}
		data.employeeNo = record.employeeNo;
		data.employeeName = record.employeeName;
		data.mobile = record.mobile;
		//角色
		data.roleId = record.roleId.id;
		data.roleName = record.roleId.text;
		//分行
		data.bankBranchId = record.bankBranchId.id;
		data.bankBranchName = record.bankBranchId.text;
		//页面
		var pageData = this.getPageData();
		if(data.roleId == 1 || data.roleId == 5){//客户经理或支行经理有支行数据
			//支行
			var subsetData = this.getSubsetData();
			data.bankSubsetId = subsetData.id;
			data.bankSubsetName = subsetData.text;
		}else if(data.roleId != 4){//剩下的角色除分行行长角色外都没有分行数据
			delete data.bankBranchId;
			delete data.bankBranchName;
		}
		return {
			jsonEntity: JSON.stringify(data),
			idStr: pageData.id,
			employeeId: this.employeeId,
		}
	}
	page.editForm = function(){
		var vm = this;
		utilObj.ajax({
			url: 'm/employee/updateEmployee',
			data: this.getParams(),
			success: function(data){
				vm.getTableData();
				w2popup.close();
			}
		})
	};
	
	page.addForm = function(){
		var vm = this;
		utilObj.ajax({
			url: 'm/employee/createEmployee',
			data: this.getParams(),
			success: function(data){
				vm.getTableData();
				w2popup.close();
			}
		})
	};
	//加载支行复选框
	page.loadSubsetCheckboxGroup = function(branchId){
		var vm = this;
		var banks = this.options.bankVoList;
		var res = null;
		if(branchId){
			res = _.findWhere(banks, {
				bankId: branchId,
			});
		}
		var subsetBanks = [];
		if(res){
			subsetBanks = res.bankVoList;
		}
		var h = template('subsetBank', {
			data: subsetBanks,
		})
		$(".checkboxgroup[data-name='bankSubsetId']").html(h);
	};
	//加载展示页面复选框
	page.loadPageCheckboxGroup = function(){
		var vm = this;
		var resourceList = this.options.resourceList;
		
		var h = template('pageCheckbox', {
			data: this.alterPagesData(resourceList),
		})
		$(".checkboxgroup[data-name='resourceIdList']").html(h);
	};
	//对页面数据进行分类
	page.alterPagesData = function(data){
		return _.groupBy(data, 'parentName');
	}
	//加载所有复选框
	page.loadAllCheckboxGroup = function(branchId){
		this.loadSubsetCheckboxGroup(branchId);
		this.loadPageCheckboxGroup();
	};
	//选择支行
	page.selectSubsetCheckboxGroup = function(idStr){
		var ids = [];
		if(idStr){
			ids = idStr.toString().split(',');
		}
		$(".checkboxgroup[data-name='bankSubsetId']").find('input[type=checkbox]').prop('checked', false);
		$.each(ids, function(i, val) {
			$(".checkboxgroup[data-name='bankSubsetId']").find('input[value='+val+']').prop('checked', true);
		});
	};
	//选择页面
	page.selectPageCheckboxGroup = function(resourceIdList, $el){
		this.selectPage(resourceIdList, $el);
	}
	//根据角色默认选择页面
	page.selectPageCheckboxGroupDefault = function(roleId){
		var roleResourceList = this.options.roleResourceList;
		var res = _.findWhere(roleResourceList, {
			roleId: roleId,
		});
		var resourceIdList = [];
		if(res){
			resourceIdList = res.resourceIdList;
		}
		this.selectPage(resourceIdList);
	}
	//选择页面方法
	page.selectPage = function(resourceIdList, $el){
		if(!$el){
			$el = $(".checkboxgroup[data-name='resourceIdList']");
		}
		$el.find('input[type=checkbox]').prop('checked', false);
		$.each(resourceIdList, function(i, val) {
			$el.find('input[value='+val+']').prop('checked', true);
		});
	}
	//编辑或添加产品弹框
	page.openUser = function(id){
		var vm = this;
		$().w2popup('open', {
	        title   : '用户信息',
	        body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
	        style   : 'padding: 15px 0px 0px 0px',
	        width   : 800,
	        height  : 600,
	        modal	: true,
	        showClose: false,
	        onOpen: function (event) {
	            event.onComplete = function () {
	                $('#w2ui-popup #form').w2render('userForm');
	                vm.bindFormEvent();
	                if(id){
	                	if(id != 'set'){
	                		vm.getThisUserData(id);
	                	}
	                }else{
	                	w2ui['userForm'].record.roleId = vm.actualOptions.roles[0];
	                	w2ui['userForm'].record.bankBranchId = utilObj.alterToObj(vm.actualOptions.branchBanks[0]);
	                	w2ui['userForm'].refresh();
	                	var branchId = w2ui['userForm'].record.bankBranchId.id;
	                	vm.loadAllCheckboxGroup(branchId);
	                	var roleId = w2ui['userForm'].record.roleId.id;
	                	vm.selectPageCheckboxGroupDefault(roleId);
	                	vm.loadByRole(roleId);
	                }
	            }
	        }
	    });
	};
	/********************************************************************/
	page.bindEvent();
	page.getTableData();
});