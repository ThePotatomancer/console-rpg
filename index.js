/* character (player of enemy) structure: {
    name: string,
    hp: number, (set during start)
    maxHp: number,
    attack: number,
    defence: number,
    multipliers: List of multiplier object
}
multiplier structure: {
    duration: number (can define -1 as infinite, or just use Number.POSITIVE_INFINITY),
    stat: "attack" or "defence",
    size: number (how much is multliplied)
}
*/

let player = {
    name: "you",
    maxHp: 20,
    attack: 4,
    defence: 2
}

let enemies = [
    {
        name: "goblin",
        maxHp: 10,
        attack: 2,
        defence: 1
    },
    {
        name: "orc",
        maxHp: 20,
        attack: 4,
        defence: 2
    },
    {
        name: "orc chief",
        maxHp: 25,
        attack: 6,
        defence: 4
    }
];

let currentEnemy = 0;
let chargeMultiplier = 2;
let defendMultiplier = 2;
let turnCounter = 0;

function initCharacter(character) {
    character.hp = character.maxHp;
    character.multipliers = [];
}

function calculateStat(character, stat) {
    return character.multipliers.reduce((result, multiplier) => {
        return multiplier.stat === stat ? result *= multiplier.size : result;
    }, character[stat]);
    /* another way to do it with regular loops:
    let result = character[stat];
    for (let i = 0; i< character.multipliers.length; i++) {
        let multiplier = character.multipliers[i];
        if (multiplier.stat === stat) {
            result *= multiplier.size;
        }
    }
    return result;*/
}

function start() {
    enemies.forEach(initCharacter); // fancy way of doing a for loop, example using for loop located below
    /*
    for(let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        initCharacter(enemy);
    }
    */
    initCharacter(player);
    currentEnemy = 0;
    turnCounter = 0;
    let enemy = enemies[currentEnemy];
    console.info(`welcome! your first opponent is ${enemy.name} (${enemy.hp}/${enemy.maxHp})`);
}

function tickMultipliers(character) {
    character.multipliers = character.multipliers.filter((multiplier) => {
        return multiplier.duration > 0;
    }); 
    /* same as:
        let newMultipliers = [];
        for(let i = 0; i < character.multipliers.length; i++) {
            let multiplier = character.multipliers[i];
            if (multiplier.duration > 0) {
                newMultipliers.push(multiplier);
            }
        }
        character.multipliers = newMultipliers;
    */
    character.multipliers.forEach((multiplier) => {
        multiplier.duration--;
    });
}

function help() {
    console.info("help - shows possible commands");
    console.info("status - shows player status info");
    console.info("enemyStatus - shows current enemy status info");
    console.info("attack - attacks the enemy. damage based on your attack and enemy defence");
    console.info("charge - skip turn to greatly increase attack till end of next turn");
    console.info("defend - skip turn to greatly increase defence till end of current turn");
}

function isAlive(character) {
    return character.hp > 0;
}

function canAct() {
    let playerAlive = isAlive(player);
    if (!playerAlive) {
        console.info("you need to start a new game with start()");
    }
    return playerAlive;
}

function genericStatus(prefix, character) {
    if (canAct()) {
        console.info(`${prefix} ${character.hp}/${character.maxHp}hp,`
        + ` ${calculateStat(character, "attack")} attack and ${calculateStat(character, "defence")} defence`);
    }
}

function status() {
    genericStatus("You have", player);
}

function enemyStatus() {
    let enemy = enemies[currentEnemy];
    genericStatus(`The ${enemy.name} has`, enemy);
}

function checkDeaths() {
    let enemy = enemies[currentEnemy];
    if (!isAlive(enemy)) {
        defeatEnemy();
    }
    else if (!isAlive(player)) {
        lose();
    }
}

function calculateAttack(attacker, defender) {
    let damage = Math.max(calculateStat(attacker, "attack") - calculateStat(defender, "defence"), 1);
    defender.hp -= damage;
    outputDamage(damage, attacker, defender);
    checkDeaths();
}

function outputDamage(damage, attacker, defender) {
    console.info(`${attacker.name} did ${damage} damage to ${defender.name}`);
    console.info(`${defender.name} has ${defender.hp}hp left!`);
}

function win() {
    player.hp = 0;
    console.info("you win!");
}

function lose() {
    let enemy = enemies[currentEnemy];
    console.info(`You've been defeated by ${enemy.name}!`);
}

function defeatEnemy() {
    let enemy = enemies[currentEnemy];
    console.info(`You have defeated the ${enemy.name}!`);
    currentEnemy++; // same as currentEnemy = currentEnemy + 1 or currentEnemy += 1
    if (currentEnemy >= enemies.length) {
        win();
    }
    else {
        initCharacter(player);
        turnCounter = 0;
        enemy = enemies[currentEnemy];
        console.info(`Your next opponent is ${enemy.name} (${enemy.hp}/${enemy.maxHp})`)
    }
}

function attack() {
    if (canAct()) {
        let enemy = enemies[currentEnemy];
        calculateAttack(player, enemy);
        endTurn();
    }
}

function charge() {
    if (canAct()) {
        player.multipliers.push({
            duration: 1,
            stat: "attack",
            size: chargeMultiplier
        });
        endTurn();
    }
    console.info("you charge up your attack");
}

function defend() {
    if (canAct()) {
        player.multipliers.push({
            duration: 0,
            stat: "defend",
            size: defendMultiplier
        });
        endTurn();
    }
    console.info("you take a defensive stance");
}

function enemyTurn() {
    let enemy = enemies[currentEnemy];
    switch(enemy.name) {
        case "orc":
            if (turnCounter % 2 === 0) {
                enemy.multipliers.push({
                    duration: 0,
                    stat: defend,
                    size: defendMultiplier
                });
                console.info("orc raises his shield!")
            }
            else {
                calculateAttack(enemy, player);
            }
            break;
        case "orc chief": 
            if (turnCounter % 3 === 0) {
                enemy.multipliers.push({
                    duration: 1,
                    stat: attack,
                    size: chargeMultiplier
                });
                console.info("orc chief winds up his weapon!");
            }
            else {
                calculateAttack(enemy, player);
            }
            break;
        default:
            calculateAttack(enemy, player);
    }
}

function endTurn() {
    let enemy = enemies[currentEnemy];
    if (isAlive(enemy) && isAlive(player)) {  
        if (turnCounter !== 0) {
            enemyTurn();
            tickMultipliers(player);
            tickMultipliers(enemy); 
        }  
        turnCounter++;
    }
}