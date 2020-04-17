const tileSize = 40;
const EMPTY = 0;
const WALL = 1;
const FOOD = 2;
const SNAKE = 3;

const HAUT = 0;
const BAS = 1;
const GAUCHE = 2;
const DROITE = 3;

var WORLD = null;
var snakeDir = null;
var snakeBody = null;
var skid = false;
var key = null;
var score = 0;
var stepInterval = null;

var audioCuisse = new Audio('media/cuisse.mp3');

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}



function loadJSON(url, callback = null) {
    let req = new XMLHttpRequest();
    req.open("GET", url);
    req.onerror = function () {
        console.log("chec de chargement " + url);
    };
    req.onload = function () {
        if (req.status === 200) {
            let data = JSON.parse(req.responseText);
            if (callback != null) callback(data);
            else console.log(data);
        } else {
            console.log("Erreur " + req.status);
        }
    };
    req.send();
}

function loadLevel(data = null, level = 1) {
    if (data == null) {
        loadJSON("levels/level" + level + ".json", loadLevel);
        return;
    }

    WORLD = [];

    for (let x in [...Array(data["dimensions"][0]).keys()]) {
        WORLD.push([]);
        for (let y in [...Array(data["dimensions"][1]).keys()]) {
            WORLD[WORLD.length - 1].push(EMPTY);
        }
    }

    for (let wall of data["walls"]) {
        WORLD[wall[0]][wall[1]] = WALL;
    }

    for (let food of data["food"]) {
        WORLD[food[0]][food[1]] = FOOD;
    }

    snakeBody = data["snake"]

    //direction initiale en fonction de la position de la tte par rapport au corps
    snakeDir = DROITE;

    //console.log(WORLD);

    stepInterval =  data["delay"];
    setTimeout(function () { step(); }, stepInterval + 500);
}

function drawWorld() {
    let canvas = document.getElementById('map');
    canvas.width = WORLD.length * tileSize;
    canvas.height = WORLD[0].length * tileSize;
    let ctx = canvas.getContext('2d');

    ctx.strokeStyle = "white";
    let img = document.getElementById("cuisse");
    for (let x in [...Array(WORLD.length).keys()]) {
        for (let y in [...Array(WORLD[x].length).keys()]) {
            if (WORLD[x][y] == EMPTY) ctx.fillStyle = "rgb(100, 100, 100)";
            else if (WORLD[x][y] == WALL) ctx.fillStyle = "rgb(200, 10, 10)";

            ctx.strokeRect(x * tileSize, y * tileSize,
                tileSize, tileSize);

            ctx.fillRect(x * tileSize, y * tileSize,
                tileSize, tileSize);
            if (WORLD[x][y] == FOOD) ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);

        }
    }
    for (let p of snakeBody) {
        let x = p[0];
        let y = p[1];
        ctx.fillStyle = "rgb(10, 200, 10)";
        ctx.strokeRect(x * tileSize, y * tileSize,
            tileSize, tileSize);
        ctx.fillRect(x * tileSize, y * tileSize,
            tileSize, tileSize);
    }


}

function step() {
    console.log("step");
    if (key == "ArrowUp") snakeDir = HAUT;
    if (key == "ArrowDown") snakeDir = BAS;
    if (key == "ArrowLeft") snakeDir = GAUCHE;
    if (key == "ArrowRight") snakeDir = DROITE;

    let newHead = [];

    if (snakeDir == DROITE) newHead = [snakeBody[0][0] + 1, snakeBody[0][1]];
    if (snakeDir == GAUCHE) newHead = [snakeBody[0][0] - 1, snakeBody[0][1]];
    if (snakeDir == HAUT) newHead = [snakeBody[0][0], snakeBody[0][1] - 1];
    if (snakeDir == BAS) newHead = [snakeBody[0][0], snakeBody[0][1] + 1];

    let gameOver = false;

    if (newHead[0] < 0 || newHead[1] < 0 || newHead[1] >= WORLD[0].length || newHead[0] >= WORLD.length) {
        gameOver = true;
        console.log(snakeBody);
    }

    if (!gameOver && !(WORLD[newHead[0]][newHead[1]] == WALL) && !snakeBody.some(element => element[0] == newHead[0] && element[1] == newHead[1])) {
        snakeBody.unshift(newHead);
    
        if (WORLD[newHead[0]][newHead[1]] == EMPTY) {
            snakeBody.pop();
        }
        else if (WORLD[newHead[0]][newHead[1]] == FOOD) {
            WORLD[newHead[0]][newHead[1]] = EMPTY;
            let x, y;
            do {
                x = getRandomInt(WORLD.length);
                y = getRandomInt(WORLD[0].length);
            }
            while (WORLD[x][y] != EMPTY)
            WORLD[x][y] = FOOD;
            score += 10;
            stepInterval /= 1.15;
            audioCuisse.play();
        }
    }
    else {
        gameOver = true;
    }

    
    if (gameOver) {
        $("#game").removeClass("d-flex").toggleClass("hidden");
        $("#gameOver").removeClass("hidden").toggleClass("d-flex");
        document.getElementById("score").innerHTML = score;
    }
    else {
        setTimeout(function () { step(); }, stepInterval);
        drawWorld();
    }
}

document.getElementById("play").addEventListener("click", function (event) {
    $("#menu").removeClass("d-flex").toggleClass("hidden");
    $("game").removeClass("hidden").toggleClass("d-flex");
    loadLevel();
});

document.addEventListener('keydown', function (event) {
    key = event.code;
});
