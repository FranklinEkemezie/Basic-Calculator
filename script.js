/* -----------------------------------------
# HTML Elements
----------------------------------------- */
const display = document.querySelector("main .screen input");
const output = document.querySelector("main .screen output");
const buttons = document.querySelectorAll("main .keypad .keypad-grid button");

/* -----------------------------------------
# CALCULATOR Variables
----------------------------------------- */
const CALCULATOR = {
  buttons: [...buttons],
  Symbols: {
    "/": [Symbol('/').description, (a, b) => a / b], // division
    "*": [Symbol('*').description, (a, b) => a * b], // multiplication
    "-": [Symbol('-').description, (a, b) => a - b], // substraction
    "+": [Symbol('+').description, (a, b) => a + b] // addition
  },
  get expression() {
    return this.exprStack.join("");
  },
  get display() {
    return this.displayStack.join("");
  },
  result: 0,
  exprStack: [], // holds values as for calculation
  displayStack: [], // holds values for display in the input
  error_msg: null

}

/* -----------------------------------------
# Functions
----------------------------------------- */
function handleBtnClick() {
  let value = this.dataset.value, funct = this.dataset.function;
  let isFunctionBtn = Boolean(funct);

  if(!isFunctionBtn) {
    CALCULATOR.exprStack.push(value);
    CALCULATOR.displayStack.push(this.innerHTML);
    display.value = CALCULATOR.display;

    let result = evaluateExpression(CALCULATOR.expression);
    if(result !== null) output.innerHTML = CALCULATOR.result = result;
    CALCULATOR.error_msg = result !== null ? null : "<i>Syntax Error</i>";
  } else {
    handleFunctionBtnClick(funct);
  }
}

function handleFunctionBtnClick(funct) {
  switch(funct) {
    case "delete":
      CALCULATOR.exprStack.pop();
      CALCULATOR.displayStack.pop();
      updateValues(evaluateExpression(CALCULATOR.expression));
      break;
    case "clear":
      CALCULATOR.exprStack = [];
      CALCULATOR.displayStack = [];
      updateValues(0);
      break;
    case "sqrt":
      updateValues(Math.sqrt(CALCULATOR.result));
      break;
    case "square":
      updateValues(Math.pow(CALCULATOR.result, 2));
      break;
    case "inverse":
      updateValues(Math.pow(CALCULATOR.result, -1));
      break;
    case "equals":
      if(CALCULATOR.error_msg === null) {
        CALCULATOR.exprStack = [CALCULATOR.result];
        CALCULATOR.displayStack = [CALCULATOR.result];
        updateValues(CALCULATOR.result);
      } else {
        output.innerHTML = CALCULATOR.error_msg;
      }
      break;
  }
}

function updateValues(final_result) {
  display.value = CALCULATOR.display;
  output.innerHTML = CALCULATOR.result = final_result;
}

function parseExpression(expression='') {
  expression = CALCULATOR.Symbols["+"][0] + expression;

  let regex = /[^0-9.]+/g;
  let numbers = expression.split(regex);
  numbers.shift(); // removes the first empty space
  let symbols = [...expression.matchAll(regex)].map(arr => arr[0]);
  let result = [];

  numbers.forEach((_, i) => result.push(symbols[i], numbers[i]));
  return result;
}

function simplifyExpression(expression="") {
  let parsedExp = parseExpression(expression);

  if(Number.isNaN(parseFloat(parsedExp.at(-1)))) return null;

  const simplifyPlusMinus = (plus_minus_exp) => ([...plus_minus_exp].filter(e => e === '-').length % 2 === 0) ? '+' : '-';
  let simplified = parsedExp.map(val => {
    if([...val].every(e => ['+', '-'].includes(e))) return simplifyPlusMinus(val);
    if(!Number.isNaN(parseFloat(val))) return parseFloat(val);
    return val;
  });

  // Remove leading 'plus' or 'minus' sign
  simplified[0] = parseFloat(simplified.shift() + simplified[0]);

  // Simplify further: for '*-', '/-', etc.
  simplified = simplified.map((e, i, arr) => {
    if(typeof e !== "number" && e.length > 1) {
      if(['*', '/'].filter(val => [...e].includes(val))
        .every(val => e.indexOf(val) === 0 && e.indexOf(val) === e.lastIndexOf(val))) {
        // i.e. all '+' and '-' come after all '*' and '/' and ('*' and '/') will not occur more than once)
        // A way to do this is to check if '*' and '/' occur only at the first position

        // Simplify the signs after '*' or '+'
        let simplified_plus_minus = simplifyPlusMinus(e.substring(1));
        // Change the sign of the next number; depending on the above result
        arr[i + 1] = parseFloat(simplified_plus_minus + arr[i + 1]);
        return e[0]; // return only '*' or '/' as the case may be
      } else {
        console.log("Syntax Error");
        return null;
      }
    } else {
      return e;
    }
  });
  if(simplified.some(e => e === null)) return null;

  return simplified;
}

function evaluateExpression(expression="") {
  let expArr = simplifyExpression(expression);

  const simplifyLike = (sign, operation) => {
    try {
      while(expArr.includes(sign)) {
        let index = expArr.indexOf(sign);
        let lhs = expArr[index - 1];
        let rhs = expArr[index + 1];
        let result = operation(lhs, rhs);
  
        expArr.splice(index - 1, 3, result);
      }
    } catch (e) {
      return null;
    }
  }

  // Loop through all the symbols
  let answer = undefined;
  Object.values(CALCULATOR.Symbols).forEach(symbol => answer = simplifyLike(symbol[0], symbol[1]));
  if(answer !== null) answer = parseFloat(parseFloat(expArr[0]).toFixed(14));

  return answer;
}

/* -----------------------------------------
# Adding EventListeners
----------------------------------------- */
CALCULATOR.buttons.forEach(btn => btn.addEventListener("click", handleBtnClick));