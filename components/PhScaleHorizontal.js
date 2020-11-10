const React = require("react");
const D3Component = require("idyll-d3-component");
const d3 = require("d3");

const size = 800;

// NB: When needed, over-ride round() in generalConversions
const round = (value, decimals) =>
  Number(Math.round(value + "e" + decimals) + "e-" + decimals);

class PhScale extends D3Component {
  initialize(node, props) {
    // console.log(`1...`, props.sal);

    const svg = (this.svg = d3.select(node).append("svg"));

    // see: https://stackoverflow.com/questions/44322617/viewbox-attribute-with-svg-height-and-width-attributes-set
    svg
      .attr("viewBox", `0 0 ${size} ${size}`) // Set content region
      // .attr("viewBox", `0 0 ${1.2 * size} ${1.2 * size}`) // Set content region
      // .attr("viewBox", `30 0 100 100`) // Set content region
      .style("width", "100.0%") // Set svg width
      .style("height", "25.0%"); // Set svg height

    // GRADIENT
    // see: https://www.freshconsulting.com/d3-js-gradients-the-easy-way/
    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("class", ".linearGradient")
      .attr("id", "svgGradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "100%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("class", "start-1")
      .attr("offset", "0%")
      .attr("stop-color", "red")
      .attr("stop-opacity", 1);

    gradient
      .append("stop")
      .attr("class", "start-2")
      .attr("offset", "50%")
      .attr("stop-color", "green")
      .attr("stop-opacity", 1);

    gradient
      .append("stop")
      .attr("class", "end")
      .attr("offset", "100%")
      .attr("stop-color", "blue")
      .attr("stop-opacity", 1);

    // TITLE
    svg
      .append("text")
      .attr("class", "title-label")
      .attr("x", size / 2)
      .attr("y", 75)
      .style("font-size", "3.25rem")
      .text(`Neutral pH depends on Temperature & Salinity`)
      .attr("text-anchor", "middle")
      .attr("fill", "#646464");

    // TEMP & SAL
    svg
      .append("text")
      .attr("class", "temperature-label")
      .attr("x", -385)
      .attr("y", 350)
      .style("font-size", "2.75rem")
      .text(`Temperature: ${round(props.tempValue, 2)}${props.tempUnits}`)
      .attr("text-anchor", "start")
      .attr("fill", "#808080");

    svg
      .append("text")
      .attr("class", "salinity-label")
      .attr("x", -385)
      .attr("y", 450)
      .style("font-size", "2.75rem")
      .text(`Salinity: ${props.sal}‰`)
      .attr("text-anchor", "start")
      .attr("fill", "#808080");

    // PH 6.0 LINE & TEXT
    svg
      .append("line")
      .attr("class", "acid-line")
      .style("stroke", "red")
      .style("stroke-width", 8)
      .attr("x1", 70)
      .attr("y1", size / 3)
      .attr("x2", 70)
      .attr("y2", 600);

    svg
      .append("text")
      .attr("x", 70)
      .attr("y", 600 + 50)
      .style("font-size", "3.0rem")
      .text("pH 6.0")
      .attr("text-anchor", "middle")
      .attr("fill", "red");

    svg
      .append("text")
      .attr("class", "acid-label")
      .attr("x", size / 4)
      .attr("y", 40 + size / 4)
      .style("font-size", "2.75rem")
      .text("Acidic")
      .attr("text-anchor", "start")
      .attr("fill", "red");

    // PH 7.0 LINE & TEXT
    svg
      .append("line")
      .attr("class", "neutral-line-7")
      .style("stroke", "black")
      .style("stroke-width", 5)
      .style("stroke-dasharray", "1, 3")
      .attr("x1", size / 2 + 70)
      .attr("y1", size / 3)
      .attr("x2", size / 2 + 70)
      .attr("y2", 600);

    svg
      .append("text")
      .attr("class", "neutral-text-7")
      .attr("x", size / 2 + 70)
      .attr("y", 600 + 50)
      .style("font-size", "3.0rem")
      .text("7.0")
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("opacity", "0.0");

    // PH NEUTRAL LINE & TEXT
    svg
      .append("line")
      .attr("class", "neutral-line")
      .style("stroke", "green")
      .style("stroke-width", 8)
      .attr("x1", size / 2 + 70)
      .attr("y1", size / 3 - 80)
      .attr("x2", size / 2 + 70)
      .attr("y2", 680);

    svg
      .append("text")
      .attr("class", "neutral-text") // numerical value of neutral pH (variable)
      .attr("x", size / 2 + 70)
      .attr("y", 680 + 50)
      .style("font-size", "3.0rem")
      .text("pH 7.0")
      .attr("text-anchor", "middle")
      .attr("fill", "green");

    svg
      .append("text")
      .attr("class", "neutral-label") // the string "Neutral"
      .attr("x", size / 2 + 70)
      .attr("y", size / 3 - 100)
      .style("font-size", "3.0rem")
      .text("Neutral")
      .attr("text-anchor", "middle")
      .attr("fill", "green");

    // PH 8.0 LINE & TEXT
    svg
      .append("line")
      .attr("class", "basic-line")
      .style("stroke", "blue")
      .style("stroke-width", 8)
      .attr("x1", size + 70)
      .attr("y1", size / 3)
      .attr("x2", size + 70)
      .attr("y2", 600);

    svg
      .append("text")
      .attr("x", size + 70)
      .attr("y", 600 + 50)
      .style("font-size", "3.0rem")
      .text("pH 8.0")
      .attr("text-anchor", "middle")
      .attr("fill", "blue");

    svg
      .append("text")
      .attr("class", "base-label")
      .attr("x", (3 * size) / 4)
      .attr("y", 40 + size / 4)
      .style("font-size", "2.75rem")
      .text("Basic")
      .attr("text-anchor", "start")
      .attr("fill", "blue");

    // RECT
    svg
      .append("rect")
      .attr("x", 70)
      .attr("y", size / 3)
      .attr("width", size)
      .attr("height", size / 4)
      .attr("fill", "url(#svgGradient)")
      .attr("opacity", "0.45");
  }

  // ****************************** //
  // ****** IDYLL's UPDATE() ****** //
  // ****************************** //

  update(props, oldProps) {
    const ph_n = 7 - props.neutralPh;
    const decalage = ph_n * (size / 2);
    const decalage_gradient = (100.0 * Math.abs(props.neutralPh - 6.0)) / 2;

    // console.log(`NEW neutral pH = ${props.neutralPh}`);
    // console.log(`diff from ph 7 = ${ph_n}`);
    // console.log(`${props.neutralPh} - 6.0 = ${props.neutralPh - 6}`);
    // console.log(`(${props.neutralPh} - 6.0) / 2 = ${(props.neutralPh - 6) / 2}`);
    // console.log(`% from ph 6.0 = ${decalage_gradient}%`);
    // console.log(`diff * ${size / 2} = ${(ph_n * size) / 2}`);
    // console.log(`TEMP props = ${props.tempValue} ${props.tempUnits}`);
    // console.log(" ");

    this.svg
      .selectAll(".temperature-label")
      .transition()
      .duration(750)
      .text(`Temperature: ${round(props.tempValue, 2)}${props.tempUnits}`);

    this.svg
      .selectAll(".salinity-label")
      .transition()
      .duration(750)
      .text(`Salinity: ${props.sal}‰`);

    this.svg
      .selectAll(".neutral-line")
      .transition()
      .duration(750)
      .attr("x1", size / 2 + 70 - decalage)
      .attr("x2", size / 2 + 70 - decalage);

    this.svg
      .selectAll(".neutral-text")
      .transition()
      .duration(750)
      .attr("x", size / 2 + 70 - decalage)
      .text(`pH ${props.neutralPh}`);

    this.svg
      .selectAll(".neutral-label")
      .transition()
      .duration(750)
      .attr("x", size / 2 + 70 - decalage);

    this.svg
      .selectAll(".neutral-text-7")
      .transition()
      .duration(750)
      .attr(
        "opacity",
        props.neutralPh <= 6.88 || props.neutralPh >= 7.12 ? "0.35" : "0"
      );

    this.svg
      .selectAll(".start-2")
      .transition()
      .duration(750)
      .attr("offset", `${decalage_gradient}%`)
      .attr("stop-color", "green")
      .attr("stop-opacity", 1);

    this.svg
      .selectAll(".acid-label")
      .transition()
      .duration(750)
      // .attr("text-anchor", "start")
      .attr("x", (size / 2 - decalage + 8) / 2);

    this.svg
      .selectAll(".base-label")
      .transition()
      .duration(750)
      .attr(
        "x",
        (size + 70 - 80 - (size / 2 + 70 - decalage)) / 2 +
          (size / 2 + 70 - decalage)
      );
  }
}

module.exports = PhScale;
