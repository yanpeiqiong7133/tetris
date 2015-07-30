/**
	 *	定义全局常量
	 */
    CELLWIDTH=25;
	CELLCOUNT_x=10;
	CELLCOUNT_y=18;

	if(!localStorage.best){
		localStorage.best="0";
	}

   /**
	*	游戏类 
	*/
   var game={

	  //定义游戏格局大小：
	  //cellWidth表示每一个小方格的长度
	  //cellCount_x表示游戏底盘的宽包含小方格数目
	  //cellCount_y表示游戏底盘的高包含小方格数目
	  //width表示游戏底盘的宽度
	  //height表示游戏底盘的高度
	  cellWidth:CELLWIDTH,
	  cellCount_x:CELLCOUNT_x,
	  cellCount_y:CELLCOUNT_y,
	  width:CELLWIDTH*CELLCOUNT_x,
	  height:CELLWIDTH*CELLCOUNT_y,
	  
	  //初始化下落速度
	  //speed:150,	
	  //定义存放7*4中方块形状的二维数组
	  blockSets:null,	
	  //定义游戏格局的状态，为一个大小为CELLCOUNT_x*CELLCOUNT_y的二维数组
	  arrange:null,
	  //用于存放每一列的最高点，为一个大小为CELLCOUNT_y+1的一维数组，
	  //其中distance[CELLCOUNT_y]用于存放distance[0]~distance[CELLCOUNT_y-1]中的最小值
	  distance:null,
	  //定义当前正下落方块对象
	  currentBlock:null,
	  //定义存放每一行需要下落的高度，消行时用，为一个大小为CELLCOUNT_y的一维数组
	  rowsDown:null,
	  //定义图形原点				 
	  ox:0,
	  
	  startStatus:false,
	  pauseStatus:false,
	  scoreStatus:{
		curScore:0,
		curLines:0,
		curLevel:1,
		levels:[0,800, 700, 600, 500, 400, 300, 200, 100, 50],
		best:parseInt(localStorage.best)
	  },
	  //timerId:null,
	  
	  //定义画板（canvas）：
	  //message用于显示提示信息；
	  //map用于显示游戏底盘
	  //tetris用于显示底盘上的游戏方块
	  //nextShape用于显示下一个方块的形状
	  //console.log(document.getElementById("map"))
	  /*message: document.getElementById("message").getContext("2d"),*/
	  map:document.getElementById("map").getContext("2d"),
	  tetris: document.getElementById("tetris").getContext("2d"),
	  nextShape:document.getElementById("nextShape").getContext("2d"),
	  
	  
	  
	  
	  /**
	   *游戏初始化
	   */
	  init:function(){					
		 //初始化画板
		 this.initCanvas();
		 //画游戏盘
		 this.drawMap();
		 //初始化数据结构
		 this.initStructs();
		 //绑定事件处理
		 this.initEvents();	

		// document.getElementById("gameLevel").value =1;
		 
	  },
	  
	  
	  /**
	   *初始化各种画板
	   */
	  initCanvas:function(){

	  	//设置游戏区域的大小
	  	document.getElementById("main_container").style.width = this.width + 18 +"px";
		document.getElementById("main_container").style.height = this.height + 24 + "px";

		document.getElementById("main").style.width = this.width +"px";
		document.getElementById("main").style.height = this.height + "px";

		//分别设置三个canvas的大小，与普通元素的样式设置格式不太一样 
		document.getElementById("map").width = this.width;
		document.getElementById("map").height = this.height;

		//console.log("map height:"+document.getElementById("map").height)
		document.getElementById("message").style.width = this.width + "px";
		document.getElementById("message").style.height = this.height +"px";

		document.getElementById("tetris").width = this.width;
		document.getElementById("tetris").height = this.height;

		document.getElementById("nextShape").width = this.cellWidth*4;
		document.getElementById("nextShape").height = this.cellWidth*4;

		document.getElementsByClassName("nextShape")[0].style.height = this.cellWidth*5;


		this.nextShape.fillStyle="#232020";
		this.tetris.fillStyle="#ece5e5";

		
	  },
	  
	  
	  /**
	   *初始化数据结构
	   */
	  initStructs:function(){
		
		//初始化7*4种基本形状
		this.blockSets=[
		  [//第一种基本图形
			{
				minCol:2, maxCol:2, minRow:0, maxRow:3, shape:[{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3}], minX:-2, maxX:7, maxY:14, minY:0
			},
			{
				minCol:0, maxCol:3, minRow:1, maxRow:1, shape:[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1}], minX:0, maxX:6, maxY:16, minY:-1
			},
			{
				minCol:2, maxCol:2, minRow:0, maxRow:3, shape:[{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3}], minX:-2, maxX:7, maxY:14, minY:0
			},
			{
				minCol:0, maxCol:3, minRow:1, maxRow:1, shape:[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1}], minX:0, maxX:6, maxY:16, minY:-1
			}
		  ],
		  [//第二种基本图形
			{
				minCol:1, maxCol:2, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}], minX:-1, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:1, maxCol:2, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}], minX:-1, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:1, maxCol:2, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}], minX:-1, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:1, maxCol:2, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}], minX:-1, maxX:7, maxY:15, minY:-1
			}
		  ],
		  [//第三种基本图形
			{
				minCol:0, maxCol:2, minRow:1, maxRow:2, shape:[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:1,y:2}], minX:0, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:0, maxCol:1, minRow:0, maxRow:2, shape:[{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2}], minX:0, maxX:8, maxY:15, minY:0
			},
			{
				minCol:0, maxCol:2, minRow:0, maxRow:1, shape:[{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}], minX:0, maxX:7, maxY:16, minY:0
			},
			{
				minCol:1, maxCol:2, minRow:0, maxRow:2, shape:[{x:1,y:0},{x:1,y:1},{x:2,y:1},{x:1,y:2}], minX:-1, maxX:7, maxY:15, minY:0
			}
		  ],
		  [//第四种基本图形
			{
				minCol:0, maxCol:2, minRow:1, maxRow:2, shape:[{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:2,y:2}], minX:0, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:1, maxCol:2, minRow:0, maxRow:2, shape:[{x:2,y:0},{x:1,y:1},{x:2,y:1},{x:1,y:2}], minX:-1, maxX:7, maxY:15, minY:0
			},
			{
				minCol:0, maxCol:2, minRow:1, maxRow:2, shape:[{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:2,y:2}], minX:0, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:1, maxCol:2, minRow:0, maxRow:2, shape:[{x:2,y:0},{x:1,y:1},{x:2,y:1},{x:1,y:2}], minX:-1, maxX:7, maxY:15, minY:0
			}
		  ],
		  [//第五种基本图形
			{
				minCol:0, maxCol:2, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:2,y:1},{x:0,y:2},{x:1,y:2}], minX:0, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:0, maxCol:1, minRow:0, maxRow:2, shape:[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2}], minX:0, maxX:8, maxY:15, minY:0
			},
			{
				minCol:0, maxCol:2, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:2,y:1},{x:0,y:2},{x:1,y:2}], minX:0, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:0, maxCol:1, minRow:0, maxRow:2, shape:[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:1,y:2}], minX:0, maxX:8, maxY:15, minY:0
			}
		  ],
		  [//第六种基本形状
			{
				minCol:1, maxCol:2, minRow:1, maxRow:3, shape:[{x:1,y:1},{x:2,y:1},{x:2,y:2},{x:2,y:3}], minX:-1, maxX:7, maxY:14, minY:-1		
			},
			{
				minCol:0, maxCol:2, minRow:1, maxRow:2, shape:[{x:2,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2}], minX:0, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:1, maxCol:2, minRow:0, maxRow:2, shape:[{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:2,y:2}], minX:-1, maxX:7, maxY:15, minY:0
			},
			{
				minCol:1, maxCol:3, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:1,y:2}], minX:-1, maxX:6, maxY:15, minY:-1
			}
		  ],
		  [//第七种基本形状
			{
				minCol:1, maxCol:2, minRow:1, maxRow:3, shape:[{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:1,y:3}], minX:-1, maxX:7, maxY:14, minY:-1
			},
			{
				minCol:0, maxCol:2, minRow:1, maxRow:2, shape:[{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:2,y:2}], minX:0, maxX:7, maxY:15, minY:-1
			},
			{
				minCol:0, maxCol:1, minRow:0, maxRow:2, shape:[{x:1,y:0},{x:1,y:1},{x:0,y:2},{x:1,y:2}], minX:0, maxX:8, maxY:15, minY:0
			},
			{
				minCol:1, maxCol:3, minRow:1, maxRow:2, shape:[{x:1,y:1},{x:1,y:2},{x:2,y:2},{x:3,y:2}], minX:-1, maxX:6, maxY:15, minY:-1	
			},
		  ]
		
		];
		
		//初始化游戏底盘占用格局
		this.arrange=new Array();
		for(var i=0;i<10;i++){
			this.arrange[i]=new Array();
			for(var j=0;j<18;j++){
				this.arrange[i][j]=0;
			}
		}
		
		//初始化表示列堆积方块的高度
		this.distance=new Array();
		for(var i=0;i<=10;i++){
			this.distance[i]=18;
		}
		
		//初始化表示当前正下落方块的数据结构
		this.currentBlock={
			//blockType和blockNo代表当前具体的形状，为blockSets[blockType][blockNo]
			blockType:-1,	
			blockNo:0,	
			//offset_x和offset_y代表当前所在位置，初始化为正中间的顶端位置
			offsetX:3,
			offsetY:0,
			//表示下一个block
			nextBlock:-1,
			//表示下落速度，单位为ms
			speed:this.scoreStatus.levels[this.scoreStatus.curLevel]
			
		},
		
		//初始化每行下落高度
		this.rowsDown=new Array();
		for(var i=0;i<18;i++){
			this.rowsDown[i]=0;
		}
	  
	  },
	  
	  
	  /**
	   *初始化事件处理机制
	   */
	  initEvents:function(){

	  	var that = this;
		//绑定键盘按键处理事件（上、下、左、右键）
		// document.onkeydown=_(this.pressHandler).bind(this);


		  /*
		   *绑定键盘事件处理函数，包括左右移动、旋转等
		   */
		document.onkeydown = function(e){

			var event = e || window.event;
			//console.log(event.keyCode);
			if(event.keyCode==38){//按下up键，旋转图形
				that.checkArrange("rotate");
			}else if(event.keyCode==37){//按下left键，图形左移
				that.checkArrange("left");
			}else if(event.keyCode==39){//按下right键，图形右移
				that.checkArrange("right");
			}else if(event.keyCode==40){//按下down键，加速下落
				while (that.checkArrange("down") == true);
			}
		
		};

	
		/*
			开始点击事件处理
		*/
		document.getElementById("start").onclick = function(e){
			//console.log("click")
			if(that.startStatus==false){
				console.log("restart")
				that.startStatus=true;
				document.getElementById("start").className="disabled";
				document.querySelector("#message").style.display="none";
				//that.tetris.clearRect(0,0,this.width,this.height);
				for(var i=0;i<that.cellCount_x;i++){
					//this.tetris.translate(this.ox,this.ox);
					for(var j=0;j<that.cellCount_y;j++){
						that.tetris.clearRect(i*that.cellWidth,j*that.cellWidth,that.cellWidth,that.cellWidth);	
					}
									
				}



				for(var i=0;i<that.cellCount_x;i++){
					for(var j=0;j<that.cellCount_y;j++){
						that.arrange[i][j]=0;
					}
				}

				document.getElementById("score").value=0;
				document.getElementById("scoreShow").innerHTML = document.getElementById("score").value;
				document.getElementById("level").value=1;
				document.getElementById("levelShow").innerHTML = document.getElementById("level").value;
				document.getElementById("lines").value=0;
				document.getElementById("linesShow").innerHTML = document.getElementById("lines").value;
				document.getElementById("bestScore").innerHTML = localStorage.best;
				that.start(); 
			}	               			  
		 };

		
		/*
		 * 暂停按钮点击事件处理
		 */
		document.getElementById("pause").onclick = function(e){
			if(that.startStatus){
				if(!that.pauseStatus&&that.timerId){
					that.pauseStatus=true;					
					window.clearInterval(that.timerId);
				}else if(that.pauseStatus){
					that.pauseStatus=false;
					that.timerId=window.setInterval(that.dropHandler.bind(that),that.currentBlock.speed);
				}
			}
			
		 };

		
		//游戏级别选择处理
		// document.getElementById("gameLevel").onchange = function(){
		// 	var levellist = document.getElementById("gameLevel");
		// 	var selectIndex = levellist.selectedIndex;

		// 	that.scoreStatus.curLevel= document.getElementById("gameLevel").options[selectIndex].value;;
		// 	document.getElementById("level").value = that.scoreStatus.curLevel;
			
		// 	that.currentBlock.speed=that.scoreStatus.levels[that.scoreStatus.curLevel];
		// }

	  },
		
		
	  /**
	   *游戏开始
	   */
	  start:function(){
			//变量changed用于表示方块是否落定（false表示落定）
			this.changed=true;
			
			//初始化currentBlock
			//首次初始化时，生成两个随机数重置当前block和下一个block的类型即可
			//否则，将nextBlock设置为当前block，并将其他值reset为默认值
			if(this.currentBlock.blockType==-1){
				this.currentBlock.blockType=Math.floor(Math.random()*7);
				this.currentBlock.nextBlock=Math.floor(Math.random()*7);
			}else{
				this.currentBlock.blockType=this.currentBlock.nextBlock;
				this.currentBlock.blockNo=0;
				this.currentBlock.offsetX=3;
				this.currentBlock.nextBlock=Math.floor(Math.random()*7);		
			}
			this.currentBlock.offsetY=this.blockSets[this.currentBlock.blockType][this.currentBlock.blockNo].minY;
			//在预期图形显示区域绘制下一个将出现的方块形状
			this.drawBlocks(this.nextShape,this.blockSets[this.currentBlock.blockType][0].shape,this.blockSets[this.currentBlock.nextBlock][0].shape);
			
			//初始化下落方块的起始放置位置
			var initShape=new Array();
			for(var i=0;i<4;i++){
				initShape[i]={
								x:this.blockSets[this.currentBlock.blockType][0].shape[i].x+this.currentBlock.offsetX,
								y:this.blockSets[this.currentBlock.blockType][0].shape[i].y+this.currentBlock.offsetY
							}
				
			}
			//如果起始存放位置可用，则该位置绘制图形
			if(this.isIdle(initShape)){
				this.drawBlocks(this.tetris, initShape, initShape);
			}
			
			//设置定时器
			this.timerId=window.setInterval(this.dropHandler.bind(this),this.currentBlock.speed);
				
				
	  },
	  
	  
	  dropHandler:function(){
		this.changed=this.checkArrange("down");
		if(this.changed===false){
				window.clearInterval(this.timerId);
				//console.log("timer stopped!");
				//调整格局，消行，重置game.tetris和game.distance
				var lines=this.resetTetris();
				this.setScore(lines);
					
				//判断游戏是否结束，若结束则退出
				if(this.distance[10]==0){
					this.startStatus=false;
					/*this.message.font="bold 28px Lucida Calligraphy";
					this.message.textAlign="center";
					this.message.textBaseline="middle";
					this.message.fillText("The END!",120,180);*/
					//alert("游戏结束");
					document.querySelector("#message").style.display="inline";
					document.querySelector(".disabled").className="available";
				}else{
					this.start();
				}	
					return;
		}
	  },
	  
	  
	  /**
	   *该函数用于计算并显示得分
	   */
	  setScore: function(lines){
			//根据消除行数计算本次得分
			var returnScore=0;
			switch (lines) {
				case 0:
					returnScore=0;
					break;
				case 1:
					returnScore=10;
					break;
				case 2:
					returnScore=30;
					break;
				case 3:
					returnScore=50;
					break;
				case 4:
					returnScore=100;
					break;
			}
			
			//计算并显示总得分

			document.getElementById("lines").value = parseInt(document.getElementById("lines").value) + lines;
			
			document.getElementById("score").value = parseInt(document.getElementById("score").value) + returnScore;

			document.getElementById("linesShow").innerHTML = document.getElementById("lines").value;

			document.getElementById("scoreShow").innerHTML = document.getElementById("score").value;
			
	  },
	
	
	  /**
	   *绑定键盘事件处理函数，包括左右移动、旋转等
	   */
	 /* pressHandler:function(e){
			var event = e || window.event;
			//console.log(event.keyCode);
			if(event.keyCode==38){//按下up键，旋转图形
				this.checkArrange("rotate");
			}else if(event.keyCode==37){//按下left键，图形左移
				this.checkArrange("left");
			}else if(event.keyCode==39){//按下right键，图形右移
				this.checkArrange("right");
			}else if(event.keyCode==40){//按下down键，加速下落
				while (this.checkArrange("down") == true);
			}
		
	  },*/
	  
	  
	  /**
	   *根据具体的操作类型调用drawBlocks重新绘制方块
	   *这些操作包括：down（下落）、rotate（旋转变形）、left（左移）、（right）右移
	   */
	  checkArrange:function(operate){
			var returnValue=true;
			var curLocation=new Array();
			var nextLocation=new Array();
			var curShape=this.blockSets[this.currentBlock.blockType][this.currentBlock.blockNo].shape;		
			for(var i=0;i<4;i++){
				curLocation[i]={x:this.currentBlock.offsetX+curShape[i].x, y:this.currentBlock.offsetY+curShape[i].y};
			}
			
			//向下移处理逻辑
			if(operate==="down"){
				
				if(this.currentBlock.offsetY<this.blockSets[this.currentBlock.blockType][this.currentBlock.blockNo].maxY){
					 for(var i=0;i<4;i++){
						nextLocation[i]={x:curLocation[i].x, y:curLocation[i].y+1};
						//console.log(curLocation[i].y);
					}
				
					if(this.isIdle(nextLocation)){
						this.drawBlocks(this.tetris,curLocation,nextLocation);
						//_(drawBlocks).bind(this)();
						this.currentBlock.offsetY=this.currentBlock.offsetY+1;
					}else{
						returnValue = false;
					}
				
				}else{
					returnValue = false;
				}
				
			//向左移处理逻辑	
			}else if(operate==="left"){
				if(this.currentBlock.offsetX>this.blockSets[this.currentBlock.blockType][this.currentBlock.blockNo].minX){
					for(var i=0;i<4;i++){
						nextLocation[i]={x:curLocation[i].x-1, y:curLocation[i].y};
					}
					
					if(this.isIdle(nextLocation)){
						this.drawBlocks(this.tetris,curLocation,nextLocation);
						//_(drawBlocks).bind(this)();
						this.currentBlock.offsetX=this.currentBlock.offsetX-1;
					}
				}	
			//向右移处理逻辑	
			}else if(operate==="right"){
			
				if(this.currentBlock.offsetX<this.blockSets[this.currentBlock.blockType][this.currentBlock.blockNo].maxX){
					for(var i=0;i<4;i++){
						nextLocation[i]={x:curLocation[i].x+1, y:curLocation[i].y};
					}
					
					if(this.isIdle(nextLocation)){
						this.drawBlocks(this.tetris,curLocation,nextLocation);
						//_(drawBlocks).bind(this)();
						this.currentBlock.offsetX=this.currentBlock.offsetX+1;
					}
				}	
			//图形旋转处理逻辑
			}else if(operate==="rotate"){
				var newBlock=this.blockSets[this.currentBlock.blockType][(this.currentBlock.blockNo+1)%4];
				if(this.currentBlock.offsetX>=newBlock.minX&&this.currentBlock.offsetX<=newBlock.maxX){
					for(var i=0;i<4;i++){
						nextLocation[i]={x:this.currentBlock.offsetX+newBlock.shape[i].x, y:this.currentBlock.offsetY+newBlock.shape[i].y};										
					}
					
					if(this.isIdle(nextLocation)){
						this.drawBlocks(this.tetris,curLocation,nextLocation);
						
						this.currentBlock.blockNo=(this.currentBlock.blockNo+1)%4;
					}
				}

			}
			
			/*
			//判断新图形区域是否可用
			function isIdle(){
				var flag=true;
				for(var i=0;i<4;i++){
					if(game.arrange[nextLocation[i].x][nextLocation[i].y]==1){
						flag=false;
						break;
					}
				}
				return flag;
			}
			*/
			return returnValue;
	  },
	 	 	 	  
	  
	  /**
	   *该函数用于调整游戏格局，当方块落到低端后调用该函数
	   *返回本次消除的行数
	   */
	  resetTetris:function(){
			this.tetris.translate(this.ox,this.ox);
			for(var i=0; i<this.cellCount_y; i++){
				this.rowsDown[i]=0;
			}
			
			//重绘游戏格局，即更新this.arrange
			var curBlock=this.blockSets[this.currentBlock.blockType][this.currentBlock.blockNo];
			//表示是否在顶端阻塞
			var flag=false;
			for(var i=0;i<4;i++){
				if(this.arrange[curBlock.shape[i].x+this.currentBlock.offsetX][curBlock.shape[i].y+this.currentBlock.offsetY]==1){
					flag=true;
					break;
				}
			}
			//如果在顶端阻塞，则直接返回，游戏结束，无需再消行
			if(flag===true){
				this.distance[10]=0;
				return 0;
			}
			
			for(var i=0;i<4;i++){
				this.arrange[curBlock.shape[i].x+this.currentBlock.offsetX][curBlock.shape[i].y+this.currentBlock.offsetY]=1;
				if(this.distance[curBlock.shape[i].x+this.currentBlock.offsetX]>(curBlock.shape[i].y+this.currentBlock.offsetY)){
					this.distance[curBlock.shape[i].x+this.currentBlock.offsetX]=curBlock.shape[i].y+this.currentBlock.offsetY;
				}
				
			}
			
			//判断是否需要消行
			//如果需要消行，则擦除该行，并重置改行对应的状态（this.arrange），同时确定每行需要下落的高度(this.rowsDown)
			var maxEraseLines=curBlock.maxRow-curBlock.minRow+1;
			var eraseNum=0;
			for(var i=this.currentBlock.offsetY+curBlock.maxRow;i>=this.currentBlock.offsetY+curBlock.minRow;i--){
				var isFull=true;
				for(var j=0;j<10;j++){
					if(this.arrange[j][i]==0){
						isFull=false;
						break;
					}					
				}
				
				if(isFull===true){
					eraseNum++;
					
					//擦除该行
					game.tetris.clearRect(0,i*game.cellWidth,game.cellCount_x*game.cellWidth,game.cellWidth);
					//重置该行对应的状态
					for(var k=0;k<game.cellCount_x;k++){
						this.arrange[k][i]=0;
					}
					
					for(var k=0;k<i;k++){
							this.rowsDown[k]++;
					}
					
				}
			}

			
			//如果有消除的行，则重新排列其他所有行的方块
			if(eraseNum>0){
				for(var i=this.cellCount_y-1;i>=0;i--){
					if(this.rowsDown[i]>0){
						for(var j=0;j<this.cellCount_x;j++){
							if(this.arrange[j][i]==1){
								//绘制新方块
								this.tetris.translate(this.ox,this.ox);
								this.tetris.beginPath();
								this.tetris.fillRect(j*this.cellWidth+1, (i+this.rowsDown[i])*this.cellWidth+1, this.cellWidth-2, this.cellWidth-2);
								this.tetris.closePath();	
								this.arrange[j][i+this.rowsDown[i]]=1;
								
								this.tetris.clearRect(j*this.cellWidth, i*this.cellWidth, this.cellWidth, this.cellWidth);
								this.arrange[j][i]=0;
								
							}
						}
					}
				}
			
			}
			
			this.distance[10]=18;
			for(var i=0; i<this.cellCount_x; i++){
				for(var j=0; j<this.cellCount_y; j++){
					if(this.arrange[i][j]==1){
						this.distance[i]=j;
						if(this.arrange[i]<this.distance[10]){
							this.distance[10]=j;
						}
						break;
					}
				}
			}
			 
			return eraseNum;
	  },
	  
	  
	  /**
	  *判断指定区域是否未被占用
	  */
	 isIdle:function(location){
		var flag=true;
		for(var i=0;i<4;i++){
			if(this.arrange[location[i].x][location[i].y]==1){
				flag=false;
				break;
			}
		}
		return flag;
	 },
	  
	  
	  /**
	   *该函数用于画游戏底板
	   */
	  drawMap:function(){
	  		//console.log("drawMap")
			this.timerStatus=true;
			this.map.translate(this.ox,this.ox);
			this.map.strokeStyle="#fff";
			this.map.lineWidth=0.5;
			this.map.beginPath();
			for(var i=0;i<=this.cellCount_x;i++){
				
				var offset_x=i*this.cellWidth;
				this.map.moveTo(offset_x,0);
				this.map.lineTo(offset_x,this.height-1);			
			}
			
			for(var i=0;i<=this.cellCount_y;i++){
				var offset_y=i*this.cellWidth;
				this.map.moveTo(0,offset_y);
				this.map.lineTo(this.width-1,offset_y);
			}
			
			this.map.closePath();
			this.map.stroke();	

	  },
	  
	  
	  	  	 
	  /**
	   *该函数用于擦掉旧图形，绘制新图形
	   *参数canvas表示画板,
	   *参数oldShape表示需要擦掉的旧图形,
	   *参数newShape表示需要绘制的新图形
	   */
	  drawBlocks:function(canvas,oldShape,newShape){
			canvas.translate(this.ox,this.ox);
			//擦掉旧图形
			for(var i=0;i<4;i++){
					//this.tetris.translate(this.ox,this.ox);
				canvas.clearRect(oldShape[i].x*this.cellWidth,oldShape[i].y*this.cellWidth,this.cellWidth,this.cellWidth);					
			}
				
			//绘制新图形								
			canvas.beginPath();
			for(var i=0;i<4;i++){
				canvas.fillRect(newShape[i].x*this.cellWidth+1,newShape[i].y*this.cellWidth+1,this.cellWidth-2,this.cellWidth-2);
				//canvas.strokeRect(newShape[i].x*this.cellWidth,newShape[i].y*this.cellWidth,this.cellWidth,this.cellWidth);
			}
			canvas.closePath();
	  
	  }
	  	  
   
 };

	
	
 





window.onload=function(){	  
	game.init();	
}	   
    