/*
***STARTING JAVASCRIPT ADD OPTIONS AS NEEDED***
$("#rotatorContainer").slideThis();

<!--***HTML STRUCTURE FOR ROTATOR CONTAINER AND NAVIGATION***-->
<div id="rotatorContainer">
	<!-- start slide 1 -->
	<div>
		<p>add the content you want inside the div</p>
	</div>
	<!-- end slide 1 -->
	<!-- start slide 2 -->
	<div>
		<ul>
			<li><p>anything really</p></li>
		</ul>
	</div>
	<!-- end slide 2 -->
	<!-- start slide 3 -->
	<div>
		<p>and as much as you want</p>
	</div>
	<!-- end slide 3 -->
</div>

<!--***NEED ONE OUT OF THE 2 OPTIONAL NAVIGATIONS TO WORK CORRECTLY***-->
<!--***OPTIONAL FULL NAVIGATION***-->
<ul id="navRotator">
	<li><a href="#">1</a></li>
	<li><a href="#">2</a></li>
	<li><a href="#">3</a></li>
</ul>

<!--***OPTIONAL PREVIOUS/NEXT BUTTONS***-->
<a id="prev" href="#">prev</a>
<a id="next" href="#">next</a>

***PLUGIN DEFAULT SETTINGS***
navFull: true,					// turn full navigation control on or off
navContainer: "#navRotator",	// set the id of the full navigation container
navArrows: false,				// turn prev/next navigation control on or off
prevID: "#prev",				// set previous button id
nextID: "#next",				// set next button id
startIndex: 1,					// set the starting slide position for rotator
duration: 500,					// set the length of time it takes for animation to complete
positionOffset: 0,				// set the offset the rotator
orientation: "horizontal",		// set the direction of the slide animation horizontal / vertical
sectionSize: "containerSize",	// set the width/height of the slides in the rotator
autoPlay: false,				// set automation to true or false
continious: false,				// jumps back to beginning if true stops if false
pause: 3000,					// set the amount of time between automated animatations
transition: "slide"				// "fade" , "crossfade" , "slide"
dynamicContent: false,			 / change to false if you do not want to use ajax to load your html into the slide
								 / does not work with prev/next buttons
								 / not all the links need to be dynamic
								 / example html: <a href="#example.html">example</a>
dynamicSlideSize: false,		// 
sectionContainer: "div"			// this can be li or div
								// li means that you are using the unordered list tag for the slider
touchActive: true				// not implemented

***ADDITIONAL NOTES***
1. The plugin will add another div inside the #rotatorContainer div with the class name baseContainer that surrounds all the sections
2. The html needs to match what you see above except inside the section div container or a tags
3. You can add extra attribute to any html element that you want

*/


(function($){
$.slideThis = function(element, options) {
	var that = this;
    
	that.options = {};
	element.data("slideThis", this);
	
	that.init = function(element, options) {
		
		that.options = $.extend({}, $.slideThis.defaultOptions, options);
		
		var $navLinks			= $("a", that.options.navContainer);
		var sectionTagSelector	= that.options.sectionContainer == "div" ? "> div" : "> li";
		var totalPages			= that.options.sectionContainer == "div" ? $("> div",element).length : $("> ul > li",element).length;
			totalPages			= that.options.showing >= 2 ? totalPages - (that.options.showing - 1) : totalPages;
		var direction			= that.options.orientation == "horizontal" ? "left" : "top";
		var containerSize;
		var $baseContainer;
		var currentIndex		= that.options.startIndex;
		var firstMove			= 0;
		
		if(that.options.sectionContainer == "div"){
			element.wrapInner("<div class='baseContainer' style='position:relative;' />");
		} else {
			$("ul",element).addClass("baseContainer");
		}
		$baseContainer = $(".baseContainer", element);	
		
		switch (that.options.transition){
			case "slide" :
				switch (that.options.orientation){
					case "horizontal" :
						containerSize = that.options.sectionSize === "containerSize" ? element.width() : that.options.sectionSize;
						element.css({"overflow" : "hidden", "width" : containerSize, "height" : element.height(true), "position" : "relative"});
						$(sectionTagSelector,$baseContainer).css({"float" : "left", "min-height" : "1px"});
						$baseContainer.css({"width" : element.width() * totalPages , "position" : "relative"});
						if(!that.options.dynamicSlideSize){
							$(sectionTagSelector,$baseContainer).width(containerSize);
						}
						break;
					case "vertical" :
						containerSize = that.options.sectionSize === "containerSize" ? element.height() : that.options.sectionSize;
						element.css({"overflow" : "hidden", "position" : "relative"});
						$baseContainer.height(element.height() * totalPages);
						if(!that.options.dynamicSlideSize){
							$(sectionTagSelector,$baseContainer).height(containerSize);
						}
						break;
					default :
						console.log("orientation not defined correctly '" + that.options.orientation + "' check your spelling");	
				}
				break;
			case "crossfade" :
				$(sectionTagSelector,$baseContainer).css({"position" : "absolute", "display" : "none"});
				$(sectionTagSelector + ":first-child",$baseContainer).show();
				break;
			case "fade" :
				$(sectionTagSelector,$baseContainer).css({"position" : "absolute", "display" : "none"});
				$(sectionTagSelector + ":first-child",$baseContainer).show();
				break;
			default :
				console.log("transition type not recognized");
		}
		
		if(totalPages <= 1){
			//CANCELS EVERYTHING IF THERE IS ONLY ONE SLIDE IN THE ROTATION
			$(that.options.prevID).add(that.options.nextID).addClass("disabled");
			if(that.options.positionOffset > 0){
				$baseContainer.css({"left" : that.options.positionOffset});
			}
			return false;
		}
		
		if(that.options.navArrows){			
			bindNavArrows();
		}
		
		if(that.options.navFull){
			if(that.options.dynamicContent){
				$navLinks.append("<span class='loadgif'></span>");
			}
			
			$navLinks.click(function(evt){
				evt.preventDefault();
				
				if(that.options.dynamicContent && !$(this).hasClass("loaded")){
					if($(this).attr("href").length > 1){
						var nextIndex = $navLinks.index($(this)) + 1;
						getContent($(this), nextIndex, true);
					} else {
						setupSectionRotation({
							trigger: $(this),
							navigation: "links"
						});
					}
				} else {
					setupSectionRotation({
						trigger: $(this),
						navigation: "links"
					});
				}
			});
		}
		
		if(that.options.autoPlay){
			var autoPlay = setInterval(function (){ setupSectionRotation({navigation: 'auto'}) }, that.options.pause);
			var play = true;
			
			
			$(that.options.prevID).add(that.options.nextID).add(element).mouseenter(function(){
				clearInterval(autoPlay);
				play = false;
			}).mouseleave(function(){
				setupInterval();
			});
			
			function setupInterval(){
				if(!play){
					autoPlay = setInterval(function (){ setupSectionRotation({navigation: 'auto'}) }, that.options.pause);
					play = true;
				}
			}
		}
		
		//getting first slide setup and arrow navigation
		if(that.options.startIndex == 1 && that.options.dynamicContent){
			getContent($("li:nth-child(" + that.options.startIndex + ") a",that.options.navContainer,false), that.options.startIndex);
		} else if (that.options.startIndex == 1 && that.options.positionOffset > 0){
			animateSlide(0, that.options.startIndex);
		} else if(that.options.startIndex == 1 && !that.options.continious){
			setDisabled();
		}
		
		if(that.options.startIndex > 1){	
			if(that.options.dynamicSlideSize == true && that.options.startIndex > 1){
				var slideSizes = new Array();
				
				$(sectionTagSelector,$baseContainer).each(function(i, object){
					if(that.options.orientation == "horizontal"){
						slideSizes[i] = $(object).outerWidth(true);
					} else {
						slideSizes[i] = $(object).outerHeight(true);
					}
				});
				
				for(var a = 0; a <= (that.options.startIndex - 2); a++){
					firstMove += slideSizes[a];
				}
				
				firstMove = firstMove * -1;	
			} else {
				firstMove = ((that.options.startIndex - 1) * containerSize) * -1;
			}
			animateSlide(firstMove, that.options.startIndex);
		}
		
		function setupSectionRotation(para){
			var nextIndex;
			var animationDistance = 0;
			
			switch (para.navigation){
				case "arrows" :
					
					if(!that.options.continious){
						nextIndex = para.trigger.attr("id") == that.options.prevID.replace("#","") ? currentIndex - 1 : currentIndex + 1;
					} else {
						nextIndex = para.trigger.attr("id") == that.options.prevID.replace("#","") ? currentIndex - 1 : currentIndex + 1;
						if(nextIndex > totalPages){
							nextIndex = 1;
						} else if(nextIndex < 1) {
							nextIndex = totalPages;
						}
					}
					break;
				case "links" :
					nextIndex = $navLinks.index(para.trigger) + 1;
					break;
				case "auto" :
					if(!that.options.continious){
						if(nextIndex == totalPages){
							return false;	
						} else {
							nextIndex = currentIndex >= totalPages ? totalPages : currentIndex + 1;
						}
					} else {
						nextIndex = currentIndex >= totalPages ? 1 : currentIndex + 1;	
					}
					break;
				default :
					console.log("i sense something strange with the navigation");
			}
			
			switch(that.options.transition){
				case "slide" :
					if(that.options.dynamicSlideSize == true){
						var slideSizes = new Array();
						
						$(sectionTagSelector,$baseContainer).each(function(i, object){
							if(that.options.orientation == "horizontal"){
								slideSizes[i] = $(object).outerWidth(true);
							} else {
								slideSizes[i] = $(object).outerHeight(true);
							}
						});
						
						for(var a = 0; a <= (nextIndex - 2); a++){
							animationDistance += slideSizes[a];
						}
							
						animationDistance = animationDistance * -1;
					} else {
						animationDistance = ((nextIndex - 1) * containerSize) * -1;
					}
					animateSlide(animationDistance, nextIndex);
					break;
				case "crossfade" :
					animateCrossfade(nextIndex);
					break;
				case "fade" :
					animateFade(nextIndex);
					break;
				default :
					console.log("transition type not recognized");
			}
			
		}
		
		function animateSlide(animationDistance, nextIndex){
			var args = {};
			args[direction] = animationDistance + that.options.positionOffset;
			
			$baseContainer.stop().animate(args, that.options.duration, transitionComplete(nextIndex));
		}
		
		function animateCrossfade(nextIndex){
			$(sectionTagSelector + ":nth-child("+ currentIndex +")", $baseContainer).fadeOut(that.options.duration);
			$(sectionTagSelector + ":nth-child("+ nextIndex +")", $baseContainer).fadeIn(that.options.duration, transitionComplete(nextIndex));
		}
		
		function animateFade(nextIndex){
			$(sectionTagSelector + ":nth-child("+ currentIndex +")", $baseContainer).fadeOut(that.options.duration, function(){
				$(sectionTagSelector + ":nth-child("+ nextIndex +")", $baseContainer).fadeIn(that.options.duration, transitionComplete(nextIndex));	
			});
		}
		
		function transitionComplete(nextIndex){
			currentIndex = nextIndex;
			if(that.options.navArrows && !that.options.continious){
				setDisabled();
			}
			if(that.options.navFull){
				$navLinks.parent().removeClass("active");
				$("li:nth-child("+ nextIndex +")",that.options.navContainer).addClass("active");
			}
			if (typeof that.options.onSeek == 'function') { // make sure the callback is a function
				that.options.onSeek.call(this); // brings the scope to the callback
			}	
		}
		
		function getContent(trigger, index, animateBool){
			var url = $(trigger).attr("href").replace("#","");		
			
			$(trigger).addClass("loading");
			
			$(sectionTagSelector + ":nth-child(" + index + ")", $baseContainer).load(url, function(response, status, xhr) {
				if (status == "error") {
					console.log("Sorry but there was an error: " + xhr.status + " " + xhr.statusText);
				} else {
					//added timeout to help make the animation smoother after the load
					window.setTimeout( function(){
						if(animateBool){
							setupSectionRotation({
								trigger: trigger,
								navigation: "links"
							});
						} else {
							if(that.options.navArrows && !that.options.continious){
								setDisabled();
							}
							if(that.options.navFull){
								$navLinks.parent().removeClass("active");
								$("li:nth-child("+ index +")",that.options.navContainer).addClass("active");
							}
						}
						$(trigger).removeClass("loading").addClass("loaded"); } , 1000);
				}
			});
		}
		
		function setDisabled(){
			if(currentIndex <= 1){
				currentIndex = 1;
				
				unbindNavArrows("prev");
				if($(that.options.nextID).hasClass("disabled")){
					bindNavArrows("next");
				}
			} else if(currentIndex >= totalPages){
				currentIndex = totalPages;

				unbindNavArrows("next");
				if($(that.options.prevID).hasClass("disabled")){
					bindNavArrows("prev");
				}
			} else {
				if($(that.options.nextID).hasClass("disabled")){
					bindNavArrows("next");
				}
				if($(that.options.prevID).hasClass("disabled")){
					bindNavArrows("prev");
				}
			}
		}
		
		function bindNavArrows(bindArrow){
			switch (bindArrow){
				case "prev" :
					$(that.options.prevID).bind("click",function(evt){
						evt.preventDefault();
						setupSectionRotation({
							trigger: $(this),
							navigation: "arrows"
						});
					});
					$(that.options.prevID).removeClass("disabled");
					break;
				case "next" :
					$(that.options.nextID).bind("click",function(evt){
						evt.preventDefault();
						setupSectionRotation({
							trigger: $(this),
							navigation: "arrows"
						});
					});
					$(that.options.nextID).removeClass("disabled");
					break;
				default :
					$(that.options.prevID).add(that.options.nextID).bind("click",function(evt){
						evt.preventDefault();
						setupSectionRotation({
							trigger: $(this),
							navigation: "arrows"
						});
					});
					$(that.options.prevID).add(that.options.nextID).removeClass("disabled");
					break;
			}
		}
		
		function unbindNavArrows(bindArrow){
			switch (bindArrow){
				case "prev" :
					$(that.options.prevID).unbind("click");
					$(that.options.prevID).addClass("disabled");
					break;
				case "next" :
					$(that.options.nextID).unbind("click");
					$(that.options.nextID).addClass("disabled");
					break;
				default :
					$(that.options.prevID).add(that.options.nextID).unbind("click");
					$(that.options.prevID).add(that.options.nextID).addClass("disabled");
					break
			}
		}
    };
	
	//Public function
	that.previous = function(name) {
		console.log('Hello, ' + name + ', welcome to Script Junkies!');
	};
	
	
	that.next = function(name) {
		console.log('Hello, ' + name + ', welcome to Script Junkies!');
	};
	
	
	that.rotateTo = function(nextPostion) {
		//console.log(currentIndex);
		//currentIndex = nextPostion - 1
		//setupSectionRotation({
			//navigation: "auto"
		//});
	};
	
	
	that.init(element,options);
};

$.fn.slideThis = function(options) { //Using only one method off of $.fn
	return this.each(function() {
		(new $.slideThis($(this), options));              
	});        
};

$.slideThis.defaultOptions = {
	navFull: true,
	navContainer: "#navRotator",
	navArrows: false,
	prevID: "#prev",
	nextID: "#next",
	startIndex: 1,
	duration: 500,
	positionOffset: 0,
	orientation: "horizontal",
	sectionSize: "containerSize", // generic "size" for width and height
	autoPlay: false,
	continious: false,
	pause: 3000,
	transition: "slide",
	arrowKeys: false,
	dynamicContent: false,
	dynamicSlideSize: false, // will override sectionSize
	sectionContainer: "div",
	touchActive: true, // not implemented,
	onSeek: "" // not implemented
}

})(jQuery);