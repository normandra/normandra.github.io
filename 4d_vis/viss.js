var centrality = require('ngraph.centrality');
var g = require('ngraph.graph')();

//generate nodes
var nodes = new vis.DataSet()
var edges = new vis.DataSet()


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

        nodes.add({ id: i, label: obj.name, group: dict[obj.cluster.name], value: answer })

    }

    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (i != j) {
                var cluster = nodes.get(i)
                var clusterOther = nodes.get(j)

                if (cluster == null || clusterOther == null || cluster.group == null || clusterOther.group == null) {
                    continue;
                }
                switch (cluster.group) {
                    case 4:
                        if (clusterOther.group == 4) {
                            // if (cluster.value == false && clusterOther.value == true) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        }else if (clusterOther.group == 3) {
                            if (cluster.value == true && clusterOther.value == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }else if (clusterOther.group == 2 || clusterOther.group == 1) {
                            if (cluster.value == true && clusterOther.value == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }
                        break;
                    case 3:
                        if (clusterOther.group == 4) {
                            if (cluster.value == false && clusterOther.value == true) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }else if (clusterOther.group == 3) {
                            // if (cluster.value == true && clusterOther.value == false) {
                            //     edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                            //     g.addLink(cluster.label, clusterOther.label)
                            // }
                        }else if (clusterOther.group == 2 || clusterOther.group == 1) {
                            if (cluster.value == true && clusterOther.value == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }
                        break;
                    case 1:
                        if (clusterOther.group == 4) {
                            if (cluster.value == false && clusterOther.value == true) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }else if (clusterOther.group == 3) {
                            if (cluster.value == false && clusterOther.value == true) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }else if (clusterOther.group == 2) {
                            if (cluster.value == false && clusterOther.value == true) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }
                        break;
                    case 2:
                        if (clusterOther.group == 4) {
                            if (cluster.value == false && clusterOther.value == true) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }else if (clusterOther.group == 3) {
                            if (cluster.value == false && clusterOther.value == true) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }else if (clusterOther.group == 1) {
                            if (cluster.value == true && clusterOther.value == false) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }else if (clusterOther.group == 2) {
                            if ((cluster.value == true && clusterOther.value == false) || (cluster.value == false && clusterOther.value == false)) {
                                edges.add({ from: i, to: j, arrows: 'to', color: { color: 'red' } })
                                g.addLink(cluster.label, clusterOther.label)
                            }
                        }
                        break;
                    default:

                }
            }
        }
    }

    // create a network
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        nodes: {
            shape: 'dot',
            font: {
                color: 'black',
                size: 40
            },
            fixed: false
        },
        edges: {
            length: 1000
        }
    };

    // initialize your network!
    var network = new vis.Network(container, data, options);

    a = centrality.betweenness(g)
    nodes.forEach(node => {
        edgeSize = network.getConnectedEdges(node.id).length
        if (edgeSize > 0) {
            nodes.update({ id: node.id, value: a[node.label] })
        } else {
            nodes.remove(node.id)
        }
        // network.clustering.updateClusteredNode(node.id, {size: edgeSize * edgeSize * 10000})
    });

    network.on("click", function (params) {
        console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
    });

    console.log(edges.length)
    //console.log(centrality.degree(g))
    //console.log(centrality.betweenness(g))
}

// console.log(network.getConnectedNodes(2).length)