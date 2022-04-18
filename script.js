const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")
//console.log(ctx)

canvas.width = innerWidth //640
canvas.height = innerHeight //480

class Unit {
    constructor(x, y, w, unit) {
        idCount++
        this.id = idCount
        this.x = x
        this.y = y
        this.w = w
        this.unitName = unit
        this.selected = false
    }
    step() {
        //this.x += 1

        this.draw() // <-
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

        this.draw()
    }
    draw() {
        ctx.beginPath()
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green"
        ctx.rect(this.x, this.y, mouseX-this.x, mouseY-this.y)
        ctx.stroke()
    }
}

// Instance holders
let idCount = 0
let unitArray = []
let buildArray = []
let wallArray = []

// Constant variables
let mouseX = 0
let mouseY = 0

let player = new Unit(200, 200, 32, "default")
let mouse = null
unitArray.push(player)


function update() {
    requestAnimationFrame(update)
    ctx.clearRect(0, 0, canvas.width, canvas.height) //cls

    if (mouse !== null) {
        let x1 = Math.min(mouse.x, mouseX);
        let y1 = Math.min(mouse.y, mouseY);
        let x2 = Math.max(mouse.x, mouseX);
        let y2 = Math.max(mouse.y, mouseY);
        if (
            x2 >= player.x - player.w/2 &&
            x1 <= player.x + player.w/2 &&
            y2 >= player.y - player.w/2 &&
            y1 <= player.y + player.w/2
            ) {
            unitArray[0].selected = true
        } else {
            unitArray[0].selected = false
        }
    }

    unitArray.forEach(item=> item.step())
    mouse !== null && mouse.step()
}
update()


// Functions
function checkCollInst() {} 

function checkCollPos() {

}

//Move Unit towards an angle
function moveDirection(angle) {}

// Evenet Listeners
canvas.onmousemove = (e)=> {
    mouseX = e.clientX
    mouseY = e.clientY
}
canvas.onmousedown = (e)=> {
    mouse = new MouseCommander(e.clientX,e.clientY)
}
canvas.onmouseup = ()=> { mouse = null }