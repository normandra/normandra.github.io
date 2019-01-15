var centrality = require('ngraph.centrality');
var g = require('ngraph.graph')();

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


    network.on('click', function (properties) {
        var ids = properties.nodes;
        var clickedNodes = nodes.get(ids);
        clickedNodes.forEach(node => {
            console.log(node.id + "," + node.label + "," + node.boolAns)
            newAns = !node.boolAns
            nodes.update({ id: node.id, boolAns: newAns })


            completeEdges.clear()
            let counter = 0
            for (let i = 0; i < nodes.length; i++) {
                for (let j = 0; j < nodes.length; j++) {
                    if (i !== j) {
                        counter++
                        var cluster = nodes.get(i)
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
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            case 3:
                                if (clusterOther.cluster === 4) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 3) {
                                    // if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                    //     edges.add({ from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                    //     g.addLink(cluster.label, clusterOther.label)
                                    // }
                                } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            case 1:
                                if (clusterOther.cluster === 4) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 3) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 2) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            case 2:
                                if (clusterOther.cluster === 4) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 3) {
                                    real = false
                                    if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 1) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                } else if (clusterOther.cluster === 2) {
                                    real = false
                                    if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                        real = true
                                    }
                                    completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                                }
                                break
                            default:
                        }
                    }
                }
            }

            completeEdges.forEach(edge => {
                if (!edge.actual) {
                    completeEdges.update([{ id: edge.id, color: { color: "#ccc" } }])
                } else {
                    completeEdges.update([{ id: edge.id, color: { color: "red" } }])
                }
            })

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

module.exports.showConflicts = function () {
    // create a network
    completeEdges.forEach(edge => {
        if (!edge.actual) {
            completeEdges.update([{ id: edge.id, color: { color: "#ccc" } }])
        } else {
            completeEdges.update([{ id: edge.id, color: { color: "red" } }])
        }
    })

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

    nodes.forEach(node => {
        if (a[node.id] != undefined) {
            nodes.update({ id: node.id, value: a[node.id] })
        } else {
            nodes.update({ id: node.id, value: 0 })
        }
    });
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

    nodes.forEach(node => {
        if (a[node.id] != undefined) {
            nodes.update({ id: node.id, value: a[node.id] })
        } else {
            nodes.update({ id: node.id, value: 0 })
        }
    });
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

    nodes.forEach(node => {
        console.log(a[node.id])
        if (a[node.id] != undefined) {
            nodes.update({ id: node.id, value: a[node.id] })
        } else {
            nodes.update({ id: node.id, value: 0 })
        }
    });
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

    nodes.forEach(node => {
        console.log(a[node.id])
        if (a[node.id] != undefined) {
            nodes.update({ id: node.id, value: a[node.id] })
        } else {
            nodes.update({ id: node.id, value: 0 })
        }
    });
}

module.exports.recalculateGraph = function () {
    completeEdges.clear()
    let counter = 0
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (i !== j) {
                counter++
                var cluster = nodes.get(i)
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
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    case 3:
                        if (clusterOther.cluster === 4) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 3) {
                            // if (cluster.boolAns === true && clusterOther.boolAns === false) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        } else if (clusterOther.cluster === 2 || clusterOther.cluster === 1) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    case 1:
                        if (clusterOther.cluster === 4) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 3) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 2) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    case 2:
                        if (clusterOther.cluster === 4) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 3) {
                            real = false
                            if (cluster.boolAns === false && clusterOther.boolAns === true) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 1) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        } else if (clusterOther.cluster === 2) {
                            real = false
                            if (cluster.boolAns === true && clusterOther.boolAns === false) {
                                real = true
                            }
                            completeEdges.add({ id: counter, actual: real, from: i, to: j, arrows: 'to', color: { color: '#cccccc' } })
                        }
                        break
                    default:
                }
            }
        }
    }
}

//cluster 1: zweck der sl ; 2: infrak vor. ; 3 norm ; 4+ : unused
module.exports.visjs = function (jsonObject) {
    jsonObject = JSON.parse(jsonObject)

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

        nodes.add({ id: i, name: obj.name, label: obj.label, cluster: dict[obj.cluster.name], boolAns: answer, value: 3 })
    }

    this.recalculateGraph()


    console.log(edges.length)
    this.showGraph()
}



// console.log(network.getConnectedNodes(2).length)