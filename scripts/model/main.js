// Controls
var slider_speed = document.getElementById("slider_speed");
var label_speed = document.getElementById("label_speed");
function onSpeedInput(){
	window.STEPS_PER_UPDATE = slider_speed.value;
	var text;
	if(window.STEPS_PER_UPDATE==0){
		text = "paused";
	}else if(window.STEPS_PER_UPDATE==1){
		text = "normal";
	}else{
		text = window.STEPS_PER_UPDATE+"x";
	}
	label_speed.innerHTML = text;
};
slider_speed.oninput = onSpeedInput;
onSpeedInput();

var slider_size = document.getElementById("slider_size");
var label_size = document.getElementById("label_size");
function onSizeInput(){
	Peep.GROUP_LIMIT = slider_size.value;
	label_size.innerHTML = Peep.GROUP_LIMIT;
};
slider_size.oninput = onSizeInput;
onSizeInput();

// Generate Peeps
var peeps = [new Peep()];
subscribeOnce("/external/generate",function(){

	var num = 99;
	var interval = setInterval(function(){
		var peep = new Peep();
		peep.x = (Math.random()*2-1);
		peep.y = (Math.random()*2-1);
		peeps.unshift(peep);
		num--;
		if(num==0){
			clearInterval(interval);
		}
	},20);

});
subscribeOnce("/external/group",function(){
	
	document.getElementById("control_size").style.display = "block";

	// UI
	slider_size.value = 10;
	onSizeInput();

	// Focus
	ClickAndDrag.focusMode = 1; // STICKY FOCUS
	ClickAndDrag.focus = peeps[peeps.length-1];

});
subscribeOnce("/external/cluster",function(){
	
	Peep.SPEED_ACCEL = 0.003;

	// UI
	slider_speed.value = 1;
	onSpeedInput();
	slider_size.value = 10;
	onSizeInput();

	// Focus
	ClickAndDrag.focusMode = 2; // ONLY IF GRABBING
	ClickAndDrag.focus = null;

});

//subscribe("/mouse/click",function(){
window.STEPS_PER_UPDATE = 1;
subscribe("/update",function(){

	// Update SIMULTANEOUSLY, in lockstep.
	for(var step=0;step<STEPS_PER_UPDATE;step++){
		for(var i=0;i<peeps.length;i++) peeps[i].updateGroup();
		for(var i=0;i<peeps.length;i++) peeps[i].updateMovement();
	}

	// If paused, still, dragging & group
	if(STEPS_PER_UPDATE==0 && ClickAndDrag.target){
		ClickAndDrag.target.updateDrag();
		for(var i=0;i<peeps.length;i++) peeps[i].updateGroup();
	}

});

// RENDER
var focusStar = new Image();
focusStar.src = "assets/star_yellow.png";
subscribe("/render",function(){

	// Blank Slate, and center it.
	ctx.save();
	ctx.clearRect(0,0,canvas.width,canvas.height);

	// Focus?
	if(ClickAndDrag.focus){
		ctx.fillStyle = "rgba(0,0,0,0.8)";
		ctx.fillRect(0,0,canvas.width,canvas.height);
	}

	// Translate
	ctx.translate(canvas.width/2, canvas.height/2);	

	// Draw Peeps
	for(var i=0;i<peeps.length;i++){
		peeps[i].draw(ctx);
	}

	// Focus?
	if(ClickAndDrag.focus){
		var x = ClickAndDrag.focus.groupNorm.x*Peep.DRAW_SCALE;
		var y = ClickAndDrag.focus.groupNorm.y*Peep.DRAW_SCALE;
		ctx.translate(x,y);
		ctx.drawImage(focusStar,-10,-10);
	}

	// Restore
	ctx.restore();

});