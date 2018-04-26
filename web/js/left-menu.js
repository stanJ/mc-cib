define(function(require,exports,module){

	module.exports = {
		getMenuList: function(){
			var that = this;
			utilObj.ajax({
				url: "m/user/findMenuDataByUserId",
				data: {userId:utilObj.userLogined.userId},
				success: function(data){
					var menu_str = "";
					if(data && data.object.items.length > 0){
						if(utilObj.userLogined.roleId != 6 && utilObj.userLogined.roleId != 7){
							menu_str = [
								"			<li class='level-1 index-page'>",
								"				<div class='level-1-text'>首页</div>",
								"			</li>"
							].join("");
						}

						$.each(data.object.items,function(i,v){
							if(v.list.length > 0){
								var submenu_str = "<ul class='sub-menu'>";
								$.each(v.list, function(i1,v1){
									submenu_str += "<li class='level-2' data-uri='"+v1.href+"'>"+v1.text+"</li>";
								});
								submenu_str += "</ul>";
							}
							var menu_class = "level-1";
							if(v.id == "2"){
								menu_class = "level-1 clients-page";
							} else if(v.id == "3"){
								menu_class = "level-1 seals-page";								
							} else if(v.id == "1"){
								menu_class = "level-1 analyse-page";
							}
							menu_str += "<li class='"+menu_class+"'><div class='level-1-text'>"+v.text+"</div>"+submenu_str+"</li>";
						});

						that.createMenu(menu_str);
					} else {
						if(utilObj.userLogined.roleId == 2){
							menu_str = [
								"			<li class='level-1 product-page' data-uri='backend-product-config.html'>",
								"				<div class='level-1-text'>产品管理</div>",
								"			</li>",
								"			<li class='level-1 user-page' data-uri='backend-user-config.html'>",
								"				<div class='level-1-text'>用户管理</div>",
								"			</li>",
								"			<li class='level-1 client-page' data-uri='backend-client-manage.html'>",
								"				<div class='level-1-text'>客户管理</div>",
								"			</li>",
								"			<li class='level-1 data-page' data-uri='backend-data-config.html'>",
								"				<div class='level-1-text'>数据管理</div>",
								"			</li>",
								"			<li class='level-1 params-page'>",
								"				<div class='level-1-text'>参数管理</div>",
								"				<ul class='sub-menu' style='display:none;'>",
								"					<li class='level-2' data-uri='backend-trade.html'>行业不良率</li>",
								"					<li class='level-2' data-uri='backend-risk.html'>风险成本</li>",
								"					<li class='level-2' data-uri='backend-subbranch.html'>支行运营成本</li>",
								//"					<li class='level-2' data-uri='backend-credit.html'>信用转换系数</li>",
								"					<li class='level-2' data-uri='backend-layer.html'>分层基准管理</li>",
								"					<li class='level-2' data-uri='backend-unloan.html'>无贷户分类管理</li>",
								"					<li class='level-2' data-uri='backend-target.html'>分支行年度目标</li>",
								"					<li class='level-2' data-uri='backend-track.html'>线索基准管理</li>",
								"					<li class='level-2' data-uri='backend-cap-cost.html'>Cap Cost</li>",
								"					<li class='level-2' data-uri='backend-risk-weight.html'>风险权重</li>",
								"				</ul>",
								"			</li>",
								"			<li class='level-1 institution-page' data-uri='backend-bank-manage.html'>",
								"				<div class='level-1-text'>机构管理</div>",
								"			</li>",
								"			<li class='level-1 trade-page' data-uri='backend-trade-config.html'>",
								"				<div class='level-1-text'>行业管理</div>",
								"			</li>"
							].join("");

							that.createMenu(menu_str);
						}
					}
				},
				error: function(xhr, errorType, error){
					utilObj.gotoPageUri("login.html");
				}
			});
		},
		createMenu: function(menu_str){
			var that = this;
			var left_menu = [
				"<div class='left-menu-wrap'>",
				"	<div class='menu-inner'>",
				"		<div class='logo-box'></div>",
				"		<ul class='main-menu'>",
				menu_str,
				"		</ul>",
				"		<div class='modify-pwd'>",
				"			<div class='modify-pwd-text'>"+utilObj.userLogined.nickName+"</div>",
				"		</div>",
				"		<div class='logout-btn'>退出</div>",
				"	</div>",
				"</div>"
			].join("");

			$("#wrap").append(left_menu);
			setTimeout(function(){that.bindMenuEvent();},200);
		},
		checkChange: function(){
			var ori = $("#ori-pwd").val();
			var new_pwd = $("#new-pwd").val();
			var confirm_pwd = $("#confirm-pwd").val();

			if(ori.length < 6 || new_pwd < 6){
				w2alert("密码最少为6位");
				return false;
			}

			if(new_pwd == ori){
				w2alert("新密码不能与旧密码相同");
				return false;
			}

			if(new_pwd != confirm_pwd){
				w2alert("确认密码与新密码不同");
				return false;
			}

			utilObj.showLoading($(".wrap"),"正在提交");
			utilObj.ajax({
				url: "m/login/updatePassWD",
				data:{Username:utilObj.userLogined.userName,oldPwd:md5(ori),newPwd:md5(new_pwd)},
				success: function(data){
					utilObj.hideLoading($(".wrap"));
					w2alert("密码修改成功，请重新登陆").done(function(){
						utilObj.gotoPageUri("login.html");
					});					
				},
				error: function(err){
					w2alert(err.message);
					utilObj.hideLoading($(".wrap"));
				}
			});

		},
		bindMenuEvent: function(){
			
			//高亮
			if(app.pageName == "index"){
				$(".index-page").addClass("menu-selected");
			} else if(app.pageName.indexOf("backend") > -1){
				$(".level-1[data-uri='"+app.pageName+".html']").addClass("menu-selected");
				$(".level-2[data-uri='"+app.pageName+".html']").addClass("menu-selected").parents(".level-1").addClass("menu-selected");
			} else {
				$(".level-2[data-uri='"+app.pageName+".html']").addClass("menu-selected").parents(".level-1").addClass("menu-selected");
			}			

			var mouseenter = null;
			$(document).on("mouseenter", ".main-menu .level-1", function(){
				clearTimeout(mouseenter);
				$(this).siblings(".level-1").removeClass("menu-active").children(".sub-menu").hide().children(".level-2").removeClass("menu-active");
				
				var $_sub_menu = $(this).children(".sub-menu");
				var curr_offset = $(this).offset().top;
				var total_height = $_sub_menu.height() + curr_offset;
				if(total_height > $(document).height()) {
					var new_opt_top = total_height - $(document).height();
					$_sub_menu.css("top","-"+(new_opt_top+20));
				}
				$(".modify-pwd").removeClass("menu-active");
				$(this).addClass("menu-active");
				$_sub_menu.show();
			}).on("mouseleave", ".main-menu .level-1", function(){
				var $_that = $(this);
				mouseenter = setTimeout(function(){
					$_that.removeClass("menu-active").children(".sub-menu").hide().children(".level-2").removeClass("menu-active");
				}, 500);
			}).on('click', '.main-menu .level-1', function(){
				if(typeof($(this).attr("data-uri")) == 'undefined'){
					return false
				} else {
					utilObj.gotoPageUri($(this).attr("data-uri"));
				}
			});

			$(document).on("mouseenter", ".sub-menu .level-2", function(){
				clearTimeout(mouseenter);
				$(this).siblings(".level-2").removeClass("menu-active").end().addClass("menu-active");
			}).on("click", ".sub-menu .level-2", function(){
				if(typeof($(this).attr("data-uri")) == 'undefined'){
					return false
				} else {
					utilObj.gotoPageUri($(this).attr("data-uri"));
				}
			});

			$(document).on("mouseenter", ".modify-pwd", function(){
				clearTimeout(mouseenter);
				$(this).siblings(".main-menu").children(".level-1").removeClass("menu-active").children(".sub-menu").hide().children(".level-2").removeClass("menu-active");
				$(this).addClass("menu-active");
			}).on("mouseleave", ".modify-pwd", function(){
				var $_that = $(this);
				mouseenter = setTimeout(function(){
					$_that.removeClass("menu-active");
				}, 500);
			}).on('click', '.modify-pwd', function(){
				console.log(utilObj.userLogined);
				var html = [
					"<div class='person-info-wrap'>",
					"	<div class='info-line-wrap'>",
					"		<span class='info-title'>姓名:</span>",
					"		<span class='info-val name'>"+utilObj.filterText(utilObj.userLogined.nickName)+"</span>",
					"	</div>",
					"	<div class='info-line-wrap'>",
					"		<span class='info-title'>职位:</span>",
					"		<span class='info-val name'>"+utilObj.filterText(utilObj.userLogined.roleName)+"</span>",
					"	</div>",
					"	<div class='info-line-wrap'>",
					"		<span class='info-title'>所属分行:</span>",
					"		<span class='info-val name'>"+utilObj.filterText(utilObj.userLogined.branchBank)+"</span>",
					"	</div>",
					"	<div class='info-line-wrap'>",
					"		<span class='info-title'>所属支行:</span>",
					"		<span class='info-val name'>"+utilObj.filterText(utilObj.userLogined.subsetBank)+"</span>",
					"	</div>",
					"	<div class='btn-wrap'>",
					"		<div class='change-pwd'>修改密码</div>",
					"		<div class='cancel-info-btn'>取消</div>",
					"	</div>",
					"</div>"
				].join("");

				$().w2popup('open', {
			        title   : "个人信息",
			        body    : html,
			        style   : 'padding: 15px 0px 0px 0px',
			        width   : 400,//480
			        height  : 280,//420 
			        showClose: false,
			        onOpen: function (event) {
			            event.onComplete = function () {
			             //    $('#w2ui-popup #'+popId).w2render(name);
			             //    if(name == "Track"){
			            	// 	$("#estimate").w2field("date", {
			            	// 		format: "yyyy-mm-dd",
			            	// 		start: Date.today().addDays(1).toString("yyyy-MM-dd")
			            	// 	}).attr("placeholder","请选择日期");	            		
			            	// }
			            }
			        }
			    });
			});

			//点击首页
			$(document).on("click",".index-page",function(){
				if($(this).hasClass("menu-selected")){
					return false;
				} else {
					utilObj.gotoPageUri("index.html");
				}
			});

			//退出
			$(document).on("click",".logout-btn",function(){
				w2confirm({
					msg: "确认要退出吗？",
					title: "登出确认",
			        btn_yes: {
						text: "确认",
						class: "button-primary",
						callBack: function(){
							utilObj.userLogined = null;
							sessionStorage.removeItem("token");
							sessionStorage.removeItem("userLogined");
							utilObj.ajax({
								url: "/m/login/logout",
								success: function(){
									utilObj.token = null;
									utilObj.gotoPageUri("login.html");
								}
							});							
						}
					},
					btn_no: {
				        text: '取消',    // text for no button (or no_text)
				        class: 'button-cancel',      // class for no button (or no_class)
				        callBack: function(){
				        	//w2confirm.close();
				        	//w2confirm.clear();
				        }     // callBack for no button (or no_callBack)
				    }
				});
			});

			//关闭信息
			$(document).on("click",".cancel-info-btn",function(){
				w2popup.close();
			});

			//修改密码
			$(document).on("click",".change-pwd",function(){
				var html = [
					"<div class='change-pwd-wrap'>",
					"	<h4>修改密码</h4>",
					"	<div class='change-pwd-form'>",
					"		<div class='info-line-wrap'>",
					"			<span class='info-title'>旧密码:</span>",
					"			<span class='info-val name'><input type='password' id='ori-pwd' min=6 max=20 /></span>",
					"		</div>",
					"		<div class='info-line-wrap'>",
					"			<span class='info-title'>新密码:</span>",
					"			<span class='info-val name'><input type='password' id='new-pwd' min=6 max=20 /></span>",
					"		</div>",
					"		<div class='info-line-wrap'>",
					"			<span class='info-title'>确认密码:</span>",
					"			<span class='info-val name'><input type='password' id='confirm-pwd' min=6 max=20 /></span>",
					"		</div>",
					"		<div class='change-pwd-btn-wrap'>",
					"			<div class='submit-changed'>修改</div>",
					"			<div class='cancel-change'>取消</div>",
					"		</div>",
					"	</div>",
					"</div>"
				].join("");
				w2popup.message({
				    width  : 400,
				    height : 300,
				    html   : html,
				});
			});

			//关闭修改密码
			$(document).on("click",".cancel-change",function(){
				w2popup.message();
			});

			//提交修改密码
			var that = this;
			$(document).on("click",".submit-changed",function(){
				that.checkChange();
			});
		}
	};
});