// R. Conner Howell
// Polygons 2016
// Purpose: Mostly an art project.
// Goal: Generate a bunch of polygons and create some cool art.
// Check support
if (!SVG.supported)
    alert("Your browser does not support SVG and this page will not work :'(");
// Initialize svg with the screen bounds at the time of page load
var svg = SVG('drawing').size(window.innerWidth, window.innerHeight);
var Palette = (function () {
    function Palette() {
        this.randomize();
    }
    Palette.prototype.randomize = function () {
        // Randomize which color array is the list
        var len = Palette.lists.length;
        var val = Math.floor(Math.random() * len) % len;
        while (this.index == val) {
            val = Math.floor(Math.random() * len) % len;
        }
        this.index = val;
        this.list = Palette.lists[this.index];
    };
    Palette.lists = [
        ["#8CD790", "#77AF9C", "#285943"],
        ["#73628A", "#CBC5EA", "#313D5A"],
        ["#59544B", "#7D8CA3", "#79A9D1"],
        ["#546A7B", "#9EA3B0", "#FAE1DF"],
        ["#FF4B3E", "#FFB20F", "#FFE548"],
        ["#8D89A6", "#BFABCB", "#E6C0E9"]
    ];
    return Palette;
}());
// Point class so that 'number' types can be kept
// The SVG.js library deals with strings, and I would prefer to have 'number' types stored
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    // toString exists for use in rendering the polygon with SVG.js
    Point.prototype.toString = function () {
        return this.x + "," + this.y;
    };
    return Point;
}());
// Polygon class to be used for generating all screen content
var Polygon = (function () {
    function Polygon(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        // Points are represented by a string "a,b"
        // Turn point objects into a string recognizable by SVG.js
        this.points = a.toString() + " " + b.toString() + " " + c.toString() + " " + d.toString();
    }
    Polygon.prototype.getPoints = function () {
        return this.points;
    };
    return Polygon;
}());
// Box is composed of three polygons and seven points
var Box = (function () {
    function Box(svg, cx, cy, scale) {
        // Small and Big are the differences that the point is offset by the scale
        var small = (scale / 4);
        var big = (scale / 2);
        // Create the 7 points
        // p1 is at the center and p2-p7 form a hexagon around the center
        // I am not able to make an ascii visual unfortunately
        var p1 = new Point(cx, cy);
        var p2 = new Point(cx, cy - big);
        var p3 = new Point(cx + big, cy - small);
        var p4 = new Point(cx - big, cy - small);
        var p5 = new Point(cx + big, cy + small);
        var p6 = new Point(cx - big, cy + small);
        var p7 = new Point(cx, cy + big);
        // Polygons for the box
        var left = new Polygon(p6, p1, p2, p4);
        var right = new Polygon(p1, p5, p3, p2);
        var top = new Polygon(p6, p7, p5, p1);
        // Draw them with SVG.js
        this.left = svg.polygon(left.getPoints()).fill("#000");
        this.right = svg.polygon(right.getPoints()).fill("#444");
        this.top = svg.polygon(top.getPoints()).fill("#EEE");
    }
    Box.prototype.changeColor = function (palette) {
        this.left.fill(palette[0]);
        this.right.fill(palette[1]);
        this.top.fill(palette[2]);
    };
    return Box;
}());
// Prompt user for column input
var column_string = prompt("Enter number of columns\nClick once generated\nRange: [5, 40]\n", "20");
var COLUMNS = parseInt(column_string, 10);
// Input validation
while (isNaN(COLUMNS) || (parseInt(column_string, 10) < 5 || parseInt(column_string, 10) > 40)) {
    column_string = prompt("NOT IN RANGE\nEnter number of columns\nRange: [5, 40]\n", "20");
    COLUMNS = parseInt(column_string, 10);
}
// Scale is the width over (2 * columns) because the boxes extend in the +x and -x direction by 2 * scale
var scale = window.innerWidth / COLUMNS;
var boxes = [];
for (var i = 0; i < COLUMNS; i++) {
    for (var j = 0; j < COLUMNS + 1; j++) {
        var shift = (i % 2 == 0) ? 0 : (scale / 2);
        boxes.push(new Box(svg, j * scale + shift, i * (scale - (scale / 4)), scale));
    }
}
// Finished Adding boxes
document.getElementById('loading').remove();
// Initialize color palette
var palette = new Palette();
// This adds an onclick function to the whole body
// The function changes the color of the boxes
document.getElementsByTagName("body")[0].onclick = function () {
    palette.randomize();
    for (var _i = 0, boxes_1 = boxes; _i < boxes_1.length; _i++) {
        var box = boxes_1[_i];
        box.changeColor(palette.list);
    }
};
