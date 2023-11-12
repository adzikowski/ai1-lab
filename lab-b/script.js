let to_do = {
    tasks: [],
    dates:[],
    draw: function () {
        const local=localStorage.getItem('tasks');
        const localDates=localStorage.getItem('dates');
        if(local && localDates){
            to_do.tasks=JSON.parse(local);
            to_do.dates=JSON.parse(localDates);
        }
        const ol = document.getElementById('list');
        ol.innerHTML = "";
        for (let i = 0; i < this.tasks.length; i++) {
            let li = document.createElement('li');
            let del = document.createElement('button');
            let date=document.createElement('input');
            li.setAttribute('id','il-element');
            date.setAttribute('type','date');
            date.value=this.dates[i] ? this.dates[i]:'';
            date.onchange=function (){
                to_do.dates[i]=date.value;
                localStorage.setItem('dates',JSON.stringify(to_do.dates));
            }
            del.id = 'usun';
            del.onclick = function () {
                to_do.tasks.splice(i, 1);
                to_do.dates.splice(i,1);
                localStorage.setItem('tasks',JSON.stringify(to_do.tasks));
                localStorage.setItem('dates',JSON.stringify(to_do.dates));
                to_do.draw();
            };
            let del_text = document.createTextNode('Usuń');
            ol.appendChild(li);
            ol.appendChild(del);
            del.appendChild(del_text);
            ol.appendChild(date);

            let text = document.createTextNode(this.tasks[i]);
            li.appendChild(text);
            li.onclick=function (){
                const inputObject=document.createElement('input');
                inputObject.setAttribute('type','text');
                inputObject.setAttribute('id','inputObject');
                inputObject.setAttribute('value',to_do.tasks[i]);
                inputObject.onblur=function (){
                    to_do.tasks[i]=inputObject.value;
                    if(to_do.tasks[i].length>2 && to_do.tasks[i].length<256) {
                        li.replaceChild(text, inputObject);
                        localStorage.setItem('tasks', JSON.stringify(to_do.tasks));
                        to_do.draw();
                    }
                    else{
                        alert("Długość nie może być mniejsza niż 3 i większa niż 255");
                    }
                }
                li.replaceChild(inputObject,text);
                to_do.getFocus('inputObject')
            }
        }
    },
    addTask: function () {
        let input_text = document.getElementById('nazwa_obowiazek');
        let input_date = document.getElementById('data_obowiazek').value;

        if (input_date === '' || new Date(input_date) > new Date()) {
            if (input_text.value.length > 2 && input_text.value.length < 256) {
                to_do.tasks.push(input_text.value);
                to_do.dates.push(input_date);
                localStorage.setItem('tasks', JSON.stringify(to_do.tasks));
                localStorage.setItem('dates', JSON.stringify(to_do.dates));
                input_text.value = "";
                input_date.value = "";
            } else {
                alert("Długość nie może być mniejsza niż 3 i większa niż 255");
                input_text.value = "";
            }
        } else {
            alert("Proszę wprowadzić datę w przyszłości lub zostawić pole daty puste.");
            input_date.value = "";
        }

        to_do.draw();
        return false;
    },
    getFocus: function(id) {
        document.getElementById(id).focus();
    },
    searchTask: function() {
        const searchText = document.getElementById('wyszukiwarka').value.toLowerCase();
        const ol = document.getElementById('list');
        ol.innerHTML = "";

        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].toLowerCase().includes(searchText)) {
                let li = document.createElement('li');
                let del = document.createElement('button');
                let date = document.createElement('input');
                li.setAttribute('id', 'il-element');
                date.setAttribute('type', 'date');
                date.value = this.dates[i] ? this.dates[i] : '';
                date.onchange = (function(index) {
                    return function() {
                        to_do.dates[index] = date.value;
                        localStorage.setItem('dates', JSON.stringify(to_do.dates));
                    };
                })(i);
                del.id = 'usun';
                del.onclick = (function(index) {
                    return function() {
                        to_do.tasks.splice(index, 1);
                        to_do.dates.splice(index, 1);
                        localStorage.setItem('tasks', JSON.stringify(to_do.tasks));
                        localStorage.setItem('dates', JSON.stringify(to_do.dates));
                        to_do.draw();
                    };
                })(i);
                let del_text = document.createTextNode('Usuń');
                ol.appendChild(li);
                ol.appendChild(del);
                del.appendChild(del_text);
                ol.appendChild(date);

                let taskText = this.tasks[i];
                let startIndex = taskText.toLowerCase().indexOf(searchText);
                let endIndex = startIndex + searchText.length;

                if (startIndex !== -1) {
                    let highlightedText = taskText.substring(0, startIndex) + "<span style='background-color: yellow;'>" + taskText.substring(startIndex, endIndex) + "</span>" + taskText.substring(endIndex);
                    li.innerHTML = highlightedText;
                }
            }
        }
    }


}

to_do.draw();
