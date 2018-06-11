function setClick() {
    mode = "set";

    document.getElementById("Time").classList.remove("hide");

    document.getElementById("Work").style.backgroundColor = "white";
    document.getElementById("Set").style.backgroundColor = "rgb(51, 153, 255)";

    var inputBoxes = document.getElementsByClassName("input");
    inputBoxes[0].classList.remove("hide");
    inputBoxes[1].classList.remove("hide");
    inputBoxes[2].classList.remove("hide");
    inputBoxes[3].classList.remove("hide");

    setDeleteButtonText("Delete");

    var deleteButtons = document.getElementsByClassName("delete");
    for(var i = 0; i<deleteButtons.length; i++) {
        deleteButtons[i].parentNode.classList.remove("hide");
    }
}

function workClick() {
    mode = "work";

    document.getElementById("Time").classList.add("hide");

    document.getElementById("Work").style.backgroundColor = "rgb(51, 153, 255)";
    document.getElementById("Set").style.backgroundColor = "white";

    var inputBoxes = document.getElementsByClassName("input");
    inputBoxes[0].classList.add("hide");
    inputBoxes[1].classList.add("hide");
    inputBoxes[2].classList.add("hide");
    inputBoxes[3].classList.add("hide");

    var allTodos = document.getElementsByClassName("ToDo");
    for(var i = 0; i<allTodos.length; i++) {
        console.log(todos[allTodos[i].innerText.slice(0, -6)]);
        if(todos[allTodos[i].id]==true) {
            allTodos[i].classList.add("hide");
        }
    }
    setDeleteButtonText("Done");
}

function addTodo(section, text, done, key) {
    var toDoText = (text == undefined) ? document.getElementById(section).value : text;
    var toDo = document.createElement("H4");
    toDo.id = toDoText;
    toDo.innerText = toDoText;
    toDo.classList.add( getColor(section.endsWith("i") ? section.slice(0, -1) : section ) );
    toDo.classList.add("ToDo");

    toDo.addEventListener('mouseover', function() {
        this.style.color = "rgb(51, 153, 255)";
    })

    toDo.addEventListener('mouseout', function() {
        this.style.color = this.classList[0];
    })

    toDo.addEventListener('click', function() {
        if(mode == "set" && this) {
            if(todos[this.id] == true) {
                this.style.textDecoration = "none";
                todos[this.id]=false;
            }
            else {
                this.style.textDecoration = "line-through";
                todos[this.id]=true;
            }

            chrome.storage.sync.set({ [todoNumbers[this.id]]: this.parentNode.id+"_"+this.id+"_"+todos[this.id]}, function() {
            });
    }
    });

    var deleteButton = document.createElement("BUTTON");
    deleteButton.textContent = mode == "set" ? "Delete" : "Done";
    deleteButton.className = "delete";

    deleteButton.addEventListener('click', function() {

        playRandomSoundEffect();

        if(mode=="work") {
            this.parentNode.style.textDecoration = "line-through";
            todos[this.parentNode.innerText.slice(0, -4)] = true;
            this.parentNode.classList.add("hide");

            chrome.storage.sync.set({ [todoNumbers[this.parentNode.id]]: this.parentNode.parentNode.id+"_"+this.parentNode.id+"_"+todos[this.parentNode.id]}, function() {
            });
        }
        else {

            unusedNumber--;
            setUnusedNumber();
            this.parentNode.parentNode.removeChild(this.parentNode);

            syncTodos();

        }
    })

    toDo.appendChild(deleteButton);

    if(section.endsWith("i")) {
        document.getElementById(section.slice(0, -1)).appendChild(toDo);
    }
    else {
        document.getElementById(section).appendChild(toDo);
    }

    if(done == "true") {
        todos[toDoText] = true;
        toDo.style.textDecoration = "line-through";
        toDo.classList.add("hide");
    }
    else {
        todos[toDoText] = false;
        toDo.style.textDecoration = "none";
    }

    todoNumbers[toDoText] = (key == undefined) ? unusedNumber+"" : key;


    if(text==undefined) {
        var key = unusedNumber+"";
        var value=section+"_"+toDoText+"_"+"false";
        chrome.storage.sync.set({ [key]: value}, function() {
        });

        unusedNumber++;
        setUnusedNumber();
    }
}

function restoreTodos() {
    var keys = createKeyArray();
    chrome.storage.sync.get(keys,function(result){
        keys.forEach(function(key){
            var toDoEntity = result[key]+"";
            var type = toDoEntity.slice(0, toDoEntity.indexOf("_"));
            var text = toDoEntity.slice(toDoEntity.indexOf("_")+1, getPosition(toDoEntity, "_", 2));
            var done = toDoEntity.slice(getPosition(toDoEntity, "_", 2)+1);
            addTodo(type, text, done, key);
        })
    });
}

function syncTodos() {
    var keys = createKeyArray();
    var values = document.getElementsByClassName("ToDo");
    var keyValues = []
    for(var i = 0; i<keys.length; i++) {
        keyValues[keys[i]] = values[i].parentNode.id+"_"+values[i].id+"_"+todos[values[i].id];
    }

    for(key in keys) {
        chrome.storage.sync.set({ [key]: keyValues[key]}, function() {
        });
    }
}

/* Utility Functions */

function setDeleteButtonText(text) {
    var deleteButtons = document.getElementsByClassName("delete");
    for(var i = 0; i<deleteButtons.length; i++) {
        deleteButtons[i].textContent = text;
    }
}

function playRandomSoundEffect() {
    var randomNum = Math.floor(Math.random()*5)+1;
    console.log(randomNum);
    switch(randomNum) {
        case 1:
            soundEffect1.play();
            break;
        case 2:
            soundEffect2.play();
            break;
        case 3:
            soundEffect3.play();
            break;
        case 4:
            soundEffect4.play();
            break;
        case 5:
            soundEffect5.play();
            break;
    }
}

function getColor(id) {
    switch(id) {
        case "Daily":
            return "red";
        case "Weekly":
            return "orange";
        case "Monthly":
            return "green";
        case "Random":
            return "black";
    }
}

function setUnusedNumber() {
    chrome.storage.sync.set({"UnusedNumber": unusedNumber}, function() {

    });
}

function createKeyArray(number) {
    if(number==undefined) {
        number = unusedNumber;
    }
    var keys = [];
    for(var i = 0; i<number; i++) {
        keys.push(i+"");
    }
    return keys;
}

function refreshTodosOfType(type) {
    console.log("Yep");
    for(todo in todos) {
        var actualTodo = document.getElementById(todo);
        console.log(actualTodo);
        if(actualTodo.parentNode.id == type) {
            actualTodo.style.textDecoration = "none";
            todos[todo] = false;

            chrome.storage.sync.set({
                [todoNumbers[actualTodo.id]] :
                actualTodo.parentNode.id+"_"+actualTodo.id+"_"+todos[actualTodo.id]},
                function() {}
            );
        }
    }
}

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

function convertToHoursAndMinutes(milliseconds) {
    var seconds = milliseconds/1000;
    var hours = Math.round( (seconds/3600) * 100)/100;
    var minutes = Math.round( ((seconds%3600)/60) * 100)/100;

    return hours+" hours and "+minutes+" minutes have passed since last daily refresh";
}

function convertWeekToNumber(week) {
    switch(week) {
        case "sunday": return 0;
        case "monday": return 1;
        case "tuesday": return 2;
        case "wednesday": return 3;
        case "thursday": return 4;
        case "friday": return 5;
        case "saturday": return 6;
    }
}


/* Non Function Code starts here */

var mode = "set";
var needToRefreshTodos=undefined;

var unusedNumber;

var soundEffect1 = new Audio('/SoundEffect1.mp3');
var soundEffect2 = new Audio('/SoundEffect2.mp3');
var soundEffect3 = new Audio('/SoundEffect3.mp3');
var soundEffect4 = new Audio('/SoundEffect4.mp3');
var soundEffect5 = new Audio('/SoundEffect5.mp3');

var todos = {};
var todoNumbers = {};

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#Work').addEventListener('click', workClick);
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#Set').addEventListener('click', setClick);
});

document.addEventListener('mousemove', function() {
    if(needToRefreshTodos!=undefined) {
        switch(needToRefreshTodos) {
            case "Daily":
                refreshTodosOfType("Daily");

                break;

            case "Weekly":
                refreshTodosOfType("Daily");
                refreshTodosOfType("Weekly");
                break;

            case "Monthly":
                refreshTodosOfType("Daily");
                refreshTodosOfType("Weekly");
                refreshTodosOfType("Monthly");
                break;
        }

        if(mode=="work") {
            setClick();
            workClick();
        }
        else {
            workClick();
            setClick();
        }
        needToRefreshTodos = undefined;
        this.removeEventListener('mousemove');
    }
});

document.getElementById("Time").addEventListener('click', function() {
    var date = new Date();

    var daily = prompt("Enter your daily refresh time in 24-hour format Example : 15:00");
    var weekly = prompt("Enter the day on which you start your week").toLowerCase();

    // while(!isValidTime(daily)) {
    //     daily = prompt("Enter your daily refresh time as follows (9:00 AM)");
    // }

    var hours = parseInt( daily.slice(0, daily.indexOf(":") ) );
    var minutes = parseInt( daily.slice(daily.indexOf(":") ) );

    var hoursToSubtract = date.getHours()-hours;
    var minutesToSubtract = date.getMinutes()-minutes;

    var secondsToSubtractForDaily = hoursToSubtract*3600+minutesToSubtract*60;
    var secondsToSubtractForWeekly = (convertWeekToNumber(weekly)-date.getDay())*24*3600+secondsToSubtractForDaily;
    var secondsToSubtractForMonthly = date.getDate()*24*3600+secondsToSubtractForDaily;

    var finalDailyRefreshTime = date.getTime()-secondsToSubtractForDaily*1000;
    var finalWeeklyRefreshTime = date.getTime()-secondsToSubtractForWeekly*1000;
    var finalMonthlyRefreshTime = date.getTime()-secondsToSubtractForMonthly*1000;

    console.log(finalDailyRefreshTime+"_"+finalWeeklyRefreshTime+"_"+finalMonthlyRefreshTime);

    //chrome.storage.sync.set({"Refresh": time+"_"+time+"_"+time}, function(item) {});
})

var searchStrings = ["Daily", "Weekly", "Monthly", "Random"];

searchStrings.forEach(function(item) {
    var addBox = document.createElement("input");
    addBox.type = "input";
    addBox.placeholder = "Add";
    addBox.className = "input";
    addBox.id = item+"i";
    addBox.addEventListener("keyup", function(event){
        event.preventDefault();
        if (event.keyCode === 13 && this.value.indexOf("_")==-1 && this.value!="") {
            addTodo(this.id, undefined, undefined);
            this.value = "";
        }
    });

    document.getElementById(item).appendChild(addBox);
});

chrome.storage.sync.get(["UnusedNumber"], function(result) {
    unusedNumber = result["UnusedNumber"];
    if(unusedNumber==undefined) {

        chrome.storage.sync.set({"UnusedNumber": 0}, function(item) {

            chrome.storage.sync.get(["UnusedNumber"], function(result) {

                unusedNumber = result["UnusedNumber"];
            });

        });

    }
    else {

    }

    chrome.storage.sync.get(["Refresh"], function(result) {

        if(result["Refresh"] == undefined) {
            chrome.storage.sync.set({"Refresh": Date.now()+"_"+Date.now()+"_"+Date.now()}, function(item) {});
            restoreTodos();
            setClick();
        }
        else {

            restoreTodos();

            var refreshes = result["Refresh"];
            var now = Date.now();

            var lastDailyRefresh = parseInt( refreshes.slice(0, refreshes.indexOf("_")) );
            var lastWeeklyRefresh = parseInt( refreshes.slice(getPosition(refreshes, "_", 2)+1) );
            var lastMonthlyRefresh = parseInt( refreshes.slice(refreshes.indexOf("_")+1, getPosition(refreshes, "_", 2)) );

            console.log(convertToHoursAndMinutes(now-lastDailyRefresh));
            console.log(convertToHoursAndMinutes(now-lastWeeklyRefresh));
            console.log(convertToHoursAndMinutes(now-lastMonthlyRefresh));

            if(now-lastDailyRefresh>86400000) {
                needToRefreshTodos = "Daily";
                refreshes = (lastDailyRefresh+86400000)+refreshes.slice(refreshes.indexOf("_"));
            }

            if(now-lastWeeklyRefresh>604800000) {
                needToRefreshTodos = "Weekly";
                refreshes = refreshes.slice(0, getPosition(refreshes, "_", 2)+1)+(lastWeeklyRefresh+604800000);
            }

            if(now-lastMonthlyRefresh>2.628e+9) {
                needToRefreshTodos = "Monthly";
                refreshes = refreshes.slice(0, refreshes.indexOf("_")+1)+(now+2.628e+9)+refreshes.slice(refreshes.indexOf("_"), getPosition(refreshes, "_", 2)+1);
            }

            chrome.storage.sync.set({"Refresh": refreshes}, function() {});
            workClick();
        }

    });

});
