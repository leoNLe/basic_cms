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

addEmployee =  async ({lastName, firstName, role, managerId}) => {
    const inserted = await conn.query(
        "INSERT INTO employee SET ?",
        {
            first_name: firstName,
            last_name: lastName,
            role_id: role,
            manager_id: managerId
        }
    )
    console.log(inserted);
    return inserted;
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
    getEmployeesByDept
}

