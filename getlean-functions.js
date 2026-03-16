// getlean-functions.js
// ---------------------------
// Utilities
// ---------------------------
function formatDate(d) {
  const date = new Date(d);
  return date.toISOString().split('T')[0];
}

// ---------------------------
// Global Trackers
// ---------------------------
let mealData = {};       
let waterData = {};      
let weightData = {};
let stepsData = {};
let bodyFatData = {};
let bmiData = {};

let caloriesChart, waterChart, weightChart, stepsChart, bodyFatChart, bmiChart;
let workoutInterval;
let workoutTime = 600; // seconds

// ---------------------------
// Tab Navigation
// ---------------------------
function tab(id){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---------------------------
// Program Timer
// ---------------------------
function startProgram(){
  const start = document.getElementById('startDate').value;
  const days = parseInt(document.getElementById('programDays').value);
  if(!start || !days) return;
  const today = new Date();
  const startDate = new Date(start);
  const diff = Math.floor((today - startDate) / (1000*60*60*24)) + 1;
  document.getElementById('dayDisplay').innerText = `Day ${Math.min(diff, days)} of ${days}`;
}

// ---------------------------
// Daily Streak
// ---------------------------
let streakCount = 0;
function completeDay(){
  streakCount++;
  document.getElementById('streaks').innerText = `${streakCount} days completed`;
}

// ---------------------------
// Meal Tracker
// ---------------------------
function addMeal(){
  const today = formatDate(new Date());
  let totalCalories = 0;
  const chicken = parseFloat(document.getElementById('chicken').value) || 0;
  const rice = parseFloat(document.getElementById('brownRice').value) || 0;
  const broccoli = parseFloat(document.getElementById('broccoli').value) || 0;
  const juice = parseFloat(document.getElementById('juice').value) || 0;
  const custom = parseFloat(document.getElementById('custom').value) || 0;

  totalCalories += chicken*50 + rice*215 + broccoli*50 + juice + custom;

  if(mealData[today]) mealData[today] += totalCalories;
  else mealData[today] = totalCalories;

  document.getElementById('calories').innerText = `Calories: ${mealData[today]}`;

  document.getElementById('chicken').value = '';
  document.getElementById('brownRice').value = '';
  document.getElementById('broccoli').value = '';
  document.getElementById('juice').value = '';
  document.getElementById('custom').value = '';

  updateMealChart();
}

function updateMealChart(){
  const ctx = document.getElementById('caloriesChart').getContext('2d');
  const labels = Object.keys(mealData);
  const data = Object.values(mealData);
  const goal = parseInt(document.getElementById('mealGoal')?.value) || 1750;

  if(!caloriesChart){
    caloriesChart = new Chart(ctx, {
      type:'line',
      data:{
        labels:labels,
        datasets:[
          { label:'Calories', data:data, borderColor:'#007AFF', fill:false, tension:0.3, pointStyle:'circle' },
          { label:'Goal', data:labels.map(()=>goal), borderColor:'#FF0000', borderDash:[5,5], fill:false }
        ]
      },
      options:{scales:{y:{beginAtZero:true}}}
    });
  } else {
    caloriesChart.data.labels = labels;
    caloriesChart.data.datasets[0].data = data;
    caloriesChart.data.datasets[1].data = labels.map(()=>goal);
    caloriesChart.update();
  }
}

// ---------------------------
// Water Tracker
// ---------------------------
function addWater(){
  const today = formatDate(new Date());
  if(waterData[today]) waterData[today] +=1;
  else waterData[today]=1;
  document.getElementById('water').innerText = waterData[today];
  updateWaterChart();
}

function removeWater(){
  const today = formatDate(new Date());
  if(waterData[today] && waterData[today]>0) waterData[today]-=1;
  document.getElementById('water').innerText = waterData[today];
  updateWaterChart();
}

function resetWater(){
  const today = formatDate(new Date());
  waterData[today]=0;
  document.getElementById('water').innerText = '0';
  updateWaterChart();
}

function updateWaterChart(){
  const ctx = document.getElementById('waterChart').getContext('2d');
  const labels = Object.keys(waterData);
  const data = Object.values(waterData);
  const goal = 16;
  if(!waterChart){
    waterChart = new Chart(ctx,{
      type:'line',
      data:{
        labels:labels,
        datasets:[
          {label:'Glasses', data:data, borderColor:'#00AAFF', fill:false, tension:0.3, pointStyle:'circle'},
          {label:'Goal', data:labels.map(()=>goal), borderColor:'#FF0000', borderDash:[5,5], fill:false}
        ]
      },
      options:{scales:{y:{beginAtZero:true, max:goal+2}}}
    });
  } else {
    waterChart.data.labels=labels;
    waterChart.data.datasets[0].data=data;
    waterChart.data.datasets[1].data=labels.map(()=>goal);
    waterChart.update();
  }
}

// ---------------------------
// Weight Tracker
// ---------------------------
function addWeight(){
  const today=formatDate(new Date());
  const val=parseFloat(document.getElementById('weightInput').value);
  if(!val) return;
  weightData[today]=val;
  document.getElementById('weightList').innerText=JSON.stringify(weightData);
  document.getElementById('weightInput').value='';
  updateWeightChart();
}

function updateWeightChart(){
  const ctx=document.getElementById('weightChart').getContext('2d');
  const labels=Object.keys(weightData);
  const data=Object.values(weightData);
  if(!weightChart){
    weightChart=new Chart(ctx,{type:'line',data:{labels:labels,datasets:[{label:'Weight',data:data,borderColor:'#007AFF',fill:false,tension:0.3,pointStyle:'circle'}]},options:{scales:{y:{beginAtZero:false}}}});
  } else {
    weightChart.data.labels=labels;
    weightChart.data.datasets[0].data=data;
    weightChart.update();
  }
}

// ---------------------------
// Steps Tracker
// ---------------------------
function updateSteps(){
  const today=formatDate(new Date());
  const val=parseInt(document.getElementById('steps').value)||0;
  stepsData[today]=val;
  document.getElementById('stepsDisplay').innerText=val;
  document.getElementById('steps').value='';
  updateStepsChart();
}

function updateStepsChart(){
  const ctx=document.getElementById('stepsChart').getContext('2d');
  const labels=Object.keys(stepsData);
  const data=Object.values(stepsData);
  const goal=10000;
  if(!stepsChart){
    stepsChart=new Chart(ctx,{type:'line',data:{labels:labels,datasets:[{label:'Steps',data:data,borderColor:'#00CC00',fill:false,tension:0.3,pointStyle:'circle'},{label:'Goal',data:labels.map(()=>goal),borderColor:'#FF0000',borderDash:[5,5],fill:false}]}});
  } else {
    stepsChart.data.labels=labels;
    stepsChart.data.datasets[0].data=data;
    stepsChart.data.datasets[1].data=labels.map(()=>goal);
    stepsChart.update();
  }
}

// ---------------------------
// Body Fat Tracker
// ---------------------------
function saveBodyFat(){
  const today=formatDate(new Date());
  const val=parseFloat(document.getElementById('bodyfat').value);
  if(!val) return;
  bodyFatData[today]=val;
  document.getElementById('bfList').innerText=JSON.stringify(bodyFatData);
  document.getElementById('bodyfat').value='';
  updateBodyFatChart();
}

function updateBodyFatChart(){
  const ctx=document.getElementById('bodyFatChart').getContext('2d');
  const labels=Object.keys(bodyFatData);
  const data=Object.values(bodyFatData);
  if(!bodyFatChart){
    bodyFatChart=new Chart(ctx,{type:'line',data:{labels:labels,datasets:[{label:'Body Fat %',data:data,borderColor:'#FF8800',fill:false,tension:0.3,pointStyle:'circle'}]}});
  } else {
    bodyFatChart.data.labels=labels;
    bodyFatChart.data.datasets[0].data=data;
    bodyFatChart.update();
  }
}

// ---------------------------
// BMI Calculator
// ---------------------------
function calcBMI(){
  const h=parseFloat(document.getElementById('height').value);
  const w=parseFloat(document.getElementById('bmiWeight').value);
  if(!h || !w) return;
  const bmi = (w / (h*h)) * 703;
  const today=formatDate(new Date());
  bmiData[today]=parseFloat(bmi.toFixed(1));
  document.getElementById('bmi').innerText = bmi.toFixed(1);
  document.getElementById('height').value='';
  document.getElementById('bmiWeight').value='';
  updateBMIChart();
}

function updateBMIChart(){
  const ctx=document.getElementById('bmiChart').getContext('2d');
  const labels=Object.keys(bmiData);
  const data=Object.values(bmiData);
  if(!bmiChart){
    bmiChart=new Chart(ctx,{type:'line',data:{labels:labels,datasets:[{label:'BMI',data:data,borderColor:'#9900FF',fill:false,tension:0.3,pointStyle:'circle'}]}});
  } else {
    bmiChart.data.labels=labels;
    bmiChart.data.datasets[0].data=data;
    bmiChart.update();
  }
}

// ---------------------------
// 10-Minute Home Workout
// ---------------------------
function startWorkout(){
  clearInterval(workoutInterval);
  let timeLeft=workoutTime;
  workoutInterval=setInterval(()=>{
    timeLeft--;
    document.getElementById('timer').innerText=`${Math.floor(timeLeft/60)}:${('0'+timeLeft%60).slice(-2)}`;
    document.getElementById('workoutTimerBar').value=workoutTime-timeLeft;
    if(timeLeft<=0) clearInterval(workoutInterval);
  },1000);
}

function stopWorkout(){
  clearInterval(workoutInterval);
}

function resetWorkout(){
  clearInterval(workoutInterval);
  document.getElementById('timer').innerText=`10:00`;
  document.getElementById('workoutTimerBar').value=0;
}

// ---------------------------
// Macro Calculator & Meal Plan Generator
// ---------------------------
function calcMacros(){
    const calories=parseInt(document.getElementById('macroCalories').value)||0;
    if(!calories) return;

    const protein=Math.round(calories*0.4/4);
    const carbs=Math.round(calories*0.3/4);
    const fat=Math.round(calories*0.3/9);

    document.getElementById('macroResult').innerText=
        `Protein: ${protein}g, Carbs: ${carbs}g, Fat: ${fat}g`;

    generateMacroMealPlan(protein, carbs, fat, calories);
}

function generateMacroMealPlan(protein, carbs, fat, calories){
    const lunchCals=Math.round(calories*0.4);
    const snackCals=Math.round(calories*0.2);
    const dinnerCals=Math.round(calories*0.4);

    const plan={
        lunch: {chicken: Math.round((lunchCals*0.5)/50), rice: Math.round((lunchCals*0.3)/215), broccoli: Math.round((lunchCals*0.2)/50)},
        snack: {juice: snackCals},
        dinner: {chicken: Math.round((dinnerCals*0.5)/50), rice: Math.round((dinnerCals*0.3)/215), broccoli: Math.round((dinnerCals*0.2)/50)}
    };

    let html=`<strong>Lunch (1PM):</strong> Chicken ${plan.lunch.chicken}oz, Brown Rice ${plan.lunch.rice}cups, Broccoli ${plan.lunch.broccoli}cups (${lunchCals} cal)<br>`;
    html+=`<strong>Snack (4PM):</strong> Juice ${plan.snack.juice} cal<br>`;
    html+=`<strong>Dinner (8PM):</strong> Chicken ${plan.dinner.chicken}oz, Brown Rice ${plan.dinner.rice}cups, Broccoli ${plan.dinner.broccoli}cups (${dinnerCals} cal)`;

    document.getElementById('macroMealPlanChart').innerHTML=html;
}

function mealPlan(){
    const calories=parseInt(document.getElementById('planCalories').value)||1750;
    const lunch=Math.round(calories*0.4);
    const snack=Math.round(calories*0.2);
    const dinner=Math.round(calories*0.4);

    const plan={
        lunch: {chicken: Math.round((lunch*0.5)/50), rice: Math.round((lunch*0.3)/215), broccoli: Math.round((lunch*0.2)/50)},
        snack: {juice: snack},
        dinner: {chicken: Math.round((dinner*0.5)/50), rice: Math.round((dinner*0.3)/215), broccoli: Math.round((dinner*0.2)/50)}
    };

    let html=`<strong>Lunch (1PM):</strong> Chicken ${plan.lunch.chicken}oz, Brown Rice ${plan.lunch.rice}cups, Broccoli ${plan.lunch.broccoli}cups (${lunch} cal)<br>`;
    html+=`<strong>Snack (4PM):</strong> Juice ${plan.snack.juice} cal<br>`;
    html+=`<strong>Dinner (8PM):</strong> Chicken ${plan.dinner.chicken}oz, Brown Rice ${plan.dinner.rice}cups, Broccoli ${plan.dinner.broccoli}cups (${dinner} cal)`;

    document.getElementById('plan').innerHTML=html;
}
