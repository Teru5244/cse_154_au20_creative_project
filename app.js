"use strict";

const express = require('express');
const multer = require('multer');
const app = express();
const fs = require('fs').promises;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const CLIENT_ERROR_CODE = 400;
const SERVER_ERROR_CODE = 500;
const RESULTS_FILE = "results.json";

app.get("/ch2/gen", (req, res) => {
  let wave = parseInt(req.query["wave"]);
  if (isNaN(wave) || wave <= 0) {
    returnError(CLIENT_ERROR_CODE, "Invalid wave parameter.", res);
    return;
  }
  let enemies = [];
  if (wave > 40) {
    wave = 40;
  }
  let enemy1 = Math.ceil(Math.random() * wave / 5);
  let enemy2 = Math.floor(Math.random() * wave / 10);
  let enemy3 = Math.floor(Math.random() * wave / 15);
  for (let i = 0; i < enemy1; i++) {
    enemies.push(genEnemy1());
  }
  for (let i = 0; i < enemy2; i++) {
    enemies.push(genEnemy2());
  }
  for (let i = 0; i < enemy3; i++) {
    enemies.push(genEnemy3());
  }
  res.json({
    "status": "success",
    "detail": enemies
  });
});

app.post("/ch3/report", async (req, res) => {
  let round = req.body.round;
  let plMove = req.body["pl-move"];
  let plAtk = req.body["pl-atk"];
  let plHp = req.body["pl-hp"];
  let eneMove = req.body["ene-move"];
  let eneAtk = req.body["ene-atk"];
  let eneHp = req.body["ene-hp"];
  if (!round || !plMove || !plAtk || !plHp || !eneMove || !eneAtk || !eneHp) {
    returnError(CLIENT_ERROR_CODE, "Missing required parameters.", res);
    return;
  }
  try {
    if (round === "1") {
      await rewriteResults();
    }
    let plResult = genSingleResult(plMove, plAtk, plHp);
    let eneResult = genSingleResult(eneMove, eneAtk, eneHp);
    await addResult(round, plResult, eneResult);
    res.send("Round " + round + " progress recorded.");
  } catch (err) {
    returnError(SERVER_ERROR_CODE, "Unknown server error happened.", res);
  }
});

app.get("/ch3/results", async (req, res) => {
  let seletedRounds = req.query["rounds"];
  if (!seletedRounds) {
    returnError(CLIENT_ERROR_CODE, "Missing required parameter.", res);
    return;
  }
  if (seletedRounds !== "all") {
    returnError(CLIENT_ERROR_CODE, "Unexpected rounds selection.", res);
    return;
  }
  if (seletedRounds === "all") {
    try {
      let results = await getOriginalResults();
      res.json(results);
    } catch (err) {
      returnError(SERVER_ERROR_CODE, "Unknown server error occured.", res);
    }
  }
});

/**
 * This function helps to add the results of one move to the results.json file.
 * @param {number} round The round number of the move.
 * @param {object} plResult The player's result object to be passed to the final results.
 * @param {object} eneResult The enemy's result object to be passed to the final results.
 */
async function addResult(round, plResult, eneResult) {
  let results = {};
  let result = {
    "round": round,
    "player": plResult,
    "enemy": eneResult
  };
  try {
    results = await getOriginalResults();
  } catch (err) {
    throw err;
  }
  if (!results["results"] || !results["results"].push) {
    throw new Error("Unexpected file contents.");
  }
  results["results"].push(result);
  await fs.writeFile(RESULTS_FILE, JSON.stringify(results));
}

/**
 * This function will read the results.json file and convert the contents of it into a json object.
 * @returns {object} The json object of the results.json's content.
 */
async function getOriginalResults() {
  let file = await fs.readFile(RESULTS_FILE, "utf8");
  return JSON.parse(file);
}

/**
 * This function helps to create an object of one move of the enemy/player.
 * @param {string} move The move description of the object.
 * @param {number} atk The attack point dealt by the object.
 * @param {number} hp The remaining hp of the object.
 * @returns {object} The result object of the player/enemy.
 */
function genSingleResult(move, atk, hp) {
  return {
    "move": move,
    "attack": atk,
    "remaining-hp": hp
  };
}

/**
 * This function helps the API to return errors when some errors happened.
 * @param {number} errorCode The error status code of the error.
 * @param {string} message The message of the error to be returned to the client side.
 * @param {object} res The response object to be returned to.
 */
function returnError(errorCode, message, res) {
  res.status(errorCode).json({
    "status": "error",
    "detail": message
  });
}

/**
 * This function helps to rewrite a new empty json file for the results object.
 */
async function rewriteResults() {
  let results = {
    "results": []
  };
  await fs.writeFile(RESULTS_FILE, JSON.stringify(results));
}

/**
 * This function will generate an object of enemy 1.
 * @returns {object} The enemy object to be returned.
 */
function genEnemy1() {
  let hp = Math.round(Math.random() * 25 + 15);
  return {
    "name": "Normal Treasure Seeker",
    "hp": hp,
    "img": "img/hunter1.png"
  };
}

/**
 * This function will generate an object of enemy 2.
 * @returns {object} The enemy object to be returned.
 */
function genEnemy2() {
  let hp = Math.round(Math.random() * 20 + 25);
  return {
    "name": "Archer Treasure Seeker",
    "hp": hp,
    "img": "img/hunter2.png"
  };
}

/**
 * This function will generate an object of enemy 3.
 * @returns {object} The enemy object to be returned.
 */
function genEnemy3() {
  let hp = Math.round(Math.random() * 30 + 20);
  return {
    "name": "Tomb Robber Treasure Seeker",
    "hp": hp,
    "img": "img/hunter3.png"
  };
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);