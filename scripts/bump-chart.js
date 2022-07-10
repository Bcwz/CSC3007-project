class BumpChart {
  constructor({ parentElement, data, inputDirection, selectedYear }) {
    this.parentElement = parentElement;
    this.data = data;
    this.inputDirection = inputDirection;
    this.selectedYear = selectedYear;
    this.initizalizeBumpChart();
  }

  initizalizeBumpChart() {
    console.log("Initizalize Bump Chart");
    this.marginLeft = 105;
    this.marginRight = 105;
    this.marginTop = 20;
    this.marginBottom = 50;
    this.padding = 25;
    this.bumpRadius = 5;
    this.height = 500;

    this.yScale = d3
      .scalePoint()
      .range([this.marginTop, this.height - this.marginBottom - this.padding]);

    this.seq = (start, length) =>
      Array.apply(null, { length: length }).map((d, i) => i + start);

    this.drawingStyle = "default";

    this.wrapper = d3
      .select(this.parentElement)
      .classed("bump-chart", true)
      .append("div")
      .attr("class", "chart-wrapper");

    this.svg = this.wrapper.append("svg").attr("class", "chart-svg");

    this.resizeVisualization();
    this.updateVisualization();

    this.svg
      .append("g")
      .attr("transform", `translate(${this.marginLeft + this.padding},0)`)
      .selectAll("path")
      .data(this.seq(0, this.xDomain.size))
      .join("path")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("d", (d) =>
        d3.line()([
          [this.bx(d), 0],
          [this.bx(d), this.height - this.marginBottom],
        ])
      );
  }

  resizeVisualization() {
    this.width = this.parentElement.clientWidth;

    this.svg
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("cursor", "default")
      .attr("viewBox", [0, 0, this.width, this.height]);
  }

  updateVisualization() {
    console.log("Updating Bump Chart Visualization");
    this.displayData = this.data.filter(
      (d) =>
        d.direction === this.inputDirection &&
        d.date.includes(this.selectedYear)
    );
    this.X = this.displayData.map((d) => d.date);
    this.Y = this.displayData.map((d) => d.name);

    this.xDomain = new Set(this.X);
    this.yDomain = new Set(this.Y);

    // this.xScale.domain(this.xDomain);
    // this.yScale.domain(this.yDomain);

    const len = this.yDomain.size - 1;
    const ranking = this.chartData().map((d, i) => ({
      name: Array.from(this.yDomain)[i],
      first: d[0].rank,
      last: d[len].rank,
    }));

    this.color = d3
      .scaleOrdinal(d3.schemeTableau10)
      .domain(this.seq(0, ranking.size));

    this.left = ranking.sort((a, b) => a.first - b.first).map((d) => d.name);
    this.right = ranking.sort((a, b) => a.last - b.last).map((d) => d.name);

    this.y = d3
      .scalePoint()
      .range([this.marginTop, this.height - this.marginBottom - this.padding]);

    this.ax = d3
      .scalePoint()
      .domain(Array.from(this.xDomain))
      .range([
        this.marginLeft + this.padding,
        this.width - this.marginRight - this.padding,
      ]);

    this.by = d3
      .scalePoint()
      .domain(this.seq(0, this.yDomain.size))
      .range([this.marginTop, this.height - this.marginBottom - this.padding]);

    this.bx = d3
      .scalePoint()
      .domain(this.seq(0, this.xDomain.size))
      .range([
        0,
        this.width - this.marginLeft - this.marginRight - this.padding * 2,
      ]);

    this.strokeWidth = d3
      .scaleOrdinal()
      .domain("default")
      .range([5, this.bumpRadius * 2 + 2, 2]);

    this.title = (g) =>
      g
        .append("title")
        .text(
          (d, i) =>
            `${d.name} - ${Array.from(this.xDomain)[i]}\nRank: ${
              d.value.rank + 1
            }\nPassengers ${this.inputDirection}: ${d.value.value}`
        );

    this.drawAxis = (g, x, y, axis, domain) => {
      g.attr("transform", `translate(${x},${y})`)
        .call(axis)
        .selectAll(".tick text")
        .attr("font-size", "12px");
      if (!domain) g.select(".domain").remove();
    };

    const leftY = this.svg
      .append("g")
      .call((g) =>
        this.drawAxis(
          g,
          this.marginLeft,
          0,
          d3.axisLeft(this.yScale.domain(this.left))
        )
      );

    const rightY = this.svg
      .append("g")
      .call((g) =>
        this.drawAxis(
          g,
          this.width - this.marginRight,
          0,
          d3.axisRight(this.yScale.domain(this.right))
        )
      );

    let chartMatrix = this.chartData();

    const series = this.svg
      .selectAll(".series")
      .data(chartMatrix)
      .join("g")
      .attr("class", "series")
      .attr("opacity", 1)
      .attr("fill", (d) => this.color(d[0].rank))
      .attr("stroke", (d) => this.color(d[0].rank))
      .attr("transform", `translate(${this.marginLeft + this.padding},0)`)
      .on("mouseover", (e, d) => {
        series
          .filter((s) => s !== d)
          .transition()
          .duration(500)
          .attr("fill", "#ddd")
          .attr("stroke", "#ddd");

        markTick(leftY, 0, d);
        markTick(rightY, this.yDomain.size - 1, d);

        function markTick(axis, pos, d) {
          axis
            .selectAll(".tick text")
            .filter((s, i) => i === d[pos].rank)
            .transition()
            .duration(500)
            .attr("font-weight", "bold");
        }
      })
      .on("mouseout", () => {
        series
          .transition()
          .duration(500)
          .attr("fill", (s) => this.color(s[0].rank))
          .attr("stroke", (s) => this.color(s[0].rank));
        restoreTicks(leftY);
        restoreTicks(rightY);

        function restoreTicks(axis) {
          axis
            .selectAll(".tick text")
            .transition()
            .duration(500)
            .attr("font-weight", "normal")
            .attr("fill", "black");
        }
      });

    series
      .selectAll("path")
      .data((d) => d)
      .join("path")
      .attr("stroke-width", 5)
      .attr("d", (d, i) => {
        if (d.next)
          return d3.line()([
            [this.bx(i), this.by(d.rank)],
            [this.bx(i + 1), this.by(d.next.rank)],
          ]);
      });

    const bumps = series
      .selectAll("g")
      .data((d, i) =>
        d.map((v) => ({
          name: Array.from(this.yDomain)[i],
          value: v,
          first: 100,
          //   first: d[0].value,
        }))
      )
      .join("g")
      .attr(
        "transform",
        (d, i) => `translate(${this.bx(i)},${this.by(d.value.rank)})`
      )
      //.call(g => g.append("title").text((d, i) => `${d.territory} - ${quarters[i]}\n${toCurrency(d.profit.profit)}`));
      .call(this.title);

    bumps.append("circle").attr("r", this.drawingStyle ? 12 : this.bumpRadius);

    // showing the rank numbers in circles
    bumps
      .append("text")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .attr("stroke", "none")
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .text((d) => d.value.rank + 1);

    this.svg
      .append("g")
      .call((g) =>
        this.drawAxis(
          g,
          0,
          this.height - this.marginTop - this.marginBottom + this.padding,
          d3.axisBottom(this.ax),
          true
        )
      );

    // return this.svg.node();
  }

  chartData() {
    this.ti = new Map(Array.from(this.yDomain).map((name, i) => [name, i]));
    this.qi = new Map(Array.from(this.xDomain).map((date, i) => [date, i]));

    this.matrix = Array.from(this.ti, () =>
      new Array(this.xDomain.size).fill(null)
    );

    for (const { name, date, value } of this.displayData)
      this.matrix[this.ti.get(name)][this.qi.get(date)] = {
        rank: 1,
        value: +value,
        next: null,
      };

    this.matrix.forEach((d) => {
      for (let i = 0; i < d.length - 1; i++) d[i].next = d[i + 1];
    });

    Array.from(this.xDomain).forEach((d, i) => {
      const array = [];
      this.matrix.forEach((d) => array.push(d[i]));
      array.sort((a, b) => b.value - a.value);
      array.forEach((d, j) => (d.rank = j));
    });

    return this.matrix;
  }

  markTick(axis, pos) {
    axis
      .selectAll(".tick text")
      .filter((s, i) => i === d[pos].rank)
      .transition()
      .duration(500)
      .attr("font-weight", "bold")
      .attr("fill", this.color(d[0].rank));
  }
}
