const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoLists = document.getElementById('todo-lists');
let listDeleted = []

function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getCurrentDateString() {
    return formatDate(new Date());
}

function addTodo(text) {
    addTask(text)
}

addButton.addEventListener('click', function() {
    const todoText = todoInput.value.trim();
    if (todoText !== '') {
        addTodo(todoText);
        todoInput.value = '';
    }
});

todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const todoText = todoInput.value.trim();
        if (todoText !== '') {
            addTodo(todoText);
            todoInput.value = '';
        }
    }
});


let allTasks;
function onLoad(){
    allTasks = localStorage.getItem('allTasks')
    if(allTasks){
        allTasks = JSON.parse(allTasks);
        renderTasks(allTasks)
    } else {
        allTasks = {}
    }
}

onLoad()

function addTask(text) {
    const timestamp_id = new Date().getTime();
    const date = getCurrentDateString();
    if(!allTasks[date]){
        allTasks[date] = [];
    }
    let task = {
        id: timestamp_id,
        text: text,
        status: false,
        isDeleted: false,
        taskGroup: null,
    }

    let isFind = allTasks[date].find(v=>v.text==text)
    if(isFind){
        if(isFind.isDeleted === false){
            alert("Task already exists")
            return;
        }
    }

    allTasks[date].splice(0, 0, task);
    renderTasks(allTasks)
}

function renderTasks(allTasks) {
    persistTask()
    document.getElementById('todo-lists').innerHTML = "";
    for(let key in allTasks){
        if(allTasks[key].map(v=>v.isDeleted==false).length == 0){
            return;
        }
        dateGroup = document.createElement('div');
        dateGroup.id = key;
        dateGroup.innerHTML = `<h2 data-date="${key}">${key}</h2><ul></ul>`;
        todoLists.insertBefore(dateGroup, todoLists.firstChild);

        for(let task of allTasks[key]){
            if(task.isDeleted){
                continue;
            }
            const li = document.createElement('li');
            li.setAttribute("data-id", task.id);
            li.innerHTML = `
                <input type="checkbox" onChange="updateStatus(event)" class="complete-btn" ${task.status ? 'checked' : ''}>
                <span class="todo-text ${task.status ? 'completed' : ''}">${task.text}</span>
                <span class="delete-btn" onClick="deleteTask(event)">🗑️</span>
            `;
            const ul = dateGroup.querySelector('ul');
            ul.appendChild(li)
        }
    }
}


function deleteTask(e){
    let targetEl = e.target
    let id = targetEl.parentNode.getAttribute("data-id")
    let dateId = targetEl.parentNode.parentNode.parentNode.firstChild.getAttribute('data-date');

    allTasks[dateId].forEach((v)=>{
        if(v.id == id){
            v.isDeleted = true;
            listDeleted.push({
                dateId: dateId,
                taskId: id,
            })
            renderTasks(allTasks)
        }
    })
}

function updateStatus(e){
    let targetEl = e.target;
    let id = targetEl.parentNode.getAttribute("data-id")
    let dateId = targetEl.parentNode.parentNode.parentNode.firstChild.getAttribute("data-date")

    allTasks[dateId].forEach((v)=>{
        if(v.id == id){
            v.status = !v.status;
            renderTasks(allTasks)
        }
    })
}

function persistTask(){
    localStorage.setItem("allTasks", JSON.stringify(allTasks))
}

function Undo(){
    let lastDeleted = listDeleted.pop();
    if(!lastDeleted){
        return;
    }
    if(!lastDeleted.dateId){
        return;
    }
    if(!lastDeleted.taskId){
        return;
    }

    let res = allTasks[lastDeleted.dateId].find(v=>v.id==lastDeleted.taskId);
    if(!res){
        return;
    }
    res.isDeleted = false;

    renderTasks(allTasks)
}

let keys = {}
window.addEventListener("keydown", (ev)=>{
    keys[ev.key] = true;
})

window.addEventListener('keyup', (ev)=>{
    if(keys['Control'] && (keys['z'] || keys['Z'])){
        Undo();
    }
    keys = {}
})

