let orderTemplate = document.querySelector('#order-template');
let searchRoute;
let searchGuide;
let mainOrder;
let titles = {
    show: 'Просмотр заявки',
    edit: 'Редактирование',
};

let titlesBtn = {
    show: 'ОК',
    edit: 'Сохранить',
};


// заявки
function deleteBtnModalHandler(event) {
    let orderItem = event.target.closest('.col');
    let form = document.querySelector('#del-order').querySelector('form');
    form.elements['order-id'].value = orderItem.id;
}


//элемент карточки
function createOrderListItemElement(order) {
    let itemElement = orderTemplate.content.firstElementChild.cloneNode(true);
    itemElement.id = order.id;
    let routeNameApi = searchRoute.find(item => item.id == order.route_id);
    let nameRoute = itemElement.querySelector('.item-col-name');
    nameRoute.innerHTML = routeNameApi.name;
    let date = itemElement.querySelector('.item-col-date');
    date.innerHTML = order.date;
    let price = itemElement.querySelector('.item-col-price');
    price.innerHTML = order.price + ' руб.';
    let itemDel = itemElement.querySelector('.bi-trash3');
    itemDel.addEventListener('click', deleteBtnModalHandler);

    return itemElement;
}
// 
async function downloadRoute() {
    let url = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru');
    url.pathname = '/api/routes';
    url.search = 'api_key=83d0d1af-0b9b-484e-bfc0-a2e63b7a456a';
    let response = await fetch(url);
    searchRoute = await response.json();
}

function renderOrders(orders, page) {
    let orderElement = document.querySelector('.elements');
    let bodyOrder = orderElement.querySelector('.row');
    bodyOrder.innerHTML = '';
    let notesOnPage = 5;
    let start = (page - 1) * notesOnPage;
    let end = Math.min(orders.length, start + notesOnPage);
    for (let i = start; i < end; i++) {
        bodyOrder.append(createOrderListItemElement(orders[i]));
    }
}

function paginationItemHandler(event) {
    renderOrders(mainOrder, event.target.innerText);
}

function createPaginationItem(orders) {
    let countOfItems = Math.ceil(orders.length / 5);
    let items = [];
    let ulPages = document.querySelector('.pagination-orders');
    ulPages.innerHTML = '';
    for (let i = 1; i <= countOfItems; i++) {
        let pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        let aHrefPage = document.createElement('a');
        aHrefPage.classList.add('page-link');
        aHrefPage.innerHTML = i;
        pageItem.append(aHrefPage);
        ulPages.appendChild(pageItem);
        items.push(pageItem);
        pageItem.onclick = paginationItemHandler;
    }
    return items;
}


function downloadOrders() {
    let ordersTable = document.querySelector('.elements');
    let url = new URL(ordersTable.dataset.url);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        mainOrder = this.response;
        renderOrders(this.response, 1);
        createPaginationItem(this.response);
    };
    xhr.send();
}

async function deleteOrder(order_id) {
    let deleteOrderBtn = document.querySelector('.delete-order-btn');
    let url = new URL(deleteOrderBtn.dataset.url);
    url.pathname = '/api/orders/' + order_id;
    url.search = 'api_key=83d0d1af-0b9b-484e-bfc0-a2e63b7a456a';
    // let repsonseFromServer = await fetch(url, {method: 'DELETE'});
    // let deletedId = await repsonseFromServer.json();
    // return deletedId;
    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        downloadOrders(mainOrder);
    };
    xhr.send();
}

function deleteBtnHandler(event) {
    let form = event.target.closest('.modal').querySelector('form');
    let orderId = form.elements['order-id'].value;
    deleteOrder(orderId);
}

async function downloadGuides(route_id) {
    let url = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru');
    url.pathname = '/api/routes/' + route_id + '/guides';
    url.search = 'api_key=83d0d1af-0b9b-484e-bfc0-a2e63b7a456a';
    let response = await fetch(url);
    searchGuide = await response.json();
}

async function actionModalHandler(event) {
    let url = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru');
    url.pathname = '/api/orders';
    url.search = 'api_key=83d0d1af-0b9b-484e-bfc0-a2e63b7a456a';
    //узнаём, какое действие сейчас выполняет пользователь
    let action = event.relatedTarget.dataset.action;
    let modalWindow = event.target.closest('.modal');
    let form = event.target.querySelector('form');
    form.elements['action'].value = action;
    event.target.querySelector('.modal-title').innerHTML = titles[action];
    event.target.querySelector('.btn-action').innerHTML = titlesBtn[action];

    if (action != 'show') {
        form.elements['excursion-date'].removeAttribute('disabled');
        form.elements['excursion-time'].removeAttribute('disabled');
        form.elements['excursion-duration'].removeAttribute('disabled');
        form.elements['count-people'].removeAttribute('disabled');
        form.elements['option-quick-arrival'].removeAttribute('disabled');
        form.elements['option-presents'].removeAttribute('disabled');
    } else {
        form.elements['excursion-date'].setAttribute('disabled', 1);
        form.elements['excursion-time'].setAttribute('disabled', 1);
        form.elements['excursion-duration'].setAttribute('disabled', 1);
        form.elements['count-people'].setAttribute('disabled', 1);
        form.elements['option-quick-arrival'].setAttribute('disabled', 1);
        form.elements['option-presents'].setAttribute('disabled', 1);
        modalWindow.querySelector('.btn-cancel').classList.add('d-none');
        // modalWindow.querySelector('.btn-close').classList.add('d-none');

    }

    // if (action == 'edit' || action == 'show') {
    let orderEvent = event.relatedTarget.closest('.col');
    let orderId = event.relatedTarget.closest('.col').id;
    form.elements['order-id'].value = orderId;

    url.pathname += '/' + orderId;
    let order = await fetch(url);
    order = await order.json();
    url.pathname = '/api/orders';
    await downloadGuides(order.route_id);
    let guideNameApi = searchGuide.find(item => item.id == order.guide_id);
    form.querySelector('.guide-name').innerHTML = guideNameApi.name;
    form.querySelector('.route-name').innerHTML = 
    orderEvent.querySelector('.item-col-name').innerHTML;
    form.elements['excursion-date'].value = order.date;
    form.elements['excursion-time'].value = order.time;

    if (order.duration == '1') {
        form.elements['excursion-duration'].value = order.duration + ' час';
    } else 
        form.elements['excursion-duration'].value = order.duration + ' часа';

    form.elements['count-people'].value = order.persons;
    form.elements['option-quick-arrival'].checked = order.optionFirst;
    form.elements['option-presents'].checked = order.optionSecond;
    form.querySelector('.total-price').innerHTML = order.price + ' руб.';

    // }
}

// async function actionHandler(event) {
//     let modalWindow = event.target.closest('.modal');
//     let formInputs = modalWindow.querySelector('form').elements;
// }

window.onload = async function () {
    await downloadRoute();
    downloadOrders();
    document.querySelector('.delete-order-btn').onclick = deleteBtnHandler;
    let actionModal = document.getElementById('show-order');
    actionModal.addEventListener('show.bs.modal', actionModalHandler);
};