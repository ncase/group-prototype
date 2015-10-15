Peep.SPEED_ACCEL = 0; //0.003; // arbitrary, yolo
Peep.SPEED_NOISE = 0.001; //0.001; // arbitrary, yolo
Peep.DRAW_SCALE = 200; // half of canvas
Peep.GROUP_LIMIT = 10;

function Peep(){
	
	var self = this;

	// Movement
	self.x = 0;
	self.y = 0;
	self.acc = {x:0, y:0};
	self.vel = {x:0, y:0};
	self.noise = {x:0, y:0};

	// Group
	self.group = [self];
	self.groupLimit = 10;
	self.groupNorm = {x:self.x, y:self.y};
	self.groupNormEased = {x:self.x, y:self.y};

	// UPDATE - GROUP & NORM
	self.updateGroup = function(){

		// Who's in my group? Sort & Cut.
		var peepsCopied = peeps.concat([]);
		var sortedByClosest = peepsCopied.sort(function(a,b){
			var a_dx = self.x-a.x;
			var a_dy = self.y-a.y;
			var a_dist = a_dx*a_dx + a_dy*a_dy;
			var b_dx = self.x-b.x;
			var b_dy = self.y-b.y;
			var b_dist = b_dx*b_dx + b_dy*b_dy;
			return a_dist-b_dist;
		});
		//self.group = sortedByClosest.splice(0,self.groupLimit);
		self.group = sortedByClosest.splice(0, Peep.GROUP_LIMIT);

		// What's the perceived norm?
		// Just the average of group members, all weighted the same
		var totalX = 0;
		var totalY = 0;
		var totalNum = 0;
		for(var i=0;i<self.group.length;i++){
			var peep = self.group[i];
			var weight = 1;
			totalX += peep.x*weight;
			totalY += peep.y*weight;
			totalNum += weight;
		}
		self.groupNorm = {
			x: totalX/totalNum,
			y: totalY/totalNum
		};
		self.groupNormEased.x = self.groupNormEased.x*0.5 + self.groupNorm.x*0.5;
		self.groupNormEased.y = self.groupNormEased.y*0.5 + self.groupNorm.y*0.5;

	};

	// UPDATE - CLICK & DRAG, if Paused
	self.updateDrag = function(){
		if(ClickAndDrag.target==self){
			var mx = (Mouse.x-200)/Peep.DRAW_SCALE;
			var my = (Mouse.y-200)/Peep.DRAW_SCALE;
			self.x = mx;
			self.y = my;
		}
	};

	// UPDATE - MOVEMENT
	self.updateMovement = function(){

		// Click & Drag!!!
		if(ClickAndDrag.target==self){

			var mx = (Mouse.x-200)/Peep.DRAW_SCALE;
			var my = (Mouse.y-200)/Peep.DRAW_SCALE;
			self.vel.x = (mx-self.x)*0.3;
			self.vel.y = (my-self.y)*0.3;
			self.x += self.vel.x;
			self.y += self.vel.y;

			return;

		}

		// Random noise movement vector
		if(Math.random()<0.1){
			self.noise.x = (Math.random()*2-1)*Peep.SPEED_NOISE;
			self.noise.y = (Math.random()*2-1)*Peep.SPEED_NOISE;
		}

		// Calculate acceleration
		var acc = { x:self.groupNorm.x-self.x, y:self.groupNorm.y-self.y };
		var distance = Math.sqrt(acc.x*acc.x + acc.y*acc.y);
		if(distance<0.075){ // If it's close enough or zero, accel is zero.
			self.acc.x = 0;
			self.acc.y = 0;
		}else{ // Otherwise, make accel's mag = SPEED_ACCEL
			acc.x *= Peep.SPEED_ACCEL/distance;
			acc.y *= Peep.SPEED_ACCEL/distance;
			self.acc.x = acc.x;
			self.acc.y = acc.y;
		}
	
		// Apply accel, velocity, position
		self.vel.x += self.acc.x+self.noise.x;
		self.vel.y += self.acc.y+self.noise.y;
		self.vel.x *= 0.9;
		self.vel.y *= 0.9;
		self.x += self.vel.x;
		self.y += self.vel.y;

		// Boundaries
		if(self.x<-1){ self.x=-1; self.vel.x=0; }
		if(self.x>1){ self.x=1; self.vel.x=0; }
		if(self.y<-1){ self.y=-1; self.vel.y=0; }
		if(self.y>1){ self.y=1; self.vel.y=0; }

	};

	// DRAW - THIS THANG
	self.scale = 0;
	self.draw = function(ctx){

		ctx.save();

		// Translate to scaled position
		var x = self.x*Peep.DRAW_SCALE;
		var y = self.y*Peep.DRAW_SCALE;
		ctx.translate(x,y);

		// Scale, for juiciness
		self.scale = 0.3 + self.scale*0.7;
		ctx.scale(self.scale, self.scale);

		// Draw me self: a circle
		ctx.beginPath();
		ctx.arc(0, 0, 13, 0, 2*Math.PI, false);
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 2;
		ctx.fill();
		ctx.stroke();

		// Draw EYES
		var velX = self.vel.x*Peep.DRAW_SCALE*4;
		if(velX<-4) velX=-4;
		if(velX>4) velX=4;
		var velY = self.vel.y*Peep.DRAW_SCALE*4;
		if(velY<-4) velY=-4;
		if(velY>4) velY=4;
		ctx.save();
		ctx.translate(velX, velY);
		ctx.fillStyle = '#333';
		ctx.beginPath();
		ctx.arc(-4, 0, 2, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(4, 0, 2, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.restore();

		// Focus?
		if(ClickAndDrag.focus){
			if(self==ClickAndDrag.focus){
				// nothin'
			}else if(ClickAndDrag.focus.group.indexOf(self)>=0){
				ctx.beginPath();
				ctx.arc(0, 0, 14, 0, 2*Math.PI, false);
				ctx.fillStyle = 'rgba(0,0,0,0.3)';
				ctx.fill();
			}else{
				ctx.beginPath();
				ctx.arc(0, 0, 14, 0, 2*Math.PI, false);
				ctx.fillStyle = 'rgba(0,0,0,0.8)';
				ctx.fill();
			}
		}

		ctx.restore();

	};

}