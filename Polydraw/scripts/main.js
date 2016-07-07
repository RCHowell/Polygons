// R. Conner Howell
// Perspective 2016
// Purpose: Art project, Typescript Practice
// Goal: Generate polygons with two vanish points and a center of perspective for 3D
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
// Initialize global instance of Palette after declaring the class
var palette = new Palette();
// Point class so that 'number' types can be kept
// The SVG.js library deals with strings, and I would prefer to have 'number' types stored
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    // toString exists for rendering the polygon with SVG.js
    // SVG.js requires points represented in a string with format: "x1,y1 x2,y2 ...."
    Point.prototype.toString = function () {
        return this.x + "," + this.y;
    };
    return Point;
}());
// Shape class is used for easier creation with SVG.js
// This way I can say new Polygon(a).addPoint(p)... instead of svg.polygon("x1,y1,x2,y2,..,x4,y4");
var Shape = (function () {
    function Shape(point) {
        this.point = point;
        // Points are represented by a string "a,b"
        // Turn point objects into a string recognizable by SVG.js
        this.points = [point];
        // Starting color is black
        this.color = "#000";
        // Shape starts as a point (represented with a small circle)
        this.graphic = svg.circle(5).attr({
            cx: point.x,
            cy: point.y,
            fill: this.color
        });
    }
    // This method draws the polygon as if the point were there
    Shape.prototype.renderWithPoint = function (x, y) {
        if (this.graphic)
            this.graphic.remove();
        switch (this.points.length + 1) {
            case 0:
            case 1: break;
            case 2:
                this.renderLine(x, y);
                break;
            default:
                this.renderPolygon(x, y);
                break;
        }
    };
    Shape.prototype.renderLine = function (x, y) {
        this.graphic = svg.line(this.points[0].toString() + ", " + x + "," + y).stroke({ width: 1 });
    };
    Shape.prototype.renderPolygon = function (x, y) {
        this.makePointString();
        this.point_string += x + "," + y;
        this.graphic = svg.polygon(this.point_string).attr({ fill: this.color });
    };
    Shape.prototype.addPoint = function (point) {
        this.points.push(point);
    };
    Shape.prototype.makePointString = function () {
        this.point_string = "";
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            this.point_string += p.toString() + " ";
        }
    };
    Shape.prototype.setColor = function (color) {
        this.graphic.attr({ fill: color });
        this.color = color;
    };
    return Shape;
}());
// Controller handles all input and drawing of points, lines, and polygons
var Controller = (function () {
    function Controller() {
        this.drawing = false;
        this.shapes = [];
        this.colorCount = 0;
    }
    Controller.prototype.handleClick = function (event) {
        this.handleShape(event);
    };
    Controller.prototype.handleMouseMove = function (event) {
        var shape = this.shapes[this.shapes.length - 1];
        if (shape && this.drawing) {
            shape.renderWithPoint(event.clientX, event.clientY);
        }
    };
    Controller.prototype.handleShape = function (event) {
        if (!this.drawing) {
            // Create new shape
            this.shapes.push(new Shape(new Point(event.clientX, event.clientY)));
            this.drawing = true;
        }
        else {
            // Add point to existing shape
            this.shapes[this.shapes.length - 1].addPoint(new Point(event.clientX, event.clientY));
        }
    };
    Controller.prototype.changeShapeColor = function (colors) {
        this.shapes[this.shapes.length - 1].setColor(colors[this.colorCount]);
        this.colorCount = (++this.colorCount % colors.length);
    };
    Controller.prototype.finishShape = function () {
        this.drawing = false;
    };
    return Controller;
}());
// Initialize global Controller instance before setting listeners
var controller = new Controller();
// I assign the listeners like this so that I can use 'this' within my typescript class
// If I assign the listerns directly, then 'this' within those functions will be #document
document.onmousemove = function (event) {
    controller.handleMouseMove(event);
};
document.getElementsByTagName("body")[0].onclick = function (event) {
    controller.handleClick(event);
};
document.body.onkeyup = function (e) {
    // 32 is the keycode for the spacebar and 13 is for enter
    if (e.keyCode == 32)
        controller.finishShape();
    if (e.keyCode == 13)
        controller.changeShapeColor(palette.list);
};
