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
        // Shape starts as a point (represented with a small circle)
        this.graphic = svg.circle(5).attr({
            cx: point.x,
            cy: point.y,
            fill: "#000"
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
        this.graphic = svg.polygon(this.point_string).stroke({ width: 1 });
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
    Shape.prototype.fixPersective = function (center) {
        // Order br = bottom right | bl = bottom left | tl = top left | tr = top right
        var points = this.determinePoints();
        if (this.points[0].x < center) {
            this.vanishToLeft(points, center);
        }
        else {
            this.vanishToRight(points, center);
        }
        this.makePointString();
        this.graphic.remove();
        this.graphic = svg.polygon(this.point_string).stroke({ width: 1 });
    };
    Shape.prototype.vanishToLeft = function (p, center) {
        var baseX = -1 * window.innerWidth;
        var baseY = window.innerHeight;
        p[3].x = p[0].x; // set top_right.x = bottom_right.x
        p[2].x = p[1].x; // set top_left.x = bottom_left.x
        var y_low = window.innerHeight - p[0].y; // height from bottom to bottom_right
        var y_high = window.innerHeight - p[3].y; // height from bottom to top_right
        var x = center + Math.abs(baseX); // bottom_right.x which == top_right.x
        // I'm making the proper angle to the vanishing point with congruent triangles
        //    /|
        //   /_|
        //  /__|
        p[1].y = window.innerHeight - (x - (p[1].x)) * y_low / x; // set bottom_left.y so it's proportional
        p[2].y = window.innerHeight - (x - (p[2].x)) * y_high / x; // set top_left.y so it's proportional
        this.points = p;
    };
    Shape.prototype.vanishToRight = function (p, center) {
        var baseX = 2 * window.innerWidth;
        var baseY = window.innerHeight;
        p[3].x = p[0].x; // set top_right.x = bottom_right.x
        p[2].x = p[1].x; // set top_left.x = bottom_left.x
        var y_low = window.innerHeight - p[1].y; // height from bottom to bottom_left
        var y_high = window.innerHeight - p[2].y; // height from bottom to top_left
        var x = center + Math.abs(baseX); // bottom_right.x which == top_right.x
        // I'm making the proper angle to the vanishing point with congruent triangles
        //  |\
        //  |_\
        //  |__\
        p[0].y = window.innerHeight - (x - p[1].x) * y_low / x; // set bottom_right.y so it's proportional
        p[3].y = window.innerHeight - (x - p[1].x) * y_high / x; // set top_right.y so it's proportional
        this.points = p;
    };
    Shape.prototype.determinePoints = function () {
        var br, bl, tl, tr;
        var right_most = this.points[0]; // arbitrary starting value
        var second_right_most = this.points[0]; // arbitrary starting value
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            // Determine two right most points
            if (p.x > right_most.x) {
                second_right_most = right_most;
                right_most = p;
            }
            else if (p.x > second_right_most.x) {
                second_right_most = p;
            }
        }
        // Determine top and bottom of rightmost points
        if (right_most.y > second_right_most.y) {
            br = right_most;
            tr = second_right_most;
        }
        else {
            tr = right_most;
            br = second_right_most;
        }
        var left_most = tr; // arbitrary starting value
        var second_left_most = tr; // arbitrary starting value
        for (var _b = 0, _c = this.points; _b < _c.length; _b++) {
            var p = _c[_b];
            // Determine two right most points
            if (p.x < left_most.x) {
                second_left_most = left_most;
                left_most = p;
            }
            else if (p.x < second_left_most.x) {
                second_left_most = p;
            }
        }
        console.log(left_most, second_left_most);
        // Determine top and bottom of rightmost points
        if (left_most.y > second_left_most.y) {
            bl = left_most;
            tl = second_left_most;
        }
        else {
            tl = left_most;
            bl = second_left_most;
        }
        return [br, bl, tl, tr];
    };
    return Shape;
}());
var palette = new Palette();
var centerIsPlaced = false;
// Controller handles all input and drawing of points, lines, and polygons
var Controller = (function () {
    function Controller() {
        this.centerIsPlaced = false;
        this.centerLine = svg.rect(1, window.innerHeight).attr({ fill: palette.list[0] });
        this.pointCount = 0;
        this.shapes = [];
    }
    Controller.prototype.handleClick = function (event) {
        if (!this.centerIsPlaced) {
            this.centerIsPlaced = true;
            this.center = this.centerLine.attr('x');
        }
        else {
            if (this.pointCount == 4)
                this.pointCount = 0;
            this.handleShape(event);
            this.pointCount++;
        }
    };
    Controller.prototype.handleMouseMove = function (event) {
        if (!this.centerIsPlaced) {
            this.centerLine.attr('x', event.clientX);
        }
        else {
            var shape = this.shapes[this.shapes.length - 1];
            if (shape && this.pointCount < 4) {
                shape.renderWithPoint(event.clientX, event.clientY);
            }
        }
    };
    Controller.prototype.handleShape = function (event) {
        if (this.pointCount == 0) {
            // Create new shape
            this.shapes.push(new Shape(new Point(event.clientX, event.clientY)));
        }
        else if (this.pointCount < 4) {
            // Add point to existing shape
            this.shapes[this.shapes.length - 1].addPoint(new Point(event.clientX, event.clientY));
        }
        // Shape is completed so fix the perspective
        if (this.pointCount == 3)
            this.shapes[this.shapes.length - 1].fixPersective(this.center);
    };
    return Controller;
}());
var controller = new Controller();
// I assign the listeners like this so that I can use 'this' within my typescript class
// If I assign the listerns directly, then 'this' within those functions will be #document
document.onmousemove = function (event) {
    controller.handleMouseMove(event);
};
document.getElementsByTagName("body")[0].onclick = function (event) {
    controller.handleClick(event);
};
