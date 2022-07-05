// The svg
const svg = d3.select("#worldmap"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const projection = d3
  .geoNaturalEarth1()
  .scale(width / 1.3 / Math.PI)
  .translate([width / 2, height / 2]);

// legend color scale
let negativePercentageColors = d3.schemeReds[6].reverse();
let positivePercentageColors = d3.schemeGreens[6];

let color_scale = d3
  .scaleThreshold()
  .domain([-100, -80, -60, -40, -10, 0, 10, 40, 60, 80, 100])
  .range(negativePercentageColors.concat(positivePercentageColors));

// Load external data and boot
Promise.all([
  d3.json("./data/world.geojson"),
  d3.csv("./data/total-air-passenger-departures-by-country.csv"),
  d3.csv("./data/total-air-passenger-arrivals-by-country.csv"),
]).then((data) => {
  // Need to use front-end user to toggle between arrival/ departure & the month range

  // toggle between arrival & departure dataset
  d3.select("#opts").on("change", function () {
    let display_type = d3.select(this).property("value");

    if (display_type === "arrival") {
      console.log("Arrival Dataset");
      datasetToggle(display_type, data);
    } else {
      console.log("Departure Dataset");
      datasetToggle(display_type, data);
    }
  });

  datasetToggle("arrival", data);

  legend({
    color: color_scale,
    title: "Passenger Movement (%)",
    marginLeft: 2,
  });
});

/*
  Toggle dataset between arrival & departure

  Work In Progress... user must able to select start & end month
*/
function datasetToggle(option, data) {
  let optionValue;

  let startDate; // Testing Purpose (Remove When Date Range Is Done)
  let endDate; // Testing Purpose (Remove When Date Range Is Done)

  if (option === "departure") {
    optionValue = 1;
    startDate = "2012-02";
    endDate = "2020-02";
  } else {
    startDate = "2012-02";
    endDate = "2019-08";
    optionValue = 2;
  }

  let startMonth = data[optionValue].filter((date) => date.month === startDate);

  let endMonth = data[optionValue].filter((date) => date.month === endDate);

  let flightPercentage = {};

  startMonth.forEach((element, index) => {
    flightPercentage[element.level_3] = {
      start_month: element.month,
      end_month: endMonth[index].month,
      start_month_passenger: element.value,
      end_month_passenger: endMonth[index].value,
      country: element.level_3,
      passenger_movement: percIncrease(element.value, endMonth[index].value),
    };
  });

  svg
    .append("g")
    .selectAll("path")
    .data(data[0].features)
    .join("path")
    .attr("fill", (d) => {
      // map the colors later
      if (d.properties.name in flightPercentage) {
        return color_scale(
          flightPercentage[d.properties.name].passenger_movement
        );
      } else {
        return "#1d1c1a";
      }
    })
    .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "#fff")
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget)
        .style("stroke", "orange")
        .style("stroke-width", 3)
        .style("opacity", 1);

      d3.select(".svg-tooltip")
        .style("opacity", 1)
        .style("stroke", "black")
        .style("stroke-width", "3px")
        .style("rx", 10)
        .style("fill", "white");

      let datasetType = document.getElementById("dataset-type");
      let startMonthTotalPassenger = document.getElementById(
        "start-month-total-passenger"
      );
      let endMonthTotalPassenger = document.getElementById(
        "end-month-total-passenger"
      );

      if (flightPercentage[d.properties.name] === undefined) {
        datasetType[
          "innerText" in datasetType ? "innerText" : "textContent"
        ] = `${option[0].toUpperCase() + option.slice(1)} To Singapore`;
        startMonthTotalPassenger[
          "innerText" in startMonthTotalPassenger ? "innerText" : "textContent"
        ] = "Total Passengers: 0";

        endMonthTotalPassenger[
          "innerText" in endMonthTotalPassenger ? "innerText" : "textContent"
        ] = "Total Passengers: 0";
      } else {
        datasetType[
          "innerText" in datasetType ? "innerText" : "textContent"
        ] = `${option[0].toUpperCase() + option.slice(1)} To Singapore`;

        startMonthTotalPassenger[
          "innerText" in startMonthTotalPassenger ? "innerText" : "textContent"
        ] = `Total Passengers (${
          flightPercentage[d.properties.name].start_month
        }) : ${flightPercentage[d.properties.name].start_month_passenger}`;

        endMonthTotalPassenger[
          "innerText" in endMonthTotalPassenger ? "innerText" : "textContent"
        ] = `Total Passengers (${
          flightPercentage[d.properties.name].end_month
        }) : ${flightPercentage[d.properties.name].end_month_passenger}`;
      }
    })
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget)
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("opacity", 1);

      d3.select(".svg-tooltip").style("opacity", 0).style("fill", "white");

      let datasetType = document.getElementById("dataset-type");
      let startMonthTotalPassenger = document.getElementById(
        "start-month-total-passenger"
      );
      let endMonthTotalPassenger = document.getElementById(
        "end-month-total-passenger"
      );

      datasetType["innerText" in datasetType ? "innerText" : "textContent"] =
        "";
      startMonthTotalPassenger[
        "innerText" in startMonthTotalPassenger ? "innerText" : "textContent"
      ] = "";
      endMonthTotalPassenger[
        "innerText" in endMonthTotalPassenger ? "innerText" : "textContent"
      ] = "";
    });
}

/*
  In percentage.

  Like from Jan 2020 -Jan 2021, passengers movement increased/ decreased by 10% for country X.

*/
function percIncrease(startDate, endDate) {
  let percent;
  if (endDate !== 0) {
    if (startDate !== 0) {
      percent = ((endDate - startDate) / startDate) * 100;
    } else {
      percent = endDate * 100;
    }
  } else {
    percent = -startDate * 100;
  }

  return percent.toFixed(3);
}
