var print = function(output){
  console.log(output);
};

var getEl = function(el) {
  return document.getElementById(el);
};

var logList = [];
var selectedLog;
var logWindow = getEl("logWindow");

//Polyfill for includes
if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

//Only draw a section of lines at a time, so the browser doesn't have to render all lines at once
var drawLog = (function() {
  var cursor = 0;
  var nextCursor;

  return function() {
    nextCursor = cursor + 100;
    if (nextCursor > logList.length) {
      nextCursor = logList.length - 1;
    }
    for (var i = cursor; i < nextCursor; i++) {
      logWindow.appendChild(logList[i]);
    }

    cursor = nextCursor;
    if (cursor < logList.length -1) {
      setTimeout(drawLog, 4);
    }

  };
})();

//Hide all lines which match lines in the search list, show all others
//If searchSting is passed in, only matching are removed. Nothing done with hidden
//If searchlist_box is empty, all are shown
function applySearch(searchString) {
  if (typeof searchString === 'string') {
    searchString = escape(searchString);
    for (var l = logList.length -1; l >= 0; l--) {
      if (searchString !== "") {
        var log = escape(logList[l].innerHTML);
        if (log.includes(searchString)) {
          logList[l].style.display = "none";
        }
      }
    }
  }
  else {
    var searchList = getEl("searchlist_box").children;
    if (searchList.length !== 0) {
      for (var l = logList.length -1; l >= 0; l--) {
        for (var s = 0; s < searchList.length; s++) {
          var log = escape(logList[l].innerHTML);
          var searchString = escape(searchList[s].innerHTML);
          if (searchString !== "") {
            if (log.includes(searchString)) {
              logList[l].style.display = "none";
              break;
            }
            else {
              logList[l].style.display = "";
            }
          }
        }
      }
    }
    else {
      for (var l = logList.length -1; l >= 0; l--) {
        logList[l].style.display = "";
      }
    }
  }
  offsetLogwindow();
}



function toggleVis(el) {
  if (getComputedStyle(el, null).display == "none") {
    el.style.display = 'block';

  }

  else {
    el.style.display = "none";
  }
}

function addLogListener(el) {
  el.addEventListener("click", function(){
    var value = el.innerHTML;
    addSearchString(value);
    if (selectedLog) {
      selectedLog.style.background = "white";
    }
    selectedLog = this;
    this.style.background = "red";
  });
}

function addSearchString(value) {
  var searchString = document.createElement("div");
  searchString.addEventListener('blur', searchChange, false);
  searchString.className += "input-search-string";
  searchString.setAttribute("contentEditable", true);
  if (window.getSelection().toString()) {
    value = window.getSelection().toString();
  }
  searchString.innerHTML = value;
  getEl("searchlist_box").appendChild(searchString);
  applySearch(value);
}

//Run when a search string is changed by the user
function searchChange() {
  if ((this.innerHTML === "") || (this.innerHTML === "<br>")) {
    this.parentNode.removeChild(this);
  }
  applySearch();
}


function offsetLogwindow() {
  logWindow.style.marginTop = (getEl('navbar').offsetHeight + 10) + "px";
}

//Read in selected log file
function readSingleFile(evt) {
  var f = evt.target.files[0];
  if (f) {
    toggleVis(getEl("choose_file_button"));
    toggleVis(getEl("searchlist_box"));
    var r = new FileReader();
    r.onload = function(e) {
      var contents = e.target.result;
      var separatedLogList = contents.split("\n");
      var logListLength = separatedLogList.length;
      for (var i = 0; i < logListLength; i++) {
        var tempLog = document.createElement("div");
        tempLog.innerHTML = separatedLogList[i];
        tempLog.classList.add("log_line");
        logList.push(tempLog);
        addLogListener(tempLog);
      }
      drawLog();
      offsetLogwindow();
    };
    r.readAsText(f);
    r.onerror = function () {
      var output = r.error.name;
      if (r.error.message) {
        output += ": " + r.error.message;
      }
      print(output);
      if (r.error.name == "SecurityError") {
        alert("Verify you have permissions to access the selected file");
      }
    };
  } else {
    alert("Failed to load file");
  }
}


// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
document.getElementById('inputfile').addEventListener('change', readSingleFile, false);
} else {
alert('The File APIs are not fully supported by your browser.');
}