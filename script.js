import { BinaryHeap } from './heap.js';

function get(id) {
    return document.getElementById(id);
}

const options = {
    edges: {
        arrows: {
            to: true
        },
        labelHighlightBold: true,
        font: {
            size: 20
        }
    },
    nodes: {
        font: '12px arial red',
        scaling: {
            label: true
        },
        shape: 'icon',  //This is from imported icon vis.js
        icon: {
            face: 'FontAwesome',
            code: '\uf183',  //Code for person logo icon
            size: 50,
            color: '#991133',
        }
    }
};



get("countSubmitted").onclick = countSubmitted;
get("generate-graph").onclick = generateGraph;
get("solve").onclick          = solve




let network = new vis.Network(get("mynetwork"));
network.setOptions(options);

let network2 = new vis.Network(get("mynetwork2"));
network2.setOptions(options);




var count=0;
let curr_data;



function countSubmitted() {
    count = (get('count')).value;
    
    console.log(count);
   
    var table = get('autogenerated');

    var row, cell;

    for (let i = 0; i < 2; i++) {
        table.deleteRow(-1);  //Here -1 is give means that last row should be deleted
    }

    row = table.insertRow();
    cell = row.insertCell();
    for (let i = 0; i < count; i++){
        cell = row.insertCell();
        cell.innerHTML = `<h6 style='padding-left:40%;'>P${i+1}<h6>`
    }

    for (let i = 0; i < count; i++) {
        row = table.insertRow();

        cell = row.insertCell();
        cell.innerHTML = `<h6>P${i+1}</h6>`

        for (let j = 0; j < count; j++) {
            cell = row.insertCell();

            if (i != j){
                cell.innerHTML = `<input type="number" name="" id="cell-${i}-${j}" placeholder="cell-${i}-${j}">`
                get(`cell-${i}-${j}`).value = 0;
            }
            else {
                cell.innerHTML = '<span style="width: 100%; text-align:center;">0</span>'
            }
        }
    }

    // get("container").style.display = "block"
    get('mainbuttons').style.display = "inline"
    get('autogenerated').style.display = "collapse"
}




function createData() {
    let nodes = [];
    const edges = [];

    console.log("CreateData Called")

    for (let i = 0; i < count; i++) {
        nodes.push({id:i+1, label:"Person "+(i+1)})
    }

    nodes = new vis.DataSet(nodes);  //Because we want to use the vis.js for visualization so we convert it into vis suitable format

    var value = 0;

    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            if(i!=j)
            {
                value = get(`cell-${i}-${j}`).value;
                if (value != 0){
                    console.log(`cell ==> ${i}  ${j} : `,value);   
                    edges.push({from: i+1, to: j+1, label: value});
                }
            }
        }
    }
    
    return { nodes : nodes, edges : edges }
}




function generateGraph() {    
    get("temptext").style.display = "inline";
    get("mynetwork2").style.display = "none";

    var data = createData();
    curr_data = data;

    network.setData(data);  //Draw the Created graph
}




function solve(){
    get("temptext").style.display  = "none";
    get("mynetwork2").style.display = "inline";

    network2.setData(solveData());  //Draw the solved graph
}




function solveData() {
    let data = curr_data;
    const sz = data['nodes'].length;
    const vals = Array(sz).fill(0);
    // Calculating net balance of each person
    for(let i=0;i<data['edges'].length;i++) {
        const edge = data['edges'][i];
        vals[edge['to'] - 1] += parseInt(edge['label']);
        vals[edge['from'] - 1] -= parseInt(edge['label']);
    }

    const pos_heap = new BinaryHeap();
    const neg_heap = new BinaryHeap();

    for(let i=0;i<sz;i++){
        if(vals[i]>0){
            pos_heap.insert([vals[i],i]);
        } else{
            neg_heap.insert(([-vals[i],i]));
            vals[i] *= -1;
        }
    }

    const new_edges = [];
    while(!pos_heap.empty() && !neg_heap.empty()){
        const mx = pos_heap.extractMax();
        const mn = neg_heap.extractMax();

        const amt = Math.min(mx[0],mn[0]);
        const to = mx[1];
        const from = mn[1];

        new_edges.push({from: from+1, to: to+1, label: String(Math.abs(amt))});
        vals[to] -= amt;
        vals[from] -= amt;

        if(mx[0] > mn[0]){
            pos_heap.insert([vals[to],to]);
        } else if(mx[0] < mn[0]){
            neg_heap.insert([vals[from],from]);
        }
    }

    data = {
        nodes: data['nodes'],
        edges: new_edges
    };
    return data;
}