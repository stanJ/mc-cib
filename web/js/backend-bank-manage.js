define(function(require,exports,module){

	var page = {};
	page.params = {
		nextPage: 0,
		pageSize: 9999
	}

	page.columns = [
		{field: "grade", caption: "级别", size: "10%", attr: "align=center"},
		{field: "team", caption: "梯队", size: "10%", attr: "align=center"},
		{field: "bankBranchName", caption: "分行名称", size: "35%", attr: "align=center"},
		{field: "bankSubsetName", caption: "支行名称", size: "35%", attr: "align=center"},
		{field: "option", caption: "操作", size: "10%", attr: "align=center"},
		{field: "bankId", caption: "结构编号", size: "1%", hidden: true},
		{field: "level",caption:"级别",size: "1%",hidden: true},
		{field: "searchbankBranchName", caption: "分行名称", size: "1%", hidden: true},
		{field: "searchbankSubsetName", caption: "支行名称", size: "1%", hidden: true},
	];

	//分行下拉
	page.branchBankList = [];

	//绑定表格
	page.bindGrid = function(){
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/bank/findBank",
			success: function(data){
				if(data && data.object && data.object && data.object.bankVoList.length > 0){
					page.records = [];
					page.branchBankList = [];
					$.each(data.object.bankVoList, function(i,v){
						var children = [];
						var bankBranchName = "";
						if(v.bankVoList.length > 0){
							bankBranchName = "<span class='slider_down' data-recid='"+i+"'>"+v.bankName+"</span>";
							$.each(v.bankVoList,function(j,k){
								children.push({
									recid: i+"-"+j,
									grade: k.grade,
									team: k.team,
									bankBranchName: v.bankName,
									bankSubsetName: k.bankName,
									option: "<span class='edit-btn' data-id='"+k.bankId+"' data-recid='"+i+"-"+j+"'>编辑</span><span class='delete-btn' data-id='"+k.bankId+"' data-recid='"+i+"-"+j+"'>删除</span>",
									bankId: k.bankId,
									level: k.level,
									searchbankBranchName: v.bankName,
									searchbankSubsetName: k.bankName,									
								});
							});
						} else {
							bankBranchName = v.bankName;
							children = [];
						}

						page.records.push({
							recid: i,
							grade: v.grade,
							team: v.team,
							bankBranchName: bankBranchName,
							bankSubsetName: "",
							option: "<span class='edit-btn' data-id='"+v.bankId+"' data-recid='"+i+"'>编辑</span><span class='delete-btn' data-id='"+v.bankId+"' data-recid='"+i+"'>删除</span>",
							bankId: v.bankId,
							level: v.level,
							searchbankBranchName: v.bankName,
							searchbankSubsetName: "",
							w2ui: { children: children }
						});

						page.branchBankList.push({
							id: v.bankId,
							text: v.bankName
						});
					});
				}
				if(w2ui["Manage"]){
					w2ui.Manage.clear();
					w2ui.Manage.records = page.records;
					w2ui.Manage.refresh();
				} else {
					page.curr_input = [];
					$("#myGrid").w2grid({
						name: "Manage",
						total: 10,
						limit: 200,
						recordHeight: 60,
						selectType: "row",
						show: {
							toolbar: true,
							toolbarReload: false,
							toolbarColumns: false,
							toolbarSearch: false,
							recordTitles: false
						},
						multiSearch: true,
						searches: [
							{field: "searchbankBranchName",caption: "分行名称",type:"text", operator: "contains"},
							{field: "searchbankSubsetName",caption: "支行名称",type:"text", operator: "contains"},
							{field: "bankId",caption: "机构编号",type:"text", operator: "contains"},
							{field: "all",caption: "分行名称,支行名称,机构编号",type:"text", operator: "contains"}
						],
						columns: page.columns,
						records: page.records,
						onEditField: function(event){
							event.onComplete = function(){
								page.curr_input.push(event.input);
								event.input.data('keep-open', true);

								event.input.css({
									'width': '50%',
									'text-align': 'center',
								});
							}
						},
						onDblClick: function(event){
							event.preventDefault();
						},
						onClick: function(event){
							event.preventDefault();
						}
					});
				}
			}
		});
	};

	//删除客户
	page.deleteBank = function(bid){
		utilObj.showLoading($("#wrap"),"正在删除");
		utilObj.ajax({
			url: "m/bank/deleteBankInstitution",
			data: {bankId: bid},
			success: function(data){
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading($("#wrap"));
				});
			},
			error: function(e){
				//w2alert("删除失败","删除失败");
				utilObj.hideLoading($("#wrap"));
			}
		});
	};

	//弹框编辑/新建
	page.popupBox = function(bankObj){
		var title = "";
		$().w2popup("open",{
			title: "机构设置",
			width: 300,
			height: 310,
			showClose: true,
			body: template("bankOpt"),
			onOpen: function(event){
				event.onComplete = function(){
					if(!bankObj){
						//新建
						$("#level-select").prop("disabled",false);
						$(".confirm-bank").attr("data-bankId","");
						$("#team-name").val("");
						$(document).on("change","#level-select",function(){
							if($(this).val() == "0"){
								$(".opt-branch-name > .opt-input").css("display","inline-block");
								$(".opt-branch-name > .level-wrap").css("display","none");
								$(".opt-subset-name").hide();
							} else {
								var opt = "";
								$.each(page.branchBankList, function(i,v){
									opt += "<option value='"+v.id+"'>"+v.text+"</option>";
								});
								$("#branch-select").html(opt);				
								$(".opt-branch-name > .opt-input").css("display","none");
								$(".opt-branch-name > .level-wrap").css("display","inline-block");
								$(".opt-subset-name").show();
							}
						});
					} else {
						//编辑
						$("#team-name").val(bankObj.team);
						$("#subset-name,#branch-name").val(bankObj.searchbankSubsetName ? (bankObj.searchbankSubsetName == "" ? bankObj.searchbankBranchName : bankObj.searchbankSubsetName) : bankObj.searchbankBranchName);
						$("#level-select").prop("disabled",true);
						$(".confirm-bank").attr("data-bankId",bankObj.bankId).attr("data-recid",bankObj.recid);
						if(bankObj.level == "1"){ //分行
							$("#level-select").val(0);
							$(".opt-branch-name").show();
							$(".opt-subset-name").hide();
						} else { //支行
							$("#level-select").val(1);
							$(".opt-branch-name").hide();
							$(".opt-subset-name").show();
						}
					}
				}
			}
		});

		utilObj.hideLoading($("#wrap"));
	};

	//保存修改
	page.saveBank = function(bid,bname,brId,level,team){
		utilObj.showLoading($("#wrap"),"正在保存");
		var save_param = {};
		var _url = "";
		if(!level){//新建
			if(brId.length > 0){//支行
				save_param = {
					bankId: bid,
					bankBranchId: brId,
					bankSubsetName: bname,
					team: team
				};
				_url = "m/bank/saveBankSubset";
			} else {//分行
				save_param = {
					bankId: bid,
					bankBranchName: bname,
					team: team
				};
				_url = "m/bank/savebankBranch";
			}

		} else if(level == "1"){//分行编辑
			save_param = {
				bankId: bid,
				bankBranchName: bname,
				team: team
			};
			_url = "m/bank/savebankBranch";
		} else {//支行编辑
			save_param = {
				bankId: bid,
				bankBranchId: brId,
				bankSubsetName: bname,
				team: team
			};
			_url = "m/bank/saveBankSubset";
		}

		utilObj.ajax({
			url: _url,
			data: save_param,
			success: function(data){
				w2popup.close();
				$.when(page.bindGrid()).done(function(){
					utilObj.hideLoading($("#wrap"));
				});
			},
			error: function(err){
				utilObj.hideLoading($("#wrap"));
			}
		});
	};

/********************************************************************/
	utilObj.showLoading($("#wrap"),"加载中");
	$.when(page.bindGrid()).done(function(){
		utilObj.hideLoading($("#wrap"));
	});

	//删除一条记录
	$(document).on("click",".delete-btn",function(){
		var id = w2ui.Manage.get($(this).attr("data-recid")).bankId;
		w2confirm({
			msg: "删除后该条记录将无法恢复!<br />请确认已对该条记录下的相关客户及员工进行转移",
			title: "删除客户",
			yes_text: "删除",
			no_text: "取消",
			yes_class: "confrim-btn",
			no_class: "cancel-btn",
			yes_callBack: function(){
				page.deleteBank(id);
			},
			no_callBack: function(){
				return false;
			}
		});
	});

	//添加
	$(document).on("click",".create-btn",function(){
		page.popupBox();
	});

	//编辑
	$(document).on("click",".edit-btn",function(){
		var recid = $(this).attr("data-recid");
		page.popupBox(w2ui.Manage.get(recid));
	});

	//保存设置
	$(document).on("click",".confirm-bank",function(){
		var bankId = $(this).attr("data-bankId");
		var name = "";
		var bankBranchId = "";
		var team = $("#team-name").val();
		var level = w2ui.Manage.get($(this).attr("data-recid")) ? w2ui.Manage.get($(this).attr("data-recid")).level : null;
		if($("#level-select").val() == "0"){
			name = $("#branch-name").val();
			if($.trim(name).length == 0){
				w2alert("请填写分行名称");
				return false;
			}
		} else {
			name = $("#subset-name").val();
			if($.trim(name).length == 0){
				w2alert("请填写支行名称");
				return false;
			}

			if($("#branch-select").children("option").size() > 0){//新建
				bankBranchId = $("#branch-select").val();
			}
		}
		page.saveBank(bankId,name,bankBranchId,level,team);
	});

	//取消按钮
	$(document).on("click",".cancel-btn",function(){
		w2popup.close();
	});

	//导入
	$(document).on("click",".import-btn",function(){
		$("#upload_file").trigger("click");
	});

	//上传
	$(document).on("change","#upload_file",function(e){
		utilObj.showLoading($("#wrap"),"加载中");
		var file = e.target.files[0];
		var form = new FormData();
		form.append("excelFile", file);
		
		utilObj.ajax({
			url: 'm/input/inputBank',
			data: form,
			contentType: false,
			processData: false,
			success: function(data){
				utilObj.clearFile(e.target);				
				w2alert('上传成功', '提示');
				utilObj.hideLoading($("#wrap"));
			},
			error: function(err){
				utilObj.hideLoading($("#wrap"));
			}
		});
	});

	//点击展开
	$(document).on("click",".slider_down",function(){
		var recid = $(this).attr("data-recid");
		w2ui.Manage.toggle(recid);
	});
});