
class Model{
    constructor(){}

    async getCoeff(base, symbol){
        if (base==symbol) return 1;
        let response = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${symbol}`);
        response= await response.json();
        response=response.rates[symbol];
        return response;
    }
}

class Vue {
    constructor(pageModel){
        this.page=pageModel || {
            left: {
                buttons: [
                    {name: "RUB", el: LeftRUB},
                    {name: "USD", el: LeftUSD},
                    {name: "EUR", el: LeftEUR},
                    {name: "GBP", el: LeftGBP}
                ],
            input: leftInp,
            hint: leftHint
            },
            right: {
                buttons: [
                    {name: "RUB", el: RightRUB},
                    {name: "USD", el: RightUSD},
                    {name: "EUR", el: RightEUR},
                    {name: "GBP", el: RightGBP}
                ],
            input: rightInp,
            hint: rightHint
        },
        selectClass: "select-button"
    }

}
    setButtons(btn, direction){
        this.page[direction].buttons.forEach(el => {
            if (el.name == btn) {
                el.el.classList.add(this.page.selectClass)
            }
            else {
                el.el.classList.remove(this.page.selectClass)
            };
        })
    }
    render(lbtn,rbtn,linp,rinp){
        
        this.setButtons (lbtn, "left");
        this.setButtons (rbtn, "right");
        this.page.left.input.value = linp;
        this.page.right.input.value = rinp;
        this.page.left.hint.innerText = `1 ${lbtn} = ${linp/rinp} ${rbtn}`
        this.page.right.hint.innerText = `1 ${rbtn} = ${rinp/linp} ${lbtn}`
    }
   
}

class Controller{
    constructor(vue, model){
        this.vue=vue;
        this.model=model;
        this.lBtn="RUB";
        this.rBtn="USD";
        this.lInp=1;
        this.rInp=1;
        this.coeff =1;

    }

    getCallbackFromButtons(direction, name){
        return async(e)=> {
            if (direction == "left"){
                this.lBtn = name;
                this.coeff = await this.model.getCoeff(this.lBtn, this.rBtn);
                this.rInp = this.lInp*this.coeff;
            }
            else {
                this.rBtn = name;
                this.coeff = await this.model.getCoeff(this.lBtn, this.rBtn);
                this.lInp = this.rInp/this.coeff;
            }
            this.toRender();
            
        }
        
    }
    
    toRender(){
        this.vue.render(this.lBtn, this.rBtn, this.lInp, this.rInp)
    }

    getCallBackFromInput(direction) {
        return (e)=>{
            if (direction=="left"){
                this.lInp=isNaN(e.target.value) ? this.lInp : e.target.value;
                this.rInp=this.lInp*this.coeff;
                this.toRender();
            }else{
                this.rInp=isNaN(e.target.value) ? this.rInp : e.target.value;
                this.lInp=this.rInp/this.coeff;
                this.toRender();
            }
            
        }
    }
    async init(){
        this.vue.page.left.buttons.forEach((item)=>{item.el.addEventListener("click", this.getCallbackFromButtons("left", item.name))});
        this.vue.page.right.buttons.forEach((item)=>{item.el.addEventListener("click", this.getCallbackFromButtons("right", item.name))});
        

            this.vue.page.left.input.addEventListener("keyup", this.getCallBackFromInput("left"));
            this.vue.page.right.input.addEventListener("keyup", this.getCallBackFromInput("right"));
            this.coeff = await this.model.getCoeff(this.lBtn,this.rBtn);
            this.rInp=this.lInp*this.coeff;
            this.toRender();
}

}


const start = function () {
        const controler= new Controller(new Vue(),new Model());
        controler.init();
}();

