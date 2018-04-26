define(function(require, exports, module){
	require("../js/common/highcharts.src.js");
	//$(".client-tab-content-container").html(h);
	var baseInfoPage = {
		productData: null,
		incomeData: null,
		sizeData: null,
		stateData: null,
		setContent: function(){
			var _that = this;
			$(".client-tab-content-container").html(template("client-business"));
			utilObj.showLoading($("#wrap"),"加载中...");
			$.when(baseInfoPage.getData()).done(function(){
				if(_that.productData && _that.productData.length > 0){
					_that.setProduct();
				}

				if(_that.incomeData){
					_that.setIncome();
				}

				if(_that.sizeData){
					_that.setSize();
				}

				if(_that.stateData){
					_that.setState();
				}

				//lenged文字水平居中
				$(".highcharts-legend").find("text").attr("y","13");

				//文字去阴影
				$("tspan.highcharts-text-outline").css("fill","none");
				$("tspan.highcharts-text-outline").css("stroke","none");

				//修正折线图的lengend
				$("#state-chart .highcharts-legend .highcharts-spline-series path").eq(0).attr("d","M 0 9 L 16 9");
				$("#state-chart .highcharts-legend .highcharts-spline-series path").eq(1).remove();

				utilObj.hideLoading($("#wrap"));
			});
			//baseInfoPage.setHeight();
		},
		getData: function(){
			var _that = this;
			var dfd = $.Deferred();
			var customerId = url("?")["c_id"];
			var plantId = url("?")["p_id"];
			utilObj.ajax({
				url: "m/customerPlant/findBizData",
				data: {customerId: customerId},
				success: function(data){
					if(data && data.object){
						var obj = data.object;
						if(obj.Product && obj.Product.length > 0){
							_that.productData = obj.Product;
						}

						if(obj.NetIncome){
							_that.incomeData = obj.NetIncome;
						}

						if(obj.Size){
							_that.sizeData = obj.Size;
						}

						if(obj.Status){
							_that.stateData = obj.Status;
						}

						_that.FtpIncrease = obj.FtpIncrease;
					}
					dfd.resolve(data);
				},
				error: function(err){
					w2alert("服务器错误!");
					dfd.resolve(err);
				}
			});
			return dfd;
		},
		setProduct: function(){
			var _that = this;
			var _columns = [
				{field: "productId", caption: "产品编码", size: "1%", hidden: true},
				{field: "productName", caption: "名称", size: "25%", attr: "align=center"},
				{field: "balance", caption: "余额(万元)", size: "25%", attr: "align=center"},
				{field: "productManagerName", caption: "产品经理", size: "25%", attr: "align=center"},
				{field: "productType", caption: "业务类型", size: "25%", attr: "align=center"}
			];
			var _records = [];
			_.map(_that.productData, function(v,i){
				_records.push({
					recid: i,
					productId: v.productId,
					productName: v.productName,
					balance: v.balance,
					productManagerName: v.productManagerName,
					productType: v.productType
				});
			});

			if(w2ui["Product"]) w2ui["Product"].destroy();
			
			$("#productGrid").w2grid({
				name: "Product",
				total: 10,
				limit: 200,
				recordHeight: 40,
				selectType: "row",
				show: {recordTitles: false},
				columns: _columns,
				records: _records,
				onDblClick: function(event){
					event.preventDefault();
				},
				onClick: function(event){
					event.preventDefault();
				}
			});
		},
		setIncome: function(){
			var _that = this;
			var _data = [];
			_.each(_that.incomeData, function(v,k){
				_data.push({
					name: k,
					y: v == 0 ? null : v
				});
			});
			var option = {
				chart: {
		            type: 'column'
		        },
		        title: {
		            text: '收入YTD',
		            style: {
		                fontSize: "14px",
		                color: "#000",
		                fontWeight: "bold"
		            },
		            y: -10
		        },
		        subtitle: {
		        	align: "right",
		        	floating: true,
		        	text: "较上年同期 <span style='color:#4776C7;font-size:20px'>"+(_that.FtpIncrease > 0 ? "+"+parseInt(_that.FtpIncrease) : (_that.FtpIncrease == 0 ? 0 : parseInt(_that.FtpIncrease)))+"%</span>",
		        	verticalalign: "top",
		        	y: 18,
		        	useHTML: true
		        },
		        xAxis: {
		            type: 'category',
		            tickLength: 0
		        },
		        yAxis: {
		            title: {
		                enabled: false
		            },
		            labels: {
		                enabled: false
		            },
		            gridLineWidth: 0,
		        },
		        legend: {
		            align: 'left',
		            verticalAlign: 'top',
		            floating: true,
		            borderWidth: 0,
		            shadow: false,
		            itemDistance: 30,
		            symbolWidth: 16,
		            symbolHeight: 16,
		            symbolRadius: 3,
		            symbolPadding: 5,
		           	y: 5,
		            itemStyle: {
		                color: "#3C3C3C",
		                fontWeight: "normal",
		                fontSize: "12px",
		                marginBottom: "3px"
		            }
		        },
		        plotOptions: {
		            series: {
		                borderWidth: 0,
		                dataLabels: {
		                    enabled: true,
		                    format: '{point.y}',
		                    style: {
		                        fontSize: "12px",
		                        fontWeight: "normal"
		                    }
		                }
		            }
		        },
		        tooltip: {
		        	headerFormat: "",
		            pointFormat: '{point.name}: {point.y}'
		        },
		        series: [{
		        	name: "FTP净收入（万元）",
		            color: "#4776C7",
		            data: _data
		        }]
			};

			$("#income-chart").highcharts(option);
		},
		setSize: function(){
			var _that = this;
			var _key = [];
			var _series = [
				{
					name: "贷款",
					data: [],
					color: "#4776C7"
				},
				{
					name: "存款",
					data: [],
					color: "#2FA65B"
				},
				{
					name: "交易银行产品",
					data: [],
					color: "#F49D14"
				},
				{
					name: "投资银行产品",
					data: [],
					color: "#DE4C39"
				}
			];
			_.each(_that.sizeData, function(v,k){
				_key.push(k);
				_.map(v,function(j,l){
					if(j == 0){
						_series[l].data.push(null);
					} else {
						_series[l].data.push(j);
					}
				});
			});
			// _series = _.sortBy(_series,function(n,m){return m > n});
			// console.log(_series);

			var option = {
				chart: {
		            type: 'column',
		        },
		        title: {
		            text: "规模(月末余额，万元)",
		            style: {
		                fontSize: "14px",
		                color: "#000",
		                fontWeight: "bold"
		            },
		            y: -10
		        },
		        xAxis: {
		            categories: _key,
		            tickLength: 0
		        },
		        yAxis: {
		            min: 0,
		            title: {
		                enabled: false
		            },
		            stackLabels: {
		                enabled: true,
		                style: {
		                    fontWeight: "normal",
		                    fontSize: "12px",
		                    color: "#3C3C3C"
		                }
		            },
		            labels: {
		                enabled: false
		            },
		            gridLineWidth: 0,
		            reversedStacks: true
		        },
		        legend: {
		            align: 'left',
		            verticalAlign: 'top',
		            floating: true,
		            //reversed: true,
		            borderWidth: 0,
		            shadow: false,
		            itemDistance: 30,
		            symbolWidth: 16,
		            symbolHeight: 16,
		            symbolRadius: 3,
		            symbolPadding: 5,
		           	y: 5,
		            itemStyle: {
		                color: "#3C3C3C",
		                fontWeight: "normal",
		                fontSize: "12px",
		                marginBottom: "3px"
		            }
		        },
		        tooltip: {
		            formatter: function () {
		                return this.x + '<br/>' +
		                    this.series.name + ': ' + this.y + '<br/>' +
		                    '总量: ' + this.point.stackTotal;
		            }
		        },
		        plotOptions: {
		            column: {
		                stacking: 'normal',
		                dataLabels: {
		                    enabled: true,
		                    style: {
		                        fontSize: "12px",
		                        fontWeight: "normal",
		                        color: "#FFFFFF"
		                    }
		                }
		            }
		        },
		        series: _series
			};

			$("#size-chart").highcharts(option);
		},
		setState: function(){
			var _that = this;
			var _categories = [];
			var _column_data = [];
			var _line_data = [];
			_.each(_that.stateData, function(v,k){
				_categories.push(k);
				_column_data.push(v[1] == 0 ? null : v[1]);
				_line_data.push(v[0]);
			});

			var option = {
				chart: {},
				title: {
					text: "状态",
					style: {
		                fontSize: "14px",
		                color: "#000",
		                fontWeight: "bold"
		            },
		            y: 25
				},
				legend: {
					align: 'left',
		            verticalAlign: 'top',
		            floating: true,
		            borderWidth: 0,
		            shadow: false,
		            itemDistance: 30,
		            symbolWidth: 16,
		            symbolHeight: 16,
		            symbolRadius: 3,
		            symbolPadding: 5,
		           	y: 30,
		            itemStyle: {
		                color: "#3C3C3C",
		                fontWeight: "normal",
		                fontSize: "12px",
		                marginBottom: "3px"
		            },
		            reversed: true,
				},
				xAxis: [{
					categories: _categories,
					tickLength: 0
				}],
				yAxis: [
					{
						labels: {
			                enabled: false
			            },
			            title: {
			                enabled: false
			            },
			            gridLineWidth: 0,
					},
					{
						labels: {
			                enabled: false
			            },
			            title: {
			                enabled: false
			            },
			            gridLineWidth: 0,
					}
				],
				plotOptions: {
					column: {
						dataLabels: {
							enabled: true,
							color:'#3C3C3C',
							style: {
								fontWeight: "normal",
								fontSize: "12px"
							}
						}
					}
				},
				tooltip: {
					formatter: function () {
						if(this.points.length > 1){
							return this.x+"<br /><span class='line-icon'></span>"+this.points[1].series.name+": "+this.points[1].y+"<br /><span class='squ-icon'></span>"+this.points[0].series.name+": "+this.points[0].y;
						} else {
							return this.x+"<br /><span class='squ-icon'></span>"+this.points[0].series.name+": "+this.points[0].y;
						}
		            },
		            //useHTML: true,
		            shared: true
		        },
		        series: [{
		            name: '进出流水金额(万元)',
		            type: 'column',
		            yAxis: 0,
		            data: _column_data,
		            color: "#2FA65B"
		        }, {
		            name: '进出流水笔数',
		            type: 'line',
		            yAxis: 1,
		            data: _line_data,
		            color: "#F49D14"
		        }]
			};

			$("#state-chart").highcharts(option);
		},
	};
	module.exports = {
		init: function(){
			baseInfoPage.setContent();
		}
	}
});