// randomizes elements in array
Array.prototype.shuffle = function() {
	return this.sort(function(a,b){return Math.random() > 0.5 ? 1 : -1;});
};

// Gets random element from an array.
Array.prototype.sample = function() {
	return this[Math.floor(Math.random() * this.length)];
};

// lengthens abreviations
Array.prototype.lengthen = function () {
	var keys = { 
		str : 'Strength', 
		dex : 'Dexterity', 
		con : 'Constitution', 
		wis : 'Wisdom', 
		int : 'Intelligence', 
		chr : 'Charisma'
	};
	return this.map(function (a) {
		return keys[a];
	});
};

// converts ability scores to modifiers
Array.prototype.convertToModifiers = function() {
	return this.map(function(score){
		var mod = Math.floor((score - 10) / 2);
		if (mod >= 0) {
			return "+"+mod;
		} else {
			return mod;
		}
	});
};

// gets random element from object
Object.prototype.getRandom = function() {
	var keys = Object.keys(this);
	return keys[Math.floor(Math.random() * [keys.length])];
};

// Returns a sorted array (high to low) with 6 randomly generated scores. 
function abilityScoreArray() {
	// Roll four 6-sided dice and return the total of the highest three dice.
	function singleScore() {
		// Add 4 random dice rolls
		var tempArr = [0,0,0,0].map(function(e){return Math.floor(Math.random() * 6) + 1;});
		// remove the lowest
		    tempArr.splice(tempArr.indexOf(Math.min.apply(Math, tempArr)), 1);
		// return the sum of remaining 3
		return tempArr.reduce(function(a,b){return a + b;});
	}
	// return 6 sorted scores
	return [0,0,0,0,0,0].map(function(e){ return singleScore(); })
						.sort(function(a,b){ return b - a; });	
}		

// Returns a sorted string of abilities, highest to lowest
function sortByImportance (stats) {
	return Object.keys(stats).map(function(importance, index) {
		// We just need the first three keys. The 4th key is the getRandom() method. 
		if (index < 4) {
			return stats[importance].map(function(ability){
				return ability;
			});
		}
	}).reduce(function(a, b) {
		return a.concat(b);
	});
}

// Returns a string of the class' most important ability
function mostImportantAbility(stats) {
	var mostImportant = stats.highest.lengthen();
	if (mostImportant.length > 1) {
		mostImportant.splice(1,0," and ");
	}
	return mostImportant.join('');
}

// Returns a string of abilities that get a bonus
function racialBonusesText (race) {
	var char = races[race];
	if (race === "Human") {
		return "all abilities";
	} else {
		var bonuses = Object.keys(char).filter(function(ability) {
			return char[ability] > 0;
		});
	}
	var mappedBonuses = bonuses.lengthen();
	
	if (mappedBonuses.length > 1) {
		mappedBonuses.splice(1,0," and ");
	}
	return {
		fullBonuses: mappedBonuses.join(''),
		abrvBonuses: bonuses
	};
}

// Applies racial bonuses to ability scores.
function applyRacialBonuses(race, sortedStats, scores) {
	var bonusAbilites = racialBonusesText(race).abrvBonuses;
	// if race is not human
	if (race !== "Human") {
		// add only necessary mods
		return scores.map(function(num, index) {
			for (var i = 0; i <= bonusAbilites.length; i++) {
				if (index === sortedStats.indexOf(bonusAbilites[i])) {
					return num + races[race][bonusAbilites[i]];
				}
			}
			return num;
		});
	} else {
		// add 1 to each score (dang humans)
		return scores.map(function(num) {
			return num+1;
		});
	}
}

// Generates new character.
function generateCharacter () {
    var rRace = races.getRandom(),
	    rClass = classes.getRandom(),
	    stats = classes[rClass],
	    characterAbilities = (stats.highest + "," + stats.randomized.shuffle() + "," + stats.lowest).split(",").lengthen(),
	    sortedStats = sortByImportance(stats),
	    initialScores = abilityScoreArray();
	    raceAdjustedScores = applyRacialBonuses(rRace, sortedStats, initialScores);
	
	// Add the stuff to the DOM.
	var raceNodes = document.getElementsByClassName('race');
	Array.prototype.slice.call(raceNodes).forEach(function(e) { 
		e.innerHTML = rRace;
	});

	var classNodes = document.getElementsByClassName('class');
	Array.prototype.slice.call(classNodes).forEach(function(e) {
		e.innerHTML = rClass;
	});

	document.getElementById('aboutRaceTitle').innerHTML = rRace.toUpperCase();
	document.getElementById('aboutClassTitle').innerHTML = rClass.toUpperCase();
	document.getElementById('wildcard').innerHTML = wildcard.sample();
	document.getElementById('bioRace').innerHTML = bioRace[rRace];
	document.getElementById('bioClass').innerHTML = bioClass[rClass];
	document.getElementById('importantAbilities').innerHTML = mostImportantAbility(stats);
	document.getElementById('bonuses').innerHTML = typeof racialBonusesText(rRace) === 'string' ? racialBonusesText(rRace) : racialBonusesText(rRace).fullBonuses;
	
	sortedStats.forEach(function(e,i) {
		document.getElementById(i).innerHTML = e.toUpperCase();
	});
	raceAdjustedScores.forEach(function(e,i){
		document.getElementById(i + 6).innerHTML = e;
	});
	raceAdjustedScores.convertToModifiers().forEach(function(e,i){
		document.getElementById(i + 12).innerHTML = e;
	});


	// print out details to the console
	if (showDetails) {
		console.log("Race: ", rRace);
		console.log("Class: ", rClass);
		console.log("Abilities sorted by importance :", sortedStats);
		console.log("Initial Roll :", initialScores);
		console.log('Most important ability :', stats.highest);
		console.log("Gets bonuses to", typeof racialBonusesText(rRace) === 'string' ? racialBonusesText(rRace) : racialBonusesText(rRace).fullBonuses);
		console.log("Ability Scores with Racial Bonuses :", raceAdjustedScores);
		console.log('~~~~~~~~~~');
	}
}

var showDetails = false;
console.log('To get a more detailed breakdown of your character, enter `showDetails = true`');

generateCharacter();

document.getElementById('button').addEventListener('click', function() {
	generateCharacter();
});