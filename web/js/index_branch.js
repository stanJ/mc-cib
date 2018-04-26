define(function(require,exports,module){
	var page = {
		employeeId: utilObj.userLogined.employeeId,
		bindEvent: function(){
			var vm = this;
			$(document).on('mouseenter', '.table-inside-chart', function(){
				$(this).css({
					'position': 'relative',
					'z-index': '10',
				})
			});
			$(document).on('mouseleave', '.table-inside-chart', function(){
				var that = this;
				setTimeout(function(){
					$(that).css({
						'position': 'initial',
						'z-index': 'initial',
					})
				}, 0);
				
			});
			var date = new Date().format('yyyy年MM月dd日');
			$(".homepage-refresh-date").html('数据截止日期' + date);
			//点击展开/收起按钮
			$(document).on('click', '.w2ui-grid-data .cib-icon', function(){
				var id = $(this).data('id');
				var $tr = $(this).parents('tr').eq(0);
				var data = w2ui['subBranch'].get(id);
				if($(this).hasClass('cib-icon-expand')){
					$(this).removeClass('cib-icon-expand').addClass('cib-icon-collapse');
					vm.loadExpandedContent($tr, data);
					$(".sub-branch-legends-wrapper--branch").show();
				}else{
					var expanded = $(".branch-grid--sub-branch").find(".cib-icon-collapse");
					if(expanded.length <= 1){
						$(".sub-branch-legends-wrapper--branch").hide();
					}
					$tr.next('.expanded-content').hide();
					$(this).removeClass('cib-icon-collapse').addClass('cib-icon-expand');
				}
			});
			$(".sub-branch-table-performance").on('click', '.cib-icon', function(){
				var that = $(this).parents('tr.mck-table__row');
				var index = $(that).data('index');
				if($(that).hasClass('wrapped')){
					var data = vm.getOneFieldChartData(index);
					$(that).removeClass('wrapped').addClass('expanded');
					$(this).removeClass('cib-icon-expand').addClass('cib-icon-collapse');
					vm.loadExpandedContentNoGap($(that), data);
				}else if($(that).hasClass('expanded')){
					$(that).removeClass('expanded').addClass('wrapped');
					$(this).removeClass('cib-icon-collapse').addClass('cib-icon-expand');
					$(that).next('.expanded-content').hide();
				}
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
		    $(".branch-grid--customer").on('click', '.customer-name', function(){
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
		},
		loadChartOptions: function(){
			var vm = this;
			vm.options = {
		        chart: {
		            type: 'bar',
		            margin: [0, 0, 0, 0],
		            spacing: [0, 0, 0, 0],
		            plotBackgroundColor: '#f7f8fa',
		        },
		        exporting: {
		            enabled: false,
		        },
		        credits: {
		            enabled: false,
		        },
		        title: {
		            text: null
		        },
		        xAxis: {
		            categories: [],
		            visible: false,
		        },
		        yAxis: [{
		            title: {
		                enabled: false,
		            },
		            visible: true,
		            plotLines: [{
		                color: '#8c8c8c',
		                width: 2,
		                value: 0,
		                zIndex: 10,
		            }],
		            gridLineWidth: 0,
		            startOnTick: false,
		            minPadding: 0,
		            labels: {
		                enabled: false,  
		            },
		        }],
		        legend: {
		            shadow: false,
		            enabled: false,
		        },
		        tooltip: {
		            shared: true,
		            backgroundColor: '#fff',
		            hideDelay: 0,
		            formatter: function () {
		                var s = '';
		                $.each(this.points, function () {
		                    s += '<br/>' + this.series.name + ': ' +
		                        this.y;
		                });
		                return s;
		            },
		        },
		        plotOptions: {
		            bar: {
		            	
		            }
		        },
		        series: [],
		    };
		},
		loadExpandedContent: function($tr, data){
			if($tr.next().hasClass('expanded-content')){
				$tr.next().show();
				return;
			}
//			var width = $(".branch-grid--sub-branch table").width();
			var tr = template('chart-wrapper')();
			$tr.after(tr);
			var $table = $tr.next(".expanded-content").find('.mck-table');
//			$table.width(width);
			this.loadChartTable($table, data);
		},
		loadExpandedContentNoGap: function($tr, data){
			if($tr.next().hasClass('expanded-content')){
				$tr.next().show();
				return;
			}
			var width = $(".sub-branch-table-performance").width();
			var tr = template('chart-wrapper-no-gap')();
			$tr.after(tr);
			var $table = $tr.next(".expanded-content").find('.mck-table');
			$table.width(width);
			this.loadChartTableNoGap($table, data);
		},
		setSearchBar: function(){
			var optstr = "<option></option>";
			$(".search-input--sub-branch").html(optstr).select2({
				width:"100%",
				language: selet2LangZh,
				placeholder: "关键字:客户,集团,行业",
				allowClear: false,
				multiple: true,
				minimumInputLength: 1,
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
		getTableData: function(){
			this.getCustomersData();
			this.getSubBranchData();
		},
		transferPerformanceData: function(data){
			var ary = [];
			ary = this.addData({
				chart: 'loanDaily',
				title: '日均贷款新增',
				yearlyPlanning: 'loan',
				data: data,
			}, ary);
			ary = this.addData({
				chart: 'depositDaily',
				title: '日均存款新增',
				yearlyPlanning: 'deposit',
				data: data,
			}, ary);
			ary = this.addData({
				chart: 'valid',
				title: '新增有效客户数',
				yearlyPlanning: 'activeAccount',
				data: data,
			}, ary);
			ary = this.addData({
				chart: 'strategic',
				title: '战略客户新增',
				yearlyPlanning: 'strategicAccount',
				data: data,
			}, ary);
			ary = this.addData({
				chart: 'netIncome',
				title: '存量客户净收入提升',
				yearlyPlanning: 'netIncome',
				data: data,
			}, ary);
			ary = this.addData({
				chart: 'amountBiz',
				title: '交易银行新增实施量',
				yearlyPlanning: 'tradingBankProducts',
				data: data,
			}, ary);
			ary = this.addData({
				chart: 'amountInv',
				title: '投资银行新增实施量',
				yearlyPlanning: 'investmentBankProducts',
				data: data,
			}, ary);
			return ary;
		},
		addData: function(params, ary){
			var obj = {
				chart: params.data.result[params.chart].slice(0, 3),
				title: params.title,
				yearlyPlanning: params.data.yearlyPlanning?params.data.yearlyPlanning[params.yearlyPlanning]:0,
				finishedDegree: params.data.result[params.chart][3],
				light: params.data.result[params.chart][4],
			};
			ary.push(obj);
			return ary;
		},
		getSubBranchData: function(){
			var vm = this;
			utilObj.ajax({
				url: 'm/board/findBank',
				data: {
					employeeId: page.employeeId,
					evaDate: '',
				},
				success: function(data){
					vm.months = utilObj.getMonths(data.map.month);
					vm.originPerformanceData = data.object;
					vm.performanceData = vm.transferPerformanceData(data.object);
					vm.loadPerformanceTable();
					
					var res = utilObj.alterToObj(data.object);
					res = utilObj.alterToAry(res.subScoreList);
					var ary = utilObj.addRecid(res);
					vm.subBranchData = ary.slice(0);
					vm.getAllBankChartData();
					vm.loadSubBranchTable();
				}
			})
		},
		getAllBankChartData: function(){
			var vm = this;
			var ary = [];
			$.each(this.subBranchData, function(i, val){
				var obj = {
					bankName: val.bankName,
				}
				obj.data = vm.transferPerformanceData(val);
				ary.push(obj);
			});
			this.allBankChartData = ary;
		},
		getOneFieldChartData: function(index){
			var ary = [];
			$.each(this.allBankChartData, function(i, val){
				var obj = val.data[index];
				obj.bankName = val.bankName;
				ary.push(obj);
			});
			return ary;
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
		loadChartTable: function($el, data){
			var vm = this;
			var performanceData = vm.transferPerformanceData(data);
			var h = template('chart-table', {
				data: {
					performanceData: performanceData,
				},
			});
			$el.html(h);
			$(window).resize();
			var $insides = $el.find(".table-inside-chart");
			this.loadAllChart($insides, performanceData);
		},
		loadChartTableNoGap: function($el, data){
			var vm = this;
			var performanceData = data;
			var h = template('chart-table-no-gap', {
				data: {
					performanceData: performanceData,
				},
			});
			$el.html(h);
			var $insides = $el.find(".table-inside-chart");
			this.loadAllChartNoGap($insides, performanceData);
		},
		loadPerformanceTable: function(){
			var h = template('performance', {
				data: {
					performanceData: this.performanceData,
					lastYear: new Date().getFullYear() - 1,
					roleId: utilObj.userLogined.roleId,
				},
			});
			$(".sub-branch-table-performance").html(h);
			this.loadPerformanceChart();
		},
		loadAllChart: function($insides, performanceData){
			var vm = this;
			var $iconWrapper = $(".sub-branch-legends-wrapper--branch").find(".sub-branch-legends-left");
		    var originSeries = this.getSeries($iconWrapper);
	        $insides.each(function(j){
	        	var data = performanceData[j].chart;
	        	var options = $.extend(true, {}, vm.options);
	        	options.chart.plotBackgroundColor = '#eaebed';
	        	var series = originSeries.slice(0);
	        	var length = data.length;
	        	series = $.map(series, function(val, i){
	        		val.data = [data[i],];
	        		return val;
	        	});
	        	options.series = series;
	        	$(this).highcharts(options);
	        })
		},
		loadAllChartNoGap: function($insides, performanceData){
			var vm = this;
		    var originSeries = vm.series;
	        $insides.each(function(j){
	        	var data = performanceData[j].chart;
	        	var options = $.extend(true, {}, vm.options);
	        	options.chart.plotBackgroundColor = '#eaebed';
	        	var series = originSeries.slice(0);
	        	var length = data.length;
	        	series = $.map(series, function(val, i){
	        		val.data = [data[i],];
	        		return val;
	        	});
	        	options.series = series;
	        	$(this).highcharts(options);
	        })
		},
		loadPerformanceChart: function(){
			var vm = this;
		    vm.series = this.getSeries();
	        $(".table-inside-chart").each(function(j){
	        	var data = vm.performanceData[j].chart;
	        	var options = $.extend(true, {}, vm.options);
	        	var series = vm.series.slice(0);
	        	var length = data.length;
	        	series = $.map(series, function(val, i){
	        		val.data = [data[i],];
	        		return val;
	        	});
	        	options.series = series;
	        	$(this).highcharts(options);
	        })
		},
		getSeries: function($el){
			var series = [];
			var months = this.months.slice(0);
			var h = template('performance-icons', {
				data: months,
			});
			if($el){
				$el.html(h);
			}else{
				$(".sub-branch-legends-left").html(h);
			}
			var originSeries = [
			{
	            name: '7月份',
	            color: '#b7d1ff',
	            data: [],
	        },{
	            name: '8月份',
	            color: '#83aef0',
	            data: [],
	        },{
	            name: '9月份',
	            color: '#4d80cb',
	            data: [],
	        }, ];
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
				{field: "importType", caption: "类型", size: "10%", attr: "align=center"},
				{field: "tradeName", caption: "行业", size: "13%", attr: "align=center"},
				{field: "inCome", caption: "净收入<br>(万元)", size: "10%", attr: "align=center"},
				{field: "loanAvg", caption: "日均贷款<br>(万元)", size: "10%", attr: "align=center"},
				{field: "depositAvg", caption: "日均存款<br>(万元)", size: "10%", attr: "align=center"},
				{field: "planningStatus", caption: "规划状态", size: "10%", attr: "align=center"},
				{field: "trackCount", caption: "线索个数", size: "6%", attr: "align=center"},
				{field: "finishedRate", caption: "落地<br>转化率(%)", size: "10%", attr: "align=center"},
			];
			
			if(!w2ui.branchCustomer){
				$(".branch-grid--customer").w2grid({
					name: "branchCustomer",
					recordHeight: 44,
//					fixedBody: false,
					columns: columns,
					records: this.customersData,
					onDblClick: function(event){
						event.preventDefault();
					}
				});
			}else{
				w2ui['branchCustomer'].records = this.customersData;
				w2ui['branchCustomer'].refresh();
				$(".branch-grid--customer").w2render('branchCustomer');
			}
			setTimeout(function(){
				$(window).resize();
			}, 20)
		},
		loadSubBranchTable: function(){
			var columns = [
				{field: "bankName", caption: "支行", size: "40%", attr: "align=center", style: 'position: relative;',
					render: function(record, index, column_index){
						var h = '';
						h += '<div class="cib-icon cib-icon-expand" data-id="'+record.recid+'"></div>';
						h += '<div title="'+record.bankName+'">'+record.bankName+'</div>';
						return h;
					}
				},
				{field: "no", caption: "排名", size: "20%", attr: "align=center",},
				{field: "score", caption: "综合得分", size: "20%", attr: "align=center",},
			];
			
			if(!w2ui.subBranch){
				$(".branch-grid--sub-branch").w2grid({
					name: "subBranch",
					recordHeight: 44,
//					fixedBody: false,
					columns: columns,
					records: this.subBranchData,
					onDblClick: function(event){
						event.preventDefault();
					}
				});
			}else{
				w2ui['subBranch'].records = this.subBranchData;
				w2ui['subBranch'].refresh();
				$(".branch-grid--sub-branch").w2render('subBranch');
			}
			setTimeout(function(){
				$(window).resize();
			}, 20)
		},
		init: function(){
			this.bindEvent();
			this.loadChartOptions();
			this.setSearchBar();
			this.getTableData();
		}
	}
	page.init();
});