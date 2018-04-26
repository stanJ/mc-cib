define(function(require,exports,module){
	var page = {};

	//tab选项
	var filter_data = [
		{
			name: "客户",
			value: "CUSTOMER_INFO"
		},
		{
			name: "产品",
			value: "PRODUCT"
		},
		{
			name: "客户类型",
			value: "CUSTOMER_TYPE"
		},
		{
			name: "客户分层",
			value: "CUSTOMER_CLASS"
		},
		{
			name: "战略客户",
			value: "IS_STRATEGIC"
		}
	];

	page.steps = ["step1","step2","step3","step4","step5","step6","step7","step8","step9"];

	//获取查询参数
	page.getParams = function(){
		var params = {
			//employeeId: utilObj.userLogined.employeeId
		};

		//分行
		if($("#subsidiary").val() != null && $.trim($("#subsidiary").val()).length > 0){ 
			 params.bankBranchId = $("#subsidiary").val();
		}

		//支行
		if($("#branch").val() != null && $.trim($("#branch").val()).length > 0 && $("#branch").val() != "支行[All]"){
			params.bankId= $("#branch").val();
		}

		//客户经理
		if($("#manager").val() != null && $.trim($("#manager").val()).length > 0 && $("#manager").val() != "客户经理[All]"){//客户经理优先
			params.employeeId = $("#manager").val();
		} else {
			params.employeeId = utilObj.userLogined.employeeId;
		}

		params.bankBranchId = $("#subsidiary").val();


		return params;
	};

	//表格
	page.bindGrid = function(){
		$('.right-tab-inner div:eq(0)').click();

		$('#bankList').show().attr('data-load','false');
		$('#pieList').html('').hide().attr('data-load','false');

		var dfd = $.Deferred();
		//console.log(page.getParams())
		utilObj.ajax({
			url: "m/sale/findLandingAndTarget",
			data: page.getParams(),
			success: function(data){
				
				//if(data && data.object.list.length > 0){
				if(data && data.code == 1){
					var _data  = data.object;
					//setTitle
					$('#near_date').html(_data.near3month.startDate + ' ~ ' + _data.near3month.endDate);					
				
					page.graphCategories = [];
					page.graphCategories.push(_data.near3month.startDate + ' ~ ' + _data.near3month.endDate);
					page.graphCategories.push(_data.far3month.startDate + ' ~ ' + _data.far3month.endDate);
					
					//topBar
					page.topBar = [];
					page.topBar.landing = [];
					page.topBar.landing.push(_data.near3month.landingRate);
					page.topBar.landing.push(_data.far3month.landingRate);

					page.topBar.stop = [];
					page.topBar.stop.push(_data.near3month.stopRate);
					page.topBar.stop.push(_data.far3month.stopRate);

					//centerBar
					page.centerBar = [];
					page.centerBar.near = [];
					page.centerBar.near.push(_data.near3month.landingCount);
					page.centerBar.near.push(_data.far3month.landingCount);

					page.centerBar.far = [];
					page.centerBar.far.push(_data.near3month.stopCount);
					page.centerBar.far.push(_data.far3month.stopCount);
					
					

					//bottomBar
					page.bottomBar = [];
					page.bottomBar.near = [];
					page.bottomBar.near.push(_data.near3month.landingTime);
					page.bottomBar.near.push(_data.far3month.landingTime);

					page.bottomBar.far = [];
					page.bottomBar.far.push(_data.near3month.stopTime);
					page.bottomBar.far.push(_data.far3month.stopTime);
					

					page.setTopPie(_data.near3month);
					page.setTopBar();
					page.setGrid(_data.list);

					//
					$('#bankList').attr('data-load','true')
				} else {
					w2alert("当前没有数据");
				}
				
				dfd.resolve(data);
			},
			error: function(e){
				w2alert(e.message);
				dfd.resolve(e);
			}
		});
		


		return dfd.promise();
	};
	
	//图表list
	page.bindPieDate = function(){
		var dfd = $.Deferred();
		//console.log(page.getParams())
		utilObj.ajax({
			url: "m/sale/findLandingAndTargetDetail",
			data: page.getParams(),
			success: function(data){
				if(data && data.object.list.length > 0){					
					var _data  = data.object.list;
					
					var _html = '';
					for(var i = 0;i<_data.length;i++){
						_html += "<div class='pie-items'>";
						_html += "	<div class='title'><span>" + _data[i].best + "</span></div>";
						_html += "	<div class='sub-title'>" + _data[i].name + "</div>";
						_html += "	<div class='item-content' id='item_content_" + i + "'>";
							
						_html += "	</div>";
						_html += "</div>";
					}
					
					$('#pieList').append(_html);
					//添加参数
					$(_data).each(function(i){
						var _domID = 'item_content_' + i
						page.setPieList(_domID,_data[i]);
					})
					
					$('#pieList').attr('data-load','true')
				} else {
					w2alert("当前没有数据");
				}
				
				dfd.resolve(data);
			},
			error: function(e){
				w2alert(e.message);
				dfd.resolve(e);
			}
		});

		return dfd.promise();
	}




	//最大的pie
	page.setTopPie = function(value){
		//pie
		 $('#graph_left_wrap').highcharts({
			colors:['#4776c7','#f49d14'],
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				spacing : [50, 0 , 40, 0]
			},
			exporting:{
				enabled: false
			},
			title: {
				floating:true,
				text: '转化率<br>' + value.landingRate + '%',			
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				itemMarginTop: 20,
				itemMarginBottom: 20,
				x: -45,
				squareSymbol: true,
				symbolRadius: 0
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: false,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						distance:-25,
						format: '{y}',
						style: {
							fontWeight: 'bold',
							color: 'white',
							textOutline:''
						}
					},
					showInLegend: true
				}
			},
			series: [{
				type: 'pie',
				innerSize: '70%',
				name: 'bg',
				data: [
					['',100]
				],
				dataLabels: {
					enabled: false,					
				},
				showInLegend: false,
				colors: ['rgba(0,0,0,0.1)'],
			
			},{
				type: 'pie',
				innerSize: '70%',
				name: '业务量',
				data: [
					['落地线索',    value.landingCount],
					['终止线索',   value.stopCount]
				]
			}]
		}, function(c) {
			// 环形图圆心
			var centerY = c.series[0].center[1],centerX = c.series[0].center[0],
				titleHeight = parseInt(c.title.styles.fontSize);
			
			c.setTitle({
				y:centerY + titleHeight/2,
				x:-75
				//x:-((centerX - 75)/4)
			});
			chart = c;
		});

	}

	page.setTopBar = function(){
		//转化率
		 $('#graph_right_top').highcharts({
			colors:['#f49d14','#4776c7'],
			chart: {
				type: 'bar',
				floating:true,
			},
			title: {
				text: '转换率 （%）',
				align:"left",
				x: 0,
				y: 30
			},
			xAxis: {
				categories: page.graphCategories,
				tickWidth: 0
			},
			yAxis: {
				visible:false,
				min: 0,
				title: {
					text: ''
				}
			},
			tooltip: {
				valueSuffix: '%',
				
			},
			legend: {
				enabled:false,
			},
			exporting:{
				enabled: false
			},
			credits:{
				enabled: true
			} ,
			plotOptions: {
				bar: {
					dataLabels: {
						enabled: true,
						style: {
							fontWeight: 'bold',
							color: 'white',
							textOutline:''
						}
					}
				},
				series: {
					stacking: 'normal'
				}
			},
			series: [
				 {
					//转化率
					name: '终止线索',
					data: page.topBar.stop
					//data: [30,30]
				},{
					//落地线索
					name: '落地线索',
					data: page.topBar.landing
					//data: [70,70]
				}]
		});

		//线索条数 
		 $('#graph_right_center').highcharts({
			colors:['#4776c7','#f49d14'],
			chart: {
				type: 'bar'
			},
			title: {
				text: '线索条数 （条）',
				align:"left",				
				x: 0,
				y: 30
			},
			xAxis: {
				categories: page.graphCategories,
				title: {
					text: null
				},
				tickWidth: 0
			},
			yAxis: {
				min: 0,
				visible:false,
			},
			tooltip: {
				valueSuffix: ' 条'
			},
			plotOptions: {
				series: {
					pointWidth: 15
				},
				bar: {
					dataLabels: {
						enabled: true,
						allowOverlap: true,
						style: {
							fontWeight: 'bold',
							color: '#000',
							textOutline:''
						}
					}
				}
			},
			legend: {
				enabled:false,
			},
			exporting:{
				enabled: false
			},
			credits:{
				enabled: true
			} ,
			series: [{
				name: '线索完成数',
				data: page.centerBar.near				
			}, {
				name: '线索终止数',
				data: page.centerBar.far
				
			}]
		});


		//平均时长 
		 $('#graph_right_bottom').highcharts({
			colors:['#4776c7','#f49d14'],
			chart: {
				type: 'bar'
			},
			title: {
				text: '平均时长 （天）',
				align:"left",
				x: 0,
				y: 30
			},
			xAxis: {
				categories: page.graphCategories,
				title: {
					text: null
				},
				tickWidth: 0
			},
			yAxis: {
				min: 0,
				visible:false,
			},
			tooltip: {
				valueSuffix: '天',
				borderWidth: 1,
			},
			plotOptions: {
				series: {
					pointWidth: 15
				},
				bar: {
					dataLabels: {
						enabled: true,
						allowOverlap: true,
						style: {
							fontWeight: 'bold',
							color: '#000',
							textOutline:''
						}
					}
				}
			},
			legend: {
				enabled:false,
			},
			exporting:{
				enabled: false
			},
			credits:{
				enabled: true
			} ,
			series: [{			
				name: '平均落地时长',
				data: page.bottomBar.near
			}, {			
				name: '平均终止时长',
				data: page.bottomBar.far 
			}]
		});
	}
	
	page.setGrid = function(data){
		var _dataArr = [];
		if(data.length > 0){			
			for(var i=0;i<data.length;i++){
				var _d = data[i];
				_dataArr.push({ 
					recid: eval(i+1), 
					bname:_d.name, 
					landingRate: _d.landingRate, 
					landingCount: _d.landingCount, 
					landingTime: _d.landingTime, 
					stopCount: _d.stopCount, 
					stopTime: _d.stopTime })
			}			
		}
		$("#bankList").w2grid({
			name: 'bankList',
			total: 10,
			limit: 200,
			recordHeight: 45,
			selectType: "row",
			show: {recordTitles: false},
			columns:[
				{ field: 'bname', caption: '支行名称', size: '25%', resizable: true, sortable: true, style: 'text-align: center' },
				{ field: 'landingRate', caption: '转化率（%）', size: '15%', resizable: true, sortable: true, style: 'text-align: center' },
				{ field: 'landingCount', caption: '线索完成数（条）', size: '15%', resizable: true, sortable: true, style: 'text-align: center' },
				{ field: 'landingTime', caption: '平均落地时长（天）', size: '15%', resizable: true, sortable: true, style: 'text-align: center' },
				{ field: 'stopCount', caption: '线索终止数（条）', size: '15%', resizable: true, sortable: true, style: 'text-align: center' },
				{ field: 'stopTime', caption: '平均终止时长（天）', size: '15', resizable: true, sortable: true, style: 'text-align: center' }
			],
			records: _dataArr			
		});
		
		//阻止默认双击
		w2ui.bankList.on('dblClick', function(event) {
			event.preventDefault();
		});
	
	}

	page.setPieList = function(domID,data){
		//pie
		 $('#' + domID).highcharts({
			colors:['#4776c7','#f49d14'],
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false,
				spacing : [10, 0 , 10, 0]
			},
			exporting:{
				enabled: false
			},
			title: {
				floating:true,
				text: '转化率<br>' + data.landingRate + '%',	
				y:105,
				x:-90,
				
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				itemMarginTop: 20,
				itemMarginBottom: 20,
				x: -45,
				squareSymbol: true,
				symbolRadius: 0,
				labelFormatter: function () {
					if(this.index == 0){
						return '线索落地数:' + data.landingCount + '条<br>平均落地时长:' + data.landingTime + '天';
					}else if(this.index == 1){
						return '线索终止数:' + data.stopCount + '条<br>平均终止时长:' + data.stopTime + '天';
					}
				}
			},
			tooltip: {
				//pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: false,
					cursor: 'pointer',
					dataLabels: {
						enabled: false,
					},
					showInLegend: true
				}
			},
			series: [{
				type: 'pie',
				innerSize: '70%',
				name: 'bg',
				data: [
					['',100]
				],
				dataLabels: {
					enabled: false,					
				},
				showInLegend: false,
				colors: ['rgba(0,0,0,0.1)'],
			
			},{
				type: 'pie',
				innerSize: '70%',
				name: '业务量',
				data: [
					['落地线索',    data.landingCount],
					['终止线索',   data.stopCount]
				]
			}]
		});

	}



/********************************************************************/

	//$("#myGrid").height($("#right-main-content").height() - 50);
	commonObj.bindEvent_NavAndSearch();
	
	//获取数据
	utilObj.showLoading($("#wrap"),"加载中");
	
	$.when(page.bindGrid()).done(function(){
		utilObj.hideLoading($("#wrap"));
	});			


	//下拉事件
    //分行下拉选中
    $("#subsidiary").on("select2:select", function(e) {
        var data = e.params.data;
        var sel_data = {
            parentId: data.id,
            employeeId: utilObj.userLogined.employeeId
        };

        $.when(commonObj.getBankSelect($("#branch"), sel_data, "支行[All]")).done(function(){
        	$.when(commonObj.getCustomerManager($("#manager"), sel_data, "客户经理[All]")).done(function(){
	        	utilObj.showLoading($("#wrap"),"加载中");
		        $.when(page.bindGrid()).done(function(){
		            utilObj.hideLoading($("#wrap"));
		        });
	        });
        });
        
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
        var data = e.params.data;
        var sel_data = {
            bankBranchId: $("#subsidiary").val(),
            bankSubsetId: data.id
        };
        $.when(commonObj.getCustomerManager($("#manager"), sel_data, "客户经理[All]")).done(function(){
        	utilObj.showLoading($("#wrap"),"加载中");
	        $.when(page.bindGrid()).done(function(){
	            utilObj.hideLoading($("#wrap"));
	        });
        });
    });

    //客户经理下拉
    $("#manager").on("select2:select", function(e){
        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            utilObj.hideLoading($("#wrap"));
        });
    });
	

	//点击filter
	$(document).on("click",".tab-filter-item",function(){
		if($(this).hasClass("tab-filter-selected")){
			return false;
		} else {
		
			$(this).addClass("tab-filter-selected").siblings(".tab-filter-item").removeClass("tab-filter-selected");
		}
		
		utilObj.showLoading($("#wrap"),"加载中");
		$.when(page.bindGrid()).done(function(){
			//utilObj.hideLoading($("#wrap"));
		});
	});

	//右边filter
	//$(".selected-tab").text($(".right-tab-inner > .selected-filter").text());

	//是否成功率加权
	$(document).on("click", ".right-tab-inner > div", function(){
		
		if($(this).hasClass("selected-filter")){
			return false;
		} else {
			$(".selected-tab").text($(this).text());
			$(this).siblings("div").removeClass("selected-filter").end().addClass("selected-filter");
			if($(this).index() == 1){
				$(".selected-tab").css({"left": ($(this).siblings("div").width()+5)+"px"});
			} else {
				$(".selected-tab").css({"left": "5px"});
			}
			
			var _dataType = $(this).attr('data-type');
			
			if(_dataType == 'bankList'){	
				$('#bankList').show();
				$('#pieList').hide();
				if($('#bankList').attr('data-load') == 'false'){
					$.when(page.bindGrid()).done(function(){
						utilObj.hideLoading($("#wrap"));
					});
				}
			
			}else if(_dataType == 'pieList'){
				$('#bankList').hide();
				$('#pieList').show();
				if($('#pieList').attr('data-load') == 'false'){										
					$.when(page.bindPieDate()).done(function(){
						utilObj.hideLoading($("#wrap"));
					});
				}
			}
			
		}
	});

	//点击某列
	$(document).on("click", ".cloumn-wrap" ,function(){
		if($(this).hasClass("total-wrap")){
			return false;
		} else {
			utilObj.gotoPageUri("dashboard.html?stepFilter="+$(this).attr("data-config-val"));
		}
	});

	//设置图形
	//setGraph();

});







