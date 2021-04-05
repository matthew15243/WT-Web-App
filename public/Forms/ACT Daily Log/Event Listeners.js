// In Center Tests - Popup
let inCenterTests = document.getElementById("inCenterTests");
inCenterTests.addEventListener('click', function(event)  {
  if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "homework") {
    openForm('homeworkPopup', undefined, event.target);
  }
  else if (event.target.className.includes("border") && test_view_type == 'inCenter') {
    openForm('testAnswersPopup', undefined, event.target);
  }
  else if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "assign") {
    setHomeworkStatus('assigned', 'False', event.target)
    //assignHomework(event.target);
  }
})

// Homework Tests - Popup
let homeworkTests = document.getElementById("homeworkTests");
homeworkTests.addEventListener('click', function(event)  {
  if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "homework") {
    openForm('homeworkPopup', undefined, event.target);
  }
  else if (event.target.className.includes("border") && test_view_type == 'inCenter') {
    openForm('testAnswersPopup', undefined, event.target);
  }
  else if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "assign") {
    //assignHomework(event.target);
    console.log(event.target.getAttribute("data-test"), event.target.getAttribute("data-section"), "assigned?")
    setHomeworkStatus('assigned', 'False', event.target)
  }
})

// Other Tests - Popup
let otherTests = document.getElementById("otherTests");
otherTests.addEventListener('click', function(event)  {
  if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "homework") {
    openForm('homeworkPopup', undefined, event.target);
  }
  else if (event.target.className.includes("border") && test_view_type == 'inCenter') {
    openForm('testAnswersPopup', undefined, event.target);
  }
  else if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "assign") {
    //assignHomework(event.target);
    setHomeworkStatus('assigned', 'False', event.target)
  }
})

// Listen for wrong answers
let popupAnswers = document.getElementById("passage")
popupAnswers.addEventListener('click', function(event) {
  if (event.target.parentNode.className.includes('input-row-center')) {
    let headerText = document.getElementById("homeworkPopupHeader").innerHTML;
    let test = headerText.split(" - ")[0];
    let section = headerText.split(" - ")[1];
    let passageNumber = headerText.split(" - ")[2];

    // Change the color for the answer row and add / remove the answer from the temp Answers
    if (event.target.parentNode.style.backgroundColor == '') {
      event.target.parentNode.style.backgroundColor = 'red'
      tempAnswers[test][section][passageNumber]['Answers'].push(event.target.parentNode.querySelectorAll("div")[0].innerHTML)
    }
    else {
      event.target.parentNode.style.backgroundColor = '';
      tempAnswers[test][section][passageNumber]['Answers'].splice(getArrayIndex(event.target.parentNode.querySelectorAll("div")[0].innerHTML, tempAnswers[test][section][passageNumber]['Answers']),1)
    }
  }
})

let timingBlock = document.getElementById("timingBlock")
timingBlock.addEventListener('change', function(event) {
  let minutes = document.getElementById("time-minutes").value
  let seconds = document.getElementById("time-seconds").value

  let testInfo = getTestInfo();

  setObjectValue([testInfo[0], testInfo[1], testInfo[2], 'Time'], parseInt(minutes) * 60 + parseInt(seconds), tempAnswers);
})