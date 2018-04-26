define(function(require, exports, module){
	var page = {
		bindEvent: function(){
//			$(window).off('resize').resize(function(){
//				page.setHeight();
//			})
		},
		bindPartEvent: function(){
			$('.client-btn').off('click').on('click',function(){
				page.open();
			})
			$(window).trigger('resize');
		},
		setHeight: function(){
			var height = $("#right-content").height();
			var h1 = height - 492;
//			console.log('strategy', height);
//			console.log('strategy', h1);
			$('.client-tab-content').outerHeight(h1);
		},
		loadContent: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/customerVision/findCustomerVision',
				data: {
					customerId: this.id,
				},
				success: function(data){
					vm.data = data.object;
					var data = $.extend({
						roleId: utilObj.userLogined.roleId,
					}, data.object);
					var h = template('strategy-content', {
						data: data,
					});
					if(w2ui['tabs'].active == 'tab2'){
						$(".client-tab-content-container").html(h);
					}
					vm.bindPartEvent();
				}
			})
		},
		loadForm: function(){
			var vm = this;
			if(!w2ui.strategy){
				$().w2form({
		            name: 'strategy',
		            style: 'border: 0px; background-color: transparent;',
		            formHTML: template('strategy-form')(),
		            fields: [
		                { name: 'mainBusiness', type: 'text'},
		                { name: 'coverage', type: 'text'},
		                { name: 'strategy', type: 'text'},
		                { name: 'financialDemand', type: 'text'},
//		                { name: 'customerSeniorRelationship', type: 'text'},
		            ],
		            record: this.data,
		            actions: {
		                "save": function () { 
		                	var errs = this.validate(); 
		                	if(errs.length == 0){
		                		vm.editForm();
		                	}
		                },
		                "reset": function () { 
		                	this.clear();
		                	w2popup.close();
		                }
		            }
		        });
			}else{
				w2ui['strategy'].record = this.data;
				w2ui['strategy'].refresh();
			}
			
		},
		editForm: function(){
			var vm = this;
			var data = $.extend({},  w2ui['strategy'].record);
			data.customerId = vm.id;
			utilObj.ajax({
				url: 'm/customerVision/updateCustomerVision',
				data: {
					jsonEntity: JSON.stringify(data),
					employeeId: utilObj.userLogined.employeeId,
					employeeName: utilObj.userLogined.nickName,
				},
				success: function(data){
					vm.loadContent();
					w2popup.close();
				}
			})
		},
		openPopup: function(){
			$().w2popup('open', {
		        title   : '完成工作',
		        body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
		        style   : 'padding: 15px 0px 0px 0px',
		        width   : 636,
		        height  : 627,
		        modal	: true,
		        showClose: false,
		        onOpen: function (event) {
		            event.onComplete = function () {
		                $('#w2ui-popup #form').w2render('strategy');
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
		init: function(id){
			page.id = id;
			page.loadContent();
			page.bindEvent();
			
		}
	}
});