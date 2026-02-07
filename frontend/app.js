// Меняем URL на те, которые есть в бэкенде
//const API_URL = 'http://localhost:8080';
const API_URL = 'http://localhost:8080/api';



async function delItem(itemId) {
    if (!confirm(`Вы действительно хотите удалить запись с Id=${itemId}?`))
    {
        return;
    }

 //   alert("Try Delete " + itemId);

    //curl -X DELETE http://localhost:8080/api/delete/11
    try {
        const response = await fetch(`${API_URL}/delete/${itemId}`, {
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

function editItem(itemId) {
    alert("Edit " + itemId);
}


async function loadData() {
    try {
        const response = await fetch(`${API_URL}/data`);
        const data = await response.json();

        console.log(`response.ok=${response.ok}`);
        console.log('Received data:', data);
        
        const container = document.getElementById('itemsList');
        // Обрабатывай data в зависимости от структуры ответа
        // data может быть массивом или объектом с items
 
 /*       ` <table>
  <thead>
    <tr>
      <th>Заголовок 1</th>
      <th>Заголовок 2</th>
      <th>Заголовок 3</th>
      <th>Заголовок 4</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Данные 1</td>
      <td>Данные 2</td>
      <td>Данные 3</td>
      <td>Данные 4</td>
    </tr>
  </tbody>
</table>`
 */


 /*
        if (Array.isArray(data)) {
            container.innerHTML = `
                <h3>Items (${data.length}):</h3>
                <ul>
                    ${data.map(item => `
                        <li><strong>${item.name}</strong></li>
                    `).join('')}
                </ul>`;*/

        if (Array.isArray(data)) {
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
        } else if (data.items) {
           /* container.innerHTML = `
                <h3>Items (${data.items.length*7}):</h3>
                <ul>
                    ${data.items.map(item => `
                        <li><strong>${item.text || item.name}</strong></li>
                    `).join('')}
                </ul>`;*/
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
                                <td>${item.name}</td>
                                <td>${item.description}</td>
                                <td>
                                    <button class="edit-btn" onclick="editItem(${item.id})">✏️</button>
                                    <button class="delete-btn" onclick="delItem(${item.id})">🗑️</button>
                                </td>
                                `).join('')}
                            </tr>
                    </tbody>
                </table>`;
        } else {
            container.innerHTML = JSON.stringify(data, null, 2);
        }
    } catch (error) {
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