const url = "https://crm.skch.cz/ajax0/procedure2.php";


let interval=null;

  function make_base_auth(user, password) {
  return "Basic " + btoa(user + ":" + password);
}
const username = "coffe";
const password = "kafe";
const PRIHLASOVANI = make_base_auth(username, password);


async function getTypesList(apiUrl) {
    const res = await fetch(`${apiUrl}?cmd=getTypesList`, { 
        method: 'GET', 
        credentials: 'include',
        headers: {
      'Authorization': PRIHLASOVANI
    }
    });

    if (!res.ok) throw new Error(`getTypesList HTTP ${res.status}`);
    return await res.json();
}





async function getPeopleList(apiUrl) {
    const res = await fetch(`${apiUrl}?cmd=getPeopleList`, { 
        method: 'GET', 
        credentials: 'include',
           headers: {
      'Authorization': PRIHLASOVANI
    }
    });

    if (!res.ok) throw new Error(`getPeopleList HTTP ${res.status}`);
    return await res.json();
}







function renderPeople(formEl, people) {
    const fieldset = el('fieldset', {},
        el('legend', {}, 'Uživatel')
    );

const allCookies = decodeURIComponent(document.cookie);
const cookieArray = allCookies.split('; ');
let lastUserId = 0;

cookieArray.forEach(cookie=>{
if(cookie.indexOf('lastUserId')==0){
lastUserId=cookie.substring(11);
}
});


    Object.values(people).forEach(p => {
        const id = String(p.name);
        const radio = el('input', { 
            type: 'radio', id, name: 'user', value: String(p.ID), class: 'radio', required: true, checked: String(p.ID)==lastUserId
        });
        const label = el('label', { htmlFor: id, class: 'userLabel' }, p.name);

        const wrapper = el('div',{class: 'wrapper'}, label, radio);

        fieldset.appendChild(wrapper);
        fieldset.appendChild(el('br'));
    });

    formEl.insertBefore(fieldset, formEl.firstChild);
}








function renderTypes(formEl, types) {
    const fieldset = el('fieldset', {class: 'typeFieldset'},
        el('legend', {}, 'Typy / množství')
    );

    Object.values(types).forEach(t => {
        const id = String(t.name);

        
        const label = el('label', { class: 'typeLabel' }, t.typ);
        const plusBtn=el('button',{type: 'button', class: 'plusMinus'},"+");
 const minusBtn=el('button',{type: 'button', class: 'plusMinus'},"-");
 const count =el('input',{ type: 'text', value: '0', class: 'count', required: true},);

        const wrapper= el('div', {class: 'wrapper'}, label, minusBtn, count, plusBtn);

        plusBtn.addEventListener('click',(e)=>{
count.value=Number(count.value)+1;

if(count.value>9)
{
    count.value=9;
}
});
        minusBtn.addEventListener('click',(e)=>{
count.value=count.value-1;
if(count.value<0)
{
    count.value=0;
}
});
        fieldset.appendChild(wrapper);
        fieldset.appendChild(el('br'));
    });

    formEl.insertBefore(fieldset, formEl.firstChild);
}







window.addEventListener('DOMContentLoaded', async (e)=>{
 const form = document.querySelector("form");

  try {
    const people = await getPeopleList(url);
    const types = await getTypesList(url);

    renderTypes(form, types);
    renderPeople(form, people);
    

} catch (err) {
    console.error("Chyba při načítání typů:", err);
    const output = document.querySelector('#output1');
    if (output) output.textContent = 'Nepodařilo se načíst typy.';
}




document.getElementById("myForm").addEventListener("submit", async function(e) {
    e.preventDefault(); 


const payload = {
user: null,
drinks: []
}



payload.user=returnUserId();


 const inputs = document.querySelectorAll('.count');
    const labels =document.querySelectorAll('.typeLabel'); 

let sum =0;
    for (let i =0;i<inputs.length;i++) {
const drink = { 
    type: labels[i].textContent,
    value: inputs[i].value
  };
  sum+=Number(inputs[i].value);
    payload.drinks.push(drink);
    }
    if(sum==0){
        window.alert("Alespon jeden drink musi byt vic nez nula");
    }
    else{

console.log(JSON.stringify(payload));

try{
await fetch(url+'?cmd=saveDrinks', {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        'Authorization':PRIHLASOVANI
    },
    body: JSON.stringify(payload)
});
}catch{
addToLocalStorage(payload);
console.log(interval);
if(!interval){
interval =setInterval(trySending,4000);
}
}



   document.cookie=`lastUserId=${payload.user}; path=/`;

const message =document.getElementById('succesfulSubmition');

message.style.color='green';

setTimeout(()=>{message.style.color='transparent'},1500);
}

});


});




function returnUserId()
{
    const radios = document.querySelectorAll('.radio');
let sum =0;
    for (const radio of radios) {
        if (radio.checked) {
            sum+=radio.value;
            return radio.value;
        }
    }
    return null;
}


function addToLocalStorage(payload){

const saved=JSON.parse(localStorage.getItem('drinks')||'[]')
  console.log(`pred ulozenim ${localStorage.getItem('drinks')||'[]'}`);
saved.push(payload)
localStorage.setItem('drinks',JSON.stringify(saved));
  console.log(`po ulozeni ${localStorage.getItem('drinks')||'[]'}`);
}

async function trySending() {
    const saved = JSON.parse(localStorage.getItem('drinks'));
    const failed = [];
    for (const payload of saved) {
        try {
            const res = await fetch(url + '?cmd=saveDrinks', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': PRIHLASOVANI
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                console.log('uspesne odeslano');
            }
        } catch {
            failed.push(payload);
            console.log('nepodarilo se');
        }
    }

    localStorage.setItem('drinks', JSON.stringify(failed));
    if (failed.length === 0) {
        clearInterval(interval);
        interval = null;
    }
}


 function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string' || typeof c === 'number') {
        node.appendChild(document.createTextNode(String(c)));
      } else if (c instanceof Node) {
        node.appendChild(c);
      }
    });
    return node;
  }


 



