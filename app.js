// Mock data store
let items = [
    { id: 1, title: 'Complete Project Proposal', description: 'Finish the project proposal and send to client', completed: true, createdAt: '2025-08-19T10:30:00', updatedAt: '2025-08-20T09:15:00' },
    { id: 2, title: 'Team Meeting', description: 'Weekly team meeting to discuss progress', completed: false, createdAt: '2025-08-18T14:00:00', updatedAt: '2025-08-18T14:00:00' },
    { id: 3, title: 'Code Review', description: 'Review pull requests from development team', completed: false, createdAt: '2025-08-17T16:45:00', updatedAt: '2025-08-19T11:20:00' }
];

// DOM Elements
const itemsList = document.getElementById('items-list');
const itemsCount = document.getElementById('items-count');
const notification = document.getElementById('notification');

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Show notification
function showNotification(message) {
    notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Render items list
function renderItems() {
    itemsCount.textContent = items.length;

    if (items.length === 0) {
        itemsList.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500"><i class="fas fa-inbox text-4xl mb-3"></i><p>No items found. Create your first item!</p></div>';
        return;
    }

    itemsList.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card bg-white border-l-4 border-primary rounded-lg p-4 shadow-md';
        itemElement.innerHTML = `
                    <div class="flex justify-between items-center mb-3">
                        <div class="text-lg font-semibold text-primary ${item.completed ? 'line-through text-gray-500' : ''}">${item.title}</div>
                        <div class="flex space-x-2">
                            <button class="${item.completed ? 'text-success hover:text-success/80' : 'text-gray-400 hover:text-gray-600'}" onclick="toggleItem(${item.id})">
                                <i class="fas ${item.completed ? 'fa-undo' : 'fa-check'}"></i>
                            </button>
                            <button class="text-primary hover:text-primary/80" onclick="editItem(${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="text-danger hover:text-danger/80" onclick="deleteItem(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-gray-600 mb-3 ${item.completed ? 'line-through text-gray-500' : ''}">${item.description}</div>
                    <div class="flex justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div>Created: ${formatDate(item.createdAt)}</div>
                        <div>Updated: ${formatDate(item.updatedAt)}</div>
                    </div>
                `;

        itemsList.appendChild(itemElement);
    });
}

// Create new item
function createItem() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const completed = document.getElementById('completed').checked;

    if (!title) {
        showNotification('Title is required!');
        return;
    }

    const newItem = {
        id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
        title,
        description,
        completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    items.push(newItem);
    renderItems();

    // Clear form
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('completed').checked = false;

    showNotification('Item created successfully!');
}

// Toggle item completion status
function toggleItem(id) {
    items = items.map(item => {
        if (item.id === id) {
            return {
                ...item,
                completed: !item.completed,
                updatedAt: new Date().toISOString()
            };
        }
        return item;
    });

    renderItems();
    showNotification('Item status updated!');
}

// Edit item
function editItem(id) {
    const item = items.find(item => item.id === id);

    if (item) {
        document.getElementById('title').value = item.title;
        document.getElementById('description').value = item.description;
        document.getElementById('completed').checked = item.completed;

        // Remove the item from the list (will be re-added with updated values)
        items = items.filter(i => i.id !== id);
        renderItems();

        showNotification('Item loaded for editing!');
    }
}

// Delete item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        items = items.filter(item => item.id !== id);
        renderItems();
        showNotification('Item deleted successfully!');
    }
}

// Mock API functions
function mockAPICall(action) {
    showNotification(`Mock ${action} request simulated`);

    // Simulate loading
    const currentContent = itemsList.innerHTML;
    itemsList.innerHTML = '<div class="col-span-2 text-center py-8 text-primary"><i class="fas fa-spinner animate-spin text-4xl mb-3"></i><p>Loading...</p></div>';

    setTimeout(() => {
        renderItems();
    }, 1000);
}

// Update progress bar
function updateProgress() {
    const totalTasks = document.querySelectorAll('.task-list li').length;
    const completedTasks = document.querySelectorAll('.task-list input:checked').length;
    const percentage = (completedTasks / totalTasks) * 100;

    document.querySelector('.progress-bar').style.width = `${percentage}%`;
    document.querySelector('.bg-gray-50 p:last-child').textContent =
        `${completedTasks}/${totalTasks} tasks completed`;
}

// Event listeners
document.getElementById('create-btn').addEventListener('click', createItem);

document.querySelectorAll('.api-btn').forEach((btn, index) => {
    const actions = ['GET', 'POST', 'PUT', 'DELETE'];
    btn.addEventListener('click', () => mockAPICall(actions[index]));
});

// Add event listeners to all checkboxes in task list
document.querySelectorAll('.task-list input').forEach(checkbox => {
    checkbox.addEventListener('change', updateProgress);
});

// Add event listeners to all delete buttons in task list
document.querySelectorAll('.task-list .fa-trash-alt').forEach(icon => {
    icon.closest('button').addEventListener('click', function () {
        this.closest('li').remove();
        updateProgress();
    });
});

// Add task functionality
document.querySelector('.bg-primary').addEventListener('click', function () {
    const taskInput = this.previousElementSibling;
    const taskText = taskInput.value.trim();

    if (taskText) {
        const taskList = document.getElementById('task-list');
        const newTask = document.createElement('li');
        newTask.className = 'flex items-center justify-between py-3 border-b border-gray-200';
        newTask.innerHTML = `
                    <div class="flex items-center">
                        <input type="checkbox" id="task-new" class="custom-checkbox">
                        <label for="task-new" class="cursor-pointer"></label>
                        <span class="task-text">${taskText}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-gray-500 hover:text-primary transition-colors"><i class="fas fa-edit"></i></button>
                        <button class="text-gray-500 hover:text-danger transition-colors"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;

        taskList.appendChild(newTask);
        taskInput.value = '';

        // Add event listener to the new checkbox
        const newCheckbox = newTask.querySelector('input');
        newCheckbox.addEventListener('change', updateProgress);

        // Add event listener to the delete button
        const deleteBtn = newTask.querySelector('.fa-trash-alt').closest('button');
        deleteBtn.addEventListener('click', function () {
            newTask.remove();
            updateProgress();
        });

        updateProgress();
    }
});

// Initialize
renderItems();
updateProgress();