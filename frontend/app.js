// Меняем URL на те, которые есть в бэкенде
//const API_URL = 'http://localhost:8080';
const API_URL = 'http://localhost:8080/api';



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

function cancelEdit(rowNum, oldName, oldDesc, itemId)
{
    document.getElementById(`${rowNum}_name`).textContent = oldName;
    document.getElementById(`${rowNum}_desc`).textContent = oldDesc;
    document.getElementById(`${rowNum}_actn`).innerHTML = `
        <button class="edit-btn" onclick="editItem(${itemId}, ${rowNum})">✏️</button>
        <button class="delt-btn" onclick="delItem(${itemId})">🗑️</button>`;
}


function handleKeyPress(event, rowNum, oldName, oldDesc, itemId)
{
    if (event.key === 'Enter')
    {
        event.preventDefault();
        saveRow(rowNum);
    }
    else if (event.key === 'Escape')
    {
        event.preventDefault();
        cancelEdit(rowNum, oldName, oldDesc, itemId);
    }
}

function editItem(itemId, rowNum)
{
   // alert(`StartEdit ${itemId} in row=${rowNum}`);

    const nameCell = document.getElementById(`${rowNum}_name`);
    const descCell = document.getElementById(`${rowNum}_desc`);
    const actnCell = document.getElementById(`${rowNum}_actn`);
    
    // Сохраняем старые значения
    const oldName = nameCell.textContent;
    const oldDesc = descCell.textContent;
    const oldActn = actnCell.innerHTML;
    
    // Заменяем на input-поля
    nameCell.innerHTML = `<input type="text"
                            id="edit_name${rowNum}"
                            value="${oldName}"
                            onkeypress="handleKeyPress(event, ${rowNum}, '${oldName}', '${oldDesc}', '${itemId}')">`;
    descCell.innerHTML = `<input type="text"
                            id="edit_desc${rowNum}"
                            value="${oldDesc}"
                            onkeypress="handleKeyPress(event, ${rowNum}, '${oldName}', '${oldDesc}', '${itemId}')">`;

   // Добавляем кнопку сохранения
   //actnCell.innerHTML = '';
   actnCell.innerHTML = `
        <button onclick="saveRow(${rowNum}, '${itemId}')">💾</button>
        <button onclick="cancelEdit(${rowNum}, '${oldName}', '${oldDesc}', '${itemId}')">❌</button>`;
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
                                    <button class="edit-btn" onclick="editItem(${item.id}, ${rowNum})">✏️</button>
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