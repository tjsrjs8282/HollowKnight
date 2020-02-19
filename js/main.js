// ===============js plugin srart=============
		 new WOW().init();		

		 $('.modal').colorbox();

		// var scene = document.getElementById('scene');
		// var parallax = new Parallax(scene);
		// var scene2 = document.getElementById('scene2');
		// var parallax2 = new Parallax(scene2);

// ===============js plugin end=============


// ===============action move start==============
		function action(){
			var scrolltop = $(window).scrollTop();
			var hheight = $("html").scrollTop();
			var vheight = $(window).height();
			//console.log(scroll);
			if (hheight > vheight - 400) {
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
// ===============action move end==============

// ===============navigation start==============
		$('.hambergerIcon').click(function(){
			$('.hambergerIcon').toggleClass('active');
			$('.menuNavWrap').toggleClass('active');
		});

		$(".stBtn").mouseover(function(){
			$(".start_img_Box > img").attr("src","images/hollow_start_hover.png");
			$(".start_img_Box > img").css({
				"width":300,
				"height":300
			})
		});

		$(".stBtn").mouseout(function(){
			$(".start_img_Box > img").attr("src","images/hollow_start.png");
			$(".start_img_Box > img").css({
				"width":230,
				"height":280
			})
		});

		$(".navBtn").click(function(){
			$(".menuNavWrap").removeClass('active');
			$(".hambergerIcon").removeClass('active');
		});

		$(".sttBtn").click(function(){
			$(".menuNavBox").hide();
			$(".settingBox").show();
			event.preventDefault();
		});

		$(".sttBtnBack").click(function(){
			$(".settingBox").hide();
			$(".menuNavBox").show();
			event.preventDefault();
		});

		$(".clsBtn").click(function(){
			$(".menuNavWrap").removeClass('active');
			$(".hambergerIcon").removeClass('active');
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

		$(".audio_StBox").click(function(){
			alert("2020년 1월부로 배경음악 지원이 중단됬습니다.");
			event.preventDefault();
		});


// ===============scroll 100vh btn srart=============

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

		$(window).resize(function(){
		  resize();
		});

// ===============scroll 100vh btn srart=============