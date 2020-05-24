const inquirer = require("inquirer");
const db = require("./data");
const cTable = require("console.table"); 

const startingPrompt =  [
	{
		message: "What would you like to do?",
		type: "list",
		
		//Changes to choices will require update to to prompt and perform action method.
		choices: [
			{ value: 0, name: "View All Employees" },
			{ value: 1, name: "View All Employees By Department" }, 
			{ value: 2, name: "View All Employees By Manager" },
			{ value: 3, name: "Add Employee" },
			{ value: 4, name: "Add Role"},
			{ value: 5, name: "Add Department"},
			{ value: 6, name: "Remove Employee" }, 
			{ value: 7, name: "Remove Role"},
			{	value: 8, name: "Remove Department"},
			{ value: 9, name: "Update Employee Role" },
			{ value: 10, name: "Update Employee Manager" },
			{ value: 11, name: "Nothing" }
		],
		name: "choice"
}]

async function getEmployeesNamePrompt() {
	try{
		const data = await db.getAllEmployees();
		const employees = data.map((employee) => {
			return { value: employee.id, name: `${employee.first_name} ${employee.last_name}`}
		});
		employees.push({value: null, name:"None"});

		return Promise.resolve(employees);
	} catch(err) {
		console.log(err);
		return Promise.reject(err);
	}
}

async function getRolesPrompt() {
	try {
		const data = await db.getRoles();
		return Promise.resolve(data.map(role => { 
			return {value: role.id, name: role.title}})
		)
	} catch (err){
		return Promise.reject(err);
	}
}

async function getDepartmentsPrompt() {
	try { 
		const data = await getAllDepartments();
		return Promise.resolve( data.map(department => {  
			return {value: department.id, name: department.department }}
		))

	} catch (err) {
		throw Promise.reject(err);
	}
}

function isNum(input)  {
	let num = parseInt(input);
	if(Number.isInteger(num) && input> 0) {
		return true;
	} else { 
		console.log("\nInput error try again.");
		return false;
	}
}

async function removeDepartment() {	
	try {
		const departments = await getDepartmentsPrompt();
		const {department_id} = await inquirer.prompt({
			type: "list",
			message: "Which department do you want to remove?",
			choices: departments,
			name: "department_id"
		})
		//checking if department still have employees
		const isDeleted = await db.removeDepartment(department_id);
		if(isDeleted.removed){
			console.log(`Department was removed`);
		} else {
			console.log(`Department was not removed`);
		}
	} catch(err) {
		console.log(err);
	}
}

async function updateManager() {
		try {
				const employees = await  getEmployeesNamePrompt();
				const employeeToUpdate = await inquirer.prompt([
						{
								type: "list",
								message: "Which employee do you want to change Manager?", 
								choice: employees,
								name: "id",
						},
				]);
				if(employeeToUpdate === null) 
						return;

				const newEmployeeList = employees.filter(employee =>  employee.id !==employeeToUpdate.id);
				
				const {manager_id} = await inquirer.prompt({
					type: "list",
					message: "Who is their new manager?",
					choice: newEmployeeList,
					name: "manager_id"
				})

				const response = db.updateManager(employeeToUpdate.id, manager_id);
				if(response) {
					console.log("Manager updated.");
				}
		} catch(err) {
				console.log(err);
				console.log("Issue occurred.  Manager was not added.");
		}
}

async function updateEmployeeRole() {
	
	try {
		const employees = await getEmployeesNamePrompt();
		const roles = await getRolesPrompt();
		const employeeToUpdate = await inquirer.prompt([{
						type: "list",
						message: "Which employee do you want to update?", 
						choices: employees,
						name: "id"
				}, 
				{
						type: "list",
						message: "What is there new Role?",
						choices: roles,
						name: "role_id"
				}
		]) 

		if(employeeToUpdate) {
				const response = await db.updateRole(employeeToUpdate.id, employeeToUpdate.roles_id);
				console.log(response);
		}
				
	} catch (err) {
		console.log(err);
	}
}

async function addDepartment() {
	try {
		const {department} = await inquirer.prompt(
			{
				message: "what is the new department's name?",
				name: "department"
			}
		)
		
		if(db.addDepartment(department)){
			console.log("Department added.");
		} else {
			console.log("Error. Not added.");
		}
		
	} catch(err){
		console.log(err);
		return new Error(err);
	}
}

async function removeEmployee() {
	const employees = await getEmployeesNamePrompt();
	try {
		const {employee} = await inquirer.prompt({
			type: "list",
			message: "Which employee do you want to remove?",
			name: "employee",
			choices: employees
		});

		if(employee) {
			const response = await db.removeEmployee(employee);

			console.log(response);
		}
		
	}catch(err) {
		console.log(err);
		return new Error(err);
	}
}

async function removeRole() {
	try {
		const rolePrompt = await getRolesPrompt();
		const {roleToBeRm} = await inquirer.prompt({
			type: "list",
			message: "Which role would you want to remove?",
			choices: rolePrompt,
			name: "roleToBeRm"
		})

		if(!roleToBeRm)
			return;

		const {isDeleted}= await db.removeRole(roleToBeRm);
		if(isDeleted) {
			console.log(`Role deleted.`);
		} else {
			console.log(`Role is not deleted.`)
		}
	} catch(err) {
		console.log(err);
	}
}

async function addRole() {
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
		console.log(err);
		return new Error(err);
	}

}

async function addEmployee() {

	const roles = await getRolesPrompt();
	const managers = await getEmployeesNamePrompt();
	try {
		const employee = await inquirer.prompt([
			{
				message: "What is the employee's first name?",
				name: "last_name"
			},
			{
				message: "What is the employee's last name?",
				name: "first_name"
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
				name: "manager_id"
			}
		])

		const result = await db.addEmployee(employee);

		console.log("Employees Add");

	} catch(err) {
		console.log(`Error.  Employee are not added b/c of ${err}`);
		return new Error(err);
	}
}

async function viewByManager() {
		try {
				const employeesPrompt = await getEmployeesNamePrompt();

				const {manager_id} = await inquirer.prompt({
						type: "list",
						message: "Which manager's employee/s do you want to see?",
						name: "manager_id",
						choices: employeesPrompt
				})

				if(!manager_id) 
						return;

				const employees = await db.getEmployeesByMgr(manager_id);
				console.table(employees);
		} catch (err) {
				console.log(err);
		}
}

async function viewAllEmployees() {
	const data = await db.getAllEmployees();
	console.table(data);
}

async function viewByDepartment() {
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
		console.log(err);
		return new Error(err);
	}
}

async function performAction(choice) {
	switch (choice){
		case 0:
			await viewAllEmployees();
			break;
		case 1: 
			await viewByDepartment();
			break;
		case 2: 
			await viewByManager();
			break;
		case 3:
			await addEmployee();
			break;
		case 4: 
			await addRole();
			break;
		case 5:
			await addDepartment();
			break;
		case 6: 
			await removeEmployee();
			break;
		case 7:
			await removeRole();
			break;
		case 8:
			await removeDepartment();
			break;
		case 9:
			await updateEmployeeRole();
			break;
		case 10:
			await updateManager();
			break;
	}
}

async function prompt() {

	db.connectToDB();
	let toContinue  = true;

	while(toContinue) {
		try {
			const { choice } = await inquirer.prompt(startingPrompt);

			if(choice === 11){
				toContinue = false;
				continue;
			}

			await performAction(choice);

		} catch(err) {
      console.log(err);
      toContinue = false;
    } 
	}

	db.disconnectFromDB()
}

prompt();

