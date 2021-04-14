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
    const headerText = document.getElementById("homeworkPopupHeader").innerHTML;
    const test = headerText.split(" - ")[0];
    const section = headerText.split(" - ")[1];
    const passageNumber = headerText.split(" - ")[2];
    const question = event.target.parentNode.getAttribute("data-question");
    const isMarkedWrong = tempAnswers[test]?.[section]?.[passageNumber]?.['Answers'].includes(event.target.parentNode.getAttribute("data-question"));
    const guessEndPoints = tempAnswers[test]?.[section]?.['GuessEndPoints'];
    let isGuessEndPoint = false;
    if (guessEndPoints != undefined) {
      isGuessEndPoint = guessEndPoints.includes(question);
    }

    // If not marked, mark the question wrong
    if (isMarkedWrong == false && isGuessEndPoint == false) {
      tempAnswers[test][section][passageNumber]['Answers'].push(event.target.parentNode.querySelectorAll("div")[0].innerHTML)
    }
    // If marked wrong and is not an endpoint, reset and mark as a guess endpoint
    else if (isMarkedWrong == true && isGuessEndPoint == false) {
      tempAnswers[test][section][passageNumber]['Answers'].splice(getArrayIndex(event.target.parentNode.querySelectorAll("div")[0].innerHTML, tempAnswers[test][section][passageNumber]['Answers']),1)
      if (!shouldMarkAsGuessed(test, section, question) || parseInt(question) > parseInt(guessEndPoints[guessEndPoints.length - 1])) {
        console.log("I'm here:", test, section, question)
        console.log(shouldMarkAsGuessed(test, section, question))
        if (tempAnswers[test]?.[section]?.['GuessEndPoints'] != undefined) {
          tempAnswers[test][section]['GuessEndPoints'].push(question);
        }
        else {
          tempAnswers[test][section]['GuessEndPoints'] = []
          tempAnswers[test][section]['GuessEndPoints'].push(question);
        }
      }
    }
    // If marked as an endpoint, mark wrong
    else if (isMarkedWrong == false && isGuessEndPoint == true) {
      tempAnswers[test][section][passageNumber]['Answers'].push(event.target.parentNode.querySelectorAll("div")[0].innerHTML)
    }
    // if marked wrong and is a guess endpoint, reset
    else if (isMarkedWrong == true && isGuessEndPoint == true) {
      // Remove the guess color class
      tempAnswers[test][section][passageNumber]['Answers'].splice(getArrayIndex(event.target.parentNode.querySelectorAll("div")[0].innerHTML, tempAnswers[test][section][passageNumber]['Answers']),1)

      if (guessEndPoints.length == 1) {
        delete tempAnswers[test][section]['GuessEndPoints']
      }
      else {
        const index = getArrayIndex(question, tempAnswers[test][section]['GuessEndPoints'])
        tempAnswers[test][section]['GuessEndPoints'].splice(index, 1)
        if (index % 2 == 1) {
          tempAnswers[test][section]['GuessEndPoints'].splice(index - 1, 1)
        }
        else if (tempAnswers[test][section]['GuessEndPoints'].length > index) {
          tempAnswers[test][section]['GuessEndPoints'].splice(index, 1)
        }
      }

      if (tempAnswers[test]?.[section]?.['GuessEndPoints'] != undefined && tempAnswers[test][section]['GuessEndPoints'].length == 0) {
        delete tempAnswers[test][section]['GuessEndPoints']
      }

    }

    // Sort the guessed questions array
    try {
      tempAnswers[test][section]['GuessEndPoints'].sort(function(a, b){return a-b})
      console.log("sorted")
    }
    catch {
      2 + 2;
    }

    // Change the color for the answer row and add / remove the answer from the temp Answers
    //if (isMarkedWrong == true) {
      //tempAnswers[test][section][passageNumber]['Answers'].splice(getArrayIndex(event.target.parentNode.querySelectorAll("div")[0].innerHTML, tempAnswers[test][section][passageNumber]['Answers']),1)
    //}
    //else {
      //tempAnswers[test][section][passageNumber]['Answers'].push(event.target.parentNode.querySelectorAll("div")[0].innerHTML)
    //}
    openForm('testAnswersPopup');
  }
})

let timingBlock = document.getElementById("timingBlock")
timingBlock.addEventListener('change', function(event) {
  let minutes = document.getElementById("time-minutes").value
  let seconds = document.getElementById("time-seconds").value

  let testInfo = getTestInfo();

  setObjectValue([testInfo[0], testInfo[1], testInfo[2], 'Time'], parseInt(minutes) * 60 + parseInt(seconds), tempAnswers);
})

const beforeUnloadListener = (event) => {
  event.preventDefault();
  return event.returnValue = "You may lose data!";
};

function addUnloadListener() {
  addEventListener("beforeunload", beforeUnloadListener, {capture: true});
}

function removeUnloadListener() {
  removeEventListener("beforeunload", beforeUnloadListener, {capture: true});
}
