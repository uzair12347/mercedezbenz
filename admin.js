const firebaseConfig = {
      apiKey: "AIzaSyBUiCellYmyU-a6ZCh0jo7O2UUe8GAV7s0",
      authDomain: "mercedezbenz79-17037.firebaseapp.com",
      databaseURL: "https://mercedezbenz79-17037-default-rtdb.firebaseio.com",
      projectId: "mercedezbenz79-17037",
      storageBucket: "mercedezbenz79-17037.appspot.com",
      messagingSenderId: "328685720441",
      appId: "1:328685720441:web:ae850d085363ee4a1b55a8",
      measurementId: "G-G2K4V2LZEW"
    };

    // ✅ Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth(); 


    // ✅ Admin check
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      window.location.href = "admin-login.html";
    }

    const pendingPlansContainer = document.getElementById("pending-container");

    // ✅ Fetch and display plans
    async function fetchPendingPlans() {
      try {
        const snapshot = await db.collection("userPlanRequests").get();

        if (snapshot.empty) {
          pendingPlansContainer.innerHTML = "<p>No pending plans</p>";
          return;
        }

        let html = "";
        snapshot.forEach(doc => {
          const plan = doc.data();
          if (plan.status !== "pending") return;

          html += `
            <div class="plan-card">
              <p><strong>User:</strong> ${plan.userPhone || "N/A"}</p>
              <p><strong>Plan:</strong> ${plan.planName || "N/A"}</p>
              <p><strong>Transaction ID:</strong> ${plan.transactionId || "N/A"}</p>
              <p><strong>Status:</strong> ${plan.status}</p>
              <button onclick="approvePlan('${doc.id}')">Approve</button>
              <button onclick="rejectPlan('${doc.id}')">Reject</button>
            </div>
          `;
        });

        pendingPlansContainer.innerHTML = html || "<p>No pending plans</p>";
      } catch (err) {
        console.error("Error fetching plans:", err);
        pendingPlansContainer.innerHTML = "<p>Error loading plans</p>";
      }
    }

    // ✅ Approve plan
   // ✅ Approve plan and also add to approvedPlans collection
async function approvePlan(planId) {
  try {
    const planRef = db.collection("userPlanRequests").doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      alert("Plan not found");
      return;
    }

    const planData = planDoc.data();
    const uid = planData.userId || "unknown";

//     if (!planData.userPhone) {
//   alert("User phone number missing. Please log in again.");
//   window.location.href = "admin-login.html";
//   return;
// }
let userPhone = "unknown";
    let invitedBy = null;


     
    if (uid) {
      const userRef = db.collection("users").doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const userData = userSnap.data();
        userPhone = userData.phone || "unknown";
          invitedBy = userData.invitedBy || null;

      }
    }

    // 1. Update status in userPlanRequests
    await planRef.update({ status: "approved" });

   
    // 2. Add to approvedPlans collection
    await db.collection("approvedPlans").doc(planId).set({
      ...planData,
       userPhone:userPhone,
      transactionId: planData.transactionId || 0,
       dailyIncome: planData.dailyIncome ?? 0,
       completedDays: 0,
       method: planData.method || "N/A",
      planName: planData.planName || "N/A", // <-- This must exist, no "N/A"
      status: "approved",
      uid: uid,
      approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      nextEarningAt: firebase.firestore.Timestamp.fromDate(
          new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ghante baad ka waqt
      )
    });

     let commissionRates = [0.25, 0.15, 0.10]; // Level 1, 2, 3
    let currentRef = invitedBy;
    let level = 0;

    while (currentRef && level < 3) {
      const refSnap = await db.collection("users").doc(currentRef).get();
      if (!refSnap.exists) break;

      const refData = refSnap.data();
      const amount = parseFloat(planData.amount) || 0;
      const commission = amount * commissionRates[level];

      await db.collection("users").doc(currentRef).update({
        accountBalance: firebase.firestore.FieldValue.increment(commission),
        totalCommission: firebase.firestore.FieldValue.increment(commission)
      });

      // move up the chain
      currentRef = refData.invitedBy || null;
      level++;
    }


    alert("Plan approved and added to approvedPlans");
    fetchPendingPlans();
  } catch (err) {
    console.error("Approve error:", err);
    alert("Error approving plan");
  }
}


    // ✅ Reject plan
    async function rejectPlan(planId) {
      try {
        await db.collection("userPlanRequests").doc(planId).update({
          status: "rejected"
        });
        alert("Plan rejected");
        fetchPendingPlans();
      } catch (err) {
        console.error("Reject error:", err);
        alert("Error rejecting plan");
      }
    }

    // ✅ Logout
    function logout() {
      localStorage.removeItem("isAdmin");
      window.location.href = "admin-login.html";
    }

    // ✅ Initial load
    fetchPendingPlans();
