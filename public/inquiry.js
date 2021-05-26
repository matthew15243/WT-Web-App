let studentData = {};
let parentData = {};
let typeData = {};

function initialSetup() {
  setLocations();
  setupDuplicates();
  fillInData();
}

/*****************************************************************************
 * Description:
 *   This will add a generic input to the end of the input-block
*****************************************************************************/
function addElement(id, value = "") {

  let placeholders = {}
  placeholders['studentScholarshipArray'] = ['Presidential', 'Exemplary', 'Outstanding', 'Distinguished']
  placeholders['studentCollegeArray'] = ['Massachusetts Institute of Technology (MIT)', 'Brigham Young University (BYU)', 'University of Utah (UoU)', 'Utah State University (USU)', 'Utah Valley University (UVU)'];
  placeholders['studentExtracurricularArray'] = ['Leadership', 'Internship', 'Atheletic', 'Work', 'Academic Teams and Clubs', 'Creative Pursuits', 'Technological Skills', 'Political Activism', 'Travel']

  let phrase = "label[for=\"" + id + "\"]";
  let parentElement = document.querySelector(phrase).parentNode;

  let newElement = document.createElement("input");
  newElement.setAttribute("type", "text");
  newElement.setAttribute("id", id + (parentElement.childElementCount - 2).toString());
  newElement.setAttribute("value", value);

  if (parentElement.childElementCount - 3 < placeholders[id].length) {
    newElement.setAttribute("placeholder", placeholders[id][parentElement.childElementCount - 3]);
  }
  else {
    newElement.setAttribute("placeholder", "Other");
  }

  newElement.className = "input";
  parentElement.appendChild(newElement);
}

/*****************************************************************************
 * Description:
 *   This will remove the given element plus its grandparents and down
*****************************************************************************/
function removeElement(id) {
  let phrase = "label[for=\"" + id + "\"]";
  let parentElement = document.querySelector(phrase).parentNode;

  if (parentElement.childElementCount > 3) {
    parentElement.lastChild.remove();
  }
}

function addActTest(date = "", english = "", math = "", reading = "", science = "") {
  placeholders = ['7/17/2021', '9/11/2021', '10/23/2021', '12/11/2021', '2/5/2022', '4/9/2022', '6/11/2022', '7/16/2022']
  let id = "studentACTDateArray"

  let phrase = "label[for^=\"studentACTTest\"]";
  let parentElement = document.querySelector(phrase).parentNode;

  let numChildren = (parentElement.childElementCount - 4);

  let scores = []
  let dateElem = createElement("div", "input-row")
  let element;
  if (numChildren + 1 < placeholders.length) {
    element = createElements(["label", "input"], ["label", "input"], [["for"],["id", "placeholder", "value"]], [["actTestDate" + (numChildren + 1).toString()],["actTestDate" + (numChildren + 1).toString(), placeholders[(numChildren)], date]], ["ACT Date " + (numChildren + 1).toString(), ""], "input-block")
    element.addEventListener('keydown',enforceNumericFormat);
    element.addEventListener('keyup',formatToDate);
  }
  else {
    element = createElements(["label", "input"], ["label", "input"], [["for"],["id", "placeholder"]], [["actTestDate" + (numChildren + 1).toString()],["actTestDate" + (numChildren + 1).toString(), "MM/DD/YYYY"]], ["ACT Date " + (numChildren + 1).toString(), ""], "input-block")
  }

  dateElem.appendChild(element)

  scores.push(createElements(["label", "input"], ["label", "input"], [["for"],["id", "placeholder", "maxlength", "min", "max", "value"]], [["actTestEnglish" + (numChildren + 1).toString()],["actTestEnglish" + (numChildren + 1).toString(), "25", "2", "0", "36", english]], ["English:", ""], "input-block"))
  scores.push(createElements(["label", "input"], ["label", "input"], [["for"],["id", "placeholder", "maxlength", "min", "max", "value"]], [["actTestMath" + (numChildren + 1).toString()],["actTestMath" + (numChildren + 1).toString(), "25", "2", "0", "36", math]], ["Math:", ""], "input-block"))
  scores.push(createElements(["label", "input"], ["label", "input"], [["for"],["id", "placeholder", "maxlength", "min", "max", "value"]], [["actTestReading" + (numChildren + 1).toString()],["actTestReading" + (numChildren + 1).toString(), "25", "2", "0", "36", reading]], ["Reading:", ""], "input-block"))
  scores.push(createElements(["label", "input"], ["label", "input"], [["for"],["id", "placeholder", "maxlength", "min", "max", "value"]], [["actTestScience" + (numChildren + 1).toString()],["actTestScience" + (numChildren + 1).toString(), "25", "2", "0", "36", science]], ["Science:", ""], "input-block"))

  for (let ele = 0; ele < scores.length; ele++) {
    scores[ele].addEventListener('keydown',enforceNumericFormat);
    scores[ele].addEventListener('keyup',formatToNumber);
  }

  let score = combineElements(scores, "input-row")
  let actTestDiv = document.createElement("div");
  actTestDiv.id = "actTest" + (numChildren + 1).toString();
  parentElement.appendChild(actTestDiv);
  actTestDiv.appendChild(dateElem);
  actTestDiv.appendChild(score);
}

function removeActTest() {
  let phrase = "label[for^=\"studentACTTestsArray\"]";
  let parentElement = document.querySelector(phrase).parentNode;
  let children = parentElement.querySelectorAll("div[id^='actTest']")

  let numChildren = (parentElement.childElementCount - 4);

  if (numChildren >= 1) {
    children[children.length - 1].remove()
    // children[children.length - 2].remove()
  }

}



function createElements(elementType = [], classes = [], attributes = [], values = [], text = [], flexType = "input-row") {
  if (elementType.length >= 0) {
    let elements = createElement("div", flexType);

    if (attributes.length == values.length && attributes.length >= 0) {
      for (let i = 0; i < elementType.length; i++) {
        elements.appendChild(createElement(elementType[i], classes[i], attributes[i], values[i], text[i]));
      }
    }

    return elements;

  }
}

function createElement(elementType, classes = "", attributes = [], values = [], text = "") {
  let question = document.createElement(elementType);

  if (attributes.length == values.length && attributes.length > 0) {
    for (let i = 0; i < attributes.length; i++) {
      question.setAttribute(attributes[i], values[i]);
    }
  }

  if (classes != "") {
    question.className = classes;
  }

  if (text != "") {
    question.innerHTML = text;
  }
  return question;

}

function combineElements(objects = [], flexType = "input-row")
{
  let item = createElement("div", flexType, [], [], "");

  if (objects.length > 1)
  {
    for (let i = 0; i < objects.length; i++)
    {
      item.appendChild(objects[i]);
    }
  }

  return item;

}


/**
 * Set the wasatch location options
 */
function setLocations () {
  const wasatchRef = firebase.firestore().collection("Wasatch").doc("general");
  wasatchRef.get()
  .then((doc) => {
    if (doc) {
      const locationElem = document.getElementById("location");
      let locations = doc.get("locations");
      for (let locationUID in locations) {
        let option = document.createElement("option");
        option.value = locationUID;
        option.innerText = locations[locationUID]["name"];
        locationElem.appendChild(option);
      }
    }
  })
  .catch((error) => {
    handleFirebaseErrors(error, window.location.href);
  });
}

/**
 * Description:
 * grabs the query string for this url which should include a uid and location
 * then pulls the corresponding data from the pending collection in the given location
 * fills in all of the data that we have stored
 */
 function fillInData() {

  const studentUID = queryStrings()["student"];

  if (studentUID) {
    //grab the student data
    const studentDocRef = firebase.firestore().collection("Students").doc(studentUID);
    studentDocRef.get()
    .then((studentDoc) => {
      if(studentDoc.exists) {
        setAllData(studentDoc.data());
        studentData = studentDoc.data();
      }

      //if the student is ACT then they have more data in their type
      if (studentData["studentType"] == "act") {
        const typeDocRef = firebase.firestore().collection("Students").doc(studentUID).collection("ACT").doc("profile");
        typeDocRef.get()
        .then((typeDoc) => {
          if(typeDoc.exists) {
            setAllData(typeDoc.data());
            typeData = typeDoc.data();
          }
        })
        .catch((error) => {
          handleFirebaseErrors(error, window.location.href);
        });
      }

      //grab the parents second because they will have more data (parent already exists from previous student)
      const parentDocRef = firebase.firestore().collection("Parents").doc(studentDoc.data()["parent"]);
      parentDocRef.get()
      .then((parentDoc) => {
        if(parentDoc.exists) {
          setAllData(parentDoc.data());
          parentData = parentDoc.data();
        }
      })
      .catch((error) => {
        handleFirebaseErrors(error, window.location.href);
      });
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      
    });
  }
}

function setAllData(data) {
  for(const key in data) {
    let element = document.getElementById(key);
    if (element) {
      element.value = data[key];
      element.dispatchEvent(new Event('change'));
    }
  }

  //special case for dynamic elements

  //act tests
  let studentActTests = data["studentActTests"];
  if (studentActTests) {
    for (let i = 0; i < studentActTests.length; i++) {
      // console.log(studentActTests[i]["date"]);
      let test = studentActTests[i];
      addActTest(test["date"], test["english"], test["math"], test["reading"], test["science"]);
    }
  }
  
  //scholarship goals
  let studentScholarshipArray = data["studentScholarshipArray"];
  if (studentScholarshipArray) {
    for (let i = 0; i < studentScholarshipArray.length; i++) {
      addElement("studentScholarshipArray",studentScholarshipArray[i]);
    }
  }

  //top colleges
  let studentCollegeArray = data["studentCollegeArray"];
  if (studentCollegeArray) {
    for (let i = 0; i < studentCollegeArray.length; i++) {
      addElement("studentCollegeArray",studentCollegeArray[i]);
    }
  }

  //extracurriculars
  let studentExtracurricularArray = data["studentExtracurricularArray"];
  if (studentExtracurricularArray) {
    for (let i = 0; i < studentExtracurricularArray.length; i++) {
      addElement("studentExtracurricularArray",studentExtracurricularArray[i]);
    }
  }
}

function submitRegistration() {
  const studentUID = queryStrings()["student"];
  //if a student UID is a query string then the submit should be an update
  if (studentUID) {
    updateRegistration();
  }
  //else the submit should be a set
  else {
    createRegistration();
  }
}

function objectifyRegistration() {
  let allInputs = getAllInputs();
  let parentInputs = getParentInputs();
  let studentInputs = getStudentInputs();
  let typeInputs = getTypeInputs();
  let adminInputs = getAdminInputs();

  let allInputValues = {}
  let parentInputValues = {};
  let studentInputValues = {};
  let typeInputValues = {};
  let adminInputValues ={};

  //convert input arrays into objects
  for (let i = 0; i < allInputs.length; i++) {
    //check for duplicate id's
    let id = allInputs[i].id;
    if (id.includes('_duplicate')) {
      id = id.split('_')[0];
    }
    allInputValues[id] = allInputs[i].value;
  }

  for (let i = 0; i < parentInputs.length; i++) {
    //check for duplicate id's
    let id = parentInputs[i].id;
    if (id.includes('_duplicate')) {
      id = id.split('_')[0];
    }
    parentInputValues[id] = parentInputs[i].value;
  }

  for (let i = 0; i < studentInputs.length; i++) {
    //check for duplicate id's
    let id = studentInputs[i].id;
    if (id.includes('_duplicate')) {
      id = id.split('_')[0];
    }
    studentInputValues[id] = studentInputs[i].value;
  }
  //add in location and type to the student
  studentInputValues["location"] = allInputValues["location"];
  studentInputValues["studentType"] = allInputValues["studentType"];

  if (typeInputs) {
    for (let i = 0; i < typeInputs.length; i++) {
      if (typeInputs[i].id.includes("Array")) {
        if (typeInputs[i].parentNode.querySelector('label').getAttribute('for') in typeInputValues) {
          typeInputValues[typeInputs[i].parentNode.querySelector('label').getAttribute('for')].push(typeInputs[i].value)
        }
        else {
          typeInputValues[typeInputs[i].parentNode.querySelector('label').getAttribute('for')] = []
          typeInputValues[typeInputs[i].parentNode.querySelector('label').getAttribute('for')].push(typeInputs[i].value)
        }
      }
      else {
        //check for duplicate id's
        let id = typeInputs[i].id;
        if (id.includes('_duplicate')) {
          id = id.split('_')[0];
        }
        //check for the act test
        if (!id.includes("actTest")) {
          typeInputValues[id] = typeInputs[i].value;
        }
      }
    }

    //special case for actTest
    let actTestArray = [];
    let actTestDivs = document.querySelectorAll("div[id^='actTest']");
    for (let i = 0; i < actTestDivs.length; i++) {
      let actTest = {}
      actTest["date"] = actTestDivs[i].querySelector("input[id*='Date']").value;
      actTest["english"] = actTestDivs[i].querySelector("input[id*='English']").value;
      actTest["math"] = actTestDivs[i].querySelector("input[id*='Math']").value;
      actTest["reading"] = actTestDivs[i].querySelector("input[id*='Reading']").value;
      actTest["science"] = actTestDivs[i].querySelector("input[id*='Science']").value;
      actTestArray.push(actTest);
    }
    typeInputValues["studentActTests"] = actTestArray;
  }

  for (let i = 0; i < adminInputs.length; i++) {
    //check for duplicate id's
    let id = adminInputs[i].id;
    if (id.includes('_duplicate')) {
      id = id.split('_')[0];
    }
    adminInputValues[id] = adminInputs[i].value;
  }

  return {
    allValues: allInputValues,
    parentValues: parentInputValues,
    studentValues: studentInputValues,
    typeValues: typeInputValues,
    adminValues: adminInputValues 
  }
}

/**
 * 
 * @param {boolean} status if the submit button should be disabled and loader spinning
 */
function isWorking(status) {
  if (status) {
    document.getElementById("errMsg").textContent = "";
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("spinnyBoi").style.display = "block";
  }
  else {
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("spinnyBoi").style.display = "none";
  }
}

function createRegistration() {
  // put into working status
  isWorking(true);

  const registrationObject = objectifyRegistration();

  let allInputValues = registrationObject["allValues"];
  let parentInputValues = registrationObject["parentValues"];
  let studentInputValues = registrationObject["studentValues"];
  let typeInputValues = registrationObject["typeValues"];
  let adminInputValues = registrationObject["adminValues"];

  //validate and confirm submission
  if (validateFields(getAllInputs()) && confirm("Are you sure you are ready to submit this registration?")) {
    //if no student email was created, generate one
    let randomNumber = Math.round(Math.random() * 10000).toString().padStart(4, '0');
    studentInputValues['studentEmail'] = studentInputValues['studentEmail'].trim() || studentInputValues['studentFirstName'].trim() + studentInputValues['studentLastName'].trim() + randomNumber + '@wasatchtutors.com';

    //create the student account
    const addUser = firebase.functions().httpsCallable('addUser');
    addUser({
      email: studentInputValues['studentEmail'].trim(),
      password: "abc123",
      role: "student"
    })
    .then((result) => {
      let studentUID = result.data.user.uid;
      let newStudent = result.data.newUser;
      if (newStudent) {

        //create the parent account
        const addUser = firebase.functions().httpsCallable('addUser');
        addUser({
          email: parentInputValues['parentEmail'].trim(),
          password: "abc123",
          role: "parent"
        })
        .then((result) => {
          let parentUID = result.data.user.uid;
          let newParent = result.data.newUser;

          //new parent
          if (newParent) {
            let studentProm = setStudentDoc(studentUID, parentUID, {...studentInputValues, ...adminInputValues});
            let parentProm = setParentDoc(parentUID, studentUID, parentInputValues);

            let studentType = allInputValues['studentType'];
            let typeProm;
            if (studentType == "act") {
              typeProm = updateTypeDoc(studentUID, "ACT", typeInputValues);
            }

            let locationUID = allInputValues["location"];
            let studentFirstName = allInputValues["studentFirstName"];
            let studentLastName = allInputValues["studentLastName"];
            let parentFirstName = allInputValues["parentFirstName"];
            let parentLastName = allInputValues["parentLastName"];

            let locationProm = updateLocationActive(locationUID, studentUID, studentType, studentFirstName, studentLastName, parentUID, parentFirstName, parentLastName);

            let studentDisplayNameProm;
            if (studentFirstName) {
              const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
              studentDisplayNameProm = updateUserDisplayName({
                uid: studentUID,
                displayName: studentFirstName + " " + studentLastName 
              })
            }
            let parentDisplayNameProm;
            if (parentFirstName) {
              const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
              parentDisplayNameProm = updateUserDisplayName({
                uid: parentUID,
                displayName: parentFirstName + " " + parentLastName 
              })
            }

            let promises = [studentProm, parentProm, typeProm, locationProm, studentDisplayNameProm, parentDisplayNameProm];
            Promise.all(promises)
            .then(() => {
              //go back
              goToDashboard();
              isWorking(false);
            })
            .catch((error) => {
              handleFirebaseErrors(error, window.location.href);
              document.getElementById("errMsg").textContent = error.message;
              isWorking(false);
            });
          }
          else {
            //the parent already exists. add the student to this parent after confirmation
            let confirmation = confirm('This parent already exists. Would you like to add this student to this parent?')
            if (confirmation) {
              let studentProm = setStudentDoc(studentUID, parentUID, {...studentInputValues, ...adminInputValues});
              let parentProm = updateParentChildren(parentUID, studentUID);

              let studentType = allInputValues['studentType'];
              let typeProm;
              if (studentType == "act") {
                typeProm = updateTypeDoc(studentUID, "ACT", typeInputValues);
              }

              let locationUID = allInputValues["location"];
              let studentFirstName = allInputValues["studentFirstName"];
              let studentLastName = allInputValues["studentLastName"];
              let parentFirstName = allInputValues["parentFirstName"];
              let parentLastName = allInputValues["parentLastName"];

              let locationProm = updateLocationActive(locationUID, studentUID, studentType, studentFirstName, studentLastName, parentUID, parentFirstName, parentLastName);

              let studentDisplayNameProm;
              if (studentFirstName) {
                const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
                studentDisplayNameProm = updateUserDisplayName({
                  uid: studentUID,
                  displayName: studentFirstName + " " + studentLastName 
                })
              }

              let promises = [studentProm, parentProm, typeProm, locationProm, studentDisplayNameProm];
              Promise.all(promises)
              .then(() => {
                //go back
                goToDashboard();
                isWorking(false);
              })
              .catch((error) => {
                handleFirebaseErrors(error, window.location.href);
                document.getElementById("errMsg").textContent = error.message;
                isWorking(false);
              });
            }
            else {
              isWorking(false);
            }
          }
        })
        .catch((error) => {
          handleFirebaseErrors(error, window.location.href);
          document.getElementById("errMsg").textContent = error.message;
          isWorking(false);
        });
      }
      //this student already exists. prompt to try again if not a mistake
      else {
        alert("It looks like this student already exists. If you think this is a mistake please try submitting the registration again.");
        isWorking(false);
      }
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("errMsg").textContent = error.message;
      isWorking(false);
    });
  }
  else {
    //validation failed
    isWorking(false);
  }
}

function updateRegistration() {
  // put into working status
  isWorking(true);

  const registrationObject = objectifyRegistration();

  let allInputValues = registrationObject["allValues"];
  let parentInputValues = registrationObject["parentValues"];
  let studentInputValues = registrationObject["studentValues"];
  let typeInputValues = registrationObject["typeValues"];
  let adminInputValues = registrationObject["adminValues"];

  //validate and confirm submission
  if (validateFields(getAllInputs()) && 
    haveStudentEmail() && 
    confirm("Are you sure you are ready to update this registration form?")
    ) {
    const studentUID = queryStrings()["student"];
    const parentUID = studentData["parent"];

    let studentProm = updateStudentDoc(studentUID, parentUID, {...studentInputValues, ...adminInputValues});
    let parentProm = updateParentDoc(parentUID, studentUID, parentInputValues);

    let studentType = allInputValues['studentType'];
    let typeProm;
    if (studentType == "act") {
      typeProm = updateTypeDoc(studentUID, "ACT", typeInputValues);
    }

    let locationUID = allInputValues["location"];
    let studentFirstName = allInputValues["studentFirstName"];
    let studentLastName = allInputValues["studentLastName"];
    let parentFirstName = allInputValues["parentFirstName"];
    let parentLastName = allInputValues["parentLastName"];

    let locationProm = updateLocationActive(locationUID, studentUID, studentType, studentFirstName, studentLastName, parentUID, parentFirstName, parentLastName);

    //update student email
    let studentEmail = studentInputValues['studentEmail'];
    let studentEmailProm;
    if (studentEmail) {
      const updateUserEmail = firebase.functions().httpsCallable('updateUserEmail');
      emailProm = updateUserEmail({
        uid: studentUID,
        email : studentEmail,
      })
    }

    //update parent email
    let parentEmail = parentInputValues['parentEmail'];
    let parentEmailProm;
    if (parentEmail) {
      const updateUserEmail = firebase.functions().httpsCallable('updateUserEmail');
      emailProm = updateUserEmail({
        uid: studentUID,
        email : parentEmail,
      })
    }

    //update student display name
    let studentDisplayNameProm;
    if (studentFirstName) {
      const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
      studentDisplayNameProm = updateUserDisplayName({
        uid: studentUID,
        displayName: studentFirstName + " " + studentLastName 
      })
    }

    //update parent display name
    let parentDisplayNameProm;
    if (parentFirstName) {
      const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
      parentDisplayNameProm = updateUserDisplayName({
        uid: parentUID,
        displayName: parentFirstName + " " + parentLastName 
      })
    }

    let promises = [studentProm, parentProm, typeProm, locationProm, studentEmailProm, parentEmailProm, studentDisplayNameProm, parentDisplayNameProm];
    Promise.all(promises)
    .then(() => {
      //go back
      history.back();
      isWorking(false);
    })
    .catch((error) => {
      console.log(error);
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("errMsg").textContent = error.message;
      isWorking(false);
    });
  }
  else {
    isWorking(false);
  }
}

function setStudentDoc(studentUID, parentUID, studentValues) {
  const studentDocRef = firebase.firestore().collection("Students").doc(studentUID);
  let studentDocData = {
    ...studentValues,
    parent: parentUID,
    dateCreated: (new Date().getTime()),
    dateModified: (new Date().getTime())
  }
  return studentDocRef.set(studentDocData);
}

function setParentDoc(parentUID, studentUID, parentValues) {
  const parentDocRef = firebase.firestore().collection("Parents").doc(parentUID);
  let parentDocData = {
    ...parentValues,
    students : [studentUID],
    dateCreated: (new Date().getTime()),
    dateModified: (new Date().getTime())
  }
  return parentDocRef.set(parentDocData)
}

function setTypeDoc(studentUID, studentType, typeValues) {
  const typeDocRef = firebase.firestore().collection("Students").doc(studentUID).collection(studentType).doc("profile");
  return typeDocRef.set({
    ...typeValues,
    dateCreated: (new Date().getTime()),
    dateModified: (new Date().getTime())
  })
}

function updateStudentDoc(studentUID, parentUID, studentValues) {
  const studentDocRef = firebase.firestore().collection("Students").doc(studentUID);
  let studentDocData = {
    ...studentValues,
    parent: parentUID,
    dateModified: (new Date().getTime())
  }
  return studentDocRef.update(studentDocData);
}

function updateParentDoc(parentUID, studentUID, parentValues) {
  const parentDocRef = firebase.firestore().collection("Parents").doc(parentUID);
  let parentDocData = {
    ...parentValues,
    students : [studentUID],
    dateModified: (new Date().getTime())
  }
  return parentDocRef.update(parentDocData)
}

function updateTypeDoc(studentUID, studentType, typeValues) {
  const typeDocRef = firebase.firestore().collection("Students").doc(studentUID).collection(studentType).doc("profile");
  return typeDocRef.update({
    ...typeValues,
    dateModified: (new Date().getTime())
  })
}

function updateParentChildren(parentUID, studentUID) {
  const parentDocRef = firebase.firestore().collection("Parents").doc(parentUID);
  return parentDocRef.update({
    students : firebase.firestore.FieldValue.arrayUnion(studentUID),
    dateModified: (new Date().getTime())
  })
}

function updateLocationActive(locationUID, studentUID, studentType, studentFirstName, studentLastName, parentUID, parentFirstName, parentLastName) {
  const locationDocRef = firebase.firestore().collection("Locations").doc(locationUID);
  let activeStudent = {
    studentType : studentType,
    studentFirstName : studentFirstName,
    studentLastName : studentLastName,
    parentUID: parentUID,
    parentFirstName: parentFirstName,
    parentLastName: parentLastName
  }
  return locationDocRef.update({
    [`activeStudents.${studentUID}`]: activeStudent
  })
}

function getAllInputs() {
  return document.querySelectorAll("input, select, textarea");
}

function getRequiredInputs() {
  return document.getElementById("required_info").querySelectorAll("input, select, textarea");
}

function getParentInputs() {
  return document.getElementById("parent_info").querySelectorAll("input, select, textarea");
}

function getStudentInputs() {
  return document.getElementById("student_info").querySelectorAll("input, select, textarea");
}

function getTypeInputs() {
  let studentType = document.getElementById("studentType").value;
  if (studentType) {
    return document.getElementById(studentType + "_info").querySelectorAll("input, select, textarea");
  }
}

function getAdminInputs() {
  return document.getElementById("admin_info").querySelectorAll("input, select, textarea");
}

function haveStudentEmail() {
  let studentEmail = document.getElementById("studentEmail");

  //if we don't have the email return false
  if (!studentEmail.value.trim()) {
    studentEmail.parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], ["studentEmail" + "ErrorMessage"], "* Required *"));
    return false;
  }
  else {
    return true;
  }
}

function validateFields(inputs) {
  let allClear = true;
  let errorMessages = document.querySelectorAll("p[id$='ErrorMessage']");

  for (let err = errorMessages.length - 1; err >= 0; err--) {
    errorMessages[err].remove()
  }

  for(i = 0; i < inputs.length; i++) {
    if(inputs[i].hasAttribute("required") && inputs[i].value == "") {
      inputs[i].parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], [inputs[i].id + "ErrorMessage"], "* Required *"));
      allClear = false;
    }

    // Validate Emails
    if (inputs[i].id.includes("Email") && inputs[i].value != "") {
      if (validateInputEmail(inputs[i]) == false) {
        allClear = false;
      }
    }

    // Validate phoneNumbers
    if (inputs[i].id.includes("PhoneNumber") && inputs[i].value != "") {
      if (validateInputPhoneNumbers(inputs[i]) == false) {
        allClear = false;
      }
    }

    if (inputs[i].id.includes("birthday") && inputs[i].value != "") {
      if (validateInputBirthday(inputs[i]) == false) {
        allClear = false;
      }
    }

    if (inputs[i].id.includes("zipCode") && inputs[i].value != "") {
      if (validateInputZipCode(inputs[i]) == false) {
        allClear = false;
      }
    }
  }

  //parent and student must have different emails
  if (document.getElementById("parentEmail").value.trim() == document.getElementById("studentEmail").value.trim()) {
    document.getElementById("parentEmail").parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], ["parentEmail" + "ErrorMessage"], "The student and parent cannot have the same email!"));
    document.getElementById("studentEmail").parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], ["parentEmail" + "ErrorMessage"], "The student and parent cannot have the same email!"));
    allClear = false;
  }

  return allClear;
}

function changeRegistrationBlock(elem) {
  let registrationID = "";
  if (elem.id === "type") {
    registrationID = document.getElementById("studentType").value || null;
  }
  else {
    registrationID = elem.id;
  }

  if (registrationID) {
    registrationID += "_info"
    let registrationBlocks = document.querySelectorAll("div[id$=_info]");
    let progressArrows = document.querySelectorAll(".step");

    removeCurrentClass(registrationBlocks);
    removeCurrentClass(progressArrows);

    document.getElementById(registrationID).classList.add("current");
    elem.classList.add("current");
    }
}

function removeCurrentClass(blocks) {
  blocks.forEach((elem) => {
    elem.classList.remove("current")
  });
}







/**
 * Description:
 *   checks if the key event is an allowed modifying key
 * @param {event} event javascript event
 */
const isModifierKey = (event) => {
	const key = event.keyCode;
	return (key === 35 || key === 36) || // Allow Shift, Home, End
		(key === 8 || key === 9 || key === 13 || key === 46) || // Allow Backspace, Tab, Enter, Delete
		(key > 36 && key < 41) || // Allow left, up, right, down
		(
			// Allow Ctrl/Command + A,C,V,X,Z
			(event.ctrlKey === true || event.metaKey === true) &&
			(key === 65 || key === 67 || key === 86 || key === 88 || key === 90)
		)
};

/**
 * Description:
 *   checks if the key event is a numeric input
 * @param {event} event javascript event
 */
const isNumericInput = (event) => {
	const key = event.keyCode;
	return (
    ((key >= 48 && key <= 57) || // Allow number line
		(key >= 96 && key <= 105)) // Allow number pad 
    && (!event.shiftKey) // Do not allow shift key
	);
};

const enforceNumericFormat = (event) => {
	// Input must be of a valid number format or a modifier key
	if(!isNumericInput(event) && !isModifierKey(event)) {
		event.preventDefault();
	}
};

const enforceDecimalFormat = (event) => {
	// Input must be of a valid number format or a modifier key or decimal point
	const key = event.keyCode;
	if(!isNumericInput(event) && !isModifierKey(event) && key != 190) {
		event.preventDefault();
	}
};

const formatToPhone = (event) => {
	// I am lazy and don't like to type things more than once
	const target = event.target;
	const input = event.target.value.replace(/\D/g,'').substring(0,10); // First ten digits of input only
	const zip = input.substring(0,3);
	const middle = input.substring(3,6);
	const last = input.substring(6,10);

	if(input.length > 6){target.value = `(${zip}) ${middle}-${last}`;}
	else if(input.length > 3){target.value = `(${zip}) ${middle}`;}
	else if(input.length > 0){target.value = `(${zip}`;}
};

const formatToDate = (event) => {
	// I am lazy and don't like to type things more than once
	const target = event.target;
	const input = event.target.value.replace(/\D/g,'').substring(0,8); // First ten digits of input only
  let month = input.substring(0,2);
	let day = input.substring(2,4);
  let year = input.substring(4,8);
  
  //enforce proper months and day values
  if (Number(month) > 12) {
    month = "12";
  }
  if (Number(day) > 31) {
    day = "31"
  }

	if(input.length > 4){target.value = `${month}/${day}/${year}`;}
	else if(input.length > 2){target.value = `${month}/${day}`;}
	else if(input.length > 0){target.value = `${month}`;}
};

const formatToNumber = (event) => {
  const target = event.target;

  //remove non numbers from input if they have snuck past
  let strArray = target.value.split('');
  strArray.forEach((char, index) => {
    if (isNaN(char) && char != '.') {
      strArray[index] = '';
    }
  });
  target.value = strArray.join('');
  
  const min = Number(target.getAttribute("min"));
  const max = Number(target.getAttribute("max"));
  let input = ""
  if (!target.value.includes('.')) {
  	input = Number(target.value).toString();
  }
  else if (target.value[target.value.length - 1] == '.') {
  	input = Number(target.value[0])
  }
  else {
  	input = Number(target.value)
  }

  	//remove leading zeros
  	if (input < min) {
    	target.value = min; 
  	}
  	else if (input > max) {
    	target.value = max;
  	}

}

function validateInputCompletion(input) {
  if (input.value.trim() == "") {
    return false;
  }
  return true;
}
/**
 * Validate a input fields based on a given values
 * @param {html element} input - array of input elements that should be verified 
 * @param {array} values - array of strings that are acceptable values. Default is all values possible
 */
function validateInputList(input, values = []) {
  if (!values.includes(input.value.trim())) {
    input.style.borderColor = "red";
    return false;
  }
  return true;
}

function validateInputEmail(input) {
  if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()))) {
    let error = document.getElementById(input.id + "ErrorMessage")
    if (error != null) {
      error.innerHTML = "* Please enter a valid email address *"
    }
    else {
      input.parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], [input.id + "ErrorMessage"], "* Please enter a valid email address *"));
    }
    return false;
  }
  return true;
}

function validateInputPhoneNumbers(input) {
  if (input.value.length != 14) {
    let error = document.getElementById(input.id + "ErrorMessage")
    if (error != null) {
      error.innerHTML = "* Please enter a valid phone number *"
    }
    else {
      input.parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], [input.id + "ErrorMessage"], "* Please enter a valid phone number *"));
    }
    return false;
  }
  return true;
}

function validateInputZipCode(input) {
  if (input.value.length != 5) {
    let error = document.getElementById(input.id + "ErrorMessage")
    if (error != null) {
      error.innerHTML = "* Please enter a valid zip code *"
    }
    else {
      input.parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], [input.id + "ErrorMessage"], "* Please enter a valid zip code *"));
    }
    return false;
  }
  return true;
}

function validateInputBirthday(input) {
  if (input.value.length != 10) {
    let error = document.getElementById(input.id + "ErrorMessage")
    if (error != null) {
      error.innerHTML = "* Please write all months, days, and years out *"
    }
    else {
      input.parentNode.appendChild(ele = createElement("p", "errorMessage", ["id"], [input.id + "ErrorMessage"], "* please write all months, days, and years out *"));
    }
    return false;
  }
  return true;
}

const parentPhone = document.getElementById('parentPhoneNumber');
parentPhone.addEventListener('keydown',enforceNumericFormat);
parentPhone.addEventListener('keyup',formatToPhone);

const workPhone = document.getElementById('parentWorkPhoneNumber');
workPhone.addEventListener('keydown',enforceNumericFormat);
workPhone.addEventListener('keyup',formatToPhone);

const studentPhone = document.getElementById('studentPhoneNumber');
studentPhone.addEventListener('keydown',enforceNumericFormat);
studentPhone.addEventListener('keyup',formatToPhone);

const inputZipcode = document.getElementById('zipCode');
inputZipcode.addEventListener('keydown',enforceNumericFormat);

const birthdayElem = document.getElementById('studentBirthday');
birthdayElem.addEventListener('keydown',enforceNumericFormat);
birthdayElem.addEventListener('keyup',formatToDate);

// const goalACTDate = document.getElementById('studentDesiredACTDate');
// goalACTDate.addEventListener('keydown',enforceNumericFormat);
// goalACTDate.addEventListener('keyup',formatToDate);

const goalACTScore = document.getElementById('studentDesiredACTScore');
goalACTScore.addEventListener('keydown',enforceNumericFormat);
goalACTScore.addEventListener('keyup',formatToNumber);

const gpa = document.getElementById('studentGpa');
gpa.addEventListener('keydown',enforceDecimalFormat);
gpa.addEventListener('keyup',formatToNumber);

function createElement(elementType, classes = "", attributes = [], values = [], text = "") {
  let question = document.createElement(elementType);

  if (attributes.length == values.length && attributes.length > 0) {
    for (let i = 0; i < attributes.length; i++) {
      question.setAttribute(attributes[i], values[i]);
    }
  }

  if (classes != "") {
    question.className = classes;
  }

  if (text != "") {
    question.innerHTML = text;
  }
  return question;
}

function capitalizeFirstLettersInString(string) {
  let words = string.split(' ');
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

const studentType = document.getElementById('studentType');
studentType.addEventListener('change', () => {
  let type = studentType.options[studentType.selectedIndex].textContent;
  //show the act tab
  if (type == "ACT") {
    document.getElementById("type").classList.remove("hidden");
  }
  //hide the tab
  else {
    document.getElementById("type").classList.add("hidden");
  }
});

function setupDuplicates() {
  let duplicateInputs = document.querySelectorAll("input[id$='_duplicate'");


  duplicateInputs.forEach((duplicateElem) => {
    let originalElem = document.getElementById(duplicateElem.id.split('_')[0]);

    originalElem.addEventListener('change', () => {
      duplicateElem.value = originalElem.value;
    });

    duplicateElem.addEventListener('change', () => {
      originalElem.value = duplicateElem.value;
    });

    // duplicateElem.value = originalElem.value;
  });
}

function goBack() {
  let confirmation = confirm("Are you sure you want to go back? Any changes you made will be lost.")
  if (confirmation) {
    history.back()
  }
}
