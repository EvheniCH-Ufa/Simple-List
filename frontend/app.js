const API_URL = 'http://localhost:8080/api';

/*
Логика редактирования:
создаем глоб переменную + структура (поля + номер строки) 
- в редактировании (editItem) заходим, сейвим все элементы, изменяем номер строки в из_едитинг;
- завершаем редактор, из_едитинг = -1;
- если начинаем следующий, то проверяем сначала редактируется что-то или нет:
--- если не редактируется, то начинаем редактирование
--- если редактируется, то проверяем есть ли изменения (да/нет):
------ да: сохранить? да/нет - сохраняем и заходим в редактор новой строки
------ нет: заходим в редактор новой строки
*/ 

let editRow = -1;  // -1 - Not editing
let oldValues = {
    rowNum          : -1,
    id              : -1,
    name            : "",
    description     : ""
}

async function delItem(itemId)
{
    if (!confirm(`Вы действительно хотите удалить запись с Id=${itemId}?`))
    {
        return;
    }

    console.log(`Try Delete id=${itemId}`);

    //curl -X DELETE http://localhost:8080/api/delete/11
    try {
        const response = await fetch(`${API_URL}/delete/${itemId}`,
                                        {
                                        method: 'DELETE'
                                        });

        const result = await response.json();
        
        if (response.ok)
        {
            if (result.status == "True" || result.status == true)
            {
                alert(`Запись c Id=${itemId} успешно удалена!`);
                loadData(); // Reload the list
            }
            else
            {
                alert(`Не удалось удалить: ${result.message || "Неизвестная ошибка"}`);
            }
        }
        else
        {
            alert(`Не удалось удалить, сервер вернул ошибку: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}


function checkEdit()
{
    return (editRow >= 0);
}

async function saveItem()
{
        /* */
    const newName = document.getElementById(`${editRow}_name`).textContent;
    if (newName != oldValues.name)
    
    //= oldName;
    document.getElementById(`${rowNum}_desc`).textContent = oldDesc;
    document.getElementById(`${rowNum}_actn`).innerHTML = `
        <button class="edit-btn" onclick="editItem(${itemId}, ${rowNum})">✏️</button>
        <button class="delt-btn" onclick="delItem(${itemId})">🗑️</button>`;


    // в конце обязательно говорим, что уже не редачим
    editRow = -1;
}

function cancelEdit()
{
    document.getElementById(`${rowNum}_name`).textContent = oldValues.name;
    document.getElementById(`${rowNum}_desc`).textContent = oldValues.description;
    document.getElementById(`${rowNum}_actn`).innerHTML = `
        <button class="edit-btn" onclick="editItem(${rowNum})">✏️</button>
        <button class="delt-btn" onclick="delItem(${oldValues.id})">🗑️</button>`;

    editRow = -1;
}


function handleKeyPress(event, rowNum)
{
    if (event.key === 'Enter')
    {
        event.preventDefault();
        saveItem();
    }
    else if (event.key === 'Escape')
    {
        event.preventDefault();
        cancelEdit();
    }
}

function editItem(rowNum)
{
    // alert(`StartEdit ${itemId} in row=${rowNum}`);
    if (checkEdit())
    {
        if (confirm(`Редактируется строка ${editRow},\n
                     Id=${oldValues.id},\n
                     Наименование ${oldValues.name}.\n
                     Сохранить?`))
        {
            newName = document.getElementById(`edit_name${editRow}`).value; 
            
            if (newName === "")
            {
                alert("Наименование не должно быть пустым!");
                return;
            }
            saveItem();
        }
        else
        {
            cancelEdit();
        }
    }

    const nameCell = document.getElementById(`${rowNum}_name`);
    const descCell = document.getElementById(`${rowNum}_desc`);
    const actnCell = document.getElementById(`${rowNum}_actn`);
    
    // Сохраняем старые значения
    const oldName = nameCell.textContent;
    const oldDesc = descCell.textContent;
    
    // Заменяем на input-поля
    nameCell.innerHTML = `<input type="text"
                            id="edit_name${rowNum}"
                            value="${oldName}"
                            placeholder="Имя не должно быть пустым!"
                            onkeypress="handleKeyPress(event, ${rowNum})">`;
    descCell.innerHTML = `<input type="text"
                            id="edit_desc${rowNum}"
                            placeholder="Описание..."
                            value="${oldDesc}"
                            onkeypress="handleKeyPress(event, ${rowNum})">`;

   // Добавляем кнопку сохранения
   actnCell.innerHTML = `
        <button onclick="saveRow(${rowNum}, '${itemId}')">💾</button>
        <button onclick="cancelEdit(${rowNum})">❌</button>`;
}

async function loadData()
{
    try {
        const response = await fetch(`${API_URL}/data`);
        const data = await response.json();

        console.log(`response.ok=${response.ok}`);
        console.log('Received data:', data);
        
        const container = document.getElementById('itemsList');

        if (Array.isArray(data))
        {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                        <th>Id</th>
                        <th>Наименование</th>
                        <th>Описание</th>
                        <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                <td><strong>${item.id}</td>
                                <td><strong>${item.name}</td>
                                <td><strong>${item.description}</td>
                                <td><strong>${item.id}</td>
                                `).join('')}
                            </tr>
                    </tbody>
                </table>`;
        }
        else if (data.items)
        {
            let rowNum = 0;
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                        <th>Id</th>
                        <th>Наименование</th>
                        <th>Описание</th>
                        <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.id}</td>
                                <td id="${++rowNum}_name">${item.name}</td>
                                <td id="${  rowNum}_desc">${item.description}</td>
                                <td id="${  rowNum}_actn">
                                    <button class="edit-btn" onclick="editItem(${rowNum})">✏️</button>
                                    <button class="delt-btn" onclick="delItem(${item.id})">🗑️</button>
                                </td>
                                `).join('')}
                            </tr>
                    </tbody>
                </table>`;
        }
        else
        {
            container.innerHTML = JSON.stringify(data, null, 2);
        }
    }
    catch (error)
    {
        console.error('Error:', error);
        document.getElementById('data-container').innerHTML = 
            `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

async function addItem() {
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-desc').value;

    //alert('addItem');
    // Ждем 1 секунду
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!name) {
        alert('Please enter item name');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name: name,  
                description: description 
            })
        });
        
        if (response.ok) {
            document.getElementById('item-name').value = '';
            document.getElementById('item-desc').value = '';
            loadData(); // Reload the list
        } else {
            alert('Failed to add item');
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadData);