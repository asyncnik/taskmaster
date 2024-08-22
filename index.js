const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoLists = document.getElementById('todo-lists');
let selected = document.getElementById("navigation").children[1];



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
    if(selected.dataset.action === 'home'){
        selected.classList.remove("highlight")
        selected = document.getElementById("navigation").children[1];
        selected.classList.add("highlight")
    }
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
            document.getElementsByClassName('alertbox')[0].style.display = 'block';
            setTimeout(()=>{
                document.getElementsByClassName('alertbox')[0].style.display = 'none';
            }, 3000)
            return;
        }
    }

    allTasks[date].splice(0, 0, task);
    renderTasks(allTasks)
}

async function renderTasks(allTasks) {
    persistTask()
    document.getElementById('todo-lists').innerHTML = "";
    let index = 0;
    let today = getCurrentDateString();
    if(selected.dataset.action === 'today'){
        allTasks = {[today]: allTasks[today]}
    }
    for(let key in allTasks){
        if(allTasks[key].filter(v=>v.isDeleted==false).length == 0){
            continue;
        }
        dateGroup = document.createElement('div');
        dateGroup.id = key;
        dateGroup.innerHTML = `<h2 data-date="${key}">${key}</h2><ul></ul>`;
        todoLists.insertBefore(dateGroup, todoLists.firstChild);

        for(let task of allTasks[key]){
            index++;
            if(task.isDeleted){
                continue;
            }
            const li = document.createElement('li');
            li.setAttribute("data-id", task.id);
            li.setAttribute("data-key", key)
            li.setAttribute('data-index', index);
            li.innerHTML = `
                <img onClick="openModal(event)" src='./menu.png' width="12px" class="pointer">
                <input type="checkbox" onChange="updateStatus(event)" class="complete-btn" ${task.status ? 'checked' : ''}>
                <span class="todo-text ${task.status ? 'completed' : ''}">${task.text}</span>
                <span class="delete-btn" onClick="deleteTask(event)">🗑️</span>
            `;
            const ul = dateGroup.querySelector('ul');
            await ul.appendChild(li)
        }
    }
    if(document.getElementById('todo-lists').childElementCount && selected.dataset.action !== 'home'){
        document.getElementsByClassName("tagline")[0].style.display = "none"
    } else {
        document.getElementsByClassName("tagline")[0].style.display = "block";
        document.getElementById('todo-lists').innerHTML = "";
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
            renderTasks(allTasks);
            if(v.status){
                // celebrate();
            }
        }
    })

    function celebrate(){
        let celebrateDiv = document.getElementsByClassName("celebration");
        celebrateDiv[0].style.display = 'block';
        celebrateDiv[1].style.display = 'block';
        setTimeout(()=>{
            celebrateDiv[0].style.display = 'none';
            celebrateDiv[1].style.display = 'none';
        }, 3000)
    }
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


function openModal(ev){
    document.getElementById("modal").style.display = "block";
    let liEl = ev.target.parentNode;
    let key = liEl.getAttribute("data-key")
    let id = liEl.getAttribute("data-id");
    console.log("all Tasks ", key, id);

    let task = allTasks[key].find(v=>v.id == id)

    document.getElementById("modal_task").innerHTML = task.text;
    document.getElementById("task-desc").value = task.desc ? task.desc : ""

    document.getElementById("modal_task").addEventListener("input", ()=>{
        task.text = document.getElementById("modal_task").innerHTML;
        renderTasks(allTasks);
    })


    document.getElementById("task-desc").addEventListener('input', (e)=>{
        task.desc = e.target.value;
        renderTasks(allTasks);
    })
}

function saveModal(){
    document.getElementById("modal").style.display = "block";
}

function cancelModal(ev){
    if(ev.target.getAttribute("id") == "modal" || ev.target.getAttribute("id") == "modal-container" ||  ev.target.getAttribute("id")=='btn-close'){
        document.getElementById("modal_task").innerHTML = "";
        document.getElementById("modal").style.display = "none";
        document.getElementById("modal_task").removeEventListener("input", ()=>{})
        document.getElementById("task-desc").removeEventListener("input", ()=>{})
        removeEventListeners('modal_task')
        removeEventListeners('task-desc')

    }
}

function removeEventListeners(id){
    var old_element = document.getElementById(id);
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
}

document.getElementById("navigation").addEventListener('click', (event)=>{
    let target = event.target;

    if(target.tagName != 'DIV' || !target.dataset.action){
        return;
    }
    selected.classList.remove('highlight');
    
    target.classList.add('highlight');
    selected = target;
    renderTasks(allTasks);
})

