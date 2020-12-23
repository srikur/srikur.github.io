// Get the input field
var varInput = document.getElementById("varsInput");
// Execute a function when the user releases a key on the keyboard
varInput.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("addVar").click();
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
        div.style.display = "none";
      }
    }
}

// Actively monitor if the inputted constraint is valid
function checkConstraint() {
    var constraint = document.getElementById("consInput").value;
    document.getElementById("errorMsg").innerHTML = "Please enter a valid constraint!";
    return -1;
}

// Actively monitor if the inputted variable is valid
function checkVariable() {
    var variable = document.getElementById("varsInput").value;
    if (variable.includes(' ')) {
        document.getElementById("errorMsg").innerHTML = "Variable names should not contain spaces!";
        return -1;
    } else {
        document.getElementById("errorMsg").innerHTML = "";
        return 0;
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
      div.style.display = "none";
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
      div.style.display = "none";
    }
  }
}