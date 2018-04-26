define(function(require,exports,module){
	page.loginData = {};

	//验证登陆
	page.checkForm = function(){
		if($.trim($(".username").val()).length > 0){
			page.loginData.Username = $(".username").val();
		} else {
			return false;
		}

		if($.trim($(".password").val()).length > 0){
			page.loginData.password = $(".password").val();
		} else {
			return false;
		}

		return true;
	};
	/***************************/

	//防止iframe嵌套
	(function(window) {
		if (window.location !== window.top.location) {
			window.top.location = window.location;
		}
	})(this);

	//
	$(document).on("focus",".password",function(){
		if($.trim($(this).val()).length == 0){
			$(this).attr("type","text");
		}
	}).on("input",".password",function(){
		if($.trim($(this).val()).length == 0){
			$(this).attr("type","text");
		} else {
			$(this).attr("type","password").val($.trim($(this).val()));
		}	
	});

	//登录
	$(document).on("click",".login-btn",function(){
		if(!page.checkForm()){
			w2alert("请填写用户名或密码");
		} else {
			utilObj.showLoading($("#wrap"),"正在登陆");
			page.loginData.password = md5(page.loginData.password);
			utilObj.ajax({
				url: "m/login/login",
				data: page.loginData,
				success: function(data,status,xhr){
					if(data && data.object){
						if(data.object.userId){
							
							//localStorage.setItem("userLogined",JSON.stringify(data.object));
							sessionStorage.setItem("token",xhr.getResponseHeader("token")); //记录token
							sessionStorage.setItem("userLogined",JSON.stringify(data.object));
							utilObj.userLogined = data.object;
							if(utilObj.userLogined.roleId == 2){ //超级管理员进后台
								utilObj.gotoPageUri("backend-product-config.html");
							} else if(utilObj.userLogined.roleId == 6 || utilObj.userLogined.roleId == 7) {
								utilObj.gotoPageUri("account-profile.html");
							} else {
								utilObj.gotoPageUri("index.html");
							}						
						} else {
							w2alert("用户登录存在异常");
							return false;
						}

						utilObj.hideLoading($("#wrap"));
					}
				},
				error: function(e){
					utilObj.hideLoading($("#wrap"));
				}
			});
		}	
	});
});