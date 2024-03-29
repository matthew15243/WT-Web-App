let failedMessages = [];
let session_message_count = 0;
const date =  new Date();

function getStudentMessages(studentUID, studentType, conversationType) {
  const getStudentMessages = firebase.functions().httpsCallable('getStudentMessages');
  getStudentMessages({
    studentUID: studentUID,
    studentType: studentType,
    conversationType: conversationType,
  })
  .then((res) => {
    const messages = res.data;
    messages.forEach((message) => {
      setStudentMessage(message, conversationType);

      // Check for messages sent today (by the user)
      if (message.timestamp >= convertFromDateInt(date.getTime())['startOfDayInt'] && message.currentUserIsAuthor) {
        session_message_count += 1;
      }
    });
    // Check to see if the session is still submitable
    if (typeof submitSession == 'function') {
      submitSession()
    }
  })
  .catch((error) => {
    handleFirebaseErrors(error, window.location.href);
    console.log(error);
  })
}

function setStudentMessage(mes, type) {
  //the div that contains the time and message
  let messageDiv = document.createElement('div');

  const currentUser = firebase.auth().currentUser;
  currentUser.getIdTokenResult()
  .then((idTokenResult) => {
    const currentUserRole = idTokenResult.claims.role;

    //all the messages
    let messageBlock = document.getElementById(type + 'StudentMessages');
    //the message itself
    let message = document.createElement('div');
    //time for the message
    let timeElem = document.createElement('p');

    //display the time above the mesasge
    timeElem.innerHTML = convertFromDateInt(mes.timestamp)['shortDate'];
    timeElem.classList.add('time');
    messageDiv.appendChild(timeElem);

    //set up the message
    message.innerHTML = mes.message;
    //author's name element
    let authorElem = document.createElement('p');
    authorElem.classList.add("author");
    message.appendChild(authorElem);
    authorElem.innerHTML = mes.author;

    //give the message an id
    messageDiv.setAttribute('data-id', mes.id);
    message.classList.add("studentMessage");

    //current user's message should be on the right
    if (mes.currentUserIsAuthor) {
      messageDiv.classList.add("right");
    }
    else {
      messageDiv.classList.add("left");
    }

    //see if the message is important
    if (mes.isImportant) {
      message.classList.add("important");
    }

    //only give the option to delete if the currentUser is the author, admin, or dev.
    if ((mes.currentUserIsAuthor || currentUserRole == "admin" || currentUserRole == "dev") && (mes.id != 'pending' && mes.id != 'error')) {
      setDeleteButton(message);
    }
    if (mes.id == 'pending') {
      setPendingIndicator(message);
      //remove the message from the input since this is the first state after pressing enter
      document.getElementById(type + 'StudentMessagesInput').value = null;
    }
    if (mes.id == "error") {
      setReloadButton(message);
    }
    
    messageDiv.appendChild(message);
    messageBlock.appendChild(messageDiv);
    
    messageDiv.scrollIntoView();
  })
  .catch((error) =>  {
    handleFirebaseErrors(error, window.location.href);
    console.log(error);
  });

  return messageDiv
}

function setPendingMessage(message, timestamp, type) {
  const mes = {
    message: message,
    timestamp: timestamp,
    id: 'pending',
    currentUserIsAuthor: true,
    isImportant: false,
    author: firebase.auth().currentUser.displayName
  }
  return setStudentMessage(mes, type);
  
}

function setErrorMessage(message, timestamp, type) {
  const mes = {
    message: message,
    timestamp: timestamp,
    id: 'error',
    currentUserIsAuthor: true,
    isImportant: false,
    author: firebase.auth().currentUser.displayName
  }
  return setStudentMessage(mes, type);
}

function setDeleteButton(message) {
  let deleteButton = document.createElement('div');
  deleteButton.classList.add("delete");
  let theX = document.createElement('p');
  theX.innerHTML = "X";
  theX.classList.add('noMargins');
  deleteButton.appendChild(theX);
  deleteButton.addEventListener('click', (event) => deleteStudentMessage(event));
  message.appendChild(deleteButton);
}

function setReloadButton(message) {
  let reloadButton = document.createElement('div');
  reloadButton.classList.add("delete");
  let theX = document.createElement('p');
  theX.innerHTML = "⟳";
  theX.classList.add('noMargins');
  reloadButton.appendChild(theX);
  reloadButton.addEventListener('click', (event) => reloadStudentMessage(event));
  message.appendChild(reloadButton);
}

function setPendingIndicator(message) {
  let pendingIndicator = document.createElement('div');
  pendingIndicator.classList.add("pending");
  message.appendChild(pendingIndicator);
}

function deleteStudentMessage(event) {
  let message = event.target.closest(".studentMessage").parentNode;
  let confirmation = confirm("Are you sure you want to delete this message?");
  if (confirmation) {
    const id = message.dataset.id;
    const messageDocRef = firebase.firestore().collection("Student-Chats").doc(id);
    messageDocRef.delete()
    .then(() => {
      if (Date.parse(message.getElementsByClassName('time')[0].innerHTML) >= convertFromDateInt(date.getTime())['startOfDayInt']) {
        session_message_count -= 1;
      }
      message.remove();

      // Check to see if the session is still submitable
      if (typeof submitSession == 'function') {
        submitSession()
      }
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
    })
  }
}

function reloadStudentMessage(event) {
  let messageBlock = event.target.closest(".studentMessage").parentNode;
  messageBlock.remove();
  failedMessages.forEach((messageData, index) => {
    if (messageData.element.isSameNode(messageBlock)) {
      failedMessages.splice(index, 1);
      sendStudentMessage(messageData.studentUID, messageData.studentType, messageData.conversationType, messageData.message, new Date().getTime());
      return;
    }
  })
}

function submitStudentMessage(event, studentUID, studentType, conversationType) {
  if (event.repeat) {return};
  if (!event.ctrlKey && event.key == "Enter") {
    event.preventDefault();
    const message = document.getElementById(conversationType + 'StudentMessagesInput').value;
    const time = new Date().getTime();
    sendStudentMessage(studentUID, studentType, conversationType, message, time);
  }
} 

function sendStudentMessage(studentUID, studentType, conversationType, message, timestamp) {
  const conversation = studentUID + '-' + studentType + '-' + conversationType;
  let pendingMessage = setPendingMessage(message, timestamp, conversationType)

  const saveStudentMessage = firebase.functions().httpsCallable('saveStudentMessage');
  saveStudentMessage({
    conversation: conversation,
    timestamp: timestamp,
    message: message,
  })
  .then((result) => {
    pendingMessage.remove();
    const mes = result.data;
    setStudentMessage(mes, conversationType);
    session_message_count += 1;
    
    // Check to see if the session can be submitted
    if (studentType == 'act') {
      submitSession()
    }
  })
  .catch((error) => {
    console.log(error);
    pendingMessage.remove();
    let errorMessage = setErrorMessage(message, timestamp, conversationType);
    failedMessages.push({
      element: errorMessage,
      studentUID: studentUID,
      studentType: studentType,
      conversationType: conversationType,
      message: message,
      timestamp: timestamp
    });
  });
}

//text area auto resize
var observe;
if (window.attachEvent) {
    observe = function (element, event, handler) {
        element.attachEvent('on'+event, handler);
    };
}
else {
    observe = function (element, event, handler) {
        element.addEventListener(event, handler, false);
    };
}
function initTextAreaResize () {
    document.querySelectorAll('.studentMessagesInput').forEach(text => {
      function resize () {
        text.style.height = 'auto';
        text.style.height = (text.scrollHeight + 10)+'px';
      }
      /* 0-timeout to get the already changed text */
      function delayedResize () {
          window.setTimeout(resize, 0);
      }
      observe(text, 'change',  resize);
      observe(text, 'cut',     delayedResize);
      observe(text, 'paste',   delayedResize);
      observe(text, 'drop',    delayedResize);
      observe(text, 'keydown', delayedResize);

      text.focus();
      text.select();
      resize();
    })
}
document.body.addEventListener('load', initTextAreaResize());
