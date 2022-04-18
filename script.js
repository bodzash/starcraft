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
        this.selected = false
        this.dir = dir
        this.spd = 4
    }
    step() {
        //Move towards dir
        this.x += this.spd*Math.cos(3.14/180*this.dir)
        this.y -= this.spd*Math.sin(3.14/180*this.dir)

        // Selection Check
        if (mouse !== null) {
            let x1 = Math.min(mouse.x, mouseX)
            let y1 = Math.min(mouse.y, mouseY)
            let x2 = Math.max(mouse.x, mouseX)
            let y2 = Math.max(mouse.y, mouseY)
            if (x2 >= this.x - this.w/2 && x1 <= this.x + this.w/2 &&
                y2 >= this.y - this.w/2 && y1 <= this.y + this.w/2) {
                    this.selected = true
            } else {
                this.selected = false
            }
        }

        // Collision With Other Unit
        unitArray.forEach(item=> {
            if (this.id !== item.id) {
                //let other = item.id
                if (checkCollInst(item, this)) {
                    let ang = anglePoint(item.x, item.y, this.x, this.y) +180
                    this.x += (this.spd+1)*Math.cos(3.14/180*ang)
                    this.y -= (this.spd+1)*Math.sin(3.14/180*ang)
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

// Global Instances
let mouse = null
let selectedUnits = []

unitArray.push(new Unit(300, 200, 32, 180))
unitArray.push(new Unit(300, 216, 32, 180))
unitArray.push(new Unit(364, 200, 32, 180))
unitArray.push(new Unit(364, 216, 32, 180))

unitArray.push(new Unit(100, 200, 32, 0))

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

function anglePoint(x1, y1, x2, y2) { //
    let rad = Math.atan2(y2 - y1, x2 - x1)
    return radToDeg(rad)
}

function radToDeg(rad) { //turns radians to degree
    return rad * 180 / Math.PI
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