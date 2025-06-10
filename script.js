const urlInput = document.getElementById('urlInput');
const loadDataBtn = document.getElementById('loadDataBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');
const questionBlock = document.getElementById('questionBlock');
const showTableBtn = document.getElementById('showTableBtn');
const hideTableBtn = document.getElementById('hideTableBtn');
const tableOutputContainer = document.getElementById('tableOutputContainer');
const dataTable = document.getElementById('dataTable');
const tableHeaderRow = document.getElementById('tableHeaderRow');
const tableBody = document.getElementById('tableBody');
const resetSortBtn = document.getElementById('resetSortBtn');

let loadedData = [];
let currentSortColumn = null;
let currentSortDirection = 'asc';

const defaultHeaders = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'NAME' },
    { key: 'username', title: 'USERNAME' },
    { key: 'email', title: 'EMAIL' }
];

function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `message ${type}`;
    statusMessage.classList.remove('hidden');
}

function clearMessage() {
    statusMessage.textContent = '';
    statusMessage.className = 'message hidden';
}

function resetInterface() {
    urlInput.value = 'https://jsonplaceholder.typicode.com/users';
    loadDataBtn.disabled = false;
    clearBtn.disabled = true;
    clearMessage();
    questionBlock.classList.add('hidden');
    tableOutputContainer.classList.add('hidden');
    tableBody.innerHTML = '';
    tableHeaderRow.innerHTML = '';
    loadedData = [];
    currentSortColumn = null;
    currentSortDirection = 'asc';
    resetSortBtn.classList.remove('active-sort');
}

async function loadData() {
    const url = urlInput.value.trim();
    if (!url) {
        showMessage('Будь ласка, введіть URL.', 'error');
        return;
    }

    loadDataBtn.disabled = true;
    clearBtn.disabled = false;
    clearMessage();
    questionBlock.classList.add('hidden');
    tableOutputContainer.classList.add('hidden');

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Помилка HTTP: ${response.status} - ${response.statusText || errorText}`);
        }
        loadedData = await response.json();

        showMessage(`Дані формату JSON успішно завантажено. Кількість записів рівна ${loadedData.length}.`, 'success');
        questionBlock.classList.remove('hidden');
    } catch (error) {
        showMessage(`Помилка завантаження даних: ${error.message}`, 'error');
        loadDataBtn.disabled = false;
        clearBtn.disabled = false;
    }
}

function renderTableHeader(headers) {
    tableHeaderRow.innerHTML = '';
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.title;
        th.dataset.key = header.key;

        const sortArrows = document.createElement('span');
        sortArrows.className = 'sort-arrows';
        sortArrows.innerHTML = `
            <span class="arrow asc ${currentSortColumn === header.key && currentSortDirection === 'asc' ? 'active' : ''}">▲</span>
            <span class="arrow desc ${currentSortColumn === header.key && currentSortDirection === 'desc' ? 'active' : ''}">▼</span>
        `;
        th.appendChild(sortArrows);

        if (currentSortColumn === header.key) {
            th.classList.add(`sorted-${currentSortDirection}`);
        }

        th.addEventListener('click', () => sortTable(header.key));
        tableHeaderRow.appendChild(th);
    });
}

function renderTableBody(data, headers) {
    tableBody.innerHTML = '';
    if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = headers.length;
        td.textContent = 'Немає даних для відображення.';
        td.className = 'text-center text-gray-500 py-4';
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            let value = item[header.key];
            if (typeof value === 'object' && value !== null) {
                if (header.key === 'address') {
                    value = item.address ? `${item.address.city}, ${item.address.street}` : '';
                } else if (header.key === 'company') {
                    value = item.company ? item.company.name : '';
                } else {
                    value = JSON.stringify(value);
                }
            }
            td.textContent = value;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function sortTable(columnKey) {
    if (currentSortColumn === columnKey) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = columnKey;
        currentSortDirection = 'asc';
    }

    const sortedData = [...loadedData].sort((a, b) => {
        let valA = a[columnKey];
        let valB = b[columnKey];

        if (columnKey === 'address') {
            valA = a.address ? a.address.city : '';
            valB = b.address ? b.address.city : '';
        } else if (columnKey === 'company') {
            valA = a.company ? a.company.name : '';
            valB = b.company ? b.company.name : '';
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) {
            return currentSortDirection === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
            return currentSortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    renderTableHeader(defaultHeaders);
    renderTableBody(sortedData, defaultHeaders);
    resetSortBtn.classList.add('active-sort');
}

function resetSorting() {
    currentSortColumn = null;
    currentSortDirection = 'asc';
    renderTableHeader(defaultHeaders);
    renderTableBody(loadedData, defaultHeaders);
    resetSortBtn.classList.remove('active-sort');
}

loadDataBtn.addEventListener('click', loadData);

clearBtn.addEventListener('click', () => {
    resetInterface();
});

showTableBtn.addEventListener('click', () => {
    questionBlock.classList.add('hidden');
    tableOutputContainer.classList.remove('hidden');
    renderTableHeader(defaultHeaders);
    renderTableBody(loadedData, defaultHeaders);
    resetSortBtn.classList.remove('active-sort');
});

hideTableBtn.addEventListener('click', () => {
    resetInterface();
});

resetSortBtn.addEventListener('click', resetSorting);

document.addEventListener('DOMContentLoaded', () => {
    resetInterface();
});
