class Vec2 {
    constructor(x = 0, y = 0) {
        this.set(x, y)
    }
    set(x, y) {
        this.x = x
        this.y = y
        return this
    }
    sub(v) {
        this.x -= v.x
        this.y -= v.y
        return this
    }
    copy(v) {
        this.x = v.x
        this.y = v.y
        return this
    }
    clone() {
        return new Vec2(this.x, this.y)
    }
}

class Triangle {
    constructor(x, y, h) {
        this.delta = new Vec2(x, y)
        this.hypotenuse = h
    }
}

class Circle {
    constructor(element, position, radius) {
        this.element = element || document.createElement('div')
        this.position = position || new Vec2(0, 0)
        this.radius = radius || 0
    }
    move(v = this.position) {
        const style = this.element.style
        this.position.copy(v)
        style.left = `${this.position.x - this.radius}px`
        style.top = `${this.position.y - this.radius}px`
    }
    render() {
        const style = this.element.style
        const radius = this.radius

        style.width = `${radius * 2}px`
        style.height = `${radius * 2}px`
        style.left = `${this.position.x - radius}px`
        style.top = `${this.position.y - radius}px`
        style.borderRadius = `${radius * 1.3}px`
    }
}

class Sprite {
    constructor(options = {}) {

        const defaults = {
            parent: document.body,
            logo: 'http://gclick.cn/img/logo.png'
        }

        Object.assign(this, defaults, options)

        this.startOpacity = 0.85            // 拖动透明度
        this.endOpacity = 0.35              // 静态透明度
        this.color = '#AAA'                 // 背景颜色 #F7F6F2
        this.originRadius = 20              // 原半径
        this.curRadius = this.originRadius  // 动态半径
        this.triangle = new Triangle()
        this.minRadius = 9                  // 最小半径
        this.startPoint = new Vec2()        // 初始位置
        this.endPoint = new Vec2()          // 结束未知
        this.maxMoveLength = window.innerWidth * 0.35   // 最大拖拽长度
        this.isBroke = false                // 是否断开

        this.originCircle = new Circle()
        this.endCircle = new Circle()

        this.__t = null

        this.originCircle.position = new Vec2(window.innerWidth-this.curRadius - 10, window.innerHeight * 0.6)
        this.originCircle.radius = this.curRadius

        this.initCSS()
        this.initHtml()
        this.initEvents()

        this.originCircle.render()
        this.hide()
    }

    initCSS() {
        const style = this.style = document.createElement('style')
        style.innerText = [
        // ---------- SVG ---------- //
        '#svg{',
            'display: none;',
            'position: fixed;',
            'left: 0; right: 0; top: 0; bottom: 0;',
            'z-index: 999999998;}',
        '.circle{',
            'position: fixed;',
            'display: block;',
            'z-index: 999999999;',
            'font-size: 10px;',
            'text-align: center;',
            'color: #000;',
            '-webkit-text-size-adjust: none;',
            'padding: 7px 0;',
            'box-sizing: border-box;',
            'line-height: ' + (this.originRadius - 7) + 'px;',
            'background-color: ' + this.color + ';',
            'opacity: ' + this.startOpacity + ';}',
        '#red-point{',
            'position: absolute;',
            'width: 10px;',
            'height: 10px;',
            'border-radius: 5px;',
            'right: -5px;',
            'top: -5px;',
            'display: none;',
            'background: ' + this.color + ';',
        '}',
        '.circle-origin {',
            'background-image: url(' + this.logo + ');',
            'background-size: 80%;',
            'background-position: center;',
            'background-repeat: no-repeat;',
            'transition: opacity .3s, box-shadow .3s, border-radius .3s, -webkit-border-radius .3s;',
            '-moz-transition: opacity .3s, box-shadow .3s, border-radius .3s;',
            '-webkit-transition: opacity .3s, box-shadow .3s, border-radius .3s, -webkit-border-radius .3s;',
            '-o-transition: opacity .3s, box-shadow .3s, border-radius .3s;}',
        ].join('')
        document.head.appendChild(style)
    }

    initHtml(){

        const oce = this.originCircle.element
        const ece = this.endCircle.element

        oce.classList.add('circle')
        oce.classList.add('circle-origin')
        ece.classList.add('circle')

        this.parent.appendChild(ece)
        this.parent.appendChild(oce)

        const svg  = this.svg  = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const path = this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')

        path.setAttribute('opacity', '1')

        svg.setAttribute('id', 'svg')
        svg.setAttribute('width', window.innerWidth + 'px')
        svg.setAttribute('height', window.innerHeight + 'px')
        window.addEventListener('resize', () => {
            svg.setAttribute('width', window.innerWidth + 'px')
            svg.setAttribute('height', window.innerHeight + 'px')
        }, false)

        svg.appendChild(path)
        this.parent.appendChild(svg)

        // oce.innerHTML = [
        //     '<div id="' + this.UUID('red-point') + '"></div>'
        // ].join('\n');
    }

    initEvents() {

        var self = this

        function touchMove(event) {

            var startPoint = self.startPoint,
                endPoint = self.endPoint

            event.stopPropagation()
            event.preventDefault()

            endPoint.set(event.touches[0].clientX, event.touches[0].clientY)

            var triangle = self.triangle
            triangle.delta.copy(endPoint.clone().sub(startPoint))
            triangle.delta.y *= -1
            triangle.hypotenuse = Math.sqrt(triangle.delta.x * triangle.delta.x + triangle.delta.y * triangle.delta.y)


            if(triangle.hypotenuse < self.maxMoveLength && !self.isBroke){
                self.curRadius = Math.max((1 - triangle.hypotenuse / self.maxMoveLength) * self.originRadius, self.minRadius)
                self.render()
            }else{
                self.isBroke = true
                self.curRadius = 0
                self.path.setAttribute('d', '')
                self.path.setAttribute('fill', self.color)
                self.svg.style.display = 'none'
            }

            self.originCircle.position.copy(endPoint)
            self.originCircle.radius = self.originRadius
            self.originCircle.render()

            self.endCircle.position.copy(startPoint)
            self.endCircle.radius = self.curRadius
            self.endCircle.render()

        }

        function moveEnd(event){
            document.removeEventListener('touchmove', touchMove, true)
            document.removeEventListener('touchend', moveEnd, false)
            document.removeEventListener('touchcancel', moveEnd, false)

            self.svg.style.display = 'none'

            self.curRadius = 0
            self.path.setAttribute('d', '')
            self.path.setAttribute('fill', 'red')

            if(!self.isBroke){
                // 复原
                self.originCircle.position.copy(self.startPoint)
            }else{
                // 吸附
                if(self.originCircle.position.x < window.innerWidth * 0.5){
                    self.originCircle.position.x = 10 + self.originCircle.radius
                }else{
                    self.originCircle.position.x = window.innerWidth - self.originCircle.radius - 10
                }
            }
            self.originCircle.render()

            self.endCircle.radius = 0
            self.endCircle.render()

            self.hide()
        }


        self.originCircle.element.addEventListener('touchstart', function (event) {

            self.isBroke = false

            self.svg.style.display = 'block'

            self.endPoint.set(event.touches[0].clientX, event.touches[0].clientY)
            self.startPoint.copy(self.originCircle.position)

            self.show()
            self.endCircle.element.style.opacity = 1

            document.addEventListener('touchmove', touchMove, true)
            document.addEventListener('touchend', moveEnd, false)
            document.addEventListener('touchcancel', moveEnd, false)

        }, false)

    }

    none() {
        this.__t && clearTimeout(this.__t)
        this.originCircle.element.style.display = 'none'
    }

    hide() {
        this.__t && clearTimeout(this.__t)
        var oces = this.originCircle.element.style

        oces.display = 'block'
        oces.opacity = this.startOpacity
        // oces.boxShadow = '0 0 10px #000'
        oces.borderRadius = this.originRadius * 0.3 + 'px'

        this.__t = setTimeout(function(){
            oces.opacity = this.endOpacity
        }.bind(this), 5000)
    }

    show() {
        this.__t && clearTimeout(this.__t)
        var oces = this.originCircle.element.style

        oces.opacity = 1
        oces.boxShadow = 'none'
        oces.borderRadius = this.originRadius + 'px'
    }

    render() {
        var triangle = this.triangle,

            originRadius = this.originRadius,
            curRadius = this.curRadius,
            
            startPoint = this.startPoint,
            endPoint = this.endPoint,

            path = this.path

        var sin = triangle.delta.y / triangle.hypotenuse,
            cos = triangle.delta.x / triangle.hypotenuse

        path.setAttribute('d',
             'M ' + (startPoint.x - curRadius * sin) + ' ' + 
            (startPoint.y - curRadius * cos) + 
            ' L ' + (startPoint.x + curRadius * sin) + ' ' + 
            (startPoint.y + curRadius * cos) + 
            ' Q ' + ((startPoint.x + endPoint.x) / 2) + ' ' + 
            ((startPoint.y + endPoint.y) / 2) + ' ' + 
            (endPoint.x + originRadius * sin) + ' ' + 
            (endPoint.y + originRadius * cos) + 
            ' L ' + (endPoint.x - originRadius * sin) + ' ' + 
            (endPoint.y - originRadius * cos) + 
            ' Q ' + ((startPoint.x + endPoint.x) / 2) + ' ' +
            ((startPoint.y + endPoint.y) / 2) + ' ' +
            (startPoint.x - curRadius * sin) + ' ' +
            (startPoint.y - curRadius * cos) )
        path.setAttribute('fill', this.color)
    }
}

export default Sprite
