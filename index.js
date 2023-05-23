let firstCard = undefined;
    let secondCard = undefined;
    let clicks = 0;
    let pairsMatched = 0;
    const totalPairs = 3; // number of pairs
    let pairsLeft = totalPairs; // number of pairs
    let gameStart = false;
    let startTime = undefined;
    let gameTimer = undefined;
    let timerStarted = false; // Flag to track if the timer has started
    let timerReset = false;

    function updateStats() {
      $("#clicks").text(`Clicks: ${clicks}`);
      $("#pairs_left").text(`Pairs left: ${pairsLeft}`);
      $("#pairs_matched").text(`Pairs matched: ${pairsMatched}`);
      $("#total_pairs").text(`Total pairs: ${totalPairs}`);
    }

    function startTimer() {
        startTime = new Date().getTime();
        gameTimer = setInterval(() => {
          const totalSeconds = Math.floor((new Date().getTime() - startTime) / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          $("#game_timer").text(`Time: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        }, 1000);
    }
      

    function stopTimer() {
      clearInterval(gameTimer);
    }

    function handleCardClick() {
        if (!gameStart) {
            gameStart = true;
            if (!timerStarted) {
                startTimer();
                timerStarted = true;
            }
        }
      
        var card = $(this);
        var frontFace = card.find(".front_face");
        var backFace = card.find(".back_face");
      
        if (card.hasClass("flip") || card.hasClass("matched")) {
          // Return early if the card is already flipped or matched
          return;
        }
      
        card.addClass("flip");
      
        if (!firstCard) {
          firstCard = card;
        } else {
          secondCard = card;
      
          if (firstCard.find(".front_face")[0].src === secondCard.find(".front_face")[0].src) {
            console.log("match");
            firstCard.addClass("matched");
            secondCard.addClass("matched");
            pairsMatched++;
            pairsLeft--;
          } else {
            console.log("no match");
            setTimeout(() => {
              firstCard.removeClass("flip");
              secondCard.removeClass("flip");
            }, 1000);
          }
      
          clicks++;
          updateStats();
          firstCard = undefined;
          secondCard = undefined;
      
          if (pairsMatched === totalPairs) {
            stopTimer();
            console.log("Success! Game over");
            showModal("Congratulations!", "You've won the game!");
          }
        }
    }
    
    function showModal(title, message) {
        alert(title + "\n\n" + message);
    }
      

    $(document).ready(function () {
        let gameStart = false;
        let startTime = 0;
        let gameTimer = undefined;
        let timerStarted = false;
      $("#dark_theme_button").click(function () {
        $("body").toggleClass("dark-theme");
      });

      $("#easy_button").click(function () {
        createGameGrid(6);
        $("#game_timer").text("Time: 00:00");
        stopTimer();
        timerStarted = false;
        $("#start_button").show();
      });

      $("#medium_button").click(function () {
        createGameGrid(12);
        $("#game_timer").text("Time: 00:00");
        stopTimer();
        timerStarted = false;
        $("#start_button").show();
      });

      $("#hard_button").click(function () {
        createGameGrid(24);
        $("#game_timer").text("Time: 00:00");
        stopTimer();
        timerStarted = false;
        $("#start_button").show();
      });

    function createGameGrid(numCards) {
        var gameGrid = $("#game_grid");
        gameGrid.empty();

        // Adjust class based on difficulty level
        gameGrid.removeClass("easy medium hard").addClass(getDifficultyClass(numCards));

        // Determine the number of columns based on difficulty level
        var numColumns;
        if (numCards === 6) {
            numColumns = 3; // Easy level
        } else if (numCards === 12) {
            numColumns = 4; // Medium level
        } else if (numCards === 24) {
            numColumns = 6; // Hard level
        }

        // Set the grid template columns dynamically
        gameGrid.css("grid-template-columns", `repeat(${numColumns}, 1fr)`);

        // Fetch random Pokémon data from the API
        var apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=" + numCards;
        $.ajax({
          url: apiUrl,
          method: "GET",
          success: function (response) {
            console.log(response); // Log the response data
            var pokemonList = response.results;
            var shuffledPokemon = shuffleArray(pokemonList).slice(0, numCards / 2);
            var pokemonPairs = [...shuffledPokemon, ...shuffledPokemon];
            pokemonPairs = shuffleArray(pokemonPairs);

            for (var i = 0; i < numCards; i++) {
              var card = $("<div>").addClass("col").append(
                $("<div>").addClass("card").append(
                  $("<img>").attr("id", "img" + i).addClass("front_face").attr("src", "back.webp").attr("alt", ""),
                  $("<img>").addClass("back_face").attr("src", "").attr("alt", "")
                )
              );
              gameGrid.append(card);
              loadPokemonSprite(i, pokemonPairs[i].url);
            }
          },
          error: function (error) {
            console.log("Error:", error);
          }
        });
    }

    function getDifficultyClass(numCards) {
        if (numCards === 6) {
          return "easy";
        } else if (numCards === 12) {
          return "medium";
        } else if (numCards === 24) {
          return "hard";
        }
    }

    function loadPokemonSprite(index, url) {
        $.ajax({
          url: url,
          method: "GET",
          success: function (response) {
            console.log(response); // Log the response data
            var frontSprite = response.sprites.front_default;
      
            var frontImg = new Image();
            frontImg.src = frontSprite;
            frontImg.addEventListener("load", function () {
              $("#img" + index).attr("src", frontSprite);
            });
      
            // Set the back face image source to your local image
            var backSprite = "back.webp";
            $("#img" + index).siblings(".back_face").attr("src", backSprite);
          },
          error: function (error) {
            console.log("Error:", error);
          }
        });
    }
      
    // Utility function to shuffle an array,
    function shuffleArray(array) {
        var currentIndex = array.length;
        var temporaryValue, randomIndex;

        while (currentIndex !== 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }

        return array;
    }

    $("#start_button").click(function () {
        $(".card").on("click", handleCardClick);
        $("#start_button").prop("disabled", true);
        if (!timerStarted) {
        startTimer();
        timerStarted = true;
        }
    });

    $("#reset_button").click(function () {
        $(".card").removeClass("flip matched");
        $(".card").off("click");
        firstCard = undefined;
        secondCard = undefined;
        clicks = 0;
        pairsMatched = 0;
        pairsLeft = totalPairs;
        gameStart = false;
        stopTimer();
        updateStats();
        $("#game_timer").text("Time: 00:00");
        if (timerStarted) {
          startTime = undefined; // Reset the start time
          timerStarted = false; // Reset the timerStarted flag
        }
        $("#start_button").hide(); // Show the start button
        $("#start_button").prop("disabled", false); // Enable the start button
        startTimer(); // Start the timer
    });
      
      
    updateStats();
});