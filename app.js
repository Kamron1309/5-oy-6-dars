// API URL
const API_URL = "https://68a44697c123272fb9b20d66.mockapi.io/example/todo";

// Global variables
let items = [];
let currentEditId = null;

// DOM Elements
const itemsList = document.getElementById('items-list');
const itemsCount = document.getElementById('items-count');
const notification = document.getElementById('notification');
const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const noItemsMessage = document.getElementById('no-items-message');

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Show notification
function showNotification(message, isError = false) {
    notification.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-2"></i> ${message}`;

    if (isError) {
        notification.classList.add('bg-danger');
    } else {
        notification.classList.remove('bg-danger');
    }

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Loading state
function loading(isLoaded, element) {
    if (isLoaded) {
        element.innerHTML = '';
        Array.from({ length: 3 }).forEach(() => {
            let skeleton = document.createElement('div');
            skeleton.classList.add('skeleton');
            element.appendChild(skeleton);
        });
    } else {
        element.innerHTML = '';
    }
}

// Get time for task creation
function getTime() {
    let date = new Date();
    return `${date.getHours()}:${date.getMinutes()}`;
}

// Render items list
function renderItems() {
    itemsCount.textContent = items.length;

    if (items.length === 0) {
        noItemsMessage.classList.remove('hidden');
        return;
    }

    noItemsMessage.classList.add('hidden');
    itemsList.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card bg-white border-l-4 border-primary rounded-lg p-4 shadow-md';
        itemElement.innerHTML = `
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-lg font-semibold text-primary ${item.completed ? 'line-through text-gray-500' : ''}">${item.title || item.text}</div>
                        <div class="flex space-x-2">
                            <button class="${item.completed ? 'text-success hover:text-success/80' : 'text-gray-400 hover:text-gray-600'}" onclick="toggleItem(${item.id})">
                                <i class="fas ${item.completed ? 'fa-undo' : 'fa-check'}"></i>
                            </button>
                            <button class="text-primary hover:text-primary/80" onclick="prepareEditItem(${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-danger hover:text-danger/80" onclick="deleteItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-gray-600 mb-3 ${item.completed ? 'line-through text-gray-500' : ''}">${item.description || 'No description'}</div>
                    <div class="flex justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div>Created: ${item.createdAt ? formatDate(item.createdAt) : item.time}</div>
                        <div>Updated: ${item.updatedAt ? formatDate(item.updatedAt) : (item.editTime || item.time)}</div>
                    </div>
                `;

        itemsList.appendChild(itemElement);
    });
}

// Render tasks
function renderTasks() {
    taskList.innerHTML = '';

    if (items.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'text-center py-6 text-gray-500';
        emptyMessage.innerHTML = '<i class="fas fa-tasks text-3xl mb-2"></i><p>No tasks yet. Add some tasks!</p>';
        taskList.appendChild(emptyMessage);
        return;
    }

    items.forEach(item => {
        const taskElement = document.createElement('li');
        taskElement.className = 'flex items-center justify-between py-3 border-b border-gray-200';
        taskElement.innerHTML = `
                    <div class="flex items-center">
                        <input type="checkbox" id="task-${item.id}" ${item.completed ? 'checked' : ''} class="custom-checkbox task-checkbox">
                        <label for="task-${item.id}" class="cursor-pointer"></label>
                        <span class="task-text ${item.completed ? 'line-through text-gray-500' : ''}">${item.title || item.text}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-gray-500 hover:text-primary transition-colors" onclick="prepareEditItem(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-gray-500 hover:text-danger transition-colors" onclick="deleteItem(${item.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;

        taskList.appendChild(taskElement);
    });

    // Add event listeners to checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const id = this.id.split('-')[1];
            toggleItem(id);
        });
    });

    updateProgress();
}

// Update progress bar
function updateProgress() {
    const totalTasks = items.length;
    const completedTasks = items.filter(item => item.completed).length;
    const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${completedTasks}/${totalTasks} tasks completed`;
}

// Fetch items from API
async function fetchItems() {
    try {
        loading(true, itemsList);
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Failed to fetch items');
        }

        items = await response.json();
        renderItems();
        renderTasks();
        showNotification('Items fetched successfully!');
    } catch (error) {
        console.error('Error fetching items:', error);
        showNotification('Error fetching items: ' + error.message, true);
    }
}

// Create new item
async function createItem() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const completed = document.getElementById('completed').checked;

    if (!title) {
        showNotification('Title is required!', true);
        return;
    }

    try {
        const newItem = {
            text: title,
            description: description,
            completed: completed,
            time: getTime(),
            editTime: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });

        if (!response.ok) {
            throw new Error('Failed to create item');
        }

        const createdItem = await response.json();
        items.push(createdItem);
        renderItems();
        renderTasks();

        // Clear form
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('completed').checked = false;

        showNotification('Item created successfully!');
    } catch (error) {
        console.error('Error creating item:', error);
        showNotification('Error creating item: ' + error.message, true);
    }
}

// Prepare item for editing
function prepareEditItem(id) {
    const item = items.find(item => item.id == id);

    if (item) {
        document.getElementById('title').value = item.title || item.text;
        document.getElementById('description').value = item.description || '';
        document.getElementById('completed').checked = item.completed || false;

        currentEditId = id;
        showNotification('Item loaded for editing. Click "POST" to update.');
    }
}

// Update item
async function updateItem() {
    if (!currentEditId) {
        showNotification('Please select an item to edit first', true);
        return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const completed = document.getElementById('completed').checked;

    if (!title) {
        showNotification('Title is required!', true);
        return;
    }

    try {
        const updatedItem = {
            text: title,
            description: description,
            completed: completed,
            editTime: getTime(),
            updatedAt: new Date().toISOString()
        };

        const response = await fetch(`${API_URL}/${currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedItem)
        });

        if (!response.ok) {
            throw new Error('Failed to update item');
        }

        const updatedItemData = await response.json();

        // Update local items array
        const index = items.findIndex(item => item.id == currentEditId);
        if (index !== -1) {
            items[index] = updatedItemData;
        }

        renderItems();
        renderTasks();

        // Clear form and reset edit state
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('completed').checked = false;
        currentEditId = null;

        showNotification('Item updated successfully!');
    } catch (error) {
        console.error('Error updating item:', error);
        showNotification('Error updating item: ' + error.message, true);
    }
}

// Toggle item completion status
async function toggleItem(id) {
    try {
        const item = items.find(item => item.id == id);
        if (!item) return;

        const updatedItem = {
            ...item,
            completed: !item.completed,
            editTime: getTime(),
            updatedAt: new Date().toISOString()
        };

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedItem)
        });

        if (!response.ok) {
            throw new Error('Failed to update item status');
        }

        const updatedItemData = await response.json();

        // Update local items array
        const index = items.findIndex(item => item.id == id);
        if (index !== -1) {
            items[index] = updatedItemData;
        }

        renderItems();
        renderTasks();
        showNotification('Item status updated!');
    } catch (error) {
        console.error('Error toggling item:', error);
        showNotification('Error updating item status: ' + error.message, true);
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }

        // Remove from local items array
        items = items.filter(item => item.id != id);
        renderItems();
        renderTasks();
        showNotification('Item deleted successfully!');
    } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('Error deleting item: ' + error.message, true);
    }
}

// Add new task
document.getElementById('add-task-btn').addEventListener('click', async function () {
    const taskInput = document.getElementById('new-task-input');
    const taskText = taskInput.value.trim();

    if (taskText) {
        try {
            const newTask = {
                text: taskText,
                completed: false,
                time: getTime(),
                editTime: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            if (!response.ok) {
                throw new Error('Failed to add task');
            }

            const createdTask = await response.json();
            items.push(createdTask);
            renderItems();
            renderTasks();
            taskInput.value = '';
            showNotification('Task added successfully!');
        } catch (error) {
            console.error('Error adding task:', error);
            showNotification('Error adding task: ' + error.message, true);
        }
    }
});

// Allow adding task with Enter key
document.getElementById('new-task-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('add-task-btn').click();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    fetchItems();
});