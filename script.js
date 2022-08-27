let user = {name: ''};
let invalidUser = false;
let sendInput = document.querySelector('.bottom-bar input');
let nameInput = document.querySelector('.inputInitial');
let checkMarkUser = 'todos';
let checkMarkVisibility = 'message';
let timeLastMessage = '(00:00:00)';

function displayMessages(response) {
  const container = document.querySelector(".container");
  const messages = response.data;
  container.innerHTML = "";

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].type == "message") {
      container.innerHTML += `
        <div class="message-box all">
            <p>&nbsp <span class="gray">(${messages[i].time})</span>&nbsp <span class="bold">${messages[i].from}</span> para <span class="bold">${messages[i].to}</span>:&nbsp ${messages[i].text}</p>
        </div>`;
    } else if (messages[i].type == "status") {
      container.innerHTML += `
        <div class="message-box status">
            <p>&nbsp <span class="gray">(${messages[i].time})</span>&nbsp <span class="bold">${messages[i].from}</span> ${messages[i].text}</p>
        </div>`;
    } else if (messages[i].to === user.name || messages[i].from === user.name) {
      //só mostra a mensagem privada se for destinada ao usuário que está usando o chat 
      container.innerHTML += `
        <div class="message-box private">
            <p>&nbsp&nbsp<span class="gray">(${messages[i].time})</span>&nbsp&nbsp<span class="bold">${messages[i].from}</span> reservadamente para <span class="bold">${messages[i].to}</span>:&nbsp ${messages[i].text}</p>
        </div>`;
    }
  }
  if (messages[length-1].time !== timeLastMessage){
    container.lastElementChild.scrollIntoView();
  }
  timeLastMessage = messages[length-1].time;
}


function requestError(response) {
    console.log(response);
  }

function requestData() {
  let request = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
  request.then(displayMessages);
  request.catch(requestError);
}


function keepConnection(){
    let request = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', user);
    //verificar se precisa tratar o caso then
    request.catch(requestError);
}

function userConnected(){
    setInterval(keepConnection,4900);
    refreshActiveUsers();
    setInterval(refreshActiveUsers,10000);
    setInterval(requestData,3000);
}

function responseSending(response){
    if(response.status == '200'){
        requestData();
    }
    else
        window.location.reload();
}

function sendMessage(){
    const message = sendInput.value;
    sendInput.value = '';
    const requestData = {
                            from: user.name,
                            to: checkMarkUser,
                            text: message,
                            type: checkMarkVisibility
                        };
    let request = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', requestData);
    request.then(responseSending)
    request.catch(requestError);
}

function userResponse(response){
    if(response.status == '400'){
        alert('Nome de usuário já está em uso. Escolha outro nome.');
        toggleListClass('.inputInitial', 'hidden');
        toggleListClass('.buttonInitial', 'hidden');
        toggleListClass('.loadingGif', 'hidden');
        toggleListClass('.loadingText', 'hidden');
    } else{
        alert('Conexão estabelecida com sucesso!');
        toggleListClass('.initialLayout', 'hidden');
        toggleListClass('.initialLayout', 'flexible');
        toggleListClass('.loadingGif', 'hidden');
        toggleListClass('.loadingText', 'hidden');
        userConnected();
    }
}

function initializeSection(){
    const initialInput = document.querySelector('.inputInitial');
    toggleListClass('.inputInitial', 'hidden');
    toggleListClass('.buttonInitial', 'hidden');
    toggleListClass('.loadingGif', 'hidden');
    toggleListClass('.loadingText', 'hidden');

    user.name = initialInput.value;
    initialInput.value = '';
    request = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants ', user);
    request.then(userResponse);
    request.catch(requestError);
}

function toggleListClass(classTarget, classToggle){
    const menu = document.querySelector(classTarget);
    menu.classList.toggle(classToggle);
}

function toggleLateralMenu(){
    const menu = document.querySelector('.activeUsers');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flexible');
}

function addCheckMark(elementClicked){
    const listOfItens = elementClicked.parentElement;
    const markList = listOfItens.querySelectorAll('.check-mark');
    for (let i = 0; i < markList.length; i++){
        if (markList[i].classList.contains('hidden') == false)
            markList[i].classList.add('hidden');
    }
    //console.log(itemOfList.data-identifier);
    if (listOfItens.classList.contains('visibility-class')){
        checkMarkVisibility = elementClicked.classList.item(1);
    } else
        checkMarkUser = elementClicked.classList.item(2);
    elementClicked.lastElementChild.classList.remove('hidden');
}

function userIsOnline(usersList){
    for (let i = 0; i < usersList.length; i++){
        if (usersList[i].name === checkMarkUser)
            return true
    }
    return false;
}

function displayActiveUsers(response){
    const usersList = response.data;
    const usersMenu = document.querySelector('.contactList');
    let userElementCheckMarked;
    usersMenu.innerHTML = `
        <div class="contact-title">
            <h1 class="bold">Escolha um contato<br>para enviar mensagem:</h1>
        </div>
        <div class="itemList contact todos" onclick="addCheckMark(this)">
            <ion-icon name="people"></ion-icon>
            <p>Todos</p>
            <span class="check-mark hidden">&#10004;</span>
        </div>
    `;

    for(let i = 0; i < usersList.length; i++){
        usersMenu.innerHTML += `
            <div data-identifier="participant" class="itemList contact ${usersList[i].name}" onclick="addCheckMark(this)">
                <ion-icon name="person-circle"></ion-icon>
                <p>${usersList[i].name}</p>
                <span class="check-mark hidden">&#10004;</span>
            </div>
        `;
    }

    if (!userIsOnline(usersList)){
        checkMarkUser = 'todos';
    }
    userElementCheckMarked = document.querySelector('.' + checkMarkUser);
    addCheckMark(userElementCheckMarked);
}
function refreshActiveUsers(){
    let request = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    request.then(displayActiveUsers);
    request.catch(requestError);
}

sendInput.addEventListener("keypress",function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.querySelector('.bottom-bar ion-icon').click();
    }
});

nameInput.addEventListener("keypress",function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.querySelector('.buttonInitial').click();
    }
});

