//variable declaration 
var buttons = [];
var texts = [];
var socket;
var playerNames = ["Player 0", "Player 1", "Player 2", "Player 3"];
var me = 0;
var playerChars = ["X", "O", "A", "B"];
var playerColors = ["#222222", "#222222", "#222222", "#222222"];
var gameIsGoing = true;
var firstMove = true;
var hasGottenSuggestion = false;
var winOrder = [-1, -1, -1, -1];

//function calling
setupReferences();
setupButtonEvents();
toggleFirstMove(true);
connectSockets();

//server-communication-handling functions


function connectSockets(){
  socket = io.connect();

  socket.on('hasGottenSuggestion', function() {
    socket.emit('hasGottenSuggestion', hasGottenSuggestion);
  });

  socket.on('suggestion', function(data) {
    hasGottenSuggestion = true;
    $(".inputName > input").val(data.name);
    $(".inputChar > input").val(data.char);
    $(".inputColor > input").val(data.color);
    updateInputPreview();
  });
}

function setupSockets(sName, sColor, sChar){

  var data = {
    name: sName,
    color: sColor,
    char: sChar
  }
  socket.emit('enter', data);

  socket.on('moved', function(data) {
    toggleFirstMove(false);
    setText(data.pos, data.player);
    setNextMove(data.nextMove);
  });

  socket.on('restart', function() {
    restart();
  });

  socket.on('getWinConds', function(arrayToPrint) {
    console.log(arrayToPrint);
  });

  socket.on('finished', function(data){
  });

  socket.on('data', function(data){
    /*
    me
    playerNames
    playerChars
    playerColors
    board
    currentMove
    overallPoints
    - playing
    - winOrder
    firstMove
    */
    me = data.me;
    playerNames = data.playerNames;
    playerChars = data.playerChars;
    playerColors = data.playerColors;
    winOrder = data.winOrder;
    setBoard(data.board);
    setNextMove(data.currentMove);
    setPointsText(data.overallPoints);
    setBlockIfFirstMove();
    exibitCurrentWinners();
    toggleFirstMove(data.firstMove);
  });

  socket.on('finish', function(data) {
    $(".new-game-button-div").removeAttr("hidden");
    gameIsGoing = false;
    setWaitingText("Game ended! Press the button to start a new one.");
  });

  socket.on('startNewGame', function() {
    gameIsGoing = true;
    toggleFirstMove(true);
    $(".new-game-button-div").attr("hidden", "true");
  });

  socket.on('adminGetResponse', function(print) {
    console.log(print);
  });
}


//getting-data functions

function setBoard(board){
  for(var i = 0; i < board.length; i++){
    if(board[i] == -1){
      setText(i, -1);
    } else {
      setText(i, board[i]);
    }
  }
}

function setPointsText(points){
  for(var i = 0; i < 4; i++){
    var tempText = getSpanColor(i) + " - " + points[i] + "pts";
    $(".p" + i).html(tempText);
  }
}

function exibitCurrentWinners(){
  var showingWinners = [0, 0, 0, 0];
  for(var i = 0; i < 4; i++){
    if(winOrder[i] != -1){
      $(".w"+i).html((i+1)+"º: "+$(".p"+winOrder[i]).html());
      $(".sw"+i).removeAttr("hidden");
      $(".sp"+winOrder[i]).css("opacity", "0.3");
      showingWinners[winOrder[i]] = 1;
    } else {
      $(".sw"+i).attr("hidden", "true");
    }
  }
  $(".sidebar-winners").attr("hidden", "true");
  for(var i = 0; i < 4; i++){
    if(showingWinners[i] == 0){
      $(".sp"+i).css("opacity", "1");
    } else {
      $(".sidebar-winners").removeAttr("hidden");
    }
  }
}

function setWinnersEqualToPlayers(){

}




//ui-handling functions

function getSpanColor(player){
  var spanColor = "<span style=\"color: "+playerColors[player]+";\">"+playerNames[player]+"</span>";
  return spanColor;
}

function setText(btn, player){
  if(player == -1){
    texts[btn].html("");
    texts[btn].css("color", "#222222");
  } else {
    texts[btn].html(playerChars[player]);
    texts[btn].css("color", playerColors[player]);
  }
}

function setNextMove(nextMove){
  if(gameIsGoing){
    setArrow(nextMove);
    if(nextMove == me){
      setWaitingText("It's your turn!");
    } else {
      setWaitingText("Wait for "+getSpanColor(nextMove)+" to move.");
    }
  } else {
    setArrow(-1);
  }
}

function setWaitingText(text){
  $(".waiting").html(text);
}

function setArrow(player){
  $(".pa0").attr("hidden", "true");
  $(".pa1").attr("hidden", "true");
  $(".pa2").attr("hidden", "true");
  $(".pa3").attr("hidden", "true");

  if(player >= 0 && player <= 3){
    $(".pa"+player).removeAttr("hidden");
  }

}

function toggleFirstMove(a){
  firstMove = a;
  setBlockIfFirstMove();
}

function setBlockIfFirstMove(){
  if(firstMove){
    texts[12].html("Ø");
    texts[12].css("color", "#CF7500"); //#AAAAAA
  } else {
    if(texts[12].html() == "Ø"){
      setText(12, -1);
    }
  }
}

function setupButtonEvents(){
  for(var i = 0; i < buttons.length; i++){
    buttons[i].click({btnNumber: i}, onMyMove);
  }
}

function onMyMove(obj){
  var btn = obj.data.btnNumber;
  socket.emit('move', {pos: btn});
}

function restart(){
  for(var i = 0; i < 25; i++){
    setText(i, -1);
  }
}

function setupReferences(){
  var s1 = "#b";
  var s2 = " > .square-text";
  for(var i = 0; i < 25; i++){
    buttons.push($(s1 + i));
    texts.push($(s1 + i + s2));
  }

  //setups beggining
  var br = $(".board").css("margin-right");
  var pix = parseInt(br.split("p")[0]) + 150;
  if($(window).width() < 1050){
    pix += 150;
  }
  br = pix + "px";
  $(".board").css("margin-left", br);
  $(".waiting").css("width", "750px");
  $(".waiting").css("margin-left", br);
  //$(".waiting").css("margin-right", br);
}


$(".new-game-button").click(function() {
  socket.emit("startNewGame");
});





//admin


function admin(password, command, string){
  var data = {
    password: password,
    command: command,
    string: string
  };
  socket.emit('admin', data);
}




//inputArea code

inputLayoutSetup();

function inputLayoutSetup(){
  $(".inputArea").width($(window).width());
  $(".inputArea").height($(window).height());
  $(".inputBG").width($(window).width());
  $(".inputBG").height($(window).height());

  var divMarginLeft = ($(window).width() - $(".inputDiv").width())/2;
  divMarginLeft = divMarginLeft + "px";
  var divMarginTop = ($(window).height() - $(".inputDiv").height())/2;
  $(".inputDiv").css("margin-left", divMarginLeft);
  $(".inputDiv").css("margin-top", divMarginTop);

  var divWidth = $(".inputPart").width();
  $(".inputName > input").width(divWidth - $(".inputName > label").width());
  $(".inputColor > input").width(divWidth - $(".inputColor > label").width());
  $(".inputChar > input").width(divWidth - $(".inputChar > label").width());

  $(".inputPart > input").height($(".inputPart > label").height()*3/4);

  $(".inputName > input").css("top", "-"+($(".inputName").height() - $(".inputName > input").height())/2+"px");
  $(".inputColor > input").css("top", "-"+($(".inputColor").height() - $(".inputColor > input").height())/2+"px");
  $(".inputChar > input").css("top", "-"+($(".inputChar").height() - $(".inputChar > input").height())/2+"px");

  $("#enterGame").click(enterGame);
}

function isValidColor(strColor){
  if(strColor.length == 7 && strColor.charAt(0) == '#'){
    for(var i = 1; i < 7; i++){
      if(parseInt(strColor.charAt(i)) >= 0 && parseInt(strColor.charAt(i)) <= 9){}
      else if(strColor.toLowerCase().charAt(i) == 'a' || strColor.toLowerCase().charAt(i) == 'b' || strColor.toLowerCase().charAt(i) == 'c'){}
      else if(strColor.toLowerCase().charAt(i) == 'd' || strColor.toLowerCase().charAt(i) == 'e' || strColor.toLowerCase().charAt(i) == 'f'){}
      else return false;
    }
    return true;
  } else {
    var s = new Option().style;
    s.color = strColor;
    return s.color == strColor.toLowerCase();
  }
}

function updateInputPreview(){
  var name = $(".inputName > input").val();
  var color = $(".inputColor > input").val();
  var char = $(".inputChar > input").val();

  var span = $(".previewSpan");
  span.html(name + " - " + char);
  span.css("color", color);
}

function enterGame(){
  var name = $(".inputName > input").val();
  var color = $(".inputColor > input").val();
  var char = $(".inputChar > input").val();

  if(isValidColor(color)){
    $(".inputArea").attr("hidden", "true");
    setupSockets(name, color, char);
  } else {
    alert("Color isn't valid!");
  }
}
