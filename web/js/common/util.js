var isAlerted = false;
//var _ajaxUrl = "";
//_ajaxUrl = "http://" + (url("hostname") == "localhost" ? "mckinsey2.3tichina.com" : (url("hostname") == "127.0.0.1" ? "mckinsey2.3tichina.com" : url("hostname"))) + "/service/";
//_ajaxUrl = "http://" + (url("hostname") == "localhost" ? "mckinsey-cib.3tichina.com" : (url("hostname") == "127.0.0.1" ? "mckinsey-cib.3tichina.com" : url("hostname"))) + "/service/";
//_ajaxUrl = "http://" + (url("hostname") == "localhost" ? "192.168.10.95:8080" : (url("hostname") == "127.0.0.1" ? "192.168.10.95:8080" : url("hostname") + (url('port') ? ":" + url('port') : ""))) + "/service/";
//_ajaxUrl = "http://" + (url("hostname") == "localhost" ? "192.168.10.95" : (url("hostname") == "127.0.0.1" ? "192.168.10.95" : url("hostname"))) + "/service/";
//_ajaxUrl = "http://" + url("hostname") + (url('port') ? ":" + url('port') : "") + "/service/";
var utilObj = {
    // curEnv: 'pre_prod', // 当前环境
    curEnv: 'test', // 当前环境
    urls: {
      'dev': 'mckinsey2.3tichina.com', // 开发环境
      'test': 'mckinsey-cib.3tichina.com', // 测试环境
      'pre_prod': '192.168.10.95:8080', // 预生产环境
      'prod': '' //生产环境
    },
    vconsole: false, // ipad调试不打开
//  vconsole: true, // ipad调试打开
    getAjaxUrl: function() {
      var url = '';
      var partUrl = this.urls[this.curEnv];
      if (partUrl) {
        url = 'http://' + partUrl + '/service/';
      } else {
        url = "http://" + url("hostname") + (url('port') ? ":" + url('port') : "") + "/service/";
      }
      return url;
    },
//  ajaxURL: utilObj.getAjaxUrl(), //app.ajaxUrl,
    ajax:function(params){
		if(!params.data || (params.data && !(params.data instanceof Object))) params.data={};
		// if(utilObj.userLogined){
		// 	params.data.employeeId = utilObj.userLogined.employeeId;
		// }
		params.url = utilObj.getAjaxUrl() + params.url;
        params.data.token = utilObj.token;
		var p = $.extend({ type: 'POST',}, params);

		p.success = function(data, status, xhr){
            if(data == null){
                alert("Session timeout!");
                utilObj.gotoPageUri("login.html");
            } else if(data.code == 1){
				if($.isFunction(params.success)) params.success(data, status, xhr);
			} else if(data.code == -2){
				if(!isAlerted){
					isAlerted = true
					alert(data.message)
				}
				utilObj.gotoPageUri("login.html");
			}else{
//				alert(data.message);
				w2alert(data.message, '提示');
				if($.isFunction(params.error)) params.error(data, status, xhr);
			}
		};
		p.error = function(xhr, errorType, error){
			if($.isFunction(params.error)){
				params.error(xhr, errorType, error);
			}else{
//				alert('接口出错');
				w2alert('接口出错', '提示');
				utilObj.hideLoading('#wrap');
			}
				
		};
		$.ajax(p);		
	},
    gotoPage: function(urlstr) {
        var _query = url("?");
        var _filename = url("filename");
    },
    gotoPageUri: function(urlstr){
        if(!utilObj.userLogined){
            location.href = "login.html";
        } else {
            location.href = urlstr;
        }
    },
    navigate:function(href,obj){
		if(href=="back"){
			history.back();
		}
		if(href.indexOf('.html')<0){
			href += '.html';
		}
		var newHref = href;
		if(obj){
			newHref += '?';
			var urlEnd = $.param(obj);
			newHref += urlEnd;
		}
		location.href = newHref;	
	},
	getUrlParam:function(key){
	    var url = location.search;
	    var theRequest = {};
	    if (url.indexOf("?") != -1) {
	        var str = url.substr(1);
	        var strs = str.split("&");
	        for(var i = 0; i < strs.length; i ++) {
	            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
	        }
	    }
	    return theRequest[key];
	},
    back: function() {
        history.back();
    },
    objectKeyConvert: function(resource, newKey) {
        var t = [];
        if (!$.isArray(resource)) {
            t.push(resource);
        } else {
            t = resource;
        }
        $.each(t, function(i, obj) {
            for (var _key in obj) {
                if (newKey[_key]) {
                    obj[newKey[_key]] = obj[_key];
                }
            }
        });

        if (!$.isArray(resource)) {
            return t[0];
        } else {
            return t;
        }
    },
    rgbToHex: function(rgb) {
        var rRgba = /rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(,([.\d]+))?\)/,
            r, g, b, a,
            rsa = rgb.replace(/\s+/g, "").match(rRgba);
        if (rsa) {
            r = (+rsa[1]).toString(16);
            r = r.length == 1 ? "0" + r : r;
            g = (+rsa[2]).toString(16);
            g = g.length == 1 ? "0" + g : g;
            b = (+rsa[3]).toString(16);
            b = b.length == 1 ? "0" + b : b;
            a = (+(rsa[5] ? rsa[5] : 1)) * 100
            return { hex: "#" + r + g + b, alpha: Math.ceil(a) };
        } else {
            return { hex: rgb, alpha: 100 };
        }
    },
    hexToRgba: function(hex, al) {
        var hexColor = /^#/.test(hex) ? hex.slice(1) : hex,
            alp = hex === 'transparent' ? 0 : Math.ceil(al),
            r, g, b;
        hexColor = /^[0-9a-f]{3}|[0-9a-f]{6}$/i.test(hexColor) ? hexColor : 'fffff';
        if (hexColor.length === 3) {
            hexColor = hexColor.replace(/(\w)(\w)(\w)/gi, '$1$1$2$2$3$3');
        }
        r = hexColor.slice(0, 2);
        g = hexColor.slice(2, 4);
        b = hexColor.slice(4, 6);
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
        return {
            hex: '#' + hexColor,
            alpha: alp,
            rgba: 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (alp / 100).toFixed(2) + ')'
        };
    },
    forIOSCantUseMetaScale: function() {
        //由于ios10 设置meta禁止页面缩放失效 阻止默认事件
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        })
        var lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            var now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false)
    },
    js_getDPI: function() {
        var arrDPI = new Array();
        if (window.screen.deviceXDPI != undefined) {
            arrDPI[0] = window.screen.deviceXDPI;
            arrDPI[1] = window.screen.deviceYDPI;
        } else {
            var tmpNode = document.createElement("DIV");
            tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
            document.body.appendChild(tmpNode);
            arrDPI[0] = parseInt(tmpNode.offsetWidth);
            arrDPI[1] = parseInt(tmpNode.offsetHeight);
            tmpNode.parentNode.removeChild(tmpNode);
        }
        return arrDPI;
    },
    showLoading: function(box,message){
        if(!box) box = $("body");
        if(!message) message = "加载中...";
        w2utils.lock(box,message,true);
    },
    hideLoading: function(box){
        if(!box) box = $("body");
        w2utils.unlock(box);
    },
    //将空值转为null
    toNull: function(obj){
    	for(key in obj){
    		if(obj[key] == ''){
    			obj[key] = null;
    		}
    	}
    	return obj;
    },
    //给表格里的每条数据添加recid值
    addRecid: function(ary, field){
    	if(ary){
    		if(field){
	    		return $.map(ary, function(x){
					if(x[field] == null || x[field] == undefined){
						x.recid = new Date().valueOf();
					}else{
						x.recid = x[field];
					}
					return x;
				})
    		}else{
    			return $.map(ary, function(x, i){
					x.recid = i+1;
					return x;
				})
    		}
    	}else{
    		return [];
    	}
    	
    },
    isEmpty: function(val){
    	if(val === null || val === ''){
    		return true;
    	}else{
    		return false;
    	}
    },
    isNull: function(val){
    	if(val === null){
    		return true;
    	}else{
    		return false;
    	}
    },
    alterToObj: function(res){
    	if(!res){
    		res = {};
    	}
    	return res;
    },
    alterToAry: function(res){
    	if(!res){
    		res = [];
    	}
    	return res;
    },
    splitToAry: function(str){
    	var res = [];
    	if(str){
    		res = str.split(',');
    	}
    	return res;
    },
    parseToInt: function(str){
    	var res = '';
    	if(str){
    		res = parseInt(str);
    	}
    	return res;
    },
    deleteOneError: function(errs, field){
    	var index = null;
		$.each(errs, function(i, val){
			if(val.field.field == field){
				index = i;
			}
		});
		if(index != null){
			errs.splice(index, 1);
		}
		return errs;
    },
    getSelectOptions: function(data){
    	var res = [{id: '', text: ''}];
    	if(data.length != 0){
    		res = data;
    	}
    	return res;
    },
    toNumber: function(value){
    	var res = 0;
    	if(value){
    		res = value;
    	}
    	return res;
    },
    validateCode: function(val){
    	var reg1 = /^[0-9a-zA-Z]{15,18}$/;
    	return reg1.test(val);
    },
    getMonths: function(months){
		var res = $.map(months, function(val, i){
			return parseInt(val.slice(4));
		});
		return res;
	},
	getDate: function(val){
		if(val){
			return val.slice(0, 10);
		}else{
			return '';
		}
	},
	showChartPercentLabel: function(val){
		var percent = val*100;
		if(percent<10){
			percent = Math.round(percent*100)/100;
		}else if(percent>10 && percent<300){
			percent = Math.round(percent);
		}else{
			percent = Math.round(percent)/100;
			return percent;
		}
		return percent+'%';
	},
	getInt: function(val){
		var res = 0;
		if(val){
			res = Math.round(val);
		}
		return res;
	},
	clearFile: function(el){
		el.value = '';
	},
    currNoData: function(){
        $("#myGrid").hide();
        $("#pagination").hide();
        if($("#empty-data").length > 0){
            $("#empty-data").show();
        } else {
            $("#myGrid").after([
                "<div id='empty-data'>暂时没有数据</div>"
            ].join(""));
        }
    },
    filterText: function(val){
        if(val == null){
            return '';
        }
        return val;
    },
    userLogined: JSON.parse(sessionStorage.getItem("userLogined")),//JSON.parse(localStorage.getItem("userLogined"))
    token: sessionStorage.getItem("token")
};


/**
 * 时间对象的格式化
 */
Date.prototype.format = function(format) {
    /*
     * format="yyyy-MM-dd hh:mm:ss";
     */
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 -
            RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
Date.prototype.addDay = function(i) {
    var d = new Date();
    d.setTime(this.valueOf() + (1000 * 60 * 60 * 24) * i);
    return d;
};
Date.prototype.addSecond = function(i) {
    var d = new Date();
    d.setTime(this.valueOf() + i * 1000);
    return d;
};

utilObj.detectSys = function(ua, platform) {
    var os = this.os = {},
        browser = this.browser = {},
        webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
        android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
        osx = !!ua.match(/\(Macintosh\; Intel /),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
        iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        win = /Win\d{2}|Windows/.test(platform),
        wp = ua.match(/Windows Phone ([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        kindle = ua.match(/Kindle\/([\d.]+)/),
        silk = ua.match(/Silk\/([\d._]+)/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
        bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
        rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
        playbook = ua.match(/PlayBook/),
        chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
        firefox = ua.match(/Firefox\/([\d.]+)/),
        firefoxos = ua.match(/\((?:Mobile|Tablet); rv:([\d.]+)\).*Firefox\/[\d.]+/),
        ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
        webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
        safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/),
        wechat = /[Mm]icro[Mm]essenger/.test(ua),
        wxdebugger = /wxdebugger/.test(ua),
        googleInc = /[Gg]oogle/.test(navigator.vendor);

    if (browser.webkit = !!webkit) browser.version = webkit[1];

    if (android) os.android = true, os.version = android[2];
    if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.');
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.');
    if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
    if (wp) os.wp = true, os.version = wp[1];
    if (webos) os.webos = true, os.version = webos[2];
    if (touchpad) os.touchpad = true;
    if (blackberry) os.blackberry = true, os.version = blackberry[2];
    if (bb10) os.bb10 = true, os.version = bb10[2];
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2];
    if (playbook) browser.playbook = true;
    if (kindle) os.kindle = true, os.version = kindle[1];
    if (silk) browser.silk = true, browser.version = silk[1];
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true;
    if (chrome) browser.chrome = true, browser.version = chrome[1];
    if (firefox) browser.firefox = true, browser.version = firefox[1];
    if (firefoxos) os.firefoxos = true, os.version = firefoxos[1];
    if (ie) browser.ie = true, browser.version = ie[1];
    if (safari && (osx || os.ios || win)) {
        browser.safari = true;
        if (!os.ios) browser.version = safari[1]
    }
    if (webview) browser.webview = true;
    if (wechat) browser.wechat = true;
    if (wxdebugger) browser.wxdebugger = true;
    if (googleInc) browser.googleInc = true;

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
        (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)));

    os.phone = !!(!os.tablet && !os.ipod && (android || iphone || ipad || webos || blackberry || bb10 ||
        (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
        (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))));
    $.os = os;
    //  $.browser.browser
    $("body").addClass(app.pageName);
    if ($.os.ios) {
        $("body").addClass("ios");
    } else {
        $("body").addClass("web");
    }
};

var commonObj = {
    //下拉选中的数据
    //绑定Nav 以及 搜索条件事件
    bindEvent_NavAndSearch: function(callback) {
        if(utilObj.userLogined.roleId == 5 || utilObj.userLogined.roleId == 4) {//支行或分行
            $("#top-select-wrap").show();

            //支行下拉
            if ($("#branch").size() > 0) {
                $("#branch").parents(".top-select").css({"display":"inline-block","margin-left":"0"});
                commonObj.getBankSelect($("#branch"),{employeeId: utilObj.userLogined.employeeId},"支行[All]");
            }

            //客户经理下拉
            if($("#manager").size() > 0){
                $("#manager").parents(".top-select").css("display","inline-block");
                $("#manager").html("<option>客户经理[All]</option>");
                $("#manager").select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
            }
        } else if(utilObj.userLogined.roleId == 3){//总行
            $("#top-select-wrap").show();
            $(".top-select").css("display","inline-block").eq(0).css("margin-left","0");
            //分行下拉
            if ($("#subsidiary").size() > 0) {
                commonObj.getBankSelect($("#subsidiary"), {employeeId: utilObj.userLogined.employeeId}, "分行[All]");
            }

            //支行下拉
            if ($("#branch").size() > 0) {
                $("#branch").html("<option>支行[All]</option>");
                $("#branch").select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
            }

            //客户经理下拉
            if($("#manager").size() > 0){
                $("#manager").html("<option>客户经理[All]</option>");
                $("#manager").select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
            }
        } else {

        }
    },
    bindQueryEvent: function(){
    	var dfds = [];
    	if(utilObj.userLogined.roleId == 5 || utilObj.userLogined.roleId == 4) {//支行或分行
            $("#top-select-wrap").show();

            //支行
            if ($("#branch").size() > 0) {
                $("#branch").parents(".top-select").css({"display":"inline-block","margin-left":"0"});
                var bankDfd = commonObj.loadBankSelect($("#branch"),{employeeId: utilObj.userLogined.employeeId},"支行[All]");
                dfds.push(bankDfd);
            }
            //客户经理下拉
            if($("#manager").size() > 0){
            	$("#manager").parents(".top-select").css("display","inline-block");
            	var managerDfd = commonObj.loadCustomerManagerSelect($("#manager"), null, '客户经理[All]');
            	dfds.push(managerDfd);
            }
        } else if(utilObj.userLogined.roleId == 3){//总行
            $("#top-select-wrap").show();
            $(".top-select").css("display","inline-block").eq(0).css("margin-left","0");
            
            //分行下拉
            if ($("#subsidiary").size() > 0) {
                var bankDfd = commonObj.loadBankSelect($("#subsidiary"), {
                	employeeId: utilObj.userLogined.employeeId,
//              	grade: '分行',
                }, "分行[All]");
                dfds.push(bankDfd);
            }

            //支行下拉
            if ($("#branch").size() > 0) {
                var bankDfd1 = commonObj.loadBankSelect($("#branch"), null, '支行[All]');
                dfds.push(bankDfd1);
            }

            //客户经理下拉
            if($("#manager").size() > 0){
            	var managerDfd = commonObj.loadCustomerManagerSelect($("#manager"), null, '客户经理[All]');
            	dfds.push(managerDfd);
            }
        } else {

        }
        return dfds;
    },
    loadBankSelect: function($_obj, sel_data, placeholder){
    	var dfd = $.Deferred();
    	var optstr = "<option value=''>"+placeholder+"</option>";
    	if(!sel_data){
    		$_obj.html(optstr).select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });
            return;
    	}
    	utilObj.ajax({
            url: "m/bank/findList",
            data: sel_data,
            success: function(data) {
                if (data && data.object && data.object.length > 0) {
                    _.each(data.object, function(v, i) {
                    	if(v.grade == "分行"){
                    		optstr += "<option value='" + v.bankId + "'>" + v.bankBranchName + "</option>";
                    	}else if(v.grade == "支行"){
                    		optstr += "<option value='" + v.bankId + "'>" + v.bankSubsetName + "</option>";
                    	}
                    });
                }
                $_obj.html(optstr).select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
                dfd.resolve();
            },
            error: function(e){
//              $_obj.select2("destroy");
                $_obj.html(optstr).select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
            }
        });
        return dfd.promise();
    },
    loadCustomerManagerSelect: function($_obj, sel_data, placeholder){
    	var dfd = $.Deferred();
    	var optstr = "<option value=''>"+placeholder+"</option>";
    	if(!sel_data){
    		$_obj.html(optstr).select2({
                width: "100%",
                language: selet2LangZh,
                minimumResultsForSearch: -1
            });
            return;
    	}
        utilObj.ajax({
            url: "m/employee/findManageList",
            data: sel_data,
            success: function(data) {
                if (data && data.object && data.object.length > 0) {
                    _.each(data.object, function(v, i) {
                        optstr += "<option value='" + v.employeeId + "'>" + v.employeeName + "</option>";
                    });
                }
                $_obj.html(optstr).select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
                dfd.resolve();
            },
            error: function(e){
//              $_obj.select2("destroy");
                $_obj.html(optstr).select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
            }
        });
        return dfd.promise();
    },
    loadYearSelect: function(){
    	$("#estimate").parents(".top-select").css("display","inline-block");
    	var curYear = new Date().getFullYear();
		var dfd = $.Deferred();
		utilObj.ajax({
			url: "m/customer/findCompleteDate",
			data: {
				employeeId: utilObj.userLogined.employeeId,
			},
			success: function(data){
				var optstr = "";
				if (data && data.object && data.object.length > 0) {
                    _.each(data.object, function(v, i) {
                        optstr += "<option value='" + v + "'>" + v + "年</option>";
                    });
                }
            	$("#estimate").html(optstr).select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });
                $("#estimate").val(curYear).trigger('change');
               	dfd.resolve(data);
			}
		});
		return dfd.promise();
    },
    loadCardSelect: function(card){//卡别
    	$("#card").parents(".top-select").css("display","inline-block");
		var dfd = $.Deferred();
		var data = {
			object: [
				{
					id: '白金卡',
					text: '白金卡',
				},
				{
					id: '金卡',
					text: '金卡',
				},
				{
					id: '银卡',
					text: '银卡',
				},
				{
					id: '普通卡',
					text: '普通卡',
				},
			],
		};
		var optstr = "";
		if (data && data.object.length > 0) {
            _.each(data.object, function(v, i) {
                optstr += "<option value='" + v.id + "'>" + v.text + "</option>";
            });
        }
    	$("#card").html(optstr).select2({
            width: "100%",
            language: selet2LangZh,
            minimumResultsForSearch: -1
        });
        if(card){
        	$("#card").val(card).trigger('change');
        }
       	dfd.resolve(data);
		
		return dfd.promise();
    },
    //银行下拉
    getBankSelect: function($_obj, sel_data, placeholder) {
        var dfd = $.Deferred();
        utilObj.ajax({
            url: "m/bank/findList",
            data: sel_data,
            success: function(data) {
                if (data && data.object && data.object.length > 0) {
                    var optstr = "<option value=''>"+placeholder+"</option>";
                    _.each(data.object, function(v, i) {
                        optstr += "<option value='" + v.bankId + "'>" + (v.grade == "支行" ? v.bankSubsetName : v.bankBranchName) + "</option>";
                    });
                    $_obj.html(optstr);
                } else { //没有数据
                    $_obj.html("<option></option>");
                }

                $_obj.select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });

                dfd.resolve(data);
            },
            error: function(e){
                $_obj.select2("destroy");
                $_obj.html(optstr).select2({
                    width: "100%",
                    language: selet2LangZh,
                    // placeholder: placeholder,
                    allowClear: true,
                    minimumResultsForSearch: -1
                });
                dfd.resolve(e);
            }
        });

        return dfd;
    },
    //绑定客户经理下拉选项
    getCustomerManager: function($_obj, sel_data, placeholder){
        var dfd = $.Deferred();
        utilObj.ajax({
            url: "m/employee/findList",
            data: sel_data,
            success: function(data) {
                if (data && data.object.length > 0) {
                    var optstr = "<option value=''>"+placeholder+"</option>";
                    _.each(data.object, function(v, i) {
                    	//将userId改成了employeeId by jc 171222
                        optstr += "<option value='" + v.employeeId + "'>" + v.employeeName + "</option>";
                    });
                    $_obj.html(optstr);
                    
                } else { //没有数据
                    $_obj.html("<option value=''>"+placeholder+"</option>");
                }

                $_obj.select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });

                dfd.resolve(data);
            },
            error: function(e){
                $_obj.select2("destroy");
                var optstr = "<option value=''>"+placeholder+"</option>";
                $_obj.html(optstr).select2({
                    width: "100%",
                    language: selet2LangZh,
                    minimumResultsForSearch: -1
                });

                dfd.resolve(e);
            }
        });

        return dfd;
    }
};
commonObj.colors = {
    pie: [
        'rgb(111,139,243)',
        'rgb(159,178,247)',
        'rgb(207,216,251)',
        'rgb(236,18,165)'
    ],
    bar: {
        standard: function() {
            return {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, '#21ADEE'],
                    [1, '#6E8DF1']
                ]
            };
        },
        nomeet: function() {
            return {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, '#ED7B1E'],
                    [1, '#EA1CA3']
                ]
            };
        },
    },
    text: {
        standard: function() {
            return "forestgreen";
        },
        nomeet: function() {
            return "red";
        }
    }
};

var Validator = { 
       IsNotEmpty: function (input) { 
      if (input != '') { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
	//验证数字(double类型) [可以包含负号和小数点] 
    IsNumber: function (input) { 
      var regex = /^-?\d+$|^(-?\d+)(\.\d+)?$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证整数 
    IsInteger: function (input) { 
      var regex = /^-?\d+$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
	//验证非负整数 
    IsIntegerNotNagtive: function (input) { 
      var regex = /^\d+$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
	 //验证正整数 
    IsIntegerPositive: function (input) { 
      var regex = /^[0-9]*[1-9][0-9]*$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
	 //验证小数 
    IsDecimal: function (input) { 
      var regex = /^([-+]?[1-9]\d*\.\d+|-?0\.\d*[1-9]\d*)$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    },    
 
	//验证只包含英文字母 
    IsEnglishCharacter: function (input) { 
      var regex = /^[A-Za-z]+$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证只包含数字和英文字母 
    IsIntegerAndEnglishCharacter: function (input) { 
      var regex = /^[0-9A-Za-z]+$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证只包含汉字 
    IsChineseCharacter: function (input) { 
      var regex = /^[\u4e00-\u9fa5]+$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证数字长度范围（数字前端的0计长度）[若要验证固定长度，可传入相同的两个长度数值] 
    IsIntegerLength: function (input, lengthBegin, lengthEnd) { 
      var pattern = '^\\d{' + lengthBegin + ',' + lengthEnd + '}$'; 
      var regex = new RegExp(pattern); 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
	//验证字符串包含内容 
    IsStringInclude: function (input, withEnglishCharacter, withNumber, withChineseCharacter) { 
      if (!Boolean(withEnglishCharacter) && !Boolean(withNumber) && !Boolean(withChineseCharacter)) { 
        return false; //如果英文字母、数字和汉字都没有，则返回false 
      } 
      var pattern = '^['; 
      if (Boolean(withEnglishCharacter)) { 
        pattern += 'a-zA-Z'; 
      } 
      if (Boolean(withNumber)) { 
        pattern += '0-9'; 
      } 
      if (Boolean(withChineseCharacter)) { 
        pattern += '\\u4E00-\\u9FA5'; 
      } 
      pattern += ']+$'; 
      var regex = new RegExp(pattern); 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证字符串长度范围 [若要验证固定长度，可传入相同的两个长度数值] 
    IsStringLength: function (input, LengthBegin, LengthEnd) { 
      var pattern = '^.{' + lengthBegin + ',' + lengthEnd + '}$'; 
      var regex = new RegExp(pattern); 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证字符串长度范围（字符串内只包含数字和/或英文字母）[若要验证固定长度，可传入相同的两个长度数值] 
    IsStringLengthOnlyNumberAndEnglishCharacter: function (input, LengthBegin, LengthEnd) { 
      var pattern = '^[0-9a-zA-z]{' + lengthBegin + ',' + lengthEnd + '}$'; 
      var regex = new RegExp(pattern); 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证字符串长度范围 [若要验证固定长度，可传入相同的两个长度数值] 
    IsStringLengthByInclude: function (input, withEnglishCharacter, withNumber, withChineseCharacter, lengthBegin, lengthEnd) { 
      if (!withEnglishCharacter && !withNumber && !withChineseCharacter) { 
        return false; //如果英文字母、数字和汉字都没有，则返回false 
      } 
      var pattern = '^['; 
      if (Boolean(withEnglishCharacter)) 
        pattern += 'a-zA-Z'; 
      if (Boolean(withNumber)) 
        pattern += '0-9'; 
      if (Boolean(withChineseCharacter)) 
        pattern += '\\u4E00-\\u9FA5'; 
      pattern += ']{' + lengthBegin + ',' + lengthEnd + '}$'; 
      var regex = new RegExp(pattern); 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
	//验证字符串字节数长度范围 [若要验证固定长度，可传入相同的两个长度数值；每个汉字为两个字节长度] 
    IsStringByteLength: function (input, lengthBegin, lengthEnd) { 
      var regex = /[^\x00-\xff]/g; 
      var byteLength = input.replace(regex, 'ok').length; 
      if (byteLength >= lengthBegin && byteLength <= lengthEnd) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
 
 
 	//验证日期 [只能验证日期，不能验证时间] 
    IsDateTime: function (input) { 
      if (Date.parse(input)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
	//验证固定电话号码 [3位或4位区号；区号可以用小括号括起来；区号可以省略；区号与本地号间可以用减号或空格隔开；可以有3位数的分机号，分机号前要加减号] 
    IsTelePhoneNumber: function (input) { 
      var regex = /^(((0\d2|0\d{2})[- ]?)?\d{8}|((0\d3|0\d{3})[- ]?)?\d{7})(-\d{3})?$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 	//验证手机号码 [可匹配"(+86)013325656352"，括号可以省略，+号可以省略，(+86)可以省略，11位手机号前的0可以省略；11位手机号第二位数可以是3、4、5、8中的任意一个] 
    IsMobilePhoneNumber: function (input) { 
      var regex = /^((\+)?86|((\+)?86)?)0?1[3458]\d{9}$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 //验证电话号码（可以是固定电话号码或手机号码） 
    IsPhoneNumber: function (input) { 
      var regex = /^((\+)?86|((\+)?86)?)0?1[3458]\d{9}$|^(((0\d2|0\d{2})[- ]?)?\d{8}|((0\d3|0\d{3})[- ]?)?\d{7})(-\d{3})?$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 	//验证邮政编码 
    IsZipCode: function (input) { 
      var regex = /^\d{6}$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 	//验证电子邮箱 [@字符前可以包含字母、数字、下划线和点号；@字符后可以包含字母、数字、下划线和点号；@字符后至少包含一个点号且点号不能是最后一个字符；最后一个点号后只能是字母或数字] 
    IsEmail: function (input) { 
      ////邮箱名以数字或字母开头；邮箱名可由字母、数字、点号、减号、下划线组成；邮箱名（@前的字符）长度为3～18个字符；邮箱名不能以点号、减号或下划线结尾；不能出现连续两个或两个以上的点号、减号。 
      //var regex = /^[a-zA-Z0-9]((?<!(\.\.|--))[a-zA-Z0-9\._-]){1,16}[a-zA-Z0-9]@([0-9a-zA-Z][0-9a-zA-Z-]{0,62}\.)+([0-9a-zA-Z][0-9a-zA-Z-]{0,62})\.?|((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/; 
      var regex = /^([\w-\.]+)@([\w-\.]+)(\.[a-zA-Z0-9]+)$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 	//验证网址（可以匹配IPv4地址但没对IPv4地址进行格式验证；IPv6暂时没做匹配）[允许省略"://"；可以添加端口号；允许层级；允许传参；域名中至少一个点号且此点号前要有内容] 
    IsURL: function (input) { 
      ////每级域名由字母、数字和减号构成（第一个字母不能是减号），不区分大小写，单个域长度不超过63，完整的域名全长不超过256个字符。在DNS系统中，全名是以一个点“.”来结束的，例如“www.nit.edu.cn.”。没有最后的那个点则表示一个相对地址。  
      ////没有例如"http://"的前缀，没有传参的匹配 
      //var regex = /^([0-9a-zA-Z][0-9a-zA-Z-]{0,62}\.)+([0-9a-zA-Z][0-9a-zA-Z-]{0,62})\.?$/; 
  
      //var regex = /^(((file|gopher|news|nntp|telnet|http|ftp|https|ftps|sftp)://)|(www\.))+(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(/[a-zA-Z0-9\&%_\./-~-]*)?$/; 
      var regex = /^([a-zA-Z]+:\/\/)?([\w-\.]+)(\.[a-zA-Z0-9]+)(:\d{0,5})?\/?([\w-\/]*)\.?([a-zA-Z]*)\??(([\w-]*=[\w%]*&?)*)$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 	//验证IPv4地址 [第一位和最后一位数字不能是0或255；允许用0补位] 
    IsIPv4: function (input) { 
      var regex = /^(25[0-4]|2[0-4]\d]|[01]?\d{2}|[1-9])\.(25[0-5]|2[0-4]\d]|[01]?\d?\d)\.(25[0-5]|2[0-4]\d]|[01]?\d?\d)\.(25[0-4]|2[0-4]\d]|[01]?\d{2}|[1-9])$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 	//验证IPv6地址 [可用于匹配任何一个合法的IPv6地址] 
    IsIPv6: function (input) { 
      var regex = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
 	//验证身份证号 [可验证一代或二代身份证] 
    IsIDCard: function (input) { 
      input = input.toUpperCase(); 
      //验证身份证号码格式 [一代身份证号码为15位的数字；二代身份证号码为18位的数字或17位的数字加字母X] 
      if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/i.test(input))) { 
        return false; 
      } 
      //验证省份 
      var arrCity = { 11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江 ', 31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 91: '国外' }; 
      if (arrCity[parseInt(input.substr(0, 2))] == null) { 
        return false; 
      } 
       
 
	//验证出生日期 
      var regBirth, birthSplit, birth; 
      var len = input.length; 
      if (len == 15) { 
        regBirth = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/); 
        birthSplit = input.match(regBirth); 
        birth = new Date('19' + birthSplit[2] + '/' + birthSplit[3] + '/' + birthSplit[4]); 
        if (!(birth.getYear() == Number(birthSplit[2]) && (birth.getMonth() + 1) == Number(birthSplit[3]) && birth.getDate() == Number(birthSplit[4]))) { 
          return false; 
        } 
        return true; 
      } 
      else if (len == 18) { 
        regBirth = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/i); 
        birthSplit = input.match(regBirth); 
        birth = new Date(birthSplit[2] + '/' + birthSplit[3] + '/' + birthSplit[4]); 
        if (!(birth.getFullYear() == Number(birthSplit[2]) && (birth.getMonth() + 1) == Number(birthSplit[3]) && birth.getDate() == Number(birthSplit[4]))) { 
          return false; 
        } 
        //验证校验码 
        var valnum; 
        var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); 
        var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'); 
        var nTemp = 0, i; 
        for (i = 0; i < 17; i++) { 
          nTemp += input.substr(i, 1) * arrInt[i]; 
        } 
        valnum = arrCh[nTemp % 11]; 
        if (valnum != input.substr(17, 1)) { 
          return false; 
        } 
        return true; 
      } 
      return false; 
    }, 
     
 
 	//验证经度 
    IsLongitude: function (input) { 
      var regex = /^[-\+]?((1[0-7]\d{1}|0?\d{1,2})\.\d{1,5}|180\.0{1,5})$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    }, 
     
 
	//验证纬度 
    IsLatitude: function (input) { 
      var regex = /^[-\+]?([0-8]?\d{1}\.\d{1,5}|90\.0{1,5})$/; 
      if (input.match(regex)) { 
        return true; 
      } else { 
        return false; 
      } 
    } 
};

/**
 * template过滤器
 */
//返回是或否
template.defaults.imports.isOrNot = function(value){
	var res = '';
	if(value == 0){
		res = '否';
	}else if(value == 1){
		res = '是';
	}
	return res;
};
//存在风险或正常
template.defaults.imports.risk = function(value){
	var res = '';
	if(value === 0){
		res = '正常';
	}else if(value == 1){
		res = '存在风险';
	}
	return res;
};
//当文本内容为空时返回————
template.defaults.imports.placeholder = function(value){
	if (!value) {
		return '——';
	}
	return value;
};
//处理数量，返回逗号分隔的字符
template.defaults.imports.amount = function(value){
	var res = '';
	if(value == null || value == undefined || value == ''){
		res = '——';
	}else{
		res = String(value).replace(/(\d)(?=(\d{3})+$)/g, "$1,");
	}
	return res;
};
//处理换行符
template.defaults.imports.formatCode = function(value){
	if(value){
		return value.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, ' ');  
	}else{
		return '';
	}
};
//日期
template.defaults.imports.date = function(value){
    return new Date(value).format('yyyy-MM-dd hh:mm');  
};
//百分比
template.defaults.imports.rate = function(value){
    var res = 0;
    if(value){
    	res = value;
    }
    return res+'%';
};
//特殊百分比
template.defaults.imports.rateSpecial = function(val){
    var percent = 0;
    if(val){
    	percent = val;
    }
	if(percent<10){
		percent = Math.round(percent*100)/100;
	}else if(percent>10 && percent<300){
		percent = Math.round(percent);
	}else{
		percent = Math.round(percent)/100;
		return percent;
	}
	return percent+'%';
};
//保留整数
template.defaults.imports.getInt = function(val){
	var res = 0;
	if(val){
		res = parseInt(val);
	}
	return res;
}