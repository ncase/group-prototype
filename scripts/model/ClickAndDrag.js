(function(){

	// Singleton, whatever
	window.ClickAndDrag = {
		target: null,
		focus: null,
		focusMode: 0 // NO FOCUS
	};

	// Checker method
	ClickAndDrag.isMouseOver = function(peep){
		var canvasX = 200+peep.x*Peep.DRAW_SCALE;
		var canvasY = 200+peep.y*Peep.DRAW_SCALE;
		var dx = canvasX-Mouse.x;
		var dy = canvasY-Mouse.y;
		var dSquared = dx*dx+dy*dy;
		return(dSquared<15*15); // radius of peep is 15px
	};

	// Get top one
	ClickAndDrag.getTopPeep = function(){
		for(var i=peeps.length-1; i>=0; i--){
			var peep = peeps[i];
			if(ClickAndDrag.isMouseOver(peep)){
				return peep;
			}
		}
		return null;
	};

	// Update cursor
	subscribe("/update",function(){

		var cursor;
		if(ClickAndDrag.target){
			cursor = "grabbing";
		}else if(ClickAndDrag.getTopPeep()){
			cursor = "grab";
		}else{
			cursor = "normal";
		}
		canvas.setAttribute("cursor", cursor);

		// Focus?
		if(ClickAndDrag.focusMode==2){
			ClickAndDrag.focus = ClickAndDrag.target;
		}

	});


	// Check from top to bottom
	subscribe("/mouse/down",function(){

		ClickAndDrag.target = ClickAndDrag.getTopPeep();

		// Push to top
		if(ClickAndDrag.target){
			var index = peeps.indexOf(ClickAndDrag.target);
			peeps.push(peeps.splice(index,1)[0]);
		}

		// Focus?
		if(ClickAndDrag.focusMode==1 && ClickAndDrag.target){
			ClickAndDrag.focus = ClickAndDrag.target;
		}

	});

	// No more targets
	subscribe("/mouse/up",function(){
		ClickAndDrag.target = null;
	});

})();