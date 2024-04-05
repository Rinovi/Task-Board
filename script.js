// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Create a function to generate a unique task id
function generateTaskId() {
    const newId = nextId;
    nextId++;
    localStorage.setItem('nextId', nextId);
    return newId;
}

// Create a function to create a task card
function createTaskCard(task) {
    const card = document.createElement('div');
    card.dataset.taskId = task.id
    card.classList.add('card', 'mb-3');
    let color = ""
    const date1 = dayjs()
    const date2 = dayjs(task.dueDate)
    const diff =  date2.diff(date1, 'day', true)
    if (diff < 3 && diff > 0) {
        color = "upcoming"
    }
    else if (diff < 0 ) {
        color = "late"
    }
    card.innerHTML = `
        <div class="card-body ${color}">
            <h5 class="card-title">${task.title}</h5>
            <p class="card-text">${task.description}</p>
            <p class="card-text">Due Date: ${task.dueDate}</p>
            <button class="btn btn-danger delete-task" data-task-id="${task.id}">Delete</button>
        </div>
    `;
    return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    const todoContainer = document.getElementById('todo-cards');
    const inProgressContainer = document.getElementById('in-progress-cards');
    const doneContainer = document.getElementById('done-cards');

    todoContainer.innerHTML = '';
    inProgressContainer.innerHTML = '';
    doneContainer.innerHTML = '';

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);

        if (task.status === 'To Do') {
            todoContainer.appendChild(taskCard);
        } else if (task.status === 'In Progress') {
            inProgressContainer.appendChild(taskCard);
        } else if (task.status === 'Done') {
            taskCard.children[0].classList.remove("late")
            taskCard.children[0].classList.remove("upcoming")
            doneContainer.appendChild(taskCard);
        }

        $(taskCard).draggable({
            revert: 'invalid',
            cursor: 'move',
            zIndex: 1000,
        });
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const taskTitle = document.getElementById('taskTitle').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskDueDate = document.getElementById('taskDueDate').value;

    console.log('Task Title:', taskTitle);
    console.log('Task Description:', taskDescription);
    console.log('Task Due Date:', taskDueDate);

    const newTask = {
        id: generateTaskId(),
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        status: 'To Do'
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    localStorage.setItem('nextId', nextId);

    renderTaskList();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = event.target.dataset.taskId;

    const taskIndex = taskList.findIndex(task => task.id === parseInt(taskId));

    if (taskIndex !== -1) {
        taskList.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable[0].dataset.taskId;
    const targetLane = event.target.id.toLowerCase();
    const taskIndex = taskList.findIndex(task => task.id == taskId);
    if (taskIndex !== -1) {
        if (targetLane === 'to-do') {
            taskList[taskIndex].status = 'To Do';
        } else if (targetLane === 'in-progress') {
            taskList[taskIndex].status = 'In Progress';
        } else if (targetLane === 'done') {
            taskList[taskIndex].status = 'Done';
        }

        localStorage.setItem('tasks', JSON.stringify(taskList));

        renderTaskList();
    }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and initialize the date picker
$(document).ready(function () {
    renderTaskList();

    $('#addTaskForm').submit(function (event) {
        console.log('Form Submitted'); // Check if this log appears in the console
        handleAddTask(event);
    });

    $(document).on('click', '.delete-task', handleDeleteTask);

    $('.lane').droppable({
        drop: handleDrop,
        // accept: ".card-body"
    });

    $('#taskDueDate').datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd'
    });
});
