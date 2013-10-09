//Create Firebase references and auth variables
var rootRef = new Firebase("fb-tic-tac-toe.firebaseio.com/");
var gameRef = rootRef.child('games');
var username = null;
var userPhoto = null;

//Firebase Simple Login with Facebook
var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
    if (error) {
        //an error occurred while attempting login
        console.log(error);
    } else if (user) {
        //user authenticated with Firebase
        username = user.displayName;
        userPhoto = "http://graph.facebook.com/" + user.id + "/picture";
        $('<div/>').text("Signed in as ").attr({'class':'button button-primary button-rounded button-large'}).append(
            $('<a>').attr({'href': 'https://facebook.com/' + user.id, 'class': 'facebookLink', 'target': '_blank'}).text(username)
            ).appendTo($('#signed-in'));
        $('#login-btn').css("visibility", "hidden");
        $('#signed-in').css({"visibility": "visible", "display": "inline-block"});
    } else {
        //user is logged out
    }
});

//Log in button
var loginButton = $('#login-btn');
loginButton.click(function (e) {
    e.preventDefault();
    loginButton.css("visibility", "hidden");
    auth.login('facebook', {
        rememberMe: true
    });
});

//INDEX PAGE

//List all games
gameRef.on('child_added', function(e) {
  var game = e.val();
  $('<a>').attr({'href': document.URL + 'game.html?gameId=' + e.name(), 'id':game['gameId'], 'class': 'gameLink'}).text(game['name']).appendTo($('#currentGames'));  
});

//Create new game
$('#new-game').click(function (e) {
    if (username != null) {
      e.preventDefault();
      var gameName = $('#gameName').val();
      $('#gameName').val('');
      var game = gameRef.push({"1":"","2":"","3":"","4":"","5":"","6":"","7":"","8":"","9":"", "name":gameName, "currentPlayer": "player1", "winner": false});
    } else {
      alert("You must sign in with Facebook to create a game!");
    }
});

//INDIVIDUAL GAME PAGE

//Get game name from URL
var id = getURLParameter('gameId');
function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
};

if (id != "null") {
  setupGame();
}

//Set up the board and handle click events
function setupGame() {
  var currentPlayer = "";
  var thisGame = gameRef.child(id);
  var currentBoard = null;

  var firstVal = true;
  function displayBoard(board) {
    if (!firstVal) {
      return;
    }
    firstVal = false;

    if (!board.player1 && currentPlayer == "") { //Set player 1 as first person to enter the game
      thisGame.child('player1').set({
        name: username,
        photo: userPhoto
      });
      currentPlayer = 'player1';
    } else if (!board.player2 && currentPlayer == "") { //Assign player 2 to the second person to enter the room
      thisGame.child('player2').set({
        name: username,
        photo: userPhoto
      });
      currentPlayer = 'player2';
    } else {
    }

    //Create the game title and board
    $('<div/>').text(board['name']).appendTo($('#gameTitle'));
    $('<table/>').attr({'id':'board' + id, 'class':'board'}).appendTo('#board');

    //TODO fix this for loop so i'm incrementing i by 1 and using another variable to keep track of the
    for(var i = 1; i <= 7; i+=3) {
      $('<tr/>').attr({'id': id + "row" + i}).appendTo($('#board' + id));
      $('<td/>').attr({'id': id + (i), 'class':'tile'}).html($('<img>').attr({'src':board[i].photo})).appendTo($('#' + id + "row" + i));
      $('<td/>').attr({'id': id + (i + 1), 'class':'tile'}).html($('<img>').attr({'src':board[i + 1].photo})).appendTo($('#' + id + "row" + i));
      $('<td/>').attr({'id': id + (i + 2), 'class':'tile'}).html($('<img>').attr({'src':board[i + 2].photo})).appendTo($('#' + id + "row" + i));
    }

    //Handle click events on tiles
    $('.tile').on('click', function(e) {
      e.preventDefault();
      if (username == null) {
        alert("You must be signed in to play!");
      } else if (currentPlayer != currentBoard.currentPlayer) { //Only allow the current player to move
        alert("Not your turn!");
      } else {
        var tile = e.currentTarget.id[e.currentTarget.id.length - 1]; //Get the tile number of the move
        thisGame.child(tile).set({
          name: username,
          photo: userPhoto
        });
        if (currentPlayer == 'player1') { //Switch currentPlayer
          thisGame.child('currentPlayer').set('player2');
        } else {
          thisGame.child('currentPlayer').set('player1');
        }
      }
    });
  }
  // Check for a winner
  var winner = false;  
  function checkWinner(board) {
    $("#playerNames").html("");
    if (board.player1) { //Add player's photos and names to board
      $('<img>').attr({'src':board.player1.photo, 'class':'playerPhoto'}).appendTo($('#playerNames'));
      $('<div/>').text(board.player1.name).attr({'class':'playerName'}).appendTo($('#playerNames'));
    }
    if (board.player2) {
      $('<img>').attr({'src':board.player2.photo, 'class':'playerPhoto'}).appendTo($('#playerNames'));
      $('<div/>').text(board.player2.name).attr({'class':'playerName'}).appendTo($('#playerNames'));
    }


    if (board.currentPlayer == "player1") {
      if (board.winner) {
        alert(board.winner + " won the game!");
      }
      return;
    } else if (board.winner != false) { //TODO: figure out why this executes twice if player2 wins
      if (!winner) {
        winner = true;
        alert(board.winner + " won the game!");
        return;
      }
      return;
    }

    //Update the board with pictures for each person's move
    for (var i = 1; i < 10; i++) {
      $('#' + id + i).html("");
      if (board[i] != "") {
        $('<img>').attr({'src':board[i].photo}).appendTo($('#' + id + i));
      }
    }

    //Check for horizontal winning patterns
    for (var row = 1; row <= 7; row+=3) { 
      if ((board[row] != "") && ((board[row].name == board[row + 1].name) && (board[row + 1].name == board[row + 2].name))) {
        thisGame.child('winner').set(board[row].name);
      } 
    } 

    //Check vertical winning patterns
    for (var column = 1; column <= 3; column++) {
      if ((board[column] != "") && ((board[column].name == board[column + 3].name) && (board[column + 3].name == board[column + 6].name))) {
        thisGame.child('winner').set(board[column].name);
      } 
    }

    //Check diagonal winning patterns
    if ((board[1] != "") && ((board[1].name == board[5].name) && (board[5].name == board[9].name))) {
      thisGame.child('winner').set(board[1].name);
    } else if ((board[3] != "") && ((board[3].name == board[5].name) && (board[5].name == board[7].name))) {
      thisGame.child('winner').set(board[3].name);
    }
  }

  //Game page logic
  thisGame.on('value', function(snap) {
    currentBoard = snap.val();
    displayBoard(currentBoard);
    checkWinner(currentBoard);
  });
}