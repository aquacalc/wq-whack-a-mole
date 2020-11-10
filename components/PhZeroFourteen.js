const React = require("react");
const D3Component = require("idyll-d3-component");
const d3 = require("d3");

// const ResizeObserver = require("resize-observer-polyfill");

const phData = [
  "-1: 37% hydrochloric acid",
  "0.8: battery acid 🚗",
  "1.0: gastric acid",
  "2.4: lemon juice 🍋",
  "3.4: orange juice 🍊",
  "4.3: acid rain ☔️",
  "5.5: proper espresso ☕️",
  "6: The Dead Sea",
  "7.0: pure water, 25° C 💧",
  "8.1: seawater 🌊",
  "9.8: Mono Lake (CA)",
  "10: typical hand soap 🧼",
  "11: ammonia solution",
  "12: 0.05% sodium hydroxide",
  "13: 0.5% sodium hydroxide",
  "14: 5% sodium hydroxide",
  "15: saturated NaOH",
];

// **- For pH scale -**
const data = [
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
  60,
];

const size = 600;

class PhZeroFourteen extends D3Component {
  initialize(node, props) {
    const svg = (this.svg = d3.select(node).append("svg"));

    svg
      .attr("viewBox", `0 0 ${size} ${size}`)
      .style("width", "100%")
      .style("height", "auto");

    // SCALES
    const xScale = d3
      .scaleBand()
      .domain(data.map((val, idx) => idx))
      .range([-150, 1.25 * size]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .range([size, 0]);

    // **- For pH scale -**
    // const colorScale = d3.scaleLinear().domain([0, 5, 7, 8, 9, 11, 16]).range([
    //   "red",
    //   "orange",
    //   "#E6E600",
    //   "green",
    //   // "#48BF91",
    //   "blue",
    //   "indigo",
    //   // "navy",
    //   "violet",
    //   // "#602F6B",
    // ]);
    const colorScale = d3.scaleLinear().domain([0, 7, 16]).range([
      "red",
      // "orange",
      // "#E6E600",
      "green",
      // "#48BF91",
      // "#7F007F",
      // "blue",
      // "indigo",
      // "navy",
      "blue",
      // "#602F6B",
    ]);

    // TITLE
    svg
      .append("text")
      .attr("class", "title-label")
      .attr("x", size / 2)
      .attr("y", 40)
      .style("font-size", "2.25rem")
      .text(`Part of the pH Scale (pH -1 to pH 15)`)
      .attr("text-anchor", "middle")
      .attr("fill", "#646464");

    // SUB-TITLE
    svg
      .append("text")
      .attr("class", "title-label")
      .attr("x", size / 2)
      .attr("y", 70)
      .style("font-size", "1.75rem")
      .text(`(Hover over the pH strips for examples)`)
      .attr("text-anchor", "middle")
      .attr("fill", "#646464");

    // BARS
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("fill", (d, idx) => colorScale(idx))
      .attr("opacity", 0.75)
      .attr("x", (d, idx) => xScale(idx))
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => 250)
      .attr("height", (d) => 250)
      .on("mouseover", function (d) {
        const index = svg.selectAll(".bar").nodes().indexOf(this);

        const tooltip = svg
          // .select(".bar")
          // .enter()
          .append("rect")
          .attr("class", "tooltip");
        // .style("display", "block");

        tooltip
          .attr("y", 85)
          .attr("width", index === 13 ? 570 : 550)
          .attr("height", 120)
          .attr("stroke", "#646464")
          .attr("stroke-width", 5)
          .attr("rx", 30) // [NB] D3 round rect corners
          .style("opacity", 0.15)
          .transition()
          .duration(750)
          .attr("fill", colorScale(index))
          .attr("x", index <= 7 ? xScale(0) : xScale(8));

        // tooltip
        //   .selectAll(".tooltip-text")
        //   .append("text")
        //   .attr("class", "tooltip-text")
        //   .attr("x", 50)
        //   .attr("y", 150)
        //   .style("font-size", "5.0rem")
        //   .text(`pH ${index}`)
        //   .style("text-anchor", "middle")
        //   .attr("font-weight", "bold");

        // PH INFO TEXT
        svg
          .append("text")
          .attr("class", "tooltip-text")
          .attr("x", index >= 8 ? size - 310 : -130)
          .attr("y", 160)
          .style("font-size", "2.5rem")
          .html(`pH ${phData[index]}`)
          .attr("text-anchor", "start")
          .attr("fill", "gray");
        // .attr("fill", "#646464");

        // PH INFO LINE
        svg
          .append("line")
          .attr("class", "ph-line")
          .transition()
          .duration(750)
          .attr("stroke", colorScale(index))
          .style("stroke-width", 9)
          .attr("x1", xScale(index) + xScale.bandwidth() / 2)
          .attr("y1", 212)
          .attr("x2", xScale(index) + xScale.bandwidth() / 2)
          .attr("y2", 245);
      })
      .on("mouseout", function () {
        svg.select(".tooltip").remove();
        svg.select(".tooltip-text").remove();
        svg.select(".ph-line").remove();
      });

    // PH LABELS
    svg
      .selectAll(".ph-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "ph-label")
      .attr("x", (d, idx) => (idx < 10 ? xScale(idx) + 20 : xScale(idx) + 12))
      .attr("y", 375)
      .style("font-size", "2.0rem")
      // .attr("fill", (d, idx) =>
      //   idx <= 4 || (idx > 7 && idx <= 16) ? "white" : "gray"
      // )
      .attr("fill", "white")
      .text((d, idx) => idx - 1)
      .attr("text-anchor", "start")
      .style("pointer-events", "none");
  }

  update(props, oldProps) {
    // this.svg
    //   .selectAll('circle')
    //   .transition()
    //   .duration(750)
    //   .attr('cx', Math.random() * size)
    //   .attr('cy', Math.random() * size);
  }
}

module.exports = PhZeroFourteen;
