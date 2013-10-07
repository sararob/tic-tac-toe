//Create firebase references
var rootRef = new Firebase("fb-tic-tac-toe.firebaseio.com/");
var gameRef = rootRef.child('games');
var userRef = rootRef.child('users');
var username = null;

//Firebase Simple Login with Facebook
    var auth = new FirebaseSimpleLogin(rootRef, function(error, user) {
        if (error) {
            //an error occurred while attempting login
            console.log(error);

        } else if (user) {
            //user authenticated with Firebase
            console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
            username = user.displayName;
            $('<div/>').text("Signed in as ").append(
                $('<a>').attr({'href': 'https://facebook.com/' + user.id, 'class': 'facebookLink', 'target': '_blank'}).text(username)
                ).appendTo($('#signed-in'));
            $('#login-btn').css("visibility", "hidden");
            $('#signed-in').css({"visibility": "visible", "display": "inline-block"});
            $('#logout').css("visibility", "visible");
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

   //Log out button
   var logoutButton = $('#logout');
   logoutButton.click(function (e) {
        e.preventDefault();
        loginButton.css("visibility", "visible");
        logoutButton.css("visibility", "hidden");
        $('#signed-in').css({"display": "none", "visibility": "hidden"});
        auth.logout();
        username = null;
    });

   //Create new game
   $('#new-game').click(function (e) {
        if (username != null) {
          e.preventDefault();
          var gameName = $('#gameName').val();
          $('#gameName').val('');
          var game = gameRef.push({"player1": username, "1":"","2":"","3":"","4":"","5":"","6":"","7":"","8":"","9":"", "joined": false, "name":gameName, "winner": false});
          $('<a>').attr({'href':'sararob.github.io/game.html?gameId=' + game.name(), 'id':game.name()}).text(gameName).appendTo($('#games'));
          var gameId = game.name();

          var currentGameRef = gameRef.child(gameId);
        } else {
          alert("You must sign in with Facebook to create a game!");
        }

   });

   //Game page logic

   //Get game namne
    var id = getURLParameter('gameId');
    function getURLParameter(name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
        );
    };
    var thisGame = gameRef.child(id);
    thisGame.once('value', function(snapshot) {
      var board = snapshot.val();

      player1Ref = thisGame.child('player1');
      player2Ref = thisGame.child('player2');

      //Create board
      $('<div/>').text(board['name']).appendTo($('#gameTitle'));
      $('<table/>').attr({'id':'board' + id, 'class':'board'}).appendTo('#board');
      $('<tr/>').attr({'id': id + "row1"}).appendTo($('#board' + id));
      $('<td/>').attr({'id': id + "1", 'class':'tile'}).text(board[1]).appendTo($('#' + id + "row1"));
      $('<td/>').attr({'id': id + "2", 'class':'tile'}).text(board[2]).appendTo($('#' + id + "row1"));
      $('<td/>').attr({'id': id + "3", 'class':'tile'}).text(board[3]).appendTo($('#' + id + "row1"));
      $('<tr/>').attr({'id': id + "row2"}).appendTo($('#board' + id));
      $('<td/>').attr({'id': id + "4", 'class':'tile'}).text(board[4]).appendTo($('#' + id + "row2"));
      $('<td/>').attr({'id': id + "5", 'class':'tile'}).text(board[5]).appendTo($('#' + id + "row2"));
      $('<td/>').attr({'id': id + "6", 'class':'tile'}).text(board[6]).appendTo($('#' + id + "row2"));
      $('<tr/>').attr({'id': id + "row3"}).appendTo($('#board' + id));
      $('<td/>').attr({'id': id + "7", 'class':'tile'}).text(board[7]).appendTo($('#' + id + "row3"));
      $('<td/>').attr({'id': id + "8", 'class':'tile'}).text(board[8]).appendTo($('#' + id + "row3"));
      $('<td/>').attr({'id': id + "9", 'class':'tile'}).text(board[9]).appendTo($('#' + id + "row3"));

      $('<button/>').attr({'id':'join' + id, 'class':'join'}).text("Join this game!").appendTo($('#board'));


      $('.tile').on('click', function(e) {
        e.preventDefault();
        var tile = e.currentTarget.id[e.currentTarget.id.length - 1];
        console.log(tile);

        //Get player info and set moves
        player1Ref.on('value', function(snapshot) {
          var player1 = snapshot.val();
          if (player1 == username) {
            thisGame.child(tile).set('X');
            $('#' + id + tile).text('X');
          }
        })

        player2Ref.on('value', function(snapshot) {
          var player2 = snapshot.val();
          if (player2 == username) {
            thisGame.child(tile).set('O');
            $('#' + id + tile).text('O');
          }
        })


      });

      $('.join').on('click', function(e) {
        e.preventDefault();
        //var player1 = null;

        player1Ref.on('value', function(snapshot) {
          var player1 = snapshot.val();
          if (player1 == username) {
            alert("You can't play yourself!");
          } else {
            thisGame.child('joined').set(true);
            thisGame.child('player2').set(username);
            $('.join').css('display','none');
          }
        });

      })

    });

    //Determining a winner
    var winner = false;
    thisGame.on('value', function(snap) {
      var board = snap.val();
      // if ((board[1] != "") && ((board[1] == board[2]) && (board[2] == board[3])) || ((board[4] == board[5]) && (board[5] == board[6])) || ((board[7] == board[8]) && (board[8] == board[9])) || ((board[1] == board[4]) && (board[4] == board[7])) || ((board[2] == board[5]) && (board[5] == board[8])) || ((board[3] == board[6]) && (board[6] == board[9])) || ((board[1] == board[5]) && (board[5] == board[9]))|| ((board[3] == board[5]) && (board[5] == board[7])) ) {
      //   console.log('winner!');
      // }

      //Check for the 8 different winning combinations
      if ((board[1] != "") && ((board[1] == board[2]) && (board[2] == board[3]))) {
        winner = true;
      } else if ((board[4] != "") && ((board[4] == board[5]) && (board[5] == board[6]))) {
        winner = true;
      } else if ((board[7] != "") && ((board[7] == board[8]) && (board[8] == board[9]))) {
        winner = true;
      } else if ((board[1] != "") && ((board[1] == board[4]) && (board[4] == board[7]))) {
        winner = true;
      } else if ((board[2] != "") && ((board[2] == board[5]) && (board[5] == board[8]))) {
        winner = true;
      } else if ((board[3] != "") && ((board[3] == board[6]) && (board[6] == board[9]))) {
        winner = true;
      } else if ((board[1] != "") && ((board[1] == board[5]) && (board[5] == board[9]))) {
        winner = true;
      } else if ((board[3] != "") && ((board[3] == board[5]) && (board[5] == board[7]))) {
        winner = true;
      }

      if (winner == true) {
        $('<div/>').attr({'class':'winner'}).text(username + ' wins!').appendTo($('#board'));
        thisGame.child('winner').set(username);
      }
    });

  // $('').on('click', function(e) {
  //   e.preventDefault();
  //   console.log('clicked');
  // });




