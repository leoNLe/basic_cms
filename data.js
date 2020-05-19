const mysql = require("mysql");
const util = require("util");

const config = {
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root", 
    database: "company_db"
};

let conn;


//Create a connection with config and return promisified query, and close function with 
//connection created accessible with getConnection();
createConnection = (config) => {
    const connection = mysql.createConnection(config);
    return {
        query(sql, args) {
            return util.promisify(connection.query) 
                    .call(connection, sql, args);
        },
        close(){
            return util.promisify(connection.end).call(connection);
        },
        getConnection(){
            return connection;
        }
    }
}

connectToDB = () =>{
    conn =  createConnection(config);
}

disconnectFromDB = () => {
    conn.close();
}

updateManager = async (id, manager_id) => {
    try {
        const response = conn.query(
            "Update employees SET ? WHERE",
            [
                {manager_id},
                {id}
            ]
        )
        return true;
    } catch(err){
        console.log(err);
        return new Promise((resolve, reject)=> reject(err));
    }
}
updateRole = async (id, role_id) => {
    try {
        const response = conn.query(
            "Update employees SET ? WHERE ?",
            [
                { role_id },
                { id }
            ]
        );
        return response;
    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject)=> reject(err));
    }
}

getRoles = async () => {
    try {

        const roles = await conn.query("SELECT * FROM roles");
        return new Promise(resolve=> resolve(roles));
    } catch (err) {
        
        return new Promise(reject=> reject(err));
    };
}

getAllDepartments = async () => {
    try {
        const departments = await conn.query("Select * from departments");

        return departments;
    } catch(err) {
        throw new Error(err);
    }
}

removeEmployee = async (id) => {
    try {
        const response = await conn.query(
            `DELETE FROM table_name
            WHERE ?;`, 
            { id });        

        return response; 
        
    } catch (err) {
        console.log(err);
        return false;
    }
}

addDepartment = async (department) => {
    try{
        await conn.query(
            "INSERT INTO departments SET ?",
            { department }
        )

        return true;
    
    } catch(err) {
        console.log(err);
        return false;
    }
}

addRole = async ({title, salary, department_id }) => {

    try {
        await conn.query(
            "INSERT INTO roles SET ?", 
            {
                title,
                salary,
                department_id
            }
        )
        return true;
    } catch(err) {
        console.log(err)
        return false;
    }
}

addEmployee =  async ({last_name, first_name, role_id, manager_id}) => {
    try { 
        await conn.query(
            "INSERT INTO employees SET ?",
            {
                last_name,
                first_name,
                role_id,
                manager_id
            }
        )   
        return true;
    } catch(err) {
        console.log(err)
        return false;
    }
}

getEmployeesByMgr = async (manager_id) => {
    try {
        const employees = await conn.query(
            `SELECT concat(employees.first_name, " ", employees.last_name)
             FROM employees
             WHERE ?
            `,
            { manager_id }
        )
        return employees
    } catch (err) {
        console.log(err);
        return new Promise((resolve, reject)=> reject(err));
    }
}
getEmployeesByDept = async (department) => {
    try {
        const employees = await conn.query(
            `   SELECT concat(employees.first_name, " ", employees.last_name) \
                FROM employees \ 
                LEFT JOIN roles \
                ON employees.role_id = roles.id \
                WHERE ?`, 
            {
                department_id: department
            }
        )
        return employees;
    } catch(err) {
        throw err;
    }

}

getAllEmployees = async () => {

    try {        
        const  data = await conn.query(
            `SELECT employees_new.id, employees_new.first_name, employees_new.last_name, roles.title, 
		            roles.salary, manager
            FROM
                (SELECT employees.id, employees.first_name, employees.last_name, employees.role_id, 
		                concat(manager.first_name, " ", manager.last_name) as manager
                FROM employees LEFT JOIN employees as manager
		        ON employees.manager_id = manager.id) AS employees_new
            LEFT JOIN roles
            ON employees_new.role_id = roles.id;`);

        return new Promise((resolve )=> {
            resolve(data);
        });

    } catch(err) {
        throw err;
    }

}

module.exports = {
    getAllEmployees,
    addEmployee,
    getRoles,
    getAllDepartments,
    connectToDB,
    disconnectFromDB,
    getEmployeesByDept,
    addRole,
    addDepartment,
    removeEmployee,
    updateRole,
    updateManager,
    employeesByMgr
}

