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

connectToDB = () =>{
    conn =  createConnection(config);
}

disconnectFromDB = () => {
    conn.close();
}

updateManager = async (id, manager_id) => {
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
updateRole = async (id, role_id) => {
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

getRoles = async () => {
    try {
        return await conn.query_promisify("SELECT * FROM roles");
    } catch (err) {
        console.log(err);
        return Promise.reject(err);
    };
}

getAllDepartments = async () => {
    try {
        return await conn.query_promisify("Select * from departments");

    } catch(err) {
        console.log(`Error in database: getAllDepartments(). \n Error code: ${err.code} \n `)
        return Promise.reject(err.code);
    }
}

removeEmployee = async (id) => {
    try {
        return await conn.query_promisify(
            `DELETE FROM table_name
            WHERE ?;`, 
            { id });        
        
    } catch (err) {
        console.log(err);
        return Promise.reject(err.code);
    }
}

addDepartment = async (department) => {
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

addRole = async  ({title, salary, department_id }) => {

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

addEmployee =  async ({last_name, first_name, role_id, manager_id}) => {
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

getEmployeesByMgr = async (manager_id) => {
    try {
        return  conn.query_promisify(
            `SELECT concat(employees.first_name, " ", employees.last_name)
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
getEmployeesByDept =  (department) => {
    return conn.query_promisify(
                `SELECT concat(employees.first_name, " ", employees.last_name) \
                FROM employees \ 
                LEFT JOIN roles \
                ON employees.role_id = roles.id \
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

getAllEmployees = async () => {

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
    getEmployeesByMgr
}

