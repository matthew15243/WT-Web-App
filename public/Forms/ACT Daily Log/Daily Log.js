// The actual tests with their answers and scaled scores
// https://codepen.io/mayuMPH/pen/ZjxGEY  - range slider
let test_answers_data = {};

let test_answers_grading = {};
let ids = [];

// Student test information
let student_tests = {};
let student_new_tests = {};
let tempAnswers = {};

// Current tests in use
const hwTests  = ['C02', 'A11', '71E', 'A10', 'MC2', 'B05', 'D03', '74C']
const icTests  = ['C03', 'B02', 'A09', 'B04', 'MC3', '74F', 'Z15', '72C']
const othTests = ['67C', 'ST1', '64E', '61C', '59F', '69A', 'ST2', '66F',
                  '61F', '55C', '58E', '71C', '71G', '68G', '68A', '72F',
                  '71H', 'C01', '67A', '63C', '61D', '73E', '73C', '71A',
                  '66C', '65E', '63F', '63D', '72G', '69F', '70G', '65C', '74H']
        
// Other needed info
const coloring = {'Completed' : 'green', 'in-time' : 'green', 'not in time' : 'greenShade', 'poor conditions' : 'greenShade', 'previously completed' : 'greenShade', 'assigned' : 'yellow', 'in-center' : 'red', 'partial' : 'greenShade', 'white' : 'white'};
const keys_to_skip = ['Status', 'TestType', 'ScaledScore', 'Score', 'Date', 'Time']
const date = new Date()
let test_view_type = undefined;
let new_status = undefined;
let storage = firebase.storage();
let tests_to_grade = {};
let session_message_count = 0;
let homework_count = 0;
let start_time = 0;
let session_timer = undefined;
let timers = {
  'grading' : 0,
  'composite' : 0,
  'english' : 0,
  'math' : 0,
  'reading' : 0,
  'science' : 0
}

current_test = undefined;
current_section = undefined;
current_passage_number = undefined;

const CURRENT_STUDENT_UID = queryStrings()['student'];
const CURRENT_STUDENT_TYPE = "act";

function getStudentTests(studentUID) {
  const ref = firebase.firestore().collection('ACT-Student-Tests').where('student', '==', studentUID)
  return ref.get()
  .then((querySnapshot) => {
    let finalObj = {}
    let assignedTests = []
    querySnapshot.forEach((doc) => {
      let data = doc.data();
      let obj = {}
      obj['date'] = data.date;
      obj['questions'] = data.questions;
      obj['score'] = data.score;
      obj['scaledScore'] = data.scaledScore;
      obj['status'] = data.status;
      obj['type'] = data.type;

      // Grab the tests that are in an assigned state that were assigned more than 14 hours before the session started
      if (data.status == 'assigned') {
        assignedTests.push({ 'test' : data.test,
                              'section' : data.section,
                              'id' : doc.id })
      }

      setObjectValue([data.section, data.test], obj, finalObj)
    })

    // add the assigned tests
    setObjectValue(['assignedTests'], assignedTests, finalObj)
    return finalObj;
  })
}


initialSetup();

function initialSetup() {
  // Grab the test answers data from Fb
  grabTestAnswersData();

  // Grab the Chat Messages
  for (let i = 0; i < sections.length; i++) {
    getStudentMessages(CURRENT_STUDENT_UID, CURRENT_STUDENT_TYPE, sections[i]);
  }
  getStudentMessages(CURRENT_STUDENT_UID, CURRENT_STUDENT_TYPE, 'general');

  // Grab the student's tests
  getStudentTests(CURRENT_STUDENT_UID)
  .then((res) => {
    // set the working tests object and the old tests object
    student_new_tests = res;
    checkForAssignedHomeworks();
    getElapsedTime();
  })
  .catch(() => console.log("I hate assigned promises"))
}

function grabTestAnswersData() {
  // Fb reference
  let ref = firebase.firestore().collection('Dynamic-Content').doc('act-tests').collection('Test-Data')

  // Grab all tests from the Dynamic-Content collection and piece them together
  ref.get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      test_answers_data[doc.id] = doc.data()
    })
  })
}

function changeSection(section) {

  // Setup the forms
  let goodForms = [section + 'Section']
  const allForms = ["compositeSection", "englishSection", "mathSection", "readingSection", "scienceSection"];

  // Update the section Title
  document.getElementById('sectionTitle').textContent = section.charAt(0).toUpperCase() + section.slice(1);

  // Hide all forms except for the desired form(s)
  let form = undefined;
  for (let i = 0; i < allForms.length; i++) {
    form = document.getElementById(allForms[i]);
    if (goodForms.includes(allForms[i])) {
      form.style.display = "flex";
    }
    else {
      form.style.display = "none";
    }
  }

  getElapsedTime();
}

/*
Swap between the lessons and chat
*/
function swap(section, swapTo) {
  let chat = document.getElementById(section + 'Chat')
  let lessons = document.getElementById(section + 'LessonsForm')

  if (swapTo == 'chat') {
    chat.classList.remove('hidden')
    lessons.classList.add('hidden')
  }
  else if (swapTo == 'lessons') {
    chat.classList.add('hidden')
    lessons.classList.remove('hidden')
  }
}

function nextPassage() {
  current_passage_number += 1;
  swapTestForm(current_test, current_section, current_passage_number)
}

function previousPassage() {
  current_passage_number -= 1;
  swapTestForm(current_test, current_section, current_passage_number)
}

function swapTestForm(test, section = undefined, passageNumber = undefined) {
  let testForm = document.getElementById('testAnswersPopup')
  let chatForm = document.getElementById('generalChat')

  // Change which tab is active
  changeHeaders(test, section)

  // Reset the HTML answers
  removeAnswersFromHTMLForm()

  // Swap which popup is being displayed+
  if (test == 'Chat') {
    // swap which popup is being viewed
    chatForm.style.display = 'flex'
    testForm.style.display = 'none'
    document.getElementById("submitHomeworkPopup").classList.remove("show");
  }
  else {

    // Change the test view type
    test_view_type = 'homework'

    // Change the current test, section, and passage number variables
    current_test = test;
    current_section = section;
    current_passage_number = passageNumber ?? 1;

    // swap which popup is being viewed
    chatForm.style.display = 'none'
    testForm.style.display = 'flex'

    // Display the test form
    updatePopupGraphics(test, section, (passageNumber ?? 1));
  }

}

function changeHeaders(test, section = undefined) {
  let chatHeaders = document.getElementById('generalHeader').querySelectorAll('h2')
  let testHeaders = document.getElementById('answersPopupHeader').querySelectorAll('h2')
  let text = 'Chat'

  // Set the Search Text
  if (test != 'Chat') {
    text = test + " - " + section[0].toUpperCase()
  }

  // Change both the chat and test headers
  for (let i = 0; i < chatHeaders.length; i++) {
    if (chatHeaders[i].innerHTML != text) {
      chatHeaders[i].parentNode.classList.remove('activeTab')
    }
    else {
      chatHeaders[i].parentNode.classList.add('activeTab')
    }
  }

  for (let i = 0; i < testHeaders.length; i++) {
    if (testHeaders[i].innerHTML != text) {
      testHeaders[i].parentNode.classList.remove('activeTab')
    }
    else {
      testHeaders[i].parentNode.classList.add('activeTab')
    }
  }

}

function checkForAssignedHomeworks() {
  let location = document.getElementById('generalHeader')
  let location2 = document.getElementById('answersPopupHeader')
  let statusBars = document.getElementsByClassName('meter')
  const testList = student_new_tests['assignedTests'];

  // For each test that needs to be graded
  for (let i = 0; i < testList.length; i++) {
    const test = testList[i]['test']
    const section = testList[i]['section']
    const id = testList[i]['id']

    // Make sure that the test was assigned before the current day
    if (student_new_tests[section][test]['date'] < convertFromDateInt(date.getTime())['startOfDayInt']) {
      // Create the array for the test that needs graded this session
      setObjectValue([test, section, 'questions'], student_new_tests[section][test]['questions'], test_answers_grading)

      // Create the tab for grading
      let tab = createElements(['h2'], [[]], [['onclick']], [["swapTestForm('" + test + "', '" + section + "')"]], [test + ' - ' + section[0].toUpperCase()], ['headingBlock', 'noselect', 'cursor', section + 'Color'])
      let tab2 = createElements(['h2'], [[]], [['onclick']], [["swapTestForm('" + test + "', '" + section + "')"]], [test + ' - ' + section[0].toUpperCase()], ['headingBlock', 'noselect', 'cursor', section + 'Color'])
      tab.setAttribute('onclick', "swapTestForm('" + test + "', '" + section + "')")
      tab2.setAttribute('onclick', "swapTestForm('" + test + "', '" + section + "')")
      location.append(tab)
      location2.append(tab2)

      // Add blank status bars below each test
      for (let i = 0; i < statusBars.length; i++) {
        let ele = createElement('div', ['statusBar'], [], [], '')
        statusBars[i].append(ele);
      }

      // Lower the homework count for each test that needs graded
      homework_count -= 1;
    }
    else {

      ids.push({
        'type' : 'homework',
        'section' : section,
        'action' : 'assign',
        'id' : id
      })

      document.getElementById('assign' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('hidden')
      document.getElementById('unassign' + section.charAt(0).toUpperCase() + section.slice(1)).classList.remove('hidden')
    }
  }

}

function removeAnswersFromHTMLForm() {
  // Remove the answers (if they are there)
  let answerArea = document.getElementById("passage")
  if (answerArea.childElementCount > 0) {
    answerAreaChildren = answerArea.getElementsByClassName("input-row-center")
    num_children = answerAreaChildren.length;
    for (let i = 0; i < num_children; i++) {
      answerAreaChildren[num_children - i - 1].remove();
    }
  }

  // Hide the arrows
  let leftArrow = document.getElementById("leftArrow")
  let rightArrow = document.getElementById("rightArrow")
  leftArrow.parentNode.style.visibility = "hidden"
  rightArrow.parentNode.style.visibility = "hidden"
}

function updatePopupGraphics(test, section, passageNumber = 1) {

  // Check to see if either left arrow or right arrows need to be hidden
  let lastPassageNumber = test_answers_data[test][section + "Answers"][test_answers_data[test][section + "Answers"].length - 1]["passageNumber"]
  let leftArrow = document.getElementById("leftArrow")
  let rightArrow = document.getElementById("rightArrow")

  if (passageNumber != 1 && passageNumber != undefined && test_view_type == 'homework') {
    leftArrow.parentNode.style.visibility = "visible"
  }

  if (passageNumber != lastPassageNumber && test_view_type == 'homework') {
    rightArrow.parentNode.style.visibility = "visible"
  }

  // Get a list of all the answers for the given section
  let allAnswers = test_answers_data[test][section + "Answers"];
  let passageAnswers = []
  let passageNumbers = []

  // Get the answers for the passage passed in
  for (let answer = 0; answer < allAnswers.length; answer++) {
    if (allAnswers[answer]["passageNumber"] == (passageNumber ?? '1')) {
      passageAnswers.push(allAnswers[answer][answer + 1])
      passageNumbers.push(answer + 1)
    }
  }

  // Display the answers, (color them too if needed)
  let passage = document.getElementById("passage");
  for (let answer = 0; answer < passageAnswers.length; answer++) {
    ele = createElements(["div", "div", "div"], [["popupValue"], ["popupDash"], ["popupAnswer"]], [[]], [[]], [(passageNumbers[answer]).toString(), "-", passageAnswers[answer]], ["input-row-center", "cursor"]);
    passage.appendChild(ele);
    ele.setAttribute("data-question", passageNumbers[answer]);
    ele.setAttribute("data-answer", passageAnswers[answer]);
    ele.classList.add('redOnHover')
    if (test_answers_grading[test][section]['questions'][passageNumbers[answer] - 1]['isWrong'] == true) {
      ele.querySelectorAll('div')[0].classList.add('Qred')
    }
  }
}

function resetAnswers() {
  // Disable the button until everything is done
  document.getElementById('resetHomework').disabled = true;
  document.getElementById('submitHomework').disabled = true;

  // Remove the answers
  removeAnswersFromHTMLForm();
  
  // Reset the answers for the working test
  let questions = test_answers_grading[current_test][current_section]['questions']
  for (let i = 0; i < questions.length; i++) {
    test_answers_grading[current_test][current_section]['questions'][i]['isWrong'] = false
  }

  // Reset the test if need be
  const id = student_new_tests['assignedTests'].filter(function(val) { return val.section == current_section && val.test == current_test})[0]['id']
  let ref = firebase.firestore().collection('ACT-Student-Tests').doc(id)
  const studentQuestions = initializeEmptyAnswers(current_test, current_section);

  ref.update({
    ['questions'] : studentQuestions,
    ['status'] : student_new_tests[current_section][current_test]['status'],
    ['date'] : student_new_tests[current_section][current_test]['date'],
    ['score'] : student_new_tests[current_section][current_test]['score'],
    ['scaledScore'] : student_new_tests[current_section][current_test]['scaledScore']
  })

  // Successfully reset the test
  .then(() => {
    console.log("Reset", current_test, '-', current_section);
    document.getElementById('resetHomework').disabled = false;
    document.getElementById('submitHomework').disabled = false;

    // Remove the green bar status if it's there
    updateStatusBar(true)
    
    // Lower the homework count by 1
    homework_count -= 1;

  })

  // Wasn't able to reset the test
  .catch((error) => {
    console.log(error)
    document.getElementById('resetHomework').disabled = false;
    document.getElementById('submitHomework').disabled = false;
  })

  // Set up the student_testsPopup again
  swapTestForm(current_test, current_section, current_passage_number)
}

function toggleHomeworkPopup() {
  // hide the error message
  document.getElementById("gradeFirst").style.display = "none";

  // Toggle the submit button popups
  document.getElementById("submitHomeworkPopup").classList.toggle("show");
}

function gradeHomework(status) {

  // Set the status bar as loading
  updateStatusBar(false, 'loading')

  // Close the popup
  toggleHomeworkPopup()

  // Disable the buttons until it this function has done its job
  document.getElementById('resetHomework').disabled = true;
  document.getElementById('submitHomework').disabled = true;

  // Calculate how many questions they missed and got correct
  let totalMissed = test_answers_grading[current_test][current_section]['questions'].filter(function(val) { return val.isWrong == true} ).length;
  let score = test_answers_grading[current_test][current_section]['questions'].length - totalMissed;

  // Calculate the scaled score
  let scaledScore = -1;
  if (['in-time', 'in-center'].includes(status)) {
    for (const [key, value] of Object.entries(test_answers_data[current_test][current_section.toLowerCase() + "Scores"])) {
      if (score >= parseInt(value, 10)) {
        scaledScore = 36 - parseInt(key);
        break;
      }
    }
  }

  // Change the score and questions back if they're not applicable
  if (['forgot', 'previously completed'].includes(status)) {
    score = -1;
    setObjectValue([current_test, current_section, 'questions'], initializeEmptyAnswers(current_test, current_section), test_answers_grading)
    if (status == 'forgot') {
      status = 'assigned'
    }
  }

  // Set the information
  const id = student_new_tests['assignedTests'].filter(function(val) { return val.section == current_section && val.test == current_test})[0]['id']

  // Get the ref
  let ref = firebase.firestore().collection('ACT-Student-Tests').doc(id)

  // Remove the test if they didn't do it, so it can be reassigned
  if (status == 'did not do') {
    ref.delete()
    .then(() => {
      console.log(current_section, "has been removed")
    })
    .catch((error) => {
      console.log(error)
    })
  }
  else {
    ref.update({
      ['questions'] : test_answers_grading[current_test][current_section]['questions'],
      ['score'] : score,
      ['scaledScore'] : scaledScore,
      ['status'] : status
    })
    .then(() => {
      // Re-enable the buttons
      document.getElementById('resetHomework').disabled = false;
      document.getElementById('submitHomework').disabled = false;

      // Update the status bar to mark the test as completed
      updateStatusBar()

      // up the homework count
      homework_count += 1;

      console.log(current_test, '-', current_section, "has been updated")
    })
    .catch((error) => {
      // Re-enable the buttons
      document.getElementById('resetHomework').disabled = false;
      document.getElementById('submitHomework').disabled = false;

      // Update the status bar to mark the test as completed
      updateStatusBar(false, 'red')

      console.log(error)
    })
  }

}

/*function submitAnswersPopup(passageGradeType = 'False', swap = 'False') {
  // Grab the test info
  const oldStatus = old_student_tests[current_test]?.[current_section]?.['Status']
  let lastPassageNumber = test_answers_data[current_test][current_section.toLowerCase() + "Answers"][test_answers_data[current_test][current_section.toLowerCase() + "Answers"].length - 1]["passageNumber"]

  // Check to see if the test can be submitted (all passages have been looked at)
  let canSubmitTest = false;
  if (test_view_type == 'homework') {
    let pCount = 0;
    for (const [key, value] of Object.entries(tempAnswers[current_test][current_section])) {
      if (!keys_to_skip.includes(key)) {
        pCount++;
      }
    }
    if (pCount == lastPassageNumber) {
      canSubmitTest = true;
    }
  }

  // Toggle the submit button popups
  let popup = document.getElementById("submitHomeworkPopup")
  let popup2 = document.getElementById("perfectScorePopup")
  if (swap == 'True') {
    resetMessages();
    if (test_view_type == 'homework') {
      popup.classList.toggle("show");
    }
    else if (test_view_type == 'inCenter') {
      popup2.classList.toggle("show")
    }
    return;
  }

  // Find and define the message elements
  let gradeMessage = document.getElementById("gradeFirst");

  // Check to see if the test / passage can be graded
  if (test_view_type == 'inCenter' && swap == 'False') {
    if (old_student_tests[current_test]?.[current_section]?.[current_passage_number] == undefined) {
      if (passageGradeType != 'grade') {
        setObjectValue([current_test, current_section, current_passage_number], tempAnswers[current_test][current_section][current_passage_number], student_tests);
        setObjectValue([current_test, current_section, current_passage_number, 'Status'], passageGradeType, student_tests);
        setObjectValue([current_test, current_section, 'TestType'], 'inCenter', student_tests);
      }
      else {
        setObjectValue([current_test, current_section, current_passage_number], tempAnswers[current_test][current_section][current_passage_number], student_tests);
        setObjectValue([current_test, current_section, current_passage_number, 'Status'], 'Completed', student_tests);
        setObjectValue([current_test, current_section, 'TestType'], 'inCenter', student_tests);
      }
    }
    else {
      // reset the temp answers
      setObjectValue([current_test, current_section, current_passage_number], student_tests[current_test][current_section][current_passage_number], tempAnswers);
    }
    popup2.classList.toggle("show")
  }
  else if (test_view_type == 'homework' && canSubmitTest == true && (oldStatus != 'in-time' && oldStatus != 'in-center' && oldStatus != 'over-time' && oldStatus != 'not-timed')) {

    // Calculate how many questions they got correct
    let totalMissed = 0;
    for (const [key, value] of Object.entries(tempAnswers[current_test][current_section])) {
      if (!keys_to_skip.includes(key)) {
        totalMissed += tempAnswers[current_test][current_section][key]['Answers'].length
      }
    }
    let score = test_answers_data[current_test][current_section.toLowerCase() + "Answers"].length - totalMissed;

    // Calculate the scaled score
    let scaledScore = 0;
    for (const [key, value] of Object.entries(test_answers_data[current_test][current_section.toLowerCase() + "Scores"])) {
      if (score >= parseInt(value, 10)) {
        scaledScore = 36 - parseInt(key);
        break;
      }
    }

    // Set the information
    if (canSubmitTest == true) {
      //(ADD FUNCTION HERE)
      updateStatusBar()
      setObjectValue([current_test, current_section], tempAnswers[current_test][current_section], student_tests);
      setObjectValue([current_test, current_section, 'TestType'], 'homework', student_tests);
      setObjectValue([current_test, current_section, 'Date'], date.getTime(), student_tests);
      setObjectValue([current_test, current_section, 'Score'], score, student_tests);
      setObjectValue([current_test, current_section, 'Status'], (new_status), student_tests);
      if (new_status == 'in-time' || new_status == 'in-center') {
        setObjectValue([current_test, current_section, 'ScaledScore'], scaledScore, student_tests);
      }
      else {
        delete student_tests[current_test][current_section]['ScaledScore']
      }
      popup.classList.toggle("show");
      submitHW();
    }
  }
  else {
    gradeMessage.style.display = "inline";
  }
}*/

function assignHomework(section) {
  // Disable the buttons until homework has been assigned
  let assign = document.getElementById('assign' + section.charAt(0).toUpperCase() + section.slice(1))
  let unassign = document.getElementById('unassign' + section.charAt(0).toUpperCase() + section.slice(1))
  assign.disabled = true;
  unassign.disabled = true;

  // Initialize the object to send to Fb
  let obj = {}

  // Find the next test
  let test = undefined;
  if (section in student_new_tests) {
    for (let i = 0; i < hwTests.length; i++) {
      if (hwTests[i] in student_new_tests[section]) {
      }
      else {
        test = hwTests[i]
        break;
      }
    }
  }
  else {
    test = hwTests[0]
  }

  // They have completed all of the normal hw tests, so start going through the 'other' tests
  if (test == undefined) {
    if (section in student_new_tests) {
      for (let i = 0; i < othTests.length; i++) {
        if (othTests[i] in student_new_tests[section]) {
        }
        else {
          test = othTests[i]
          break;
        }
      }
    }
    else {
      test = othTests[0]
    }
  }

  // Initialize the questions array
  let studentQuestions = initializeEmptyAnswers(test, section);

  // Initialize the object to send to FB
  setObjectValue(['test'], test, obj);
  setObjectValue(['section'], section, obj);
  setObjectValue(['student'], CURRENT_STUDENT_UID, obj);
  setObjectValue(['questions'], studentQuestions, obj);
  setObjectValue(['date'], date.getTime(), obj);
  setObjectValue(['type'], 'homework', obj);
  setObjectValue(['status'], 'assigned', obj);
  setObjectValue(['score'], -1, obj);
  setObjectValue(['scaledScore'], -1, obj);

  // Send the object to Fb
  let ref = firebase.firestore().collection('ACT-Student-Tests').doc()
  ref.set(obj)

  // Indicate that the test has been assigned
  .then(() => {
    // Swap buttons
    assign.classList.add('hidden')
    unassign.classList.remove('hidden')

    // Re-enable the buttons again
    assign.disabled = false;
    unassign.disabled = false;

    ids.push({
      'type' : 'homework',
      'section' : section,
      'action' : 'assign',
      'id' : ref.id
    })
    console.log(test, "-", section, "has been assigned")
  })
  
  // Indicate that the test wasn't assigned successfully
  .catch((error) => {
    console.log(error)
    assign.disabled = false;
    unassign.disabled = false;
  })

  // Open the test to print
  openTest(test, section)
}

function initializeEmptyAnswers(test, section) {
  const questions = test_answers_data[test][section + "Answers"]
  let studentQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    studentQuestions.push({
      'isWrong' : false,
      'passageNumber' : questions[i]['passageNumber']
    })
  }

  return studentQuestions;
}

function unassignHomework(section) {
  // Disable the buttons until homework has been assigned
  let assign = document.getElementById('assign' + section.charAt(0).toUpperCase() + section.slice(1))
  let unassign = document.getElementById('unassign' + section.charAt(0).toUpperCase() + section.slice(1))
  assign.disabled = true;
  unassign.disabled = true;

  // Get the document id to remove
  const id = ids.filter(function(val) { return val.type == 'homework' && val.section == section && val.action == 'assign'})[0]['id']

  // Remove the id from the list of document ids
  ids = ids.filter(function(val) { return val.type != 'homework' || val.section != section || val.action != 'assign'})

  // Send the request to Fb to remove the assigned test
  let ref = firebase.firestore().collection('ACT-Student-Tests').doc(id)
  ref.delete()

  // Indicate that the test has been unassigned
  .then(() => {
    // Swap which button is being showed
    assign.classList.remove('hidden')
    unassign.classList.add('hidden')

    // Re-enable the buttons again
    assign.disabled = false;
    unassign.disabled = false;

    console.log(section, "has been removed")
  })
  
  // Indicate that the test wasn't unassigned successfully
  .catch((error) => {
    console.log(error)
  })
}

function updateStatusBar(remove = false, colorClass = 'green') {

  const searchText = current_test + " - " + current_section[0].toUpperCase()

  let headerTabs = document.getElementById('answersPopupHeader').querySelectorAll('h2')
  let statusBars = document.getElementsByClassName('meter')

  for (let loc = 0; loc < headerTabs.length; loc++) {
    if (headerTabs[loc] != undefined && headerTabs[loc].innerHTML == searchText) {
      for (let i = 0; i < statusBars.length; i++) {
        let bars = statusBars[i].querySelectorAll('div')
        bars[loc].classList.remove('loading')
        if (remove == false) {
          bars[loc].classList.add(colorClass)
        }
        else {
          bars[loc].classList.remove(colorClass)
        }
      }
    }
  }
}

function checkTests() {

  // Check all of the tests that needed graded at the start of the session
  const testList = student_new_tests['assignedTests'];
  for (let i = 0; i < testList.length; i++) {
    const test = testList[i]['test']
    const section = testList[i]['section']

    let status = student_new_tests[section][test]['status']
    if (status == 'assigned') {
      return false;
    }
  }

  return true;
}

function submitSession() {
  getElapsedTime();

  if (homework_count == 0) {
    if (session_message_count > 0) {
      console.log("Nice Work!!")
      console.log(timers)
    }
    else {
      console.log("Please enter a new message")
    }
  }
  else {
    console.log("Please grade all tests")
  }
}

function getElapsedTime() {

  // Set the current time
  const section = document.getElementById('sectionTitle').innerHTML.toLowerCase()
  
  // Set the current time
  let time = Date.now()

  // Update the last time
  if (session_timer == undefined) {
    start_time = time;
  }
  else {
    timers[session_timer] += time - start_time;
  }

  // Update which section we are changing to
  session_timer = section;
}

function openTest(test, section = undefined) {

  let path = test + (section != undefined ? (" - " + section.charAt(0).toUpperCase() + section.slice(1)) : "");
  let ref = storage.refFromURL('gs://wasatch-tutors-web-app.appspot.com/Tests/' + path + '.pdf');
  ref.getDownloadURL().then((url) => {
      open(url);
    })

}