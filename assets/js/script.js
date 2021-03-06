var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

    // check due date
    auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

//LOADING THE TASKS
var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

//SAVING THE TASKS
var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});


//=================================================================
//  Method for editing the text for the task in <p> element
//=================================================================
// refer to 5.1.6
// editing the task text area
// .list-group refers to the <ul>
// .on("click", "p") is a event listener waiting for the <p> to be clicked on so the DOM element can be edited
$(".list-group").on("click", "p", function() {
  var text = $(this)
  .text()
  .trim();
  console.log(text);

  //CREATING A NEW <textarea> ELEMENT (reference 5.1.6)
  var textInput = $("<textarea>") // <textarea> element is assigned/saved to the variable textInput
  .addClass("form-control")
  .val(text);

  //WE ARE REPLACING THE CURRENT <p> (this) ELEMENT WITH THE NEW textInput
  $(this).replaceWith(textInput);
  textInput.trigger("focus"); //Highlighting the <textarea>
});

//=================================================================
// Collect data and switch <textarea> element back to <p> element
//=================================================================
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  var text = $(this)
  .val();
  // .trim();

  // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // updating the {task} object
  tasks[status][index].text = text;
  saveTasks();

  // CONVERTING <textarea> back to a <p> element
  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

//=================================================================
// Method for updating due date
//=================================================================
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});

//=================================================================
// Collect data and switch <textarea> element back to <p> element
//=================================================================
// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val();
    // .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
  
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

//=================================================================
// Drag and drop method
//=================================================================

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    console.log("deactivate", this);
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    console.log("over", event.target);
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    console.log("out", event.target);
    $(event.target).removeClass("dropover-active");
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr);
  }
});

//=================================================================
// Trash method
//=================================================================
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function(event, ui) {
    console.log("over");
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    console.log("out");
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

//=================================================================
// date picker method
//=================================================================
$("#modalDueDate").datepicker({
  minDate: 1
});

//=================================================================
// tracking dates of task
//=================================================================
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};


setInterval(function () {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, (1000 * 60) * 30);

// load tasks for the first time
loadTasks();


