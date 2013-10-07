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
          var game = gameRef.push({"player1": username, "1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0, "joined": false});
          $('<a>').attr({'href':'/game.html?gameId=' + game.name(), 'id':game.name()}).text(game.name()).appendTo($('#games'));
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


      //Create board
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
      $('<td/>').attr({'id': id + "7", 'class':'tile'}).text(board[1]).appendTo($('#' + id + "row3"));
      $('<td/>').attr({'id': id + "8", 'class':'tile'}).text(board[1]).appendTo($('#' + id + "row3"));
      $('<td/>').attr({'id': id + "9", 'class':'tile'}).text(board[1]).appendTo($('#' + id + "row3"));

      $('<button/>').attr({'id':'join' + id, 'class':'join'}).text("Join this game!").appendTo($('#board'));

      $('.tile').on('click', function(e) {
        e.preventDefault();
        var tile = e.currentTarget.id[e.currentTarget.id.length - 1];
        console.log(tile);
        thisGame.child(tile).set('X');
      });

      $('.join').on('click', function(e) {
        e.preventDefault();
        //var player1 = null;
        player1Ref = thisGame.child('player1');
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

  // $('').on('click', function(e) {
  //   e.preventDefault();
  //   console.log('clicked');
  // });




