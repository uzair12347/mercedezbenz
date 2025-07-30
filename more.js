document.querySelectorAll(".plan-card a").forEach((btn, index) => {
    btn.addEventListener("click", function (e) {
      // Plan Data List (ordered)
      const plans = [
        { id: "mercedez1", title: "MERCEDEZ 1", amount: 500 },
        { id: "mercedez2", title: "MERCEDEZ 2", amount: 1000 },
        { id: "mercedez3", title: "MERCEDEZ 3", amount: 3000 },
        { id: "mercedez4", title: "MERCEDEZ 4", amount: 5000 },
        { id: "mercedez5", title: "MERCEDEZ 5", amount: 10000 },
        { id: "mercedez6", title: "MERCEDEZ 6", amount: 30000 },
        { id: "mercedez7", title: "MERCEDEZ 7", amount: 70000 },
        { id: "mercedez8", title: "MERCEDEZ 8", amount: 100000 },
      ];

      const plan = plans[index];
      if (plan) {
        localStorage.setItem("selectedPlanId", plan.id);
        localStorage.setItem("selectedPlanName", plan.title);
        localStorage.setItem("selectedPlanAmount", plan.amount);
        // Optional: clear old payment method
        localStorage.removeItem("selectedPaymentMethod");
      }
    });
  });
