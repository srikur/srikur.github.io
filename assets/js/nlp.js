var varInput = document.getElementById("varsInput");
varInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("addVar").click();
  }
});

var consInput = document.getElementById("consInput");
consInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("addBtn").click();
  }
});

var objInput = document.getElementById("objInput");
objInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("addObj").click();
  }
});

// Create a "close" button and append it to each list item
if (window.location.pathname == "/nlp.html") {
    var myNodelist = document.getElementsByTagName("LI");
    var i;
    for (i = 0; i < myNodelist.length; i++) {
      var span = document.createElement("SPAN");
      var txt = document.createTextNode("\u00D7");
      span.className = "close";
      span.appendChild(txt);
      myNodelist[i].appendChild(span);
    }
}

// Click on a close button to hide the current list item
if (window.location.pathname == "/nlp.html") {
    var close = document.getElementsByClassName("close");
    var i;
    for (i = 0; i < close.length; i++) {
      close[i].onclick = function() {
        var div = this.parentElement;
        div.remove();
      }
    }
}

// Actively monitor the objective function
function checkObjective() {
    document.getElementById("errorMsg").style.color = "red";
    var objective = document.getElementById("objInput").value;
    
    // Find all the spaces and see if it matches the number of variables + 1 for G or L
    var numSpaces = 0;
    for (var i = 0; i < objective.length; i++) {
        if(objective[i]==" ") numSpaces++;
    }
    
    const list = document.querySelector("#variableList");
    const vars = list.querySelectorAll("ul.vars > li");
    
    if (numSpaces != vars.length) {
        console.log(vars.length);
        document.getElementById("errorMsg").innerHTML = "Incorrect amount of inputs!";
        return -1;
    }
    
    let coefficients = objective.split(" ");
    
    if ((coefficients[coefficients.length - 1] == "Max") || (coefficients[coefficients.length - 1] == "Min")) {
        console.log("Correct so far!");
    } else {
        //console.log();
        document.getElementById("errorMsg").innerHTML = "'Max' or 'Min' should be the final argument for the objective!!";
        return -1;
    }
    
    // Retrieve all the variables created
    for (x in vars) {
        //console.log(x);
    }
                                               
    document.getElementById("errorMsg").innerHTML = "Valid objective";
    document.getElementById("errorMsg").style.color = "green";
    
    return 0;
}

// Actively monitor if the inputted constraint is valid
function checkConstraint() {
    document.getElementById("errorMsg").style.color = "red";
    var constraint = document.getElementById("consInput").value;
    
    // Find all the spaces and see if it matches the number of variables + 1 for G or L
    var numSpaces = 0;
    for (var i = 0; i < constraint.length; i++) {
        if(constraint[i]==" ") numSpaces++;
    }
    
    const list = document.querySelector("#variableList");
    const vars = list.querySelectorAll("ul.vars > li");
    
    if (numSpaces != vars.length) {
        console.log(vars.length);
        document.getElementById("errorMsg").innerHTML = "Incorrect amount of inputs!";
        return -1;
    }
    
    if ((constraint[constraint.length - 1] == "G") || (constraint[constraint.length - 1] == "L")) {
        console.log("Correct so far!");
    } else {
        //console.log();
        document.getElementById("errorMsg").innerHTML = "G or L should be the final character of the constraint!";
        return -1;
    }
    
    let coefficients = constraint.split(" ");
    
    // Retrieve all the variables created
    for (x in vars) {
        //console.log(x);
    }
                                               
    document.getElementById("errorMsg").innerHTML = "Valid constraint";
    document.getElementById("errorMsg").style.color = "green";
    
    return 0;
}

// Actively monitor if the inputted variable is valid
function checkVariable() {
    document.getElementById("errorMsg").style.color = "red";
    var variable = document.getElementById("varsInput").value;
    if (variable.includes(' ')) {
        document.getElementById("errorMsg").innerHTML = "Variable names should not contain spaces!";
        return -1;
    } else {
        document.getElementById("errorMsg").innerHTML = "Valid variable!";
        document.getElementById("errorMsg").style.color = "green";
        return 0;
    }
}

function newObjective() {
    var check = checkObjective();
    if (check == -1) {
        return;
    }
    
    var li = document.createElement("li");
      var inputValue = document.getElementById("objInput").value;
      var t = document.createTextNode(inputValue);
      li.appendChild(t);
      if (inputValue === '') {
        return;
      } else {
        document.getElementById("objectiveList").appendChild(li);
      }
      document.getElementById("objInput").value = "";

      var span = document.createElement("SPAN");
      var txt = document.createTextNode("\u00D7");
      span.className = "close";
      span.appendChild(txt);
      li.appendChild(span);

      for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
          var div = this.parentElement;
          div.remove();
        }
      }
}

function newVariable() {
    var check = checkVariable();
    if(check == -1) {
        return;
    }
      var li = document.createElement("li");
      var inputValue = document.getElementById("varsInput").value;
      var t = document.createTextNode(inputValue);
      li.appendChild(t);
      if (inputValue === '') {
        return;
      } else {
        document.getElementById("variableList").appendChild(li);
      }
      document.getElementById("varsInput").value = "";

      var span = document.createElement("SPAN");
      var txt = document.createTextNode("\u00D7");
      span.className = "close";
      span.appendChild(txt);
      li.appendChild(span);

      for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
          var div = this.parentElement;
          div.remove();
        }
      }
}

// Create a new list item when clicking on the "Add" button
function newConstraint() { 
    var check = checkConstraint();
    if(check == -1) {
        return;
}
  var li = document.createElement("li");
  var inputValue = document.getElementById("consInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    return;
  } else {
    document.getElementById("constraintList").appendChild(li);
  }
  document.getElementById("consInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.remove();
    }
  }
}

function calculate() {
    var nlopt = 'nlopt';
    require([nlopt], function(result){
        nlopt = result;
        var myfunc = function(n, x, grad){
          if(grad){
            grad[0] = 0.0;
            grad[1] = 0.5 / Math.sqrt(x[1]);
          }
          return Math.sqrt(x[1]);
        }
        var createMyConstraint = function(cd){
          return {
            callback:function(n, x, grad){
              if(grad){
                grad[0] = 3.0 * cd[0] * (cd[0]*x[0] + cd[1]) * (cd[0]*x[0] + cd[1])
                grad[1] = -1.0
              }
              tmp = cd[0]*x[0] + cd[1]
              return tmp * tmp * tmp - x[1]
            },
            tolerance:1e-8
          }
        }
        options = {
          algorithm: "LD_MMA",
          numberOfParameters:2,
          minObjectiveFunction: myfunc,
          inequalityConstraints:[createMyConstraint([2.0, 0.0]), createMyConstraint([-1.0, 1.0])],
          xToleranceRelative:1e-4,
          initalGuess:[1.234, 5.678],
          lowerBounds:[Number.MIN_VALUE, 0]
        }
        console.log(nlopt(options).parameterValues);
        });    
}