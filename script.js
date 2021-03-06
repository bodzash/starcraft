const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d") //webgl / webgl2

canvas.width = innerWidth //640
canvas.height = innerHeight //480

// ######################################### Classes #########################################
class Wall {
    // These Coors are grid coors not game coors
    constructor(x, y) {
        this.x = (x+1)*32-16
        this.y = (y+1)*32-16
        this.w = gridW
    }
    draw() {
        ctx.fillStyle = "black"
        ctx.fillRect(this.x-16, this.y-16, 32, 32)
    }
}

class Unit {
    constructor(x, y, w, dir) {
        idCount++
        this.id = idCount
        this.x = x
        this.y = y
        this.w = w
        this.isSelected = false
        this.isHovered = false
        this.renderModel = "defaultIdle"
        this.health = 50
        this.dir = dir
        this.spd = 0
        this.state = "idle" //idle-move-attack-attackmove-chase-cast
        this.waypoints = [] //{x: 1, y: 2}, {x: 4, y: 8}
        this.target = null //id number maybe?
        this.canShoot = true
        this.collisions = 60

        //this.initUnit()
        this.unitName = "Default"
        this.unitSize = 32 //px
        this.unitModel = {idle: "defaultIdle", attack: "defaultAttack"} //obj
        this.unitHealth = 50
        this.unitDamage =  10
        this.unitAtkRange = 5 // times gridW
        this.unitAtkSpd = 30 //in frames
        this.unitSpeed = 4
        this.unitArmor = 1 //1-2-3 L-M-H (0-None)
        this.unitPen = {L: 1, M: 1, H: 1} //1-5 (1-worst 5-best)
    }
    step() {
        //Move towards dir
        this.x += this.spd*Math.cos(3.14/180*this.dir)
        this.y -= this.spd*Math.sin(3.14/180*this.dir)

        // State Controller
        // function fetchUnitState({obj, }) {} //destructure
        /*switch(state) {
            case "idle":
            break
        }*/

        // Move to waypoints
        if (this.waypoints.length != 0) {
            let subpoint = this.waypoints[0]
            if (pointDistance(this.x, this.y, subpoint.x, subpoint.y) >= this.unitSpeed) {
                this.dir = pointDirection(this.x, this.y, subpoint.x, subpoint.y)
                this.spd = this.unitSpeed
            } else {
                this.x = subpoint.x
                this.y = subpoint.y
                this.waypoints.shift()
                if (this.waypoints.length == 0) { this.spd = 0 } //if last stop
            }
        }

        // Mouse Left Pressed Event
        if (mouseLeftPressed) {
            this.isSelected = false
        } 

        // Mouse Left Released Event
        if (mouseLeftReleased) {
            // Add to selected array
            if (insideMouseCmdr(this)) {
                this.isSelected = true
                selectedUnits.push(this)
            } else {
                this.isSelected = false
            }
        }

        // MouseCmdr hover over
        this.isHovered = insideMouseCmdr(this) ? true : false

        // Collision With Other Unit
        if ( this.spd === 0 ) {

            if (this.collisions > 0) {
                unitArray.forEach(item=> { //other = item.id
                    if (this.id !== item.id) {
                        if (checkCollInst(item, this) && item.spd === 0) {
                            let ang = pointDirection(this.x, this.y, item.x, item.y) - 180
                            this.x += 2 * Math.cos(3.14 / 180 * ang)
                            this.y -= 2 * Math.sin(3.14 / 180 * ang)
                            this.collisions--
                        }
                    }
                })
            }
            // Collision With Walls
            wallArray.forEach(item=> { //other = item.id
                if (checkCollInst(item, this)) {
                    let ang = pointDirection(this.x, this.y, item.x, item.y) - 180
                    this.x += this.unitSpeed*3 * Math.cos(3.14 / 180 * ang)
                    this.y -= this.unitSpeed*3 * Math.sin(3.14 / 180 * ang)
                }
            })
        }

        // Draw
        this.draw2D()
        //this.draw3D()
    }
    draw2D() {
        this.isSelected ? ctx.fillStyle = "green" : ctx.fillStyle = "red"
        if(this.isHovered) ctx.fillStyle = "DarkOrange"
        ctx.fillRect(this.x-this.w/2, this.y-this.w/2, this.w, this.w)
    }
    //initUnit() {  }
}

class MouseCommander {
    constructor(x, y) {
        selectedUnits = []
        this.x = x
        this.y = y
    }
    step() {
        this.draw() // Call Draw
    }
    draw() {
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.strokeStyle = "green"
        ctx.rect(this.x, this.y, mouseX-this.x, mouseY-this.y)
        ctx.stroke()
    }
}

// ####################################### Functions #######################################
// Checks collision between 2 instances
function checkCollInst(obj1, obj2) {
    if (
        obj1.x + obj1.w/2 >= obj2.x - obj2.w/2 &&
        obj1.x - obj1.w/2 <= obj2.x + obj2.w/2 &&
        obj1.y + obj1.w/2 >= obj2.y - obj2.w/2 &&
        obj1.y - obj1.w/2 <= obj2.y + obj2.w/2
        )
    {return true} else {return false}
}

// Returns angle between two points
function pointDirection(x1, y1, x2, y2) { //
    let rad = Math.atan2(y1 - y2, x1 - x2) * ( 180 / 3.14 )
    return Math.abs(rad - 180)
}

// Distance between two points
function pointDistance(x1, y1, x2, y2) {
    let a = x1 - x2
    let b = y1 - y2
    return Math.sqrt(a * a + b * b)
}

// Move Unit towards an angle
function motionAdd(dir, spd) {
    hspeed += spd*cos(pi/180*dir)
    vspeed -= spd*sin(pi/180*dir)
}

// Return the Grid that the coor is inside of it
function snapToGrid(coor) {
    return Math.floor(coor/gridW)*gridW +(gridW/2)
}

function getGridCoor(coor) {
    return (snapToGrid(coor)-gridW/2) / gridW
}

// Finds a path, returns array of objects(x & y) waypoints takes in {x: ,y: } , {x: , y:}
function findPath(strt, end) {
    let path =
    astar.search(currentMap, currentMap.grid[strt.y][strt.x], currentMap.grid[end.y][end.x])
    let parsedPath = path.map(item=> {
        return {x: (item.y+1)*gridW -(gridW/2), y: (item.x+1)*gridW -(gridW/2)}
    })
    return parsedPath
}

// Creates a fully walkable map using width height (in grid coors)
function createMap(w, h) {
    let matrix = []
    // Height / Y
    for(let i = 0; i <= h; i++) {
        let subArray = []
        // Width / X
        for(let j = 0; j <= w; j++) {
            subArray.push(1)
        }
        matrix.push(subArray)
    }
    return new Graph(matrix, {diagonal: true}) // false
}

// When loading a map in call this and it will spawn walls
function constructWalls(graph) {
}

// Checks if instance inside mouseCmdr selection
function insideMouseCmdr(obj) {
    if (mouseCmdr === null) {return false}
    let x1 = Math.min(mouseCmdr.x, mouseX)
    let y1 = Math.min(mouseCmdr.y, mouseY)
    let x2 = Math.max(mouseCmdr.x, mouseX)
    let y2 = Math.max(mouseCmdr.y, mouseY)
    if (
    x2 >= obj.x - obj.w/2 &&
    x1 <= obj.x + obj.w/2 &&
    y2 >= obj.y - obj.w/2 &&
    y1 <= obj.y + obj.w/2) {
        return true
    } else {
        return false
    }
}

// ##################################### Game variables #####################################
// Instance holders
let idCount = 0
let unitArray = []
let buildArray = []
let wallArray = []

// Constant variables
let mouseX = 0
let mouseY = 0

let mouseLeftPressed = false
let mouseLeftReleased = false
let mouseLeftHold = false

let mouseRightPressed = false
let mouseRightReleased = false
let mouseRightHold = false

// Global variables
const gridW = 32
let mouseCmdr = null
let selectedUnits = []

// Load maps here (Map matrix) and run wallconstructor
let currentMap = createMap(30, 30)
constructWalls(currentMap)

unitArray.push(new Unit(6*32-16, 3*32-16, 24, 0))
unitArray.push(new Unit(432, 232, 24, 180))
unitArray.push(new Unit(465, 200, 24, 180))
unitArray.push(new Unit(465, 232, 24, 180))

unitArray.push(new Unit(501, 200, 16, 180))
unitArray.push(new Unit(501, 232, 16, 180))
unitArray.push(new Unit(534, 200, 16, 180))
unitArray.push(new Unit(534, 232, 16, 180))

unitArray.push(new Unit(100, 200, 16, 0))
unitArray.push(new Unit(100, 232, 16, 0))
unitArray.push(new Unit(164, 200, 16, 0))
unitArray.push(new Unit(164, 232, 16, 0))

wallArray.push(new Wall(2,2))
currentMap.grid[2][2].weight = 0

// ######################################### GAME LOOP ########################################
function update() {
    requestAnimationFrame(update)
    ctx.clearRect(0, 0, canvas.width, canvas.height) //cls

    unitArray.forEach(item=> item.step())
    wallArray.forEach(item=> item.draw())
    //buildArray.forEach(item=> item.step())
    mouseCmdr !== null && mouseCmdr.step()
} update()

// ##################################### Evenet Listeners #####################################
onmousemove = ({ clientX, clientY })=> {
    mouseX = clientX
    mouseY = clientY
}
onmousedown = (e)=> { // 0-left 2-right
    mouseLeftPressed = true
    mouseLeftHold = true
    mouseCmdr = new MouseCommander(e.clientX,e.clientY)
    requestAnimationFrame(()=> {mouseLeftPressed=false})
}
onmouseup = (e)=> { // 0-left 2-right
    mouseLeftReleased = true
    mouseLeftHold = false
    requestAnimationFrame(()=> {
        mouseLeftReleased=false
        mouseCmdr = null
    })
}

onkeydown = ({ key })=> { //e.code or e.key
    //console.log(selectedUnits)
    if (key == " ") {
        selectedUnits.forEach(item=> {
            // Pathfinding for Airborne units
            item.waypoints = []
            item.waypoints.push({x: snapToGrid(mouseX), y: snapToGrid(mouseY)})
        })
    }
    // Stop all selected units
    if (key == "s") {
        selectedUnits.forEach(item=> {
            item.waypoints = []
            item.spd = 0
        })
    }

    // Attack Move (no mouse input needed)
    if (key == "a") {
        selectedUnits.forEach(item=> {
            item.waypoints = []
            item.collisions = 30
            item.spd = 0
            //item.waypoints = findPath({x: 0, y: 0}, {x: 0, y:10})
            item.waypoints = findPath(
                    {x: getGridCoor(item.x), y: getGridCoor(item.y)},
                    {x: getGridCoor(mouseX), y: getGridCoor(mouseY)}
            )
        })
    }

    if (key == "f") {
        let x = getGridCoor(mouseX)
        let y = getGridCoor(mouseY)
        wallArray.push(new Wall(x,y))
        currentMap.grid[y][x].weight = 0
    }
}

// #########################################################################################

/*
Fast A* pathfinding

// Load a map in as a matrix aka 2d array
let currentMap = new Graph([
	[1,1,1,1],
	[0,1,1,0],
	[0,0,1,1]
])

// Can change map
currentMap[y][x]
currentMap[9][6].weght = 1 // <- becomes a wall
currentMap[9][6] = 0 // <- becomes walkable

let start = graph.grid[0][0] // <- start coors
let end = graph.grid[1][2]  // <- goal coors
let path = astar.search(graph, start, end) // <- returns an array of waypoints
*/

/*
PROBLEM

One of the challenges I faced was cutting the path short if it was blocked.
So say you click to the other side on an impassable wall.
A* will return a null path after exhausting the open list because
there's no valid path across the wall.
But I want a piece of the path that lets my character move up to the wall.

SOLUTION

When you exhaust your lists,
you'll find a point that has a lowest possible H value that's non-zero.
That point is, according to the heuristic,
the closest point to the target that isn't the target itself.
You can just return that point, as it'll be "good enough".
*/