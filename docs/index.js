const CONFIG={width:480,height:640,wallX:40,playerRadius:10,velocityX:800,gravity:1e3,jumpVY:600,maxVY:1e3,groundHeight:100,shakeFactor:10,shakeDuration:.2,obstacleRadiusX:20,obstacleRadiusY:40,obstaclesStartY:-800,obstacleSpikeCount:5,trailFadeDuration:.3,menuFadeDuration:.3,pxPerMeter:100,confettiColors:["#f00","#ff0","#08f","#0f0"],superLuckyRecoveryTime:3};let CANVAS,CTX,PLAYER,RNG,LAST_FRAME=performance.now(),OBSTACLES=[],ITEMS=[],CAMERA_SHAKE_END=0,GAME_DURATION=0,MOUSE_DOWN=!1,WAIT_FOR_RELEASE=!1,DEATHS=[],MOUSE_POSITION={x:0,y:0},MENU=null,RENDERED_POWER=0;createCanvas=(t,e,i)=>{const a=document.createElement("canvas");a.width=t,a.height=e;return i(a.getContext("2d"),a),a},createPattern=(t,e,i)=>{const a=createCanvas(t,e,i);return a.getContext("2d").createPattern(a,"repeat")},BACKGROUND_PATTERNS=[t=>{t.fillRect(100,0,-10,20),t.fillRect(100,0,30,400)},t=>{t.fillRect(200,0,20,400),t.fillRect(220,200,10,20)},t=>{t.fillRect(300,0,40,400),t.fillRect(300,300,-10,30)},t=>{t.fillRect(400,0,20,400),t.fillRect(400,150,-10,10)}].map((t=>createPattern(640,400,(e=>{e.fillStyle="#bbbcbc",t(e)})))),renderCat=(t,e,i)=>{const a=15,l=20,s=15,r=8;t.fillStyle=t.strokeStyle="#000",t.fillRect(-15,-20,30,40),e&&(t.fillRect(0,0,20,4),t.fillRect(0,12,20,4)),t.beginPath(),t.arc(0,-35,a,Math.PI,0,!0),t.lineTo(a,-20),t.lineTo(-15,-20),t.fill(),t.fillStyle=t.strokeStyle="#b12a34",t.fillRect(-15,-20,30,s),t.lineWidth=1,t.beginPath(),t.arc(0,7,4,0,2*Math.PI),t.fill(),t.beginPath(),t.moveTo(-15,0),t.lineTo(0,5),t.lineTo(a,0),t.stroke(),t.fillStyle="#fff",t.textBaseline="middle",t.textAlign="center",t.font="4pt Courier",t.fillText("13",0,7.5),t.lineWidth=1,t.strokeStyle="#000",[-1,1].forEach((e=>t.wrap((()=>{t.translate(0,-5),t.beginPath(),t.moveTo(0,0),t.lineTo(24*e,-2),t.moveTo(0,0),t.lineTo(24*e,2),t.stroke()})))),t.fillStyle="#fff",[-r,r].forEach((e=>t.wrap((()=>{t.translate(e,-10.5),Date.now()%5e3<100&&t.scale(1,.1),t.beginPath(),t.arc(0,0,5.5,0,2*Math.PI),t.fill(),t.fillStyle="#000",i?[Math.PI/4,-Math.PI/4].forEach((e=>t.wrap((()=>{t.fillStyle="#000",t.rotate(e),t.fillRect(-5,-1,10,2)})))):(t.scale(.3,1),t.beginPath(),t.arc(0,0,5.5,0,2*Math.PI),t.fill())})))),t.beginPath(),t.arc(0,-5,2,0,2*Math.PI,!0),t.fill();const h=3*Math.sin(Date.now()/1e3*Math.PI*2/2);t.strokeStyle="#000",t.lineWidth=5,t.lineCap="round",t.beginPath(),t.moveTo(0,l-t.lineWidth),t.bezierCurveTo(-25,22,-25,10,-25+h,2),t.stroke()},renderDeath=(t,e,i)=>{t.fillStyle="#b12a34",[Math.PI/4,-Math.PI/4].forEach((a=>t.wrap((()=>{t.translate(e,i),t.rotate(a),t.fillRect(-15,-4,30,8)}))))},renderSpark=(t,e,i)=>{t.fillStyle="#ff0",[Math.PI/4,-Math.PI/4].forEach((a=>t.wrap((()=>{t.translate(e,i),t.rotate(a),t.fillRect(-5,-2,10,4)}))))},renderClover=(t,e,i)=>{t.wrap((()=>{t.translate(e,i);const a=t.createLinearGradient(-50,0,50,0);a.addColorStop(0,"rgba(255, 255, 255, 0)"),a.addColorStop(.5,"rgba(255, 255, 255, 0.5)"),a.addColorStop(1,"rgba(255, 255, 255, 0)"),[GAME_DURATION*Math.PI,-GAME_DURATION*Math.PI/3,GAME_DURATION*Math.PI*2/3].forEach((e=>t.wrap((()=>{t.fillStyle=a,t.rotate(e),t.fillRect(-50,-10,100,20)})))),t.fillStyle=t.strokeStyle="#b12a34";const l=1.2+.2*Math.sin(2*Math.PI*Date.now()/1e3);t.scale(l,l),t.rotate(Math.sin(Math.PI*Date.now()/1e3)*Math.PI/16),[.25,.75,-.25,-.75].forEach(((e,i)=>{const a=e*Math.PI;t.wrap((()=>{t.rotate(a),t.beginPath(),t.moveTo(0,3),t.lineTo(0,-3),t.lineTo(10,-5),t.lineTo(10,5),t.fill()}))})),t.lineWidth=2,t.beginPath(),t.moveTo(0,0),t.bezierCurveTo(0,20,3,15,5,20),t.stroke()}))},renderGauge=(t,e)=>{t.wrap((()=>{t.fillStyle="#fff",t.fillRect(-100,-10,200,20),t.fillStyle="#b12a34",t.fillRect(-100,-10,200*e,20)}))},renderJs13kBadge=t=>t.wrap((()=>{t.rotate(Math.PI/8),t.fillStyle="#fff",t.beginPath(),t.arc(0,0,55,0,2*Math.PI),t.fill(),t.fillStyle="#3b3b3b",t.beginPath(),t.arc(0,0,50,0,2*Math.PI),t.fill(),t.font="14pt Courier",t.textBaseline="bottom",t.textAlign="left";const e=t.measureText("JS").width,i=t.measureText("13K").width;t.wrap((()=>{t.translate(0,15),t.fillStyle="#fff",t.fillText("JS",-(e+i)/2,0),t.fillStyle="#c13e43",t.fillText("13K",-(e+i)/2+e,0),t.fillStyle="#fff",t.textAlign="center",t.fillText("GAMES",0,20)})),t.translate(0,-25),t.fillStyle="#c13e43",t.fillRect(-15,-5,30,10),[-1,1].forEach((e=>t.wrap((()=>{t.translate(10*e,0),t.fillStyle="#c13e43",t.rotate(Math.PI/8*-e),t.fillRect(-5,-5,10,20)}))))})),CanvasRenderingContext2D.prototype.wrap=function(t){this.save(),t(),this.restore()},onload=()=>{CANVAS=can,CANVAS.width=CONFIG.width,CANVAS.height=CONFIG.height,CTX=CANVAS.getContext("2d"),resetGame(),onresize(),animationFrame()},onresize=()=>{const t=CONFIG.width/CONFIG.height;let e,i;innerWidth/innerHeight<t?(e=innerWidth,i=innerWidth/t):(i=innerHeight,e=innerHeight*t),inner.style.width=`${e}px`,inner.style.height=`${i}px`},animationFrame=()=>{const t=performance.now(),e=(t-LAST_FRAME)/1e3;LAST_FRAME=t,cycle(e),renderFrame(),requestAnimationFrame(animationFrame)},onmousedown=onkeydown=()=>MOUSE_DOWN=!0,onmouseup=ontouchcancel=onkeyup=()=>MOUSE_DOWN=!1,ontouchstart=t=>{onmousemove(t.touches[0]),onmousedown(t)},ontouchmove=t=>t.preventDefault(),ontouchend=t=>{onmouseup(),onclick()},onmousemove=t=>{const e=CANVAS.getBoundingClientRect();MOUSE_POSITION={x:(t.pageX-e.left)/e.width*CONFIG.width,y:(t.pageY-e.top)/e.height*CONFIG.height},MENU&&MENU.highlightedButton(MOUSE_POSITION)?CANVAS.style.cursor="pointer":CANVAS.style.cursor="default"},onclick=()=>{if(MENU){const t=MENU.highlightedButton(MOUSE_POSITION);t&&t.onClick()}},renderFrame=()=>{CTX.fillStyle="#000",CTX.fillRect(0,0,CONFIG.width,CONFIG.height),CTX.wrap((()=>{Date.now()<CAMERA_SHAKE_END&&CTX.translate(Math.random()*CONFIG.shakeFactor*2+CONFIG.shakeFactor,Math.random()*CONFIG.shakeFactor*2+CONFIG.shakeFactor),CTX.fillStyle="#000",CTX.fillRect(0,CAMERA.topY,CONFIG.wallX,CONFIG.height),CTX.fillRect(CONFIG.width,0,-CONFIG.wallX,CONFIG.height),CTX.fillStyle=Date.now()<CAMERA_SHAKE_END?"#900":"#c8caca",CTX.fillRect(CONFIG.wallX,0,CONFIG.width-2*CONFIG.wallX,CONFIG.height),BACKGROUND_PATTERNS.forEach(((t,e)=>{CTX.fillStyle=t;const i=Math.abs(Math.sin(1+2*e)),a=.8*CAMERA.topY*(1-i/4);CTX.wrap((()=>{CTX.globalAlpha=1-i/2,CTX.translate(0,-a),CTX.fillRect(CONFIG.wallX,a,CONFIG.width-2*CONFIG.wallX,CONFIG.height)}))})),CTX.translate(0,-CAMERA.topY),OBSTACLES.forEach((t=>t.render())),ITEMS.forEach((t=>t.render())),DEATHS.forEach((t=>renderDeath(CTX,t.x,t.y))),MENU&&(CTX.globalAlpha=1-MENU.alpha),0!==GAME_DURATION&&(CTX.fillStyle="#000",CTX.fillRect(0,CONFIG.playerRadius+10,CONFIG.width,CONFIG.groundHeight),PLAYER.render())})),!MENU&&PLAYER.distance&&(CTX.fillStyle="#b12a34",CTX.textBaseline="top",CTX.textAlign="left",CTX.font="18pt Courier",CTX.fillText(`${PLAYER.distance}M`,CONFIG.wallX+15,15),CTX.wrap((()=>{CTX.translate(CONFIG.width/2,25);const t=1+Math.min(.1,Math.abs(RENDERED_POWER-PLAYER.power));RENDERED_POWER<PLAYER.power&&CTX.scale(t,t),renderGauge(CTX,RENDERED_POWER)}))),MENU&&CTX.wrap((()=>MENU.render()))},resetGame=()=>{resetPlayer(),MENU=new MainMenu},resetPlayer=()=>{RNG=createNumberGenerator(1),PLAYER=new Player,CAMERA=new Camera,OBSTACLES=[],ITEMS=[]},cycle=t=>{!MENU||MENU.dismissed?GAME_DURATION+=t:GAME_DURATION=0,MOUSE_DOWN||(WAIT_FOR_RELEASE=!1),PLAYER.cycle(t),CAMERA.cycle(t),ITEMS.forEach((e=>e.cycle(t)));const e=Math.max(.5*-t,Math.min(.5*t,PLAYER.power-RENDERED_POWER));RENDERED_POWER+=e,(!OBSTACLES.length||OBSTACLES[OBSTACLES.length-1].y>=CAMERA.topY)&&generateNewObstacle()},generateNewObstacle=()=>{const t=OBSTACLES.length?OBSTACLES[OBSTACLES.length-1].y:CONFIG.obstaclesStartY,e=Math.min(1,OBSTACLES.length/20),i=2*CONFIG.obstacleRadiusY+200+400*(1-e),a=500*(1-e),l=.2*e,s=RNG()<.5,r=new Obstacle(s?CONFIG.wallX:CONFIG.width-CONFIG.wallX,t-(RNG()*a+i));OBSTACLES.push(r),RNG()<l&&OBSTACLES.push(new Obstacle(s?CONFIG.width-CONFIG.wallX:CONFIG.wallX,r.y)),RNG()<.5&&ITEMS.push(new Item(2*CONFIG.wallX+RNG()*(CONFIG.width-4*CONFIG.wallX),r.y+100*RNG()))},updateHighscore=t=>{localStorage.hs=Math.max(highscore(),t)},highscore=()=>parseInt(localStorage.hs)||0;class Camera{constructor(){this.topY=PLAYER.y-CONFIG.height+CONFIG.groundHeight}get bottomY(){return this.topY+CONFIG.height}cycle(t){const e=(Math.min(this.topY,PLAYER.y-.7*CONFIG.height)-this.topY)/.1;this.topY+=e*t}}class Item{constructor(t,e){this.x=t,this.y=e}cycle(t){if(Math.abs(PLAYER.x-this.x)>20||Math.abs(PLAYER.y-this.y)>20||PLAYER.dead)return;const e=ITEMS.indexOf(this);e>=0&&ITEMS.splice(e,1),PLAYER.power+=.34,PLAYER.power>=1&&(PLAYER.power=1,PLAYER.superLucky=!0)}render(){MENU||CAMERA.bottomY<this.y-50||CAMERA.y>this.y+50||renderClover(CTX,this.x,this.y)}}class Trail{constructor(){this.startTime=Date.now(),this.x=PLAYER.x,this.y=PLAYER.y,this.direction=PLAYER.direction||1,this.rotation=PLAYER.rotation}get alpha(){return.25*(1-(Date.now()-this.startTime)/1e3/CONFIG.trailFadeDuration)}}class Player{constructor(){this.x=CONFIG.width/2,this.y=0,this.vY=0,this.direction=0,this.dead=0,this.rotation=0,this.power=0,this.timeSinceSuperLucky=9,this.superLucky=!1,this.minY=this.y,this.trails=[]}cycle(t){let e=CONFIG.velocityX;this.dead&&(e*=.2),this.superLucky?(this.power-=.5*t,this.power<=0&&(this.power=0,this.superLucky=!1),this.timeSinceSuperLucky=0):this.timeSinceSuperLucky+=t,this.x+=this.direction*e*t,this.x=Math.max(CONFIG.wallX,this.x),this.x=Math.min(CONFIG.width-CONFIG.wallX,this.x);let i=CONFIG.gravity;this.vY<0&&this.onWall?i*=4:this.onWall?i*=.5:(MOUSE_DOWN||this.superLucky)&&(i*=0),this.vY+=i*t,this.vY=Math.max(this.vY,-CONFIG.maxVY),this.y+=this.vY*t,this.y=Math.min(0,this.y);for(!MENU&&(this.superLucky||MOUSE_DOWN&&!WAIT_FOR_RELEASE)&&(this.onWall||!this.direction)&&(this.jump(),WAIT_FOR_RELEASE=!0),this.onWall?this.rotation=0:this.rotation+=t*Math.PI*8*this.direction;this.trails.length&&this.trails[0].alpha<=0;)this.trails.shift();this.dead||this.onWall||0===this.y||(!this.trails.length||Date.now()-this.trails[this.trails.length-1].startTime>1e3/30)&&this.trails.push(new Trail);for(const t of OBSTACLES)t.collidesWithPlayer()&&this.die();this.y>=CAMERA.bottomY&&this.die(),this.minY=Math.min(this.y,this.minY)}die(){this.dead||(this.dead=!0,this.vY=Math.max(this.vY,0),this.direction=Math.sign(CONFIG.width/2-this.x),CAMERA_SHAKE_END=Date.now()+1e3*CONFIG.shakeDuration,DEATHS.push({x:this.x,y:this.y,distance:this.distance}),setTimeout((()=>MENU=new MainMenu),1e3),updateHighscore(this.distance))}get onWall(){return this.x===CONFIG.wallX||this.x===CONFIG.width-CONFIG.wallX}jump(){(0===this.y||this.onWall)&&(this.dead||(this.direction=-1*this.direction||1,this.vY=-CONFIG.jumpVY+Math.min(this.vY,0)))}render(){this.direction||CTX.wrap((()=>{CTX.globalAlpha=Math.max(0,(GAME_DURATION-1)/.3),CTX.fillStyle="#888",CTX.textBaseline="middle",CTX.textAlign="center",CTX.font="24pt Courier",CTX.fillText("CLICK TO JUMP",this.x,this.y-300),CTX.fillText("HOLD TO GO HIGHER",this.x,this.y-250)})),this.trails.forEach((t=>{const e=t.alpha;e>0&&this.renderPlayer(t.x,t.y,e,t.direction,1,t.rotation,!1,!1)}));let t=this.x;this.onWall&&(t+=18*Math.sign(CONFIG.width/2-this.x)),this.renderPlayer(t,this.y,1,this.direction||1,this.dead?-1:1,this.rotation,this.onWall,this.dead)}renderPlayer(t,e,i,a,l,s,r,h){CTX.wrap((()=>{CTX.translate(t,e),CTX.rotate(s),CTX.scale(a,l),CTX.globalAlpha*=Math.max(0,Math.min(1,i)),renderCat(CTX,r,h)}))}get distance(){return Math.round(-this.minY/CONFIG.pxPerMeter)}}class Obstacle{constructor(t,e){this.x=t,this.y=e}collidesWithPlayer(){return!(PLAYER.timeSinceSuperLucky<CONFIG.superLuckyRecoveryTime)&&(Math.abs(PLAYER.x-this.x)<CONFIG.obstacleRadiusX&&Math.abs(PLAYER.y-this.y)<CONFIG.obstacleRadiusY)}render(){if(CAMERA.bottomY<this.y-CONFIG.obstacleRadiusY||CAMERA.y>this.y+CONFIG.obstacleRadiusY)return;let t=0;if(PLAYER.timeSinceSuperLucky<CONFIG.superLuckyRecoveryTime){t=CONFIG.obstacleRadiusX*(CONFIG.superLuckyRecoveryTime-PLAYER.timeSinceSuperLucky)/CONFIG.superLuckyRecoveryTime;const e=.2;if(PLAYER.timeSinceSuperLucky%e>e/2)return}CTX.fillStyle="#000",CTX.wrap((()=>{CTX.translate(t*Math.sign(this.x-CONFIG.width/2),0),CTX.beginPath();const e=CONFIG.obstacleRadiusY/CONFIG.obstacleSpikeCount;for(let t=this.y-CONFIG.obstacleRadiusY;t<this.y+CONFIG.obstacleRadiusY;t+=2*e)CTX.lineTo(this.x,t),CTX.lineTo(this.x+CONFIG.obstacleRadiusX*Math.sign(CONFIG.width/2-this.x),t+e);CTX.lineTo(this.x,this.y+CONFIG.obstacleRadiusY),CTX.fill()}))}}class Button{constructor(t,e,i,a){this.x=t,this.y=e,this.text=i,this.onClick=a,CTX.fillStyle="#fff",CTX.textBaseline="middle",CTX.textAlign="center",CTX.font="24pt Courier";const l=CTX.measureText(i).width;this.radiusX=Math.max(100,(l+50)/2),this.radiusY=25}render(){CTX.translate(this.x,this.y),CTX.rotate(Math.sin(Date.now()*Math.PI*2/1e3)*Math.PI/128),this.contains(MOUSE_POSITION)&&CTX.scale(1.1,1.1),CTX.fillStyle="#b12a34",CTX.fillRect(-this.radiusX,-this.radiusY,2*this.radiusX,2*this.radiusY),CTX.fillStyle="#fff",CTX.textBaseline="middle",CTX.textAlign="center",CTX.font="24pt Courier",CTX.fillText(this.text,0,0)}contains(t){return Math.abs(this.x-t.x)<this.radiusX&&Math.abs(this.y-t.y)<this.radiusY}}class Menu{constructor(){this.buttons=[],this.fade(0,1)}fade(t,e){this.fadeStartTime=Date.now(),this.fadeEndTime=Date.now()+1e3*CONFIG.menuFadeDuration,this.fadeStartValue=t,this.fadeEndValue=e}get alpha(){let t=(Date.now()-this.fadeStartTime)/(this.fadeEndTime-this.fadeStartTime);return t=Math.min(1,Math.max(0,t)),t*(this.fadeEndValue-this.fadeStartValue)+this.fadeStartValue}dismiss(){this.dismissed||(this.dismissed=!0,this.fade(1,0),setTimeout((()=>MENU=null),1e3*CONFIG.menuFadeDuration))}render(){CTX.globalAlpha=this.alpha,this.buttons.forEach((t=>CTX.wrap((()=>t.render()))))}highlightedButton(t){return this.buttons.filter((e=>e.contains(t)))[0]}}class MainMenu extends Menu{constructor(){super(),this.buttons.push(new Button(CONFIG.width/2,CONFIG.height/2+50,DEATHS.length?"TRY AGAIN":"PLAY",(()=>{MENU.dismiss(),resetPlayer()})));const t=new Button(CONFIG.width-75,60,"",(()=>{open("https://js13kgames.com/")}));t.radiusX=50,t.radiusY=50,t.render=function(){CTX.translate(this.x,this.y),this.contains(MOUSE_POSITION)&&CTX.scale(1.1,1.1),renderJs13kBadge(CTX)},this.buttons.push(t);const e=DEATHS.length?DEATHS[DEATHS.length-1].distance:0;e&&this.buttons.push(new Button(CONFIG.width/2,CONFIG.height/2+125,"BRAG ABOUT IT",(()=>{const t=`I climbed ${e}m in ${document.title}!`;open("https://twitter.com/intent/tweet?hashtags=js13k&url="+location+"&text="+encodeURIComponent(t))}))),this.created=Date.now()}render(){const t=DEATHS.length?DEATHS[DEATHS.length-1].distance:-1,e=t>=highscore(),i=createNumberGenerator(1);for(let t=0;t<100*e;t++)CTX.wrap((()=>{const t=-i()*CONFIG.height*2,e=200+200*i(),a=Math.PI+i()*Math.PI+(i()<.5?1:-1);CTX.fillStyle=CONFIG.confettiColors[~~(i()*CONFIG.confettiColors.length)],CTX.translate(CONFIG.wallX+i()*(CONFIG.width-2*CONFIG.wallX),t+e*(Date.now()-this.created)/1e3),CTX.rotate(a*(Date.now()-this.created)/1e3),CTX.scale(10,10),CTX.beginPath(),CTX.moveTo(-1,-1),CTX.lineTo(1,-1),CTX.lineTo(-1,1),CTX.fill()}));super.render(),CTX.wrap((()=>{CTX.translate(CONFIG.width/2,CONFIG.height/3-50),CTX.scale(this.alpha,this.alpha);const t="TRISKA";CTX.fillStyle="#000",CTX.textBaseline="middle",CTX.textAlign="center",CTX.font="bold 72pt Courier",CTX.fillText(t,0,0);const e=CTX.measureText(t);CTX.textAlign="right",CTX.font="30pt Courier",CTX.fillText("RELOADED",e.width/2,45)})),CTX.wrap((()=>{CTX.translate(CONFIG.width/2,CONFIG.height/2-40),CTX.scale(this.alpha,this.alpha),DEATHS.length&&(CTX.fillStyle="#b12a34",CTX.textBaseline="middle",CTX.textAlign="center",CTX.font="24pt Courier",e?(CTX.fillText(`NEW RECORD! ${t}M`,0,0),CTX.font="8pt Courier",CTX.translate(0,25),CTX.fillText("(BUT REALLY, YOU COULD HAVE GONE HIGHER)",0,0)):(CTX.fillText(`YOU CLIMBED ${t}M!`,0,0),CTX.font="8pt Courier",CTX.translate(0,25),CTX.fillText(`(YOU ONCE DID ${highscore()}M THOUGH)`,0,0)))})),CTX.wrap((()=>{CTX.translate(CONFIG.width-120,CONFIG.height-50),CTX.translate(0,100*(1-this.alpha));const t=DEATHS.length>0&&Date.now()-this.created<4e3;if(t&&CTX.rotate(Math.sin(Date.now()/1e3*Math.PI*2/2)*Math.PI/32),CTX.wrap((()=>{CTX.scale(3,3),renderCat(CTX,!1,t)})),t){createNumberGenerator(1);const t=5;for(let e=0;e<t;e++)CTX.wrap((()=>{const i=e/t;CTX.translate(0,-80);const a=i*Math.PI*2+Date.now()/1e3*Math.PI;CTX.translate(40*Math.cos(a),10*Math.sin(a)),renderSpark(CTX,0,0)}))}}))}}createNumberGenerator=t=>{const e=new Uint32Array([Math.imul(t,2246822507),Math.imul(t,3266489909)]);return()=>{const t=e[0],i=e[1]^t;return e[0]=(t<<26|t>>8)^i^i<<9,e[1]=i<<13|i>>19,(Math.imul(t,2654435771)>>>0)/4294967295}};