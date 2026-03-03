const url = "http://lmpss3.dev.spsejecna.net/procedure.php";

async function getTypesList(apiUrl) {
    const res = await fetch(`${apiUrl}?cmd=getTypesList`, { 
        method: 'GET', 
        credentials: 'include' 
    });

    if (!res.ok) throw new Error(`getTypesList HTTP ${res.status}`);
    return await res.json();
}

async function getPeopleList(apiUrl) {
    const res = await fetch(`${apiUrl}?cmd=getPeopleList`, { 
        method: 'GET', 
        credentials: 'include' 
    });

    if (!res.ok) throw new Error(`getPeopleList HTTP ${res.status}`);
    return await res.json();
}

function renderPeople(formEl, people) {
    const fieldset = el('fieldset', {},
        el('legend', {}, 'Uživatel')
    );

    Object.values(people).forEach(p => {
        const id = String(p.name);
        const radio = el('input', { 
            type: 'radio', id, name: 'user', value: String(p.ID), class: 'radio', required: true
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
if(count.value>10)
{
    count.value=10;
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
});









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