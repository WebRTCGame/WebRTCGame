  //var key = 'lz6yk6yy4tg74x6r';
var key = 'kmjpk4hdea5rk9';

var Game = {};

window.requestAnimFrame = (function() {
	'use strict';
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame || function(callback) {
		window.setTimeout(callback, 1000 / 30);
	};
})();
Game.draw = function(){};

    var canvas;
    var ctx;
    var ballSpeed = 3
    var paddle0Pos = 480/2;
    var paddle1Pos = 480/2;
    var lastPaddle0Pos = 480/2;
    var lastPaddle1Pos = 480/2;
    var ballPos = {x:640/2,y: 480/2};
    var lastBallPos = {x:640/2,y: 480/2};
    var paddleWidth = 100;
    var ballWidth = 10;
    var ballVelocity = {x:ballSpeed,y:0};

    var player0Score = 0;
    var player1Score = 0;
    var score = player0Score + "   :   " + player1Score;

    if(Math.floor( Math.random() * 2 ) == 1){
        ballVelocity = {x:-ballSpeed,y:0};
    }
    ballVelocity.y = Math.random()*ballSpeed-ballSpeed/2;

    var renderPong = function(){
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,640,480);
        ctx.fillStyle = 'red';
        ctx.fillRect(20,paddle0Pos-paddleWidth/2,10,paddleWidth);

        ctx.fillStyle = 'red';
        ctx.fillRect(640-30,paddle1Pos-paddleWidth/2,10,paddleWidth);

        ctx.fillStyle = 'green';
        ctx.fillRect(ballPos.x-ballWidth/2,ballPos.y-ballWidth/2,ballWidth,ballWidth);

        ctx.fillStyle = "blue";
        ctx.fillText(score,640/2-50,20);
    };

    var hitPaddle = function(){
        if( ballPos.x >= 20 && ballPos.y >= paddle0Pos-paddleWidth/2 &&  ballPos.x < 20+10 && ballPos.y < paddle0Pos-paddleWidth/2+paddleWidth){
            return true;
        }

        if( ballPos.x >= 640-30 && ballPos.y >= paddle1Pos-paddleWidth/2 &&  ballPos.x < 640-30+10 && ballPos.y < paddle1Pos-paddleWidth/2+paddleWidth){
            return true;
        }

        return false;
    }

    var startServer = function(){
	console.log("startServer");
        var run = function(){
            renderPong();
            if(Key.isDown(Key.DOWN_ARROW)){
                paddle0Pos += 2;
            }
            if(Key.isDown(Key.UP_ARROW)){
                paddle0Pos -= 2;
            }
            paddle0Pos = Math.max(paddle0Pos,0);
            paddle0Pos = Math.min(paddle0Pos,640);


            tempBallPos = {x:ballPos.x,y:ballPos.y};

            ballPos.x += ballVelocity.x;
            ballPos.y += ballVelocity.y;

            if(ballPos.x > 640 || ballPos.x <0){
                if(ballPos.x < 0){
                    player1Score++;
                }
                if(ballPos.x > 640){
                    player0Score++;
                }
                score = player0Score + "   :   " + player1Score;
                app.send({type: "score", score: score})

                ballPos =  {x:640/2,y: 480/2};
                ballVelocity = {x:ballSpeed,y:0};
                if(Math.floor( Math.random() * 2 ) == 1){
                    ballVelocity = {x:-ballSpeed,y:0};
                }
                ballVelocity.y = Math.random()*ballSpeed-ballSpeed/2;
            }
            if(hitPaddle()){
                ballVelocity.x = -ballVelocity.x;
                ballVelocity.y = Math.random()*2*ballSpeed-ballSpeed;
                ballPos = tempBallPos;
            }
            if(ballPos.y > 480 || ballPos.y <0){
                ballVelocity.y = -ballVelocity.y;
                ballPos = tempBallPos;
            }

            if(paddle0Pos != lastPaddle0Pos){
                lastPaddle0Pos = paddle0Pos;
                app.send({type:"paddle0Pos",pos:paddle0Pos});
            }

            if(lastBallPos.x != ballPos.x || lastBallPos.y != ballPos.y){
                app.send({type:"ballPos",pos:ballPos});
            }
			window.requestAnimFrame(run);
        };

        var app = new App(key);
        app.on("connected",function(){
            console.log("connected with peer")
            canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            ctx = canvas.getContext('2d');
            $(document.body).append(canvas);
            //setInterval(run,1000/60);
			window.requestAnimFrame(run);
        });
        app.on("disconnected",function(){
            console.log("disconnected with peer")
            $('.headerBar').fadeIn();
        });
        app.on("message",function(obj){
            if(obj.type == "paddle1Pos"){
                paddle1Pos = obj.pos;
            }
        });
        app.on("error",function(err){
            console.log(err);
        });
        app.host();
        window.prompt("Give this code to the other person",app.guid);
        $('.headerBar').fadeOut();
    };

    var startClient = function(){
	console.log("start client");
        var run = function(){
            renderPong();
            if(Key.isDown(Key.DOWN_ARROW)){
                paddle1Pos += 2;
            }
            if(Key.isDown(Key.UP_ARROW)){
                paddle1Pos -= 2;
            }
            paddle1Pos = Math.max(paddle1Pos,0);
            paddle1Pos = Math.min(paddle1Pos,640);

            if(paddle1Pos != lastPaddle1Pos){
                lastPaddle1Pos = paddle1Pos;
                app.send({type:"paddle1Pos",pos:paddle1Pos});
            }
			window.requestAnimFrame(run);
        };

        var app = new App(key);
        app.on("connected",function(){
            canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            ctx = canvas.getContext('2d');
            $(document.body).append(canvas);
            console.log("connected with peer")
            //setInterval(run,1000/60);
			window.requestAnimFrame(run);
        })
        app.on("disconnected",function(){
            console.log("disconnected with peer")
            $('.headerBar').fadeIn();
        })
        app.on("message",function(obj){
            if(obj.type == "paddle0Pos"){
                paddle0Pos = obj.pos;
            }
            if(obj.type == "ballPos"){
                ballPos = obj.pos;
            }
            if(obj.type == "score"){
                score = obj.score;
            }
        })
        app.on("error",function(err){
            console.log(err);
        })
        app.join(window.prompt("Enter in game code"));
        $('.headerBar').fadeOut();
    };
