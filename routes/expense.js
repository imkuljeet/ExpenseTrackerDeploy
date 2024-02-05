const express = require('express');
const router = express.Router();

// const Expense = require('../models/expenses');
const expenseController = require('../controllers/expense');
const userauthentication = require('../middleware/auth')

router.post('/addexpense', userauthentication.authenticate ,expenseController.addexpense )

router.get('/getexpenses',userauthentication.authenticate, expenseController.getexpenses )

router.delete('/deleteexpense/:expenseid',userauthentication.authenticate ,expenseController.deleteexpense)

router.get('/download', userauthentication.authenticate, expenseController.downloadExpenses)

router.get('/downloadeditems', userauthentication.authenticate, expenseController.downloadItems);

router.get('/getexpensesz',userauthentication.authenticate,expenseController.addexpensetopagination);

module.exports = router;

