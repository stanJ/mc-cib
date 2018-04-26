define(function(require,exports,module){
	require('myjs/common/variable-pie.js');
	var page = {};
	page.employeeId = utilObj.userLogined.employeeId;
	//获取查询参数
	page.getParams = function(obj){
		var params = {};
		params.bankBranchCode = $("#subsidiary").val();
		params.bankSubsetCode = $("#branch").val();
		//日期
		params.year = $("#estimate").val();
		params.employeeId = this.employeeId;
		if(obj){
			params = $.extend(params, obj);
		}
		return params;
	};
	
	page.getTableData = function(obj){
		var vm = this;
		utilObj.ajax({
			url: 'm/noLoanAccount/findNoLoanAccount',
			data: vm.getParams(obj),
			success: function(data){
				var ary = utilObj.addRecid(data.object.noLoanAccountDetailList);
				vm.noLoanData = ary;
				vm.originData = data.object;
				vm.loadTable();
				vm.loadChart();
			}
		})
	};
	//chart
	page.loadChart = function(){
		var originData = this.originData;
	    $('.no-loan-overview-chart').highcharts({
	        chart: {
	            plotBackgroundColor: null,
	            plotBorderWidth: null,
	            plotShadow: false,
	        },
	        colors: ['#de4c39', '#f49d14'],
	        title: {
	            text: '无贷户总数:'+originData.totalAccount+'户'
	        },
	        tooltip: {
	            headerFormat: '',
	            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
	        },
	        plotOptions: {
	            variablepie: {
	                allowPointSelect: true,
	                cursor: 'pointer',
	                dataLabels: {
	                    enabled: true,
	                    format: '{point.y}户<br>{point.name}',
	                    style: {
	                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
	                        fontSize: '14px',
	                    },
	                    distance: 40,
	                }
	            },
	            series: {
			        states: {
			            hover: {
			                enabled: false
			            }
			        },
			        point: {
			            events: {
//			                mouseOver: function () {
//			                    this.options.oldColor = this.color;
//			                    this.graphic.attr("fill", "black");
//			                },
//			                mouseOut: function () {
//			                    this.graphic.attr("fill", this.options.oldColor);
//			                }
			            }
			        },
			    }
	        },
	        series: [{
	            type: 'variablepie',
	            minPointSize: 10,
        		innerSize: '0%',
        		zMin: 0,
	            name: '',
	            data: [
	                {
	                    name: '有效户',
	                    y: originData.validAccount,
	                    z: 275,
	                },
	                {
	                	name: '无效户',
	                    y: originData.invalidAccount,
	                    sliced: true,
	                    selected: true,
	                    z: 200,
	                }
	            ],
	            events: {
	            	click: function(e){
	            		e.preventDefault();
	            	},
	            	mouseOver: function(e){
	            		e.preventDefault();
	            	},
	            }
	        }]
	    });
	}
	
	page.loadTable = function(){
		var columns = [
			{field: "group", caption: "层级", size: "10%", attr: "align=center"},
			{field: "depositStage", caption: "平均日均<br>存款(万)", size: "16%", attr: "align=center"},
			{field: "account", caption: "客户数(个)", size: "8%", attr: "align=center"},
			{field: "dailyAverageDeposit", caption: "日均存款<br>占比(%)", size: "8%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += record.dailyAverageDeposit + '%';
					return h;
				}
			},
			{field: "economicProfit", caption: "经济利润<br>占比(%)", size: "8%", attr: "align=center",
				render: function(record, index, column_index){
					var h = '';
					h += record.economicProfit + '%';
					return h;
				}
			},
			{field: "ftp", caption: "户均FTP(万)", size: "10%", attr: "align=center"},
		];
		
		if(!w2ui.noLoanOverview){
			$(".no-loan-overview-table").w2grid({
				name: "noLoanOverview",
				recordHeight: 100,
				fixedBody: false,
				columns: columns,
				records: this.noLoanData,
				onDblClick: function(event){
					event.preventDefault();
				},
				onClick: function(event){
					var card = w2ui['noLoanOverview'].get(event.recid).group;
					if(card == '普卡'){
						card = '普通卡';
					}
					utilObj.navigate('no_loan_list', {
						card: card,
						subsidiary: $("#subsidiary").val(),
						branch: $("#branch").val(),
						year: $("#estimate").val(),
					});
				},
			});
		}else{
			w2ui['noLoanOverview'].records = this.noLoanData;
			w2ui['noLoanOverview'].refresh();
			$(".no-loan-overview-table").w2render('noLoanOverview');
		}
	}
/********************************************************************/

	commonObj.bindQueryEvent();
	var date = new Date().format('yyyy年MM月dd日');
	$(".homepage-refresh-date").html('数据截止日期' + date);
	
	//获取数据
	$.when(commonObj.loadYearSelect()).done(function(){
		page.getTableData();
	});

	//下拉事件
    //分行下拉选中
    $("#subsidiary").on("select2:select", function(e) {
        var data = e.params.data;
        if(data.id != ""){
            var sel_data = {
                parentId: data.id,
                employeeId: utilObj.userLogined.employeeId
            };
            commonObj.loadBankSelect($("#branch"), sel_data, "支行[All]");
        } else {
            $("#branch").select2("destroy");
            $("#branch").html("<option>支行[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });
        }

        page.getTableData({
        	bankSubsetCode: '',
        });
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
        page.getTableData();
    });
    
	//日期下拉
    $("#estimate").on("select2:select", function(e){
    	page.getTableData();
    });
});