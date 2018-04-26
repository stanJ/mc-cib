define(function(require,exports,module){
	var loginUser = utilObj.userLogined;
	var roleId = loginUser.roleId;
	if(roleId == 1){//客户经理
		seajs.use("mycss/client-index.css");
		$("#sub-branch-president").remove();
		$("#branch-president").remove();
		$("#head-office-president").remove();
		$("#custom-manager").show();
		seajs.use("myjs/client-index.js");
	} else if(roleId == 3){//总行行长
		seajs.use("mycss/index_head_office.css");
		$("#custom-manager").remove();
		$("#sub-branch-president").remove();
		$("#branch-president").remove();
		$("#head-office-president").show();
		seajs.use("myjs/index_head_office.js");
	} else if(roleId == 4){//分行行长
		seajs.use("mycss/index_branch.css");
		$("#custom-manager").remove();
		$("#sub-branch-president").remove();
		$("#head-office-president").remove();
		$("#branch-president").show();
		seajs.use("myjs/index_branch.js");
	} else if(roleId == 5){//支行行长
		seajs.use("mycss/index_sub_branch.css");
		$("#custom-manager").remove();
		$("#branch-president").remove();
		$("#head-office-president").remove();
		$("#sub-branch-president").show();
		seajs.use("myjs/index_sub_branch.js");
	} else if(roleId == 6){//产品经理

	} else if(roleId == 7){//信审经理

	} else {//管理员

	}
});