define(function(require,exports,module){
	var page = {
		employeeId: utilObj.userLogined.employeeId,
		bindEvent: function(){
			var vm = this;
			this.getSubBranchesData();
			$(".sub-branch-input").change(function(e){
				var selected = $(this).data('selected');
				vm.getScoreData(selected.id);
			});
			$(".sub-branch-table-performance-wrapper").on('mouseenter', '.table-inside-chart', function(){
				$(this).css({
					'position': 'relative',
					'z-index': '10',
				})
			});
			$(".sub-branch-table-performance-wrapper").on('mouseleave', '.table-inside-chart', function(){
				var that = this;
				setTimeout(function(){
					$(that).css({
						'position': 'initial',
						'z-index': 'initial',
					})
				}, 0);
				
			});
			
			$(".score-table--manager").on('mouseenter', '.manager-chart', function(){
				$(this).css({
					'position': 'relative',
					'z-index': '10',
				})
			});
			$(".score-table--manager").on('mouseleave', '.manager-chart', function(){
				var that = this;
				setTimeout(function(){
					$(that).css({
						'position': 'initial',
						'z-index': 'initial',
					})
				}, 0);
				
			});
			$(".homepage-action__main--sale-alert").click(function(){
				utilObj.gotoPageUri('warnning.html');
			});
			$(".homepage-action__summary--approval").click(function(){
				utilObj.gotoPageUri('account-profile.html');
			});
			$(".homepage-action__main--approval").on('click', '.homepage-action__item', function(){
				var customerId = $(this).data('cid');
				var planningId = $(this).data('pid');
				utilObj.gotoPageUri("client.html?c_id="+customerId+"&p_id="+planningId);
			});
			$(".search-input--sub-branch").on("select2:select", function(e){
		    	var data = e.params.data;
		    	var id = data.id.customerId;
		    	var pid = data.id.planningId;
		    	sessionStorage.setItem('curTab', 'tab7');
		    	utilObj.navigate('client', {
		    		c_id: id,
		    		p_id: pid?pid:'null',
		    	});
		   });
		    //点击客户看板里的客户名称
		    $(".sub-branch-grid--customer").on('click', '.customer-name', function(){
		    	var id = $(this).data('id');
		    	var pid = $(this).data('pid');
		    	if(pid === null){
		    		pid = 'null';
		    	}
		    	utilObj.navigate('client', {
		    		'c_id': id,
		    		'p_id': pid,
		    	})
		    });
		    
			var date = new Date().format('yyyy年MM月dd日');
			$(".homepage-refresh-date").html('数据截止日期' + date);
		},
		setSearchBar: function(){
			var optstr = "<option></option>";
			$(".search-input--sub-branch").html(optstr).select2({
				width:"100%",
				language: selet2LangZh,
				placeholder: "关键字:客户,集团,行业",
				allowClear: false,
				minimumInputLength: 1,
				multiple: true,
				ajax: {
					url: utilObj.getAjaxUrl()+"m/customer/findCustomerInfo",
					type: "POST",
					dataType: "json",
					data: function(params){
						return {
							keyword: params.term,
							token: utilObj.token,
							employeeId: page.employeeId
						};
					},
					processResults: function(data){
						var _data = [];
						if(data && data.object.length > 0){
							$.each(data.object, function(i,v){
								_data.push({
									id: v,
									text: v.customerName
								});
							});
						} 
						return {
							results: _data
						};
					},
					cache: true
				}
			});
		},
		getSubBranchesData: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/bank/findList',
				data: {
					employeeId: page.employeeId,
				},
				success: function(data){
					vm.subBranchesData = data.object;
					vm.getScoreData();
					vm.loadSubBranchesSelect();
				}
			});
		},
		loadSubBranchesSelect: function(){
			var subBranches = this.subBranchesData.slice(0);
			subBranches = $.map(subBranches, function(val, i){
				return {
					id: val.bankId,
					text: val.bankSubsetName,
				}
			});
			$(".sub-branch-input").w2field('list', {
				items: subBranches,
				selected: subBranches[0],
			});
		},
		getTableData: function(){
			this.getCustomersData();
		},
		getActionData: function(){
			this.getSaleAlertData();
			this.getApprovalData();
		},
		getSaleAlertData: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/sale/findWarnning4HomePage',
				data: {
					employeeId: page.employeeId,
				},
				success: function(data){
					vm.saleAlertData = utilObj.alterToObj(data.object);
					vm.loadSaleAlertList();
				}
			});
		},
		getApprovalData: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/accountPlanning/findAccountPlanBoard',
				data: {
					employeeId: page.employeeId,
				},
				success: function(data){
					vm.approvalData = data.object.length?data.object[0]:null;
					vm.loadApprovalList();
				}
			});
		},
		loadSaleAlertList: function(){
			var ary = utilObj.alterToAry(this.saleAlertData.content);
			var h = template('sale-alert', {
				data: ary.slice(0, 10),
			});
			$(".homepage-action__main--sale-alert").html(h);
			$(".homepage-action__summary-num--sale-alert").text(this.saleAlertData.totalElements);
		},
		loadApprovalList: function(){
			if(this.approvalData){
				var h = template('approval', {
					data: this.approvalData.customerInfoList,
				});
				$(".homepage-action__main--approval").html(h);
				$(".homepage-action__summary-num--approval").text(this.approvalData.count);
			}else{
				$(".homepage-action__summary-num--approval").text(0);
			}
		},
		getCustomersData: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/board/findCustomerInfo',
				data: {
					employeeId: page.employeeId,
				},
				success: function(data){
					var ary = utilObj.addRecid(data.object, 'customerId');
					vm.customersData = ary.slice(0);
					vm.loadCustomersTable();
				}
			})
		},
		getManagerScoreOptions: function(data){
			var total = data.total?data.total:0;
			var options = {
		        chart: {
		            type: 'bar',
		            margin: [0, 0, 0, 0],
		            spacing: [0, 0, 0, 0],
		            backgroundColor: 'transparent',
		        },
		        exporting: {
		            enabled: false,
		        },
		        credits: {
		            enabled: false,
		        },
		        legend: {
		            shadow: false,
		            enabled: false,
		        },
		        title: {
		            text: null
		        },
		        xAxis: {
		            categories: [],
		            visible: false,
		        },
		        yAxis: {
		            allowDecimals: false,
		            min: 0,
		            max: total,
		            title: {
		                enabled: false,
		            },
		            labels: {
		                enabled: false,  
		            },
		            gridLineWidth: 0,
		            endOnTick: false,
		        },
		        tooltip: {
		            formatter: function () {
		                var indexS = this.series.index,
	                    indexP = this.point.x,
	                    series = this.series.chart.series,
	                    seriesOrigin = this.series;
	                    var name = seriesOrigin.name;
	                    var out = '';
	                    out += name + ':' + this.y;
	                    var another = '';
	                    var getAnother = function(data){
	                    	var s = data.series.name + ':' + data.y;
	                    	return s;
	                    }
	                    if(series.length == 1){
	                    	return out;
	                    }
		                switch (indexS) {
		                    case 0:
		                        another = getAnother(series[1].data[indexP]);
		                        break;
		                    case 1:
		                        another = getAnother(series[0].data[indexP]);
		                        break;
		                }
		                if(name == '预计'){
	                    	out += '<br/>' + another;
	                    }else{
	                    	out = another + '<br/>' + out;
	                    }
		                return out;
		            },
		            hideDelay: 0,
		        },
		        plotOptions: {
		            bar: {
		                stacking: 'normal',
		                borderWidth: 0,
		                groupPadding: 0,
		                pointPadding: 0,
		                dataLabels: {
		                    enabled: true,
		                    color: '#fff',
		                    style: {
		                        textShadow: '0 0 5px #000',
		                        textOutline: '0 0',
		                        fontWeight: 'normal',
		                        fontSize: '10px',
		                    },
		                    formatter: function(){
		                    	return utilObj.showChartPercentLabel(this.y/total);
		                    }
		                },
		            },
		        },
		        series: [{
		            name: '小张大法师打发打发打发啊时代发生法师发誓',
		            data: [5],
		            stack: 'first',
		            color: '#b9b9b9',
		        }, {
		            name: '小潘',
		            data: [3],
		            stack: 'first',
		            color: '#4675c6',
		        },]
		    };
		    options.series = data.series;
		    return options;
		},
		loadManagerChart: function(){
			var vm = this;
			$(".score-table--manager .mck-table__row").each(function(i){
				$(this).find('.mck-cell--manager').text(vm.managerScoreData[i].employeeName);
				var oneMangerData = vm.alteredManagerScoreData[i];
				$(this).find('.manager-chart').each(function(j){
					if(oneMangerData[j].total == 0){
						return;
					}
					var options = vm.getManagerScoreOptions(oneMangerData[j]);
					$(this).highcharts(options);
				});
			});
		},
		alterScoreData: function(data){
			this.originScoreData = data;
			var h = template('bank-rank', {
				data: this.originScoreData,
			});
			$(".score-rank-wrapper").html(h);
			
			var bankScoreData = data.bankSubsetList;
			this.bankScoreData = bankScoreData;
			this.alteredBankScoreData = this.alterBankScoreData();
			//拼装银行业绩看板表格数据
			this.tableBankScoreData = this.getTableBankScoreData();
			this.loadBankScoreTable();
			
			var managerScoreData = data.employeeScoreList;
			this.managerScoreData = managerScoreData;
			this.alteredManagerScoreData = this.alterManagerScoreData();
			//拼装客户经理业绩看板表格数据
			this.tableManagerScoreData = this.getTableManagerScoreData();
			this.loadManagerScoreTable();
			
			this.loadScoreChart();
			this.loadManagerChart();
		},
		loadManagerScoreTable: function(){
			var h = template('manager-score-table', {
				data: this.tableManagerScoreData,
			});
			$(".score-table--manager").html(h);
		},
		getTableManagerScoreData: function(){
			var tableData = {};
			tableData.managerBestData = utilObj.alterToObj(this.originScoreData.employeeBestBizScore);
			tableData.managerData = this.originScoreData.employeeLightsList;
//			tableData.labelData = this.getLabelBankScoreData(tableData.bankData);
//			tableData.monthData = $.map(this.bankScoreData, function(val,i){
//				return parseInt(val.evaMonth.slice(4));
//			});
			return tableData;
		},
		loadBankScoreTable: function(){
			var h = template('bank-score-table', {
				data: this.tableBankScoreData,
			});
			$(".score-table--sub-branch").html(h);
			var tableData = this.bankTableData;
			var curMonth = tableData.monthData.length>0?tableData.monthData[tableData.monthData.length-1]:0;
			if(curMonth){
				curMonth = parseInt(curMonth);
				var percent =  Math.round((1 - curMonth/12)*100);
				$('.score-charts-line').css('top', percent+'%');
			}
			var months = tableData.monthData.slice(0);
			var h = template('performance-icons', {
				data: months,
			});
			$(".sub-branch-legends-left").html(h);
		},
		getTableBankScoreData: function(){
			var tableData = {};
			tableData.bankBestData = utilObj.alterToObj(this.originScoreData.bankSubsetBestBizScore);
			tableData.bankData = this.bankScoreData.length>0?this.bankScoreData[this.bankScoreData.length-1]:{yearlyPlanning:{}};
			tableData.labelData = this.getLabelBankScoreData(this.originScoreData.bankLightsList);
			tableData.monthData = $.map(this.bankScoreData, function(val,i){
				return parseInt(val.evaMonth.slice(4));
			});
			this.bankTableData = tableData;
			return tableData;
		},
		getLabelBankScoreData: function(bankLightsData){
			var res = [];
			if(!bankLightsData[0]){
				return res;
			}
			var bankData = bankLightsData[0].target;
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '有效开户新增',
				field: 'activeAccount',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '战略客户新增',
				field: 'strategicAccount',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '网银开户数',
				field: 'ebankAccount',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '规划完成量',
				field: 'planingAccount',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '存款新增',
				field: 'deposit',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '贷款新增',
				field: 'loan',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '净收入新增',
				field: 'netIncome',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '投资银行新增',
				field: 'investmentBankProducts',
			});
			res = this.getOneLabelBankScoreData(res, bankData, {
				text: '交易银行新增',
				field: 'tradingBankProducts',
			});
			return res;
		},
		getOneLabelBankScoreData: function(res, data, options){
			var obj = {};
			obj.name = options.text;
			obj.rate = data[options.field];
			res.push(obj);
			return res;
		},
		alterManagerScoreData: function(){
			var vm = this;
			var res = [];
			$.each(this.managerScoreData, function(i, val){
				var oneData = vm.getManagerScoreOneData(val);
				res.push(oneData);
			});
			return res;
		},
		getManagerScoreOneData: function(val){
			var ary = [];
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'valid',
				p2: 'validWill', 
				p3: 'activeAccount',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'strategic',
				p3: 'strategicAccount',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'ebank',
				p2: 'ebankWill', 
				p3: 'ebankAccount',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'planing',
				p2: 'planingWill', 
				p3: 'planingAccount',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'depositDaily',
				p2: 'depositDailyWill', 
				p3: 'deposit',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'loanDaily',
				p2: 'loanDailyWill', 
				p3: 'loan',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'netIncome',
				p3: 'netIncome',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'amountInv',
				p2: 'amountInvWill', 
				p3: 'investmentBankProducts',
			});
			ary = this.getManagerScoreItemData(ary, val, {
				p1: 'amountBiz',
				p2: 'amountBizWill', 
				p3: 'tradingBankProducts',
			});
			return ary;
		},
		getManagerScoreItemData: function(ary, val, options){
			// var count = this.managerScoreData.length;
			var obj = {};
			var series = [];
			
			var item = {
	            name: '',
	            data: null,
	            stack: 'first',
	            color: '#8c8c8c',
	        }
			var item1 = $.extend({}, item, {
				name: '预计',
			});
			item1.data = options.p2?[val[options.p2]]:null;
			var item2 = $.extend({}, item, {
				name: '完成',
				color: '#4675c6',
			});
			item2.data = [val[options.p1]];
			if(item1.data){
				series.push(item1);
			}
			series.push(item2);
			
			obj.series = series;
			obj.total = val.yearlyPlanning[options.p3];
			
			ary.push(obj);
			return ary;
		},
		alterBankScoreData: function(){
			var res = [];
			res = this.getBankScoreItemData(res, {
				p1: 'valid',
				p2: 'validWill', 
				p3: 'activeAccount',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'strategic',
				p3: 'strategicAccount',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'ebank',
				p2: 'ebankWill', 
				p3: 'ebankAccount',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'planing',
				p2: 'planingWill', 
				p3: 'planingAccount',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'depositDaily',
				p2: 'depositDailyWill', 
				p3: 'deposit',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'loanDaily',
				p2: 'loanDailyWill', 
				p3: 'loan',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'netIncome',
				p3: 'netIncome',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'amountInv',
				p2: 'amountInvWill', 
				p3: 'investmentBankProducts',
			});
			res = this.getBankScoreItemData(res, {
				p1: 'amountBiz',
				p2: 'amountBizWill', 
				p3: 'tradingBankProducts',
			});
			console.log('bankData', res);
			return res;
		},
		getBankScoreItemData: function(res, options){
			var obj = {};
			var series = [];
			var item = {
	            name: '',
	            data: null,
	            stack: 'first',
	            color: '#b9b9b9',
	        }
			$.each(this.bankScoreData, function(i, val){
				var item1 = $.extend({}, item, {
					name: '预计',
					color: '#b9b9b9',
				});
				item1.data = options.p2?[val[options.p2]]:null;
				var item2 = $.extend({}, item, {
					name: '完成',
				});
				item2.data = [val[options.p1]];
				if(i == 0){
					item1.stack = 'first';
					item2.stack = 'first';
					item1.color = '#c8c8c8';
					item2.color = '#bbd6ff';
				}else if(i == 1){
					item1.stack = 'second';
					item2.stack = 'second';
					item1.color = '#b4b4b4';
					item2.color = '#83aef0';
				}else if(i == 2){
					item1.stack = 'third';
					item2.stack = 'third';
					item1.color = '#8c8c8c';
					item2.color = '#4675c6';
				}
				if(item1.data){
					series.push(item1);
				}
				series.push(item2);
			});
			obj.total = this.bankScoreData.length ? this.bankScoreData[this.bankScoreData.length-1].yearlyPlanning[options.p3] : 0;
			obj.series = series;
			res.push(obj);
			return res;
		},
		getScoreData: function(bankId){
			var vm = this;
			if(!bankId){
				bankId = this.subBranchesData[0].bankId;
			}
			utilObj.ajax({
				url: 'm/board/findBankScore',
				data: {
					bankBranchId: '',
					bankSubsetId: bankId,
					employeeId: page.employeeId,
					evaDate: '',
				},
				success: function(data){
					vm.alterScoreData(data.object);
				}
			});
		},
		getBankScoreOptions: function(data){
			var total = data.total?data.total:0;
			var series = data.series;
			var options = {
		        chart: {
		            type: 'column',
		            margin: [0, 0, 0, 0],
		            spacing: [0, 0, 0, 0],
		            backgroundColor: 'transparent',
		        },
		        exporting: {
		            enabled: false,
		        },
		        credits: {
		            enabled: false,
		        },
		        legend: {
		            shadow: false,
		            enabled: false,
		        },
		        title: {
		            text: null
		        },
		        xAxis: {
		            categories: [],
		            visible: false,
		        },
		        yAxis: {
		            allowDecimals: false,
		            min: 0,
		            max: total,
		            title: {
		                enabled: false,
		            },
		            labels: {
		                enabled: false,  
		            },
		            gridLineWidth: 0,
		            endOnTick: false,
		        },
		        tooltip: {
		            formatter: function () {
						var indexS = this.series.index,
	                    indexP = this.point.x,
	                    series = this.series.chart.series,
	                    seriesOrigin = this.series;
	                    var name = seriesOrigin.name;
	                    var out = '';
	                    out += name + ':' + this.y;
	                    var another = '';
	                    var getAnother = function(data){
	                    	var s = data.series.name + ':' + data.y;
	                    	return s;
	                    }
	                    var hasWill = function(series){
	                      var res = null;
	                      if(series.length == 1 || series.length == 3){
	                        res = false;
	                      } else if(series.length == 4 || series.length == 6){
	                        res = true;
	                      } else if(series.length == 2){
	                        if(series[0].name == series[1].name){
	                          res = false;
	                        } else {
	                          res = true;
	                        }
	                      } else {
	                        res = true;
	                      }
	                      return res;
	                    }
	                    if(!hasWill(series)){
	                    	return out;
	                    }
		                switch (indexS) {
		                    case 0:
		                        another = getAnother(series[1].data[indexP]);
		                        break;
		                    case 1:
		                        another = getAnother(series[0].data[indexP]);
		                        break;
		                    case 2:
		                        another = getAnother(series[3].data[indexP]);
		                        break;
		                    case 3:
		                        another = getAnother(series[2].data[indexP]);
		                        break;
		                    case 4:
		                        another = getAnother(series[5].data[indexP]);
		                        break;
		                    case 5:
		                    	another = getAnother(series[4].data[indexP]);
		                        break;
		                }
		                if(name == '预计'){
	                    	out += '<br/>' + another;
	                    }else{
	                    	out = another + '<br/>' + out;
	                    }
		                return out;
		            },
//		            shared: true,
		        },
		        plotOptions: {
		            column: {
		                stacking: 'normal',
		                borderWidth: 0,
		                groupPadding: 0,
		                pointPadding: 0,
		                dataLabels: {
		                    enabled: true,
		                    color: '#fff',
		                    style: {
		                        textShadow: '0 0 5px #000',
		                        textOutline: '0 0',
		                        fontWeight: 'normal',
		                        fontSize: '10px',
		                    },
		                    formatter: function(){
		                    	return utilObj.showChartPercentLabel(this.y/total);
		                    }
		                },
		            },
		        },
		        series: [{
		            name: '小张',
		            data: [5],
		            stack: 'first',
		            color: '#b9b9b9',
		        }, {
		            name: '小潘',
		            data: [3],
		            stack: 'first',
		            color: '#bbd6ff',
		        }, {
		            name: '小彭',
		            data: [2],
		            stack: 'second',
		            color: '#b9b9b9',
		        }, {
		            name: '小王',
		            data: [3],
		            stack: 'second',
		            color: '#83aef0',
		        }, {
		            name: '预计有效客户数',
		            data: [4],
		            stack: 'third',
		            color: '#b9b9b9',
		        }, {
		            name: '已完成',
		            data: [6],
		            stack: 'third',
		            color: '#4675c6',
		        }]
		    };
		    options.series = series;
		    return options;
		},
		loadScoreChart: function(){
			var vm = this;
			if(!$(".score-chart").length){
			  $(".score-charts-line").hide();
			}
	    $(".score-chart").each(function(i){
	    	var data = vm.alteredBankScoreData[i];
	    	var options = vm.getBankScoreOptions(data);
	    	if(data.total){
	    		$(this).highcharts(options);
	    	}
	    });
		},
		getSeries: function(){
			var series = [];
			var months = [];
			var curMonth = new Date().getMonth();
			if(curMonth > 1){
				months = [curMonth + 1, curMonth, curMonth - 1];
			}else if(curMonth > 0){
				months = [2, 1];
			}else{
				months = [1];
			}
			var h = template('performance-icons', {
				data: months,
			});
			$(".sub-branch-legends-left").html(h);
			var originSeries = [{
	            name: '9月份',
	            color: '#4d80cb',
	            data: [],
	            pointPadding: 0,
	            pointPlacement: 0,
	            groupPadding: 0.2,
	        }, {
	            name: '8月份',
	            color: '#83aef0',
	            data: [],
	            pointPadding: 0.15,
	            pointPlacement: 0
	        }, {
	            name: '7月份',
	            color: '#b7d1ff',
	            data: [],
	            pointPadding: 0.3,
	            pointPlacement: 0,
	        }];
			$.each(months, function(i, val) {
				var obj = originSeries.slice(0)[i];
				obj.name = val + '月份';
				series.push(obj);
			});
	        return series;
		},
		loadCustomersTable: function(){
			var columns = [
				{field: "customerName", caption: "客户", size: "21%", attr: "align=center", 
					render: function(record, index, column_index){
						var h = '';
						h += '<div class="customer-name" style="cursor:pointer"  data-id="'+record.recid+'" data-pid="'+record.accountPlanningId+'" title="'+record.customerName+'">'+record.customerName+'</div>'
						return h;
					}
				},
				{field: "importType", caption: "类型", size: "7%", attr: "align=center"},
				{field: "tradeName", caption: "行业", size: "11%", attr: "align=center"},
				{field: "inCome", caption: "净收入<br>(万元)", size: "9%", attr: "align=center"},
				{field: "loanAvg", caption: "日均贷款<br>(万元)", size: "9%", attr: "align=center"},
				{field: "depositAvg", caption: "日均存款<br>(万元)", size: "9%", attr: "align=center"},
				{field: "employeeName", caption: "客户经理", size: "9%", attr: "align=center"},
				{field: "planningStatus", caption: "规划状态", size: "9%", attr: "align=center"},
				{field: "trackCount", caption: "线索<br>个数", size: "7%", attr: "align=center"},
				{field: "finishedRate", caption: "落地<br>转化率(%)", size: "9%", attr: "align=center"},
			];
			
			if(!w2ui.subBranchCustomer){
				$(".sub-branch-grid--customer").w2grid({
					name: "subBranchCustomer",
					recordHeight: 44,
//					fixedBody: false,
					columns: columns,
					records: this.customersData,
					onDblClick: function(event){
						event.preventDefault();
					}
				});
			}else{
				w2ui['subBranchCustomer'].records = this.customersData;
				w2ui['subBranchCustomer'].refresh();
				$(".sub-branch-grid--customer").w2render('subBranchCustomer');
			}
			setTimeout(function(){
				$(window).resize();
			}, 20)
		},
		init: function(){
			this.bindEvent();
			this.setSearchBar();
			this.getTableData();
			this.getActionData();
		}
	}
	page.init();
});