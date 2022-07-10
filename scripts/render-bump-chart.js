function renderBumpChart(data) {
  //initial values
  let inputDirection = document.querySelector(
    "[name='direction']:checked"
  ).value;
  let selectedYear = "2017";

  // Direction Input
  Array.from(document.querySelectorAll("[name='direction']")).forEach(
    (input) => {
      input.addEventListener("input", (event) => {
        inputDirection = event.target.value;
        updateVisualization();
      });
    }
  );

  const dateInputElement = document.getElementById("bumpChartYearInput");
  dateInputElement.addEventListener("datechange", (event) => {
    selectedYear = event.detail;
    updateVisualization();
  });
  new DateInput({
    parentElement: dateInputElement,
    initialValue: selectedYear,
    yearOnly: true,
  });

  // Bump Chart
  const bumpChart = new BumpChart({
    parentElement: document.getElementById("bumpChartArea"),
    data,
    inputDirection,
    selectedYear,
  });

  function updateVisualization() {
    bumpChart.inputDirection = inputDirection;
    bumpChart.selectedYear = selectedYear;
    bumpChart.updateVisualization();
  }
}
