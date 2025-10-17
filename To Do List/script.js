
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const tasksContainer = document.getElementById('tasks-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const totalTasksSpan = document.getElementById('total-tasks');
    const completedTasksSpan = document.getElementById('completed-tasks');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let editingTaskId = null;

    // Initialize the app
    function init() {
        renderTasks();
        updateStats();

        // Event Listeners
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                renderTasks();
            });
        });
    }

    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();

        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateStats();

        // Clear input
        taskInput.value = '';
        taskInput.focus();
    }

    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }

    // Toggle task completion
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });

        saveTasks();
        renderTasks();
        updateStats();
    }

    // Edit a task
    function editTask(id) {
        editingTaskId = id;
        renderTasks();
    }

    // Save edited task
    function saveEditedTask(id, newText) {
        if (newText.trim() === '') {
            alert('Task cannot be empty!');
            return;
        }

        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText.trim() };
            }
            return task;
        });

        editingTaskId = null;
        saveTasks();
        renderTasks();
    }

    // Cancel editing
    function cancelEdit() {
        editingTaskId = null;
        renderTasks();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Render tasks based on current filter
    function renderTasks() {
        // Filter tasks
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        // Clear container
        tasksContainer.innerHTML = '';

        // Show empty state if no tasks
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>No tasks found. Add a new task to get started!</p>
                    `;
            tasksContainer.appendChild(emptyState);
            return;
        }

        // Render tasks
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';

            if (task.id === editingTaskId) {
                // Edit mode
                taskElement.innerHTML = `
                            <input type="text" class="edit-input" value="${task.text}">
                            <button class="save-btn">Save</button>
                            <button class="cancel-btn">Cancel</button>
                        `;

                const editInput = taskElement.querySelector('.edit-input');
                const saveBtn = taskElement.querySelector('.save-btn');
                const cancelBtn = taskElement.querySelector('.cancel-btn');

                saveBtn.addEventListener('click', () => saveEditedTask(task.id, editInput.value));
                cancelBtn.addEventListener('click', cancelEdit);
                editInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEditedTask(task.id, editInput.value);
                    }
                });

                editInput.focus();
            } else {
                // Normal view
                taskElement.innerHTML = `
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                            <div class="task-actions">
                                <button class="edit-btn">✏️</button>
                                <button class="delete-btn">🗑️</button>
                            </div>
                        `;

                const checkbox = taskElement.querySelector('.task-checkbox');
                const editBtn = taskElement.querySelector('.edit-btn');
                const deleteBtn = taskElement.querySelector('.delete-btn');

                checkbox.addEventListener('change', () => toggleTask(task.id));
                editBtn.addEventListener('click', () => editTask(task.id));
                deleteBtn.addEventListener('click', () => deleteTask(task.id));
            }

            tasksContainer.appendChild(taskElement);
        });
    }

    // Update statistics
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        totalTasksSpan.textContent = `Total: ${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;
        completedTasksSpan.textContent = `Completed: ${completedTasks}`;
    }

    // Initialize the app
    init();
});
