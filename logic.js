  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAH498q5xfRdRITk_-cg4OlD50_4zRz5SU",
    authDomain: "jproject-f5600.firebaseapp.com",
    databaseURL: "https://jproject-f5600.firebaseio.com",
    projectId: "jproject-f5600",
    storageBucket: "jproject-f5600.appspot.com",
    messagingSenderId: "410141371595"
  };
  firebase.initializeApp(config);

  // Create a variable to reference the database
  var database = firebase.database();

  var trainName = "";
  var destination = "";
  var firstTrainTime = "";
  var frequency = 0;
  var currentTime;


  var databaseRef = database.ref('trainScheduler');
  console.log("database: "+ database)
  console.log("databaseRef: "+ databaseRef);

  runTime();
  displayTime();
  runPanels();

  // Capture Button Click
  $("#add-train").on("click", function(event) {
    event.preventDefault();

    trainName = $("#train-input").val().trim();
    destination = $("#destination-input").val().trim();
    firstTrainTime = $("#time-input").val().trim();
    frequency = $("#frequency-input").val().trim();

    // Code for the push
    databaseRef.push({

      trainName: trainName,
      destination: destination,
      firstTrainTime: firstTrainTime,
      frequency: frequency,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
    clearForm();
  });

  $(document.body).on("click", ".remove", function(event) {
    event.preventDefault();
    var nameSearch = $(this).attr("data-name");
    console.log("event: "+ nameSearch);
    // debugger;

    var query = databaseRef.orderByKey();
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var key = childSnapshot.key;
          console.log("key: "+ key);
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          console.log("childData: "+ childData.trainName);
          if(nameSearch == childData.trainName) {
            console.log("true " + database.ref('trainScheduler/'+key));
            var nameSearchRef = database.ref('trainScheduler/'+key);
            nameSearchRef.remove()
              .then(function() {
                console.log("Remove succeeded.")
              })
              .catch(function(error) {
                console.log("Remove failed: " + error.message)
              });
              runPanels();
              return true;
          }
      });
    });
    
  });

  //keep updating information on the page
  function runTime() {
    var intervalId = setInterval(displayTime, 1000);
  };

  function runPanels() {
    $('#train-list').empty();

    // Firebase watcher + initial loader
    databaseRef.on("child_added", function(childSnapshot) {
      result = childSnapshot.val();

      var firstTrainTimeConverted = moment(result.firstTrainTime, "hh:mm").subtract(1, "years");

          // Current Time
      var currentTime = moment();

          // Difference between the times
      var diffTime = moment().diff(moment(firstTrainTimeConverted), "minutes");

      // Time apart (remainder)
      var tRemainder = diffTime % result.frequency;

          // Minute Until Train
      var tMinutesTillTrain = result.frequency - tRemainder;

          // Next Train
      var nextTrain = moment().add(tMinutesTillTrain, "minutes");

      var row = $('<tr>');
      row.append($('<td>').text(result.trainName));
      row.append($('<td>').text(result.destination));
      row.append($('<td>').text(result.frequency));
      row.append($('<td>').text(moment(nextTrain).format("hh:mm")));
      row.append($('<td>').text(tMinutesTillTrain));
      row.append($('<td>').html($("<button class='btn btn-primary remove'>remove</button>").attr("data-name", result.trainName)));
      $('#train-list').append(row);


    // Handle the errors
    }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
    });
  };

  function displayTime() {
  currentTime = moment().format('MMMM Do YYYY, h:mm:ss a');
  $(".display-5").text(currentTime);
  };

  function clearForm(){
    $("#train-input").val(" ");
    $("#destination-input").val(" ");
    $("#time-input").val(" ");
    $("#frequency-input").val(" ");
  };
