console.log('<%= userData.teamCode %>');

const socket = io();
const points = document.querySelector(".problem-in-bid-points");
const title = document.querySelector(".problem-in-bid-title");
const desc = document.querySelector(".problem-desc");
const timer = document.querySelector(".timer");

const inputBidBtn = document.querySelector(".bid-btn");
const currBidAmount = document.querySelector(".curr-bid-amount");
const inputBidAmount = document.querySelector(".bid-amount");
const purse_points= document.querySelector('.purse-points') 

const curr_bid_team = document.querySelector('.curr-bid-team')
//user points
let user_points=`<%=points %>`

socket.on("question", (titleServer, descServer, tagServer) => {
  console.log(tagServer,descServer,tagServer);
  title.innerHTML = titleServer;
  desc.innerHTML = descServer;
  points.innerHTML = tagServer;
  currBidAmount.innerHTML='0'
  curr_bid_team.innerHTML=''
  function startCountdown() {
    let countdown = 20;
    timer.innerHTML = countdown;

    let countDownTimer = setInterval(() => {
      countdown--;
      timer.innerHTML = countdown;

      socket.on("abort", (titleDefault, descDefault, pointsDefault) => {
          title.innerHTML = titleDefault;
          desc.innerHTML = descDefault;
          points.innerHTML = pointsDefault;

          countdown = 0;
          clearInterval(countDownTimer);
      })

      if (countdown <= 0) {
        clearInterval(countDownTimer);
        console.log("Time's up!");
        timer.innerHTML = "00";
        title.innerHTML = "Waiting for problem...";
        points.innerHTML = null;
        desc.innerHTML = "No problem in bid";
        inputBidBtn.disable = true;
        currBidAmount.innerHTML = '';
        curr_bid_team.innerHTML='';
        socket.emit("timeUp");
      }
    }, 1000);
  }

  startCountdown();
});


const pursePoints = document.querySelector('.purse-points');
inputBidBtn.addEventListener("click", () => {
  var curr = currBidAmount.innerHTML;
  var inputBid = inputBidAmount.value;
  if (Number(inputBid) > Number(curr) && Number(inputBid) <= user_points) {
    socket.emit("bid", "<%=userData.teamCode %>", inputBid);
  }
});

socket.on("currBidData", (newTeamCode, newBidAmount) => {
  currBidAmount.innerHTML = newBidAmount;
  curr_bid_team.innerHTML=newTeamCode

});

const selected_problems_inner_ctr=document.querySelector('.selected-problems-inner-ctr')

socket.on('updateInfo',(bidData_title,bidData_teamCode,bidData_amount)=>{
    selected_problems_inner_ctr.innerHTML+=
    `<div class="selected-problem-ctr">
          <p class="selected-problem">${bidData_title}</p>
          <span class="selected-problem-owner">${bidData_teamCode}</span>
        </div>`

  if(bidData_teamCode=='<%=userData.teamCode %>'){
    user_points-=Number(bidData_amount);
    console.log('user points are',user_points);
    purse_points.innerHTML=user_points
  }
})