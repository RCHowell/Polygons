// R. Conner Howell
// Polygons 2016
// Purpose: Mostly an art project.
// Goal: Generate a bunch of polygons and create some cool art.


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
  randomize() {
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
  private x: number;
  private y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  // toString exists for use in rendering the polygon with SVG.js
  toString(): string {
    return `${this.x},${this.y}`;
  }
}

// Polygon class to be used for generating all screen content
class Polygon {

  // It has points a,b,c,d
  // a ----- b
  // |      |
  // d ----- c
  // Polygons are limited to 4 points for this project

  // String containing all points in the format "a b c d" where a = "x,y" etc.
  private points: string;
  constructor(public a: Point, public b: Point, public c: Point, public d: Point) {
    // Points are represented by a string "a,b"
    // Turn point objects into a string recognizable by SVG.js
    this.points = `${a.toString()} ${b.toString()} ${c.toString()} ${d.toString()}`;
  }
  getPoints(): string {
    return this.points;
  }
}

// Box is composed of three polygons and seven points
class Box {
  private left: any;
  private right: any;
  private top: any;
  constructor(svg: any, cx: number, cy: number, scale: number) {

    // Small and Big are the differences that the point is offset by the scale
    let small = (scale / 4);
    let big = (scale / 2);

    // Create the 7 points
    // p1 is at the center and p2-p7 form a hexagon around the center
    // I am not able to make an ascii visual unfortunately
    let p1 = new Point(cx, cy);
    let p2 = new Point(cx, cy - big);
    let p3 = new Point(cx + big, cy - small);
    let p4 = new Point(cx - big, cy - small);
    let p5 = new Point(cx + big, cy + small);
    let p6 = new Point(cx - big, cy + small);
    let p7 = new Point(cx, cy + big);

    // Polygons for the box
    let left = new Polygon(p6, p1, p2, p4);
    let right = new Polygon(p1, p5, p3, p2);
    let top = new Polygon(p6, p7, p5, p1);

    // Draw them with SVG.js
    this.left = svg.polygon(left.getPoints()).fill("#000");
    this.right = svg.polygon(right.getPoints()).fill("#444");
    this.top = svg.polygon(top.getPoints()).fill("#EEE");
  }
  changeColor(palette: string[]) {
    this.left.fill(palette[0]);
    this.right.fill(palette[1]);
    this.top.fill(palette[2]);
  }
}

// Prompt user for column input
let column_string: string = prompt("Enter number of columns\nClick once generated\nRange: [5, 40]\n", "20");
let COLUMNS: number = parseInt(column_string, 10);
// Input validation
while (isNaN(COLUMNS) || (parseInt(column_string, 10) < 5 || parseInt(column_string, 10) > 40)) {
  column_string = prompt("NOT IN RANGE\nEnter number of columns\nRange: [5, 40]\n", "20");
  COLUMNS = parseInt(column_string, 10)
}

let scale = window.innerWidth / COLUMNS;
let boxes: Array<Box> = [];

for (let i = 0; i < COLUMNS; i++) {
  for (let j = 0; j < COLUMNS + 1; j++) {
    // shift row every other column
    let shift = (i % 2 == 0) ? 0 : (scale / 2);
    boxes.push(new Box(svg, j * scale + shift, i * (scale - (scale  / 4)), scale));
  }
}

// Finished Adding boxes
document.getElementById('loading').remove();

// Initialize color palette
let palette = new Palette();

// This adds an onclick function to the whole body
// The function changes the color of the boxes
document.getElementsByTagName("body")[0].onclick = function(){
  palette.randomize();
  for (let box of boxes) {
    box.changeColor(palette.list);
  }
}
