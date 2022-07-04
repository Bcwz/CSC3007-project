// The svg
const svg = d3.select("#worldmap"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const projection = d3
  .geoNaturalEarth1()
  .scale(width / 1.3 / Math.PI)
  .translate([width / 2, height / 2]);

// Load external data and boot

Promise.all([
  d3.json("./data/world.geojson"),
  d3.csv("./data/total-air-passenger-departures-by-country.csv"),
  d3.csv("./data/total-air-passenger-arrivals-by-country.csv"),
]).then((data) => {
  /*
  In percentage.

  Like from Jan 2020 -Jan 2021, passengers movement increased/ decreased by 10% for country X.

  */

  // Need to use front-end user input the months range
  let departStartMonth = data[1].filter((date) => date.month === "2012-02");
  let departEndMonth = data[1].filter((date) => date.month === "2020-02");

  let flightPercentage = {};

  departStartMonth.forEach((element, index) => {
    // flightPercentage.push({
    //   start_month: element.month,
    //   end_month: departEndMonth[index].month,
    //   country: element.level_3,
    //   passenger_movement: percIncrease(
    //     element.value,
    //     departEndMonth[index].value
    //   ),
    // });
    flightPercentage[element.level_3] = {
      start_month: element.month,
      end_month: departEndMonth[index].month,
      country: element.level_3,
      passenger_movement: percIncrease(
        element.value,
        departEndMonth[index].value
      ),
    };
  });

  console.log(flightPercentage);
  console.log(data[0].features);

  // Display World Map..

  negativePercentageColors = d3.schemeReds[6].reverse();
  positivePercentageColors = d3.schemeGreens[6];

  let color_scale = d3
    .scaleThreshold()
    .domain([-100, -80, -60, -40, -10, 0, 20, 40, 60, 80, 100])
    .range(negativePercentageColors.concat(positivePercentageColors));

  svg
    .append("g")
    .selectAll("path")
    .data(data[0].features)
    .join("path")
    // .attr("fill", "#69b3a2")
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
      console.log(flightPercentage[d.properties.name]);
      d3.select(event.currentTarget)
        .style("stroke", "orange")
        .style("stroke-width", 3)
        .style("opacity", 1);
    })
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget)
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("opacity", 1);
    });
});

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
