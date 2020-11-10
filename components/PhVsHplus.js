const React = require("react");
const D3Component = require("idyll-d3-component");
const d3 = require("d3");

// const ResizeObserver = require("resize-observer-polyfill");[]

const phData = [
  // { ph: 5, hplus: 0.000009999999999999999 },
  // { ph: 5.25, hplus: 0.00000562341325190349 },
  // { ph: 5.5, hplus: 0.000003162277660168379 },
  // { ph: 5.75, hplus: 0.000001778279410038923 },
  { ph: 6, hplus: 0.000001 },
  { ph: 6.25, hplus: 5.62341325190349e-7 },
  { ph: 6.5, hplus: 3.162277660168379e-7 },
  { ph: 6.75, hplus: 1.7782794100389227e-7 },
  { ph: 7, hplus: 1e-7 },
  { ph: 7.25, hplus: 5.6234132519034905e-8 },
  { ph: 7.5, hplus: 3.162277660168379e-8 },
  { ph: 7.75, hplus: 1.7782794100389228e-8 },
  { ph: 8, hplus: 1e-8 },
  { ph: 8.25, hplus: 5.623413251903491e-9 },
  { ph: 8.5, hplus: 3.1622776601683795e-9 },
  { ph: 8.75, hplus: 1.7782794100389228e-9 },
  { ph: 9, hplus: 1e-9 },
  // { ph: 9.25, hplus: 5.623413251903491e-10 },
  // { ph: 9.5, hplus: 3.1622776601683795e-10 },
  // { ph: 9.75, hplus: 1.7782794100389226e-10 },
  // { ph: 10, hplus: 1e-10 },
];

// const dimensions = {
//   width: 600,
//   height: 1600,
//   margins: {
//     top: 10,
//     right: 10,
//     bottom: 40,
//     left: 60,
//   },
// };

const size = 600;

// PH INPUT
// For display...lower pH: RED; higher pH: BLUE; equal pHs: GREEN
const whoIsLow = (ph_1, ph_2) => {
  const ph_low = ph_1 < ph_2 ? ph_1 : ph_2;
  const ph_high = ph_1 < ph_2 ? ph_2 : ph_1;

  // pH data entered in Idyll
  // [NB] inefficiently re-calc of hplus (it's passed as a prop)
  // [NB] chaning order of returned array based on which pH is lower
  const theData = [
    {
      ph: ph_low,
      hplus: Math.pow(10, -ph_low),
      color: ph_1 === ph_2 ? "green" : "red",
      start: ph_low === ph_1, // if ph_low is the same as ph_1, then RED is the START pH...
    },
    {
      ph: ph_high,
      hplus: Math.pow(10, -ph_high),
      color: ph_1 === ph_2 ? "green" : "blue",
      start: ph_high === ph_1, // ...else BLUE is the start point
    },
  ];

  return theData;
};

const superPlus = "\u207A";

// ** PH ARROWS ** //
const sideArrow = "\u2B04";
const upArrow = "\u21E7";
const downArrow = "\u21E9";

const getUpDownArrows = (moreOrLess_ph, hplusArrow) => {
  let phArrow = sideArrow;

  if (moreOrLess_ph === " increases by ") {
    // UPWARDS WHITE ARROW
    phArrow = upArrow;
  } else if (moreOrLess_ph === " decreases by ") {
    // DOWNWARDS WHITE ARROW
    phArrow = downArrow;
  } else {
    phArrow = sideArrow;
  }

  // ** -- ** //

  let hplus_postoArrow = sideArrow;
  let acid_arrow_color = "green"; // Added to color 'acidity' arrow and text

  if (hplusArrow === " increases by ") {
    // UPWARDS WHITE ARROW
    hplus_postoArrow = upArrow;
    acid_arrow_color = "red";
  } else if (hplusArrow === " decreases by ") {
    // DOWNWARDS WHITE ARROW
    hplus_postoArrow = downArrow;
    acid_arrow_color = "blue";
  } else {
    hplus_postoArrow = sideArrow;
  }

  return {
    phArrow,
    hplus_postoArrow,
    acid_arrow_color,
  };
};

// CALC SLOPE OF PH DIRCTION ARROW (red -> blue OR blue -> red)
const slope_ph_change = (ph_1, ph_2, hPlus_1, hPlus_2) => {
  // console.log(ph_1);
  console.log(hPlus_1);
  console.log(hPlus_2);
  // console.log(ph_2 - ph_1);

  // [NB] Divide hplus_x by 10^10 because pass as props * 10^10
  let slope = 0;

  // [NB] If hplus_1 === hplus_2, slope is not '0'; it's Inf; but need to handle for display
  if (hPlus_1 !== hPlus_2) {
    slope =
      Math.abs(ph_2 - ph_1) / Math.abs((hPlus_2 - hPlus_1) / Math.pow(10, 10));
  }

  return slope;
};

// NB: When needed, over-ride round() in generalConversions
const round = (value, decimals) =>
  Number(Math.round(value + "e" + decimals) + "e-" + decimals);

class PhVsHplus extends D3Component {
  initialize(node, props) {
    const svg = (this.svg = d3.select(node).append("svg"));

    // const svgContent = svg
    //   .append("g")
    //   .attr("width", dimensions.width)
    //   .attr("height", dimensions.height)
    //   .attr("fill", "green");

    const {
      ph_1,
      ph_2,
      hPlus_1,
      hPlus_2,
      ph_diff,
      hplus_diff,
      posto,
      moreOrLess_ph,
      moreOrLess_hPlus,
      moreOrLess_posto,
    } = props;

    const real_hPlus_1 = hPlus_1 / Math.pow(10, 9);
    const real_hPlus_2 = hPlus_2 / Math.pow(10, 9);

    // PH ARROWS ⇧⇩ displayed next to results (pH, hplus, posto changes)
    const myArrows = getUpDownArrows(moreOrLess_ph, moreOrLess_hPlus);

    // PH INPUT -- build the pH data to plot
    // For display...lower pH: RED; higher pH: BLUE; equal pHs: GREEN
    const phEntryData = whoIsLow(ph_1, ph_2);

    // console.log(phEntryData);

    svg
      .attr("viewBox", `0 0 600 650`)
      .style("width", "590")
      .style("height", "400");

    // ACCESSORS
    const xAccessor = (d) => d.hplus;
    const yAccessor = (d) => d.ph;

    // SCALES
    let xScale = d3
      .scaleLinear()
      .domain([0, 0.000001])
      // .domain(d3.extent(phData, xAccessor))
      .range([0, 750]);

    let yScale = d3
      .scaleLinear()
      .domain([6, 9])
      // .domain(d3.extent(phData, yAccessor))
      .range([550, 100]);

    // TITLE
    // svg
    //   .append("text")
    //   .attr("class", "title-label")
    //   .attr("x", size / 2)
    //   .attr("y", 55)
    //   .style("font-size", "3.0rem")
    //   .text(`pH vs. [H${superPlus}]`)
    //   .attr("text-anchor", "middle")
    //   .attr("fill", "#646464");

    // ********************* //
    // ****** PH LINE ****** //
    // ********************* //

    // see: https://bl.ocks.org/EfratVil/c022f78e258d869f5ebae54d7fc20aed
    const linearGradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("gradientTransform", "rotate(90)");

    linearGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "blue");

    // linearGradient
    //   .append("stop")
    //   .attr("offset", "25%")
    //   .attr("stop-color", "red");

    linearGradient
      .append("stop")
      .attr("offset", "80%")
      .attr("stop-color", "#7F007F");

    // linearGradient
    //   .append("stop")
    //   .attr("offset", "75%")
    //   .attr("stop-color", "red");

    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "red");

    // ************** //
    // ** THE PATH ** //
    // ************** //
    // "...a single path SVG element. path elements take a d attribute..." -Amelia Whataburger
    const lineGenerator = d3
      .line()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)))
      .curve(d3.curveMonotoneX);

    const line = svg
      .append("path")
      .attr("d", lineGenerator(phData))
      .attr("fill", "none")
      .attr("stroke", "url(#linear-gradient)")
      // .attr("stroke", "#af9358")
      .attr("stroke-width", 4);

    // ********************** //
    // ****** PH INPUT ****** //
    // ********************** //

    // PH INPUT LINES
    // svg
    //   .selectAll(".ph-line")
    //   .data(phEntryData)
    //   .enter()
    //   .append("line")
    //   .attr("class", "ph-line")
    //   .transition()
    //   .duration(750)
    //   .attr("stroke", (d) => d.color)
    //   .attr("stroke-opacity", 0.25)
    //   .style("stroke-width", 3)
    //   .attr("x1", (d) => xScale(xAccessor(d)))
    //   .attr("y1", (d) => yScale(yAccessor(d)))
    //   .attr("x2", (d) => xScale(xAccessor(d)))
    //   .attr("y2", (d) => 550);

    // [TEST] LINE: TARGET CIRCLE TO STATEMENT
    // 'start' property FALSE => the target pH (larger circle)
    svg
      .selectAll(".ph-target-to-statement")
      .data(phEntryData)
      .enter()
      .append("line")
      .attr("class", "ph-target-to-statement")
      .transition()
      .duration(750)
      .attr("stroke", (d) => (!d.start ? d.color : "")) // !d.start => target pH
      .attr("stroke-opacity", 0.55)
      .style("stroke-width", 5)
      .attr("x1", 340)
      .attr("y1", 210)
      .attr("x2", (d) => (!d.start ? xScale(d.hplus) : ""))
      .attr("y2", (d) => (!d.start ? yScale(d.ph) : ""));

    // PH LINE CIRCLES
    let circles = svg
      .selectAll("circle")
      .data(phEntryData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(xAccessor(d)))
      .attr("cy", (d) => yScale(yAccessor(d)))
      .attr("r", (d) => (d.start ? 9 : 13))
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.55);

    // PH Y-AXIS "ARROW" -- a lot of work, but redundant after hit on circle r to signify 'start';
    //                      and can be confusing after apply linear gradient to the pH vs. [H+] path
    // svg
    //   .selectAll(".ph-yaxis-arrow")
    //   .data(phEntryData)
    //   .enter()
    //   .append("line")
    //   .attr("class", "ph-yaxis-arrow")
    //   .transition()
    //   .duration(750)
    // .attr("stroke", (d) => (d.start ? d.color : ""))
    // .attr("stroke-opacity", 1)
    // .style("stroke-width", 3.5)
    // .attr("x1", -24.5)
    // .attr("y1", yScale(phEntryData[0].ph))
    // .attr("x2", -24.5)
    // .attr("y2", yScale(phEntryData[1].ph));

    // ************************ //
    // ***** AXES CIRCLES ***** //
    // ************************ //

    // PH Y-AXIS CIRCLES
    svg
      .selectAll(".ph-yaxis-markers")
      .data(phEntryData)
      .enter()
      .append("circle")
      .attr("class", "ph-yaxis-markers")
      .attr("cx", -24.5)
      .attr("cy", (d) => yScale(yAccessor(d)))
      .attr("r", (d) => (d.start ? 4.5 : 7.0))
      // .attr("r", (d) => (d.start ? 7 : 4.5))
      // .attr("r", 6.5)
      .attr("fill", (d) => d.color);

    // PH X-AXIS CIRCLES
    svg
      .selectAll(".ph-xaxis-markers")
      .data(phEntryData)
      .enter()
      .append("circle")
      .attr("class", "ph-xaxis-markers")
      .attr("cx", (d) => xScale(xAccessor(d)))
      .attr("cy", 550)
      .attr("r", (d) => (d.start ? 4.5 : 7.0))
      .attr("fill", (d) => d.color);

    // ********************** //
    // **** RESULT "DIV" **** //
    // ********************** //

    svg
      .append("rect")
      .attr("class", "result-rect")
      .attr("x", 120)
      .attr("y", 100)
      .attr("width", 680)
      .attr("height", 220)
      .attr("stroke", myArrows.acid_arrow_color)
      // .attr("stroke", "#808080")
      .attr("stroke-width", 2)
      .attr("rx", 30) // [NB] D3 round rect corners
      .attr("fill", "#FFFFDD");

    // *********************** //
    // **** RESULT LABELS **** //
    // *********************** //

    // PH CHANGE
    svg
      .append("text")
      .attr("class", "ph-change-label")
      .attr("x", 184)
      .attr("y", 150)
      .style("font-size", "2.5rem")
      .style("font-weight", "400")
      .text(`Δ pH: ${myArrows.phArrow} ${round(ph_diff, 2)} pH units`)
      .attr("text-anchor", "start")
      .attr("fill", myArrows.acid_arrow_color)
      .attr("opacity", 0.8);
    // .attr("fill", "#808080");

    // [H+] CHANGE
    svg
      .append("text")
      .attr("class", "hplus-change-label")
      .attr("x", 165)
      .attr("y", 220)
      .style("font-size", "2.5rem")
      .style("font-weight", "400")
      .text(
        `Δ [H${superPlus}]: ${myArrows.hplus_postoArrow} ${hplus_diff.toFixed(
          12
        )} mol/L`
      )
      .attr("text-anchor", "start")
      .attr("fill", myArrows.acid_arrow_color)
      .attr("opacity", 0.8);

    // ACIDITY CHANGE
    svg
      .append("text")
      .attr("class", "acidity-change-label")
      .attr("x", 154)
      .attr("y", 290)
      .style("font-size", "2.5rem")
      .style("font-weight", "400")
      .text(`acidity: ${myArrows.hplus_postoArrow} ${round(posto, 2)}%`)
      .attr("text-anchor", "start")
      .attr("fill", myArrows.acid_arrow_color)
      .attr("opacity", 0.8);

    // ************************* //
    // **** NO CHANGE "DIV" **** //
    // ************************* //

    svg
      .append("rect")
      .attr("class", "result-no-change")
      .attr("x", 120)
      .attr("y", 100)
      .attr("width", 680)
      .attr("height", 220)
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("rx", 30) // [NB] D3 round rect corners
      .attr("fill", "#FFFFDD")
      .attr("opacity", myArrows.acid_arrow_color === "green" ? 1.0 : 0);

    // NO CHANGE TEXT
    svg
      .append("text")
      .attr("class", "no-change-label")
      .attr("x", 350)
      .attr("y", 225)
      .style("font-size", "2.5rem")
      .text(`No Change`)
      .attr("text-anchor", "start")
      .attr("fill", myArrows.acid_arrow_color)
      .attr("opacity", myArrows.acid_arrow_color === "green" ? 1.0 : 0);

    // // *********************** //
    // // *** DIRECTION ARROW *** //
    // // *********************** //
    // const phSlope = slope_ph_change(
    //   yScale(ph_1),
    //   yScale(ph_2),
    //   xScale(hPlus_1),
    //   xScale(hPlus_2)
    // );
    // console.log(`phSlope = ${phSlope}`);

    // ********************** //
    // ******** AXES ******** //
    // ********************** //

    // X-AXES
    const xAxisGenerator = d3.axisBottom().scale(xScale).tickValues([
      // 1e-8,
      // 3.162277660168379e-8,
      1e-7,
      3.162277660168379e-7,
      5.62341325190349e-7,
      0.000001,
    ]);
    // const xAxisGenerator = d3.axisBottom().scale(xScale).ticks(3);
    const xAxis = svg
      .append("g")
      .call(xAxisGenerator)
      .style("transform", `translate(0,${550}px)`)
      .selectAll(".tick text")
      .attr("font-size", "25");

    // Y-AXES
    const yAxisGenerator = d3.axisLeft().scale(yScale).ticks(7);
    const yAxis = svg
      .append("g")
      .call(yAxisGenerator)
      .style("transform", `translateX(-25px)`)
      .selectAll(".tick text")
      .attr("font-size", "25");

    // AXIS LABELS
    svg
      .append("text")
      .attr("x", 380)
      .attr("y", 620)
      .style("text-anchor", "middle")
      .attr("fill", "#808080")
      .style("font-size", "2.0rem")
      .html(`[H${superPlus}] (mol/L)`);

    svg
      .append("text")
      .attr("x", -330)
      .attr("y", -90)
      .attr("fill", "#808080")
      .style("font-size", "2.0rem")
      .style("transform", "rotate(-90deg)")
      .style("text-anchor", "middle")
      .html(`pH (NBS)`);

    // **************************** //
    // **** END INITIALIZE() **** //
    // **************************** //
  }

  // ****************************** //
  // ****************************** //
  // ****** IDYLL's UPDATE() ****** //
  // ****************************** //
  // ****************************** //

  update(props, oldProps) {
    const {
      ph_1,
      ph_2,
      hPlus_1,
      hPlus_2,
      ph_diff,
      hplus_diff,
      posto,
      moreOrLess_ph,
      moreOrLess_hPlus,
      // moreOrLess_posto,
    } = props;

    // "UPDATE" SCALES
    let xScale = d3.scaleLinear().domain([0, 0.000001]).range([0, 750]);
    let yScale = d3.scaleLinear().domain([6, 9]).range([550, 100]);

    // // *********************** //
    // // *** DIRECTION ARROW *** //
    // // *********************** //
    // const phSlope = slope_ph_change(
    //   yScale(ph_1),
    //   yScale(ph_2),
    //   xScale(hPlus_1),
    //   xScale(hPlus_2)
    // );
    // console.log(`phSlope = ${phSlope}`);

    // GET NEW PH INPUT
    // For display...lower pH: RED; higher pH: BLUE; equal pHs: GREEN
    const phEntryData = whoIsLow(round(ph_1, 2), round(ph_2, 2));

    // console.log(phEntryData);

    // GET UP/DOWN ⇧⇩
    const myArrows = getUpDownArrows(moreOrLess_ph, moreOrLess_hPlus);

    // console.log(myArrows);

    // [HACK] prop comes in from idyll as O(10^-15) when should be 0
    const myPoSto = posto < Math.pow(10, -10) ? 0 : posto;

    // PH CIRCLES
    this.svg
      .selectAll("circle")
      .data(phEntryData)
      .transition()
      .duration(750)
      .attr("cx", (d) => xScale(d.hplus))
      .attr("cy", (d) => yScale(d.ph))
      .attr("r", (d) => (d.start ? 9 : 13))
      .attr("fill", (d) => d.color);
    // .attr("opacity", 0.45);

    // PH Y-AXIS CIRCLES
    this.svg
      .selectAll(".ph-yaxis-markers")
      .data(phEntryData)
      .transition()
      .duration(750)
      .attr("cy", (d) => yScale(d.ph))
      .attr("r", (d) => (d.start ? 4.5 : 7.0))
      .attr("fill", (d) => d.color);

    // PH X-AXIS CIRCLES
    this.svg
      .selectAll(".ph-xaxis-markers")
      .data(phEntryData)
      .transition()
      .duration(750)
      .attr("cx", (d) => xScale(d.hplus))
      .attr("r", (d) => (d.start ? 4.5 : 7.0))
      .attr("fill", (d) => d.color);

    // [TEST] LINE: TARGET CIRCLE TO STATEMENT
    // 'start' property FALSE => the target pH (larger circle)
    this.svg
      .selectAll(".ph-target-to-statement")
      .data(phEntryData)
      .transition()
      .duration(750)
      .attr("opacity", (d) => (!d.start ? 0.85 : 0.0)) // !d.start => target pH
      .attr("stroke", (d) => (!d.start ? d.color : "")) // !d.start => target pH
      .attr("x2", (d) => (!d.start ? xScale(d.hplus) : 340))
      .attr("y2", (d) => (!d.start ? yScale(d.ph) : 210));

    // PH Y-AXIS ARROW
    // this.svg
    //   .selectAll(".ph-yaxis-arrow")
    //   .data(phEntryData)
    //   .transition()
    //   .duration(750)
    //   .attr("stroke", (d) => (d.start ? d.color : ""))
    //   .attr("y1", yScale(phEntryData[0].ph))
    //   .attr("y2", yScale(phEntryData[1].ph));

    // // PH INPUT LINES
    // this.svg
    //   .selectAll(".ph-line")
    //   .data(phEntryData)
    //   .transition()
    //   .duration(750)
    //   .attr("x1", (d) => xScale(d.hplus))
    //   .attr("y1", (d) => yScale(d.ph))
    //   .attr("x2", (d) => xScale(d.hplus))
    //   .attr("y2", (d) => 550)
    //   .attr("stroke", (d) => d.color)
    //   .attr("stroke-opacity", 0.35);

    this.svg
      .selectAll(".result-rect")
      .attr("stroke", myArrows.acid_arrow_color);

    // RESULT TEXT
    this.svg
      .selectAll(".ph-change-label")
      .transition()
      .duration(500)
      .text(`Δ pH: ${myArrows.phArrow} ${round(ph_diff, 2)} pH units`)
      .attr("fill", myArrows.acid_arrow_color);

    this.svg
      .selectAll(".hplus-change-label")
      .transition()
      .duration(500)
      .text(
        `Δ [H${superPlus}]: ${myArrows.hplus_postoArrow} ${hplus_diff.toFixed(
          12
        )} mol/L`
      )
      .attr("fill", myArrows.acid_arrow_color);

    this.svg
      .selectAll(".acidity-change-label")
      .transition()
      .duration(500)
      .text(`acidity: ${myArrows.hplus_postoArrow} ${round(myPoSto, 2)}%`)
      .attr("fill", myArrows.acid_arrow_color);

    // ************************* //
    // **** NO CHANGE "DIV" **** //
    // ************************* //

    this.svg
      .selectAll(".result-no-change")
      .transition()
      .duration(500)
      .attr("opacity", myArrows.acid_arrow_color === "green" ? 1.0 : 0);

    // NO CHANGE TEXT
    this.svg
      .selectAll(".no-change-label")
      .transition()
      .duration(500)
      .text(`No Change`)
      .attr("text-anchor", "start")
      .attr("fill", "green")
      .attr("opacity", myArrows.acid_arrow_color === "green" ? 1.0 : 0);

    // ******************* //
    // ** END OF UPDATE ** //
    // ******************* //
  }
}

module.exports = PhVsHplus;
