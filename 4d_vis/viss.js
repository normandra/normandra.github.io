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
            shape: 'dot',
            color: {
                background: "red"
            },
            group: undefined
        },
        physics: {
            enabled : true,
            barnesHut: {
                avoidOverlap: 1,
                springConstant: 0
            },
            stabilization: {
                iterations: 100
            }
        },
        edges:{
            smooth: {
                enabled: false
            }
        }
    };


    network = new vis.Network(container, data, options)
    network.on("stabilizationIterationsDone", function () {
        network.setOptions( { physics: false } );
    });
}

module.exports.showComplete = function () {
    // create a network
    completeEdges.forEach(edge => {
        completeEdges.update([{ id: edge.id, color: {color: "#ccc"}}])
    })

}

module.exports.showConflicts = function () {
    // create a network
    completeEdges.forEach(edge => {
        if(!edge.actual){
            completeEdges.update([{ id: edge.id, color:{color : "#ccc"}}])
        }else{
            completeEdges.update([{ id: edge.id, color: {color: "red"}}])
        }
    })

}

module.exports.cenBetween = function () {
    //recalculate for centrality
    a = centrality.betweenness(g)
    nodes.forEach(node => {
        edgeSize = network.getConnectedEdges(node.id).length
        if (edgeSize > 0) {
            nodes.update({ id: node.id, boolAns: a[node.label] })
        } else {
            nodes.remove(node.id)
        }
        // network.clustering.updateClusteredNode(node.id, {size: edgeSize * edgeSize * 10000})
    });
}

//group 1: zweck der sl ; 2: infrak vor. ; 3 norm ; 4+ : unused
module.exports.visjs = function (jsonObject) {
    jsonObject = JSON.parse(jsonObject)

    // convert to ngraph notation
    for (let i = 0; i < jsonObject.length; i++) {
        var obj = jsonObject[i];

        if(obj.cluster == null){
            continue;
        }

        var answer = obj.answers[0].booleanAnswer
        if(obj.cluster.negative){
            answer = !answer
        }

        nodes.add({ id: i, name: obj.name, label: obj.label, group: dict[obj.cluster.name], boolAns: answer,value: 3 })

    }

    counter = 0

    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (i != j) {
                counter++
                var cluster = nodes.get(i)
                var clusterOther = nodes.get(j)

                if (cluster == null || clusterOther == null || cluster.group == null || clusterOther.group == null) {
                    continue;
                }
                switch (cluster.group) {
                    case 4:
                        if (clusterOther.group == 4) {
                            // if (cluster.boolAns == false && clusterOther.boolAns == true) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        }else if (clusterOther.group == 3) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })
                        }else if (clusterOther.group == 2 || clusterOther.group == 1) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })
                        }
                        break;
                    case 3:
                        if (clusterOther.group == 4) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 3) {
                            // if (cluster.boolAns == true && clusterOther.boolAns == false) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        }else if (clusterOther.group == 2 || clusterOther.group == 1) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }
                        break;
                    case 1:
                        if (clusterOther.group == 4) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 3) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 2) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }
                        break;
                    case 2:
                        if (clusterOther.group == 4) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 3) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 1) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }else if (clusterOther.group == 2) {
                            var real = false
                            if (cluster.boolAns == true && clusterOther.boolAns == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                                real = true
                            }
                            completeEdges.add({ id: counter,actual: real, from: i, to: j, arrows: 'to', color: { color: 'red' } })

                        }
                        break;
                    default:

                }
            }
        }
    }
    console.log(edges.length)
    this.showGraph()
}



// console.log(network.getConnectedNodes(2).length)