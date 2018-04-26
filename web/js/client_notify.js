define(function(require, exports, module){
	var page = {
		getPlanCount: function(accountPlanningId, planningStatus){
			if(!accountPlanningId){
				setTimeout(function(){
					$(".client-notify--plan").hide();
				}, 0)
				return;
			}
			utilObj.ajax({
				url: 'm/customerPlant/count',
				data: {
					accountPlanningId: accountPlanningId,
				},
				success: function(data){
					var count = utilObj.toNumber(data.object);
					$(".client-notify--plan").text('('+count+')');
					if(planningStatus == 0 || planningStatus == 4){//未提交或已拒绝
						$(".client-notify--plan").show();
					}else{//其余不显示
						$(".client-notify--plan").hide();
					}
				}
			})
		},
		getClueCount: function(accountPlanningId){
			if(!accountPlanningId){
				setTimeout(function(){
					$(".client-notify--clue").hide();
				}, 0)
				return;
			}
			$(".client-notify--clue").show();
			utilObj.ajax({
				url: 'm/track/findTrackAlertCount',
				data: {
					accountPlanningId: accountPlanningId,
				},
				success: function(data){
					var count = utilObj.toNumber(data.object.count);
					$(".client-notify--clue").text('('+count+')');
				}
			})
		},
	}
	module.exports = {
		getPlanCount: page.getPlanCount,
		getClueCount: page.getClueCount,
	}
});