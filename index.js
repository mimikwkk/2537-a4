let firstCard = undefined;
let secondCard = undefined;
let clicks = 0;
let pairsMatched = 0;
let totalPairs = 3; 
let pairsLeft = totalPairs;
let gameStart = false;
let startTime = undefined;
let gameTimer = undefined;
let timerStarted = false; 
let timerReset = false;
let processingPair = false;
let maxTimeEasy = 30;
let maxTimeMedium = 60;
let maxTimeHard = 120;
let currentMaxTime = maxTimeEasy;
let gameActive = false;

function updateStats() {
    $("#clicks").text(`Clicks: ${clicks}`);
    $("#pairs_left").text(`Pairs left: ${pairsLeft}`);
    $("#pairs_matched").text(`Pairs matched: ${pairsMatched}`);
    $("#total_pairs").text(`Total pairs: ${totalPairs}`);
}

function startTimer() {
    stopTimer(); 
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

function checkWinCondition() {
    if (pairsMatched === totalPairs) {
        stopTimer();
        console.log("Success! Game over");
        showModal("Congratulations!", "You've won the game!");
        gameActive = false;
    }
}

function handleCardClick() {
    if (processingPair || !gameActive) {
        return;
    }

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
        return;
    }
    
    card.addClass("flip");
    
    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
    
        if (firstCard.find(".front_face")[0].src === secondCard.find(".front_face")[0].src) {
            console.log("match");
            console.log(firstCard);
            console.log(secondCard);
            firstCard.addClass("matched");
            secondCard.addClass("matched");
            pairsMatched++;
            pairsLeft--;
            firstCard = undefined;
            secondCard = undefined;
        } else {
            console.log("no match");
            console.log(firstCard);
            console.log(secondCard);
            processingPair = true;
            setTimeout(() => {
                if (firstCard) {
                    firstCard.removeClass("flip");
                }
                if (secondCard) {
                    secondCard.removeClass("flip");
                }
                processingPair = false;
                firstCard = undefined;
                secondCard = undefined;
            }, 1000);
        }
    
        clicks++;
        updateStats();
        checkWinCondition();
    }
}
    
function showModal(title, message) {
    alert(title + "\n\n" + message);
}
      

$(document).ready(function () {
    let gameStart = false;
    let startTime = 0;
    let timerStarted = false;

    function startTimer() {
        startTime = new Date().getTime();
        gameTimer = setInterval(() => {
            const totalSeconds = Math.floor((new Date().getTime() - startTime) / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            $("#game_timer").text(`Time: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
            
            if (totalSeconds >= currentMaxTime) {
                clearInterval(gameTimer);
                showModal("Time's up!", "You've run out of time!");
                stopTimer();
            }
        }, 1000);
    }
        
    function flipAllCards() {
        $(".card").each(function () {
            const card = $(this);
            setTimeout(() => {
            card.addClass("flip");
            }, 200);
            setTimeout(() => {
            card.removeClass("flip");
            }, 2200);
        });
    }

    $("#dark_theme_button").click(function () {
        $("body").toggleClass("dark-theme");
    });

    $("#power_up_button").click(function () {
        flipAllCards();
    });        

    let currentDifficulty = 3;

    function updateMaxTimeDisplay() {
        const minutes = Math.floor(currentMaxTime / 60);
        const seconds = currentMaxTime % 60;
        $("#max_time").text(`Max Time: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }
               

    $("#easy_button").click(function () {
        totalPairs = currentDifficulty = 3;
        $("#total_pairs").text("Total pairs: " + totalPairs);
        currentMaxTime = maxTimeEasy;
        updateMaxTimeDisplay();
        createGameGrid(6);
        $("#game_timer").text("Time: 00:00");
        stopTimer();
        timerStarted = false;
        $("#start_button").show();
        $("#power_up_button").hide();
    });

    $("#medium_button").click(function () {
        totalPairs = currentDifficulty = 6;
        $("#total_pairs").text("Total pairs: " + totalPairs);
        currentMaxTime = maxTimeMedium;
        updateMaxTimeDisplay();
        createGameGrid(12);
        $("#game_timer").text("Time: 00:00");
        stopTimer();
        timerStarted = false;
        $("#start_button").show();
        $("#power_up_button").show();
    });

    $("#hard_button").click(function () {
        totalPairs = currentDifficulty = 12;
        $("#total_pairs").text("Total pairs: " + totalPairs);
        currentMaxTime = maxTimeHard;
        updateMaxTimeDisplay();
        createGameGrid(24);
        $("#game_timer").text("Time: 00:00");
        stopTimer();
        timerStarted = false;
        $("#start_button").show();
        $("#power_up_button").show();
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

        $(document).on("click", ".card", handleCardClick);


        $("#start_button").click(function () {
            gameActive = true;
            $("#start_button").prop("disabled", true);
            if (!timerStarted) {
                startTimer();
                timerStarted = true;
            }
        });

        $("#reset_button").click(function () {
            window.location.href = "index.html";
        });
      
      
    updateStats();
});