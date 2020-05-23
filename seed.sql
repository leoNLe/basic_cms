-- DROP DATABASE IF EXISTS company_db;

-- CREATE DATABASE company_db;

USE company_db;

CREATE TABLE departments (
    id INT AUTO_INCREMENT,
    department VARCHAR(30),
    PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id)
		REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,  
    PRIMARY KEY (id),
	FOREIGN KEY (role_id) 
		REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id)
        REFERENCES roles(id) ON DELETE SET NULL
);

INSERT INTO departments (department) VALUES
    ("Sales"),
    ("Engineering"),
    ("Finance"),
    ("Legal");

INSERT INTO roles (title, salary, department_id) VALUES
    ("Sales Lead", 100000, 1),
    ("Salesperson", 80000, 1),
    ("Lead Engineer", 150000, 2),
    ("Software Engineer", 120000, 2),
    ("Accountant", 125000, 3),
    ("Legal Team Team", 250000, 4),
    ("Lawyer", 190000, 4);


INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ("John", "Doe", 1, 3 ),
    ("Mike", "Chane", 2, 1 ),
    ("Ashley", "Rodriguez", 3, null),
    ("Kevin", "Tupik", 4, 3),
    ("Malia", "Brown", 5, null),
    ("Sarah", "Lourd", 6, null),
    ("Tom", "Allen", 7, 6),
    ("Tammer", "Galal", 4, 4);