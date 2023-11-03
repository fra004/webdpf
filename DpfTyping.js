/**
 * Created by rabbi on 2/9/15.
 */

var colorForNodeTyping = "#893"; // "#cb6";
var colorForEdgeTyping = "#274"; // "#ca9";

function DpfTypingOfNode(fromNode, typeNode){
    this.dpfType = 'DpfTyping';
    this.from= fromNode;
    this.type= typeNode;
    this.spec= fromNode.spec;
    this.d_line= null;
    this.recycleFlag = 0;

    this.refToOriginal = null;

    fromNode.typing = this;
    if(typeNode)
        typeNode.instances.push(this);

    this.drawTypingForNode = drawTypingForNode;
    this.moveTypingForDpfNodeMove = moveTypingForDpfNodeMove;
}

DpfTypingOfNode.prototype.copyTypingOfNode = function(copyRef){
    var from_C = findDpfNodeByIdFromCopyNodes(this.from.ID);
    var type_C = findDpfNodeByIdFromCopyNodes(this.type.ID);
    if(from_C != null && type_C != null) {
        var newTyping = new DpfTypingOfNode(from_C, type_C);
        if(copyRef)
            newTyping.refToOriginal = this;
        else
            newTyping.refToOriginal = this.refToOriginal;
    }
};

function drawTypingForNode() {

    var bb1 = this.from.d_node.getBBox(),
        bb2 = this.type.d_node.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
            {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
            {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
            {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
            {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]],
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]],
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]],
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]];

    var coords = [x1, y1, x2, y2, x3, y3, x4, y4];

    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");

    this.d_line = paper.path(path).attr({stroke: colorForNodeTyping, fill: "none", "stroke-width": 0.5}).data('coords', coords).data('origCoords', []);
}



function moveTypingForDpfNodeMove() {
    //console.log(this.from);
    //console.log(this.type);
    var bb1 = this.from.d_node.getBBox(),
        bb2 = this.type.d_node.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
            {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
            {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
            {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
            {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]],
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]],
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]],
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]];

    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2.toFixed(3), y2.toFixed(3), x3.toFixed(3), y3.toFixed(3), x4.toFixed(3), y4.toFixed(3)].join(",");


    this.d_line.attr({path: path});
    this.d_line.data('coords', [x1, y1, x2, y2, x3, y3, x4, y4]);
}


function DpfTypingOfConnection(fromConn, typeConn){
        this.from= fromConn;
        this.type= typeConn;
        this.spec= fromConn.spec;
        this.d_line= null;
        fromConn.typing = this;

        this.refToOriginal = null;

    console.log('DpfTypingOfConnection from ' + fromConn.name  + '  ' + fromConn.ID);
    console.log('DpfTypingOfConnection type ' + typeConn.name + '   ' + typeConn.ID);
    console.log(typeConn);
        console.log(typeConn.instances.length);
        if(typeConn)
            typeConn.instances.push(this);

        console.log(typeConn.instances.length);
        console.log(copyConns);
        this.drawTypingForConnection = drawTypingForConnection;
        this.moveTypingForConnection = moveTypingForConnection;
}

DpfTypingOfConnection.prototype.copyTypingOfConnection = function(copyRef){
    var from_C = findDpfConnectionByIdFromCopyConns(this.from.ID);
    var type_C = findDpfConnectionByIdFromCopyConns(this.type.ID);
    if(from_C != null && type_C != null) {
        var newTyping = new DpfTypingOfConnection(from_C, type_C);
        if(copyRef)
            newTyping.refToOriginal = this;
        else
            newTyping.refToOriginal = this.refToOriginal;
    }
};

function drawTypingForConnection () {
    console.log("\n");
    console.log(this.from);
    console.log(this.type);
    var lines1 = this.from.d_lines,
        lines2 = this.type.d_lines,
        midIndex1 = Math.floor(lines1.length / 2),
        midIndex2 = Math.floor(lines2.length / 2);
    console.log(midIndex1);
    console.log(midIndex2);
    var x1 = (lines1[midIndex1].data('coords')[0] + lines1[midIndex1].data('coords')[2] ) / 2,
        y1 = (lines1[midIndex1].data('coords')[1] + lines1[midIndex1].data('coords')[3] ) / 2,
        x4 = (lines2[midIndex2].data('coords')[0] + lines2[midIndex2].data('coords')[2] ) / 2,
        y4 = (lines2[midIndex2].data('coords')[1] + lines2[midIndex2].data('coords')[3] ) / 2;

    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][1],
        y2 = [y1 - dy, y1 + dy, y1, y1][1],
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][1],
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][1];

    var coords = [x1, y1, x2, y2, x3, y3, x4, y4];

    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");

    this.d_line = paper.path(path).attr({stroke: colorForEdgeTyping, fill: "none", "stroke-width": 0.5}).data('coords', coords).data('origCoords', []);
}


function moveTypingForConnection() {
    if(this.spec.level == 0)
        return;


    var lines1 = this.from.d_lines,
        lines2 = this.type.d_lines,
        midIndex1 = Math.floor(lines1.length / 2),
        midIndex2 = Math.floor(lines2.length / 2);
    var x1 = (lines1[midIndex1].data('coords')[0] + lines1[midIndex1].data('coords')[2] ) / 2,
        y1 = (lines1[midIndex1].data('coords')[1] + lines1[midIndex1].data('coords')[3] ) / 2,
        x4 = (lines2[midIndex2].data('coords')[0] + lines2[midIndex2].data('coords')[2] ) / 2,
        y4 = (lines2[midIndex2].data('coords')[1] + lines2[midIndex2].data('coords')[3] ) / 2;

    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][1],
        y2 = [y1 - dy, y1 + dy, y1, y1][1],
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][1],
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][1];

    var coords = [x1, y1, x2, y2, x3, y3, x4, y4];

    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");

    this.d_line.attr({path: path});
    this.d_line.data('coords', [x1, y1, x2, y2, x3, y3, x4, y4]);

};