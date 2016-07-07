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

// Initialize global instance of Palette after declaring the class
let palette: Palette = new Palette();

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
  private color: string;

  constructor(public point: Point) {
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
    this.graphic = svg.polygon(this.point_string).attr({fill: this.color });
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

  setColor(color: string): void {
    this.graphic.attr({fill: color});
    this.color = color;
  }

}

// Controller handles all input and drawing of points, lines, and polygons
class Controller {

  private drawing: boolean;
  private shapes: Shape[];
  private colorCount: number;

  constructor() {
    this.drawing = false;
    this.shapes = [];
    this.colorCount = 0;
  }

  handleClick(event: any): void {
    this.handleShape(event);
  }

  handleMouseMove(event: any): void {
    let shape = this.shapes[this.shapes.length - 1];
    if (shape && this.drawing) {
      shape.renderWithPoint(event.clientX, event.clientY);
    }
  }

  handleShape(event: any): void {
    if (!this.drawing) {
      // Create new shape
      this.shapes.push(new Shape(new Point(event.clientX, event.clientY)));
      this.drawing = true;
    } else {
      // Add point to existing shape
      this.shapes[this.shapes.length - 1].addPoint(new Point(event.clientX, event.clientY));
    }
  }

  changeShapeColor(colors: string[]): void {
    this.shapes[this.shapes.length - 1].setColor(colors[this.colorCount]);
    this.colorCount = (++this.colorCount % colors.length);
  }

  finishShape(): void {
    this.drawing = false;
  }

}

// Initialize global Controller instance before setting listeners
let controller: Controller = new Controller();

// I assign the listeners like this so that I can use 'this' within my typescript class
// If I assign the listerns directly, then 'this' within those functions will be #document
document.onmousemove = function(event) {
  controller.handleMouseMove(event);
};
document.getElementsByTagName("body")[0].onclick = function(event) {
  controller.handleClick(event);
};
document.body.onkeyup = function(e){
  // 32 is the keycode for the spacebar and 13 is for enter
  if(e.keyCode == 32) controller.finishShape();
  if(e.keyCode == 13) controller.changeShapeColor(palette.list);
}
