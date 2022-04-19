const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

canvas.width = innerWidth //640
canvas.height = innerHeight //480

// ########### Classes ###########

class Unit {
    constructor(x, y, w, dir) {
        idCount++
        this.id = idCount
        this.x = x
        this.y = y
        this.w = w
        this.isSelected = false
        this.dir = dir
        this.spd = 0
        this.state = "idle" //idle-move-attack-attackmove-channel
        this.waypoints = []
        this.dest = {x: null, y: null} //move
        this.target = null //id number maybe?

        this.unitName = "Default"
        this.unitSize = 32 //px
        this.unitModel = ""
        this.unitHealth = 100
        this.unitSpeed = 4
        this.unitArmor = 1 //1-2-3 L-M-H (0-None)
        this.unitPen = {L: 1, M: 1, H: 1} //1-5 (1-worst 5-best)
    }
    step() {
        //Move towards dir
        this.x += this.spd*Math.cos(3.14/180*this.dir)
        this.y -= this.spd*Math.sin(3.14/180*this.dir)

        //Snap to grid (for pathfind)
        //Math.floor(mouseX/32)*32
        //Math.floor(mouseY/32)*32 

        // Selection Check
        if (mouse !== null) {
            let ap = pointDirection(this.x, this.y, mouseX, mouseY)
            this.dir = ap
            this.spd = this.unitSpeed
            let x1 = Math.min(mouse.x, mouseX)
            let y1 = Math.min(mouse.y, mouseY)
            let x2 = Math.max(mouse.x, mouseX)
            let y2 = Math.max(mouse.y, mouseY)
            if (x2 >= this.x - this.w/2 && x1 <= this.x + this.w/2 &&
                y2 >= this.y - this.w/2 && y1 <= this.y + this.w/2) {
                    this.isSelected = true
            } else {
                this.isSelected = false
            }
        } else {
            this.spd =  0
        }

        // Collision With Other Unit
        unitArray.forEach(item=> {
            if (this.id !== item.id) {
                //let other = item.id
                if (checkCollInst(item, this) && this.spd === 0) {
                    let ang = pointDirection(this.x, this.y, item.x, item.y) - 180
                    this.x += 3 * Math.cos(3.14 / 180 * ang)
                    this.y -= 3 * Math.sin(3.14 / 180 * ang)
                }
            }
        })

        this.draw() //Draw
    }
    draw() {
        this.selected ? ctx.fillStyle = "green" : ctx.fillStyle = "red"
        ctx.fillRect(this.x-this.w/2, this.y-this.w/2, this.w, this.w)
    }
}

class MouseCommander {
    constructor(x, y) {
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

// ########### Game variables ###########

// Instance holders
let idCount = 0
let unitArray = []
let buildArray = []
let wallArray = []

// Constant variables
let mouseX = 0
let mouseY = 0
let mousePressed = false
let mouseReleased = false
let mouseHold = false

// Global Instances
let mouse = null
let selectedUnits = []

// Pathfinder
// https://github.com/qiao/PathFinding.js/
// Best First - chebyshev - allowdiag - nobordercross
// A* - Shrugstiny

unitArray.push(new Unit(432, 200, 32, 0))
unitArray.push(new Unit(432, 232, 32, 180))
unitArray.push(new Unit(465, 200, 32, 180))
unitArray.push(new Unit(465, 232, 32, 180))

unitArray.push(new Unit(501, 200, 32, 180))
unitArray.push(new Unit(501, 232, 32, 180))
unitArray.push(new Unit(534, 200, 32, 180))
unitArray.push(new Unit(534, 232, 32, 180))

unitArray.push(new Unit(100, 200, 16, 0))
unitArray.push(new Unit(100, 232, 16, 0))
unitArray.push(new Unit(164, 200, 16, 0))
unitArray.push(new Unit(164, 232, 16, 0))

// Loop the game
function update() {
    requestAnimationFrame(update)
    ctx.clearRect(0, 0, canvas.width, canvas.height) //cls
    
    unitArray.forEach(item=> item.step())
    mouse !== null && mouse.step()
}
update()


// ########### Functions ###########
function checkCollInst(obj1, obj2) { //check collision between 2 instances
    if (
        obj1.x + obj1.w/2 >= obj2.x - obj2.w/2 &&
        obj1.x - obj1.w/2 <= obj2.x + obj2.w/2 &&
        obj1.y + obj1.w/2 >= obj2.y - obj2.w/2 &&
        obj1.y - obj1.w/2 <= obj2.y + obj2.w/2
        )
    {return true} else {return false}
}

function pointDirection(x1, y1, x2, y2) { //
    let rad = Math.atan2(y1 - y2, x1 - x2) * ( 180 / 3.14 )
    return Math.abs(rad - 180)
}

//Move Unit towards an angle
function motionAdd(dir, spd) {
    hspeed += spd*cos(pi/180*dir)
    vspeed -= spd*sin(pi/180*dir)
}

// Evenet Listeners
canvas.onmousemove = (e)=> {
    mouseX = e.clientX
    mouseY = e.clientY
}
canvas.onmousedown = (e)=> {
    mouse = new MouseCommander(e.clientX,e.clientY)
}
canvas.onmouseup = ()=> { mouse = null }