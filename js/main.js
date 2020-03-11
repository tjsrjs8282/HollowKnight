// ===============js plugin srart=============
		 new WOW().init();		




		// var scene2 = document.getElementById('scene2');
		// var parallax2 = new Parallax(scene2);
// ===============js plugin end=============

// ===============loding page start==============
	function aniBox(){
		$('.lodingBoxWrap').hide();
	}

	setTimeout(aniBox ,5000); 
// ===============loding page end==============

// ===============scroll 100vh start============
$(".section").each(function () {
    // 개별적으로 Wheel 이벤트 적용
    $(this).on("mousewheel DOMMouseScroll", function (e) {
        e.preventDefault();
        var delta = 0;
        if (!event) event = window.event;
        if (event.wheelDelta) {
            delta = event.wheelDelta / 120;
            if (window.opera) delta = -delta;
        } else if (event.detail) delta = -event.detail / 5;
        var moveTop = null;
        // 마우스휠을 위에서 아래로
        if (delta < 0) {
            if ($(this).next() != undefined) {
                moveTop = $(this).next().offset().top;
            }
        // 마우스휠을 아래에서 위로
        } else {
            if ($(this).prev() != undefined) {
                moveTop = $(this).prev().offset().top;
            }
        }
        // 화면 이동 0.8초(800)
        $("html,body").stop().animate({
            scrollTop: moveTop + 'px'
        }, {
            duration: 10, complete: function () {
            }
        });
    });
});
// ===============scroll 100vh end============

// ============next & down btn / resize srart=============
		// The resize function
		function resize() {
		  var vheight = $(window).height();
		  var vwidth = $(window).width();
		  $('.section').css({
		    'height': vheight,
		    'width': vwidth 
		  });
		};

		// The scroll-up function
		function scrollUp() {
		  var vheight = $(window).height();
		  $('html, body').animate({
		    scrollTop: (Math.ceil($(window).scrollTop() / vheight)-1) * vheight
		  }, 200);
		};

		// The scroll-down function
		function scrollDown() {
		  var vheight = $(window).height();
		  $('html, body').animate({
		    scrollTop: (Math.floor($(window).scrollTop() / vheight)+1) * vheight
		  }, 200);  
		};

		$(document).ready(function(){
		  resize();
		  
		  $('.scroll-next').click(function(event){
		    scrollDown();
		    event.preventDefault();
		  });
		  
		  $('.scroll-prev').click(function(event){
		    scrollUp();
		    event.preventDefault();
		  });
		 
		});
// =============next & down btn / resize end============

$(function(){
// ===============action move start==============
	function action(){
			var hheight = $("html").scrollTop();
			//console.log(scroll);
			if (hheight > 200) {
				//console.log('a');
				$(".action").addClass("black");
			}
			else {
				//console.log('a');
				$(".action").removeClass("black");
			}
		};
		$(window).scroll(function() {
			resize();
			action();
		});

		$("html").mousemove(function(){
			resize();
			action();
		});

		$(window).resize(function(){
		  resize();
		  action();
		});
// ===============action move end==============

// ===============Navigation start==============	
	$(window).scroll(function navOn(){
		navBar();
	});

	$(".navbarBtnBox > a").mouseover(function(){
		$(".navbarBtnBox > a").removeClass('on');
		$(this).addClass('on');
	});

	$(".navbarBtnBox > a").mouseout(function(){
		navBar()
	});

	function navBar(){
		var secNum = $(".section");
		var scrollY = $("html").scrollTop()
		var navAf = 4
		secNum.each(function (index){
			navAf++;
			if(navAf == 6){navAf = 0}
			if( index >= 0)
			if(scrollY >= secNum.eq(index).offset().top-115){
				$(".navbarWrap > div").removeClass("on").eq(index).addClass("on");
				$(".navbarBtnBox > a").removeClass("on").eq(navAf).addClass("on");
				$(".navbarSpanBox > span").removeClass('on');
			}
			if( index >= 1)
				if(scrollY >= secNum.eq(index).offset().top-115){
					$(".navbarSpanBox > span").removeClass("on").eq(index-1).addClass("on");
			}
		});
	};
// ===============Navigation end==============	

// ===============start character start==============	
	var StChImg = $(".start_img_Box > .Stch")
		$(".stBtn").mouseover(function(){
			StChImg.attr("src","images/hollow_start_hover.png");
			StChImg.css({
				"width":300,
				"height":300
			})
		});

		$(".stBtn").mouseout(function(){
			StChImg.attr("src","images/hollow_start.png");
			StChImg.css({
				"width":230,
				"height":280
			})
		});
// ===============start character end==============	

	// ===============sound play start==============
	if($(window).length) {
	var audio = document.getElementById("audio-player");
	var silk = document.getElementById("audio-player-silk");
	var nightmare = document.getElementById("audio-player-nightmares");
    audio.volume = 0.2;
    silk.volume = 0.2;
    nightmare.volume = 0.2;
		$('body').addClass("audio-on");
		if ($('body').hasClass('audio-off')) {
        	$('body').removeClass('audio-on');
		} 
		$(".sound_CDBox > ul > li").on('click', function() {
			$('body').toggleClass("audio-on audio-off");         
				if ($('body').hasClass('audio-off')) {
				// audio.currentTime = 0;
				// silk.currentTime = 0;
				// nightmare.currentTime = 0;
				audio.pause();
				silk.pause();
				nightmare.pause();
			}
		});
		$(".ost").on('click', function() { 
				if ($('body').hasClass('audio-on')) {
				silk.pause();
				nightmare.pause();
				audio.play();
			}
		});
		$(".silk").on('click', function() { 
				if ($('body').hasClass('audio-on')) {
				nightmare.pause();
				audio.pause();
				silk.play();
			}
		});
		$(".nightmare").on('click', function() { 
				if ($('body').hasClass('audio-on')) {
				audio.pause();
				silk.pause();
				nightmare.play();
			}
		});
		$(".sound_fiexdIcon").click(function(){
			$(".ostMusic_Wrap").toggleClass('active');
		});
		$(".music_closeBtn").click(function(){
			$(".ostMusic_Wrap").removeClass('active');
		});

		$(".soundSlider_prevBtn").click(function(){
		var cdNum = $(".sound_CDBox > ul > li.active").index();
		var txtNum = $(".music_sliderBtnbox > ul > li.active").index();
		var SpNum = $(".music_sliderNavBtn > span.active").index();
		var cdList = $(".sound_CDBox > ul > li");
		var cdBtnList = $(".music_sliderBtnbox > ul > li");
		var cdNavBtnList = $(".music_sliderNavBtn > span");
		$('body').removeClass('audio-on');
		$('body').addClass('audio-off');
			audio.pause();
			silk.pause();
			nightmare.pause();
			cdList.removeClass();
			cdBtnList.removeClass();
			cdNavBtnList.removeClass();
			if(cdNum >= 0){
				cdList.eq(cdNum - 1).addClass('active');
				cdBtnList.eq(txtNum - 1).addClass('active');
				cdNavBtnList.eq(SpNum - 1).addClass('active');
			} else if(cdNum == 0){
				cdList.eq(cdList.length).addClass('active');
				cdBtnList.eq(cdList.length).addClass('active');
				cdNavBtnList.eq(cdList.length).addClass('active');
			}	
		});

		$(".soundSlider_nextBtn").click(function(){
		var cdNum = $(".sound_CDBox > ul > li.active").index();
		var txtNum = $(".music_sliderBtnbox > ul > li.active").index();
		var SpNum = $(".music_sliderNavBtn > span.active").index();
		var cdList = $(".sound_CDBox > ul > li");
		var cdBtnList = $(".music_sliderBtnbox > ul > li");
		var cdNavBtnList = $(".music_sliderNavBtn > span");
		$('body').removeClass('audio-on');
		$('body').addClass('audio-off');
			audio.pause();
			silk.pause();
			nightmare.pause();
			cdList.removeClass();
			cdBtnList.removeClass();
			cdNavBtnList.removeClass();
			if(cdNum < 2){
				cdList.eq(cdNum + 1).addClass('active');
				cdBtnList.eq(txtNum + 1).addClass('active');
				cdNavBtnList.eq(SpNum + 1).addClass('active');
			} else if(cdNum == 2){
				cdList.eq(0).addClass('active');
				cdBtnList.eq(0).addClass('active');
				cdNavBtnList.eq(0).addClass('active');
			}	
		});


	}
// ===============sound play end==============

// ===============hambargerNav & setting start==============
	var Hamberger = $('.hambergerIcon');
	var NavWrap = $('.menuNavWrap');
	var BlackWrap = $('.menuNavBlack');
	var MenuBox = $(".menuNavBox");
	var SetBox = $(".settingBox");
		// =====hambarger======
		Hamberger.click(function(){
			Hamberger.toggleClass('active');
			NavWrap.toggleClass('active');
			BlackWrap.toggleClass('active');
		});
		$(".navBtn").click(function(){
			Hamberger.removeClass('active');
			NavWrap.removeClass('active');	
			BlackWrap.removeClass('active');	
		});
		$(".clsBtn").click(function(event){
			Hamberger.removeClass('active');
			NavWrap.removeClass('active');		
			BlackWrap.removeClass('active');
			event.preventDefault();	
		});
		// =====hambarger======

		// =====setting======
		$(".sttBtn").click(function(event){
			MenuBox.hide();
			SetBox.show();
			event.preventDefault();
		});
		$(".sttBtnBack").click(function(event){
			SetBox.hide();
			MenuBox.show();
			event.preventDefault();
		});

		$(".lineBox_StBox").click(function(){
			var FlineBox = $(".fixed_lineBox");
			if($(".line_ChBtn").prop('checked')){
				FlineBox.css({"display":"block"});
			}else{
				FlineBox.css({"display":"none"});
			}
		});

		$(".scroll_StBox").click(function(){
			if($(".scroll_ChBtn").prop('checked')){
				$("body").css({"overflow":"visible"});
			}else{
				$("body").css({"overflow":"hidden"});
			}
		});

		$(".audio_StBox").click(function(event){
			alert("왼쪽 하단에 LP아이콘을 이용해주세요.");
			event.preventDefault();
		});
		// =====setting======
// ===============hambargerNav & setting end==============

// ===============modal Box start==============
	var VideoBox = $(".main_video_Box");
	var ModalWrap = $('.modalWrap');
	
		$(".TvBtn").click(function(){
			ModalWrap.addClass('active');
			VideoBox.addClass('no');
			$('.modalWrap > div').eq(0).addClass('active');
		});

		$(".TvclsBtn").click(function(event){
			ModalWrap.removeClass('active');
			VideoBox.removeClass('no');
			$('.modalWrap > .modal_Box').removeClass('active');
			event.preventDefault();
		});

		$(".modal_black").click(function(event){
			ModalWrap.removeClass('active');
			VideoBox.removeClass('no');
			$('.modalWrap > .modal_Box').removeClass('active');
			event.preventDefault();
		});

		$(".content_cardBox > img").click(function(){
			var CtNum = $(this).index();
			ModalWrap.addClass('active');
			$(".modalWrap > .modal_Box").eq(CtNum + 1).addClass('active');
		});

		$(".silkTrailerBox > .silkTrailer").click(function(){
			var TraNum = $(this).index();
			ModalWrap.addClass('active');
			$(".modalWrap > .modal_Box").eq(TraNum + 5).addClass('active');
		});
// ===============modal Box end==============
	
// ===============character Box start============
	var chList = $(".character_listBox > ul > li");
	var chBoxList = $(".character_imagesBox > div");
	var chConList = $(".character_contentBox > .character_content")
		
		chList.click(function(){
			var liNum = $(this).index();
			$(".character_listBox").fadeOut();
			$(".character_contentBox").addClass("active");
			chConList.eq(liNum).addClass("active");
		});

		$(".chClsBtn").click(function(event){
		$(".character_contentBox").removeClass("active");
			chConList.removeClass("active");
		$(".character_contentBox").fadeOut();
		$(".character_listBox").fadeIn();
		event.preventDefault();
});

// ===============character Box end============

// ===============content hover start============
		$(".content_cardBox > img").mouseover(function(){
			var liNum = $(this).index();
			var ctHoverList = [ 
				"images/content1_on.png",
				"images/content2_on.png",
				"images/content3_on.png",
				"images/content4_on.png"
				]
				$(this).attr("src",ctHoverList[liNum]);
		});

		$(".content_cardBox > img").mouseout(function(){
			var liNum = $(this).index();
			var ctHoverList = [ 
				"images/content1_off.png",
				"images/content2_off.png",
				"images/content3_off.png",
				"images/content4_off.png"
				]
				$(this).attr("src",ctHoverList[liNum]);
		});
// ===============content hover end============

});


