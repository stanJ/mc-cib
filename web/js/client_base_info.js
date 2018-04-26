define(function(require, exports, module){
	var baseInfoPage = {
		bindEvent: function(){
//			$(document).on('click', '.client-btn', function(){
//				baseInfoPage.open();
//			})
//			$(window).off('resize').resize(function(){
//				baseInfoPage.setHeight();
//			})
		},
		bindPartEvent: function(){
			$('.client-btn').off('click').on('click',function(){
				baseInfoPage.open();
			})
			$(window).trigger('resize');
		},
		setHeight: function(){
			var height = $("#right-content").height();
			var h1 = height - 492;
			$('.client-tab-content').outerHeight(h1);
		},
		loadBaseInfoContent: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/customerFinance/findCustomerFinance',
				data: {
					customerId: this.id,
				},
				success: function(data){
					vm.data = data.object;
					if(!vm.data.accountDate){
						vm.data.accountDate = new Date().format('yyyy-MM-dd');
					}
					var data = $.extend({
						roleId: utilObj.userLogined.roleId,
					}, data.object);
					var h = template('base-info-content', {
						data: data,
					});
					if(w2ui['tabs'].active == 'tab1'){
						$(".client-tab-content-container").html(h);
					}
//					$(".client-tab-content-container").html(h);
					vm.bindPartEvent();
				}
			})
			
		},
		getBaseInfoForm: function(){
			var customerInfo = $.extend({}, this.data.customerInfo);
			var record = $.extend({}, this.data);
			delete record.customerInfo;
			customerInfo.companyRemark = customerInfo.remark;
			delete customerInfo.remark;
			$.extend(record, {
				companyNature: customerInfo.companyNature,
				listedCompany: customerInfo.listedCompany,
				companyName: customerInfo.companyName,
				organizationCode: customerInfo.organizationCode,
				employeeCount: customerInfo.employeeCount,
				companyRemark: customerInfo.companyRemark,
			});
			var ary = record.listedCompany?record.listedCompany.split(','):[];
			var listedCompanyAry = $.map(ary, function(val, i){
				return {
					id: val,
					text: val
				}
			});
			record.listedCompany = listedCompanyAry;
			var vm = this;
			if(!w2ui.baseInfo){
				$().w2form({
		            name: 'baseInfo',
		            style: 'border: 0px; background-color: transparent;',
		            formHTML: template('base-info-form')(),
		            fields: [
		            	{ name: 'companyNature', type: 'combo',  options: {
		            		items: ['国有企业', '外资企业(独资)', '外资企业(合资)', '民营企业', '政府平台', '代表处', '机构(如医院,学校等)', '离岸公司'],
		            		filter: false,
		            		openOnFocus: true,
		            	}},
		            	{ name: 'listedCompany', type: 'enum',  options: {
		            		items: ['国内上市', '香港上市', '海外上市', '非上市'],
		            		openOnFocus: true,
		            		style: "height: 36px; line-height:36px;color: #B9B9B9;padding-left: 5px;font-size: 14px;"
		            	}},
		            	{ name: 'companyName', type: 'text' },
		            	{ name: 'organizationCode', type: 'text' },
		            	{ name: 'employeeCount', type: 'int', options: { autoFormat: false, }, },
		            	{ name: 'companyRemark', type: 'text' },
		            	
		            	{ name: 'accountDate', type: 'date', options: { format: 'yyyy-mm-dd',}},
		                { name: 'mainBizIncome', type: 'int', options: { autoFormat: false, },},
		                { name: 'operatingCosts', type: 'int', options: { autoFormat: false, },},
		                { name: 'netProfit', type: 'int', options: { autoFormat: false, },},
		                { name: 'accountReceivable', type: 'int', options: { autoFormat: false, }, },
		                { name: 'accountPayable', type: 'int', options: { autoFormat: false, },},
		                { name: 'cashConversionCycle', type: 'int', options: { autoFormat: false, },},
		            	{ name: 'totalAsstes', type: 'int', options: { autoFormat: false, }, },
		            	{ name: 'cashBalance', type: 'int', options: { autoFormat: false, }, },
		                { name: 'totalLiabilities', type: 'int', options: { autoFormat: false, },},
		            	{ name: 'midLongTermLoan', type: 'int', options: { autoFormat: false, }, },
		                { name: 'loan', type: 'int', options: { autoFormat: false, },},
		                { name: 'totalBonds', type: 'int', options: { autoFormat: false, },},
//		            	{ name: 'totalStock', type: 'int', options: { autoFormat: false, }, },

		                { name: 'openDate', type: 'date', options: { format: 'yyyy-mm-dd',}},
		                { name: 'relationship', type: 'text'},
		                { name: 'primaryContact', type: 'text'},
		                { name: 'primaryContactPosition', type: 'text'},
		                { name: 'primaryContactPhone', type: 'text'},
		            	{ name: 'otherContact', type: 'text' },
		                { name: 'otherContactPosition', type: 'text'},
		                { name: 'otherContactPhone', type: 'text'},
		                { name: 'remark', type: 'text'},
		                
		            ],
		            record: record,
		            actions: {
		                "save": function () { 
		                	var errs = this.validate(); 
		                	if(errs.length == 0){
		                		if(this.record.organizationCode){
		                			if(utilObj.validateCode(this.record.organizationCode)){
		                				vm.editBaseInfo();
		                			}else{
		                				w2alert('组织机构代码需为15-18位的字母或数字', '提示');
		                			}
		                		}else{
		                			vm.editBaseInfo();
		                		}
		                	}
		                },
		                "reset": function () { 
		                	this.clear();
		                	w2popup.close();
		                }
		            }
		        });
			}else{
				w2ui['baseInfo'].record = $.extend({}, record);
				w2ui['baseInfo'].refresh();
			}
		},
		changeSomeCss: function(){
			setTimeout(function(){
				$("input[name='listedCompany']").siblings('.w2ui-field-helper').css({'max-width': '180px', 'min-height': '36px', 'border': '1px solid #d2d2d2'});
			}, 0)
		},
		editBaseInfo: function(){
			var vm = this;
			var data = $.extend({},  w2ui['baseInfo'].record);
			var listedCompany = $.map(data.listedCompany, function(val, i){
				return val.id;
			}).join(',');
			var actualData = $.extend({}, data);
			actualData.customerId = vm.id;
			actualData = utilObj.toNull(actualData);
			delete actualData.companyNature;
			delete actualData.listedCompany;
			delete actualData.companyName;
			delete actualData.organizationCode;
			delete actualData.employeeCount;
			delete actualData.companyRemark;
			utilObj.ajax({
				url: 'm/customerFinance/updateCustomerFinance',
				data: {
					jsonEntity: JSON.stringify(actualData),
					employeeId: utilObj.userLogined.employeeId,
					employeeName: utilObj.userLogined.nickName,
					companyNature: data.companyNature,
					listedCompany: listedCompany,
					companyName: data.companyName,
					organizationCode: data.organizationCode,
					employeeCount: data.employeeCount,
					remark: data.companyRemark,
				},
				success: function(data){
					vm.loadBaseInfoContent();
					w2popup.close();
				}
			})
		},
		openBaseInfoPopup: function(){
			var vm = this;
			$().w2popup('open', {
		        title   : '完成工作',
		        body    : '<div id="form" style="width: 100%; height: 100%;"></div>',
		        style   : 'padding: 15px 0px 0px 0px',
		        width   : 1100,
		        height  : 600,
		        modal	: true,
		        showClose: false,
		        onOpen: function (event) {
		            event.onComplete = function () {
		                $('#w2ui-popup #form').w2render('baseInfo');
		                vm.changeSomeCss();
		            }
		        }
		    });
		},
		open: function(){
			this.getBaseInfoForm();
			this.openBaseInfoPopup();
		},
		addCustomerType: function(){
			var methods = {
				click: function(event){
					event.stopPropagation();
					if (!$(this.el).is(':focus')) methods.focus.call(this, event);
				},
				focus: function(event){
					var obj     = this;
            		var options = this.options;
            		if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
	                if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
	                obj.resize();
	                setTimeout(function () {
	                    if (obj.type == 'list' && $(obj.el).is(':focus')) {
	                        $(obj.helpers.focus).find('input').focus();
	                        return;
	                    }
	                    obj.search();
	                    setTimeout(function () { obj.updateOverlay(); }, 1);
	                }, 1);
				},
				blur: function(event){
					var obj     = this;
		            var options = obj.options;
		            var val     = $(obj.el).val().trim();
		            if ($("#w2ui-overlay").length > 0) $('#w2ui-overlay')[0].hide();
				},
				keyDown: function(event, extra){
					var obj     = this;
		            var options = obj.options;
		            var key     = event.keyCode || (extra && extra.keyCode);
		            
		            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
	                var selected  = $(obj.el).data('selected');
	                var focus     = $(obj.el);
	                var indexOnly = false;
	                // apply arrows
	                switch (key) {
	                    case 27: // escape
	                        break;
	                    case 37: // left
	                    case 39: // right
	                        // indexOnly = true;
	                        break;
	                    case 13: // enter
	                        if ($('#w2ui-overlay').length === 0) break; // no action if overlay not open
	                        var item  = options.items[options.index];
	                        
                            if (item) $(obj.el).data('selected', item).val(item.text).change();
                            if ($(obj.el).val() === '' && $(obj.el).data('selected')) $(obj.el).removeData('selected').val('').change();
                            // hide overlay
                            obj.tmp.force_hide = true;
	                        break;
	                    case 8:  // backspace
	                    case 46: // delete
	                        break;
	                    case 38: // up
	                        options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0;
	                        options.index--;
	                        while (options.index > 0 && options.items[options.index].hidden) options.index--;
	                        if (options.index === 0 && options.items[options.index].hidden) {
	                            while (options.items[options.index] && options.items[options.index].hidden) options.index++;
	                        }
	                        indexOnly = true;
	                        break;
	                    case 40: // down
	                        options.index = w2utils.isInt(options.index) ? parseInt(options.index) : -1;
	                        options.index++;
	                        while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++;
	                        if (options.index == options.items.length-1 && options.items[options.index].hidden) {
	                            while (options.items[options.index] && options.items[options.index].hidden) options.index--;
	                        }
	                        // show overlay if not shown
	                        if (focus.val() === '' && $('#w2ui-overlay').length === 0) {
	                            obj.tmp.force_open = true;
	                        } else {
	                            indexOnly = true;
	                        }
	                        break;
	                }
	                if (indexOnly) {
	                    if (options.index < 0) options.index = 0;
	                    if (options.index >= options.items.length) options.index = options.items.length -1;
	                    obj.updateOverlay(indexOnly);
	                    // cancel event
	                    event.preventDefault();
	                    setTimeout(function () {
	                        // set cursor to the end
	                        obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length);
	                    }, 0);
	                    return;
	                }
				},
				keyUp: function(event){
					var obj = this;
					if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return;
	                // need to be here for ipad compa
	                if ([16, 17, 18, 20, 37, 39, 91].indexOf(event.keyCode) == -1) { // no refreah on crtl, shift, left/right arrows, etc
	                    var input = $(this.helpers.focus).find('input');
	                    if (input.length === 0) input = $(this.el); // for combo list
	                    // trigger event
	                    var edata = this.trigger({ phase: 'before', type: 'search', originalEvent: event, target: input, search: input.val() });
	                    if (edata.isCancelled === true) return;
	                    // regular
	                    if (!this.tmp.force_hide) this.request();
	                    if (input.val().length == 1) this.refresh();
	                    if ($('#w2ui-overlay').length === 0 || [38, 40].indexOf(event.keyCode) == -1) { // no search on arrows
	                        this.search();
	                    }
	                    // event after
	                    this.trigger($.extend(edata, { phase: 'after' }));
	                }
				},
			}
			$().w2field('addType', 'selectinput', function(options){
				var obj = this;
				var defaults = {
                    items           : [],
                    selected        : {},
                    url             : null,          // url to pull data from
                    recId           : null,          // map retrieved data from url to id, can be string or function
                    recText         : null,          // map retrieved data from url to text, can be string or function
                    method          : null,          // default comes from w2utils.settings.dataType
                    interval        : 350,           // number of ms to wait before sending server call on search
                    postData        : {},
                    minLength       : 1,            // min number of chars when trigger search
                    cacheMax        : 250,
                    maxDropHeight   : 350,          // max height for drop down menu
                    maxDropWidth    : null,         // if null then auto set
                    match           : 'begins',     // ['contains', 'is', 'begins', 'ends']
                    silent          : true,
                    icon            : null,
                    iconStyle       : '',
                    onSearch        : null,         // when search needs to be performed
                    onRequest       : null,         // when request is submitted
                    onLoad          : null,         // when data is received
                    onError         : null,         // when data fails to load due to server error or other failure modes
                    onIconClick     : null,
                    renderDrop      : null,         // render function for drop down item
                    compare         : null,         // compare function for filtering
                    filter          : true,         // weather to filter at all
                    prefix          : '',
                    suffix          : '',
                    openOnFocus     : false,        // if to show overlay onclick or when typing
                    markSearch      : false
                };
                options.items = this.normMenu(options.items); // need to be first
                options = $.extend({}, defaults, options, {
                    align   : 'both',      // same width as control
                    altRows : true         // alternate row color
                });
                this.options = options;
                if (!$.isPlainObject(options.selected)) options.selected = {};
                $(this.el).data('selected', options.selected);
                if (options.url) {
                    options.items = [];
                    this.request(0);
                }
                if (this.type == 'list') this.addFocus();
                this.addPrefix();
                this.addSuffix();
                setTimeout(function () { obj.refresh(); }, 10); // need this for icon refresh
                $(this.el).attr('autocomplete', 'off');
                if (options.selected.text != null) $(this.el).val(options.selected.text);
                
                // attach events
	            this.tmp = {
	                onChange    : function (event) { obj.change.call(obj, event); },
	                onClick     : function (event) { methods.click.call(obj, event); },
	                onFocus     : function (event) { methods.focus.call(obj, event); },
	                onBlur      : function (event) { methods.blur.call(obj, event); },
	                onKeydown   : function (event) { methods.keyDown.call(obj, event); },
	                onKeyup     : function (event) { methods.keyUp.call(obj, event); },
	                onKeypress  : function (event) { obj.keyPress.call(obj, event); }
	            };
	            $(this.el)
	                .addClass('w2field w2ui-input')
	                .data('w2field', this)
	                .on('change.w2field',   this.tmp.onChange)
	                .on('click.w2field',    this.tmp.onClick)         // ignore click because it messes overlays
	                .on('focus.w2field',    this.tmp.onFocus)
	                .on('blur.w2field',     this.tmp.onBlur)
	                .on('keydown.w2field',  this.tmp.onKeydown)
	                .on('keyup.w2field',    this.tmp.onKeyup)
	                .on('keypress.w2field', this.tmp.onKeypress)
	                .css(w2utils.cssPrefix('box-sizing', 'border-box'));
	            // format initial value
	            this.change($.Event('change'));
			})
		}
	};
	module.exports = {
		init: function(id){
			baseInfoPage.id = id;
			baseInfoPage.addCustomerType();
			baseInfoPage.loadBaseInfoContent();
			baseInfoPage.bindEvent();
		}
	}
});