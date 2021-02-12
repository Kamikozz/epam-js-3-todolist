var utils = (function _() {
  /**
   *
   * @param {Object} message with params `type`, `title`, `body`
   */
  function createToast(message) {
    var toastsContainer = document.getElementsByClassName('toast-container')[0];

    var toastEl = document.createElement('div');
    var toastHeaderEl = document.createElement('div');
    var toastHeaderText = document.createElement('strong');
    // var toastHeaderWhen = document.createElement('small');
    var toastHeaderCloseButton = document.createElement('button');
    var toastBodyEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    // <div class="toast-header">
    // - strong
    // - small
    // - button
    toastHeaderEl.className = 'toast-header text-white bg-' + (message.type === 'error' ? 'danger' : 'success');

    toastHeaderText.className = 'me-auto';
    toastHeaderText.textContent = message.title;

    // toastHeaderWhen.textContent = 'just now';

    toastHeaderCloseButton.className = 'btn-close';
    toastHeaderCloseButton.setAttribute('type', 'button');
    toastHeaderCloseButton.setAttribute('data-bs-dismiss', 'toast');
    toastHeaderCloseButton.setAttribute('aria-label', 'Close');

    toastHeaderEl.append(toastHeaderText, toastHeaderCloseButton);

    toastBodyEl.className = 'toast-body';
    toastBodyEl.textContent = message.body;

    toastEl.append(toastHeaderEl, toastBodyEl);

    toastsContainer.appendChild(toastEl);
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
  }

  return {
    createToast: createToast,
  };
}());

var todolist = (function _() {
  var tasksList = (function _restoreTasks() {
    var storageIsEmpty = localStorage.tasksList === undefined;
    return storageIsEmpty ? [] : JSON.parse(localStorage.tasksList);
  }());

  var _elements;
  var _classNames;
  var _isEditMode = false;
  var _currentFilter = '';

  function _validateFields() {
    var text = _elements.taskNameInput.value;
    var datetime = _elements.datetime.value;
    var hasDeadline = _elements.hasDeadline.checked;
    var errors = [];
    if (!text.length) {
      errors.push('Enter task name!');
    }

    if (hasDeadline && !datetime.length) {
      errors.push('Enter task\'s deadline');
    }

    return errors;
  }

  function _mapTasksData() {
    var tasks = [];
    for (var i = 0; i < tasksList.length; i += 1) {
      var item = tasksList[i];
      tasks.push({
        text: item.text,
        status: item.status,
        deadline: item.deadline,
      });
    }
    return tasks;
  }

  function _updateLocalStorage() {
    localStorage.tasksList = JSON.stringify(_mapTasksData());
  }

  // function _findIndex(el) {
  //   var taskItemEl = el.closest('li');
  //   var index = Array.apply(null, _elements.tasksList.children).indexOf(taskItemEl);
  //   return index;
  // }

  function _findTaskData(el) {
    var taskItemEl = el.closest('li');
    var taskData;

    for (var i = 0; i < tasksList.length; i += 1) {
      taskData = tasksList[i];
      if (taskData.el === taskItemEl) {
        break;
      }
    }
    return taskData;
  }

  function _changeStatus(event) {
    var taskNameInputEl = event.target.nextSibling;
    var taskData = _findTaskData(taskNameInputEl);
    taskNameInputEl.classList.toggle(_classNames.TASK_ITEM_TEXT_DONE);
    taskData.status = taskData.status === 'not done' ? 'done' : 'not done';
    _updateLocalStorage();
  }

  function _removeTask(event) {
    // var index = _findIndex(event.target);
    var taskData = _findTaskData(event.target);
    var index = tasksList.indexOf(taskData);
    tasksList.splice(index, 1);
    // console.log(tasksList);

    _updateLocalStorage();
    // _createToast({
    //   type: 'success',
    //   title: 'Success',
    //   body: 'New task has been added!',
    // });
    // _renderTasks();
  }

  function _filterTasks(filterBy) {
    if (filterBy) {
      _currentFilter = filterBy;
    }

    _resetRenderedTasks();

    var oneDay = 24 * 60 * 60 * 1000;
    var oneWeek = oneDay * 7;
    var datetimeNow = new Date();
    var datetimeNowUnix = datetimeNow.getTime();
    var hoursInSeconds = datetimeNow.getHours() * 60 * 60;
    var minutesInSeconds = datetimeNow.getMinutes() * 60;
    var seconds = datetimeNow.getSeconds();
    var millisecondsFromStart = (hoursInSeconds + minutesInSeconds + seconds) * 1000
      + datetimeNow.getMilliseconds();
    var todayStartDateTime = datetimeNowUnix - millisecondsFromStart;

    var tasks = Array.apply(null, _elements.tasksList.children);

    switch (filterBy) {
      case 'Unfiltered': {
        break;
      }
      case 'Completed': {
        for (var i = 0; i < tasks.length; i += 1) {
          var taskData = tasksList[i];
          var currentTaskEl = tasks[i];

          if (taskData.status === 'not done') {
            currentTaskEl.remove();
          }
        }
        break;
      }
      case 'Not completed': {
        for (var i = 0; i < tasks.length; i += 1) {
          var taskData = tasksList[i];
          var currentTaskEl = tasks[i];

          if (taskData.status === 'done') {
            currentTaskEl.remove();
          }
        }
        break;
      }
      case 'Deadline: tomorrow': {
        for (var i = 0; i < tasksList.length; i += 1) {
          var taskData = tasksList[i];

          var hasDeadline = taskData.deadline;
          var alreadyPassed = taskData.deadline < datetimeNowUnix;
          var moreThanPeriod = (todayStartDateTime + oneDay) < taskData.deadline;

          if (!hasDeadline || alreadyPassed || moreThanPeriod) {
            taskData.el.remove();
          }
        }
        break;
      }
      case 'Deadline: week': {
        for (var i = 0; i < tasksList.length; i += 1) {
          var taskData = tasksList[i];

          var hasDeadline = taskData.deadline;
          var alreadyPassed = taskData.deadline < datetimeNowUnix;
          var moreThanPeriod = (todayStartDateTime + oneWeek) < taskData.deadline;

          if (!hasDeadline || alreadyPassed || moreThanPeriod) {
            taskData.el.remove();
          }
        }
        break;
      }
      default: {
        _filterTasks(_currentFilter);
        break;
      }
    }
  }

  function _renderTasks() {
    var i;
    var difference;
    var tasksDataLength = tasksList.length;
    var tasksListLength = _elements.tasksList.children.length;
    if (tasksDataLength < tasksListLength) {
      var children = Array.apply(null, _elements.tasksList.children);

      for (i = 0; i < children.length; i += 1) {
        var taskEl = children[i];
        var searchResult = null;
        for (var j = 0; j < tasksList.length; j += 1) {
          var taskData = tasksList[j];
          if (taskData.el === taskEl) {
            searchResult = taskData;
            break;
          }
        }

        if (!searchResult) {
          taskEl.remove();
        }
      }
    } else if (tasksDataLength > tasksListLength) {
      difference = tasksDataLength - tasksListLength;
      for (i = 0; i < difference; i += 1) {
        var taskData = tasksList[tasksListLength + i];
        var li = document.createElement('li');
        var div = document.createElement('div');
        var removeButton = document.createElement('button');
        var removeButtonIcon = document.createElement('i');
        var completeButton = document.createElement('input');
        var taskName = document.createElement('input');
        var badge = document.createElement('span');

        removeButton.className = 'col-auto btn btn-light checkbox-round remove-task-button' + (_isEditMode ? '' : ' d-none');
        removeButton.setAttribute('type', 'button');
        removeButton.onclick = function (event) {
          _removeTask(event);
          _filterTasks();
        };
        removeButtonIcon.className = 'fas fa-trash text-danger';
        removeButton.appendChild(removeButtonIcon);

        completeButton.className = 'col-auto checkbox-round';
        completeButton.setAttribute('type', 'checkbox');
        completeButton.checked = taskData.status !== 'not done';
        completeButton.onclick = function (event) {
          _changeStatus(event);
        };

        // <div class="input-group">
        //   <input type="text" class="form-control task-name-input" placeholder="New Task" aria-label="New Task"
        //     aria-describedby="addon-wrapping">
        // </div>

        taskName.className = 'col-auto flex-fill task-item__text ' + (completeButton.checked ? _classNames.TASK_ITEM_TEXT_DONE : '');
        taskName.setAttribute('type', 'text');
        taskName.setAttribute('value', taskData.text);
        taskName.disabled = !_isEditMode;
        taskName.onblur = function (event) {
          if (!event.target.value.length) {
            _removeTask(event);
            _filterTasks();
            // _renderTasks();
          }
        };

        document.documentElement.children = [];

        badge.className = 'col-auto badge bg-danger';
        badge.textContent = taskData.deadline ? new Date(taskData.deadline).toLocaleString() : '';

        div.className = 'row task-item align-items-center';
        div.append(removeButton, completeButton, taskName);
        if (taskData.deadline) {
          div.appendChild(badge);
        }

        li.className = 'list-group-item';
        li.appendChild(div);
        _elements.tasksList.appendChild(li);

        taskData.el = li; // save reference to avoid ['data-props'] binding when finding the elems
      }
    }
  }

  function _resetRenderedTasks() {
    var tasksCollection = _elements.tasksList.children;
    while (tasksCollection.length) {
      tasksCollection[0].remove();
    }
    _renderTasks();
  }

  function _addTask(newTask) {
    tasksList.push(newTask);
    _updateLocalStorage();
    utils.createToast({
      type: 'success',
      title: 'Success',
      body: 'New task has been added!',
    });
    _filterTasks();
    // _renderTasks();
    _elements.tasksListWrapper.scrollTo(0, _elements.tasksListWrapper.clientHeight);
  }

  function _initHandlers() {
    var handlers = {
      onTaskNameInputChange: function onTaskNameInputChange() {
        var text = _elements.taskNameInput.value;
        var isEmptyField = text.length === 0;
        var shouldChange = _elements.createNewTaskButton.disabled !== isEmptyField;
        if (shouldChange) {
          _elements.createNewTaskButton.disabled = !_elements.createNewTaskButton.disabled;
        }
      },
      createNewTaskHandler: function createNewTaskHandler() {
        var validateResult = _validateFields();
        if (validateResult.length) {
          for (var i = 0; i < validateResult.length; i += 1) {
            var errorMessage = validateResult[i];
            utils.createToast({
              type: 'error',
              title: 'Validation error',
              body: errorMessage,
            });
          }
          return;
        }
        var text = _elements.taskNameInput.value;
        var datetime = _elements.datetime.value;
        var hasDeadline = _elements.hasDeadline.checked;
        var newTask = {
          text: text,
          status: 'not done',
          deadline: hasDeadline ? (new Date(datetime)).getTime() : null,
        };

        _addTask(newTask);
        // console.log(tasksList);
      },
      editTaskHandler: function editTaskHandler() {
        function toggleEditMode() {
          _isEditMode = !_isEditMode;
          var tasksElements = document.getElementsByClassName('task-item');
          for (var i = 0; i < tasksElements.length; i += 1) {
            var taskEl = tasksElements[i];
            var removeButtonEl = taskEl.getElementsByClassName('remove-task-button')[0];
            var textEl = taskEl.getElementsByClassName('task-item__text')[0];
            removeButtonEl.classList.toggle('d-none');
            textEl.disabled = !textEl.disabled;
          }
        }

        toggleEditMode();
      },
      hasDeadlineHandler: function hasDeadlineHandler() {
        _elements.datetime.disabled = !_elements.hasDeadline.checked;
      },
      onTaskNameChange: function onTaskNameChange(event) {
        var textInputEl = event.target;
        var text = textInputEl.value;
        var taskData = _findTaskData(textInputEl);
        taskData.text = text;
        _updateLocalStorage();
      },
      onFilterDropdownClick: function onFilterDropdownClick(event) {
        var el = event.target;
        if (!el.classList.contains(_classNames.DROPDOWN_ITEM)) return;

        // Make visual changes
        var dropdownItems = _elements
          .filterButtonDropdown.getElementsByClassName(_classNames.DROPDOWN_ITEM);
        var ACTIVE_CLASSNAME = 'active';
        for (var i = 0; i < dropdownItems.length; i += 1) {
          dropdownItems[i].classList.remove(ACTIVE_CLASSNAME);
        }
        el.classList.add(ACTIVE_CLASSNAME);

        // Apply filtering logic
        _filterTasks(el.textContent);
      },
    };

    _elements.taskNameInput.addEventListener('keyup', handlers.onTaskNameInputChange);
    _elements.createNewTaskButton.addEventListener('click', handlers.createNewTaskHandler);
    _elements.editTaskButton.addEventListener('click', handlers.editTaskHandler);
    _elements.hasDeadline.addEventListener('change', handlers.hasDeadlineHandler);
    _elements.tasksList.addEventListener('keyup', handlers.onTaskNameChange);
    _elements.filterButtonDropdown.addEventListener('click', handlers.onFilterDropdownClick);
  }

  function _init() {
    _classNames = {
      TASK_NAME_INPUT: 'task-name-input',
      CREATE_NEW_TASK_BUTTON: 'create-new-task-button',
      EDIT_TASK_BUTTON: 'edit-task-button',
      DATETIME: 'datetime-picker',
      HAS_DEADLINE: 'has-deadline-option',
      TOASTS_CONTAINER: 'toast-container',
      TASKS_LIST_WRAPPER: 'tasks-list-wrapper',
      TASKS_LIST: 'tasks-list',
      TASK_ITEM_TEXT_DONE: 'task-item__text_done',
      FILTER_BUTTON_DROPDOWN: 'filter-button__dropdown',
      DROPDOWN_ITEM: 'dropdown-item',
    };

    _elements = {
      taskNameInput: document.getElementsByClassName(_classNames.TASK_NAME_INPUT)[0],
      createNewTaskButton: document.getElementsByClassName(_classNames.CREATE_NEW_TASK_BUTTON)[0],
      editTaskButton: document.getElementsByClassName(_classNames.EDIT_TASK_BUTTON)[0],
      datetime: document.getElementsByClassName(_classNames.DATETIME)[0],
      hasDeadline: document.getElementsByClassName(_classNames.HAS_DEADLINE)[0],
      toastsContainer: document.getElementsByClassName(_classNames.TOASTS_CONTAINER)[0],
      tasksListWrapper: document.getElementsByClassName(_classNames.TASKS_LIST_WRAPPER)[0],
      tasksList: document.getElementsByClassName(_classNames.TASKS_LIST)[0],
      filterButtonDropdown: document.getElementsByClassName(_classNames.FILTER_BUTTON_DROPDOWN)[0],
    };

    _initHandlers();
    _renderTasks();
  }

  _init();

  return {
    // b: b,
  };
}());
