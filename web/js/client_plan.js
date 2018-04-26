define(function(require, exports, module){
	require("../css/qtip2.css");
	require("../js/common/qtip2.js");
	var page = {
		managersObj: {},
		loadManagersTimes: 0,
		isEdit: false,
		roleId: utilObj.userLogined.roleId,
		employeeId: utilObj.userLogined.employeeId,
		bindApprovedEvent: function(){
			var vm = this;
			//审批完成状态下点击提交按钮
			$(".client-btn--approved-submit").off('click').on('click', function(){
				vm.blurAll();
				setTimeout(function(){
					vm.saveAll();
					vm.submitAll();
				}, 30)
			})
			//审批完成状态下点击取消按钮
			$(".client-btn--approved-cancel").off('click').on('click', function(){
				sessionStorage.setItem('curTab', 'tab5');
				location.reload();
			})
		},
		setTooltip: function(){
			var _plan1_rec = w2ui.plan1.records;
			var _plan2_rec = w2ui.plan2.records;

			console.log(_plan1_rec);

			var _plan1_tooltip = $(".plan-table-wrapper--first").find(".show-tips");
			var _plan2_tooltip = $(".plan-table-wrapper--second").find(".show-tips");

			$.each(_plan1_tooltip, function(i,v){
				if($.trim(_plan1_rec[i].productRemark).length > 0){
					$(v).qtip({
						overwrite: true,
						position: {
							my: "center,left",
							at: "center,right"
						},
						content: {
							text: [
								"<div class='tooltip-inner-wrap'>",
								"	<div>"+ _plan1_rec[i].productRemark + "</div>",
								"</div>"
							].join("")
						},
						// hide: {
						// 	event: "click"
						// },
						style: {
							classes: "qtip-light"
						}
					});
				}				
			});

			$.each(_plan2_tooltip, function(i,v){
				if($.trim(_plan2_rec[i].productRemark).length > 0){
					$(v).qtip({
						overwrite: true,
						position: {
							my: "center,left",
							at: "center,right"
						},
						content: {
							text: [
								"<div class='tooltip-inner-wrap'>",
								"	<div>"+ _plan2_rec[i].productRemark + "</div>",
								"</div>"
							].join("")
						},
						// hide: {
						// 	event: "click"
						// },
						style: {
							classes: "qtip-light"
						}
					});
				}				
			});
		},
		bindApproveOpinionEvent: function(){
			$("#client-agree").off('change').on('change', function(){
				var checked = $(this).prop('checked');
				var saveBtn = $(".form-wrapper--plan button[name=save]");
				if(checked){
					saveBtn.prop('disabled', false).removeClass('is-disabled');
				}else{
					saveBtn.prop('disabled', true).addClass('is-disabled');
				}
			});
		},
		detectData: function(data){
			for(var i=0; i<data.length; i++){
				if(utilObj.isEmpty(data[i].bizVolume) || utilObj.isEmpty(data[i].productId) || utilObj.isEmpty(data[i].productManagerId)){
					return false;
				}
			}
			return true;
		},
		detectRepeatData: function(data){
			var productId = parseInt(data.productId);
			var allRecords = w2ui['plan1'].records.concat(w2ui['plan2'].records);
			allRecords = $.map(allRecords, function(val, i){
				val.productId = parseInt(val.productId);
				return val;
			});
			var res = _.where(allRecords, {
				productId: productId,
			});
			if(res.length > 1){
				return true;
			}else{
				return false;
			}
		},
		detectRepeatDataForAll: function(){
			var allRecords = w2ui['plan1'].records.concat(w2ui['plan2'].records);
			allRecords = $.map(allRecords, function(val, i){
				val.productId = parseInt(val.productId);
				return val;
			});
			var res = _.groupBy(allRecords, function(val){
				return val.productId;
			});
			for(var i in res){
				if(res[i].length>1){
					return true;
				}
			}
			return false;
		},
		submitAll: function(){
			var vm = this;
			var data1 = w2ui['plan1'].records;
			var data2 = w2ui['plan2'].records;
			var data = data1.concat(data2);
			var isRight = vm.detectData(data);
			if(!isRight){
				w2alert('您还未填写完全','提示')
				vm.editAll();
				return;
			}
			
			var isRepeat = vm.detectRepeatDataForAll();
			if(isRepeat){
				w2alert('不能添加重复的产品','提示');
				vm.editAll();
				return;
			}
			data = vm.detectCreditManager(data);
			data = $.map(data, function(x){
				
				var data = $.extend({
					accountPlanningId: vm.accountPlanningId,
					plantStatus: 0,
					status: 1,
				}, x);
				data.customerId = parseInt(page.id);
				data.productId = parseInt(data.productId);
				var res = _.findWhere(vm.productsData, {
					productId: data.productId,
				});
				data.productName = res.productName;
				delete data.createUser;
				delete data.createTime;
				delete data.modifyUser;
				delete data.modifyTime;
				delete data.w2ui;
				delete data.recid;
				
				return data;
			});
			
			
			
			utilObj.ajax({
				url: 'm/customerPlant/batchUpdateCustomerPlant',
				data: {
					data: JSON.stringify(data),
				},
				success: function(data){
					sessionStorage.setItem('curTab', 'tab5');
					location.reload();
				}
			})
		},
		bindEvent: function(){
			var vm = this;
			$('.client-btn').off('click').click(function(){
				page.open();
			})
			$('.client-btn--opinion').off('click').click(function(){
				page.openOpinion();
			})
			$('.client-btn--diary').off('click').click(function(){
				page.openDiary();
			})
			
//			$(window).off('resize').resize(function(){
//				page.setHeight();
//			})
			//审批完成状态下点击编辑按钮，编辑按钮变为提交和取消按钮，所有行变为可编辑状态，并显示添加按钮
			$(".client-btn--approved").off('click').on('click', function(){
				var h = '<div class="client-btn client-btn--approved-submit fl">提交</div>' +
						'<div class="client-btn client-btn--approved-cancel fl">取消</div>';
				$(this).replaceWith(h);
				vm.bindApprovedEvent();
				vm.isEdit = true;
				vm.editAll();
				$(".client-btn--dotted").show();
				
			})
			//未提交状态下点击提交按钮
			$(".client-btn--not-submit").off('click').on('click', function(){
				var editing = $('.w2ui-grid').find('.operation--save:visible');
				if(editing.length > 0){
					w2alert('您还有未保存内容','提示')
					return;
				}
				
				var plantIds = $.map(vm.originData, function(x){
					return x.plantId;
				});
				var str = plantIds.join(',');
				if(!str){
					w2alert('您还未添加提升计划','提示');
					return;
				}
				utilObj.ajax({
					url: 'm/customerPlant/submitCustomerPlant',
					data: {
						plantId: str,
					},
					success: function(data){
						sessionStorage.setItem('curTab', 'tab5');
						location.reload();
					}
				})
			})
			//已拒绝状态下点击提交按钮
			$(".client-btn--refused").off('click').on('click', function(){
				var editing = $('.w2ui-grid').find('.operation--save:visible');
				if(editing.length > 0){
					w2alert('您还有未保存内容','提示')
					return;
				}
				
				var plantIds = $.map(vm.originData, function(x){
					return x.plantId;
				});
				var str = plantIds.join(',');
				if(!str){
					w2alert('您还未添加提升计划','提示');
					return;
				}
				utilObj.ajax({
					url: 'm/customerPlant/submitCustomerPlant',
					data: {
						plantId: str,
					},
					success: function(data){
						sessionStorage.setItem('curTab', 'tab5');
						location.reload();
					}
				})
			})
			//点击每行的编辑按钮
			$(".plan-table-wrapper").on('click', '.operation--edit', function(e, isCode){
				var index = $(this).data('index');
				var id = $(this).data('id');
				var editing = $('.w2ui-grid').find('.operation--save:visible');
				if(editing.length > 0){
					w2alert('您还有未保存内容','提示')
					return;
				}
				$(this).siblings('.operation--save').show();
				$(this).siblings('.operation--cancel').show();
				$(this).siblings('.operation--delete').hide();
				$(this).hide();
				
				var num = $(this).parents('.plan-table-wrapper').eq(0).data('num');
				vm.edit(id, index, num);
			})
			//点击每行的保存按钮
			$(".plan-table-wrapper").on('click', '.operation--save', function(e, isCode){
				var index = $(this).data('index');
				var id = $(this).data('id');
				var num = $(this).parents('.plan-table-wrapper').eq(0).data('num');
				vm.save(id, index, this, num, isCode);
			})
			//点击每行的删除按钮
			$(".plan-table-wrapper").on('click', '.operation--delete', function(){
				var editing = $('.w2ui-grid').find('.operation--save:visible');
				if(editing.length > 0){
					w2alert('您还有未保存内容','提示')
					return;
				}
				var index = $(this).data('index');
				var id = $(this).data('id');
				var num = $(this).parents('.plan-table-wrapper').eq(0).data('num');
				vm.delete(id, index);
			})
			//点击每行的取消按钮
			$(".plan-table-wrapper").on('click', '.operation--cancel', function(){
				var index = $(this).data('index');
				var id = $(this).data('id');
				var num = $(this).parents('.plan-table-wrapper').eq(0).data('num');
				if(num == 1){
					console.log('data1', vm.data1);
					w2ui['plan1'].records = vm.data1.slice(0);
					w2ui['plan1'].refresh();
				}else{
					w2ui['plan2'].records = vm.data2.slice(0);
					w2ui['plan2'].refresh();
				}
			})
			//当业务类型值变化时
			$(".plan-table-wrapper").on('change', 'select[field=bizType]', function(){
			  var _this = this;
			  setTimeout(function(){ // 在ipad里面通过setTimeout防止下拉框的收起被阻止，造成下拉选项框一直显示
			    var num = $(_this).parents('.plan-table-wrapper').eq(0).data('num'); 
          var id = $(_this).attr('recid');
          var value = $(_this).val();
          if(vm.isEdit){
            vm.blurAll(num);
          }else{
            $(_this).parents('tr').eq(0).find('.operation--save').trigger('click', true);
          }
          setTimeout(function(){
            vm.changeProductId(num, id, value);
            if(vm.isEdit){
              vm.saveAll(num);
              vm.editAll(num);
            }else{
              $('.w2ui-grid-records tr[recid='+id+']').eq(0).find('.operation--edit').trigger('click', true);
            }
          }, 30);
          
			  }, 0)
				
				
			})
			//当产品id值变化时
			$(".plan-table-wrapper").on('change', 'select[field=productId]', function(){
			  var _this = this;
			  setTimeout(function(){ // 在ipad里面通过setTimeout防止下拉框的收起被阻止，造成下拉选项框一直显示
			    var num = $(_this).parents('.plan-table-wrapper').eq(0).data('num'); 
          var id = $(_this).attr('recid');
          var value = $(_this).val();
          if(vm.isEdit){
            vm.blurAll(num);
          }else{
            $(_this).parents('tr').eq(0).find('.operation--save').trigger('click', true);
          }
          
          setTimeout(function(){
            if(vm.isEdit){
              vm.saveAll(num);
              vm.editAll(num);
            }else{
              $('.w2ui-grid-records tr[recid='+id+']').eq(0).find('.operation--edit').trigger('click', true);
            }
            
          }, 30)
          
			  }, 0)
				
			})
			//点击添加按钮
			$(".client-btn--dotted").click(function(){
				var editing = $('.w2ui-grid').find('.operation--save:visible');
				if(editing.length > 0){
					w2alert('您还有未保存内容','提示')
					return;
				}
				var num = $(this).data('num');
				var row = null;
				if(vm.isEdit){
					vm.blurAll(num);
					setTimeout(function(){
						vm.saveAll(num);
						row = vm.addRow(num);
						vm.editAll(num);
					}, 30)
				}else{
					row = vm.addRow(num);
					$(".operation--edit[data-id="+row.recid+"]").trigger('click', true);
				}
			});
		},
		changeProductId: function(num, id, value){
			var vm = this;
			if(num == 1){
				var index = _.findIndex(w2ui['plan1'].records, {
					recid: parseInt(id),
				})
				var ary = _.where(vm.productsData, {
					productType: value,
					isEva: 1,
				});
				if(ary.length > 0){
					w2ui['plan1'].records[index].productId = ary[0].productId;
				}else{
					w2ui['plan1'].records[index].productId = null;
				}
				w2ui['plan1'].refresh();
			}else{
				var index = _.findIndex(w2ui['plan2'].records, {
					recid: parseInt(id),
				})
				var ary = _.where(vm.productsData, {
					productType: value,
					isEva: 0,
				});
				if(ary.length > 0){
					w2ui['plan2'].records[index].productId = ary[0].productId;
				}else{
					w2ui['plan2'].records[index].productId = null;
				}
				w2ui['plan2'].refresh();
			}
		},
		blurAll: function(num){
			if(num == 1){
				$(".plan-table-wrapper[data-num=1]").find('tr').find('input, select').data('keep-open', false).blur();
			}else if(num == 2){
				$(".plan-table-wrapper[data-num=2]").find('tr').find('input, select').data('keep-open', false).blur();
			}else{
				$(".plan-table-wrapper").find('tr').find('input, select').data('keep-open', false).blur();
			}
		},
		saveAll: function(num){
			if(num == 1){
				w2ui['plan1'].save();
			}else if(num == 2){
				w2ui['plan2'].save();
			}else{
				w2ui['plan1'].save();
				w2ui['plan2'].save();
			}
		},
		addRow: function(num){
			var vm = this;
			var bizType = '';
			if(num == 1){
				bizType = utilObj.alterToAry(this.productTypeData['EVA'])[0];
			}else{
				bizType = utilObj.alterToAry(this.productTypeData['UNEVA'])[0];
			}
			var promotionType = '存量增额';
			var row = {
				recid: new Date().valueOf(),
				bizType: bizType,
				productId: null,
				promotionType:promotionType,
				bizVolume:null,
				landingTime: new Date().format('yyyy-MM-dd'),
				productManagerId:null,
				creditAnalystId:null,
			};
			if(num == 1){
				var ary = _.where(vm.productsData, {
					productType: bizType,
					isEva: 1,
				});
				if(ary.length>0){
					row.productId = ary[0].productId;
				}
				w2ui['plan1'].add(row);
				
			}else{
				var ary = _.where(vm.productsData, {
					productType: bizType,
					isEva: 0,
				});
				if(ary.length>0){
					row.productId = ary[0].productId;
				}
				w2ui['plan2'].add(row);
			}
			return row;
		},
		setHeight: function(){
			var height = $("#right-content").height();
			var h1 = height - 492;
			$('.client-tab-content').outerHeight(h1);
		},
		loadContent: function(){
			var vm = this;
			if(this.accountPlanningId === undefined){
				//还没通过接口得到accountPlanningId，此时先将之前的内容清空
				$(".client-tab-content-container").html('');
				return;
			}else if(this.accountPlanningId === null){
				//accountPlanningId为null,代表还未创建规划，显示创建规划按钮
				var h = template('plan-content', {
					data: {
						isPlaned: false,
					},
				});
				$(".client-tab-content-container").html(h);
				return;
			}else{
				//accountPlanningId有值，代表此时有规划，显示相应状态和提升计划列表
				var hasTask = false;
				if(page.taskActor != null && page.taskActor.actorId){
					hasTask = true;
				}
				var h = template('plan-content', {
					data: {
						isPlaned: true,
						planningStatus: page.planningStatus,
						planningStatusName: page.planningStatusName,
						roleId: utilObj.userLogined.roleId,
						hasTask: hasTask,
					},
				});
				$(".client-tab-content-container").html(h);
				if(hasTask){
					this.loadApproveForm();
					$(".form-wrapper--plan").w2render('approveForm');
					this.bindApproveOpinionEvent();
				}
			}
			
			this.getTableData();
		},
		loadApproveForm: function(){
			var vm = this;
			if(!w2ui.approveForm){
				$().w2form({
		            name: 'approveForm',
		            style: 'border: 0px; background-color: transparent;padding-right: 18px',
		            formHTML: template('approve-form')(),
		            fields: [
		                { field: 'content', type: 'text', required: true},
		            ],
		            record: {},
		            actions: {
		                "save": function () { 
		                	var errs = this.validate(); 
		                	if(errs.length == 0){
		                		vm.agreeApproveForm();
		                	}
		                },
		                "reset": function () { 
		                	var errs = this.validate(); 
		                	if(errs.length == 0){
		                		vm.refuseApproveForm();
		                	}
		                }
		            },
		            onChange: function(event){
						event.onComplete = function(){
							if(event.target == 'content'){
			            		if(event.value_new != ''){
			            			w2ui['approveForm'].validate();
			            		}
			            	}
						};
		            	
		            }
		        });
			}
		},
		agreeApproveForm: function(){
			var vm = this;
			var data = w2ui['approveForm'].record;
			utilObj.ajax({
				url: 'm/plantAudit/createPlantAudit',
				data: {
					accountPlanningId: vm.accountPlanningId,
					result: 1,
					content: data.content,
					employeeId: utilObj.userLogined.employeeId,
				},
				success: function(data){
					sessionStorage.setItem('curTab', 'tab5');
					location.reload();
				}
			});
		},
		refuseApproveForm: function(){
			var vm = this;
			var data = w2ui['approveForm'].record;
			utilObj.ajax({
				url: 'm/plantAudit/createPlantAudit',
				data: {
					accountPlanningId: vm.accountPlanningId,
					result: 2,
					content: data.content,
					employeeId: utilObj.userLogined.employeeId,
				},
				success: function(data){
					sessionStorage.setItem('curTab', 'tab5');
					location.reload();
				}
			});
		},
		edit: function(id, index, num){
			if(num == 1){
				w2ui['plan1'].editField(id, 0);
				w2ui['plan1'].editField(id, 1);
				w2ui['plan1'].editField(id, 2);
				w2ui['plan1'].editField(id, 3);
				w2ui['plan1'].editField(id, 4);
				w2ui['plan1'].editField(id, 5);
				w2ui['plan1'].editField(id, 6);
			}else{
				w2ui['plan2'].editField(id, 0);
				w2ui['plan2'].editField(id, 1);
				w2ui['plan2'].editField(id, 2);
				w2ui['plan2'].editField(id, 3);
				w2ui['plan2'].editField(id, 4);
				w2ui['plan2'].editField(id, 5);
				w2ui['plan2'].editField(id, 6);
			}
		},
		editAll: function(num){
			var vm = this;
			if(num == 1){
				$.each(w2ui.plan1.records, function(i, val){
					vm.edit(val.recid, null, 1);
				});
			}else if(num == 2){
				$.each(w2ui.plan2.records, function(i, val){
					vm.edit(val.recid, null, 2);
				});
			}else{
				$.each(w2ui.plan2.records, function(i, val){
					vm.edit(val.recid, null, 2);
				});
				$.each(w2ui.plan1.records, function(i, val){
					vm.edit(val.recid, null, 1);
				});
				
			}
			
		},
		save: function(id, index, that, num, isCode){
			var vm = this;
			//触发该行所有的input和select的blur事件
			$(that).parents('tr').find('input, select').data('keep-open', false).blur();
			if(isCode){
				setTimeout(function(){
					vm.saveAll(num);
				}, 20)
				$(that).hide();
				$(that).siblings('.operation--cancel').hide();
				$(that).siblings('.operation--edit').show();
				$(that).siblings('.operation--delete').show();
				
				
			}else{
				var data = null;
				setTimeout(function(){
					if(num == 1){
						w2ui['plan1'].save();
						data = w2ui['plan1'].records[index];
					}else{
						w2ui['plan2'].save();
						data = w2ui['plan2'].records[index];
					}
					vm.saveOne(data, id);
				}, 20)
				
			}
		},
		saveOne: function(data, id){
			var vm = this;
			var data = $.extend({
				accountPlanningId: this.accountPlanningId,
				plantStatus: 0,
				status: 1,
			}, data);
			data.customerId = parseInt(page.id);
			if(utilObj.isEmpty(data.productId)){
				w2alert('您还未填写完全','提示');
				$(".operation--edit[data-id="+id+"]").trigger('click', true);
				return;
			}
			data.productId = parseInt(data.productId);
			var res = _.findWhere(vm.productsData, {
				productId: data.productId,
			});
			data.productName = res.productName;
			var recid = data.recid;
			delete data.createUser;
			delete data.createTime;
			delete data.modifyUser;
			delete data.modifyTime;
			delete data.w2ui;
			delete data.recid;
			
			var ary = [];
			ary.push(data);
			var isRight = vm.detectData(ary);
			if(!isRight){
				w2alert('您还未填写完全','提示');
				$(".operation--edit[data-id="+id+"]").trigger('click', true);
				return;
			}
			ary = vm.detectCreditManager(ary);
			data = ary[0];
			var isRepeat = vm.detectRepeatData(data);
			if(isRepeat){
				w2alert('不能添加重复的产品','提示');
				$(".operation--edit[data-id="+id+"]").trigger('click', true);
				return;
			}
			var fromPlan = true;
			if(recid.toString().length == 13){
				utilObj.ajax({
					url: 'm/customerPlant/createCustomerPlant',
					data: {
						jsonEntity: JSON.stringify(data),
					},
					beforeSend: function(){
						utilObj.showLoading('.client-tab-content--plan');
					},
					complete: function(){
						utilObj.hideLoading('.client-tab-content--plan');
					},
					success: function(data){
						vm.getTableData();
						vm.loadMain(fromPlan);
						
					}
				})
			}else{
				utilObj.ajax({
					url: 'm/customerPlant/updateCustomerPlant',
					data: {
						jsonEntity: JSON.stringify(data),
					},
					beforeSend: function(){
						utilObj.showLoading('.client-tab-content--plan');
					},
					complete: function(){
						utilObj.hideLoading('.client-tab-content--plan');
					},
					success: function(data){
						vm.getTableData();
						vm.loadMain(fromPlan);
					}
				})
			}
			
		},
		delete: function(id, index, num){
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
				url: 'm/customerPlant/deleteCustomerPlant',
				data: {
					plantId: id,
				},
				beforeSend: function(){
					utilObj.showLoading('.client-tab-content--plan');
				},
				complete: function(){
					utilObj.hideLoading('.client-tab-content--plan');
				},
				success: function(data){
					vm.getTableData();
				}
				
			})
		},
		getProductType: function(){
			var dtd = $.Deferred();
			utilObj.ajax({
				url: 'm/product/findProductType',
				data: {
					
				},
				success: function(data){
					dtd.resolve(data.object);
				}
			})
			return dtd;
		},
		getPromotionType: function(){
			var dtd = $.Deferred();
			utilObj.ajax({
				url: 'm/sysConfig/findList',
				data: {
					type: 'PROMOTION_TYPE',
					status: 1,
				},
				success: function(data){
					dtd.resolve(data.object);
				}
			})
			return dtd;
		},
		getPlans: function(){
			var dtd = $.Deferred();
			utilObj.ajax({
				url: 'm/customerPlant/findCustomerPlant',
				data: {
					accountPlanningId: this.accountPlanningId,
				},
				success: function(data){
					dtd.resolve(data.object);
				}
			})
			return dtd;
		},
		getProducts: function(){
			var dtd = $.Deferred();
			utilObj.ajax({
				url: 'm/product/findProduct',
				data: {
					
				},
				success: function(data){
					dtd.resolve(data.object);
				}
			})
			return dtd;
		},
		getPeople: function(){
			var dtd = $.Deferred();
			utilObj.ajax({
				url: 'm/productEmployee/findProductEmployee',
				data: {
					
				},
				success: function(data){
					dtd.resolve(data.object);
				}
			})
			return dtd;
		},
		//获取信审经理数据
		getCreditData: function(){
			var dtd = $.Deferred();
			utilObj.ajax({
				url: 'm/productEmployee/findEmployee',
				data: {
					
				},
				success: function(data){
					dtd.resolve(data.object);
				}
			})
			return dtd;
		},
		getTableData: function(){
			var vm = this;
			if(vm.productsData){
				$.when(this.getPlans())
				.then(function(plansData){
					vm.data1 = utilObj.addRecid(plansData['EVA'], 'plantId');
					vm.data2  = utilObj.addRecid(plansData['UNEVA'], 'plantId');
					if(plansData['REJECTED']){
						vm.loadRefuseReason(plansData['REJECTED']);
					}
					vm.originData  = vm.data1.concat(vm.data2);
					vm.loadTable();
					
				})
			}else{
				$.when(this.getPlans(), this.getProductType(), this.getPromotionType(), this.getProducts(), this.getPeople(), this.getCreditData())
				.then(function(plansData, productTypeData, promotionTypeData, productsData, peopleData, creditData){
					
					vm.data1 = utilObj.addRecid(plansData['EVA'], 'plantId');
					vm.data2  = utilObj.addRecid(plansData['UNEVA'], 'plantId');
					if(plansData['REJECTED']){
						vm.loadRefuseReason(plansData['REJECTED']);
					}
					vm.originData  = vm.data1.concat(vm.data2);
					vm.productTypeData = productTypeData;
					vm.promotionTypeData = promotionTypeData;
					vm.productsData = productsData;
					vm.peopleData = peopleData;
					vm.creditData = utilObj.alterToAry(creditData);
					
					vm.loadTable();
				})
			}
			
		},
		loadRefuseReason: function(data){
			var date = data.approvalTime?data.approvalTime.slice(0, 10):'';
			var h = data.approverName + '(' + date + '): ' + data.content;
			$(".client-refuse-reason").text(h);
			
		},
		getProductManagers: function(record){
			var ary = _.where(this.peopleData, {
				productId: parseInt(record.productId),
				type: 0
			});
			return ary.length?ary: [{ employeeId: '', employeeName: ''},];
		},
		setProductManager: function(record){
			if(record.productId){
				var res = _.findWhere(this.productsData, {
					productId: parseInt(record.productId),
				});
				record.productManagerId = res.productManager;
			}
		},
		getCreditAnalysts: function(record){
			var ary = _.where(this.peopleData, {
				productId: parseInt(record.productId),
				type: 1
			});
			return ary.length?ary: [{ employeeId: '', employeeName: ''},];
		},
		//某产品是否信审
		getIsExamine: function(record){
			var isExamine = false;
			if(record.productId){
				var res = _.findWhere(this.productsData, {
					productId: parseInt(record.productId),
				});
				if(res.isExamine == 'Y'){
					isExamine = true;
				}
			}
			return isExamine;
		},
		//提交或保存数据时检测该产品是否信审,如果不信审,就删除信审经理id和name字段
		detectCreditManager: function(ary){
			var vm = this;
			ary = $.map(ary, function(val, i){
				var isExamine = vm.getIsExamine(val);
				if(!isExamine){
					val.creditAnalystId = null;
					val.creditAnalystName = null;
				}
				return val;
			});
			return ary;
		},
		loadTable: function(){
			var vm = this;
			var businessTypes1 = $.map(utilObj.alterToAry(this.productTypeData['EVA']), function(x){
				return {
					id: x,
					text: x,
				}
			});
			var businessTypes2 = $.map(utilObj.alterToAry(this.productTypeData['UNEVA']), function(x){
				return {
					id: x,
					text: x,
				}
			});
			var promotionTypes = $.map(this.promotionTypeData, function(x){
				return {
					id: x.configName,
					text: x.configName,
				}
			});
			var creditManagers = $.map(this.creditData, function(x){
				return {
					id: x.employeeId,
					text: x.employeeName,
				}
			});
			this.creditManagers = utilObj.getSelectOptions(creditManagers);
			var columns = [
				{field: "bizType", caption: "金额业务类型", size: "14%", attr: "align=center", 
					editable: { type:'select', items: businessTypes1, },
					
				},
				{field: "productId", caption: "目标产品", size: "14%", attr: "align=center", 
					editable: function(record, index, col_index){
						var ary = _.where(vm.productsData, {
							productType: record.bizType,
							isEva: 1,
						});
						if(ary.length == 0){
							ary = [{productId: '', productName: ''}];
						}
						return {
							type: 'select',
							items: $.map(ary, function(x){
								return {
									id: x.productId,
									text: x.productName,
								};
							}),
						}
					},
					render: function(record, index, col_index){
	                    return "<span class='show-tips' data-id='"+index+"'>"+record.productName+"</span>";
					}
				},
				{field: "promotionType", caption: "提升类型", size: "14%", attr: "align=center", 
					editable: { type:'select', items: promotionTypes, },
					
				},
				{field: "bizVolume", caption: "意向业务量(万元)", size: "160px", attr: "align=center", editable: {
					type:'int',
				}},
				{field: "landingTime", caption: "预计落地日", size: "14%", attr: "align=center", 
					editable: { type:'date', format: 'yyyy-mm-dd', }
				},
				{field: "productManagerId", caption: "产品经理", size: "14%", attr: "align=center", 
					editable: function(record, index, col_index){
						vm.setProductManager(record);
						var ary = vm.getProductManagers(record);
						return {
							type: 'select',
							items: $.map(ary, function(x){
								return {
									id: x.employeeId,
									text: x.employeeName,
								};
							}),
						}
					},
					render: function(record, index, col_index){
	                    var h = template('single-phone-in-table', {
							data: {
								text: record.productManagerName,
								id: record.productManagerId,
							}
						})
	                    return h;
					}
					
				},
				{field: "creditAnalystId", caption: "信审经理", size: "14%", attr: "align=center", 
					editable: function(record, index, col_index){
						var isExamine = vm.getIsExamine(record);
						if(isExamine){
							return {
								type: 'select',
								items: vm.creditManagers,
							}
						}else{
							return null;
						}
					},
					render: function(record, index, col_index){
						var h = template('single-phone-in-table', {
							data: {
								text: record.creditAnalystName,
								id: record.creditAnalystId,
							}
						})
	                    return h;
					}
				},
				{field: "productRemark", caption: "备注", size: "1%",hidden:true, attr: "align=center"}
			];
			var operationField = {field: "operation", caption: "操作", size: "14%", attr: "align=center",
				render: function(record, index, column_index){
					var h = 
							'<span class="operation operation--edit" data-id="'+record.recid+'" data-index="'+index+'">编辑</span>'+
							'<span class="operation operation--delete" data-id="'+record.recid+'" data-index="'+index+'">删除</span>'+
							'<span class="operation operation--save" style="display: none" data-id="'+record.recid+'" data-index="'+index+'">保存</span>'+  
							'<span class="operation operation--cancel" style="display: none" data-id="'+record.recid+'" data-index="'+index+'">取消</span>';  
							;
					return h;
				}
			};
			if(vm.planningStatus == 0 && vm.roleId == 1){
				columns.push(operationField);
			}else if(vm.planningStatus == 4 && vm.roleId == 1){
				columns.push(operationField);
			}
			if(!w2ui.plan1){
				$(".plan-table-wrapper--first").w2grid({
					name: "plan1",
					recordHeight: 44,
					fixedBody: false,
					columns: columns,
					records: this.data1.slice(0),
					onEditField: function(event){
						event.onComplete = function(){
							var input = event.input;
							console.log(input, new Date().valueOf())
							input.data('keep-open', true);
							input.css({
								'width': '100px',
								'border-radius': '4px',
								'border': '1px solid #d2d2d2',
								'height': '26px',
								'text-align': 'center',
							});
						}
					},
					onDblClick: function(event){
						event.preventDefault();
					},
					onChange: function(event){
					}
				});
			}else{
				$(".plan-table-wrapper--first").w2render('plan1');
				w2ui['plan1'].records = vm.data1.slice(0);
				w2ui['plan1'].refresh();
			}
			var columns1 = columns.slice(0);
			columns1[0].caption = '数量业务类型';
			columns1[0].editable.items = businessTypes2;
			columns1[1] = {field: "productId", caption: "目标产品", size: "14%", attr: "align=center", 
				editable: function(record, index, col_index){
					var ary = _.where(vm.productsData, {
						productType: record.bizType,
						isEva: 0,
					})
					if(ary.length == 0){
						ary = [{productId: '', productName: ''}];
					}
					return {
						type: 'select',
						items: $.map(ary, function(x){
							return {
								id: x.productId,
								text: x.productName,
							};
						}),
					}
						
				
				},
				render: function(record, index, col_index){
                    return "<span class='show-tips' data-remark='"+record.productRemark+"'>"+record.productName+"</span>";
				}
			};
			columns1[3].caption = '意向业务量';
			if(!w2ui.plan2){
				$(".plan-table-wrapper--second").w2grid({
					name: "plan2",
					recordHeight: 44,
					fixedBody: false,
					columns: columns1,
					records: this.data2.slice(0),
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
					},
					onChange: function(event){
						console.log(event);
					}
				});
			}else{
				$(".plan-table-wrapper--second").w2render('plan2');
				w2ui['plan2'].records = vm.data2.slice(0);
				w2ui['plan2'].refresh();
			}

			setTimeout(function(){
				vm.setTooltip();
			},200);
			
		},
		loadForm: function(){
			var vm = this;
			var roleId = utilObj.userLogined.roleId;
			if(!w2ui.planForm){
				$().w2form({
		            name: 'planForm',
		            style: 'border: 0px; background-color: transparent;',
		            formHTML: template('plan-form', {
		            	data: {
		            		roleId: roleId,
		            	}
		            }),
		            fields: [
		                { field: 'logContent', type: 'text', required: true},
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
		            }
		        });
			}
		},
		addForm: function(){
			var vm = this;
			var logContent = w2ui['planForm'].record.logContent;
			utilObj.ajax({
				url: 'm/plantTeamLog/createPlantTeamLog',
				data: {
					accountPlanningId: this.accountPlanningId,
					logContent: logContent,
					employeeId: this.employeeId,
					employeeName: utilObj.userLogined.nickName,
				},
				success: function(data){
					w2ui['planForm'].clear();
					w2popup.close();
				}
			})
		},
		openOpinion: function(){
			var vm = this;
			var options = {
		        title   : '审批意见',
		        body    : '<div class="client-popup-body"><div class="jc-records client-records--opinion"></div></div>',
		        buttons : '<button class="button popup-btn button--primary" onclick="w2popup.close();">确定</button>',
		        style   : 'padding: 15px 0px 0px 0px',
		        width   : 402,
		        height  : 296, 
		        showClose: false,
		        modal	: true,
		        onOpen: function (event) {
		            event.onComplete = function () {
		            	utilObj.ajax({
							url: 'm/plantAudit/findPlantAudit',
							data: {
								accountPlanningId: vm.accountPlanningId,
							},
							success: function(data){
								var h = template('records', {
									data: data.object,
								});
		            			$(".client-records--opinion").html(h);
							}
						})
		            	
		            }
		        }
		    }
			if(this.roleId == 6){
				options.title = '产品意见';
			}else if(this.roleId == 7){
				options.title = '信审意见';
			}
			$().w2popup('open', options);
		},
		openDiary: function(){
			var vm = this;
			this.loadForm();
			var showOnly = true;
			var roleId = this.roleId;
			if(roleId == 1 || roleId == 6 || roleId == 7){
				showOnly = false;
			}
			$().w2popup('open', {
		        title   : '团队日志',
		        body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
		        style   : 'padding: 15px 0px 0px 0px',
		        width   : 480,
		        height  : showOnly?296: 416, 
		        showClose: false,
		        modal	: true,
		        onOpen: function (event) {
		            event.onComplete = function () {
		            	$('#w2ui-popup #form').w2render('planForm');
		            	utilObj.ajax({
							url: 'm/plantTeamLog/findPlantTeamLog',
							data: {
								accountPlanningId: vm.accountPlanningId,
							},
							success: function(data){
								var h = template('records-diary', {
									data: data.object,
								});
		            			$(".client-records--diary").html(h);
							}
						})
		            }
		        }
		    });
		},
	};
	
	module.exports = {
		init: function(params){
			page.accountPlanningId = params.accountPlanningId;
			page.planningStatus = params.planningStatus;
			page.planningStatusName = params.planningStatusName;
			page.loadMain = params.loadMain;
			page.taskActor = params.taskActor;
			page.id = params.id;
			page.loadContent();
			page.bindEvent();
			setTimeout(function(){
				$(window).trigger('resize');
			}, 20)
			
		}
	}
});