/*
 * Name: Phoenix Yi
 * Date: November 17, 2020
 * Section: CSE 154 AB
 * This javascript file adds more interactive effects to the index.html webpage and changes some
 * details of the HTML. It will react users' event on the webpage.
 */
"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * The main initial function for the whole script.
   * Includes other functions to make the webpage more interactive.
   */
  function init() {
    initiateChapterSwitchBtns();
    initiateChapter1();
    initiateChapter2();
    initiateChapter3();
  }

  /**
   * This function will initiate all the buttons in chapter 3 and waiting for player's response to
   * trigger event listeners.
   */
  function initiateChapter3() {
    let c3AttackBtn = qs("#chapter-3 .attack");
    let c3MagicBtn = qs("#chapter-3 .magic");
    let c3DodgeBtn = qs("#chapter-3 .dodge");
    let c3ResultsBtn = qs("#chapter-3 .results");
    let c3RestartBtn = qs("#chapter-3 .restart");
    c3AttackBtn.addEventListener("click", function() {
      playerMove("attack", 40, 50, 80, "chapter-3");
    });
    c3MagicBtn.addEventListener("click", function() {
      playerMove("magic", 30, 60, 70, "chapter-3");
    });
    c3DodgeBtn.addEventListener("click", function() {
      playerMove("dodge", 12, 15, 50, "chapter-3");
    });
    c3RestartBtn.addEventListener("click", restart);
    c3ResultsBtn.addEventListener("click", showResults);
  }

  /**
   * This function will initiate all the buttons in chapter 2 and create event listeners according
   * to the commands of the player.
   */
  function initiateChapter2() {
    let c2KillCount = 0;
    let c2NextBtn = qs("#chapter-2 .next");
    let c2AttackBtn = qs("#chapter-2 .attack");
    let c2StatBtn = qs("#chapter-2 .stat");
    c2NextBtn.addEventListener("click", c2NextWave);
    c2AttackBtn.addEventListener("click", function() {
      c2KillCount += attack(7, 10, "chapter-2");
      qs("#chapter-2 .kill").textContent = c2KillCount;
    });
    c2StatBtn.addEventListener("click", function() {
      showStats("chapter-2");
    });
  }

  /**
   * This function helps to initiate all the buttons in chapter 1.
   */
  function initiateChapter1() {
    let c1KillCount = 0;
    let c1AttackBtn = qs("#chapter-1 .attack");
    let c1NextBtn = qs("#chapter-1 .next");
    let c1StatBtn = qs("#chapter-1 .stat");
    c1AttackBtn.addEventListener("click", function() {
      c1KillCount += attack(2, 5, "chapter-1");
      qs("#chapter-1 .kill").textContent = c1KillCount;
    });
    c1NextBtn.addEventListener("click", c1nextWave);
    c1StatBtn.addEventListener("click", function() {
      showStats("chapter-1");
    });
  }

  /**
   * This function will display all the battle results to the results board on the webpage. It will
   * make fetch calls to the API.
   */
  function showResults() {
    let newDiv = gen("div");
    newDiv.classList.add("result-board");
    id("chapter-3").appendChild(newDiv);
    qsa("#chapter-3 > p")[1].textContent = "";
    qs("footer p").textContent = "You defeat the king and tame the dragon, congrats!";
    fetch("/ch3/results?rounds=all")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processResultsData)
      .catch(handleError);
  }

  /**
   * This function will transform the battle results object from the API into client readable texts
   * and append them to the webpage result board.
   * @param {object} data The response object retrieved from API.
   */
  function processResultsData(data) {
    for (let i = 0; i < data.results.length; i++) {
      let newP = gen("p");
      let roundMsg = "Round " + data["results"][i]["round"];
      let plMove = data["results"][i]["player"]["move"];
      let plDmg = data["results"][i]["player"]["attack"];
      let plHp = data["results"][i]["player"]["remaining-hp"];
      let eneMove = data["results"][i]["enemy"]["move"];
      let eneDmg = data["results"][i]["enemy"]["attack"];
      let eneHp = data["results"][i]["enemy"]["remaining-hp"];
      let plMsg = "You used " + plMove + ", did " + plDmg + " damages, remained HP" + plHp;
      let eneMsg = "Enemy used " + eneMove + ", did " + eneDmg + " damages, remained HP" + eneHp;
      newP.textContent = roundMsg + ". " + plMsg + ". " + eneMsg + ".";
      qs("#chapter-3 .result-board").appendChild(newP);
    }
  }

  /**
   * This function helps to restart the chapter-3 game after restart button is clicked.
   */
  function restart() {
    qsa("#chapter-3 > p")[1].textContent = "";
    qs("#chapter-3 .restart").classList.add("hidden");
    for (let i = 0; i < qsa("#chapter-3 .buttons button").length; i++) {
      qsa("#chapter-3 .buttons button")[i].disabled = false;
    }
    qs("#chapter-3 .round").textContent = 0;
    qs("#chapter-3 .health").textContent = 100;
    qs("#chapter-3 .enemies > div").remove();
    let newKing = gen("div");
    let newImg = gen("img");
    let newHp = gen("p");
    newImg.src = "img/boss.png";
    newImg.alt = "The King";
    newHp.textContent = 1000;
    newKing.appendChild(newImg);
    newKing.appendChild(newHp);
    qs("#chapter-3 .enemies").appendChild(newKing);
  }

  /**
   * This is a newer version of the move that will include the attack event of the enemy on the
   * battlefield. It handles all the movements by a random number within a range and a certain hit
   * rate.
   * @param {string} move The description of the move of the player.
   * @param {number} minAtk The minimum attack point of the player. When the move is dodge, this
   * represents the minimum heal point.
   * @param {number} maxAtk The maximum attack point of the player. When the move is dodge, this
   * represents the maximum heal point.
   * @param {number} hitRate The hit rate of this move in %.
   * @param {string} chapter Which chapter of the battle to be happened.
   */
  function playerMove(move, minAtk, maxAtk, hitRate, chapter) {
    let round = parseInt(qs("#" + chapter + " .round").textContent) + 1;
    let randomAtk = Math.random() * 100;
    let eneMove = enemyMove(9, 11);
    let eneAtk = 0;
    let playerAtk = 0;
    let playerHp = 0;
    let eneHp = 0;
    eneAtk = parseInt(eneMove.atk);
    if (randomAtk <= hitRate && move === "dodge") {
      eneAtk = 0;
    }
    playerAtk = Math.round(Math.random() * (maxAtk - minAtk) + minAtk);
    playerHp = parseInt(qs("#" + chapter + " .health").textContent) - eneAtk;
    if (move === "dodge") {
      playerHp += playerAtk;
      playerAtk = 0;
    }
    if (randomAtk > hitRate) {
      playerAtk = 0;
    }
    eneHp = parseInt(qs("#" + chapter + " div > p").textContent) - playerAtk;
    eneHp = hpBoundary(eneHp, 0, 1000);
    playerHp = hpBoundary(playerHp, 0, 100);
    qs("#chapter-3 .round").textContent = round;
    qs("#" + chapter + " div > p").textContent = eneHp;
    qs("#" + chapter + " .health").textContent = playerHp;
    postResults(move, eneMove.move, playerAtk, eneAtk, playerHp, eneHp);
    ifEndGame(eneHp, playerHp);
  }

  /**
   * This function helps to check if the player/enemy's hp exceed the boundary of the allowed hp
   * range (0-100).
   * @param {number} hp The hp value to be processed.
   * @param {number} minHp The minimum hp allowed.
   * @param {number} maxHp The maximum hp allowed.
   * @returns {number} The hp value after modified.
   */
  function hpBoundary(hp, minHp, maxHp) {
    if (hp < minHp) {
      hp = minHp;
    }
    if (hp > maxHp) {
      hp = maxHp;
    }
    return hp;
  }

  /**
   * This function helps to generate a random attack from the enemy.
   * @param {number} minAtk The minimum attack point of the enemy.
   * @param {number} maxAtk The maximum attack point of the enemy.
   * @returns {object} The enemy's move information object.
   */
  function enemyMove(minAtk, maxAtk) {
    let randomMove = Math.random() * 100;
    let randomAtk = Math.random() * 100;
    let atk = 0;
    if (randomMove < 50) {
      if (randomAtk <= 80) {
        atk = Math.round(Math.random() * (maxAtk - minAtk) + minAtk);
      }
      return {
        "move": "attack",
        "atk": atk
      };
    }
    if (randomAtk <= 70) {
      atk = Math.round(Math.random() * (maxAtk - minAtk) * 3 + minAtk - (maxAtk - minAtk));
    }
    return {
      "move": "magic",
      "atk": atk
    };
  }

  /**
   * This function helps to post the result of one move to the API and save the results for later
   * use in showing all the results to the webpage.
   * @param {string} plMove The move description of the player.
   * @param {string} eneMove The move description of the enemy.
   * @param {number} plAtk The attack point dealt by the player.
   * @param {number} eneAtk The attack point dealt by the enemy.
   * @param {number} plHp The remaining health point of the player.
   * @param {number} eneHp the remaining health point of the enemy.
   */
  function postResults(plMove, eneMove, plAtk, eneAtk, plHp, eneHp) {
    let params = new FormData();
    let round = parseInt(qs("#chapter-3 .round").textContent);
    params.append("round", round);
    params.append("pl-move", plMove);
    params.append("pl-atk", plAtk);
    params.append("pl-hp", plHp);
    params.append("ene-move", eneMove);
    params.append("ene-atk", eneAtk);
    params.append("ene-hp", eneHp);
    fetch("/ch3/report", {method: "POST", body: params})
      .then(checkStatus)
      .then(resp => resp.text())
      .then(processReportData)
      .catch(handleError);
  }

  /**
   * This function will process the API's response data and add log to the webpage.
   * @param {object} data The response data from the API's response.
   */
  function processReportData(data) {
    qsa("#chapter-3 > p")[1].textContent = data;
  }

  /**
   * This function decides whether the game is ended or not. It will make decisions based on the
   * player and enemy's health point as parameters.
   * @param {number} eneRemainingHp The remaining hp of the enemy
   * @param {number} playerRemainingHp The remaining hp of the player.
   */
  function ifEndGame(eneRemainingHp, playerRemainingHp) {
    if (eneRemainingHp <= 0) {
      for (let i = 0; i < qsa("#chapter-3 .buttons button").length; i++) {
        qsa("#chapter-3 .buttons button")[i].disabled = true;
      }
      qs("#chapter-3 .results").classList.remove("hidden");
      qs("#chapter-3 .results").disabled = false;
      qs("#chapter-3 .prev-ch").disabled = false;
    }
    if (playerRemainingHp <= 0) {
      for (let i = 0; i < qsa("#chapter-3 .buttons button").length; i++) {
        qsa("#chapter-3 .buttons button")[i].disabled = true;
      }
      qs("#chapter-3 .restart").classList.remove("hidden");
      qs("#chapter-3 .restart").disabled = false;
      qs("#chapter-3 .prev-ch").disabled = false;
    }
  }

  /**
   * This function helps to proceed to next wave of enemies. It will make fetch call to the API and
   * retrieve all the enemies' data to be added onto the battlefield.
   */
  function c2NextWave() {
    if (document.querySelectorAll("#chapter-2 div").length === 0) {
      let wave = parseInt(qs("#chapter-2 .wave").textContent);
      qs("#chapter-2 .wave").textContent = wave + 1;
      fetch("/ch2/gen?wave=" + qs("#chapter-2 .wave").textContent)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(processWaveData)
        .catch(handleError);
    }
  }

  /**
   * This function will process the data from API and add the enemies into the battle field
   * accordingly.
   * @param {object} data The response data retrieved from API.
   */
  function processWaveData(data) {
    if (data.status === "error") {
      handleError(new Error(data.detail));
    } else {
      genEnemy("chapter-2", data.detail);
    }
  }

  /**
   * This function helps to generate all the enemies to the battlefield.
   * @param {string} chapter The chapter battlefield to be added.
   * @param {object} data The Array object of enemies to be generated.
   */
  function genEnemy(chapter, data) {
    for (let i = 0; i < data.length; i++) {
      let newEnemy = gen("div");
      let newImg = gen("img");
      let newHp = gen("p");
      newImg.src = data[i].img;
      newImg.alt = data[i].name;
      newHp.textContent = data[i].hp;
      newEnemy.appendChild(newImg);
      newEnemy.appendChild(newHp);
      qs("#" + chapter + " .enemies").appendChild(newEnemy);
    }
  }

  /**
   * This function helps to initiate all the chapter switch buttons in the html file. It will be
   * called after the window is loaded.
   */
  function initiateChapterSwitchBtns() {
    let c1NextChBtn = qs("#chapter-1 .next-ch");
    let c2NextChBtn = qs("#chapter-2 .next-ch");
    let c2PrevChBtn = qs("#chapter-2 .prev-ch");
    let c3PrevChBtn = qs("#chapter-3 .prev-ch");
    c1NextChBtn.addEventListener("click", function() {
      toggleChapters(1, 2);
    });
    c2NextChBtn.addEventListener("click", function() {
      toggleChapters(2, 3);
    });
    c2PrevChBtn.addEventListener("click", function() {
      toggleChapters(2, 1);
    });
    c3PrevChBtn.addEventListener("click", function() {
      toggleChapters(3, 2);
    });
  }

  /**
   * This function helps to toggle between the different chapters with two given chapter numbers to
   * be proceeded.
   * @param {number} hid The chapter number to be hidden.
   * @param {number} vis The chapter number to be displayed.
   */
  function toggleChapters(hid, vis) {
    id("chapter-" + hid).classList.add("hidden");
    id("chapter-" + vis).classList.remove("hidden");
  }

  /**
   * This function helps to show the statistics of player's killing count.
   * @param {string} chapter the chapter result to be displayed.
   * @param {number} killCount the value of killing count of the player.
   */
  function showStats(chapter) {
    if (qs("#" + chapter + " .buttons > p").classList.contains("hidden")) {
      qs("#" + chapter + " .buttons > p").classList.remove("hidden");
    } else {
      qs("#" + chapter + " .buttons > p").classList.add("hidden");
    }
  }

  /**
   * This function helps to implement the "attack" command for the player as well as to help adding
   * killing count of the player. This function will deduct 2 to 5 HP of a single enemy.
   * @param {number} minAtk The minimum attack of the player performed to an enemy;
   * @param {number} maxAtk The maximum attack of the player performed to an enemy;
   * @param {string} chapter The chapter of the attack event to be happened.
   * @param {number} killCount The kill count of one game to be replaced onto the board. If not
   * apllicable, set to -1.
   * @returns {number} if player kills the targeted enemy by this attack, returns 1. Otherwise 0.
   */
  function attack(minAtk, maxAtk, chapter) {
    if (document.querySelectorAll("#" + chapter + " div").length > 0) {
      let attackValue = Math.round(Math.random() * (maxAtk - minAtk) + minAtk);
      let target = qs("#" + chapter + " div > p");
      target.textContent -= attackValue;
      if (target.textContent <= 0) {
        qs("#" + chapter + " .enemies").removeChild(qs("#" + chapter + " .enemies > div"));
        return 1;
      }
    }
    return 0;
  }

  /**
   * This function helps to generate enemies after all the enemies on the battleground have been
   * wiped out. The amount of enemies depends on the number of waves.
   */
  function c1nextWave() {
    if (document.querySelectorAll("#chapter-1 div").length === 0) {
      let wave = parseInt(qs("#chapter-1 .wave").textContent) + 1;
      qs("#chapter-1 .wave").textContent = wave;
      let slime1;
      let slime2;
      let slime3;
      if (wave <= 40) {
        slime1 = Math.ceil(Math.random() * wave / 5);
        slime2 = Math.floor(Math.random() * wave / 10);
        slime3 = Math.floor(Math.random() * wave / 15);
      } else {
        slime1 = Math.ceil(Math.random() * 8);
        slime2 = Math.ceil(Math.random() * 4);
        slime3 = Math.ceil(Math.random() * 2);
      }
      genSlime1(slime1);
      genSlime2(slime2);
      genSlime3(slime3);
    }
  }

  /**
   * This function helps to generate given amount of normal slimes to the battleground.
   * @param {number} number The amount of normal slimes to generate.
   */
  function genSlime1(number) {
    for (let i = 0; i < number; i++) {
      let newSlime = gen("div");
      let newImg = gen("img");
      let newHp = gen("p");
      newImg.src = "img/slime1.png";
      newImg.alt = "Normal Slime";
      newHp.textContent = Math.round(Math.random() * 5 + 10);
      newSlime.appendChild(newImg);
      newSlime.appendChild(newHp);
      qs("#chapter-1 .enemies").appendChild(newSlime);
    }
  }

  /**
   * This function helps to generate given amount of slime kings to the battleground.
   * @param {number} number the amount of slime kings to generate.
   */
  function genSlime2(number) {
    for (let i = 0; i < number; i++) {
      let newSlime = gen("div");
      let newImg = gen("img");
      let newHp = gen("p");
      newImg.src = "img/slime2.png";
      newImg.alt = "Slime King";
      newHp.textContent = Math.round(Math.random() * 10 + 15);
      newSlime.appendChild(newImg);
      newSlime.appendChild(newHp);
      id("slimes").appendChild(newSlime);
    }
  }

  /**
   * This function helps to generate given amount of slime warriors to the battleground.
   * @param {number} number the amount of slime warriors to generate.
   */
  function genSlime3(number) {
    for (let i = 0; i < number; i++) {
      let newSlime = gen("div");
      let newImg = gen("img");
      let newHp = gen("p");
      newImg.src = "img/slime3.png";
      newImg.alt = "Slime Warrior";
      newHp.textContent = Math.round(Math.random() * 10 + 25);
      newSlime.appendChild(newImg);
      newSlime.appendChild(newHp);
      id("slimes").appendChild(newSlime);
    }
  }

  /**
   * This function will deal with all the errors occured during the fetch requesting and make them
   * more user-friendly.
   * @param {object} err The error object to be handled to be user-friendly.
   */
  function handleError(err) {
    console.error(err);
  }

  /**
   * This function helps to check the status of fetch and returns different object in response to
   * the fetch status.
   * @param {object} res The response object fetched from the API.
   * @returns {object} If the fetch successes (status 200) returns the response object itself.
   * @throws {object} If the fetch fails, throws an error object.
   */
  async function checkStatus(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * The helper function to implement getElementById() function quicker.
   * @param {string} idName The id name of the element to be refered.
   * @returns {object} The object of the reference by id name.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * The helper function to implement querySelector() function quicker.
   * @param {string} selector The css query selector of the element to be refered.
   * @returns {object} The object of the reference by css query selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * The helper function to implement querySelectorAll() function quicker.
   * @param {string} selector The css query selector of the elements to be refered.
   * @returns {object} The object of the reference by css query selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * The helper function to implement createElement() function quicker.
   * @param {string} tagName The kind of tag to be generated.
   * @returns {object} The object of newly created element.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();