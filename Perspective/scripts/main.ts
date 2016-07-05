// R. Conner Howell
// Perspective 2016
// Purpose: Art project, Typescript Practice
// Goal: Generate polygons with two vanish points and a center of perspective for 3D


// Required to use the SVG library
declare var SVG:any;

// Check support
if (!SVG.supported) alert("Your browser does not support SVG and this page will not work :'(");

// Initialize svg with the screen bounds at the time of page load
let svg = SVG('drawing').size(window.innerWidth, window.innerHeight);

class Palette {
  private static lists = [
    ["#8CD790", "#77AF9C", "#285943"],
    ["#73628A", "#CBC5EA", "#313D5A"],
    ["#59544B", "#7D8CA3", "#79A9D1"],
    ["#546A7B", "#9EA3B0", "#FAE1DF"],
    ["#FF4B3E", "#FFB20F", "#FFE548"],
    ["#8D89A6", "#BFABCB", "#E6C0E9"]
  ];
  // The list of the current color scheme
  public list: string[];
  // This field is used so that it is not randomized to the same color
  private index: number;
  constructor() {
    this.randomize();
  }
  randomize(): void {
    // Randomize which color array is the list
    let len = Palette.lists.length;
    let val = Math.floor(Math.random() * len) % len;
    while (this.index == val) {
      val = Math.floor(Math.random() * len) % len;
    }
    this.index = val;
    this.list = Palette.lists[this.index];
  }
}

// Point class so that 'number' types can be kept
// The SVG.js library deals with strings, and I would prefer to have 'number' types stored
class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  // toString exists for rendering the polygon with SVG.js
  // SVG.js requires points represented in a string with format: "x1,y1 x2,y2 ...."
  toString(): string {
    return `${this.x},${this.y}`;
  }
}

// Shape class is used for easier creation with SVG.js
// This way I can say new Polygon(a).addPoint(p)... instead of svg.polygon("x1,y1,x2,y2,..,x4,y4");
class Shape {
  // Depending on how many points it has, it will be a point, line, or polygon

  // String containing all points in the format "a b c d" where a = "x,y" etc.
  private points: Point[];
  private point_string: string;
  public graphic: any;

  constructor(public point: Point) {
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
  renderWithPoint(x: number, y: number): void {
    if (this.graphic) this.graphic.remove();
    switch (this.points.length + 1) {
      case 0:
      case 1: break;
      case 2: this.renderLine(x, y); break;
      default: this.renderPolygon(x, y); break;
    }
  }

  renderLine(x: number, y: number): void {
    this.graphic = svg.line(`${this.points[0].toString()}, ${x},${y}`).stroke({ width: 1 });
  }

  renderPolygon(x: number, y: number): void {
    this.makePointString();
    this.point_string += `${x},${y}`;
    this.graphic = svg.polygon(this.point_string).stroke({ width: 1 });
  }

  addPoint(point: Point): void {
    this.points.push(point);
  }

  makePointString(): void {
    this.point_string = "";
    for (let p of this.points) {
      this.point_string += p.toString() + " ";
    }
  }

  fixPersective(center: number): void {
    // Order br = bottom right | bl = bottom left | tl = top left | tr = top right
    let points = this.determinePoints();

    if (this.points[0].x < center) {
      this.vanishToLeft(points, center);
    } else {
      this.vanishToRight(points, center);
    }

    this.makePointString();
    this.graphic.remove();
    this.graphic = svg.polygon(this.point_string).stroke({ width: 1 });
  }

  vanishToLeft(p: Point[], center: number): void {
    let baseX = -1 * window.innerWidth;
    let baseY = window.innerHeight;

    p[3].x = p[0].x; // set top_right.x = bottom_right.x
    p[2].x = p[1].x; // set top_left.x = bottom_left.x

    let y_low = window.innerHeight - p[0].y; // height from bottom to bottom_right
    let y_high = window.innerHeight - p[3].y; // height from bottom to top_right
    let x = center + Math.abs(baseX); // bottom_right.x which == top_right.x

    // I'm making the proper angle to the vanishing point with congruent triangles
    //    /|
    //   /_|
    //  /__|
    p[1].y = window.innerHeight - (x - (p[1].x)) * y_low / x; // set bottom_left.y so it's proportional
    p[2].y = window.innerHeight - (x - (p[1].x)) * y_high / x; // set top_left.y so it's proportional

    this.points = p;
  }

  vanishToRight(p: Point[], center: number): void {
    let baseX = 2 * window.innerWidth;
    let baseY = window.innerHeight;

    p[3].x = p[0].x; // set top_right.x = bottom_right.x
    p[2].x = p[1].x; // set top_left.x = bottom_left.x

    let y_low = window.innerHeight - p[1].y; // height from bottom to bottom_left
    let y_high = window.innerHeight - p[2].y; // height from bottom to top_left
    let x = center + Math.abs(baseX); // bottom_right.x which == top_right.x

    // I'm making the proper angle to the vanishing point with congruent triangles
    //  |\
    //  |_\
    //  |__\
    p[0].y = window.innerHeight - (x - p[1].x) * y_low / x; // set bottom_right.y so it's proportional
    p[3].y = window.innerHeight - (x - p[1].x) * y_high / x; // set top_right.y so it's proportional

    this.points = p;
  }

  determinePoints(): Point[] {
    let br: Point, bl: Point, tl: Point, tr: Point;

    let right_most: Point = this.points[0]; // arbitrary starting value
    let second_right_most: Point = this.points[0]; // arbitrary starting value

    for (let p of this.points) {
      // Determine two right most points
      if (p.x > right_most.x) {
        second_right_most = right_most;
        right_most = p;
      } else if (p.x > second_right_most.x) {
        second_right_most = p;
      }
    }

    // Determine top and bottom of rightmost points
    if (right_most.y > second_right_most.y) {
      br = right_most;
      tr = second_right_most;
    } else {
      tr = right_most;
      br = second_right_most;
    }

    let left_most: Point = tr; // arbitrary starting value
    let second_left_most: Point = tr; // arbitrary starting value

    for (let p of this.points) {
      // Determine two right most points
      if (p.x < left_most.x) {
        second_left_most = left_most;
        left_most = p;
      } else if (p.x < second_left_most.x) {
        second_left_most = p;
      }
    }

    console.log(left_most, second_left_most);

    // Determine top and bottom of rightmost points
    if (left_most.y > second_left_most.y) {
      bl = left_most;
      tl = second_left_most;
    } else {
      tl = left_most;
      bl = second_left_most;
    }

    return [br, bl, tl, tr];
  }
}

let palette: Palette = new Palette();

let centerIsPlaced: boolean = false;


// Controller handles all input and drawing of points, lines, and polygons
class Controller {

  private centerIsPlaced: boolean;
  private centerLine: any;
  private center: number;
  private pointCount: number;
  private shapes: Shape[];

  constructor() {
    this.centerIsPlaced = false;
    this.centerLine = svg.rect(1, window.innerHeight).attr({ fill: palette.list[0] });
    this.pointCount = 0;
    this.shapes = [];
  }

  handleClick(event: any): void {
    if (!this.centerIsPlaced) {
      this.centerIsPlaced = true;
      this.center = this.centerLine.attr('x');
    } else {
      if (this.pointCount == 4) this.pointCount = 0;
      this.handleShape(event);
      this.pointCount++;
    }
  }

  handleMouseMove(event: any): void {
    if (!this.centerIsPlaced) {
      this.centerLine.attr('x', event.clientX);
    } else {
      let shape = this.shapes[this.shapes.length - 1];
      if (shape && this.pointCount < 4) {
        shape.renderWithPoint(event.clientX, event.clientY);
      }
    }
  }

  handleShape(event: any): void {
    if (this.pointCount == 0) {
      // Create new shape
      this.shapes.push(new Shape(new Point(event.clientX, event.clientY)));
    } else if (this.pointCount < 4) {
      // Add point to existing shape
      this.shapes[this.shapes.length - 1].addPoint(new Point(event.clientX, event.clientY));
    }
    // Shape is completed so fix the perspective
    if (this.pointCount == 3) this.shapes[this.shapes.length - 1].fixPersective(this.center);
  }

}

let controller: Controller = new Controller();

// I assign the listeners like this so that I can use 'this' within my typescript class
// If I assign the listerns directly, then 'this' within those functions will be #document
document.onmousemove = function(event) {
  controller.handleMouseMove(event);
};
document.getElementsByTagName("body")[0].onclick = function(event) {
  controller.handleClick(event);
};
