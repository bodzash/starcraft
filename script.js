const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d") //webgl / webgl2

canvas.width = innerWidth //640
canvas.height = innerHeight //480

// ######################################### Classes #########################################
class Wall {
    constructor(x, y, w) {
        this.x = x
        this.y = y
        this.w = w
    }
    draw() {
        ctx.fillStyle = "black"
        ctx.fillRect(this.x-this.w/2, this.y-this.w/2, this.w, this.w)
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
        this.dir = dir
        this.spd = 0
        this.state = "idle" //idle-move-attack-attackmove-channel
        this.waypoints = []
        this.dest = null // {x: 1, y: 2,}
        this.target = null //id number maybe?

        this.unitName = "Default"
        this.unitSize = 32 //px
        this.unitModel = ""
        this.unitHealth = 50
        this.unitSpeed = 4
        this.unitArmor = 1 //1-2-3 L-M-H (0-None)
        this.unitPen = {L: 1, M: 1, H: 1} //1-5 (1-worst 5-best)
    }
    step() {
        //Move towards dir
        this.x += this.spd*Math.cos(3.14/180*this.dir)
        this.y -= this.spd*Math.sin(3.14/180*this.dir)

        // State Controller break it up :)
        /*switch(state) {
            case "idle":
            break
        }*/

        // Move to point
        if (this.dest !== null) {
            if (pointDistance(this.x, this.y, this.dest.x, this.dest.y) >= this.unitSpeed) {
                this.dir = pointDirection(this.x, this.y, this.dest.x, this.dest.y)
                this.spd = this.unitSpeed
            } else {
                this.x = this.dest.x
                this.y = this.dest.y
                this.dest = null
                this.state = "idle"
                this.spd = 0
            }
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

        // Collision With Other Unit
        unitArray.forEach(item=> { //other = item.id
            if (this.id !== item.id) {
                if (checkCollInst(item, this) && this.spd === 0 && item.spd === 0) {
                    let ang = pointDirection(this.x, this.y, item.x, item.y) - 180
                    this.x += 2 * Math.cos(3.14 / 180 * ang)
                    this.y -= 2 * Math.sin(3.14 / 180 * ang)
                }
            }
        })

        // Draw
        this.draw()
    }
    draw() {
        this.isSelected ? ctx.fillStyle = "green" : ctx.fillStyle = "red"
        ctx.fillRect(this.x-this.w/2, this.y-this.w/2, this.w, this.w)
    }
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

// Global Instances
let mouseCmdr = null
let selectedUnits = []

// Pathfinder
// https://github.com/qiao/PathFinding.js/
// Best First Search - chebyshev - allowdiag - nobordercross

// Load map here (Map matrix)

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

// ######################################### GAME LOOP ########################################
function update() {
    requestAnimationFrame(update)
    ctx.clearRect(0, 0, canvas.width, canvas.height) //cls

    unitArray.forEach(item=> item.step())
    //wallArray.forEach(item=> item.step())
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
    selectedUnits.forEach(item=> {
        item.dest = {x: Math.floor(mouseX/32)*32+16, y: Math.floor(mouseY/32)*32+16}
    })
}

// #########################################################################################