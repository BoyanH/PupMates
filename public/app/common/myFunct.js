Array.prototype.joinWithoutEl = function(index){
    var i = 0;
    var str= '';
    if(index == 0){
        i++;
        while(i < this.length){
            if(i != this.length - 1){
                str+= this[i++] + ','
            }
            else{
                str+= this[i++];
            }
        }
        return str
    }
    if(index + 1 === this.length){
        while(i < this.length){
            if(i + 2 == this.length){
                str+= this[i++];
                return str;
            }
            str+= this[i++] + ',';
        }
    }
    while(i < this.length){
        if(i + 1 == this.length){
            str+=this[i++];
            return;
        }
        if(i==index)i++;
        else{
            str+=this[i++] + ',';
        }
    }
}
if(!Array.prototype.contains){
    Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}
}