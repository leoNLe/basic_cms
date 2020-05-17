const inquirer = require("inquirer");
const db = require("./data");

const startingPrompt =  [
    {
        message: "What would you like to do?",
        type: "list",
        choices: [
            { value: 0, name: "View All Employees" },
            { value: 1, name: "View All Employees By Department" },
            { value: 2, name: "View All Employees By Manager" },
            { value: 3, name: "Add Employee" },
            { value: 4, name: "Add Role"},
            { value: 5, name: "Add Department"},
            { value: 6, name: "Remove Employee" }, 
            { value: 7, name: "Update Employee Role" },
            { value: 8, name: "Update Employee Manager" },
            { value: 9, name: "Nothing" }
        ],
        name: "choice"
}]

getEmployeesNamePrompt = async () => {
    const data = await db.getAllEmployees();
    const employees = data.map((employee) => {
        return { value: employee.id, name: `${employee.first_name} ${employee.last_name}`}
    });
    employees.push({value: null, name:"None"});
    return employees;
}

getRoles = async () => {
    try {
        const data = await db.getRoles();
        const roles = data.map(role => role.title);
        return roles;
    } catch (err){

        console.log(err);
        return new Promise(reject=> reject(err));
    }
}

getDepartmentsPrompt = async () => {
    try { 
        const data = await getAllDepartments();
        const departments = data.map(department => {  
            return {value: department.id, name: department.department 
        }})

        return departments;
    } catch (err) {
        throw err;
    }
}
isNum = async (input) => {
    let num = parseInt(input);
    if(Number.isInteger(num) && input> 0) {

        return true;
    } else { 
        console.log("\nInput error try again.");
        return false;
    }
}
addRole = async () => {
    const departments = await getDepartmentsPrompt(); 

    try {
        const data = await inquirer.prompt([
            {
                message: "What is the name of the new role?",
                name: "title"
            },
            {
                type: "number",
                message: "What is the salary?",
                name: "salary",
                validate: isNum
            },
            {
                type: "list",
                message: "What is the role's department?",
                name: "department_id",
                choices: departments
            }
        ]);
        
        if(await db.addRole(data)){
            console.log("Role Added.");
        } else {
            console.log("Something went wrong.");
        }
    } catch (err) {
        console.log(err)
    }
}

addEmployee = async () => {

    const roles = await getRoles();
    const managers = await getEmployeesNamePrompt();
    
    try {
        const employee = await inquirer.prompt([
            {
                message: "What is the employee's first name?",
                name: "lastName"
            },
            {
                message: "What is the employee's last name?",
                name: "firstName"
            },
            {
                type: "list",
                message: "What is the employee's role?",
                name: "role_id",
                choices: roles
            },
            {
                type: "list",
                message: "Who this this employee's manager?",
                choices: managers,
                name: "managerId"
            }
        ])

        const result = await db.addEmployee(employee);

        if(result){
            console.log("Employees Add");
        } else {
            console.log("Error.  Employee is not added");
        }
    } catch(err) {
        throw new Err(err);
    }
}

viewAllEmployees = async () => {
    const data = await db.getAllEmployees();
    console.table(data);

}

viewByDepartment = async () => {
    const departments = await getDepartmentsPrompt();
    try {
        //Get ID from 
        const {department} = await inquirer.prompt([{
            type: "list",
            message: "Which department do you want to see?",
            name: "department",
            choices: departments
        }])
        //get data from db for that department
        const employees = await db.getEmployeesByDept(department);
        console.table(employees);
    } catch (err){
        throw err;
    }
}

performAction = async (choice) => {
    switch (choice){
        case 0:
            await viewAllEmployees();
            break;
        case 1: 
            await viewByDepartment();
            break;
        case 2:
            break;
        case 3:
            await addEmployee();
            break;
        case 4: 
            await addRole();
            break;
    }
}

prompt = async () => {

    db.connectToDB();
    let toContinue  = true;

    while(toContinue) {
        try {
            const { choice } = await inquirer.prompt(startingPrompt);

            if(choice === 7){
                toContinue = false;
                continue;
            }

            await performAction(choice);

        } catch(err) {
            console.log(err);
        } 
    }
    db.disconnectFromDB()
}

prompt();

