$(document).on("pageshow", "#pageone", function() {
    $("form").submit(function(e) {
        tiles = $(".ui-block-a input[type=radio]:checked").val();
        difficulty = $(".ui-block-b input[type=radio]:checked").val();

        $.mobile.changePage("#pagetwo");

        return false;
    });
});

$(document).on("pageshow", "#pagetwo", function() {
    resetBoard();

    if (typeof tiles == 'undefined' || typeof difficulty == 'undefined') {
        alert("No parameters selected. Assuming numbers tile type and easy difficulty.");
        tiles = "numbers";
        difficulty = "easy";
    }

    var i = 1;
    $(".tile").each(function() {
        if (!$(this).hasClass("empty")) {
            $(this).find("img").remove();
            $(this).append("<img src='imgs/" + tiles + "_" + i + ".jpg' style='width: 100%;'>");
            i++;
        }
    });
    
    setup(tiles, difficulty);
    
    $(".tile").on("tap swipe", function(event) {
        if (isTouchingEmpty($(this))) {
            swap($(this), $(".empty"));
        }

        if (checkIfSolved()) {
            alert("You won!!!\n\nHit Reset to go back and change the parameters.");
        }
    });
});

function resetBoard() {
    $(".tile").each(function() {
        if ($(this).hasClass("empty")) {
            $(this).html("&nbsp");
        } else {
            $(this).html("");
        }
    });
}

function setup(tiles, difficulty) {
    $(".empty").find("img").remove();

    //set the tiles to match the selected tile type
    //shuffle the tiles based on difficulty chosen
    //easy = 50 tiles moved
    //medium = easy * 2 (100)
    //hard = medium * 2 (200)
    var numSwaps = 50;
    if (difficulty == "medium") {
        numSwaps *= 2;
    } else if (difficulty == "hard") {
        numSwaps *= 4;
    }

    for (var i = 0; i < numSwaps; i++) {
        var tiles = getTilesTouchingEmpty();
        var tile = tiles[Math.floor((Math.random()*tiles.length))];
        var swapTile = $(".puzzle-grid").find("[data-pos='" + tile + "']");
        
        swap(swapTile, $(".empty"));
    }
}

function getTilesTouchingEmpty() {
    var emptyPos = parseInt($(".empty").data("pos"));
    var tiles = new Array();

    //push all the tiles touching the empty tile
    if (emptyPos >= 13) { //if in the last row, just push tile above
        tiles.push(emptyPos-4);
    } else if (emptyPos <= 4) { //if the first row, just push tile below
        tiles.push(emptyPos+4);
    } else { //otherwise, push tiles above and below
        tiles.push(emptyPos+4);
        tiles.push(emptyPos-4);
    }

    if (emptyPos%4 == 0) { //if in the last column, just push tile to the left
        tiles.push(emptyPos-1);
    } else if ((emptyPos-1)%4 == 0) { //if in the first column, just push tile to the right
        tiles.push(emptyPos+1);
    } else { //otherwise, push tiles to the left and right
        tiles.push(emptyPos+1);
        tiles.push(emptyPos-1);
    }

    return tiles;
}

function isTouchingEmpty(elem) {
    var emptyPos = parseInt($(".empty").data("pos"));
    var elemPos = parseInt(elem.data("pos"));

    return elemPos == emptyPos+4 || elemPos == emptyPos-4 || (elemPos == emptyPos-1 && (emptyPos-1)%4 != 0) || (elemPos == emptyPos+1 && emptyPos%4 != 0);
}

function swap(elem, empty) {
    var elemText = elem.html();
    var emptyText = empty.html();

    elem.html(emptyText);
    empty.html(elemText);

    empty.removeClass("empty");
    elem.addClass("empty");
}

function findClassIndex(elem) {
    for (var i = 0; i < elem.length; i++) {
        if (elem[i].slice(0,9) === "ui-block-") {
            return i;
        }
    }
    return -1;
}

function checkIfSolved() {
    //returning false inside jquery's each() wasn't working so I had to resort to this
    //hacky way by incrementing a counter and then checking if it's 0 at the end
    var numIncorrect = 0;
    $(".tile").each(function() {
        var p = parseInt($(this).data("pos"));
        if ($(this).hasClass("empty")) {
            if (p != 16) {
                numIncorrect++;
            }
        } else {
            var t = $(this).find("img").attr("src").split("_");
            t = t[1];
            t = parseInt(t.substring(0, t.length - 4));
            if (t != p) {
                numIncorrect++;
            }
        }
    });
    
    return numIncorrect == 0;
}