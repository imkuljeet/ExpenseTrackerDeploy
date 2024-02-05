async function addNewExpense(e) {
  e.preventDefault();

  const expenseDetails = {
    expenseamount: e.target.expenseAmount.value,
    description: e.target.description.value,
    category: e.target.category.value,
  };

  console.log(expenseDetails);

  try {
    const token  = localStorage.getItem('token')
    const response = await axios.post("expense/addexpense", expenseDetails,  { headers: {"Authorization" : token} });
    addNewExpensetoUI(response.data.expense);
  } catch (err) {
    console.log(err);
    showError(err);
  }
}
 
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token  = localStorage.getItem('token')
    const decodeToken = parseJwt(token)
    console.log("Decode token is",decodeToken)

    const ispremiumuser = decodeToken.ispremiumuser
    if(ispremiumuser){
      showPremiumuserMessage()
      showLeaderboard()
      showDownloadedItems();
    }

    const response = await axios.get("expense/getexpenses",{ headers: {"Authorization" : token} });
    const expenses = response.data.expenses;

    expenses.forEach((expense) => {
      addNewExpensetoUI(expense);
    });
    loadExpenses();
  } catch (err) {
    console.log(err);
    showError(err);
  }
});
 
function addNewExpensetoUI(expense) {
    const parentElement = document.getElementById("listOfExpenses");
    const expenseElemId = `expense-${expense.id}`;
    parentElement.innerHTML += `
          <li id=${expenseElemId}>
              ${expense.expenseamount} - ${expense.category} - ${expense.description}
              <button onclick='deleteExpense(event, ${expense.id})'>
                  Delete Expense
              </button>
          </li>`;
}
  
async function deleteExpense(event, expenseId) {
  console.log("Deleting expense with ID:", expenseId);

  try {
    const token = localStorage.getItem('token')

    await axios.delete(`expense/deleteexpense/${expenseId}`, { headers: {"Authorization" : token} });
    removeExpensefromUI(expenseId);
  } catch (err) {
    console.log(err);
    showError(err);
  }
}
  
function removeExpensefromUI(expenseid) {
    const expenseElemId = `expense-${expenseid}`;
    document.getElementById(expenseElemId).remove();
}

function showError(err){
  document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
}

function showPremiumuserMessage() {
  document.getElementById('rzp-button1').style.visibility = "hidden"
  document.getElementById('message').innerHTML = "You are a premium user "
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

document.getElementById('rzp-button1').onclick = async function (e) {
  const token = localStorage.getItem('token')
  const response  = await axios.get('purchase/premiummembership', { headers: {"Authorization" : token} });
  console.log(response);
  var options =
  {
   "key": response.data.key_id, 
   "order_id": response.data.order.id,
   "handler": async function (response) {
      const res = await axios.post('purchase/updatetransactionstatus',{
           order_id: options.order_id,
           payment_id: response.razorpay_payment_id,
       }, { headers: {"Authorization" : token} })

      console.log(res)
       alert('You are a Premium User Now')
       showPremiumuserMessage();
       localStorage.setItem('token', res.data.token)
       showLeaderboard()
   },
};
const rzp1 = new Razorpay(options);
rzp1.open();
e.preventDefault();

rzp1.on('payment.failed', function (response){
  console.log(response)
  alert('Something went wrong')
});
}

function showLeaderboard(){
  const inputElement = document.createElement("input")
  inputElement.type = "button"
  inputElement.value = 'Show Leaderboard'
  inputElement.onclick = async() => {
      const token = localStorage.getItem('token')
      const userLeaderBoardArray = await axios.get('premium/showLeaderBoard', { headers: {"Authorization" : token} })
      console.log(userLeaderBoardArray)

      var leaderboardElem = document.getElementById('leaderboard')
      leaderboardElem.innerHTML += '<h1> Leader Board </<h1>'
      userLeaderBoardArray.data.forEach((userDetails) => {
        leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0} </li>`
      })
  }
  document.getElementById("message").appendChild(inputElement);

}

async function download() {
  try {
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    console.log("Decoded token is", decodedToken);

    if (decodedToken && decodedToken.ispremiumuser) {
      const response = await axios.get('expense/download', {
        headers: { "Authorization": token }
      });

      if (response.status === 200) {
        // The backend is essentially sending a download link
        // which, if we open in the browser, the file would download
        var a = document.createElement("a");
        a.href = response.data.fileURl;
        a.download = 'myexpense.csv';
        a.click();
      } else {
        throw new Error(response.data.message);
      }
    } else {
      showError("Unauthorized: Premium feature");
    }
  } catch (err) {
    showError(err);
  }
}

async function showDownloadedItems() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get("expense/downloadeditems", { headers: { "Authorization": token } });
    const downloadedItems = response.data.downloadedItems;

    const downloadedItemsList = document.getElementById("downloadeditems");

    // Clear existing items
    downloadedItemsList.innerHTML = "";

    downloadedItems.forEach((item) => {
      const listItem = document.createElement("li");

      // Create a link element
      const link = document.createElement("a");
      link.href = item.fileURL;  // Set the link URL
      link.textContent = `Download File - ${item.downloadDate}`;  // Set the link text
      link.target = "_blank";  // Open the link in a new tab/window

      listItem.appendChild(link);
      downloadedItemsList.appendChild(listItem);
    });
  } catch (err) {
    console.log(err);
    showError(err);
  }
}

let currentPage = 1;

function loadExpenses(direction) {
  const token = localStorage.getItem('token');
  const expensesPerPage = localStorage.getItem('expensesPerPage') || 10; // Default to 10 expenses per page if not set

  // Assuming that currentPage and totalPages are global variables or defined in the same scope
  if (direction === 'prev' && currentPage > 1) {
    currentPage--;
  } else if (direction === 'next') {
    currentPage++;
  }

  axios.get(`expense/getexpensesz?page=${currentPage}&itemsPerPage=${expensesPerPage}`, {
    headers: { Authorization: token },
  })
  .then(response => {
    const expenses = response.data.expenses;
    const totalPages = response.data.totalPages || 1;

      // Ensure the currentPage does not exceed the totalPages
      currentPage = Math.min(currentPage, totalPages);

      displayExpenses(expenses);
      document.getElementById('currentPage').innerText = currentPage;
      document.getElementById('totalPages').innerText = totalPages;

      // Disable or hide the 'Next' button when on the last page
      const nextPageButton = document.getElementById('nextPage');
      if (currentPage === totalPages) {
        nextPageButton.disabled = true;
      } else {
        nextPageButton.disabled = false;
      }

      // Disable or hide the 'Previous' button when on the first page
      const prevPageButton = document.getElementById('prevPage');
      if (currentPage === 1) {
        prevPageButton.disabled = true;
      } else {
        prevPageButton.disabled = false;
      }
    })
    .catch(err => {
      showError(err);
    });
}

function displayExpenses(expenses) {
  const parentElement = document.getElementById('listOfExpenses');
  parentElement.innerHTML = ''; // Clear existing content
  expenses.forEach(expense => {
    addNewExpensetoUI(expense);
  });
}

function setExpensesPerPage() {
  const expensesPerPageInput = document.getElementById('expensesPerPage');
  const expensesPerPage = expensesPerPageInput.value;

  if (expensesPerPage && !isNaN(expensesPerPage) && expensesPerPage >= 5 && expensesPerPage <= 40) {
    localStorage.setItem('expensesPerPage', expensesPerPage);
    loadExpenses(); // Reload expenses based on the new preference
  } else {
    alert('Please enter a valid number between 5 and 40.');
  }
}
