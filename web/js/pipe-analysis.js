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
//			employeeId: utilObj.userLogined.employeeId
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

		//首列字段
		params.type = $(".tab-filter-selected").attr("data-val");

		//成功率加权
		params.wsRate = $(".selected-filter").hasClass("unsuccess") ? 0 : 1;

		return params;
	};

	//筛选条件
	page.getFilter = function(){
		var filter_str = "";
		_.each(filter_data, function(v,i){
			filter_str += "<li class='tab-filter-item' data-val='" + v.value + "'>" + v.name + "<div class='move-mark bg-base-blue'></div></li>";
		});

		$("#line-filter").append(filter_str);
		$(".tab-filter-item").eq(0).addClass("tab-filter-selected");
	};

	//标题
	page.setTableTitle = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/sysConfig/findList",
			data: {type: "CUSTOMER_STAGE"},
			success: function(data){
				if(data && data.object.length > 0){
					page.columnsLength = data.object.length;
					
					page.categoriesArr = [];
				
					page.columns = [{field: "fType", caption: "", size: "10%", attr: "align=center",style: "word-wrap: word-break; word-break: break-all; width: 178px;"}];
					page.configVal = [];
					$.each(data.object, function(i,v){
						page.columns.push({
							field: page.steps[i],
							caption: v.configName,
							size: "9%",
							attr: "align=center"
						});
						page.configVal.push(v.configValue);
						//push
						page.categoriesArr.push(v.configName);
					});
					page.columns.push({field: "total", caption: "合计", size: "9%", attr: "align=center"});
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

	//表格
	page.bindGrid = function(){
		
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/sale/findChannel",
			data: page.getParams(),
			success: function(data){
				if(data && data.object.length > 0){
					page.recordsLength = data.object.length;
					page.records = [];

					page.amount = [];
					page.count = [];

					$.each(data.object, function(i,v){
						page.setRecordItem(v,i);
					});


					page.gridName = 'Pipe';
					if(w2ui[page.gridName]){
						w2ui.Pipe.clear();
						w2ui.Pipe.records = page.records;
						w2ui.Pipe.refresh();
					} else {
						
						$("#myGrid").w2grid({
							name: page.gridName,
							total: 10,
							limit: 200,
							recordHeight: 160,
							selectType: "row",
							show: {recordTitles: false},
							columns: page.columns,
							records: page.records,
							onRender: function(event){
								event.onComplete = function(){
									setTimeout(function(){
										$.each($(".clomun-text"),function(i,v){
											$(v).css("margin-left","-"+($(v).width()/2)+"px");
										});
										utilObj.hideLoading($("#wrap"))
										
										page.resetGridHTML();
									
									},0);

								}
							},
							onRefresh: function(event){
								event.onComplete = function(){
									setTimeout(function(){
										$.each($(".clomun-text"),function(i,v){
											$(v).css("margin-left","-"+($(v).width()/2)+"px");
										});
										utilObj.hideLoading($("#wrap"))
										

										page.resetGridHTML();
										
									},0);
								}
							}
						});

						//阻止默认双击
						w2ui.Pipe.on('dblClick', function(event) {
						    event.preventDefault();
						});
					}

				}

				dfd.resolve(data);
			}
		});

		return dfd.promise();
	};

	//第一行数据
	page.setRecordItem = function(data,index){
		var amount = _.map(data.amount.split(","), function(a){return a*1;});
		var count = _.map(data.count.split(","), function(a){return $.trim(a).length > 0 ? parseFloat(a) : 0;});

		page.amount.push(amount);
		page.count.push(count);
		var max_money = _.max(amount);
		var max_amount = _.max(count);
		var total_money = parseInt(_.reduce(amount, function(memo,num){return memo + parseFloat(num)},0));
		var total_amount = _.reduce(count, function(memo,num){return memo + parseInt(num);},0);
		//var money_class = "total_money " + (index == 0 ? "first_total_money" : "");
		//var amount_class = "total_amount " + (index == 0 ? "first_total_amount" : "");

		var money_class = "total_money_graph ";
		var amount_class = "total_amount_graph ";

		var base_height = 120;
		var records_obj = {
			recid: index+1,
			fType: (index == 0 ? "<span class='columns-title'>合计</span>" : "<span class='columns-title'>" + data.headName + "</span>"),
			total: [
				"<div>",
				"	<span class='"+money_class+"'><div class='graph'></div>" + total_money + "万元</span>",
				"	<span class='"+amount_class+"'><div class='graph'><div class='circle'></div></div>" + total_amount + "个线索</span>",
				"</div>"
			].join("")
		};

			/*
		
		_.map(amount, function(v,i){
			var money_height = parseFloat(v == null ? 0 : (v == "" ? 0 : v))/max_money*base_height;
			var amount_height = parseFloat(count[i] == null ? 0 : (count[i] == "" ? 0 : count[i]))/max_amount*base_height;
			var wrap_class="cloumn-wrap" + (index == 0 ? " total-wrap" : "");
			records_obj[page.steps[i]] = [
				"<div class='" + wrap_class + "' data-config-val='" + page.configVal[i] + "'>",
				"	<div class='abs-clomun money-clomun' style='height:"+money_height+"px;'>",
				"		<div class='inner-wrap'>",
				"			<span class='clomun-text'>" + parseFloat(v) + "</span>",
				"		</div>",
				"	</div>",
				"	<div class='abs-clomun amount-clomun' style='height:"+amount_height+"px;'>",
				"		<div class='inner-wrap'>",
				"			<span class='clomun-text'>" + parseFloat(count[i] == null ? 0 : (count[i] == "" ? 0 : count[i])) + "</span>",
				"		</div>",
				"	</div>",
				"</div>"
			].join("");
		});
		*/
		page.records.push(records_obj);
	};
	

	//重设HTML结构
	page.resetGridHTML = function(){
		

		$('#grid_' + page.gridName + '_records tr[index]').each(function(i){
			var _id = '';

			var _maxLength = $(this).find('.w2ui-grid-data').length;
			
			$(this).find('.w2ui-grid-data').each(function(index){
				//从第二列开始
				if(index == 1){
					_id = $(this).attr('id') + '_graph_box';
					var _height = $(this).height();
					$(this).attr('colspan',page.columnsLength).find('div').attr('id',_id).height(_height).width('100%').html('');					
				}else if(index != 0 && index <= (_maxLength-2)  ){
					$(this).remove();
				}
			})

			//生成图形
		
			page.setGraph(_id,i)
		})
	}

	//生成图形
	page.setGraph = function(dom,index){
		if(index < page.recordsLength){
		$('#' + dom).highcharts({
		//Highcharts.chart(dom,{
			chart: {
				backgroundColor: 'rgba(0,0,0,0)',
			},
			title: {
				text: ''
			},
			xAxis: {
				categories: page.categoriesArr,
				visible:false
			},
			yAxis:[{
				visible:false,
				stackLabels: {
					enabled: true,
					style: {
						fontWeight: 'bold',
						color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
					}
				},
				gridLineWidth: 0,
				minorTickWidth: 0,
				title: {
					text: ''                
				}
			},{
				visible:false,
				stackLabels: {
					enabled: true,
					style: {
						fontWeight: 'bold',
						color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
					}
				},
				gridLineWidth: 0,
				minorTickWidth: 0,
				title: {
					text: ''                
				}
			}],
			credits: {
				enabled: false
			},
			legend:{
				enabled:false,
			},
			tooltip: {
				borderColor:'rgba(0,0,0,0)',
				formatter: function () {
					var _unit = '';
					if(this.series.name == '数量'){
						_unit = '个'
					}else if(this.series.name == '金额'){
						_unit = '万元'
					}
					return  this.x + " : " + this.y + ' ' + _unit;
				}
			},
			plotOptions: {
				series: {
					cursor: 'pointer',
					point: {
						events: {
							click: function () {
								var steps = ["INITIAL","INTENTION","SCHEME","AUDIT","APPROVE","CREDIT","CONTRACT","DECLARATION","RENVENUE"];
								if(utilObj.userLogined.roleId != 3 && utilObj.userLogined.roleId != 4){
									utilObj.gotoPageUri("dashboard.html?stepFilter="+steps[this.index]);
								}								
							}
						}
					}
				},
				column: {
					dataLabels: {
						enabled: true,
						color:'#666666',
					}
				},
				line : {
					 marker: {
						lineWidth: 2,
						lineColor:'white',
						fillColor: '#F49D14'
					},
					color: '#F49D14',
				}
			},
			series: [{
				name: '金额',
				type: 'column',
				data: page.amount[index]
			},{
				name: '数量',
				type: 'line',
				yAxis: 1,				
				data:  page.count[index]
			}]
		});
		}
	}



/********************************************************************/

	$("#myGrid").height($("#right-main-content").height() - 50);
	commonObj.bindEvent_NavAndSearch();
	page.getFilter();
	
	//获取数据
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.setTableTitle()).done(function(){
		$.when(page.bindGrid()).done(function(){
			utilObj.hideLoading($("#wrap"));
		});			
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
	        $.when(commonObj.getBankSelect($("#branch"), sel_data, "支行[All]")).done(function(){
	        	$.when(commonObj.getCustomerManager($("#manager"), sel_data, "客户经理[All]")).done(function(){
		        	utilObj.showLoading($("#wrap"),"加载中");
			        $.when(page.bindGrid()).done(function(){
			            //utilObj.hideLoading($("#wrap"));
			        });
		        });
	        });
        } else {
        	$("#branch").select2("destroy");
            $("#branch").html("<option>支行[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });

            $("#manager").select2("destroy");
            $("#manager").html("<option>客户经理[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });
            
            utilObj.showLoading($("#wrap"),"加载中");
	        $.when(page.bindGrid()).done(function(){
	            //utilObj.hideLoading($("#wrap"));
	        });
        }
    });

    //支行下拉选中
    $("#branch").on("select2:select", function(e){
        var data = e.params.data;
        
        if(data.id != ""){
        	var sel_data = {
	            bankBranchId: $("#subsidiary").val(),
            	bankSubsetId: data.id
	        };
	        $.when(commonObj.getCustomerManager($("#manager"), sel_data, "客户经理[All]")).done(function(){
	        	utilObj.showLoading($("#wrap"),"加载中");
		        $.when(page.bindGrid()).done(function(){
		            //utilObj.hideLoading($("#wrap"));
		        });
	        });
        } else {
        	$("#manager").select2("destroy");
            $("#manager").html("<option>客户经理[All]</option>").select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });

            utilObj.showLoading($("#wrap"),"加载中");
        	$.when(page.bindGrid()).done(function(){
	            //utilObj.hideLoading($("#wrap"));
	        });
        }
    });

    //客户经理下拉
    $("#manager").on("select2:select", function(e){
        utilObj.showLoading($("#wrap"),"加载中");
        $.when(page.bindGrid()).done(function(){
            //utilObj.hideLoading($("#wrap"));
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
	$(".selected-tab").text($(".right-tab-inner > .selected-filter").text());

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
			
			utilObj.showLoading($("#wrap"),"加载中");
			$.when(page.bindGrid()).done(function(){
				//utilObj.hideLoading($("#wrap"));
			});
		}
	});

	//点击某列
	$(document).on("click", ".cloumn-wrap" ,function(){
		if($(this).hasClass("total-wrap")){
			return false;
		} else {
			if(utilObj.userLogined.roleId == 3 || utilObj.userLogined.roleId == 4){
				return false;
			} else {
				utilObj.gotoPageUri("dashboard.html?stepFilter="+$(this).attr("data-config-val"));
			}			
		}
	});
});