const url = "https://crm.skch.cz/ajax0/procedure2.php";


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

const allCookies = decodeURIComponent(document.cookies);
const cookieArray = allCookies.split('; ');
const lastUserId = 0;

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

const drink = {
type: null,
value: null
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


await fetch(url+'?cmd=saveDrinks', {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        'Authorization':PRIHLASOVANI
    },
    body: JSON.stringify(payload)
})
    }
    
    document.cookie=`lastUserId=${payload.user}; path=/`;

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


 



