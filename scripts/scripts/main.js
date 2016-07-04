if (!SVG.supported)
    alert("Your browser does not support SVG and this page will not work :'(");
var svg = SVG('drawing').size(window.innerWidth, window.innerHeight);
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.toString = function () {
        return this.x + "," + this.y;
    };
    return Point;
}());
var Polygon = (function () {
    function Polygon(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.points = a.toString() + " " + b.toString() + " " + c.toString() + " " + d.toString();
    }
    Polygon.prototype.getPoints = function () {
        return this.points;
    };
    return Polygon;
}());
var Box = (function () {
    function Box(svg, center, scale) {
        this.center = center;
        var p1 = new Point(center, center);
        var p2 = new Point(center, center - 2 * scale);
        var p3 = new Point(center + 2 * scale, center - scale);
        var p4 = new Point(center - 2 * scale, center - scale);
        var p5 = new Point(center + 2 * scale, center + scale);
        var p6 = new Point(center - 2 * scale, center + scale);
        var p7 = new Point(center, center + 2 * scale);
        var left = new Polygon(p6, p1, p2, p4);
        var right = new Polygon(p1, p5, p3, p2);
        var top = new Polygon(p6, p7, p5, p1);
        svg.polygon(left.getPoints).fill('none').stroke({ width: 1 });
        svg.polygon(right.getPoints).fill('none').stroke({ width: 1 });
        svg.polygon(top.getPoints).fill('none').stroke({ width: 1 });
    }
    return Box;
}());
var test = new Box(svg, 200, 100);
//# sourceMappingURL=main.js.map