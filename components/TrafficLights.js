const React = require("react");
const D3Component = require("idyll-d3-component");
const d3 = require("d3");

const {
  isSafe_Co2,
  isSafe_Uian,
  isSafe_OmegaAr,
  // calcRho,
} = require("./SomeFunctions");

const subTwo = "\u2082";
const labelsBiofloc = [`CO${subTwo} ≤ 10`, "UIA-N ≤ 12.5", "Ωar ≥ 1"];

const labelsAquaponics = ["CO2 ≤ 10", "UIA-N ≤ 12.5", "Iron (Fe)"];

// **- For pH scale -**
const data = [60, 60, 60];

const myLights_Co2 = [
  {
    x_index: 0,
    cy: 225,
    r: 50,
    fill: "red",
    isOn: false,
    value: "",
  },
  {
    x_index: 0,
    cy: 345,
    r: 50,
    fill: "yellow",
    isOn: true,
    value: "8.69",
    // value: "9.9", // [NB] Where was the error? This initial CO2 value changed to 8.69 when first move was to change TAN slider
  },
  {
    x_index: 0,
    cy: 465,
    r: 50,
    fill: "green",
    isOn: false,
    value: "",
  },
];

const myLights_Uian = [
  {
    x_index: 1,
    cy: 225,
    r: 50,
    fill: "red",
    isOn: false,
    value: "",
  },
  {
    x_index: 1,
    cy: 345,
    r: 50,
    fill: "yellow",
    isOn: false,
    value: "",
  },
  {
    x_index: 1,
    cy: 465,
    r: 50,
    fill: "green",
    isOn: true,
    value: "10.3",
  },
];

const myLights_OmegaAr = [
  {
    x_index: 2,
    cy: 225,
    r: 50,
    fill: "red",
    isOn: true,
    value: "0.45",
  },
  {
    x_index: 2,
    cy: 345,
    r: 50,
    fill: "yellow",
    isOn: false,
    value: "",
  },
  {
    x_index: 2,
    cy: 465,
    r: 50,
    fill: "green",
    isOn: false,
    value: "",
  },
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
      .range([-150, 1.25 * size])
      .padding(0.25);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .range([size, 0]);

    // **- For pH scale -**
    const colorScale = d3
      .scaleLinear()
      .domain([0, 3, 5, 7, 9, 11, 15])
      .range([
        "red",
        "orange",
        "#E6E600",
        "green",
        "#48BF91",
        "navy",
        "#602F6B",
      ]);

    // TITLE
    svg
      .append("text")
      .attr("class", "title-label")
      .attr("x", size / 2)
      .attr("y", 55)
      .style("font-size", "2.25rem")
      .text(`Finding the Optimal pH`)
      // .text(`Finding the Optimal pH for ${props.system}`)
      .attr("text-anchor", "middle")
      .attr("fill", "#646464");

    // BARS
    svg
      .selectAll(".bar-traffic")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-traffic")
      .attr("fill", (d, idx) => "darkgrey")
      .attr("opacity", 0.45)
      .attr("x", (d, idx) => xScale(idx))
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => 150)
      .attr("height", (d) => 400);

    // TRAFFIC LIGHT CIRCLES //

    // ***** CO2 ***** //
    svg
      .selectAll(".lights-co2")
      .data(myLights_Co2)
      .enter()
      .append("circle")
      .attr("class", "lights-co2")
      .attr("cx", (d, idx) => xScale(d.x_index) + 0.5 * xScale.bandwidth())
      .attr("cy", (d) => d.cy)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.fill)
      .attr("stroke", "darkgray")
      .attr("stroke-width", "3px")
      .attr("opacity", (d) => (d.isOn ? 1.0 : 0.25));

    svg
      .selectAll(".lights-co2-label")
      .data(myLights_Co2)
      .enter()
      .append("text")
      .attr("class", "lights-co2-label")
      .attr("x", (d, idx) => xScale(d.x_index) + 0.5 * xScale.bandwidth())
      .attr("y", (d) => d.cy + 15)
      .style("font-size", "2.10rem")
      .attr("fill", (d, idx) => (idx === 1 ? "navy" : "white"))
      .text((d, idx) => d.value)
      .attr("text-anchor", "middle");

    // ***** UIAN ***** /
    svg
      .selectAll(".lights-uian")
      .data(myLights_Uian)
      .enter()
      .append("circle")
      .attr("class", "lights-uian")
      .attr("cx", (d, idx) => xScale(d.x_index) + 0.5 * xScale.bandwidth())
      .attr("cy", (d) => d.cy)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.fill)
      .attr("stroke", "darkgray")
      .attr("stroke-width", "3px")
      .attr("opacity", (d) => (d.isOn ? 1.0 : 0.25));

    svg
      .selectAll(".lights-uian-label")
      .data(myLights_Uian)
      .enter()
      .append("text")
      .attr("class", "lights-uian-label")
      .attr("x", (d, idx) => xScale(d.x_index) + 0.5 * xScale.bandwidth())
      .attr("y", (d) => d.cy + 15)
      .style("font-size", "2.10rem")
      .attr("fill", (d, idx) => (idx === 1 ? "navy" : "white"))
      .text((d, idx) => d.value)
      .attr("text-anchor", "middle");

    // ***** OMEGA ***** //
    svg
      .selectAll(".lights-omega-ca")
      .data(myLights_OmegaAr)
      .enter()
      .append("circle")
      .attr("class", "lights-omega-ca")
      .attr("cx", (d, idx) => xScale(d.x_index) + 0.5 * xScale.bandwidth())
      .attr("cy", (d) => d.cy)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.fill)
      .attr("stroke", "darkgray")
      .attr("stroke-width", "3px")
      .attr("opacity", (d) => (d.isOn ? 1.0 : 0.25));

    svg
      .selectAll(".lights-omega-ca-label")
      .data(myLights_OmegaAr)
      .enter()
      .append("text")
      .attr("class", "lights-omega-ca-label")
      .attr("x", (d, idx) => xScale(d.x_index) + 0.5 * xScale.bandwidth())
      .attr("y", (d) => d.cy + 15)
      .style("font-size", "2.10rem")
      .attr("fill", (d, idx) => (idx === 1 ? "navy" : "white"))
      .text((d, idx) => d.value)
      .attr("text-anchor", "middle");

    // WQ FACTOR LABELS
    svg
      .selectAll(".ph-label")
      .data(props.system === "Biofloc" ? labelsBiofloc : labelsAquaponics)
      .enter()
      .append("text")
      .attr("class", "ph-label")
      .attr("x", (d, idx) => xScale(idx) + +0.5 * xScale.bandwidth())
      .attr("y", 125)
      .style("font-size", "2.35rem")
      .style("font-face", "bold")
      .attr("fill", "navy")
      .text((d, idx) => d)
      .attr("text-anchor", "middle")
      .style("pointer-events", "none");
  }

  update(props, oldProps) {
    // [HACK] quick hack of temp conversion to IC units (K) for calcs (not for display)
    const temp =
      props.tempUnits === "° C"
        ? props.temp + 273.15
        : (5 / 9) * (props.temp - 32) + 273.15;

    // ** CO2 ** //
    const co2Status = isSafe_Co2(temp, props.sal, 0.0025, props.ph, 10);

    const x = myLights_Co2.map((d) => {
      // Re-set all isOn to false and all value label to ''
      d.isOn = false;
      d.value = "";
      if (d.fill === "red") {
        d.isOn = co2Status.red;
        d.value = co2Status.value;
      }
      if (d.fill === "yellow") {
        d.isOn = co2Status.yellow;
        d.value = co2Status.value;
      }
      if (d.fill === "green") {
        d.isOn = co2Status.green;
        d.value = co2Status.value;
      }
      return d;
    });

    // ** UIA-N ** //
    const uianStatus = isSafe_Uian(temp, props.sal, props.ph, props.tan, 12.5);

    const y = myLights_Uian.map((d) => {
      d.isOn = false;
      if (d.fill === "red") {
        d.isOn = uianStatus.red;
        d.value = uianStatus.value;
      }
      if (d.fill === "yellow") {
        d.isOn = uianStatus.yellow;
        d.value = uianStatus.value;
      }
      if (d.fill === "green") {
        d.isOn = uianStatus.green;
        d.value = uianStatus.value;
      }
      return d;
    });

    // ** OMEGA AR ** //
    const omegaArStatus = isSafe_OmegaAr(
      temp,
      props.sal,
      props.ph,
      0.0025,
      412,
      1.0
    );

    const z = myLights_OmegaAr.map((d) => {
      d.isOn = false;
      if (d.fill === "red") {
        d.isOn = omegaArStatus.red;
        d.value = omegaArStatus.value;
      }
      if (d.fill === "yellow") {
        d.isOn = omegaArStatus.yellow;
        d.value = omegaArStatus.value;
      }
      if (d.fill === "green") {
        d.isOn = omegaArStatus.green;
        d.value = omegaArStatus.value;
      }
      return d;
    });

    // ** CO2 ** //
    this.svg
      .selectAll(".lights-co2")
      .transition()
      .duration(750)
      .attr("stroke", "black")
      .attr("stroke-width", "3px")
      .attr("opacity", (d) => (d.isOn ? 1.0 : 0.25));

    this.svg
      .selectAll(".lights-co2-label")
      .transition()
      .duration(750)
      .attr("fill", (d, idx) => (idx === 1 ? "navy" : "white"))
      .text((d, idx) => (d.isOn ? d.value : ""));

    // ** UIAN ** //
    this.svg
      .selectAll(".lights-uian")
      .transition()
      .duration(750)
      .attr("stroke", "black")
      .attr("stroke-width", "3px")
      .attr("opacity", (d) => (d.isOn ? 1.0 : 0.25));

    this.svg
      .selectAll(".lights-uian-label")
      .transition()
      .duration(750)
      .attr("fill", (d, idx) => (idx === 1 ? "navy" : "white"))
      .text((d, idx) => (d.isOn ? d.value : ""));

    // ** OMEGA AR ** //
    this.svg
      .selectAll(".lights-omega-ca")
      .transition()
      .duration(750)
      .attr("stroke", "black")
      .attr("stroke-width", "3px")
      .attr("opacity", (d) => (d.isOn ? 1.0 : 0.25));

    this.svg
      .selectAll(".lights-omega-ca-label")
      .transition()
      .duration(750)
      .attr("fill", (d, idx) => (idx === 1 ? "navy" : "white"))
      .text((d, idx) => (d.isOn ? d.value : ""));
  }
}

module.exports = PhZeroFourteen;
