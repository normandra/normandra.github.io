var centrality = require('ngraph.centrality');
var g = require('ngraph.graph')();

var renderGraph = require('ngraph.pixel');

//generate nodes
var nodes = new vis.DataSet()
var edges = new vis.DataSet()
var simulatorEdges = new vis.DataSet()
var completeEdges = new vis.DataSet()
var network

var ruleList = {}


var cleanDict = {
    "exogene Anforderung": 1,
    "endogene Anforderung": 2,
    "Funktion": 3,
    "Nebenfolge": 4,
    "Nutzungszweck": 5,
    "Risiko": 6,
    "exogene-anforderung-negativ": 7,
    "endogene-anforderung-negativ": 8,
    "funktion-negativ": 9,
    "nebenfolge-negativ": 10,
    "nutzungszweck-negativ": 11,
    "risiko-negativ": 12,
}

var dict = {
    "exogene-anforderung": 1,
    "endogene-anforderung": 2,
    "funktion": 3,
    "nebenfolge": 4,
    "nutzungszweck": 5,
    "risiko": 6,
    "exogene-anforderung-negativ": 7,
    "endogene-anforderung-negativ": 8,
    "funktion-negativ": 9,
    "nebenfolge-negativ": 10,
    "nutzungszweck-negativ": 11,
    "risiko-negativ": 12,
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
        } else {
            g.addLink(edge.from, edge.to)
        }
    })


    var renderer = renderGraph(g, {
        physics: {
            springLength: 200,
            springCoeff: 0.0002,
            gravity: -1.2,
            theta: 0.8,
            dragCoeff: 0.04,
            iterations: 5
        }
    });

    renderer.on('nodehover', function (node) {
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
            shape: 'dot',
            size: 25
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
        ctx.font = "20px Arial";
        nodes.forEach(node => {
            var nodePosition = network.getPositions([node.id]);
            ctx.fillText((Math.round(node.value * 100) / 100+":"+node.inverse), nodePosition[node.id].x - node.size/2, nodePosition[node.id].y -node.size/2);
        })
    });


    network.on('click', function (properties) {
        var ids = properties.nodes;
        var clickedNodes = nodes.get(ids);
        clickedNodes.forEach(node => {
            console.log(node.id + "," + node.label + "," + node.boolAns)
            newAns = !node.boolAns
            var ansColor

            if(newAns){
                ansColor = "#aec6cf"
            }else{
                ansColor = "#ff6961"
            }
            nodes.update({ id: node.id, boolAns: newAns, color:ansColor })



            let aTest = []
            let nodeChanges = []
            completeEdges.clear()
            let counter = 0

            let seenConflicts = []
            let wouldBeConflicts = {}
            let idlist = nodes.getIds()

            idlist.forEach(id => {
                wouldBeConflicts[id] = {
                    inverse: 0,
                }
            });

            for (let i = 0; i < nodes.length; i++) {
                var cluster = nodes.get(i)
                for (let j = 0; j < nodes.length; j++) {
                    var clusterOther = nodes.get(j)
                    if (i !== j && !seenConflicts.includes(hashKriteria(clusterOther.id, cluster.id))) {
                        counter++

                        if (cluster === null || clusterOther === null || cluster.cluster === null || clusterOther.cluster === null) {
                            continue
                        }

                        let real

                        nodeRule = hashKriteria(cluster.cluster, clusterOther.cluster)
                        nodeRule = ruleList[nodeRule]

                        if (nodeRule != null) {
                            real = false
                            result = nodeRule(cluster.boolAns, clusterOther.boolAns)
                            if (result == 1) {
                                // conflict
                                real = true
                                seenConflicts.push(hashKriteria(cluster.id, clusterOther.id))
                            }
                            aTest.push({ id: counter, actual: real, from: i, to: j, color: { color: '#cccccc' } })
                        }
                    }
                }
            }


            idlist.forEach(idd => {
                nodeChanges.push({ id: idd, inverse: wouldBeConflicts[idd].inverse })
            });


            nodes.update(nodeChanges)
            completeEdges.add(aTest)

            let updateInverse = []

            for (let k = 0; k < nodes.length; k++) {
                var fakeCounter = 0
                seenConflicts = []
                aTest = []
                var changedCluster = nodes.get(k)
                var simAns = !changedCluster.boolAns
                for (let i = 0; i < nodes.length; i++) {
                    var cluster = nodes.get(i)
                    if (cluster.id == changedCluster.id) {
                        cluster.boolAns = simAns
                    }
                    // cluster.boolAns = !cluster.boolAns
                    for (let j = 0; j < nodes.length; j++) {
                        var clusterOther = nodes.get(j)
                        if (clusterOther.id == changedCluster.id) {
                            clusterOther.boolAns = simAns
                        }
                        if (i !== j && !seenConflicts.includes(hashKriteria(clusterOther.id, cluster.id))) {
                            fakeCounter++
        
                            if (cluster === null || clusterOther === null || cluster.cluster === null || clusterOther.cluster === null) {
                                continue
                            }
        
                            let real
        
                            nodeRule = hashKriteria(cluster.cluster, clusterOther.cluster)
                            nodeRule = ruleList[nodeRule]
        
                            if (nodeRule != null) {
                                real = false
                                result = nodeRule(cluster.boolAns, clusterOther.boolAns)
                                if (result == 1) {
                                    // conflict
                                    real = true
                                    seenConflicts.push(hashKriteria(cluster.id, clusterOther.id))
                                }
                                aTest.push({ id: fakeCounter, actual: real, from: i, to: j })
                            }
                        }
                    }
                }
                console.log(aTest)
                console.log(seenConflicts)
                let counter = 0
                aTest.forEach(edge => {
                    if ((edge.to == changedCluster.id || edge.from == changedCluster.id) && edge.actual) {
                        counter++
                    }
                });
                updateInverse.push({ id: changedCluster.id, inverse: counter })
        
            }
            nodes.update(updateInverse)



            var conf = []

            completeEdges.forEach(edge => {
                if (!edge.actual) {
                    conf.push({ id: edge.id, color: { color: "#ccc" } })
                } else {
                    conf.push({ id: edge.id, color: { color: "red" }, value: 15 })
                }
            })

            completeEdges.update(conf)

        })
    });
}

module.exports.showComplete = function () {
    var atest = []
    var btest = []

    // create a network
    completeEdges.forEach(edge => {
        atest.push({ id: edge.id, color: { color: "#ccc" }, value: undefined })
    })

    nodes.forEach(node => {
        btest.push({ id: node.id, hidden: false, value: 1 })

    });

    completeEdges.clear
    completeEdges.update(atest)
    nodes.update(btest)

}

module.exports.showConflictsFast = function () {
    // create a network
    var aTest = []

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

module.exports.slimEdges = function () {
    let seenNodes = []
    let out = []

    completeEdges.forEach(edge => {
        if (edge.actual) {
            if (!seenNodes.includes(edge.to)) {
                seenNodes.push(edge.from)
                out.push(edge)
            }
        }
    });

    return out
}

function trimEdges(edgeToTrim) {
    let seenNodes = []
    let out = []

    edgeToTrim.forEach(edge => {
        if (!seenNodes.includes(edge.to)) {
            seenNodes.push(edge.from)
            out.push(edge)
        }

    });

    return out
}

module.exports.sortEdges = function () {
    this.cenBetween()
    let toSort = this.slimEdges()
    toSort.sort(function (a, b) {
        return (nodes.get(b.from).value + nodes.get(b.to).value) - (nodes.get(a.from).value + nodes.get(a.to).value)
    })

    console.log(toSort)
    console.log(nodes)
    return toSort
}

// node sort wrong
module.exports.sortNodes = function () {
    this.cenBetween()
    let toSort = nodes.getIds()
    let edgeList = this.sortEdges()
    let sortedEdges = []
    let finalEdges = []

    toSort.sort(function (a, b) {
        return (nodes.get(b).value) - (nodes.get(a).value)
    })

    console.log("sorted nodes", toSort)

    toSort.forEach(node => {
        edgeList.forEach(edge => {
            if ((edge.from == node || edge.to == node) && !sortedEdges.includes(edge.id)) {
                sortedEdges.push(edge.id)
                finalEdges.push(edge)
            }
        });
    });

    console.log("sorted edges: ", finalEdges)

    return finalEdges
}

module.exports.recalculateGraph = function () {

    let aTest = []
    let nodeChanges = []
    completeEdges.clear()
    let counter = 0

    let seenConflicts = []
    let wouldBeConflicts = {}
    let idlist = nodes.getIds()

    idlist.forEach(id => {
        wouldBeConflicts[id] = {
            inverse: 0,
        }
    });

    for (let i = 0; i < nodes.length; i++) {
        var cluster = nodes.get(i)
        for (let j = 0; j < nodes.length; j++) {
            var clusterOther = nodes.get(j)
            if (i !== j && !seenConflicts.includes(hashKriteria(clusterOther.id, cluster.id))) {
                counter++

                if (cluster === null || clusterOther === null || cluster.cluster === null || clusterOther.cluster === null) {
                    continue
                }

                let real

                nodeRule = hashKriteria(cluster.cluster, clusterOther.cluster)
                nodeRule = ruleList[nodeRule]

                if (nodeRule != null) {
                    real = false
                    result = nodeRule(cluster.boolAns, clusterOther.boolAns)
                    if (result == 1) {
                        // conflict
                        real = true
                        seenConflicts.push(hashKriteria(cluster.id, clusterOther.id))
                    }
                    aTest.push({ id: counter, actual: real, from: i, to: j, color: { color: '#cccccc' } })
                }
            }
        }
    }


    idlist.forEach(idd => {
        nodeChanges.push({ id: idd, inverse: wouldBeConflicts[idd].inverse })
    });


    nodes.update(nodeChanges)
    completeEdges.add(aTest)

    let updateInverse = []

    for (let k = 0; k < nodes.length; k++) {
        var fakeCounter = 0
        seenConflicts = []
        aTest = []
        var changedCluster = nodes.get(k)
        var simAns = !changedCluster.boolAns
        for (let i = 0; i < nodes.length; i++) {
            var cluster = nodes.get(i)
            if (cluster.id == changedCluster.id) {
                cluster.boolAns = simAns
            }
            // cluster.boolAns = !cluster.boolAns
            for (let j = 0; j < nodes.length; j++) {
                var clusterOther = nodes.get(j)
                if (clusterOther.id == changedCluster.id) {
                    clusterOther.boolAns = simAns
                }
                if (i !== j && !seenConflicts.includes(hashKriteria(clusterOther.id, cluster.id))) {
                    fakeCounter++

                    if (cluster === null || clusterOther === null || cluster.cluster === null || clusterOther.cluster === null) {
                        continue
                    }

                    let real

                    nodeRule = hashKriteria(cluster.cluster, clusterOther.cluster)
                    nodeRule = ruleList[nodeRule]

                    if (nodeRule != null) {
                        real = false
                        result = nodeRule(cluster.boolAns, clusterOther.boolAns)
                        if (result == 1) {
                            // conflict
                            real = true
                            seenConflicts.push(hashKriteria(cluster.id, clusterOther.id))
                        }
                        aTest.push({ id: fakeCounter, actual: real, from: i, to: j })
                    }
                }
            }
        }
        console.log(aTest)
        console.log(seenConflicts)
        let counter = 0
        aTest.forEach(edge => {
            if ((edge.to == changedCluster.id || edge.from == changedCluster.id) && edge.actual) {
                counter++
            }
        });
        updateInverse.push({ id: changedCluster.id, inverse: counter })

    }
    nodes.update(updateInverse)



}

//cluster 1: zweck der sl ; 2: infrak vor. ; 3 norm ; 4+ : unused
module.exports.visjs = function (jsonObject) {
    jsonObject = JSON.parse(jsonObject)

    let a = 0

    // convert to ngraph notation
    for (let i = 0; i < jsonObject.length; i++) {
        var obj = jsonObject[i];

        if (obj.subcriterion.cluster.id == null) {
            continue;
        }

        /* var answer = obj.answers[0].booleanAnswer
        if (obj.cluster.negative) {
            answer = !answer
        } */
        var answer = obj.booleanAnswer

        console.log(obj)

        // michael nodes.add({ id: a, name: obj.name, label: obj.label, cluster: dict[obj.cluster.name], boolAns: answer, value: 3 })
        if(answer){
            nodes.add({ id: a, subcriterionId: obj.subcriterion.id, name: obj.subcriterion.name, label: obj.subcriterion.label, cluster: obj.subcriterion.cluster.id, boolAns: answer, value: 1, size: 25, color: "#aec6cf" })
        }else{
            nodes.add({ id: a, subcriterionId: obj.subcriterion.id, name: obj.subcriterion.name, label: obj.subcriterion.label, cluster: obj.subcriterion.cluster.id, boolAns: answer, value: 1, size: 25, color: "#ff6961" })
        }

        a++
    }

    this.recalculateGraph()


    console.log(edges.length)
    this.showGraph()
}

module.exports.parseRule = function (rule) {
    var test = rule.split("*");
    a = test.length - 1

    for (i = 0; i < a; i++) {
        var rule = test[i].split(";")
        ruleList[String([cleanDict[rule[0].trim()], cleanDict[rule[2].trim()]])] = readCase(rule[3])
    }

    // b = readCase("Fall 3")
    // console.log(b(true,true))
    //krit 1 on [0] krit 2 on [2] case on [3]

    console.log(ruleList["1,2"])
}

function readCase(name) {
    var rule = parseInt(name.split(" ")[1]);
    switch (rule) {
        case 1:
            return caseOne
        case 2:
            return caseTwo
        case 3:
            return caseThree
        case 4:
            return caseFour
        case 5:
            return caseFive
        default:
            return false
    }
}

//1 a conflict
//2 would be conflict
//3 would be conflict opposite
//4 nothing

function caseOne(a, b) {
    if (a === true && b === true) {
        return 1
    } else if (a === false && b === true) {
        return 2
    } else if (a === true && b === false) {
        return 3
    } else {
        return 4
    }
}

function caseTwo(a, b) {
    if (a === true && b === false) {
        return 1
    } else if (a === false && b === false) {
        return 2
    } else if (a === true && b === true) {
        return 3
    } else {
        return 4
    }
}

function caseThree(a, b) {
    if (a == false && b === true) {
        return 1
    } else if (a === true && b === true) {
        return 2
    } else if (a === false && b === false) {
        return 3
    } else {
        return 4
    }
}

function caseFour(a, b) {
    if (a === false && b === false) {
        return 1
    } else if (a === true && b === false) {
        return 2
    } else if (a === false && b === true) {
        return 3
    } else {
        return 4
    }
}

function caseFive(a, b) {
    return 3
}

function hashKriteria(a, b) {
    return a + "," + b
}

var naiveReverse = function (string) {
    return string.split('').reverse().join('');
}

// console.log(network.getConnectedNodes(2).length)