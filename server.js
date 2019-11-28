const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
const cTable = require('console.table');
const startScreen = ['View all Employees', 'View all Emplyees by Department', 'View all Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'Update Employee Manager', 'Exit']
const addEmployee = ['What is the first name?', 'What is the last name?', 'What is their role?', 'Who is their manager?']

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'hmtdih2tym!',
    database: 'employee_db'
});

connection.connect((err) => {
    if (err) {
        console.log(chalk.white.bgRed(err));
        return;
    }

    console.log(chalk.green(`Connected to db. ThreadID: ${connection.threadId}`));
    startApp();


})

const startApp = () => {
    inquirer.prompt({
        name: 'menuChoice',
        type: 'list',
        message: 'Select an option',
        choices: startScreen

    }).then((answer) => {
        switch (answer.menuChoice) {
            case 'View all Employees':
                showAll();
                break;
            case 'View all Emplyees by Department':
                showByDept();
                break;
            case 'View all Employees by Manager':
                showByManager();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Update Employee Role':
                updateRole();
                break;
            case 'Update Employee Manager':
                updateManager();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    })
}



const showAll = () => {
    const query = 'SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title, d.dept_name AS "Department", r.salary FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d ON d.id = r.department_id;';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log(' ');
        console.table(chalk.yellow('All Employees'), res)
        startApp();
    })

}

const showByDept = () => {
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'dept_choice',
                type: 'rawlist',
                choices: function () {
                    let choiceArray = results.map(choice => choice.dept_name)
                    return choiceArray;
                },
                message: 'Select a Department to view.'
            }
        ]).then((answer) => {
            let chosenDept;
            for (let i = 0; i < results.length; i++) {
                if (results[i].dept_name === answer.dept_choice) {
                    chosenDept = results[i];
                }
            }

            const query = 'SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title, d.dept_name AS "Department", r.salary FROM employees e INNER JOIN roles r ON r.id = e.role_id INNER JOIN departments d ON d.id = r.department_id WHERE ?;';
            connection.query(query, { dept_name: chosenDept.dept_name }, (err, res) => {
                if (err) throw err;
                console.log(' ');
                console.table(chalk.yellow('All Employees by Department'), res)
                startApp();
            })
        })
    })
}
