define(function(require, exports, module){
	var page = {
		bindEvent: function(){
			var vm = this;
//			$(window).off('resize').resize(function(){
//				page.setHeight();
//			})
			$(".we-bank-table-wrapper").on('click', '.operation--edit', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				var editing = $(this).parents('.w2ui-grid').eq(0).find('.operation--save:visible');
				if(editing.length > 0){
					w2alert('您还有未保存内容','提示')
					return;
				}
				$(this).siblings('.operation--save').show();
				$(this).siblings('.operation--cancel').show();
				$(this).hide();
				vm.edit(id, index);
			})
			$(".we-bank-table-wrapper").on('click', '.operation--save', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				vm.save(id, index, this);
			})
			$(".we-bank-table-wrapper").on('click', '.operation--cancel', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				w2ui['weBank'].refresh();
			})
		},
		setHeight: function(){
			var height = $("#right-content").height();
			var h1 = height - 492 + 44;
			$('.client-tab-content').outerHeight(h1);
		},
		loadContent: function(){
			this.getTableData();
		},
		getTableData: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/evaInfo/findYear',
				data: {
					customerId: this.id,
					evaYear: '',
				},
				success: function(data){
					var h = template('we-bank-content', {
						data: {
							modifyDate: utilObj.getDate(data.map['LAST_DATE']),
							modifyUserName: utilObj.alterToObj(data.map['LAST_OPERATOR']).employeeName,
						}
					});
					$(".client-tab-content-container").html(h);
					page.bindEvent();
					var data = utilObj.addRecid(data.object);
					
					vm.data = $.map(data, function(val, i){
						if(i == 0){
							val.title = val.accountPeriod + '年净收入';
						}else if(i == 1){
							val.title = '当年状态(年化数据)';
						}else if(i == 2){
							val.title = val.accountPeriod + '年净收入目标';
						}else{
							val.title = '目标达成率';
							val.bankBiz += '%';
							val.bankInv += '%';
							val.deposit += '%';
							val.loan += '%';
							val.privatePublic += '%';
							val.total += '%';
						}
						return val;
					});
					vm.loadTable();
				}
			})
		},
		edit: function(id, index){
			w2ui['weBank'].editField(id, 1)
			w2ui['weBank'].editField(id, 2)
			w2ui['weBank'].editField(id, 3)
			w2ui['weBank'].editField(id, 4)
			w2ui['weBank'].editField(id, 5)
			w2ui['weBank'].editField(id, 6)
		},
		save: function(id, index, that){
			var vm = this;
			$(that).parents('tr').eq(0).find('input').data('keep-open', false).blur();
//			vm.edit(id, index);
			var curObj = w2ui['weBank'].get(id);
			if(!curObj.w2ui){
				w2ui['weBank'].refresh();
				return;
			}
			var data = $.extend({}, curObj, curObj.w2ui.changes);
//			delete data.createUser;
//			delete data.createTime;
//			delete data.modifyUser;
//			delete data.modifyTime;
			delete data.w2ui;
			delete data.recid;
			
			utilObj.ajax({
				url: 'm/evaInfo/saveCustomerEvaInfo',
				data: {
					customerId: data.customerId,
					accountPeriod: data.accountPeriod,
					deposit: data.deposit,
					loan: data.loan,
					bankBiz: data.bankBiz,
					bankInv: data.bankInv,
					privatePublic: data.privatePublic,
				},
				beforeSend: function(){
					w2ui['weBank'].lock('保存中', true);
				},
				complete: function(){
					w2ui['weBank'].unlock();
				},
				success: function(data){
					vm.getTableData();
				}
				
			})
			
		},
		loadTable: function(){
			var curYear = new Date().getFullYear();
			var preYear = curYear - 1;
			var columns = [
				{field: "title", caption: "", size: "10%", attr: "align=center"},
				{field: "deposit", caption: "存款余额", size: "10%", attr: "align=center", editable: {
					type:'int',
				}},
				{field: "loan", caption: "贷款余额", size: "10%", attr: "align=center", editable: {
					type:'int',
				}},
				{field: "bankBiz", caption: "交易银行余额", size: "10%", attr: "align=center", editable: {
					type:'int',
				}},
				{field: "bankInv", caption: "投资银行余额", size: "10%", attr: "align=center", editable: {
					type:'int',
				}},
				{field: "privatePublic", caption: "公私联动余额", size: "10%", attr: "align=center", editable: {
					type:'int',
				}},
				{field: "total", caption: "合计", size: "10%", attr: "align=center", },
				{field: "", caption: "操作", size: "10%", attr: "align=center",
					render: function(record, index, column_index){
						var h = '';
						if(index == 0 || index == 2){
							h += 
								'<span class="operation operation--edit" data-id="'+record.recid+'" data-index="'+index+'">编辑</span>'+
								'<span class="operation operation--save" style="display: none" data-id="'+record.recid+'" data-index="'+index+'">保存</span>'+
								'<span class="operation operation--cancel" style="display: none" data-id="'+record.recid+'" data-index="'+index+'">取消</span>';  
						}
						return h;
					}
				}
			];
			if(utilObj.userLogined.roleId != 1){
				columns.splice(columns.length-1, 1);
			}
			if(!w2ui.weBank){
				$(".we-bank-table-wrapper").w2grid({
					name: "weBank",
					recordHeight: 44,
					fixedBody: false,
					columns: columns,
					records: this.data,
					onEditField: function(event){
						event.onComplete = function(){
							var input = event.input;
							input.data('keep-open', true);
							input.css({
								'width': '100px',
								'border-radius': '4px',
								'border': '1px solid #d2d2d2',
								'height': '26px',
								'text-align': 'center',
							})
						}
					},
					onDblClick: function(event){
						event.preventDefault();
					}
				});
			}else{
				w2ui['weBank'].records = this.data;
				w2ui['weBank'].refresh();
				$(".we-bank-table-wrapper").w2render('weBank');
			}
			
		},
	};
	
	module.exports = {
		init: function(id){
			page.id = id;
			page.loadContent();
			
			$(window).trigger('resize');
		}
	}
});