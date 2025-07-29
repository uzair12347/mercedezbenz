// Make sure Firebase SDK is loaded in your HTML:
// <script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"></script>
// <script src="firebase-config.js"></script>

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    alert("Please log in first");
    window.location.href = "login.html";
  } else {
    console.log("User is logged in:", user.phoneNumber);
    // You can access user.uid, user.phoneNumber, etc., if needed
  }
});
