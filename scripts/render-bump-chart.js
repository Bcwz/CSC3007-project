function renderBumpChart(data) {
  //initial values
  let inputDirection = document.querySelector(
    "[name='direction']:checked"
  ).value;
  let selectedYear = "2018";

  let paras = document.getElementsByClassName("bump-chart-wrapper");

  // Direction Input
  Array.from(document.querySelectorAll("[name='direction']")).forEach(
    (input) => {
      input.addEventListener("input", (event) => {
        inputDirection = event.target.value;
        while (paras[0]) {
          paras[0].parentNode.removeChild(paras[0]);
        }
        updateVisualization();
      });
    }
  );

  const dateInputElement = document.getElementById("bumpChartYearInput");
  dateInputElement.addEventListener("datechange", (event) => {
    while (paras[0]) {
      paras[0].parentNode.removeChild(paras[0]);
    }
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
    bumpChart.initizalizeBumpChart();
  }
}
