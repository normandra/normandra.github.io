var centrality = require('ngraph.centrality');
var g = require('ngraph.graph')();

var renderGraph = require('ngraph.pixel');

//generate nodes
var nodes = new vis.DataSet()
var edges = new vis.DataSet()
var completeEdges = new vis.DataSet()
var network


var dict = {
    "exogene-anforderung": 1,
    "endogene-anforderung": 2,
    "funktion": 3,
    "nutzungszweck": 4,
    "exogene-anforderung-negativ": 5,
    "endogene-anforderung-negativ": 6,
    "funktion-negativ": 7,
    "nutzungszweck-negativ": 8,
}

function getNumber(string, defaultValue) {
    var number = parseFloat(string);
    return (typeof number === 'number') && !isNaN(number) ? number : (defaultValue || 10);
}

module.exports.threed = function () {
    conf = []

    g.clear()
    completeEdges.forEach(edge => {
        if (edge.actual) {
            conf.push(g.addLink(edge.from, edge.to))
        }else{
            g.addLink(edge.from, edge.to)
        }
    })
  

    var renderer = renderGraph(g, {
        physics: {
          springLength : 200,
          springCoeff : 0.0002,
          gravity: -1.2,
          theta : 0.8,
          dragCoeff : 0.04,
          iterations: 5
        }
      });

    renderer.on('nodehover', function(node) {
        console.log('Hover node ' + JSON.stringify(node));
    });

    conf.forEach(link => {
        var linkUI = renderer.getLink(link.id)
        linkUI.fromColor = 0xFF0000; // update link head color
        linkUI.toColor = 0xFF0000; // update link tail color
    })
    
  };

module.exports.showGraph = function () {
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: completeEdges
    };
    var options = {
        nodes: {
            shape: 'dot'
        },
        physics: {
            enabled: true,
            barnesHut: {
                avoidOverlap: 1,
                springConstant: 0
            },
            stabilization: {
                iterations: 100
            }
        },
        edges: {
            smooth: {
                enabled: false
            }
        }
    };


    network = new vis.Network(container, data, options)
    network.on("stabilizationIterationsDone", function () {
        network.setOptions({ physics: false });
    });

    network.on("afterDrawing", function (ctx) {
        ctx.font = "30px Arial";
        nodes.forEach(node => {
            var nodePosition = network.getPositions([node.id]);
            ctx.fillText(node.inverse, nodePosition[node.id].x - 15, nodePosition[node.id].y - 30); 
        })
      });


    network.on('click', function (properties) {
        var ids = properties.nodes;
        var clickedNodes = nodes.get(ids);
        clickedNodes.forEach(node => {
            console.log(node.id + "," + node.label + "," + node.boolAns)
            newAns = !node.boolAns
            nodes.update({ id: node.id, boolAns: newAns })

            var aTest = []
            let nodeChanges = []
            completeEdges.clear()
            let counter = 0
            for (let i = 0; i < nodes.length; i++) {
                var cluster = nodes.get(i)
                let wouldBeConflicts = 0
                for (let j = 0; j < nodes.length; j++) {
                    if (i !== j) {
                        counter++
                        var clusterOther = nodes.get(j)
        
                        if (cluster === null || clusterOther === null || cluster.cluster === null || clusterOther.cluster === null) {
                            continue
                        }
        
                        let real
        
                        switch (cluster.cluster) {
                            case 4:
                                if (clusterOther.cluster === 4) {
                                    // if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                    //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                    //     g.addLink(cluster.label, clusterOther.label)
                                    // }
                                } else if (clusterOther.cluster === 3) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    } else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    } else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            case 3:
                                if (clusterOther.cluster === 4) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    } else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 3) {
                                    // if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                    //     edges.add({ from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                    //     g.addLink(cluster.label, clusterOther.label)
                                    // }
                                } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    }  else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            case 1:
                                if (clusterOther.cluster === 4) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 3) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 2) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            case 2:
                                if (clusterOther.cluster === 4) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 3) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 1) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    }  else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 2) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    } else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                        wouldBeConflicts++
                                    }
                                    aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            default:
                        }
                    }
                }
                if(cluster != null){
                    nodeChanges.push({ id: cluster.id, inverse: wouldBeConflicts})
                }
            }
        
            nodes.update(nodeChanges)
            completeEdges.add(aTest)

            var aTest =[]

            completeEdges.forEach(edge => {
                if (!edge.actual) {
                    aTest.push({ id: edge.id, color: { color: "#ccc" } })
                } else {
                    aTest.push({ id: edge.id, color: { color: "red" }, value: 15 })
                }
            })
        
            completeEdges.update(aTest)

        })
    });
}

module.exports.showComplete = function () {
    // create a network
    completeEdges.forEach(edge => {
        completeEdges.update([{ id: edge.id, color: { color: "#ccc" } }])
    })

    nodes.forEach(node => {
        nodes.update({ id: node.id, hidden: false, value: 1 })

    });

}

module.exports.showConflictsFast = function () {
    // create a network
    var aTest =[]

    completeEdges.forEach(edge => {
        if (!edge.actual) {
            aTest.push({ id: edge.id, color: { color: "#ccc" } })
        } else {
            aTest.push({ id: edge.id, color: { color: "red" }, value: 15 })
        }
    })

    completeEdges.update(aTest)

}

module.exports.cenBetweenOverall = function () {
    g.clear()

    completeEdges.forEach(edge => {
        g.addLink(edge.from, edge.to)
        
    })

    a = centrality.betweenness(g)

    var aTest = []
    nodes.forEach(node => {
        if (a[node.id] != undefined) {
            aTest.push({ id: node.id, value: a[node.id] })
        } else {
            aTest.push({ id: node.id, value: 0 })
        }
    });

    nodes.update(aTest)

}

module.exports.cenBetween = function () {
    //recalculate for centrality

    g.clear()

    completeEdges.forEach(edge => {
        if (edge.actual) {
            g.addLink(edge.from, edge.to)
        }
    })

    a = centrality.betweenness(g)

    var aTest = []
    nodes.forEach(node => {
        if (a[node.id] != undefined) {
            aTest.push({ id: node.id, value: a[node.id] })
        } else {
            aTest.push({ id: node.id, value: 0 })
        }
    });
    nodes.update(aTest)
}

module.exports.cenDegree = function () {
    //recalculate for centrality

    g.clear()

    completeEdges.forEach(edge => {
        if (edge.actual) {
            g.addLink(edge.from, edge.to)
        }
    })

    a = centrality.degree(g)

    var aTest = []
    nodes.forEach(node => {
        if (a[node.id] != undefined) {
            aTest.push({ id: node.id, value: a[node.id] })
        } else {
            aTest.push({ id: node.id, value: 0 })
        }
    });
    nodes.update(aTest)
}

module.exports.cenCloseness = function () {
    //recalculate for centrality

    g.clear()

    completeEdges.forEach(edge => {
        if (edge.actual) {
            g.addLink(edge.from, edge.to)
        }
    })

    a = centrality.closeness(g)

    var aTest = []
    nodes.forEach(node => {
        if (a[node.id] != undefined) {
            aTest.push({ id: node.id, value: a[node.id] })
        } else {
            aTest.push({ id: node.id, value: 0 })
        }
    });
    nodes.update(aTest)
}

module.exports.cenEccentricity = function () {
    //recalculate for centrality

    g.clear()

    completeEdges.forEach(edge => {
        if (edge.actual) {
            g.addLink(edge.from, edge.to)
        }
    })

    a = centrality.eccentricity(g)

    var aTest = []
    nodes.forEach(node => {
        if (a[node.id] != undefined) {
            aTest.push({ id: node.id, value: a[node.id] })
        } else {
            aTest.push({ id: node.id, value: 0 })
        }
    });
    nodes.update(aTest)
}

module.exports.recalculateGraph = function () {

    let aTest = []
    let nodeChanges = []
    completeEdges.clear()
    let counter = 0
    console.log(nodes)
    for (let i = 0; i < nodes.length; i++) {
        var cluster = nodes.get(i)
        let wouldBeConflicts = 0
        for (let j = 0; j < nodes.length; j++) {
            if (i !== j) {
                counter++
                var clusterOther = nodes.get(j)

                if (cluster === null || clusterOther === null || cluster.cluster === null || clusterOther.cluster === null) {
                    continue
                }

                let real

                switch (cluster.cluster) {
                    case 4:
                        if (clusterOther.cluster === 4) {
                            // if (cluster.boolAns === false && clusterOther.boolAns === true) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        } else if (clusterOther.cluster === 3) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            } else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            } else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    case 3:
                        if (clusterOther.cluster === 4) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            } else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 3) {
                            // if (cluster.boolAns === true && clusterOther.boolAns === false) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            }  else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    case 1:
                        if (clusterOther.cluster === 4) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 3) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 2) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    case 2:
                        if (clusterOther.cluster === 4) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 3) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }  else if (cluster.boolAns === true && clusterOther.boolAns === true){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 1) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            }  else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 2) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            } else if (cluster.boolAns === false && clusterOther.boolAns === false){
                                wouldBeConflicts++
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    default:
                }
            }
        }
        if(cluster != null){
            nodeChanges.push({ id: cluster.id, inverse: wouldBeConflicts})
        }
    }

    nodes.update(nodeChanges)
    completeEdges.add(aTest)

}

//cluster 1: zweck der sl ; 2: infrak vor. ; 3 norm ; 4+ : unused
module.exports.visjs = function (jsonObject) {
    jsonObject = JSON.parse(jsonObject)

    let a = 0

    // convert to ngraph notation
    for (let i = 0; i < jsonObject.length; i++) {
        var obj = jsonObject[i];

        if (obj.cluster == null) {
            continue;
        }

        var answer = obj.answers[0].booleanAnswer
        if (obj.cluster.negative) {
            answer = !answer
        }

        nodes.add({ id: a, name: obj.name, label: obj.label, cluster: dict[obj.cluster.name], boolAns: answer, value: 3 })
        a++
    }

    this.recalculateGraph()


    console.log(edges.length)
    this.showGraph()
}



// console.log(network.getConnectedNodes(2).length)