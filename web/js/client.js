define(function(require, exports, module){
	var tab1 =  require('myjs/client_base_info.js');
	var tab2 =  require('myjs/client_strategy.js');
	var tab3 =  require('myjs/client_other_banks.js');
	var tab4 =  require('myjs/client_we_bank.js');
	var tab5 =  require('myjs/client_plan.js');
	var tab6 =  require('myjs/client_clue.js');
	var tab7 =  require('myjs/client_business.js');
	var notify = require('myjs/client_notify.js');
	var page = {
		id: undefined,
		accountPlanningId: undefined,
		bindEvent: function(){
			var date = new Date().format('yyyy年MM月dd日');
			$(".homepage-refresh-date").html('数据截止日期' + date);
			//显示经理电话
			$(document).on('mouseenter', '.icon--phone', function(){
				var text = '加载中..';
				var hasMobile = false;
				if($(this).data('mobile')){
					text = $(this).data('mobile');
					hasMobile = true;
				}
				if($(this).hasClass('icon--phone-in-table')){
					$(this).w2tag(text, {
						position: 'left',
						className: 'tag--white-left',
						inputClass: 'tagged',
						top: -10,
					})
				}else{
					$(this).w2tag(text, {
						position: 'right',
						className: 'tag--white',
						inputClass: 'tagged',
						top: -10,
					})
				}
				if(hasMobile){
					return;
				}
				var $tagged = $(this);
				var id = $(this).data('id');
				var mobile = '暂无联系方式';
				if(id){
					utilObj.ajax({
						url: 'm/employee/findEmployeeByEmployeeId',
						data: {
							employeeId: id,
						},
						success: function(data){
							
							var res = utilObj.alterToObj(data.object);
							if(res.mobile){
								mobile = res.mobile;
							}
							$tagged.attr('data-mobile', mobile);
							if($tagged.hasClass('tagged')){
								if($tagged.hasClass('icon--phone-in-table')){
									$tagged.w2tag(mobile, {
										position: 'left',
										className: 'tag--white-left',
										inputClass: 'tagged',
										top: -10,
									})
								}else{
									$tagged.w2tag(mobile, {
										position: 'right',
										className: 'tag--white',
										inputClass: 'tagged',
										top: -10,
									})
								}
							}
						}
					})
				}else{
					if($tagged.hasClass('icon--phone-in-table')){
						$tagged.w2tag('历史遗留数据', {
							position: 'left',
							className: 'tag--white-left',
							inputClass: 'tagged',
							top: -10,
						})
					}else{
						$tagged.w2tag('历史遗留数据', {
							position: 'right',
							className: 'tag--white',
							inputClass: 'tagged',
							top: -10,
						})
					}
				}
				
			});
			$(document).on('mouseleave', '.icon--phone', function(){
				$(this).w2tag();
			});
			//显示推荐度
			$(document).on('mouseenter', '.client-value', function(){
				var text = '推荐度: ';
				var degree = $(this).data('degree');
				if(degree == null || degree === ''){
					return;
				}
				if(degree == 0){
					text += '低';
				}else if(degree == 1){
					text += '中';
				}else if(degree == 2){
					text += '高';
				}
				$(this).w2tag(text, {
					position: 'right',
					className: 'tag--white',
					inputClass: 'tagged',
					top: -10,
				})
				
			});
			$(document).on('mouseleave', '.client-value', function(){
				$(this).w2tag();
			});
//			var $select = $(".client-search").select2({
//				language: selet2LangZh,
//				placeholder: '根据客户名称或客户编号搜索',
//				
//			});
//			$(".client-search").change(function(e){
//				page.id = $(this).val();
//				w2ui['tabs'].click('tab1');
//			})
			$('.client-tabs').w2tabs({
		        name: 'tabs',
		        active: 'tab1',
		        tabs: [
		            { id: 'tab1', text: '基本信息' },
		            { id: 'tab2', text: '经营与战略' },
		            { id: 'tab7', text: '业务信息' },
		            { id: 'tab4', text: '我行业务规划' },
		            { id: 'tab3', text: '与其他银行合作' },
		            { id: 'tab5', text: '提升计划<span class="client-notify client-notify--plan"></span>' },
		            { id: 'tab6', text: '线索清单<span class="client-notify client-notify--clue">()</span>', style: 'margin-right: 0;' },
		        ],
		        
		        onClick: function (event) {
//		        	console.log(event.target);
					var target = event.target;
					if(target == 'tab1'){
						tab1.init(page.id);
					}else if(target == 'tab2'){
						tab2.init(page.id);
					}else if(target == 'tab3'){
						tab3.init({
							id: page.id,
							accountPlanningId: page.accountPlanningId,
						});
					}else if(target == 'tab4'){
						tab4.init(page.id);
					}else if(target == 'tab5'){
						tab5.init({
							accountPlanningId: page.accountPlanningId,
							planningStatus: page.planningStatus,
							planningStatusName: page.planningStatusName,
							loadMain: page.getClientData,
							taskActor: page.taskActor,
							id: page.id,
						});
						notify.getPlanCount(page.accountPlanningId, page.planningStatus);
						
					} else if(target == 'tab7'){
						tab7.init();
					} else{
						tab6.init({
							accountPlanningId: page.accountPlanningId,
						});
						notify.getClueCount(page.accountPlanningId);
					}
		        }
		    });
		    if(sessionStorage.getItem('curTab') == 'tab5'){
		    	w2ui['tabs'].click('tab5');
		    	sessionStorage.removeItem('curTab');
		    }else if(sessionStorage.getItem('curTab') == 'tab7'){
		    	w2ui['tabs'].click('tab7');
		    	sessionStorage.removeItem('curTab');
		    }else{
		    	w2ui['tabs'].click('tab5');
		    }
		    
		},
		getClientData: function(fromPlan){
			var vm = this;
			var jsonFilter = {};
			var id = url('?')? url('?')['c_id']:undefined;
			jsonFilter['search_EQ_customerId'] = id;
			var accountPlanningId = url('?')? url('?')['p_id']:undefined;
			if(accountPlanningId != 'null'){
				jsonFilter['search_EQ_accountPlanningId'] = accountPlanningId;
			}else{
				//20180123改为null by jc
				page.accountPlanningId = null;
			}
			if(id){
				page.id = id;
			}
			utilObj.ajax({
				url: 'm/accountPlanning/findAccountPlanning',
				data: {
					jsonFilter: JSON.stringify(jsonFilter),
					employeeId: utilObj.userLogined.employeeId,
				},
				success: function(data){
					page.accountPlanningId = data.object.accountPlanningId;
					page.planningStatus = data.object.planningStatus;
					page.planningStatusName = data.object.planningStatusName;
					page.taskActor = data.object.taskActor;
					if(w2ui['tabs'].active == 'tab5' && !fromPlan){
						tab5.init({
							accountPlanningId: page.accountPlanningId,
							planningStatus: page.planningStatus,
							planningStatusName: page.planningStatusName,
							loadMain: page.getClientData,
							taskActor: page.taskActor,
							id: page.id,
						});
					}
					var h = template('client-info', {
						data: data.object,
					});
					$(".client-info-wrapper").html(h);
					var productManagers = page.alterManagerData(data.object, {
						text: 'productManager',
						id: 'productManagerId',
					})
					$(".client-main-info__value--product-manager").html(template('multi-phone', {
						data: productManagers,
					}))
					var creditManagers = page.alterManagerData(data.object, {
						text: 'creditAnalyst',
						id: 'creditAnalystId',
					})
					$(".client-main-info__value--credit-manager").html(template('multi-phone', {
						data: creditManagers,
					}))
					notify.getPlanCount(page.accountPlanningId, page.planningStatus);
					notify.getClueCount(page.accountPlanningId);
				}
			})
		},
		//转换经理数据
		alterManagerData: function(data, options){
			var res = [];
			var names = utilObj.splitToAry(data[options.text]);
			var ids = utilObj.splitToAry(data[options.id]);
			$.each(names, function(i, val){
				var obj = {
					text: val,
					id: '',
				}
				if(ids[i]){
					obj.id = ids[i];
				}
				res.push(obj);
			})
			return res;
		},
	}
	$(function(){
		page.getClientData();
		page.bindEvent();
	})
});
