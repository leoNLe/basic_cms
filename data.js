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
async function createConnection(config) {
    const connection = mysql.createConnection(config);
    return {
        query_promisify(sql, args) {
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

async function connectToDB() {
    conn =  createConnection(config);
}

async function disconnectFromDB() {
    conn.close();
}

async function updateManager(id, manager_id) {
    try {
        await conn.query_promisify(
            "Update employees SET ? WHERE",
            [
                {manager_id},
                {id}
            ]
        )
        return Promise.resolve(true);
    } catch(err){
        return Promise.reject(err.code);
    }
}

async function updateRole(id, role_id) {
    try {
        return await conn.query_promisify(
            "Update employees SET ? WHERE ?",
            [
                { role_id },
                { id }
            ]
        );

    } catch (err) {
        console.log(err);
        return Promise.reject(err.code);
    }
}

async function getRoles() {
    try {
        return await conn.query_promisify("SELECT * FROM roles");
    } catch (err) {
        console.log(err);
        return Promise.reject(err);
    };
}

async function getAllDepartments() {
    try {
        return await conn.query_promisify("Select * from departments");

    } catch(err) {
        console.log(`Error in database: getAllDepartments(). \n Error code: ${err.code} \n `)
        return Promise.reject(err.code);
    }
}

async function removeEmployee(id) {
    try {
        return await conn.query_promisify(
            `DELETE FROM employees
            WHERE ?;`, 
            { id });        
        
    } catch (err) {
        console.log(err);
        return Promise.reject(err.code);
    }
}

async function addDepartment(department) {
    try{
        await conn.query_promisify(
            "INSERT INTO departments SET ?",
            { department }
        )

        return Promise.resolve(true);
    } catch(err) {
        console.log(err);
        return Promise.reject(err.code);
    }
}

async function addRole({title, salary, department_id }) {

    try{ 
        const result = await conn.query_promisify(
            "INSERT INTO roles SET ?", 
            {
                title,
                salary,
                department_id
            }
        )
        console.log(result);
        return Promise.resolve(true);

    } catch(err) {
        console.log(err);
        return Promise.reject(err.code);

    }
}

async function addEmployee({last_name, first_name, role_id, manager_id}) {
    try { 
        await conn.query_promisify(
            "INSERT INTO employees SET ?",
            {
                last_name,
                first_name,
                role_id,
                manager_id
            }
        )   
        return Promise.resolve(true) ;
    } catch(err) {
        console.log(err)
        return Promise.reject(err.code);
    }
}

async function getEmployeesByMgr(manager_id) {
    try {
        return  conn.query_promisify(
            `SELECT concat(employees.first_name, " ", employees.last_name) as Name
             FROM employees
             WHERE ?
            `,
            { manager_id }
        )
    } catch (err) {
        console.log(err);
        return  resolve.reject(err.code);
    }
}

async function getEmployeesByDept(department) {
    return conn.query_promisify(
                `SELECT concat(employees.first_name, " ", employees.last_name) as Name 
                    FROM employees  
                    LEFT JOIN roles 
                    ON employees.role_id = roles.id 
                    WHERE ?`, 
                {
                    department_id: department
                })
            .then(employees => employees)
            .catch(err=> {
                console.log("Error in getEmployeesByDept.");
                return err
            })
}

async function removeDepartment(department_id) {  
    try {

        //remove department
        const data = await conn.query_promisify(`DELETE FROM departments WHERE ?`,
            {id: department_id}
        );
        //check if 

        if(data.affectedRows > 0)
            result = {removed: true};
        else 
            result = {removed: false};

        return Promise.resolve(result);

    } catch(err){
        //Foreign key constraint failed.  
        return Promise.reject(err.code);
    }
}

async function getAllEmployees() {

    try {        
        return  await conn.query_promisify(
            `SELECT employees_new.id, employees_new.first_name, employees_new.last_name, roles.title, 
                    roles.salary, manager
            FROM
                (SELECT employees.id, employees.first_name, employees.last_name, employees.role_id, 
                        concat(manager.first_name, " ", manager.last_name) as manager
                FROM employees LEFT JOIN employees as manager
                ON employees.manager_id = manager.id) AS employees_new
            LEFT JOIN roles
            ON employees_new.role_id = roles.id;`);

    } catch(err) {
        console.log(err);
        return Promise.reject(err.code);
    }

}

async function removeRole(role_id) { 
    try {
        const result = await conn.query("DELETE FROM roles WHERE ?", 
            { id: role_id}
        )
        if(result.affectedRows > 0) {
            return {isDeleted: true};    
        } else {
            return {isDeleted: false};
        }
    } catch(err) {
        console.log(err)
    };
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
    removeDepartment,
    updateRole,
    updateManager,
    getEmployeesByMgr,
    removeRole
}

