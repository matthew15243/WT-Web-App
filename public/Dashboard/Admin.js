let currentLocations = [];
// let currentLocationNames = [];
let currentUser = ""

let studentTable
let staffTable

let tableDataActive = [];
let tableDataInactive = [];
let tableDataAll = [];

let tableDataStaff = [];

initialSetupData();

function initialSetupData() {
  firebase.auth().onAuthStateChanged(function(user) {
    currentUser = user;
    if (currentUser) {
      // User is signed in.
      // getLocationList(currentUser)
      getAllLocations()
      .then((locations) => {
        currentLocations = locations;
        setLocations();

        getAdminProfile(currentUser.uid)
        .then((doc) => {
          if (doc.exists) {
            setAdminProfile(doc.data());
            setActiveStudentTable();
            getStaffData()
            .then(() => {
              reinitializeStaffTableData();
            })
          }
          else setAdminProfile();
        })
        .catch((error) => {
          console.log(error);
        })
      })

    } else {
      // No user is signed in.
    }
  });
}

function getAdminProfile(adminUID) {
  const adminProfileRef = firebase.firestore().collection("Admins").doc(adminUID);
  return adminProfileRef.get();
}

function setAdminProfile(profileData = {}) {
  if (profileData['adminFirstName'] && profileData['adminLastName']) {
    document.getElementById('admin-name').textContent = "Welcome " + profileData['adminFirstName'] + " " + profileData['adminLastName'] + "!";
  }
  else {
    document.getElementById('admin-name').textContent = "Welcome Admin!";
  }
}

function getLocationList(user) {
  return firebase.firestore().collection("Admins").doc(user.uid).get()
  .then((userDoc) => {
    let userData = userDoc.data();
    let locationUIDs = userData.locations;

    let locationNameProms = [];

    locationUIDs.forEach((locationUID) => {
      locationNameProms.push(firebase.firestore().collection("Locations").doc(locationUID).get()
      .then((locationDoc) => {
        let locationData = locationDoc.data();
        return {
          id: locationUID,
          name: locationData.locationName
        }
      }));
    });
    return Promise.all(locationNameProms)
  });
}

function getAllLocations() {
  return firebase.firestore().collection('Locations').get()
  .then((locationSnapshot) => {
    let locationData = [];

    locationSnapshot.forEach(locationDoc => {
      locationData.push({
        id: locationDoc.id,
        name: locationDoc.data().locationName
      });
    })

    return locationData;
  })
}

function setActiveStudentTable() {
  if (tableDataActive.length == 0) {
    getActiveStudentData()
    .then(() => {
      reinitializeActiveTableData();
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      console.log(error);
    });
  }
  else {
    reinitializeActiveTableData();
  }
}

function setInactiveStudentTable() {
  if (tableDataInactive.length == 0) {
    getInactiveStudentData()
    .then(() => {
      reinitializeInactiveTableData();
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      console.log(error);
    });
  }
  else {
    reinitializeInactiveTableData();
  }
}

function setAllStudentTable() {
  let dataPromises = [];

  if (tableDataActive.length == 0) {
    dataPromises.push(getActiveStudentData());
  }
  if (tableDataInactive.length == 0) {
    dataPromises.push(getInactiveStudentData());
  }

  Promise.all(dataPromises)
  .then(() => {
    tableDataAll = [...tableDataActive, ...tableDataInactive]
    reinitializeAllTableData();
  })
  .catch((error) => {
    handleFirebaseErrors(error, window.location.href);
    console.log(error);
  });
}

function getActiveStudentData() {
  let promises = [];

  //run through all locations
  currentLocations.forEach((location) => {
    //query all students whose types are active
    promises.push(firebase.firestore().collection('Students')
    .where('location', '==', location.id)
    .where('status', '==', 'active')
    .get()
    .then((studentQuerySnapshot) => {
      let studentPromises = [];

      studentQuerySnapshot.forEach((studentDoc) => {
        const studentData = studentDoc.data();

        //convert type string to array
        let studentTypesTable = "";
        studentData.studentTypes.forEach((type) => {
          switch(type) {
            case 'act':
              studentTypesTable += 'ACT, ';
              break;
            case 'subjectTutoring':
              studentTypesTable += 'Subject-Tutoring, ';
              break;
            case 'mathProgram':
              studentTypesTable += 'Math-Program, ';
              break;
            case 'phonicsProgram':
              studentTypesTable += 'Phonics-Program, ';
              break;
            case 'inactive':
              studentTypesTable += 'Inactive, ';
              break;
            default:
              //nothing
          }
        })
        studentTypesTable = studentTypesTable.substring(0, studentTypesTable.length - 2);

        //figure out the location name
        let locationName = "";
        currentLocations.forEach((location) => {
          if (studentData.location == location.id) {
            locationName = location.name;
          }
        })

        studentPromises.push(getParentData(studentData.parent)
        .then((parentData) => {

          const student = {
            studentUID: studentDoc.id,
            studentName: studentData.studentLastName + ", " + studentData.studentFirstName,
            studentTypes: studentData.studentTypes,
            studentTypesTable: studentTypesTable,
            location: locationName,
            parentUID: parentData.parentUID,
            parentName: parentData.parentLastName + ", " + parentData.parentFirstName, 
          }
          return tableDataActive.push(student);
        }));
      });
      return Promise.all(studentPromises);
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      console.log(error);
    }));
  });

  return Promise.all(promises);
}

function reinitializeActiveTableData() {
  if (studentTable) {
    studentTable.off('click');
    studentTable.destroy();
  }

  studentTable = $('#student-table').DataTable( {
    data: tableDataActive,
    columns: [
      { data: 'studentName' },
      { data: 'studentTypesTable'},
      { data: 'location'},
      { data: 'parentName'},
    ],
    "scrollY": "400px",
    "scrollCollapse": true,
    "paging": false
  } );

  studentTable.on('click', (args) => {
    //this should fix some "cannot read property of undefined" errors
    if (args?.target?._DT_CellIndex) {
      let studentUID = tableDataActive[args.target._DT_CellIndex.row].studentUID;
      setupNavigationModal(studentUID);
      document.getElementById("navigationSection").style.display = "flex";
    }
  })
}

function getInactiveStudentData() {
  let promises = [];

  //run through all locations
  currentLocations.forEach((location) => {
    //query all students whose types are active
    promises.push(firebase.firestore().collection('Students')
    .where('location', '==', location.id)
    .where('status', '==', 'inactive')
    .get()
    .then((studentQuerySnapshot) => {
      let studentPromises = [];

      studentQuerySnapshot.forEach((studentDoc) => {
        const studentData = studentDoc.data();

        //convert type string to array
        let studentTypesTable = "";
        studentData.studentTypes.forEach((type) => {
          switch(type) {
            case 'act':
              studentTypesTable += 'ACT, ';
              break;
            case 'subjectTutoring':
              studentTypesTable += 'Subject-Tutoring, ';
              break;
            case 'mathProgram':
              studentTypesTable += 'Math-Program, ';
              break;
            case 'phonicsProgram':
              studentTypesTable += 'Phonics-Program, ';
              break;
            case 'inactive':
              studentTypesTable += 'Inactive, ';
              break;
            default:
              //nothing
          }
        })
        studentTypesTable = studentTypesTable.substring(0, studentTypesTable.length - 2);

        //figure out the location name
        let locationName = "";
        currentLocations.forEach((location) => {
          if (studentData.location == location.id) {
            locationName = location.name;
          }
        })

        studentPromises.push(getParentData(studentData.parent)
        .then((parentData) => {

          const student = {
            studentUID: studentDoc.id,
            studentName: studentData.studentLastName + ", " + studentData.studentFirstName,
            studentTypes: studentData.studentTypes,
            studentTypesTable: studentTypesTable,
            location: locationName,
            parentUID: parentData.parentUID,
            parentName: parentData.parentLastName + ", " + parentData.parentFirstName, 
          }
          return tableDataInactive.push(student);
        }));
      });
      return Promise.all(studentPromises);
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      console.log(error);
    }));
  });

  return Promise.all(promises);
}

function reinitializeInactiveTableData() {
  if (studentTable) {
    studentTable.off('click');
    studentTable.destroy();
  }

  studentTable = $('#student-table').DataTable( {
    data: tableDataInactive,
    columns: [
      { data: 'studentName' },
      { data: 'studentTypesTable'},
      { data: 'location'},
      { data: 'parentName'},
    ],
    "scrollY": "400px",
    "scrollCollapse": true,
    "paging": false
  } );

  studentTable.on('click', (args) => {
    //this should fix some "cannot read property of undefined" errors
    if (args?.target?._DT_CellIndex) {
      let studentUID = tableDataInactive[args.target._DT_CellIndex.row].studentUID;
      setupNavigationModal(studentUID);
      document.getElementById("navigationSection").style.display = "flex";
    }
  })
}

function reinitializeAllTableData() {
  if (studentTable) {
    studentTable.off('click');
    studentTable.destroy();
  }

  studentTable = $('#student-table').DataTable( {
    data: tableDataAll,
    columns: [
      { data: 'studentName' },
      { data: 'studentTypesTable'},
      { data: 'location'},
      { data: 'parentName'},
    ],
    "scrollY": "400px",
    "scrollCollapse": true,
    "paging": false
  } );

  studentTable.on('click', (args) => {
    //this should fix some "cannot read property of undefined" errors
    if (args?.target?._DT_CellIndex) {
      let studentUID = tableDataAll[args.target._DT_CellIndex.row].studentUID;
      setupNavigationModal(studentUID);
      document.getElementById("navigationSection").style.display = "flex";
    }
  })
}

function getStaffData() {
  let promises = [];

  //query all tutors
  promises.push(firebase.firestore().collection('Tutors')
  .get()
  .then((tutorQuerySnapshot) => {
    let tutorPromises = [];

    tutorQuerySnapshot.forEach((tutorDoc) => {
      const tutorData = tutorDoc.data();

      //figure out the location name
      let locationName = "";
      currentLocations.forEach((location) => {
        if (tutorData.location == location.id) {
          locationName = location.name;
        }
      })

      const tutor = {
        staffUID: tutorDoc.id,
        staffName: tutorData.tutorLastName + ", " + tutorData.tutorFirstName,
        staffType: 'Tutor',
        location: locationName,
      }
      return tableDataStaff.push(tutor);
    });
    return Promise.all(tutorPromises);
  })
  .catch((error) => {
    handleFirebaseErrors(error, window.location.href);
    console.log(error);
  }));

  //query all admins
  promises.push(firebase.firestore().collection('Admins')
  .get()
  .then((adminQuerySnapshot) => {
    let adminPromises = [];

    adminQuerySnapshot.forEach((adminDoc) => {
      const adminData = adminDoc.data();

      const admin = {
        staffUID: adminDoc.id,
        staffName: adminData.adminLastName + ", " + adminData.adminFirstName,
        staffType: 'Admin',
        location: 'All',
      }
      return tableDataStaff.push(admin);
    });
    return Promise.all(adminPromises);
  })
  .catch((error) => {
    handleFirebaseErrors(error, window.location.href);
    console.log(error);
  }));

  return Promise.all(promises);
}

function reinitializeStaffTableData() {
  if (staffTable) {
    staffTable.off('click');
    staffTable.destroy();
  }

  staffTable = $('#staff-table').DataTable( {
    data: tableDataStaff,
    columns: [
      { data: 'staffName' },
      { data: 'staffType'},
      { data: 'location'},
    ],
    "scrollY": "400px",
    "scrollCollapse": true,
    "paging": false
  } );

  staffTable.on('click', (args) => {
    //this should fix some "cannot read property of undefined" errors
    if (args?.target?._DT_CellIndex) {
      let staffUID = tableDataStaff[args.target._DT_CellIndex.row].staffUID;
      let staffName = tableDataStaff[args.target._DT_CellIndex.row].staffName;
      let staffType = tableDataStaff[args.target._DT_CellIndex.row].staffType;
      deleteStaff(staffUID, staffName, staffType)
      .then(() => {
        location.reload();
      })
      .catch((error) => {
        console.log(error)
      })
    }
  })
}

function deleteStaff(staffUID, staffName, staffType) {
  const confirmationName = prompt(`You are about to delete this staff member! This action cannot be undone. Type the staff member's name as it is shown below to continue.\n
  ${staffName}`);

  if (confirmationName === staffName) {
    const deleteUser = firebase.functions().httpsCallable('deleteUser');
    return deleteUser({
      uid: staffUID
    })
    .then(() => {
      return firebase.firestore().collection(staffType + 's').doc(staffUID).delete();
    })
    .catch((error) => {
      alert(error);
      console.log(error.message);
    })

  }
  else {
    alert('The staff name did not match so we will NOT be removing this staff. Make sure to match the name (commas included) if you really want to delete the staff member.')
    return Promise.reject('staff deletion validation failed');
  }
}

function setLocations () {
  const locationElems = document.querySelectorAll("select[id*=Location]");
  for (let i = 0; i < locationElems.length; i++) {
    let locationElem = locationElems[i];
    for (let j =  0; j < currentLocations.length; j++) {
      let option = document.createElement("option");
      option.value = currentLocations[j].id;
      option.innerText = currentLocations[j].name;
      locationElem.appendChild(option);
    }
  }
}

function getParentData(parentUID) {
  if (!parentUID) {
    return Promise.resolve({
      parentFirstName: 'PARENT',
      parentLastName: 'NO',
      parentUID: null,
    })
  }
  return firebase.firestore().collection('Parents').doc(parentUID).get()
  .then(parentDoc => {
    return {
      ...parentDoc.data(),
      parentUID: parentDoc.id
    }
  });
}

function goToInquiry() {
  window.location.href = "../inquiry.html";
}

function openModal(type) {
  document.getElementById("add-" + type + "-section").style.display = "flex";
}

function closeModal(type, submitted = false) {
  let allInputs = document.getElementById("add-" + type + "-section").querySelectorAll("input, select");
  let allClear = true;
  for(let i = 0; i < allInputs.length; i++) {
    if (allInputs[i].value != "") {
      allClear = false;
      break;
    }
  }

  if (!allClear && !submitted) {
    let confirmation = confirm("This " + type + " has not been saved.\nAre you sure you want to go back?");
    if (confirmation) {
      for(let i = 0; i < allInputs.length; i++) {
        allInputs[i].value = "";
      }
      document.getElementById("add-" + type + "-section").style.display = "none";
      let errorMessages = document.querySelectorAll("p[id$='ErrorMessage']");

      for (let err = errorMessages.length - 1; err >= 0; err--) {
        errorMessages[err].remove()
      }
    }
  }
  else {
    for(let i = 0; i < allInputs.length; i++) {
      allInputs[i].value = "";
    }
    document.getElementById("add-" + type + "-section").style.display = "none";
    let errorMessages = document.querySelectorAll("p[id$='ErrorMessage']");

    for (let err = errorMessages.length - 1; err >= 0; err--) {
      errorMessages[err].remove()
    }
  }
}

function createTutor() {
  document.getElementById("spinnyBoiTutor").style.display = "block";
  document.getElementById("tutorErrMsg").textContent = null;
  let allInputs = document.getElementById("add-tutor-section").querySelectorAll("input");

  if (validateFields([...allInputs, document.getElementById("tutorLocation")])) {
    // console.log("all clear");
    let allInputValues = {};
    for(let i = 0; i < allInputs.length; i++) {
      allInputValues[allInputs[i].id] = allInputs[i].value;
    }

    // console.log(allInputValues);

    //create the tutor account
    const addUser = firebase.functions().httpsCallable('addUser');
    addUser({
      email: allInputValues['tutorEmail'],
      password: "abc123",
      role: "tutor"
    })
    .then((result) => {

      let tutorUID = result.data.user.uid;
      let newUser = result.data.newUser;
      // console.log(tutorUID);
      // console.log(newUser);

      let currentLocation = document.getElementById("tutorLocation").value;

      if (newUser) {
        //set up the tutor doc
        const tutorDocRef = firebase.firestore().collection("Tutors").doc(tutorUID);
        let tutorDocData = {
          ...allInputValues,
          location: currentLocation
        }
        tutorDocRef.set(tutorDocData)
        .then((result) => {
          const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
          updateUserDisplayName({
            uid: tutorUID,
            displayName: allInputValues["tutorFirstName"] + " " + allInputValues["tutorLastName"]
          })
          .then(() => {
            document.getElementById("spinnyBoiTutor").style.display = "none";
            closeModal("tutor", true);
          })
          .catch((error) => {
            handleFirebaseErrors(error, window.location.href);
            document.getElementById("tutorErrMsg").textContent = error.message;
            document.getElementById("spinnyBoiTutor").style.display = "none";
          });
        })
        .catch((error) => {
          handleFirebaseErrors(error, window.location.href);
          document.getElementById("tutorErrMsg").textContent = error.message;
          document.getElementById("spinnyBoiTutor").style.display = "none";
        });
      }
      else {
        document.getElementById("tutorErrMsg").textContent = "This tutor already exists!";
        document.getElementById("spinnyBoiTutor").style.display = "none";
      }
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("tutorErrMsg").textContent = error.message;
      document.getElementById("spinnyBoiTutor").style.display = "none";
    })
  }
  else {
    // console.log("not done yet!!!");
    document.getElementById("spinnyBoiTutor").style.display = "none";
  }
}

function createSecretary() {
  document.getElementById("spinnyBoiSecretary").style.display = "block";
  document.getElementById("secretaryErrMsg").textContent = null;
  let allInputs = document.getElementById("add-secretary-section").querySelectorAll("input");
  if (validateFields(allInputs) && validateFields([document.getElementById("secretaryLocation")])) {
    // console.log("all clear");
    let allInputValues = {};
    for(let i = 0; i < allInputs.length; i++) {
      allInputValues[allInputs[i].id] = allInputs[i].value;
    }

    // console.log(allInputValues);

    //create the tutor account
    const addUser = firebase.functions().httpsCallable('addUser');
    addUser({
      email: allInputValues['secretaryEmail'],
      password: "abc123",
      role: "secretary"
    })
    .then((result) => {

      let secretaryUID = result.data.user.uid;
      let newUser = result.data.newUser;
      // console.log(secretaryUID);
      // console.log(newUser);

      let currentLocation = document.getElementById("secretaryLocation").value;

      if (newUser) {
        //set up the tutor doc
        const secretaryDocRef = firebase.firestore().collection("Secretaries").doc(secretaryUID);
        let secretaryDocData = {
          ...allInputValues,
          location: currentLocation
        }
        secretaryDocRef.set(secretaryDocData)
        .then((result) => {
          const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
          updateUserDisplayName({
            uid: secretaryUID,
            displayName: allInputValues["secretaryFirstName"] + " " + allInputValues["secretaryLastName"]
          })
          .then(() => {
            document.getElementById("spinnyBoiSecretary").style.display = "none";
            closeModal("secretary", true);
          })
          .catch((error) => {
            handleFirebaseErrors(error, window.location.href);
            document.getElementById("secretaryErrMsg").textContent = error.message;
            document.getElementById("spinnyBoiSecretary").style.display = "none";
          });
        })
        .catch((error) => {
          handleFirebaseErrors(error, window.location.href);
          document.getElementById("secretaryErrMsg").textContent = error.message;
          document.getElementById("spinnyBoiSecretary").style.display = "none";
        });
      }
      else {
        document.getElementById("secretaryErrMsg").textContent = "This secretary already exists!";
        document.getElementById("spinnyBoiSecretary").style.display = "none";
      }
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("secretaryErrMsg").textContent = error.message;
      document.getElementById("spinnyBoiSecretary").style.display = "none";
    })
  }
  else {
    // console.log("not done yet!!!");
    document.getElementById("spinnyBoiSecretary").style.display = "none";
  }
}

function createAdmin() {
  document.getElementById("spinnyBoiAdmin").style.display = "block";
  document.getElementById("adminErrMsg").textContent = null;
  let allInputs = document.getElementById("add-admin-section").querySelectorAll("input");
  if (validateFields(allInputs)) {
    // console.log("all clear");
    let allInputValues = {};
    for(let i = 0; i < allInputs.length; i++) {
      allInputValues[allInputs[i].id] = allInputs[i].value;
    }

    // console.log(allInputValues);

    //create the tutor account
    const addUser = firebase.functions().httpsCallable('addUser');
    addUser({
      email: allInputValues['adminEmail'],
      password: "abc123",
      role: "admin"
    })
    .then((result) => {

      let adminUID = result.data.user.uid;
      let newUser = result.data.newUser;
      // console.log(secretaryUID);
      // console.log(newUser);

      if (newUser) {
        //set up the tutor doc
        const adminDocRef = firebase.firestore().collection("Admins").doc(adminUID);
        let adminDocData = {
          ...allInputValues
        }
        adminDocRef.set(adminDocData)
        .then((result) => {
          const updateUserDisplayName = firebase.functions().httpsCallable('updateUserDisplayName');
          updateUserDisplayName({
            uid: adminUID,
            displayName: allInputValues["adminFirstName"] + " " + allInputValues["adminLastName"]
          })
          .then(() => {
            document.getElementById("spinnyBoiAdmin").style.display = "none";
            closeModal("admin", true);
          })
          .catch((error) => {
            handleFirebaseErrors(error, window.location.href);
            document.getElementById("adminErrMsg").textContent = error.message;
            document.getElementById("spinnyBoiAdmin").style.display = "none";
          });
        })
        .catch((error) => {
          handleFirebaseErrors(error, window.location.href);
          document.getElementById("adminErrMsg").textContent = error.message;
          document.getElementById("spinnyBoiAdmin").style.display = "none";
        });
      }
      else {
        document.getElementById("adminErrMsg").textContent = "This admin already exists!";
        document.getElementById("spinnyBoiAdmin").style.display = "none";
      }
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("adminErrMsg").textContent = error.message;
      document.getElementById("spinnyBoiAdmin").style.display = "none";
    })
  }
  else {
    // console.log("not done yet!!!");
    document.getElementById("spinnyBoiAdmin").style.display = "none";
  }
}

function createSchool() {
  document.getElementById("spinnyBoiSchool").style.display = "block";
  document.getElementById("schoolErrMsg").textContent = null;
  let allInputs = document.getElementById("add-school-section").querySelectorAll("input, select");

  if (validateFields(allInputs)) {
    let allInputValues = {};
    for(let i = 0; i < allInputs.length; i++) {
      allInputValues[allInputs[i].id] = allInputs[i].value.trim();
    }

    let schoolRef = firebase.firestore().collection("Schools").doc();
    schoolRef.set(allInputValues)
    .then(() => {
      document.getElementById("spinnyBoiSchool").style.display = "none";
      closeModal("school", true);
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("schoolErrMsg").textContent = error.message;
      document.getElementById("spinnyBoiSchool").style.display = "none";
    })
  }
  else {
    document.getElementById("spinnyBoiSchool").style.display = "none";
  }
}

function createExtracurricular() {
  document.getElementById("spinnyBoiExtracurricular").style.display = "block";
  document.getElementById("extracurricularErrMsg").textContent = null;
  let extracurricular = document.getElementById("extracurricular")

  if (validateFields([extracurricular])) {
    let extracurricularRef = firebase.firestore().collection("Dynamic-Content").doc("extracurriculars");
    extracurricularRef.update({
      extracurriculars: firebase.firestore.FieldValue.arrayUnion(extracurricular.value.trim())
    })
    .then(() => {
      document.getElementById("spinnyBoiExtracurricular").style.display = "none";
      closeModal("extracurricular", true);
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("extracurricularErrMsg").textContent = error.message;
      document.getElementById("spinnyBoiExtracurricular").style.display = "none";
    })
  }
  else {
    document.getElementById("spinnyBoiExtracurricular").style.display = "none";
  }
}

function createLocation() {
  document.getElementById("spinnyBoiLocation").style.display = "block";
  document.getElementById("locationErrMsg").textContent = null;
  let location = document.getElementById("location")

  if (validateFields([location])) {
    let locationRef = firebase.firestore().collection("Locations").doc();
    locationRef.update({
      locationName: location.value.trim()
    })
    .then(() => {
      document.getElementById("spinnyBoiLocation").style.display = "none";
      closeModal("location", true);
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      document.getElementById("locationErrMsg").textContent = error.message;
      document.getElementById("spinnyBoiLocation").style.display = "none";
    })
  }
  else {
    document.getElementById("spinnyBoiLocation").style.display = "none";
  }
}

function resetPassword() {
  let confirmation = confirm("Are you sure you want to reset your password?");
  if (confirmation) {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var auth = firebase.auth();
        var emailAddress = user.email;

        auth.sendPasswordResetEmail(emailAddress)
        .then(function() {
          // Email sent.
          alert("An email has been sent to your email to continue with your password reset.");
        })
        .catch(function(error) {
          // An error happened.
          alert("There was an issue with your password reset. \nPlease try again later.");
          handleFirebaseErrors(error, window.location.href);
        });
      } else {
        // No user is signed in.
        alert("Oops! No one is signed in to change the password");
      }
    });
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
    if (inputs[i].id.includes("Email")) {
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
  return allClear;
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


//for the old selects
// function pendingStudentSelected(e) {
//   let uids = e.value;
//   let studentTempUID = uids.split(",")[0];
//   let parentUID = uids.split(",")[1];
//   let queryStr = "?student=" + studentTempUID + "&parent=" + parentUID + "&location=" + currentLocation;
//   window.location.href = "../Forms/New Student/New Student Form.html" + queryStr;
// }

// function activeStudentSelected(e) {
//   let studentUID = e.value;
//   let queryStr = "?student=" + studentUID;
//   window.location.href = "../Forms/ACT Daily Log/Daily Log.html" + queryStr;
// }

function setupNavigationModal(studentUID) {
  const modal = document.getElementById("navigationSection");
  let queryStr = "?student=" + studentUID;

  document.getElementById("actNav").onclick = () => {
    modal.style.display = 'none';
    window.location.href = "../Forms/ACT Daily Log/Daily Log.html" + queryStr
  };
  document.getElementById("subjectTutoringNav").onclick = () => {
    modal.style.display = 'none';
    window.location.href = "../subject-tutoring-dash.html" + queryStr
  };
  document.getElementById("mathProgramNav").onclick = () => {
    modal.style.display = 'none';
    window.location.href = "../math-program.html" + queryStr
  };
  document.getElementById("phonicsProgramNav").onclick = () => {
    modal.style.display = 'none';
    window.location.href = "../phonics-program.html" + queryStr
  };
  document.getElementById("registrationNav").onclick = () => {
    modal.style.display = 'none';
    window.location.href = "../inquiry.html" + queryStr
  };
}




function pendingStudentSelected(studentUID, parentUID, location) {
  let queryStr = "?student=" + studentUID + "&parent=" + parentUID + "&location=" + location;
  window.location.href = "../Forms/New Student/New Student Form.html" + queryStr;
}

function actStudentSelected(studentUID) {
  let queryStr = "?student=" + studentUID;
  window.location.href = "../Forms/ACT Daily Log/Daily Log.html" + queryStr;
}

function subjectTutoringStudentSelected(studentUID) {
  let queryStr = "?student=" + studentUID;
  window.location.href = "../subject-tutoring-dash.html" + queryStr;
}

function mathProgramSelected(studentUID) {
  let queryStr = "?student=" + studentUID;
  window.location.href = "../math-program.html" + queryStr;
}

function phonicsProgramSelected(studentUID) {
  let queryStr = "?student=" + studentUID;
  window.location.href = "../phonics-program.html" + queryStr;
}

function handleSchoolGrade() {
  const schoolGradeMin = document.getElementById("schoolGradeMin");
  const schoolGradeMax = document.getElementById("schoolGradeMax");
  //undo the formatting for college stuff
  schoolGradeMax.disabled = false;
  schoolGradeMax.style.visibility = "visible";
  schoolGradeMin.parentNode.parentNode.classList.remove("noRange");

  let minGrade = parseInt(schoolGradeMin.value);
  let maxGrade = parseInt(schoolGradeMax.value);

  //check for college values
  if (minGrade == -1 || maxGrade == -1) {
    schoolGradeMin.value = -1;
    schoolGradeMax.value = null;
    schoolGradeMax.disabled = true;
    schoolGradeMax.style.visibility = "hidden";
    schoolGradeMin.parentNode.parentNode.classList.add("noRange");
    return;
  }

  //make sure that min < max
  if (minGrade > maxGrade) {
    schoolGradeMin.value = maxGrade;
    schoolGradeMax.value = minGrade;
  }
}

function submitFeedback() {
  let submitBtn = document.getElementById("feedback_submit_btn");
  let errorMsg = document.getElementById("feedback_error_msg");

  submitBtn.disabled = true;
  errorMsg.textContent = "";

  let feedbackInput = document.getElementById("feedback_input");

  //check for a valid input
  if (feedbackInput.value.trim() != "") {
    let valid = confirm("Are you sure you're ready to submit this feedback?");
    if (valid) {
      const feedbackRef = firebase.firestore().collection("Feedback").doc();
      feedbackRef.set({
        user: firebase.auth().currentUser.uid,
        feedback: feedbackInput.value,
        timestamp: (new Date().getTime())
      })
      .then(() => {
        feedbackInput.value = "";
        submitBtn.disabled = false;
        errorMsg.textContent = "We got it! Thanks for the feedback";
      })
      .catch((error) => {
        handleFirebaseErrors(error, window.location.href);
        submitBtn.disabled = false;
        errorMsg.textContent = "You're feedback was too honest for the computer to process. Please try again later.";
      })
    }
  }
  else {
    document.getElementById("feedback_error_msg").textContent = "...you didn't even write anything."
    submitBtn.disabled = false;
  }
} 
