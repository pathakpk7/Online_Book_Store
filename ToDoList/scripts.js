document.addEventListener("DOMContentLoaded", () => {
    const todoForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    todoForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addTask(taskInput.value);
        taskInput.value = '';
    });

    function addTask(task) {
        const li = document.createElement('li');
        const date = new Date().toLocaleDateString();

        li.innerHTML = `
            <span>${task}</span>
            <span class="date">${date}</span>
            <button onclick="toggleComplete(this)">✔</button>
            <button onclick="removeTask(this)">✖</button>
        `;

        taskList.appendChild(li);
    }
});

function toggleComplete(button) {
    const li = button.parentNode;
    li.classList.toggle('completed');
}

function removeTask(button) {
    const li = button.parentNode;
    li.remove();
}
