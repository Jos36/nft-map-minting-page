/** @format */
import { getMintedLands, getMetadata, get } from "./api.js ";
import { verifyWalletConnection, verifyWalletLands, mint } from "./wallet.js";
import { CoordToLandsId } from "./CoordToLandsId.js";
import { config } from "./config.js";

async function grid() {
  let isGridDrawn = false;
  const d3 = window.d3;
  let data;
  let isLoading = true;
  const factor = 100;
  let selectedCategory = "ALL";
  let minted = [];
  let isMinted;

  function handleZoom(e) {
    d3.select("svg#mapSvg > g").attr("transform", e.transform);
  }

  const zoom = d3.zoom().on("zoom", handleZoom);

  const createStates = (number) => {
    const stateRect = {};
    const startPos = window.states[number];
    for (const start of startPos) {
      const rect = [];
      for (let i = 0; i < number; i++) {
        for (let j = 0; j < number; j++) {
          const pos = { x: start[0] + i, y: start[1] + j };
          rect.push(pos);
        }
      }
      stateRect[`${start[0]},${start[1]}`] = rect;
    }
    return stateRect;
  };

  function reset() {
    const grid = d3.select("svg#mapSvg");
    const container = grid.node().getBoundingClientRect();
    const width = container.width;
    const height = container.height;
    const x0 = -150 * factor;
    const x1 = 150 * factor;
    const y0 = -47 * factor;
    const y1 = 48 * factor;

    const aspectWidth = x1 - x0;
    const aspectHeight = y1 - y0;

    const xScale = (width / aspectWidth) * 0.95;
    const yScale = (height / aspectHeight) * 0.98;
    const minScale = Math.min(xScale, yScale);

    const start = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(minScale)
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);

    zoom.transform(grid, start);
    grid.call(zoom.transform, start);
  }

  /* Open when someone clicks on the span element */
  let video = document.getElementById("com_video");

  const resetSelections = () => {
    d3.selectAll("rect.square").style("fill", "#04e38b");
    d3.selectAll("rect.square24").style("stroke", "#fff");
    d3.selectAll("rect.square12").style("stroke", "#fff");
    d3.selectAll("rect.square6").style("stroke", "#fff");
  };

  const clickLand = function (e, x, y, rects) {
    e.preventDefault();
    e.stopPropagation();
    isMinted = null;

    if (selectedCategory == "1" || selectedCategory == "ALL") {
      var mousePos = e.target.__data__;

      minted.forEach((el, i) => {
        if (el[0] == x && el[1] == y) {
          isMinted = true;
          const landInfo = document.getElementById("landInfo");
          landInfo.innerHTML = `  
          <div
                style="
                  display: flex;
                  width: 100%;
                  height: 100%;
                  justify-content: center;
                  align-items: center;
                "
              >
                <h4
                  style="
                    margin-top: 25vh;
                    border: #21fe91 1px solid;
                    border-radius: 10px;
                    padding: 20px;
                    width: 350px;
                    text-align: center;
                  "
                >
                (${x}, ${y}) is already minted
                </h4>
              </div>
          `;
        }
        if (i + 1 === minted.length && !isMinted) {
          isMinted = false;
        }
      });
      if (isMinted === false) {
        jQuery("#view-lands-button").hide();

        resetSelections();
        d3.select(
          e.target.textContent !== ""
            ? e.target.parentNode.children[0]
            : rects.filter((d, i) => d.x === x * 100 && d.y === y * 100)
                ._groups[0][0]
        ).style("fill", "#FF69B4");

        const token_id = CoordToLandsId[`${x},${y}`];
        getMetadata(token_id)
          .then((data) => {
            const landInfo = document.getElementById("landInfo");
            landInfo.innerHTML = `<div style="margin-left:50px; margin-top:100px"><p style="font-weight:bold;">Coordinates: (${x}, ${y})</p> <img style="width:300px; height:300px; border-radius:10px; border: #21fe91 1px solid; margin-bottom: 20px" src="${
              data.image
            }" alt="" /> <div style="display:flex"><p style="font-weight:bold;margin-right: 10px;">name: </p><p style="color:white">${
              data.name
            }</p></div> <div><p style="font-weight:bold;">description</p><p style="color:white">${
              data.description
            }</p> <div style="display:flex;"><p style="margin-right: 10px;font-weight:bold;">Price</p><p style="color:white">${
              config.contract.one_mint_price / 1000000000000000000
            }</p></div></div> <button id="mint-btn" style="
        border-radius: 10px;
        background-color: #21fe91;
        color: #23292f;
        border: none;
        padding :10px;
        padding-left: 20px;
        padding-right: 20px;
        font-weight:bold;
        ">Mint</button></div>`;
          })
          .then(() => {
            console.log(CoordToLandsId[`${x},${y}`]);
            const mintBtn = document.getElementById("mint-btn");
            mint(mintBtn, {
              token_id,
              coordinates: [x, y],
            });
          });
      }
    }
  };

  const clickState = function (e, state = null, rects) {
    e.preventDefault();
    e.stopPropagation();
    isMinted = null;
    const [x, y] = e.target.__data__;
    const token_id = CoordToLandsId[`${x},${y}`];

    if (
      (selectedCategory == "24" && state[`${x},${y}`].length == 576) ||
      (selectedCategory == "ALL" && state[`${x},${y}`].length == 576)
    ) {
      minted.forEach((el, i) => {
        if (el[0] == x && el[1] == y) {
          isMinted = true;
          const landInfo = document.getElementById("landInfo");
          landInfo.innerHTML = `  
          <div
                style="
                  display: flex;
                  width: 100%;
                  height: 100%;
                  justify-content: center;
                  align-items: center;
                "
              >
                <h4
                  style="
                    margin-top: 25vh;
                    border: #21fe91 1px solid;
                    border-radius: 10px;
                    padding: 20px;
                    width: 350px;
                    text-align: center;
                  "
                >
                (${x}, ${y}) is already minted
                </h4>
              </div>
          `;
        }
        if (i + 1 === minted.length && !isMinted) {
          isMinted = false;
        }
      });
      if (isMinted === false) {
        jQuery("#view-lands-button").show();

        resetSelections();
        d3.select(
          e.target.textContent !== ""
            ? e.target.parentNode.children[0]
            : rects.filter((d, i) => d[0] === x && d[1] === y)._groups[0][0]
        ).style("stroke", "#FF69B4");

        getMetadata(token_id)
          .then((data) => {
            const landInfo = document.getElementById("landInfo");
            landInfo.innerHTML = `<div style="margin-left:50px; margin-top:100px"><p style="font-weight:bold;">Coordinates: (${x}, ${y})</p> <img style="width:300px; height:300px; border-radius:10px; border: #21fe91 1px solid; margin-bottom: 20px" src="${
              data.image
            }" alt="" /> <div style="display:flex"><p style="font-weight:bold;margin-right: 10px;">name: </p><p style="color:white">${
              data.name
            }</p></div> <div><p style="font-weight:bold;">description</p><p style="color:white">${
              data.description
            }</p><div style="display:flex;"><p style="margin-right: 10px;font-weight:bold;">Price</p><p style="color:white">${
              config.contract.twentyfour_mint_price / 1000000000000000000
            }</p></div></div> <button id="mint-btn" style="
        border-radius: 10px;
        background-color: #21fe91;
        color: #23292f;
        border: none;
        padding :10px;
        padding-left: 20px;
        padding-right: 20px;
        font-weight:bold;
        ">Mint</button></div>`;
          })
          .then(() => {
            console.log(CoordToLandsId[`${x},${y}`]);
            const mintBtn = document.getElementById("mint-btn");
            mint(mintBtn, {
              token_id,
              coordinates: [x, y],
            });
          });
      }
    } else if (
      (selectedCategory == "12" && state[`${x},${y}`].length == 144) ||
      (selectedCategory == "ALL" && state[`${x},${y}`].length == 144)
    ) {
      minted.forEach((el, i) => {
        if (el[0] == x && el[1] == y) {
          isMinted = true;
          const landInfo = document.getElementById("landInfo");
          landInfo.innerHTML = `  
       <div
            style="
              display: flex;
              width: 100%;
              height: 100%;
              justify-content: center;
              align-items: center;
            "
          >
            <h4
              style="
                margin-top: 25vh;
                border: #21fe91 1px solid;
                border-radius: 10px;
                padding: 20px;
                width: 350px;
                text-align: center;
              "
            >
            (${x}, ${y}) is already minted
            </h4>
          </div>
      `;
        }
        if (i + 1 === minted.length && !isMinted) {
          isMinted = false;
        }
      });
      if (isMinted === false) {
        jQuery("#view-lands-button").show();
        resetSelections();
        d3.select(
          e.target.textContent !== ""
            ? e.target.parentNode.children[0]
            : rects.filter((d, i) => d[0] === x && d[1] === y)._groups[0][0]
        ).style("stroke", "#FF69B4");

        getMetadata(token_id)
          .then((data) => {
            const landInfo = document.getElementById("landInfo");
            landInfo.innerHTML = `<div style="margin-left:50px; margin-top:100px"><p style="font-weight:bold;">Coordinates: (${x}, ${y})</p> <img style="width:300px; height:300px; border-radius:10px; border: #21fe91 1px solid; margin-bottom: 20px" src="${
              data.image
            }" alt="" /> <div style="display:flex"><p style="font-weight:bold;margin-right: 10px;">name: </p><p style="color:white">${
              data.name
            }</p></div> <div><p style="font-weight:bold;">description</p><p style="color:white">${
              data.description
            }</p><div style="display:flex;"><p style="margin-right: 10px;font-weight:bold;">Price</p><p style="color:white">${
              config.contract.twelve_mint_price / 1000000000000000000
            }</p></div></div> <button id="mint-btn" style="
        border-radius: 10px;
        background-color: #21fe91;
        color: #23292f;
        border: none;
        padding :10px;
        padding-left: 20px;
        padding-right: 20px;
        font-weight:bold;
        ">Mint</button></div>`;
          })
          .then(() => {
            console.log(CoordToLandsId[`${x},${y}`]);
            const mintBtn = document.getElementById("mint-btn");
            mint(mintBtn, {
              token_id,
              coordinates: [x, y],
            });
          });
      }
    } else if (
      (selectedCategory == "6" && state[`${x},${y}`].length == 36) ||
      (selectedCategory == "ALL" && state[`${x},${y}`].length == 36)
    ) {
      minted.forEach((el, i) => {
        if (el[0] == x && el[1] == y) {
          isMinted = true;
          const landInfo = document.getElementById("landInfo");
          landInfo.innerHTML = `  
          <div
                style="
                  display: flex;
                  width: 100%;
                  height: 100%;
                  justify-content: center;
                  align-items: center;
                "
              >
                <h4
                  style="
                    margin-top: 25vh;
                    border: #21fe91 1px solid;
                    border-radius: 10px;
                    padding: 20px;
                    width: 350px;
                    text-align: center;
                  "
                >
                (${x}, ${y}) is already minted
                </h4>
              </div>
          `;
        }
        if (i + 1 === minted.length && !isMinted) {
          isMinted = false;
        }
      });
      if (isMinted === false) {
        jQuery("#view-lands-button").show();

        resetSelections();
        d3.select(
          e.target.textContent !== ""
            ? e.target.parentNode.children[0]
            : rects.filter((d, i) => d[0] === x && d[1] === y)._groups[0][0]
        ).style("stroke", "#FF69B4");

        getMetadata(token_id)
          .then((data) => {
            const landInfo = document.getElementById("landInfo");
            landInfo.innerHTML = `<div style="margin-left:50px; margin-top:100px"><p style="font-weight:bold;">Coordinates: (${x}, ${y})</p> <img style="width:300px; height:300px; border-radius:10px; border: #21fe91 1px solid; margin-bottom: 20px" src="${
              data.image
            }" alt="" /> <div style="display:flex"><p style="font-weight:bold;margin-right: 10px;">name: </p><p style="color:white">${
              data.name
            }</p></div> <div><p style="font-weight:bold;">description</p><p style="color:white">${
              data.description
            }</p><div style="display:flex;"><p style="margin-right: 10px;font-weight:bold;">Price</p><p style="color:white">${
              config.contract.six_mint_price / 1000000000000000000
            }</p></div></div> <button id="mint-btn" style="
        border-radius: 10px;
        background-color: #21fe91;
        color: #23292f;
        border: none;
        padding :10px;
        padding-left: 20px;
        padding-right: 20px;
        font-weight:bold;
        ">Mint</button></div>`;
          })
          .then(() => {
            console.log(CoordToLandsId[`${x},${y}`]);
            const mintBtn = document.getElementById("mint-btn");
            mint(mintBtn, {
              token_id,
              coordinates: [x, y],
            });
          });
      }
    }
  };

  function drawGrid() {
    const grid = d3.select("#mapSvg");
    // .style("width", "50vw")
    // .style("height", "calc(100vh - 150px)"); // minus the top bar including margin-top

    const data = window.coordinates.map((x) => ({
      x: x[0] * factor,
      y: x[1] * -1 * factor,
    }));

    const states24 = createStates(24);
    const states12 = createStates(12);
    const states6 = createStates(6);
    const states = { ...states24, ...states12, ...states6 };

    const square = grid
      .call(zoom)
      .append("g")
      .selectAll(".square")
      .data(data)
      .enter()
      .append("g")
      .on("click", (e) => {
        const x = e.target.x.baseVal.value / 100;
        const y = e.target.y.baseVal.value / 100;
        clickLand(e, x, y, square.select("rect"));
      });

    // for drawing rect squares instead of images

    square
      .append("rect")
      .attr("class", "square")
      .filter((d) => !states[`${d.x},${d.y}`])
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      })
      .attr("width", function (d) {
        return factor;
      })
      .attr("height", function (d) {
        return factor;
      })
      .style("fill", "#04e38b")
      .style("stroke", "#000")
      .style("stroke-width", "5");

    square
      .append("image")
      .attr("class", "square")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", function (d) {
        return factor - 2.5;
      })
      .attr("height", function (d) {
        return factor - 2.5;
      });

    const group24 = grid
      .select("g")
      .selectAll(".square24")
      .data(window.states[24])
      .enter()
      .append("g")
      .on("click", (e) => {
        clickState(e, states24, group24.select("rect"));
      });
    group24
      .append("rect")
      .attr("class", "square24")
      .attr("x", (d) => d[0] * factor)
      .attr("y", (d) => d[1] * factor)
      .attr("width", function (d) {
        return 24 * factor;
      })
      .attr("height", function (d) {
        return 24 * factor;
      })
      .style("fill", "#23292f")
      .style("stroke", "white")
      .style("stroke-width", "15");

    group24
      .append("image")
      .attr("xlink:href", "/images/24.png")
      .attr("class", "square24")
      .attr("x", (d) => d[0] * factor)
      .attr("y", (d) => d[1] * factor)
      .attr("width", function (d) {
        return 24 * factor;
      })
      .attr("height", function (d) {
        return 24 * factor;
      });

    const group12 = grid
      .select("g")
      .selectAll(".square12")
      .data(window.states[12])
      .enter()
      .append("g")
      .on("click", (e) => {
        clickState(e, states12, group12.select("rect"));
      });

    group12
      .append("rect")
      .attr("class", "square12")
      .attr("x", (d) => d[0] * factor)
      .attr("y", (d) => d[1] * factor)
      .attr("width", function (d) {
        return 12 * factor;
      })
      .attr("height", function (d) {
        return 12 * factor;
      })
      .style("fill", "#23292f")
      .style("stroke", "white")
      .style("stroke-width", "15");

    group12
      .append("image")
      .attr("xlink:href", "/images/12.png")
      .attr("class", "square12")
      .attr("x", (d) => d[0] * factor)
      .attr("y", (d) => d[1] * factor)
      .attr("width", function (d) {
        return 12 * factor;
      })
      .attr("height", function (d) {
        return 12 * factor;
      });

    const group6 = grid
      .select("g")
      .selectAll(".square6")
      .data(window.states[6])
      .enter()
      .append("g")
      .on("click", (e) => {
        clickState(e, states6, group6.select("rect"));
      });

    group6
      .append("rect")
      .attr("class", "square6")
      .attr("x", (d) => d[0] * factor)
      .attr("y", (d) => d[1] * factor)
      .attr("width", function (d) {
        return 6 * factor;
      })
      .attr("height", function (d) {
        return 6 * factor;
      })
      .style("fill", "#23292f")
      .style("stroke", "white")
      .style("stroke-width", "15");
    group6
      .append("image")
      .attr("xlink:href", "/images/6.png")
      .attr("class", "square6")
      .attr("x", (d) => d[0] * factor)
      .attr("y", (d) => d[1] * factor)
      .attr("width", function (d) {
        return 6 * factor;
      })
      .attr("height", function (d) {
        return 6 * factor;
      });

    isGridDrawn = true;
  }

  jQuery("#closebtn").click((e) => {
    video.pause();
    document.getElementById("myNav").style.width = "0%";
  });

  jQuery("#view-lands-button").click((e) => {
    video.pause();
    var landsModal = new bootstrap.Modal(
      document.getElementById("view-lands-modal")
    );
    landsModal.show();
  });

  function fetchData() {
    get().then((res) => {
      // converting array (response) to object
      let objectData = {};
      for (const index in res) {
        let land = res[index];
        objectData[`${land.coordinates[0]},${land.coordinates[1]}`] = land;
      }
      data = objectData;
      isLoading = false;

      // updating images on the map
      for (const coord in res) {
        for (const group in states) {
          states[group].map((state) => {
            const { coordinates, logo } = res[coord]; // pulling data from response
            const grid = d3.select("svg#mapSvg");
            if (_.isEqual(state, coordinates)) {
              // if the image on 12x12 tile
              if (group == 12) {
                const group12 = grid
                  .select("g")
                  .selectAll(".square12")
                  .filter(
                    (d, i) => d[0] === coordinates[0] && d[1] === coordinates[1]
                  );
                if (logo) {
                  group12.attr("xlink:href", logo);
                  group12.style("fill", "none");
                }
              }

              // if the image on 24x24 tile
              if (group == 24) {
                const group12 = grid
                  .select("g")
                  .selectAll(".square24")
                  .filter(
                    (d, i) => d[0] === coordinates[0] && d[1] === coordinates[1]
                  );
                if (logo) {
                  group12.attr("xlink:href", logo);
                  group12.style("fill", "none");
                }
              }

              // if the image on 6x6 tile
              if (group == 6) {
                const group12 = grid
                  .select("g")
                  .selectAll(".square6")
                  .filter(
                    (d, i) => d[0] === coordinates[0] && d[1] === coordinates[1]
                  );
                if (logo) {
                  group12.attr("xlink:href", logo);
                  group12.style("fill", "none");
                }
              }
            } else {
              const group1 = grid
                .select("g")
                .selectAll(".square")
                .filter((d, i) => {
                  return (
                    d.x === coordinates[0] * 100 && d.y === coordinates[1] * 100
                  );
                });
              if (logo) {
                group1.attr("xlink:href", logo);
                group1.style("fill", "none");
              }
            }
          });
        }
      }
      getminted();
    });

    // minted lands
    const getminted = () => {
      getMintedLands()
        .then((data) => {
          if (data.length === 0) {
            minted = [
              [0, -32, true],
              [-36, -24, true],
              [-36, -36, true],
              [-48, -24, true],
              [-24, -36, true],
            ];
          } else {
            minted = [
              ...data,
              [-24, -36, true],
              [0, -32, true],
              [-36, -24, true],
              [-36, -36, true],
              [-48, -24, true],
            ];
          }
        })
        .then(() => {
          console.log(minted);
          const grid = d3.select("svg#mapSvg");
          minted.forEach((mintedland) => {
            if (!mintedland[2]) {
              const land = d3.selectAll(
                `rect[x='${mintedland[0] * 100}'][y='${mintedland[1] * 100}']`
              );

              const logo = "/assets/gray.png";
              const group1 = grid
                .select("g")
                .selectAll(".square")
                .filter((d, i) => {
                  return (
                    d.x === mintedland[0] * 100 && d.y === mintedland[1] * 100
                  );
                });

              const group12 = grid
                .select("g")
                .selectAll(".square12")
                .filter(
                  (d, i) => d[0] === mintedland[0] && d[1] === mintedland[1]
                );
              group12.attr("xlink:href", logo);
              group12.style("fill", "none");

              // if the image on 24x24 tile

              const group24 = grid
                .select("g")
                .selectAll(".square24")
                .filter(
                  (d, i) => d[0] === mintedland[0] && d[1] === mintedland[1]
                );
              group24.attr("xlink:href", logo);
              group24.style("fill", "none");

              // if the image on 6x6 tile

              const group6 = grid
                .select("g")
                .selectAll(".square6")
                .filter(
                  (d, i) => d[0] === mintedland[0] && d[1] === mintedland[1]
                );
              group6.attr("xlink:href", logo);
              group6.style("fill", "none");

              group1.attr("xlink:href", "/assets/gray.png");
              group1.style("fill", "none");

              d3.select(land._groups[0][0]).attr(
                "xlink:href",
                "/images/12.png"
              );
              d3.select(land._groups[0][1]).attr(
                "xlink:href",
                "/images/12.png"
              );
              d3.select(land._groups[0][1]).attr(
                "xlink:href",
                "/images/12.png"
              );
            }
          });
        });
    };
  }

  function isLoggedIn() {
    verifyWalletConnection().then((data) => {
      if (data) {
        // draw grid for the first time
        if (isGridDrawn) {
          console.log("wallet connection verified");
        } else {
        }
      } else {
        // window.location.replace("/");
      }
    });
    document.getElementById("main").classList.remove("hidden");
    document.getElementById("clientLoader").classList.add("hidden");
    drawGrid();
    reset();
    fetchData();
  }

  // check wallet connection

  isLoggedIn();

  // select category

  const selectBtn = document.getElementById("selectCategory-btn");
  const selectCategorySelect = document.getElementById("selectCategorySelect");

  selectBtn.addEventListener("click", (e) => {
    e.preventDefault();

    console.log(selectCategorySelect.value);
    selectedCategory = selectCategorySelect.value;
  });
}
grid();
