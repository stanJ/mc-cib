define(function(require, exports, module){
	var page = {
		bindEvent: function(){
			var vm = this;
//			$(window).off('resize').resize(function(){
//				page.setHeight();
//			})
			$(".other-banks-table-wrapper").on('click', '.operation--edit', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				var editing = $(this).parents('.w2ui-grid').eq(0).find('.operation--save:visible');
				if(editing.length > 0){
					w2alert('您还有未保存内容','提示')
					return;
				}
				$(this).siblings('.operation--save').show();
				$(this).siblings('.operation--cancel').show();
				$(this).siblings('.operation--delete').show();
				$(this).hide();
				vm.edit(id, index);
			})
			$(".other-banks-table-wrapper").on('click', '.operation--save', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				vm.save(id, index, this);
			})
			$(".other-banks-table-wrapper").on('click', '.operation--delete', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				vm.delete(id, index);
			})
			$(".other-banks-table-wrapper").on('click', '.operation--cancel', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				w2ui['otherBanks'].refresh();
			})
		},
		bindPartEvent: function(){
			$('.client-btn').off('click').on('click',function(){
				page.open();
			})
		},
		setHeight: function(){
			var height = $("#right-content").height();
			var h1 = height - 492;
			$('.client-tab-content').outerHeight(h1);
		},
		loadContent: function(){
			var h = template('other-banks-content', {
				data: {
					roleId: utilObj.userLogined.roleId,
				},
			});
			$(".client-tab-content-container").html(h);
//			if(page.accountPlanningId !== null){
				this.bindPartEvent();
				this.getTableData();
//			}
			
		},
		getTableData: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/customerAccount/findCustomerAccounts',
				data: {
					customerId: this.id,
				},
				success: function(data){
					var user = utilObj.alterToObj(data.map['LAST_OPERATOR']).employeeName;
					user = user?user:'';
					if(user){
						var text = '信息由'+user+'更新于'+utilObj.getDate(data.map['LAST_DATE']);
						$(".client-modify-info").text(text);
					}
					var ary = utilObj.addRecid(data.object, 'customerAccountId');
					var index = _.findIndex(ary, {
						bankName: '本银行'
					});
					var obj = ary.splice(index, 1)[0];
					ary.unshift(obj);
					var index1 = _.findIndex(ary, {
						bankName: '本行份额'
					}); 
					ary.splice(index1, 1);
//					ary[index1].deposit = ary[index1].deposit + '%';
//					ary[index1].investmentBank = ary[index1].investmentBank + '%';
//					ary[index1].loan = ary[index1].loan + '%';
//					ary[index1].publicPrivateLinkage = ary[index1].publicPrivateLinkage + '%';
//					ary[index1].tradingBank = ary[index1].tradingBank + '%';
					
					vm.addSumData(ary, data.map['BANK_RATE']);
					vm.data = ary;
					vm.loadTable();
					vm.loadChart(data.map['BANK_RATE']);
				}
			})
		},
		loadChart: function(sumData){
			sumData = this.alterSumData(sumData);
			var seriesData = this.getChartSeriesData(sumData);
		    $('.client-chart').highcharts({
		        chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: null,
		            plotShadow: false
		        },
		        title: {
		            text: ''
		        },
		        credits: {
		            enabled: false,
		        },
		        exporting: {
		            enabled: false,
		        },
		        tooltip: {
		            headerFormat: '{series.name}<br>',
		            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
		        },
		        plotOptions: {
		            pie: {
		                allowPointSelect: false,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: true,
		                    format: '<b>{point.name}</b>',
		                    style: {
		                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
		                    },
		                    connectorColor: '#cfd4da',
		                    distance: -30,
		                    softConnector: true,
		                    rotation: 0,
		                    crop: false,
//		                    overflow: 'none',
		                    overflow: 'justify',
//		                    y: -6,
//		                    x: -200
		                }
		            }
		        },
		        series: [{
		            type: 'pie',
		            colors: ['#f7f8fa'],
		            borderColor: '#e2e5e9',
		            name: '不同银行余额占比',
		            data: seriesData,
		        }]
		    });
		},
		alterSumData: function(data){
			data = _.filter(data, function(val){
				return (val.bankName != '合计' && val.bankName != '本行份额')
			});
			return data;
		},
		getChartSeriesData: function(data){
			return $.map(data, function(val, i){
				var obj = {
					name: val.bankName,
					y: val.bankSum,
				};
				if(val.bankName == '本银行'){
					obj.selected = true;
					obj.color = '#4776c7';
				}
				return obj;
			});
		},
		addSumData: function(originData, sumData){
			$.each(originData, function(i, val){
				var res = _.findWhere(sumData, {
					bankName: val.bankName,
				});
				val.sum = res.bankSum;
			});
		},
		edit: function(id, index){
			w2ui['otherBanks'].editField(id, 1)
			w2ui['otherBanks'].editField(id, 2)
			w2ui['otherBanks'].editField(id, 3)
			w2ui['otherBanks'].editField(id, 4)
			w2ui['otherBanks'].editField(id, 5)
			w2ui['otherBanks'].editField(id, 6)
		},
		save: function(id, index, that){
			var vm = this;
			
			$(that).parents('tr').eq(0).find('input').data('keep-open', false).blur();
//			vm.edit(id, index);
			var curObj = w2ui['otherBanks'].get(id);
			if(!curObj.w2ui){
				w2ui['otherBanks'].refresh();
				return;
			}
			var data = $.extend({}, curObj, curObj.w2ui.changes);
//			delete data.createUser;
//			delete data.createTime;
//			delete data.modifyUser;
//			delete data.modifyTime;
			delete data.w2ui;
			delete data.recid;
			delete data.sum;
			utilObj.ajax({
				url: 'm/customerAccount/updateCustomerAccounts',
				data: {
					jsonEntity: JSON.stringify(data),
				},
				beforeSend: function(){
					w2ui['otherBanks'].lock('保存中', true);
				},
				complete: function(){
					w2ui['otherBanks'].unlock();
				},
				success: function(data){
//					$(that).hide();
//					$(that).siblings('.operation--cancel').hide();
//					$(that).siblings('.operation--edit').show();
//					$(that).siblings('.operation--delete').show();
					vm.getTableData();
				}
				
			})
		},
		delete: function(id, index){
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
			
		},
		toDelete: function(id){
			var vm = this;
			utilObj.ajax({
				url: 'm/customerAccount/deleteById',
				data: {
					customerAccountId: id,
				},
				beforeSend: function(){
					w2ui['otherBanks'].lock('删除中', true);
				},
				complete: function(){
					w2ui['otherBanks'].unlock();
				},
				success: function(data){
					vm.getTableData();
				}
				
			})
		},
		loadTable: function(){
			var columns = [
				{field: "bankName", caption: "", size: "20%", attr: "align=center"},
				{field: "deposit", caption: "存款余额", size: "14%", attr: "align=center", editable: {
					type:'int', options: { autoFormat: false, },
				}},
				{field: "loan", caption: "贷款余额", size: "14%", attr: "align=center", editable: {
					type:'int', options: { autoFormat: false, },
				}},
				{field: "tradingBank", caption: "交易银行余额", size: "14%", attr: "align=center", editable: {
					type:'int', options: { autoFormat: false, },
				}},
				{field: "investmentBank", caption: "投资银行余额", size: "14%", attr: "align=center", editable: {
					type:'int', options: { autoFormat: false, },
				}},
				{field: "publicPrivateLinkage", caption: "公私联动余额", size: "14%", attr: "align=center", editable: {
					type:'int', options: { autoFormat: false, },
				}},
				{field: "sum", caption: "合计", size: "14%", attr: "align=center",},
				{field: "", caption: "操作", size: "22%", attr: "align=center",
					render: function(record, index, column_index){
						var h = '';
						if(!utilObj.isEmpty(record.customerAccountId)){
							if(record.bankName != '本银行'){
								h += 
									'<span class="operation operation--edit" data-id="'+record.recid+'" data-index="'+index+'">编辑</span>';
								h +=
									'<span class="operation operation--save" style="display: none" data-id="'+record.recid+'" data-index="'+index+'">保存</span>'+  
									'<span class="operation operation--cancel" style="display: none" data-id="'+record.recid+'" data-index="'+index+'">取消</span>';  
								h += 
									'<span class="operation operation--delete" style="display: none" data-id="'+record.recid+'" data-index="'+index+'">删除</span>';
							}
						}
								
						return h;
					}
				}
			];
			if(utilObj.userLogined.roleId != 1){
				columns.splice(columns.length-1, 1);
			}
			if(!w2ui.otherBanks){
				$(".other-banks-table-wrapper").w2grid({
					name: "otherBanks",
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
				w2ui['otherBanks'].records = this.data;
				w2ui['otherBanks'].refresh();
				$(".other-banks-table-wrapper").w2render('otherBanks');
			}
			
		},
		loadForm: function(){
			var vm = this;
			if(!w2ui.otherBanksForm){
				$().w2form({
		            name: 'otherBanksForm',
		            style: 'border: 0px; background-color: transparent;',
		            formHTML: template('other-banks-form')(),
		            fields: [
		                { name: 'bankName', type: 'text', required: true},
		                { name: 'deposit', type: 'int', 
		                	options: {
		                		autoFormat: false,
		                	},
		                },
		                { name: 'loan', type: 'int',
		                	options: {
		                		autoFormat: false,
		                	},
		                },
		                { name: 'tradingBank', type: 'int',
		                	options: {
		                		autoFormat: false,
		                	},
		                },
		                { name: 'investmentBank', type: 'int',
		                	options: {
		                		autoFormat: false,
		                	},
		                },
		                { name: 'publicPrivateLinkage', type: 'int',
		                	options: {
		                		autoFormat: false,
		                	},
		                },
		            ],
		            record: {},
		            actions: {
		                "save": function () { 
		                	var errs = this.validate(); 
		                	if(errs.length == 0){
		                		vm.addForm();
		                	}
		                },
		                "reset": function () { 
		                	this.clear();
		                	w2popup.close();
		                }
		            },
		            onChange: function(event){
//		            	console.log('change', event);
						event.onComplete = function(){
							if(event.target == 'bankName'){
			            		if(event.value_new != ''){
			            			w2ui['otherBanksForm'].validate();
			            		}
			            	}
						};
		            	
		            }
		        });
			}
			
		},
		addForm: function(){
			var vm = this;
			var data = $.extend({},  w2ui['otherBanksForm'].record);
			data.customerId = this.id;
			data = utilObj.toNull(data);
			utilObj.ajax({
				url: 'm/customerAccount/createCustomerAccounts',
				data: {
					jsonEntity: JSON.stringify(data),
				},
				success: function(data){
					vm.getTableData();
					w2ui['otherBanksForm'].clear();
					w2popup.close();
				}
			})
		},
		openPopup: function(){
			$().w2popup('open', {
		        title   : '<div class="fl">新建其他银行</div> <div class="client-btn-text-wrapper fr" style="line-height: 32px;color: #fff">'+
					'<div class="client-btn-text">单位:</div>'+
					'<div class="client-btn-text">(万元)</div>'+
				'</div>',
		        body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
		        style   : 'padding: 15px 0px 0px 0px',
		        width   : 640,
		        height  : 304,
		        modal	: true,
		        showClose: false,
		        onOpen: function (event) {
		            event.onComplete = function () {
		                $('#w2ui-popup #form').w2render('otherBanksForm');
		            }
		        }
		    });
		},
		open: function(){
			this.loadForm();
			this.openPopup();
		},
	};
	
	module.exports = {
		init: function(params){
			page.id = params.id;
			page.accountPlanningId = params.accountPlanningId;
			page.loadContent();
			page.bindEvent();
			$(window).trigger('resize');
		}
	}
});