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
   })

   //Create new game
   $('#new-game').click(function (e) {
        if (username != null) {
          e.preventDefault();
          var gameName = $('#gameName').val();
          $('#gameName').val('');
          var game = gameRef.push({"player1": username, "1":"","2":"","3":"","4":"","5":"","6":"","7":"","8":"","9":"", "joined": false, "name":gameName, "winner": false});
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

  //Create board for each game
  var thisGame = gameRef.child(id);
  thisGame.once('value', function(snapshot) {
    var board = snapshot.val();
    var player1Ref = thisGame.child('player1');
    var player2Ref = thisGame.child('player2');

    $('<div/>').text(board['name']).appendTo($('#gameTitle'));
    $('<table/>').attr({'id':'board' + id, 'class':'board'}).appendTo('#board');

    for(var i = 1; i <= 7; i+=3) {
      $('<tr/>').attr({'id': id + "row" + i}).appendTo($('#board' + id));
      $('<td/>').attr({'id': id + (i), 'class':'tile'}).html($('<img>').attr({'src':board[i]})).appendTo($('#' + id + "row" + i));
      $('<td/>').attr({'id': id + (i + 1), 'class':'tile'}).html($('<img>').attr({'src':board[i + 1]})).appendTo($('#' + id + "row" + i));
      $('<td/>').attr({'id': id + (i + 2), 'class':'tile'}).html($('<img>').attr({'src':board[i + 2]})).appendTo($('#' + id + "row" + i));
     }

    $('<img>').attr({'src':userPhoto, 'class':'playerPhoto'}).appendTo($('#players'));
    $('<div/>').text(board['player1']).attr({'class':'playerName'}).appendTo($('#players'));
    $('<div/>').attr({'id':'waiting', 'class':'emptyPic playerPhoto'}).appendTo($('#players'));
    $('<button/>').attr({'id':'join' + id, 'class':'playerName join'}).text("Join this game!").appendTo($('#players'));
    $('<div/>').attr({'id':'player2', 'class':'playerName'}).appendTo($('#players'));



    //Set second player when someone clicks 'join the game'
    $('.join').on('click', function(e) {
      e.preventDefault();
      player1Ref.on('value', function(snapshot) {
        var player1 = snapshot.val();
        if (player1 == username) {
          alert("You can't play yourself!");
        } else if (username == null) {
          alert("You must be signed in with Facebook to play!");
        } else {
          thisGame.child('joined').set(true);
          thisGame.child('player2').set(username);
          $('.join').css('display','none');
          $('#waiting').css('display','none');
          $('<img>').attr({'src':userPhoto, 'class':'playerPhoto'}).appendTo($('#players'));
          $('<div/>').text(username).attr({'class':'playerName player2'}).appendTo($('#players'));
        }
      });
    })
  });

  //Handle click events on game squares
  thisGame.on('value', function(snapshot) {
    var player1Ref = thisGame.child('player1');
    var player2Ref = thisGame.child('player2');


    var turn = "player1"; //this flag doesn't work if you refresh the page

    $('.tile').on('click', function(e) {
      if (username == null) {
        alert("You must be signed in to play!");
      } else {
      e.preventDefault();
      var tile = e.currentTarget.id[e.currentTarget.id.length - 1];

      //Get player info and update moves in Firebase
      player1Ref.on('value', function(snapshot) {
        var player1 = snapshot.val();
        if ((player1 == username) && (turn == "player1")) {
          thisGame.child(tile).set(userPhoto);
          $('<img>').attr({'src':userPhoto}).appendTo($('#' + id + tile));
          turn = "player2";
        }
      })

      player2Ref.on('value', function(snapshot) {
        var player2 = snapshot.val();
        if ((player2 == username) && (turn == "player2")) {
          thisGame.child(tile).set(userPhoto);
          $('<img>').attr({'src':userPhoto}).appendTo($('#' + id + tile));
          turn = "player1";
        }
      })
    }
    })

  });

  //Check for a winner
  var winner = false;
  var checkWinner = thisGame.on('value', function(snap) {
    var board = snap.val();

    //Check horizontal
    for (var i = 1; i <= 7; i+=3) { //i can't figure out how to do this without doing this terrible for loop
      if ((board[i] != "") && ((board[i] == board[i + 1]) && (board[i + 1] == board[i + 2]))) {
        winner = true;
      } 
    } 


    //Check vertical
    for (var i = 1; i <= 3; i++) {
      if ((board[i] != "") && ((board[i] == board[i + 3]) && (board[i + 3] == board[i + 6]))) {
        winner = true;
      } 
    }

    //Check diagonal
    if ((board[1] != "") && ((board[1] == board[5]) && (board[5] == board[9]))) {
      winner = true;
    } else if ((board[3] != "") && ((board[3] == board[5]) && (board[5] == board[7]))) {
      winner = true;
    }

    if (winner == true) {
      // $('<div/>').attr({'class':'winner'}).text(username + ' wins!').appendTo($('#board'));
      // thisGame.child('winner').set(username);
    }
  });