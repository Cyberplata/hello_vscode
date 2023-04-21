//Представление
var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},

	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
	},

	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");
	}
};

//Модель
var model = {
	boardSize: 7,
	numShips: 3,
	shipsSunk: 0,
	shipLength: 3,
	ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],

	fire: function(guess) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);

			// here's an improvement! Check to see if the ship
			// has already been hit, message the user, and return true.
			if (ship.hits[index] === "hit") {
				view.displayMessage("Oops, you already hit that location!");
				return true;
			} else if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("HIT!");

				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);
		view.displayMessage("You missed.");
		return false;
	},

	/*
	fire: function(guess) {
		for (var i = 0; i < this.numShips; i++) {
			 var ship = this.ships[i];
			 var index = ship.locations.indexOf(guess);
			 if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("HIT!");
				if (this.isSunk(ship)) {
					view.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			 }
		}
		view.displayMiss(guess);
		view.displayMessage("You missed.");
		return false;
	}, */

	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++) {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
		return true;
	},

	//Основной метод. Создаёт в модели массив ships с количеством кораблей, определяемым свойством numShips модели.
	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log("Ships array: ");
		console.log(this.ships);
	},

	//Метод создаёт один корабль, находящийся в произвольном месте игрового поля. При этом не исключено перекрытие с другими кораблями.
	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var row, col;

		if (direction === 1) {	//Сгенерировать начальную позицию для горизонтального корабля
			row = Math.floor(Math.random() * this.boardSize); 
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		} else {	//Сгенерировать начальную позицию для вертикального корабля
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
 			col = Math.floor(Math.random() * this.boardSize); 
		}
	
		var newShipLocations = [];	//Набор позиций нового корабля начинается с пустого массива, в который последовательно добавляются элементы.
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) { //Для горизонтального корабля
				newShipLocations.push(row + "" + (col + i)); //Добавить в массив для горизонтального корабля
			} else {
				newShipLocations.push((row + i) + "" + col); //Добавить в массив для вертикального корабля
			}
		}
		return newShipLocations; //Заполнив массив позициями нового корабля, мы возвращаем его вызывающему методу generateShipLocations.
	},

	// Метод collision получает данные корабля и проверяет, перекрывается ли хотя бы одна клетка с клетками других кораблей, уже находящихся на поле.
	collision: function(locations) { //locations - массив позиций нового корабля, который мы собираемся разместить на игровом поле.
		for (var i = 0; i < this.numShips; i++) { //Внешний цикл перебирает все корабли модели (в свойстве model.ships).
			var ship = model.ships[i];
			for (var j = 0; j < locations.length; j++) { //Внутренний цикл перебирает все позиции нового корабля в массиве locations и проверяет, не заняты ли какие-либо из этих клеток существующими кораблями на игоровом поле.
				if (ship.locations.indexOf(locations[j]) >= 0) { //Метод indexOf проверяет, присутствует ли заданная позиция в массиве.
					return true; 								 //Таким образом, если полученный индекс больше либо равен 0, мы знаем, что клетка уже занята, поэтому метод возращает true (перекрытие обнаружено).
				}
			}
		}
		return false; //Если выполнение дошло до этой точки, значит ни одна из позиций не была в других массивах,
	}				  //поэтому функция возращает false (перекрытия отсутствуют).
};


//Обработчик событий
function init() {
	var fireButton = document.getElementById("fireButton");	//Cначала мы получаем ссылку на кнопку Fire! по индентификатору кнопки.
	fireButton.onclick = handleFireButton;	// Кнопке можно назначить обработчик события нажатия - функцию handleFireButton.
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress; //Добавляем новый обработчик - для обработки событий нажатия клавиш в поле ввода HTML.

	model.generateShipLocations(); //И конечно, добавьте вызов метода, генерирующиего позиции кораблей, которвый заполнит пустые массивы в объекте модели.
								   //Метод model.generateShipLocations вызываеися из функции init, чтобы это происходило во время загрузки игры (до её начала). 
								   //При таком вызове позиции всех кораблей будут определены к моменту начала игры.
}

//Обработчик нажатий клавиш: вызывается при каждом нажатии клавиш в поле input страницы.
//Браузер передаёт объект события обработчику. Объект содержит информацию о том, какая клавиша была нажата.
function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");
	if (e.keyCode === 13) {	//Если нажата клавиша Enter, то свойство keyCode события равно 13. В таком случае кнопка Fire! должна сработать так, словно игрок щёлкнул на ней.
		fireButton.click(); //Для этого можно вызвать метод click кнопки fireButton (фактический этот метод вызов имитирует нажатие кнопки).
		return false;
	}
}

//Это функция handleFireButton, она будет вызываться при каждом нажатии Fire!
function handleFireButton() {
	var guessInput = document.getElementById("guessInput");	//Cначала мы получаем ссылку на элемент формы по индентификатору элемента "guessInput".
	var guess = guessInput.value;	//Затем извлекаем данные, введённые пользователем координаты хрянятся в свойстве value элемента input.
	controller.processGuess(guess);	//Координаты выстрела передаются контроллёру, а дальше всё должно заработать как по волшебству.

	guessInput.value = ""; //Короткая команда просто удаляет содержимое элемента input формы, заменяя его пустой строкой.
}

window.onload = init;


//Контроллер
var controller = { 		//Здесь определяется объект контроллёра
	guesses: 0,	   		//со свойством guesses, которое инициализируется нулём.

	processGuess: function(guess) { 	//Метод processGuess будет использоваться для проверки введённых данных.
		var location = parseGuess(guess);
		if (location) {
			this.guesses++;				//Если пользователь ввёл правильные координаты, счётчик выстрелов увеличивается на 1.
			var hit = model.fire(location);	/*Затем комбинация строки и столбца передаётся методу fire. Напомним, что метод fire возращает true при попадании в корабль*/
			if (hit && model.shipsSunk === model.numShips) {
				view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
			}
		}
	}
};

/*
controller.processGuess("A0");

controller.processGuess("A6");
controller.processGuess("B6");
controller.processGuess("C6");

controller.processGuess("C4");
controller.processGuess("D4");
controller.processGuess("E4");

controller.processGuess("B0");
controller.processGuess("B1");
controller.processGuess("B2");*/


//Вспомогательная функция
function parseGuess(guess) {
	var alphabet = ["A", "B", "C", "D", "E", "F", "G"];

	if (guess === null || guess.length !== 2) {		//Проверяем данные на null и убеждаемся, что в строке два символа
		alert("Oops, please enter a letter and a number on the board.");
	} else {
		firstChar = guess.charAt(0);			//Извлекаем первый символ строки.
		var row = alphabet.indexOf(firstChar);	//При помощи метода indexOf получаем цифру в диапазоне от 0 до 6, соответствующую букве.
		var column = guess.charAt(1);			//Получения второго символа, представляющий столбец игрового поля.

		if (isNaN(row) || isNaN(column)) {
			alert("Oops, that isn't on the board.");
		} else if (row < 0 || row >= model.boardSize ||
				   column < 0 || column >= model.boardSize) {
			alert("Oops, that's off the board!");
		} else {
			return row + column; 
		}
	}
	return null;
}

/*тест-код выстрелов
console.log(parseGuess("A0"));
console.log(parseGuess("B6"));
console.log(parseGuess("G3"));
console.log(parseGuess("H0"));
console.log(parseGuess("A7"));
*/