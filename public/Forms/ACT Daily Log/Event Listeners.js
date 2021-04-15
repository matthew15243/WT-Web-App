// In Center Tests - Popup
inCenterTests.addEventListener('click', function(event)  {
  if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "homework") {
    openForm('homeworkPopup', undefined, event.target);
  }
  else if (event.target.className.includes("border") && test_view_type == 'inCenter') {
    openForm('testAnswersPopup', undefined, event.target);
  }
  else if (event.target.className.includes("button2") && event.target.className.includes("gridBox") && test_view_type == "assign") {
    setHomeworkStatus('assigned', 'False', event.target)
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
      console.log("scenario 1")
      tempAnswers[test][section][passageNumber]['Answers'].push(event.target.parentNode.querySelectorAll("div")[0].innerHTML)
    }
    // If marked wrong and is not an endpoint, reset and mark as a guess endpoint
    else if (isMarkedWrong == true && isGuessEndPoint == false) {
      console.log("scenario 2")
      tempAnswers[test][section][passageNumber]['Answers'].splice(getArrayIndex(event.target.parentNode.querySelectorAll("div")[0].innerHTML, tempAnswers[test][section][passageNumber]['Answers']),1)
      if (!shouldMarkAsGuessed(test, section, question) || parseInt(question) > parseInt(guessEndPoints[guessEndPoints.length - 1])) {
        if (guessEndPoints == undefined || parseInt(question) > parseInt(guessEndPoints[guessEndPoints.length - 1])) {
          console.log("check 1")
          if (tempAnswers[test]?.[section]?.['GuessEndPoints'] != undefined) {
            tempAnswers[test][section]['GuessEndPoints'].push(question);
          }
          else {
            tempAnswers[test][section]['GuessEndPoints'] = []
            tempAnswers[test][section]['GuessEndPoints'].push(question);
          }
        }
        else {
          console.log("check 2")
          // Just mark the individual question
          tempAnswers[test][section]['GuessEndPoints'].push(question);
          tempAnswers[test][section]['GuessEndPoints'].push(question);
        }
      }
    }
    // If marked as an endpoint, mark wrong
    else if (isMarkedWrong == false && isGuessEndPoint == true) {
      console.log("scenario 3")
      tempAnswers[test][section][passageNumber]['Answers'].push(event.target.parentNode.querySelectorAll("div")[0].innerHTML)
    }
    // if marked wrong and is a guess endpoint, reset
    else if (isMarkedWrong == true && isGuessEndPoint == true) {
      console.log("scenario 4")
      // Remove the guess color class
      tempAnswers[test][section][passageNumber]['Answers'].splice(getArrayIndex(event.target.parentNode.querySelectorAll("div")[0].innerHTML, tempAnswers[test][section][passageNumber]['Answers']),1)

      if (guessEndPoints.length % 2 == 0) {
        console.log("numero 4")
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
      else {
        console.log("numero 5")
        tempAnswers[test][section]['GuessEndPoints'].push(question);
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