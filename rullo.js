var N=9;
var p=0.4;
var nmin=2;
var nmax=9;
var initval=1;
var cursorX=0;
var cursorY=0;
function combine(x,y){
    if(initval==1){
        return x*y;
    } else {
        return x+y;
    }
}
function reduce(x,y){
    var error="XXX";
    if(initval==1){
        if(x%y!=0 || y>x){
            return error;
        } else {
            return x/y;
        }
    } else {
        if(x<y){
            return error;
        } else {
            return x-y;
        }
    }
}
var numbers={}
var off={}
var guess={}
var locked=[]
var undo=[]
function LockRow(y,nocheck){
    for(x=0;x<N;x++){
//        if($("#ys"+y)){
        //if not locked
        //if ys is 1 then clear the rest
        Lock(x,y);
    }
    if(!nocheck){CheckAll();}
    AddUndo("UnlockRow",y);
}
function LockCol(x,nocheck){
    console.log("lockcol",x);
    for(y=0;y<N;y++){
        //if xs is 1 then clear the rest
        Lock(x,y);
    }
    if(!nocheck){CheckAll();}
    AddUndo("UnlockCol",x)
}
function CheckAll(){
    for(var j=0;j<N;j++){
        CheckCol(j);
        CheckRow(j);
    }
}
function UnlockRow(y){
    console.log("lockrow",y)
    for(x=0;x<N;x++){
        Unlock(x,y);
        CheckCol(x);
    }
    CheckRow(y);
}
function UnlockCol(x){
    for(y=0;y<N;y++){
        Unlock(x,y);
        CheckRow(y);
    }
    CheckCol(x);
}
function FindLast(list,val){
    return list.lastIndexOf(val);
}
function co(x,y){return x+"x"+y;}
function Lock(x,y){
    locked.push(co(x,y))
    $("#n"+co(x,y)).addClass("locked");
}

function Unlock(x,y){
    console.log("unlock")
    var idx=FindLast(locked,co(x,y));
    if(idx>=0){
        locked.splice(idx,1);
    }
    if(FindLast(locked,co(x,y))<0) {
        $("#n"+co(x,y)).removeClass("locked");
    }
}
    
function LockClick(x,y,q){
    //maybe if q==undefined, set q to -1?
    q=LockQ(x,y,q)
    if(q==1){AddUndo("Unlock",co(x,y));}
    if(q==0){AddUndo("Lock",co(x,y));}
    CheckAll();
}
function LockQ(x,y,q){
    var idx=FindLast(locked,co(x,y))
    if(q===undefined){
        q=(idx<0)
    }
    if(q==1){Lock(x,y);}
    if(q==0){Unlock(x,y);}
    CheckRow(y);
    CheckCol(x);
    return q;
}
function NoDups(){
    var flag=0;
    for(x1=0;x1<N;x1++){
        for(x2=0;x2<x1;x2++){
            for(y1=0;y1<N;y1++){
                for(y2=0;y2<y1;y2++){
                    var n=numbers[co(x1,y1)];
                    if(numbers[co(x2,y1)]==n
                       && numbers[co(x1,y2)]==n
                       && numbers[co(x2,y2)]==n) {
                        while(numbers[co(x2,y2)]==n){
                            numbers[co(x2,y2)]=GetNum();
                        }
                        flag=1;
                    }
                }
            }
        }
    }
    if(flag){console.log("unduped");}
    return flag;
}
function GetNum(){
    return Math.floor(Math.random()*(nmax-nmin+1)+nmin)
}
function MakeGrid(){
    numbers={}
    guess={}
    for(x=0;x<N;x++){
        for(y=0;y<N;y++){
            numbers[co(x,y)]=GetNum();
            guess[co(x,y)]=false;
        }
    }
    while(NoDups()){;}
}
function TurnOff(){
    for(x=0;x<N;x++){
        for(y=0;y<N;y++){
            off[co(x,y)]=(Math.random()>p);
        }
    }
}
function NumColor(x,y){
    //FIX: Remove this
    if(y!=undefined){x=co(x,y);}
    var n=numbers[x]
    return "black"
}
function TD(tr,id,classes){
    var td=document.createElement("td");
    $(tr).append(td);
    $(td).attr("id",id);
    for(cls of classes){
        $(td).addClass(cls);
    }
    return $(td);
}
function ShowGrid() {
    $("#game").html("");
    //remaining top
    var tr=document.createElement("tr");
    TD(tr,"",[])
    TD(tr,"",[])
    $("#game").append(tr);
    for(x=0;x<N;x++){
        TD(tr,"xs"+x,["xs","green"]);
    }
    //total
    var tr=document.createElement("tr");
    TD(tr,"",[])
    TD(tr,"",[])
    $("#game").append(tr);
    for(x=0;x<N;x++){
        TD(tr,"x"+x,["x","total"]).bind('click',{x:x},function(e){LockCol(e.data.x,1);CheckAll()})
    }
    for(y=0;y<N;y++){
        tr=document.createElement("tr");
        $("#game").append(tr);
        TD(tr,"ys"+y,["ys","green"])
        TD(tr,"y"+y,["y","total"]).bind('click',{y:y},function(e){LockRow(e.data.y,1);CheckAll();})
       
        for(x=0;x<N;x++){
            td=TD(tr,"n"+co(x,y),["number"]);
            var dlock=document.createElement("div");
            $(dlock).addClass("lock");
            $(dlock).click(NumClick);
//            var dremove=document.createElement("div");
//            $(dremove).addClass("remove").html("R");
            var n=numbers[co(x,y)];
            $(td).html(n);
            $(td).append(dlock);
//            $(td).append(dremove);
            for(nn=2;nn<10;nn++){
                if(n%nn==0){$(td).addClass("f"+nn);}
            }
            $(td).click(NumClick);
        }
        TD(tr,"yn"+y,["yn","red"]);
    }
    tr=document.createElement("tr");
    $("#game").append(tr)
    TD(tr,"","");
    TD(tr,"","")
    for(x=0;x<N;x++){
        TD(tr,"xn"+x,["xn","red"]);
    }
    //Now fill in the rest
    for(y=0;y<N;y++){
        CheckRow(y)
    }
    for(x=0;x<N;x++){
        CheckCol(x)
    }
}
function NumClick(event){
    //handles Click and LockClick depending on whether left or right
    //FIX: if I click on the green, xy needs to read parent instead
    var id=$(event.target).attr("id")
    var corner=false
    if(!id){
        id=$(event.target).parent().attr("id")
        console.log("corner")
        corner=true
        event.stopPropagation();
    }
    console.log(id)
    var xy=id.slice(1)
    var x=xy.split("x")[0]
    var y=xy.split("x")[1]
    if(!shifted && !corner){
        Click(x,y)
    } else {
        console.log("LockClick")
        LockClick(x,y)
    }
//    console.log($(event.target).attr("id"));
}
function TotalClick(event){
    console.log($(event.target).attr("id"));
}
function CheckRow(y,clicked){
    var total=initval;
    var goal=initval;
    var guessed=initval;
    var locktotal=initval;
    for(x=0;x<N;x++){
        var n=numbers[co(x,y)];
        if(off[co(x,y)]){
            goal=combine(goal,n)
        }
        total=combine(total,n);
        if(!guess[co(x,y)]){
            guessed=combine(guessed,n)
        }
        if(!guess[co(x,y)] && FindLast(locked,co(x,y))>=0){
            locktotal=combine(locktotal,n);
        }
    }
    $("#y"+y).html(goal)
    $("#ys"+y).html(reduce(goal,locktotal))
    $("#yn"+y).html(reduce(guessed,goal))
    if(goal==guessed){
        $("#ys"+y).html("")
        $("#yn"+y).html("")
        $("#y"+y).addClass("done")
        if(clicked){LockRow(y)}
    } else {
        $("#y"+y).removeClass("done")
    }
    WinQ()
}
function CheckCol(x,clicked){
    var total=initval;
    var goal=initval;
    var guessed=initval;
    var locktotal=initval;
    for(y=0;y<N;y++){
        var n=numbers[co(x,y)];
        if(off[co(x,y)]){
            goal=combine(goal,n)
        }
        total=combine(total,n);
        if(!guess[co(x,y)]){
            guessed=combine(guessed,n)
        }
        if(!guess[co(x,y)] && FindLast(locked,co(x,y))>=0){
            locktotal=combine(locktotal,n);
        }
    }
    $("#x"+x).html(goal)
    $("#xs"+x).html(reduce(goal,locktotal))
    $("#xn"+x).html(reduce(guessed,goal))
    if(goal==guessed){
        $("#xs"+x).html("")
        $("#xn"+x).html("")
        $("#x"+x).addClass("done")
        if(clicked){LockCol(x)}
    } else {
        $("#x"+x).removeClass("done")
    }
    WinQ()
}
function Click(x,y,undoing){
    if (FindLast(locked,co(x,y))>=0){return}
    guess[co(x,y)]=!guess[co(x,y)]
    if(guess[co(x,y)]){
        $("#n"+co(x,y)).addClass("guess")
    } else {
        $("#n"+co(x,y)).removeClass("guess")
    }
    if(!undoing){
        AddUndo("Click",co(x,y))
    }
    CheckAll()
}
function Solve() {
    for(x=0;x<N;x++){
        for(y=0;y<N;y++){
            if(off[co(x,y)]){
                $("#n"+co(x,y)).addClass("solve")
            }
        }
    }
}
function Unsolve() {
    $(".number").removeClass("solve")
}
function ColorFactor(num){
    console.log('CF',num)
    $(".f"+num).addClass("factor")
}
var solve=0
var factor=0
function ToggleSolve() {
    solve=!solve;
    if(solve){Solve} else {Unsolve}
}
function ToggleFactor(num){
    factor=!factor;
    console.log(factor,num)
    if(factor){ColorFactor(num)} else {$(".number").removeClass("factor")}
}
function KeyPress(e){
    var key=e.key;
    var code=e.keyCode;
    var alt=e.shiftKey;
    console.log(key);
    if(key=='s'){ToggleSolve();}
    if(key=='z'){Undo();}
    if(key=='a'){CheckAll();}
    //Cursor keys
    if(alt){
        if(code==37 || code==39){
            LockRow(cursorY,false)
        } else if (code==38 || code==40){
            LockCol(cursorX,false)
        }
    } else {
        if(code==37){cursorX=((cursorX+N-1)%N);setcursor(cursorX,cursorY);}
        if(code==38){cursorY=((cursorY+N-1)%N);setcursor(cursorX,cursorY);}
        if(code==39){cursorX=((cursorX+1)%N);setcursor(cursorX,cursorY);}
        if(code==40){cursorY=((cursorY+1)%N);setcursor(cursorX,cursorY);}
    }
    //Space to hide, . to lock
    if(key==' ' && !alt){Click(cursorX,cursorY,true)}
    if(key=='.' || (key==' ' && alt)){LockClick(cursorX,cursorY)}
    
                 
    
    for(var j=2;j<=9;j++){
        if(key==j){ToggleFactor(j);}
    }
}

function AddUndo(cmd,prams){
    undo.push(cmd+" "+prams)
}
function Undo(){
    if(undo.length==0){return}
    todo=undo.pop().split(" ")
    cmd=todo[0]
    prams=todo[1].split("x")
    if(cmd=="UnlockRow"){UnlockRow(prams[0])}
    if(cmd=="UnlockCol"){UnlockCol(prams[0])}
    if(cmd=="Unlock"){Unlock(prams[0],prams[1])}
    if(cmd=="Lock"){Lock(prams[0],prams[1])}
    if(cmd=="Click"){Click(prams[0],prams[1],1)}
    CheckAll();
}
function WinQ(){
}
function NewGame(){
    undo=[]
    locked=[]
    MakeGrid()
    TurnOff()
    ShowGrid()
}
var shifted=false;
function setcursor(x,y){
    $(".number").removeClass("cursor")
    if(x<0 || x>=N || y<0 || y>=N){return;}
    $(".number#n"+x+"x"+y).addClass("cursor")
}
function init(){

    $(document).keydown(KeyPress);
    NewGame();
    $(document).on('keyup keydown', function(e){
        shifted = e.altKey;
        return true;
    }
                  );

}
$(init)
