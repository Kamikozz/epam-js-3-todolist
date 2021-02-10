var todolist = (function _() {
  var b = 5;

  function handleA(event) {

  }

  return {
    b: b,
  };
}());

// var a = todolist.
var tasksList = [];

function changeTask() {
  console.log('Changed Tasks properties!');
}

function changeStatus() {
  console.log('ChangedTasksState');
}

function createNewTask(text, date, time) {
  if (text.length !== 0 && date.length === 0 && time.length === 0) {
    var newTask = Object.create(null);
    newTask.text = text;
    newTask.status = 'not done';
    newTask.hasDeadline = false;

    tasksList.push(newTask);
    console.log('New task has been added!');
    console.log(tasksList);
  }
  else if (text.length !== 0 && date.length !== 0 && time.length !== 0) {
    var newTask = Object.create(null);
    newTask.text = text;
    newTask.status = 'not done';
    newTask.hasDeadline = true;
    newTask.date = date;
    newTask.time = time;

    tasksList.push(newTask);
    console.log('New task has been added!');
    console.log(tasksList);
  }
}

function deleteTask(idx) {
  var index = !idx ? 2 : idx;
  // var idx = this.items.indexOf(item);
  tasksList.splice(index, 1);
  console.log('\n has been deleted');
  console.log(tasksList);
}

function toggleEditMode() {
  console.log('Edit mode has been activated');
}
