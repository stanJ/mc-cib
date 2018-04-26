$(function(){
	$(document).on('click', '.tabs__item', function(){
		console.log('dianji');
		$(this).siblings('.tabs__item').removeClass('is-active');
		$(this).addClass('is-active');
	})
})