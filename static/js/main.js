document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('.task-checkbox').forEach(box => {
        box.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const url = box.getAttribute('href');
            const taskItem = box.closest('.task-item');
            const isCompleted = taskItem.classList.contains('completed');

            await fetch(url);
            
            if (isCompleted) {
                taskItem.classList.remove('completed');
                box.classList.remove('checked');
                box.innerHTML = '';
            } else {
                taskItem.classList.add('completed');
                box.classList.add('checked');
                box.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2,7 5,10 12,3"></polyline></svg>`;
            }
            
            updateStats();
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!confirm('Удалить задачу?')) return;

            const url = btn.getAttribute('href');
            const taskItem = btn.closest('.task-item');

            await fetch(url);
            
            taskItem.classList.add('removing');
            
            setTimeout(() => {
                taskItem.remove();
                updateStats();
                checkEmptyState();
            }, 300);
        });
    });

    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('task-input');
            const title = input.value.trim();
            if (!title) return;

            const formData = new FormData(addForm);
            const response = await fetch('/add', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                input.value = ''; 
                
                const emptyState = document.getElementById('empty-state');
                if (emptyState) emptyState.remove();

                let taskList = document.getElementById('task-list');
                if (!taskList) {
                    taskList = document.createElement('ul');
                    taskList.className = 'task-list';
                    taskList.id = 'task-list';
                    document.querySelector('.container').appendChild(taskList);
                }

                const newLi = document.createElement('li');
                newLi.className = 'task-item';
                newLi.style.animation = 'none'; 
                
                const tempId = Date.now(); 
                
                newLi.innerHTML = `
                    <a href="/toggle/${tempId}" class="task-checkbox"></a>
                    <span class="task-text">${title}</span>
                    <span class="task-meta">#NEW</span>
                    <a href="/delete/${tempId}" class="delete-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </a>
                `;
                
                taskList.prepend(newLi);
                
                newLi.offsetHeight; 
                newLi.style.animation = ''; 

                attachEvents(newLi);
                updateStats();
            }
        });
    }

    function attachEvents(element) {
        const box = element.querySelector('.task-checkbox');
        const btn = element.querySelector('.delete-btn');

        box.addEventListener('click', async (e) => {
            e.preventDefault();
            const isCompleted = element.classList.contains('completed');
            await fetch(box.getAttribute('href'));
            if (isCompleted) {
                element.classList.remove('completed');
                box.classList.remove('checked');
                box.innerHTML = '';
            } else {
                element.classList.add('completed');
                box.classList.add('checked');
                box.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2,7 5,10 12,3"></polyline></svg>`;
            }
            updateStats();
        });

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Удалить задачу?')) return;
            await fetch(btn.getAttribute('href'));
            element.classList.add('removing');
            setTimeout(() => {
                element.remove();
                updateStats();
                checkEmptyState();
            }, 300);
        });
    }
});

function updateStats() {
    const total = document.querySelectorAll('.task-item').length;
    const completed = document.querySelectorAll('.task-item.completed').length;
    
    const values = document.querySelectorAll('.stat-value');
    if (values.length === 3) {
        values[0].textContent = total;
        values[1].textContent = completed;
        values[2].textContent = total - completed;
    }
}

function checkEmptyState() {
    const taskList = document.getElementById('task-list');
    if (taskList && taskList.children.length === 0) {
        taskList.remove();
        const main = document.querySelector('.container');
        const div = document.createElement('div');
        div.className = 'empty-state';
        div.id = 'empty-state';
        div.innerHTML = `<div class="empty-state-icon">∅</div><div class="empty-state-text">Пока что пусто. Добавьте первую задачу.</div>`;
        main.appendChild(div);
    }
}