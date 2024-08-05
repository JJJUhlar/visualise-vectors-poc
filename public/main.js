let question;
let question2;
let question3;

let controlX;
let controlY;
let controlZ;

let submit;

let loading;

window.addEventListener("DOMContentLoaded", () => {
  question = document.getElementById("question");
  question2 = document.getElementById("question2");
  question3 = document.getElementById("question3");
  loading = document.getElementById("loading");

  submit = document.getElementById("submit");
  submit.addEventListener("click", async () => {
    submit.disabled = true;
    loading.hidden = false;

    let v1 = await getVectors(question.value);
    let v2 = await getVectors(question2.value);
    let v3 = await getVectors(question3.value);

    loading.hidden = true;
    submit.disabled = false;

    function updatePlot() {
      let slice1 = sliceEmbeddings(v1);
      let slice2 = sliceEmbeddings(v2);
      let slice3 = sliceEmbeddings(v3);

      console.log(v1);
      let all = [...v1, ...v2, ...v3];
      console.log(all);
      console.log(v1);

      plotGraph(v1, question.value);

      let t1 = createTrace(slice1.x, slice1.y, slice1.z, slice1.labels, "blue");
      let t2 = createTrace(
        slice2.x,
        slice2.y,
        slice2.z,
        slice2.labels,
        "green"
      );
      let t3 = createTrace(slice3.x, slice3.y, slice3.z, slice3.labels, "red");

      plotVectors(t1, t2, t3);
    }

    updatePlot();

    document.getElementById("controlX").addEventListener("input", updatePlot);
    document.getElementById("controlY").addEventListener("input", updatePlot);
    document.getElementById("controlZ").addEventListener("input", updatePlot);
  });
});

function sliceEmbeddings(data) {
  controlX = parseInt(document.getElementById("controlX").value, 10);
  controlY = parseInt(document.getElementById("controlY").value, 10);
  controlZ = parseInt(document.getElementById("controlZ").value, 10);

  console.log(controlX);

  const x = data.map((vec) => vec.embedding[controlX] * 10);
  const y = data.map((vec) => vec.embedding[controlY] * 10);
  const z = data.map((vec) => vec.embedding[controlZ] * 10);

  const labels = data.map(
    (vec) => `${vec.wiki_name}\n\r${vec.text.slice(0, 25)}`
  );

  return { x, y, z, labels };
}

async function getVectors(query) {
  let route = "/vector?query=" + query.toString();

  const res = await fetch(route);
  const vectors = await res.json();

  const parsed = parseEmbeddings(vectors);
  return parsed;
}

function createTrace(x, y, z, labels, colour) {
  const trace = {
    x: x,
    y: y,
    z: z,
    mode: "markers",
    marker: {
      size: 8,
      color: colour,
      opacity: 0.5,
    },
    text: labels,
    type: "scatter3d",
  };
  return trace;
}

function plotVectors(...traces) {
  const data = [...traces];

  const layout = {
    scene: {
      xaxis: { title: "X Axis" },
      yaxis: { title: "Y Axis" },
      zaxis: { title: "Z Axis" },
    },
    title: "Embeddings",
  };

  Plotly.newPlot("plotly-3d-plot", data, layout);
}

function parseEmbeddings(vectors) {
  const parsed = vectors.map((vect) => {
    let str = vect.embedding.slice(1, vect.embedding.length - 2);

    let list = str.split(",");
    vect.embedding = list.map((vec) => parseFloat(vec));
    return vect;
  });

  return parsed;
}

function plotGraph(data, centralQuestion = "Test") {
  const width = 800;
  const height = 600;

  d3.select("#plot").html(""); // clear previous plot

  const svg = d3
    .select("#plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  const centralNode = {
    id: "central",
    wiki_name: centralQuestion,
    distance: 0, 
  };

  const nodes = [centralNode, ...data.map((d) => ({ id: d.id, ...d }))];

  const links = data.map((d) => ({
    source: "central",
    target: d.id,
    distance: d.distance,
  }));

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => d.distance * 100 * d.distance ) // scale distance for readability
    ) 
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke-width", 1);

  const node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .attr("fill", (d, i) =>
      d.id === "central"
        ? "red"
        : i < nodes.length / 3
        ? "blue"
        : i < (2 * nodes.length) / 3
        ? "green"
        : "blue"
    )
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(d.wiki_name)
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .call(drag(simulation));

  node.append("title").text((d) => d.wiki_name);

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  }

  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
}
