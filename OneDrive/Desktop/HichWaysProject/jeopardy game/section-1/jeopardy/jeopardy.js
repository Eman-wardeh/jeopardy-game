// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const h1= document.createElement('h1');
h1.textContent = "JEOPARDY!";
const btn = document.createElement('button');
btn.setAttribute("id", "btn")
document.body.appendChild(h1);
document.body.appendChild(btn);
btn.innerHTML = "START"

let clickNum = 1;
btn.addEventListener("click", ()=>{
    if(clickNum === 1){
        
        console.log("you clicked me for the first time.")
        clickNum = 2;
        btn.innerHTML = "Loading..."
        hideLoadingView();

    }
    else if(clickNum === 2){

        clickNum = 3;
        btn.innerHTML = "RESTART"
        getCategoryIds();
        console.log("you clicked me for the second time");
    }
    else if(clickNum === 3){
        setupAndStart();
        console.log("you clicked me for the third time")
        clickNum = 4
    }
})

let categories = [];



/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */


async function getCategoryIds() {
    
    try {
        const responses = await axios.get('https://rithm-jeopardy.herokuapp.com/api/categories?count=100');
        responses.data.forEach(response => {
            categories.push(response.id);    
        });
        console.log('Fetched Categories:', categories);
        
        const shuffledArray = shuffleArray(categories);
        console.log('Shuffled Categories:', shuffledArray);

        // Get the first 6 elements from the shuffled array
        const firstSixElement = shuffledArray.slice(0, 6);
        console.log('First Six Categories:', firstSixElement);

        const categoryDataPromises = firstSixElement.map((val) =>{
            return getCategory(val); 

        })
        const categoryData = await Promise.all(categoryDataPromises);
        console.log('Category Data:', categoryData);
        fillTable(categoryData);
        // setupAndStart();
        
        

    } catch (error) {
        console.error("Error fetching categories:", error);
    }   
}


// Shuffle array in place
function shuffleArray(array) {
    
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */


async function getCategory(catId) {

    
    if(!categories.includes(catId)){
        console.log(`${catId} is not a valid category id`) ;
    }
    try{
     const category = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
    
    console.log(category.data);
    return {
        
        title : category.data.title,
        clues : category.data.clues.map((clue) => {
            return{
                question: clue.question,
                answer: clue.answer
            }
        })
    }
    }
    catch (error) {
        console.error("Error fetching categories:", error);
    }   
}   


/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

 function fillTable(categoryData) {
    
    const div = document.createElement("div")
    const table = document.createElement("table");
    table.classList.add("table");
    const thead = document.createElement("thead");
    thead.classList.add("thead");
    thead.style.border = "1px solid black";
    
    const tr = document.createElement("tr");
    tr.classList.add("tr", 1);
    
    for (let i = 0; i < 6; i++) {
        const th = document.createElement("th");
        
        // Check if categoryData has enough items
        if (i < categoryData.length ) {
            th.textContent = categoryData[i].title; // Use the title from categoryData
        } else {
            th.textContent = "N/A"; // Placeholder if there are less than 6 categories
        }
        th.style.border = "1px solid black";
        th.style.textAlign = "center";  
        th.style.height = "50px"; 
        th.style.width = "100px";
        
        
        tr.appendChild(th); // Append the <th> to the <tr>
    }
    thead.appendChild(tr);
    table.appendChild(thead);    
    div.appendChild(table)
    document.body.appendChild(div);
    
    const tbody = document.createElement("tbody");
    for( let j = 0; j < 5; j++){  //the body will have 5 rows
        const row = document.createElement("tr");
        for ( let k = 0; k < 6; k++){  //each row will have 6 columns
            const td = document.createElement("td");
            td.classList.add("td", j);
            td.style.border = "1px solid black";
            td.style.height = "50px";
            td.style.width = "100px";
            td.style.textAlign = "center";
            //create a button inside the td
            const btn = document.createElement("button");
            btn.textContent = "?"; // Placeholder for the question
            btn.classList.add("question-button");
            

            // Initialize the showing property for the clue
            const clue = categoryData[k].clues[j]; // Get the corresponding clue
            clue.showing = null; // Initialize showing property

            // Set up the click handler for the button
            btn.addEventListener("click", function() {
                
                handleClick(btn, clue); // Pass the button and clue to handleClick
            

            });


            td.appendChild(btn); // Append the button to the <td>
            row.appendChild(td); // Append the <td> to the <tr>
            tbody.appendChild(row); // Append the <tr> to the <tbody>
        }
    }
    table.appendChild(tbody); 
    
    }

    

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(btn, clue) {
    
    if (clue.showing === null) {
        // Show the question
        btn.textContent = clue.question; 
        clue.showing = "question"; // Update state
        btn.style.backgroundColor = "lightgray"; // Change background color
        btn.style.color = "black"
    } else if (clue.showing === "question") {
        // Show the answer
        btn.textContent = clue.answer; 
        clue.showing = "answer"; // Update state
        btn.style.backgroundColor = "green"; // Change background color
    }
    
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView(){
    
    const loader = document.createElement("div");
    loader.classList.add("class", "loading-spinner");
    loader.style.display = "block";
    document.body.appendChild(loader); // Append the loader to the body

    setTimeout(() => {
    loader.style.display = "none"
    //btn = this;
    }, 1000);
}


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {

    const restartBTN = document.getElementById("btn");

    restartBTN.addEventListener("click", function(){
        const qBTNS = document.querySelectorAll(".question-button");
        qBTNS.forEach(btn =>{
            if( btn.innerHTML !== "?"){
                console.log("not ? ");
                btn.innerHTML = '?';
                btn.style.background = 'none';
                btn.style.color = "yellow"
            }
        })
    })}

    

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues*/