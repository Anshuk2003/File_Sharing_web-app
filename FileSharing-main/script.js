// Firebase configuration containing API keys and project settings
const firebaseConfig = {
  apiKey: "AIzaSyBDLjIkEfcSKUvmeXHolFB1cLjmkCCYwp0",
  authDomain: "fileshare-ade8a.firebaseapp.com",
  databaseURL: "https://fileshare-ade8a-default-rtdb.firebaseio.com",
  projectId: "fileshare-ade8a",
  storageBucket: "fileshare-ade8a.appspot.com",
  messagingSenderId: "293246086346",
  appId: "1:293246086346:web:f99de8f2a75b1b9353d833"
};
  
// Initialize Firebase with the provided configuration
firebase.initializeApp(firebaseConfig);

// Reference to the "image" node in the Firebase Realtime Database
var messagesRef = firebase.database().ref("image");
// Function to upload an file to Firebase Storage
function uploadImage() {
  // Check if a file is selected
  if (document.getElementById("file").value != "") {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Uploading...";
    var file = document.getElementById("file").files[0];
    // Create a reference to the storage location for the file
    var storageRef = firebase.storage().ref("images/" + file.name);
    // Upload the file to Firebase Storage
    var uploadTask = storageRef.put(file);
    
     // Update upload progress
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        // Calculate upload progress
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(2);
        // console.log("Upload is " + progress + "% done");
        document.getElementById("upload").innerHTML = "Uploading"+" "+progress+"%...";
      },
      function (error) {
        console.log(error.message);
        document.getElementById("upload").innerHTML = "Upload Failed";
      },
      function () {
         // Once upload is complete, get the download URL and save it to real time database
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          //console.log("File available at", downloadURL);
          // Save the download URL to the database
          saveMessage(downloadURL);
        });
      }
    );
  } else {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Please select a file";
    // After 2 sec make it empty
    setTimeout(function () {
      document.getElementById("upload").innerHTML = uploadtext;
    }, 2000);
  }
}



// Function to save message (download URL and unique number) to Firebase Realtime database
function saveMessage(downloadURL) {
  // Create a new reference to push a new message entry to the database
  var newMessageRef = messagesRef.push();
  // Generate a unique number for the message
  var unique = createUniquenumber();
  // Hide the "Receive File" section
  var x = document.getElementById("downloadiv");
  x.style.display = "none";
   // Show the "Unique ID" section
  var showUnique = document.getElementById("ShowUniqueID");
  var shU = document.getElementById("showunique");
  shU.value = unique;
  showUnique.style.display = "block";
 // Save the message details  to the database
  newMessageRef.set({
    url: downloadURL,  
    number: unique,   
  });
  document.getElementById("upload").innerHTML = "Upload Successful";
  //Make file input empty
  document.getElementById("file").value = "";
}

function createUniquenumber() {
  // Create a unique 5 digit number for each image which is not in the database field number yet
  var number = Math.floor(10000 + Math.random() * 90000);
  // Reference to the "image" node in the Firebase Realtime Database
  var ref = firebase.database().ref("image");
  // Listen for changes in the database
  ref.on("value", function (snapshot) {
    // Iterate through each child node in the database
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      // Check if the generated number already exists in the database
      if (childData.number == number) {
      // If the number exists, recursively call the function to generate a new number
        createUniquenumber();
      }
    });
  });
  return number;
}
//Function to display and download the image associated with a given unique ID.
function showimage() {
  var uniqueId = document.getElementById("unique").value;
  if (uniqueId == "") {
    alert("Unique Id is empty\n Please enter a Unique Id");
    return;
  }
  // Reference to the "image" node in the Firebase Realtime Database
  var ref = firebase.database().ref("image");
  var flag = 0;
  // Listen for changes in the database
  ref.on("value", function (snapshot) {
  // Iterate through each child node in the database
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == uniqueId) {
        flag = 1;
        // Open a new window/tab to display the image using its URL
        window.open(childData.url, "_blank");
        //ref.child(childSnapshot.key).remove();
        // Remove file from storage
        //Run this with 5sec delay
        setTimeout(function () {
          var storageRef = firebase.storage().refFromURL(childData.url);
          storageRef
            .delete()
            .then(function () {
              // If file deletion is successful, also remove the image data from the database
              ref.child(childSnapshot.key).remove();
            })
            .catch(function (error) {
              console.error("Error deleting file:", error);
            });
        }, 15000);
      }
    });
  });
}

function flesize() {
  var file = document.getElementById("file").files[0];
  // Dont allow file size greater than 100MB
  if (file.size > 100000000) {
    alert(
      "File size is greater than 100MB\n Please select a file less than 100MB"
    );
    document.getElementById("file").value = "";
  }
}

// Click on download button when enter is pressed
document.getElementById("unique").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("show").click();
  }
});