const tileSize = 20;
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
    for (let snake of snakeBody) {
        WORLD[snake[0]][snake[1]] = SNAKE;
    }

    //direction initiale en fonction de la position de la tte par rapport au corps
    snakeDir = data["initialD"];

    //console.log(WORLD);

    stepInterval = setInterval(function () { step(); }, data["delay"]);
}

function drawWorld() {
    let canvas = document.getElementById('map');
    canvas.width = WORLD.length * tileSize;
    canvas.height = WORLD[0].length * tileSize;
    let ctx = canvas.getContext('2d');

    ctx.strokeStyle = "red";

    for (let x in [...Array(WORLD.length).keys()]) {
        for (let y in [...Array(WORLD[x].length).keys()]) {
            if (WORLD[x][y] == EMPTY) ctx.fillStyle = "rgb(100, 100, 100)";
            else if (WORLD[x][y] == WALL) ctx.fillStyle = "rgb(200, 10, 10)";
            else if (WORLD[x][y] == FOOD) ctx.fillStyle = "rgb(10, 10, 200)";
            else if (WORLD[x][y] == SNAKE) ctx.fillStyle = "rgb(10, 200, 10)";

            ctx.strokeRect(x * tileSize, y * tileSize,
                tileSize, tileSize);

            ctx.fillRect(x * tileSize, y * tileSize,
                tileSize, tileSize);
        }
    }

}

function step() {
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
        console.log("bfrhgfvrbjr");
    }

    if (!gameOver && !(WORLD[newHead[0]][newHead[1]] == WALL) && !snakeBody.some(element => element[0] == newHead[0] && element[1] == newHead[1])) {
        snakeBody.unshift(newHead);
        skid = false;
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
        }
    }
    else {
        gameOver = true;
    }

    
    if (gameOver) {
        alert("Game over! Score: " + score);
    }
    else {
        setTimeout(function () { step(); }, stepInterval);
        drawWorld();
    }
}

window.addEventListener("load", function (event) {
    loadLevel();
});

document.addEventListener('keydown', function (event) {
    key = event.code;
});
